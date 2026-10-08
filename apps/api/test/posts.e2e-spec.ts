import { Injectable, UnauthorizedException, ValidationPipe, type CanActivate, type ExecutionContext, type INestApplication } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { IS_PUBLIC_KEY } from '../src/modules/auth/decorators/public.decorator.js';
import { UserRole } from '../src/modules/users/entities/user.entity.js';
import type { CreatePostDto } from '../src/modules/posts/dto/create-post.dto.js';

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
    return res.body as Post;
  };

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
          entities: [Post, Media, Comment, Rating],
          synchronize: true,
          dropSchema: true,
        }),
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
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('create', () => {
    it('stores the post and its media in order, as the caller', async () => {
      const res = await as(owner)
        .post('/posts')
        .send(valid({
          caption: '  Pixel dungeon  ',
          repoUrl: '',
          techStack: ['Phaser', ' phaser ', 'Vite   JS'],
          media: [
            { type: MediaType.IMAGE, url: 'https://cdn.example.com/a.png' },
            { type: MediaType.IMAGE, url: 'https://cdn.example.com/b.png' },
          ],
        }))
        .expect(201);
      expect(res.body).toMatchObject({ userId: owner, caption: 'Pixel dungeon', repoUrl: null, techStack: ['Phaser', 'Vite JS'], rating: 0, ratingCount: 0, visitCount: 0 });
      expect(res.body.media.map((m: Media) => [m.url, m.sortOrder])).toEqual([['https://cdn.example.com/a.png', 0], ['https://cdn.example.com/b.png', 1]]);
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
      await as(owner).post('/posts').send(valid({ techStack: Array.from({ length: 16 }, (_, i) => `T${i}`) })).expect(400);
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

    it('returns one post, 404 for an unknown id and 400 for a malformed one', async () => {
      const post = await createPost();
      await anon().get(`/api/v1/posts/${post.id}`).expect(200);
      await anon().get(`/api/v1/posts/${randomUUID()}`).expect(404);
      await anon().get('/api/v1/posts/not-a-uuid').expect(400);
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
      await as(other).put(`/posts/${post.id}/rating`).send({ value: 4 }).expect(200);
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

  describe('ratings', () => {
    it('keeps the average and count exact under concurrent ratings', async () => {
      const post = await createPost();
      const values = Array.from({ length: 25 }, (_, i) => (i % 5) + 1).concat([5, 5, 4]);
      await Promise.all(values.map((value) => as(randomUUID()).put(`/posts/${post.id}/rating`).send({ value }).expect(200)));
      const after = await dataSource.getRepository(Post).findOneByOrFail({ id: post.id });
      const average = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      expect(after.ratingCount).toBe(values.length);
      expect(after.rating).toBe(average);
      expect(await dataSource.getRepository(Rating).countBy({ postId: post.id })).toBe(values.length);
    });

    // Deterministic version of the race above. Another transaction holds the post row while it adds a rating;
    // the request must wait for it and then count both. Without the row lock in rate(), the request's totals
    // query would read a snapshot taken before that commit and store ratingCount 1.
    it('waits for an in-flight rating transaction, then counts both', async () => {
      const post = await createPost();
      const runner = dataSource.createQueryRunner();
      await runner.connect();
      await runner.startTransaction();
      await runner.query('SELECT 1 FROM "posts" WHERE "id" = $1 FOR NO KEY UPDATE', [post.id]);
      await runner.query('INSERT INTO "ratings" ("postId", "userId", "value") VALUES ($1, $2, 5)', [post.id, randomUUID()]);

      const pending = as(other).put(`/posts/${post.id}/rating`).send({ value: 1 }).then((res) => res);
      await new Promise((done) => setTimeout(done, 300));
      await runner.query('UPDATE "posts" SET "rating" = 5, "ratingCount" = 1 WHERE "id" = $1', [post.id]);
      await runner.commitTransaction();
      await runner.release();

      const res = await pending;
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ rating: 3, ratingCount: 2 });
    });

    it('keeps one rating per user even when the same user rates many times at once', async () => {
      const post = await createPost();
      await Promise.all([1, 2, 3, 4, 5, 3, 2].map((value) => as(other).put(`/posts/${post.id}/rating`).send({ value }).expect(200)));
      expect(await dataSource.getRepository(Rating).countBy({ postId: post.id })).toBe(1);
      const res = await as(other).get(`/posts/${post.id}/rating`).expect(200);
      expect(res.body.ratingCount).toBe(1);
      expect(res.body.rating).toBe(res.body.value);
    });

    it('changes, reads and removes the caller\'s rating, recomputing the totals', async () => {
      const post = await createPost();
      await as(other).put(`/posts/${post.id}/rating`).send({ value: 2 }).expect(200);
      const changed = await as(moderator).put(`/posts/${post.id}/rating`).send({ value: 5 }).expect(200);
      expect(changed.body).toEqual({ postId: post.id, rating: 3.5, ratingCount: 2, value: 5 });
      const removed = await as(moderator).delete(`/posts/${post.id}/rating`).expect(200);
      expect(removed.body).toEqual({ postId: post.id, rating: 2, ratingCount: 1, value: null });
      await as(moderator).delete(`/posts/${post.id}/rating`).expect(200);
      const mine = await as(moderator).get(`/posts/${post.id}/rating`).expect(200);
      expect(mine.body.value).toBeNull();
    });

    it('refuses self-ratings, values outside 1 to 5 and unknown posts', async () => {
      const post = await createPost();
      await as(owner).put(`/posts/${post.id}/rating`).send({ value: 5 }).expect(403);
      await as(other).put(`/posts/${post.id}/rating`).send({ value: 6 }).expect(400);
      await as(other).put(`/posts/${post.id}/rating`).send({ value: 2.5 }).expect(400);
      await as(other).put(`/posts/${randomUUID()}/rating`).send({ value: 3 }).expect(404);
      await anon().put(`/api/v1/posts/${post.id}/rating`).send({ value: 3 }).expect(401);
    });

    it('leaves no orphan ratings when a post is deleted while people are rating it', async () => {
      const post = await createPost();
      const results = await Promise.all([
        ...Array.from({ length: 10 }, () => as(randomUUID()).put(`/posts/${post.id}/rating`).send({ value: 4 })),
        as(owner).delete(`/posts/${post.id}`),
      ]);
      expect(results.every((r) => [200, 204, 404].includes(r.status))).toBe(true);
      expect(await dataSource.getRepository(Rating).countBy({ postId: post.id })).toBe(0);
    });
  });

  describe('comments', () => {
    it('adds, lists, edits and deletes with the right permissions', async () => {
      const post = await createPost();
      const first = (await as(other).post(`/posts/${post.id}/comments`).send({ content: '  Love the art  ' }).expect(201)).body as Comment;
      expect(first).toMatchObject({ postId: post.id, userId: other, content: 'Love the art' });
      const second = (await as(moderator).post(`/posts/${post.id}/comments`).send({ content: 'Second' }).expect(201)).body as Comment;

      const list = await anon().get(`/api/v1/posts/${post.id}/comments`).expect(200);
      expect(list.body.items.map((c: Comment) => c.content)).toEqual(['Love the art', 'Second']);

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
