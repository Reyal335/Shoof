var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
import { AwsModule } from '../aws/aws.module.js';
let PostsModule = class PostsModule {
};
PostsModule = __decorate([
    Module({
        imports: [TypeOrmModule.forFeature([Post, Media, Comment, Rating, PostSkill]), SkillsModule, UsersModule, AwsModule],
        controllers: [PostsController, UserPostsController, RatingsController],
        providers: [PostsService, RatingsService],
        exports: [PostsService],
    })
], PostsModule);
export { PostsModule };
//# sourceMappingURL=posts.module.js.map