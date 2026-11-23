// @ts-check
/**
 * Lesson 0047: can you trust your judge model, and which model do you ship?
 *
 *   cp judge-stats.start.mjs judge-stats.mjs     then write the functions below
 *   bash check.sh
 *
 * Labels are booleans: true = PASS (a good hint), false = FAIL. `human` is
 * your own grading, `judge` is the judge model's, same order, same length
 * (throw an Error if the lengths differ).
 *
 *   - agreement(human, judge): the share of positions where they agree.
 *   - confusion(human, judge): { tp, tn, fp, fn } where "positive" is PASS:
 *       tp: both PASS          tn: both FAIL
 *       fp: judge PASS, human FAIL  (a bad hint let through)
 *       fn: judge FAIL, human PASS  (a good hint rejected)
 *   - rates(human, judge): { tpr, tnr }, tpr = tp / (tp + fn), tnr = tn / (tn + fp).
 *     tnr is the one that matters most: how many bad hints the judge catches.
 *   - kappa(human, judge): Cohen's kappa, (po − pe) / (1 − pe), where po is the
 *     agreement and pe = P(human PASS)·P(judge PASS) + P(human FAIL)·P(judge FAIL).
 *     When pe is 1, return 1 if po is 1, else 0.
 *   - percentile(values, p): nearest-rank: sort ascending, take the value at
 *     position ceil(p / 100 × n), counting from 1. Doesn't change its input.
 *   - chooseModel(rows, tolerance = 0.02): rows are
 *       [{ model, score, latenciesMs: number[] }]
 *     Keep the models whose score is within `tolerance` of the best score, and
 *     among them return the one with the lowest p95 latency (ties: the higher
 *     score, then the model name in alphabetical order). Return
 *       { model, score, p50, p95 }.
 */

/** @param {boolean[]} human @param {boolean[]} judge */ export function agreement(human, judge) { void human; void judge; throw new Error("Not written yet."); }
/** @param {boolean[]} human @param {boolean[]} judge */ export function confusion(human, judge) { void human; void judge; throw new Error("Not written yet."); }
/** @param {boolean[]} human @param {boolean[]} judge */ export function rates(human, judge) { void human; void judge; throw new Error("Not written yet."); }
/** @param {boolean[]} human @param {boolean[]} judge */ export function kappa(human, judge) { void human; void judge; throw new Error("Not written yet."); }
/** @param {number[]} values @param {number} p */ export function percentile(values, p) { void values; void p; throw new Error("Not written yet."); }
/** @param {{ model: string, score: number, latenciesMs: number[] }[]} rows @param {number} [tolerance] */ export function chooseModel(rows, tolerance = 0.02) { void rows; void tolerance; throw new Error("Not written yet."); }
