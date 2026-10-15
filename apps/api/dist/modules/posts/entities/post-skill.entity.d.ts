import type { Relation } from 'typeorm';
import { Post } from './post.entity.js';
export declare class PostSkill {
    postId: string;
    skillId: string;
    post: Relation<Post>;
}
