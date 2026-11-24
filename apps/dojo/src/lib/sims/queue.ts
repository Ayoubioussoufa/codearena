/** A contest burst hits the judge's queue: 4 minutes, one step per second. */
export interface QueueConfig {
  /** Workers running all the time. */
  base: number;
  /** Autoscaling may add workers up to this many. */
  max: number;
  /** Reject new jobs when this many are waiting (0 = never). */
  bound: number;
}
export const QUEUE_START: QueueConfig = { base: 10, max: 10, bound: 0 };
export const SECONDS = 240;
/** One submission keeps a worker busy for 3 seconds. */
export const JOB_SECONDS = 3;
const BOOT = 15;
export const MEMORY = 1_500;
export const QUEUE_GOAL = { p95: 30, rejected: 0.02, cost: 150 };

export const arrivalsAt = (t: number) => (t >= 20 && t < 80 ? 30 : 2);

export interface QueueResult {
  depth: number[];
  workers: number[];
  p95: number;
  rejected: number;
  cost: number;
  crashed: boolean;
}

export function runQueue(c: QueueConfig): QueueResult {
  const max = Math.max(c.base, c.max);
  const waiting: number[] = []; // arrival second of each waiting job
  const depth: number[] = [], workers: number[] = [], waits: number[] = [];
  const orders: { at: number; count: number }[] = [];
  let up = c.base, credit = 0, rejected = 0, arrived = 0, workerSeconds = 0, crashed = false, idleFor = 0;
  for (let t = 0; t < SECONDS; t++) {
    while (orders.length > 0 && (orders[0]?.at ?? Infinity) <= t) up = Math.min(max, up + (orders.shift()?.count ?? 0));
    for (let i = 0; i < arrivalsAt(t); i++) {
      arrived++;
      if (c.bound > 0 && waiting.length >= c.bound) rejected++;
      else waiting.push(t);
    }
    credit = Math.min(credit + up / JOB_SECONDS, Math.max(up, 1));
    while (credit >= 1 && waiting.length > 0) {
      waits.push(t - (waiting.shift() as number));
      credit--;
    }
    if (waiting.length > MEMORY) crashed = true;
    // Autoscaling looks at the depth: a long line orders more workers, an
    // empty one lets them go after a few quiet seconds.
    const pending = orders.reduce((n, o) => n + o.count, 0);
    if (waiting.length > up * 2 && up + pending < max) orders.push({ at: t + BOOT, count: max - up - pending });
    idleFor = waiting.length === 0 ? idleFor + 1 : 0;
    if (idleFor >= 10 && up > c.base) up = c.base;
    workerSeconds += up;
    depth.push(waiting.length);
    workers.push(up);
  }
  for (const a of waiting) waits.push(SECONDS - a); // still waiting at the end
  waits.sort((a, b) => a - b);
  return {
    depth,
    workers,
    p95: waits[Math.ceil(waits.length * 0.95) - 1] ?? 0,
    rejected: rejected / arrived,
    cost: workerSeconds / 60,
    crashed,
  };
}

export const queueWon = (r: QueueResult) => !r.crashed && r.p95 <= QUEUE_GOAL.p95 && r.rejected <= QUEUE_GOAL.rejected && r.cost <= QUEUE_GOAL.cost;
