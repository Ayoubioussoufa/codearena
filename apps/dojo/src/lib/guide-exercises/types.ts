/**
 * Exercises embedded INSIDE a guide, at the point the concept is explained.
 *
 * Deliberately thinner than the practice engine's `CodeExercise`: a guide
 * exercise has no generator, no SRS scheduling and no randomisation. It is one
 * fixed task, sitting under the paragraph that teaches it, so you write the
 * thing while the explanation is still on screen.
 *
 * Grading reuses the practice engine, so feedback is identical in both places:
 * a list of named checks that each passed or failed, rather than a single
 * red cross that tells you nothing.
 */
import { runChecks, verdict, type StaticCheck } from "../engine/helpers";
import type { CodeGradeResult } from "../engine/types";
import type { FnTest } from "../engine/run-js";

export interface GuideExercise {
  /** Unique within its guide; referenced from the markdown fence. */
  id: string;
  /** Shown on the exercise header. A short imperative: "Write the port". */
  title: string;
  /** What to do. States the GOAL, not the technique. */
  prompt: string;
  /** highlight.js language key. */
  language: string;
  /**
   * What is already in scope — imports, given types, the port you're
   * implementing. Shown read-only above the editor so you never have to guess
   * a path or an exported name, and never have to type an import to do an
   * exercise that isn't about imports.
   *
   * Omit it when the imports ARE the exercise (the dependency-rule ones).
   */
  given?: string;
  /** What the editor starts with — usually a skeleton with TODOs. */
  starter: string;
  /** Revealed by the "show me" button, and after a pass. */
  solution: string;
  /**
   * Opt-in nudge for when you're stuck: what to reach for and why, without
   * giving the answer. Read only if you want it.
   */
  hint?: string;
  /** Shown after grading — the WHY, which is the part worth keeping. */
  explanation: string;
  /**
   * Structural checks. Each becomes one named line in the results, so the
   * feedback says "your port exports a Symbol ✅ / your service imports
   * Prisma ❌" rather than just failing.
   */
  checks: StaticCheck[];
  /** Optional runnable tests, for exercises whose answer is a real function. */
  fn?: { name: string; tests: FnTest[] };
}

/** Runs an exercise's checks against submitted code. */
export async function gradeGuideExercise(
  exercise: GuideExercise,
  code: string,
): Promise<CodeGradeResult> {
  const spec = exercise.fn
    ? { checks: exercise.checks, fn: exercise.fn }
    : { checks: exercise.checks };
  return verdict(await runChecks(code, spec));
}
