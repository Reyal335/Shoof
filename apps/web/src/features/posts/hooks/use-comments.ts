"use client";

import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { addComment, deleteComment, listComments } from "../api";
import { postKeys } from "../queries";
import type { Page, PostComment } from "../types";

const PAGE_SIZE = 20;

type Pages = InfiniteData<Page<PostComment>, number>;

/**
 * A post's comments, oldest first (the API's order), with add and delete. A new comment is appended to the loaded
 * list and a deleted one taken out, rather than refetching, so it shows even when later pages aren't loaded yet.
 */
export function useComments(postId: string) {
  const queryClient = useQueryClient();
  const key = postKeys.comments(postId);

  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => listComments(postId, { limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.offset + last.limit < last.total ? last.offset + last.limit : undefined),
  });

  const add = useMutation({
    mutationFn: (content: string) => addComment(postId, content),
    onSuccess: (comment) =>
      queryClient.setQueryData<Pages>(key, (data) => {
        if (!data) return data;
        const pages = data.pages.map((page) => ({ ...page, total: page.total + 1 }));
        const last = pages.length - 1;
        pages[last] = { ...pages[last], items: [...pages[last].items, comment] };
        return { ...data, pages };
      }),
  });

  const remove = useMutation({
    mutationFn: (commentId: string) => deleteComment(postId, commentId),
    onSuccess: (_, commentId) =>
      queryClient.setQueryData<Pages>(key, (data) =>
        data && {
          ...data,
          pages: data.pages.map((page) => ({ ...page, total: page.total - 1, items: page.items.filter((c) => c.id !== commentId) })),
        },
      ),
  });

  return {
    comments: query.data?.pages.flatMap((page) => page.items) ?? [],
    total: query.data?.pages.at(-1)?.total ?? 0,
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => query.fetchNextPage(),
    add,
    remove,
  };
}
