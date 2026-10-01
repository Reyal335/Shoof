import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { CredentialsService } from './credentials.service.js';
import { EmailVerificationMailer } from './email-verification.mailer.js';
import { JwtAuth } from './jwt-auth.provider.js';

@Module({
  imports: [UsersModule],
  controllers: [
    AuthController,
  ],
  providers: [
    CredentialsService,
    EmailVerificationMailer,
    JwtAuth
  ],
  exports: [CredentialsService]
})
export class AuthModule {}
