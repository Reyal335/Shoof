import { BadRequestException, Body, ConflictException, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { EmailVerificationService } from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import type { AuthUser } from './auth.types.js';

@Controller('auth/email')
export class EmailVerificationController {
    constructor(
        private readonly emailVerificationService: EmailVerificationService,
        private readonly usersService: UsersService
    ) {}

    @Public()
    @Post('verify')
    @HttpCode(200)
    async verify(@Body('token') token: string) {
        const verified = await this.emailVerificationService.verify(token);
        
        if (!verified) {
            throw new BadRequestException('Invalid or expired link')
        }

        return { email: verified.email, emailVerified: true }
    }

    // Send the link again
    @Post('verification')
    @HttpCode(202)
    async resend(@CurrentUser() authUser: AuthUser) {
        const user = await this.usersService.findOne(authUser.id)
        if (!user) {
            throw new UnauthorizedException()
        }
        if (user.emailVerified) {
            throw new ConflictException('Email address already verified')
        }
        await this.emailVerificationService.send(user)
    }
}
