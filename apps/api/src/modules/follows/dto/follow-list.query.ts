import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const FOLLOWS_PAGE_DEFAULT = 20;
export const FOLLOWS_PAGE_MAX = 50;

/** GET /users/:username/followers and /following */
export class FollowListQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(FOLLOWS_PAGE_MAX)
    limit: number = FOLLOWS_PAGE_DEFAULT;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset: number = 0;
}
