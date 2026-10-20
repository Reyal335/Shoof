var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Raw, Repository } from 'typeorm';
import { UserRole } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { Post } from './entities/post.entity.js';
import { Media } from './entities/media.entity.js';
import { Comment } from './entities/comment.entity.js';
import { Rating } from './entities/rating.entity.js';
import { PostSkill } from './entities/post-skill.entity.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkillsService, toSkillSummary } from '../skills/skills.service.js';
import { PostEvents, } from './posts.events.js';
const FOREIGN_KEY_VIOLATION = '23503';
const ORDER = {
    new: { createdAt: 'DESC', id: 'DESC' },
    top: { rating: 'DESC', ratingCount: 'DESC', createdAt: 'DESC', id: 'DESC' },
    visited: { visitCount: 'DESC', createdAt: 'DESC', id: 'DESC' },
};
function canModerate(user) {
    return user.roles.includes(UserRole.MODERATOR) || user.roles.includes(UserRole.ADMIN);
}
function emptyPage(query) {
    return { items: [], total: 0, limit: query.limit, offset: query.offset };
}
function toMediaView({ id, type, url, sortOrder }) {
    return { id, type, url, sortOrder };
}
let PostsService = class PostsService {
    posts;
    comments;
    postSkills;
    eventEmitter;
    skillService;
    usersService;
    constructor(posts, comments, postSkills, eventEmitter, skillService, usersService) {
        this.posts = posts;
        this.comments = comments;
        this.postSkills = postSkills;
        this.eventEmitter = eventEmitter;
        this.skillService = skillService;
        this.usersService = usersService;
    }
    async create(userId, dto) {
        const skillIds = await this.checkSkills(dto.skillIds ?? []);
        const post = await this.posts.manager.transaction(async (manager) => {
            const post = await manager.save(manager.create(Post, {
                userId,
                category: dto.category,
                link: dto.link,
                repoUrl: dto.repoUrl || null,
                caption: dto.caption,
                description: dto.description,
            }));
            post.media = await this.insertMedia(manager, post.id, dto.media ?? []);
            await this.insertSkills(manager, post.id, skillIds);
            return post;
        });
        return this.toView(post);
    }
    async findAll(query, scope = {}) {
        const where = {};
        if (query.category)
            where.category = query.category;
        if (query.userId)
            where.userId = query.userId;
        if (scope.userIds) {
            if (!scope.userIds.length)
                return emptyPage(query);
            where.userId = In(scope.userIds);
        }
        if (query.skill) {
            const skill = await this.skillService.findBySlug(query.skill);
            if (!skill)
                return emptyPage(query);
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
    async findOne(id) {
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
    async findTopSkills(query) {
        const params = [query.limit];
        let join = '';
        if (query.category) {
            params.push(query.category);
            join = `JOIN "posts" p ON p."id" = ps."postId" AND p."category" = $2`;
        }
        const rows = await this.postSkills.query(`SELECT ps."skillId", COUNT(*)::int AS "count"
         FROM "post_skills" ps ${join}
        GROUP BY ps."skillId"
        ORDER BY "count" DESC, ps."skillId"
        LIMIT $1`, params);
        const skills = await this.skillService.findByIds(rows.map((row) => row.skillId));
        const skillById = new Map(skills.map((skill) => [skill.id, toSkillSummary(skill)]));
        return rows.flatMap((row) => {
            const skill = skillById.get(row.skillId);
            return skill ? [{ skill, count: row.count }] : [];
        });
    }
    async update(id, user, dto) {
        const skillIds = dto.skillIds != null ? await this.checkSkills(dto.skillIds) : null;
        const post = await this.posts.manager.transaction(async (manager) => {
            const post = await this.lockPost(manager, id, 'for_no_key_update');
            if (post.userId !== user.id) {
                throw new ForbiddenException('Only the creator can edit this post');
            }
            const patch = {};
            if (dto.category != null)
                patch.category = dto.category;
            if (dto.link != null)
                patch.link = dto.link;
            if (dto.repoUrl !== undefined)
                patch.repoUrl = dto.repoUrl || null;
            if (dto.caption != null)
                patch.caption = dto.caption;
            if (dto.description != null)
                patch.description = dto.description;
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
    async remove(id, user) {
        await this.posts.manager.transaction(async (manager) => {
            const post = await this.lockPost(manager, id, 'pessimistic_write');
            if (post.userId !== user.id && !canModerate(user)) {
                throw new ForbiddenException('Only the creator or a moderator can delete this post');
            }
            await manager.delete(Post, { id });
        });
        this.eventEmitter.emit(PostEvents.Deleted, { postId: id });
    }
    async findSummariesByIds(ids) {
        if (!ids.length)
            return [];
        return this.posts.find({ where: { id: In(ids) }, select: { id: true, userId: true, caption: true } });
    }
    async findCommentSummariesByIds(ids) {
        if (!ids.length)
            return [];
        return this.comments.find({ where: { id: In(ids) }, select: { id: true, postId: true, content: true } });
    }
    async recordVisit(id) {
        const [rows] = await this.posts.query(`UPDATE "posts" SET "visitCount" = "visitCount" + 1 WHERE "id" = $1 RETURNING "id"`, [id]);
        if (!rows.length) {
            throw new NotFoundException('Post not found');
        }
    }
    async findMyRating(postId, user) {
        const post = await this.findPostRow(postId);
        const [mine, distribution] = await Promise.all([
            this.posts.manager.findOneBy(Rating, { postId, userId: user.id }),
            this.ratingDistribution(this.posts.manager, postId),
        ]);
        return { postId, rating: post.rating, ratingCount: post.ratingCount, value: mine?.value ?? null, distribution };
    }
    async rate(postId, user, value) {
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
            const summary = { postId, ...totals, value, distribution: await this.ratingDistribution(manager, postId) };
            return { summary, ownerId: post.userId };
        });
        this.eventEmitter.emit(PostEvents.Rated, { postId, actorId: user.id, recipientId: ownerId });
        return summary;
    }
    async unrate(postId, user) {
        const summary = await this.posts.manager.transaction(async (manager) => {
            await this.lockPost(manager, postId, 'for_no_key_update');
            await manager.delete(Rating, { postId, userId: user.id });
            const totals = await this.refreshRating(manager, postId);
            return { postId, ...totals, value: null, distribution: await this.ratingDistribution(manager, postId) };
        });
        this.eventEmitter.emit(PostEvents.Unrated, { postId, actorId: user.id });
        return summary;
    }
    async findComments(postId, query) {
        await this.findPostRow(postId);
        const [items, total] = await this.comments.findAndCount({
            where: { postId },
            order: { createdAt: 'ASC', id: 'ASC' },
            take: query.limit,
            skip: query.offset,
        });
        return { items: await this.toCommentViews(items), total, limit: query.limit, offset: query.offset };
    }
    async addComment(postId, user, content) {
        let comment;
        try {
            comment = await this.comments.save(this.comments.create({ postId, userId: user.id, content }));
        }
        catch (error) {
            if (error instanceof QueryFailedError && error.driverError.code === FOREIGN_KEY_VIOLATION) {
                throw new NotFoundException('Post not found');
            }
            throw error;
        }
        const post = await this.posts.findOne({ where: { id: postId }, select: { id: true, userId: true } });
        if (post && post.userId !== user.id) {
            this.eventEmitter.emit(PostEvents.CommentCreated, {
                postId,
                commentId: comment.id,
                actorId: user.id,
                recipientId: post.userId,
            });
        }
        const [view] = await this.toCommentViews([comment]);
        return view;
    }
    async updateComment(postId, commentId, user, content) {
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
    async removeComment(postId, commentId, user) {
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
        this.eventEmitter.emit(PostEvents.CommentDeleted, { postId, commentId });
    }
    async toView(post) {
        const [view] = await this.toViews([post]);
        return view;
    }
    async toViews(posts) {
        if (!posts.length)
            return [];
        const [links, authors] = await Promise.all([
            this.postSkills.find({ where: { postId: In(posts.map((post) => post.id)) }, select: { postId: true, skillId: true } }),
            this.usersService.findSummariesByIds(posts.map((post) => post.userId)),
        ]);
        const skills = await this.skillService.findByIds([...new Set(links.map((link) => link.skillId))]);
        const skillIdsByPost = new Map();
        for (const link of links) {
            const ids = skillIdsByPost.get(link.postId) ?? new Set();
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
    async toCommentViews(comments) {
        if (!comments.length)
            return [];
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
    async findPostRow(id) {
        const post = await this.posts.findOneBy({ id });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }
    async lockPost(manager, id, mode) {
        const post = await manager.findOne(Post, { where: { id }, lock: { mode } });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }
    async lockComment(manager, postId, id) {
        const comment = await manager.findOne(Comment, { where: { id, postId }, lock: { mode: 'pessimistic_write' } });
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }
        return comment;
    }
    insertMedia(manager, postId, items) {
        if (!items.length) {
            return Promise.resolve([]);
        }
        return manager.save(Media, items.map((item, sortOrder) => manager.create(Media, { postId, type: item.type, url: item.url, sortOrder })));
    }
    async checkSkills(ids) {
        const unique = [...new Set(ids)];
        const found = await this.skillService.findByIds(unique);
        if (found.length !== unique.length) {
            throw new BadRequestException('One or more skills do not exist');
        }
        return unique;
    }
    insertSkills(manager, postId, skillIds) {
        if (!skillIds.length)
            return Promise.resolve();
        return manager.insert(PostSkill, skillIds.map((skillId) => ({ postId, skillId })));
    }
    async refreshRating(manager, postId) {
        const [rows] = await manager.query(`UPDATE "posts" AS p
          SET "rating" = COALESCE(s.avg, 0), "ratingCount" = s.count
         FROM (SELECT ROUND(AVG("value"), 1) AS avg, COUNT(*)::int AS count FROM "ratings" WHERE "postId" = $1) AS s
        WHERE p."id" = $1
    RETURNING p."rating", p."ratingCount"`, [postId]);
        return { rating: Number(rows[0].rating), ratingCount: rows[0].ratingCount };
    }
    async ratingDistribution(manager, postId) {
        const rows = await manager.query(`SELECT "value", COUNT(*)::int AS "count" FROM "ratings" WHERE "postId" = $1 GROUP BY "value"`, [postId]);
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const row of rows) {
            distribution[row.value] = row.count;
        }
        return distribution;
    }
};
PostsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Post)),
    __param(1, InjectRepository(Comment)),
    __param(2, InjectRepository(PostSkill)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        Repository,
        EventEmitter2,
        SkillsService,
        UsersService])
], PostsService);
export { PostsService };
//# sourceMappingURL=posts.service.js.map