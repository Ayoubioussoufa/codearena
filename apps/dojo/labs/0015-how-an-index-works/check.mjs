// Lesson 0015 checker: your indexes, judged by the plans Postgres actually picks.
import { readFileSync } from "node:fs";
import { psql, explain, shape } from "../_lib/psql.mjs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(40);
const ok = (l, n) => { passed++; console.log(`  ${green("✓")} ${pad(l)} ${dim(n)}`); };
const ko = (l, w) => { failed++; console.log(`  ${red("✗")} ${pad(l)} ${w}`); };

process.stdout.write(dim("seeding 300,000 submissions… "));
await psql(readFileSync(new URL("./seed.sql", import.meta.url), "utf8"));
console.log(dim("done"));

console.log(`\n${bold("Before your indexes")}`);
const Q = [
  ["1. a heavy user's latest 20", "SELECT * FROM submissions WHERE user_id = 1 ORDER BY created_at DESC LIMIT 20", { noSort: true }],
  ["1b. a light user's latest 20", "SELECT * FROM submissions WHERE user_id = 4242 ORDER BY created_at DESC LIMIT 20", {}],
  ["2. accepted count for a problem", "SELECT count(*) FROM submissions WHERE problem_id = 17 AND status = 'ACCEPTED'", {}],
  ["3. this user on this problem", "SELECT id FROM submissions WHERE user_id = 4242 AND problem_id = 17", {}],
  ["4. a problem by its slug", "SELECT id, title FROM problems WHERE slug = 'problem-17'", {}],
];
const MAX_BUFFERS = 60;
const before = [];
for (const [label, q] of Q) { const e = await explain(q); before.push(e); console.log(`  ${dim("·")} ${pad(label)} ${dim(`${shape(e.nodes)} · ${e.ms.toFixed(2)} ms · ${e.buffers} buffers`)}`); }

try { await psql(readFileSync(new URL("./indexes.sql", import.meta.url), "utf8")); }
catch (e) { console.log(red(`\nindexes.sql failed: ${e.message}`)); process.exit(1); }
await psql("VACUUM ANALYZE");

console.log(`\n${bold("After your indexes")}`);
for (const [i, [label, q, opts]] of Q.entries()) {
  const e = await explain(q);
  const problems = [];
  const seq = e.nodes.filter((n) => n["Node Type"] === "Seq Scan");
  if (seq.length) problems.push(`still a Seq Scan on ${seq.map((n) => n["Relation Name"]).join(", ")}`);
  if (opts.noSort && e.nodes.some((n) => n["Node Type"] === "Sort" || n["Node Type"] === "Incremental Sort")) problems.push("it still sorts: the index should deliver rows in order");
  if (e.buffers > MAX_BUFFERS) problems.push(`it reads ${e.buffers} buffers (8 kB pages); at most ${MAX_BUFFERS}`);
  const gain = before[i].buffers / Math.max(1, e.buffers);
  const note = `${shape(e.nodes)} · ${e.ms.toFixed(2)} ms · ${e.buffers} buffers (${gain.toFixed(0)}× fewer)`;
  if (problems.length === 0) ok(label, note); else ko(label, `${problems.join(" · ")} — ${note}`);
}

console.log(`\n${bold("The cost")}`);
const idx = await psql("SELECT indexname || '|' || pg_size_pretty(pg_relation_size(indexname::regclass)) FROM pg_indexes WHERE tablename = 'submissions' AND indexname <> 'submissions_pkey' ORDER BY 1");
const table = (await psql("SELECT pg_size_pretty(pg_relation_size('submissions'))"))[0];
const list = idx.map((l) => l.replace("|", " ")).join(", ") || "none";
if (idx.length >= 1 && idx.length <= 3) ok(`${idx.length} new index(es) on submissions`, `${list} · the table itself: ${table}`);
else ko(`${idx.length} new index(es) on submissions`, idx.length === 0 ? "no index on submissions at all" : `more than three: ${list}. Every index slows every insert`);

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0015.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
