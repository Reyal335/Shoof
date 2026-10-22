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
import { Post, PostCategory } from '../src/modules/posts/entities/post.entity.js';
import { Media } from '../src/modules/posts/entities/media.entity.js';
import { Comment } from '../src/modules/posts/entities/comment.entity.js';
import { Rating } from '../src/modules/posts/entities/rating.entity.js';
import { PostSkill } from '../src/modules/posts/entities/post-skill.entity.js';
import { User } from '../src/modules/users/entities/user.entity.js';
import { User_Identity } from '../src/modules/users/entities/user-identity.js';
import { Profile } from '../src/modules/users/entities/profile.entity.js';
import { UserSkill } from '../src/modules/users/entities/user-skill.entity.js';
import { Skill } from '../src/modules/skills/entities/skill.entity.js';
import { IS_PUBLIC_KEY } from '../src/modules/auth/decorators/public.decorator.js';
import { OptionalJwtAuthGuard } from '../src/modules/auth/guards/optional-jwt-auth.guard.js';
import type { RatingSummary } from '../src/modules/posts/dto/rating-summary.dto.js';
import { AwsService } from '../src/modules/aws/aws.services.js';
import { fakeStorage } from './fakes/storage.fake.js';

// Ratings over a real Postgres database: the upsert, the row lock, the recount and the cascade. Same throwaway
// database as posts.e2e-spec.ts (<DB_DATABASE>_test, or TEST_DB_DATABASE), wiped on every run.
config({ path: resolve(import.meta.dirname, '../../../.env'), quiet: true });
const db = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};
const TEST_DB = process.env.TEST_DB_DATABASE ?? `${process.env.DB_DATABASE}_test`;

// Stands in for the JWT guards: x-user-id is the caller, on public routes too (so it also plays OptionalAuth).
@Injectable()
class HeaderAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const id = req.header('x-user-id');
    if (id) req.user = { id, roles: [] };
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    if (!id) throw new UnauthorizedException();
    return true;
  }
}

const RATING_MESSAGE = 'Rating must be a whole number from 1 to 5.';

describe('Ratings (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  const owner = randomUUID();
  const rater = randomUUID();

  const http = () => request(app.getHttpServer());
  const path = (postId: string, end: 'summary' | 'me') => `/api/v1/posts/${postId}/ratings/${end}`;
  const summaryOf = async (postId: string, userId?: string): Promise<RatingSummary> => {
    const req = http().get(path(postId, 'summary'));
    return (await (userId ? req.set('x-user-id', userId) : req).expect(200)).body;
  };
  const rate = (postId: string, userId: string, body: unknown) => http().put(path(postId, 'me')).set('x-user-id', userId).send(body as object);
  const unrate = (postId: string, userId: string) => http().delete(path(postId, 'me')).set('x-user-id', userId);
  const createPost = async () =>
    (await http().post('/api/v1/posts').set('x-user-id', owner).send({
      category: PostCategory.GAMES,
      link: 'https://www.blob.example.com',
      caption: 'Blob',
      description: 'A bouncing blob.',
    }).expect(201)).body as { id: string };
  const cache = (postId: string) => dataSource.getRepository(Post).findOneByOrFail({ id: postId });

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
    })
      // The real one runs passport's jwt strategy (covered in auth.e2e-spec.ts); here the header guard sets the caller
      .overrideGuard(OptionalJwtAuthGuard).useValue({ canActivate: () => true })
      .overrideProvider(AwsService).useValue(fakeStorage())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(0);
    dataSource = moduleRef.get(DataSource);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('reading', () => {
    it('tells a signed-out caller there is nothing of theirs and they can\'t rate', async () => {
      const post = await createPost();
      expect(await summaryOf(post.id)).toEqual({
        postId: post.id,
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        myRating: null,
        canRate: false,
        reason: 'signed_out',
      });
    });

    it('tells the creator it is their own post, and anyone else that they can rate', async () => {
      const post = await createPost();
      expect(await summaryOf(post.id, owner)).toMatchObject({ canRate: false, reason: 'own_post', myRating: null });
      expect(await summaryOf(post.id, rater)).toMatchObject({ canRate: true, reason: null, myRating: null });
    });
  });

  describe('rating, re-rating and removing', () => {
    it('counts a first rating, moves it on a re-rating, and takes it out on removal', async () => {
      const post = await createPost();

      const first = (await rate(post.id, rater, { value: 5 }).expect(200)).body as RatingSummary;
      expect(first).toMatchObject({ count: 1, average: 5, myRating: 5, canRate: true, distribution: { 5: 1, 3: 0 } });

      const again = (await rate(post.id, rater, { value: 3 }).expect(200)).body as RatingSummary;
      expect(again).toMatchObject({ count: 1, average: 3, myRating: 3, distribution: { 5: 0, 3: 1 } });
      expect(await summaryOf(post.id, rater)).toEqual(again);

      const removed = (await unrate(post.id, rater).expect(200)).body as RatingSummary;
      expect(removed).toMatchObject({ count: 0, average: 0, myRating: null, distribution: { 3: 0 } });
      // Nothing left to remove: same answer, still 200
      expect((await unrate(post.id, rater).expect(200)).body).toEqual(removed);
      expect(await cache(post.id)).toMatchObject({ rating: 0, ratingCount: 0 });
    });

    it('keeps the average to two decimals and stamps updatedAt on a re-rating', async () => {
      const post = await createPost();
      for (const value of [5, 4, 4]) await rate(post.id, randomUUID(), { value }).expect(200);
      expect((await summaryOf(post.id)).average).toBe(4.33);

      await rate(post.id, rater, { value: 2 }).expect(200);
      const before = await dataSource.getRepository(Rating).findOneByOrFail({ postId: post.id, userId: rater });
      await new Promise((done) => setTimeout(done, 20));
      await rate(post.id, rater, { value: 1 }).expect(200);
      const after = await dataSource.getRepository(Rating).findOneByOrFail({ postId: post.id, userId: rater });
      expect(after.value).toBe(1);
      expect(after.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());
      expect(after.createdAt.toISOString()).toBe(before.createdAt.toISOString());
    });
  });

  describe('refusals', () => {
    it('refuses the creator with 403 OWN_POST and writes nothing', async () => {
      const post = await createPost();
      const res = await rate(post.id, owner, { value: 5 }).expect(403);
      expect(res.body).toMatchObject({ code: 'OWN_POST', message: "You can't rate your own site." });
      expect(await dataSource.getRepository(Rating).countBy({ postId: post.id })).toBe(0);
      expect(await cache(post.id)).toMatchObject({ rating: 0, ratingCount: 0 });
    });

    it('refuses anything but a whole number from 1 to 5 with 400', async () => {
      const post = await createPost();
      for (const body of [{ value: 0 }, { value: 6 }, { value: 2.5 }, { value: 'x' }, { value: '4' }, { value: null }, {}]) {
        const res = await rate(post.id, rater, body).expect(400);
        expect(res.body.message).toEqual([RATING_MESSAGE]);
      }
      await rate(post.id, rater, { value: 4, extra: true }).expect(400);
      expect(await dataSource.getRepository(Rating).countBy({ postId: post.id })).toBe(0);
    });

    it('needs a signed-in user to rate or remove', async () => {
      const post = await createPost();
      await http().put(path(post.id, 'me')).send({ value: 4 }).expect(401);
      await http().delete(path(post.id, 'me')).expect(401);
    });

    it('404s an unknown post with POST_NOT_FOUND, and 400s a malformed id', async () => {
      const missing = randomUUID();
      expect((await http().get(path(missing, 'summary')).expect(404)).body.code).toBe('POST_NOT_FOUND');
      expect((await rate(missing, rater, { value: 4 }).expect(404)).body.code).toBe('POST_NOT_FOUND');
      expect((await unrate(missing, rater).expect(404)).body.code).toBe('POST_NOT_FOUND');
      await http().get(path('not-a-uuid', 'summary')).expect(400);
    });
  });

  describe('integrity', () => {
    it('keeps the cache exact when 20 people rate at once', async () => {
      const post = await createPost();
      const values = Array.from({ length: 20 }, (_, i) => (i % 5) + 1).map((v, i) => (i % 3 === 0 ? 5 : v));
      await Promise.all(values.map((value) => rate(post.id, randomUUID(), { value }).expect(200)));

      const [{ avg, count }] = await dataSource.query(
        `SELECT ROUND(AVG("value"), 2)::float AS avg, COUNT(*)::int AS count FROM "ratings" WHERE "postId" = $1`,
        [post.id],
      );
      expect(count).toBe(20);
      expect(await cache(post.id)).toMatchObject({ ratingCount: 20, rating: avg });
      expect(await summaryOf(post.id)).toMatchObject({ count: 20, average: avg });
    });

    it('keeps one rating per person when the same person rates many times at once', async () => {
      const post = await createPost();
      await Promise.all([1, 2, 3, 4, 5, 3, 2].map((value) => rate(post.id, rater, { value }).expect(200)));
      expect(await dataSource.getRepository(Rating).countBy({ postId: post.id })).toBe(1);
      const summary = await summaryOf(post.id, rater);
      expect(summary.count).toBe(1);
      expect(summary.average).toBe(summary.myRating);
    });

    // Deterministic version of the race above. Another transaction holds the post row while it adds a rating; the
    // request must wait for it and then count both. Without the row lock, the recount would read a snapshot taken
    // before that commit and store a count of 1.
    it('waits for an in-flight rating transaction, then counts both', async () => {
      const post = await createPost();
      const runner = dataSource.createQueryRunner();
      await runner.connect();
      await runner.startTransaction();
      await runner.query('SELECT 1 FROM "posts" WHERE "id" = $1 FOR NO KEY UPDATE', [post.id]);
      await runner.query('INSERT INTO "ratings" ("postId", "userId", "value") VALUES ($1, $2, 5)', [post.id, randomUUID()]);

      const pending = rate(post.id, rater, { value: 1 }).then((res) => res);
      await new Promise((done) => setTimeout(done, 300));
      await runner.query('UPDATE "posts" SET "rating" = 5, "ratingCount" = 1 WHERE "id" = $1', [post.id]);
      await runner.commitTransaction();
      await runner.release();

      const res = await pending;
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ average: 3, count: 2 });
    });

    it('takes a post\'s ratings with it when the post is deleted, even mid-rating', async () => {
      const post = await createPost();
      await rate(post.id, rater, { value: 4 }).expect(200);
      const results = await Promise.all([
        ...Array.from({ length: 10 }, () => rate(post.id, randomUUID(), { value: 4 })),
        http().delete(`/api/v1/posts/${post.id}`).set('x-user-id', owner),
      ]);
      expect(results.every((r) => [200, 204, 404].includes(r.status))).toBe(true);
      expect(await dataSource.getRepository(Rating).countBy({ postId: post.id })).toBe(0);
    });
  });
});
