import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_ALGORITHM, JWT_ISSUER, REFRESH_COOKIE, REFRESH_TOKEN_AUDIENCE, jwtSecrets } from "../auth.constants.js";
import type { RefreshTokenPayload } from "../auth.types.js";

const fromRefreshCookie = (req: Request): string | null => req?.cookies?.[REFRESH_COOKIE] ?? null;

// Proves the cookie holds a refresh token we signed and that hasn't expired.
// Whether it is still current (not rotated or signed out) is AuthService.rotate()'s job.
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromRefreshCookie]),
      secretOrKey: jwtSecrets(config).refresh,
      issuer: JWT_ISSUER,
      audience: REFRESH_TOKEN_AUDIENCE,
      algorithms: [JWT_ALGORITHM],
    });
  }

  validate(payload: RefreshTokenPayload): RefreshTokenPayload {
    if (typeof payload.sub !== 'string' || typeof payload.jti !== 'string' || typeof payload.fam !== 'string') {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
