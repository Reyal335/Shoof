import { EmailVerificationService } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity.js';
export declare class EmailVerificationController {
    private readonly emailVerificationService;
    constructor(emailVerificationService: EmailVerificationService);
    verify(token: string): Promise<{
        email: string;
        emailVerified: boolean;
    }>;
    resend(user: User): Promise<void>;
}
