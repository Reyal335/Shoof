var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
let CredentialsService = class CredentialsService {
    usersService;
    passwordHasher;
    constructor(usersService, passwordHasher) {
        this.usersService = usersService;
        this.passwordHasher = passwordHasher;
    }
    async register(email, password, username, lastName, firstName) {
        if (await this.usersService.findByEmail(email)) {
            throw new ConflictException('Email already registered');
        }
        const passwordHash = await this.passwordHasher.hash(password);
        return this.usersService.create({
            email,
            passwordHash,
            username,
            lastName,
            firstName
        });
    }
    async verify(email, password) {
        const found = await this.usersService.findCredentials(email);
        const valid = await this.passwordHasher.verify(password, found?.passwordHash);
        if (!valid || !found?.passwordHash) {
            return null;
        }
        return found.user;
    }
};
CredentialsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        PasswordHasher])
], CredentialsService);
export { CredentialsService };
//# sourceMappingURL=credentials.service.js.map