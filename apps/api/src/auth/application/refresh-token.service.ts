import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../ports/refresh-token.repository';
import { UsersService } from '../../users/application/users.service';
import type { Role } from '../../users/domain/user.entity';

/** What both public methods hand back to the caller. */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenService {
  // NOTE: inject the PORT (the Symbol), never the Prisma class.
  // Your current constructor names PrismaRefreshTokenRepository directly —
  // that couples this service to Prisma and breaks the dependency rule.
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly tokens: RefreshTokenRepository,
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  // ───────────────────────────────────────────────────────────────────
  // PRIVATE — the shared core. Both login and rotate end here.
  // ───────────────────────────────────────────────────────────────────

  /**
   * Mints one access token + one refresh token, and persists the refresh
   * token's HASH under the given family.
   *
   * PSEUDOCODE
   *   1. token      = 32 random bytes, base64url            (the secret)
   *   2. tokenHash  = this.hash(token)                      (what you store)
   *   3. expiresAt  = now + 7 days
   *   4. await tokens.create({ userId, tokenHash, family, expiresAt })
   *   5. accessToken = await jwt.signAsync({ sub: userId, role })
   *   6. return { accessToken, refreshToken: token }
   *
   * WHY the plaintext token is returned but never stored: the client needs
   * it to authenticate; you only need to RECOGNISE it later, and a hash is
   * enough for that. A DB leak then yields nothing usable.
   */
  private async issue(
    userId: string,
    role: Role,
    family: string,
  ): Promise<TokenPair> {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hash(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.tokens.create({ userId, tokenHash, family, expiresAt });
    const accessToken = await this.jwt.signAsync({ sub: userId, role });
    return { accessToken, refreshToken: token };
  }

  /**
   * SHA-256 of the token, hex.
   *
   * WHY NOT ARGON2: Argon2 is slow ON PURPOSE, to make guessing a human
   * password expensive. A 32-byte random token has nothing to guess — and
   * this runs on every refresh, so slow would just be a cost with no benefit.
   */
  private hash(token: string): string {
    const hash = createHash('sha256');
    return hash.update(token).digest('hex');
  }

  // ───────────────────────────────────────────────────────────────────
  // PUBLIC
  // ───────────────────────────────────────────────────────────────────

  /**
   * Called by AuthService.login() once the password has been verified.
   *
   * PSEUDOCODE
   *   1. family = randomUUID()        ← a NEW family: this is a new session
   *   2. return this.issue(userId, role, family)
   */
  async issueForLogin(userId: string, role: Role): Promise<TokenPair> {
    const family = randomUUID();
    return this.issue(userId, role, family);
  }

  /**
   * Called by POST /auth/refresh. Consumes the presented token and mints a
   * new pair in the SAME family.
   *
   * PSEUDOCODE
   *   1. row = await tokens.findByHash(this.hash(presented))
   *
   *   2. if (!row)                    → throw Unauthorized
   *      // never existed, or already garbage
   *
   *   3. if (row.revokedAt !== null)  → TASK 3.2: REUSE DETECTED
   *      //   await tokens.revokeFamily(row.family)
   *      //   throw Unauthorized
   *      // A live client always holds the NEWEST token, so a replay of a
   *      // spent one means the chain leaked. You cannot tell thief from
   *      // victim, so kill the session and let the password decide.
   *
   *   4. if (row.expiresAt < new Date()) → throw Unauthorized
   *
   *   5. user = await users.getById(row.userId)
   *      if (!user) → throw Unauthorized        // account deleted mid-session
   *      // you need `role` to sign the new access token; the row has no role
   *
   *   6. await tokens.revoke(row.id)            // rotation: single use
   *
   *   7. return this.issue(row.userId, user.role, row.family)
   *      //                                       ^^^^^^^^^^ SAME family.
   *      // A new family here would orphan the chain and reuse detection
   *      // would never fire.
   *
   * ORDER MATTERS: check step 3 BEFORE step 4. An expired-and-replayed token
   * is still a replay, and you want the family burned.
   *
   * SAME 401 for every failure — never tell the caller which check failed.
   */
  async rotate(presented: string): Promise<TokenPair> {
    const row = await this.tokens.findByHash(this.hash(presented));
    if (!row) throw new UnauthorizedException();
    if (row.revokedAt !== null) {
      await this.tokens.revokeFamily(row.family);
      throw new UnauthorizedException();
    }
    if (row.expiresAt < new Date()) throw new UnauthorizedException();
    const user = await this.users.getById(row.userId);
    if (!user) throw new UnauthorizedException();

    await this.tokens.revoke(row.id);
    return this.issue(row.userId, user.role, row.family);
  }

  async revokeSession(token: string): Promise<void> {
    const row = await this.tokens.findByHash(this.hash(token));
    if (row) {
      await this.tokens.revokeFamily(row.family);
    }
  }
}
