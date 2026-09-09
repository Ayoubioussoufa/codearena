import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshTokenRepository } from '../ports/refresh-token.repository';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    userId: string;
    tokenHash: string;
    family: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        family: input.family,
        expiresAt: input.expiresAt,
      },
    });
  }

  async findByHash(tokenHash: string): Promise<{
    id: string;
    userId: string;
    family: string;
    revokedAt: Date | null;
    expiresAt: Date;
  } | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!token) return null;
    return {
      id: token.id,
      userId: token.userId,
      family: token.family,
      revokedAt: token.revokedAt,
      expiresAt: token.expiresAt,
    };
  }

  async revoke(id: string): Promise<void> {
    const revokedAt = new Date();
    await this.prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: revokedAt,
      },
    });
  }

  async revokeFamily(family: string): Promise<void> {
    const revokedAt = new Date();
    await this.prisma.refreshToken.updateMany({
      where: { family, revokedAt: null },
      data: {
        revokedAt: revokedAt,
      },
    });
  }
}
