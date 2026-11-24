/** 64 commits: the first is good, the last is bad. Somewhere it broke. */
export const COMMITS = 64;
export const TESTS = 6;

/** Index of the first bad commit: 1 to 63 (commit 0 is known good). */
export const culprit = (seed: number) => 1 + ((Math.imul(seed, 2654435761) >>> 0) % (COMMITS - 1));

export interface Range {
  /** Last commit known to be good. */
  good: number;
  /** First commit known to be bad. */
  bad: number;
}
export const RANGE: Range = { good: 0, bad: COMMITS - 1 };
export function test(r: Range, i: number, seed: number): Range {
  return i >= culprit(seed) ? { ...r, bad: Math.min(r.bad, i) } : { ...r, good: Math.max(r.good, i) };
}
export const found = (r: Range) => r.bad - r.good === 1;
