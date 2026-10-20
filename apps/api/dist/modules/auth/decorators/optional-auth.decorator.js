import { applyDecorators, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard.js';
import { Public } from './public.decorator.js';
export const OptionalAuth = () => applyDecorators(Public(), UseGuards(OptionalJwtAuthGuard));
//# sourceMappingURL=optional-auth.decorator.js.map