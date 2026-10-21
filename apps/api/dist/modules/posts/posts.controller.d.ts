import { PostsService } from './posts.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { ListPostsQueryDto, PaginationQueryDto, TopSkillsQueryDto } from './dto/query.dto.js';
import { CommentDto } from './dto/comment.dto.js';
import type { AuthUser } from '../auth/auth.types.js';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(user: AuthUser, dto: CreatePostDto): Promise<import("./posts.service.js").PostView>;
    findAll(query: ListPostsQueryDto): Promise<import("./posts.service.js").Page<import("./posts.service.js").PostView>>;
    findTopSkills(query: TopSkillsQueryDto): Promise<import("./posts.service.js").SkillUsage[]>;
    findOne(id: string): Promise<import("./posts.service.js").PostDetailView>;
    update(id: string, user: AuthUser, dto: UpdatePostDto): Promise<import("./posts.service.js").PostView>;
    remove(id: string, user: AuthUser): Promise<void>;
    recordVisit(id: string): Promise<void>;
    findComments(id: string, query: PaginationQueryDto): Promise<import("./posts.service.js").Page<import("./posts.service.js").CommentView>>;
    addComment(id: string, user: AuthUser, dto: CommentDto): Promise<import("./posts.service.js").CommentView>;
    updateComment(id: string, commentId: string, user: AuthUser, dto: CommentDto): Promise<import("./posts.service.js").CommentView>;
    removeComment(id: string, commentId: string, user: AuthUser): Promise<void>;
}
