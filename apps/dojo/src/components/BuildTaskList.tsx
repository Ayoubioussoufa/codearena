/**
 * Client-side frontend-gaps list for the /build map. Renders the scanned
 * TODO(practice) tasks with a per-task done checkbox (persisted in
 * localStorage), a "done / total" counter, and a toggle to hide finished
 * tasks. The scan itself still happens server-side in bridge.ts — this only
 * layers your manual completion state on top.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useBuildDone, toggleBuildDone, taskKey } from "@/lib/build-progress";

export interface TaskTopic {
  id: string;
  icon: string;
  title: string;
  docSlug: string;
}

export interface BuildTask {
  file: string;
  line: number;
  skill: string;
  note: string;
  topic: TaskTopic | null;
}

export function BuildTaskList({ tasks }: { tasks: BuildTask[] }) {
  const done = useBuildDone();
  const [hideDone, setHideDone] = useState(false);

  const doneCount = tasks.reduce(
    (n, t) => n + (done[taskKey(t)] ? 1 : 0),
    0,
  );

  // Group visible tasks by file, preserving the server's sorted order.
  const byFile = new Map<string, BuildTask[]>();
  for (const task of tasks) {
    if (hideDone && done[taskKey(task)]) continue;
    const list = byFile.get(task.file) ?? [];
    list.push(task);
    byFile.set(task.file, list);
  }
  const files = [...byFile.keys()];

  return (
    <section className="mb-12">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Frontend gaps in apps/web
        </h2>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>
            {doneCount} / {tasks.length} done
          </span>
          {doneCount > 0 && (
            <button
              type="button"
              onClick={() => setHideDone((v) => !v)}
              className="rounded-md border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {hideDone ? "Show done" : "Hide done"}
            </button>
          )}
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/5 dark:text-emerald-400">
          🎉 No open practice TODOs found in apps/web — you&apos;ve built them all.
        </p>
      ) : files.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          All open tasks are checked off. Toggle “Show done” to see them.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {files.map((file) => (
            <div
              key={file}
              className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                {file}
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {(byFile.get(file) ?? []).map((task) => {
                  const key = taskKey(task);
                  const isDone = !!done[key];
                  return (
                    <li
                      key={task.line}
                      className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm transition-colors ${
                        isDone
                          ? "bg-emerald-50/40 dark:bg-emerald-500/5"
                          : "bg-white dark:bg-slate-950"
                      }`}
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleBuildDone(key)}
                          className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800"
                        />
                        <span className="font-mono text-xs text-slate-400">
                          L{task.line}
                        </span>
                        <span
                          className={`font-medium ${
                            isDone
                              ? "text-slate-400 line-through dark:text-slate-500"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {task.skill}
                        </span>
                      </label>
                      {task.note && (
                        <span
                          className={`w-full pl-7 text-xs ${
                            isDone
                              ? "text-slate-400 line-through dark:text-slate-600"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {task.note.replace(/[:*]+$/, "").slice(0, 130)}
                        </span>
                      )}
                      {task.topic && (
                        <span className="ml-auto flex shrink-0 gap-2">
                          <Link
                            href={`/practice/${task.topic.id}`}
                            className="rounded-lg bg-cyan-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-cyan-500"
                          >
                            Drill {task.topic.icon}
                          </Link>
                          <Link
                            href={`/guides/${task.topic.docSlug}`}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            Guide
                          </Link>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
