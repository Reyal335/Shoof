import type { ConfigService } from '@nestjs/config';
export declare const JWT_ISSUER = "shoof-api";
export declare const ACCESS_TOKEN_AUDIENCE = "shoof-client";
export declare const REFRESH_TOKEN_AUDIENCE = "shoof-refresh";
export declare const JWT_ALGORITHM = "HS256";
export declare const ACCESS_TOKEN_TTL_SECONDS: number;
export declare const REFRESH_TOKEN_TTL_SECONDS: number;
export declare const REFRESH_FAMILY_MAX_AGE_SECONDS: number;
export declare const REFRESH_COOKIE = "shoof_rt";
export declare const REFRESH_COOKIE_PATH = "/api/v1/auth";
export interface JwtSecrets {
    access: string;
    refresh: string;
}
export declare function jwtSecrets(config: ConfigService): JwtSecrets;
