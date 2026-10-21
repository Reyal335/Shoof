import { Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';
import { PostCategory } from '../entities/post.entity.js';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, TOP_SKILLS_DEFAULT, TOP_SKILLS_MAX } from '../posts.constants.js';

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

// new: newest first. top: highest rated first. visited: most visits from Shoof first.
export const POST_SORTS = ['new', 'top', 'visited'] as const;
export type PostSort = (typeof POST_SORTS)[number];

// A skill slug as the catalog writes them, e.g. 'nextjs', 'unreal-engine'. Aliases ('js', 'cpp') work too.
const SKILL_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export class ListPostsQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(PostCategory)
    category?: PostCategory;

    // One creator's posts
    @IsOptional()
    @IsUUID()
    userId?: string;

    // Posts built with this skill: "projects built with Next.js"
    @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsOptional()
    @MaxLength(64)
    @Matches(SKILL_SLUG, { message: 'skill must be a skill slug, e.g. nextjs' })
    skill?: string;

    @IsOptional()
    @IsIn(POST_SORTS)
    sort: PostSort = 'new';
}

/** GET /posts/skills: the skills a section's posts are built with most, for its filter chips. */
export class TopSkillsQueryDto {
    @IsOptional()
    @IsEnum(PostCategory)
    category?: PostCategory;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(TOP_SKILLS_MAX)
    limit: number = TOP_SKILLS_DEFAULT;
}
