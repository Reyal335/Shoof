export declare enum NotificationType {
    FOLLOW = "follow",
    COMMENT = "comment",
    RATING = "rating"
}
export declare class Notification {
    id: string;
    recipientId: string;
    actorId: string;
    type: NotificationType;
    postId: string | null;
    commentId: string | null;
    readAt: Date | null;
    createdAt: Date;
}
