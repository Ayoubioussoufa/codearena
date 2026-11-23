// Lesson 0050 checker: BM25, Reciprocal Rank Fusion, and the hybrid of the two.
// The BM25 numbers were computed independently (in Python) from the formula
// in fuse.start.mjs.
import { load, section, check, assert, eq, near, finish } from "../_lib/js-check.mjs";

const f = await load(import.meta.dirname, "fuse.mjs", "fuse.start.mjs");

const docs = [
  { id: "d1", text: "Time limit exceeded: your loop is O(n^2) for n up to 10^5." },
  { id: "d2", text: "A wrong answer often comes from an off-by-one loop bound." },
  { id: "d3", text: "Two pointers turn an O(n^2) pair search into O(n)." },
  { id: "d4", text: "Use a hash map to count in one pass." },
];
const scores = (rows) => rows.map((x) => `${x.id}:${x.score.toFixed(4)}`);

section("Keywords: BM25");
await check("tokenize", () => {
  eq(f.tokenize("Off-by-one: O(n^2)!"), ["off", "by", "one", "o", "n", "2"], "tokens");
  eq(f.tokenize("  "), [], "blank text");
});
await check("one rare term outscores a common one", () => {
  eq(scores(f.bm25("hash map", docs)), ["d4:2.6823"], "hash map");
});
await check("the full formula, length-normalised", () => {
  eq(scores(f.bm25("loop O(n^2)", docs)), ["d1:2.7770", "d3:2.5993", "d2:0.6931"], "loop O(n^2)");
  eq(scores(f.bm25("off-by-one loop", docs)), ["d2:3.7942", "d4:0.7721", "d1:0.6288"], "off-by-one loop");
});
await check("exact words a vector model blurs", () => {
  const ids = f.bm25("10^5", docs).map((x) => x.id);
  eq(ids, ["d1"], "10^5");
  return "an embedding of \"10^5\" is a fuzzy point; BM25 matches the token";
});
await check("no match, no result", () => { eq(f.bm25("dynamic programming", docs), [], "results"); });
await check("k1 and b change the scores", () => {
  const d1 = (opts) => f.bm25("loop", docs, opts).find((x) => x.id === "d1")?.score;
  assert(d1({}) < d1({ b: 0 }), "d1 is longer than average: with b = 0 (no length normalisation) its score should go up");
  assert(d1({ k1: 0 }) !== d1({}), "k1 = 0 ignores how often a term repeats, and should change the score");
});

section("Fusion: RRF");
await check("rrf sums 1 / (k + rank)", () => {
  const got = f.rrf([["a", "b", "c"], ["b", "c", "a"]]);
  eq(got.map((x) => x.id), ["b", "a", "c"], "ids");
  near(got[0].score, 1 / 62 + 1 / 61, "b's score");
});
await check("an id in one list only still counts", () => {
  const got = f.rrf([["a", "b"], ["c"]]);
  eq(got.map((x) => x.id), ["a", "c", "b"], "ids (a and c tie: id order)");
});
await check("k changes how much the top ranks dominate", () => {
  const got = f.rrf([["a", "b", "c", "d"], ["d", "c", "b", "a"]], 1);
  near(got.find((x) => x.id === "a").score, 1 / 2 + 1 / 5, "a's score with k = 1");
});

section("Hybrid");
await check("keywords and vectors, fused", () => {
  // Your vector search ranked d3 first: "pair search" is close in meaning to the query.
  eq(f.hybrid("loop O(n^2)", docs, ["d3", "d4", "d1", "d2"], { limit: 3 }), ["d3", "d1", "d2"], "hybrid");
  return "d3 is 2nd for BM25 and 1st for vectors: it wins";
});
await check("the default limit is 5", () => {
  const many = Array.from({ length: 8 }, (_, i) => `v${i}`);
  eq(f.hybrid("loop", docs, many).length, 5, "results");
});

finish();
