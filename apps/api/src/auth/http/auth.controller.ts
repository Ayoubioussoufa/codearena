import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../application/auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../jwt-payload';
import type { Request, Response } from 'express';

/** 5 attempts per minute per IP on the credential endpoints. */
const AUTH_RATE_LIMIT = { default: { limit: 5, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  private readonly cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/auth',
  };

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie('refresh', token, {
      ...this.cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private readRefreshCookie(req: Request): string | undefined {
    return (req.cookies as Record<string, string | undefined>)?.refresh;
  }

  private clearCookie(res: Response): void {
    res.clearCookie('refresh', this.cookieOptions);
  }

  @Public()
  @Throttle(AUTH_RATE_LIMIT)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  // Login creates nothing — 201 would promise a new resource
  @Public()
  @Throttle(AUTH_RATE_LIMIT)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.service.login(dto);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const refresh = this.readRefreshCookie(req);
    const { accessToken, refreshToken } = await this.service.refresh(refresh);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const refresh = this.readRefreshCookie(req);
    this.clearCookie(res);
    return this.service.logout(refresh);
  }

  /** Protected: proves the whole chain — token issued, sent, verified, decoded. */
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return { id: user.sub, role: user.role };
  }

  /** Authenticated AND authorized. A USER reaching this gets 403, not 401. */
  @Roles('ADMIN')
  @Get('admin/ping')
  adminPing(@CurrentUser() user: JwtPayload) {
    return { ok: true, id: user.sub };
  }
}
