import type { Relation } from 'typeorm';
import { User } from './user.entity.js';
export declare class User_Identity {
    id: string;
    userId: string;
    user: Relation<User>;
    provider: string;
    providerUserId: string;
    createdAt: Date;
}
