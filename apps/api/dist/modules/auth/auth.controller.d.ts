import { EmailVerificationService } from '@nestjs/authentication';
import type { Response } from 'express';
import { CredentialsService } from './credentials.service.js';
import { AuthService } from './auth.service.js';
import { SignUpDto } from './dto/auth.dto.js';
import type { AuthUser, RefreshTokenPayload } from './auth.types.js';
import type { User } from '../users/entities/user.entity.js';
export declare class AuthController {
    private readonly credentialService;
    private readonly authService;
    private readonly emailVerificationService;
    constructor(credentialService: CredentialsService, authService: AuthService, emailVerificationService: EmailVerificationService);
    signUp(body: SignUpDto): Promise<void>;
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any): {
        message: string;
        user: any;
    };
    signIn(user: Omit<User, 'passwordHash'>, res: Response): Promise<{
        accessToken: string;
        tokenType: string;
        expiresIn: number;
    }>;
    refresh(token: RefreshTokenPayload, res: Response): Promise<{
        accessToken: string;
        tokenType: string;
        expiresIn: number;
    }>;
    signOut(token: RefreshTokenPayload, res: Response): Promise<void>;
    signOutAll(user: AuthUser, res: Response): Promise<void>;
    private respondWithTokens;
}
