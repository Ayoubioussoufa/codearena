// @ts-check
/**
 * Lesson 0043: how a model picks its next token.
 *
 *   cp sampler.start.mjs sampler.mjs     then write the five functions
 *   bash check.sh
 *
 * At every step, a language model gives one score (a logit) to every token in
 * its vocabulary. Turning those scores into one chosen token is your code's
 * job here, exactly what Ollama does between two words.
 *
 * Rules (each one is a checker case):
 *   - softmax(logits, temperature = 1): divide every logit by the temperature,
 *     then exponentiate and normalise, so the probabilities sum to 1. It must
 *     not overflow on logits like 1000 (subtract the largest logit first).
 *     A temperature of 0 or less throws an Error.
 *   - greedy(logits): the index of the largest logit (the first one on a tie).
 *   - topK(probs, k): keep the k largest probabilities, set the others to 0,
 *     and renormalise so the kept ones sum to 1. Returns a new array.
 *   - topP(probs, p): keep the smallest set of the largest probabilities whose
 *     sum is at least p, set the others to 0, renormalise. Returns a new array.
 *   - sample(probs, r): r is your random draw, in [0, 1). Add the probabilities
 *     up in index order and return the first index where the running sum is
 *     greater than r.
 */

/** @param {number[]} logits @param {number} [temperature] @returns {number[]} */
export function softmax(logits, temperature = 1) {
  void logits; void temperature;
  throw new Error("Not written yet.");
}

/** @param {number[]} logits @returns {number} */
export function greedy(logits) {
  void logits;
  throw new Error("Not written yet.");
}

/** @param {number[]} probs @param {number} k @returns {number[]} */
export function topK(probs, k) {
  void probs; void k;
  throw new Error("Not written yet.");
}

/** @param {number[]} probs @param {number} p @returns {number[]} */
export function topP(probs, p) {
  void probs; void p;
  throw new Error("Not written yet.");
}

/** @param {number[]} probs @param {number} r @returns {number} */
export function sample(probs, r) {
  void probs; void r;
  throw new Error("Not written yet.");
}
