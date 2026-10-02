import { PasswordHasher } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
export declare class CredentialsService {
    private readonly usersService;
    private readonly passwordHasher;
    constructor(usersService: UsersService, passwordHasher: PasswordHasher);
    register(email: string, password: string, username: string, lastName: string, firstName: string): Promise<Omit<User, 'passwordHash'>>;
    verify(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null>;
}
