import type { Relation } from 'typeorm';
import { User } from './user.entity.js';
export interface ProfileLink {
    label: string;
    url: string;
}
export declare const TECH_STACK_GROUPS: readonly ["frontend", "backend", "tools"];
export type TechStackGroup = (typeof TECH_STACK_GROUPS)[number];
export type TechStack = Record<TechStackGroup, string[]>;
export declare const emptyTechStack: () => TechStack;
export declare class Profile {
    userId: string;
    user: Relation<User>;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    websiteUrl: string | null;
    links: ProfileLink[];
    techStack: TechStack;
    country: string | null;
    locale: string | null;
    timezone: string | null;
    currency: string | null;
    createdAt: Date;
    updatedAt: Date;
}
