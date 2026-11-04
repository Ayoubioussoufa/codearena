// Lesson 0008 checker: every hardening flag, proven from inside the container.
import { existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";

const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);

for (const f of ["runner.mjs", "docker-runner.mjs"]) {
  if (!existsSync(new URL(`./${f}`, import.meta.url))) {
    console.log(`No ${f} yet. See the top of docker-runner.start.mjs.`);
    process.exit(1);
  }
}
const { runInDocker } = await import("./docker-runner.mjs");

const stray = [];
process.on("uncaughtException", (err) => stray.push(err));
const containers = () =>
  spawnSync("docker", ["ps", "-a", "--filter", "name=lab8-", "--format", "{{.Names}}"], { encoding: "utf8" }).stdout.trim();
const cleanup = () => {
  const left = containers();
  if (left) spawnSync("docker", ["rm", "-f", ...left.split("\n")], { stdio: "ignore" });
};

let passed = 0, failed = 0;
const pad = (s) => s.padEnd(46);
async function check(label, source, extra, expect) {
  const before = stray.length;
  const t0 = performance.now();
  let f, problems = [];
  try {
    f = await Promise.race([
      runInDocker({ source, input: "", timeoutMs: 3000, memoryMb: 128, maxOutputBytes: 10000, ...extra }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("no answer after 15 s")), 15000)),
    ]);
  } catch (err) {
    problems.push(`runInDocker() rejected or hung: ${err.message}`);
  }
  const ms = Math.round(performance.now() - t0);
  if (f) problems = problems.concat(expect(f, ms));
  const left = containers();
  if (left) problems.push(`container still there afterwards: ${left.split("\n")[0]}`);
  for (const e of stray.slice(before)) problems.push(`unhandled ${e.code ?? e.name}`);
  cleanup();
  if (problems.length === 0) { passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(`${f.outcome}${f.exitCode != null ? " " + f.exitCode : ""}, ${ms} ms`)}`); }
  else { failed++; console.log(`  ${red("✗")} ${pad(label)} ${problems.join(" · ")}`); }
}
const is = (f, k, v) => (f[k] === v ? [] : [`${k}: expected ${JSON.stringify(v)}, got ${JSON.stringify(f[k])}`]);
const has = (f, k, re) => (re.test(f[k] ?? "") ? [] : [`${k} should match ${re}, got ${JSON.stringify((f[k] ?? "").slice(-120))}`]);
const within = (ms, lo, hi) => (ms >= lo && ms <= hi ? [] : [`took ${ms} ms, expected ${lo}–${hi}`]);

cleanup();
console.log(`\n${bold("It runs, and it talks")}`);
await check("print(2 + 3)", "print(2 + 3)", {}, (f) => [...is(f, "outcome", "exit"), ...is(f, "exitCode", 0), ...is(f, "stdout", "5\n")]);
await check("reads its input", "print(input()[::-1])", { input: "hello\n" }, (f) => [...is(f, "stdout", "olleh\n")]);

console.log(`\n${bold("The limits (lessons 2, 3, 6)")}`);
await check("an infinite loop: timeout, and I-17", "while True: pass", { timeoutMs: 1500 }, (f, ms) => [...is(f, "outcome", "timeout"), ...within(ms, 1300, 4000)]);
await check("512 MB under a 128 MB limit", "b = bytearray(512 * 1024 * 1024)", {}, (f) => [...is(f, "outcome", "memory-limit")]);
await check("a flood of output", "while True: print('y' * 1000)", {}, (f) => [...is(f, "outcome", "output-limit")]);
await check("the cgroup files inside", "print(*[open('/sys/fs/cgroup/' + n).read().strip() for n in ('pids.max', 'memory.max', 'cpu.max')])", {}, (f) => [...is(f, "stdout", "64 134217728 100000 100000\n")]);

console.log(`\n${bold("The walls (lessons 5, 7)")}`);
await check("no network", "import urllib.request\nurllib.request.urlopen('http://1.1.1.1', timeout=2)", {}, (f) => [...is(f, "exitCode", 1), ...has(f, "stderr", /Errno 101|unreachable/i)]);
await check("a read-only filesystem", "open('/etc/pwned', 'w')", {}, (f) => [...is(f, "exitCode", 1), ...has(f, "stderr", /Read-only file system/)]);
await check("/tmp can't run programs", "import os, subprocess\nopen('/tmp/x.sh', 'w').write('#!/bin/sh\\necho hi\\n')\nos.chmod('/tmp/x.sh', 0o755)\nsubprocess.run(['/tmp/x.sh'])", {}, (f) => [...is(f, "exitCode", 1), ...has(f, "stderr", /Permission denied/)]);
await check("not root", "import os; print(os.getuid(), os.getgid())", {}, (f) => [...is(f, "stdout", "65534 65534\n")]);
await check("no capabilities, no new privileges, filtered", "s = dict(l.split(':\\t') for l in open('/proc/self/status').read().splitlines() if ':\\t' in l)\nprint(s['CapEff'], s['CapBnd'], s['NoNewPrivs'], s['Seccomp'])", {}, (f) => [...is(f, "stdout", "0000000000000000 0000000000000000 1 2\n")]);

const leftoverDirs = readdirSync(tmpdir()).filter((d) => d.startsWith("lab8-"));
console.log(`\n${bold("Nothing left behind")}`);
if (leftoverDirs.length === 0 && !containers()) { passed++; console.log(`  ${green("✓")} ${pad("no containers, no temporary folders")} ${dim("clean")}`); }
else { failed++; console.log(`  ${red("✗")} ${pad("no containers, no temporary folders")} left: ${[containers(), ...leftoverDirs].filter(Boolean).join(", ")}`); }

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0008.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
