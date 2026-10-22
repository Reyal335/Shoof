import { Injectable, UnauthorizedException, ValidationPipe, type CanActivate, type ExecutionContext, type INestApplication } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import type { Request } from 'express';
import { PostsModule } from '../src/modules/posts/posts.module.js';
import { FollowsModule } from '../src/modules/follows/follows.module.js';
import { NotificationsModule } from '../src/modules/notifications/notifications.module.js';
import { Post, PostCategory } from '../src/modules/posts/entities/post.entity.js';
import { Media } from '../src/modules/posts/entities/media.entity.js';
import { Comment } from '../src/modules/posts/entities/comment.entity.js';
import { Rating } from '../src/modules/posts/entities/rating.entity.js';
import { Follow } from '../src/modules/follows/entities/follow.entity.js';
import { User } from '../src/modules/users/entities/user.entity.js';
import { User_Identity } from '../src/modules/users/entities/user-identity.js';
import { Profile } from '../src/modules/users/entities/profile.entity.js';
import { Notification } from '../src/modules/notifications/entities/notification.entity.js';
import { UserSkill } from '../src/modules/users/entities/user-skill.entity.js';
import { Skill } from '../src/modules/skills/entities/skill.entity.js';
import { PostSkill } from '../src/modules/posts/entities/post-skill.entity.js';
import type { NotificationPage, NotificationView } from '../src/modules/notifications/notifications.service.js';
import { IS_PUBLIC_KEY } from '../src/modules/auth/decorators/public.decorator.js';
import { AwsService } from '../src/modules/aws/aws.services.js';
import { fakeStorage } from './fakes/storage.fake.js';

// Posts, follows and notifications over a real Postgres database: the events, the partial-index upserts and the
// cursor pagination are exercised end to end. Same throwaway database as posts.e2e-spec.ts, wiped on every run.
config({ path: resolve(import.meta.dirname, '../../../.env'), quiet: true });
const db = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};
const TEST_DB = process.env.TEST_DB_DATABASE ?? `${process.env.DB_DATABASE}_test`;

// Stands in for the JWT guard: x-user-id is the caller. Honours @Public() like the real one.
@Injectable()
class HeaderAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const id = req.header('x-user-id');
    if (id) {
      req.user = { id, roles: [] };
    }
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
      return true;
    }
    if (!id) throw new UnauthorizedException();
    return true;
  }
}

// Listeners run after the response is sent, so assertions about their effect poll until it lands
const eventually = (assertion: () => Promise<void>) => vi.waitFor(assertion, { timeout: 3000, interval: 25 });
// For "nothing was sent": give any listener time to run, then look
const settle = () => new Promise((resolve) => setTimeout(resolve, 150));

describe('Notifications (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  // creator receives; fans act. fans[4] is deactivated.
  let creator: User;
  let fans: User[];

  const as = (userId: string) => ({
    post: (path: string) => request(app.getHttpServer()).post(`/api/v1${path}`).set('x-user-id', userId),
    put: (path: string) => request(app.getHttpServer()).put(`/api/v1${path}`).set('x-user-id', userId),
    patch: (path: string) => request(app.getHttpServer()).patch(`/api/v1${path}`).set('x-user-id', userId),
    delete: (path: string) => request(app.getHttpServer()).delete(`/api/v1${path}`).set('x-user-id', userId),
    get: (path: string) => request(app.getHttpServer()).get(`/api/v1${path}`).set('x-user-id', userId),
  });

  const list = async (userId: string, query = ''): Promise<NotificationPage> =>
    (await as(userId).get(`/notifications${query}`).expect(200)).body;
  const unread = async (userId: string): Promise<number> =>
    (await as(userId).get('/notifications/unread-count').expect(200)).body.count;
  const createPost = async (userId: string, caption = 'Pixel dungeon'): Promise<Post> =>
    (await as(userId).post('/posts').send({
      category: PostCategory.GAMES,
      link: 'https://www.dungeon.example.com',
      caption,
      description: 'A tiny roguelike.',
    }).expect(201)).body;

  const createUser = async (username: string, isActive = true) => {
    const user = await dataSource.getRepository(User).save({ email: `${username}@example.com`, username, passwordHash: null, isActive });
    await dataSource.getRepository(Profile).save({ userId: user.id, displayName: `${username} display` });
    return user;
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
          entities: [User, User_Identity, Profile, UserSkill, Skill, Follow, Post, Media, Comment, Rating, PostSkill, Notification],
          synchronize: true,
          dropSchema: true,
        }),
        EventEmitterModule.forRoot(),
        PostsModule,
        FollowsModule,
        NotificationsModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: HeaderAuthGuard }],
    })
      .overrideProvider(AwsService)
      .useValue(fakeStorage())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(0);
    dataSource = moduleRef.get(DataSource);

    creator = await createUser('creator');
    fans = [await createUser('ana'), await createUser('ben'), await createUser('cy'), await createUser('dee'), await createUser('gone', false)];
  });

  afterEach(async () => {
    await dataSource.query('TRUNCATE "notifications", "follows", "posts" CASCADE');
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('follows', () => {
    it('tells the followed user who followed them', async () => {
      await as(fans[0].id).post(`/users/${creator.id}/follow`).expect(204);

      await eventually(async () => expect(await unread(creator.id)).toBe(1));
      const { items, nextCursor } = await list(creator.id);
      expect(nextCursor).toBeNull();
      expect(items).toEqual([expect.objectContaining({
        type: 'follow',
        read: false,
        actor: { id: fans[0].id, username: 'ana', displayName: 'ana display', avatarUrl: null },
        post: null,
        comment: null,
      })]);
      expect(await unread(fans[0].id)).toBe(0);
    });

    it('sends nothing for a repeat follow, and withdraws it on unfollow', async () => {
      await as(fans[0].id).post(`/users/${creator.id}/follow`).expect(204);
      await eventually(async () => expect(await unread(creator.id)).toBe(1));
      const [first] = (await list(creator.id)).items;
      await as(creator.id).patch(`/notifications/${first.id}`).send({ read: true }).expect(204);

      // Already following: no event, so the read notification stays read
      await as(fans[0].id).post(`/users/${creator.id}/follow`).expect(204);
      await settle();
      expect((await list(creator.id)).items).toEqual([expect.objectContaining({ id: first.id, read: true })]);

      await as(fans[0].id).delete(`/users/${creator.id}/follow`).expect(204);
      await eventually(async () => expect((await list(creator.id)).items).toEqual([]));
    });

    it('404s for a user that does not exist (the missing await)', async () => {
      await as(fans[0].id).post('/users/00000000-0000-4000-8000-000000000000/follow').expect(404);
    });
  });

  describe('ratings', () => {
    it('tells the creator, once per rater, and a re-rating makes it unread again', async () => {
      const post = await createPost(creator.id);
      await as(fans[0].id).put(`/posts/${post.id}/ratings/me`).send({ value: 3 }).expect(200);
      await eventually(async () => expect(await unread(creator.id)).toBe(1));

      const [note] = (await list(creator.id)).items;
      expect(note).toMatchObject({ type: 'rating', post: { id: post.id, caption: 'Pixel dungeon' }, comment: null });
      await as(creator.id).patch(`/notifications/${note.id}`).send({ read: true }).expect(204);
      expect(await unread(creator.id)).toBe(0);

      await as(fans[0].id).put(`/posts/${post.id}/ratings/me`).send({ value: 5 }).expect(200);
      await eventually(async () => expect(await unread(creator.id)).toBe(1));
      expect((await list(creator.id)).items).toEqual([expect.objectContaining({ id: note.id, read: false })]);
    });

    it('withdraws the notification when the rating is removed', async () => {
      const post = await createPost(creator.id);
      await as(fans[0].id).put(`/posts/${post.id}/ratings/me`).send({ value: 4 }).expect(200);
      await eventually(async () => expect(await unread(creator.id)).toBe(1));

      await as(fans[0].id).delete(`/posts/${post.id}/ratings/me`).expect(200);
      await eventually(async () => expect(await unread(creator.id)).toBe(0));
    });
  });

  describe('comments', () => {
    it('tells the creator with the comment text, but not for their own comment', async () => {
      const post = await createPost(creator.id);
      await as(creator.id).post(`/posts/${post.id}/comments`).send({ content: 'Thanks all' }).expect(201);
      const comment = (await as(fans[1].id).post(`/posts/${post.id}/comments`).send({ content: 'Love the art' }).expect(201)).body;

      await eventually(async () => expect(await unread(creator.id)).toBe(1));
      expect((await list(creator.id)).items).toEqual([expect.objectContaining({
        type: 'comment',
        actor: expect.objectContaining({ username: 'ben' }),
        post: { id: post.id, caption: 'Pixel dungeon' },
        comment: { id: comment.id, content: 'Love the art' },
      })]);
    });

    it('withdraws the notification when the comment is deleted', async () => {
      const post = await createPost(creator.id);
      const comment = (await as(fans[1].id).post(`/posts/${post.id}/comments`).send({ content: 'Nice' }).expect(201)).body;
      await eventually(async () => expect(await unread(creator.id)).toBe(1));

      await as(fans[1].id).delete(`/posts/${post.id}/comments/${comment.id}`).expect(204);
      await eventually(async () => expect(await unread(creator.id)).toBe(0));
    });
  });

  it('a deleted post takes its notifications with it', async () => {
    const post = await createPost(creator.id);
    await as(fans[0].id).put(`/posts/${post.id}/ratings/me`).send({ value: 4 }).expect(200);
    await as(fans[1].id).post(`/posts/${post.id}/comments`).send({ content: 'Nice' }).expect(201);
    await as(fans[2].id).post(`/users/${creator.id}/follow`).expect(204);
    await eventually(async () => expect(await unread(creator.id)).toBe(3));

    await as(creator.id).delete(`/posts/${post.id}`).expect(204);
    await eventually(async () => expect(await unread(creator.id)).toBe(1));
    expect((await list(creator.id)).items.map((n) => n.type)).toEqual(['follow']);
  });

  describe('list', () => {
    // Five notifications, oldest first: follows from ana, ben, cy, dee, then a rating from ana
    const seed = async () => {
      for (const fan of fans.slice(0, 4)) {
        await as(fan.id).post(`/users/${creator.id}/follow`).expect(204);
        await eventually(async () => expect((await list(creator.id)).items.length).toBeGreaterThan(fans.indexOf(fan)));
      }
      const post = await createPost(creator.id);
      await as(fans[0].id).put(`/posts/${post.id}/ratings/me`).send({ value: 5 }).expect(200);
      await eventually(async () => expect(await unread(creator.id)).toBe(5));
    };

    it('pages newest first with a cursor, with no gaps or repeats', async () => {
      await seed();
      const seen: NotificationView[] = [];
      let cursor: string | null = '';
      let pages = 0;
      while (cursor !== null) {
        const page: NotificationPage = await list(creator.id, `?limit=2${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
        seen.push(...page.items);
        cursor = page.nextCursor;
        pages++;
      }
      expect(pages).toBe(3);
      expect(seen.map((n) => n.type === 'rating' ? 'rating' : n.actor.username)).toEqual(['rating', 'dee', 'cy', 'ben', 'ana']);
    });

    it('filters to unread', async () => {
      await seed();
      const [newest] = (await list(creator.id)).items;
      await as(creator.id).patch(`/notifications/${newest.id}`).send({ read: true }).expect(204);
      const { items } = await list(creator.id, '?filter=unread');
      expect(items).toHaveLength(4);
      expect(items.every((n) => !n.read)).toBe(true);
    });

    it('leaves out notifications from a deactivated actor', async () => {
      await dataSource.query(
        `INSERT INTO "notifications" ("recipientId", "actorId", "type") VALUES ($1, $2, 'follow')`,
        [creator.id, fans[4].id],
      );
      expect((await list(creator.id)).items).toEqual([]);
    });

    it('rejects a malformed cursor and bad query values', async () => {
      await as(creator.id).get('/notifications?cursor=not-a-cursor').expect(400);
      await as(creator.id).get(`/notifications?cursor=${Buffer.from('2026-10-15|x').toString('base64url')}`).expect(400);
      await as(creator.id).get('/notifications?limit=0').expect(400);
      await as(creator.id).get('/notifications?filter=everything').expect(400);
    });
  });

  describe('read state', () => {
    it('marks one read and unread again', async () => {
      await as(fans[0].id).post(`/users/${creator.id}/follow`).expect(204);
      await eventually(async () => expect(await unread(creator.id)).toBe(1));
      const [note] = (await list(creator.id)).items;

      await as(creator.id).patch(`/notifications/${note.id}`).send({ read: true }).expect(204);
      expect(await unread(creator.id)).toBe(0);
      await as(creator.id).patch(`/notifications/${note.id}`).send({ read: false }).expect(204);
      expect(await unread(creator.id)).toBe(1);
    });

    it("404s for someone else's notification and validates the body", async () => {
      await as(fans[0].id).post(`/users/${creator.id}/follow`).expect(204);
      await eventually(async () => expect(await unread(creator.id)).toBe(1));
      const [note] = (await list(creator.id)).items;

      await as(fans[1].id).patch(`/notifications/${note.id}`).send({ read: true }).expect(404);
      await as(creator.id).patch(`/notifications/${note.id}`).send({ read: 'yes' }).expect(400);
      await as(creator.id).patch(`/notifications/${note.id}`).send({ read: true, recipientId: fans[1].id }).expect(400);
      await as(creator.id).patch('/notifications/not-a-uuid').send({ read: true }).expect(400);
      expect(await unread(creator.id)).toBe(1);
    });

    it('marks all read up to the newest one on screen, leaving newer ones unread', async () => {
      await as(fans[0].id).post(`/users/${creator.id}/follow`).expect(204);
      await eventually(async () => expect(await unread(creator.id)).toBe(1));
      const [onScreen] = (await list(creator.id)).items;

      await as(fans[1].id).post(`/users/${creator.id}/follow`).expect(204);
      await eventually(async () => expect(await unread(creator.id)).toBe(2));

      await as(creator.id).post('/notifications/read-all').send({ upTo: onScreen.createdAt }).expect(204);
      const { items } = await list(creator.id);
      expect(items.map((n) => [n.actor.username, n.read])).toEqual([['ben', false], ['ana', true]]);

      await as(creator.id).post('/notifications/read-all').send({}).expect(204);
      expect(await unread(creator.id)).toBe(0);
    });
  });

  it('needs a signed-in user', async () => {
    await request(app.getHttpServer()).get('/api/v1/notifications').expect(401);
    await request(app.getHttpServer()).get('/api/v1/notifications/unread-count').expect(401);
  });

  // The follows module's public reads, here because this spec already has real users
  describe('follower lists and counts', () => {
    const anon = () => request(app.getHttpServer());

    it('lists followers and following newest first, with names, and counts both', async () => {
      await as(fans[0].id).post(`/users/${creator.id}/follow`).expect(204);
      await as(fans[1].id).post(`/users/${creator.id}/follow`).expect(204);
      await as(creator.id).post(`/users/${fans[0].id}/follow`).expect(204);

      const followers = await anon().get('/api/v1/users/creator/followers').expect(200);
      expect(followers.body).toMatchObject({ total: 2, limit: 20, offset: 0 });
      expect(followers.body.items.map((i: { user: { username: string } }) => i.user.username)).toEqual(['ben', 'ana']);
      expect(followers.body.items[0].user).toEqual({ id: fans[1].id, username: 'ben', displayName: 'ben display', avatarUrl: null });

      const following = await anon().get('/api/v1/users/creator/following').expect(200);
      expect(following.body.items.map((i: { user: { username: string } }) => i.user.username)).toEqual(['ana']);

      expect((await anon().get('/api/v1/users/creator/follow-counts').expect(200)).body).toEqual({ followers: 2, following: 1 });
      expect((await anon().get('/api/v1/users/ana/follow-counts').expect(200)).body).toEqual({ followers: 1, following: 1 });
    });

    it('pages, validates and 404s an unknown username', async () => {
      await as(fans[0].id).post(`/users/${creator.id}/follow`).expect(204);
      await as(fans[1].id).post(`/users/${creator.id}/follow`).expect(204);
      const page = await anon().get('/api/v1/users/creator/followers?limit=1&offset=1').expect(200);
      expect(page.body.items.map((i: { user: { username: string } }) => i.user.username)).toEqual(['ana']);
      await anon().get('/api/v1/users/creator/followers?limit=500').expect(400);
      await anon().get('/api/v1/users/nobody/followers').expect(404);
      await anon().get('/api/v1/users/nobody/follow-counts').expect(404);
    });

    it('refuses a malformed id on "do I follow"', async () => {
      await as(fans[0].id).get('/users/not-a-uuid/follow').expect(400);
      expect((await as(fans[0].id).get(`/users/${creator.id}/follow`).expect(200)).body).toEqual({ following: false });
    });
  });
});
