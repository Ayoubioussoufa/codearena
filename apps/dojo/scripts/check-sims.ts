/**
 * The system design stations: every goal can be reached, none is met before
 * you play, and the facts each one teaches hold in its own numbers.
 *
 *   pnpm test:sims
 */
import fs from "node:fs";
import path from "node:path";
import { SIMS, getSim, rankFor } from "../src/lib/sims/catalog";
import { JOURNEY_START, bestSwitch, journeyTotal, journeyWon } from "../src/lib/sims/journey";
import { napkinRound, sliderToValue, timesOff } from "../src/lib/sims/napkin";
import { MIN_RATIO, OPS, duel, human } from "../src/lib/sims/latency";
import { MAX_COPIES, NINES_BUDGET, NINES_START, NINES_TARGET, PARTS, boxes, chain, ninesWon } from "../src/lib/sims/nines";
import { CACHE_START, cacheWon, runCache } from "../src/lib/sims/cache";
import { NO_FIXES, POOL, peak, stampede, stampedeWon, type Fixes } from "../src/lib/sims/stampede";
import { BALANCER_START, balancerWon, runBalancer, type Algorithm } from "../src/lib/sims/balancer";
import { DB_START, LEVELS, sizeDb, type DbConfig } from "../src/lib/sims/scaledb";
import { CAP_START, capReducer, capWon, type CapAction } from "../src/lib/sims/cap";
import { QUEUE_START, queueWon, runQueue } from "../src/lib/sims/queue";
import { ATTACK, HOLE, best, limiterReducer, limiterStart, type Limiter } from "../src/lib/sims/ratelimit";
import { RING_GOAL, RING_START, imbalance, moved, owners, type Strategy } from "../src/lib/sims/ring";
import { DISASTERS, JUDGE_STEPS } from "../src/lib/sims/judge";
import { INCIDENTS, ONCALL_PASS } from "../src/lib/sims/oncall";
import type { Situation } from "../src/lib/sims/quiz";

const problems: string[] = [];
function ok(cond: boolean, what: string) {
  if (!cond) problems.push(what);
}

// ── Journey
ok(!journeyWon(JOURNEY_START), "journey: already won");
ok(journeyWon({ near: true, warm: true, hit: false }), "journey: near + warm should win");
ok(!journeyWon({ near: false, warm: true, hit: true }), "journey: a warm cache far away should not win");
ok(bestSwitch() === "near", `journey: the best switch is ${bestSwitch()}`);
ok(journeyTotal(JOURNEY_START) > 400, "journey: the starting trip should be painful");

// ── Napkin
for (let seed = 1; seed <= 400; seed++) {
  const r = napkinRound(seed);
  ok(r.answer >= 1 && r.answer <= 1e7, `napkin ${seed}: answer ${r.answer} is off the slider`);
  const reach = Array.from({ length: 101 }, (_, i) => timesOff(sliderToValue(i), r.answer));
  ok(Math.min(...reach) <= 1.1, `napkin ${seed}: no slider position comes close to ${r.answer}`);
}
ok(timesOff(50, 100) === 2 && timesOff(200, 100) === 2 && timesOff(0, 5) === Infinity, "napkin: timesOff");

// ── Latency
for (let seed = 1; seed <= 400; seed++) {
  const [a, b] = duel(seed);
  ok(Math.max(a.ns, b.ns) / Math.min(a.ns, b.ns) >= MIN_RATIO, `latency ${seed}: too close to call`);
}
ok(OPS.every((o, i) => i === 0 || o.ns > (OPS[i - 1]?.ns ?? 0)), "latency: the ladder is out of order");
ok(human(150_000_000) === "4.8 years" && human(1) === "1 second", `latency: human times (${human(150_000_000)}, ${human(1)})`);

// ── Nines: within the budget, duplicating the three weakest is the only way.
{
  ok(!ninesWon(NINES_START), "nines: already won");
  const winners: string[] = [];
  const walk = (i: number, c: Record<string, number>) => {
    const p = PARTS[i];
    if (!p) {
      if (ninesWon(c)) winners.push(JSON.stringify(c));
      return;
    }
    for (let n = 1; n <= MAX_COPIES; n++) walk(i + 1, { ...c, [p.id]: n });
  };
  walk(0, {});
  ok(winners.length === 1, `nines: ${winners.length} ways to win: ${winners.join(" ")}`);
  ok(boxes({ lb: 1, auth: 2, app: 2, db: 2 }) === NINES_BUDGET && chain({ lb: 1, auth: 2, app: 2, db: 2 }) >= NINES_TARGET, "nines: the intended answer");
}

// ── Cache
{
  ok(!cacheWon(CACHE_START, runCache(CACHE_START)), "cache: already won");
  const win = { capacity: 40, skew: 1.3, ttl: 4000, invalidate: true };
  const r = runCache(win);
  ok(cacheWon(win, r), `cache: can't be won (hits ${r.hitRatio.toFixed(3)}, stale ${r.stalePer1000.toFixed(1)})`);
  ok(!cacheWon({ ...win, invalidate: false }, runCache({ ...win, invalidate: false })), "cache: winnable without invalidating");
  for (const skew of [0, 0.2]) ok(runCache({ ...win, skew }).hitRatio < 0.5, "cache: flat traffic should not cache well");
  ok(runCache({ ...win, capacity: 80 }).hitRatio > runCache({ ...win, capacity: 10 }).hitRatio, "cache: more room should help");
  ok(JSON.stringify(runCache(win).hitRatio) === JSON.stringify(r.hitRatio), "cache: not deterministic");
}

// ── Stampede
{
  const all: Fixes[] = [];
  for (const jitter of [false, true]) for (const singleFlight of [false, true]) for (const stale of [false, true]) all.push({ jitter, singleFlight, stale });
  ok(!stampedeWon(NO_FIXES), "stampede: already won");
  ok(stampedeWon({ jitter: true, singleFlight: true, stale: false }), "stampede: jitter + single-flight should win");
  ok(all.filter(stampedeWon).every((f) => f.jitter && (f.singleFlight || f.stale)), "stampede: won without both ideas");
  ok(peak(stampede("hot", { ...NO_FIXES, jitter: true })) > POOL, "stampede: jitter alone can't save one hot key");
  ok(peak(stampede("mass", { ...NO_FIXES, singleFlight: true })) > POOL, "stampede: single-flight alone can't save a mass expiry");
}

// ── Load balancer
{
  ok(!balancerWon(runBalancer(BALANCER_START)), "balancer: already won");
  const algorithms: Algorithm[] = ["round-robin", "random", "ip-hash", "least"];
  for (const algorithm of algorithms) for (const sessions of ["memory", "shared"] as const) for (const healthChecks of [false, true]) {
    const r = runBalancer({ algorithm, sessions, healthChecks });
    const should = algorithm === "least" && sessions === "shared" && healthChecks;
    ok(balancerWon(r) === should, `balancer: ${algorithm}/${sessions}/${healthChecks}: won=${balancerWon(r)} (p95 ${r.p95.toFixed(0)}, failed ${r.failed}, lost ${r.lostSessions})`);
  }
}

// ── Database: each budget is exactly the cheapest way.
for (const level of LEVELS) {
  ok(!sizeDb(level, DB_START).ok, `scaledb ${level.name}: already won`);
  let cheapest = Infinity, how: DbConfig | undefined;
  for (let shards = 1; shards <= 6; shards++) for (let replicas = 0; replicas <= 6; replicas++) for (const big of [false, true]) for (const cache of [false, true]) {
    const c = { shards, replicas, big, cache };
    const r = sizeDb({ ...level, budget: Infinity }, c);
    if (r.ok && r.cost < cheapest) [cheapest, how] = [r.cost, c];
  }
  ok(cheapest === level.budget, `scaledb ${level.name}: cheapest is ${cheapest} (${JSON.stringify(how)}), budget ${level.budget}`);
}
{
  const flood = LEVELS[1] as (typeof LEVELS)[number];
  ok(sizeDb(flood, { ...DB_START, replicas: 6 }).utilisation > 1, "scaledb: replicas must not fix a write flood");
}

// ── CAP
{
  const play = (...as: CapAction[]) => as.reduce(capReducer, CAP_START);
  ok(!capWon(CAP_START), "cap: already won");
  const cp = play({ type: "cut" }, { type: "write", side: "B" });
  ok(cp.seen.refused && !cp.seen.disagree, "cap: CP should refuse the minority side");
  const a = play({ type: "mode", mode: "AP" }, { type: "cut" }, { type: "write", side: "A" }, { type: "write", side: "B" });
  ok(a.seen.disagree && !a.seen.refused && a.value.A !== a.value.B, "cap: AP should disagree, never refuse");
  const healed = capReducer(a, { type: "heal" });
  ok(healed.seen.lost && healed.value.A === "v2" && healed.value.B === "v2", "cap: healing should lose one write");
  ok(!play({ type: "mode", mode: "AP" }, { type: "cut" }, { type: "write", side: "A" }, { type: "heal" }).seen.lost, "cap: one-sided writes are not lost");
  ok(capWon([{ type: "mode", mode: "CP" }, { type: "cut" }, { type: "read", side: "B" }].reduce((s, x) => capReducer(s, x as CapAction), healed)), "cap: can't be won");
}

// ── Queue
{
  ok(!queueWon(runQueue(QUEUE_START)), "queue: already won");
  ok(runQueue(QUEUE_START).crashed, "queue: the starting setup should run out of memory");
  let wins = 0, still = 0;
  for (let base = 0; base <= 100; base += 5) for (let max = base; max <= 100; max += 5) for (const bound of [0, 400, 800, 1200]) {
    if (queueWon(runQueue({ base, max, bound }))) {
      wins++;
      if (max === base) still++;
    }
  }
  ok(wins > 0, "queue: can't be won");
  ok(still === 0, "queue: winnable without autoscaling");
  console.log(`  queue: ${wins} winning setups on the grid`);
}

// ── Rate limiter
{
  const attack = (l: Limiter) => best([{ type: "wait", seconds: 9 }, { type: "send", count: 10 }, { type: "wait", seconds: 1 }, { type: "send", count: 10 }].reduce((s, a) => limiterReducer(s, a as never), limiterStart(l)).hits);
  ok(attack("fixed").passed === 20, `ratelimit: the hole lets ${attack("fixed").passed} through`);
  ok(attack("sliding").passed === 10, `ratelimit: sliding lets ${attack("sliding").passed} through`);
  ok(attack("bucket").passed === 11, `ratelimit: the bucket lets ${attack("bucket").passed} through`);
  ok(attack("sliding").sent >= ATTACK && attack("bucket").passed < HOLE, "ratelimit: the attack must be comparable");
  ok(best(limiterReducer(limiterStart("fixed"), { type: "send", count: 40 }).hits).passed === 10, "ratelimit: one window must hold");
}

// ── Ring
{
  const grown = [...RING_START, "E"];
  const run = (s: Strategy) => {
    const before = owners(s, RING_START), after = owners(s, grown);
    return { moved: moved(before, after), imbalance: imbalance(after, grown) };
  };
  ok(run("modulo").moved > RING_GOAL.modulo, `ring: modulo moves only ${run("modulo").moved}`);
  const v = run("vnodes");
  ok(v.moved <= RING_GOAL.moved && v.imbalance <= RING_GOAL.imbalance, `ring: vnodes ${JSON.stringify(v)}`);
  const plain = run("ring");
  ok(!(plain.moved <= RING_GOAL.moved && plain.imbalance <= RING_GOAL.imbalance), `ring: a plain ring should not be even enough ${JSON.stringify(plain)}`);
  const before = owners("vnodes", RING_START), after = owners("vnodes", grown);
  ok(before.every((o, i) => o === after[i] || after[i] === "E"), "ring: keys may only move to the new node");
}

// ── Stories
function story(name: string, list: readonly Situation[]) {
  ok(new Set(list.map((s) => s.id)).size === list.length, `${name}: duplicate ids`);
  for (const s of list) {
    ok(s.best >= 0 && s.best < s.moves.length, `${name} ${s.id}: best is out of range`);
    ok(new Set(s.moves.map((m) => m.text)).size === 4, `${name} ${s.id}: duplicate moves`);
    ok(s.moves.every((m) => m.outcome.length > 15) && s.lesson.length > 30, `${name} ${s.id}: an outcome teaches nothing`);
  }
  ok(new Set(list.map((s) => s.best)).size === 4, `${name}: the best move never sits in some positions`);
}
story("judge", DISASTERS);
story("oncall", INCIDENTS);
ok(DISASTERS.every((d) => JUDGE_STEPS[d.step]), "judge: a disaster strikes at a step that doesn't exist");
ok(INCIDENTS.length === 9 && ONCALL_PASS === 7 && DISASTERS.length === 7, "stories: the goals in the catalog name other counts");

// ── The guide: every station placed exactly once, in order, plus the map.
{
  const md = fs.readFileSync(path.resolve(__dirname, "../content/supplements/system-design-fundamentals.md"), "utf8");
  const fences = [...md.matchAll(/^```sim\n([^\n`]+)\n```/gm)].map((m) => (m[1] ?? "").trim());
  ok(fences[0] === "map", "guide: the map should come first");
  const placed = fences.slice(1);
  for (const f of placed) ok(getSim(f) !== undefined, `guide: unknown sim ${f}`);
  ok(JSON.stringify(placed) === JSON.stringify(SIMS.map((s) => s.id)), `guide: stations are ${placed.join(", ")}`);
  const registry = fs.readFileSync(path.resolve(__dirname, "../src/components/sims/SimBlock.tsx"), "utf8");
  for (const s of SIMS) ok(new RegExp(`^\\s+${s.id}: `, "m").test(registry), `SimBlock has no component for ${s.id}`);
}
ok(rankFor(0) !== rankFor(1) && rankFor(SIMS.length) === "Architect", "ranks");

if (problems.length > 0) {
  console.error(`✗ ${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ ${SIMS.length} stations: every goal reachable, none met at the start, all placed in the guide.`);
