import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

// `req.user`: whatever the route's strategy validate() returned.
// An AuthUser behind the access token, the user on sign-in, the token's claims on refresh.
export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext) => context.switchToHttp().getRequest<Request>().user,
);
