// Mirrors RatingSummary in apps/api/src/modules/posts/dto/rating-summary.dto.ts.

export type StarValue = 1 | 2 | 3 | 4 | 5;
export const STAR_VALUES: readonly StarValue[] = [1, 2, 3, 4, 5];

/** How many ratings gave each number of stars. Always all five keys. */
export type RatingDistribution = Record<StarValue, number>;

/** Why the viewer can't rate: not signed in, or it's their own site. */
export type CannotRateReason = "signed_out" | "own_post";

/** GET /posts/:postId/ratings/summary, and the answer to every write. */
export interface RatingSummary {
  postId: string;
  /** Average to 2 decimals; 0 when count is 0. Shown to one decimal. */
  average: number;
  count: number;
  distribution: RatingDistribution;
  /** null when signed out or not rated. 0 is never a rating. */
  myRating: StarValue | null;
  canRate: boolean;
  reason: CannotRateReason | null;
}

/** What the status line under the Ratings card says. */
export type RatingStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; value: StarValue }
  | { kind: "removed" }
  | { kind: "error" };

/**
 * One post's rating state, as every rating component on the page reads it (useRatings, shared through
 * RatingsContext). `summary` already includes an optimistic pick, so all the numbers move together.
 */
export interface RatingsController {
  postId: string;
  summary: RatingSummary;
  /** True until the first summary arrives from the server (the input then shows faded stars, no radios). */
  loading: boolean;
  saving: boolean;
  status: RatingStatus;
  /** "Undo" is on offer: the last action removed a rating. */
  canUndo: boolean;
  rate: (value: StarValue) => void;
  remove: () => void;
  undo: () => void;
  retry: () => void;
}
