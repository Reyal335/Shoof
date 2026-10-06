import type { Relation } from 'typeorm';
import { Post } from './post.entity.js';
export declare enum MediaType {
    IMAGE = "image",
    VIDEO = "video"
}
export declare class Media {
    id: string;
    postId: string;
    post: Relation<Post>;
    type: MediaType;
    url: string;
    sortOrder: number;
    createdAt: Date;
}
