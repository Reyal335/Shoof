import type { UserRole } from '../users/entities/user.entity.js';

// Registered claims every token carries; `iat` and `exp` are set by the signer
interface RegisteredClaims {
    sub: string;
    iss: string;
    aud: string;
    iat: number;
    exp: number;
}

export interface AccessTokenPayload extends RegisteredClaims {
    roles: UserRole[];
}

export interface RefreshTokenPayload extends RegisteredClaims {
    // The refresh_tokens row this token is
    jti: string;
    // Every token descended from one sign-in shares a family
    fam: string;
}

// What `req.user` holds on routes behind the access token
export interface AuthUser {
    id: string;
    roles: UserRole[];
}

export interface IssuedTokens {
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: Date;
}
