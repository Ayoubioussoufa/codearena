"use client";
/** The card around every station: number, goal, stamp, takeaway, next one. */
import { useEffect, type ReactNode } from "react";
import { getSim, routeOf, type SimId } from "@/lib/sims/catalog";
import { stamp, useStamps } from "@/lib/sims/progress";

export function SimFrame({ id, won, onReset, children }: { id: SimId; won: boolean; onReset: () => void; children: ReactNode }) {
  const sim = getSim(id);
  const { sims } = routeOf(id);
  const n = sims.findIndex((s) => s.id === id);
  const stamped = useStamps()[id] !== undefined;
  const next = sims[n + 1];

  useEffect(() => {
    if (won) stamp(id);
  }, [won, id]);

  if (!sim) return null;
  return (
    <section
      id={`sim-${id}`}
      aria-label={`Station ${n + 1}: ${sim.title}`}
      className={`not-prose my-10 scroll-mt-20 overflow-hidden rounded-2xl border-2 text-base text-slate-800 transition-colors dark:text-slate-200 ${stamped ? "border-emerald-500 dark:border-emerald-600" : "border-slate-300 dark:border-slate-700"}`}
    >
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 bg-slate-100/70 px-4 py-3 sm:px-5 dark:border-slate-800 dark:bg-slate-900">
        <span className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs text-white dark:bg-slate-200 dark:text-slate-900">
          {n + 1}/{sims.length}
        </span>
        <h4 className="m-0 text-lg">{sim.title}</h4>
        <span className="ml-auto flex items-center gap-3">
          {stamped && <span className="sim-stamp rounded border-2 border-emerald-600 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:border-emerald-400 dark:text-emerald-300">Cleared</span>}
          <button type="button" onClick={onReset} className="text-sm text-slate-500 underline-offset-2 hover:text-cyan-700 hover:underline dark:text-slate-400 dark:hover:text-cyan-300">
            Reset
          </button>
        </span>
      </header>
      <p className="border-b border-slate-200 px-4 py-2.5 text-sm text-slate-700 sm:px-5 dark:border-slate-800 dark:text-slate-300">
        <strong className={won ? "text-emerald-700 dark:text-emerald-400" : "text-cyan-700 dark:text-cyan-300"}>{won ? "✓ Goal met" : "Goal"}</strong> · {sim.goal}
      </p>
      <div className="flex flex-col gap-4 bg-slate-50/60 p-4 sm:p-5 dark:bg-slate-950/30">{children}</div>
      {stamped && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 sm:px-5 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <span>
            <strong>Keep this:</strong> {sim.takeaway}
          </span>
          {next && (
            <a href={`#sim-${next.id}`} className="font-semibold underline underline-offset-2">
              Next: {next.title} →
            </a>
          )}
        </footer>
      )}
    </section>
  );
}
