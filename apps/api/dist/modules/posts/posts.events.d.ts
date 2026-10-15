export declare const PostEvents: {
    readonly Rated: "post.rated";
    readonly Unrated: "post.unrated";
    readonly Deleted: "post.deleted";
    readonly CommentCreated: "comment.created";
    readonly CommentDeleted: "comment.deleted";
};
export interface PostRatedEvent {
    postId: string;
    actorId: string;
    recipientId: string;
}
export interface PostUnratedEvent {
    postId: string;
    actorId: string;
}
export interface PostDeletedEvent {
    postId: string;
}
export interface CommentCreatedEvent {
    postId: string;
    commentId: string;
    actorId: string;
    recipientId: string;
}
export interface CommentDeletedEvent {
    postId: string;
    commentId: string;
}
