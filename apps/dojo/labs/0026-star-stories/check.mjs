// Lesson 0026 checker: six STAR stories, read the way an interviewer listens.
import { readFileSync } from "node:fs";
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
const PARTS = ["Situation", "Task", "Action", "Result", "Learned"];
const FILLER = ["basically", "kind of", "sort of", "stuff", "things like that", "a lot of", "very"];
const WPM = 150;
const words = (s) => (s.match(/[A-Za-z0-9’'%.,-]+/g) ?? []).filter((w) => /[A-Za-z0-9]/.test(w));

const text = readFileSync("stories.md", "utf8").replace(/<!--[\s\S]*?-->/g, "");
const blocks = text.split(/^## /m).slice(1).map((b) => { const nl = b.indexOf("\n"); return { title: b.slice(0, nl).trim(), body: b.slice(nl + 1) }; });
const stories = blocks.filter((b) => /^[1-6]\./.test(b.title));
let passed = 0, failed = 0;
const rows = [];

console.log();
if (stories.length !== 6) { console.log(red(`Expected stories "## 1." to "## 6.", found ${stories.length}.`)); process.exit(1); }
if (blocks.some((b) => /^Example/i.test(b.title))) console.log(dim("(The example is still in the file: it isn't checked. Delete it when you're done with it.)\n"));

for (const s of stories) {
  const problems = [];
  const found = [...s.body.matchAll(/\*\*(\w+):\*\*/g)].map((m) => ({ name: m[1], index: m.index, end: m.index + m[0].length }));
  const names = found.map((f) => f.name);
  const part = {};
  if (JSON.stringify(names) !== JSON.stringify(PARTS)) problems.push(`parts are ${names.join(", ") || "missing"}; expected ${PARTS.join(", ")}`);
  else found.forEach((f, i) => { part[f.name] = s.body.slice(f.end, found[i + 1]?.index ?? s.body.length).trim(); });
  const empty = PARTS.filter((p) => names.includes(p) && !words(part[p] ?? "").length);
  if (empty.length) problems.push(`empty: ${empty.join(", ")}`);
  const all = PARTS.map((p) => part[p] ?? "").join(" ");
  const n = words(all).length, secs = Math.round((n / WPM) * 60);
  if (!empty.length && names.length === 5) {
    if (n > 225) problems.push(`${n} words, about ${secs} s out loud: cut to 225 (90 s)`);
    if (n < 115) problems.push(`${n} words, about ${secs} s: too thin to show what you did`);
    const share = (p) => words(part[p]).length / n;
    if (share("Action") < 0.4) problems.push(`the Action is ${Math.round(share("Action") * 100)}% of the story; make it at least 40%: it's what you're hired for`);
    if (share("Situation") + share("Task") > 0.3) problems.push(`Situation and Task take ${Math.round((share("Situation") + share("Task")) * 100)}%: set the scene in 30% or less`);
    const I = (part.Action.match(/\bI\b/g) ?? []).length, we = (part.Action.match(/\b[Ww]e\b/g) ?? []).length;
    if (I < 3 || I <= we) problems.push(`in the Action, "I" ${I}× and "we" ${we}×: say what you did`);
    const NUMBER = /\d|\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|hundred|thousand|million|half|twice|double|triple|percent)\b/i;
    if (!NUMBER.test(part.Result)) problems.push("the Result has no number: how much faster, how many users, how many bugs?");
    const lower = all.toLowerCase();
    const fill = FILLER.filter((f) => new RegExp(`\\b${f}\\b`).test(lower));
    if (fill.length) problems.push(`filler: ${fill.map((f) => `"${f}"`).join(", ")}`);
  }
  rows.push({ title: s.title, n, secs });
  if (problems.length) { failed++; console.log(`  ${red("✗")} ${s.title.padEnd(30)} ${dim(`${n} words, ~${secs} s`)}`); for (const p of problems) console.log(`      ${p}`); }
  else { passed++; console.log(`  ${green("✓")} ${s.title.padEnd(30)} ${dim(`${n} words, ~${secs} s`)}`); }
}
const total = rows.reduce((a, r) => a + r.secs, 0);
console.log(dim(`\n  All six out loud: about ${Math.floor(total / 60)} min ${total % 60} s. Now read them with a real timer.`));
console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} stories pass.`))} Tell your teacher: done 0026.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} to rework`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
