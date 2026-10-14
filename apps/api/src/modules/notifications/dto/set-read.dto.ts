import { IsBoolean, IsISO8601, IsOptional } from 'class-validator';

/** PATCH /notifications/:id */
export class SetReadDto {
    @IsBoolean()
    read: boolean;
}

/** POST /notifications/read-all */
export class MarkAllReadDto {
    // The createdAt of the newest notification the user had on screen. Anything newer stays unread, so
    // "Mark all as read" never hides one they haven't seen. Left out: everything.
    @IsOptional()
    @IsISO8601({ strict: true })
    upTo?: string;
}
