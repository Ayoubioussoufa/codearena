/** An LRU cache in front of a database, driven by a fixed stream of requests. */
import { Rng } from "../engine/rng";

export const KEYS = 200;
const WARMUP = 1000;
const REQUESTS = 5000;

export interface CacheConfig {
  /** How many keys fit. */
  capacity: number;
  /** 0 = every key equally popular; 1.3 = a few keys take most requests. */
  skew: number;
  /** A copy is thrown away this many requests after it was loaded. */
  ttl: number;
  /** On a write, delete the cached copy. */
  invalidate: boolean;
}
export interface CacheResult {
  hitRatio: number;
  stalePer1000: number;
  dbPer1000: number;
  avgMs: number;
  /** Keys in the cache at the end. */
  cached: Set<number>;
}
export const CACHE_START: CacheConfig = { capacity: 10, skew: 0.4, ttl: 4000, invalidate: false };
export const CACHE_GOAL = { hits: 0.7, stale: 5, capacity: 40 };

export function runCache(c: CacheConfig): CacheResult {
  const rng = new Rng(20261124);
  const cumulative: number[] = [];
  let total = 0;
  for (let k = 1; k <= KEYS; k++) cumulative.push((total += 1 / k ** c.skew));
  const pickKey = () => {
    const r = rng.next() * total;
    let lo = 0, hi = KEYS - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((cumulative[mid] as number) > r) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  };

  // A Map keeps insertion order, so the first entry is the least recently used.
  const cache = new Map<number, { version: number; loadedAt: number }>();
  const version = new Array<number>(KEYS).fill(0);
  let hits = 0, stale = 0, counted = 0;
  for (let t = 0; t < WARMUP + REQUESTS; t++) {
    const counting = t >= WARMUP;
    if (t % 25 === 0) {
      // Popular things are edited more often too.
      const k = pickKey();
      version[k] = (version[k] as number) + 1;
      if (c.invalidate) cache.delete(k);
    }
    const k = pickKey();
    if (counting) counted++;
    const entry = cache.get(k);
    if (entry && t - entry.loadedAt < c.ttl) {
      cache.delete(k);
      cache.set(k, entry);
      if (counting) {
        hits++;
        if (entry.version !== version[k]) stale++;
      }
      continue;
    }
    cache.delete(k);
    if (c.capacity === 0) continue;
    if (cache.size >= c.capacity) cache.delete(cache.keys().next().value as number);
    cache.set(k, { version: version[k] as number, loadedAt: t });
  }
  const hitRatio = hits / counted;
  return {
    hitRatio,
    stalePer1000: (stale / counted) * 1000,
    dbPer1000: (1 - hitRatio) * 1000,
    avgMs: 1 + (1 - hitRatio) * 25,
    cached: new Set(cache.keys()),
  };
}

export function cacheWon(c: CacheConfig, r: CacheResult): boolean {
  return r.hitRatio >= CACHE_GOAL.hits && r.stalePer1000 <= CACHE_GOAL.stale && c.capacity <= CACHE_GOAL.capacity;
}
