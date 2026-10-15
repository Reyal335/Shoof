import { NotificationsService } from "../notifications.service.js";
import { type CommentCreatedEvent, type CommentDeletedEvent, type PostDeletedEvent, type PostRatedEvent, type PostUnratedEvent } from "../../posts/posts.events.js";
import { type UserFollowedEvent, type UserUnfollowedEvent } from "../../follows/follows.events.js";
export declare class NotificationsListener {
    private readonly notificationsService;
    private readonly logger;
    constructor(notificationsService: NotificationsService);
    handleFollowed(event: UserFollowedEvent): Promise<void>;
    handleUnfollowed(event: UserUnfollowedEvent): Promise<void>;
    handleRated(event: PostRatedEvent): Promise<void>;
    handleUnrated(event: PostUnratedEvent): Promise<void>;
    handleCommentCreated(event: CommentCreatedEvent): Promise<void>;
    handleCommentDeleted(event: CommentDeletedEvent): Promise<void>;
    handlePostDeleted(event: PostDeletedEvent): Promise<void>;
    private run;
}
