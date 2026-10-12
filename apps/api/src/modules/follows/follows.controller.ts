import { Controller, HttpCode, Param, Delete } from "@nestjs/common";
import { UsersService } from "../users/users.service.js";
import { Get, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { FollowService } from "./follows.service.js";
import type { AuthUser } from "../auth/auth.types.js";
import { ParseUUIDPipe } from "@nestjs/common";

@Controller('users')
export class FollowsController {
    constructor (
        private readonly followService: FollowService
    ) {}

    @Get(':id/follow')
    async followStatus(@Param() param: any, @CurrentUser() user: AuthUser) {
        return { following: await this.followService.isFollowing(param.id, user.id) };
    }

  // 204: nothing to send back, and the web client reads a 204 as "no body"
    @Post(':id/follow')
    @HttpCode(204)
    followUser(@Param('id', new ParseUUIDPipe()) followerId: string, @CurrentUser() user: AuthUser) {
        return this.followService.followUser(followerId, user.id);
    }

  @Delete(':id/follow')
  @HttpCode(204)
  unfollowUser(@Param('id', new ParseUUIDPipe) followerId: string, @CurrentUser() user: AuthUser) {
    return this.followService.unfollowUser(followerId, user.id);
  }
}