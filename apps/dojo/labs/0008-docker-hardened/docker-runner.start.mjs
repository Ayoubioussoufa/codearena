// @ts-check
/**
 * Lesson 0008: the hardened Docker runner.
 *
 *   cp ../0004-runner-in-node/runner.mjs .        your lesson 4 runner, reused as is
 *   cp docker-runner.start.mjs docker-runner.mjs   then fill in runInDocker() below
 *
 * @typedef {object} DockerRunRequest
 * @property {string} source          the submission's code (Python, in this lab)
 * @property {string} [input]         what it reads on stdin
 * @property {number} timeoutMs       wall-clock deadline
 * @property {number} memoryMb        memory limit, swap included
 * @property {number} maxOutputBytes  cap for stdout, and separately for stderr
 *
 * @typedef {object} DockerRunFacts
 * @property {"exit" | "timeout" | "output-limit" | "memory-limit" | "spawn-error"} outcome
 * @property {number | null} exitCode   set only when outcome is "exit"
 * @property {string} stdout
 * @property {string} stderr
 * @property {number} timeMs
 */

/** Pinned to an exact tag: the same image every run, and no surprise download. */
export const IMAGE = "python:3.12-alpine";

/**
 * Runs the source in a fresh, hardened container, named "lab8-<something unique>",
 * and removes the container (and any temporary files) whatever happens.
 *
 * @param {DockerRunRequest} request
 * @returns {Promise<DockerRunFacts>}
 */
export async function runInDocker(request) {
  void request;
  throw new Error("Not written yet: this is your job.");
}
