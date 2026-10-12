import { Follow } from "./entities/follow.entity.js";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service.js";
export declare class FollowService {
    private followRepository;
    private usersService;
    constructor(followRepository: Repository<Follow>, usersService: UsersService);
    followUser(followingId: string, followerId: string): Promise<void>;
    unfollowUser(followingId: string, followerId: string): Promise<void>;
    isFollowing(followingId: string, followerId: string): Promise<boolean>;
}
