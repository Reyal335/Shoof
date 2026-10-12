import { Injectable } from '@nestjs/common';

// DTO
import { CreateUserDto, CreateWithSignIn } from './dto/create-user.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type EntityManager, In } from 'typeorm';
import { User, UserRole } from './entities/user.entity.js';
import { User_Identity } from './entities/user-identity.js';
import { Profile, TECH_STACK_GROUPS, emptyTechStack, type TechStack } from './entities/profile.entity.js';
import { NotFoundException } from '@nestjs/common';
import { normalize } from 'node:path';
import { _normalize } from 'zod/v4/core';
import { errorMonitor } from 'node:stream';

/** What the owner sees and edits on their profile page. Never carries auth fields (email, passwordHash, role). */
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

/**
 * What GET /users/me sends: the signed-in user's own account. Built field by field, so a column added to `user`
 * later stays server-side until it is listed here.
 */
export interface AccountView {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: Date;
}

// The columns GET /users/me reads; toAccountView picks the same ones
const ACCOUNT_COLUMNS = { id: true, email: true, username: true, emailVerified: true, role: true, createdAt: true } as const;

export function toAccountView(user: Pick<User, keyof typeof ACCOUNT_COLUMNS>): AccountView {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified,
    role: user.role,
    createdAt: user.createdAt,
  };
}

/** Collapses whitespace, drops blanks and case-insensitive duplicates, keeps the first spelling and the order. */
export function normalizeStackNames(names: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of names) {
    const name = raw.replace(/\s+/g, ' ').trim();
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      result.push(name);
    }
  }
  return result;
}

/** Applies the groups that were sent onto the stored stack. Rows written before a group existed get it as []. */
export function mergeTechStack(current: Partial<TechStack> | null | undefined, patch: Partial<TechStack>): TechStack {
  const merged = emptyTechStack();
  for (const group of TECH_STACK_GROUPS) {
    const next = patch[group];
    merged[group] = next != null ? normalizeStackNames(next) : (current?.[group] ?? []);
  }
  return merged;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(User_Identity)
    private userIdentityRepository: Repository<User_Identity>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>
  ) {}

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const newUser = this.usersRepository.create(createUserDto);

    try {
      // The profile is created with the user so a user never exists without one
      const savedUser = await this.usersRepository.manager.transaction(async (manager) => {
        const user = await manager.save(newUser)
        await manager.insert(Profile, { userId: user.id, displayName: user.username })
        return user
      })

      const { passwordHash, ...result } = savedUser;

      return result
    } catch (error) {
      console.log('There was an error during the save')
      throw error
    }
  }

  async createWithEmail(createWithSignIn: CreateWithSignIn) {
    
  }

  // Find by Id
  async findOne(id: string): Promise<Omit<User, 'passwordHash'> | null> {
    const foundUser =  await this.usersRepository.findOneBy({ id });

    if (!foundUser) {
      return null;
    }

    const { passwordHash, ...result } = foundUser;

    return result
  }

  /** The signed-in user's own account for GET /users/me. Only the listed columns are read. */
  async findAccount(id: string): Promise<AccountView> {
    const user = await this.usersRepository.findOne({ where: { id }, select: ACCOUNT_COLUMNS });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return toAccountView(user);
  }

  // Find by Email
  async findByEmail(email: string): Promise<Omit<User, 'passwordHash'> | null> {
    const foundUser = await this.usersRepository.findOneBy({ email })

    if (!foundUser) {
      return null;
    }

    const { passwordHash, ...result } = foundUser;

    return result
  }

  async findByUsername(username: string): Promise<PublicUser> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: { profile: true },
      select: {
        id: true,
        username: true,
        profile: {
          displayName: true,
          bio: true,
          avatarUrl: true,
          websiteUrl: true,
          links: true,
          techStack: true, 
          country: true
        },
      }
    }); 

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Batch find IDs
  async findPublicByIds(ids: string[]): Promise<PublicUser[]> {
    const users = await this.usersRepository.find({ 
      where: { 
        id: In(ids), 
        isActive: true 
      }, 
      relations: { profile: true },
      select: {
        id: true,
        username: true,
        profile: {
          displayName: true,
          bio: true,
          avatarUrl: true,
          websiteUrl: true,
          links: true,
          techStack: true, 
          country: true
        },
      }      
    });

    return users
  }

  // Null for an unknown email: sign-in must not reveal which addresses have accounts
  async findCredentials(email: string): Promise<{user: Omit<User, 'passwordHash'>, passwordHash: string | null} | null> {
    const found = await this.usersRepository.findOneBy({email})
    if (!found) {
      return null
    }

    const { passwordHash, ...user } = found;

    return { user, passwordHash }
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async markEmailVerified(id: string, email: string) {
    try {
      const result = await this.usersRepository.update([{ id }, { email }], { emailVerified: true});
      if (result.affected === 0) {
        return false
      }
      return true
    } catch(err) {
      throw err
    }
  }

  // Not implemented yet. Fails closed: "no linked account", never someone else's user.
  async findByIdentity(provider: string, subject: string): Promise<User | null> {
    return null
  }

  async linkIdentity(id: string, provider: string, subject: string) {
    return 
  }

  // ---------- profile ----------

  /** The signed-in user's own profile. A missing row (seeded or older accounts) is created on first read. */
  async findProfile(userId: string): Promise<ProfileView> {
    return this.profilesRepository.manager.transaction(async (manager) => {
      const user = await this.ensureProfile(manager, userId);
      const profile = await manager.findOneByOrFail(Profile, { userId });
      return toProfileView(user, profile);
    });
  }

  /**
   * Owner only: the id comes from the access token. Fields are picked one by one so a request body can never set
   * userId, links or timestamps. null clears bio, avatarUrl and websiteUrl; it is ignored for displayName.
   * The row is locked while the tech stack is merged so two saves can't drop each other's groups.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileView> {
    return this.profilesRepository.manager.transaction(async (manager) => {
      const user = await this.ensureProfile(manager, userId);
      const profile = await manager.findOneOrFail(Profile, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      const patch: Partial<Profile> = {};
      if (dto.displayName != null) patch.displayName = dto.displayName;
      if (dto.bio !== undefined) patch.bio = dto.bio || null;
      if (dto.avatarUrl !== undefined) patch.avatarUrl = dto.avatarUrl || null;
      if (dto.websiteUrl !== undefined) patch.websiteUrl = dto.websiteUrl || null;
      if (dto.techStack != null) patch.techStack = mergeTechStack(profile.techStack, dto.techStack);

      if (Object.keys(patch).length) {
        await manager.update(Profile, { userId }, patch);
      }
      return toProfileView(user, await manager.findOneByOrFail(Profile, { userId }));
    });
  }

  /** Inserts the profile row if it is missing, named after the username. Returns the user. */
  private async ensureProfile(manager: EntityManager, userId: string): Promise<User> {
    const user = await manager.findOneBy(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await manager
      .createQueryBuilder()
      .insert()
      .into(Profile)
      .values({ userId, displayName: user.username })
      .orIgnore()
      .execute();
    return user;
  }

  // Follow services
  public async followUser() {
    
  }
}

function toProfileView(user: User, profile: Profile): ProfileView {
  return {
    userId: user.id,
    username: user.username,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    websiteUrl: profile.websiteUrl,
    techStack: mergeTechStack(profile.techStack, {}),
    updatedAt: profile.updatedAt,
  };
}
