import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const MAX_OUTPUT_BYTES = 64 * 1024 * 1024;

export type ProgramRun = { output: string; timeMs: number; timedOut: boolean };

/** Runs a problem's solution.js or brute.js as a real stdin/stdout program. */
export function runProgram(
  slug: string,
  file: 'solution.js' | 'brute.js',
  input: string,
  timeoutMs = 30_000,
): ProgramRun {
  const started = performance.now();
  const run = spawnSync('node', [join(__dirname, slug, file)], {
    input,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: MAX_OUTPUT_BYTES,
  });
  const timeMs = Math.round(performance.now() - started);
  const timedOut = run.error !== undefined && run.signal === 'SIGTERM';
  if (!timedOut && run.status !== 0) {
    throw new Error(`${slug}/${file} failed: ${run.stderr}`);
  }
  return { output: run.stdout, timeMs, timedOut };
}
