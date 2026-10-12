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
import { Follow } from "./entities/follow.entity.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service.js";
import { NotFoundException } from "@nestjs/common";
let FollowService = class FollowService {
    followRepository;
    usersService;
    constructor(followRepository, usersService) {
        this.followRepository = followRepository;
        this.usersService = usersService;
    }
    async followUser(followingId, followerId) {
        const user = this.usersService.findOne(followingId);
        if (!user) {
            throw new NotFoundException('User does not exist');
        }
        await this.followRepository
            .createQueryBuilder()
            .insert()
            .into(Follow)
            .values({ followingId, followerId })
            .orIgnore()
            .execute();
    }
    async unfollowUser(followingId, followerId) {
        const user = this.usersService.findOne(followingId);
        if (!user) {
            throw new NotFoundException('User does not exist');
        }
        await this.followRepository
            .createQueryBuilder()
            .delete()
            .from(Follow)
            .where({ followingId, followerId })
            .execute();
    }
    isFollowing(followingId, followerId) {
        return this.followRepository.existsBy({ followingId, followerId });
    }
};
FollowService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Follow)),
    __metadata("design:paramtypes", [Repository,
        UsersService])
], FollowService);
export { FollowService };
//# sourceMappingURL=follows.service.js.map