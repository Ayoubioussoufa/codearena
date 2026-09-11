import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/jwt-payload';

/**
 * Hands the verified token payload to a handler as an argument, so no
 * controller ever touches `request` directly — a controller that does is
 * welded to HTTP and cannot be unit-tested without faking Express.
 *
 * Safe to type as non-optional: AuthGuard runs first, so an unauthenticated
 * request never reaches the handler.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();
    return request.user;
  },
);
