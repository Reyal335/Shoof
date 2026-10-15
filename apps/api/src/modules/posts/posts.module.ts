import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';
import { Post } from './entities/post.entity.js';
import { Media } from './entities/media.entity.js';
import { Comment } from './entities/comment.entity.js';
import { Rating } from './entities/rating.entity.js';
import { PostSkill } from './entities/post-skill.entity.js';
import { SkillsModule } from '../skills/skills.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Media, Comment, Rating, PostSkill]), SkillsModule],
  controllers: [PostsController],
  providers: [PostsService],
  // For notifications, which reads post captions and comment text by id
  exports: [PostsService],
})
export class PostsModule {}
