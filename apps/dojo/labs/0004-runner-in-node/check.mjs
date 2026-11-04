// Lesson 0004 checker: imports your runner.mjs and runs it against real programs.
// Run it with `bash check.sh` (or `node check.mjs`) from this folder.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";

const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);

if (!existsSync(new URL("./runner.mjs", import.meta.url))) {
  console.log("No runner.mjs yet. Start with: cp runner.start.mjs runner.mjs");
  process.exit(1);
}
const { run } = await import("./runner.mjs");
if (typeof run !== "function") {
  console.log(red("✗ runner.mjs must export a function named run."));
  process.exit(1);
}

// An error your runner forgot to handle would crash a real worker. Here it's caught and
// charged to the case that was running.
let current = null;
const stray = [];
process.on("uncaughtException", (err) => stray.push({ case: current, err }));

let passed = 0;
let failed = 0;
const section = (title) => console.log(`\n${bold(title)}`);
const pad = (s) => s.padEnd(50);

// No shell in between: a shell's own command line would contain the pattern and match itself.
const alive = (pattern) => spawnSync("pgrep", ["-f", pattern]).status === 0;
const cleanup = () => {
  spawnSync("pkill", ["-KILL", "-f", "sleep (31\\.4159|27\\.1828)"]);
  spawnSync("pkill", ["-KILL", "-x", "yes"]);
  spawnSync("pkill", ["-KILL", "-f", "lesson-0004-probe"]);
};

/**
 * @param {string} label
 * @param {object} request
 * @param {(facts: any, elapsed: number) => string[]} expect returns the problems found
 */
async function check(label, request, expect) {
  current = label;
  const before = stray.length;
  const t0 = performance.now();
  let facts;
  let problems = [];
  try {
    facts = await Promise.race([
      run(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("no answer after 6 s")), 6000)),
    ]);
  } catch (err) {
    problems.push(`run() rejected or hung: ${err instanceof Error ? err.message : String(err)}`);
  }
  const elapsed = Math.round(performance.now() - t0);
  await new Promise((r) => setTimeout(r, 150));
  if (facts) {
    problems = problems.concat(expect(facts, elapsed));
    if (typeof facts.timeMs !== "number" || facts.timeMs < 0 || facts.timeMs > elapsed + 50) {
      problems.push(`timeMs is ${facts.timeMs}, but the call took ${elapsed} ms`);
    }
  }
  for (const s of stray.slice(before)) {
    problems.push(`unhandled ${s.err.code ?? s.err.name}: this would crash the worker`);
  }
  cleanup();
  current = null;
  if (problems.length === 0) {
    passed++;
    console.log(`  ${green("✓")} ${pad(label)} ${dim(summary(facts, elapsed))}`);
  } else {
    failed++;
    console.log(`  ${red("✗")} ${pad(label)} ${problems.join(" · ")}`);
  }
}

function summary(f, elapsed) {
  const what = f.outcome === "exit" ? `exit ${f.exitCode}` : f.outcome === "signal" ? f.signal : f.outcome;
  return `${what}, ${elapsed} ms`;
}

// Expectation helpers: each returns a list of problems.
const outcome = (f, want) => (f.outcome === want ? [] : [`outcome: expected "${want}", got "${f.outcome}"`]);
const field = (f, name, want) =>
  f[name] === want ? [] : [`${name}: expected ${JSON.stringify(want)}, got ${JSON.stringify(f[name])}`];
const bytes = (f, name, want) => {
  const got = Buffer.byteLength(f[name] ?? "");
  return got === want ? [] : [`${name}: expected ${want} bytes, got ${got}`];
};
const within = (elapsed, lo, hi) => (elapsed >= lo && elapsed <= hi ? [] : [`took ${elapsed} ms, expected ${lo}–${hi}`]);
const nothingLeft = (pattern) => (alive(pattern) ? [`still running afterwards: ${pattern.replace(/\\/g, "")}`] : []);

const base = { args: [], timeoutMs: 2000, maxOutputBytes: 1_000_000 };
const py = (code, extra = {}) => ({ ...base, command: "python3", args: ["-c", code], ...extra });
const sh = (code, extra = {}) => ({ ...base, command: "sh", args: ["-c", code], ...extra });

cleanup();

section("Ends by itself");
await check("sh -c 'exit 0'", sh("exit 0"), (f) => [...outcome(f, "exit"), ...field(f, "exitCode", 0), ...field(f, "signal", null)]);
await check("sh -c 'exit 3'", sh("exit 3"), (f) => [...outcome(f, "exit"), ...field(f, "exitCode", 3)]);
await check("sh -c 'kill -SEGV $$'", sh("kill -SEGV $$"), (f) => [...outcome(f, "signal"), ...field(f, "signal", "SIGSEGV"), ...field(f, "exitCode", null)]);
await check("./no-such-program", { ...base, command: "./no-such-program" }, (f) => outcome(f, "spawn-error"));

section("Input and output");
await check("reverse a line from stdin", py("print(input()[::-1])", { input: "hello\n" }), (f) => [...outcome(f, "exit"), ...field(f, "stdout", "olleh\n")]);
await check("stderr is captured on its own", py("import sys; sys.stderr.write('oops')"), (f) => [...field(f, "stderr", "oops"), ...field(f, "stdout", "")]);
await check("no input means end of file at once", { ...base, command: "cat", timeoutMs: 1500 }, (f, ms) => [...outcome(f, "exit"), ...field(f, "stdout", ""), ...within(ms, 0, 1000)]);
await check("1 MB in through stdin", py("import sys; print(len(sys.stdin.buffer.read()))", { input: Buffer.alloc(1 << 20, 97) }), (f) => [...outcome(f, "exit"), ...field(f, "stdout", "1048576\n")]);
await check("300 KB out through stdout", py("print('x' * 300000)"), (f) => [...outcome(f, "exit"), ...bytes(f, "stdout", 300001)]);
await check("300 KB on stdout and on stderr", py("import sys\nfor _ in range(300):\n    sys.stderr.write('e' * 1000); sys.stderr.flush(); sys.stdout.write('o' * 1000); sys.stdout.flush()"), (f) => [...outcome(f, "exit"), ...bytes(f, "stdout", 300000), ...bytes(f, "stderr", 300000)]);
await check("exits without reading 1 MB of input", sh("exit 0", { input: Buffer.alloc(1 << 20, 97) }), (f) => [...outcome(f, "exit"), ...field(f, "exitCode", 0)]);

section("The deadline");
await check("an infinite loop", py("while True: pass", { timeoutMs: 500 }), (f, ms) => [...outcome(f, "timeout"), ...field(f, "exitCode", null), ...within(ms, 450, 1500)]);
await check("ignores SIGTERM, then sleeps", py("import signal, time; signal.signal(signal.SIGTERM, signal.SIG_IGN); time.sleep(60)  # lesson-0004-probe", { timeoutMs: 500 }), (f, ms) => [...outcome(f, "timeout"), ...within(ms, 450, 1500), ...nothingLeft("lesson-0004-probe")]);
await check("a shell and its child", sh("sleep 31.4159; :", { timeoutMs: 500 }), (f, ms) => [...outcome(f, "timeout"), ...within(ms, 450, 1500), ...nothingLeft("sleep 31\\.4159")]);
await check("a shell and a background child", sh("sleep 27.1828 & wait", { timeoutMs: 500 }), (f, ms) => [...outcome(f, "timeout"), ...within(ms, 450, 1500), ...nothingLeft("sleep 27\\.1828")]);

section("The output limit (10,000 bytes)");
await check("yes", { ...base, command: "yes", maxOutputBytes: 10000 }, (f, ms) => [...outcome(f, "output-limit"), ...bytes(f, "stdout", 10000), ...within(ms, 0, 1500), ...nothingLeft("^yes$")]);
await check("a flood on stderr", py("import sys\nwhile True: sys.stderr.write('e' * 1000)", { maxOutputBytes: 10000 }), (f, ms) => [...outcome(f, "output-limit"), ...bytes(f, "stderr", 10000), ...within(ms, 0, 1500)]);
await check("exactly the cap", py("import sys; sys.stdout.write('x' * 10000)", { maxOutputBytes: 10000 }), (f) => [...outcome(f, "exit"), ...bytes(f, "stdout", 10000)]);

console.log();
if (failed === 0) {
  console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0004.`);
} else {
  console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
}
process.exit(failed === 0 ? 0 : 1);
