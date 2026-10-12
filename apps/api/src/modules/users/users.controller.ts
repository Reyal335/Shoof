import { Controller, 
  Get, 
  Body, 
  Patch, 
  Delete,
  Post,
  UsePipes, 
  ValidationPipe,
  Param } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { FollowService } from '../follows/follows.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';
import { Public } from '../auth/decorators/public.decorator.js';

// Self-service only: every route acts on the signed-in user, whose id comes from the access token.
// Accounts are created through /auth/sign-up (CredentialsService hashes the password). There is deliberately no
// route that lists users or reads, edits or deletes one by id: add those only with an admin role check and a
// response that leaves out auth fields.
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly followService: FollowService
  ) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.usersService.findAccount(user.id);
  }

  @Public()
  @Get(':username')
  username(@Param() param: any) {
    return this.usersService.findByUsername(param.username);
  }

  // The signed-in user's own profile, for the profile page and its edit form
  @Get('me/profile')
  myProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.findProfile(user.id);
  }

  // Unknown body fields (userId, links, ...) are rejected rather than silently dropped
  @Patch('me/profile')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  updateMyProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  // User followers and following
  @Post(':id/follow')
  followUser(@Param() param: any, @CurrentUser() user: AuthUser) {
    return this.followService.followUser(param.id, user.id);
  }

  @Delete(':id/folow')
  unfollowUser(@Param() param: any, @CurrentUser() user: AuthUser) {
    return this.followService.unfollowUser(param.id, user.id);
  }
}
