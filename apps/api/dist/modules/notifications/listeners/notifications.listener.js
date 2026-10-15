var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsListener_1;
import { OnEvent } from "@nestjs/event-emitter";
import { Injectable, Logger } from "@nestjs/common";
import { NotificationsService } from "../notifications.service.js";
import { NotificationType } from "../entities/notification.entity.js";
import { PostEvents, } from "../../posts/posts.events.js";
import { FollowEvents } from "../../follows/follows.events.js";
let NotificationsListener = NotificationsListener_1 = class NotificationsListener {
    notificationsService;
    logger = new Logger(NotificationsListener_1.name);
    constructor(notificationsService) {
        this.notificationsService = notificationsService;
    }
    handleFollowed(event) {
        return this.run(FollowEvents.Followed, () => this.notificationsService.upsert({
            type: NotificationType.FOLLOW,
            recipientId: event.followingId,
            actorId: event.followerId,
        }));
    }
    handleUnfollowed(event) {
        return this.run(FollowEvents.Unfollowed, () => this.notificationsService.withdraw({
            type: NotificationType.FOLLOW,
            recipientId: event.followingId,
            actorId: event.followerId,
        }));
    }
    handleRated(event) {
        return this.run(PostEvents.Rated, () => this.notificationsService.upsert({
            type: NotificationType.RATING,
            recipientId: event.recipientId,
            actorId: event.actorId,
            postId: event.postId,
        }));
    }
    handleUnrated(event) {
        return this.run(PostEvents.Unrated, () => this.notificationsService.withdraw({
            type: NotificationType.RATING,
            postId: event.postId,
            actorId: event.actorId,
        }));
    }
    handleCommentCreated(event) {
        return this.run(PostEvents.CommentCreated, () => this.notificationsService.upsert({
            type: NotificationType.COMMENT,
            recipientId: event.recipientId,
            actorId: event.actorId,
            postId: event.postId,
            commentId: event.commentId,
        }));
    }
    handleCommentDeleted(event) {
        return this.run(PostEvents.CommentDeleted, () => this.notificationsService.withdraw({
            type: NotificationType.COMMENT,
            commentId: event.commentId,
        }));
    }
    handlePostDeleted(event) {
        return this.run(PostEvents.Deleted, () => this.notificationsService.withdrawForPost(event.postId));
    }
    async run(event, handle) {
        try {
            await handle();
        }
        catch (error) {
            this.logger.error(`Handling ${event} failed`, error instanceof Error ? error.stack : String(error));
        }
    }
};
__decorate([
    OnEvent(FollowEvents.Followed, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsListener.prototype, "handleFollowed", null);
__decorate([
    OnEvent(FollowEvents.Unfollowed, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsListener.prototype, "handleUnfollowed", null);
__decorate([
    OnEvent(PostEvents.Rated, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsListener.prototype, "handleRated", null);
__decorate([
    OnEvent(PostEvents.Unrated, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsListener.prototype, "handleUnrated", null);
__decorate([
    OnEvent(PostEvents.CommentCreated, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsListener.prototype, "handleCommentCreated", null);
__decorate([
    OnEvent(PostEvents.CommentDeleted, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsListener.prototype, "handleCommentDeleted", null);
__decorate([
    OnEvent(PostEvents.Deleted, { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsListener.prototype, "handlePostDeleted", null);
NotificationsListener = NotificationsListener_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [NotificationsService])
], NotificationsListener);
export { NotificationsListener };
//# sourceMappingURL=notifications.listener.js.map