/**
 * Practice index: all topics with live mastery, plus a reset control.
 */
"use client";

import Link from "next/link";
import { TOPICS } from "@/lib/engine/registry";
import {
  useProgress,
  accuracy,
  resetProgress,
  resetReviews,
  dueList,
  today,
} from "@/lib/progress";
import { MasteryBar } from "@/components/ui";

export default function PracticePage() {
  const progress = useProgress();
  const dueCount = dueList(progress, today()).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Practice</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Pick a topic — questions are generated per attempt and weighted toward
            your gaps.
          </p>
        </div>
        {progress.totalAttempts > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Clear the spaced-review queue? Your mastery and streak are kept — only the due schedule is reset.",
                  )
                ) {
                  resetReviews();
                }
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-amber-300 hover:text-amber-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-amber-500/50 dark:hover:text-amber-400"
            >
              Reset reviews
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset all practice progress? This cannot be undone.")) {
                  resetProgress();
                }
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-rose-500/50 dark:hover:text-rose-400"
            >
              Reset progress
            </button>
          </div>
        )}
      </header>

      {/* Spaced review + Mixed */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/practice/review"
          className={`group flex flex-col gap-2 rounded-xl border p-5 transition-colors ${
            dueCount > 0
              ? "border-amber-300 bg-amber-50/60 hover:border-amber-400 dark:border-amber-500/40 dark:bg-amber-500/5"
              : "border-slate-200 bg-white hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <h2 className="font-semibold">Spaced review</h2>
            {dueCount > 0 && (
              <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                {dueCount} due
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {dueCount > 0
              ? `${dueCount} ${dueCount === 1 ? "item is" : "items are"} due — review them before you forget. Miss one and it comes back sooner.`
              : "Items resurface right before you'd forget them (FSRS-lite). Nothing due yet — practice a topic to seed the schedule."}
          </p>
        </Link>

        <Link
          href="/practice/mixed"
          className="group flex flex-col gap-2 rounded-xl border border-cyan-200 bg-cyan-50/50 p-5 transition-colors hover:border-cyan-400 dark:border-cyan-500/30 dark:bg-cyan-500/5 dark:hover:border-cyan-400/60"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔀</span>
            <h2 className="font-semibold text-cyan-800 group-hover:text-cyan-700 dark:text-cyan-300">
              Mixed review
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            One stream across all {TOPICS.length} topics, weighted toward your weakest
            areas — the closest thing to a daily warm-up.
          </p>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TOPICS.map((topic) => {
          const stats = progress.topics[topic.id];
          const seen = Object.keys(stats?.generators ?? {}).length;
          return (
            <Link
              key={topic.id}
              href={`/practice/${topic.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{topic.icon}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold group-hover:text-cyan-700 dark:group-hover:text-cyan-400">
                    {topic.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {seen}/{topic.generators.length} exercise types seen
                  </p>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {topic.blurb}
              </p>
              <MasteryBar
                accuracy={accuracy(stats?.attempts ?? 0, stats?.correct ?? 0)}
                attempts={stats?.attempts ?? 0}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
