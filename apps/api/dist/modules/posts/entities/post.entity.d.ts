import type { Relation } from 'typeorm';
import { Media } from './media.entity.js';
import { Comment } from './comment.entity.js';
import { Rating } from './rating.entity.js';
export declare enum PostCategory {
    GAMES = "games",
    PORTFOLIOS = "portfolios",
    SAAS = "saas",
    CSS_UI = "css_ui",
    MISC = "misc"
}
export declare class Post {
    id: string;
    userId: string;
    caption: string;
    description: string;
    link: string;
    repoUrl: string | null;
    techStack: string[];
    category: PostCategory;
    rating: number;
    ratingCount: number;
    visitCount: number;
    media: Relation<Media[]>;
    comments: Relation<Comment[]>;
    ratings: Relation<Rating[]>;
    createdAt: Date;
    updatedAt: Date;
}
