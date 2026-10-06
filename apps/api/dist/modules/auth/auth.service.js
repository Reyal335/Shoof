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
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { IsNull, Repository } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { ACCESS_TOKEN_AUDIENCE, ACCESS_TOKEN_TTL_SECONDS, JWT_ALGORITHM, JWT_ISSUER, REFRESH_FAMILY_MAX_AGE_SECONDS, REFRESH_TOKEN_AUDIENCE, REFRESH_TOKEN_TTL_SECONDS, jwtSecrets, } from './auth.constants.js';
let AuthService = class AuthService {
    refreshTokens;
    usersService;
    jwtService;
    secrets;
    constructor(refreshTokens, usersService, jwtService, config) {
        this.refreshTokens = refreshTokens;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.secrets = jwtSecrets(config);
    }
    googleLogin(req) {
        if (!req.user) {
            throw new UnauthorizedException('No Google User');
        }
        return {
            message: 'User information from Google',
            user: req.user
        };
    }
    async issueTokens(user, family) {
        const now = Date.now();
        const familyId = family?.familyId ?? randomUUID();
        const familyExpiresAt = family?.familyExpiresAt ?? new Date(now + REFRESH_FAMILY_MAX_AGE_SECONDS * 1000);
        const refreshExpiresAt = new Date(Math.min(now + REFRESH_TOKEN_TTL_SECONDS * 1000, familyExpiresAt.getTime()));
        const refreshTtlSeconds = Math.floor((refreshExpiresAt.getTime() - now) / 1000);
        if (refreshTtlSeconds <= 0) {
            throw new UnauthorizedException('Session expired');
        }
        const record = await this.refreshTokens.save(this.refreshTokens.create({ userId: user.id, familyId, expiresAt: refreshExpiresAt, familyExpiresAt }));
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: user.id, roles: [user.role] }, {
                secret: this.secrets.access,
                expiresIn: ACCESS_TOKEN_TTL_SECONDS,
                issuer: JWT_ISSUER,
                audience: ACCESS_TOKEN_AUDIENCE,
                algorithm: JWT_ALGORITHM,
            }),
            this.jwtService.signAsync({ sub: user.id, fam: familyId }, {
                secret: this.secrets.refresh,
                expiresIn: refreshTtlSeconds,
                jwtid: record.id,
                issuer: JWT_ISSUER,
                audience: REFRESH_TOKEN_AUDIENCE,
                algorithm: JWT_ALGORITHM,
            }),
        ]);
        return { accessToken, refreshToken, refreshExpiresAt };
    }
    async rotate({ sub, jti }) {
        const claimed = await this.refreshTokens.update({ id: jti, userId: sub, revokedAt: IsNull() }, { revokedAt: new Date() });
        const record = await this.refreshTokens.findOneBy({ id: jti, userId: sub });
        if (!record) {
            throw new UnauthorizedException();
        }
        if (!claimed.affected) {
            await this.revokeFamily(record.familyId);
            throw new UnauthorizedException();
        }
        const user = await this.usersService.findOne(sub);
        if (!user?.isActive) {
            await this.revokeFamily(record.familyId);
            throw new UnauthorizedException();
        }
        return this.issueTokens(user, { familyId: record.familyId, familyExpiresAt: record.familyExpiresAt });
    }
    async revokeFamily(familyId) {
        await this.refreshTokens.update({ familyId, revokedAt: IsNull() }, { revokedAt: new Date() });
    }
    async revokeAllForUser(userId) {
        await this.refreshTokens.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
    }
};
AuthService = __decorate([
    Injectable(),
    __param(0, InjectRepository(RefreshToken)),
    __metadata("design:paramtypes", [Repository,
        UsersService,
        JwtService,
        ConfigService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map