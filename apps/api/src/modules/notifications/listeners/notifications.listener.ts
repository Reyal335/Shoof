import { OnEvent } from "@nestjs/event-emitter";
import { Injectable, Logger } from "@nestjs/common";
import { NotificationsService } from "../notifications.service.js";
import { NotificationType } from "../entities/notification.entity.js";
import {
    PostEvents,
    type CommentCreatedEvent,
    type CommentDeletedEvent,
    type PostDeletedEvent,
    type PostRatedEvent,
    type PostUnratedEvent,
} from "../../posts/posts.events.js";
import { FollowEvents, type UserFollowedEvent, type UserUnfollowedEvent } from "../../follows/follows.events.js";

/**
 * Turns what posts and follows announce into notifications. Those modules never import this one.
 *
 * async: the emitter doesn't wait, so the request that caused the event is never slowed or failed by it.
 * Errors are caught and logged here; the emitter's own suppressErrors would drop them silently.
 */
@Injectable()
export class NotificationsListener {
    private readonly logger = new Logger(NotificationsListener.name);

    constructor (
        private readonly notificationsService: NotificationsService
    ) {}

    // ---------- follows ----------

    @OnEvent(FollowEvents.Followed, { async: true })
    handleFollowed(event: UserFollowedEvent) {
        return this.run(FollowEvents.Followed, () => this.notificationsService.upsert({
            type: NotificationType.FOLLOW,
            recipientId: event.followingId,
            actorId: event.followerId,
        }));
    }

    @OnEvent(FollowEvents.Unfollowed, { async: true })
    handleUnfollowed(event: UserUnfollowedEvent) {
        return this.run(FollowEvents.Unfollowed, () => this.notificationsService.withdraw({
            type: NotificationType.FOLLOW,
            recipientId: event.followingId,
            actorId: event.followerId,
        }));
    }

    // ---------- ratings ----------

    @OnEvent(PostEvents.Rated, { async: true })
    handleRated(event: PostRatedEvent) {
        return this.run(PostEvents.Rated, () => this.notificationsService.upsert({
            type: NotificationType.RATING,
            recipientId: event.recipientId,
            actorId: event.actorId,
            postId: event.postId,
        }));
    }

    @OnEvent(PostEvents.Unrated, { async: true })
    handleUnrated(event: PostUnratedEvent) {
        return this.run(PostEvents.Unrated, () => this.notificationsService.withdraw({
            type: NotificationType.RATING,
            postId: event.postId,
            actorId: event.actorId,
        }));
    }

    // ---------- comments ----------

    @OnEvent(PostEvents.CommentCreated, { async: true })
    handleCommentCreated(event: CommentCreatedEvent) {
        return this.run(PostEvents.CommentCreated, () => this.notificationsService.upsert({
            type: NotificationType.COMMENT,
            recipientId: event.recipientId,
            actorId: event.actorId,
            postId: event.postId,
            commentId: event.commentId,
        }));
    }

    @OnEvent(PostEvents.CommentDeleted, { async: true })
    handleCommentDeleted(event: CommentDeletedEvent) {
        return this.run(PostEvents.CommentDeleted, () => this.notificationsService.withdraw({
            type: NotificationType.COMMENT,
            commentId: event.commentId,
        }));
    }

    // ---------- posts ----------

    @OnEvent(PostEvents.Deleted, { async: true })
    handlePostDeleted(event: PostDeletedEvent) {
        return this.run(PostEvents.Deleted, () => this.notificationsService.withdrawForPost(event.postId));
    }

    // A lost notification is logged, never rethrown: there is no request left to fail
    private async run(event: string, handle: () => Promise<void>): Promise<void> {
        try {
            await handle();
        } catch (error) {
            this.logger.error(`Handling ${event} failed`, error instanceof Error ? error.stack : String(error));
        }
    }
}
