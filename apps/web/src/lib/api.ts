/**
 * src/lib/api.ts — what is still MOCKED, and nothing else.
 *
 * Problems and auth have moved to real endpoints:
 *   - src/hooks/use-problems.ts   (client, cached by TanStack Query)
 *   - src/lib/server-api.ts       (server components)
 *   - src/hooks/use-auth.ts       (login / register / logout)
 *
 * Everything left below has no endpoint yet. Each function is deleted the week
 * its real route lands; when this file is empty, delete the file.
 *
 * Deliberate failure triggers (for practising error states):
 *   - authenticate("login", …)    rejects when the password is  "wrongpass"
 *   - authenticate("register", …) rejects when the email is     "taken@codearena.dev"
 *   - runCode(…)                  returns status "error" when the code is empty/whitespace
 *   - updateProfile(…)            rejects when the username is  "admin"
 *   - changePassword(…)           rejects when currentPassword is "wrongpass"
 */

import { CONTESTS, CURRENT_USER, LEADERBOARD_ENTRIES } from "./data";
import type {
  Contest,
  Language,
  LeaderboardEntry,
  Problem,
  RunResult,
  TestResult,
  UserProfile,
} from "./types";

/** Simulated latency, so loading states stay visible while these are mocks. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Leaderboard entries in arbitrary order. ~600 ms latency. */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  await delay(600);
  return LEADERBOARD_ENTRIES.map((e) => ({ ...e }));
}

export interface AuthInput {
  email: string;
  password: string;
  /** Only used by "register". */
  username?: string;
}

export async function runCode(
  problem: Problem,
  language: Language,
  code: string,
): Promise<RunResult> {
  await delay(1100);

  if (code.trim().length === 0) {
    return {
      status: "error",
      message: "Your editor is empty — write a solution before running.",
      tests: [],
      runtimeMs: 0,
    };
  }

  const looksLikeAnAttempt = /\breturn\b|\bprint\b/.test(code);
  const tests: TestResult[] = problem.examples.map((example, i) => {
    const passed = looksLikeAnAttempt || i < problem.examples.length - 1;
    return {
      name: `Example ${i + 1}`,
      passed,
      expected: example.output,
      received: passed ? example.output : language === "python" ? "None" : "undefined",
    };
  });

  return {
    status: tests.every((t) => t.passed) ? "passed" : "failed",
    tests,
    runtimeMs: Math.round(40 + Math.random() * 120),
  };
}

/** The signed-in user's full profile (mock session). ~500 ms latency. */
export async function getCurrentUser(): Promise<UserProfile> {
  await delay(500);
  return {
    ...CURRENT_USER,
    solved: { ...CURRENT_USER.solved },
    totalProblems: { ...CURRENT_USER.totalProblems },
    activity: CURRENT_USER.activity.map((d) => ({ ...d })),
    recentSubmissions: CURRENT_USER.recentSubmissions.map((s) => ({ ...s })),
  };
}

export interface ProfileUpdateInput {
  displayName: string;
  username: string;
  bio: string;
}

/**
 * Fake profile update (~800 ms). Resolves with the saved values.
 * Rejects when username is "admin" → "That username is taken."
 */
export async function updateProfile(
  input: ProfileUpdateInput,
): Promise<ProfileUpdateInput> {
  await delay(800);
  if (input.username.trim().toLowerCase() === "admin") {
    throw new Error("That username is taken.");
  }
  return { ...input };
}

/**
 * Fake password change (~800 ms).
 * Rejects when currentPassword is "wrongpass" → "Your current password is incorrect."
 */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await delay(800);
  if (input.currentPassword === "wrongpass") {
    throw new Error("Your current password is incorrect.");
  }
}

/** Fake account deletion (~1.2 s). Always succeeds. */
export async function deleteAccount(): Promise<void> {
  await delay(1200);
}

/** All contests (live + upcoming + past). ~500 ms latency. */
export async function getContests(): Promise<Contest[]> {
  await delay(500);
  return CONTESTS.map((c) => ({ ...c }));
}
