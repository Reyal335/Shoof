"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/features/auth/hooks/use-session";
import { getSessionUserId } from "@/features/auth/session";
import { ApiError, NetworkError } from "@/lib/api-client";
import { followUser, getFollowStatus, unfollowUser } from "../api";

export type FollowState =
  | { status: "loading" }
  | { status: "signed-out" }
  /** The viewer is looking at their own profile: there is nothing to follow. */
  | { status: "self" }
  /** The starting state couldn't be loaded. */
  | { status: "error" }
  | { status: "ready"; following: boolean };

// Tagged with the user it belongs to, so moving between profiles never shows the previous one's state
type Loaded = { userId: string; following: boolean | null };

/**
 * Whether the signed-in user follows `userId`, and a toggle that flips it. The toggle is optimistic: the button
 * changes at once and goes back, with an error, if the API refuses.
 */
export function useFollow(userId: string) {
  const session = useSession();
  const isSelf = session.status === "authenticated" && getSessionUserId() === userId;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session.status !== "authenticated" || isSelf) return;
    let current = true;
    getFollowStatus(userId).then(
      ({ following }) => current && setLoaded({ userId, following }),
      () => current && setLoaded({ userId, following: null }),
    );
    return () => {
      current = false;
    };
  }, [session.status, isSelf, userId, attempt]);

  const state: FollowState = (() => {
    if (session.status === "anonymous") return { status: "signed-out" };
    if (isSelf) return { status: "self" };
    if (!loaded || loaded.userId !== userId) return { status: "loading" };
    if (loaded.following === null) return { status: "error" };
    return { status: "ready", following: loaded.following };
  })();

  async function toggle() {
    if (state.status !== "ready" || isPending) return;
    const next = !state.following;
    setIsPending(true);
    setError(null);
    setLoaded({ userId, following: next });
    try {
      await (next ? followUser(userId) : unfollowUser(userId));
    } catch (err) {
      setLoaded({ userId, following: !next });
      setError(describeError(err, next));
    } finally {
      setIsPending(false);
    }
  }

  const reload = useCallback(() => {
    setLoaded(null);
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return { state, toggle, reload, isPending, error };
}

function describeError(err: unknown, following: boolean): string {
  if (err instanceof NetworkError) {
    return "We couldn't reach Shoof. Check your connection and try again.";
  }
  if (err instanceof ApiError) {
    switch (err.status) {
      case 401:
        return `Your session ended. Log in again to ${following ? "follow" : "unfollow"}.`;
      case 429:
        return "Too many tries in a row. Wait a moment, then try again.";
    }
  }
  return `Couldn't ${following ? "follow" : "unfollow"} right now. Please try again.`;
}
