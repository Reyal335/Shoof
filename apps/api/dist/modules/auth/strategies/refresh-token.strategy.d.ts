import { ConfigService } from "@nestjs/config";
import { Strategy } from 'passport-jwt';
import type { RefreshTokenPayload } from "../auth.types.js";
declare const RefreshTokenStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class RefreshTokenStrategy extends RefreshTokenStrategy_base {
    constructor(config: ConfigService);
    validate(payload: RefreshTokenPayload): RefreshTokenPayload;
}
export {};
