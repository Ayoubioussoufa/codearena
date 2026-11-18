import type { Redis } from "ioredis";
import type { Leaderboard } from "../ports/leaderboard.port";

/**
 * score = points × T + (T − 1 − reachedAt), with reachedAt in seconds.
 * More points always wins (one point is worth T). On equal points, whoever
 * reached them first has the larger score. T must exceed any reachedAt
 * (about 1.8e9 today), and points × T must stay under 2^53 (about 9e15),
 * so this allows 900,000 points. The API decodes with the same T.
 */
export const SCORE_T = 1e10;

/**
 * One script, so Redis runs it atomically: nothing can run between "was it
 * new?" and "add the point". As two commands, a crash in between would lose
 * the point for good, because a retry would see the solve already recorded.
 *
 * KEYS: 1 solved set ("user:problem"), 2 points hash, 3 reachedAt hash, 4 board
 * ARGV: 1 userId, 2 problemId, 3 solvedAt in seconds, 4 T
 */
const RECORD_SOLVE = `
if redis.call('SADD', KEYS[1], ARGV[1] .. ':' .. ARGV[2]) == 0 then
  return 0
end
local points = redis.call('HINCRBY', KEYS[2], ARGV[1], 1)
-- Deliveries can arrive out of order: keep the latest counted solve.
local at = tonumber(ARGV[3])
local previous = tonumber(redis.call('HGET', KEYS[3], ARGV[1]) or '0')
if previous > at then at = previous end
redis.call('HSET', KEYS[3], ARGV[1], at)
local t = tonumber(ARGV[4])
redis.call('ZADD', KEYS[4], points * t + (t - 1 - at), ARGV[1])
return 1
`;

export class RedisLeaderboard implements Leaderboard {
  /** `prefix` lets a test use its own keys and leave the real board alone. */
  constructor(
    private readonly redis: Redis,
    private readonly prefix = "lb",
  ) {}

  async recordSolve(
    userId: string,
    problemId: number,
    solvedAt: Date,
  ): Promise<boolean> {
    const p = this.prefix;
    const added = await this.redis.eval(
      RECORD_SOLVE,
      4,
      `${p}:solved`,
      `${p}:points`,
      `${p}:reached`,
      `${p}:board`,
      userId,
      String(problemId),
      String(Math.floor(solvedAt.getTime() / 1000)),
      String(SCORE_T),
    );
    return added === 1;
  }
}
