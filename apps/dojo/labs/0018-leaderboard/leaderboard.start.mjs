// @ts-check
/**
 * Lesson 0018: a leaderboard on a Redis sorted set.
 *
 *   cp leaderboard.start.mjs leaderboard.mjs     then write createLeaderboard() below
 *
 * `redis.cmd(...)` sends one Redis command (see ../_lib/resp.mjs) and resolves
 * with the reply: a string, a number, an array, or null.
 *
 * The rules (your CodeArena ones may differ; write them down):
 *   - A user's points are the sum of the points of the problems they solved.
 *   - A problem counts once per user, however many times it's delivered.
 *   - Equal points: whoever reached that total FIRST ranks higher. The moment a
 *     user reached their total is the atSec of their latest counted solve
 *     (deliveries can arrive out of order).
 *   - Ranks start at 1.
 *
 * Postgres stays the source of truth; this is a view of it that must be
 * rebuildable at any time from the list of solves.
 *
 * @typedef {{ userId: string, problemId: string, points: number, atSec: number }} Solve
 * @typedef {{ rank: number, userId: string, points: number }} Row
 */

/**
 * @param {{ cmd: (...args: (string|number)[]) => Promise<any> }} redis
 * @param {string} name   prefix for every key, e.g. "lb"
 */
export function createLeaderboard(redis, name) {
  void redis; void name;
  return {
    /** Counts a solve unless this user already has this problem. Resolves true if it counted. */
    async recordSolve(/** @type {Solve} */ solve) { void solve; throw new Error("Not written yet."); },
    /** The best n, best first. @returns {Promise<Row[]>} */
    async top(/** @type {number} */ n) { void n; throw new Error("Not written yet."); },
    /** One user's rank and points, or null if they have none. @returns {Promise<Row|null>} */
    async rankOf(/** @type {string} */ userId) { void userId; throw new Error("Not written yet."); },
    /** Throws everything away and rebuilds from the source of truth. */
    async rebuild(/** @type {Solve[]} */ solves) { void solves; throw new Error("Not written yet."); },
  };
}
