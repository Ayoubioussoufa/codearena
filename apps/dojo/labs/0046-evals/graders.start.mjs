// @ts-check
/**
 * Lesson 0046: the hard rules of your hint eval, and the score CI gates on.
 *
 *   cp graders.start.mjs graders.mjs     then write the functions below
 *   bash check.sh
 *
 * A model output is the parsed JSON { hint, concept }. A case gives the
 * context: { id, verdict, solution } (solution = the reference solution).
 *
 * Each rule returns true (pass) or false (fail):
 *   - validShape(output): an object whose `hint` and `concept` are non-empty
 *     strings (after trimming).
 *   - maxSentences(hint, n): at most n sentences. A sentence ends with . ! or ?
 *     followed by a space or the end of the text; text after the last ending
 *     counts as one more sentence.
 *   - noLongCode(hint, maxLines): no ``` fenced block has more than maxLines
 *     lines between its fences.
 *   - noSolutionLeak(hint, solution): fails if the hint contains any line of
 *     the solution that, trimmed, is at least 12 characters long. Compare
 *     with all whitespace removed, so re-indenting doesn't hide a leak.
 *   - namesVerdict(hint, verdict): passes if the hint (lowercase) contains one
 *     of the words for the verdict:
 *       WRONG_ANSWER   wrong answer, wrong output, incorrect, expected
 *       TIME_LIMIT     time limit, too slow, timeout, slow
 *       MEMORY_LIMIT   memory
 *       RUNTIME_ERROR  crash, runtime error, exception, error
 *
 * gradeCase(output, kase) runs every rule (maxSentences with n = 3, noLongCode
 * with maxLines = 2) and returns { validShape, maxSentences, noLongCode,
 * noSolutionLeak, namesVerdict, pass }, where pass = all of them. If the shape
 * is invalid, every other rule is false too (there is nothing to grade).
 *
 * summarize(runs): runs is [{ caseId, result }], where result is what
 * gradeCase returned. A case usually runs several times (the model isn't
 * deterministic). Returns:
 *   - score: the share of runs that passed, 0 to 1
 *   - perRule: { ruleName: share of runs where that rule passed }
 *   - flaky: the sorted ids of cases that passed in some runs and failed in others
 *
 * gate(summary, threshold): true when summary.score >= threshold.
 */

/** @param {any} output */ export function validShape(output) { void output; throw new Error("Not written yet."); }
/** @param {string} hint @param {number} n */ export function maxSentences(hint, n) { void hint; void n; throw new Error("Not written yet."); }
/** @param {string} hint @param {number} maxLines */ export function noLongCode(hint, maxLines) { void hint; void maxLines; throw new Error("Not written yet."); }
/** @param {string} hint @param {string} solution */ export function noSolutionLeak(hint, solution) { void hint; void solution; throw new Error("Not written yet."); }
/** @param {string} hint @param {string} verdict */ export function namesVerdict(hint, verdict) { void hint; void verdict; throw new Error("Not written yet."); }
/** @param {any} output @param {{ id: string, verdict: string, solution: string }} kase */ export function gradeCase(output, kase) { void output; void kase; throw new Error("Not written yet."); }
/** @param {{ caseId: string, result: any }[]} runs */ export function summarize(runs) { void runs; throw new Error("Not written yet."); }
/** @param {{ score: number }} summary @param {number} threshold */ export function gate(summary, threshold) { void summary; void threshold; throw new Error("Not written yet."); }
