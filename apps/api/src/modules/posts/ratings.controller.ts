import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { RatePostDto } from './dto/rate-post.dto.js';
import { RatingsService } from './ratings.service.js';

const uuid = new ParseUUIDPipe();

// Every route answers with a RatingSummary. Reading is public (signed in or not changes myRating and canRate);
// rating and removing need the access token (the global JwtAuthGuard).
@Controller('posts/:postId/ratings')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @OptionalAuth()
  @Get('summary')
  summary(@Param('postId', uuid) postId: string, @CurrentUser() user: AuthUser | null) {
    return this.ratingsService.summary(postId, user ?? null);
  }

  @Put('me')
  rate(@Param('postId', uuid) postId: string, @CurrentUser() user: AuthUser, @Body() dto: RatePostDto) {
    return this.ratingsService.rate(postId, user, dto.value);
  }

  // 200 with the summary, also when there was nothing to remove
  @Delete('me')
  remove(@Param('postId', uuid) postId: string, @CurrentUser() user: AuthUser) {
    return this.ratingsService.remove(postId, user);
  }
}
