/**
 * A "Check yourself" block inside a guide: the lesson quiz (same look, same
 * spaced review), then one question to answer in your own words. Answers are
 * saved in this browser; the guide's end panel (GuideReview) copies them all.
 */
"use client";

import type { GuideCheck } from "@/lib/guide-checks/types";
import { guideProgressSlug, guideQuestionId, guideQuestionKey } from "@/lib/guide-checks";
import { lessonProgress, setNote, useCourseProgress } from "@/lib/courses/progress";
import { LessonQuiz, type QuizItem } from "./LessonQuiz";
import { Inline } from "./Inline";

export function GuideCheckBlock({ slug, check }: { slug: string; check: GuideCheck }) {
  const store = guideProgressSlug(slug);
  const notes = lessonProgress(useCourseProgress(), store).notes ?? {};
  const items: QuizItem[] = check.questions.map((question, n) => ({
    id: guideQuestionId(slug, check.id, n),
    lessonSlug: store,
    index: n,
    key: guideQuestionKey(check.id, n),
    question,
  }));
  const noteKey = `answer:${check.id}`;

  return (
    <section id={`check-${check.id}`} className="course course-embed check not-prose">
      <p className="check-label">Check yourself · {check.section}</p>
      <LessonQuiz items={items} kind="quiz" />
      <label className="check-explain">
        <span>
          <strong>In your own words.</strong> <Inline text={check.explain} />
        </span>
        <textarea
          rows={4}
          placeholder="From memory, without scrolling up. Saved in this browser as you type."
          value={notes[noteKey] ?? ""}
          onChange={(e) => setNote(store, noteKey, e.target.value)}
        />
      </label>
      <p className="check-foot">
        The <a href="#get-corrected">panel at the end of this guide</a> copies everything you answer
        here as one message, for an AI tutor to correct.
      </p>
    </section>
  );
}
