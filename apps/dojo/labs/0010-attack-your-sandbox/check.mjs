// Lesson 0010 checker: are your attacks contained by your runner, and does your
// suite notice when any one protection is missing (mutation testing)?
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { weakRunner, MUTANTS } from "./weak-runner.mjs";

const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1), yellow = c(33);
for (const f of ["attacks.mjs", "docker-runner.mjs", "runner.mjs"]) {
  if (!existsSync(new URL(`./${f}`, import.meta.url))) {
    console.log(`No ${f} yet. Copy runner.mjs and docker-runner.mjs from lesson 8's lab, and start attacks.mjs from attacks.start.mjs.`);
    process.exit(1);
  }
}
const { ATTACKS } = await import("./attacks.mjs");
const { runInDocker } = await import("./docker-runner.mjs");
const leftovers = () => spawnSync("docker", ["ps", "-aq", "--filter", "name=lab8-", "--filter", "name=lab10-"], { encoding: "utf8" }).stdout.trim();
const clean = () => { const l = leftovers(); if (l) spawnSync("docker", ["rm", "-f", ...l.split("\n")], { stdio: "ignore" }); };

let passed = 0, failed = 0;
const pad = (s) => s.padEnd(44);
const ok = (l, n) => { passed++; console.log(`  ${green("✓")} ${pad(l)} ${dim(n)}`); };
const ko = (l, w) => { failed++; console.log(`  ${red("✗")} ${pad(l)} ${w}`); };

async function attempt(run, a) {
  const f = await run({ source: a.source, input: "", timeoutMs: a.timeoutMs ?? 3000, memoryMb: 128, maxOutputBytes: 100000 });
  let problems;
  try { problems = a.expect(f); } catch (e) { problems = [`expect() threw: ${e.message}`]; }
  return { f, problems: Array.isArray(problems) ? problems : ["expect() must return an array"] };
}

console.log(`\n${bold("Your suite")}`);
if (!Array.isArray(ATTACKS) || ATTACKS.length < 6) ko("six attacks", `found ${ATTACKS?.length ?? 0}`);
else ok("six attacks", ATTACKS.map((a) => a.name).join(" · "));

console.log(`\n${bold("Against your runner: every attack contained")}`);
clean();
for (const a of ATTACKS) {
  const { f, problems } = await attempt(runInDocker, a);
  const left = leftovers();
  if (left) problems.push("a container was left behind");
  clean();
  if (problems.length === 0) ok(a.name, `${f.outcome}${f.exitCode != null ? " " + f.exitCode : ""}`);
  else ko(a.name, problems.join(" · "));
}
const alive = spawnSync("docker", ["info", "--format", "{{.ServerVersion}}"], { encoding: "utf8" }).status === 0;
if (alive) ok("the host is still fine afterwards", "docker answers, nothing left"); else ko("the host is still fine afterwards", "docker no longer answers");

console.log(`\n${bold("Against weakened runners: your suite must notice each one")}`);
for (const m of MUTANTS) {
  const run = weakRunner(m);
  const caught = [];
  for (const a of ATTACKS) {
    const { problems } = await attempt(run, a);
    if (problems.length > 0) caught.push(a.name);
  }
  clean();
  if (caught.length > 0) ok(`without ${m}`, `caught by: ${caught.join(", ")}`);
  else ko(`without ${m}`, `${yellow("no attack noticed")}: your suite can't see this protection`);
}

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0010.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
