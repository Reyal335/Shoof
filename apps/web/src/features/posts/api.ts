import { request } from "@/lib/api-client";
import { authedRequest } from "@/features/auth/authed-request";
import type {
  CreatePostInput,
  Page,
  Post,
  PostComment,
  PostDetail,
  PostCategory,
  PostFilters,
  PostScope,
  RatingSummary,
  SkillUsage,
  StarValue,
} from "./types";

/** "?a=1&b=x", leaving out unset values. */
function query(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

const postPath = (id: string) => `/posts/${encodeURIComponent(id)}`;

export type PageParams = { limit: number; offset: number };

/** GET /posts, GET /feed/following or GET /users/:username/posts, with the same filters and paging. */
export function listPosts(scope: PostScope, filters: PostFilters, page: PageParams): Promise<Page<Post>> {
  const qs = query({ ...filters, ...page });
  switch (scope.kind) {
    case "all":
      return request<Page<Post>>(`/posts${qs}`);
    case "following":
      return authedRequest<Page<Post>>(`/feed/following${qs}`);
    case "user":
      return request<Page<Post>>(`/users/${encodeURIComponent(scope.username)}/posts${qs}`);
  }
}

export const getPost = (id: string) => request<PostDetail>(postPath(id));

/** The skills a section's posts are built with most, for its filter chips. */
export const getTopSkills = (category?: PostCategory, limit?: number) =>
  request<SkillUsage[]>(`/posts/skills${query({ category, limit })}`);

export const createPost = (input: CreatePostInput) => authedRequest<Post>("/posts", { method: "POST", body: input });

/** Counted when someone opens the live site from Shoof. Public: signed-out visits count too. */
export const recordVisit = (id: string) => request<void>(`${postPath(id)}/visits`, { method: "POST" });

// ---------- ratings ----------

export const getMyRating = (id: string) => authedRequest<RatingSummary>(`${postPath(id)}/rating`);
export const ratePost = (id: string, value: StarValue) =>
  authedRequest<RatingSummary>(`${postPath(id)}/rating`, { method: "PUT", body: { value } });
export const unratePost = (id: string) => authedRequest<RatingSummary>(`${postPath(id)}/rating`, { method: "DELETE" });

// ---------- comments ----------

export const listComments = (id: string, page: PageParams) =>
  request<Page<PostComment>>(`${postPath(id)}/comments${query(page)}`);
export const addComment = (id: string, content: string) =>
  authedRequest<PostComment>(`${postPath(id)}/comments`, { method: "POST", body: { content } });
export const deleteComment = (id: string, commentId: string) =>
  authedRequest<void>(`${postPath(id)}/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" });
