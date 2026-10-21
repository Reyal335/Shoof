import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository, type EntityManager } from 'typeorm';
import type { AuthUser } from '../auth/auth.types.js';
import { Post } from './entities/post.entity.js';
import { Rating } from './entities/rating.entity.js';
import type { RatingDistribution, RatingSummary } from './dto/rating-summary.dto.js';
export declare class RatingsService {
    private readonly posts;
    private readonly ratings;
    private readonly eventEmitter;
    constructor(posts: Repository<Post>, ratings: Repository<Rating>, eventEmitter: EventEmitter2);
    summary(postId: string, user: AuthUser | null): Promise<RatingSummary>;
    rate(postId: string, user: AuthUser, value: number): Promise<RatingSummary>;
    remove(postId: string, user: AuthUser): Promise<RatingSummary>;
    distributionOf(postId: string, manager?: EntityManager): Promise<RatingDistribution>;
    private lockPost;
    private recompute;
}
