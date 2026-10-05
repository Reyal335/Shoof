import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN_AUDIENCE, JWT_ALGORITHM, JWT_ISSUER, jwtSecrets } from "../auth.constants.js";
import type { AccessTokenPayload, AuthUser } from "../auth.types.js";


@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecrets(config).access,
      issuer: JWT_ISSUER,
      audience: ACCESS_TOKEN_AUDIENCE,
      algorithms: [JWT_ALGORITHM],
    });
  }

  // Runs only after the signature, exp, iss and aud checked out. No database read:
  // a disabled user keeps access until the token expires (at most 15 minutes).
  validate(payload: AccessTokenPayload): AuthUser {
    if (typeof payload.sub !== 'string' || !Array.isArray(payload.roles)) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, roles: payload.roles };
  }
}
