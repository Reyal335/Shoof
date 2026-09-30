import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, SessionCookieProvider, type SessionRecord } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class SessionAuth extends SessionCookieProvider<User> {
    constructor(
        private readonly usersService: UsersService,
        registry: AuthenticationRegistry
    ) {
        super()
        registry.registerProvider(this);
    }

    validate(session: SessionRecord) {
        return this.usersService.findOne(session.userId)
    }
}