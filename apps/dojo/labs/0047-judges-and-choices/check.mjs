// Lesson 0047 checker: judge statistics and the model choice.
import { load, section, check, eq, near, throwsWith, finish } from "../_lib/js-check.mjs";

const s = await load(import.meta.dirname, "judge-stats.mjs", "judge-stats.start.mjs");
const T = true, F = false;
// 10 hints you graded yourself, and what a judge model said about them.
const human = [T, T, T, T, T, T, F, F, F, F];
const judge = [T, T, T, T, T, F, T, T, F, F];

section("Agreement is not enough");
await check("agreement", () => { near(s.agreement(human, judge), 0.7, "agreement"); });
await check("confusion: tp, tn, fp, fn", () => { eq(s.confusion(human, judge), { tp: 5, tn: 2, fp: 2, fn: 1 }, "confusion"); });
await check("tpr and tnr", () => {
  const r = s.rates(human, judge);
  near(r.tpr, 5 / 6, "tpr"); near(r.tnr, 0.5, "tnr");
  return "it lets half of the bad hints through";
});
await check("the lazy judge: 90% agreement, catches nothing", () => {
  const h = [T, T, T, T, T, T, T, T, T, F], lazy = Array(10).fill(T);
  near(s.agreement(h, lazy), 0.9, "agreement"); near(s.rates(h, lazy).tnr, 0, "tnr");
  near(s.kappa(h, lazy), 0, "kappa");
  return "kappa 0: no better than chance";
});
await check("Cohen's kappa", () => {
  near(s.kappa(human, judge), 0.3478, "kappa"); // po 0.7, pe 0.54
  near(s.kappa([T, F, T, F], [T, F, T, F]), 1, "perfect agreement");
  near(s.kappa([T, T], [T, T]), 1, "pe = 1 and po = 1");
});
await check("different lengths throw", () => throwsWith(() => s.agreement([T, F], [T])));

section("Choosing the model");
const lat = (...xs) => xs;
await check("percentile, nearest rank", () => {
  const v = [120, 80, 300, 95, 100, 2000, 110, 90, 105, 85];
  eq([s.percentile(v, 50), s.percentile(v, 95), s.percentile(v, 100), s.percentile(v, 10)], [100, 2000, 2000, 80], "p50, p95, p100, p10");
  eq(v[0], 120, "the input wasn't sorted in place");
});
await check("the fastest of the near-best models wins", () => {
  const rows = [
    { model: "big-7b", score: 0.86, latenciesMs: lat(9000, 9500, 10000, 12000, 30000) },
    { model: "small-3b", score: 0.85, latenciesMs: lat(3000, 3200, 3500, 4000, 6000) },
    { model: "tiny-1b", score: 0.62, latenciesMs: lat(800, 900, 1000, 1100, 1200) },
  ];
  eq(s.chooseModel(rows), { model: "small-3b", score: 0.85, p50: 3500, p95: 6000 }, "choice");
  return "1 point of score for 5× the speed";
});
await check("outside the tolerance, the score wins", () => {
  const rows = [
    { model: "big-7b", score: 0.9, latenciesMs: lat(9000, 9000) },
    { model: "small-3b", score: 0.85, latenciesMs: lat(3000, 3000) },
  ];
  eq(s.chooseModel(rows).model, "big-7b", "choice"); eq(s.chooseModel(rows, 0.06).model, "small-3b", "choice with tolerance 0.06");
});
await check("ties: higher score, then the name", () => {
  const same = lat(100, 100);
  eq(s.chooseModel([{ model: "b", score: 0.8, latenciesMs: same }, { model: "a", score: 0.81, latenciesMs: same }]).model, "a", "higher score");
  eq(s.chooseModel([{ model: "b", score: 0.8, latenciesMs: same }, { model: "a", score: 0.8, latenciesMs: same }]).model, "a", "same score");
});

finish();
