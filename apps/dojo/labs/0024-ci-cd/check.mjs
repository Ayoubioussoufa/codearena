// Lesson 0024 checker: deploy.sh against fake docker and curl, then deploy.yml with actionlint and rules.
import { execFile, execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync, chmodSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(58);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const eq = (got, want, what) => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`); };

// ── deploy.sh against stubs ──
const STUB = `#!/usr/bin/env bash
# Fake $0: records the call (with TAG), fails on demand.
name=$(basename "$0")
echo "$name TAG=\${TAG:-} $*" >> "$STUB_LOG"
case "$name" in
  docker)
    [[ "$*" == *" pull"* && -n "\${FAIL_PULL:-}" ]] && exit 1
    [[ "$*" == *" up "* && -n "\${FAIL_UP_FOR:-}" && "\${TAG:-}" == "$FAIL_UP_FOR" ]] && { echo "container unhealthy" >&2; exit 1; }
    exit 0 ;;
  curl) [[ -n "\${FAIL_HEALTH:-}" ]] && exit 22; echo ok ;;
esac`;
function scenario({ current, tag, env = {} }) {
  const d = mkdtempSync(join(tmpdir(), "lab24-"));
  const bin = join(d, "bin"); execFileSync("mkdir", ["-p", bin]);
  for (const n of ["docker", "curl"]) { writeFileSync(join(bin, n), STUB); chmodSync(join(bin, n), 0o755); }
  const srv = join(d, "srv"); execFileSync("mkdir", ["-p", srv]);
  copyFileSync(resolve("deploy.sh"), join(srv, "deploy.sh"));
  writeFileSync(join(srv, "docker-compose.prod.yml"), "services: {}\n");
  if (current) writeFileSync(join(srv, "current-tag"), `${current}\n`);
  const log = join(d, "calls.log"); writeFileSync(log, "");
  return new Promise((res) => {
    // Run from another directory, the way ssh runs it: from deploy's home.
    execFile("bash", [join(srv, "deploy.sh"), tag], { cwd: d, timeout: 20000, env: { PATH: `${bin}:/usr/bin:/bin`, HOME: d, STUB_LOG: log, ...env } }, (err) => {
      const calls = readFileSync(log, "utf8").trim().split("\n").filter(Boolean);
      const cur = existsSync(join(srv, "current-tag")) ? readFileSync(join(srv, "current-tag"), "utf8").trim() : null;
      rmSync(d, { recursive: true, force: true });
      res({ code: err ? (err.code ?? 1) : 0, calls, current: cur });
    });
  });
}
const ups = (calls) => calls.filter((l) => / up /.test(l)).map((l) => /TAG=(\S*)/.exec(l)[1]);

console.log(`\n${bold("deploy.sh, with fake docker and curl")}`);
await check("a good deploy: pull, up --wait, health, record", async () => {
  const r = await scenario({ current: "1111111", tag: "abc1234" });
  eq(r.code, 0, "exit code"); eq(r.current, "abc1234", "current-tag");
  const pull = r.calls.find((l) => /^docker .* pull/.test(l)), up = r.calls.find((l) => /^docker .* up /.test(l));
  if (!pull?.includes("TAG=abc1234") || !pull.includes("-f docker-compose.prod.yml")) throw new Error(`pull call: ${pull ?? "none"}`);
  if (!up?.includes("TAG=abc1234") || !/ -d\b/.test(up) || !/--wait\b/.test(up)) throw new Error(`up call: ${up ?? "none"}`);
  if (!r.calls.some((l) => /^curl .*localhost\/health/.test(l))) throw new Error("no health check");
  if (r.calls.findIndex((l) => / up /.test(l)) < r.calls.findIndex((l) => / pull/.test(l))) throw new Error("up ran before pull");
});
await check("the new version won't start: roll back", async () => {
  const r = await scenario({ current: "1111111", tag: "abc1234", env: { FAIL_UP_FOR: "abc1234" } });
  if (r.code === 0) throw new Error("it exited 0 after a failed deploy");
  eq(ups(r.calls), ["abc1234", "1111111"], "up calls (by TAG)"); eq(r.current, "1111111", "current-tag");
  return "back on 1111111";
});
await check("it starts but /health fails: roll back", async () => {
  const r = await scenario({ current: "1111111", tag: "abc1234", env: { FAIL_HEALTH: "1" } });
  if (r.code === 0) throw new Error("it exited 0 with a failing health check");
  eq(ups(r.calls).at(-1), "1111111", "last up's TAG"); eq(r.current, "1111111", "current-tag");
});
await check("the pull fails: change nothing", async () => {
  const r = await scenario({ current: "1111111", tag: "abc1234", env: { FAIL_PULL: "1" } });
  if (r.code === 0) throw new Error("it exited 0"); eq(ups(r.calls), [], "up calls"); eq(r.current, "1111111", "current-tag");
});
await check("the first deploy fails: nothing to roll back to", async () => {
  const r = await scenario({ current: null, tag: "abc1234", env: { FAIL_UP_FOR: "abc1234" } });
  if (r.code === 0) throw new Error("it exited 0"); eq(ups(r.calls), ["abc1234"], "up calls"); eq(r.current, null, "current-tag");
});
await check("a tag that isn't a SHA: refused before anything runs", async () => {
  for (const tag of ["latest", "abc1234; rm -rf /", "ABC1234", "abc12", "$(id)"]) {
    const r = await scenario({ current: "1111111", tag });
    if (r.code === 0) throw new Error(`"${tag}" was accepted`); if (r.calls.length) throw new Error(`"${tag}" reached: ${r.calls[0]}`);
  }
});

// ── deploy.yml ──
console.log(`\n${bold("deploy.yml")}`);
await check("actionlint (and shellcheck on run: scripts)", async () => {
  const out = await new Promise((res) => execFile("docker", ["run", "--rm", "-v", `${process.cwd()}:/repo:ro`, "--workdir", "/repo", "rhysd/actionlint:latest", "-no-color", "deploy.yml"], (err, so, se) => res({ code: err ? 1 : 0, text: `${so}${se}`.trim() })));
  if (out.code !== 0) throw new Error(`\n${out.text.split("\n").slice(0, 12).map((l) => `      ${l}`).join("\n")}`);
});
let wf;
try { wf = JSON.parse(execFileSync("python3", ["-c", "import json,sys,yaml; print(json.dumps(yaml.safe_load(open('deploy.yml'))))"], { encoding: "utf8" })); }
catch (e) { console.log(red(`  deploy.yml isn't valid YAML: ${e.message.split("\n")[0]}`)); failed++; }
if (wf) {
  const on = wf.on ?? wf[true] ?? {};
  const jobs = wf.jobs ?? {};
  const text = readFileSync("deploy.yml", "utf8");
  const steps = Object.values(jobs).flatMap((j) => j.steps ?? []);
  await check("push to main and a manual tag input; no pull_request", async () => {
    if ("pull_request" in on || "pull_request_target" in on) throw new Error("it runs on pull requests: a PR must never deploy");
    const branches = on.push?.branches ?? []; if (!(branches.length === 1 && branches[0] === "main")) throw new Error(`push branches: ${JSON.stringify(branches)}`);
    if (!on.workflow_dispatch?.inputs?.tag) throw new Error("no workflow_dispatch input named tag: that's your rollback button");
  });
  await check("test → build → deploy, in that order", async () => {
    const need = (j) => [jobs[j]?.needs ?? []].flat();
    if (!jobs.test || !jobs.build || !jobs.deploy) throw new Error(`jobs: ${Object.keys(jobs).join(", ")}; expected test, build, deploy`);
    if (!need("build").includes("test")) throw new Error("build doesn't need test"); if (!need("deploy").includes("build")) throw new Error("deploy doesn't need build");
    const env = jobs.deploy.environment; if ((env?.name ?? env) !== "production") throw new Error("deploy isn't in the production environment");
  });
  await check("least privilege for GITHUB_TOKEN", async () => {
    const top = wf.permissions;
    if (typeof top === "string") throw new Error(`permissions: ${top} gives the token ${top === "write-all" ? "every scope, writable" : "the same access everywhere"}`);
    if (!top || typeof top !== "object") throw new Error("no top-level permissions block: the token gets the repository's defaults");
    if (top.contents !== "read") throw new Error(`top-level contents: ${top.contents}`);
    for (const [k, v] of Object.entries(top)) if (v === "write" || v === "write-all") throw new Error(`top-level ${k}: write. Grant writes per job`);
    if (jobs.build?.permissions?.packages !== "write") throw new Error("build can't push images: it needs packages: write");
    for (const [name, j] of Object.entries(jobs)) if (name !== "build" && j.permissions?.packages === "write") throw new Error(`${name} has packages: write too`);
  });
  await check("deploys queue, never overlap, never cancel halfway", async () => {
    const cc = wf.concurrency ?? jobs.deploy?.concurrency; if (!cc) throw new Error("no concurrency group");
    if ((typeof cc === "object" ? cc["cancel-in-progress"] : false) === true) throw new Error("cancel-in-progress: true can kill a deploy halfway through");
  });
  await check("images tagged with the commit SHA", async () => { if (!/github\.sha/.test(JSON.stringify(jobs.build ?? {}))) throw new Error("the build job never uses github.sha"); });
  await check("every action pinned to a commit SHA", async () => {
    const bad = steps.filter((s) => s.uses && !s.uses.startsWith("./") && !/@[0-9a-f]{40}$/.test(s.uses)).map((s) => s.uses);
    if (bad.length) throw new Error(`pinned by tag: ${[...new Set(bad)].join(", ")}`); return `${steps.filter((s) => s.uses).length} actions`;
  });
  await check("no untrusted input pasted into a script", async () => {
    for (const s of steps) { const m = s.run && /\$\{\{\s*(github\.event\.|inputs\.|github\.head_ref)[^}]*\}\}/.exec(s.run); if (m) throw new Error(`a run: script contains ${m[0]}: pass it through env: instead`); }
  });
  await check("SSH: key and host key from secrets, host verified", async () => {
    if (/StrictHostKeyChecking\s*=?\s*no/i.test(text)) throw new Error("StrictHostKeyChecking=no lets anyone pretend to be your server");
    if (!/secrets\.\w*KEY\w*/.test(JSON.stringify(jobs.deploy ?? {}))) throw new Error("the deploy job uses no SSH key secret");
    if (!/known_hosts/i.test(JSON.stringify(jobs.deploy ?? {}))) throw new Error("the deploy job never writes a known_hosts");
  });
}

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0024.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
