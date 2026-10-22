import { ConfigService } from '@nestjs/config';
import { Strategy, type Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service.js';
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    private readonly authService;
    constructor(config: ConfigService, authService: AuthService);
    validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<Omit<import("../../users/entities/user.entity.js").User, "passwordHash">>;
}
export {};
