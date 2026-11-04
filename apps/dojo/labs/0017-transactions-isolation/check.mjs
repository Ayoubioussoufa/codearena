// Lesson 0017 checker: many sessions at once, and the totals that must survive them.
import { readFileSync, existsSync } from "node:fs";
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
const eq = (got, want, what) => { if (got !== want) throw new Error(`${what}: expected ${want}, got ${got}`); };
const file = (f) => readFileSync(new URL(`./${f}`, import.meta.url), "utf8");
const one = async (sql) => (await psql(sql))[0];

/** Runs a session; retries it on a serialization failure, as a worker would. Resolves with the retry count. */
async function session(sql, vars) {
  for (let retries = 0; ; retries++) {
    try { await psql(sql, vars); return retries; }
    catch (e) {
      if (!/could not serialize|deadlock detected/.test(e.message) || retries >= 10) throw e;
      await new Promise((r) => setTimeout(r, 10 + Math.random() * 40 * (retries + 1)));
    }
  }
}
const all = async (sql, varsList) => (await Promise.all(varsList.map((v) => session(sql, v)))).reduce((a, b) => a + b, 0);
const fresh = async (migrate = false) => {
  await psql(file("schema.sql"));
  if (migrate && existsSync(new URL("./migration.sql", import.meta.url))) await psql(file("migration.sql"));
};

console.log(`\n${bold("1. The lost update")}`);
await fresh();
await all(file("increment.start.sql"), Array.from({ length: 30 }, () => ({})));
const lost = Number(await one("SELECT n FROM counters WHERE id = 1"));
console.log(dim(`  · the starter, 30 sessions at once: n = ${lost}. ${30 - lost} increments were lost.`));
await check("increment.sql: 30 sessions at once, n = 30", async () => {
  await fresh();
  const retries = await all(file("increment.sql"), Array.from({ length: 30 }, () => ({})));
  eq(Number(await one("SELECT n FROM counters WHERE id = 1")), 30, "n");
  return retries ? `${retries} retries` : "";
});

console.log(`\n${bold("2. The first Accepted, at READ COMMITTED")}`);
await fresh();
await all(file("first-solve.start.sql"), Array.from({ length: 20 }, () => ({ user: 1, problem: 7 })));
console.log(dim(`  · the starter, 20 deliveries at once: solved = ${await one("SELECT solved FROM users WHERE id = 1")}, ${await one("SELECT count(*) FROM solved")} rows.`));
await check("first-solve.sql stays at READ COMMITTED", async () => {
  if (/serializable|repeatable\s+read/i.test(file("first-solve.sql"))) throw new Error("this part is about READ COMMITTED: solve it with a constraint, an atomic statement or a lock");
});
await check("20 deliveries of the same Accepted: counted once", async () => {
  await fresh(true);
  await all(file("first-solve.sql"), Array.from({ length: 20 }, () => ({ user: 1, problem: 7 })));
  eq(await one("SELECT solved FROM users WHERE id = 1"), "1", "users.solved");
  eq(await one("SELECT count(*) FROM solved WHERE user_id = 1"), "1", "rows in solved");
});
await check("10 problems, each delivered twice: 10", async () => {
  await fresh(true);
  const vars = Array.from({ length: 20 }, (_, i) => ({ user: 2, problem: 100 + (i % 10) }));
  await all(file("first-solve.sql"), vars);
  eq(await one("SELECT solved FROM users WHERE id = 2"), "10", "users.solved");
});
await check("other users are untouched", async () => { eq(await one("SELECT sum(solved) FROM users WHERE id <> 2"), "0", "others' solved"); });

console.log(`\n${bold("3. The same logic, at SERIALIZABLE")}`);
await check("serializable.sql runs at SERIALIZABLE", async () => {
  if (!/isolation\s+level\s+serializable/i.test(file("serializable.sql"))) throw new Error("start the transaction with BEGIN ISOLATION LEVEL SERIALIZABLE");
  if (/on\s+conflict|for\s+update/i.test(file("serializable.sql"))) throw new Error("keep the starter's check-then-act logic: the level alone must make it safe");
});
await check("20 deliveries at once: counted once, with retries", async () => {
  await fresh();
  const retries = await all(file("serializable.sql"), Array.from({ length: 20 }, () => ({ user: 1, problem: 7 })));
  eq(await one("SELECT solved FROM users WHERE id = 1"), "1", "users.solved");
  eq(await one("SELECT count(*) FROM solved"), "1", "rows in solved");
  return `${retries} serialization failures, each retried`;
});

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0017.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
