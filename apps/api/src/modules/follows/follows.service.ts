import { Follow } from "./entities/follow.entity.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { UsersService, type UserSummary } from "../users/users.service.js";
import { NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FollowEvents, type UserFollowedEvent, type UserUnfollowedEvent } from "./follows.events.js";
import type { FollowListQueryDto } from "./dto/follow-list.query.js";

/** One row of a followers or following list: the other user, and when the follow started. */
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

// The following feed reads posts by at most this many followed creators (the most recently followed first), so its
// IN (...) list stays bounded. Revisit with a fan-out feed table once people follow more than this.
export const FOLLOWING_FEED_MAX_CREATORS = 1000;

@Injectable()
export class FollowService {
    constructor(
        @InjectRepository(Follow)
        private followRepository: Repository<Follow>,
        private usersService: UsersService,
        private eventEmitter: EventEmitter2
    ) {}

    public async followUser(followingId: string, followerId: string) {
        const user = await this.usersService.findOne(followingId);
        if(!user) {
            throw new NotFoundException('User does not exist');
        }

        // Make relationship record on the follow table. RETURNING comes back empty when it already existed.
        const result = await this.followRepository
                    .createQueryBuilder()
                    .insert()
                    .into(Follow)
                    .values({ followingId, followerId })
                    .orIgnore()
                    .returning(['followerId'])
                    .execute();

        if (result.raw.length) {
            this.eventEmitter.emit(FollowEvents.Followed, { followerId, followingId } satisfies UserFollowedEvent);
        }
    }

    public async unfollowUser(followingId: string, followerId: string) {
        const user = await this.usersService.findOne(followingId);
        if(!user) {
            throw new NotFoundException('User does not exist');
        }

        const result = await this.followRepository
                    .createQueryBuilder()
                    .delete()
                    .from(Follow)
                    .where({ followingId, followerId })
                    .execute();

        if (result.affected) {
            this.eventEmitter.emit(FollowEvents.Unfollowed, { followerId, followingId } satisfies UserUnfollowedEvent);
        }
    }

    public isFollowing(followingId: string, followerId: string): Promise<boolean> {
        return this.followRepository.existsBy({ followingId, followerId });
    }

    // ---------- lists and counts (public) ----------

    /** Who follows :username, newest follow first. */
    public async findFollowers(username: string, query: FollowListQueryDto): Promise<FollowPage> {
        const userId = await this.usersService.findIdByUsername(username);
        const [rows, total] = await this.followRepository.findAndCount({
            where: { followingId: userId },
            order: { createdAt: 'DESC', followerId: 'DESC' },
            take: query.limit,
            skip: query.offset,
        });
        return this.toPage(rows.map((row) => ({ userId: row.followerId, followedAt: row.createdAt })), total, query);
    }

    /** Who :username follows, newest follow first. */
    public async findFollowing(username: string, query: FollowListQueryDto): Promise<FollowPage> {
        const userId = await this.usersService.findIdByUsername(username);
        const [rows, total] = await this.followRepository.findAndCount({
            where: { followerId: userId },
            order: { createdAt: 'DESC', followingId: 'DESC' },
            take: query.limit,
            skip: query.offset,
        });
        return this.toPage(rows.map((row) => ({ userId: row.followingId, followedAt: row.createdAt })), total, query);
    }

    /** The profile header's Followers and Following numbers. Two index-only counts. */
    public async countsFor(username: string): Promise<FollowCounts> {
        const userId = await this.usersService.findIdByUsername(username);
        const [followers, following] = await Promise.all([
            this.followRepository.countBy({ followingId: userId }),
            this.followRepository.countBy({ followerId: userId }),
        ]);
        return { followers, following };
    }

    /** For the following feed: the creators followerId follows, most recently followed first (bounded). */
    public async findFollowingIds(followerId: string): Promise<string[]> {
        const rows = await this.followRepository.find({
            where: { followerId },
            select: { followingId: true },
            order: { createdAt: 'DESC' },
            take: FOLLOWING_FEED_MAX_CREATORS,
        });
        return rows.map((row) => row.followingId);
    }

    // Names and avatars come from UsersService in one batched call. A deactivated user is left out of the page
    // (total still counts them, as the follows table does).
    private async toPage(rows: { userId: string; followedAt: Date }[], total: number, query: FollowListQueryDto): Promise<FollowPage> {
        const users = await this.usersService.findSummariesByIds(rows.map((row) => row.userId));
        const userById = new Map(users.map((user) => [user.id, user]));
        const items = rows.flatMap((row) => {
            const user = userById.get(row.userId);
            return user ? [{ user, followedAt: row.followedAt }] : [];
        });
        return { items, total, limit: query.limit, offset: query.offset };
    }
}
