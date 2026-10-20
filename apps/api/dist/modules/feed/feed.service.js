var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { FollowService } from '../follows/follows.service.js';
import { PostsService } from '../posts/posts.service.js';
let FeedService = class FeedService {
    followService;
    postsService;
    constructor(followService, postsService) {
        this.followService = followService;
        this.postsService = postsService;
    }
    async following(userId, query) {
        const userIds = await this.followService.findFollowingIds(userId);
        return this.postsService.findAll(query, { userIds });
    }
};
FeedService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [FollowService,
        PostsService])
], FeedService);
export { FeedService };
//# sourceMappingURL=feed.service.js.map