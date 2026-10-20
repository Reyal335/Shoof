import type { UserSummary } from "@/features/profile/types";
import type { Skill } from "@/features/skills/types";

// Mirrors the views in apps/api/src/modules/posts/posts.service.ts. Dates arrive as ISO strings.

// One per Shoof section page. Values match the backend enum. Do not add or rename them.
export type PostCategory = "games" | "portfolios" | "saas" | "css_ui" | "misc";

export interface PostMedia {
  id: string;
  type: "image" | "video";
  url: string;
  sortOrder: number;
}

/** PostView: what every list and write sends. */
export interface Post {
  id: string;
  userId: string;
  category: PostCategory;
  caption: string;
  description: string;
  link: string;
  repoUrl: string | null;
  /** Average of the ratings, one decimal; 0 with no ratings. */
  rating: number;
  ratingCount: number;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
  /** In display order; the first one is the cover. */
  media: PostMedia[];
  /** Sorted by name. */
  skills: Skill[];
  /** null when the creator's account is deactivated or gone. */
  author: UserSummary | null;
}

export type StarValue = 1 | 2 | 3 | 4 | 5;
export type RatingDistribution = Record<StarValue, number>;

/** GET /posts/:id */
export interface PostDetail extends Post {
  ratingDistribution: RatingDistribution;
}

/** GET|PUT|DELETE /posts/:id/rating */
export interface RatingSummary {
  postId: string;
  rating: number;
  ratingCount: number;
  /** The caller's own rating. */
  value: StarValue | null;
  distribution: RatingDistribution;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: UserSummary | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/** GET /posts/skills: a skill and how many posts (in the section) are built with it. */
export interface SkillUsage {
  skill: Skill;
  count: number;
}

/** new: newest first. top: highest rated first. visited: most visits first. */
export type PostSort = "new" | "top" | "visited";

export interface PostFilters {
  category?: PostCategory;
  /** A skill slug, e.g. "nextjs". */
  skill?: string;
  sort?: PostSort;
}

/** Whose posts a list shows. "following" needs a signed-in user. */
export type PostScope = { kind: "all" } | { kind: "following" } | { kind: "user"; username: string };

/**
 * The POST /posts body. Everything else on Post (id, userId, rating, ratingCount, visitCount, comments, ratings,
 * createdAt, updatedAt) is set by the server and must NOT appear on the create page. Screenshots (media) are left
 * out until uploads go through signed URLs.
 */
export interface CreatePostInput {
  category: PostCategory;
  link: string;
  repoUrl: string | null;
  caption: string;
  description: string;
  skillIds: string[];
}

/** A picked screenshot, held in component state until uploads exist. */
export interface ScreenshotDraft {
  file: File;
  url: string; // URL.createObjectURL(file)
}
