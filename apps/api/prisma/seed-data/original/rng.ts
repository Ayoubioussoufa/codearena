/**
 * A small seeded random generator (mulberry32). The same seed gives the same
 * tests every run, so a failing test can always be reproduced. Math.random()
 * can't promise that.
 */
export function createRng(seed: number) {
  let state = seed;
  const next = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return (min: number, max: number) =>
    min + Math.floor(next() * (max - min + 1));
}
