var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, EmailVerificationHandler } from '@nestjs/authentication';
import { Mailer } from '@nestjs/mail';
import { UsersService } from '../users/users.service.js';
let VerifyMyEmailMail = class VerifyMyEmailMail {
    render({ url }) {
        return {
            subject: 'Confirm you email address',
            template: 'verify-email',
            context: { url },
        };
    }
};
VerifyMyEmailMail = __decorate([
    Injectable()
], VerifyMyEmailMail);
export { VerifyMyEmailMail };
let EmailVerificationMailer = class EmailVerificationMailer extends EmailVerificationHandler {
    usersService;
    mailer;
    constructor(usersService, mailer, registry) {
        super();
        this.usersService = usersService;
        this.mailer = mailer;
        registry.registerHandler('emailVerification', this);
    }
    async send(link) {
        await this.mailer.send(VerifyMyEmailMail, { to: link.email, data: link });
    }
    markVerified(id, email) {
        return this.usersService.markEmailVerified(id, email);
    }
};
EmailVerificationMailer = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        Mailer,
        AuthenticationRegistry])
], EmailVerificationMailer);
export { EmailVerificationMailer };
//# sourceMappingURL=email-verification.mailer.js.map