/**
 * DSA solve view: statement (left) + code editor and judge (right). Runs the
 * learner's function against the problem's tests in the sandboxed worker;
 * on all-pass, marks solved and reveals the approach + reference solution.
 */
"use client";

import Link from "next/link";
import { useState } from "react";
import type { DsaProblem } from "@/lib/dsa/types";
import type { FnTestResult } from "@/lib/engine/run-js";
import { runTests } from "@/lib/engine/run-js";
import { recordDsaAttempt, useDsaProgress } from "@/lib/dsa-progress";
import { DifficultyBadge } from "./DifficultyBadge";
import { CodeBlock } from "./CodeBlock";
import { CodePracticeEditor } from "./CodePracticeEditor";

export function DsaSolver({
  problem,
  categoryTitle,
  categoryId,
}: {
  problem: DsaProblem;
  categoryTitle: string;
  categoryId: string;
}) {
  const progress = useDsaProgress();
  const saved = progress.problems[problem.slug];
  // Derived: the user's live edits win once they type; before that we show the
  // saved draft (which appears after the store hydrates) or the starter. This
  // avoids the useState-vs-async-store hydration mismatch.
  const [draft, setDraft] = useState<string | null>(null);
  const code = draft ?? saved?.code ?? problem.starter;
  const [results, setResults] = useState<FnTestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [solvedNow, setSolvedNow] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const allPassed = results !== null && results.length > 0 && results.every((r) => r.passed);
  const alreadySolved = saved?.solved ?? false;

  async function run() {
    setRunning(true);
    const r = await runTests(code, problem.fnName, problem.tests, problem.harness);
    const passed = r.length > 0 && r.every((t) => t.passed);
    setResults(r);
    setRunning(false);
    setSolvedNow(passed);
    if (passed) setShowSolution(true);
    recordDsaAttempt(problem.slug, passed, code);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Statement */}
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
            <Link href="/dsa" className="text-cyan-700 hover:underline dark:text-cyan-400">
              DSA
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Link
              href={`/dsa/${categoryId}`}
              className="text-cyan-700 hover:underline dark:text-cyan-400"
            >
              {categoryTitle}
            </Link>
          </div>
          <h1 className="flex flex-wrap items-center gap-3 text-xl font-bold tracking-tight sm:text-2xl">
            {problem.title}
            <DifficultyBadge difficulty={problem.difficulty} />
            {alreadySolved && (
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ✓ solved
              </span>
            )}
          </h1>
        </div>

        <div className="flex flex-col gap-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
          {problem.statement.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {problem.examples.map((ex, i) => (
            <div key={ex.input} className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-950">
              <p className="mb-1 font-semibold text-slate-500">Example {i + 1}</p>
              <p className="font-mono">
                <span className="text-slate-500">Input: </span>
                {ex.input}
              </p>
              <p className="font-mono">
                <span className="text-slate-500">Output: </span>
                {ex.output}
              </p>
              {ex.explanation && (
                <p className="mt-1 text-slate-500 dark:text-slate-400">{ex.explanation}</p>
              )}
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Constraints
          </p>
          <ul className="flex list-inside list-disc flex-col gap-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            {problem.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>

        <Link
          href={`/guides/dsa-patterns#${problem.docAnchor}`}
          className="text-xs text-cyan-700 hover:underline dark:text-cyan-400"
        >
          📖 Read the pattern: {categoryTitle}
        </Link>
      </div>

      {/* Editor + judge */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-slate-500">
            {problem.fnName}() · JavaScript
          </span>
          <button
            type="button"
            onClick={() => {
              setDraft(problem.starter);
              setResults(null);
            }}
            className="text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          >
            ↺ Reset to starter
          </button>
        </div>

        <CodePracticeEditor
          value={code}
          language="javascript"
          onChange={setDraft}
          disabled={running}
          minRows={14}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void run()}
            disabled={running || code.trim().length === 0}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {running ? "Judging…" : "▶ Run tests"}
          </button>
          <button
            type="button"
            onClick={() => setShowSolution((s) => !s)}
            className="text-xs text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {showSolution ? "Hide solution" : "Show solution"}
          </button>
        </div>

        {/* Verdict */}
        {results !== null && (
          <div className="flex flex-col gap-2">
            <p
              className={`text-sm font-semibold ${
                allPassed
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {allPassed
                ? `Accepted — ${results.length}/${results.length} tests passed`
                : `${results.filter((r) => r.passed).length}/${results.length} tests passed`}
            </p>
            <ul className="flex flex-col gap-1.5 rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
              {results.map((r) => (
                <li key={r.label} className="flex items-start gap-2 text-xs">
                  <span className={r.passed ? "text-emerald-500" : "text-rose-500"}>
                    {r.passed ? "✓" : "✗"}
                  </span>
                  <span className="flex-1 font-mono text-slate-600 dark:text-slate-300">
                    {r.label}
                    {r.detail && <span className="ml-1 text-rose-500">— {r.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {solvedNow && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-400">
            🎉 Solved! It&apos;s saved to your progress — the approach and reference solution are below.
          </div>
        )}

        {/* Approach + reference solution */}
        {showSolution && (
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Approach
              </p>
              <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                {problem.approach}
              </p>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reference solution
              </p>
              <CodeBlock code={problem.solution} language="javascript" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
