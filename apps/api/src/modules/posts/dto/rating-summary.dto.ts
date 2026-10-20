/** How many ratings gave each number of stars. Always has all five keys. */
export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

/** Why the caller can't rate: not signed in, or it's their own post. */
export type CannotRateReason = 'signed_out' | 'own_post';

/** The one shape every ratings route answers with, so the web can replace its state wholesale. */
export interface RatingSummary {
  postId: string;
  /** Average to 2 decimals; 0 when count is 0. */
  average: number;
  count: number;
  distribution: RatingDistribution;
  /** The caller's own rating; null when signed out or not rated. */
  myRating: number | null;
  canRate: boolean;
  /** Set exactly when canRate is false. */
  reason: CannotRateReason | null;
}
