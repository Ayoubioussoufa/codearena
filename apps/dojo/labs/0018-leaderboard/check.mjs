// Lesson 0018 checker: your leaderboard, against a real Redis.
import { randomBytes } from "node:crypto";
import { connect } from "../_lib/resp.mjs";
import { createLeaderboard } from "./leaderboard.mjs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
const port = Number(process.env.REDIS_PORT);
if (!port) { console.log("Run me with: bash check.sh"); process.exit(1); }
const r1 = await connect(port), r2 = await connect(port), admin = await connect(port);
const fresh = () => `lb${randomBytes(4).toString("hex")}`;
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(52);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const eq = (got, want, what) => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };
const S = (userId, problemId, points, atSec) => ({ userId, problemId, points, atSec });

console.log(`\n${bold("Scores")}`);
await check("a solve adds its points", async () => {
  const lb = createLeaderboard(r1, fresh()); await lb.recordSolve(S("ada", "p1", 100, 10));
  eq(await lb.top(5), [{ rank: 1, userId: "ada", points: 100 }], "top(5)");
});
await check("points add up across problems", async () => {
  const lb = createLeaderboard(r1, fresh());
  await lb.recordSolve(S("ada", "p1", 100, 10)); await lb.recordSolve(S("ada", "p2", 250, 20));
  eq((await lb.rankOf("ada"))?.points, 350, "ada's points");
});
await check("the same problem twice counts once", async () => {
  const lb = createLeaderboard(r1, fresh());
  const a = await lb.recordSolve(S("ada", "p1", 100, 10)), b = await lb.recordSolve(S("ada", "p1", 100, 99));
  eq([a, b], [true, false], "recordSolve results"); eq((await lb.rankOf("ada"))?.points, 100, "points");
});
await check("20 deliveries at once, two connections: once", async () => {
  const name = fresh(); const lbs = [createLeaderboard(r1, name), createLeaderboard(r2, name)];
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => lbs[i % 2].recordSolve(S("ada", "p1", 100, 10))));
  eq(results.filter(Boolean).length, 1, "deliveries that counted"); eq((await lbs[0].rankOf("ada"))?.points, 100, "points");
});

console.log(`\n${bold("Ranks and ties")}`);
await check("best first, ranks from 1", async () => {
  const lb = createLeaderboard(r1, fresh());
  await lb.recordSolve(S("ada", "p1", 100, 10)); await lb.recordSolve(S("linus", "p1", 100, 11)); await lb.recordSolve(S("linus", "p2", 300, 12)); await lb.recordSolve(S("grace", "p3", 200, 13));
  eq(await lb.top(3), [{ rank: 1, userId: "linus", points: 400 }, { rank: 2, userId: "grace", points: 200 }, { rank: 3, userId: "ada", points: 100 }], "top(3)");
});
await check("equal points: who got there first ranks higher", async () => {
  const lb = createLeaderboard(r1, fresh());
  await lb.recordSolve(S("amy", "p1", 300, 100)); await lb.recordSolve(S("zack", "p2", 300, 200));
  eq((await lb.top(2)).map((r) => r.userId), ["amy", "zack"], "order");
  const lb2 = createLeaderboard(r1, fresh());
  await lb2.recordSolve(S("zack", "p1", 300, 100)); await lb2.recordSolve(S("amy", "p2", 300, 200));
  eq((await lb2.top(2)).map((r) => r.userId), ["zack", "amy"], "order, the other way round");
  return "by time, not by name";
});
await check("…and it updates when the order changes", async () => {
  const lb = createLeaderboard(r1, fresh());
  await lb.recordSolve(S("zack", "p1", 300, 100)); await lb.recordSolve(S("amy", "p2", 200, 50)); await lb.recordSolve(S("amy", "p3", 100, 300));
  eq((await lb.top(2)).map((r) => `${r.userId}:${r.points}`), ["zack:300", "amy:300"], "zack reached 300 at 100, amy at 300");
  await lb.recordSolve(S("amy", "p4", 1, 301));
  eq((await lb.rankOf("amy"))?.rank, 1, "amy's rank after one more point");
});
await check("rankOf: a stranger has no rank", async () => { eq(await createLeaderboard(r1, fresh()).rankOf("nobody"), null, "rankOf"); });

console.log(`\n${bold("At scale")}`);
await check("10,000 users: rankOf reads a few bytes, not the set", async () => {
  const lb = createLeaderboard(r1, fresh());
  await Promise.all(Array.from({ length: 10000 }, (_, i) => lb.recordSolve(S(`u${i}`, "p1", 1 + ((i * 7919) % 5000), 1000 + i))));
  const bytes = async () => Number(/total_net_output_bytes:(\d+)/.exec(await admin.cmd("INFO", "stats"))[1]);
  const before = await bytes();
  for (let i = 0; i < 100; i++) await lb.rankOf(`u${(i * 97) % 10000}`);
  const per = (await bytes() - before) / 100;
  if (per > 500) throw new Error(`each rankOf made Redis send ${per.toFixed(0)} bytes: it's fetching far more than one rank`);
  const top = await lb.top(3); if (top.length !== 3 || top[0].points !== 5000) throw new Error(`top(3) is wrong: ${JSON.stringify(top)}`);
  return `${per.toFixed(0)} bytes per rankOf · O(log N) in Redis`;
});

console.log(`\n${bold("A view of Postgres")}`);
await check("rebuild from the solves gives the same board", async () => {
  const solves = [S("ada", "p1", 100, 10), S("linus", "p1", 100, 11), S("ada", "p2", 50, 30), S("linus", "p2", 50, 20), S("grace", "p9", 150, 40), S("ada", "p1", 100, 50)];
  const live = createLeaderboard(r1, fresh()); for (const s of solves) await live.recordSolve(s);
  const rebuilt = createLeaderboard(r1, fresh()); await rebuilt.recordSolve(S("ghost", "p1", 999, 1)); await rebuilt.rebuild(solves);
  const want = [{ rank: 1, userId: "linus", points: 150 }, { rank: 2, userId: "ada", points: 150 }, { rank: 3, userId: "grace", points: 150 }];
  eq(await live.top(10), want, "live top(10)");
  eq(await rebuilt.top(10), want, "rebuilt top(10)");
  eq(await rebuilt.recordSolve(S("ghost", "p1", 999, 60)), true, "ghost's p1 after the rebuild (the solves never had it)");
  return "linus reached 150 first, then ada, then grace";
});
await check("after a rebuild, a duplicate still counts once", async () => {
  const lb = createLeaderboard(r1, fresh()); await lb.rebuild([S("ada", "p1", 100, 10)]);
  eq(await lb.recordSolve(S("ada", "p1", 100, 20)), false, "recordSolve after rebuild");
});

r1.close(); r2.close(); admin.close();
console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0018.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
