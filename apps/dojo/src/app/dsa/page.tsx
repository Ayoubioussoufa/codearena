/**
 * DSA overview — category cards with solved progress (client) and a link into
 * the patterns guide.
 */
"use client";

import Link from "next/link";
import { DSA_CATEGORIES, TOTAL_PROBLEMS, difficultyCounts } from "@/lib/dsa/registry";
import { useDsaProgress, solvedCount } from "@/lib/dsa-progress";

export default function DsaPage() {
  const progress = useDsaProgress();
  const totalSolved = solvedCount(
    progress,
    DSA_CATEGORIES.flatMap((c) => c.problems.map((p) => p.slug)),
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Data Structures & Algorithms
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {TOTAL_PROBLEMS} problems across {DSA_CATEGORIES.length} core patterns, Easy → Hard.
          Write real code in the editor; it runs against test cases in a sandboxed worker, just
          like the judge you&apos;re building. Each pattern links to its section in the{" "}
          <Link href="/guides/dsa-patterns" className="text-cyan-700 hover:underline dark:text-cyan-400">
            DSA patterns guide
          </Link>
          .
        </p>
        <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          {totalSolved}/{TOTAL_PROBLEMS} solved
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {DSA_CATEGORIES.map((c) => {
          const counts = difficultyCounts(c);
          const solved = solvedCount(progress, c.problems.map((p) => p.slug));
          return (
            <Link
              key={c.id}
              href={`/dsa/${c.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold group-hover:text-cyan-700 dark:group-hover:text-cyan-400">
                    {c.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {solved}/{c.problems.length} solved
                  </p>
                </div>
              </div>
              <p className="flex-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {c.blurb}
              </p>
              <div className="flex gap-3 text-xs text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400">{counts.Easy} Easy</span>
                <span className="text-amber-600 dark:text-amber-400">{counts.Medium} Medium</span>
                <span className="text-rose-600 dark:text-rose-400">{counts.Hard} Hard</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
