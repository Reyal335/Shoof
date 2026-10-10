"use client";

import { createContext, useContext, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import { flushSync } from "react-dom";
import type { NotificationId } from "../hooks/use-notifications";

export type NotificationType = "comment" | "rating" | "follow" | "request";

/** What every row needs from the page: the filter, the read state and the status message. */
export type NotificationList = {
  isShown: (id: NotificationId) => boolean;
  isUnread: (id: NotificationId) => boolean;
  markRead: (id: NotificationId) => void;
  markUnread: (id: NotificationId) => void;
  announce: (message: string) => void;
};

export const NotificationListContext = createContext<NotificationList | null>(null);

function useNotificationList() {
  const list = useContext(NotificationListContext);
  if (!list) throw new Error("NotificationRow must be inside NotificationListContext");
  return list;
}

const TYPE_WORD: Record<NotificationType, string> = {
  comment: "Comment",
  rating: "Rating",
  follow: "Follow",
  request: "Collaboration request",
};

const TYPE_ICON: Record<NotificationType, ReactNode> = {
  comment: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" /></svg>,
  rating: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" /></svg>,
  follow: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><circle cx="10" cy="8" r="3.5" /><path d="M3.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" /></svg>,
  request: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></svg>,
};

/** After `row` left the filter: focus the next shown row's mark button (else the previous one, else Mark all). */
function focusNextMark(row: HTMLElement) {
  const rows = Array.from(row.closest(".panel")?.querySelectorAll<HTMLElement>(".note") ?? []);
  const at = rows.indexOf(row);
  const shown = (other: HTMLElement) => !other.hidden && !other.closest(".grp")?.hasAttribute("hidden");
  const next = rows.slice(at + 1).find(shown) ?? rows.slice(0, at).reverse().find(shown);
  (next?.querySelector<HTMLElement>(".mark") ?? document.getElementById("mark-all"))?.focus();
}

type Props = {
  id: NotificationId;
  type: NotificationType;
  /** The actor's avatar colour. */
  avatar: string;
  /** The sentence: actor link, what happened, and the post link. */
  children: ReactNode;
  quote?: string;
  time: { datetime: string; label: string };
  actions?: ReactNode;
};

export function NotificationRow({ id, type, avatar, children, quote, time, actions }: Props) {
  const { isShown, isUnread, markRead, markUnread, announce } = useNotificationList();
  const row = useRef<HTMLLIElement>(null);
  const unread = isUnread(id);
  const label = unread ? "Mark as read" : "Mark as unread";

  function toggle() {
    // Render the change now, so we know whether the row left the current filter (the Unread tab)
    flushSync(() => (unread ? markRead(id) : markUnread(id)));
    announce(unread ? "Marked as read." : "Marked as unread.");
    if (row.current?.hidden) focusNextMark(row.current);
  }

  // Opening anything in a notification (actor, post, Reply, ...) counts as reading it
  function openLink(event: MouseEvent<HTMLDivElement>) {
    if (unread && event.target instanceof Element && event.target.closest("a")) markRead(id);
  }

  return (
    <li ref={row} className={unread ? "note unread" : "note"} hidden={!isShown(id)}>
      <span className="dot" aria-hidden="true" />
      <span className="who" style={{ background: avatar }} aria-hidden="true">
        <span className={`ic ${type}`}>{TYPE_ICON[type]}</span>
      </span>
      <div className="ntext" onClickCapture={openLink}>
        <p>{children}</p>
        {quote && <blockquote className="quote">{quote}</blockquote>}
        <div className="meta">
          <span>{TYPE_WORD[type]}</span>
          <time dateTime={time.datetime}>{time.label}</time>
          <span className="sr">{unread ? ", unread" : ""}</span>
        </div>
        {actions && <div className="nacts">{actions}</div>}
      </div>
      <button type="button" className="mark" aria-label={label} title={label} onClick={toggle}>
        {unread ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /></svg>
        )}
      </button>
    </li>
  );
}
