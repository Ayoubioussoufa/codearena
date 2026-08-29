/**
 * DSA problem-set model. Each problem is a runnable coding exercise: the
 * learner writes a function, it executes against `tests` in the sandboxed
 * worker (see engine/run-js). Reference solutions are verified by
 * scripts/check-dsa.ts.
 */
import type { FnTest, Harness } from "../engine/run-js";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type DsaCategoryId =
  | "arrays-hashing"
  | "two-pointers"
  | "sliding-window"
  | "stack"
  | "monotonic-stack-queue"
  | "binary-search"
  | "linked-list"
  | "trees"
  | "dfs"
  | "bfs"
  | "tries"
  | "heap-priority-queue"
  | "recursion-backtracking"
  | "graphs"
  | "intervals"
  | "greedy"
  | "dynamic-programming"
  | "bit-manipulation"
  | "math-geometry"
  | "game-theory";

export interface DsaExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface DsaProblem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  category: DsaCategoryId;
  /** One-liner shown in the problem list. */
  blurb: string;
  /** Statement paragraphs. */
  statement: string[];
  examples: DsaExample[];
  constraints: string[];
  /** The function the learner must define (also what tests call). */
  fnName: string;
  /** JS starter (signature + empty body). */
  starter: string;
  /** Verified reference solution, shown after solving. */
  solution: string;
  tests: FnTest[];
  /** Input/output shape for TreeNode/ListNode problems (omit for plain data). */
  harness?: Harness;
  /** The pattern/insight — shown once solved. */
  approach: string;
  /** Anchor into the DSA patterns guide. */
  docAnchor: string;
}

export interface DsaCategory {
  id: DsaCategoryId;
  title: string;
  icon: string;
  blurb: string;
  /** Anchor into the DSA patterns guide (slug is always "dsa-patterns"). */
  docAnchor: string;
  problems: DsaProblem[];
}
