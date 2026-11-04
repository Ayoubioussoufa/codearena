/**
 * The messages you copy for correction. Pure functions of the saved progress,
 * so scripts/check-courses.ts can exercise them without a browser.
 *
 * - Guides: a self-contained prompt for ANY AI tutor (it has never seen the
 *   guide), so every question carries its options and the dojo's key.
 * - Lessons: the `done NNNN` message for the teacher in the terminal, who has
 *   the lesson, so the quiz part stays short.
 */
import type { LessonProgress } from "@/lib/courses/progress";
import type { QuizQuestion } from "@/lib/courses/types";
import type { GuideCheckSet } from "./types";
import { guideQuestionKey } from "./index";

const LETTERS = "ABCDEFGH";
const letter = (i: number) => LETTERS[i] ?? String(i + 1);

export interface ReviewCounts {
  answered: number;
  questions: number;
  written: number;
  explains: number;
  defined: number;
  terms: number;
}

export function guideReviewCounts(set: GuideCheckSet, p: LessonProgress): ReviewCounts {
  const picks = p.picks ?? {};
  const notes = p.notes ?? {};
  let answered = 0;
  let questions = 0;
  for (const c of set.checks)
    c.questions.forEach((_, n) => {
      questions++;
      if (guideQuestionKey(c.id, n) in picks) answered++;
    });
  return {
    answered,
    questions,
    written: set.checks.filter((c) => (notes[`answer:${c.id}`] ?? "").trim()).length,
    explains: set.checks.length,
    defined: set.terms.filter((t) => (notes[`term:${t}`] ?? "").trim()).length,
    terms: set.terms.length,
  };
}

export function guideReviewMessage(title: string, set: GuideCheckSet, p: LessonProgress): string {
  const picks = p.picks ?? {};
  const notes = p.notes ?? {};
  const counts = guideReviewCounts(set, p);
  const out: string[] = [
    `I'm studying "${title}" to prepare for software engineering interviews at big tech companies. Please correct my answers below.`,
    "For each one, say whether it's right. When it isn't, name the misconception behind my answer and give the precise correction. Be strict with vague or half-right written answers, and say what a strong answer would add. End with the three ideas I should reread first.",
  ];

  const missed: string[] = [];
  const right: string[] = [];
  for (const c of set.checks) {
    c.questions.forEach((q, n) => {
      const pick = picks[guideQuestionKey(c.id, n)];
      if (pick === undefined) return;
      if (pick === q.correct) {
        right.push(`- [${c.section}] ${q.prompt}\n  My answer: ${q.options[pick]}`);
      } else {
        missed.push(
          [
            `- [${c.section}] ${q.prompt}`,
            ...q.options.map((o, i) => `  ${letter(i)}) ${o}`),
            `  My answer: ${letter(pick)}. The dojo's key says ${letter(q.correct)}. Explain why my choice is wrong.`,
          ].join("\n"),
        );
      }
    });
  }
  if (missed.length) out.push("", "## Multiple choice I got wrong", ...missed);
  if (right.length) out.push("", "## Multiple choice I got right (check I didn't guess)", ...right);

  const written = set.checks
    .map((c) => ({ c, text: (notes[`answer:${c.id}`] ?? "").trim() }))
    .filter((w) => w.text);
  if (written.length) {
    out.push("", "## Written answers, from memory");
    for (const { c, text } of written) out.push(`- [${c.section}] ${c.explain}`, `  My answer: ${text}`);
  }

  const defs = set.terms
    .map((t) => ({ t, text: (notes[`term:${t}`] ?? "").trim() }))
    .filter((d) => d.text);
  if (defs.length) {
    out.push("", "## My definitions");
    for (const { t, text } of defs) out.push(`- ${t}: ${text}`);
  }

  const gaps: string[] = [];
  if (counts.answered < counts.questions) gaps.push(`${counts.questions - counts.answered} multiple-choice questions`);
  if (counts.written < counts.explains) gaps.push(`${counts.explains - counts.written} written questions`);
  if (counts.defined < counts.terms) gaps.push(`${counts.terms - counts.defined} definitions`);
  if (gaps.length) out.push("", `(Not answered yet: ${gaps.join(", ")}.)`);
  return out.join("\n");
}

/** The quiz part of a lesson's `done NNNN` message: latest picks, misses in full. */
export function lessonQuizLines(quiz: readonly QuizQuestion[], p: LessonProgress): string[] {
  const picks = p.picks ?? {};
  const lines: string[] = [];
  let firstTryRight = 0;
  let answered = 0;
  quiz.forEach((q, i) => {
    const pick = picks[String(i)];
    if (p.quiz[String(i)] === true) firstTryRight++;
    if (pick === undefined) return;
    answered++;
    lines.push(
      pick === q.correct
        ? `${i + 1}. right`
        : `${i + 1}. wrong: I picked "${q.options[pick]}"; the key says "${q.options[q.correct]}"`,
    );
  });
  if (answered === 0) return [];
  return [`Quiz (my latest answers; ${firstTryRight}/${quiz.length} right on the first try):`, ...lines, ""];
}
