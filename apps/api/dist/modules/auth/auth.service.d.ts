import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import type { User } from '../users/entities/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import type { IssuedTokens, RefreshTokenPayload } from './auth.types.js';
interface TokenFamily {
    familyId: string;
    familyExpiresAt: Date;
}
export declare class AuthService {
    private readonly refreshTokens;
    private readonly usersService;
    private readonly jwtService;
    private readonly secrets;
    constructor(refreshTokens: Repository<RefreshToken>, usersService: UsersService, jwtService: JwtService, config: ConfigService);
    googleLogin(req: any): {
        message: string;
        user: any;
    };
    issueTokens(user: Pick<User, 'id' | 'role'>, family?: TokenFamily): Promise<IssuedTokens>;
    rotate({ sub, jti }: RefreshTokenPayload): Promise<IssuedTokens>;
    revokeFamily(familyId: string): Promise<void>;
    revokeAllForUser(userId: string): Promise<void>;
}
export {};
