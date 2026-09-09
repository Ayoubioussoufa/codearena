export interface RefreshTokenRepository {
  create(input: {
    userId: string;
    tokenHash: string;
    family: string;
    expiresAt: Date;
  }): Promise<void>;
  findByHash(tokenHash: string): Promise<{
    id: string;
    userId: string;
    family: string;
    revokedAt: Date | null;
    expiresAt: Date;
  } | null>;
  revoke(id: string): Promise<void>;
  revokeFamily(family: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('RefreshTokenRepository');
