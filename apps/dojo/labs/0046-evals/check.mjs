// Lesson 0046 checker: every rule gets a hint that passes it and one that fails it.
import { load, section, check, assert, eq, near, finish } from "../_lib/js-check.mjs";

const g = await load(import.meta.dirname, "graders.mjs", "graders.start.mjs");

const SOLUTION = "const xs = read();\nlet total = 0;\nfor (let i = 0; i < xs.length; i++) total += xs[i];\nconsole.log(total);";
const kase = { id: "sum-off-by-one", verdict: "WRONG_ANSWER", solution: SOLUTION };
const yes = (v, what) => assert(v === true, `${what}: expected true, got ${v}`);
const no = (v, what) => assert(v === false, `${what}: expected false, got ${v}`);

section("The rules");
await check("validShape", () => {
  yes(g.validShape({ hint: "Look at where your loop starts.", concept: "off-by-one" }), "a good output");
  no(g.validShape({ hint: "  ", concept: "x" }), "a blank hint");
  no(g.validShape({ hint: "ok" }), "no concept");
  no(g.validShape(null), "null");
  no(g.validShape("Look at your loop."), "a plain string");
});
await check("maxSentences", () => {
  yes(g.maxSentences("Your loop starts at 1. The first number is never added.", 3), "2 sentences, max 3");
  no(g.maxSentences("One. Two! Three? Four.", 3), "4 sentences, max 3");
  no(g.maxSentences("One. Two. Three. and a fourth without a full stop", 3), "3 + a trailing fragment");
  yes(g.maxSentences("Check xs.length in your loop. It is fine.", 2), "a dot inside a word isn't an ending");
});
await check("noLongCode", () => {
  yes(g.noLongCode("Look at `i = 1`.", 2), "inline code only");
  yes(g.noLongCode("Compare:\n```\nfor (let i = 1;\n```", 2), "a one-line block");
  no(g.noLongCode("Try:\n```js\nlet t = 0;\nfor (const x of xs) t += x;\nconsole.log(t);\n```", 2), "a 3-line block");
});
await check("noSolutionLeak", () => {
  yes(g.noSolutionLeak("Where does your loop start? The first number is skipped.", SOLUTION), "no solution line");
  no(g.noSolutionLeak("Write: for (let i = 0; i < xs.length; i++) total += xs[i];", SOLUTION), "a whole solution line");
  no(g.noSolutionLeak("for(let i=0;i<xs.length;i++)   total+=xs[i];", SOLUTION), "the same line, re-spaced");
  yes(g.noSolutionLeak("Start with s = 0; then add each number.", "s = 0;\nconsole.log(total + 1);"), "short lines (< 12 chars) don't count");
});
await check("namesVerdict", () => {
  yes(g.namesVerdict("Your output is incorrect for the first test.", "WRONG_ANSWER"), "WRONG_ANSWER / incorrect");
  yes(g.namesVerdict("This is too slow: two nested loops over 10^5 items.", "TIME_LIMIT"), "TIME_LIMIT / too slow");
  yes(g.namesVerdict("Your array uses too much Memory.", "MEMORY_LIMIT"), "case-insensitive");
  no(g.namesVerdict("Look at the loop bound.", "WRONG_ANSWER"), "says nothing about the failure");
  no(g.namesVerdict("This is too slow.", "WRONG_ANSWER"), "names the wrong failure");
});

section("A case, then the whole set");
await check("gradeCase runs every rule", () => {
  const ok = g.gradeCase({ hint: "Wrong answer: the loop starts at 1, so the first number is never added.", concept: "off-by-one" }, kase);
  eq(ok, { validShape: true, maxSentences: true, noLongCode: true, noSolutionLeak: true, namesVerdict: true, pass: true }, "a good hint");
  const leak = g.gradeCase({ hint: "Wrong answer. Use for (let i = 0; i < xs.length; i++) total += xs[i];", concept: "loops" }, kase);
  eq([leak.noSolutionLeak, leak.pass], [false, false], "a leaking hint: [noSolutionLeak, pass]");
});
await check("an invalid shape fails everything", () => {
  const r = g.gradeCase({ text: "Wrong answer." }, kase);
  eq(r, { validShape: false, maxSentences: false, noLongCode: false, noSolutionLeak: false, namesVerdict: false, pass: false }, "result");
});
const R = (pass, over = {}) => ({ validShape: true, maxSentences: true, noLongCode: true, noSolutionLeak: true, namesVerdict: true, ...over, pass });
const runs = [
  { caseId: "a", result: R(true) }, { caseId: "a", result: R(true) }, { caseId: "a", result: R(true) },
  { caseId: "b", result: R(true) }, { caseId: "b", result: R(false, { namesVerdict: false }) }, { caseId: "b", result: R(true) },
  { caseId: "c", result: R(false, { noSolutionLeak: false }) }, { caseId: "c", result: R(false, { noSolutionLeak: false, maxSentences: false }) }, { caseId: "c", result: R(false, { noSolutionLeak: false }) },
];
await check("summarize: the score, per rule", () => {
  const s = g.summarize(runs);
  near(s.score, 5 / 9, "score");
  near(s.perRule.noSolutionLeak, 6 / 9, "perRule.noSolutionLeak");
  near(s.perRule.namesVerdict, 8 / 9, "perRule.namesVerdict");
  near(s.perRule.validShape, 1, "perRule.validShape");
  return `score ${(s.score * 100).toFixed(0)}%`;
});
await check("summarize: the flaky cases", () => {
  eq(g.summarize([...runs, { caseId: "d", result: R(false) }, { caseId: "d", result: R(true) }]).flaky, ["b", "d"], "flaky");
});
await check("gate", () => {
  yes(g.gate({ score: 0.8 }, 0.8), "0.8 against 0.8");
  no(g.gate({ score: 0.79 }, 0.8), "0.79 against 0.8");
});

finish();
