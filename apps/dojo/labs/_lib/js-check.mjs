// Shared checker kit for the JavaScript labs: load the learner's file, run
// named cases (sync or async), print ✓/✗ with a reason, exit 0 only if all pass.
import { existsSync } from "node:fs";
import path from "node:path";

const tty = process.stdout.isTTY;
const paint = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
export const green = paint(32), red = paint(31), dim = paint(2), bold = paint(1);

let passed = 0, failed = 0;
const pad = (s) => s.padEnd(56);

/** Imports the lab file, or explains how to start and exits. */
export async function load(dir, file, start) {
  const full = path.join(dir, file);
  if (!existsSync(full)) {
    console.log(`No ${file} yet. Start with: cp ${start} ${file}`);
    process.exit(1);
  }
  return import(full);
}

export function section(title) {
  console.log(`\n${bold(title)}`);
}

/** One case: returns an optional note on success, throws to fail. */
export async function check(label, fn) {
  try {
    const note = await fn();
    passed++;
    console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`);
  } catch (e) {
    failed++;
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  ${red("✗")} ${pad(label)} ${msg === "Not written yet." ? dim("not written yet") : msg}`);
  }
}

export function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

export const show = (v) => JSON.stringify(v, (_, x) => (typeof x === "number" ? Number(x.toFixed(4)) : x));

export function eq(got, want, what) {
  if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}: expected ${show(want)}, got ${show(got)}`);
}

export function near(got, want, what, tol = 1e-4) {
  if (typeof got !== "number" || !Number.isFinite(got) || Math.abs(got - want) > tol)
    throw new Error(`${what}: expected ≈${Number(want.toFixed(4))}, got ${typeof got === "number" ? Number(got.toFixed(6)) : show(got)}`);
}

export function nearAll(got, want, what, tol = 1e-4) {
  assert(Array.isArray(got) && got.length === want.length, `${what}: expected ${want.length} numbers, got ${show(got)}`);
  want.forEach((w, i) => near(got[i], w, `${what}[${i}]`, tol));
}

export async function throwsWith(fn, ...parts) {
  let err;
  try {
    await fn();
  } catch (e) {
    err = e;
  }
  assert(err, "expected an error, nothing was thrown");
  const msg = String(err?.message ?? err);
  if (msg === "Not written yet.") throw err;
  for (const p of parts) assert(msg.toLowerCase().includes(p.toLowerCase()), `the error should mention "${p}", got: ${msg}`);
  return msg;
}

export function finish() {
  const total = passed + failed;
  console.log(`\n${failed === 0 ? green(`All ${total} cases pass.`) : `${passed}/${total} pass. ${red(`${failed} to go.`)}`}\n`);
  process.exit(failed === 0 ? 0 : 1);
}
