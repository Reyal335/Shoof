import { Controller, Get, type INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthenticationModule } from '@nestjs/authentication';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AuthModule } from '../src/modules/auth/auth.module.js';
import { CredentialsService } from '../src/modules/auth/credentials.service.js';
import { EmailVerificationMailer } from '../src/modules/auth/email-verification.mailer.js';
import { RefreshToken } from '../src/modules/auth/entities/refresh-token.entity.js';
import { CurrentUser } from '../src/modules/auth/decorators/current-user.decorator.js';
import { Public } from '../src/modules/auth/decorators/public.decorator.js';
import { Roles } from '../src/modules/auth/decorators/roles.decorator.js';
import { REFRESH_COOKIE } from '../src/modules/auth/auth.constants.js';
import type { AuthUser } from '../src/modules/auth/auth.types.js';
import { User, UserRole } from '../src/modules/users/entities/user.entity.js';
import { Profile } from '../src/modules/users/entities/profile.entity.js';
import { User_Identity } from '../src/modules/users/entities/user-identity.js';
import { UsersService } from '../src/modules/users/users.service.js';
import { fakeRefreshTokens } from './fakes/refresh-tokens.fake.js';

@Controller('probe')
class ProbeController {
  @Public()
  @Get('public')
  open() {
    return { ok: true };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Roles(UserRole.ADMIN)
  @Get('admin')
  admin() {
    return { ok: true };
  }
}

const PASSWORD = 'correct horse battery staple';

// The real AuthModule (strategies, global guards, controller, AuthService) over in-memory data
describe('Auth (e2e)', () => {
  const user = { id: randomUUID(), email: 'ada@example.com', role: UserRole.MEMBER, isActive: true } as User;
  let app: INestApplication<App>;

  const signIn = () =>
    request(app.getHttpServer()).post('/api/v1/auth/sign-in').send({ email: user.email, password: PASSWORD });

  // The refresh cookie is Secure, which supertest won't send over http, so it is passed by hand
  const refreshCookieOf = (res: request.Response) => {
    const cookies = ([] as string[]).concat(res.headers['set-cookie'] ?? []);
    return cookies.find((cookie) => cookie.startsWith(`${REFRESH_COOKIE}=`))!;
  };
  const withCookie = (path: string, cookie: string) =>
    request(app.getHttpServer()).post(path).set('Cookie', cookie.split(';')[0]);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({
            JWT_ACCESS_SECRET: 'a'.repeat(32),
            JWT_REFRESH_SECRET: 'r'.repeat(32),
            GOOGLE_CLIENT_ID: 'test-google-client-id',
            GOOGLE_CLIENT_SECRET: 'test-google-secret',
          })],
        }),
        AuthenticationModule.forRoot({ globalGuard: false }),
        AuthModule,
      ],
      controllers: [ProbeController],
    })
      .overrideProvider(getRepositoryToken(RefreshToken)).useValue(fakeRefreshTokens())
      .overrideProvider(getRepositoryToken(User)).useValue({})
      .overrideProvider(getRepositoryToken(User_Identity)).useValue({})
      .overrideProvider(getRepositoryToken(Profile)).useValue({})
      .overrideProvider(UsersService).useValue({ findOne: async (id: string) => (id === user.id ? user : null) })
      .overrideProvider(CredentialsService).useValue({
        verify: async (email: string, password: string) => (email === user.email && password === PASSWORD ? user : null),
      })
      .overrideProvider(EmailVerificationMailer).useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lets @Public() routes through and refuses the rest without a token', async () => {
    await request(app.getHttpServer()).get('/api/v1/probe/public').expect(200);
    await request(app.getHttpServer()).get('/api/v1/probe/me').expect(401);
  });

  it('refuses a wrong password', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/sign-in')
      .send({ email: user.email, password: 'wrong' })
      .expect(401);
  });

  it('signs in: access token in the body, refresh token in a locked-down cookie', async () => {
    const res = await signIn().expect(200);

    expect(res.body).toMatchObject({ tokenType: 'Bearer', expiresIn: 900 });
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body).not.toHaveProperty('refreshToken');

    const cookie = refreshCookieOf(res);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/SameSite=Strict/);
    expect(cookie).toMatch(/Path=\/api\/v1\/auth/);
  });

  it('puts the id and roles from the access token on req.user', async () => {
    const { body } = await signIn();

    const me = await request(app.getHttpServer())
      .get('/api/v1/probe/me')
      .auth(body.accessToken, { type: 'bearer' })
      .expect(200);

    expect(me.body).toEqual({ id: user.id, roles: [UserRole.MEMBER] });
  });

  it('answers 403 when the roles claim lacks a required role', async () => {
    const { body } = await signIn();

    await request(app.getHttpServer())
      .get('/api/v1/probe/admin')
      .auth(body.accessToken, { type: 'bearer' })
      .expect(403);
  });

  it('refuses a refresh token used as an access token, and the reverse', async () => {
    const res = await signIn();
    const refreshToken = refreshCookieOf(res).split(';')[0].split('=')[1];

    await request(app.getHttpServer())
      .get('/api/v1/probe/me')
      .auth(refreshToken, { type: 'bearer' })
      .expect(401);
    await withCookie('/api/v1/auth/refresh', `${REFRESH_COOKIE}=${res.body.accessToken}`).expect(401);
  });

  it('refuses a refresh without the cookie', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/refresh').expect(401);
  });

  it('rotates on refresh, and a reused refresh token ends the sign-in', async () => {
    const first = refreshCookieOf(await signIn());

    const refreshed = await withCookie('/api/v1/auth/refresh', first).expect(200);
    const second = refreshCookieOf(refreshed);
    expect(refreshed.body.accessToken).toEqual(expect.any(String));
    expect(second).not.toBe(first);

    // The old token again: treated as stolen
    await withCookie('/api/v1/auth/refresh', first).expect(401);
    // ...which revoked its successor too
    await withCookie('/api/v1/auth/refresh', second).expect(401);
  });

  it('signs out: clears the cookie and the refresh token stops working', async () => {
    const cookie = refreshCookieOf(await signIn());

    const res = await withCookie('/api/v1/auth/sign-out', cookie).expect(204);
    expect(refreshCookieOf(res)).toMatch(/Expires=Thu, 01 Jan 1970/);

    await withCookie('/api/v1/auth/refresh', cookie).expect(401);
  });

  it('signs out of every device', async () => {
    const phone = refreshCookieOf(await signIn());
    const laptop = await signIn();

    await request(app.getHttpServer())
      .post('/api/v1/auth/sign-out-all')
      .auth(laptop.body.accessToken, { type: 'bearer' })
      .expect(204);

    await withCookie('/api/v1/auth/refresh', phone).expect(401);
    await withCookie('/api/v1/auth/refresh', refreshCookieOf(laptop)).expect(401);
  });
});
