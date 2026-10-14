import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Notification, NotificationType } from "./entities/notification.entity.js";
import { UsersService } from "../users/users.service.js";
import { PostsService } from "../posts/posts.service.js";
import { NotifFilter, type ListNotificationsQueryDto } from "./dto/list-notifications.query.js";

/** Something to tell a user, as the listener describes it. Each type carries exactly the ids its row needs. */
export type NewNotification =
    | { type: NotificationType.FOLLOW; recipientId: string; actorId: string }
    | { type: NotificationType.RATING; recipientId: string; actorId: string; postId: string }
    | { type: NotificationType.COMMENT; recipientId: string; actorId: string; postId: string; commentId: string };

/** The notification an undone action (unfollow, unrate, deleted comment) had sent. */
export type WithdrawnNotification =
    | { type: NotificationType.FOLLOW; recipientId: string; actorId: string }
    | { type: NotificationType.RATING; postId: string; actorId: string }
    | { type: NotificationType.COMMENT; commentId: string };

/** One item of GET /notifications: the row plus the names and text the page shows. */
export interface NotificationView {
    id: string;
    type: NotificationType;
    read: boolean;
    createdAt: Date;
    actor: { id: string; username: string; displayName: string; avatarUrl: string | null };
    // Set for rating and comment
    post: { id: string; caption: string } | null;
    // Set for comment
    comment: { id: string; content: string } | null;
}

export interface NotificationPage {
    items: NotificationView[];
    // Send back as ?cursor= for the next page; null on the last one
    nextCursor: string | null;
}

// A row as list() reads it. cursorAt is createdAt as Postgres text, which keeps the microseconds a JS Date drops,
// so the next page starts exactly after this row.
interface NotificationRow {
    id: string;
    type: NotificationType;
    actorId: string;
    postId: string | null;
    commentId: string | null;
    readAt: Date | null;
    createdAt: Date;
    cursorAt: string;
}

// One per partial unique index on the entity. A repeat follow or rating refreshes the existing row, so it rises to
// the top and is unread again; a comment is only ever sent once.
const ON_CONFLICT: Record<NotificationType, string> = {
    [NotificationType.FOLLOW]: `ON CONFLICT ("recipientId", "actorId") WHERE "type" = 'follow' DO UPDATE SET "createdAt" = now(), "readAt" = NULL`,
    [NotificationType.RATING]: `ON CONFLICT ("postId", "actorId") WHERE "type" = 'rating' DO UPDATE SET "createdAt" = now(), "readAt" = NULL`,
    [NotificationType.COMMENT]: `ON CONFLICT ("commentId") WHERE "commentId" IS NOT NULL DO NOTHING`,
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Postgres' timestamptz text output, e.g. 2026-10-15 01:50:23.123456+00
const PG_TIMESTAMPTZ = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?[+-]\d{2}(:\d{2})?$/;

// Opaque to clients: base64url of "<createdAt text>|<id>", the (createdAt, id) the list is ordered by
function encodeCursor(row: NotificationRow): string {
    return Buffer.from(`${row.cursorAt}|${row.id}`).toString('base64url');
}

function decodeCursor(cursor: string): { at: string; id: string } {
    const [at, id, ...rest] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
    if (rest.length || !at || !id || !PG_TIMESTAMPTZ.test(at) || !UUID.test(id)) {
        throw new BadRequestException('Invalid cursor');
    }
    return { at, id };
}

function uniqueIds(ids: (string | null)[]): string[] {
    return [...new Set(ids.filter((id): id is string => id !== null))];
}

/**
 * "Something happened that involves you." Writes come from NotificationsListener (events from posts and follows),
 * reads from NotificationsController, always scoped to the signed-in recipient.
 *
 * Rows hold ids only; list() asks UsersService and PostsService for names, captions and comment text, and leaves
 * out a row whose actor, post or comment is gone. nextCursor still comes from the last row read, so a dropped row
 * never shifts the next page.
 */
@Injectable()
export class NotificationsService {
    constructor (
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly usersService: UsersService,
        private readonly postsService: PostsService
    ) {}

    // ---------- writes ----------

    /** Creates the notification, or refreshes the one this actor already caused (re-follow, re-rating). */
    async upsert(notification: NewNotification): Promise<void> {
        // Nobody is told about their own actions. The table's check rejects these too.
        if (notification.actorId === notification.recipientId) return;

        // To be added: skip types the recipient turned off in settings, once those are stored server-side

        const postId = notification.type === NotificationType.FOLLOW ? null : notification.postId;
        const commentId = notification.type === NotificationType.COMMENT ? notification.commentId : null;
        await this.notificationRepository.query(
            `INSERT INTO "notifications" ("recipientId", "actorId", "type", "postId", "commentId")
             VALUES ($1, $2, $3, $4, $5)
             ${ON_CONFLICT[notification.type]}`,
            [notification.recipientId, notification.actorId, notification.type, postId, commentId],
        );
    }

    /** Deletes the notification an undone action sent. Nothing to delete is fine. */
    async withdraw(notification: WithdrawnNotification): Promise<void> {
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

    /** A deleted post takes its comment and rating notifications with it, so the unread count stays true. */
    async withdrawForPost(postId: string): Promise<void> {
        await this.notificationRepository.delete({ postId });
    }

    // ---------- reads ----------

    /** Newest first, cursor-paginated. */
    async list(recipientId: string, query: ListNotificationsQueryDto): Promise<NotificationPage> {
        // One extra row tells whether there is a next page, without a COUNT
        const params: unknown[] = [recipientId, query.limit + 1];
        let where = `"recipientId" = $1`;
        if (query.filter === NotifFilter.UNREAD) {
            where += ` AND "readAt" IS NULL`;
        }
        if (query.cursor) {
            const { at, id } = decodeCursor(query.cursor);
            params.push(at, id);
            where += ` AND ("createdAt", "id") < ($3::timestamptz, $4::uuid)`;
        }

        const rows: NotificationRow[] = await this.notificationRepository.query(
            `SELECT "id", "type", "actorId", "postId", "commentId", "readAt", "createdAt", "createdAt"::text AS "cursorAt"
               FROM "notifications"
              WHERE ${where}
              ORDER BY "createdAt" DESC, "id" DESC
              LIMIT $2`,
            params,
        );

        const hasMore = rows.length > query.limit;
        const page = hasMore ? rows.slice(0, query.limit) : rows;
        const last = page.at(-1);
        return {
            items: await this.toViews(page),
            nextCursor: hasMore && last ? encodeCursor(last) : null,
        };
    }

    /** The header bell. Served by the unread-only partial index, so it stays cheap as read rows pile up. */
    unreadCount(recipientId: string): Promise<number> {
        return this.notificationRepository.count({ where: { recipientId, readAt: IsNull() } });
    }

    /**
     * Marks one notification read or unread. Someone else's notification is a 404, same as a missing one, so ids
     * can't be probed. Marking an already-read one read again keeps its original readAt.
     */
    async setRead(id: string, recipientId: string, read: boolean): Promise<void> {
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

    /**
     * Marks every unread notification up to `upTo` (the newest one the user had on screen) as read; one that
     * arrived after stays unread. createdAt is compared at millisecond precision because upTo comes from a JSON
     * date, which has no microseconds.
     */
    async markAllRead(recipientId: string, upTo?: string): Promise<void> {
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

    // ---------- helpers ----------

    // Three batched lookups per page (actors, posts, comments), never one per row
    private async toViews(rows: NotificationRow[]): Promise<NotificationView[]> {
        if (!rows.length) return [];

        const [actors, posts, comments] = await Promise.all([
            this.usersService.findPublicByIds(uniqueIds(rows.map((row) => row.actorId))),
            this.postsService.findSummariesByIds(uniqueIds(rows.map((row) => row.postId))),
            this.postsService.findCommentSummariesByIds(uniqueIds(rows.map((row) => row.commentId))),
        ]);
        const actorById = new Map(actors.map((actor) => [actor.id, actor]));
        const postById = new Map(posts.map((post) => [post.id, post]));
        const commentById = new Map(comments.map((comment) => [comment.id, comment]));

        return rows.flatMap((row): NotificationView[] => {
            const actor = actorById.get(row.actorId);
            const post = row.postId ? postById.get(row.postId) : undefined;
            const comment = row.commentId ? commentById.get(row.commentId) : undefined;
            // Can't be shown: the actor is deactivated, or the post or comment was deleted since
            if (!actor || (row.postId && !post) || (row.commentId && !comment)) return [];

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
}
