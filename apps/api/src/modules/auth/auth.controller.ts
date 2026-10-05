import {
    Controller,
    Body,
    Post,
    HttpCode,
    HttpStatus,
    Res,
    UseGuards,
} from '@nestjs/common';
import { EmailVerificationService } from '@nestjs/authentication';
import type { Response } from 'express';
import { CredentialsService } from './credentials.service.js';
import { AuthService } from './auth.service.js';
import { SignUpDto } from './dto/auth.dto.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_COOKIE, REFRESH_COOKIE_PATH } from './auth.constants.js';
import type { AuthUser, IssuedTokens, RefreshTokenPayload } from './auth.types.js';
import type { User } from '../users/entities/user.entity.js';

@Controller('auth')
export class AuthController {
    constructor (
        private readonly credentialService: CredentialsService,
        private readonly authService: AuthService,
        private readonly emailVerificationService: EmailVerificationService
    ) {}

    @Public()
    @Post('sign-up')
    async signUp(@Body() body: SignUpDto) {
        const user = await this.credentialService.register(
            body.username,
            body.email,
            body.password,
        )

        // The link in the email proves the customer owns the address
        await this.emailVerificationService.send(user)
    }

    // LocalAuthGuard checks the email and password before this runs
    @Public()
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('sign-in')
    async signIn(
        @CurrentUser() user: Omit<User, 'passwordHash'>,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.respondWithTokens(res, await this.authService.issueTokens(user));
    }

    // @Public(): the access token has usually expired by now; the refresh cookie is the credential
    @Public()
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(
        @CurrentUser() token: RefreshTokenPayload,
        @Res({ passthrough: true }) res: Response,
    ) {
        return this.respondWithTokens(res, await this.authService.rotate(token));
    }

    // Ends this device's sign-in
    @Public()
    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('sign-out')
    async signOut(
        @CurrentUser() token: RefreshTokenPayload,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.authService.revokeFamily(token.fam);
        res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
    }

    // Ends every sign-in of this account. Access tokens already issued live out their 15 minutes.
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('sign-out-all')
    async signOutAll(
        @CurrentUser() user: AuthUser,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.authService.revokeAllForUser(user.id);
        res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
    }

    // The refresh token goes in an httpOnly cookie, out of reach of page scripts;
    // the access token goes in the body, for the client to keep in memory
    private respondWithTokens(res: Response, tokens: IssuedTokens) {
        res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: REFRESH_COOKIE_PATH,
            expires: tokens.refreshExpiresAt,
        });

        return {
            accessToken: tokens.accessToken,
            tokenType: 'Bearer',
            expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        };
    }
}
