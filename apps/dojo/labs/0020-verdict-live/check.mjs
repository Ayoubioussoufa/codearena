// Lesson 0020 checker: a polling loop that behaves, then a push channel that doesn't lose verdicts.
import { EventEmitter } from "node:events";
import http from "node:http";
import { pollUntilDone } from "./poll.mjs";
import { createServer } from "./sse.mjs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(56);
async function check(label, fn) {
  try { const note = await withTimeout(fn(), 4000, "the case hung for 4 s"); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const withTimeout = (p, ms, msg) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms).unref())]);
const eq = (got, want, what) => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rejection = async (p) => { try { await p; } catch (e) { return e; } throw new Error("it resolved; it should have rejected"); };

/** A fake API: answers the given statuses in order, counting calls and overlap. */
function fakeApi(statuses, { latencyMs = 1, failFirst = 0 } = {}) {
  const api = { calls: 0, inFlight: 0, maxInFlight: 0, after: 0 };
  let i = 0;
  api.fetch = async () => {
    api.calls++; api.inFlight++; api.maxInFlight = Math.max(api.maxInFlight, api.inFlight);
    if (api.done) api.after++;
    try {
      await sleep(latencyMs);
      if (failFirst-- > 0) throw new Error("ECONNRESET");
      const s = statuses[Math.min(i++, statuses.length - 1)];
      if (s === "DONE") api.done = true;
      return s === "DONE" ? { status: "DONE", verdict: "ACCEPTED" } : { status: s };
    } finally { api.inFlight--; }
  };
  return api;
}

console.log(`\n${bold("1. Polling")}`);
await check("polls until the verdict, then stops", async () => {
  const api = fakeApi(["PENDING", "PENDING", "RUNNING", "DONE"]);
  eq(await pollUntilDone(api.fetch, { intervalMs: 10 }), { status: "DONE", verdict: "ACCEPTED" }, "result");
  await sleep(60); eq(api.calls, 4, "calls"); eq(api.after, 0, "calls after DONE");
});
await check("a slow API: never two requests at once", async () => {
  const api = fakeApi(["PENDING", "PENDING", "PENDING", "DONE"], { latencyMs: 60 });
  await pollUntilDone(api.fetch, { intervalMs: 5 }); eq(api.maxInFlight, 1, "requests in flight at once");
  return "setTimeout after each answer, not setInterval";
});
await check("it waits intervalMs between calls", async () => {
  const api = fakeApi(["PENDING", "PENDING", "DONE"]); const t0 = performance.now();
  await pollUntilDone(api.fetch, { intervalMs: 50 }); const ms = performance.now() - t0;
  if (ms < 95) throw new Error(`3 calls took ${ms.toFixed(0)} ms; with 50 ms between them they need at least 100`);
});
await check("unmounted: abort stops it, and nothing runs after", async () => {
  const api = fakeApi(["PENDING"]); const ac = new AbortController();
  setTimeout(() => ac.abort(), 35);
  const e = await rejection(pollUntilDone(api.fetch, { intervalMs: 10, signal: ac.signal }));
  eq(e.name, "AbortError", "error name"); const n = api.calls; await sleep(60); eq(api.calls, n, "calls after the abort");
});
await check("no verdict in time: TimeoutError, and it stops", async () => {
  const api = fakeApi(["PENDING"]); const t0 = performance.now();
  const e = await rejection(pollUntilDone(api.fetch, { intervalMs: 10, timeoutMs: 120 }));
  eq(e.name, "TimeoutError", "error name"); const ms = performance.now() - t0;
  if (ms > 300) throw new Error(`it took ${ms.toFixed(0)} ms to give up; the timeout was 120`);
  const n = api.calls; await sleep(60); eq(api.calls, n, "calls after the timeout");
});
await check("a network blip is retried", async () => {
  const api = fakeApi(["PENDING", "DONE"], { failFirst: 2 });
  eq((await pollUntilDone(api.fetch, { intervalMs: 5, maxErrors: 3 })).status, "DONE", "status");
});
await check("…but not forever", async () => {
  const api = fakeApi(["PENDING"], { failFirst: 99 });
  const e = await rejection(pollUntilDone(api.fetch, { intervalMs: 5, maxErrors: 3 }));
  eq(e.message, "ECONNRESET", "error"); eq(api.calls, 3, "calls");
});

console.log(`\n${bold("2. Server-sent events")}`);
/** Opens the stream; collects events and comments until the server ends it (or we close). */
function listen(port, id) {
  return new Promise((resolve, reject) => {
    const req = http.get({ port, path: `/submissions/${id}/events` }, (res) => {
      const out = { status: res.statusCode, headers: res.headers, events: [], comments: 0, ended: false, req, res };
      let buf = "";
      res.setEncoding("utf8");
      res.on("data", (d) => {
        buf += d; let k;
        while ((k = buf.indexOf("\n\n")) >= 0) {
          const block = buf.slice(0, k); buf = buf.slice(k + 2);
          if (block.startsWith(":")) { out.comments++; continue; }
          const data = block.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join("\n");
          if (data) out.events.push(JSON.parse(data));
          out.onEvent?.();
        }
      });
      res.on("end", () => { out.ended = true; out.onEnd?.(); });
      resolve(out);
    });
    req.on("error", reject);
  });
}
const until = (cond, ms = 1500) => new Promise((resolve, reject) => {
  const t0 = Date.now(); const tick = () => (cond() ? resolve() : Date.now() - t0 > ms ? reject(new Error("timed out waiting")) : setTimeout(tick, 5)); tick();
});
async function start({ initial, getDelayMs = 0, heartbeatMs = 1000 } = {}) {
  const rows = new Map(Object.entries(initial ?? {}));
  const store = { async get(id) { const snap = rows.has(id) ? { ...rows.get(id) } : null; await sleep(getDelayMs); return snap; } };
  const bus = new EventEmitter();
  const server = createServer({ store, bus, heartbeatMs });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const publish = (sub) => { rows.set(sub.id, sub); bus.emit("submission", sub); };
  return { port: server.address().port, bus, publish, close: () => { server.closeAllConnections?.(); server.close(); } };
}
const S = (id, status, verdict) => (verdict ? { id, status, verdict } : { id, status });

await check("headers, and the current state first", async () => {
  const srv = await start({ initial: { 7: S("7", "PENDING") } });
  const s = await listen(srv.port, "7"); await until(() => s.events.length >= 1);
  eq(s.status, 200, "status code"); eq(s.headers["content-type"]?.split(";")[0], "text/event-stream", "content-type"); eq(s.headers["cache-control"], "no-cache", "cache-control");
  eq(s.events[0], S("7", "PENDING"), "first event"); s.req.destroy(); srv.close();
});
await check("unknown submission: 404", async () => { const srv = await start(); const s = await listen(srv.port, "nope"); eq(s.status, 404, "status code"); s.req.destroy(); srv.close(); });
await check("every change, in order, then the stream ends", async () => {
  const srv = await start({ initial: { 7: S("7", "PENDING") } });
  const s = await listen(srv.port, "7"); await until(() => s.events.length >= 1);
  srv.publish(S("8", "RUNNING")); srv.publish(S("7", "RUNNING")); srv.publish(S("7", "DONE", "WRONG_ANSWER"));
  await until(() => s.ended);
  eq(s.events, [S("7", "PENDING"), S("7", "RUNNING"), S("7", "DONE", "WRONG_ANSWER")], "events"); srv.close();
  return "other submissions' events filtered out";
});
await check("already judged: one event, then the end", async () => {
  const srv = await start({ initial: { 7: S("7", "DONE", "ACCEPTED") } });
  const s = await listen(srv.port, "7"); await until(() => s.ended); eq(s.events, [S("7", "DONE", "ACCEPTED")], "events"); srv.close();
});
await check("the race: a verdict published while reading the row", async () => {
  const srv = await start({ initial: { 7: S("7", "RUNNING") }, getDelayMs: 40 });
  const pending = listen(srv.port, "7");
  setTimeout(() => srv.publish(S("7", "DONE", "ACCEPTED")), 15);   // lands while the server is reading the row
  const s = await pending;
  try { await until(() => s.ended, 800); } catch { throw new Error(`the verdict was lost: the stream got ${JSON.stringify(s.events)} and never ended. Subscribe first, then read`); }
  const last = s.events.at(-1); eq(last, S("7", "DONE", "ACCEPTED"), "last event"); srv.close();
});
await check("heartbeats while nothing happens", async () => {
  const srv = await start({ initial: { 7: S("7", "PENDING") }, heartbeatMs: 40 });
  const s = await listen(srv.port, "7"); await sleep(200);
  if (s.comments < 3) throw new Error(`${s.comments} heartbeat comments in 200 ms at a 40 ms interval`);
  s.req.destroy(); srv.close(); return `${s.comments} pings`;
});
await check("the client leaves: no listener, no timer left behind", async () => {
  const srv = await start({ initial: { 7: S("7", "PENDING") }, heartbeatMs: 20 });
  const base = srv.bus.listenerCount("submission");
  const timers = () => process.getActiveResourcesInfo().filter((r) => r === "Timeout").length;
  await sleep(30); const baseTimers = timers();
  const streams = await Promise.all(Array.from({ length: 10 }, () => listen(srv.port, "7")));
  await until(() => streams.every((s) => s.events.length >= 1));
  for (const s of streams) s.req.destroy();
  await sleep(80);
  eq(srv.bus.listenerCount("submission") - base, 0, "listeners left on the bus");
  eq(timers() - baseTimers, 0, "heartbeat timers still running");
  srv.close(); return "10 tabs closed, 0 leaks";
});

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0020.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
