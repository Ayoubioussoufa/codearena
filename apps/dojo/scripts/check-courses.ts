/**
 * Course content checks: every written lesson is complete and consistent.
 *
 *   pnpm test:courses
 *
 * Catches what a reader would trip over: a quiz whose right answer is longer
 * than the others (a giveaway), a broken link, a missing lab, a warm-up
 * pointing at a question that doesn't exist, duplicate step keys.
 */
import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { LESSONS, WEEKS, getLesson } from "../src/lib/courses/catalog";
import { getLessonBody, getReferencePages } from "../src/lib/courses/content";
import { DRILLS, getDrill } from "../src/lib/courses/drills";
import { Rng } from "../src/lib/engine/rng";
import type { QuizQuestion } from "../src/lib/courses/types";
import { allGuideCheckSets, guideQuestionKey } from "../src/lib/guide-checks";
import { guideReviewCounts, guideReviewMessage, lessonQuizLines } from "../src/lib/guide-checks/message";

const DOJO = path.resolve(__dirname, "..");
const problems: string[] = [];
const fail = (where: string, what: string) => problems.push(`${where}: ${what}`);

const words = (s: string) => s.trim().split(/\s+/).length;

/** The markdown file behind a guide slug, wherever the dojo loads it from. */
function guideFile(slug: string): string | undefined {
  const [lang, ...rest] = slug.split("-");
  const candidates = [
    path.join(DOJO, "content/supplements", `${slug}.md`),
    path.join(DOJO, "content/dsa", `${slug}.md`),
    path.join(DOJO, "content/missed", `${slug}.md`),
    path.join(DOJO, "../../docs", `${slug}.md`),
    path.join(DOJO, "content/reference", slug, "README.md"),
    path.join(DOJO, "content/reference", lang ?? "", `${rest.join("-")}.md`),
  ];
  return candidates.find((f) => fs.existsSync(f));
}

/** Every heading anchor of a markdown guide, as the dojo renders it. */
function guideAnchors(slug: string): Set<string> | null {
  const file = guideFile(slug);
  if (!file) return null;
  const slugger = new GithubSlugger();
  const anchors = new Set<string>();
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (m?.[1]) anchors.add(slugger.slug(m[1]));
  }
  return anchors;
}

const referenceSlugs = new Set(getReferencePages().map((p) => p.slug));
const lessonSlugs = new Set(LESSONS.map((l) => l.slug));

function checkLinks(where: string, html: string) {
  for (const [, href] of html.matchAll(/href="(\/[^"]*)"/g)) {
    if (!href) continue;
    const [pathname, anchor] = href.split("#") as [string, string | undefined];
    if (pathname.startsWith("/courses/lessons/")) {
      if (!lessonSlugs.has(pathname.slice("/courses/lessons/".length))) fail(where, `link to a missing lesson: ${href}`);
    } else if (pathname.startsWith("/courses/reference/")) {
      if (!referenceSlugs.has(pathname.slice("/courses/reference/".length))) fail(where, `link to a missing reference: ${href}`);
    } else if (pathname.startsWith("/guides/")) {
      const anchors = guideAnchors(pathname.slice("/guides/".length));
      if (!anchors) fail(where, `link to a missing guide: ${href}`);
      else if (anchor && !anchors.has(anchor)) fail(where, `link to a missing section: ${href}`);
    } else if (!["/courses", "/courses/glossary", "/practice/review", "/guides"].includes(pathname)) {
      fail(where, `unknown internal link: ${href}`);
    }
  }
}

/**
 * The skill's quiz rules, shared by lesson quizzes and guide checks: four
 * options, every option the same number of words and close in length, so
 * neither the count nor the look of an option gives the answer away.
 */
function checkQuestion(qw: string, q: QuizQuestion) {
  if (q.options.length !== 4) fail(qw, `${q.options.length} options, expected 4`);
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length) fail(qw, `correct index ${q.correct} out of range`);
  if (new Set(q.options).size !== q.options.length) fail(qw, "duplicate options");
  const counts = q.options.map(words);
  if (new Set(counts).size !== 1) fail(qw, `options have ${counts.join(", ")} words: make them equal`);
  const chars = q.options.map((o) => o.length);
  if (Math.max(...chars) / Math.min(...chars) > 1.2) fail(qw, `option lengths ${chars.join(", ")} characters differ by more than 20%`);
  const others = chars.filter((_, j) => j !== q.correct);
  if ((chars[q.correct] ?? 0) > Math.max(...others) + 3) fail(qw, "the right answer is visibly the longest option");
  if (q.why.length < 60) fail(qw, "the explanation is too short to teach anything");
}

let questions = 0;
for (const lesson of LESSONS) {
  const where = `lesson ${lesson.number} (${lesson.slug})`;
  if (!lesson.slug.startsWith(String(lesson.number).padStart(4, "0") + "-")) fail(where, "slug doesn't start with its number");
  if (lesson.status !== "ready") continue;

  const file = path.join(DOJO, "content/courses/lessons", `${lesson.slug}.html`);
  if (!fs.existsSync(file)) {
    fail(where, "ready, but has no HTML body");
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  const body = getLessonBody(lesson.slug);
  if (!body) fail(where, "body didn't load");

  // Quiz and component markers
  const kinds = (body?.segments ?? []).map((seg) => seg.kind);
  if (lesson.quiz.length < 3) fail(where, `only ${lesson.quiz.length} quiz questions`);
  if (lesson.quiz.length > 0 && !kinds.includes("quiz")) fail(where, "has a quiz but no <!-- quiz --> marker");
  if ((lesson.warmup?.length ?? 0) > 0 && !kinds.includes("warmup")) fail(where, "has a warm-up but no <!-- warmup --> marker");
  if ((lesson.words?.length ?? 0) > 0 && !kinds.includes("words")) fail(where, "has terms to define but no <!-- words --> marker");
  if (kinds.includes("words") && (lesson.words?.length ?? 0) === 0) fail(where, "has a <!-- words --> marker but no terms");
  if (!kinds.includes("drill")) fail(where, "has no in-browser drill: practise before the lab");
  for (const seg of body?.segments ?? []) if (seg.kind === "drill" && !getDrill(seg.id)) fail(where, `unknown drill ${seg.id}`);
  for (const t of body?.toc ?? []) if (!t.id) fail(where, `a section heading has no id: ${t.text}`);
  const positions = new Set<number>();
  lesson.quiz.forEach((q, i) => {
    questions++;
    checkQuestion(`${where}, question ${i + 1}`, q);
    positions.add(q.correct);
  });
  if (lesson.quiz.length >= 4 && positions.size < 3) fail(where, "the right answer sits in the same few positions: vary it");

  // Warm-up references
  for (const ref of lesson.warmup ?? []) {
    const from = getLesson(ref.lesson);
    if (!from) fail(where, `warm-up points to a missing lesson ${ref.lesson}`);
    else if (from.number >= lesson.number) fail(where, `warm-up from lesson ${from.number}, which isn't earlier`);
    else if (!from.quiz[ref.question]) fail(where, `warm-up points to a missing question ${ref.question} of ${ref.lesson}`);
  }

  // Steps
  const keys = [...html.matchAll(/data-key="([^"]+)"/g)].map((m) => m[1] as string);
  if (new Set(keys).size !== keys.length) fail(where, "duplicate step keys");
  const prefix = `lesson-${String(lesson.number).padStart(4, "0")}-`;
  for (const k of keys) if (!k.startsWith(prefix)) fail(where, `step key ${k} should start with ${prefix}`);

  // Lab
  if (lesson.lab) {
    const lab = path.join(DOJO, "labs", lesson.lab.dir);
    if (!fs.existsSync(path.join(lab, "check.sh"))) fail(where, `lab ${lesson.lab.dir} has no check.sh`);
    const ignore = path.join(lab, ".gitignore");
    const ignored = fs.existsSync(ignore) ? fs.readFileSync(ignore, "utf8") : "";
    for (const w of lesson.lab.writes) if (!ignored.split("\n").includes(w)) fail(where, `lab file ${w} isn't git-ignored`);
    if (!html.includes(`labs/${lesson.lab.dir}`)) fail(where, "the body never tells you where the lab is");
  }
  if (lesson.reference && !referenceSlugs.has(lesson.reference)) fail(where, `missing reference ${lesson.reference}`);

  checkLinks(where, html);
}

for (const page of getReferencePages()) checkLinks(`reference ${page.slug}`, page.html);

// Guide checks: every check is placed exactly once in its guide, every fence
// resolves, the questions follow the quiz rules, and the review message
// carries every question you answered.
let guideQuestions = 0;
let guideChecks = 0;
for (const [slug, set] of allGuideCheckSets()) {
  const where = `guide ${slug}`;
  const file = guideFile(slug);
  if (!file) {
    fail(where, "has checks but no guide file");
    continue;
  }
  const md = fs.readFileSync(file, "utf8");
  const fences = [...md.matchAll(/^```check\n([^\n`]+)\n```/gm)].map((m) => (m[1] ?? "").trim());
  const ids = set.checks.map((c) => c.id);
  if (new Set(ids).size !== ids.length) fail(where, "duplicate check ids");
  for (const id of ids) {
    const n = fences.filter((f) => f === id).length;
    if (n !== 1) fail(where, `check ${id} is placed ${n} times in the guide, expected once`);
  }
  for (const f of fences) if (!ids.includes(f)) fail(where, `a check fence names an unknown check: ${f}`);
  if (!/^https:\/\//.test(set.source.href)) fail(where, "the primary source needs an https link");
  if (set.terms.length < 4) fail(where, "fewer than 4 terms to define");
  const positions = new Set<number>();
  for (const c of set.checks) {
    guideChecks++;
    const cw = `${where}, check ${c.id}`;
    if (c.questions.length < 2 || c.questions.length > 4) fail(cw, `${c.questions.length} questions, expected 2 to 4`);
    if (c.explain.length < 40) fail(cw, "the written question is too short");
    c.questions.forEach((q, i) => {
      guideQuestions++;
      checkQuestion(`${cw}, question ${i + 1}`, q);
      positions.add(q.correct);
    });
  }
  if (positions.size < 4) fail(where, "the right answer never sits in some positions: vary it");

  // Pick a wrong option everywhere and write every answer: the message must
  // carry each prompt, and the counts must say everything is answered.
  const picks: Record<string, number> = {};
  const notes: Record<string, string> = {};
  for (const c of set.checks) {
    c.questions.forEach((q, i) => (picks[guideQuestionKey(c.id, i)] = (q.correct + 1) % q.options.length));
    notes[`answer:${c.id}`] = `my answer to ${c.id}`;
  }
  for (const t of set.terms) notes[`term:${t}`] = `my definition of ${t}`;
  const progress = { steps: {}, quiz: {}, picks, notes };
  const message = guideReviewMessage(slug, set, progress);
  for (const c of set.checks) {
    for (const q of c.questions) if (!message.includes(q.prompt)) fail(where, `the review message lacks: ${q.prompt.slice(0, 50)}`);
    if (!message.includes(c.explain)) fail(where, `the review message lacks the written question of ${c.id}`);
  }
  const counts = guideReviewCounts(set, progress);
  if (counts.answered !== counts.questions || counts.written !== counts.explains || counts.defined !== counts.terms)
    fail(where, "the review counts don't add up");
  if (message.includes("Not answered yet")) fail(where, "a fully answered guide still reports gaps");
}

// The lesson message reports the latest picks, and only what was answered.
{
  const quiz = LESSONS.find((l) => l.status === "ready")?.quiz ?? [];
  const q0 = quiz[0];
  if (q0) {
    const wrong = (q0.correct + 1) % q0.options.length;
    const lines = lessonQuizLines(quiz, { steps: {}, quiz: { "0": false }, picks: { "0": wrong } });
    if (lines.length !== 3 || !lines[1]?.includes(q0.options[wrong] as string)) fail("lesson message", `unexpected quiz lines: ${JSON.stringify(lines)}`);
    if (lessonQuizLines(quiz, { steps: {}, quiz: {} }).length !== 0) fail("lesson message", "an unanswered quiz should add no lines");
  }
}

// Drills: every generator produces well-formed exercises across many seeds,
// choice options are equal in words, and the canonical answer of every input
// exercise is accepted by its own grader.
let drillRuns = 0;
for (const drill of DRILLS) {
  for (const gen of drill.generators) {
    for (let seed = 1; seed <= 300; seed++) {
      const ex = gen.generate(new Rng(seed * 7919));
      drillRuns++;
      const where = `drill ${drill.id}, ${gen.id}, seed ${seed}`;
      if (ex.genId !== gen.id) fail(where, `genId ${ex.genId} doesn't match the generator`);
      if (ex.explanation.length < 40) fail(where, "explanation too short");
      if (ex.docRef.href) checkLinks(where, `href="${ex.docRef.href}"`);
      if (ex.kind === "choice") {
        if (new Set(ex.options).size !== ex.options.length) fail(where, "duplicate options");
        if (new Set(ex.options.map(words)).size !== 1) fail(where, `options have ${ex.options.map(words).join(", ")} words`);
        if (ex.correctIndex < 0 || ex.correctIndex >= ex.options.length) fail(where, "correct index out of range");
      } else if (ex.kind === "input") {
        if (!ex.accept(ex.answer)) fail(where, `its own answer "${ex.answer}" is rejected`);
        if (ex.accept("")) fail(where, "an empty answer is accepted");
      } else {
        fail(where, `unexpected exercise kind ${ex.kind}`);
      }
    }
  }
}

for (const week of WEEKS) {
  const where = `week ${week.number}`;
  for (const day of week.days) {
    for (const slug of day.lessons) if (!lessonSlugs.has(slug)) fail(where, `${day.label} lists a missing lesson ${slug}`);
    for (const sd of day.systemDesign ?? []) checkLinks(`${where}, ${day.label}`, `href="${sd.href}"`);
  }
}

const ready = LESSONS.filter((l) => l.status === "ready").length;
if (problems.length > 0) {
  console.error(`✗ ${problems.length} problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `✓ ${LESSONS.length} lessons on the map, ${ready} written, ${questions} quiz questions, ${drillRuns} drill exercises generated, ${WEEKS.length} weeks; ${allGuideCheckSets().length} guides with ${guideChecks} checks and ${guideQuestions} questions: all consistent.`,
);
