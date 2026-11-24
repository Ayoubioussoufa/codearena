/** Four servers behind a load balancer: one is slow, one dies halfway. */
import { Rng } from "../engine/rng";

export type Algorithm = "round-robin" | "random" | "ip-hash" | "least";
export interface BalancerConfig {
  algorithm: Algorithm;
  /** Where "who is logged in" lives. */
  sessions: "memory" | "shared";
  healthChecks: boolean;
}
export const BALANCER_START: BalancerConfig = { algorithm: "round-robin", sessions: "memory", healthChecks: false };
/** Requests per second each server can serve. The last one is on an old machine. */
export const CAPACITY = [50, 50, 50, 20] as const;
export const DYING = 1;
export const KILL_AT = 10;
const RATE = 100;
const SECONDS = 20;
const TICK = 0.1;

export interface Frame {
  t: number;
  queues: number[];
  alive: boolean[];
}
export interface BalancerResult {
  frames: Frame[];
  p95: number;
  failed: number;
  lostSessions: number;
}

export function runBalancer(c: BalancerConfig): BalancerResult {
  const rng = new Rng(77);
  const queues = [0, 0, 0, 0];
  const alive = [true, true, true, true];
  const waits: number[] = [];
  const frames: Frame[] = [];
  let failed = 0, next = 0, lostSessions = 0;
  // Office networks: most users share a few addresses, so hashing is uneven.
  const clients = Array.from({ length: 12 }, (_, i) => ({ server: (i * 7) % 4, weight: i < 2 ? 5 : 1 }));
  const weight = clients.reduce((s, x) => s + x.weight, 0);

  const ticks = Math.round(SECONDS / TICK);
  for (let n = 0; n < ticks; n++) {
    const t = n * TICK;
    if (Math.abs(t - KILL_AT) < TICK / 2) {
      alive[DYING] = false;
      failed += Math.round(queues[DYING] as number);
      queues[DYING] = 0;
      if (c.sessions === "memory") lostSessions = 250;
    }
    const pool = [0, 1, 2, 3].filter((s) => !c.healthChecks || alive[s]);
    for (let r = 0; r < RATE * TICK; r++) {
      let s: number;
      if (c.algorithm === "round-robin") s = pool[next++ % pool.length] as number;
      else if (c.algorithm === "random") s = rng.pick(pool);
      else if (c.algorithm === "least") {
        // The least busy for its size: the one that will answer first.
        s = pool.reduce((best, x) => (cost(x) < cost(best) ? x : best), pool[0] as number);
      } else {
        let pick = rng.next() * weight;
        const client = clients.find((x) => (pick -= x.weight) < 0) ?? clients[0];
        const wanted = client?.server ?? 0;
        s = pool.includes(wanted) ? wanted : (pool[wanted % pool.length] as number);
      }
      if (!alive[s]) {
        failed++;
        continue;
      }
      waits.push((((queues[s] as number) + 1) / (CAPACITY[s] as number)) * 1000);
      queues[s] = (queues[s] as number) + 1;
    }
    for (let s = 0; s < 4; s++) if (alive[s]) queues[s] = Math.max(0, (queues[s] as number) - (CAPACITY[s] as number) * TICK);
    if (n % 5 === 4) frames.push({ t: t + TICK, queues: queues.map((q) => Math.round(q)), alive: [...alive] });
  }
  waits.sort((a, b) => a - b);
  return { frames, p95: waits[Math.ceil(waits.length * 0.95) - 1] ?? 0, failed, lostSessions };

  function cost(s: number) {
    return ((queues[s] as number) + 1) / (CAPACITY[s] as number);
  }
}

export const balancerWon = (r: BalancerResult) => r.p95 < 300 && r.failed === 0 && r.lostSessions === 0;
