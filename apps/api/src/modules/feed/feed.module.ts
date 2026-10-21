import { Module } from '@nestjs/common';
import { FollowsModule } from '../follows/follows.module.js';
import { PostsModule } from '../posts/posts.module.js';
import { FeedController } from './feed.controller.js';
import { FeedService } from './feed.service.js';

// Composes follows and posts through their exported services. No tables, nothing exported.
@Module({
  imports: [FollowsModule, PostsModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
