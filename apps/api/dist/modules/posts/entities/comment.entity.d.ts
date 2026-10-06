import type { Relation } from 'typeorm';
import { Post } from './post.entity.js';
export declare class Comment {
    id: string;
    postId: string;
    post: Relation<Post>;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
