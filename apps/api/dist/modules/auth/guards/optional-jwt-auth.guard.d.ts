import type { AuthUser } from '../auth.types.js';
declare const OptionalJwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class OptionalJwtAuthGuard extends OptionalJwtAuthGuard_base {
    handleRequest<TUser = AuthUser>(_error: unknown, user: TUser | false): TUser | null;
}
export {};
