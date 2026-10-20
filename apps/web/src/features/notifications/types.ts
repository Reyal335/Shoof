import type { UserSummary } from "@/features/profile/types";

// Mirrors NotificationView and NotificationPage in apps/api/src/modules/notifications/notifications.service.ts.

/** One per thing a user can do to another today. */
export type NotificationType = "follow" | "comment" | "rating";

export interface NotificationView {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actor: UserSummary;
  /** Set for rating and comment: the recipient's own post. */
  post: { id: string; caption: string } | null;
  /** Set for comment. */
  comment: { id: string; content: string } | null;
}

export interface NotificationPage {
  items: NotificationView[];
  /** Send back as ?cursor= for the next page; null on the last one. */
  nextCursor: string | null;
}

/** What the API filters by. The type tabs (Comments, Ratings, Follows) filter the loaded "all" list in the browser. */
export type NotificationFilter = "all" | "unread";
