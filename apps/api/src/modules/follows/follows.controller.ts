import { Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { Public } from "../auth/decorators/public.decorator.js";
import { FollowService } from "./follows.service.js";
import { FollowListQueryDto } from "./dto/follow-list.query.js";
import type { AuthUser } from "../auth/auth.types.js";

const uuid = new ParseUUIDPipe();

// Writes and "do I follow" take the user's id (what the follow button holds); the public lists and counts take the
// username, like the rest of the /users/:username pages.
@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class FollowsController {
    constructor (
        private readonly followService: FollowService
    ) {}

    // Whether the signed-in user follows :id, so the follow button starts in the right state
    @Get(':id/follow')
    async followStatus(@Param('id', uuid) followingId: string, @CurrentUser() user: AuthUser) {
        return { following: await this.followService.isFollowing(followingId, user.id) };
    }

    // 204: nothing to send back, and the web client reads a 204 as "no body"
    @Post(':id/follow')
    @HttpCode(204)
    followUser(@Param('id', uuid) followingId: string, @CurrentUser() user: AuthUser) {
        return this.followService.followUser(followingId, user.id);
    }

    @Delete(':id/follow')
    @HttpCode(204)
    unfollowUser(@Param('id', uuid) followingId: string, @CurrentUser() user: AuthUser) {
        return this.followService.unfollowUser(followingId, user.id);
    }

    @Public()
    @Get(':username/followers')
    followers(@Param('username') username: string, @Query() query: FollowListQueryDto) {
        return this.followService.findFollowers(username, query);
    }

    @Public()
    @Get(':username/following')
    following(@Param('username') username: string, @Query() query: FollowListQueryDto) {
        return this.followService.findFollowing(username, query);
    }

    // The profile header's numbers
    @Public()
    @Get(':username/follow-counts')
    counts(@Param('username') username: string) {
        return this.followService.countsFor(username);
    }
}
