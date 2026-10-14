// What the posts module announces after a write commits. Other modules (notifications today) listen with
// @OnEvent(PostEvents.X); posts never imports them, so the dependency only points one way.
export const PostEvents = {
  Rated: 'post.rated',
  Unrated: 'post.unrated',
  Deleted: 'post.deleted',
  CommentCreated: 'comment.created',
  CommentDeleted: 'comment.deleted',
} as const;

/** A rating was added or changed. recipientId is the post's creator. */
export interface PostRatedEvent {
  postId: string;
  actorId: string;
  recipientId: string;
}

/** The caller's rating was removed (or there was none: unrate is idempotent). */
export interface PostUnratedEvent {
  postId: string;
  actorId: string;
}

/** The post and, by cascade, its comments and ratings are gone. */
export interface PostDeletedEvent {
  postId: string;
}

/** Not sent for a comment on your own post. recipientId is the post's creator. */
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
