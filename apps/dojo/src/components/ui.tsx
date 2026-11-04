/**
 * Small shared presentational pieces: mastery bar, inline-code prompt text.
 */
import { Fragment } from "react";

/**
 * Renders `backtick spans` in exercise text as inline code, and
 * [text](https://…) as a link (course explanations cite their sources).
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return (
            <code
              key={i}
              className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) {
          return (
            <a
              key={i}
              href={link[2]}
              className="text-cyan-700 underline underline-offset-2 dark:text-cyan-300"
              {...(link[2]?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {link[1]}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
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
