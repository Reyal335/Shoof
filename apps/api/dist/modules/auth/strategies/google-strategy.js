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
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { UsersService } from '../../users/users.service.js';
let GoogleStrategy = class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(config, userService) {
        super({
            clientID: config.getOrThrow('GOOGLE_CLIENT_ID'),
            clientSecret: config.getOrThrow('GOOGLE_CLIENT_SECRET'),
            callbackURL: config.get('GOOGLE_CALLBACK_URL', 'http://localhost:5000/api/v1/auth/google/redirect'),
            scope: ['email', 'profile']
        });
    }
    async validate(accessToken, refreshToken, profile, done) {
        const { emails } = profile;
        const user = {
            username: profile.displayName,
            email: emails[0].value,
            accessToken
        };
        return user;
    }
};
GoogleStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService,
        UsersService])
], GoogleStrategy);
export { GoogleStrategy };
//# sourceMappingURL=google-strategy.js.map