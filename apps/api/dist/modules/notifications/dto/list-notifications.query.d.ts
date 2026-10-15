export declare const NOTIFICATIONS_PAGE_DEFAULT = 20;
export declare const NOTIFICATIONS_PAGE_MAX = 50;
export declare enum NotifFilter {
    UNREAD = "unread",
    ALL = "all"
}
export declare class ListNotificationsQueryDto {
    limit: number;
    filter: NotifFilter;
    cursor?: string;
}
