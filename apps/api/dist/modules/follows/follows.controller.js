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
import { Controller, HttpCode, Param, Delete } from "@nestjs/common";
import { Get, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { FollowService } from "./follows.service.js";
import { ParseUUIDPipe } from "@nestjs/common";
let FollowsController = class FollowsController {
    followService;
    constructor(followService) {
        this.followService = followService;
    }
    async followStatus(param, user) {
        return { following: await this.followService.isFollowing(param.id, user.id) };
    }
    followUser(followerId, user) {
        return this.followService.followUser(followerId, user.id);
    }
    unfollowUser(followerId, user) {
        return this.followService.unfollowUser(followerId, user.id);
    }
};
__decorate([
    Get(':id/follow'),
    __param(0, Param()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FollowsController.prototype, "followStatus", null);
__decorate([
    Post(':id/follow'),
    HttpCode(204),
    __param(0, Param('id', new ParseUUIDPipe())),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FollowsController.prototype, "followUser", null);
__decorate([
    Delete(':id/follow'),
    HttpCode(204),
    __param(0, Param('id', new ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FollowsController.prototype, "unfollowUser", null);
FollowsController = __decorate([
    Controller('users'),
    __metadata("design:paramtypes", [FollowService])
], FollowsController);
export { FollowsController };
//# sourceMappingURL=follows.controller.js.map