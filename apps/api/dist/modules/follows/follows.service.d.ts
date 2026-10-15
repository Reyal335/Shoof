import { Follow } from "./entities/follow.entity.js";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service.js";
import { EventEmitter2 } from "@nestjs/event-emitter";
export declare class FollowService {
    private followRepository;
    private usersService;
    private eventEmitter;
    constructor(followRepository: Repository<Follow>, usersService: UsersService, eventEmitter: EventEmitter2);
    followUser(followingId: string, followerId: string): Promise<void>;
    unfollowUser(followingId: string, followerId: string): Promise<void>;
    isFollowing(followingId: string, followerId: string): Promise<boolean>;
}
