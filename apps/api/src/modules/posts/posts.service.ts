import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository, type EntityManager, type FindOptionsWhere } from 'typeorm';
import type { AuthUser } from '../auth/auth.types.js';
import { UserRole } from '../users/entities/user.entity.js';
import { Post } from './entities/post.entity.js';
import { Media } from './entities/media.entity.js';
import { Comment } from './entities/comment.entity.js';
import { Rating } from './entities/rating.entity.js';
import type { CreatePostDto, MediaItemDto } from './dto/create-post.dto.js';
import type { UpdatePostDto } from './dto/update-post.dto.js';
import type { ListPostsQueryDto, PaginationQueryDto } from './dto/query.dto.js';

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface RatingSummary {
  postId: string;
  rating: number;
  ratingCount: number;
  // The caller's own rating, null when they have none
  value: number | null;
}

// Postgres foreign_key_violation: the referenced post was deleted (or never existed)
const FOREIGN_KEY_VIOLATION = '23503';

/** Collapses whitespace, drops blanks and case-insensitive duplicates, keeps the first spelling and the order. */
export function normalizeTechStack(names: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of names) {
    const name = raw.replace(/\s+/g, ' ').trim();
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      result.push(name);
    }
  }
  return result;
}

function canModerate(user: AuthUser) {
  return user.roles.includes(UserRole.MODERATOR) || user.roles.includes(UserRole.ADMIN);
}

/**
 * Posts and everything hanging off them: media, comments, ratings and visit counts.
 *
 * Every write that touches more than one row runs in a single transaction (READ COMMITTED, Postgres' default).
 * Where a check has to hold until the write lands (ownership, rating totals), the post or comment row is locked
 * first with SELECT ... FOR [NO KEY] UPDATE, so concurrent requests queue on that row instead of interleaving.
 * Counters are changed with single UPDATE statements so no increment is ever lost.
 */
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly posts: Repository<Post>,
    @InjectRepository(Comment)
    private readonly comments: Repository<Comment>,
  ) {}

  // ---------- posts ----------

  /** The post and its media are inserted together: either both exist afterwards or neither does. */
  async create(userId: string, dto: CreatePostDto): Promise<Post> {
    return this.posts.manager.transaction(async (manager) => {
      const post = await manager.save(
        manager.create(Post, {
          userId,
          category: dto.category,
          link: dto.link,
          repoUrl: dto.repoUrl || null,
          caption: dto.caption,
          description: dto.description,
          techStack: normalizeTechStack(dto.techStack ?? []),
        }),
      );
      post.media = await this.insertMedia(manager, post.id, dto.media ?? []);
      return post;
    });
  }

  async findAll(query: ListPostsQueryDto): Promise<Page<Post>> {
    const order =
      query.sort === 'top'
        ? ({ rating: 'DESC', ratingCount: 'DESC', createdAt: 'DESC', id: 'DESC' } as const)
        : ({ createdAt: 'DESC', id: 'DESC' } as const);
    // TypeORM 1.x rejects undefined values in a where clause, so only the filters actually given are set
    const where: FindOptionsWhere<Post> = {};
    if (query.category) where.category = query.category;
    if (query.userId) where.userId = query.userId;
    const [items, total] = await this.posts.findAndCount({
      where,
      relations: { media: true },
      order: { ...order, media: { sortOrder: 'ASC' } },
      take: query.limit,
      skip: query.offset,
    });
    return { items, total, limit: query.limit, offset: query.offset };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.posts.findOne({
      where: { id },
      relations: { media: true },
      order: { media: { sortOrder: 'ASC' } },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  /** Owner only. Field changes and a media replacement commit together. */
  async update(id: string, user: AuthUser, dto: UpdatePostDto): Promise<Post> {
    return this.posts.manager.transaction(async (manager) => {
      const post = await this.lockPost(manager, id, 'for_no_key_update');
      if (post.userId !== user.id) {
        throw new ForbiddenException('Only the creator can edit this post');
      }

      // Picked one by one so a request body can never set userId, rating, counters or timestamps.
      // null is ignored for required fields; for repoUrl it clears the link.
      const patch: Partial<Post> = {};
      if (dto.category != null) patch.category = dto.category;
      if (dto.link != null) patch.link = dto.link;
      if (dto.repoUrl !== undefined) patch.repoUrl = dto.repoUrl || null;
      if (dto.caption != null) patch.caption = dto.caption;
      if (dto.description != null) patch.description = dto.description;
      if (dto.techStack != null) patch.techStack = normalizeTechStack(dto.techStack);
      if (Object.keys(patch).length) {
        await manager.update(Post, { id }, patch);
      }

      if (dto.media != null) {
        await manager.delete(Media, { postId: id });
        await this.insertMedia(manager, id, dto.media);
      }

      return manager.findOneOrFail(Post, {
        where: { id },
        relations: { media: true },
        order: { media: { sortOrder: 'ASC' } },
      });
    });
  }

  /** The creator, or a moderator. Media, comments and ratings go with it (ON DELETE CASCADE, same statement). */
  async remove(id: string, user: AuthUser): Promise<void> {
    await this.posts.manager.transaction(async (manager) => {
      const post = await this.lockPost(manager, id, 'pessimistic_write');
      if (post.userId !== user.id && !canModerate(user)) {
        throw new ForbiddenException('Only the creator or a moderator can delete this post');
      }
      await manager.delete(Post, { id });
    });
  }

  /** One atomic increment, so concurrent visits are never lost. Leaves updatedAt alone: a visit is not an edit. */
  async recordVisit(id: string): Promise<void> {
    const [rows] = await this.posts.query(
      `UPDATE "posts" SET "visitCount" = "visitCount" + 1 WHERE "id" = $1 RETURNING "id"`,
      [id],
    );
    if (!rows.length) {
      throw new NotFoundException('Post not found');
    }
  }

  // ---------- ratings ----------

  async findMyRating(postId: string, user: AuthUser): Promise<RatingSummary> {
    const post = await this.findPostRow(postId);
    const mine = await this.posts.manager.findOneBy(Rating, { postId, userId: user.id });
    return { postId, rating: post.rating, ratingCount: post.ratingCount, value: mine?.value ?? null };
  }

  /**
   * Adds or changes the caller's rating (one per user per post) and recomputes the post's average and count
   * in the same transaction. The post row is locked first, so two people rating at once queue up and the
   * totals always match the ratings table. The lock is FOR NO KEY UPDATE, so comments can still be added meanwhile.
   */
  async rate(postId: string, user: AuthUser, value: number): Promise<RatingSummary> {
    return this.posts.manager.transaction(async (manager) => {
      const post = await this.lockPost(manager, postId, 'for_no_key_update');
      if (post.userId === user.id) {
        throw new ForbiddenException('You cannot rate your own post');
      }
      await manager
        .createQueryBuilder()
        .insert()
        .into(Rating)
        .values({ postId, userId: user.id, value })
        .orUpdate(['value'], ['postId', 'userId'])
        .execute();
      return { postId, ...(await this.refreshRating(manager, postId)), value };
    });
  }

  /** Removes the caller's rating if there is one (idempotent) and recomputes the totals, under the same lock. */
  async unrate(postId: string, user: AuthUser): Promise<RatingSummary> {
    return this.posts.manager.transaction(async (manager) => {
      await this.lockPost(manager, postId, 'for_no_key_update');
      await manager.delete(Rating, { postId, userId: user.id });
      return { postId, ...(await this.refreshRating(manager, postId)), value: null };
    });
  }

  // ---------- comments ----------

  async findComments(postId: string, query: PaginationQueryDto): Promise<Page<Comment>> {
    await this.findPostRow(postId);
    const [items, total] = await this.comments.findAndCount({
      where: { postId },
      order: { createdAt: 'ASC', id: 'ASC' },
      take: query.limit,
      skip: query.offset,
    });
    return { items, total, limit: query.limit, offset: query.offset };
  }

  /** No separate existence check: the foreign key rejects a missing post atomically, even one deleted mid-request. */
  async addComment(postId: string, user: AuthUser, content: string): Promise<Comment> {
    try {
      return await this.comments.save(this.comments.create({ postId, userId: user.id, content }));
    } catch (error) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === FOREIGN_KEY_VIOLATION) {
        throw new NotFoundException('Post not found');
      }
      throw error;
    }
  }

  /** The author only. */
  async updateComment(postId: string, commentId: string, user: AuthUser, content: string): Promise<Comment> {
    return this.comments.manager.transaction(async (manager) => {
      const comment = await this.lockComment(manager, postId, commentId);
      if (comment.userId !== user.id) {
        throw new ForbiddenException('Only the author can edit this comment');
      }
      comment.content = content;
      return manager.save(comment);
    });
  }

  /** The author, the post's creator or a moderator. */
  async removeComment(postId: string, commentId: string, user: AuthUser): Promise<void> {
    await this.comments.manager.transaction(async (manager) => {
      const comment = await this.lockComment(manager, postId, commentId);
      if (comment.userId !== user.id && !canModerate(user)) {
        const post = await manager.findOneByOrFail(Post, { id: postId });
        if (post.userId !== user.id) {
          throw new ForbiddenException('Only the author, the post creator or a moderator can delete this comment');
        }
      }
      await manager.delete(Comment, { id: commentId });
    });
  }

  // ---------- helpers ----------

  private async findPostRow(id: string): Promise<Post> {
    const post = await this.posts.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  // Locks the post row until the transaction ends. FOR UPDATE for deletes, FOR NO KEY UPDATE for everything else.
  private async lockPost(manager: EntityManager, id: string, mode: 'pessimistic_write' | 'for_no_key_update'): Promise<Post> {
    const post = await manager.findOne(Post, { where: { id }, lock: { mode } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  private async lockComment(manager: EntityManager, postId: string, id: string): Promise<Comment> {
    const comment = await manager.findOne(Comment, { where: { id, postId }, lock: { mode: 'pessimistic_write' } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  private insertMedia(manager: EntityManager, postId: string, items: MediaItemDto[]): Promise<Media[]> {
    if (!items.length) {
      return Promise.resolve([]);
    }
    return manager.save(
      Media,
      items.map((item, sortOrder) => manager.create(Media, { postId, type: item.type, url: item.url, sortOrder })),
    );
  }

  // Recomputes the average (one decimal) and count from the ratings table. Must run under the post lock.
  private async refreshRating(manager: EntityManager, postId: string): Promise<{ rating: number; ratingCount: number }> {
    const [rows] = await manager.query(
      `UPDATE "posts" AS p
          SET "rating" = COALESCE(s.avg, 0), "ratingCount" = s.count
         FROM (SELECT ROUND(AVG("value"), 1) AS avg, COUNT(*)::int AS count FROM "ratings" WHERE "postId" = $1) AS s
        WHERE p."id" = $1
    RETURNING p."rating", p."ratingCount"`,
      [postId],
    );
    return { rating: Number(rows[0].rating), ratingCount: rows[0].ratingCount };
  }
}
