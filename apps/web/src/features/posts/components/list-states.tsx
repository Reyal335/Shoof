"use client";

import type { ReactNode } from "react";
import type { PostList } from "../hooks/use-post-list";

/** "Show more" under a paged list. Renders nothing once the last page is in. */
export function MoreButton({ list, label = "Show more" }: { list: PostList; label?: string }) {
  if (!list.hasMore) return null;
  return (
    <div className="more-row">
      <button type="button" className="more-btn" disabled={list.isLoadingMore} aria-busy={list.isLoadingMore} onClick={() => list.loadMore()}>
        {list.isLoadingMore ? "Loading…" : label}
      </button>
    </div>
  );
}

/**
 * What a list shows instead of cards: loading, a failed load (with Try again) or `empty`. Returns null when there are
 * posts to show. `className` is the page's own empty-state class.
 */
export function ListStatus({ list, className, empty }: { list: PostList; className: string; empty: ReactNode }) {
  if (list.isPending) {
    return <div className={className} role="status">Loading…</div>;
  }
  if (list.isError && !list.posts.length) {
    return (
      <div className={className} role="alert">
        We couldn&apos;t load these right now.{" "}
        <button type="button" className="more-btn" onClick={() => list.refetch()}>Try again</button>
      </div>
    );
  }
  if (!list.posts.length) {
    return <div className={className}>{empty}</div>;
  }
  return null;
}
