import { FollowService } from "./follows.service.js";
import type { AuthUser } from "../auth/auth.types.js";
export declare class FollowsController {
    private readonly followService;
    constructor(followService: FollowService);
    followStatus(param: any, user: AuthUser): Promise<{
        following: boolean;
    }>;
    followUser(followerId: string, user: AuthUser): Promise<void>;
    unfollowUser(followerId: string, user: AuthUser): Promise<void>;
}
