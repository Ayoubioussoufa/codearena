// Lesson 0025 checker, part 1: logs, health and metrics.
import http from "node:http";
import { createObservedServer } from "./observe.mjs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(56);
async function check(label, fn) {
  try { const note = await Promise.race([fn(), new Promise((_, r) => setTimeout(() => r(new Error("hung for 5 s")), 5000).unref())]); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const eq = (got, want, what) => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let dbDown = false, redisHangs = false;
const lines = [];
const server = createObservedServer({
  routes: [
    { method: "GET", path: "/submissions/:id", handler: (req, res, params) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ id: params.id })); } },
    { method: "POST", path: "/submissions", handler: async (req, res) => { await sleep(30); res.writeHead(202); res.end("{}"); } },
    { method: "GET", path: "/boom", handler: async () => { throw new Error("database exploded at db.internal:5432"); } },
  ],
  checks: {
    db: async () => { if (dbDown) throw new Error("ECONNREFUSED"); },
    redis: async () => { if (redisHangs) await sleep(10_000); },
  },
  log: (l) => lines.push(l),
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const req = (method, path, headers = {}) => new Promise((resolve, reject) => {
  const r = http.request({ host: "127.0.0.1", port, method, path, headers, agent: false }, (res) => {
    let body = ""; res.setEncoding("utf8"); res.on("data", (d) => (body += d)); res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
  });
  r.on("error", reject); r.end();
});
const parsed = () => lines.flatMap((l) => l.split("\n")).filter((l) => l.trim()).map((l) => { try { return JSON.parse(l); } catch { return { unparsable: l }; } });
const lastLog = async () => { await sleep(20); return parsed().at(-1); };

console.log(`\n${bold("Structured logs")}`);
await check("one JSON line per request, with the fields", async () => {
  lines.length = 0;
  await req("GET", "/submissions/42");
  const all = parsed(); eq(all.length, 1, "log lines");
  const l = all[0]; if (l.unparsable) throw new Error(`not JSON: ${l.unparsable}`);
  for (const k of ["time", "level", "msg", "method", "path", "status", "durationMs", "requestId"]) if (!(k in l)) throw new Error(`missing "${k}" in ${JSON.stringify(l)}`);
  eq([l.level, l.msg, l.method, l.path, l.status], ["info", "request", "GET", "/submissions/42", 200], "fields");
  if (typeof l.durationMs !== "number" || Number.isNaN(Date.parse(l.time))) throw new Error("durationMs must be a number, time an ISO date");
});
await check("the duration is measured", async () => {
  await req("POST", "/submissions"); const l = await lastLog();
  if (!(l.durationMs >= 25)) throw new Error(`a 30 ms handler logged ${l.durationMs} ms`); return `${l.durationMs} ms`;
});
await check("no query string, no header values in logs", async () => {
  lines.length = 0;
  await req("GET", "/submissions/7?token=sk_live_secret", { authorization: "Bearer eyJhbGciOi.secret", cookie: "refresh=r3fr3sh-secret" });
  const text = lines.join("");
  for (const s of ["sk_live_secret", "eyJhbGciOi", "r3fr3sh-secret"]) if (text.includes(s)) throw new Error(`"${s}" is in the log`);
  eq(parsed()[0]?.path, "/submissions/7", "path");
});
await check("request ids: kept, made, and sent back", async () => {
  const a = await req("GET", "/submissions/1", { "x-request-id": "edge-7f3a.1" }); const la = await lastLog();
  eq([a.headers["x-request-id"], la.requestId], ["edge-7f3a.1", "edge-7f3a.1"], "a valid incoming id");
  const b = await req("GET", "/submissions/1"); const lb = await lastLog();
  if (!b.headers["x-request-id"] || b.headers["x-request-id"] !== lb.requestId) throw new Error("no id generated, or the log and the header disagree");
  const ids = new Set(); for (let i = 0; i < 5; i++) ids.add((await req("GET", "/submissions/1")).headers["x-request-id"]); eq(ids.size, 5, "distinct generated ids");
  const c = await req("GET", "/submissions/1", { "x-request-id": "x".repeat(200) }); if (c.headers["x-request-id"] === "x".repeat(200)) throw new Error("a 200-character id was accepted");
  const d = await req("GET", "/submissions/1", { "x-request-id": "a\"},{\"level\":\"fake" }); if (d.headers["x-request-id"]?.includes('"')) throw new Error("an id with quotes was accepted");
});
await check("a crash: 500, a generic body, an error log", async () => {
  const r = await req("GET", "/boom"); const l = await lastLog();
  eq(r.status, 500, "status"); if (r.body.includes("db.internal")) throw new Error("the error message reached the client");
  eq(l.level, "error", "log level"); if (!String(l.error ?? "").includes("database exploded")) throw new Error("the log doesn't say what failed");
});

console.log(`\n${bold("Health")}`);
await check("/health and /ready while all is well", async () => {
  eq((await req("GET", "/health")).status, 200, "/health"); const r = await req("GET", "/ready"); eq(r.status, 200, "/ready"); eq(JSON.parse(r.body).status, "ready", "/ready body");
});
await check("the database is down: alive, but not ready", async () => {
  dbDown = true; try {
    eq((await req("GET", "/health")).status, 200, "/health");
    const r = await req("GET", "/ready"); eq(r.status, 503, "/ready"); eq(JSON.parse(r.body).failed, ["db"], "failed");
  } finally { dbDown = false; }
  return "don't restart it; stop sending it traffic";
});
await check("a check that hangs counts as down, fast", async () => {
  redisHangs = true; const t0 = performance.now();
  try { const r = await req("GET", "/ready"); eq(r.status, 503, "/ready"); eq(JSON.parse(r.body).failed, ["redis"], "failed"); }
  finally { redisHangs = false; }
  const ms = performance.now() - t0; if (ms > 1500) throw new Error(`/ready took ${ms.toFixed(0)} ms`); return `${ms.toFixed(0)} ms`;
});

console.log(`\n${bold("Metrics")}`);
const metrics = async () => { const r = await req("GET", "/metrics"); return { ...r, series: Object.fromEntries(r.body.split("\n").filter((l) => l && !l.startsWith("#")).map((l) => { const i = l.lastIndexOf(" "); return [l.slice(0, i), Number(l.slice(i + 1))]; })) }; };
const norm = (s) => s.replace(/\s/g, "");
const find = (series, name, labels) => { const want = Object.entries(labels).map(([k, v]) => `${k}="${v}"`); const key = Object.keys(series).find((k) => k.startsWith(`${name}{`) && want.every((w) => norm(k).includes(w))); return key ? series[key] : undefined; };
await check("Prometheus text format, with HELP and TYPE", async () => {
  const m = await metrics(); eq(m.status, 200, "status");
  if (!/^text\/plain;\s*version=0\.0\.4/.test(m.headers["content-type"] ?? "")) throw new Error(`content-type: ${m.headers["content-type"]}`);
  for (const t of ["# TYPE http_requests_total counter", "# TYPE http_request_duration_seconds histogram", "# HELP http_requests_total", "# HELP http_request_duration_seconds"]) if (!m.body.includes(t)) throw new Error(`no "${t}"`);
});
await check("counted by route template, not by raw path", async () => {
  const before = find((await metrics()).series, "http_requests_total", { method: "GET", route: "/submissions/:id", status: "200" }) ?? 0;
  for (const id of [101, 102, 103]) await req("GET", `/submissions/${id}`);
  const m = await metrics(); const after = find(m.series, "http_requests_total", { method: "GET", route: "/submissions/:id", status: "200" });
  eq((after ?? 0) - before, 3, "new requests counted");
  if (Object.keys(m.series).some((k) => /\/submissions\/10[123]/.test(k))) throw new Error("a raw path became a label: one series per submission");
});
await check("404s share one series: bounded cardinality", async () => {
  for (let i = 0; i < 30; i++) await req("GET", `/scan/${Math.random().toString(36).slice(2)}`);
  const keys = Object.keys((await metrics()).series).filter((k) => k.startsWith("http_requests_total{") && norm(k).includes('status="404"'));
  eq(keys.length, 1, "series for 404s"); if (!norm(keys[0]).includes('route="unmatched"')) throw new Error(`the 404 series is ${keys[0]}`);
  return "30 random paths, 1 series";
});
await check("the histogram is consistent", async () => {
  const m = await metrics(); const lab = { method: "POST", route: "/submissions" };
  const count = find(m.series, "http_request_duration_seconds_count", lab), sum = find(m.series, "http_request_duration_seconds_sum", lab);
  const inf = find(m.series, "http_request_duration_seconds_bucket", { ...lab, le: "+Inf" }), b005 = find(m.series, "http_request_duration_seconds_bucket", { ...lab, le: "0.005" }), b1 = find(m.series, "http_request_duration_seconds_bucket", { ...lab, le: "1" });
  if (!(count >= 1)) throw new Error(`POST /submissions _count is ${count}`);
  eq(inf, count, "+Inf bucket vs _count"); if (!(sum >= 0.025 * count)) throw new Error(`_sum ${sum} s for ${count} requests of 30 ms`);
  if (!(b005 <= b1 && b1 <= inf)) throw new Error(`buckets aren't cumulative: 0.005 → ${b005}, 1 → ${b1}, +Inf → ${inf}`);
  eq(find(m.series, "http_requests_total", { method: "GET", route: "/boom", status: "500" }) >= 1, true, "the 500 is counted");
});
server.close();

console.log();
if (failed === 0) console.log(`${green(bold(`Part 1: all ${passed} cases pass.`))}`);
else console.log(`${bold(`Part 1: ${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
