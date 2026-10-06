import type { Relation } from 'typeorm';
import { User_Identity } from './user-identity.js';
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
    passwordHash: string;
    isActive: boolean;
    emailVerified: boolean;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    identity: Relation<User_Identity>;
}
