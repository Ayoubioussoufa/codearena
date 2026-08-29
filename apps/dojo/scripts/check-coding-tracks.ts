/**
 * Verify every coding TRACK (the /coding ladders) the way fuzz-generators.ts
 * verifies quiz topics: each task's model solution must pass its own grader,
 * every starter and empty submission must fail, and starter !== solution. This
 * catches a broken judge or a solution that drifted from its checks.
 *
 *   pnpm test:coding
 */
import { CODING_TRACKS } from "../src/lib/engine/coding";
import { Rng } from "../src/lib/engine/rng";

const failures: string[] = [];

async function gradeCode(
  ex: { starter: string; solution: string; grade: (c: string) => Promise<{ passed: boolean; results: { label: string; passed: boolean; detail?: string }[] }> },
  id: string,
) {
  if (ex.starter === ex.solution) failures.push(`[${id}] starter === solution`);
  const solved = await ex.grade(ex.solution);
  if (!solved.passed) {
    const bad = solved.results
      .filter((r) => !r.passed)
      .map((r) => `${r.label}${r.detail ? " — " + r.detail : ""}`);
    failures.push(`[${id}] SOLUTION FAILS: ${bad.join(" | ")}`);
  }
  if ((await ex.grade("")).passed) failures.push(`[${id}] empty passes`);
  if ((await ex.grade(ex.starter)).passed) failures.push(`[${id}] starter passes`);
}

async function main() {
  let checked = 0;
  for (const track of CODING_TRACKS) {
    for (const { gen } of track.exercises) {
      const ex = gen.generate(new Rng(12345));
      const id = `${track.id}/${gen.id}`;
      checked++;
      if (ex.kind === "code") {
        await gradeCode(ex, id);
      } else if (ex.kind === "multi-file") {
        for (const f of ex.files) {
          if (f.starter === f.solution) failures.push(`[${id}:${f.name}] starter === solution`);
          const solved = await ex.gradeFile(f.name, f.solution);
          if (!solved.passed) {
            const bad = solved.results.filter((r) => !r.passed).map((r) => r.label);
            failures.push(`[${id}:${f.name}] SOLUTION FAILS: ${bad.join(" | ")}`);
          }
        }
        const whole = await ex.grade(Object.fromEntries(ex.files.map((f) => [f.name, f.solution])));
        if (!whole.passed) failures.push(`[${id}] whole-exercise solution fails`);
      } else {
        failures.push(`[${id}] unexpected kind in a coding track: ${ex.kind}`);
      }
    }
  }

  console.log(`Checked ${checked} coding-track tasks across ${CODING_TRACKS.length} tracks.`);
  if (failures.length > 0) {
    console.error(`\n${failures.length} FAILURES:`);
    for (const f of failures) console.error("  " + f);
    process.exit(1);
  }
  console.log("All coding-track solutions pass their own graders. ✓");
}

void main();
