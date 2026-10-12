import { Follow } from "./entities/follow.entity.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service.js";
import { NotFoundException } from "@nestjs/common";

@Injectable()
export class FollowService {
    constructor(
        @InjectRepository(Follow)
        private followRepository: Repository<Follow>,
        private usersService: UsersService
    ) {}

    public async followUser(followingId: string, followerId: string) {
        // Make relationship record on the follow table
        const user = this.usersService.findOne(followingId);
        if(!user) {
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

    public async unfollowUser(followingId: string, followerId: string) {
        const user = this.usersService.findOne(followingId);
        if(!user) {
            throw new NotFoundException('User does not exist');
        }

        await this.followRepository
                    .createQueryBuilder()
                    .delete()
                    .from(Follow)
                    .where({ followingId, followerId })
                    .execute();
    }

    public isFollowing(followingId: string, followerId: string): Promise<boolean> {
        return this.followRepository.existsBy({ followingId, followerId });
    }
}