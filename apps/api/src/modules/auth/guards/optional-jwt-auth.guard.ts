import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthUser } from '../auth.types.js';

/**
 * For public routes whose answer depends on who is asking (e.g. "my rating"). A valid access token puts the AuthUser
 * on req.user, exactly as the global JwtAuthGuard would; a missing, expired or forged token leaves req.user null and
 * the request carries on as anonymous. Never fails. Use it through @OptionalAuth(), which also marks the route public.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = AuthUser>(_error: unknown, user: TUser | false): TUser | null {
        return user || null;
    }
}
