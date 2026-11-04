/**
 * An in-lesson drill: a short round of generated questions (new numbers and
 * scenarios each time), answered right in the page with instant feedback.
 * Answers go to spaced review, so the ones you miss come back.
 */
"use client";

import { useRef, useState } from "react";
import { getDrill } from "@/lib/courses/drills";
import { Rng, freshSeed } from "@/lib/engine/rng";
import type { Exercise } from "@/lib/engine/types";
import { recordAnswer } from "@/lib/progress";
import { Inline } from "./Inline";

const ROUND = 6;

interface Answered {
  correct: boolean;
  /** Choice index picked, or the typed text. */
  given: number | string;
}

export function LessonDrill({ id }: { id: string }) {
  const drill = getDrill(id);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answered, setAnswered] = useState<Answered | null>(null);
  const [typed, setTyped] = useState("");
  const [asked, setAsked] = useState(0);
  const [right, setRight] = useState(0);
  const queue = useRef<string[]>([]);

  if (!drill) return null;
  const done = asked >= ROUND && answered !== null;

  function next() {
    if (!drill) return;
    // A bag of generator ids: every kind of question before any repeats.
    if (queue.current.length === 0) {
      const rng = new Rng(freshSeed());
      queue.current = rng.shuffle(drill.generators.map((g) => g.id));
    }
    const genId = queue.current.shift();
    const generator = drill.generators.find((g) => g.id === genId);
    if (!generator) return;
    setExercise(generator.generate(new Rng(freshSeed())));
    setAnswered(null);
    setTyped("");
    setAsked((n) => n + 1);
  }

  function start() {
    setRight(0);
    setAsked(0);
    queue.current = [];
    // `next` increments `asked` from the reset value.
    next();
  }

  function grade(correct: boolean, given: number | string) {
    if (!exercise || answered) return;
    setAnswered({ correct, given });
    if (correct) setRight((n) => n + 1);
    recordAnswer("course-recall", exercise.genId, correct);
  }

  return (
    <div className="drill">
      <span className="label">Practice, in the browser</span>
      <p className="drill-title">{drill.title}</p>
      <p className="muted drill-blurb">
        <Inline text={drill.blurb} />
      </p>

      {!exercise && (
        <button type="button" className="btn primary" onClick={start}>
          Start a round of {ROUND}
        </button>
      )}

      {exercise && (
        <div className="q">
          <p className="q-from">
            Question {Math.min(asked, ROUND)} of {ROUND} · {right} right so far
          </p>
          <p className="q-text">
            <Inline text={exercise.prompt} />
          </p>

          {exercise.kind === "choice" && (
            <div className="opts">
              {exercise.options.map((option, i) => {
                const cls = [
                  "opt",
                  answered && i === exercise.correctIndex ? "right" : "",
                  answered && answered.given === i && !answered.correct ? "wrong" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={i}
                    type="button"
                    className={cls}
                    disabled={answered !== null}
                    onClick={() => grade(i === exercise.correctIndex, i)}
                  >
                    <Inline text={option} />
                  </button>
                );
              })}
            </div>
          )}

          {exercise.kind === "input" && (
            <form
              className="drill-input"
              onSubmit={(e) => {
                e.preventDefault();
                if (typed.trim()) grade(exercise.accept(typed), typed);
              }}
            >
              <input
                type="text"
                value={typed}
                disabled={answered !== null}
                placeholder={exercise.placeholder}
                onChange={(e) => setTyped(e.target.value)}
                aria-label="Your answer"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" className="btn" disabled={answered !== null || !typed.trim()}>
                Check
              </button>
            </form>
          )}

          {answered && (
            <div className="why">
              <span className={`verdict ${answered.correct ? "ok" : "bad"}`}>
                {answered.correct ? "Right." : "Not quite."}
              </span>
              {exercise.kind === "input" && !answered.correct && (
                <>
                  The answer is <code>{exercise.answer}</code>.{" "}
                </>
              )}
              <Inline text={exercise.explanation} />
            </div>
          )}

          {answered && (
            <div className="quiz-foot" style={{ marginTop: "0.8rem" }}>
              {done ? (
                <>
                  <span>
                    {right} / {ROUND}.{" "}
                    {right === ROUND
                      ? "Clean round. Each question comes back in spaced review, further apart every time."
                      : "Misses come back in spaced review tomorrow. Another round has new numbers."}
                  </span>
                  <button type="button" className="btn" onClick={start}>
                    Another round
                  </button>
                </>
              ) : (
                <button type="button" className="btn primary" onClick={next}>
                  Next question →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
