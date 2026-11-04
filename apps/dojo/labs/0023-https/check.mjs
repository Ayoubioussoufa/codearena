// Lesson 0023 checker: your certificates, read with openssl, then used for real TLS.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import https from "node:https";
import tls from "node:tls";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(56);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const ossl = (...args) => execFileSync("openssl", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const text = (f) => ossl("x509", "-in", f, "-noout", "-text");
const files = ["ca.key", "ca.crt", "server.key", "server.csr", "server.crt"].map((f) => `out/${f}`);

console.log(`\n${bold("The files")}`);
await check("all five exist", async () => { const missing = files.filter((f) => !existsSync(f)); if (missing.length) throw new Error(`missing: ${missing.join(", ")}`); });
await check("private keys are readable by you only", async () => {
  for (const f of ["out/ca.key", "out/server.key"]) { const mode = (statSync(f).mode & 0o777).toString(8); if (mode !== "600") throw new Error(`${f} has mode ${mode}`); }
});

console.log(`\n${bold("Read with openssl")}`);
await check("the CA is a CA, and signed itself", async () => {
  const t = text("out/ca.crt");
  if (!/CA:TRUE/.test(t)) throw new Error("ca.crt has no basicConstraints CA:TRUE: nothing will accept it as an issuer");
  const subj = ossl("x509", "-in", "out/ca.crt", "-noout", "-subject").replace("subject=", "").trim();
  const iss = ossl("x509", "-in", "out/ca.crt", "-noout", "-issuer").replace("issuer=", "").trim();
  if (subj !== iss) throw new Error("ca.crt isn't self-signed");
  return subj;
});
await check("the server certificate is not a CA", async () => { if (/CA:TRUE/.test(text("out/server.crt"))) throw new Error("server.crt says CA:TRUE: whoever holds server.key could sign certificates for any site"); });
await check("signed by your CA: openssl verify", async () => {
  try { return ossl("verify", "-CAfile", "out/ca.crt", "out/server.crt").trim(); } catch (e) { throw new Error(String(e.stderr || e.message).trim().split("\n").pop()); }
});
await check("names in the subject alternative name", async () => {
  const t = text("out/server.crt");
  const san = /X509v3 Subject Alternative Name:[^\n]*\n\s*([^\n]+)/.exec(t)?.[1] ?? "";
  for (const n of ["codearena.test", "www.codearena.test"]) if (!san.split(/,\s*/).includes(`DNS:${n}`)) throw new Error(`SAN is "${san || "missing"}": it needs DNS:${n}. Browsers ignore the CN.`);
  return san;
});
await check("for TLS servers, valid 90 days at most", async () => {
  const t = text("out/server.crt");
  if (!/TLS Web Server Authentication/.test(t)) throw new Error("no extendedKeyUsage serverAuth");
  const nb = new Date(/Not Before: (.+)/.exec(t)[1]), na = new Date(/Not After : (.+)/.exec(t)[1]);
  const days = Math.round((na - nb) / 86400000);
  if (days > 90) throw new Error(`valid ${days} days`);
  if (Date.now() < nb.getTime() || Date.now() > na.getTime()) throw new Error("not valid right now");
  return `${days} days, like Let's Encrypt`;
});
await check("a strong enough key", async () => {
  const t = text("out/server.crt");
  const rsa = /Public-Key: \((\d+) bit\)/.exec(t);
  if (/id-ecPublicKey/.test(t)) { if (!/prime256v1|P-256|secp384r1|P-384/.test(t)) throw new Error("an unusual curve"); return "EC"; }
  if (!rsa || Number(rsa[1]) < 2048) throw new Error(`RSA ${rsa?.[1] ?? "?"} bits`);
  return `RSA ${rsa[1]}`;
});
await check("the CSR matches the server key", async () => {
  const a = ossl("req", "-in", "out/server.csr", "-noout", "-pubkey"), b = ossl("pkey", "-in", "out/server.key", "-pubout");
  if (a.trim() !== b.trim()) throw new Error("server.csr wasn't made from server.key");
  const cpub = ossl("x509", "-in", "out/server.crt", "-noout", "-pubkey");
  if (cpub.trim() !== b.trim()) throw new Error("server.crt doesn't certify server.key");
});

console.log(`\n${bold("Real TLS, like a browser")}`);
let server;
try { server = https.createServer({ key: readFileSync("out/server.key"), cert: readFileSync("out/server.crt") }, (req, res) => res.end("hello over TLS")); }
catch (e) {
  failed += 5;
  console.log(`  ${red("✗")} ${pad("the TLS server can't even start")} ${e.code ?? ""}: ${e.reason ?? e.message}. Node's OpenSSL refuses this key or certificate.`);
}
if (server) {
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const get = (opts) => new Promise((resolve) => {
  const req = https.request({ host: "127.0.0.1", port, path: "/", agent: false, ...opts }, (res) => { let b = ""; res.on("data", (d) => (b += d)); res.on("end", () => resolve({ ok: true, body: b })); });
  req.on("error", (e) => resolve({ ok: false, code: e.code ?? e.message })); req.end();
});
const ca = readFileSync("out/ca.crt");
await check("trusting your CA, for codearena.test: it works", async () => {
  const r = await get({ ca, servername: "codearena.test" }); if (!r.ok) throw new Error(r.code); return `"${r.body}"`;
});
await check("…and for www.codearena.test", async () => { const r = await get({ ca, servername: "www.codearena.test" }); if (!r.ok) throw new Error(r.code); });
await check("without your CA: refused", async () => {
  const r = await get({ servername: "codearena.test" }); if (r.ok) throw new Error("the connection was trusted without your CA");
  return r.code;
});
await check("the wrong hostname: refused", async () => {
  const r = await get({ ca, servername: "bank.test", checkServerIdentity: (h, cert) => tls.checkServerIdentity("bank.test", cert) });
  if (r.ok) throw new Error("a certificate for codearena.test was accepted for bank.test"); return r.code;
});
await check("someone else's CA: refused", async () => {
  const d = mkdtempSync(join(tmpdir(), "lab23-"));
  try {
    ossl("req", "-x509", "-newkey", "ec", "-pkeyopt", "ec_paramgen_curve:P-256", "-nodes", "-keyout", join(d, "k"), "-out", join(d, "c"), "-days", "1", "-subj", "/CN=Other CA");
    const r = await get({ ca: readFileSync(join(d, "c")), servername: "codearena.test" }); if (r.ok) throw new Error("trusted through a CA that never signed it"); return r.code;
  } finally { rmSync(d, { recursive: true, force: true }); }
});
server.close();
}

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0023.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
