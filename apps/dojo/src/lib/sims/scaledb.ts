/** Size a database layer: replicas, shards, a cache, or a bigger machine. */
export interface DbLevel {
  name: string;
  story: string;
  reads: number;
  writes: number;
  /** Share of reads a cache could answer. */
  cacheable: number;
  terabytes: number;
  budget: number;
}
export interface DbConfig {
  shards: number;
  replicas: number;
  big: boolean;
  cache: boolean;
}
export const DB_START: DbConfig = { shards: 1, replicas: 0, big: false, cache: false };
export const LEVELS: readonly DbLevel[] = [
  { name: "The front page", story: "Everyone reads the same problem pages. Almost nobody writes.", reads: 18_000, writes: 200, cacheable: 0.8, terabytes: 0.5, budget: 4 },
  { name: "The sensor flood", story: "Thousands of devices write all day. Reads are rare, and never repeat.", reads: 2_000, writes: 4_000, cacheable: 0.1, terabytes: 1, budget: 3 },
  { name: "The big one", story: "Both, plus more data than one machine can hold.", reads: 30_000, writes: 3_000, cacheable: 0.9, terabytes: 5, budget: 5 },
];
export const NODE_CAPACITY = 5_000;
export const WRITE_COST = 2;
export const NODE_TB = 2;
export const SAFE = 0.7;

export interface DbResult {
  utilisation: number;
  storage: number;
  cost: number;
  nodes: number;
  ok: boolean;
}

/**
 * Every node of a shard replays every write of that shard, so replicas share
 * reads but never writes. That one line is the whole lesson.
 */
export function sizeDb(level: DbLevel, c: DbConfig): DbResult {
  const size = c.big ? 2 : 1;
  const reads = c.cache ? level.reads * (1 - level.cacheable) : level.reads;
  const perShard = 1 + c.replicas;
  const load = reads / c.shards / perShard + (level.writes / c.shards) * WRITE_COST;
  const utilisation = load / (NODE_CAPACITY * size);
  const storage = level.terabytes / c.shards / (NODE_TB * size);
  const nodes = c.shards * perShard;
  const cost = nodes * (c.big ? 3 : 1) + (c.cache ? 2 : 0);
  return { utilisation, storage, cost, nodes, ok: utilisation <= SAFE && storage <= 1 && cost <= level.budget };
}
