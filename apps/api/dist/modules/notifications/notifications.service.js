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
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Notification, NotificationType } from "./entities/notification.entity.js";
import { UsersService } from "../users/users.service.js";
import { PostsService } from "../posts/posts.service.js";
import { NotifFilter } from "./dto/list-notifications.query.js";
const ON_CONFLICT = {
    [NotificationType.FOLLOW]: `ON CONFLICT ("recipientId", "actorId") WHERE "type" = 'follow' DO UPDATE SET "createdAt" = now(), "readAt" = NULL`,
    [NotificationType.RATING]: `ON CONFLICT ("postId", "actorId") WHERE "type" = 'rating' DO UPDATE SET "createdAt" = now(), "readAt" = NULL`,
    [NotificationType.COMMENT]: `ON CONFLICT ("commentId") WHERE "commentId" IS NOT NULL DO NOTHING`,
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PG_TIMESTAMPTZ = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?[+-]\d{2}(:\d{2})?$/;
function encodeCursor(row) {
    return Buffer.from(`${row.cursorAt}|${row.id}`).toString('base64url');
}
function decodeCursor(cursor) {
    const [at, id, ...rest] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
    if (rest.length || !at || !id || !PG_TIMESTAMPTZ.test(at) || !UUID.test(id)) {
        throw new BadRequestException('Invalid cursor');
    }
    return { at, id };
}
function uniqueIds(ids) {
    return [...new Set(ids.filter((id) => id !== null))];
}
let NotificationsService = class NotificationsService {
    notificationRepository;
    usersService;
    postsService;
    constructor(notificationRepository, usersService, postsService) {
        this.notificationRepository = notificationRepository;
        this.usersService = usersService;
        this.postsService = postsService;
    }
    async upsert(notification) {
        if (notification.actorId === notification.recipientId)
            return;
        const postId = notification.type === NotificationType.FOLLOW ? null : notification.postId;
        const commentId = notification.type === NotificationType.COMMENT ? notification.commentId : null;
        await this.notificationRepository.query(`INSERT INTO "notifications" ("recipientId", "actorId", "type", "postId", "commentId")
             VALUES ($1, $2, $3, $4, $5)
             ${ON_CONFLICT[notification.type]}`, [notification.recipientId, notification.actorId, notification.type, postId, commentId]);
    }
    async withdraw(notification) {
        switch (notification.type) {
            case NotificationType.FOLLOW:
                await this.notificationRepository.delete({
                    type: NotificationType.FOLLOW,
                    recipientId: notification.recipientId,
                    actorId: notification.actorId,
                });
                return;
            case NotificationType.RATING:
                await this.notificationRepository.delete({
                    type: NotificationType.RATING,
                    postId: notification.postId,
                    actorId: notification.actorId,
                });
                return;
            case NotificationType.COMMENT:
                await this.notificationRepository.delete({ commentId: notification.commentId });
                return;
        }
    }
    async withdrawForPost(postId) {
        await this.notificationRepository.delete({ postId });
    }
    async list(recipientId, query) {
        const params = [recipientId, query.limit + 1];
        let where = `"recipientId" = $1`;
        if (query.filter === NotifFilter.UNREAD) {
            where += ` AND "readAt" IS NULL`;
        }
        if (query.cursor) {
            const { at, id } = decodeCursor(query.cursor);
            params.push(at, id);
            where += ` AND ("createdAt", "id") < ($3::timestamptz, $4::uuid)`;
        }
        const rows = await this.notificationRepository.query(`SELECT "id", "type", "actorId", "postId", "commentId", "readAt", "createdAt", "createdAt"::text AS "cursorAt"
               FROM "notifications"
              WHERE ${where}
              ORDER BY "createdAt" DESC, "id" DESC
              LIMIT $2`, params);
        const hasMore = rows.length > query.limit;
        const page = hasMore ? rows.slice(0, query.limit) : rows;
        const last = page.at(-1);
        return {
            items: await this.toViews(page),
            nextCursor: hasMore && last ? encodeCursor(last) : null,
        };
    }
    unreadCount(recipientId) {
        return this.notificationRepository.count({ where: { recipientId, readAt: IsNull() } });
    }
    async setRead(id, recipientId, read) {
        const result = await this.notificationRepository
            .createQueryBuilder()
            .update(Notification)
            .set({ readAt: read ? () => `COALESCE("readAt", now())` : null })
            .where({ id, recipientId })
            .execute();
        if (!result.affected) {
            throw new NotFoundException('Notification not found');
        }
    }
    async markAllRead(recipientId, upTo) {
        const query = this.notificationRepository
            .createQueryBuilder()
            .update(Notification)
            .set({ readAt: () => 'now()' })
            .where(`"recipientId" = :recipientId AND "readAt" IS NULL`, { recipientId });
        if (upTo) {
            query.andWhere(`date_trunc('milliseconds', "createdAt") <= :upTo`, { upTo });
        }
        await query.execute();
    }
    async toViews(rows) {
        if (!rows.length)
            return [];
        const [actors, posts, comments] = await Promise.all([
            this.usersService.findPublicByIds(uniqueIds(rows.map((row) => row.actorId))),
            this.postsService.findSummariesByIds(uniqueIds(rows.map((row) => row.postId))),
            this.postsService.findCommentSummariesByIds(uniqueIds(rows.map((row) => row.commentId))),
        ]);
        const actorById = new Map(actors.map((actor) => [actor.id, actor]));
        const postById = new Map(posts.map((post) => [post.id, post]));
        const commentById = new Map(comments.map((comment) => [comment.id, comment]));
        return rows.flatMap((row) => {
            const actor = actorById.get(row.actorId);
            const post = row.postId ? postById.get(row.postId) : undefined;
            const comment = row.commentId ? commentById.get(row.commentId) : undefined;
            if (!actor || (row.postId && !post) || (row.commentId && !comment))
                return [];
            return [{
                    id: row.id,
                    type: row.type,
                    read: row.readAt !== null,
                    createdAt: row.createdAt,
                    actor: {
                        id: actor.id,
                        username: actor.username,
                        displayName: actor.profile?.displayName || actor.username,
                        avatarUrl: actor.profile?.avatarUrl ?? null,
                    },
                    post: post ? { id: post.id, caption: post.caption } : null,
                    comment: comment ? { id: comment.id, content: comment.content } : null,
                }];
        });
    }
};
NotificationsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Notification)),
    __metadata("design:paramtypes", [Repository,
        UsersService,
        PostsService])
], NotificationsService);
export { NotificationsService };
//# sourceMappingURL=notifications.service.js.map