import { EmailVerificationService } from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
import type { AuthUser } from './auth.types.js';
export declare class EmailVerificationController {
    private readonly emailVerificationService;
    private readonly usersService;
    constructor(emailVerificationService: EmailVerificationService, usersService: UsersService);
    verify(token: string): Promise<{
        email: string;
        emailVerified: boolean;
    }>;
    resend(authUser: AuthUser): Promise<void>;
}
