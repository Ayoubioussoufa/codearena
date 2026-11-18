import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import type { LeaderboardReader, Standing } from '../ports/leaderboard.reader';

/**
 * The contract with the worker, which writes the board: the key, and how a
 * score encodes points and time. score = points × T + (T − 1 − reachedAt).
 */
const BOARD_KEY = 'lb:board';
const SCORE_T = 1e10;
const pointsOf = (score: number) => Math.floor(score / SCORE_T);

@Injectable()
export class RedisLeaderboardReader implements LeaderboardReader {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async top(limit: number): Promise<Standing[]> {
    // O(log N + limit), however big the board is. ZREVRANGE is deprecated:
    // ZRANGE … REV. ioredis types `stop` as a string.
    const flat = await this.redis.zrange(
      BOARD_KEY,
      0,
      String(limit - 1),
      'REV',
      'WITHSCORES',
    );
    // [member, score, member, score, …]
    const entries: { userId: string; score: number }[] = [];
    for (let i = 0; i + 1 < flat.length; i += 2) {
      entries.push({ userId: flat[i]!, score: Number(flat[i + 1]) });
    }
    const names = await this.usernames(entries.map((e) => e.userId));
    return entries.map((e, index) => ({
      rank: index + 1,
      userId: e.userId,
      username: names.get(e.userId) ?? 'deleted user',
      solved: pointsOf(e.score),
    }));
  }

  async standingOf(userId: string): Promise<Standing | null> {
    const [rank, score] = await Promise.all([
      this.redis.zrevrank(BOARD_KEY, userId),
      this.redis.zscore(BOARD_KEY, userId),
    ]);
    if (rank === null || score === null) return null;
    const names = await this.usernames([userId]);
    return {
      rank: rank + 1,
      userId,
      username: names.get(userId) ?? 'deleted user',
      solved: pointsOf(Number(score)),
    };
  }

  /** One query for the whole page, never one per row: that's the N+1. */
  private async usernames(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, username: true },
    });
    return new Map(users.map((u) => [u.id, u.username]));
  }
}
