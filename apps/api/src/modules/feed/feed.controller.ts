import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { ListPostsQueryDto } from '../posts/dto/query.dto.js';
import { FeedService } from './feed.service.js';

// The signed-in user's own feeds. The public lists (all posts, a section, a creator) stay on /posts.
@Controller('feed')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  // The home feed's Following tab. ?userId is ignored: the follows decide whose posts.
  @Get('following')
  following(@CurrentUser() user: AuthUser, @Query() query: ListPostsQueryDto) {
    return this.feedService.following(user.id, query);
  }
}
