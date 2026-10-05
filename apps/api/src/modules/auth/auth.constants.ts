import type { ConfigService } from '@nestjs/config';

export const JWT_ISSUER = 'shoof-api';
// Distinct audiences: an access token is refused where a refresh token is expected, and the reverse
export const ACCESS_TOKEN_AUDIENCE = 'shoof-client';
export const REFRESH_TOKEN_AUDIENCE = 'shoof-refresh';
export const JWT_ALGORITHM = 'HS256';

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
// Sliding: each refresh issues a token good for this long...
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
// ...but never past this long after the original sign-in
export const REFRESH_FAMILY_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

export const REFRESH_COOKIE = 'shoof_rt';
// The cookie is only sent to the auth routes, never to the rest of the API
export const REFRESH_COOKIE_PATH = '/api/v1/auth';

const MIN_SECRET_LENGTH = 32;

export interface JwtSecrets {
    access: string;
    refresh: string;
}

// Fails at startup rather than signing with a weak or shared key
export function jwtSecrets(config: ConfigService): JwtSecrets {
    const access = config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refresh = config.getOrThrow<string>('JWT_REFRESH_SECRET');

    for (const [name, value] of [['JWT_ACCESS_SECRET', access], ['JWT_REFRESH_SECRET', refresh]]) {
        if (value.length < MIN_SECRET_LENGTH) {
            throw new Error(`${name} must be at least ${MIN_SECRET_LENGTH} characters`);
        }
    }
    if (access === refresh) {
        throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
    }

    return { access, refresh };
}
