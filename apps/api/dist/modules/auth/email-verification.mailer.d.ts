import { AuthenticationRegistry, EmailVerificationHandler, type EmailVerificationLink } from '@nestjs/authentication';
import { Mailer, type Mailable } from '@nestjs/mail';
import { UsersService } from '../users/users.service.js';
export declare class VerifyMyEmailMail implements Mailable<EmailVerificationLink> {
    render({ url }: EmailVerificationLink): {
        subject: string;
        template: string;
        context: {
            url: string;
        };
    };
}
export declare class EmailVerificationMailer extends EmailVerificationHandler {
    private readonly usersService;
    private readonly mailer;
    constructor(usersService: UsersService, mailer: Mailer, registry: AuthenticationRegistry);
    send(link: EmailVerificationLink): Promise<void>;
    markVerified(id: string, email: string): Promise<boolean>;
}
