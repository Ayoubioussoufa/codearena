// Lesson 0043 checker: your sampler, case by case.
import { load, section, check, assert, near, nearAll, throwsWith, finish, show } from "../_lib/js-check.mjs";

const m = await load(import.meta.dirname, "sampler.mjs", "sampler.start.mjs");
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

section("Softmax and temperature");
await check("probabilities sum to 1, in the right proportions", () => {
  const p = m.softmax([1, 2, 3]);
  nearAll(p, [0.0900, 0.2447, 0.6652], "softmax([1, 2, 3])");
  near(sum(p), 1, "the sum");
});
await check("a low temperature sharpens, a high one flattens", () => {
  const cold = m.softmax([1, 2, 3], 0.5), warm = m.softmax([1, 2, 3], 2);
  nearAll(cold, [0.0159, 0.1173, 0.8668], "temperature 0.5");
  nearAll(warm, [0.1863, 0.3072, 0.5065], "temperature 2");
  return `top token: ${(cold[2] * 100).toFixed(0)}% cold, ${(warm[2] * 100).toFixed(0)}% warm`;
});
await check("huge logits don't overflow", () => {
  const p = m.softmax([1000, 1000, 998]);
  assert(p.every(Number.isFinite), `got ${show(p)}: subtract the largest logit before exp`);
  nearAll(p, [0.4683, 0.4683, 0.0634], "softmax([1000, 1000, 998])");
});
await check("a temperature of 0 throws", () => throwsWith(() => m.softmax([1, 2], 0)));
await check("the input array is left alone", () => {
  const logits = [1, 2, 3]; m.softmax(logits, 2);
  assert(show(logits) === "[1,2,3]", `softmax changed its input to ${show(logits)}`);
});

section("Choosing a token");
await check("greedy takes the largest, the first one on a tie", () => {
  assert(m.greedy([0.1, 3, 3, -1]) === 1, `greedy([0.1, 3, 3, -1]) = ${m.greedy([0.1, 3, 3, -1])}, expected 1`);
  assert(m.greedy([-5, -2, -9]) === 1, "all-negative logits: expected 1");
});
await check("top-k keeps the k largest, renormalised", () => {
  const probs = [0.1, 0.5, 0.15, 0.25];
  nearAll(m.topK(probs, 2), [0, 0.6667, 0, 0.3333], "topK(…, 2)");
  nearAll(m.topK(probs, 4), probs, "topK(…, 4)");
  assert(show(probs) === "[0.1,0.5,0.15,0.25]", "topK changed its input");
});
await check("top-p keeps the smallest set that reaches p", () => {
  const probs = [0.1, 0.5, 0.15, 0.25];
  nearAll(m.topP(probs, 0.5), [0, 1, 0, 0], "topP(…, 0.5)");
  nearAll(m.topP(probs, 0.7), [0, 0.6667, 0, 0.3333], "topP(…, 0.7)");
  nearAll(m.topP(probs, 0.85), [0, 0.5556, 0.1667, 0.2778], "topP(…, 0.85)");
  assert(show(probs) === "[0.1,0.5,0.15,0.25]", "topP changed its input");
});
await check("top-p adapts: a confident model keeps fewer tokens", () => {
  const confident = m.topP([0.92, 0.04, 0.02, 0.02], 0.9).filter((x) => x > 0).length;
  const unsure = m.topP([0.3, 0.25, 0.25, 0.2], 0.9).filter((x) => x > 0).length;
  assert(confident === 1 && unsure === 4, `kept ${confident} (confident) and ${unsure} (unsure), expected 1 and 4`);
  return "1 token vs 4, same p";
});
await check("sample walks the running sum", () => {
  const probs = [0.2, 0.5, 0.3];
  const got = [0, 0.1, 0.2, 0.69, 0.71, 0.9999].map((r) => m.sample(probs, r));
  assert(show(got) === "[0,0,1,1,2,2]", `for r = 0, 0.1, 0.2, 0.69, 0.71, 0.9999 got ${show(got)}, expected [0,0,1,1,2,2]`);
});
await check("10,000 draws land where the probabilities say", () => {
  const probs = m.softmax([2, 1, 0.5]);
  const counts = [0, 0, 0];
  for (let i = 0; i < 10000; i++) counts[m.sample(probs, (i + 0.5) / 10000)]++;
  counts.forEach((c, i) => near(c / 10000, probs[i], `share of token ${i}`, 0.002));
  return counts.join(" / ");
});

finish();
