import type { UserRole } from '../users/entities/user.entity.js';
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
    jti: string;
    fam: string;
}
export interface AuthUser {
    id: string;
    roles: UserRole[];
}
export interface IssuedTokens {
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: Date;
}
export {};
