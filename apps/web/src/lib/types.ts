/**
 * src/lib/types.ts — shared domain types for the whole frontend
 * TODOs: none — fully implemented scaffold.
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Language = "javascript" | "typescript" | "python";

export const LANGUAGES: readonly Language[] = [
  "javascript",
  "typescript",
  "python",
];

export const LANGUAGE_LABELS: Record<Language, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python 3",
};

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  /** Percentage 0–100, one decimal. */
  acceptanceRate: number;
  totalSubmissions: number;
  /** Each entry is one paragraph. */
  description: string[];
  examples: ProblemExample[];
  constraints: string[];
  starterCode: Record<Language, string>;
}

export interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  received: string;
}

export interface RunResult {
  status: "passed" | "failed" | "error";
  /** Present for "error" (compile/empty-editor style failures). */
  message?: string;
  tests: TestResult[];
  runtimeMs: number;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  countryFlag: string;
  countryName: string;
  rating: number;
  solved: { easy: number; medium: number; hard: number };
  acceptedSubmissions: number;
  totalSubmissions: number;
  streakDays: number;
}

export type LeaderboardSortKey = "rating" | "solved" | "streak";

/**
 * A leaderboard row enriched with values DERIVED from a LeaderboardEntry.
 * The derived fields are optional so the scaffold renders "—" until the
 * practice TODO in LeaderboardTable.tsx computes them.
 */
export interface RankedRow extends LeaderboardEntry {
  /** 1-based position by rating (highest rating = rank 1), regardless of the active sort. */
  rank?: number;
  totalSolved?: number;
  /** Percentage 0–100, one decimal. */
  acceptanceRate?: number;
}

export interface LeaderboardStats {
  totalPlayers: number;
  totalSolved: number;
  averageRating: number;
  longestStreak: { username: string; days: number };
}

/** One calendar day of submission activity. Days with zero submissions are omitted. */
export interface ActivityDay {
  /** "YYYY-MM-DD" — treat as a calendar day, beware timezone parsing pitfalls. */
  date: string;
  count: number;
}

export type Verdict =
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Runtime Error";

export interface Submission {
  id: number;
  problemSlug: string;
  problemTitle: string;
  difficulty: Difficulty;
  verdict: Verdict;
  language: Language;
  /** ISO datetime. */
  submittedAt: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  /** null → render an initials fallback (see components/Avatar.tsx). */
  avatarUrl: string | null;
  countryFlag: string;
  countryName: string;
  rating: number;
  globalRank: number;
  /** ISO date the account was created. */
  joinedAt: string;
  solved: { easy: number; medium: number; hard: number };
  /** Site-wide problem counts per difficulty (for "x of y solved" bars). */
  totalProblems: { easy: number; medium: number; hard: number };
  activity: ActivityDay[];
  recentSubmissions: Submission[];
}

export interface Contest {
  id: number;
  name: string;
  description: string;
  /** ISO datetime. */
  startsAt: string;
  durationMinutes: number;
  registeredCount: number;
  status: "live" | "upcoming" | "past";
  /** Winner's username — past contests only. */
  winner?: string;
}
