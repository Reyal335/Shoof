"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../api";
import { postKeys } from "../queries";

/** POST /posts. On success every list (feed, sections, profiles) and the skill chips refetch on their next view. */
export function useCreatePost() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
  return { create: mutation.mutateAsync, isPending: mutation.isPending };
}
