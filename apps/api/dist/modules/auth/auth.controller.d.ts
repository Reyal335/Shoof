import { CredentialsService } from './credentials.service.js';
import { TokenService } from '@nestjs/authentication';
import { SignInDto, SignUpDto } from './dto/auth.dto.js';
import { EmailVerificationService } from '@nestjs/authentication';
export declare class AuthController {
    private readonly tokenService;
    private readonly credentialService;
    private readonly emailVerificationService;
    constructor(tokenService: TokenService, credentialService: CredentialsService, emailVerificationService: EmailVerificationService);
    signUp(body: SignUpDto): Promise<import("@nestjs/authentication").TokenPair>;
    signIn(body: SignInDto): Promise<import("@nestjs/authentication").TokenPair>;
}
