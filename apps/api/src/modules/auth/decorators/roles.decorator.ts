import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../users/entities/user.entity.js';

export const ROLES_KEY = 'roles';

// Allows the route to callers whose `roles` claim holds at least one of these
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
