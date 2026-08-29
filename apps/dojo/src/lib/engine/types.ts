/**
 * Exercise engine types. Generators are pure functions of an Rng, so every
 * attempt at the same generator can produce a different variant.
 */
import type { Rng } from "./rng";

export type TopicId =
  | "typescript"
  | "react"
  | "tailwind"
  | "sql-data"
  | "auth-security"
  | "sandboxing-queues"
  | "rating-math"
  | "distributed-systems"
  | "system-design"
  | "aptitude"
  | "cs-fundamentals"
  | "java-spring-boot"
  | "python"
  | "system-design-drills"
  | "testing"
  | "git"
  // Coding tracks (build-from-scratch section — /coding). Progress is tracked
  // per track under these ids, kept separate from the conceptual quiz topics.
  | "coding-react"
  | "coding-next"
  | "coding-javascript"
  | "coding-typescript"
  | "coding-tailwind"
  | "coding-java"
  | "coding-spring"
  | "coding-nest"
  | "coding-system-design"
  | "coding-testing"
  | "coding-python";

export interface DocRef {
  /** Guide slug under /guides/… */
  slug: string;
  /** Human label, e.g. "Phase 1 §A.3 — Indexes" */
  label: string;
}

interface ExerciseBase {
  /** Generator id (stable across variants — used for progress tracking). */
  genId: string;
  prompt: string;
  code?: string;
  codeLang?: string;
  /** Why the correct answer is correct — and why the tempting wrong ones aren't. */
  explanation: string;
  docRef: DocRef;
}

export interface ChoiceExercise extends ExerciseBase {
  kind: "choice";
  options: string[];
  correctIndex: number;
}

export interface InputExercise extends ExerciseBase {
  kind: "input";
  /** Canonical answer shown after grading. */
  answer: string;
  /** Grades a raw user string. */
  accept: (raw: string) => boolean;
  placeholder?: string;
}

/** One dimension of a design self-grade — a yardstick you check yourself on. */
export interface DesignRubricItem {
  /** The dimension a strong answer must cover, e.g. "Estimation". */
  point: string;
  /** What hitting this point looks like — the bar you grade against. */
  detail: string;
}

/**
 * An open-ended system-design prompt: a scenario, a whiteboard time budget, and
 * a worked reference revealed on demand. There's no auto-grader — you attempt
 * it under the timer, reveal the model answer, then self-score against the
 * rubric. The rubric fraction you tick decides pass/fail for spaced repetition,
 * so a design you half-remember resurfaces the way any missed item does.
 */
export interface DesignExercise extends ExerciseBase {
  kind: "design";
  /** Whiteboard time budget in minutes — drives the countdown. */
  minutes: number;
  /** Requirements & constraints to pin down before designing (shown up front). */
  constraints: string[];
  /** Self-grade rubric: the points a strong answer hits. */
  rubric: DesignRubricItem[];
  /** The worked reference design, revealed for self-grading. */
  solution: string;
}

export interface CodeCheckResult {
  label: string;
  passed: boolean;
  /** Extra context, e.g. "returned 0.24, expected 0.76". */
  detail?: string;
}

export interface CodeGradeResult {
  passed: boolean;
  results: CodeCheckResult[];
}

export interface CodeExercise extends ExerciseBase {
  kind: "code";
  /** highlight.js language key for the editor. */
  language: string;
  starter: string;
  /** Model solution shown after grading. */
  solution: string;
  /**
   * Hint 1 — an opt-in "how to approach it" nudge (what to reach for, how it
   * works and why), shown behind a collapsible so it's read only when stuck.
   * The prompt states the GOAL; this carries the technique. Falls back to
   * `explanation` when absent. Hint 2 is always the `solution`.
   */
  hint?: string | undefined;
  grade: (code: string) => Promise<CodeGradeResult>;
}

/**
 * One file within a multi-file exercise — its own tab, editor, starter and
 * model solution. A real backend feature is spread across several of these
 * (controller, provider, module, DTO…), each written and debugged on its own.
 */
export interface CodeFile {
  /** File name shown on the tab, e.g. "cats.controller.ts". */
  name: string;
  /** highlight.js language key for this file. */
  language: string;
  starter: string;
  /** Model solution shown after grading (and the file's hint 2). */
  solution: string;
  /** Short always-visible note of the file's role, shown under the tab bar. */
  role?: string;
  /** Hint 1 for this file — an opt-in approach nudge (see `CodeExercise.hint`). */
  hint?: string;
}

export interface MultiFileGradeResult {
  passed: boolean;
  /** Per-file check results, in `files` order. */
  perFile: { name: string; result: CodeGradeResult }[];
  /** Checks that span more than one file (wiring, names lining up). */
  cross: CodeCheckResult[];
}

/**
 * A build-a-feature exercise made of several files. Each file is graded on its
 * own (the per-tab build/debug loop) via `gradeFile`; `grade` then checks every
 * file together — including cross-file wiring — and is what records progress.
 */
export interface MultiFileExercise extends ExerciseBase {
  kind: "multi-file";
  files: CodeFile[];
  /** Grade one file in isolation — the per-tab "Debug this file" loop. */
  gradeFile: (name: string, code: string) => Promise<CodeGradeResult>;
  /** Grade every file together (incl. cross-file wiring). Records progress. */
  grade: (files: Record<string, string>) => Promise<MultiFileGradeResult>;
}

export type Exercise =
  | ChoiceExercise
  | InputExercise
  | DesignExercise
  | CodeExercise
  | MultiFileExercise;

export interface Generator {
  id: string;
  /** Short label of the concept this generator drills. */
  title: string;
  generate: (rng: Rng) => Exercise;
}

export interface Topic {
  id: TopicId;
  title: string;
  icon: string;
  blurb: string;
  /** Guide this topic drills (slug under /guides). */
  docSlug: string;
  docTitle: string;
  generators: Generator[];
}
