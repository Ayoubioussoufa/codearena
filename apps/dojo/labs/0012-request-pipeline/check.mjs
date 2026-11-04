// Lesson 0012 checker: the pipeline's order, its short-circuits, and its errors.
import { existsSync } from "node:fs";
import { HttpError } from "./http-error.mjs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
if (!existsSync(new URL("./pipeline.mjs", import.meta.url))) { console.log("No pipeline.mjs yet. Start with: cp pipeline.start.mjs pipeline.mjs"); process.exit(1); }
const { createApp } = await import("./pipeline.mjs");

let passed = 0, failed = 0;
const pad = (s) => s.padEnd(50);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const eq = (got, want, what) => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };

/** An app where every component writes its name into req.log. */
function traced() {
  const app = createApp();
  const tag = (name) => (req) => req.log.push(name);
  app.use(async (req, next) => { req.log = ["middleware"]; return next(); });
  app.useGlobalGuard((req) => (tag("global guard")(req), true));
  app.useGlobalInterceptor(async (req, next) => { tag("global before")(req); const r = await next(); tag("global after")(req); return r; });
  app.useGlobalPipe((body, req) => (tag("global pipe")(req), body));
  return app;
}
const routeExtras = {
  guards: [(req) => (req.log.push("route guard"), true)],
  interceptors: [async (req, next) => { req.log.push("route before"); const r = await next(); req.log.push("route after"); return r; }],
  pipes: [(body, req) => (req.log.push("route pipe"), body)],
};

console.log(`\n${bold("The order")}`);
await check("every component, in Nest's order", async () => {
  const app = traced(); let seen;
  app.route("POST", "/submissions", (body, req) => { req.log.push("handler"); seen = [...req.log]; return { id: 1 }; }, routeExtras);
  await app.handle({ method: "POST", path: "/submissions", body: {} });
  eq(seen, ["middleware", "global guard", "route guard", "global before", "route before", "global pipe", "route pipe", "handler"], "order up to the handler");
  return "middleware → guards → before → pipes → handler";
});
await check("interceptors unwind in reverse", async () => {
  const app = traced(); let req0;
  app.route("POST", "/s", (body, req) => { req0 = req; req.log.push("handler"); return 1; }, routeExtras);
  await app.handle({ method: "POST", path: "/s", body: {} });
  eq(req0.log.slice(-3), ["handler", "route after", "global after"], "after the handler");
  return "route after, then global after";
});
await check("POST answers 201 with the handler's result", async () => {
  const app = createApp(); app.route("POST", "/s", () => ({ id: 7 }));
  eq(await app.handle({ method: "POST", path: "/s", body: {} }), { status: 201, body: { id: 7 } }, "response");
});
await check("GET answers 200", async () => {
  const app = createApp(); app.route("GET", "/s/7", () => ({ id: 7 }));
  eq((await app.handle({ method: "GET", path: "/s/7" })).status, 200, "status");
});
await check("an interceptor can reshape the result", async () => {
  const app = createApp(); app.useGlobalInterceptor(async (req, next) => ({ data: await next() }));
  app.route("GET", "/s", () => [1, 2]);
  eq((await app.handle({ method: "GET", path: "/s" })).body, { data: [1, 2] }, "body");
});

console.log(`\n${bold("Stopping early")}`);
await check("a guard says no: 403, nothing after it runs", async () => {
  const app = createApp(); let ran = [];
  app.useGlobalGuard(() => false);
  app.useGlobalPipe((b) => (ran.push("pipe"), b));
  app.route("POST", "/s", () => (ran.push("handler"), 1));
  const res = await app.handle({ method: "POST", path: "/s", body: {} });
  eq(res, { status: 403, body: { statusCode: 403, message: "Forbidden resource" } }, "response"); eq(ran, [], "what ran after the guard");
});
await check("a guard throws 401", async () => {
  const app = createApp(); app.useGlobalGuard(() => { throw new HttpError(401, "Missing token"); });
  app.route("GET", "/s", () => 1);
  eq(await app.handle({ method: "GET", path: "/s" }), { status: 401, body: { statusCode: 401, message: "Missing token" } }, "response");
});
await check("middleware answers without calling next", async () => {
  const app = createApp(); let handled = false;
  app.use(async () => ({ status: 429, body: { message: "slow down" } }));
  app.route("GET", "/s", () => ((handled = true), 1));
  eq((await app.handle({ method: "GET", path: "/s" })).status, 429, "status"); eq(handled, false, "handler ran");
});
await check("a pipe refuses the body: 400, handler never runs", async () => {
  const app = createApp(); let handled = false;
  app.useGlobalPipe((body) => { if (typeof body.code !== "string") throw new HttpError(400, "code must be a string"); return body; });
  app.route("POST", "/s", () => ((handled = true), 1));
  eq(await app.handle({ method: "POST", path: "/s", body: { code: 5 } }), { status: 400, body: { statusCode: 400, message: "code must be a string" } }, "response");
  eq(handled, false, "handler ran");
});
await check("a pipe transforms what the handler receives", async () => {
  const app = createApp(); app.useGlobalPipe((body) => ({ ...body, code: body.code.trim() }));
  app.route("POST", "/s", (body) => body.code);
  eq((await app.handle({ method: "POST", path: "/s", body: { code: "  x  " } })).body, "x", "body");
});

console.log(`\n${bold("Errors")}`);
await check("an HttpError from the handler", async () => {
  const app = createApp(); app.route("GET", "/s/9", () => { throw new HttpError(404, "Submission not found"); });
  eq(await app.handle({ method: "GET", path: "/s/9" }), { status: 404, body: { statusCode: 404, message: "Submission not found" } }, "response");
});
await check("any other error: 500, and its message never leaks", async () => {
  const app = createApp(); app.route("GET", "/s", () => { throw new Error("password=hunter2 at db.internal:5432"); });
  const res = await app.handle({ method: "GET", path: "/s" });
  eq(res, { status: 500, body: { statusCode: 500, message: "Internal server error" } }, "response");
});
await check("an unknown route", async () => {
  const app = createApp(); app.route("GET", "/s", () => 1);
  eq(await app.handle({ method: "POST", path: "/nope", body: {} }), { status: 404, body: { statusCode: 404, message: "Cannot POST /nope" } }, "response");
});
await check("filters: route first, and it stops there", async () => {
  const app = createApp(); const seen = [];
  app.useGlobalFilter(() => (seen.push("global"), { status: 500, body: "global" }));
  app.route("GET", "/s", () => { throw new HttpError(409, "dup"); }, { filters: [(err) => (seen.push("route"), { status: 409, body: { conflict: err.message } })] });
  eq(await app.handle({ method: "GET", path: "/s" }), { status: 409, body: { conflict: "dup" } }, "response"); eq(seen, ["route"], "filters that ran");
});
await check("a filter can pass, by returning nothing", async () => {
  const app = createApp();
  app.useGlobalFilter((err) => (err.status === 400 ? { status: 400, body: { errors: [err.message] } } : undefined));
  app.route("GET", "/a", () => { throw new HttpError(400, "bad"); }); app.route("GET", "/b", () => { throw new HttpError(404, "missing"); });
  eq((await app.handle({ method: "GET", path: "/a" })).body, { errors: ["bad"] }, "/a"); eq((await app.handle({ method: "GET", path: "/b" })).body, { statusCode: 404, message: "missing" }, "/b");
});
await check("an error thrown in an interceptor reaches the filters", async () => {
  const app = createApp(); app.useGlobalInterceptor(async () => { throw new HttpError(503, "queue down"); });
  app.useGlobalFilter((err) => ({ status: err.status, body: { retry: true } }));
  app.route("GET", "/s", () => 1);
  eq(await app.handle({ method: "GET", path: "/s" }), { status: 503, body: { retry: true } }, "response");
});

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0012.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
