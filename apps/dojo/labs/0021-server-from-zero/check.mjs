// Lesson 0021 checker: the VM's effective config, then real logins and port probes from another host.
import { execFile } from "node:child_process";
const { VM, NET, IMAGE } = process.env;
if (!VM) { console.log("Run me with: bash check.sh"); process.exit(1); }
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(54);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const run = (cmd, args, timeoutMs = 20000) => new Promise((resolve) => {
  execFile(cmd, args, { timeout: timeoutMs }, (err, stdout, stderr) => resolve({ code: err ? (err.code ?? 1) : 0, out: String(stdout).trim(), err: String(stderr).trim() }));
});
const vm = (sh) => run("docker", ["exec", VM, "sh", "-c", sh]);
/** Runs a command on "the internet": another container on the same network, with your private key. */
const internet = (sh) => run("docker", ["run", "--rm", "--network", NET, "-v", `${process.cwd()}/keys:/keys:ro`, IMAGE, "sh", "-c", `cp /keys/deploy /tmp/k && chmod 600 /tmp/k && ${sh}`], 30000);
const SSH = `ssh -i /tmp/k -o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5 -o LogLevel=ERROR`;

const status = (await vm("cat /tmp/setup.status")).out;
console.log(`\n${bold("Provisioning")}`);
await check("setup.sh ran without errors", async () => {
  if (status !== "ok") throw new Error(`it failed. Its output:\n${(await vm("cat /tmp/setup.log")).out.split("\n").slice(-8).map((l) => `      ${l}`).join("\n")}`);
});
await check("sshd accepts the configuration", async () => {
  const t = await vm("sshd -t 2>&1"); if (t.code !== 0) throw new Error(t.out || "sshd -t failed");
  const alive = await vm("nc -z -w 2 127.0.0.1 22 && echo up"); if (alive.out !== "up") throw new Error(`sshd isn't running: ${(await vm("tail -3 /tmp/sshd.log")).out}`);
});

console.log(`\n${bold("sshd's effective settings (sshd -T)")}`);
const T = Object.fromEntries((await vm("sshd -T 2>/dev/null")).out.split("\n").map((l) => { const i = l.indexOf(" "); return [l.slice(0, i), l.slice(i + 1)]; }));
const want = (key, ok, desc) => check(`${key} ${desc}`, async () => { if (!ok(T[key])) throw new Error(`it's "${T[key] ?? "unset"}"`); });
await want("passwordauthentication", (v) => v === "no", "no");
await want("kbdinteractiveauthentication", (v) => v === "no", "no");
await want("permitrootlogin", (v) => v === "no", "no");
await want("maxauthtries", (v) => Number(v) <= 3, "3 or fewer");
await want("x11forwarding", (v) => v === "no", "no");
await want("allowusers", (v) => v === "deploy", "deploy, and only deploy");

console.log(`\n${bold("The deploy account")}`);
await check("in the admin group, with tight key permissions", async () => {
  const r = await vm(`id -nG deploy; stat -c '%a %U' /home/deploy/.ssh /home/deploy/.ssh/authorized_keys`);
  const [groups, dir, file] = r.out.split("\n");
  if (!groups?.split(" ").includes("wheel")) throw new Error(`deploy's groups: ${groups ?? "no such user"}`);
  if (dir !== "700 deploy") throw new Error(`~/.ssh is "${dir}"; it must be 700, owned by deploy`);
  if (file !== "600 deploy") throw new Error(`authorized_keys is "${file}"; it must be 600, owned by deploy (sshd refuses keys that others can write; 600 is the convention)`);
});

console.log(`\n${bold("From the internet: logins")}`);
await check("deploy logs in with the key", async () => {
  const r = await internet(`${SSH} deploy@${VM} id -un`);
  if (r.out !== "deploy") throw new Error(`login failed: ${r.err || r.out}${(await vm("tail -2 /tmp/sshd.log")).out ? ` · sshd says: ${(await vm("tail -2 /tmp/sshd.log")).out.replace(/\n/g, " | ")}` : ""}`);
});
await check("root can't, even with the provider's key", async () => {
  const r = await internet(`${SSH} root@${VM} id -un`); if (r.code === 0) throw new Error("root logged in");
});
await check("ops can't, though it has the key too", async () => {
  const r = await internet(`${SSH} ops@${VM} id -un`); if (r.code === 0) throw new Error("ops logged in: only deploy should be allowed");
});
await check("passwords aren't even offered", async () => {
  const r = await internet(`ssh -o BatchMode=yes -o PubkeyAuthentication=no -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=5 deploy@${VM} true`);
  const methods = /Permission denied \(([^)]*)\)/.exec(r.err)?.[1];
  if (!methods) throw new Error(`unexpected answer: ${r.err || r.out}`);
  if (methods !== "publickey") throw new Error(`the server offers: ${methods}`);
  return `the server offers: ${methods}`;
});

console.log(`\n${bold("From the internet: ports")}`);
const probe = async (port) => (await internet(`nc -z -w 3 ${VM} ${port} && echo open || echo closed`)).out;
await check("22 and 80 are reachable", async () => { for (const p of [22, 80]) if ((await probe(p)) !== "open") throw new Error(`port ${p} is unreachable`); });
await check("5432 and 6379 are not, though they listen", async () => {
  for (const p of [5432, 6379]) if ((await probe(p)) !== "closed") throw new Error(`port ${p} is reachable from the internet`);
  return "the firewall drops them";
});
await check("ufw: deny incoming by default, SSH rate-limited", async () => {
  const s = (await vm("ufw status verbose")).out;
  if (!/Status: active/.test(s)) throw new Error("ufw isn't active");
  if (!/Default: deny \(incoming\)/.test(s)) throw new Error("the incoming default isn't deny");
  if (!/^22\/tcp\s+LIMIT IN/m.test(s)) throw new Error("22/tcp isn't LIMIT");
  const extra = s.split("\n").filter((l) => /ALLOW IN|LIMIT IN/.test(l) && !/^(22|80|443)\/tcp\b/.test(l));
  if (extra.length) throw new Error(`extra rules: ${extra.map((l) => l.trim().split(/\s+/)[0]).join(", ")}`);
});

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0021.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
