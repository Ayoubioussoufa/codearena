import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import type { JwtPayload } from '../jwt-payload';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Is this route opted out? Check the METHOD first, then the CLASS.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. ExecutionContext is protocol-agnostic (HTTP, WebSocket, gRPC).
    //    switchToHttp() narrows it to an Express request.
    const request = context.switchToHttp().getRequest<Request>();

    // 3. "Authorization: Bearer <token>" — two parts, space-separated.
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException();

    // 4. THE ONLY PLACE IN YOUR APP THAT VERIFIES AN ACCESS TOKEN.
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      (request as Request & { user?: JwtPayload }).user = payload;
    } catch {
      // verifyAsync throws three different errors: bad signature, expired,
      // malformed. All three mean the same thing to the caller — one 401.
      throw new UnauthorizedException();
    }

    return true;
  }
}
