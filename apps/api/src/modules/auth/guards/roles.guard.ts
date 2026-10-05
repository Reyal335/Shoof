import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { UserRole } from '../../users/entities/user.entity.js';
import type { AuthUser } from '../auth.types.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

// Global, after JwtAuthGuard: routes without @Roles() pass; the rest need a matching `roles` claim (403 otherwise)
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!required?.length) {
            return true;
        }

        const user = context.switchToHttp().getRequest<Request>().user as AuthUser | undefined;
        return !!user?.roles?.some((role) => required.includes(role));
    }
}
