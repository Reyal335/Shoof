import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { Post, PostCategory } from './entities/post.entity.js';
import { Comment } from './entities/comment.entity.js';
import { PostSkill } from './entities/post-skill.entity.js';
import { SkillsService } from '../skills/skills.service.js';
import { UsersService } from '../users/users.service.js';
import type { Skill } from '../skills/entities/skill.entity.js';
import type { ListPostsQueryDto } from './dto/query.dto.js';

const skill = (id: string, name: string): Skill =>
  ({ id, slug: name.toLowerCase(), name, kind: 'framework', aliases: [], createdAt: new Date() }) as Skill;

const post = (id: string, userId: string): Post =>
  ({
    id,
    userId,
    category: PostCategory.GAMES,
    caption: `Post ${id}`,
    description: 'd',
    link: 'https://a.example.com',
    repoUrl: null,
    rating: 0,
    ratingCount: 0,
    visitCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    media: [],
  }) as unknown as Post;

const query = (overrides: Partial<ListPostsQueryDto> = {}) => ({ limit: 20, offset: 0, sort: 'new', ...overrides }) as ListPostsQueryDto;

// The transactional behaviour is covered against a real database in test/posts.e2e-spec.ts. These cover how a page
// is assembled from the other modules' services.
describe('PostsService', () => {
  let service: PostsService;
  const posts = { findAndCount: vi.fn() };
  const postSkills = { find: vi.fn(), query: vi.fn() };
  const skills = { findByIds: vi.fn(), findBySlug: vi.fn() };
  const users = { findSummariesByIds: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useValue: posts },
        { provide: getRepositoryToken(Comment), useValue: {} },
        { provide: getRepositoryToken(PostSkill), useValue: postSkills },
        { provide: EventEmitter2, useValue: { emit: vi.fn() } },
        { provide: SkillsService, useValue: skills },
        { provide: UsersService, useValue: users },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('findAll', () => {
    it('adds each post\'s skills (by name) and author with one batched call each', async () => {
      posts.findAndCount.mockResolvedValue([[post('p1', 'u1'), post('p2', 'u2')], 2]);
      postSkills.find.mockResolvedValue([
        { postId: 'p1', skillId: 's-react' },
        { postId: 'p1', skillId: 's-astro' },
        { postId: 'p2', skillId: 's-react' },
      ]);
      skills.findByIds.mockResolvedValue([skill('s-astro', 'Astro'), skill('s-react', 'React')]);
      users.findSummariesByIds.mockResolvedValue([{ id: 'u1', username: 'ana', displayName: 'Ana', avatarUrl: null }]);

      const page = await service.findAll(query());

      expect(skills.findByIds).toHaveBeenCalledTimes(1);
      expect(users.findSummariesByIds).toHaveBeenCalledTimes(1);
      expect(page.items[0].skills.map((s) => s.name)).toEqual(['Astro', 'React']);
      expect(page.items[1].skills.map((s) => s.name)).toEqual(['React']);
      expect(page.items[0].author).toEqual({ id: 'u1', username: 'ana', displayName: 'Ana', avatarUrl: null });
      // u2 is deactivated: the post stays, without an author
      expect(page.items[1].author).toBeNull();
      expect(page).toMatchObject({ total: 2, limit: 20, offset: 0 });
    });

    it('returns an empty page for an unknown skill without querying posts', async () => {
      skills.findBySlug.mockResolvedValue(null);
      const page = await service.findAll(query({ skill: 'nope' }));
      expect(page).toEqual({ items: [], total: 0, limit: 20, offset: 0 });
      expect(posts.findAndCount).not.toHaveBeenCalled();
    });

    it('returns an empty page when the scope has no creators (a user who follows nobody)', async () => {
      const page = await service.findAll(query(), { userIds: [] });
      expect(page.items).toEqual([]);
      expect(posts.findAndCount).not.toHaveBeenCalled();
    });
  });

  describe('findTopSkills', () => {
    it('keeps the busiest-first order and drops skills the catalog no longer has', async () => {
      postSkills.query.mockResolvedValue([
        { skillId: 's-phaser', count: 5 },
        { skillId: 's-gone', count: 3 },
        { skillId: 's-godot', count: 2 },
      ]);
      skills.findByIds.mockResolvedValue([skill('s-godot', 'Godot'), skill('s-phaser', 'Phaser')]);

      const top = await service.findTopSkills({ category: PostCategory.GAMES, limit: 8 });

      expect(top.map((t) => [t.skill.name, t.count])).toEqual([['Phaser', 5], ['Godot', 2]]);
      expect(postSkills.query.mock.calls[0][1]).toEqual([8, PostCategory.GAMES]);
    });
  });

  describe('create', () => {
    it('rejects skill ids that are not in the catalog', async () => {
      skills.findByIds.mockResolvedValue([skill('s-react', 'React')]);
      await expect(
        service.create('u1', {
          category: PostCategory.GAMES,
          link: 'https://a.example.com',
          caption: 'c',
          description: 'd',
          skillIds: ['s-react', 's-made-up'],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
