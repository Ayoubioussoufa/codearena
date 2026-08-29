/**
 * Seeded RNG (mulberry32) + sampling helpers used by exercise generators.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  /** Uniform float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Uniform integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  pick<T>(items: readonly T[]): T {
    const item = items[this.int(0, items.length - 1)];
    if (item === undefined && items.length === 0) {
      throw new Error("Rng.pick on empty array");
    }
    return item as T;
  }

  /** New shuffled copy (Fisher–Yates). */
  shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [out[i], out[j]] = [out[j] as T, out[i] as T];
    }
    return out;
  }

  /** n distinct items. */
  sample<T>(items: readonly T[], n: number): T[] {
    return this.shuffle(items).slice(0, n);
  }

  chance(p: number): boolean {
    return this.next() < p;
  }
}

export function freshSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) | 0;
}
