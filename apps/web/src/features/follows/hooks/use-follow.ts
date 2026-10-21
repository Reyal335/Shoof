"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/hooks/use-session";
import { getSessionUserId } from "@/features/auth/session";
import { describeError } from "@/lib/describe-error";
import { followUser, getFollowStatus, unfollowUser, type FollowStatus } from "../api";
import { followKeys } from "../queries";

export type FollowState =
  | { status: "loading" }
  | { status: "signed-out" }
  /** The viewer is looking at their own profile: there is nothing to follow. */
  | { status: "self" }
  /** The starting state couldn't be loaded. */
  | { status: "error" }
  | { status: "ready"; following: boolean };

/**
 * Whether the signed-in user follows `userId`, and a toggle that flips it. The toggle is optimistic: the button
 * changes at once and goes back, with an error, if the API refuses. Every follow button for the same user shares
 * one cache entry, and the profile counts refetch after each change.
 */
export function useFollow(userId: string) {
  const session = useSession();
  const queryClient = useQueryClient();
  const isSelf = session.isAuthenticated && getSessionUserId() === userId;
  const key = followKeys.status(userId);

  const status = useQuery({
    queryKey: key,
    queryFn: () => getFollowStatus(userId),
    enabled: session.isAuthenticated && !isSelf,
  });

  const mutation = useMutation({
    mutationFn: (follow: boolean) => (follow ? followUser(userId) : unfollowUser(userId)),
    onMutate: async (follow) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FollowStatus>(key);
      queryClient.setQueryData<FollowStatus>(key, { following: follow });
      return { previous };
    },
    onError: (_error, _follow, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: followKeys.counts() }),
  });

  const state: FollowState = (() => {
    if (session.status === "anonymous") return { status: "signed-out" };
    if (isSelf) return { status: "self" };
    if (status.isError) return { status: "error" };
    if (!status.data) return { status: "loading" };
    return { status: "ready", following: status.data.following };
  })();

  function toggle() {
    if (state.status !== "ready" || mutation.isPending) return;
    mutation.mutate(!state.following);
  }

  const following = mutation.variables ?? true;
  return {
    state,
    toggle,
    reload: () => status.refetch(),
    isPending: mutation.isPending,
    error: mutation.error ? describeError(mutation.error, following ? "follow" : "unfollow") : null,
  };
}
