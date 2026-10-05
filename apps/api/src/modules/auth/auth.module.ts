import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { CredentialsService } from './credentials.service.js';
import { EmailVerificationMailer } from './email-verification.mailer.js';
import { EmailVerificationController } from './email-verification.controller.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { AccessTokenStrategy } from './strategies/access-token.strategy.js';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';


@Module({
  imports: [
    UsersModule,
    PassportModule,
    // No module-wide secret: AuthService passes the access or refresh secret on each sign
    JwtModule.register({}),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  controllers: [
    AuthController,
    EmailVerificationController
  ],
  providers: [
    CredentialsService,
    EmailVerificationMailer,
    AuthService,
    // Strategies register with passport when constructed, so each must be a provider
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    // Global guards run in this order: authenticate, then check roles
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [CredentialsService]
})
export class AuthModule {}
