var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Body, Post, Req, Get, HttpCode, HttpStatus, Res, UseGuards, } from '@nestjs/common';
import { EmailVerificationService } from '@nestjs/authentication';
import { CredentialsService } from './credentials.service.js';
import { AuthService } from './auth.service.js';
import { SignUpDto } from './dto/auth.dto.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard.js';
import { GoogleAuthGuard } from './guards/google-auth.guard.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { ACCESS_TOKEN_TTL_SECONDS, REFRESH_COOKIE, REFRESH_COOKIE_PATH } from './auth.constants.js';
let AuthController = class AuthController {
    credentialService;
    authService;
    emailVerificationService;
    constructor(credentialService, authService, emailVerificationService) {
        this.credentialService = credentialService;
        this.authService = authService;
        this.emailVerificationService = emailVerificationService;
    }
    async signUp(body) {
        const user = await this.credentialService.register(body.username, body.email, body.password);
        await this.emailVerificationService.send(user);
    }
    async googleAuth(req) { }
    googleAuthRedirect(req) {
        return this.authService.googleLogin(req);
    }
    async signIn(user, res) {
        return this.respondWithTokens(res, await this.authService.issueTokens(user));
    }
    async refresh(token, res) {
        return this.respondWithTokens(res, await this.authService.rotate(token));
    }
    async signOut(token, res) {
        await this.authService.revokeFamily(token.fam);
        res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
    }
    async signOutAll(user, res) {
        await this.authService.revokeAllForUser(user.id);
        res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
    }
    respondWithTokens(res, tokens) {
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
};
__decorate([
    Public(),
    Post('sign-up'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SignUpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signUp", null);
__decorate([
    Public(),
    Get('google'),
    UseGuards(GoogleAuthGuard),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    Get('google/redirect'),
    UseGuards(GoogleAuthGuard),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleAuthRedirect", null);
__decorate([
    Public(),
    UseGuards(LocalAuthGuard),
    HttpCode(HttpStatus.OK),
    Post('sign-in'),
    __param(0, CurrentUser()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
__decorate([
    Public(),
    UseGuards(JwtRefreshGuard),
    HttpCode(HttpStatus.OK),
    Post('refresh'),
    __param(0, CurrentUser()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    Public(),
    UseGuards(JwtRefreshGuard),
    HttpCode(HttpStatus.NO_CONTENT),
    Post('sign-out'),
    __param(0, CurrentUser()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signOut", null);
__decorate([
    HttpCode(HttpStatus.NO_CONTENT),
    Post('sign-out-all'),
    __param(0, CurrentUser()),
    __param(1, Res({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signOutAll", null);
AuthController = __decorate([
    Controller('auth'),
    __metadata("design:paramtypes", [CredentialsService,
        AuthService,
        EmailVerificationService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map