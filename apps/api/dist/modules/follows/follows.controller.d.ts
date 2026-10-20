import { FollowService } from "./follows.service.js";
import { FollowListQueryDto } from "./dto/follow-list.query.js";
import type { AuthUser } from "../auth/auth.types.js";
export declare class FollowsController {
    private readonly followService;
    constructor(followService: FollowService);
    followStatus(followingId: string, user: AuthUser): Promise<{
        following: boolean;
    }>;
    followUser(followingId: string, user: AuthUser): Promise<void>;
    unfollowUser(followingId: string, user: AuthUser): Promise<void>;
    followers(username: string, query: FollowListQueryDto): Promise<import("./follows.service.js").FollowPage>;
    following(username: string, query: FollowListQueryDto): Promise<import("./follows.service.js").FollowPage>;
    counts(username: string): Promise<import("./follows.service.js").FollowCounts>;
}
