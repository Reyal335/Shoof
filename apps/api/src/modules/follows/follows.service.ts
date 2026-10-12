import { Follow } from "./entities/follow.entity.js";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";


@Injectable()
export class FollowService {
    constructor(
        @InjectRepository(Follow)
        private followRespository: Repository<Follow>
    ) {}

    public async followUser(followingId: string, followerId: string) {
        // Make relationship record on the follow table
        // await this.followRespository.save();
    }   

    public async unfollowUser(followingId: string, followerId: string) {

    }
}