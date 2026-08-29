/**
 * Small shared presentational pieces: mastery bar, inline-code prompt text.
 */
import { Fragment } from "react";

/** Renders `backtick spans` in exercise text as inline code. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function MasteryBar({
  accuracy,
  attempts,
}: {
  accuracy: number | null;
  attempts: number;
}) {
  const pct = accuracy ?? 0;
  const color =
    accuracy === null
      ? "bg-slate-300 dark:bg-slate-700"
      : pct >= 80
        ? "bg-emerald-500"
        : pct >= 50
          ? "bg-amber-500"
          : "bg-rose-500";
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{attempts === 0 ? "Not started" : `${attempts} answered`}</span>
        <span className="font-mono">{accuracy === null ? "—" : `${accuracy}%`}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${accuracy === null ? 0 : Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  );
}
