/**
 * Verify every DSA problem: its reference solution must pass all its own tests,
 * the starter must NOT pass, slugs unique, metadata present. This is what lets
 * us trust ~40 hand-written algorithms.
 *   pnpm test:dsa
 */
import { DSA_CATEGORIES } from "../src/lib/dsa/registry";
import { runTestsSync } from "../src/lib/engine/run-js";
import type { FnTest, FnTestResult, Harness } from "../src/lib/engine/run-js";

let checked = 0;
const failures: string[] = [];
const slugs = new Set<string>();

/**
 * Reconstruct runTestsSync from its source in an isolated scope — exactly how
 * the Web Worker gets it. If the function secretly references a module-level
 * binding, this copy throws and the worker path would be broken in the browser.
 */
const workerRunTests = new Function(
  "__name",
  `return (${runTestsSync.toString()})`,
)((f: unknown) => f) as (
  code: string,
  fnName: string,
  tests: FnTest[],
  harness?: Harness,
) => FnTestResult[];

for (const category of DSA_CATEGORIES) {
  for (const p of category.problems) {
    checked++;
    const id = `${category.id}/${p.slug}`;

    if (slugs.has(p.slug)) failures.push(`${id}: duplicate slug`);
    slugs.add(p.slug);
    if (p.category !== category.id) failures.push(`${id}: category mismatch (${p.category})`);
    if (p.statement.join("").length < 20) failures.push(`${id}: statement too short`);
    if (p.approach.length < 60) failures.push(`${id}: approach too short`);
    if (p.examples.length === 0) failures.push(`${id}: no examples`);
    if (p.tests.length < 3) failures.push(`${id}: fewer than 3 tests`);
    if (!p.starter.includes(p.fnName)) failures.push(`${id}: starter missing fnName`);
    if (!p.solution.includes(p.fnName)) failures.push(`${id}: solution missing fnName`);

    // Reference solution must pass every test — run through the ISOLATED copy
    // so a worker-only breakage (module-level reference) fails here too.
    const solved = workerRunTests(p.solution, p.fnName, p.tests, p.harness);
    const failedTests = solved.filter((r) => !r.passed);
    if (failedTests.length > 0) {
      failures.push(
        `${id}: SOLUTION FAILS ${failedTests.length}/${p.tests.length} — ` +
          failedTests.map((f) => `${f.label}${f.detail ? ` (${f.detail})` : ""}`).join("; "),
      );
    }

    // Empty starter body must NOT pass (otherwise the problem is trivially solved).
    const starterResult = runTestsSync(p.starter, p.fnName, p.tests, p.harness);
    if (starterResult.every((r) => r.passed)) {
      failures.push(`${id}: starter already passes — no work to do`);
    }
  }
}

console.log(`Checked ${checked} DSA problems across ${DSA_CATEGORIES.length} categories.`);
if (failures.length > 0) {
  console.error(`\n${failures.length} FAILURES:`);
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
console.log("Every reference solution passes its own tests. ✓");
