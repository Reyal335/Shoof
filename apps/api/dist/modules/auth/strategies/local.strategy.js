var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CredentialsService } from '../credentials.service.js';
let LocalStrategy = class LocalStrategy extends PassportStrategy(Strategy) {
    credentialsService;
    constructor(credentialsService) {
        super({ usernameField: 'email', passwordField: 'password' });
        this.credentialsService = credentialsService;
    }
    async validate(email, password) {
        const user = await this.credentialsService.verify(email, password);
        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return user;
    }
};
LocalStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [CredentialsService])
], LocalStrategy);
export { LocalStrategy };
//# sourceMappingURL=local.strategy.js.map