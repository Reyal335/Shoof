import { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity.js';
import { User_Identity } from './entities/user-identity.js';
import { Profile } from './entities/profile.entity.js';
import { UserSkill } from './entities/user-skill.entity.js';
import { SkillsService, type SkillSummary } from '../skills/skills.service.js';
export interface NewIdentityUser {
    email: string;
    displayName?: string;
    provider: string;
    providerUserId: string;
}
export interface ProfileView {
    userId: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    websiteUrl: string | null;
    skills: SkillSummary[];
    updatedAt: Date;
}
type PublicProfile = Pick<Profile, 'displayName' | 'bio' | 'avatarUrl' | 'websiteUrl' | 'links' | 'country'>;
export type PublicUser = Pick<User, 'id' | 'username'> & {
    profile: PublicProfile | null;
};
export type PublicProfileView = PublicUser & {
    skills: SkillSummary[];
};
export interface UserSummary {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
}
export declare function toUserSummary(user: PublicUser): UserSummary;
export interface AccountView {
    id: string;
    email: string;
    username: string;
    emailVerified: boolean;
    role: UserRole;
    createdAt: Date;
}
declare const ACCOUNT_COLUMNS: {
    readonly id: true;
    readonly email: true;
    readonly username: true;
    readonly emailVerified: true;
    readonly role: true;
    readonly createdAt: true;
};
export declare function toAccountView(user: Pick<User, keyof typeof ACCOUNT_COLUMNS>): AccountView;
export declare class UsersService {
    private usersRepository;
    private userIdentityRepository;
    private profilesRepository;
    private userSkillsRepository;
    private readonly skillsService;
    constructor(usersRepository: Repository<User>, userIdentityRepository: Repository<User_Identity>, profilesRepository: Repository<Profile>, userSkillsRepository: Repository<UserSkill>, skillsService: SkillsService);
    private readonly users;
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>>;
    createWithIdentity(input: NewIdentityUser): Promise<Omit<User, 'passwordHash'>>;
    private availableUsername;
    findOne(id: string): Promise<Omit<User, 'passwordHash'> | null>;
    findAccount(id: string): Promise<AccountView>;
    findByEmail(email: string): Promise<Omit<User, 'passwordHash'> | null>;
    findByUsername(username: string): Promise<PublicUser>;
    findPublicProfile(username: string): Promise<PublicProfileView>;
    findIdByUsername(username: string): Promise<string>;
    findSummariesByIds(ids: string[]): Promise<UserSummary[]>;
    findPublicByIds(ids: string[]): Promise<PublicUser[]>;
    findCredentials(email: string): Promise<{
        user: Omit<User, 'passwordHash'>;
        passwordHash: string | null;
    } | null>;
    remove(id: string): Promise<void>;
    markEmailVerified(id: string, email: string): Promise<boolean>;
    findByIdentity(provider: string, providerUserId: string): Promise<Omit<User, 'passwordHash'> | null>;
    linkIdentity(id: string, provider: string, googleId: string): Promise<void>;
    findProfile(userId: string): Promise<ProfileView>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileView>;
    private findSkills;
    private checkSkills;
    private ensureProfile;
}
export {};
