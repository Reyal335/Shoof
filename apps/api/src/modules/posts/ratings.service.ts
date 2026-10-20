import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository, type EntityManager } from 'typeorm';
import type { AuthUser } from '../auth/auth.types.js';
import { Post } from './entities/post.entity.js';
import { Rating } from './entities/rating.entity.js';
import type { RatingDistribution, RatingSummary } from './dto/rating-summary.dto.js';
import { cannotRateOwnPost, postNotFound } from './posts.errors.js';
import { PostEvents, type PostRatedEvent, type PostUnratedEvent } from './posts.events.js';

type PostRow = Pick<Post, 'id' | 'userId' | 'rating' | 'ratingCount'>;

/**
 * Ratings: 1 to 5 whole stars, one per user per post. Lives in the posts module because it owns both tables it
 * writes: the ratings rows and the posts.rating / posts.ratingCount cache, which only this service changes.
 *
 * Every write runs in one transaction that first locks the post row, upserts or deletes the caller's rating, then
 * recomputes the average and count from SQL. The lock queues concurrent ratings of one post, so the cache always
 * matches the table. It is FOR NO KEY UPDATE rather than FOR UPDATE: it conflicts with itself just the same, but lets
 * comments (whose foreign key check takes FOR KEY SHARE on the post) be added meanwhile.
 */
@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Post)
    private readonly posts: Repository<Post>,
    @InjectRepository(Rating)
    private readonly ratings: Repository<Rating>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Public. myRating, canRate and reason depend on `user`, which is null for anonymous callers. No lock needed. */
  async summary(postId: string, user: AuthUser | null): Promise<RatingSummary> {
    const post = await this.posts.findOne({
      where: { id: postId },
      select: { id: true, userId: true, rating: true, ratingCount: true },
    });
    if (!post) throw postNotFound();

    const [distribution, mine] = await Promise.all([
      this.distributionOf(postId),
      user ? this.ratings.findOne({ where: { postId, userId: user.id }, select: { value: true } }) : null,
    ]);
    return toSummary(post, distribution, mine?.value ?? null, user);
  }

  /** Adds or replaces the caller's rating. 404 for an unknown post, 403 (OWN_POST) for the caller's own. */
  async rate(postId: string, user: AuthUser, value: number): Promise<RatingSummary> {
    const { summary, ownerId } = await this.posts.manager.transaction(async (manager) => {
      const post = await this.lockPost(manager, postId);
      if (post.userId === user.id) throw cannotRateOwnPost();

      await manager.query(
        `INSERT INTO "ratings" ("postId", "userId", "value") VALUES ($1, $2, $3)
         ON CONFLICT ("postId", "userId") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now()`,
        [postId, user.id, value],
      );
      const totals = await this.recompute(manager, postId);
      const distribution = await this.distributionOf(postId, manager);
      return { summary: toSummary({ ...post, ...totals }, distribution, value, user), ownerId: post.userId };
    });

    // After the commit, so a rolled-back rating never notifies anyone
    this.eventEmitter.emit(PostEvents.Rated, { postId, actorId: user.id, recipientId: ownerId } satisfies PostRatedEvent);
    return summary;
  }

  /** Removes the caller's rating. Idempotent: with nothing to remove it still answers with the summary. */
  async remove(postId: string, user: AuthUser): Promise<RatingSummary> {
    const { summary, removed } = await this.posts.manager.transaction(async (manager) => {
      const post = await this.lockPost(manager, postId);
      const [rows]: [unknown[], number] = await manager.query(
        `DELETE FROM "ratings" WHERE "postId" = $1 AND "userId" = $2 RETURNING "id"`,
        [postId, user.id],
      );
      const totals = await this.recompute(manager, postId);
      const distribution = await this.distributionOf(postId, manager);
      return { summary: toSummary({ ...post, ...totals }, distribution, null, user), removed: rows.length > 0 };
    });

    if (removed) {
      this.eventEmitter.emit(PostEvents.Unrated, { postId, actorId: user.id } satisfies PostUnratedEvent);
    }
    return summary;
  }

  /** How many ratings gave each number of stars. Also read by PostsService for the server-rendered post page. */
  async distributionOf(postId: string, manager: EntityManager = this.posts.manager): Promise<RatingDistribution> {
    // Served by the unique (postId, userId) index, so it reads only this post's ratings
    const rows: { value: number; count: number }[] = await manager.query(
      `SELECT "value", COUNT(*)::int AS "count" FROM "ratings" WHERE "postId" = $1 GROUP BY "value"`,
      [postId],
    );
    const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of rows) {
      distribution[row.value as keyof RatingDistribution] = row.count;
    }
    return distribution;
  }

  // Locks the post row until the transaction ends (see the class comment)
  private async lockPost(manager: EntityManager, id: string): Promise<PostRow> {
    const post = await manager.findOne(Post, {
      where: { id },
      select: { id: true, userId: true, rating: true, ratingCount: true },
      lock: { mode: 'for_no_key_update' },
    });
    if (!post) throw postNotFound();
    return post;
  }

  // The cache, rebuilt from the ratings table, never from the old cached values. Must run under the post lock.
  // Leaves updatedAt alone: being rated is not an edit.
  private async recompute(manager: EntityManager, postId: string): Promise<Pick<Post, 'rating' | 'ratingCount'>> {
    const [rows]: [{ rating: string; ratingCount: number }[], number] = await manager.query(
      `UPDATE "posts" AS p
          SET "rating" = COALESCE(s.avg, 0), "ratingCount" = s.count
         FROM (SELECT ROUND(AVG("value"), 2) AS avg, COUNT(*)::int AS count FROM "ratings" WHERE "postId" = $1) AS s
        WHERE p."id" = $1
    RETURNING p."rating", p."ratingCount"`,
      [postId],
    );
    return { rating: Number(rows[0].rating), ratingCount: rows[0].ratingCount };
  }
}

function toSummary(post: PostRow, distribution: RatingDistribution, myRating: number | null, user: AuthUser | null): RatingSummary {
  const reason = !user ? 'signed_out' : post.userId === user.id ? 'own_post' : null;
  return {
    postId: post.id,
    average: post.ratingCount ? Number(post.rating) : 0,
    count: post.ratingCount,
    distribution,
    myRating,
    canRate: reason === null,
    reason,
  };
}
