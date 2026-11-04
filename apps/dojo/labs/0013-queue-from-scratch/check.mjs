// Lesson 0013 checker: your queue, against a real Redis.
import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { connect } from "../_lib/resp.mjs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
if (!existsSync(new URL("./queue.mjs", import.meta.url))) { console.log("No queue.mjs yet. Start with: cp queue.start.mjs queue.mjs"); process.exit(1); }
const { createQueue } = await import("./queue.mjs");
const port = Number(process.env.REDIS_PORT);
if (!port) { console.log("Run me with: bash check.sh"); process.exit(1); }
const r1 = await connect(port), r2 = await connect(port);
const fresh = () => `q${randomBytes(4).toString("hex")}`;

let passed = 0, failed = 0;
const pad = (s) => s.padEnd(52);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const eq = (got, want, what) => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };

console.log(`\n${bold("A queue")}`);
await check("first in, first out", async () => {
  const q = createQueue(r1, fresh()); for (const id of ["a", "b", "c"]) await q.enqueue(id);
  const got = []; for (let i = 0; i < 3; i++) got.push((await q.take()).id); eq(got, ["a", "b", "c"], "order");
});
await check("nothing waiting: take() gives null", async () => { eq(await createQueue(r1, fresh()).take(), null, "take()"); });
await check("a taken job sits in active until acked", async () => {
  const q = createQueue(r1, fresh()); await q.enqueue("s-1", { submissionId: 1 });
  const job = await q.take(); eq(job.payload, { submissionId: 1 }, "payload"); eq(await q.counts(), { waiting: 0, active: 1, dead: 0 }, "before ack");
  await q.ack(job); eq(await q.counts(), { waiting: 0, active: 0, dead: 0 }, "after ack");
});
await check("the same id twice is enqueued once", async () => {
  const q = createQueue(r1, fresh()); const a = await q.enqueue("s-42"), b = await q.enqueue("s-42");
  eq([a, b], [true, false], "enqueue results"); eq((await q.counts()).waiting, 1, "waiting");
});
await check("a big payload is refused: enqueue the id, not the code", async () => {
  const q = createQueue(r1, fresh()); let threw = false;
  try { await q.enqueue("s-1", { code: "x".repeat(50_000) }); } catch { threw = true; }
  eq(threw, true, "threw"); eq((await q.counts()).waiting, 0, "waiting");
});

console.log(`\n${bold("Two workers, one job each")}`);
await check("100 jobs, two workers at once: each taken exactly once", async () => {
  const name = fresh(); const q1 = createQueue(r1, name), q2 = createQueue(r2, name);
  for (let i = 0; i < 100; i++) await q1.enqueue(`j${i}`);
  const seen = [];
  const work = async (q) => { for (;;) { const j = await q.take(); if (!j) return; seen.push(j.id); await q.ack(j); } };
  await Promise.all([work(q1), work(q2), work(q1), work(q2)]);
  eq(seen.length, 100, "jobs taken"); eq(new Set(seen).size, 100, "distinct jobs");
  return "LMOVE is atomic";
});

console.log(`\n${bold("Failures: at-least-once, retries, dead letters")}`);
await check("a worker crashes mid-job: recover() redelivers it", async () => {
  const q = createQueue(r1, fresh()); await q.enqueue("s-7");
  const job = await q.take(); void job; // ...and the worker dies here, without ack
  eq(await q.recover(), 1, "recovered"); const again = await q.take(); eq(again?.id, "s-7", "taken again");
  return "delivered twice: at-least-once";
});
await check("an infrastructure failure is retried, up to maxAttempts", async () => {
  const q = createQueue(r1, fresh(), { maxAttempts: 3 }); await q.enqueue("s-9");
  const attempts = [];
  for (let i = 0; i < 3; i++) { const j = await q.take(); attempts.push(j.attempts); await q.fail(j, { retryable: true }); }
  eq(attempts, [0, 1, 2], "attempts seen"); eq(await q.counts(), { waiting: 0, active: 0, dead: 1 }, "after the third failure");
});
await check("a non-retryable failure goes straight to dead", async () => {
  const q = createQueue(r1, fresh(), { maxAttempts: 5 }); await q.enqueue("s-3");
  await q.fail(await q.take(), { retryable: false }); eq(await q.counts(), { waiting: 0, active: 0, dead: 1 }, "counts");
});
await check("a retried job goes to the back of the line", async () => {
  const q = createQueue(r1, fresh()); await q.enqueue("first"); await q.enqueue("second");
  await q.fail(await q.take(), { retryable: true });
  eq((await q.take()).id, "second", "next taken");
});

r1.close(); r2.close();
console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0013.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
