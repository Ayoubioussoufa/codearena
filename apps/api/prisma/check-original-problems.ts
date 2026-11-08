import { originalProblems } from './seed-data/original';
import { runProgram } from './seed-data/original/run-program';
import { OriginalProblem } from './seed-data/original/types';

const MIN_TESTS = 10;
const tokens = (text: string) => text.split(/\s+/).filter(Boolean);
const sameTokens = (a: string, b: string) =>
  tokens(a).join(' ') === tokens(b).join(' ');

function check(problem: OriginalProblem): string[] {
  const { slug, examples, timeLimitMs } = problem;
  const failures: string[] = [];
  const generated = problem.generatedInputs();
  const inputs = [...examples.map((example) => example.input), ...generated];

  if (inputs.length < MIN_TESTS) {
    failures.push(`only ${inputs.length} tests, need ${MIN_TESTS}`);
  }
  if (timeLimitMs <= 0) failures.push('no time limit');

  // Outputs worked out by hand: this is what catches a wrong solution.
  for (const example of examples) {
    const { output } = runProgram(slug, 'solution.js', example.input);
    if (!sameTokens(output, example.output)) {
      failures.push(`example gives ${output.trim()}, not ${example.output}`);
    }
  }

  // Two different algorithms that agree are very unlikely to share a bug.
  for (const input of inputs.slice(0, -1)) {
    const fast = runProgram(slug, 'solution.js', input).output;
    const slow = runProgram(slug, 'brute.js', input).output;
    if (!sameTokens(fast, slow)) {
      failures.push(
        `solution and brute force disagree on: ${input.slice(0, 40)}`,
      );
    }
  }

  const killer = inputs[inputs.length - 1]!;
  const fast = runProgram(slug, 'solution.js', killer);
  const slow = runProgram(slug, 'brute.js', killer, timeLimitMs * 5);
  console.log(
    `${slug}: ${inputs.length} tests, limit ${timeLimitMs} ms, ` +
      `solution ${fast.timeMs} ms, brute ${slow.timedOut ? `over ${timeLimitMs * 5} ms` : `${slow.timeMs} ms`}, ` +
      `test ${inputs.length} kills O(n²)`,
  );
  if (fast.timeMs * 2 > timeLimitMs) {
    failures.push(`solution took ${fast.timeMs} ms, too close to the limit`);
  }
  if (!slow.timedOut && slow.timeMs < timeLimitMs) {
    failures.push(`brute force took ${slow.timeMs} ms and fits in the limit`);
  }
  return failures;
}

const failures = originalProblems.flatMap((problem) =>
  check(problem).map((failure) => `${problem.slug}: ${failure}`),
);
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('All original problems pass.');
