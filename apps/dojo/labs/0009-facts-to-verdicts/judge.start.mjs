// @ts-check
/**
 * Lesson 0009: from facts to verdicts.
 *
 *   cp judge.start.mjs judge.mjs     then write the two functions below
 *
 * Facts come from a runner (lessons 4 and 8). This file never runs anything
 * itself: it's pure logic, so it's tested with a scripted fake runner.
 *
 * @typedef {object} RunFacts
 * @property {"exit" | "signal" | "timeout" | "output-limit" | "memory-limit"} outcome
 * @property {number | null} exitCode
 * @property {string} stdout
 * @property {number} timeMs
 *
 * @typedef {{ input: string, expected: string }} TestCase
 * @typedef {"AC" | "WA" | "TLE" | "MLE" | "OLE" | "RE"} Verdict
 * @typedef {{ verdict: Verdict, failedTest: number | null, maxTimeMs: number }} Judgement
 */

/**
 * True when both outputs hold the same tokens (whitespace-separated words),
 * in the same order. Spaces, tabs, newlines and \r between them don't matter.
 *
 * @param {string} expected
 * @param {string} actual
 * @returns {boolean}
 */
export function compareTokens(expected, actual) {
  void expected; void actual;
  throw new Error("Not written yet.");
}

/**
 * Runs the tests in order with runOne(input), stops at the first failure,
 * and returns the verdict, the failing test's number (1-based) and the
 * slowest time among the tests that ran. If runOne rejects (your
 * infrastructure failed: Docker down…), judge rejects too: that's an error
 * to retry, not a verdict. An empty test list is a bug, not an Accepted.
 *
 * @param {TestCase[]} tests
 * @param {(input: string) => Promise<RunFacts>} runOne
 * @returns {Promise<Judgement>}
 */
export async function judge(tests, runOne) {
  void tests; void runOne;
  throw new Error("Not written yet.");
}
