"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { recordVisit } from "../api";
import { postKeys } from "../queries";
import type { PostDetail } from "../types";

/**
 * Returns a click handler for links that open the live site: counts the visit on the API (fire and forget; a lost
 * count never blocks the link) and bumps the open post page's number at once.
 */
export function useVisit() {
  const queryClient = useQueryClient();
  return useCallback(
    (postId: string) => {
      queryClient.setQueryData<PostDetail>(postKeys.detail(postId), (post) => post && { ...post, visitCount: post.visitCount + 1 });
      recordVisit(postId).catch(() => {});
    },
    [queryClient],
  );
}
