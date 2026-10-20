import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { UsersService } from "../users/users.service.js";
import { PostsService } from "./posts.service.js";
import { ListPostsQueryDto } from "./dto/query.dto.js";
import { Public } from "../auth/decorators/public.decorator.js";

// GET /users/:username/posts. Lives in the posts module, which asks UsersService for the id behind the username,
// so the users module never imports posts.
@Controller('users/:username/posts')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class UserPostsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  // Same filters and paging as GET /posts; the username decides whose posts, so ?userId is overridden
  @Public()
  @Get()
  async listByUsername(@Param('username') username: string, @Query() query: ListPostsQueryDto) {
    const userId = await this.usersService.findIdByUsername(username); // 404 for an unknown username
    return this.postsService.findAll(query, { userIds: [userId] });
  }
}
