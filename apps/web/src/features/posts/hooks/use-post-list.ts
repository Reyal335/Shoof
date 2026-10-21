"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listPosts } from "../api";
import { postKeys } from "../queries";
import type { Page, Post, PostFilters, PostScope } from "../types";

type Options = {
  pageSize?: number;
  /** false holds the request, e.g. the Following tab until the session is known. */
  enabled?: boolean;
  /** The first page as the server rendered it, so the list is in the HTML and isn't fetched again on load. */
  initialPage?: Page<Post>;
};

/**
 * A paged list of posts: the feed, a section page or a creator's sites. `loadMore` fetches the next page and
 * `hasMore` says whether there is one. Pages are offset-based, so a post published between two pages can repeat;
 * repeats are dropped.
 */
export function usePostList(scope: PostScope, filters: PostFilters, { pageSize = 12, enabled = true, initialPage }: Options = {}) {
  const query = useInfiniteQuery({
    queryKey: postKeys.list(scope, filters, pageSize),
    queryFn: ({ pageParam }) => listPosts(scope, filters, { limit: pageSize, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.offset + last.limit < last.total ? last.offset + last.limit : undefined),
    initialData: initialPage ? { pages: [initialPage], pageParams: [0] } : undefined,
    enabled,
  });

  const seen = new Set<string>();
  const posts: Post[] = [];
  for (const page of query.data?.pages ?? []) {
    for (const post of page.items) {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        posts.push(post);
      }
    }
  }

  return {
    posts,
    total: query.data?.pages.at(-1)?.total ?? 0,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    hasMore: query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
    loadMore: () => query.fetchNextPage(),
  };
}

export type PostList = ReturnType<typeof usePostList>;
