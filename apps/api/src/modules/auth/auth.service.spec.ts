import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { AuthService } from './auth.service.js';
import { jwtSecrets } from './auth.constants.js';
import type { AccessTokenPayload, RefreshTokenPayload } from './auth.types.js';
import { UserRole, type User } from '../users/entities/user.entity.js';
import type { UsersService } from '../users/users.service.js';
import { fakeRefreshTokens } from '../../../test/fakes/refresh-tokens.fake.js';

const ACCESS_SECRET = 'a'.repeat(32);
const REFRESH_SECRET = 'r'.repeat(32);
const DAY = 24 * 60 * 60;

describe('AuthService', () => {
  const user: Pick<User, 'id' | 'role' | 'isActive'> = { id: randomUUID(), role: UserRole.MEMBER, isActive: true };
  const jwt = new JwtService();
  let refreshTokens: ReturnType<typeof fakeRefreshTokens>;
  let usersService: { findOne: ReturnType<typeof vi.fn> };
  let service: AuthService;

  const decodeRefresh = (token: string) =>
    jwt.verify<RefreshTokenPayload>(token, { secret: REFRESH_SECRET, audience: 'shoof-refresh', issuer: 'shoof-api' });

  beforeEach(() => {
    refreshTokens = fakeRefreshTokens();
    usersService = { findOne: vi.fn().mockResolvedValue(user) };
    service = new AuthService(
      refreshTokens,
      usersService as unknown as UsersService,
      jwt,
      new ConfigService({ JWT_ACCESS_SECRET: ACCESS_SECRET, JWT_REFRESH_SECRET: REFRESH_SECRET }),
    );
  });

  describe('issueTokens', () => {
    it('signs an access token with sub, roles, iat and exp', async () => {
      const { accessToken } = await service.issueTokens(user);

      const claims = jwt.verify<AccessTokenPayload>(accessToken, {
        secret: ACCESS_SECRET,
        audience: 'shoof-client',
        issuer: 'shoof-api',
      });
      expect(claims.sub).toBe(user.id);
      expect(claims.roles).toEqual([UserRole.MEMBER]);
      expect(claims.exp - claims.iat).toBe(15 * 60);
    });

    it('signs a refresh token whose jti is its stored row', async () => {
      const { refreshToken } = await service.issueTokens(user);

      const claims = decodeRefresh(refreshToken);
      const row = refreshTokens.rows.get(claims.jti)!;
      expect(row.userId).toBe(user.id);
      expect(row.familyId).toBe(claims.fam);
      expect(claims.exp - claims.iat).toBe(30 * DAY);
    });

    it('keeps the two kinds of token apart', async () => {
      const { accessToken, refreshToken } = await service.issueTokens(user);

      expect(() => jwt.verify(accessToken, { secret: REFRESH_SECRET })).toThrow();
      expect(() => jwt.verify(refreshToken, { secret: ACCESS_SECRET })).toThrow();
    });

    it('never lets a refresh token outlive its family', async () => {
      const familyExpiresAt = new Date(Date.now() + 3600 * 1000);
      const { refreshToken } = await service.issueTokens(user, { familyId: randomUUID(), familyExpiresAt });

      const claims = decodeRefresh(refreshToken);
      expect(claims.exp - claims.iat).toBeLessThanOrEqual(3600);
    });

    it('refuses a family past its maximum age', async () => {
      const familyExpiresAt = new Date(Date.now() - 1000);
      await expect(service.issueTokens(user, { familyId: randomUUID(), familyExpiresAt }))
        .rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('rotate', () => {
    it('trades a refresh token for a new pair in the same family', async () => {
      const first = decodeRefresh((await service.issueTokens(user)).refreshToken);

      const second = decodeRefresh((await service.rotate(first)).refreshToken);

      expect(second.jti).not.toBe(first.jti);
      expect(second.fam).toBe(first.fam);
      expect(refreshTokens.rows.get(first.jti)!.revokedAt).not.toBeNull();
      expect(refreshTokens.rows.get(second.jti)!.revokedAt).toBeNull();
      expect(refreshTokens.rows.get(second.jti)!.familyExpiresAt)
        .toEqual(refreshTokens.rows.get(first.jti)!.familyExpiresAt);
    });

    it('treats a reused refresh token as stolen and revokes its whole family', async () => {
      const first = decodeRefresh((await service.issueTokens(user)).refreshToken);
      const second = decodeRefresh((await service.rotate(first)).refreshToken);

      await expect(service.rotate(first)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(refreshTokens.rows.get(second.jti)!.revokedAt).not.toBeNull();
      await expect(service.rotate(second)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('leaves other sign-ins alone when one family is revoked', async () => {
      const phone = decodeRefresh((await service.issueTokens(user)).refreshToken);
      const laptop = decodeRefresh((await service.issueTokens(user)).refreshToken);

      await service.revokeFamily(phone.fam);

      await expect(service.rotate(phone)).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(service.rotate(laptop)).resolves.toHaveProperty('accessToken');
    });

    it('refuses a disabled user and ends the sign-in', async () => {
      const first = decodeRefresh((await service.issueTokens(user)).refreshToken);
      usersService.findOne.mockResolvedValue({ ...user, isActive: false });

      await expect(service.rotate(first)).rejects.toBeInstanceOf(UnauthorizedException);
      expect([...refreshTokens.rows.values()].every((row) => row.revokedAt)).toBe(true);
    });

    it('puts the current role in the new access token', async () => {
      const first = decodeRefresh((await service.issueTokens(user)).refreshToken);
      usersService.findOne.mockResolvedValue({ ...user, role: UserRole.MODERATOR });

      const { accessToken } = await service.rotate(first);

      expect(jwt.decode<AccessTokenPayload>(accessToken).roles).toEqual([UserRole.MODERATOR]);
    });

    it('refuses a token with no stored row', async () => {
      await expect(service.rotate({ sub: user.id, jti: randomUUID(), fam: randomUUID() } as RefreshTokenPayload))
        .rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  it('revokeAllForUser ends every sign-in', async () => {
    const a = decodeRefresh((await service.issueTokens(user)).refreshToken);
    const b = decodeRefresh((await service.issueTokens(user)).refreshToken);

    await service.revokeAllForUser(user.id);

    await expect(service.rotate(a)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.rotate(b)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('jwtSecrets', () => {
  const config = (access: string, refresh: string) =>
    new ConfigService({ JWT_ACCESS_SECRET: access, JWT_REFRESH_SECRET: refresh });

  it('refuses a short secret', () => {
    expect(() => jwtSecrets(config('short', REFRESH_SECRET))).toThrow(/at least 32/);
  });

  it('refuses the same secret for both tokens', () => {
    expect(() => jwtSecrets(config(ACCESS_SECRET, ACCESS_SECRET))).toThrow(/must be different/);
  });
});
