import { PostCategory } from '../entities/post.entity.js';
export declare class MediaItemDto {
    key: string;
}
export declare class CreatePostDto {
    category: PostCategory;
    link: string;
    repoUrl?: string | null;
    caption: string;
    description: string;
    skillIds?: string[];
    media?: MediaItemDto[];
}
