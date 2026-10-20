import type { PostCategory, PostFilters, PostScope } from "./types";

/**
 * TanStack Query keys for posts. Everything sits under ["posts"], so a new post can invalidate every list at once
 * while the post page's own entries (detail, rating, comments) are updated in place.
 */
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (scope: PostScope, filters: PostFilters, pageSize: number) => [...postKeys.lists(), scope, filters, pageSize] as const,
  topSkills: (category?: PostCategory) => [...postKeys.all, "top-skills", category ?? "all"] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
  myRating: (id: string) => [...postKeys.all, "my-rating", id] as const,
  comments: (id: string) => [...postKeys.all, "comments", id] as const,
};
