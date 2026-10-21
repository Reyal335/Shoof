import type { AuthUser } from '../auth/auth.types.js';
import { ListPostsQueryDto } from '../posts/dto/query.dto.js';
import { FeedService } from './feed.service.js';
export declare class FeedController {
    private readonly feedService;
    constructor(feedService: FeedService);
    following(user: AuthUser, query: ListPostsQueryDto): Promise<import("../posts/posts.service.js").Page<import("../posts/posts.service.js").PostView>>;
}
