import { Module } from '@nestjs/common';
import { PostService } from './post.service.js';
import { PostController } from './post.controller.js';

@Module({
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
