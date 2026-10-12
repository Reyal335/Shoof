import { CreateUserDto, CreateWithSignIn } from './dto/create-user.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity.js';
import { User_Identity } from './entities/user-identity.js';
import { Profile, type TechStack } from './entities/profile.entity.js';
export interface ProfileView {
    userId: string;
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    websiteUrl: string | null;
    techStack: TechStack;
    updatedAt: Date;
}
type PublicProfile = Pick<Profile, 'displayName' | 'bio' | 'avatarUrl' | 'websiteUrl' | 'links' | 'techStack' | 'country'>;
export type PublicUser = Pick<User, 'id' | 'username'> & {
    profile: PublicProfile | null;
};
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
export declare function normalizeStackNames(names: string[]): string[];
export declare function mergeTechStack(current: Partial<TechStack> | null | undefined, patch: Partial<TechStack>): TechStack;
export declare class UsersService {
    private usersRepository;
    private userIdentityRepository;
    private profilesRepository;
    constructor(usersRepository: Repository<User>, userIdentityRepository: Repository<User_Identity>, profilesRepository: Repository<Profile>);
    private readonly users;
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>>;
    createWithEmail(createWithSignIn: CreateWithSignIn): Promise<void>;
    findOne(id: string): Promise<Omit<User, 'passwordHash'> | null>;
    findAccount(id: string): Promise<AccountView>;
    findByEmail(email: string): Promise<Omit<User, 'passwordHash'> | null>;
    findByUsername(username: string): Promise<PublicUser>;
    findPublicByIds(ids: string[]): Promise<PublicUser[]>;
    findCredentials(email: string): Promise<{
        user: Omit<User, 'passwordHash'>;
        passwordHash: string | null;
    } | null>;
    remove(id: string): Promise<void>;
    markEmailVerified(id: string, email: string): Promise<boolean>;
    findByIdentity(provider: string, subject: string): Promise<User | null>;
    linkIdentity(id: string, provider: string, subject: string): Promise<void>;
    findProfile(userId: string): Promise<ProfileView>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileView>;
    private ensureProfile;
    followUser(): Promise<void>;
}
export {};
