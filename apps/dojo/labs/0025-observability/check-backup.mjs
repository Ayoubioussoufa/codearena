// Lesson 0025 checker, part 2: back up, lose everything, restore.
import { execFile } from "node:child_process";
import { readdirSync, statSync, writeFileSync, rmSync, existsSync, utimesSync } from "node:fs";
import { psql } from "../_lib/psql.mjs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(56);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const sh = (script, args = []) => new Promise((resolve) => execFile("bash", [script, ...args], { timeout: 60000, env: process.env }, (err, out, errOut) => resolve({ code: err ? 1 : 0, out: String(out).trim(), err: String(errOut).trim() })));
const today = new Date().toISOString().slice(0, 10);

console.log(`\n${bold("Part 2: backups")}`);
rmSync("backups", { recursive: true, force: true });
await psql(`DROP TABLE IF EXISTS submissions; CREATE TABLE submissions (id serial PRIMARY KEY, code text, verdict text);
  INSERT INTO submissions (code, verdict) SELECT 'print(' || i || ')', CASE WHEN i % 3 = 0 THEN 'ACCEPTED' ELSE 'WRONG_ANSWER' END FROM generate_series(1, 1234) AS i;`);
let dump;
await check("backup.sh writes today's dump", async () => {
  const r = await sh("backup.sh"); if (r.code !== 0) throw new Error(`it failed: ${r.err.split("\n").pop()}`);
  dump = `backups/codearena-${today}.dump`;
  if (!existsSync(dump)) throw new Error(`no ${dump}; backups/ has: ${existsSync("backups") ? readdirSync("backups").join(", ") : "nothing"}`);
  if (statSync(dump).size < 1000) throw new Error(`${dump} is ${statSync(dump).size} bytes`);
  return `${(statSync(dump).size / 1024).toFixed(0)} KB`;
});
await check("it's a pg_dump custom-format archive", async () => {
  const head = await new Promise((res) => execFile("head", ["-c", "5", dump], (e, o) => res(String(o))));
  if (head !== "PGDMP") throw new Error("the file doesn't start with PGDMP: use --format=custom (pg_restore needs it)");
});
await check("it keeps the 7 newest dumps", async () => {
  for (let i = 1; i <= 9; i++) {
    const d = new Date(Date.now() - i * 86400000); const f = `backups/codearena-${d.toISOString().slice(0, 10)}.dump`;
    writeFileSync(f, "old"); utimesSync(f, d, d);
  }
  writeFileSync("backups/notes.txt", "not a dump");
  const r = await sh("backup.sh"); if (r.code !== 0) throw new Error(`it failed: ${r.err.split("\n").pop()}`);
  const dumps = readdirSync("backups").filter((f) => f.endsWith(".dump")).sort();
  if (dumps.length !== 7) throw new Error(`${dumps.length} dumps left: ${dumps.join(", ")}`);
  if (!dumps.includes(`codearena-${today}.dump`)) throw new Error("today's dump was deleted");
  if (!existsSync("backups/notes.txt")) throw new Error("it deleted a file that isn't a dump");
  return `${dumps[0]} … ${dumps.at(-1)}`;
});
await check("disaster: the table is dropped, the restore brings it back", async () => {
  await psql("DROP TABLE submissions");
  const r = await sh("restore-check.sh", [dump]); if (r.code !== 0) throw new Error(`it failed: ${r.err.split("\n").pop()}`);
  if (r.out.split("\n").pop().trim() !== "1234") throw new Error(`it printed "${r.out}"; the dump has 1234 submissions`);
  const inCheck = await new Promise((res) => execFile("docker", ["exec", process.env.PG_CONTAINER, "psql", "-U", "lab", "-d", "restore_check", "-tAc", "SELECT count(*) FROM submissions"], (e, o) => res(e ? null : String(o).trim())));
  if (inCheck !== "1234") throw new Error("the restore_check database doesn't hold the 1234 rows");
  const live = await psql("SELECT to_regclass('public.submissions') IS NULL");
  if (live[0] !== "t") throw new Error("restore-check.sh wrote into the live database: a restore test must never touch production");
  return "1234 rows in restore_check; production untouched";
});
await check("restoring twice works (it starts from a fresh database)", async () => {
  const r = await sh("restore-check.sh", [dump]); if (r.code !== 0 || r.out.split("\n").pop().trim() !== "1234") throw new Error(`second run: ${r.err.split("\n").pop() || r.out}`);
});

console.log();
if (failed === 0) console.log(`${green(bold(`Part 2: all ${passed} cases pass.`))} If part 1 passed too, tell your teacher: done 0025.`);
else console.log(`${bold(`Part 2: ${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
