import type { Role } from '../users/domain/user.entity';

/** Exactly what you put in the token in Task 2.2, plus the claims the library adds. */
export interface JwtPayload {
  sub: string; // the user id — RFC 7519's registered "subject" claim
  role: Role;
  iat: number; // issued at,  unix SECONDS
  exp: number; // expires at, unix SECONDS
}
