/**
 * A lesson quiz (or a warm-up from earlier lessons). Every answer is also
 * recorded in the drill store, which schedules the question for spaced
 * review: right answers come back later and later, misses come back tomorrow.
 */
"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/courses/types";
import { recordAnswer } from "@/lib/progress";
import { recordLessonAnswer } from "@/lib/courses/progress";
import { Inline } from "./Inline";

export interface QuizItem {
  /** Spaced-review id. */
  id: string;
  /** Progress-store slug: the lesson's slug, or "guide:<slug>" for a guide check. */
  lessonSlug: string;
  index: number;
  /** Progress-store key for this question; defaults to the index. */
  key?: string;
  /** Shown above warm-up questions, e.g. "From lesson 1". */
  from?: string;
  question: QuizQuestion;
}

export function LessonQuiz({ items, kind }: { items: QuizItem[]; kind: "quiz" | "warmup" }) {
  const [picked, setPicked] = useState<Record<string, number>>({});

  function answer(item: QuizItem, option: number) {
    if (item.id in picked) return;
    const correct = option === item.question.correct;
    setPicked((prev) => ({ ...prev, [item.id]: option }));
    recordAnswer("course-recall", item.id, correct);
    if (kind === "quiz") recordLessonAnswer(item.lessonSlug, item.key ?? item.index, correct, option);
  }

  const answered = items.filter((item) => item.id in picked);
  const right = answered.filter((item) => picked[item.id] === item.question.correct).length;
  const finished = answered.length === items.length;

  return (
    <div className="quiz">
      {items.map((item, n) => {
        const choice = picked[item.id];
        const done = choice !== undefined;
        const gotIt = choice === item.question.correct;
        return (
          <div className="q" key={item.id}>
            {item.from && <p className="q-from">{item.from}</p>}
            <p className="q-text">
              <strong>{n + 1}.</strong> <Inline text={item.question.prompt} />
            </p>
            <div className="opts">
              {item.question.options.map((option, i) => {
                const cls = [
                  "opt",
                  done && i === item.question.correct ? "right" : "",
                  done && i === choice && !gotIt ? "wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button key={i} type="button" className={cls} disabled={done} onClick={() => answer(item, i)}>
                    <Inline text={option} />
                  </button>
                );
              })}
            </div>
            {done && (
              <p className="why">
                <span className={`verdict ${gotIt ? "ok" : "bad"}`}>{gotIt ? "Right." : "Not quite."}</span>
                <Inline text={item.question.why} />
              </p>
            )}
          </div>
        );
      })}
      <div className="quiz-foot" aria-live="polite">
        <span>
          {answered.length === 0
            ? kind === "warmup"
              ? "From memory, before you start. These come back in spaced review."
              : "Your answers schedule these questions in the dojo's spaced review."
            : finished
              ? right === items.length
                ? `All ${right} right. They'll come back in a few days, when you're about to forget them.`
                : `${right} / ${items.length}. Misses come back in spaced review tomorrow; reread their explanations now.`
              : `${right} right out of ${answered.length} answered`}
        </span>
        {answered.length > 0 && (
          <button type="button" className="btn" onClick={() => setPicked({})}>
            Start again
          </button>
        )}
      </div>
    </div>
  );
}
