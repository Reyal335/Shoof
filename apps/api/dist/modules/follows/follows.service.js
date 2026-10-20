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
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FollowEvents } from "./follows.events.js";
export const FOLLOWING_FEED_MAX_CREATORS = 1000;
let FollowService = class FollowService {
    followRepository;
    usersService;
    eventEmitter;
    constructor(followRepository, usersService, eventEmitter) {
        this.followRepository = followRepository;
        this.usersService = usersService;
        this.eventEmitter = eventEmitter;
    }
    async followUser(followingId, followerId) {
        const user = await this.usersService.findOne(followingId);
        if (!user) {
            throw new NotFoundException('User does not exist');
        }
        const result = await this.followRepository
            .createQueryBuilder()
            .insert()
            .into(Follow)
            .values({ followingId, followerId })
            .orIgnore()
            .returning(['followerId'])
            .execute();
        if (result.raw.length) {
            this.eventEmitter.emit(FollowEvents.Followed, { followerId, followingId });
        }
    }
    async unfollowUser(followingId, followerId) {
        const user = await this.usersService.findOne(followingId);
        if (!user) {
            throw new NotFoundException('User does not exist');
        }
        const result = await this.followRepository
            .createQueryBuilder()
            .delete()
            .from(Follow)
            .where({ followingId, followerId })
            .execute();
        if (result.affected) {
            this.eventEmitter.emit(FollowEvents.Unfollowed, { followerId, followingId });
        }
    }
    isFollowing(followingId, followerId) {
        return this.followRepository.existsBy({ followingId, followerId });
    }
    async findFollowers(username, query) {
        const userId = await this.usersService.findIdByUsername(username);
        const [rows, total] = await this.followRepository.findAndCount({
            where: { followingId: userId },
            order: { createdAt: 'DESC', followerId: 'DESC' },
            take: query.limit,
            skip: query.offset,
        });
        return this.toPage(rows.map((row) => ({ userId: row.followerId, followedAt: row.createdAt })), total, query);
    }
    async findFollowing(username, query) {
        const userId = await this.usersService.findIdByUsername(username);
        const [rows, total] = await this.followRepository.findAndCount({
            where: { followerId: userId },
            order: { createdAt: 'DESC', followingId: 'DESC' },
            take: query.limit,
            skip: query.offset,
        });
        return this.toPage(rows.map((row) => ({ userId: row.followingId, followedAt: row.createdAt })), total, query);
    }
    async countsFor(username) {
        const userId = await this.usersService.findIdByUsername(username);
        const [followers, following] = await Promise.all([
            this.followRepository.countBy({ followingId: userId }),
            this.followRepository.countBy({ followerId: userId }),
        ]);
        return { followers, following };
    }
    async findFollowingIds(followerId) {
        const rows = await this.followRepository.find({
            where: { followerId },
            select: { followingId: true },
            order: { createdAt: 'DESC' },
            take: FOLLOWING_FEED_MAX_CREATORS,
        });
        return rows.map((row) => row.followingId);
    }
    async toPage(rows, total, query) {
        const users = await this.usersService.findSummariesByIds(rows.map((row) => row.userId));
        const userById = new Map(users.map((user) => [user.id, user]));
        const items = rows.flatMap((row) => {
            const user = userById.get(row.userId);
            return user ? [{ user, followedAt: row.followedAt }] : [];
        });
        return { items, total, limit: query.limit, offset: query.offset };
    }
};
FollowService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Follow)),
    __metadata("design:paramtypes", [Repository,
        UsersService,
        EventEmitter2])
], FollowService);
export { FollowService };
//# sourceMappingURL=follows.service.js.map