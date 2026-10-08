import { PostCategory } from '../entities/post.entity.js';
export declare class PaginationQueryDto {
    limit: number;
    offset: number;
}
export declare const POST_SORTS: readonly ["new", "top"];
export type PostSort = (typeof POST_SORTS)[number];
export declare class ListPostsQueryDto extends PaginationQueryDto {
    category?: PostCategory;
    userId?: string;
    sort: PostSort;
}
