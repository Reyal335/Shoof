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
import { BadRequestException, Body, ConflictException, Controller, HttpCode, Post } from '@nestjs/common';
import { CurrentUser, EmailVerificationService, Public } from '@nestjs/authentication';
let EmailVerificationController = class EmailVerificationController {
    emailVerificationService;
    constructor(emailVerificationService) {
        this.emailVerificationService = emailVerificationService;
    }
    async verify(token) {
        const verified = await this.emailVerificationService.verify(token);
        if (!verified) {
            throw new BadRequestException('Invalid or expired link');
        }
        return { email: verified.email, emailVerified: true };
    }
    async resend(user) {
        if (user.emailVerified) {
            throw new ConflictException('Email address already verified');
        }
        await this.emailVerificationService.send(user);
    }
};
__decorate([
    Public(),
    Post('verify'),
    HttpCode(200),
    __param(0, Body('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailVerificationController.prototype, "verify", null);
__decorate([
    Post('verification'),
    HttpCode(202),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], EmailVerificationController.prototype, "resend", null);
EmailVerificationController = __decorate([
    Controller('auth/email'),
    __metadata("design:paramtypes", [EmailVerificationService])
], EmailVerificationController);
export { EmailVerificationController };
//# sourceMappingURL=email-verification.controller.js.map