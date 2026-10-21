import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';
import { UserPostsController } from './user-posts.controller.js';
import { RatingsController } from './ratings.controller.js';
import { RatingsService } from './ratings.service.js';
import { Post } from './entities/post.entity.js';
import { Media } from './entities/media.entity.js';
import { Comment } from './entities/comment.entity.js';
import { Rating } from './entities/rating.entity.js';
import { PostSkill } from './entities/post-skill.entity.js';
import { SkillsModule } from '../skills/skills.module.js';
import { UsersModule } from '../users/users.module.js';

// Ratings (RatingsService, RatingsController) live here because this module owns both the ratings rows and the
// posts' rating cache. Imports users and skills only through their services: author names and avatars, skill names
// and the username behind /users/:username/posts.
@Module({
  imports: [TypeOrmModule.forFeature([Post, Media, Comment, Rating, PostSkill]), SkillsModule, UsersModule],
  controllers: [PostsController, UserPostsController, RatingsController],
  providers: [PostsService, RatingsService],
  // For notifications (captions and comment text by id) and the feed (posts by followed creators)
  exports: [PostsService],
})
export class PostsModule {}
