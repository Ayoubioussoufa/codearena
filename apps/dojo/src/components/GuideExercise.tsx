"use client";
/**
 * An exercise rendered inline in a guide, at the point the concept is taught.
 *
 * The feedback is a NAMED LIST, not a verdict: "returns a new object, not the
 * row ✅ / does not import Prisma ❌". A single red cross tells you nothing;
 * a list tells you which idea you missed.
 *
 * Two escape hatches, in order: a hint that says what to reach for, and a
 * reveal that shows the answer. The reveal is always available — being stuck
 * for twenty minutes on a drill is not the kind of stuck that teaches.
 */
import { useState } from "react";
import { CodePracticeEditor } from "./CodePracticeEditor";
import { CodeBlock } from "./CodeBlock";
import {
  gradeGuideExercise,
  type GuideExercise as Exercise,
} from "@/lib/guide-exercises/types";
import type { CodeGradeResult } from "@/lib/engine/types";

export function GuideExercise({ exercise }: { exercise: Exercise }) {
  const [code, setCode] = useState(exercise.starter);
  const [result, setResult] = useState<CodeGradeResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  async function check() {
    setChecking(true);
    try {
      setResult(await gradeGuideExercise(exercise, code));
    } finally {
      setChecking(false);
    }
  }

  function reset() {
    setCode(exercise.starter);
    setResult(null);
    setShowSolution(false);
  }

  const passed = result?.passed ?? false;

  return (
    <section
      className={`not-prose my-8 overflow-hidden rounded-xl border-2 transition-colors ${
        passed
          ? "border-emerald-400 dark:border-emerald-600"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
        <span className="text-base" aria-hidden>
          {passed ? "✅" : "⌨️"}
        </span>
        <h4 className="m-0 text-sm font-semibold tracking-tight">
          {exercise.title}
        </h4>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-wide text-slate-400">
          exercise
        </span>
      </header>

      <p className="m-0 border-b border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:text-slate-300">
        {exercise.prompt}
      </p>

      <div className="border-b border-slate-200 dark:border-slate-700">
        <CodePracticeEditor
          value={code}
          language={exercise.language}
          onChange={setCode}
          minRows={Math.min(22, Math.max(8, exercise.starter.split("\n").length + 2))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => void check()}
          disabled={checking}
          className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:opacity-50"
        >
          {checking ? "Checking…" : "Check my code"}
        </button>

        {exercise.hint && (
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition-colors hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            {showHint ? "Hide hint" : "Hint"}
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowSolution((v) => !v)}
          title="Show the model answer"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition-colors hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          {showSolution ? "🙈 Hide answer" : "👁 Show answer"}
        </button>

        <button
          type="button"
          onClick={reset}
          className="ml-auto rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-200"
        >
          Reset
        </button>
      </div>

      {showHint && exercise.hint && (
        <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <strong className="font-semibold">Hint · </strong>
          {exercise.hint}
        </div>
      )}

      {result && (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-700">
          <ul className="m-0 list-none space-y-1.5 p-0">
            {result.results.map((r, i) => (
              <li
                key={i}
                className={`flex items-start gap-2 text-sm leading-6 ${
                  r.passed
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-rose-700 dark:text-rose-400"
                }`}
              >
                <span aria-hidden className="mt-px">
                  {r.passed ? "✅" : "❌"}
                </span>
                <span>
                  {r.label}
                  {r.detail && (
                    <span className="ml-1 text-slate-500 dark:text-slate-400">
                      — {r.detail}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {!passed && (
            <p className="mt-3 mb-0 text-sm text-slate-500 dark:text-slate-400">
              Fix the ❌ lines and check again. Stuck twice? Take the hint.
            </p>
          )}
        </div>
      )}

      {(passed || showSolution) && (
        <div className="border-t border-slate-200 dark:border-slate-700">
          <div className="px-4 pt-3">
            <h5 className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Model answer
            </h5>
          </div>
          <div className="px-4 pb-1">
            <CodeBlock code={exercise.solution} language={exercise.language} />
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 dark:border-slate-700 dark:bg-slate-900/60">
            <strong className="font-semibold">Why · </strong>
            {exercise.explanation}
          </div>
        </div>
      )}
    </section>
  );
}
