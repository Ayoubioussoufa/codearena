// Lesson 0011 checker: your DI container, case by case.
import { existsSync } from "node:fs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
if (!existsSync(new URL("./container.mjs", import.meta.url))) { console.log("No container.mjs yet. Start with: cp container.start.mjs container.mjs"); process.exit(1); }
const { Container } = await import("./container.mjs");

let passed = 0, failed = 0;
const pad = (s) => s.padEnd(54);
function check(label, fn) {
  try {
    const note = fn();
    passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`);
  } catch (e) {
    failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`);
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const throwsWith = (fn, ...parts) => {
  let err;
  try { fn(); } catch (e) { err = e; }
  assert(err, "expected an error, nothing was thrown");
  for (const p of parts) assert(String(err.message).includes(p), `the error should mention "${p}", got: ${err.message}`);
  return err.message;
};

// The CodeArena shape: a port (a Symbol), two adapters, and a service that needs the port.
const CODE_RUNNER = Symbol("CodeRunner");
const CONFIG = Symbol("Config");
let built = { fake: 0, docker: 0, judge: 0 };
class FakeRunner { constructor() { built.fake++; } run() { return "fake facts"; } }
class DockerRunner { constructor(config) { built.docker++; this.image = config.image; } run() { return `docker ${this.image}`; } }
class JudgeService { constructor(runner) { built.judge++; this.runner = runner; } judge() { return this.runner.run(); } }
const reset = () => (built = { fake: 0, docker: 0, judge: 0 });

console.log(`\n${bold("Providers")}`);
check("useValue", () => { const k = new Container(); k.register(CONFIG, { useValue: { image: "node:22-alpine" } }); assert(k.resolve(CONFIG).image === "node:22-alpine", "wrong value"); });
check("useClass with a dependency (a Symbol token)", () => {
  reset(); const k = new Container();
  k.register(CODE_RUNNER, { useClass: FakeRunner });
  k.register(JudgeService, { useClass: JudgeService, deps: [CODE_RUNNER] });
  const j = k.resolve(JudgeService); assert(j instanceof JudgeService, "not a JudgeService");
  assert(j.judge() === "fake facts", `judge() returned ${j.judge()}`); return "JudgeService(FakeRunner)";
});
check("useFactory with inject", () => {
  const k = new Container(); k.register(CONFIG, { useValue: { image: "python:3.12-alpine" } });
  k.register(CODE_RUNNER, { useFactory: (cfg) => new DockerRunner(cfg), inject: [CONFIG] });
  assert(k.resolve(CODE_RUNNER).run() === "docker python:3.12-alpine", "the factory didn't get its dependency");
});
check("dependencies of dependencies", () => {
  reset(); const k = new Container(); k.register(CONFIG, { useValue: { image: "x" } });
  k.register(CODE_RUNNER, { useClass: DockerRunner, deps: [CONFIG] });
  k.register(JudgeService, { useClass: JudgeService, deps: [CODE_RUNNER] });
  assert(k.resolve(JudgeService).judge() === "docker x", "the chain didn't resolve"); return "Judge → Runner → Config";
});

console.log(`\n${bold("Lifetimes")}`);
check("nothing is built before it's resolved", () => {
  reset(); const k = new Container(); k.register(CODE_RUNNER, { useClass: FakeRunner }); k.register(JudgeService, { useClass: JudgeService, deps: [CODE_RUNNER] });
  assert(built.fake === 0 && built.judge === 0, `built ${JSON.stringify(built)} at registration`);
});
check("a singleton is built once, and shared", () => {
  reset(); const k = new Container(); k.register(CODE_RUNNER, { useClass: FakeRunner });
  k.register(JudgeService, { useClass: JudgeService, deps: [CODE_RUNNER] });
  const a = k.resolve(JudgeService), b = k.resolve(JudgeService);
  assert(a === b, "two resolves gave two JudgeServices"); assert(a.runner === k.resolve(CODE_RUNNER), "the runner isn't shared");
  assert(built.fake === 1 && built.judge === 1, `built ${JSON.stringify(built)}`); return "1 runner, 1 judge";
});
check("a transient is new every time", () => {
  reset(); const k = new Container(); k.register(CODE_RUNNER, { useClass: FakeRunner, scope: "transient" });
  const a = k.resolve(CODE_RUNNER), b = k.resolve(CODE_RUNNER);
  assert(a !== b && built.fake === 2, `built ${built.fake}, same instance: ${a === b}`);
});

console.log(`\n${bold("Swapping an adapter: why there's a port at all")}`);
check("same consumer, fake in tests, Docker in production", () => {
  const build = (runnerProvider) => { const k = new Container(); k.register(CONFIG, { useValue: { image: "node:22-alpine" } }); k.register(CODE_RUNNER, runnerProvider); k.register(JudgeService, { useClass: JudgeService, deps: [CODE_RUNNER] }); return k.resolve(JudgeService).judge(); };
  const t = build({ useClass: FakeRunner }), p = build({ useClass: DockerRunner, deps: [CONFIG] });
  assert(t === "fake facts" && p === "docker node:22-alpine", `got ${t} / ${p}`); return `${t} | ${p}`;
});

console.log(`\n${bold("Errors that tell you what to fix")}`);
check("a missing provider names the token and who needed it", () => {
  const k = new Container(); k.register(JudgeService, { useClass: JudgeService, deps: [CODE_RUNNER] });
  return throwsWith(() => k.resolve(JudgeService), "CodeRunner", "JudgeService");
});
check("a cycle shows its path", () => {
  class A { constructor(b) { this.b = b; } } class B { constructor(a) { this.a = a; } }
  const k = new Container(); k.register(A, { useClass: A, deps: [B] }); k.register(B, { useClass: B, deps: [A] });
  return throwsWith(() => k.resolve(A), "A -> B -> A");
});
check("resolving an unregistered token", () => throwsWith(() => new Container().resolve(CONFIG), "Config"));

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0011.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
