import { Controller } from "@nestjs/common";
import { UsersService } from "../users/users.service.js";
import { PostsService } from "./posts.service.js";
import { Get, Param, Query } from "@nestjs/common";
import { ListPostsQueryDto } from "./dto/query.dto.js";

@Controller('users/:username/posts')
export class UserPostsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  async listByUsername(
    @Param('username') username: string,
    @Query() userPostQuery: ListPostsQueryDto,
  ) {
    const user = await this.usersService.findByUsername(username); // throws 404 if missing
    return this.postsService.findAll(userPostQuery);
  }
}