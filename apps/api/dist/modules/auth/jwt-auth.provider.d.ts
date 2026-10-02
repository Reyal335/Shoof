import { AuthenticationRegistry, JwtBearerProvider, type JwtClaims } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
export declare class JwtAuth extends JwtBearerProvider<User> {
    private readonly usersService;
    constructor(usersService: UsersService, registry: AuthenticationRegistry);
    validate({ sub }: JwtClaims): Promise<User | null> | null;
}
