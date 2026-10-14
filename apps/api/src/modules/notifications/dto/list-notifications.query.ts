import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const NOTIFICATIONS_PAGE_DEFAULT = 20;
export const NOTIFICATIONS_PAGE_MAX = 50;

export enum NotifFilter {
    UNREAD = "unread",
    ALL = "all"
}

export class ListNotificationsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(NOTIFICATIONS_PAGE_MAX)
    limit: number = NOTIFICATIONS_PAGE_DEFAULT;

    // The Unread tab. All is the default, as on the web page.
    @IsOptional()
    @IsEnum(NotifFilter)
    filter: NotifFilter = NotifFilter.ALL;

    // Exactly the nextCursor of the previous page; leave out for the first page
    @IsOptional()
    @IsString()
    @MaxLength(200)
    cursor?: string;
}
