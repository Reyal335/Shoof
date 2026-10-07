import type { Relation } from 'typeorm';
import { User } from './user.entity.js';
export interface ProfileLink {
    label: string;
    url: string;
}
export declare class Profile {
    userId: string;
    user: Relation<User>;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    websiteUrl: string | null;
    links: ProfileLink[];
    country: string | null;
    locale: string | null;
    timezone: string | null;
    currency: string | null;
    createdAt: Date;
    updatedAt: Date;
}
