"use client";
/** The route through the guide: every station, stamped or not, and your rank. */
import { useState } from "react";
import { SIMS, rankFor } from "@/lib/sims/catalog";
import { clearStamps, useStamps } from "@/lib/sims/progress";

export function SimMap() {
  const stamps = useStamps();
  const [asking, setAsking] = useState(false);
  const cleared = SIMS.filter((s) => stamps[s.id]).length;
  const next = SIMS.find((s) => !stamps[s.id]);
  return (
    <section aria-label="Station map" className="not-prose my-8 rounded-2xl border-2 border-slate-300 bg-slate-50/60 p-4 text-slate-800 sm:p-5 dark:text-slate-200 dark:border-slate-700 dark:bg-slate-950/30">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-lg">
          Rank: <strong className="text-cyan-700 dark:text-cyan-300">{rankFor(cleared)}</strong>
        </p>
        <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
          {cleared} of {SIMS.length} cleared
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${(cleared / SIMS.length) * 100}%` }} />
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SIMS.map((s, i) => {
          const done = stamps[s.id] !== undefined;
          const here = s.id === next?.id;
          return (
            <li key={s.id}>
              <a
                href={`#sim-${s.id}`}
                className={`flex h-full items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${done ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : here ? "border-cyan-600 bg-cyan-50 text-cyan-900 dark:border-cyan-500 dark:bg-cyan-950/40 dark:text-cyan-100" : "border-slate-200 bg-white text-slate-600 hover:border-cyan-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"}`}
              >
                <span aria-hidden className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-xs ${done ? "bg-emerald-600 text-white" : here ? "bg-cyan-700 text-white" : "bg-slate-200 dark:bg-slate-800"}`}>
                  {done ? "✓" : i + 1}
                </span>
                <span>
                  {s.title}
                  <span className="sr-only">{done ? " (cleared)" : ""}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>Stamps are kept in this browser.</span>
        {cleared > 0 &&
          (asking ? (
            <span className="flex gap-3">
              Clear all {cleared}?
              <button type="button" className="font-semibold text-rose-700 underline dark:text-rose-400" onClick={() => { clearStamps(); setAsking(false); }}>
                Yes, start over
              </button>
              <button type="button" className="underline" onClick={() => setAsking(false)}>
                Keep them
              </button>
            </span>
          ) : (
            <button type="button" className="underline underline-offset-2" onClick={() => setAsking(true)}>
              Start over
            </button>
          ))}
      </div>
    </section>
  );
}
