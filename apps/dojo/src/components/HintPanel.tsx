/**
 * Two-tier, opt-in hints for a coding task — kept collapsed so the prompt can
 * state only the GOAL and you reach for help only when stuck:
 *
 *   Hint 1 — "how to approach it": what to reach for, how it works and why.
 *   Hint 2 — "reveal the answer": the model code for this task/file.
 *
 * Both are native <details> so they're keyboard-accessible and need no JS.
 * Mount with a key tied to the task/file so they reset to collapsed on change.
 */
"use client";

import { RichText } from "./ui";
import { CodeBlock } from "./CodeBlock";

export interface HintPanelProps {
  /** Hint 1 text (approach). Omitted → only the answer hint shows. */
  approach?: string | undefined;
  /** Hint 2 — the model code revealed on demand. */
  answer: string;
  /** highlight.js language for the answer code. */
  answerLang: string;
}

export function HintPanel({ approach, answer, answerLang }: HintPanelProps) {
  const summary =
    "flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium select-none marker:hidden";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Stuck? Open a hint
      </p>

      {approach && (
        <details className="group rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-500/5">
          <summary className={`${summary} text-amber-700 dark:text-amber-300`}>
            <span className="text-amber-500 transition-transform group-open:rotate-90" aria-hidden>
              ▶
            </span>
            💡 Hint 1 — how to approach it
          </summary>
          <div className="border-t border-amber-200/70 px-3 py-2 text-sm leading-7 text-slate-700 dark:border-amber-500/20 dark:text-slate-300">
            <RichText text={approach} />
          </div>
        </details>
      )}

      <details className="group rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        <summary className={`${summary} text-slate-600 dark:text-slate-300`}>
          <span className="text-slate-400 transition-transform group-open:rotate-90" aria-hidden>
            ▶
          </span>
          🔑 Hint 2 — reveal the answer
        </summary>
        <div className="border-t border-slate-200 px-3 py-2 dark:border-slate-800">
          <p className="mb-1.5 text-[11px] text-slate-400">
            Try hint 1 first — this is the full answer.
          </p>
          <CodeBlock code={answer} language={answerLang} />
        </div>
      </details>
    </div>
  );
}
