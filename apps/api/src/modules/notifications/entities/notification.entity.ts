import { Check, Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

// What happened. One per thing a user can do to another today; add a value only with the feature that sends it.
// The web settings' notify toggles (follows, comments, ...) map onto these.
export enum NotificationType {
    FOLLOW = 'follow', // actor followed the recipient
    COMMENT = 'comment', // actor commented on the recipient's post
    RATING = 'rating' // actor rated the recipient's post
}

/**
 * "Something happened that involves you." Owned by the notifications module. Holds ids only, no relation into the
 * users, posts or follows tables, so the module can move out later; the reader asks those modules for names,
 * captions and avatars, and drops rows whose post or comment no longer exists.
 *
 * The checks pin each type's shape (a follow names no post, a comment names its post and comment).
 * The partial unique indexes make sending idempotent: a re-rating, or an unfollow and follow again, updates the one
 * existing row (INSERT ... ON CONFLICT) instead of stacking duplicates.
 */
@Entity('notifications')
@Check(`"actorId" <> "recipientId"`)
@Check(`
    ("type" = 'follow' AND "postId" IS NULL AND "commentId" IS NULL) OR
    ("type" = 'comment' AND "postId" IS NOT NULL AND "commentId" IS NOT NULL) OR
    ("type" = 'rating' AND "postId" IS NOT NULL AND "commentId" IS NULL)
`)
// The recipient's list, newest first (Postgres scans the index backwards)
@Index(['recipientId', 'createdAt'])
// The unread badge: only unread rows are indexed, so the count stays cheap as old notifications pile up
@Index('IDX_notifications_unread', ['recipientId'], { where: `"readAt" IS NULL` })
@Index('UQ_notifications_follow', ['recipientId', 'actorId'], { unique: true, where: `"type" = 'follow'` })
@Index('UQ_notifications_rating', ['postId', 'actorId'], { unique: true, where: `"type" = 'rating'` })
@Index('UQ_notifications_comment', ['commentId'], { unique: true, where: `"commentId" IS NOT NULL` })
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string

    // Who sees it
    @Column('uuid')
    recipientId: string

    // Who did it
    @Column('uuid')
    actorId: string

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType

    // The post it is about, for comment and rating
    @Column({ type: 'uuid', nullable: true })
    postId: string | null

    // The comment itself, for comment, so the link can jump to it
    @Column({ type: 'uuid', nullable: true })
    commentId: string | null

    // Null until the recipient reads it
    @Column({ type: 'timestamptz', nullable: true })
    readAt: Date | null

    // The sender sets it again when a repeat (re-rating, re-follow) refreshes the row, so it rises to the top
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date
}
