/**
 * Fuzz every exercise generator: many seeds each, asserting the invariants
 * the session UI and grader depend on. Code exercises additionally verify
 * that the MODEL SOLUTION passes its own grader and an empty answer fails.
 * Run from apps/dojo:
 *
 *   pnpm test:generators
 */
import { TOPICS } from "../src/lib/engine/registry";
import { Rng } from "../src/lib/engine/rng";

const KNOWN_SLUGS = new Set([
  "phase-0-foundations",
  "phase-1-auth-data-frontend",
  "phase-2-execution-sandboxing",
  "phase-3-rating-mastery-math",
  "phase-4-recommendation-engine",
  "phase-5-contests-cqrs-leaderboard",
  "phase-6-analytics-anticheat-observability",
  "react-fundamentals",
  "tailwind-responsive-design",
  "system-design-fundamentals",
  "interview-playbook",
  "aptitude-reasoning",
  "cs-fundamentals",
  "java-spring-boot",
  "morocco-internship-playbook",
  "testing",
  "git-workflow",
  "team-workflow",
  "python",
]);

let checked = 0;
const failures: string[] = [];

function fail(genId: string, seed: number, message: string) {
  if (failures.length < 40) failures.push(`[${genId} seed=${seed}] ${message}`);
  else if (failures.length === 40) failures.push("… (more suppressed)");
}

async function main() {
  for (const topic of TOPICS) {
    for (const gen of topic.generators) {
      const isCode = gen.id.includes("-code");
      const iterations = isCode ? 25 : 400;
      for (let i = 0; i < iterations; i++) {
        const seed = ((i + 1) * 2654435761) ^ (topic.id.length * 97 + i);
        let ex;
        try {
          ex = gen.generate(new Rng(seed));
        } catch (error) {
          fail(gen.id, seed, `generate() threw: ${String(error)}`);
          continue;
        }
        checked++;

        if (ex.genId !== gen.id) fail(gen.id, seed, `genId mismatch: ${ex.genId}`);
        if (ex.prompt.trim().length < 10) fail(gen.id, seed, "prompt too short");
        if (ex.explanation.trim().length < 60) fail(gen.id, seed, "explanation too short");
        if (!KNOWN_SLUGS.has(ex.docRef.slug)) fail(gen.id, seed, `unknown docRef slug: ${ex.docRef.slug}`);

        if (ex.kind === "choice") {
          if (ex.options.length < 3 || ex.options.length > 6) {
            fail(gen.id, seed, `bad option count: ${ex.options.length}`);
          }
          if (new Set(ex.options).size !== ex.options.length) {
            fail(gen.id, seed, `duplicate options: ${JSON.stringify(ex.options)}`);
          }
          if (ex.correctIndex < 0 || ex.correctIndex >= ex.options.length) {
            fail(gen.id, seed, `correctIndex out of range: ${ex.correctIndex}`);
          }
          for (const option of ex.options) {
            if (option.trim().length === 0) fail(gen.id, seed, "empty option");
          }
        } else if (ex.kind === "design") {
          if (ex.minutes <= 0) fail(gen.id, seed, `bad minutes: ${ex.minutes}`);
          if (ex.constraints.length === 0) fail(gen.id, seed, "no constraints");
          if (ex.rubric.length < 3) fail(gen.id, seed, `too few rubric points: ${ex.rubric.length}`);
          if (ex.solution.trim().length < 120) fail(gen.id, seed, "worked solution too short");
          for (const r of ex.rubric) {
            if (r.point.trim().length === 0 || r.detail.trim().length === 0) {
              fail(gen.id, seed, "empty rubric point/detail");
            }
          }
        } else if (ex.kind === "input") {
          if (ex.answer.trim().length === 0) fail(gen.id, seed, "empty canonical answer");
          if (!ex.accept(ex.answer)) {
            fail(gen.id, seed, `canonical answer not accepted by its own grader: "${ex.answer}"`);
          }
          if (ex.accept("definitely-wrong-xyz-123456789")) {
            fail(gen.id, seed, "grader accepts garbage input");
          }
        } else if (ex.kind === "code") {
          if (ex.solution.trim().length === 0) fail(gen.id, seed, "empty model solution");
          if (ex.starter === ex.solution) fail(gen.id, seed, "starter equals solution");
          const solved = await ex.grade(ex.solution);
          if (!solved.passed) {
            const failed = solved.results.filter((r) => !r.passed).map((r) => r.label);
            fail(gen.id, seed, `model solution FAILS its own grader: ${failed.join("; ")}`);
          }
          const empty = await ex.grade("");
          if (empty.passed) fail(gen.id, seed, "empty submission passes the grader");
          const starter = await ex.grade(ex.starter);
          if (starter.passed) fail(gen.id, seed, "unmodified starter passes the grader");
        }
      }
    }
  }

  const generatorCount = TOPICS.reduce((sum, t) => sum + t.generators.length, 0);
  console.log(`Fuzzed ${generatorCount} generators — ${checked} exercises checked.`);
  if (failures.length > 0) {
    console.error(`\n${failures.length} FAILURES:`);
    for (const f of failures) console.error("  " + f);
    process.exit(1);
  }
  console.log("All invariants hold. ✓");
}

void main();
