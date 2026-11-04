// @ts-check
/**
 * Lesson 0004: the runner, in Node.
 *
 *   cp runner.start.mjs runner.mjs     then fill in run() below
 *
 * These types are the contract the checker tests. In lesson 8 they become
 * CodeArena's worker port, in TypeScript.
 *
 * @typedef {object} RunRequest
 * @property {string} command            the program, e.g. "python3"
 * @property {string[]} [args]           its arguments
 * @property {string | Buffer} [input]   what it reads on stdin; without it, end of file at once
 * @property {number} timeoutMs          wall-clock deadline
 * @property {number} maxOutputBytes     cap for stdout, and separately for stderr
 *
 * @typedef {object} RunFacts
 * @property {"exit" | "signal" | "timeout" | "output-limit" | "spawn-error"} outcome
 *   if a limit stopped it, the first limit hit; otherwise how it ended
 * @property {number | null} exitCode    set only when outcome is "exit"
 * @property {string | null} signal      e.g. "SIGSEGV", set only when outcome is "signal"
 * @property {string} stdout             at most maxOutputBytes bytes, decoded as UTF-8
 * @property {string} stderr             the same
 * @property {number} timeMs             wall-clock milliseconds, from spawn to the end
 */

/**
 * Runs one program and reports what happened. It never rejects: a program
 * that can't start, crashes, hangs or floods is a fact, not an exception.
 *
 * @param {RunRequest} request
 * @returns {Promise<RunFacts>}
 */
export async function run(request) {
  void request;
  throw new Error("Not written yet: this is your job.");
}
