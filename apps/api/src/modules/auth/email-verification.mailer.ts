import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, EmailVerificationHandler, type EmailVerificationLink } from '@nestjs/authentication';
import { Mailer, type Mailable } from '@nestjs/mail';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class VerifyMyEmailMail implements Mailable<EmailVerificationLink> {
    render({ url }: EmailVerificationLink) {
        return {
            subject: 'Confirm you email address',
            template: 'verify-email',
            context: { url },
        }
    }
}

@Injectable()
export class EmailVerificationMailer extends EmailVerificationHandler {
    constructor(
        private readonly usersService: UsersService,
        private readonly mailer: Mailer,
        registry: AuthenticationRegistry
    ) {
        super();
        registry.registerHandler('emailVerification', this)
    }

    async send(link: EmailVerificationLink) {
        await this.mailer.send(VerifyMyEmailMail, { to: link.email, data: link })
    }

    // Runs when link is used. Verifies nothing if the address changed since
    markVerified(id: string, email: string) {
        return this.usersService.markEmailVerified(id, email);
    }
}

