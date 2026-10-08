import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { ListPostsQueryDto, PaginationQueryDto } from './dto/query.dto.js';
import { RatePostDto } from './dto/rate-post.dto.js';
import { CommentDto } from './dto/comment.dto.js';
import type { AuthUser } from '../auth/auth.types.js';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(user: AuthUser, dto: CreatePostDto): Promise<import("./entities/post.entity.js").Post>;
    findAll(query: ListPostsQueryDto): Promise<import("./posts.service.js").Page<import("./entities/post.entity.js").Post>>;
    findOne(id: string): Promise<import("./entities/post.entity.js").Post>;
    update(id: string, user: AuthUser, dto: UpdatePostDto): Promise<import("./entities/post.entity.js").Post>;
    remove(id: string, user: AuthUser): Promise<void>;
    recordVisit(id: string): Promise<void>;
    findMyRating(id: string, user: AuthUser): Promise<import("./posts.service.js").RatingSummary>;
    rate(id: string, user: AuthUser, dto: RatePostDto): Promise<import("./posts.service.js").RatingSummary>;
    unrate(id: string, user: AuthUser): Promise<import("./posts.service.js").RatingSummary>;
    findComments(id: string, query: PaginationQueryDto): Promise<import("./posts.service.js").Page<import("./entities/comment.entity.js").Comment>>;
    addComment(id: string, user: AuthUser, dto: CommentDto): Promise<import("./entities/comment.entity.js").Comment>;
    updateComment(id: string, commentId: string, user: AuthUser, dto: CommentDto): Promise<import("./entities/comment.entity.js").Comment>;
    removeComment(id: string, commentId: string, user: AuthUser): Promise<void>;
}
