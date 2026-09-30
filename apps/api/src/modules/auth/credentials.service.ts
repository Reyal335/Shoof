import { ConflictException, Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class CredentialsService {
    constructor (
        private readonly usersService: UsersService,
        private readonly passwordHasher: PasswordHasher
    ) {}

    async register (
        email: string, 
        password: string, 
        username: string, 
        lastName: string, 
        firstName: string
    ): Promise<Omit<User, 'passwordHash'>> {
        if (await this.usersService.findByEmail(email)) {
            throw new ConflictException('Email already registered');
        }      

        const passwordHash = await this.passwordHasher.hash(password)

        return this.usersService.create({
            email, 
            passwordHash,
            username,
            lastName,
            firstName
        })
    }

    async verify(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
        const found = await this.usersService.findCredentials(email)

        const valid = await this.passwordHasher.verify(password, found?.passwordHash);
        if(!valid || !found?.passwordHash) {
            return null
        }

        return found.user
    }
}