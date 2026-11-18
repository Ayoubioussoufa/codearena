import { Redis } from "ioredis";
import { RedisLeaderboard, SCORE_T } from "./redis-leaderboard";

/** Against a real Redis: the guarantees are in the script, so test the script. */
describe("RedisLeaderboard", () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
  });
  const prefix = `test-lb-${Date.now()}`;
  const board = new RedisLeaderboard(redis, prefix);
  const at = (iso: string) => new Date(iso);

  afterAll(async () => {
    const keys = await redis.keys(`${prefix}:*`);
    if (keys.length > 0) await redis.del(...keys);
    await redis.quit();
  });

  it("counts the same solve once, however many times it's recorded", async () => {
    expect(await board.recordSolve("ada", 1, at("2026-11-01T10:00:00Z"))).toBe(
      true,
    );
    expect(await board.recordSolve("ada", 1, at("2026-11-01T10:00:00Z"))).toBe(
      false,
    );
    expect(await board.recordSolve("ada", 1, at("2026-11-02T10:00:00Z"))).toBe(
      false,
    );

    const score = Number(await redis.zscore(`${prefix}:board`, "ada"));
    expect(Math.floor(score / SCORE_T)).toBe(1);
  });

  it("ranks the user who reached the same score first higher", async () => {
    await board.recordSolve("bob", 1, at("2026-11-01T12:00:00Z"));
    await board.recordSolve("cat", 1, at("2026-11-01T09:00:00Z"));

    // ada (10:00), bob (12:00), cat (09:00): all on 1 point.
    const ranked = await redis.zrange(`${prefix}:board`, 0, "-1", "REV");
    expect(ranked).toEqual(["cat", "ada", "bob"]);
  });

  it("ranks more points above an earlier time", async () => {
    await board.recordSolve("bob", 2, at("2026-11-03T12:00:00Z"));

    const ranked = await redis.zrange(`${prefix}:board`, 0, "0", "REV");
    expect(ranked).toEqual(["bob"]);
  });
});
