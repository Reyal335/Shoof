import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { PostCategory } from '../entities/post.entity.js';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX } from '../posts.constants.js';

export class PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(PAGE_SIZE_MAX)
    limit: number = PAGE_SIZE_DEFAULT;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset: number = 0;
}

export const POST_SORTS = ['new', 'top'] as const;
export type PostSort = (typeof POST_SORTS)[number];

export class ListPostsQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(PostCategory)
    category?: PostCategory;

    // One creator's posts
    @IsOptional()
    @IsUUID()
    userId?: string;

    // new: newest first. top: highest rated first.
    @IsOptional()
    @IsIn(POST_SORTS)
    sort: PostSort = 'new';
}
