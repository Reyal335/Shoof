import { Injectable } from '@nestjs/common';
import { FollowService } from '../follows/follows.service.js';
import { PostsService, type Page, type PostView } from '../posts/posts.service.js';
import type { ListPostsQueryDto } from '../posts/dto/query.dto.js';

/**
 * Feeds built from other modules' public services: which creators a user follows comes from follows, the posts from
 * posts. Owns no tables. A good extraction candidate later (fan-out tables, ranking), which is why it sits apart
 * instead of making posts depend on follows.
 */
@Injectable()
export class FeedService {
  constructor(
    private readonly followService: FollowService,
    private readonly postsService: PostsService,
  ) {}

  /** Posts by the creators userId follows, with the same filters, sorts and paging as GET /posts. */
  async following(userId: string, query: ListPostsQueryDto): Promise<Page<PostView>> {
    const userIds = await this.followService.findFollowingIds(userId);
    return this.postsService.findAll(query, { userIds });
  }
}
