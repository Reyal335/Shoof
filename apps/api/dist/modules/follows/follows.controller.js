var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { Public } from "../auth/decorators/public.decorator.js";
import { FollowService } from "./follows.service.js";
import { FollowListQueryDto } from "./dto/follow-list.query.js";
const uuid = new ParseUUIDPipe();
let FollowsController = class FollowsController {
    followService;
    constructor(followService) {
        this.followService = followService;
    }
    async followStatus(followingId, user) {
        return { following: await this.followService.isFollowing(followingId, user.id) };
    }
    followUser(followingId, user) {
        return this.followService.followUser(followingId, user.id);
    }
    unfollowUser(followingId, user) {
        return this.followService.unfollowUser(followingId, user.id);
    }
    followers(username, query) {
        return this.followService.findFollowers(username, query);
    }
    following(username, query) {
        return this.followService.findFollowing(username, query);
    }
    counts(username) {
        return this.followService.countsFor(username);
    }
};
__decorate([
    Get(':id/follow'),
    __param(0, Param('id', uuid)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "followStatus", null);
__decorate([
    Post(':id/follow'),
    HttpCode(204),
    __param(0, Param('id', uuid)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FollowsController.prototype, "followUser", null);
__decorate([
    Delete(':id/follow'),
    HttpCode(204),
    __param(0, Param('id', uuid)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FollowsController.prototype, "unfollowUser", null);
__decorate([
    Public(),
    Get(':username/followers'),
    __param(0, Param('username')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, FollowListQueryDto]),
    __metadata("design:returntype", void 0)
], FollowsController.prototype, "followers", null);
__decorate([
    Public(),
    Get(':username/following'),
    __param(0, Param('username')),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, FollowListQueryDto]),
    __metadata("design:returntype", void 0)
], FollowsController.prototype, "following", null);
__decorate([
    Public(),
    Get(':username/follow-counts'),
    __param(0, Param('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FollowsController.prototype, "counts", null);
FollowsController = __decorate([
    Controller('users'),
    UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [FollowService])
], FollowsController);
export { FollowsController };
//# sourceMappingURL=follows.controller.js.map