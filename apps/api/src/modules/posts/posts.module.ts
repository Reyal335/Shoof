import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';
import { UserPostsController } from './user-posts.controller.js';
import { Post } from './entities/post.entity.js';
import { Media } from './entities/media.entity.js';
import { Comment } from './entities/comment.entity.js';
import { Rating } from './entities/rating.entity.js';
import { PostSkill } from './entities/post-skill.entity.js';
import { SkillsModule } from '../skills/skills.module.js';
import { UsersModule } from '../users/users.module.js';

// Imports users and skills only through their services: author names and avatars, skill names and the
// username behind /users/:username/posts.
@Module({
  imports: [TypeOrmModule.forFeature([Post, Media, Comment, Rating, PostSkill]), SkillsModule, UsersModule],
  controllers: [PostsController, UserPostsController],
  providers: [PostsService],
  // For notifications (captions and comment text by id) and the feed (posts by followed creators)
  exports: [PostsService],
})
export class PostsModule {}
