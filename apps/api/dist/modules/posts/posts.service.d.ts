import { Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth.types.js';
import { Post } from './entities/post.entity.js';
import { Comment } from './entities/comment.entity.js';
import type { CreatePostDto } from './dto/create-post.dto.js';
import type { UpdatePostDto } from './dto/update-post.dto.js';
import type { ListPostsQueryDto, PaginationQueryDto } from './dto/query.dto.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkillsService } from '../skills/skills.service.js';
export interface Page<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
}
export interface RatingSummary {
    postId: string;
    rating: number;
    ratingCount: number;
    value: number | null;
}
export type PostSummary = Pick<Post, 'id' | 'userId' | 'caption'>;
export type CommentSummary = Pick<Comment, 'id' | 'postId' | 'content'>;
export declare class PostsService {
    private readonly posts;
    private readonly comments;
    private eventEmitter;
    private readonly skillService;
    constructor(posts: Repository<Post>, comments: Repository<Comment>, eventEmitter: EventEmitter2, skillService: SkillsService);
    create(userId: string, dto: CreatePostDto): Promise<Post>;
    findAll(query: ListPostsQueryDto): Promise<Page<Post>>;
    findOne(id: string): Promise<Post>;
    update(id: string, user: AuthUser, dto: UpdatePostDto): Promise<Post>;
    remove(id: string, user: AuthUser): Promise<void>;
    findSummariesByIds(ids: string[]): Promise<PostSummary[]>;
    findCommentSummariesByIds(ids: string[]): Promise<CommentSummary[]>;
    recordVisit(id: string): Promise<void>;
    findMyRating(postId: string, user: AuthUser): Promise<RatingSummary>;
    rate(postId: string, user: AuthUser, value: number): Promise<RatingSummary>;
    unrate(postId: string, user: AuthUser): Promise<RatingSummary>;
    findComments(postId: string, query: PaginationQueryDto): Promise<Page<Comment>>;
    addComment(postId: string, user: AuthUser, content: string): Promise<Comment>;
    updateComment(postId: string, commentId: string, user: AuthUser, content: string): Promise<Comment>;
    removeComment(postId: string, commentId: string, user: AuthUser): Promise<void>;
    private findPostRow;
    private lockPost;
    private lockComment;
    private insertMedia;
    private validSkills;
    private insertSkills;
    private refreshRating;
}
