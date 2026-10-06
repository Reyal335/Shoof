import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';
import { Post } from './entities/post.entity.js';
import { Media } from './entities/media.entity.js';
import { Comment } from './entities/comment.entity.js';
import { Rating } from './entities/rating.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Media, Comment, Rating])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
