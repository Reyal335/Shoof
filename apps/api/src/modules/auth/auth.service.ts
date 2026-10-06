import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { IsNull, Repository } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import type { User } from '../users/entities/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import {
  ACCESS_TOKEN_AUDIENCE,
  ACCESS_TOKEN_TTL_SECONDS,
  JWT_ALGORITHM,
  JWT_ISSUER,
  REFRESH_FAMILY_MAX_AGE_SECONDS,
  REFRESH_TOKEN_AUDIENCE,
  REFRESH_TOKEN_TTL_SECONDS,
  jwtSecrets,
  type JwtSecrets,
} from './auth.constants.js';
import type { IssuedTokens, RefreshTokenPayload } from './auth.types.js';

interface TokenFamily {
  familyId: string;
  familyExpiresAt: Date;
}

@Injectable()
export class AuthService {
  private readonly secrets: JwtSecrets;

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    this.secrets = jwtSecrets(config);
  }

  googleLogin(req: any) {
    if (!req.user) {
      throw new UnauthorizedException('No Google User')
    }

    return {
      message: 'User information from Google',
      user: req.user
    }
  }

  // A new access token and a refresh token, in a new family (sign-in) or an existing one (rotation)
  async issueTokens(user: Pick<User, 'id' | 'role'>, family?: TokenFamily): Promise<IssuedTokens> {
    const now = Date.now();
    const familyId = family?.familyId ?? randomUUID();
    const familyExpiresAt = family?.familyExpiresAt ?? new Date(now + REFRESH_FAMILY_MAX_AGE_SECONDS * 1000);
    const refreshExpiresAt = new Date(Math.min(now + REFRESH_TOKEN_TTL_SECONDS * 1000, familyExpiresAt.getTime()));
    const refreshTtlSeconds = Math.floor((refreshExpiresAt.getTime() - now) / 1000);
    if (refreshTtlSeconds <= 0) {
      throw new UnauthorizedException('Session expired');
    }

    const record = await this.refreshTokens.save(
      this.refreshTokens.create({ userId: user.id, familyId, expiresAt: refreshExpiresAt, familyExpiresAt }),
    );

    const [accessToken, refreshToken] = await Promise.all([
      // iat and exp are added by the signer
      this.jwtService.signAsync(
        { sub: user.id, roles: [user.role] },
        {
          secret: this.secrets.access,
          expiresIn: ACCESS_TOKEN_TTL_SECONDS,
          issuer: JWT_ISSUER,
          audience: ACCESS_TOKEN_AUDIENCE,
          algorithm: JWT_ALGORITHM,
        },
      ),
      this.jwtService.signAsync(
        { sub: user.id, fam: familyId },
        {
          secret: this.secrets.refresh,
          expiresIn: refreshTtlSeconds,
          jwtid: record.id,
          issuer: JWT_ISSUER,
          audience: REFRESH_TOKEN_AUDIENCE,
          algorithm: JWT_ALGORITHM,
        },
      ),
    ]);

    return { accessToken, refreshToken, refreshExpiresAt };
  }

  // Trades a valid refresh token for a new pair. Each refresh token works once.
  async rotate({ sub, jti }: RefreshTokenPayload): Promise<IssuedTokens> {
    // One conditional UPDATE: of two requests racing with the same token, only one claims it
    const claimed = await this.refreshTokens.update(
      { id: jti, userId: sub, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    const record = await this.refreshTokens.findOneBy({ id: jti, userId: sub });
    if (!record) {
      throw new UnauthorizedException();
    }

    if (!claimed.affected) {
      // A rotated or signed-out token came back: someone holds a copy.
      // End the whole sign-in, which signs out the thief and the owner alike.
      await this.revokeFamily(record.familyId);
      throw new UnauthorizedException();
    }

    // Roles are read fresh, so a role change reaches the next access token
    const user = await this.usersService.findOne(sub);
    if (!user?.isActive) {
      await this.revokeFamily(record.familyId);
      throw new UnauthorizedException();
    }

    return this.issueTokens(user, { familyId: record.familyId, familyExpiresAt: record.familyExpiresAt });
  }

  // Signs out one sign-in (one device)
  async revokeFamily(familyId: string): Promise<void> {
    await this.refreshTokens.update({ familyId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  // Signs out everywhere: for password changes and account compromise
  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokens.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }
}
