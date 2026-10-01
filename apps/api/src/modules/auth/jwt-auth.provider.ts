import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, JwtBearerProvider, type JwtClaims } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable() 
export class JwtAuth extends JwtBearerProvider<User> {
    constructor (
        private readonly usersService: UsersService,
        registry: AuthenticationRegistry
    ) {
        super({ realm: 'shoof' });

        registry.registerProvider(this, { order: 0 })
    }

    validate({ sub }: JwtClaims) {
        return sub ? this.usersService.findOne(sub) : null;
    }
}