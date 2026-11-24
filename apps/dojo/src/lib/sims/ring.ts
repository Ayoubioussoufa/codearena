/** Which server owns each key: modulo, a ring, or a ring with virtual nodes. */
export type Strategy = "modulo" | "ring" | "vnodes";
export const KEY_COUNT = 600;
const VNODES = 100;

/** FNV-1a, then a final mix so close inputs land far apart. */
export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

export const keyName = (i: number) => `key:${i}`;

export interface Point {
  at: number;
  node: string;
}
export function points(strategy: Strategy, nodes: readonly string[]): Point[] {
  const copies = strategy === "vnodes" ? VNODES : 1;
  return nodes
    .flatMap((node) => Array.from({ length: copies }, (_, v) => ({ at: hash(`${node}#${v}`), node })))
    .sort((a, b) => a.at - b.at);
}

/** The owner of every key, in key order. */
export function owners(strategy: Strategy, nodes: readonly string[]): string[] {
  const ring = strategy === "modulo" ? [] : points(strategy, nodes);
  return Array.from({ length: KEY_COUNT }, (_, i) => {
    const h = hash(keyName(i));
    if (strategy === "modulo") return nodes[h % nodes.length] as string;
    return (ring.find((p) => p.at >= h) ?? (ring[0] as Point)).node;
  });
}

export function moved(before: readonly string[], after: readonly string[]): number {
  return before.filter((o, i) => o !== after[i]).length / before.length;
}

/** The fullest node, compared with the average. */
export function imbalance(assigned: readonly string[], nodes: readonly string[]): number {
  const counts = nodes.map((n) => assigned.filter((o) => o === n).length);
  return Math.max(...counts) / (assigned.length / nodes.length);
}
export const RING_START = ["A", "B", "C", "D"] as const;
export const RING_GOAL = { modulo: 0.6, moved: 0.3, imbalance: 1.35 };
