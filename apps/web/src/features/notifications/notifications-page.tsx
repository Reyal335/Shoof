"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { FollowButton } from "@/components/follow-button";
import { Header } from "@/components/header";
import { NotificationListContext, NotificationRow } from "./components/notification-row";
import type { NotificationList, NotificationType } from "./components/notification-row";
import { NOTIFICATION_IDS, useNotifications } from "./hooks/use-notifications";
import type { NotificationId } from "./hooks/use-notifications";
import "./notifications.css";

type Group = "Today" | "This week" | "Earlier";
type Filter = "all" | "unread" | NotificationType;

// The rows below are literal JSX (front end only, no notifications API yet). This index of each row's type and
// group drives the tab counts and hides a group the filter leaves empty; keep it in step with the rows.
const NOTES: Record<NotificationId, { type: NotificationType; group: Group }> = {
  n1: { type: "comment", group: "Today" },
  n2: { type: "rating", group: "Today" },
  n3: { type: "follow", group: "Today" },
  n4: { type: "request", group: "This week" },
  n5: { type: "comment", group: "This week" },
  n6: { type: "rating", group: "This week" },
  n7: { type: "follow", group: "Earlier" },
  n8: { type: "comment", group: "Earlier" },
};

const TABS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "comment", label: "Comments" },
  { value: "rating", label: "Ratings" },
  { value: "follow", label: "Follows" },
  { value: "request", label: "Requests" },
];

const POST = "/post/demo";
const ARCADE = "A tiny arcade game about a blob that can't stop bouncing";
const OTHER_SITE = "[Caption of another site]";

function GroupSection({ label, shown, children }: { label: Group; shown: (id: NotificationId) => boolean; children: ReactNode }) {
  const id = `g-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const empty = !NOTIFICATION_IDS.some((note) => NOTES[note].group === label && shown(note));
  return (
    <section className="grp" aria-labelledby={id} hidden={empty}>
      <h2 id={id}>{label}</h2>
      <ol className="list">{children}</ol>
    </section>
  );
}

// From design/Notifications.html. Read state lives in this browser (useNotifications) and is shared with the bell.
export function NotificationsPage() {
  const { unreadCount, isUnread, markRead, markUnread, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const [live, setLive] = useState("");

  const matches = (id: NotificationId, by: Filter) =>
    by === "all" || (by === "unread" ? isUnread(id) : NOTES[id].type === by);
  const isShown = (id: NotificationId) => matches(id, filter);
  const shownCount = NOTIFICATION_IDS.filter(isShown).length;
  const list: NotificationList = { isShown, isUnread, markRead, markUnread, announce: setLive };

  function markAll() {
    if (!unreadCount) return;
    markAllRead();
    setLive("All notifications marked as read.");
  }

  // Roving tabindex: Left/Right move focus to the previous/next tab, wrapping at the ends, and select it
  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + TABS.length) % TABS.length;
    document.getElementById(`tab-${TABS[next].value}`)?.focus();
    setFilter(TABS[next].value);
  }

  return (
    <>
      <Header />
      <main className="wrap">
        <div className="nhead">
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount ? <>You have <b>{unreadCount}</b> unread.</> : "You're all caught up."}</p>
          </div>
          <div className="hacts">
            {/* aria-disabled rather than disabled, so focus can land here when the last unread row leaves the Unread tab */}
            <button type="button" className="btn" id="mark-all" aria-disabled={unreadCount === 0} onClick={markAll}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12.5l4.5 4.5L15 8.5M10 16l1 1L21.5 6.5" /></svg> Mark all as read
            </button>
            <Link className="btn quiet" href="/settings#notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg> Notification settings
            </Link>
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="Show">
          {TABS.map((tab, i) => {
            const selected = tab.value === filter;
            return (
              <button
                key={tab.value}
                type="button"
                className="tab"
                role="tab"
                id={`tab-${tab.value}`}
                aria-selected={selected}
                aria-controls="panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setFilter(tab.value)}
                onKeyDown={(event) => moveTab(event, i)}
              >
                {tab.label} <span className="n">{NOTIFICATION_IDS.filter((id) => matches(id, tab.value)).length}</span>
              </button>
            );
          })}
        </div>

        <div className="panel" id="panel" role="tabpanel" aria-labelledby={`tab-${filter}`}>
          <NotificationListContext.Provider value={list}>
            <GroupSection label="Today" shown={isShown}>
              <NotificationRow
                id="n1"
                type="comment"
                avatar="#6b7ba8"
                quote="Level 3 took me a few tries, but it felt fair. The bounce sound is great."
                time={{ datetime: "2026-10-10T19:40", label: "2 hours ago" }}
                actions={<Link className="mini" href={`${POST}#h-comments`}>Reply</Link>}
              >
                <Link href="/profile">[Commenter]</Link> commented on <Link className="site" href={POST}>{ARCADE}</Link>
              </NotificationRow>
              <NotificationRow
                id="n2"
                type="rating"
                avatar="#3b4f86"
                time={{ datetime: "2026-10-10T16:05", label: "5 hours ago" }}
                actions={<Link className="mini" href={`${POST}#h-ratings`}>See ratings</Link>}
              >
                <Link href="/profile">[Name]</Link> and 4 others rated <Link className="site" href={POST}>{ARCADE}</Link>
              </NotificationRow>
              <NotificationRow
                id="n3"
                type="follow"
                avatar="#dba40c"
                time={{ datetime: "2026-10-10T15:12", label: "6 hours ago" }}
                actions={<FollowButton className="mini yellow followback" on="Following" off="Follow back" />}
              >
                <Link href="/profile">[Name]</Link> started following you
              </NotificationRow>
            </GroupSection>

            <GroupSection label="This week" shown={isShown}>
              <NotificationRow
                id="n4"
                type="request"
                avatar="#101b33"
                quote="Looking for someone to help with the art for a jam game next month."
                time={{ datetime: "2026-10-08T11:20", label: "2 days ago" }}
                actions={<Link className="mini" href="/profile">View profile</Link>}
              >
                <Link href="/profile">[Name]</Link> asked to build something with you
              </NotificationRow>
              <NotificationRow
                id="n5"
                type="comment"
                avatar="#6b7ba8"
                quote="Good catch, the grid breaks below 360px. Fixed it."
                time={{ datetime: "2026-10-07T09:02", label: "3 days ago" }}
                actions={<Link className="mini" href={`${POST}#h-comments`}>Reply</Link>}
              >
                <Link href="/profile">[Name]</Link> replied to your comment on <Link className="site" href={POST}>{OTHER_SITE}</Link>
              </NotificationRow>
              <NotificationRow
                id="n6"
                type="rating"
                avatar="#3b4f86"
                time={{ datetime: "2026-10-06T20:45", label: "4 days ago" }}
              >
                <Link href="/profile">[Name]</Link> rated <Link className="site" href={POST}>{OTHER_SITE}</Link> 5 stars
              </NotificationRow>
            </GroupSection>

            <GroupSection label="Earlier" shown={isShown}>
              <NotificationRow
                id="n7"
                type="follow"
                avatar="#6b7ba8"
                time={{ datetime: "2026-09-28T13:30", label: "Sep 28" }}
              >
                <Link href="/profile">[Name]</Link> started following you
              </NotificationRow>
              <NotificationRow
                id="n8"
                type="comment"
                avatar="#3b4f86"
                quote="Works well on my phone. Would love a way to restart a level without going back to the menu."
                time={{ datetime: "2026-09-24T18:10", label: "Sep 24" }}
                actions={<Link className="mini" href={`${POST}#h-comments`}>Reply</Link>}
              >
                <Link href="/profile">[Commenter]</Link> commented on <Link className="site" href={POST}>{ARCADE}</Link>
              </NotificationRow>
            </GroupSection>
          </NotificationListContext.Provider>

          {shownCount === 0 ? (
            <div className="empty">
              <Image src="/shoof-blob-navy.svg" alt="" width={72} height={71} />
              <h2>{filter === "unread" ? "You’re all caught up" : "Nothing here yet"}</h2>
              <p>{filter === "unread" ? "Nothing new since you last looked." : "When you get one, it will show up here."}</p>
            </div>
          ) : (
            <p className="end">That&apos;s everything from the last 30 days.</p>
          )}
        </div>
        <p className="sr" role="status" aria-live="polite">{live}</p>
      </main>
    </>
  );
}
