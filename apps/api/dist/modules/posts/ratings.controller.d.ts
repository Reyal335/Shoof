import type { AuthUser } from '../auth/auth.types.js';
import { RatePostDto } from './dto/rate-post.dto.js';
import { RatingsService } from './ratings.service.js';
export declare class RatingsController {
    private readonly ratingsService;
    constructor(ratingsService: RatingsService);
    summary(postId: string, user: AuthUser | null): Promise<import("./dto/rating-summary.dto.js").RatingSummary>;
    rate(postId: string, user: AuthUser, dto: RatePostDto): Promise<import("./dto/rating-summary.dto.js").RatingSummary>;
    remove(postId: string, user: AuthUser): Promise<import("./dto/rating-summary.dto.js").RatingSummary>;
}
