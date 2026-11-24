/** What the database sees when cached copies expire, with and without fixes. */
export interface Fixes {
  /** Spread expiry times out. */
  jitter: boolean;
  /** One request per key refills; the others wait for it. */
  singleFlight: boolean;
  /** Serve the old copy while one request refreshes it. */
  stale: boolean;
}
export type Scenario = "hot" | "mass";
export const NO_FIXES: Fixes = { jitter: false, singleFlight: false, stale: false };
export const POOL = 40;

const BUCKET = 50; // ms per bar
export const BUCKETS = 70; // 3.5 seconds
const QUERY = 200; // ms one database query takes
const EXPIRY = 1000;

/** Database queries running in each 50 ms slice. */
export function stampede(scenario: Scenario, f: Fixes): number[] {
  const keys = scenario === "hot" ? 1 : 300;
  const perSecond = scenario === "hot" ? 500 : 5;
  const gap = 1000 / perSecond;
  const bars = new Array<number>(BUCKETS).fill(0);
  const addQuery = (start: number) => {
    for (let b = Math.floor(start / BUCKET); b < Math.ceil((start + QUERY) / BUCKET); b++) if (b >= 0 && b < BUCKETS) bars[b] = (bars[b] as number) + 1;
  };
  for (let k = 0; k < keys; k++) {
    const expires = EXPIRY + (f.jitter ? (keys === 1 ? 300 : (k / keys) * 2000) : 0);
    const offset = (k * 37) % gap; // keys aren't asked for at the same instant
    let refilled = Infinity;
    for (let t = offset; t < BUCKETS * BUCKET; t += gap) {
      if (t < expires || t >= refilled) continue;
      if (refilled === Infinity) {
        refilled = t + QUERY;
        addQuery(t);
      } else if (!f.singleFlight && !f.stale) {
        addQuery(t);
      }
    }
  }
  return bars;
}

export const peak = (bars: number[]) => Math.max(...bars);
export const stampedeWon = (f: Fixes) => peak(stampede("hot", f)) <= POOL && peak(stampede("mass", f)) <= POOL;
