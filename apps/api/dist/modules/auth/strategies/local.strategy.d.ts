import { Strategy } from 'passport-local';
import { CredentialsService } from '../credentials.service.js';
import type { User } from '../../users/entities/user.entity.js';
declare const LocalStrategy_base: new (...args: [] | [options: import("passport-local").IStrategyOptionsWithRequest] | [options: import("passport-local").IStrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class LocalStrategy extends LocalStrategy_base {
    private credentialsService;
    constructor(credentialsService: CredentialsService);
    validate(email: string, password: string): Promise<Omit<User, 'passwordHash'>>;
}
export {};
