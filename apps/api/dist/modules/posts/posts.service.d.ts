import { Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth.types.js';
import { UsersService, type UserSummary } from '../users/users.service.js';
import { Post, PostCategory } from './entities/post.entity.js';
import { MediaType } from './entities/media.entity.js';
import { Comment } from './entities/comment.entity.js';
import { PostSkill } from './entities/post-skill.entity.js';
import type { CreatePostDto } from './dto/create-post.dto.js';
import type { UpdatePostDto } from './dto/update-post.dto.js';
import type { ListPostsQueryDto, PaginationQueryDto, TopSkillsQueryDto } from './dto/query.dto.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkillsService, type SkillSummary } from '../skills/skills.service.js';
export interface Page<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
}
export interface MediaView {
    id: string;
    type: MediaType;
    url: string;
    sortOrder: number;
}
export interface PostView {
    id: string;
    userId: string;
    category: PostCategory;
    caption: string;
    description: string;
    link: string;
    repoUrl: string | null;
    rating: number;
    ratingCount: number;
    visitCount: number;
    createdAt: Date;
    updatedAt: Date;
    media: MediaView[];
    skills: SkillSummary[];
    author: UserSummary | null;
}
export type RatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;
export interface PostDetailView extends PostView {
    ratingDistribution: RatingDistribution;
}
export interface RatingSummary {
    postId: string;
    rating: number;
    ratingCount: number;
    value: number | null;
    distribution: RatingDistribution;
}
export interface CommentView {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: UserSummary | null;
}
export interface SkillUsage {
    skill: SkillSummary;
    count: number;
}
export type PostSummary = Pick<Post, 'id' | 'userId' | 'caption'>;
export type CommentSummary = Pick<Comment, 'id' | 'postId' | 'content'>;
export interface PostScope {
    userIds?: string[];
}
export declare class PostsService {
    private readonly posts;
    private readonly comments;
    private readonly postSkills;
    private readonly eventEmitter;
    private readonly skillService;
    private readonly usersService;
    constructor(posts: Repository<Post>, comments: Repository<Comment>, postSkills: Repository<PostSkill>, eventEmitter: EventEmitter2, skillService: SkillsService, usersService: UsersService);
    create(userId: string, dto: CreatePostDto): Promise<PostView>;
    findAll(query: ListPostsQueryDto, scope?: PostScope): Promise<Page<PostView>>;
    findOne(id: string): Promise<PostDetailView>;
    findTopSkills(query: TopSkillsQueryDto): Promise<SkillUsage[]>;
    update(id: string, user: AuthUser, dto: UpdatePostDto): Promise<PostView>;
    remove(id: string, user: AuthUser): Promise<void>;
    findSummariesByIds(ids: string[]): Promise<PostSummary[]>;
    findCommentSummariesByIds(ids: string[]): Promise<CommentSummary[]>;
    recordVisit(id: string): Promise<void>;
    findMyRating(postId: string, user: AuthUser): Promise<RatingSummary>;
    rate(postId: string, user: AuthUser, value: number): Promise<RatingSummary>;
    unrate(postId: string, user: AuthUser): Promise<RatingSummary>;
    findComments(postId: string, query: PaginationQueryDto): Promise<Page<CommentView>>;
    addComment(postId: string, user: AuthUser, content: string): Promise<CommentView>;
    updateComment(postId: string, commentId: string, user: AuthUser, content: string): Promise<CommentView>;
    removeComment(postId: string, commentId: string, user: AuthUser): Promise<void>;
    private toView;
    private toViews;
    private toCommentViews;
    private findPostRow;
    private lockPost;
    private lockComment;
    private insertMedia;
    private checkSkills;
    private insertSkills;
    private refreshRating;
    private ratingDistribution;
}
