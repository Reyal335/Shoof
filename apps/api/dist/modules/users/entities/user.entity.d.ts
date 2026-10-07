import type { Relation } from 'typeorm';
import { User_Identity } from './user-identity.js';
import { Profile } from './profile.entity.js';
export declare enum UserRole {
    GUEST = "Guest",
    MEMBER = "Member",
    INFLUENCER = "Influencer",
    MODERATOR = "Moderator",
    ADMIN = "Admin"
}
export declare class User {
    id: string;
    email: string;
    username: string;
    passwordHash: string | null;
    isActive: boolean;
    emailVerified: boolean;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    identities: Relation<User_Identity[]>;
    profile: Relation<Profile>;
}
