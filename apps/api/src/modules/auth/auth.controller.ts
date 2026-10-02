import { Controller, Body, Post, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { CredentialsService } from './credentials.service.js';
import { Public, TokenService } from '@nestjs/authentication';
import { SignInDto, SignUpDto } from './dto/auth.dto.js';
import { EmailVerificationService } from '@nestjs/authentication';

@Controller('auth')
export class AuthController {
    constructor (
        private readonly tokenService: TokenService,
        private readonly credentialService: CredentialsService,
        private readonly emailVerificationService: EmailVerificationService
    ) {}

    @Public()
    @Post('sign-up')
    async signUp(@Body() body: SignUpDto) {
        const user = await this.credentialService.register(
            body.email,
            body.password,
            body.username,
            body.lastName,
            body.firstName,
        )
        
        // The link in the email proves the customer owns the address
        await this.emailVerificationService.send(user)

        return this.tokenService.issue(user.id, {
            method: 'password'
        })
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    async signIn(@Body() body: SignInDto) {
        const user = await this.credentialService.verify(body.email, body.password);
        if(!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return this.tokenService.issue(user.id, {
            method: 'password',
        });
    }
}
