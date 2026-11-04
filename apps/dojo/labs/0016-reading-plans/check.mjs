// Lesson 0016 checker: same answers as the slow queries, much better plans.
import { readFileSync } from "node:fs";
import { psql, explain, shape } from "../_lib/psql.mjs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(48);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const eq = (got, want, what) => {
  if (JSON.stringify(got) === JSON.stringify(want)) return;
  const i = got.findIndex((g, k) => g !== want[k]);
  throw new Error(`${what}: ${got.length} rows, expected ${want.length}${i >= 0 ? `; first difference at row ${i + 1}: got ${got[i] ?? "nothing"}, expected ${want[i] ?? "nothing"}` : ""}`);
};
const file = (f) => readFileSync(new URL(`./${f}`, import.meta.url), "utf8");
const statements = (sql) => sql.replace(/--.*$/gm, "").split(";").map((s) => s.trim()).filter(Boolean);
/** Substitutes psql variables the way psql does, for EXPLAIN. */
const bind = (sql, vars) => sql.replace(/:'(\w+)'/g, (_, k) => `'${String(vars[k]).replace(/'/g, "''")}'`).replace(/:(\w+)/g, (m, k) => (k in vars ? String(vars[k]) : m));
const one = (f) => { const s = statements(file(f)); if (s.length !== 1) throw new Error(`${f} must hold exactly one statement; it has ${s.length}`); return s[0]; };
/** The largest "actual rows × loops" of any scan on submissions: the rows the plan touched. */
const touched = (nodes) => Math.max(0, ...nodes.filter((n) => n["Relation Name"] === "submissions" && /Scan/.test(n["Node Type"])).map((n) => n["Actual Rows"] * n["Actual Loops"]));

process.stdout.write(dim("seeding 300,000 submissions and lesson 15's indexes… "));
await psql(file("seed.sql")); await psql("VACUUM ANALYZE");
console.log(dim("done"));

console.log(`\n${bold("1. page.sql: keyset pagination")}`);
const COLS = "id || ',' || problem_id || ',' || language || ',' || status || ',' || created_at";
const offsetPage = (user, offset) => psql(`SELECT ${COLS} FROM submissions WHERE user_id = ${user} ORDER BY created_at DESC, id DESC OFFSET ${offset} LIMIT 20`);
const cursorAt = async (user, offset) => { const [l] = await psql(`SELECT created_at || '|' || id FROM submissions WHERE user_id = ${user} ORDER BY created_at DESC, id DESC OFFSET ${offset} LIMIT 1`); const [ts, id] = l.split("|"); return { user, cursor_ts: ts, cursor_id: id }; };
const runPage = async (vars) => psql(`SELECT ${COLS} FROM (${one("page.sql")}) AS page`, vars);
await check("page 50 of user 1: same 20 rows as OFFSET 980", async () => { eq(await runPage(await cursorAt(1, 979)), await offsetPage(1, 980), "rows"); });
await check("page 2 of a light user: same rows", async () => { eq(await runPage(await cursorAt(4242, 4)), await offsetPage(4242, 5), "rows"); });
await check("it touches 20 rows, not 1,000", async () => {
  const slow = await explain(`SELECT id, problem_id, language, status, created_at FROM submissions WHERE user_id = 1 ORDER BY created_at DESC, id DESC OFFSET 980 LIMIT 20`);
  const vars = await cursorAt(1, 979); const e = await explain(bind(one("page.sql"), vars)); const t = touched(e.nodes);
  if (t > 21) throw new Error(`it touched ${t} rows of submissions — ${shape(e.nodes)}`);
  return `OFFSET touched ${touched(slow.nodes)} rows, ${slow.buffers} buffers · yours ${t} rows, ${e.buffers} buffers`;
});
await check("I-10: the cursor's row was deleted, the next page still comes", async () => {
  const vars = await cursorAt(1, 499); const want = await offsetPage(1, 500);
  await psql(`DELETE FROM submissions WHERE id = ${vars.cursor_id}`);
  eq(await runPage(vars), want, "rows after the deletion");
});

console.log(`\n${bold("2. solved.sql: one query, not N+1")}`);
const wantSolved = (user) => psql(`SELECT DISTINCT p.id || ',' || p.title, p.id FROM problems p JOIN submissions s ON s.problem_id = p.id WHERE s.user_id = ${user} AND s.status = 'ACCEPTED' ORDER BY p.id`).then((r) => r.map((l) => l.split("|")[0]));
const runSolved = (user) => psql(`SELECT id || ',' || title FROM (${one("solved.sql")}) AS solved`, { user });
await check("user 1: each solved problem once, in id order", async () => { const want = await wantSolved(1); eq(await runSolved(1), want, "rows"); return `${want.length} problems`; });
await check("a light user too", async () => { eq(await runSolved(4242), await wantSolved(4242), "rows"); });
await check("one statement, no Seq Scan on submissions", async () => {
  const e = await explain(bind(one("solved.sql"), { user: 1 }));
  if (e.nodes.some((n) => n["Node Type"] === "Seq Scan" && n["Relation Name"] === "submissions")) throw new Error(`a Seq Scan on submissions — ${shape(e.nodes)}`);
  const ids = await psql(`SELECT problem_id FROM submissions WHERE user_id = 1 AND status = 'ACCEPTED'`);
  const t0 = performance.now(); await psql(ids.map((id) => `SELECT title FROM problems WHERE id = ${id};`).join("\n")); const nPlus1 = performance.now() - t0;
  const t1 = performance.now(); await runSolved(1); const single = performance.now() - t1;
  return `N+1: ${ids.length + 1} statements, ${nPlus1.toFixed(0)} ms · yours: 1, ${single.toFixed(0)} ms (and no network in between)`;
});

console.log(`\n${bold("3. list.sql: read the plan, then fix it")}`);
const SLOW = (d, a) => `SELECT p.id, p.title, count(s.id) FILTER (WHERE s.status = 'ACCEPTED') AS accepted, count(s.id) AS total FROM problems p LEFT JOIN submissions s ON s.problem_id = p.id WHERE p.difficulty = ${d} AND p.id > ${a} GROUP BY p.id, p.title ORDER BY p.id LIMIT 20`;
const wantList = (d, a) => psql(`SELECT id || ',' || title || ',' || accepted || ',' || total FROM (${SLOW(d, a)}) AS l`);
const runList = (d, a) => psql(`SELECT id || ',' || title || ',' || accepted || ',' || total FROM (${one("list.sql")}) AS l`, { difficulty: d, after_id: a });
const slowPlan = await explain(SLOW(2, 0));
console.log(dim(`  the slow version: ${shape(slowPlan.nodes)} · ${slowPlan.buffers} buffers`));
for (const n of slowPlan.nodes) console.log(dim(`    ${n["Node Type"].padEnd(22)} ${(n["Index Name"] ?? n["Relation Name"] ?? "").padEnd(28)} rows=${n["Actual Rows"]} loops=${n["Actual Loops"]} buffers=${(n["Shared Hit Blocks"] ?? 0) + (n["Shared Read Blocks"] ?? 0)}`));
await check("difficulty 2, first page: same rows", async () => { eq(await runList(2, 0), await wantList(2, 0), "rows"); });
await check("difficulty 1, after id 1000: same rows", async () => { eq(await runList(1, 1000), await wantList(1, 1000), "rows"); });
await check("a problem nobody tried shows 0 and 0", async () => {
  await psql("INSERT INTO problems VALUES (20001, 'problem-20001', 'Problem 20001', 3)");
  eq(await runList(3, 19990), await wantList(3, 19990), "rows");
});
await check("at most 200 buffers", async () => {
  const e = await explain(bind(one("list.sql"), { difficulty: 2, after_id: 0 }));
  if (e.buffers > 200) throw new Error(`${e.buffers} buffers — ${shape(e.nodes)}`);
  return `${slowPlan.buffers} → ${e.buffers} buffers`;
});

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0016.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
