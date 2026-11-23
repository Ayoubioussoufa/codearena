// @ts-check
/**
 * Lesson 0050: keyword search, and fusing it with vector search.
 *
 *   cp fuse.start.mjs fuse.mjs     then write the functions below
 *   bash check.sh
 *
 *   - tokenize(text): lowercase, split on anything that isn't a-z or 0-9,
 *     drop empty strings. "Off-by-one!" → ["off", "by", "one"].
 *   - bm25(query, docs, { k1 = 1.2, b = 0.75 } = {}): docs are [{ id, text }].
 *     Score every doc for the query with Okapi BM25:
 *         score(D) = Σ over each query term q (one term per query token,
 *                    repeats count again):
 *                    IDF(q) · f · (k1 + 1) / (f + k1 · (1 − b + b · |D| / avgdl))
 *         IDF(q)   = ln((N − n(q) + 0.5) / (n(q) + 0.5) + 1)
 *     f = how many times q appears in D, |D| = D's token count, avgdl = the
 *     average token count, N = the number of docs, n(q) = docs containing q.
 *     Return [{ id, score }] for docs with a score above 0, best first, equal
 *     scores in id order.
 *   - rrf(rankings, k = 60): rankings is a list of ranked id lists (best
 *     first). Reciprocal Rank Fusion: each id scores Σ 1 / (k + rank), rank
 *     counted from 1 in each list it appears in. Return [{ id, score }], best
 *     first, equal scores in id order.
 *   - hybrid(query, docs, vectorIds, { limit = 5 } = {}): fuse the BM25
 *     ranking (ids only) and vectorIds (your vector search's ranking) with
 *     rrf, and return the first `limit` ids.
 */

/** @param {string} text @returns {string[]} */ export function tokenize(text) { void text; throw new Error("Not written yet."); }
/** @param {string} query @param {{ id: string, text: string }[]} docs @param {{ k1?: number, b?: number }} [opts] */ export function bm25(query, docs, opts = {}) { void query; void docs; void opts; throw new Error("Not written yet."); }
/** @param {string[][]} rankings @param {number} [k] */ export function rrf(rankings, k = 60) { void rankings; void k; throw new Error("Not written yet."); }
/** @param {string} query @param {{ id: string, text: string }[]} docs @param {string[]} vectorIds @param {{ limit?: number }} [opts] */ export function hybrid(query, docs, vectorIds, opts = {}) { void query; void docs; void vectorIds; void opts; throw new Error("Not written yet."); }
