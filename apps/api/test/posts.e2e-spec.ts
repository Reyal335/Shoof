import { Injectable, UnauthorizedException, ValidationPipe, type CanActivate, type ExecutionContext, type INestApplication } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import type { Request } from 'express';
import { PostsModule } from '../src/modules/posts/posts.module.js';
import { PostsService } from '../src/modules/posts/posts.service.js';
import { Post, PostCategory } from '../src/modules/posts/entities/post.entity.js';
import { Media, MediaType } from '../src/modules/posts/entities/media.entity.js';
import { Comment } from '../src/modules/posts/entities/comment.entity.js';
import { Rating } from '../src/modules/posts/entities/rating.entity.js';
import { PostSkill } from '../src/modules/posts/entities/post-skill.entity.js';
import { IS_PUBLIC_KEY } from '../src/modules/auth/decorators/public.decorator.js';
import { User, UserRole } from '../src/modules/users/entities/user.entity.js';
import { User_Identity } from '../src/modules/users/entities/user-identity.js';
import { Profile } from '../src/modules/users/entities/profile.entity.js';
import { UserSkill } from '../src/modules/users/entities/user-skill.entity.js';
import { Skill } from '../src/modules/skills/entities/skill.entity.js';
import type { CreatePostDto } from '../src/modules/posts/dto/create-post.dto.js';
import type { PostView } from '../src/modules/posts/posts.service.js';

// The real PostsModule over a real Postgres database, so the transactions, row locks and constraints are exercised.
// Uses a separate database (<DB_DATABASE>_test, or TEST_DB_DATABASE), created if missing and wiped on every run.
config({ path: resolve(import.meta.dirname, '../../../.env'), quiet: true });
const db = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};
const TEST_DB = process.env.TEST_DB_DATABASE ?? `${process.env.DB_DATABASE}_test`;

// Stands in for the JWT guard: x-user-id is the caller, x-roles their roles. Honours @Public() like the real one.
@Injectable()
class HeaderAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const id = req.header('x-user-id');
    if (id) {
      req.user = { id, roles: (req.header('x-roles') ?? '').split(',').filter(Boolean) };
    }
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
      return true;
    }
    if (!id) throw new UnauthorizedException();
    return true;
  }
}

const valid = (overrides: Partial<CreatePostDto> = {}): CreatePostDto => ({
  category: PostCategory.GAMES,
  link: 'https://www.dungeon.example.com',
  caption: 'Pixel dungeon',
  description: 'A tiny roguelike.',
  ...overrides,
});

describe('Posts (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  const owner = randomUUID();
  const other = randomUUID();
  const moderator = randomUUID();

  const as = (userId: string, roles: UserRole[] = []) => ({
    post: (path: string) => request(app.getHttpServer()).post(`/api/v1${path}`).set('x-user-id', userId).set('x-roles', roles.join(',')),
    put: (path: string) => request(app.getHttpServer()).put(`/api/v1${path}`).set('x-user-id', userId).set('x-roles', roles.join(',')),
    patch: (path: string) => request(app.getHttpServer()).patch(`/api/v1${path}`).set('x-user-id', userId).set('x-roles', roles.join(',')),
    delete: (path: string) => request(app.getHttpServer()).delete(`/api/v1${path}`).set('x-user-id', userId).set('x-roles', roles.join(',')),
    get: (path: string) => request(app.getHttpServer()).get(`/api/v1${path}`).set('x-user-id', userId).set('x-roles', roles.join(',')),
  });
  const anon = () => request(app.getHttpServer());
  const createPost = async (overrides: Partial<CreatePostDto> = {}, userId = owner) => {
    const res = await as(userId).post('/posts').send(valid(overrides)).expect(201);
    return res.body as PostView;
  };
  // A slice of the real catalog, seeded in beforeAll: slug -> id
  const skills: Record<string, string> = {};

  beforeAll(async () => {
    const admin = await new DataSource({ type: 'postgres', ...db, username: db.user, database: 'postgres' }).initialize();
    const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [TEST_DB]);
    if (!exists.length) await admin.query(`CREATE DATABASE "${TEST_DB.replace(/"/g, '')}"`);
    await admin.destroy();

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          ...db,
          username: db.user,
          database: TEST_DB,
          entities: [User, User_Identity, Profile, UserSkill, Skill, Post, Media, Comment, Rating, PostSkill],
          synchronize: true,
          dropSchema: true,
        }),
        EventEmitterModule.forRoot(),
        PostsModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: HeaderAuthGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    // Listening once up front stops supertest from opening a server per request in the concurrency tests
    await app.listen(0);
    dataSource = moduleRef.get(DataSource);

    for (const [slug, name, kind, aliases] of [
      ['phaser', 'Phaser', 'framework', []],
      ['vite', 'Vite', 'platform', []],
      ['typescript', 'TypeScript', 'language', ['ts']],
    ] as const) {
      const saved = await dataSource.getRepository(Skill).save({ slug, name, kind, aliases: [...aliases] });
      skills[slug] = saved.id;
    }
    // Only the owner has an account row: the others exercise "author gone" (author: null)
    await dataSource.getRepository(User).insert({ id: owner, email: 'owner@example.com', username: 'owner_one' });
    await dataSource.getRepository(Profile).insert({ userId: owner, displayName: 'Owner One' });
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('create', () => {
    it('stores the post, its skills and its media in order, as the caller, and sends back the author', async () => {
      const res = await as(owner)
        .post('/posts')
        .send(valid({
          caption: '  Pixel dungeon  ',
          repoUrl: '',
          skillIds: [skills.vite, skills.phaser],
          media: [
            { type: MediaType.IMAGE, url: 'https://cdn.example.com/a.png' },
            { type: MediaType.IMAGE, url: 'https://cdn.example.com/b.png' },
          ],
        }))
        .expect(201);
      expect(res.body).toMatchObject({ userId: owner, caption: 'Pixel dungeon', repoUrl: null, rating: 0, ratingCount: 0, visitCount: 0 });
      expect(res.body.skills.map((s: Skill) => s.name)).toEqual(['Phaser', 'Vite']);
      expect(res.body.author).toEqual({ id: owner, username: 'owner_one', displayName: 'Owner One', avatarUrl: null });
      expect(res.body.media.map((m: Media) => [m.url, m.sortOrder])).toEqual([['https://cdn.example.com/a.png', 0], ['https://cdn.example.com/b.png', 1]]);
      expect(await dataSource.getRepository(PostSkill).countBy({ postId: res.body.id })).toBe(2);
    });

    it('creates a post without skills or media', async () => {
      const post = await createPost();
      expect(post).toMatchObject({ skills: [], media: [] });
    });

    it('needs a signed-in user', async () => {
      await anon().post('/api/v1/posts').send(valid()).expect(401);
    });

    it('rejects fields the server owns and invalid input', async () => {
      await as(owner).post('/posts').send(Object.assign(valid(), { userId: other })).expect(400);
      await as(owner).post('/posts').send(Object.assign(valid(), { rating: 5 })).expect(400);
      await as(owner).post('/posts').send(valid({ caption: 'x'.repeat(151) })).expect(400);
      await as(owner).post('/posts').send(valid({ caption: '   ' })).expect(400);
      await as(owner).post('/posts').send(valid({ link: 'ftp://files.example.com' })).expect(400);
      await as(owner).post('/posts').send(valid({ link: 'https://localhost' })).expect(400);
      await as(owner).post('/posts').send(valid({ category: 'music' as PostCategory })).expect(400);
      await as(owner).post('/posts').send(valid({ skillIds: Array.from({ length: 11 }, () => randomUUID()) })).expect(400);
      await as(owner).post('/posts').send(valid({ skillIds: [skills.phaser, skills.phaser] })).expect(400);
      // Well-formed but not in the catalog
      await as(owner).post('/posts').send(valid({ skillIds: [skills.phaser, randomUUID()] })).expect(400);
    });

    it('is atomic: when a media row fails, the post is rolled back too', async () => {
      const before = await dataSource.getRepository(Post).count();
      // Skips the DTO on purpose so the failure happens inside the transaction, after the post insert
      const bad = valid({ media: [{ type: MediaType.IMAGE, url: 'https://cdn.example.com/ok.png' }, { type: 'gif' as MediaType, url: 'https://cdn.example.com/x.gif' }] });
      await expect(app.get(PostsService).create(owner, bad)).rejects.toThrow();
      expect(await dataSource.getRepository(Post).count()).toBe(before);
      expect(await dataSource.getRepository(Media).countBy({ url: 'https://cdn.example.com/ok.png' })).toBe(0);
    });
  });

  describe('read', () => {
    it('lists publicly with filters, sorting and paging', async () => {
      await createPost({ category: PostCategory.SAAS, caption: 'saas one' });
      await createPost({ category: PostCategory.SAAS, caption: 'saas two' });
      const res = await anon().get('/api/v1/posts?category=saas&limit=1&offset=0').expect(200);
      expect(res.body).toMatchObject({ total: 2, limit: 1, offset: 0 });
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].caption).toBe('saas two');
      await anon().get('/api/v1/posts?limit=500').expect(400);
      await anon().get('/api/v1/posts?sort=random').expect(400);
    });

    it('returns one post with its rating distribution, 404 for an unknown id and 400 for a malformed one', async () => {
      const post = await createPost();
      await as(other).put(`/posts/${post.id}/ratings/me`).send({ value: 4 }).expect(200);
      const res = await anon().get(`/api/v1/posts/${post.id}`).expect(200);
      expect(res.body.ratingDistribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 });
      await anon().get(`/api/v1/posts/${randomUUID()}`).expect(404);
      await anon().get('/api/v1/posts/not-a-uuid').expect(400);
    });

    it('filters by skill slug or alias, and finds nothing for an unknown skill', async () => {
      const tagged = await createPost({ category: PostCategory.CSS_UI, skillIds: [skills.typescript] });
      await createPost({ category: PostCategory.CSS_UI });
      for (const skill of ['typescript', 'ts', 'TypeScript']) {
        const res = await anon().get(`/api/v1/posts?category=css_ui&skill=${skill}`).expect(200);
        expect(res.body.items.map((p: PostView) => p.id)).toEqual([tagged.id]);
        expect(res.body.total).toBe(1);
      }
      const none = await anon().get('/api/v1/posts?skill=cobol').expect(200);
      expect(none.body).toMatchObject({ items: [], total: 0 });
      await anon().get('/api/v1/posts?skill=not%20a%20slug').expect(400);
    });

    it('lists the most used skills, optionally within a category', async () => {
      await createPost({ category: PostCategory.MISC, skillIds: [skills.vite, skills.phaser] });
      await createPost({ category: PostCategory.MISC, skillIds: [skills.vite] });
      const res = await anon().get('/api/v1/posts/skills?category=misc').expect(200);
      expect(res.body.map((u: { skill: Skill; count: number }) => [u.skill.slug, u.count])).toEqual([['vite', 2], ['phaser', 1]]);
      await anon().get('/api/v1/posts/skills?limit=100').expect(400);
    });

    it('sorts by visits', async () => {
      const quiet = await createPost({ category: PostCategory.PORTFOLIOS });
      const busy = await createPost({ category: PostCategory.PORTFOLIOS });
      await anon().post(`/api/v1/posts/${busy.id}/visits`).expect(204);
      const res = await anon().get('/api/v1/posts?category=portfolios&sort=visited').expect(200);
      expect(res.body.items.map((p: PostView) => p.id)).toEqual([busy.id, quiet.id]);
    });

    it('lists a creator\'s posts by username, and 404s an unknown username', async () => {
      const mine = await createPost({ caption: 'by the owner' });
      await createPost({ caption: 'by someone else' }, other);
      const res = await anon().get('/api/v1/users/owner_one/posts?limit=50').expect(200);
      expect(res.body.items.every((p: PostView) => p.userId === owner)).toBe(true);
      expect(res.body.items.map((p: PostView) => p.id)).toContain(mine.id);
      // ?userId can't widen it to someone else's posts
      const forced = await anon().get(`/api/v1/users/owner_one/posts?userId=${other}`).expect(200);
      expect(forced.body.items.every((p: PostView) => p.userId === owner)).toBe(true);
      await anon().get('/api/v1/users/nobody_here/posts').expect(404);
    });
  });

  describe('update and delete', () => {
    it('lets only the creator edit, and replaces media as a whole', async () => {
      const post = await createPost({ repoUrl: 'https://github.com/a/b', media: [{ type: MediaType.IMAGE, url: 'https://cdn.example.com/old.png' }] });
      await as(other).patch(`/posts/${post.id}`).send({ caption: 'hijacked' }).expect(403);
      const res = await as(owner)
        .patch(`/posts/${post.id}`)
        .send({ caption: 'Renamed', repoUrl: null, media: [{ type: MediaType.VIDEO, url: 'https://cdn.example.com/new.mp4' }] })
        .expect(200);
      expect(res.body).toMatchObject({ caption: 'Renamed', repoUrl: null, link: post.link, userId: owner });
      expect(res.body.media.map((m: Media) => m.url)).toEqual(['https://cdn.example.com/new.mp4']);
      await as(owner).patch(`/posts/${post.id}`).send({ visitCount: 1000 }).expect(400);
    });

    it('keeps the skills when they are left out, and replaces them when sent', async () => {
      const post = await createPost({ skillIds: [skills.phaser, skills.vite] });
      const kept = await as(owner).patch(`/posts/${post.id}`).send({ caption: 'Only the caption' }).expect(200);
      expect(kept.body.skills.map((s: Skill) => s.slug)).toEqual(['phaser', 'vite']);
      const replaced = await as(owner).patch(`/posts/${post.id}`).send({ skillIds: [skills.typescript] }).expect(200);
      expect(replaced.body.skills.map((s: Skill) => s.slug)).toEqual(['typescript']);
      const cleared = await as(owner).patch(`/posts/${post.id}`).send({ skillIds: [] }).expect(200);
      expect(cleared.body.skills).toEqual([]);
    });

    it('rolls back the field changes when the media replacement fails', async () => {
      const post = await createPost({ media: [{ type: MediaType.IMAGE, url: 'https://cdn.example.com/keep.png' }] });
      const service = app.get(PostsService);
      await expect(service.update(post.id, { id: owner, roles: [] }, { caption: 'Should not stick', media: [{ type: 'gif' as MediaType, url: 'https://x.example.com/x.gif' }] })).rejects.toThrow();
      const after = await service.findOne(post.id);
      expect(after.caption).toBe(post.caption);
      expect(after.media.map((m) => m.url)).toEqual(['https://cdn.example.com/keep.png']);
    });

    it('lets the creator or a moderator delete, and cascades to media, comments and ratings', async () => {
      const post = await createPost({ media: [{ type: MediaType.IMAGE, url: 'https://cdn.example.com/gone.png' }] });
      await as(other).post(`/posts/${post.id}/comments`).send({ content: 'nice' }).expect(201);
      await as(other).put(`/posts/${post.id}/ratings/me`).send({ value: 4 }).expect(200);
      await as(other).delete(`/posts/${post.id}`).expect(403);
      await as(moderator, [UserRole.MODERATOR]).delete(`/posts/${post.id}`).expect(204);
      await anon().get(`/api/v1/posts/${post.id}`).expect(404);
      expect(await dataSource.getRepository(Media).countBy({ postId: post.id })).toBe(0);
      expect(await dataSource.getRepository(Comment).countBy({ postId: post.id })).toBe(0);
      expect(await dataSource.getRepository(Rating).countBy({ postId: post.id })).toBe(0);
      await as(owner).delete(`/posts/${post.id}`).expect(404);
    });
  });

  describe('visits', () => {
    it('counts every concurrent visit and does not touch updatedAt', async () => {
      const post = await createPost();
      await Promise.all(Array.from({ length: 40 }, () => anon().post(`/api/v1/posts/${post.id}/visits`).expect(204)));
      const after = await dataSource.getRepository(Post).findOneByOrFail({ id: post.id });
      expect(after.visitCount).toBe(40);
      expect(after.updatedAt.toISOString()).toBe(new Date(post.updatedAt).toISOString());
      await anon().post(`/api/v1/posts/${randomUUID()}/visits`).expect(404);
    });
  });

  describe('comments', () => {
    it('adds, lists, edits and deletes with the right permissions', async () => {
      const post = await createPost();
      const first = (await as(other).post(`/posts/${post.id}/comments`).send({ content: '  Love the art  ' }).expect(201)).body as Comment;
      expect(first).toMatchObject({ postId: post.id, userId: other, content: 'Love the art', author: null });
      const second = (await as(moderator).post(`/posts/${post.id}/comments`).send({ content: 'Second' }).expect(201)).body as Comment;
      await as(owner).post(`/posts/${post.id}/comments`).send({ content: 'Thanks!' }).expect(201);

      const list = await anon().get(`/api/v1/posts/${post.id}/comments`).expect(200);
      expect(list.body.items.map((c: Comment) => c.content)).toEqual(['Love the art', 'Second', 'Thanks!']);
      expect(list.body.items[2].author).toMatchObject({ username: 'owner_one', displayName: 'Owner One' });

      await as(owner).patch(`/posts/${post.id}/comments/${first.id}`).send({ content: 'edited by someone else' }).expect(403);
      const edited = await as(other).patch(`/posts/${post.id}/comments/${first.id}`).send({ content: 'Edited' }).expect(200);
      expect(edited.body.content).toBe('Edited');

      await as(randomUUID()).delete(`/posts/${post.id}/comments/${first.id}`).expect(403);
      await as(owner).delete(`/posts/${post.id}/comments/${first.id}`).expect(204); // the post's creator
      await as(randomUUID(), [UserRole.ADMIN]).delete(`/posts/${post.id}/comments/${second.id}`).expect(204);
      await as(other).delete(`/posts/${post.id}/comments/${first.id}`).expect(404);
    });

    it('rejects empty comments and comments on unknown posts', async () => {
      const post = await createPost();
      await as(other).post(`/posts/${post.id}/comments`).send({ content: '   ' }).expect(400);
      await as(other).post(`/posts/${randomUUID()}/comments`).send({ content: 'hello' }).expect(404);
      await anon().get(`/api/v1/posts/${randomUUID()}/comments`).expect(404);
    });

    it('scopes a comment to its post', async () => {
      const a = await createPost();
      const b = await createPost();
      const comment = (await as(other).post(`/posts/${a.id}/comments`).send({ content: 'on a' }).expect(201)).body as Comment;
      await as(other).patch(`/posts/${b.id}/comments/${comment.id}`).send({ content: 'moved?' }).expect(404);
    });
  });
});
