import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RatingsService } from './ratings.service.js';
import { Post } from './entities/post.entity.js';
import { Rating } from './entities/rating.entity.js';
import { PostEvents } from './posts.events.js';
import type { AuthUser } from '../auth/auth.types.js';

const OWNER = 'owner-id';
const RATER: AuthUser = { id: 'rater-id', roles: [] };
const POST = { id: 'post-1', userId: OWNER, rating: 4.5, ratingCount: 2 };

// The rules, against a scripted transaction manager. The SQL itself (upsert, recompute, locking, concurrency) is
// covered against a real database in test/ratings.e2e-spec.ts.
describe('RatingsService', () => {
  let service: RatingsService;
  const emit = vi.fn();
  const manager = { findOne: vi.fn(), query: vi.fn(), transaction: vi.fn() };
  const posts = { findOne: vi.fn(), manager };
  const ratings = { findOne: vi.fn() };

  // Answers each statement by its first word: the distribution SELECT, the upsert, the DELETE and the recompute
  function scriptQueries({ deleted = 1 } = {}) {
    manager.query.mockImplementation(async (sql: string) => {
      const verb = sql.trim().split(/\s+/)[0];
      if (verb === 'SELECT') return [{ value: 5, count: 1 }, { value: 4, count: 1 }];
      if (verb === 'DELETE') return [Array.from({ length: deleted }, () => ({ id: 'r' })), deleted];
      if (verb === 'UPDATE') return [[{ rating: '4.50', ratingCount: 2 }], 1];
      return [];
    });
  }

  beforeEach(async () => {
    vi.resetAllMocks();
    manager.transaction.mockImplementation((work: (m: typeof manager) => unknown) => work(manager));
    scriptQueries();
    const moduleRef = await Test.createTestingModule({
      providers: [
        RatingsService,
        { provide: getRepositoryToken(Post), useValue: posts },
        { provide: getRepositoryToken(Rating), useValue: ratings },
        { provide: EventEmitter2, useValue: { emit } },
      ],
    }).compile();
    service = moduleRef.get(RatingsService);
  });

  describe('summary', () => {
    it('tells a signed-out caller they can\'t rate, with no rating of their own', async () => {
      posts.findOne.mockResolvedValue(POST);
      const summary = await service.summary('post-1', null);
      expect(summary).toEqual({
        postId: 'post-1',
        average: 4.5,
        count: 2,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
        myRating: null,
        canRate: false,
        reason: 'signed_out',
      });
      expect(ratings.findOne).not.toHaveBeenCalled();
    });

    it('tells the creator it\'s their own post', async () => {
      posts.findOne.mockResolvedValue(POST);
      const summary = await service.summary('post-1', { id: OWNER, roles: [] });
      expect(summary).toMatchObject({ canRate: false, reason: 'own_post' });
    });

    it('sends the caller\'s own rating, and an average of 0 for a post nobody rated', async () => {
      posts.findOne.mockResolvedValue({ ...POST, rating: 0, ratingCount: 0 });
      ratings.findOne.mockResolvedValue({ value: 3 });
      expect(await service.summary('post-1', RATER)).toMatchObject({ average: 0, count: 0, myRating: 3, canRate: true, reason: null });
    });

    it('404s an unknown post with POST_NOT_FOUND', async () => {
      posts.findOne.mockResolvedValue(null);
      await expect(service.summary('nope', null)).rejects.toMatchObject({ status: 404, response: { code: 'POST_NOT_FOUND' } });
    });
  });

  describe('rate', () => {
    it('refuses the creator with OWN_POST and writes nothing', async () => {
      manager.findOne.mockResolvedValue(POST);
      await expect(service.rate('post-1', { id: OWNER, roles: [] }, 5)).rejects.toMatchObject({
        status: 403,
        response: { code: 'OWN_POST', message: "You can't rate your own site." },
      });
      expect(manager.query).not.toHaveBeenCalled();
      expect(emit).not.toHaveBeenCalled();
    });

    it('locks the post, upserts, recomputes from SQL and notifies the creator after the commit', async () => {
      manager.findOne.mockResolvedValue(POST);
      const summary = await service.rate('post-1', RATER, 4);

      expect(manager.findOne.mock.calls[0][1]).toMatchObject({ where: { id: 'post-1' }, lock: { mode: 'for_no_key_update' } });
      const statements = manager.query.mock.calls.map((call) => String(call[0]).trim().split(/\s+/)[0]);
      expect(statements).toEqual(['INSERT', 'UPDATE', 'SELECT']);
      expect(summary).toMatchObject({ average: 4.5, count: 2, myRating: 4, canRate: true });
      expect(emit).toHaveBeenCalledWith(PostEvents.Rated, { postId: 'post-1', actorId: RATER.id, recipientId: OWNER });
    });
  });

  describe('remove', () => {
    it('answers with the summary even when there was nothing to remove, and tells no one', async () => {
      manager.findOne.mockResolvedValue(POST);
      scriptQueries({ deleted: 0 });
      const summary = await service.remove('post-1', RATER);
      expect(summary).toMatchObject({ myRating: null, canRate: true });
      expect(emit).not.toHaveBeenCalled();
    });

    it('withdraws the rating notification when a rating was removed', async () => {
      manager.findOne.mockResolvedValue(POST);
      await service.remove('post-1', RATER);
      expect(emit).toHaveBeenCalledWith(PostEvents.Unrated, { postId: 'post-1', actorId: RATER.id });
    });
  });
});
