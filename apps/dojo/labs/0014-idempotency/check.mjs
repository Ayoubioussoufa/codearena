// Lesson 0014 checker: claims, fencing and rotation, under real concurrency.
import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
for (const f of ["claim.sql", "finish.sql", "rotate.sql"]) if (!existsSync(new URL(`./${f}`, import.meta.url))) { console.log(`No ${f} yet: see README.md.`); process.exit(1); }
const pg = process.env.PG_CONTAINER;
if (!pg) { console.log("Run me with: bash check.sh"); process.exit(1); }

/** Runs SQL through psql in the container; resolves with the non-empty output lines. */
function psql(sql, vars = {}) {
  return new Promise((resolve, reject) => {
    const args = ["exec", "-i", pg, "psql", "-U", "lab", "-d", "lab", "-q", "-t", "-A", "-v", "ON_ERROR_STOP=1"];
    for (const [k, v] of Object.entries(vars)) args.push("-v", `${k}=${v}`);
    args.push("-f", "-");
    const p = spawn("docker", args);
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => (code === 0 ? resolve(out.split("\n").map((l) => l.trim()).filter(Boolean)) : reject(new Error(err.trim() || `psql exited ${code}`))));
    p.stdin.end(sql);
  });
}
const file = (f) => readFileSync(new URL(`./${f}`, import.meta.url), "utf8");
const claim = (id, worker, lease = 60) => psql(file("claim.sql"), { id, worker, lease });
const finish = (id, worker, verdict) => psql(file("finish.sql"), { id, worker, verdict });
const rotate = (hash) => psql(file("rotate.sql"), { hash });

let passed = 0, failed = 0;
const pad = (s) => s.padEnd(56);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const eq = (got, want, what) => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };

await psql(`
  DROP TABLE IF EXISTS submissions, refresh_tokens;
  CREATE TABLE submissions (id int PRIMARY KEY, status text NOT NULL DEFAULT 'PENDING', claimed_by text, claimed_at timestamptz, verdict text);
  CREATE TABLE refresh_tokens (token_hash text PRIMARY KEY, user_id int NOT NULL, used_at timestamptz);
  INSERT INTO submissions (id) SELECT generate_series(1, 20);
  INSERT INTO refresh_tokens VALUES ('t1', 42, NULL), ('t2', 7, NULL);
`);
const row = async (id) => (await psql(`SELECT status || '|' || coalesce(claimed_by, '') || '|' || coalesce(verdict, '') FROM submissions WHERE id = ${id}`))[0];

console.log(`\n${bold("The claim")}`);
await check("a PENDING submission can be claimed", async () => { eq((await claim(1, "w1")).length, 1, "rows returned"); eq(await row(1), "RUNNING|w1|", "the row"); });
await check("a fresh claim can't be taken by another worker", async () => { eq((await claim(1, "w2")).length, 0, "rows returned"); eq(await row(1), "RUNNING|w1|", "the row"); });
await check("20 workers claim the same submission at once: one wins", async () => {
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => claim(2, `w${i}`)));
  const winners = results.filter((r) => r.length === 1).length;
  eq(winners, 1, "winners"); return "one statement that checks and writes";
});

console.log(`\n${bold("A claim that expired, and fencing")}`);
await check("a stale claim can be taken over", async () => {
  await claim(3, "old"); await psql("UPDATE submissions SET claimed_at = now() - interval '10 minutes' WHERE id = 3");
  eq((await claim(3, "new", 60)).length, 1, "takeover rows"); eq(await row(3), "RUNNING|new|", "the row");
});
await check("the old worker can't write its verdict any more", async () => { eq((await finish(3, "old", "AC")).length, 0, "rows written"); eq(await row(3), "RUNNING|new|", "the row"); });
await check("the new owner writes it", async () => { eq((await finish(3, "new", "WA")).length, 1, "rows written"); eq(await row(3), "DONE|new|WA", "the row"); });
await check("a second finish writes nothing", async () => { eq((await finish(3, "new", "AC")).length, 0, "rows written"); eq(await row(3), "DONE|new|WA", "the verdict"); });
await check("a stranger can't finish someone else's claim", async () => { await claim(4, "w1"); eq((await finish(4, "intruder", "AC")).length, 0, "rows written"); });
await check("a DONE submission can't be claimed again", async () => { eq((await claim(3, "late", 0)).length, 0, "rows returned"); });

console.log(`\n${bold("The same job, delivered twice")}`);
await check("two deliveries, run concurrently: judged once", async () => {
  let runs = 0;
  const deliver = async (worker) => { if ((await claim(5, worker)).length === 1) { runs++; await finish(5, worker, "AC"); } };
  await Promise.all([deliver("a"), deliver("b")]);
  eq(runs, 1, "judgings"); eq(await row(5), "DONE|" + (await row(5)).split("|")[1] + "|AC", "the row"); return "the runner ran once";
});

console.log(`\n${bold("I-6: refresh-token rotation")}`);
await check("a token is used once", async () => { eq(await rotate("t1"), ["42"], "first use"); eq(await rotate("t1"), [], "second use"); });
await check("20 concurrent uses of one token: one succeeds", async () => {
  const results = await Promise.all(Array.from({ length: 20 }, () => rotate("t2")));
  eq(results.filter((r) => r.length === 1).length, 1, "successes"); return "the race in I-6, closed";
});

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0014.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
