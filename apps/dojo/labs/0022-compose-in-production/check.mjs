// Lesson 0022 checker: your production Compose file, as `docker compose config` sees it.
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(58);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const FILE = "docker-compose.prod.yml";
const tmp = mkdtempSync(join(tmpdir(), "lab22-"));
process.on("exit", () => rmSync(tmp, { recursive: true, force: true }));
const compose = (env, ...args) => new Promise((resolve) => {
  const envFile = join(tmp, `env-${Math.random().toString(36).slice(2)}`);
  writeFileSync(envFile, Object.entries(env).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
  // A clean environment: only PATH and HOME, so your shell's variables can't leak in.
  execFile("docker", ["compose", "-f", FILE, "--env-file", envFile, "config", ...args], { env: { PATH: process.env.PATH, HOME: process.env.HOME } },
    (err, stdout, stderr) => resolve({ code: err ? 1 : 0, out: stdout, err: String(stderr).trim() }));
});

// Which variables does the file use? Ask Compose itself, without interpolating.
const raw0 = await compose({}, "--no-interpolate", "--format", "json");
if (raw0.code !== 0) { console.log(red(`\ndocker compose can't read your file:\n${raw0.err}`)); process.exit(1); }
const rawText = raw0.out;
const vars = [...new Set([...rawText.matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => m[1]))].sort();
const dummy = Object.fromEntries(vars.map((v) => [v, v === "TAG" ? "a1b2c3d" : `dummy-${v.toLowerCase()}`]));
const raw = JSON.parse(rawText);
const full = await compose(dummy, "--format", "json");
const cfg = full.code === 0 ? JSON.parse(full.out) : null;
const S = cfg?.services ?? {};
const NAMES = ["proxy", "web", "api", "worker", "migrate", "postgres", "redis"];
const APP = ["web", "api", "worker", "migrate"];

console.log(`\n${bold("The file")}`);
await check("1. valid, with all seven services", async () => {
  if (!cfg) throw new Error(full.err);
  const missing = NAMES.filter((n) => !S[n]); if (missing.length) throw new Error(`missing: ${missing.join(", ")}`);
  return `uses ${vars.length} variables: ${vars.join(", ")}`;
});
await check("2. pinned images, app images tagged with ${TAG}", async () => {
  for (const n of NAMES) {
    const s = raw.services[n]; if (!s) continue;
    if (s.build) throw new Error(`${n} builds on the server: production runs images built once, in CI`);
    if (!s.image) throw new Error(`${n} has no image`);
    const tag = s.image.includes("@") ? "digest" : s.image.split("/").pop().split(":")[1];
    if (!tag || tag === "latest") throw new Error(`${n}: "${s.image}" isn't pinned`);
    if (APP.includes(n) && !/\$\{TAG/.test(s.image)) throw new Error(`${n}: "${s.image}" should use \${TAG}, so a deploy is "set TAG, up"`);
    if (!APP.includes(n) && /^(\d+|alpine)$/.test(tag)) throw new Error(`${n}: "${s.image}" pins only a major version; pin a minor too`);
  }
});
await check("3. a missing TAG or password stops the deploy", async () => {
  for (const v of ["TAG", vars.find((x) => /PASSWORD/.test(x))].filter(Boolean)) {
    const rest = Object.fromEntries(Object.entries(dummy).filter(([k]) => k !== v));
    const r = await compose(rest, "--format", "json");
    if (r.code === 0) throw new Error(`without ${v}, Compose still runs: use \${${v}:?message}`);
  }
});
await check("4. no secret written in the file", async () => {
  for (const n of NAMES) {
    for (const [k, v] of Object.entries(raw.services[n]?.environment ?? {})) {
      if (/PASSWORD|SECRET|TOKEN|_KEY$|DATABASE_URL/.test(k) && v !== null && !String(v).includes("${")) throw new Error(`${n}.${k} is written in the file: "${v}"`);
    }
  }
});

console.log(`\n${bold("What the internet and the containers can reach")}`);
await check("5. only the proxy publishes ports, only 80 and 443", async () => {
  for (const n of NAMES) {
    const ports = S[n]?.ports ?? [];
    if (n !== "proxy" && ports.length) throw new Error(`${n} publishes ${ports.map((p) => p.published).join(", ")}: Docker's ports bypass ufw`);
    if (n === "proxy") { const pub = ports.map((p) => `${p.published}:${p.target}`).sort(); if (JSON.stringify(pub) !== JSON.stringify(["443:443", "80:80"])) throw new Error(`proxy publishes ${pub.join(", ") || "nothing"}`); }
  }
});
await check("6. only the worker gets the Docker socket", async () => {
  for (const n of NAMES) {
    const sock = (S[n]?.volumes ?? []).some((v) => /docker\.sock/.test(v.source ?? ""));
    if (sock && n !== "worker") throw new Error(`${n} mounts the Docker socket: that's root on the host`);
    if (!sock && n === "worker") throw new Error("the worker needs the socket to start runner containers");
  }
});
await check("7. postgres and redis share no network with the proxy", async () => {
  const nets = (n) => Object.keys(S[n]?.networks ?? { default: null });
  const edge = new Set(nets("proxy"));
  for (const n of ["postgres", "redis"]) { const shared = nets(n).filter((x) => edge.has(x)); if (shared.length) throw new Error(`${n} and proxy share "${shared.join(", ")}"`); }
});

console.log(`\n${bold("Running for months")}`);
await check("8. services restart; migrate runs once", async () => {
  for (const n of NAMES) {
    const r = S[n]?.restart ?? "no";
    if (n === "migrate") { if (r !== "no") throw new Error(`migrate restarts (${r}): a migration that fails must stay failed, and visible`); }
    else if (!["unless-stopped", "always"].includes(r)) throw new Error(`${n} restart policy: ${r}`);
  }
});
await check("9. health checks on postgres, redis and api", async () => {
  for (const n of ["postgres", "redis", "api"]) { const h = S[n]?.healthcheck; if (!h || h.disable || !h.test) throw new Error(`${n} has no health check`); }
});
await check("10. start order: healthy data, finished migration", async () => {
  for (const n of ["api", "worker"]) {
    const d = S[n]?.depends_on ?? {};
    for (const [dep, cond] of [["postgres", "service_healthy"], ["redis", "service_healthy"], ["migrate", "service_completed_successfully"]]) {
      if (d[dep]?.condition !== cond) throw new Error(`${n} → ${dep}: expected condition ${cond}, got ${d[dep]?.condition ?? "none"}`);
    }
  }
  if (S.migrate?.depends_on?.postgres?.condition !== "service_healthy") throw new Error("migrate must wait for a healthy postgres");
});
await check("11. postgres data in a named volume", async () => {
  const v = (S.postgres?.volumes ?? []).find((x) => x.target === "/var/lib/postgresql/data");
  if (!v) throw new Error("postgres has no volume for /var/lib/postgresql/data: the data dies with the container");
  if (v.type !== "volume") throw new Error(`it's a ${v.type} mount of ${v.source}; use a named volume Docker manages`);
});
await check("12. every service rotates its logs", async () => {
  for (const n of NAMES) { const l = S[n]?.logging; if (!l?.options?.["max-size"]) throw new Error(`${n}'s logs grow forever: set logging.options.max-size (an x- anchor saves repeating it)`); }
});
await check("13. the worker has a memory limit", async () => {
  const w = S.worker ?? {}; const lim = w.mem_limit ?? w.deploy?.resources?.limits?.memory;
  if (!lim) throw new Error("no memory limit: a leak in the worker can take the whole VM down");
  return `limit: ${lim}`;
});
await check("14. .env.prod.example lists every variable", async () => {
  if (!existsSync(".env.prod.example")) throw new Error("no .env.prod.example");
  const listed = new Set(readFileSync(".env.prod.example", "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => l.split("=")[0].trim()));
  const missing = vars.filter((v) => !listed.has(v)); if (missing.length) throw new Error(`missing: ${missing.join(", ")}`);
  const filled = readFileSync(".env.prod.example", "utf8").split("\n").filter((l) => /^[A-Z_]+=\S/.test(l.trim()) && /PASSWORD|SECRET|TOKEN|KEY/.test(l));
  if (filled.length) throw new Error(`an example with real-looking secrets: ${filled.map((l) => l.split("=")[0]).join(", ")}`);
});

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0022.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
