// @ts-check
/**
 * Lesson 0049: the parts of a RAG pipeline that are plain code.
 *
 *   cp rag.start.mjs rag.mjs     then write the functions below
 *   bash check.sh
 *
 * Ingestion
 *   - chunkMarkdown(md, { source, maxChars }) splits a markdown note into
 *     chunks [{ id, source, heading, text }]:
 *       · a new chunk starts at every heading line (## or ###); `heading` is
 *         that heading's text (without the #s), "" for text before the first one;
 *       · `text` starts with the heading line itself, so every chunk carries
 *         its own context; empty or whitespace-only sections are skipped;
 *       · a section longer than maxChars is split between paragraphs (on blank
 *         lines) into parts of at most maxChars; every part after the first
 *         repeats the heading line first. A single paragraph longer than
 *         maxChars becomes its own part, uncut;
 *       · id = `${source}#${n}`, n counting the chunks of the file from 0.
 *   - hashOf(text): the SHA-256 of the text, in hex (node:crypto).
 *   - plan(stored, chunks): stored is a Map from id to the hash in your
 *     database. Returns { insert, update, remove, unchanged }: the ids to
 *     insert (new), to update (hash changed), to remove (stored but gone), each
 *     sorted, and the number unchanged. Running the ingestion twice must
 *     re-embed nothing.
 *
 * Retrieval, measured
 *   - recallAtK(results, k): results are [{ relevant, retrieved }], one per
 *     test query: the id that should come back, and the ids that did, best
 *     first. The share of queries whose relevant id is in the top k.
 *   - mrr(results): the mean of 1 / (position of the relevant id, from 1),
 *     counting 0 when it's missing.
 *
 * Augmentation
 *   - buildContext(chunks, maxChars): chunks ranked best first. Wraps each as
 *       <source id="ID">TEXT</source>
 *     joined with "\n", in rank order, stopping at the first chunk that would
 *     make the result longer than maxChars. Never cut a chunk in half.
 */

/** @param {string} md @param {{ source: string, maxChars: number }} opts */ export function chunkMarkdown(md, opts) { void md; void opts; throw new Error("Not written yet."); }
/** @param {string} text */ export function hashOf(text) { void text; throw new Error("Not written yet."); }
/** @param {Map<string, string>} stored @param {{ id: string, text: string }[]} chunks */ export function plan(stored, chunks) { void stored; void chunks; throw new Error("Not written yet."); }
/** @param {{ relevant: string, retrieved: string[] }[]} results @param {number} k */ export function recallAtK(results, k) { void results; void k; throw new Error("Not written yet."); }
/** @param {{ relevant: string, retrieved: string[] }[]} results */ export function mrr(results) { void results; throw new Error("Not written yet."); }
/** @param {{ id: string, text: string }[]} chunks @param {number} maxChars */ export function buildContext(chunks, maxChars) { void chunks; void maxChars; throw new Error("Not written yet."); }
