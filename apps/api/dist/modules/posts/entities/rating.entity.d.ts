import type { Relation } from 'typeorm';
import { Post } from './post.entity.js';
export declare class Rating {
    id: string;
    postId: string;
    post: Relation<Post>;
    userId: string;
    value: number;
    createdAt: Date;
}
