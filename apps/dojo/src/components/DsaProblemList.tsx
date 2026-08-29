/**
 * DSA problem list for a category: difficulty filter + solved status, live
 * from localStorage. Receives plain problem metadata (no functions) from the
 * server route.
 */
"use client";

import Link from "next/link";
import { useState } from "react";
import type { Difficulty } from "@/lib/dsa/types";
import { useDsaProgress } from "@/lib/dsa-progress";
import { DifficultyBadge } from "./DifficultyBadge";

export interface ProblemRow {
  slug: string;
  title: string;
  difficulty: Difficulty;
  blurb: string;
}

const FILTERS: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];

export function DsaProblemList({
  categoryId,
  problems,
}: {
  categoryId: string;
  problems: ProblemRow[];
}) {
  const progress = useDsaProgress();
  const [filter, setFilter] = useState<Difficulty | "All">("All");

  const visible =
    filter === "All" ? problems : problems.filter((p) => p.difficulty === filter);
  const solved = problems.filter((p) => progress.problems[p.slug]?.solved).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {solved}/{problems.length} solved
        </span>
        <div className="ml-auto flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-cyan-600 text-white"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {visible.map((p) => {
            const done = progress.problems[p.slug]?.solved;
            return (
              <li key={p.slug}>
                <Link
                  href={`/dsa/${categoryId}/${p.slug}`}
                  className="flex items-center gap-3 bg-white px-4 py-3 transition-colors hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                      done
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-300 text-transparent dark:border-slate-700"
                    }`}
                  >
                    ✓
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{p.title}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {p.blurb}
                    </span>
                  </span>
                  <DifficultyBadge difficulty={p.difficulty} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
