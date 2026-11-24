/**
 * The stations of every guide: each goal can be reached, none is met before
 * you play, and the facts each one teaches hold in its own numbers. Traces
 * are compared with answers worked out another way, by brute force.
 *
 *   pnpm test:sims
 */
import fs from "node:fs";
import path from "node:path";
import { ROUTES, SIMS, getSim, rankFor, routeOf } from "../src/lib/sims/catalog";
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
import { at, type Deck, type PickLevel, type Trace } from "../src/lib/sims/engines";
import { STUCK, diTrace } from "../src/lib/sims/nestjs/di";
import { WIRING_START, boot, modulesWon, type Wiring } from "../src/lib/sims/nestjs/modules";
import { runLeak } from "../src/lib/sims/nestjs/leak";
import { ROUTES_START, dispatch, moveRoute, routesWon, type RouteDef } from "../src/lib/sims/nestjs/routes";
import { PIPE_START, receive, validationWon } from "../src/lib/sims/nestjs/validation";
import { PIPELINE_STATUSES, pipelineTrace } from "../src/lib/sims/nestjs/pipeline";
import { PLACEMENT, PROVIDERS } from "../src/lib/sims/nestjs/decks";
import { CLINIC, CLINIC_PASS } from "../src/lib/sims/nestjs/clinic";
import { ARROWS, BLAST, BOUNDARY } from "../src/lib/sims/arch/picks";
import { WHERETO, WHICHTEST, WORTHIT } from "../src/lib/sims/arch/decks";
import { CALLS, ORDER_START, holds, invariantWon, orderReducer } from "../src/lib/sims/arch/invariant";
import { errorTrace } from "../src/lib/sims/arch/errors";
import { DESIGNS, crashAt, survives, type Design } from "../src/lib/sims/arch/outbox";
import { VILLAINS, VILLAINS_PASS } from "../src/lib/sims/arch/villains";
import { PLACES, placesStuck, run, short, type PlacesState } from "../src/lib/sims/git/places";
import { GRAPH, git, type GraphState } from "../src/lib/sims/git/graph";
import { conflictTrace, syncTrace } from "../src/lib/sims/git/traces";
import { LEASE_START, leaseReducer, leaseWon, type LeaseAction } from "../src/lib/sims/git/lease";
import { COMMITS, RANGE, TESTS, culprit, found, test } from "../src/lib/sims/git/bisect";
import { DANGER, UNDO } from "../src/lib/sims/git/decks";
import { RESCUE, RESCUE_PASS } from "../src/lib/sims/git/rescue";
import { bsearchTrace, dpTrace, hashingTrace, nextgreaterTrace, pointersTrace, windowTrace } from "../src/lib/sims/dsa/arrays";
import { bfsTrace, heapTrace, intervalsTrace, queensTrace, reverseTrace, treeTrace, type HeapState } from "../src/lib/sims/dsa/structures";
import { dijkstraTrace, topoTrace } from "../src/lib/sims/dsa/graphs";
import { BUDGET, PATTERN } from "../src/lib/sims/dsa/decks";

const problems: string[] = [];
function ok(cond: boolean, what: string) {
  if (!cond && !problems.includes(what)) problems.push(what);
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

// ── Engines
/** Plays every level many ways, always correctly, and returns the final states. */
function playTrace<S>(name: string, trace: Trace<S>): S[][] {
  let seed = 1;
  const random = (n: number) => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    return Math.floor((seed / 2 ** 32) * n);
  };
  return trace.levels.map((level, l) => {
    const ends: S[] = [];
    ok(!trace.done(trace.start(l)), `${name} ${level}: done before you start`);
    for (let round = 0; round < 40; round++) {
      let s = trace.start(l);
      for (let step = 0; !trace.done(s); step++) {
        if (step > 200) {
          ok(false, `${name} ${level}: never ends`);
          break;
        }
        const right = trace.correct(s);
        const offered = trace.moves(s).map((m) => m.id);
        if (right.length === 0 || right.some((m) => !offered.includes(m))) {
          ok(false, `${name} ${level}: stuck, wants [${right.join()}] of [${offered.join()}]`);
          break;
        }
        ok(new Set(offered).size === offered.length, `${name} ${level}: the same move twice`);
        ok(right.length < offered.length, `${name} ${level}: no move can be wrong`);
        ok(trace.say(s).length > 3 && !/undefined|NaN/.test(trace.say(s)), `${name} ${level}: says "${trace.say(s)}"`);
        for (const m of offered.filter((x) => !right.includes(x))) {
          const why = trace.why(s, m);
          ok(why.length > 8 && !/undefined|NaN/.test(why), `${name} ${level}: why not ${m}? "${why}"`);
        }
        s = trace.apply(s, at(right, random(right.length)));
      }
      ok(trace.correct(s).length === 0, `${name} ${level}: over, yet a move is still right`);
      ok(trace.say(s).length > 3 && !/undefined|NaN/.test(trace.say(s)), `${name} ${level}: ends with "${trace.say(s)}"`);
      ends.push(s);
    }
    return ends;
  });
}
/** The goal in the catalog must name the numbers the code uses. */
function goal(id: string, part: string) {
  ok(getSim(id)?.goal.includes(part) === true, `${id}: the goal doesn't say "${part}"`);
}
function deck(id: string, d: Deck) {
  goal(id, `${d.pass} of ${d.cards.length}`);
  for (const c of d.cards) {
    const options = c.options ?? d.options;
    ok(options.includes(c.answer), `${id}: "${c.text}" has no right answer`);
    ok(new Set(options).size === options.length && options.length >= 2, `${id}: "${c.text}" has repeated options`);
    ok(c.why.length > 12, `${id}: "${c.text}" teaches nothing`);
  }
  ok(new Set(d.cards.map((c) => c.text)).size === d.cards.length, `${id}: a card appears twice`);
  const spots = new Set(d.cards.map((c) => (c.options ?? d.options).indexOf(c.answer)));
  ok(spots.size === (d.cards[0]?.options ?? d.options).length, `${id}: some option is never the answer`);
}
function picks(id: string, levels: readonly PickLevel[]) {
  for (const l of levels) {
    const ids = l.items.map((i) => i.id);
    ok(new Set(ids).size === ids.length && l.right.every((r) => ids.includes(r)), `${id} ${l.name}: ids`);
    ok(l.right.length > 0 && l.items.every((i) => i.why.length > 10), `${id} ${l.name}: teaches nothing`);
  }
}
/** Can any sequence of commands reach the goal? Returns the shortest. */
function solve<S>(start: S, commands: readonly string[], step: (s: S, c: string) => S, won: (s: S) => boolean, depth: number): string[] | null {
  let layer: { s: S; path: string[] }[] = [{ s: start, path: [] }];
  const seen = new Set<string>();
  for (let d = 0; d <= depth; d++) {
    const next: typeof layer = [];
    for (const { s, path } of layer) {
      if (won(s)) return path;
      const k = JSON.stringify(s);
      if (seen.has(k)) continue;
      seen.add(k);
      for (const c of commands) next.push({ s: step(s, c), path: [...path, c] });
    }
    layer = next;
  }
  return null;
}

// ── NestJS
{
  const apps = playTrace("di", diTrace);
  for (const ends of apps) for (const s of ends) {
    for (const [i, name] of s.built.entries()) for (const need of s.classes.find((c) => c.name === name)?.needs ?? []) ok(s.built.indexOf(need) >= 0 && s.built.indexOf(need) < i, `di: ${name} built before ${need}`);
  }
  ok(apps.map((ends) => ends.every((s) => s.gaveUp)).join() === "false,false,true", "di: only the last app has a cycle");
  ok(!diTrace.correct(diTrace.start(0)).includes(STUCK), "di: gives up too early");

  ok(!modulesWon(WIRING_START), "modules: already won");
  const flags = ["exported", "imported", "serviceInImports", "copied", "copiedRepo"] as const;
  for (let n = 0; n < 32; n++) {
    const w = Object.fromEntries(flags.map((f, i) => [f, (n & (1 << i)) !== 0])) as unknown as Wiring;
    ok(modulesWon(w) === (w.exported && w.imported && !w.serviceInImports && !w.copied), `modules: ${JSON.stringify(w)} → ${modulesWon(w)}`);
    ok(boot(w).ok === boot(w).instances > 0, "modules: booted with no object, or failed with one");
  }
  deck("providers", PROVIDERS);
  deck("placement", PLACEMENT);

  ok(runLeak("field", true).leaked && !runLeak("field", false).leaked, "leak: a field leaks only when they overlap");
  for (const style of ["argument", "request"] as const) for (const both of [false, true]) ok(!runLeak(style, both).leaked, `leak: ${style} must not leak`);
  ok(runLeak("argument", true).instances === 1 && runLeak("request", true).instances > 1, "leak: the cost");

  ok(!routesWon(ROUTES_START), "routes: already won");
  const permute = (xs: readonly RouteDef[]): RouteDef[][] => (xs.length < 2 ? [[...xs]] : xs.flatMap((x, i) => permute([...xs.slice(0, i), ...xs.slice(i + 1)]).map((r) => [x, ...r])));
  const winners = permute(ROUTES_START).filter(routesWon);
  const pos = (o: readonly RouteDef[], path: string) => o.findIndex((r) => r.path === path);
  ok(winners.length > 0 && winners.every((o) => pos(o, "featured") < pos(o, ":slug") && pos(o, "featured/tests") < pos(o, ":slug/tests") && pos(o, "*path") === 4), "routes: the wrong lesson");
  ok(permute(ROUTES_START).filter((o) => pos(o, "featured") < pos(o, ":slug") && pos(o, "featured/tests") < pos(o, ":slug/tests") && pos(o, "*path") === 4).every(routesWon), "routes: a right order is refused");
  ok(moveRoute(ROUTES_START, 0, -1) === ROUTES_START && moveRoute(ROUTES_START, 0, 1)[1]?.path === "*path" && dispatch([], "x") === "404", "routes: moving");

  let good = 0;
  for (const whitelist of [false, true]) for (const forbid of [false, true]) for (const transform of [false, true]) if (validationWon({ whitelist, forbid, transform })) good++;
  ok(!validationWon(PIPE_START) && good === 1 && validationWon({ whitelist: true, forbid: true, transform: true }), `validation: ${good} ways to win`);
  ok(receive("sneaky", { whitelist: false, forbid: true, transform: true }).status === 200, "validation: forbid alone does nothing");

  const answers = playTrace("pipeline", pipelineTrace).map((ends) => ends[0]?.status);
  ok(answers.join() === "202,401,401,400,403,404,500", `pipeline: ${answers.join()}`);
  ok(answers.every((a) => (PIPELINE_STATUSES as readonly (string | null | undefined)[]).includes(a)), "pipeline: statuses");
  ok(pipelineTrace.levels.map((_, l) => pipelineTrace.start(l).stops ?? "-").join() === "-,1,1,3,1,4,4", "pipeline: stops at the wrong stage");
  story("clinic", CLINIC);
  goal("clinic", `${CLINIC_PASS} of ${CLINIC.length}`);
  goal("pipeline", "seven");
}

// ── Backend architecture
{
  picks("blast", BLAST);
  picks("arrows", ARROWS);
  picks("boundary", BOUNDARY);
  ok(BLAST.length === 5, "blast: the goal says five");
  // Boundary, checked by running the three mappings on a real row.
  const row: Record<string, unknown> = { id: 1, username: "a", rating: 2, passwordHash: "h", resetToken: "t" };
  const rest = Object.fromEntries(Object.entries(row).filter(([k]) => k !== "passwordHash"));
  const out = [row, rest, { id: row.id, username: row.username, rating: row.rating }].map((o) => Object.keys(JSON.parse(JSON.stringify(o)) as object).sort().join());
  ok(out.join("|") === BOUNDARY.map((l) => [...l.right].sort().join()).join("|"), "boundary: not what JSON really sends");
  for (const a of ARROWS[0]?.items ?? []) ok(a.why.startsWith("Bad") === ARROWS[0]?.right.includes(a.id), `arrows: ${a.label} says one thing and scores another`);
  deck("whereto", WHERETO);
  deck("worthit", WORTHIT);
  deck("whichtest", WHICHTEST);

  ok(!invariantWon(ORDER_START) && holds(ORDER_START), "invariant: start");
  const open = CALLS.map((c) => orderReducer(ORDER_START, { type: "call", id: c.id }));
  ok(open.map(holds).join() === "true,false,false,false", "invariant: only addLine keeps the rule");
  const closed = CALLS.reduce((s, c) => orderReducer(s, { type: "call", id: c.id }), orderReducer(at(open, 1), { type: "door", closed: true }));
  ok(invariantWon(closed) && holds(closed), "invariant: can't be won");
  ok(!invariantWon(CALLS.reduce((s, c) => orderReducer(s, { type: "call", id: c.id }), orderReducer(ORDER_START, { type: "door", closed: true }))), "invariant: won without breaking it first");

  const statuses = playTrace("errors", errorTrace).map((ends) => ends[0]?.answer);
  ok(statuses.join() === "409,404,503,409,500", `errors: ${statuses.join()}`);

  ok(errorTrace.levels.map((_, l) => { const s = errorTrace.start(l); return `${s.adapter}/${s.service}`; }).join() === "translate/pass,null/notfound,translate/pass,ok/domain,pass/pass", "errors: a layer does another's work");

  const all = (d: Design, key: boolean) => Array.from({ length: DESIGNS[d].steps.length + 1 }, (_, i) => crashAt(d, i, key).verdict);
  ok(all("inside", false).includes("robbed") && all("after", false).includes("free") && all("outbox", false).includes("double"), "outbox: a failure is missing");
  for (const d of ["inside", "after", "outbox"] as const) for (const key of [false, true]) ok(survives(d, key) === (d === "outbox" && key), `outbox: ${d}/${key} survives=${survives(d, key)}`);
  for (const d of ["inside", "after", "outbox"] as const) ok(all(d, false).at(-1) === "good" && all(d, false)[0] === "nothing", `outbox: ${d} with no crash, or an instant one`);
  story("villains", VILLAINS);
  goal("villains", `${VILLAINS_PASS} of ${VILLAINS.length}`);
}

// ── Git
{
  ok(PLACES.length === 5 && GRAPH.length === 5, "git: the goals say five levels");
  for (const l of PLACES) {
    ok(!l.won(l.start), `places ${l.name}: already won`);
    const path = solve<PlacesState>(l.start, l.commands, run, l.won, 5);
    ok(path !== null && path.length >= 2, `places ${l.name}: ${path === null ? "can't be won" : `too short: ${path.join()}`}`);
    ok(!placesStuck(l, l.start), `places ${l.name}: stuck at the start`);
  }
  // Two letters, as git prints them.
  ok(short({ name: "", head: 1, index: 2, work: 3 }) === "MM" && short({ name: "", head: 1, index: 1, work: 2 }) === " M" && short({ name: "", head: 1, index: 2, work: 2 }) === "M " && short({ name: "", head: 0, index: 0, work: 1 }) === "??" && short({ name: "", head: 0, index: 1, work: 1 }) === "A ", "places: status letters");
  const eager = at(PLACES, 1);
  ok(!eager.won(run(eager.start, "git commit")), "places: committing MM must not save the newest version");
  const skip = at(PLACES, 3);
  ok(!skip.won(run(skip.start, "git commit -am")), "places: -am must skip untracked files");

  for (const l of GRAPH) {
    ok(!l.won(l.start), `graph ${l.name}: already won`);
    const path = solve<GraphState>(l.start, l.commands, git, l.won, 5);
    ok(path !== null, `graph ${l.name}: can't be won`);
    if (path) console.log(`  graph ${l.name}: ${path.join(", ")}`);
  }
  const straight = at(GRAPH, 2);
  const rebased = git(straight.start, "git rebase main");
  ok(rebased.branches.feature === "Y'" && rebased.commits.some((c) => c.id === "Y") && !rebased.broke, "graph: a rebase makes new commits and keeps the old ones");
  ok(git(git(straight.start, "git switch main"), "git rebase feature").broke, "graph: rebasing main must break the golden rule");
  const late = at(GRAPH, 4);
  ok(git(late.start, "git reset HEAD~1").broke && !late.won(git(git(late.start, "git reset HEAD~1"), "git revert Bad")), "graph: resetting a shared branch");

  ok(playTrace("conflict", conflictTrace).map((ends) => `${ends[0]?.during}:${ends[0]?.kept}`).join() === "merge:bottom,merge:both,rebase:bottom", "conflict: the wrong side wins");
  const evenings = playTrace("sync", syncTrace);
  ok(evenings.slice(0, 2).every((ends) => ends.every((s) => s.local === s.github && s.branch === "remote")), "sync: the evening isn't over");
  deck("undo", UNDO);
  deck("danger", DANGER);

  const play = (...as: LeaseAction[]) => as.reduce(leaseReducer, LEASE_START).seen;
  ok(!leaseWon(LEASE_START), "lease: already won");
  ok(play("teammate", "force").lost && play("teammate", "lease").saved && play("teammate", "fetch", "lease").fooled && play("teammate", "fetch", "named").named, "lease: a lesson can't be reached");
  ok(!play("force").lost && !play("lease").saved && !play("fetch", "lease").fooled && !play("teammate", "named").named, "lease: a lesson is too easy");
  ok(leaseWon((["teammate", "lease", "fetch", "named", "lease", "again", "teammate", "force"] as const).reduce(leaseReducer, LEASE_START)), "lease: can't be won");

  const places = new Set<number>();
  for (let seed = 1; seed <= 500; seed++) {
    let r = RANGE, n = 0;
    while (!found(r)) {
      r = test(r, Math.floor((r.good + r.bad) / 2), seed);
      n++;
    }
    places.add(r.bad);
    ok(r.bad === culprit(seed) && n <= TESTS, `bisect ${seed}: found ${r.bad} of ${culprit(seed)} in ${n}`);
  }
  ok(places.size > 50 && [...places].every((p) => p >= 1 && p < COMMITS), `bisect: only ${places.size} places`);
  story("rescue", RESCUE);
  goal("rescue", `${RESCUE_PASS} of ${RESCUE.length}`);
  goal("bisect", `${TESTS} tests`);
}

// ── DSA: each trace against an answer worked out another way
{
  deck("pattern", PATTERN);
  deck("budget", BUDGET);
  for (const ends of playTrace("hashing", hashingTrace)) for (const s of ends) {
    const pairs = s.nums.flatMap((a, i) => s.nums.flatMap((b, j) => (i < j && a + b === s.target ? [`${i},${j}`] : [])));
    ok(s.answer === "none" ? pairs.length === 0 : s.answer !== null && pairs.includes(s.answer.join()), `hashing: ${JSON.stringify(s.answer)} of ${pairs.join(" ")}`);
  }
  for (const ends of playTrace("pointers", pointersTrace)) for (const s of ends) {
    ok(s.nums.every((x, i) => i === 0 || at(s.nums, i - 1) <= x), "pointers: not sorted");
    const any = s.nums.some((a, i) => s.nums.some((b, j) => i < j && a + b === s.target));
    ok((s.end === "found") === any && (s.end !== "found" || at(s.nums, s.l) + at(s.nums, s.r) === s.target), "pointers: wrong");
  }
  for (const ends of playTrace("window", windowTrace)) for (const s of ends) {
    let best = 0;
    for (let i = 0; i < s.text.length; i++) for (let j = i + 1; j <= s.text.length; j++) if (new Set(s.text.slice(i, j)).size === j - i) best = Math.max(best, j - i);
    ok(s.best.length === best && s.text.includes(s.best), `window ${s.text}: ${s.best}`);
  }
  for (const ends of playTrace("reverse", reverseTrace)) for (const s of ends) {
    const order: string[] = [];
    for (let i = s.prev; i !== null && order.length < 9; i = at(s.arrows, i)) order.push(at(s.nodes, i));
    ok(order.join() === [...s.nodes].reverse().join(), `reverse: ${order.join()}`);
  }
  for (const ends of playTrace("nextgreater", nextgreaterTrace)) for (const s of ends) {
    ok(s.answers.every((a, i) => a === (s.nums.slice(i + 1).find((y) => y > at(s.nums, i)) ?? null)), `nextgreater: ${JSON.stringify(s.answers)}`);
  }
  for (const ends of playTrace("bsearch", bsearchTrace)) for (const s of ends) {
    ok(s.lo === s.ok.indexOf(true) && s.ok.every((x, i) => i === 0 || x || !at(s.ok, i - 1)), `bsearch ${s.name}: ${s.lo}`);
  }
  for (const ends of playTrace("queens", queensTrace)) for (const s of ends) {
    const orders = (xs: number[]): number[][] => (xs.length < 2 ? [xs] : xs.flatMap((x) => orders(xs.filter((y) => y !== x)).map((r) => [x, ...r])));
    const first = orders(Array.from({ length: s.n }, (_, i) => i)).find((o) => o.every((c, r) => o.every((d, q) => q <= r || Math.abs(c - d) !== q - r)));
    ok(s.end === "impossible" ? first === undefined : s.cols.join() === first?.join(), `queens ${s.n}: ${s.cols.join()}`);
  }
  const walks = playTrace("tree", treeTrace).map((ends) => ends[0]?.visited.join(""));
  ok(walks.join() === "MCTRKSPW,TCKRMSWP,TKRCWPSM,MCSTRPKW", `tree: ${walks.join()}`);
  for (const ends of playTrace("bfs", bfsTrace)) for (const s of ends) {
    // Relax every square against its neighbours until nothing changes.
    const d = s.rows.map((row) => [...row].map((ch) => (ch === "S" ? 0 : Infinity)));
    for (let k = 0; k < 40; k++) s.rows.forEach((row, r) => [...row].forEach((ch, c) => {
      if (ch !== "#") for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]] as const) if (s.rows[nr]?.[nc] !== undefined && s.rows[nr]?.[nc] !== "#") d[r]![c] = Math.min(d[r]![c]!, (d[nr]?.[nc] ?? Infinity) + 1);
    }));
    d.forEach((row, r) => row.forEach((x, c) => ok((s.dist.get(`${r},${c}`) ?? Infinity) === x, `bfs: ${r},${c}`)));
  }
  ok(playTrace("bfs", bfsTrace).map((ends) => { const s = ends[0]; return s ? [...s.rows.join("")].filter((c) => c !== "#").length - s.dist.size : -1; }).map((x) => x > 0).join() === "false,false,true", "bfs: only the last grid has squares out of reach");
  for (const [l, ends] of playTrace("heap", heapTrace).entries()) for (const s of ends) {
    ok(s.a.every((x, i) => i === 0 || at(s.a, Math.floor((i - 1) / 2)) <= x), `heap: ${s.a.join()}`);
    ok([...s.a].sort().join() === [...(heapTrace.start(l) as HeapState).a].sort().join(), "heap: lost a value");
  }
  for (const ends of playTrace("dijkstra", dijkstraTrace)) for (const s of ends) {
    const d: Record<string, number> = { S: 0 };
    for (let k = 0; k < 9; k++) for (const x of s.edges) if (d[x.from] !== undefined) d[x.to] = Math.min(d[x.to] ?? Infinity, d[x.from]! + x.w);
    ok(s.nodes.every((x) => s.dist[x.id] === d[x.id]), `dijkstra: ${JSON.stringify(s.dist)} is not ${JSON.stringify(d)}`);
  }
  ok(playTrace("topo", topoTrace).map((ends) => ends.every((s) => s.cycle)).join() === "false,false,true", "topo: only the last graph has a cycle");
  for (const ends of playTrace("topo", topoTrace)) for (const s of ends) {
    ok(s.edges.every((x) => !s.taken.includes(x.to) || s.taken.indexOf(x.from) >= 0 && s.taken.indexOf(x.from) < s.taken.indexOf(x.to)), "topo: out of order");
    ok(s.cycle === s.taken.length < s.nodes.length, "topo: cycle");
  }
  for (const ends of playTrace("intervals", intervalsTrace)) for (const s of ends) {
    let best = 0;
    for (let n = 0; n < 2 ** s.meetings.length; n++) {
      const set = s.meetings.filter((_, i) => n & (1 << i)).sort((a, b) => a.start - b.start);
      if (set.every((x, i) => i === 0 || at(set, i - 1).end <= x.start)) best = Math.max(best, set.length);
    }
    ok(s.taken.length === best, `intervals: ${s.taken.join()} but ${best} fit`);
  }
  for (const ends of playTrace("dp", dpTrace)) for (const s of ends) {
    const fewest = (n: number): number => (n === 0 ? 0 : Math.min(Infinity, ...s.coins.filter((c) => c <= n).map((c) => fewest(n - c) + 1)));
    ok(s.table.every((x, i) => (x ?? Infinity) === fewest(i)), `dp: ${s.table.join()}`);
  }
}

// ── The guides: each route's map first, then its stations, once each, in order.
ok(new Set(SIMS.map((s) => s.id)).size === SIMS.length, "catalog: the same id twice");
const registry = fs.readFileSync(path.resolve(__dirname, "../src/components/sims/SimBlock.tsx"), "utf8");
for (const r of ROUTES) {
  const file = ["supplements", "dsa"].map((d) => path.resolve(__dirname, `../content/${d}/${r.guide}.md`)).find((f) => fs.existsSync(f));
  if (!file) {
    ok(false, `${r.guide}: no such guide`);
    continue;
  }
  const fences = [...fs.readFileSync(file, "utf8").matchAll(/^```sim\n([^\n`]+)\n```/gm)].map((m) => (m[1] ?? "").trim());
  ok(fences[0] === "map", `${r.guide}: the map should come first`);
  ok(fences.slice(1).join() === r.sims.map((s) => s.id).join(), `${r.guide}: stations are ${fences.slice(1).join()}`);
  const titles = Array.from({ length: r.sims.length + 1 }, (_, n) => rankFor(r, n));
  ok(titles[0] === r.ranks[0] && titles.at(-1) === r.ranks[5] && titles[1] !== titles[0] && new Set(titles).size === 6, `${r.guide}: ranks ${titles.join(", ")}`);
  for (const s of r.sims) {
    ok(routeOf(s.id) === r, `${s.id}: in two routes`);
    ok(new RegExp(`^\\s+${s.id}: `, "m").test(registry), `SimBlock has no component for ${s.id}`);
  }
}

if (problems.length > 0) {
  console.error(`✗ ${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ ${SIMS.length} stations: every goal reachable, none met at the start, all placed in their ${ROUTES.length} guides.`);
