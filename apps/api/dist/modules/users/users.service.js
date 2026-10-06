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
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { NotFoundException } from '@nestjs/common';
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
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
            const savedUser = await this.usersRepository.save(newUser);
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
    findAll() {
        return this.usersRepository.find();
    }
    async findOne(id) {
        const foundUser = await this.usersRepository.findOneBy({ id });
        if (!foundUser) {
            return null;
        }
        const { passwordHash, ...result } = foundUser;
        return result;
    }
    async findByEmail(email) {
        const foundUser = await this.usersRepository.findOneBy({ email });
        if (!foundUser) {
            return null;
        }
        const { passwordHash, ...result } = foundUser;
        return result;
    }
    async findCredentials(email) {
        const found = await this.usersRepository.findOneBy({ email });
        if (!found) {
            return null;
        }
        const { passwordHash, ...user } = found;
        return { user, passwordHash };
    }
    async update(id, updateUserDto) {
        const result = await this.usersRepository.update(id, updateUserDto);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return await this.usersRepository.findOneBy({ id });
    }
    async remove(id) {
        await this.usersRepository.delete(id);
    }
    async markEmailVerified(id, email) {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user || user.email !== email) {
            return false;
        }
        return true;
    }
    async findByIdentity(provider, subject) {
        return this.usersRepository.findOneBy({ id: "1" });
    }
    async linkIdentity(id, provider, subject) {
        return;
    }
};
UsersService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map