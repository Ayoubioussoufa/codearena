// @ts-check
/**
 * Lesson 0048: vector search by hand, before pgvector does it for you.
 *
 *   cp vectors.start.mjs vectors.mjs     then write the functions below
 *   bash check.sh
 *
 * A vector is an array of numbers. Every function throws an Error when two
 * vectors have different lengths: comparing embeddings from two different
 * models is the classic silent bug, so make it loud.
 *
 *   - dot(a, b): the sum of a[i] × b[i].
 *   - norm(a): the length, √(a · a).
 *   - normalize(a): a / norm(a), a new array of length 1. A zero vector throws.
 *   - cosine(a, b): a · b / (norm(a) × norm(b)), from −1 to 1. A zero vector throws.
 *   - cosineDistance(a, b): 1 − cosine(a, b), what pgvector's <=> returns.
 *   - l2(a, b): the straight-line distance, √Σ(a[i] − b[i])², pgvector's <->.
 *   - topK(query, items, k): items are [{ id, vector }]. Returns the k items
 *     closest to the query by cosine, as [{ id, score }] with score = cosine,
 *     best first; equal scores in id order. This is exact search: it reads
 *     every vector, which is what an HNSW index exists to avoid.
 */

/** @param {number[]} a @param {number[]} b */ export function dot(a, b) { void a; void b; throw new Error("Not written yet."); }
/** @param {number[]} a */ export function norm(a) { void a; throw new Error("Not written yet."); }
/** @param {number[]} a */ export function normalize(a) { void a; throw new Error("Not written yet."); }
/** @param {number[]} a @param {number[]} b */ export function cosine(a, b) { void a; void b; throw new Error("Not written yet."); }
/** @param {number[]} a @param {number[]} b */ export function cosineDistance(a, b) { void a; void b; throw new Error("Not written yet."); }
/** @param {number[]} a @param {number[]} b */ export function l2(a, b) { void a; void b; throw new Error("Not written yet."); }
/** @param {number[]} query @param {{ id: string, vector: number[] }[]} items @param {number} k */ export function topK(query, items, k) { void query; void items; void k; throw new Error("Not written yet."); }
