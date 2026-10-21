var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { FollowsModule } from '../follows/follows.module.js';
import { PostsModule } from '../posts/posts.module.js';
import { FeedController } from './feed.controller.js';
import { FeedService } from './feed.service.js';
let FeedModule = class FeedModule {
};
FeedModule = __decorate([
    Module({
        imports: [FollowsModule, PostsModule],
        controllers: [FeedController],
        providers: [FeedService],
    })
], FeedModule);
export { FeedModule };
//# sourceMappingURL=feed.module.js.map