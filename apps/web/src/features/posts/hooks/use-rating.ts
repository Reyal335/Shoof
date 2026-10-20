"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/hooks/use-session";
import { getSessionUserId } from "@/features/auth/session";
import { describeError } from "@/lib/describe-error";
import { getMyRating, ratePost, unratePost } from "../api";
import { postKeys } from "../queries";
import type { PostDetail, RatingSummary, StarValue } from "../types";

export type RatingState =
  | { status: "loading" }
  | { status: "signed-out" }
  /** The creator: the API refuses self-ratings. */
  | { status: "own" }
  | { status: "error" }
  | { status: "ready"; value: StarValue | null };

/**
 * The caller's rating of `post`, and rate/clear. Every answer from the API carries the new average, count and
 * distribution, which are written into the post page's cache so the stars and bars move at once.
 */
export function useRating(post: PostDetail) {
  const session = useSession();
  const queryClient = useQueryClient();
  const isOwn = session.isAuthenticated && getSessionUserId() === post.userId;

  const mine = useQuery({
    queryKey: postKeys.myRating(post.id),
    queryFn: () => getMyRating(post.id),
    enabled: session.isAuthenticated && !isOwn,
  });

  function apply(summary: RatingSummary) {
    queryClient.setQueryData(postKeys.myRating(post.id), summary);
    queryClient.setQueryData<PostDetail>(postKeys.detail(post.id), (old) =>
      old && { ...old, rating: summary.rating, ratingCount: summary.ratingCount, ratingDistribution: summary.distribution },
    );
  }

  const rate = useMutation({ mutationFn: (value: StarValue) => ratePost(post.id, value), onSuccess: apply });
  const clear = useMutation({ mutationFn: () => unratePost(post.id), onSuccess: apply });

  const state: RatingState = (() => {
    if (session.status === "anonymous") return { status: "signed-out" };
    if (isOwn) return { status: "own" };
    if (mine.isError) return { status: "error" };
    if (!mine.data) return { status: "loading" };
    return { status: "ready", value: mine.data.value };
  })();

  const failed = rate.error ?? clear.error;
  return {
    state,
    rate: (value: StarValue) => rate.mutate(value),
    clear: () => clear.mutate(),
    retry: () => mine.refetch(),
    isSaving: rate.isPending || clear.isPending,
    error: failed ? describeError(failed, "rate this site") : null,
  };
}
