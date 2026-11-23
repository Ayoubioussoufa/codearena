// Lesson 0049 checker: chunking, idempotent ingestion, retrieval metrics, context.
import { createHash } from "node:crypto";
import { load, section, check, assert, eq, near, finish } from "../_lib/js-check.mjs";

const r = await load(import.meta.dirname, "rag.mjs", "rag.start.mjs");

const NOTE = `# Two pointers

Two indices walk the array instead of one.

## When to use it

The array is sorted, and you look for a pair.

## Common mistakes

Moving both pointers at once skips pairs.

Forgetting \`left < right\` makes them cross.

### Off by one

Using \`<=\` compares an element with itself.

## Empty section

## Complexity

O(n) time, O(1) space.`;

section("Chunking");
let memo;
const noteChunks = () => (memo ??= r.chunkMarkdown(NOTE, { source: "dsa/two-pointers.md", maxChars: 1000 }));
await check("one chunk per section, empty ones skipped", () => {
  const chunks = noteChunks();
  eq(chunks.map((c) => c.heading), ["", "When to use it", "Common mistakes", "Off by one", "Complexity"], "headings");
});
await check("ids, source, and the heading line kept in the text", () => {
  const chunks = noteChunks();
  eq(chunks.map((c) => c.id), [0, 1, 2, 3, 4].map((n) => `dsa/two-pointers.md#${n}`), "ids");
  assert(chunks.every((c) => c.source === "dsa/two-pointers.md"), "every chunk needs its source");
  assert(chunks[2].text.startsWith("## Common mistakes") && chunks[2].text.includes("cross."), `chunk 2 is: ${JSON.stringify(chunks[2].text)}`);
  assert(chunks[0].text.startsWith("# Two pointers"), "text before the first ## heading is chunk 0, title line included");
});
await check("a long section splits between paragraphs", () => {
  const p = (n) => `Paragraph ${n}: ${"x".repeat(60)}.`;
  const md = `## Long\n\n${[1, 2, 3, 4, 5].map(p).join("\n\n")}`;
  const parts = r.chunkMarkdown(md, { source: "n.md", maxChars: 170 });
  assert(parts.length >= 3, `expected at least 3 parts, got ${parts.length}`);
  assert(parts.every((c) => c.text.length <= 170), `a part is longer than 170: ${parts.map((c) => c.text.length).join(", ")}`);
  assert(parts.every((c) => c.text.startsWith("## Long")), "every part should start with the heading line");
  assert(parts.every((c) => c.heading === "Long"), "every part keeps the heading");
  const all = parts.map((c) => c.text).join("\n");
  assert([1, 2, 3, 4, 5].every((n) => all.split(`Paragraph ${n}:`).length === 2), "each paragraph should appear exactly once");
  return parts.map((c) => c.text.length).join(" + ") + " chars";
});
await check("a paragraph longer than maxChars stays whole", () => {
  const big = "y".repeat(400);
  const parts = r.chunkMarkdown(`## Big\n\n${big}`, { source: "b.md", maxChars: 100 });
  assert(parts.some((c) => c.text.includes(big)), "the long paragraph was cut");
});

section("Idempotent ingestion");
await check("hashOf is SHA-256 in hex", () => {
  eq(r.hashOf("two pointers"), createHash("sha256").update("two pointers").digest("hex"), "hash");
});
await check("first run: everything is new", () => {
  const chunks = noteChunks();
  const p = r.plan(new Map(), chunks);
  eq(p, { insert: chunks.map((c) => c.id).sort(), update: [], remove: [], unchanged: 0 }, "plan");
});
await check("second run, nothing changed: nothing to do", () => {
  const chunks = noteChunks();
  const stored = new Map(chunks.map((c) => [c.id, r.hashOf(c.text)]));
  eq(r.plan(stored, chunks), { insert: [], update: [], remove: [], unchanged: 5 }, "plan");
});
await check("an edit, a new section, a deleted one", () => {
  const chunks = noteChunks();
  const stored = new Map(chunks.map((c) => [c.id, r.hashOf(c.text)]));
  stored.set("dsa/two-pointers.md#9", "old");
  const edited = chunks.map((c) => (c.id.endsWith("#4") ? { ...c, text: c.text + " Plus sorting: O(n log n)." } : c));
  edited.push({ id: "dsa/two-pointers.md#5", source: "dsa/two-pointers.md", heading: "New", text: "## New\n\nA new section." });
  eq(r.plan(stored, edited), { insert: ["dsa/two-pointers.md#5"], update: ["dsa/two-pointers.md#4"], remove: ["dsa/two-pointers.md#9"], unchanged: 4 }, "plan");
});

section("Measuring retrieval");
const results = [
  { relevant: "a", retrieved: ["a", "b", "c", "d"] },
  { relevant: "b", retrieved: ["x", "b", "y", "z"] },
  { relevant: "c", retrieved: ["x", "y", "z", "c"] },
  { relevant: "d", retrieved: ["x", "y", "z", "w"] },
];
await check("recall@k", () => {
  eq([1, 2, 4].map((k) => r.recallAtK(results, k)), [0.25, 0.5, 0.75], "recall@1, @2, @4");
});
await check("MRR", () => { near(r.mrr(results), (1 + 1 / 2 + 1 / 4 + 0) / 4, "mrr"); return "0.4375: rank matters, not just presence"; });

section("Augmentation");
await check("context in rank order, never cut, within budget", () => {
  const ranked = [{ id: "n#2", text: "Moving both pointers skips pairs." }, { id: "n#3", text: "Using <= compares an element with itself." }, { id: "n#1", text: "x".repeat(200) }];
  const ctx = r.buildContext(ranked, 200);
  eq(ctx, `<source id="n#2">Moving both pointers skips pairs.</source>\n<source id="n#3">Using <= compares an element with itself.</source>`, "context");
  assert(ctx.length <= 200, `length ${ctx.length} > 200`);
});
await check("it stops at the first chunk that doesn't fit", () => {
  const ranked = [{ id: "a", text: "first" }, { id: "b", text: "w".repeat(300) }, { id: "c", text: "third" }];
  eq(r.buildContext(ranked, 120), `<source id="a">first</source>`, "context (c ranks below b: it isn't promoted over it)");
});
await check("the first chunk alone too big: an empty context", () => {
  eq(r.buildContext([{ id: "a", text: "z".repeat(500) }], 100), "", "context");
});

finish();
