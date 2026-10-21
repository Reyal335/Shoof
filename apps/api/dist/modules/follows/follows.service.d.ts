import { Follow } from "./entities/follow.entity.js";
import { Repository } from "typeorm";
import { UsersService, type UserSummary } from "../users/users.service.js";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { FollowListQueryDto } from "./dto/follow-list.query.js";
export interface FollowListItem {
    user: UserSummary;
    followedAt: Date;
}
export interface FollowPage {
    items: FollowListItem[];
    total: number;
    limit: number;
    offset: number;
}
export interface FollowCounts {
    followers: number;
    following: number;
}
export declare const FOLLOWING_FEED_MAX_CREATORS = 1000;
export declare class FollowService {
    private followRepository;
    private usersService;
    private eventEmitter;
    constructor(followRepository: Repository<Follow>, usersService: UsersService, eventEmitter: EventEmitter2);
    followUser(followingId: string, followerId: string): Promise<void>;
    unfollowUser(followingId: string, followerId: string): Promise<void>;
    isFollowing(followingId: string, followerId: string): Promise<boolean>;
    findFollowers(username: string, query: FollowListQueryDto): Promise<FollowPage>;
    findFollowing(username: string, query: FollowListQueryDto): Promise<FollowPage>;
    countsFor(username: string): Promise<FollowCounts>;
    findFollowingIds(followerId: string): Promise<string[]>;
    private toPage;
}
