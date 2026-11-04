/**
 * End-of-lesson panel: what's ticked, how the quiz went, and the button that
 * marks the lesson complete (the hub's "next lesson" moves on from it).
 */
"use client";

import { isCompleted, lessonProgress, setCompleted, useCourseProgress } from "@/lib/courses/progress";

export function LessonFinish({
  slug,
  number,
  totalSteps,
  totalQuestions,
}: {
  slug: string;
  number: number;
  totalSteps: number;
  totalQuestions: number;
}) {
  const progress = useCourseProgress();
  const lesson = lessonProgress(progress, slug);
  const done = isCompleted(progress, slug);
  const ticked = Object.values(lesson.steps).filter(Boolean).length;
  const answers = Object.values(lesson.quiz);
  const right = answers.filter(Boolean).length;
  const tag = String(number).padStart(4, "0");

  return (
    <div className={`finish ${done ? "is-done" : ""}`}>
      <span className="label">Finish line</span>
      <p className="sans" style={{ fontSize: "0.95rem" }}>
        Build steps ticked: <strong>{ticked} / {totalSteps}</strong> · Quiz:{" "}
        <strong>
          {answers.length} / {totalQuestions}
        </strong>{" "}
        answered{answers.length > 0 ? `, ${right} right the first time` : ""}
      </p>
      {done ? (
        <p>
          Completed on {lesson.completedAt}.{" "}
          <button type="button" className="btn" onClick={() => setCompleted(slug, false)}>
            Undo
          </button>
        </p>
      ) : (
        <p>
          When the checker is green, paste your <code>done {tag}</code> message (the Copy button
          above builds it) in the terminal, then{" "}
          <button type="button" className="btn primary" onClick={() => setCompleted(slug, true)}>
            Mark lesson {number} complete
          </button>
        </p>
      )}
    </div>
  );
}
