// Lesson 0009 checker: the token checker and the judge loop, against a scripted fake runner.
import { existsSync } from "node:fs";

const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
if (!existsSync(new URL("./judge.mjs", import.meta.url))) {
  console.log("No judge.mjs yet. Start with: cp judge.start.mjs judge.mjs");
  process.exit(1);
}
const { compareTokens, judge } = await import("./judge.mjs");

let passed = 0, failed = 0;
const pad = (s) => s.padEnd(52);
const ok = (label, note) => { passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note)}`); };
const ko = (label, why) => { failed++; console.log(`  ${red("✗")} ${pad(label)} ${why}`); };

console.log(`\n${bold("compareTokens: whitespace never decides")}`);
const show = (s) => JSON.stringify(s);
for (const [exp, act, want] of [
  ["5\n", "5", true], ["1 2", "1  2", true], ["1 2\n", "1\t2\n\n", true], ["a\r\nb\r\n", "a\nb", true],
  ["", "", true], ["", "\n  \n", true], ["1 2", "1 2 3", false], ["12", "1 2", false],
  ["1.0", "1", false], ["YES", "yes", false], ["1 2 3", "1 3 2", false], ["5", "", false],
]) {
  let got;
  try { got = compareTokens(exp, act); } catch (e) { got = `threw ${e.message}`; }
  const label = `${show(exp)} vs ${show(act)}`;
  if (got === want) ok(label, String(want)); else ko(label, `expected ${want}, got ${got}`);
}

// A scripted fake runner: test i (0-based) returns script[i]; counts its calls.
function fake(script) {
  const f = async (input) => {
    f.calls.push(input);
    const s = script[f.calls.length - 1];
    if (s instanceof Error) throw s;
    return { outcome: "exit", exitCode: 0, stdout: "", timeMs: 10, ...s };
  };
  f.calls = [];
  return f;
}
const tests = (n) => Array.from({ length: n }, (_, i) => ({ input: `in${i + 1}`, expected: `out${i + 1}` }));
const okRun = (i, timeMs = 10) => ({ stdout: `out${i}\n`, timeMs });

async function judged(label, tcs, script, expect) {
  const runOne = fake(script);
  let j, err;
  try { j = await judge(tcs, runOne); } catch (e) { err = e; }
  const problems = expect(j, err, runOne.calls);
  if (problems.length === 0) ok(label, j ? `${j.verdict}${j.failedTest ? " on test " + j.failedTest : ""}, ${j.maxTimeMs} ms` : `rejected: ${err?.message}`);
  else ko(label, problems.join(" · "));
}
const expectJ = (verdict, failedTest, maxTimeMs, calls) => (j, err, seen) => {
  const p = [];
  if (err) return [`rejected: ${err.message}`];
  if (j?.verdict !== verdict) p.push(`verdict: expected ${verdict}, got ${j?.verdict}`);
  if (j?.failedTest !== failedTest) p.push(`failedTest: expected ${failedTest}, got ${j?.failedTest}`);
  if (maxTimeMs !== undefined && j?.maxTimeMs !== maxTimeMs) p.push(`maxTimeMs: expected ${maxTimeMs}, got ${j?.maxTimeMs}`);
  if (calls !== undefined && seen.length !== calls) p.push(`ran ${seen.length} tests, expected ${calls} (stop at the first failure)`);
  return p;
};

console.log(`\n${bold("judge: facts become verdicts")}`);
await judged("three correct tests", tests(3), [okRun(1, 12), okRun(2, 40), okRun(3, 7)], expectJ("AC", null, 40, 3));
await judged("the inputs reach the runner, in order", tests(3), [okRun(1), okRun(2), okRun(3)], (j, err, seen) => (seen.join(",") === "in1,in2,in3" ? [] : [`runner saw ${seen.join(",")}`]));
await judged("a wrong answer on test 2", tests(4), [okRun(1), { stdout: "nope\n" }], expectJ("WA", 2, undefined, 2));
await judged("a timeout on test 3", tests(4), [okRun(1), okRun(2), { outcome: "timeout", exitCode: null, timeMs: 2000 }], expectJ("TLE", 3, 2000, 3));
await judged("the OOM killer on test 1", tests(2), [{ outcome: "memory-limit", exitCode: null }], expectJ("MLE", 1, undefined, 1));
await judged("too much output on test 2", tests(2), [okRun(1), { outcome: "output-limit", exitCode: null }], expectJ("OLE", 2, undefined, 2));
await judged("exit 1 (an uncaught exception)", tests(2), [{ outcome: "exit", exitCode: 1, stdout: "out1\n" }], expectJ("RE", 1, undefined, 1));
await judged("killed by SIGSEGV", tests(2), [{ outcome: "signal", exitCode: null }], expectJ("RE", 1, undefined, 1));
await judged("right output, but a crash: still RE", tests(1), [{ outcome: "exit", exitCode: 139, stdout: "out1\n" }], expectJ("RE", 1));

console.log(`\n${bold("Your failure is not their verdict")}`);
await judged("the runner rejects on test 2 (Docker down)", tests(3), [okRun(1), new Error("docker unreachable")], (j, err) => (err ? [] : [`expected judge() to reject, got a verdict: ${j?.verdict}`]));
await judged("no tests at all", [], [], (j, err) => (err ? [] : [`expected judge() to reject, got ${j?.verdict}`]));

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0009.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
