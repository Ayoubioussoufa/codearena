// @ts-check
/**
 * Lesson 0010: attack your own sandbox.
 *
 *   cp attacks.start.mjs attacks.mjs   then write the six attacks below
 *
 * Each attack is a Python program (it runs in python:3.12-alpine, as in
 * lesson 8) and an `expect` function that receives the runner's facts and
 * returns the problems it found: an empty list means "contained".
 * A good expectation checks the CONTAINMENT, not just the verdict: prove the
 * wall held (print what the program could see or do, then check it).
 *
 * @typedef {{ outcome: string, exitCode: number | null, stdout: string, stderr: string }} Facts
 * @typedef {{ name: string, source: string, timeoutMs?: number, expect: (f: Facts) => string[] }} Attack
 */

/** @type {Attack[]} */
export const ATTACKS = [
  // 1. A fork bomb.        Contained by: --pids-limit
  // 2. An infinite loop.   Contained by: your deadline (and docker kill)
  // 3. A 512 MB allocation. Contained by: --memory
  // 4. A network call.     Contained by: --network none
  // 5. A filesystem escape: write outside /tmp.  Contained by: --read-only
  // 6. Read /etc/passwd, and prove it's the image's, not the host's: by whom do you run?
  //    Contained by: the mount namespace, --user, --cap-drop
];
