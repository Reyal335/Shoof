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
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UserRole } from '../users/entities/user.entity.js';
import { Post } from './entities/post.entity.js';
import { Media } from './entities/media.entity.js';
import { Comment } from './entities/comment.entity.js';
import { Rating } from './entities/rating.entity.js';
const FOREIGN_KEY_VIOLATION = '23503';
export function normalizeTechStack(names) {
    const seen = new Set();
    const result = [];
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
function canModerate(user) {
    return user.roles.includes(UserRole.MODERATOR) || user.roles.includes(UserRole.ADMIN);
}
let PostsService = class PostsService {
    posts;
    comments;
    constructor(posts, comments) {
        this.posts = posts;
        this.comments = comments;
    }
    async create(userId, dto) {
        return this.posts.manager.transaction(async (manager) => {
            const post = await manager.save(manager.create(Post, {
                userId,
                category: dto.category,
                link: dto.link,
                repoUrl: dto.repoUrl || null,
                caption: dto.caption,
                description: dto.description,
                techStack: normalizeTechStack(dto.techStack ?? []),
            }));
            post.media = await this.insertMedia(manager, post.id, dto.media ?? []);
            return post;
        });
    }
    async findAll(query) {
        const order = query.sort === 'top'
            ? { rating: 'DESC', ratingCount: 'DESC', createdAt: 'DESC', id: 'DESC' }
            : { createdAt: 'DESC', id: 'DESC' };
        const where = {};
        if (query.category)
            where.category = query.category;
        if (query.userId)
            where.userId = query.userId;
        const [items, total] = await this.posts.findAndCount({
            where,
            relations: { media: true },
            order: { ...order, media: { sortOrder: 'ASC' } },
            take: query.limit,
            skip: query.offset,
        });
        return { items, total, limit: query.limit, offset: query.offset };
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
        return post;
    }
    async update(id, user, dto) {
        return this.posts.manager.transaction(async (manager) => {
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
            if (dto.techStack != null)
                patch.techStack = normalizeTechStack(dto.techStack);
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
    async remove(id, user) {
        await this.posts.manager.transaction(async (manager) => {
            const post = await this.lockPost(manager, id, 'pessimistic_write');
            if (post.userId !== user.id && !canModerate(user)) {
                throw new ForbiddenException('Only the creator or a moderator can delete this post');
            }
            await manager.delete(Post, { id });
        });
    }
    async recordVisit(id) {
        const [rows] = await this.posts.query(`UPDATE "posts" SET "visitCount" = "visitCount" + 1 WHERE "id" = $1 RETURNING "id"`, [id]);
        if (!rows.length) {
            throw new NotFoundException('Post not found');
        }
    }
    async findMyRating(postId, user) {
        const post = await this.findPostRow(postId);
        const mine = await this.posts.manager.findOneBy(Rating, { postId, userId: user.id });
        return { postId, rating: post.rating, ratingCount: post.ratingCount, value: mine?.value ?? null };
    }
    async rate(postId, user, value) {
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
    async unrate(postId, user) {
        return this.posts.manager.transaction(async (manager) => {
            await this.lockPost(manager, postId, 'for_no_key_update');
            await manager.delete(Rating, { postId, userId: user.id });
            return { postId, ...(await this.refreshRating(manager, postId)), value: null };
        });
    }
    async findComments(postId, query) {
        await this.findPostRow(postId);
        const [items, total] = await this.comments.findAndCount({
            where: { postId },
            order: { createdAt: 'ASC', id: 'ASC' },
            take: query.limit,
            skip: query.offset,
        });
        return { items, total, limit: query.limit, offset: query.offset };
    }
    async addComment(postId, user, content) {
        try {
            return await this.comments.save(this.comments.create({ postId, userId: user.id, content }));
        }
        catch (error) {
            if (error instanceof QueryFailedError && error.driverError.code === FOREIGN_KEY_VIOLATION) {
                throw new NotFoundException('Post not found');
            }
            throw error;
        }
    }
    async updateComment(postId, commentId, user, content) {
        return this.comments.manager.transaction(async (manager) => {
            const comment = await this.lockComment(manager, postId, commentId);
            if (comment.userId !== user.id) {
                throw new ForbiddenException('Only the author can edit this comment');
            }
            comment.content = content;
            return manager.save(comment);
        });
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
    async refreshRating(manager, postId) {
        const [rows] = await manager.query(`UPDATE "posts" AS p
          SET "rating" = COALESCE(s.avg, 0), "ratingCount" = s.count
         FROM (SELECT ROUND(AVG("value"), 1) AS avg, COUNT(*)::int AS count FROM "ratings" WHERE "postId" = $1) AS s
        WHERE p."id" = $1
    RETURNING p."rating", p."ratingCount"`, [postId]);
        return { rating: Number(rows[0].rating), ratingCount: rows[0].ratingCount };
    }
};
PostsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Post)),
    __param(1, InjectRepository(Comment)),
    __metadata("design:paramtypes", [Repository,
        Repository])
], PostsService);
export { PostsService };
//# sourceMappingURL=posts.service.js.map