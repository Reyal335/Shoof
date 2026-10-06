var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
import { GoogleStrategy } from './strategies/google-strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
        imports: [
            UsersModule,
            PassportModule,
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
            LocalStrategy,
            AccessTokenStrategy,
            RefreshTokenStrategy,
            GoogleStrategy,
            { provide: APP_GUARD, useClass: JwtAuthGuard },
            { provide: APP_GUARD, useClass: RolesGuard },
        ],
        exports: [CredentialsService]
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map