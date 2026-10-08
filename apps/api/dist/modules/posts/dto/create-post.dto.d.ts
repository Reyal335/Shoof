import { PostCategory } from '../entities/post.entity.js';
import { MediaType } from '../entities/media.entity.js';
export declare class MediaItemDto {
    type: MediaType;
    url: string;
}
export declare class CreatePostDto {
    category: PostCategory;
    link: string;
    repoUrl?: string | null;
    caption: string;
    description: string;
    techStack?: string[];
    media?: MediaItemDto[];
}
