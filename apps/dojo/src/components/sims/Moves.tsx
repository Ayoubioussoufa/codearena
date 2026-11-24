"use client";
/** One situation, four moves: what each would do, and which one was best. */
import type { Situation } from "@/lib/sims/quiz";
import { Say } from "./ui";

export function Moves({ situation, picked, onPick }: { situation: Situation; picked: number | undefined; onPick: (i: number) => void }) {
  const open = picked === undefined;
  return (
    <div className="flex flex-col gap-2">
      {situation.moves.map((m, i) => {
        const best = i === situation.best;
        const look = open
          ? "border-slate-300 bg-white hover:border-cyan-500 dark:border-slate-700 dark:bg-slate-900"
          : best
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
            : i === picked
              ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40"
              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
        return (
          <button key={m.text} type="button" disabled={!open} onClick={() => onPick(i)} className={`rounded-lg border-2 px-3.5 py-2.5 text-left text-sm transition-colors ${look}`}>
            <span className="font-semibold">
              {!open && best ? "✓ " : !open && i === picked ? "✗ " : ""}
              {m.text}
            </span>
            {!open && <span className="mt-0.5 block text-slate-600 dark:text-slate-400">{m.outcome}</span>}
          </button>
        );
      })}
      {!open && (
        <Say tone={picked === situation.best ? "ok" : "warn"}>
          <strong>{picked === situation.best ? "Best move." : "Not the best move."}</strong> {situation.lesson}
        </Say>
      )}
    </div>
  );
}
