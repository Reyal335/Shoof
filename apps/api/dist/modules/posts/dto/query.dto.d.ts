import { PostCategory } from '../entities/post.entity.js';
export declare class PaginationQueryDto {
    limit: number;
    offset: number;
}
export declare const POST_SORTS: readonly ["new", "top", "visited"];
export type PostSort = (typeof POST_SORTS)[number];
export declare class ListPostsQueryDto extends PaginationQueryDto {
    category?: PostCategory;
    userId?: string;
    skill?: string;
    sort: PostSort;
}
export declare class TopSkillsQueryDto {
    category?: PostCategory;
    limit: number;
}
