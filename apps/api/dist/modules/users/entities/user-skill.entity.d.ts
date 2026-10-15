import type { Relation } from 'typeorm';
import { User } from './user.entity.js';
export declare class UserSkill {
    userId: string;
    skillId: string;
    user: Relation<User>;
}
