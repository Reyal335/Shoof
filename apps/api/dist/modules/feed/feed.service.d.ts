import { FollowService } from '../follows/follows.service.js';
import { PostsService, type Page, type PostView } from '../posts/posts.service.js';
import type { ListPostsQueryDto } from '../posts/dto/query.dto.js';
export declare class FeedService {
    private readonly followService;
    private readonly postsService;
    constructor(followService: FollowService, postsService: PostsService);
    following(userId: string, query: ListPostsQueryDto): Promise<Page<PostView>>;
}
