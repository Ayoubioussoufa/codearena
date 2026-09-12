/**
 * Every model answer must pass its own checks, and every starter must fail.
 *
 * A check that fails its own solution is broken and will frustrate the learner
 * into thinking correct code is wrong. A starter that already passes means the
 * exercise asks for nothing.
 *   pnpm test:guide-exercises
 */
import fs from "node:fs";
import path from "node:path";
import { allGuideExercises, exercisesForGuide } from "../src/lib/guide-exercises";
import { REPO_ROOT } from "../src/lib/repo";

function runStatic(code: string, checks: { re: string; flags?: string; expect?: boolean; label: string }[]) {
  return checks.map((c) => ({
    label: c.label,
    passed: new RegExp(c.re, c.flags ?? "m").test(code) === (c.expect ?? true),
  }));
}

let failures = 0;
let total = 0;

for (const { guide, exercise } of allGuideExercises()) {
  total++;

  if (exercise.checks.length === 0) {
    console.log(`❌ ${guide}:${exercise.id} — has no checks`);
    failures++;
    continue;
  }

  const onSolution = runStatic(exercise.solution, exercise.checks);
  const broken = onSolution.filter((r) => !r.passed);
  if (broken.length) {
    failures++;
    console.log(`❌ ${guide}:${exercise.id} — model answer fails its own checks:`);
    for (const b of broken) console.log(`     · ${b.label}`);
  }

  const onStarter = runStatic(exercise.starter, exercise.checks);
  if (onStarter.every((r) => r.passed)) {
    failures++;
    console.log(`❌ ${guide}:${exercise.id} — the STARTER already passes; exercise asks nothing`);
  }
}

/* Every ```exercise fence must resolve, and every definition must be used —
   otherwise a rename silently leaves a broken box in the middle of a guide. */
const GUIDE_DIR = path.join(REPO_ROOT, "apps/dojo/content/supplements");
for (const guide of new Set(allGuideExercises().map((e) => e.guide))) {
  const file = path.join(GUIDE_DIR, `${guide}.md`);
  if (!fs.existsSync(file)) {
    console.log(`❌ ${guide} — has exercises but no guide file`);
    failures++;
    continue;
  }
  const md = fs.readFileSync(file, "utf8");
  const used = [...md.matchAll(/```exercise\n([\s\S]*?)```/g)].map((m) => (m[1] ?? "").trim());
  const defined = exercisesForGuide(guide).map((e) => e.id);

  for (const id of used) {
    if (!defined.includes(id)) {
      console.log(`❌ ${guide}.md references "${id}", which is not defined`);
      failures++;
    }
  }
  for (const id of defined) {
    if (!used.includes(id)) {
      console.log(`❌ ${guide}:${id} is defined but never placed in the guide`);
      failures++;
    }
  }
  const dupes = used.filter((id, i) => used.indexOf(id) !== i);
  for (const id of new Set(dupes)) {
    console.log(`❌ ${guide}.md places "${id}" more than once`);
    failures++;
  }
}

console.log(
  failures === 0
    ? `\n${total} guide exercises — model answers pass, starters fail, every id resolves. ✓`
    : `\n${failures} problem(s) across ${total} exercises.`,
);
process.exit(failures === 0 ? 0 : 1);
