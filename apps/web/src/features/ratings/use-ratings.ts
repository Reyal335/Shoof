"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/features/auth/hooks/use-session";
import { postKeys } from "@/features/posts/queries";
import type { PostDetail } from "@/features/posts/types";
import { mockRatingsClient, ratingsClientFor } from "./ratings-api";
import { STAR_VALUES, type RatingDistribution, type RatingStatus, type RatingSummary, type RatingsController, type StarValue } from "./types";

/** Arrow keys fire a change per star; only the last value within this window is sent. */
export const RATE_DEBOUNCE_MS = 350;

export const ratingKeys = {
  summary: (postId: string, viewer: string) => ["ratings", postId, viewer] as const,
};

/** The numbers the server already rendered, shown until the viewer's own summary arrives. */
export type RatingSeed = Pick<RatingSummary, "average" | "count" | "distribution">;

type Action = { kind: "rate"; value: StarValue } | { kind: "remove" };

const EMPTY: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

/** The summary with the viewer's rating replaced (null removes it), recounted and re-averaged from the bars. */
export function withMyRating(summary: RatingSummary, value: StarValue | null): RatingSummary {
  const distribution = { ...summary.distribution };
  if (summary.myRating !== null) distribution[summary.myRating] = Math.max(0, distribution[summary.myRating] - 1);
  if (value !== null) distribution[value]++;
  const count = STAR_VALUES.reduce((total, n) => total + distribution[n], 0);
  const sum = STAR_VALUES.reduce((total, n) => total + n * distribution[n], 0);
  return { ...summary, distribution, count, average: count ? Math.round((sum / count) * 100) / 100 : 0, myRating: value };
}

/**
 * One post's ratings for every component on its page: the summary (with any pick applied at once), the status line,
 * and rate / remove / undo / retry.
 *
 * - A pick is optimistic and debounced: a run of arrow-key presses sends one PUT with the last value.
 * - Each pick bumps a sequence number; an answer to an older one is ignored.
 * - On failure the numbers go back to what the server last confirmed (and are refetched), with "Try again".
 * - Remove keeps the old value, so "Undo" can rate it again until the next rating action.
 * - Signed out or on your own post nothing is ever sent; the server's canRate and reason decide what shows.
 */
export function useRatings(postId: string, seed?: RatingSeed): RatingsController {
  const client = ratingsClientFor(postId);
  const isMock = client === mockRatingsClient;
  const session = useSession();
  const queryClient = useQueryClient();
  const key = ratingKeys.summary(postId, isMock ? "mock" : session.status);

  const query = useQuery({
    queryKey: key,
    queryFn: () => client.getSummary(postId, session.isAuthenticated),
    // Wait for the session, so a signed-in viewer's first answer already carries their own rating
    enabled: isMock || session.status !== "unknown",
  });

  const [optimistic, setOptimistic] = useState<RatingSummary | null>(null);
  const [status, setStatus] = useState<RatingStatus>({ kind: "idle" });
  const [undoValue, setUndoValue] = useState<StarValue | null>(null);
  const seq = useRef(0);
  const pending = useRef<{ timer: ReturnType<typeof setTimeout>; send: () => void } | null>(null);
  const lastAction = useRef<Action | null>(null);

  const confirmed = query.data ?? null;
  const loading = !confirmed && !query.isError;
  const summary: RatingSummary = optimistic ?? confirmed ?? {
    postId,
    average: seed?.average ?? 0,
    count: seed?.count ?? 0,
    distribution: seed?.distribution ?? EMPTY,
    myRating: null,
    canRate: false,
    reason: null,
  };

  // Leaving the page mid-debounce still sends the last pick
  useEffect(
    () => () => {
      const waiting = pending.current;
      if (waiting) {
        clearTimeout(waiting.timer);
        waiting.send();
      }
    },
    [],
  );

  function schedule(action: Action, next: RatingSummary) {
    const mine = ++seq.current;
    lastAction.current = action;
    setOptimistic(next);
    setStatus({ kind: "saving" });

    const send = async () => {
      pending.current = null;
      try {
        const result = action.kind === "rate" ? await client.rate(postId, action.value) : await client.remove(postId);
        if (mine !== seq.current) return;
        queryClient.setQueryData(key, result);
        setOptimistic(null);
        setStatus(action.kind === "rate" ? { kind: "saved", value: action.value } : { kind: "removed" });
        // The post's own copy and every list's card show these numbers too
        queryClient.setQueryData<PostDetail>(postKeys.detail(postId), (post) =>
          post && { ...post, rating: result.average, ratingCount: result.count, ratingDistribution: result.distribution },
        );
        void queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      } catch {
        if (mine !== seq.current) return;
        setOptimistic(null);
        setUndoValue(null);
        setStatus({ kind: "error" });
        // The server may have taken an earlier pick: get its real answer
        void queryClient.invalidateQueries({ queryKey: key });
      }
    };

    if (pending.current) clearTimeout(pending.current.timer);
    pending.current = { timer: setTimeout(() => void send(), RATE_DEBOUNCE_MS), send: () => void send() };
  }

  const rate = (value: StarValue) => {
    if (loading || !summary.canRate) return;
    setUndoValue(null);
    schedule({ kind: "rate", value }, withMyRating(summary, value));
  };

  const remove = () => {
    if (loading || !summary.canRate || summary.myRating === null) return;
    setUndoValue(summary.myRating);
    schedule({ kind: "remove" }, withMyRating(summary, null));
  };

  return {
    postId,
    summary,
    loading,
    saving: status.kind === "saving",
    status,
    canUndo: undoValue !== null && status.kind === "removed",
    rate,
    remove,
    undo: () => {
      if (undoValue !== null) rate(undoValue);
    },
    retry: () => {
      const action = lastAction.current;
      if (action?.kind === "rate") rate(action.value);
      else if (action?.kind === "remove") remove();
    },
  };
}

/** A stable "when did they open the live site" clock for the rate prompt. */
export function useVisitClock() {
  const visitedAt = useRef<number | null>(null);
  const markVisited = useCallback(() => {
    visitedAt.current = Date.now();
  }, []);
  const getVisitedAt = useCallback(() => visitedAt.current, []);
  return { markVisited, getVisitedAt };
}
