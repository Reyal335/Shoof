import { NotificationsService } from "./notifications.service.js";
import { ListNotificationsQueryDto } from "./dto/list-notifications.query.js";
import { MarkAllReadDto, SetReadDto } from "./dto/set-read.dto.js";
import type { AuthUser } from "../auth/auth.types.js";
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(user: AuthUser, query: ListNotificationsQueryDto): Promise<import("./notifications.service.js").NotificationPage>;
    unreadCount(user: AuthUser): Promise<{
        count: number;
    }>;
    setRead(id: string, user: AuthUser, dto: SetReadDto): Promise<void>;
    markAllRead(user: AuthUser, dto: MarkAllReadDto): Promise<void>;
}
