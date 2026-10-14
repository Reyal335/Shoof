import { Follow } from "./entities/follow.entity.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service.js";
import { NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FollowEvents, type UserFollowedEvent, type UserUnfollowedEvent } from "./follows.events.js";

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
}
