import { authedRequest } from "@/features/auth/authed-request";
import type { NotificationFilter, NotificationPage } from "./types";

// The signed-in user's own notifications. Every route needs the access token.

export const PAGE_SIZE = 30;

export function listNotifications(filter: NotificationFilter, cursor?: string) {
  const params = new URLSearchParams({ filter, limit: String(PAGE_SIZE) });
  if (cursor) params.set("cursor", cursor);
  return authedRequest<NotificationPage>(`/notifications?${params}`);
}

export const getUnreadCount = () => authedRequest<{ count: number }>("/notifications/unread-count");

export const setNotificationRead = (id: string, read: boolean) =>
  authedRequest<void>(`/notifications/${encodeURIComponent(id)}`, { method: "PATCH", body: { read } });

/** `upTo` is the createdAt of the newest notification on screen: one that arrived after it stays unread. */
export const markAllNotificationsRead = (upTo?: string) =>
  authedRequest<void>("/notifications/read-all", { method: "POST", body: upTo ? { upTo } : {} });
