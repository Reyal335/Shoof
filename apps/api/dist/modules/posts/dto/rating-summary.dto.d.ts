export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;
export type CannotRateReason = 'signed_out' | 'own_post';
export interface RatingSummary {
    postId: string;
    average: number;
    count: number;
    distribution: RatingDistribution;
    myRating: number | null;
    canRate: boolean;
    reason: CannotRateReason | null;
}
