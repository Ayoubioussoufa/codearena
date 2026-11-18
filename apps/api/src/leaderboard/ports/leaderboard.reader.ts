export type Standing = {
  rank: number; // 1 for the best
  userId: string;
  username: string;
  solved: number;
};

/** The API only reads the board. The worker writes it. */
export interface LeaderboardReader {
  top(limit: number): Promise<Standing[]>;
  /** Null for a user with no solve yet. */
  standingOf(userId: string): Promise<Standing | null>;
}

export const LEADERBOARD_READER = Symbol('LeaderboardReader');
