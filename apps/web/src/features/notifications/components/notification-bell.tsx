"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadCount } from "../hooks/use-notifications";
import "./notification-bell.css";

/** The header bell: links to /notifications, with the unread count in its name and in a badge. */
export function NotificationBell() {
  const count = useUnreadCount();
  const current = usePathname() === "/notifications";
  return (
    <Link
      className="bell"
      href="/notifications"
      aria-label={count ? `Notifications, ${count} unread` : "Notifications"}
      aria-current={current ? "page" : undefined}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2.5h-15z" /><path d="M10 21a2.2 2.2 0 0 0 4 0" /></svg>
      <span className="bell-n" aria-hidden="true" hidden={!count}>{count > 9 ? "9+" : count}</span>
    </Link>
  );
}
