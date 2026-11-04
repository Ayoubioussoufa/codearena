// Lesson 0027 checker: your design outline, its numbers recomputed.
import { readFileSync } from "node:fs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(52);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const SECTIONS = ["Requirements", "Capacity", "API", "Data model", "Design", "The judge, in depth", "At 100×", "Trade-offs"];
const text = readFileSync("outline.md", "utf8").replace(/<!--[\s\S]*?-->/g, "");
const heads = [...text.matchAll(/^## (.+?)\s*(?:\((\d+(?:\.\d+)?)\s*min\))?\s*$/gm)].map((m) => ({ name: m[1].trim(), min: m[2] ? Number(m[2]) : null, index: m.index, end: m.index + m[0].length }));
const body = Object.fromEntries(heads.map((h, i) => [h.name, text.slice(h.end, heads[i + 1]?.index ?? text.length)]));

console.log(`\n${bold("The shape")}`);
await check("all eight sections, in order", async () => {
  const names = heads.map((h) => h.name).filter((n) => SECTIONS.includes(n));
  if (JSON.stringify(names) !== JSON.stringify(SECTIONS)) throw new Error(`found: ${heads.map((h) => h.name).join(" · ") || "no ## headings"}`);
});
await check("a time budget on each, 15 minutes at most", async () => {
  const missing = heads.filter((h) => SECTIONS.includes(h.name) && h.min === null).map((h) => h.name);
  if (missing.length) throw new Error(`no "(N min)" on: ${missing.join(", ")}`);
  const total = heads.filter((h) => SECTIONS.includes(h.name)).reduce((a, h) => a + h.min, 0);
  if (total > 15) throw new Error(`${total} minutes: an interview won't wait`); return `${total} min`;
});

console.log(`\n${bold("Back of the envelope")}`);
const want = {
  "average submissions per second": 200000 / 86400,
  "peak submissions per second": (200000 / 86400) * 10,
  "runner slots needed at peak": (200000 / 86400) * 10 * 6,
  "new submission data per year (GB)": (200000 * 5 * 365) / 1e6,
  "peak leaderboard views per second": (200000 / 86400) * 10 * 50,
};
const how = {
  "average submissions per second": "20,000 × 10 / 86,400 s",
  "peak submissions per second": "the average × 10",
  "runner slots needed at peak": "peak per second × 6 slot-seconds each (Little's law)",
  "new submission data per year (GB)": "200,000 × 5 KB × 365",
  "peak leaderboard views per second": "peak submissions × 50",
};
for (const [label, value] of Object.entries(want)) {
  await check(label, async () => {
    const m = new RegExp(`^-\\s*${label.replace(/[()]/g, "\\$&")}:\\s*~?([\\d.,]+)`, "mi").exec(body.Capacity ?? "");
    if (!m) throw new Error(`no line "- ${label}: <number>" under ## Capacity`);
    const got = Number(m[1].replace(/,/g, ""));
    if (!(Math.abs(got - value) / value <= 0.15)) throw new Error(`${got} is off: recompute ${how[label]}`);
    return `${got}  (${how[label]})`;
  });
}

console.log(`\n${bold("The content")}`);
await check("requirements carry numbers", async () => { const r = body.Requirements ?? ""; if ((r.match(/\d/g) ?? []).length < 3) throw new Error("non-functional requirements need numbers: a latency, an availability, a limit"); });
await check("at least four endpoints", async () => {
  const n = (body.API ?? "").match(/\b(GET|POST|PUT|PATCH|DELETE)\s+\/\S*/g) ?? []; if (n.length < 4) throw new Error(`${n.length} found, written like "POST /submissions"`); return n.slice(0, 6).join(", ");
});
await check("at least three tables", async () => { const lines = (body["Data model"] ?? "").split("\n").filter((l) => /^\s*[-*]\s+\S/.test(l) || /^\s*\|/.test(l)); if (lines.length < 3) throw new Error("list the main tables, one per line"); });
await check("a diagram in the design", async () => { if (!/```(mermaid|text)\n[\s\S]+?```/.test(body.Design ?? "")) throw new Error("no ```mermaid or ```text block under ## Design"); });
await check("the judge, with its walls", async () => {
  const j = (body["The judge, in depth"] ?? "").toLowerCase();
  const WALLS = { queue: "queue", container: "container", timeout: "timeout", memory: "memory", network: "network", idempot: "idempotency", verdict: "verdicts", seccomp: "seccomp", pids: "pids", "read-only": "read-only", capabilit: "capabilities" };
  const hits = Object.entries(WALLS).filter(([stem]) => j.includes(stem)).map(([, word]) => word);
  if (hits.length < 5) throw new Error(`it mentions ${hits.join(", ") || "nothing specific"}; an interviewer will want at least five of: queue, container, timeout, memory, network, idempotency, verdicts, seccomp, pids, read-only, capabilities`);
  return hits.join(", ");
});
await check("at 100×: bottleneck → change, four times", async () => {
  const lines = (body["At 100×"] ?? "").split("\n").filter((l) => /^\s*-\s*[^:]+:\s*\S/.test(l));
  if (lines.length < 4) throw new Error(`${lines.length} lines like "- <bottleneck>: <what you change>"`);
  const k = ["runner", "worker", "autoscal", "queue", "replica", "cache", "cdn", "rate limit", "pool", "pgbouncer", "partition", "shard", "object storage", "horizontal", "firecracker", "gvisor", "kubernetes", "separate"].filter((w) => lines.join(" ").toLowerCase().includes(w));
  if (k.length < 3) throw new Error("the changes are vague: name the mechanism (more runner hosts, read replicas, a cache, a connection pooler…)");
  return `${lines.length} changes`;
});
await check("trade-offs: what instead of what, and why", async () => {
  const lines = (body["Trade-offs"] ?? "").split("\n").filter((l) => /^\s*[-*]\s+\S/.test(l));
  const good = lines.filter((l) => /instead of|rather than/i.test(l) && /because/i.test(l));
  if (good.length < 3) throw new Error(`${good.length} of ${lines.length} lines say what you chose instead of what, because why`);
  return `${good.length} trade-offs`;
});

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Now say it out loud, timed. Then tell your teacher: done 0027.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
