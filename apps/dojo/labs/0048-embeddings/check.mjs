// Lesson 0048 checker: the vector maths, then exact nearest-neighbour search.
import { load, section, check, eq, near, nearAll, throwsWith, finish } from "../_lib/js-check.mjs";

const v = await load(import.meta.dirname, "vectors.mjs", "vectors.start.mjs");

section("The maths");
await check("dot and norm", () => {
  near(v.dot([1, 2, 3], [4, -5, 6]), 12, "dot"); near(v.norm([3, 4]), 5, "norm([3, 4])");
});
await check("normalize gives length 1, direction unchanged", () => {
  const u = v.normalize([3, 4]);
  nearAll(u, [0.6, 0.8], "normalize([3, 4])"); near(v.norm(u), 1, "its norm");
});
await check("cosine: same direction 1, opposite −1, at right angles 0", () => {
  near(v.cosine([1, 2], [2, 4]), 1, "[1,2] vs [2,4]");
  near(v.cosine([1, 2], [-1, -2]), -1, "[1,2] vs [-1,-2]");
  near(v.cosine([1, 0], [0, 5]), 0, "[1,0] vs [0,5]");
  near(v.cosine([1, 2, 3], [4, -5, 6]), 0.3655, "[1,2,3] vs [4,-5,6]");
});
await check("cosine ignores length; L2 doesn't", () => {
  near(v.cosine([1, 1], [10, 10]), 1, "cosine([1,1], [10,10])");
  near(v.l2([1, 1], [10, 10]), 12.7279, "l2([1,1], [10,10])");
  return "why embeddings are usually compared by direction";
});
await check("cosineDistance is what pgvector's <=> returns", () => {
  near(v.cosineDistance([1, 0], [0, 1]), 1, "at right angles");
  near(v.cosineDistance([1, 2], [2, 4]), 0, "same direction");
});
await check("on unit vectors, dot is cosine", () => {
  const a = v.normalize([2, 7, 1]), b = v.normalize([8, 2, 8]);
  near(v.dot(a, b), v.cosine([2, 7, 1], [8, 2, 8]), "dot of the normalized vectors");
  return "why many stores normalize once and use the inner product";
});
await check("mismatched lengths and zero vectors throw", async () => {
  await throwsWith(() => v.dot([1, 2], [1, 2, 3]));
  await throwsWith(() => v.cosine([0, 0], [1, 2]));
  await throwsWith(() => v.normalize([0, 0, 0]));
});

section("Search");
const items = [
  { id: "two-pointers", vector: [0.9, 0.1, 0.0] },
  { id: "sliding-window", vector: [0.8, 0.3, 0.1] },
  { id: "binary-search", vector: [0.1, 0.9, 0.2] },
  { id: "off-by-one", vector: [0.2, 0.2, 0.95] },
  { id: "loop-bounds", vector: [0.35, 0.3, 1.05] },
];
await check("topK: the k closest by cosine, best first", () => {
  const got = v.topK([0.3, 0.3, 1.0], items, 2);
  eq(got.map((r) => r.id), ["loop-bounds", "off-by-one"], "ids");
  near(got[0].score, 0.9994, "best score");
});
await check("equal scores come back in id order", () => {
  const twins = [{ id: "b", vector: [1, 0] }, { id: "a", vector: [2, 0] }, { id: "c", vector: [0, 1] }];
  eq(v.topK([1, 0], twins, 2).map((r) => r.id), ["a", "b"], "ids");
});
await check("k larger than the set returns everything", () => {
  eq(v.topK([1, 0, 0], items, 50).length, items.length, "length");
});
await check("10,000 vectors of 384 dimensions, exactly", () => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648) - 0.5;
  const big = Array.from({ length: 10000 }, (_, i) => ({ id: `c${String(i).padStart(5, "0")}`, vector: Array.from({ length: 384 }, rnd) }));
  const target = big[4242].vector.map((x) => x + rnd() * 0.05);
  const t0 = performance.now();
  const got = v.topK(target, big, 3);
  const ms = performance.now() - t0;
  eq(got[0].id, "c04242", "the nearest");
  return `${ms.toFixed(0)} ms for one query: fine for 10k, not for 10M`;
});

finish();
