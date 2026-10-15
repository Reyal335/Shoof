import { Repository } from "typeorm";
import { Notification, NotificationType } from "./entities/notification.entity.js";
import { UsersService } from "../users/users.service.js";
import { PostsService } from "../posts/posts.service.js";
import { type ListNotificationsQueryDto } from "./dto/list-notifications.query.js";
export type NewNotification = {
    type: NotificationType.FOLLOW;
    recipientId: string;
    actorId: string;
} | {
    type: NotificationType.RATING;
    recipientId: string;
    actorId: string;
    postId: string;
} | {
    type: NotificationType.COMMENT;
    recipientId: string;
    actorId: string;
    postId: string;
    commentId: string;
};
export type WithdrawnNotification = {
    type: NotificationType.FOLLOW;
    recipientId: string;
    actorId: string;
} | {
    type: NotificationType.RATING;
    postId: string;
    actorId: string;
} | {
    type: NotificationType.COMMENT;
    commentId: string;
};
export interface NotificationView {
    id: string;
    type: NotificationType;
    read: boolean;
    createdAt: Date;
    actor: {
        id: string;
        username: string;
        displayName: string;
        avatarUrl: string | null;
    };
    post: {
        id: string;
        caption: string;
    } | null;
    comment: {
        id: string;
        content: string;
    } | null;
}
export interface NotificationPage {
    items: NotificationView[];
    nextCursor: string | null;
}
export declare class NotificationsService {
    private readonly notificationRepository;
    private readonly usersService;
    private readonly postsService;
    constructor(notificationRepository: Repository<Notification>, usersService: UsersService, postsService: PostsService);
    upsert(notification: NewNotification): Promise<void>;
    withdraw(notification: WithdrawnNotification): Promise<void>;
    withdrawForPost(postId: string): Promise<void>;
    list(recipientId: string, query: ListNotificationsQueryDto): Promise<NotificationPage>;
    unreadCount(recipientId: string): Promise<number>;
    setRead(id: string, recipientId: string, read: boolean): Promise<void>;
    markAllRead(recipientId: string, upTo?: string): Promise<void>;
    private toViews;
}
