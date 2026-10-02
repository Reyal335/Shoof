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
import { Controller, Body, Post, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { CredentialsService } from './credentials.service.js';
import { Public, TokenService } from '@nestjs/authentication';
import { SignInDto, SignUpDto } from './dto/auth.dto.js';
import { EmailVerificationService } from '@nestjs/authentication';
let AuthController = class AuthController {
    tokenService;
    credentialService;
    emailVerificationService;
    constructor(tokenService, credentialService, emailVerificationService) {
        this.tokenService = tokenService;
        this.credentialService = credentialService;
        this.emailVerificationService = emailVerificationService;
    }
    async signUp(body) {
        const user = await this.credentialService.register(body.email, body.password, body.username, body.lastName, body.firstName);
        await this.emailVerificationService.send(user);
        return this.tokenService.issue(user.id, {
            method: 'password'
        });
    }
    async signIn(body) {
        const user = await this.credentialService.verify(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return this.tokenService.issue(user.id, {
            method: 'password',
        });
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
    HttpCode(HttpStatus.OK),
    Post('sign-in'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SignInDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signIn", null);
AuthController = __decorate([
    Controller('auth'),
    __metadata("design:paramtypes", [TokenService,
        CredentialsService,
        EmailVerificationService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map