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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity.js';
import { Rating } from './entities/rating.entity.js';
import { cannotRateOwnPost, postNotFound } from './posts.errors.js';
import { PostEvents } from './posts.events.js';
let RatingsService = class RatingsService {
    posts;
    ratings;
    eventEmitter;
    constructor(posts, ratings, eventEmitter) {
        this.posts = posts;
        this.ratings = ratings;
        this.eventEmitter = eventEmitter;
    }
    async summary(postId, user) {
        const post = await this.posts.findOne({
            where: { id: postId },
            select: { id: true, userId: true, rating: true, ratingCount: true },
        });
        if (!post)
            throw postNotFound();
        const [distribution, mine] = await Promise.all([
            this.distributionOf(postId),
            user ? this.ratings.findOne({ where: { postId, userId: user.id }, select: { value: true } }) : null,
        ]);
        return toSummary(post, distribution, mine?.value ?? null, user);
    }
    async rate(postId, user, value) {
        const { summary, ownerId } = await this.posts.manager.transaction(async (manager) => {
            const post = await this.lockPost(manager, postId);
            if (post.userId === user.id)
                throw cannotRateOwnPost();
            await manager.query(`INSERT INTO "ratings" ("postId", "userId", "value") VALUES ($1, $2, $3)
         ON CONFLICT ("postId", "userId") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = now()`, [postId, user.id, value]);
            const totals = await this.recompute(manager, postId);
            const distribution = await this.distributionOf(postId, manager);
            return { summary: toSummary({ ...post, ...totals }, distribution, value, user), ownerId: post.userId };
        });
        this.eventEmitter.emit(PostEvents.Rated, { postId, actorId: user.id, recipientId: ownerId });
        return summary;
    }
    async remove(postId, user) {
        const { summary, removed } = await this.posts.manager.transaction(async (manager) => {
            const post = await this.lockPost(manager, postId);
            const [rows] = await manager.query(`DELETE FROM "ratings" WHERE "postId" = $1 AND "userId" = $2 RETURNING "id"`, [postId, user.id]);
            const totals = await this.recompute(manager, postId);
            const distribution = await this.distributionOf(postId, manager);
            return { summary: toSummary({ ...post, ...totals }, distribution, null, user), removed: rows.length > 0 };
        });
        if (removed) {
            this.eventEmitter.emit(PostEvents.Unrated, { postId, actorId: user.id });
        }
        return summary;
    }
    async distributionOf(postId, manager = this.posts.manager) {
        const rows = await manager.query(`SELECT "value", COUNT(*)::int AS "count" FROM "ratings" WHERE "postId" = $1 GROUP BY "value"`, [postId]);
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const row of rows) {
            distribution[row.value] = row.count;
        }
        return distribution;
    }
    async lockPost(manager, id) {
        const post = await manager.findOne(Post, {
            where: { id },
            select: { id: true, userId: true, rating: true, ratingCount: true },
            lock: { mode: 'for_no_key_update' },
        });
        if (!post)
            throw postNotFound();
        return post;
    }
    async recompute(manager, postId) {
        const [rows] = await manager.query(`UPDATE "posts" AS p
          SET "rating" = COALESCE(s.avg, 0), "ratingCount" = s.count
         FROM (SELECT ROUND(AVG("value"), 2) AS avg, COUNT(*)::int AS count FROM "ratings" WHERE "postId" = $1) AS s
        WHERE p."id" = $1
    RETURNING p."rating", p."ratingCount"`, [postId]);
        return { rating: Number(rows[0].rating), ratingCount: rows[0].ratingCount };
    }
};
RatingsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Post)),
    __param(1, InjectRepository(Rating)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        EventEmitter2])
], RatingsService);
export { RatingsService };
function toSummary(post, distribution, myRating, user) {
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
//# sourceMappingURL=ratings.service.js.map