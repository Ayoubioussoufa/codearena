/**
 * src/lib/api.ts — fake async API (simulated latency + failure cases)
 * TODOs: none — fully implemented scaffold.
 *
 * Every function returns a Promise that resolves after a realistic delay, so
 * loading states are actually visible. Swap these for real fetch() calls to
 * the NestJS API (NEXT_PUBLIC_API_URL) in a later phase.
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
  AuthUser,
  Contest,
  Language,
  LeaderboardEntry,
  Problem,
  RunResult,
  TestResult,
  UserProfile,
} from "./types";

type ProblemsResponse = {
  items: Problem[];
  nextCursor: number | null;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** All problems. ~700 ms latency — design a loading state for it. */
export async function getProblems(): Promise<Problem[]> {
  let cursor: number | null = null;
  const all: Problem[] = [];
  const base = `${process.env.NEXT_PUBLIC_API_URL}/problems?limit=100`;
  do {
    const url: string = cursor === null ? base : `${base}&cursor=${cursor}`
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const { items, nextCursor }: ProblemsResponse = await res.json();
    all.push(...items);
    cursor = nextCursor;
  } while (cursor !== null)

  return all;
}

/** One problem by slug, or null when it doesn't exist. ~400 ms latency. */
export async function getProblem(slug: string): Promise<Problem | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/problems/${slug}`,
  );
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`API ${res.status}`);
  }
  const body: Problem = await res.json();
  return body;
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

/**
 * Fake auth endpoint (~900 ms). Resolves with the signed-in user.
 * Rejects with an Error whose .message is safe to show to the user:
 *   - login    + password "wrongpass"          → "Invalid email or password."
 *   - register + email "taken@codearena.dev"   → "An account with this email already exists."
 */
export async function authenticate(
  mode: "login" | "register",
  input: AuthInput,
): Promise<AuthUser> {
  await delay(900);
  if (mode === "login" && input.password === "wrongpass") {
    throw new Error("Invalid email or password.");
  }
  if (mode === "register" && input.email === "taken@codearena.dev") {
    throw new Error("An account with this email already exists.");
  }
  return {
    id: "u_" + Math.random().toString(36).slice(2, 10),
    username: input.username ?? input.email.split("@")[0] ?? "coder",
    email: input.email,
  };
}

/**
 * Mock judge (~1.1 s). Not a real interpreter — it only simulates outcomes:
 *   - empty / whitespace-only code      → status "error"
 *   - code containing "return"/"print"  → all example tests pass
 *   - anything else                     → last test fails
 */
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
