var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_ALGORITHM, JWT_ISSUER, REFRESH_COOKIE, REFRESH_TOKEN_AUDIENCE, jwtSecrets } from "../auth.constants.js";
const fromRefreshCookie = (req) => req?.cookies?.[REFRESH_COOKIE] ?? null;
let RefreshTokenStrategy = class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
    constructor(config) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([fromRefreshCookie]),
            secretOrKey: jwtSecrets(config).refresh,
            issuer: JWT_ISSUER,
            audience: REFRESH_TOKEN_AUDIENCE,
            algorithms: [JWT_ALGORITHM],
        });
    }
    validate(payload) {
        if (typeof payload.sub !== 'string' || typeof payload.jti !== 'string' || typeof payload.fam !== 'string') {
            throw new UnauthorizedException();
        }
        return payload;
    }
};
RefreshTokenStrategy = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ConfigService])
], RefreshTokenStrategy);
export { RefreshTokenStrategy };
//# sourceMappingURL=refresh-token.strategy.js.map