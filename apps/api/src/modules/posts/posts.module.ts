import { Module } from '@nestjs/common';
import { PostService } from './posts.service.js';
import { PostController } from './posts.controller.js';

@Module({
  controllers: [PostController],
  providers: [PostService],
})
export class PostsModule {}
