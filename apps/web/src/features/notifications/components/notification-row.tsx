"use client";

import Link from "next/link";
import { useRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import { flushSync } from "react-dom";
import { UserFollowButton } from "@/features/follows/components/user-follow-button";
import { profileHref } from "@/features/posts/paths";
import { timeAgo } from "@/lib/dates";
import { pick, seedOf } from "@/lib/stand-ins";
import type { NotificationType, NotificationView } from "../types";

const TYPE_WORD: Record<NotificationType, string> = {
  comment: "Comment",
  rating: "Rating",
  follow: "Follow",
};

const TYPE_ICON: Record<NotificationType, ReactNode> = {
  comment: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" /></svg>,
  rating: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" /></svg>,
  follow: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><circle cx="10" cy="8" r="3.5" /><path d="M3.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" /></svg>,
};

const AVATAR_COLORS = ["#6b7ba8", "#3b4f86", "#dba40c", "#101b33"];

/** After `row` left the filter: focus the next shown row's mark button (else the previous one, else Mark all). */
function focusNextMark(row: HTMLElement) {
  const rows = Array.from(row.closest(".panel")?.querySelectorAll<HTMLElement>(".note") ?? []);
  const at = rows.indexOf(row);
  const shown = (other: HTMLElement) => other !== row && other.isConnected;
  const next = rows.slice(at + 1).find(shown) ?? rows.slice(0, at).reverse().find(shown);
  (next?.querySelector<HTMLElement>(".mark") ?? document.getElementById("mark-all"))?.focus();
}

type Props = {
  note: NotificationView;
  /** Where the post links go: the recipient's own post page. */
  postHref: (postId: string) => string;
  /** Whether marking it read takes it off the current tab (Unread). */
  leavesOnRead: boolean;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  announce: (message: string) => void;
};

/** One notification: who did what, the comment if there is one, the follow-back or reply action, and mark read/unread. */
export function NotificationRow({ note, postHref, leavesOnRead, markRead, markUnread, announce }: Props) {
  const row = useRef<HTMLLIElement>(null);
  const unread = !note.read;
  const label = unread ? "Mark as read" : "Mark as unread";
  const actor = <Link href={profileHref(note.actor.username)}>{note.actor.displayName}</Link>;
  const site = note.post && <Link className="site" href={postHref(note.post.id)}>{note.post.caption}</Link>;

  function toggle() {
    const element = row.current;
    if (unread && leavesOnRead && element) focusNextMark(element);
    flushSync(() => (unread ? markRead(note.id) : markUnread(note.id)));
    announce(unread ? "Marked as read." : "Marked as unread.");
  }

  // Opening anything in a notification (actor, post, Reply, ...) counts as reading it
  function openLink(event: MouseEvent<HTMLDivElement>) {
    if (unread && event.target instanceof Element && event.target.closest("a")) markRead(note.id);
  }

  let sentence: ReactNode;
  let actions: ReactNode = null;
  switch (note.type) {
    case "comment":
      sentence = <>{actor} commented on {site}</>;
      if (note.post) actions = <Link className="mini" href={`${postHref(note.post.id)}#h-comments`}>Reply</Link>;
      break;
    case "rating":
      sentence = <>{actor} rated {site}</>;
      if (note.post) actions = <Link className="mini" href={`${postHref(note.post.id)}#h-ratings`}>See ratings</Link>;
      break;
    case "follow":
      sentence = <>{actor} started following you</>;
      actions = <UserFollowButton className="mini yellow followback" userId={note.actor.id} username={note.actor.username} labels={{ off: "Follow back", on: "Following" }} />;
      break;
  }

  return (
    <li ref={row} className={unread ? "note unread" : "note"}>
      <span className="dot" aria-hidden="true" />
      <span className="who" style={{ background: pick(seedOf(note.actor.id), AVATAR_COLORS) }} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- avatars can sit on any https host */}
        {note.actor.avatarUrl && <img className="who-img" src={note.actor.avatarUrl} alt="" />}
        <span className={`ic ${note.type}`}>{TYPE_ICON[note.type]}</span>
      </span>
      <div className="ntext" onClickCapture={openLink}>
        <p>{sentence}</p>
        {note.comment && <blockquote className="quote">{note.comment.content}</blockquote>}
        <div className="meta">
          <span>{TYPE_WORD[note.type]}</span>
          <time dateTime={note.createdAt}>{timeAgo(note.createdAt)}</time>
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
