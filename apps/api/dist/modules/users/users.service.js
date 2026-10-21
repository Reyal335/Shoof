var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity.js';
import { User_Identity } from './entities/user-identity.js';
import { Profile } from './entities/profile.entity.js';
import { UserSkill } from './entities/user-skill.entity.js';
import { SkillsService, toSkillSummary } from '../skills/skills.service.js';
import { NotFoundException } from '@nestjs/common';
export function toUserSummary(user) {
    return {
        id: user.id,
        username: user.username,
        displayName: user.profile?.displayName || user.username,
        avatarUrl: user.profile?.avatarUrl ?? null,
    };
}
const ACCOUNT_COLUMNS = { id: true, email: true, username: true, emailVerified: true, role: true, createdAt: true };
export function toAccountView(user) {
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
    };
}
let UsersService = class UsersService {
    usersRepository;
    userIdentityRepository;
    profilesRepository;
    userSkillsRepository;
    skillsService;
    constructor(usersRepository, userIdentityRepository, profilesRepository, userSkillsRepository, skillsService) {
        this.usersRepository = usersRepository;
        this.userIdentityRepository = userIdentityRepository;
        this.profilesRepository = profilesRepository;
        this.userSkillsRepository = userSkillsRepository;
        this.skillsService = skillsService;
    }
    users = [
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
    async create(createUserDto) {
        const newUser = this.usersRepository.create(createUserDto);
        try {
            const savedUser = await this.usersRepository.manager.transaction(async (manager) => {
                const user = await manager.save(newUser);
                await manager.insert(Profile, { userId: user.id, displayName: user.username });
                return user;
            });
            const { passwordHash, ...result } = savedUser;
            return result;
        }
        catch (error) {
            console.log('There was an error during the save');
            throw error;
        }
    }
    async createWithEmail(createWithSignIn) {
    }
    async findOne(id) {
        const foundUser = await this.usersRepository.findOneBy({ id });
        if (!foundUser) {
            return null;
        }
        const { passwordHash, ...result } = foundUser;
        return result;
    }
    async findAccount(id) {
        const user = await this.usersRepository.findOne({ where: { id }, select: ACCOUNT_COLUMNS });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return toAccountView(user);
    }
    async findByEmail(email) {
        const foundUser = await this.usersRepository.findOneBy({ email });
        if (!foundUser) {
            return null;
        }
        const { passwordHash, ...result } = foundUser;
        return result;
    }
    async findByUsername(username) {
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
                    country: true
                },
            }
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
    async findPublicProfile(username) {
        const user = await this.findByUsername(username);
        return { ...user, skills: await this.findSkills(user.id) };
    }
    async findIdByUsername(username) {
        const user = await this.usersRepository.findOne({ where: { username, isActive: true }, select: { id: true } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user.id;
    }
    async findSummariesByIds(ids) {
        const users = await this.findPublicByIds([...new Set(ids)]);
        return users.map(toUserSummary);
    }
    async findPublicByIds(ids) {
        if (!ids.length)
            return [];
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
                    country: true
                },
            }
        });
        return users;
    }
    async findCredentials(email) {
        const found = await this.usersRepository.findOneBy({ email });
        if (!found) {
            return null;
        }
        const { passwordHash, ...user } = found;
        return { user, passwordHash };
    }
    async remove(id) {
        await this.usersRepository.delete(id);
    }
    async markEmailVerified(id, email) {
        try {
            const result = await this.usersRepository.update([{ id }, { email }], { emailVerified: true });
            if (result.affected === 0) {
                return false;
            }
            return true;
        }
        catch (err) {
            throw err;
        }
    }
    async findByIdentity(provider, subject) {
        return null;
    }
    async linkIdentity(id, provider, subject) {
        return;
    }
    async findProfile(userId) {
        const { user, profile } = await this.profilesRepository.manager.transaction(async (manager) => {
            const user = await this.ensureProfile(manager, userId);
            return { user, profile: await manager.findOneByOrFail(Profile, { userId }) };
        });
        return toProfileView(user, profile, await this.findSkills(userId));
    }
    async updateProfile(userId, dto) {
        const skillIds = dto.skillIds != null ? await this.checkSkills(dto.skillIds) : null;
        const { user, profile } = await this.profilesRepository.manager.transaction(async (manager) => {
            const user = await this.ensureProfile(manager, userId);
            await manager.findOneOrFail(Profile, {
                where: { userId },
                lock: { mode: 'pessimistic_write' },
            });
            const patch = {};
            if (dto.displayName != null)
                patch.displayName = dto.displayName;
            if (dto.bio !== undefined)
                patch.bio = dto.bio || null;
            if (dto.avatarUrl !== undefined)
                patch.avatarUrl = dto.avatarUrl || null;
            if (dto.websiteUrl !== undefined)
                patch.websiteUrl = dto.websiteUrl || null;
            if (Object.keys(patch).length) {
                await manager.update(Profile, { userId }, patch);
            }
            if (skillIds != null) {
                await manager.delete(UserSkill, { userId });
                if (skillIds.length) {
                    await manager.insert(UserSkill, skillIds.map((skillId) => ({ userId, skillId })));
                }
            }
            return { user, profile: await manager.findOneByOrFail(Profile, { userId }) };
        });
        return toProfileView(user, profile, await this.findSkills(userId));
    }
    async findSkills(userId) {
        const rows = await this.userSkillsRepository.find({ where: { userId }, select: { skillId: true } });
        const skills = await this.skillsService.findByIds(rows.map((row) => row.skillId));
        return skills.map(toSkillSummary);
    }
    async checkSkills(ids) {
        const unique = [...new Set(ids)];
        const found = await this.skillsService.findByIds(unique);
        if (found.length !== unique.length) {
            throw new BadRequestException('One or more skills do not exist');
        }
        return unique;
    }
    async ensureProfile(manager, userId) {
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
};
UsersService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __param(1, InjectRepository(User_Identity)),
    __param(2, InjectRepository(Profile)),
    __param(3, InjectRepository(UserSkill)),
    __metadata("design:paramtypes", [Repository,
        Repository,
        Repository,
        Repository,
        SkillsService])
], UsersService);
export { UsersService };
function toProfileView(user, profile, skills) {
    return {
        userId: user.id,
        username: user.username,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        websiteUrl: profile.websiteUrl,
        skills,
        updatedAt: profile.updatedAt,
    };
}
//# sourceMappingURL=users.service.js.map