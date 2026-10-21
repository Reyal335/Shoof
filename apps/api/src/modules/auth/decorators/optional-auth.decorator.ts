import { applyDecorators, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard.js';
import { Public } from './public.decorator.js';

// Public, but @CurrentUser() is the signed-in AuthUser when a valid access token is sent (null otherwise)
export const OptionalAuth = () => applyDecorators(Public(), UseGuards(OptionalJwtAuthGuard));
