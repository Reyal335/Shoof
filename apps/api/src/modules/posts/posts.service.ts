import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Raw, Repository, type EntityManager, type FindOptionsWhere } from 'typeorm';
import type { AuthUser } from '../auth/auth.types.js';
import { UserRole } from '../users/entities/user.entity.js';
import { UsersService, type UserSummary } from '../users/users.service.js';
import { Post, PostCategory } from './entities/post.entity.js';
import { Media, MediaType } from './entities/media.entity.js';
import { Comment } from './entities/comment.entity.js';
import { Rating } from './entities/rating.entity.js';
import { PostSkill } from './entities/post-skill.entity.js';
import type { CreatePostDto, MediaItemDto } from './dto/create-post.dto.js';
import type { UpdatePostDto } from './dto/update-post.dto.js';
import type { ListPostsQueryDto, PaginationQueryDto, TopSkillsQueryDto } from './dto/query.dto.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkillsService, toSkillSummary, type SkillSummary } from '../skills/skills.service.js';
import {
  PostEvents,
  type CommentCreatedEvent,
  type CommentDeletedEvent,
  type PostDeletedEvent,
  type PostRatedEvent,
  type PostUnratedEvent,
} from './posts.events.js';

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface MediaView {
  id: string;
  type: MediaType;
  url: string;
  sortOrder: number;
}

/**
 * A post as every read and write sends it: its own columns, its media in order, the skills it is built with (sorted
 * by name) and who made it. Built field by field, so a column added to `posts` later stays server-side until it is
 * listed here.
 */
export interface PostView {
  id: string;
  userId: string;
  category: PostCategory;
  caption: string;
  description: string;
  link: string;
  repoUrl: string | null;
  rating: number;
  ratingCount: number;
  visitCount: number;
  createdAt: Date;
  updatedAt: Date;
  media: MediaView[];
  skills: SkillSummary[];
  // null when the creator's account is deactivated or gone
  author: UserSummary | null;
}

/** How many ratings gave each number of stars. */
export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

/** GET /posts/:id: the post page also draws the ratings bars. */
export interface PostDetailView extends PostView {
  ratingDistribution: RatingDistribution;
}

export interface RatingSummary {
  postId: string;
  rating: number;
  ratingCount: number;
  // The caller's own rating, null when they have none
  value: number | null;
  distribution: RatingDistribution;
}

export interface CommentView {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: UserSummary | null;
}

/** GET /posts/skills: a skill and how many posts (in the section) are built with it. */
export interface SkillUsage {
  skill: SkillSummary;
  count: number;
}

// What other modules get from findSummariesByIds / findCommentSummariesByIds: just enough to name and link it
export type PostSummary = Pick<Post, 'id' | 'userId' | 'caption'>;
export type CommentSummary = Pick<Comment, 'id' | 'postId' | 'content'>;

/** Narrows a list read to some creators. Set by other modules' routes (the following feed), never by a query string. */
export interface PostScope {
  userIds?: string[];
}

// Postgres foreign_key_violation: the referenced post was deleted (or never existed)
const FOREIGN_KEY_VIOLATION = '23503';

const ORDER = {
  new: { createdAt: 'DESC', id: 'DESC' },
  top: { rating: 'DESC', ratingCount: 'DESC', createdAt: 'DESC', id: 'DESC' },
  visited: { visitCount: 'DESC', createdAt: 'DESC', id: 'DESC' },
} as const;

function canModerate(user: AuthUser) {
  return user.roles.includes(UserRole.MODERATOR) || user.roles.includes(UserRole.ADMIN);
}

function emptyPage<T>(query: PaginationQueryDto): Page<T> {
  return { items: [], total: 0, limit: query.limit, offset: query.offset };
}

function toMediaView({ id, type, url, sortOrder }: Media): MediaView {
  return { id, type, url, sortOrder };
}

/**
 * Posts and everything hanging off them: media, skills, comments, ratings and visit counts.
 *
 * Every write that touches more than one row runs in a single transaction (READ COMMITTED, Postgres' default).
 * Where a check has to hold until the write lands (ownership, rating totals), the post or comment row is locked
 * first with SELECT ... FOR [NO KEY] UPDATE, so concurrent requests queue on that row instead of interleaving.
 * Counters are changed with single UPDATE statements so no increment is ever lost.
 *
 * Posts hold user and skill ids only. Names, avatars and skill labels come from UsersService and SkillsService in
 * one batched call each per page, never one per post.
 */
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly posts: Repository<Post>,
    @InjectRepository(Comment)
    private readonly comments: Repository<Comment>,
    @InjectRepository(PostSkill)
    private readonly postSkills: Repository<PostSkill>,
    private readonly eventEmitter: EventEmitter2,
    private readonly skillService: SkillsService,
    private readonly usersService: UsersService,
  ) {}

  // ---------- posts ----------

  /** The post, its media and its skills are inserted together: either all exist afterwards or none do. */
  async create(userId: string, dto: CreatePostDto): Promise<PostView> {
    const skillIds = await this.checkSkills(dto.skillIds ?? []);
    const post = await this.posts.manager.transaction(async (manager) => {
      const post = await manager.save(
        manager.create(Post, {
          userId,
          category: dto.category,
          link: dto.link,
          repoUrl: dto.repoUrl || null,
          caption: dto.caption,
          description: dto.description,
        }),
      );
      post.media = await this.insertMedia(manager, post.id, dto.media ?? []);
      await this.insertSkills(manager, post.id, skillIds);
      return post;
    });
    return this.toView(post);
  }

  /** Public lists: the feed, section pages and a creator's posts. `scope` narrows it to some creators. */
  async findAll(query: ListPostsQueryDto, scope: PostScope = {}): Promise<Page<PostView>> {
    // TypeORM 1.x rejects undefined values in a where clause, so only the filters actually given are set
    const where: FindOptionsWhere<Post> = {};
    if (query.category) where.category = query.category;
    if (query.userId) where.userId = query.userId;
    if (scope.userIds) {
      if (!scope.userIds.length) return emptyPage(query);
      where.userId = In(scope.userIds);
    }
    if (query.skill) {
      // Slug or alias ('js' finds JavaScript). An unknown skill has no posts rather than being an error.
      const skill = await this.skillService.findBySlug(query.skill);
      if (!skill) return emptyPage(query);
      where.id = Raw((id) => `${id} IN (SELECT ps."postId" FROM "post_skills" ps WHERE ps."skillId" = :skillId)`, {
        skillId: skill.id,
      });
    }

    const [posts, total] = await this.posts.findAndCount({
      where,
      relations: { media: true },
      order: { ...ORDER[query.sort], media: { sortOrder: 'ASC' } },
      take: query.limit,
      skip: query.offset,
    });
    return { items: await this.toViews(posts), total, limit: query.limit, offset: query.offset };
  }

  async findOne(id: string): Promise<PostDetailView> {
    const post = await this.posts.findOne({
      where: { id },
      relations: { media: true },
      order: { media: { sortOrder: 'ASC' } },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const [view, ratingDistribution] = await Promise.all([
      this.toView(post),
      this.ratingDistribution(this.posts.manager, id),
    ]);
    return { ...view, ratingDistribution };
  }

  /**
   * The skills a section's posts are built with most, busiest first. Reads post_skills (this module's table) and
   * asks SkillsService for the names.
   */
  async findTopSkills(query: TopSkillsQueryDto): Promise<SkillUsage[]> {
    const params: unknown[] = [query.limit];
    let join = '';
    if (query.category) {
      params.push(query.category);
      join = `JOIN "posts" p ON p."id" = ps."postId" AND p."category" = $2`;
    }
    const rows: { skillId: string; count: number }[] = await this.postSkills.query(
      `SELECT ps."skillId", COUNT(*)::int AS "count"
         FROM "post_skills" ps ${join}
        GROUP BY ps."skillId"
        ORDER BY "count" DESC, ps."skillId"
        LIMIT $1`,
      params,
    );

    const skills = await this.skillService.findByIds(rows.map((row) => row.skillId));
    const skillById = new Map(skills.map((skill) => [skill.id, toSkillSummary(skill)]));
    return rows.flatMap((row) => {
      const skill = skillById.get(row.skillId);
      return skill ? [{ skill, count: row.count }] : [];
    });
  }

  /** Owner only. Field changes and a media or skills replacement commit together. */
  async update(id: string, user: AuthUser, dto: UpdatePostDto): Promise<PostView> {
    const skillIds = dto.skillIds != null ? await this.checkSkills(dto.skillIds) : null;
    const post = await this.posts.manager.transaction(async (manager) => {
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
      if (Object.keys(patch).length) {
        await manager.update(Post, { id }, patch);
      }

      if (dto.media != null) {
        await manager.delete(Media, { postId: id });
        await this.insertMedia(manager, id, dto.media);
      }
      if (skillIds != null) {
        await manager.delete(PostSkill, { postId: id });
        await this.insertSkills(manager, id, skillIds);
      }

      return manager.findOneOrFail(Post, {
        where: { id },
        relations: { media: true },
        order: { media: { sortOrder: 'ASC' } },
      });
    });
    return this.toView(post);
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

    this.eventEmitter.emit(PostEvents.Deleted, { postId: id } satisfies PostDeletedEvent);
  }

  /** For other modules (notifications) that hold post ids. Missing ids are left out. */
  async findSummariesByIds(ids: string[]): Promise<PostSummary[]> {
    if (!ids.length) return [];
    return this.posts.find({ where: { id: In(ids) }, select: { id: true, userId: true, caption: true } });
  }

  /** For other modules (notifications) that hold comment ids. Missing ids are left out. */
  async findCommentSummariesByIds(ids: string[]): Promise<CommentSummary[]> {
    if (!ids.length) return [];
    return this.comments.find({ where: { id: In(ids) }, select: { id: true, postId: true, content: true } });
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
    const [mine, distribution] = await Promise.all([
      this.posts.manager.findOneBy(Rating, { postId, userId: user.id }),
      this.ratingDistribution(this.posts.manager, postId),
    ]);
    return { postId, rating: post.rating, ratingCount: post.ratingCount, value: mine?.value ?? null, distribution };
  }

  /**
   * Adds or changes the caller's rating (one per user per post) and recomputes the post's average and count
   * in the same transaction. The post row is locked first, so two people rating at once queue up and the
   * totals always match the ratings table. The lock is FOR NO KEY UPDATE, so comments can still be added meanwhile.
   */
  async rate(postId: string, user: AuthUser, value: number): Promise<RatingSummary> {
    const { summary, ownerId } = await this.posts.manager.transaction(async (manager) => {
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

      const totals = await this.refreshRating(manager, postId);
      const summary: RatingSummary = { postId, ...totals, value, distribution: await this.ratingDistribution(manager, postId) };
      return { summary, ownerId: post.userId };
    });

    // After the commit, so a rolled-back rating never notifies anyone
    this.eventEmitter.emit(PostEvents.Rated, { postId, actorId: user.id, recipientId: ownerId } satisfies PostRatedEvent);
    return summary;
  }

  /** Removes the caller's rating if there is one (idempotent) and recomputes the totals, under the same lock. */
  async unrate(postId: string, user: AuthUser): Promise<RatingSummary> {
    const summary = await this.posts.manager.transaction(async (manager): Promise<RatingSummary> => {
      await this.lockPost(manager, postId, 'for_no_key_update');
      await manager.delete(Rating, { postId, userId: user.id });
      const totals = await this.refreshRating(manager, postId);
      return { postId, ...totals, value: null, distribution: await this.ratingDistribution(manager, postId) };
    });

    this.eventEmitter.emit(PostEvents.Unrated, { postId, actorId: user.id } satisfies PostUnratedEvent);
    return summary;
  }

  // ---------- comments ----------

  async findComments(postId: string, query: PaginationQueryDto): Promise<Page<CommentView>> {
    await this.findPostRow(postId);
    const [items, total] = await this.comments.findAndCount({
      where: { postId },
      order: { createdAt: 'ASC', id: 'ASC' },
      take: query.limit,
      skip: query.offset,
    });
    return { items: await this.toCommentViews(items), total, limit: query.limit, offset: query.offset };
  }

  /** No separate existence check: the foreign key rejects a missing post atomically, even one deleted mid-request. */
  async addComment(postId: string, user: AuthUser, content: string): Promise<CommentView> {
    let comment: Comment;
    try {
      comment = await this.comments.save(this.comments.create({ postId, userId: user.id, content }));
    } catch (error) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === FOREIGN_KEY_VIOLATION) {
        throw new NotFoundException('Post not found');
      }
      throw error;
    }

    // The post's creator is the recipient. Missing only if the post was deleted since the save, and then the
    // comment went with it (ON DELETE CASCADE), so there is nothing to notify about.
    const post = await this.posts.findOne({ where: { id: postId }, select: { id: true, userId: true } });
    if (post && post.userId !== user.id) {
      this.eventEmitter.emit(PostEvents.CommentCreated, {
        postId,
        commentId: comment.id,
        actorId: user.id,
        recipientId: post.userId,
      } satisfies CommentCreatedEvent);
    }
    const [view] = await this.toCommentViews([comment]);
    return view;
  }

  /** The author only. */
  async updateComment(postId: string, commentId: string, user: AuthUser, content: string): Promise<CommentView> {
    const comment = await this.comments.manager.transaction(async (manager) => {
      const comment = await this.lockComment(manager, postId, commentId);
      if (comment.userId !== user.id) {
        throw new ForbiddenException('Only the author can edit this comment');
      }
      comment.content = content;
      return manager.save(comment);
    });
    const [view] = await this.toCommentViews([comment]);
    return view;
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

    this.eventEmitter.emit(PostEvents.CommentDeleted, { postId, commentId } satisfies CommentDeletedEvent);
  }

  // ---------- views ----------

  private async toView(post: Post): Promise<PostView> {
    const [view] = await this.toViews([post]);
    return view;
  }

  // Two batched lookups per page (skills, authors), never one per post
  private async toViews(posts: Post[]): Promise<PostView[]> {
    if (!posts.length) return [];

    const [links, authors] = await Promise.all([
      this.postSkills.find({ where: { postId: In(posts.map((post) => post.id)) }, select: { postId: true, skillId: true } }),
      this.usersService.findSummariesByIds(posts.map((post) => post.userId)),
    ]);
    // findByIds sorts by name, so each post's skills come out in name order
    const skills = await this.skillService.findByIds([...new Set(links.map((link) => link.skillId))]);
    const skillIdsByPost = new Map<string, Set<string>>();
    for (const link of links) {
      const ids = skillIdsByPost.get(link.postId) ?? new Set<string>();
      ids.add(link.skillId);
      skillIdsByPost.set(link.postId, ids);
    }
    const authorById = new Map(authors.map((author) => [author.id, author]));

    return posts.map((post) => {
      const ids = skillIdsByPost.get(post.id);
      return {
        id: post.id,
        userId: post.userId,
        category: post.category,
        caption: post.caption,
        description: post.description,
        link: post.link,
        repoUrl: post.repoUrl,
        rating: post.rating,
        ratingCount: post.ratingCount,
        visitCount: post.visitCount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        media: (post.media ?? []).map(toMediaView),
        skills: ids ? skills.filter((skill) => ids.has(skill.id)).map(toSkillSummary) : [],
        author: authorById.get(post.userId) ?? null,
      };
    });
  }

  private async toCommentViews(comments: Comment[]): Promise<CommentView[]> {
    if (!comments.length) return [];
    const authors = await this.usersService.findSummariesByIds(comments.map((comment) => comment.userId));
    const authorById = new Map(authors.map((author) => [author.id, author]));
    return comments.map((comment) => ({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: authorById.get(comment.userId) ?? null,
    }));
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

  /** Skills are owned by the skills module, so ask it whether the picked ids exist. Returns them deduplicated. */
  private async checkSkills(ids: string[]): Promise<string[]> {
    const unique = [...new Set(ids)];
    const found = await this.skillService.findByIds(unique);
    if (found.length !== unique.length) {
      throw new BadRequestException('One or more skills do not exist');
    }
    return unique;
  }

  private insertSkills(manager: EntityManager, postId: string, skillIds: string[]): Promise<unknown> {
    if (!skillIds.length) return Promise.resolve();
    return manager.insert(PostSkill, skillIds.map((skillId) => ({ postId, skillId })));
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

  // Served by the unique (postId, userId) index, so it reads only this post's ratings
  private async ratingDistribution(manager: EntityManager, postId: string): Promise<RatingDistribution> {
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
}
