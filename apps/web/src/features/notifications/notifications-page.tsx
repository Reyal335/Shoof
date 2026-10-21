"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Header } from "@/components/header";
import { authedRequest } from "@/features/auth/authed-request";
import type { Account } from "@/features/auth/api";
import { useSession } from "@/features/auth/hooks/use-session";
import { NotificationRow } from "./components/notification-row";
import { useNotifications, useUnreadCount } from "./hooks/use-notifications";
import type { NotificationType, NotificationView } from "./types";
import "./notifications.css";

type Group = "Today" | "This week" | "Earlier";
type Tab = "all" | "unread" | NotificationType;

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "comment", label: "Comments" },
  { value: "rating", label: "Ratings" },
  { value: "follow", label: "Follows" },
];

const GROUPS: Group[] = ["Today", "This week", "Earlier"];

function groupOf(createdAt: string, now: Date): Group {
  const then = new Date(createdAt);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (then.getTime() >= startOfToday) return "Today";
  if (then.getTime() >= startOfToday - 6 * 24 * 60 * 60 * 1000) return "This week";
  return "Earlier";
}

/** The signed-in user's username, for links to their own posts (every comment and rating is about one). */
function useMyUsername() {
  const session = useSession();
  const { data } = useQuery({
    queryKey: ["account", "me"],
    queryFn: () => authedRequest<Account>("/users/me"),
    enabled: session.isAuthenticated,
    staleTime: 5 * 60_000,
  });
  return data?.username;
}

// From design/Notifications.html, on GET /api/v1/notifications. Unread state lives on the server and is shared with
// the header bell; collaboration requests wait for a messaging feature.
export function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [live, setLive] = useState("");
  const unreadCount = useUnreadCount();
  const list = useNotifications(tab === "unread" ? "unread" : "all");
  const username = useMyUsername();

  // A post link that skips the /post/:id redirect once the username is known
  const postHref = (postId: string) => (username ? `/@${username}/posts/${postId}` : `/post/${postId}`);

  const matches = (note: NotificationView, by: Tab) =>
    by === "all" || (by === "unread" ? !note.read : note.type === by);
  const shown = list.items.filter((note) => matches(note, tab));
  const now = new Date();

  function markAll() {
    if (!unreadCount) return;
    // The newest one on screen: anything that arrives after it stays unread
    const newest = list.items.reduce<string | undefined>((max, note) => (!max || note.createdAt > max ? note.createdAt : max), undefined);
    list.markAllRead(newest);
    setLive("All notifications marked as read.");
  }

  // Roving tabindex: Left/Right move focus to the previous/next tab, wrapping at the ends, and select it
  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + TABS.length) % TABS.length;
    document.getElementById(`tab-${TABS[next].value}`)?.focus();
    setTab(TABS[next].value);
  }

  if (list.status === "anonymous") {
    return (
      <>
        <Header />
        <main className="wrap">
          <div className="panel">
            <div className="empty">
              <Image src="/shoof-blob-navy.svg" alt="" width={72} height={71} />
              <h1>Notifications</h1>
              <p><Link href="/login?next=/notifications">Log in</Link> to see who followed you, rated your sites and commented on them.</p>
            </div>
          </div>
        </main>
      </>
    );
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
          {TABS.map((t, i) => {
            const selected = t.value === tab;
            const count = t.value === "unread" ? unreadCount : t.value === "all" ? null : list.items.filter((note) => matches(note, t.value)).length;
            return (
              <button
                key={t.value}
                type="button"
                className="tab"
                role="tab"
                id={`tab-${t.value}`}
                aria-selected={selected}
                aria-controls="panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.value)}
                onKeyDown={(event) => moveTab(event, i)}
              >
                {t.label} {count !== null && <span className="n">{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="panel" id="panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {GROUPS.map((group) => {
            const notes = shown.filter((note) => groupOf(note.createdAt, now) === group);
            if (!notes.length) return null;
            const id = `g-${group.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <section className="grp" aria-labelledby={id} key={group}>
                <h2 id={id}>{group}</h2>
                <ol className="list">
                  {notes.map((note) => (
                    <NotificationRow
                      key={note.id}
                      note={note}
                      postHref={postHref}
                      leavesOnRead={tab === "unread"}
                      markRead={list.markRead}
                      markUnread={list.markUnread}
                      announce={setLive}
                    />
                  ))}
                </ol>
              </section>
            );
          })}

          {list.isPending || list.status === "unknown" ? (
            <p className="end" role="status">Loading your notifications…</p>
          ) : list.isError && !list.items.length ? (
            <p className="end" role="alert">We couldn&apos;t load your notifications. <button type="button" className="mini" onClick={() => list.refetch()}>Try again</button></p>
          ) : shown.length === 0 && !list.hasMore ? (
            <div className="empty">
              <Image src="/shoof-blob-navy.svg" alt="" width={72} height={71} />
              <h2>{tab === "unread" ? "You’re all caught up" : "Nothing here yet"}</h2>
              <p>{tab === "unread" ? "Nothing new since you last looked." : "When someone follows you, rates or comments on your sites, it shows up here."}</p>
            </div>
          ) : list.hasMore ? (
            <div className="end">
              <button type="button" className="mini" disabled={list.isLoadingMore} onClick={() => list.loadMore()}>{list.isLoadingMore ? "Loading…" : "Show older"}</button>
            </div>
          ) : (
            <p className="end">That&apos;s everything.</p>
          )}
        </div>
        <p className="sr" role="status" aria-live="polite">{live}</p>
      </main>
    </>
  );
}
