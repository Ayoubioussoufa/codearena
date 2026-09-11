import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import type { Role } from '../../users/domain/user.entity';
import type { JwtPayload } from '../jwt-payload';

/**
 * Authorization — "may you do this?" — as opposed to AuthGuard's
 * "who are you?". Runs after it, and reads the role off the JWT payload,
 * so answering costs zero database queries.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // No @Roles() on this route — authorization is not this guard's business.
    if (!required?.length) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    // 403, not 401: AuthGuard already established WHO they are.
    if (!request.user || !required.includes(request.user.role)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
