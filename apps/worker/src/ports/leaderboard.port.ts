/** The worker's side of the leaderboard: it only ever records solves. */
export interface Leaderboard {
  /**
   * Counts (user, problem) once, however many times it's called. True the
   * first time, false after.
   */
  recordSolve(
    userId: string,
    problemId: number,
    solvedAt: Date,
  ): Promise<boolean>;
}

export const LEADERBOARD = Symbol("Leaderboard");
