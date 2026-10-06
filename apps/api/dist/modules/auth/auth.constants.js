export const JWT_ISSUER = 'shoof-api';
export const ACCESS_TOKEN_AUDIENCE = 'shoof-client';
export const REFRESH_TOKEN_AUDIENCE = 'shoof-refresh';
export const JWT_ALGORITHM = 'HS256';
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
export const REFRESH_FAMILY_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
export const REFRESH_COOKIE = 'shoof_rt';
export const REFRESH_COOKIE_PATH = '/api/v1/auth';
const MIN_SECRET_LENGTH = 32;
export function jwtSecrets(config) {
    const access = config.getOrThrow('JWT_ACCESS_SECRET');
    const refresh = config.getOrThrow('JWT_REFRESH_SECRET');
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
//# sourceMappingURL=auth.constants.js.map