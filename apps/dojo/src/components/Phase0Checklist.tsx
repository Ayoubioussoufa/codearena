/**
 * Phase 0 / Week 2 build checklist for the /build map. Renders the NestJS &
 * backend-foundations tasks (from lib/phase0.ts) with per-task checkboxes,
 * a per-part counter, and an overall progress bar. Completion is persisted in
 * the same localStorage store as the frontend-gap checkboxes (build-progress).
 */
"use client";

import Link from "next/link";
import type { Phase0Group } from "@/lib/phase0";
import { useBuildDone, toggleBuildDone, taskKey } from "@/lib/build-progress";

const keyFor = (group: Phase0Group, label: string) =>
  taskKey({ skill: `phase0-${group.id}`, note: label });

export function Phase0Checklist({ groups }: { groups: Phase0Group[] }) {
  const done = useBuildDone();

  const allTasks = groups.flatMap((g) => g.tasks.map((t) => keyFor(g, t.label)));
  const doneCount = allTasks.reduce((n, k) => n + (done[k] ? 1 : 0), 0);
  const pct = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;

  return (
    <section className="mb-12">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Phase 0 — NestJS &amp; backend foundations (Week 2)
        </h2>
        <span className="text-sm text-slate-400">
          {doneCount} / {allTasks.length} done · {pct}%
        </span>
      </div>

      {/* overall progress bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex flex-col gap-4">
        {groups.map((group) => {
          const groupKeys = group.tasks.map((t) => keyFor(group, t.label));
          const groupDone = groupKeys.reduce((n, k) => n + (done[k] ? 1 : 0), 0);
          const complete = groupDone === group.tasks.length;
          return (
            <div
              key={group.id}
              className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {group.title}
                </span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 font-mono text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {group.days}
                </span>
                <span className="ml-auto text-xs tabular-nums text-slate-400">
                  {complete ? "✓ " : ""}
                  {groupDone}/{group.tasks.length}
                </span>
                <span className="w-full text-xs text-slate-500 dark:text-slate-400">
                  {group.focus}
                </span>
                {group.id === "dsa" && (
                  <Link
                    href="/dsa/two-pointers"
                    className="rounded-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-cyan-500"
                  >
                    Drill 👉
                  </Link>
                )}
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {group.tasks.map((task) => {
                  const key = keyFor(group, task.label);
                  const isDone = !!done[key];
                  return (
                    <li
                      key={key}
                      className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm transition-colors ${
                        isDone ? "bg-emerald-50/40 dark:bg-emerald-500/5" : "bg-white dark:bg-slate-950"
                      }`}
                    >
                      <label className="flex flex-1 cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleBuildDone(key)}
                          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800"
                        />
                        <span className="min-w-0">
                          <span
                            className={`font-medium ${
                              isDone
                                ? "text-slate-400 line-through dark:text-slate-500"
                                : "text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {task.label}
                          </span>
                          {task.detail && (
                            <span
                              className={`block text-xs ${
                                isDone
                                  ? "text-slate-400 line-through dark:text-slate-600"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}
                            >
                              {task.detail}
                            </span>
                          )}
                        </span>
                      </label>
                      {task.guide && (
                        <Link
                          href={`/guides/${task.guide}`}
                          className="shrink-0 rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                          Guide
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
