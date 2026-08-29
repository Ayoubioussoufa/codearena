/**
 * src/components/profile/SolvedBars.tsx — solved-per-difficulty progress bars
 * TODOs: none — fully implemented scaffold.
 */
import type { UserProfile } from "@/lib/types";

const ROWS = [
  { key: "easy", label: "Easy", bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  { key: "medium", label: "Medium", bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  { key: "hard", label: "Hard", bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
] as const;

interface SolvedBarsProps {
  solved: UserProfile["solved"];
  totalProblems: UserProfile["totalProblems"];
}

export function SolvedBars({ solved, totalProblems }: SolvedBarsProps) {
  const totalSolved = solved.easy + solved.medium + solved.hard;
  const totalAll =
    totalProblems.easy + totalProblems.medium + totalProblems.hard;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Solved
        </h2>
        <p className="text-sm">
          <span className="text-xl font-bold">{totalSolved}</span>
          <span className="text-slate-400"> / {totalAll}</span>
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {ROWS.map((row) => {
          const done = solved[row.key];
          const total = totalProblems[row.key];
          const pct = total === 0 ? 0 : Math.round((done / total) * 100);
          return (
            <div key={row.key}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className={`font-medium ${row.text}`}>{row.label}</span>
                <span className="font-mono text-xs text-slate-500">
                  {done} / {total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${row.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
