/** The guide's latency ladder, and duels drawn from it. */
import { Rng } from "../engine/rng";

export interface Op {
  name: string;
  ns: number;
}
export const OPS: readonly Op[] = [
  { name: "Read from the CPU's L1 cache", ns: 1 },
  { name: "Read from main memory", ns: 100 },
  { name: "Read 4 KB at random from an SSD", ns: 150_000 },
  { name: "Read 1 MB in order from memory", ns: 250_000 },
  { name: "A round trip inside one datacenter", ns: 500_000 },
  { name: "Read 1 MB in order from an SSD", ns: 1_000_000 },
  { name: "One seek on a spinning disk", ns: 10_000_000 },
  { name: "Read 1 MB in order from a spinning disk", ns: 30_000_000 },
  { name: "A round trip across the world", ns: 150_000_000 },
];

export const LATENCY_STREAK = 6;
/** Closer than this isn't worth memorising, so it never comes up. */
export const MIN_RATIO = 3;

export function duel(seed: number): [Op, Op] {
  const rng = new Rng(seed * 40503 + 7);
  for (;;) {
    const [a, b] = rng.sample(OPS, 2) as [Op, Op];
    if (Math.max(a.ns, b.ns) / Math.min(a.ns, b.ns) >= MIN_RATIO) return [a, b];
  }
}

export function real(ns: number): string {
  if (ns >= 1e6) return `${ns / 1e6} ms`;
  if (ns >= 1e3) return `${ns / 1e3} µs`;
  return `${ns} ns`;
}

/** The same time if one nanosecond lasted one second. */
export function human(ns: number): string {
  const units: [number, string][] = [[31_536_000, "year"], [86_400, "day"], [3_600, "hour"], [60, "minute"], [1, "second"]];
  for (const [size, name] of units) {
    if (ns >= size) {
      const n = ns / size;
      const shown = n >= 10 ? Math.round(n) : Math.round(n * 10) / 10;
      return `${shown} ${name}${shown === 1 ? "" : "s"}`;
    }
  }
  return "an instant";
}
