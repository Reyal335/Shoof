import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { ListPostsQueryDto, PaginationQueryDto } from './dto/query.dto.js';
import { RatePostDto } from './dto/rate-post.dto.js';
import { CommentDto } from './dto/comment.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Public } from '../auth/decorators/public.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';

const uuid = new ParseUUIDPipe();

// Reads are public; every write needs the access token (the global JwtAuthGuard).
// Unknown body fields are rejected and query strings are converted to their DTO types.
@Controller('posts')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @Public()
  @Get()
  findAll(@Query() query: ListPostsQueryDto) {
    return this.postsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', uuid) id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', uuid) id: string, @CurrentUser() user: AuthUser, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, user, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', uuid) id: string, @CurrentUser() user: AuthUser) {
    return this.postsService.remove(id, user);
  }

  // Called when someone opens the live site from the post
  @Public()
  @Post(':id/visits')
  @HttpCode(HttpStatus.NO_CONTENT)
  recordVisit(@Param('id', uuid) id: string) {
    return this.postsService.recordVisit(id);
  }

  // ---------- ratings: one per user per post ----------

  @Get(':id/rating')
  findMyRating(@Param('id', uuid) id: string, @CurrentUser() user: AuthUser) {
    return this.postsService.findMyRating(id, user);
  }

  @Put(':id/rating')
  rate(@Param('id', uuid) id: string, @CurrentUser() user: AuthUser, @Body() dto: RatePostDto) {
    return this.postsService.rate(id, user, dto.value);
  }

  @Delete(':id/rating')
  unrate(@Param('id', uuid) id: string, @CurrentUser() user: AuthUser) {
    return this.postsService.unrate(id, user);
  }

  // ---------- comments ----------

  @Public()
  @Get(':id/comments')
  findComments(@Param('id', uuid) id: string, @Query() query: PaginationQueryDto) {
    return this.postsService.findComments(id, query);
  }

  @Post(':id/comments')
  addComment(@Param('id', uuid) id: string, @CurrentUser() user: AuthUser, @Body() dto: CommentDto) {
    return this.postsService.addComment(id, user, dto.content);
  }

  @Patch(':id/comments/:commentId')
  updateComment(
    @Param('id', uuid) id: string,
    @Param('commentId', uuid) commentId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CommentDto,
  ) {
    return this.postsService.updateComment(id, commentId, user, dto.content);
  }

  @Delete(':id/comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeComment(@Param('id', uuid) id: string, @Param('commentId', uuid) commentId: string, @CurrentUser() user: AuthUser) {
    return this.postsService.removeComment(id, commentId, user);
  }
}
