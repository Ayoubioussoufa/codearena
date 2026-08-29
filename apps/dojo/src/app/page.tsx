/**
 * Dashboard: live progress stats + topic shortcuts + how-it-works.
 */
"use client";

import Link from "next/link";
import { TOPICS, TOTAL_GENERATORS } from "@/lib/engine/registry";
import { DSA_CATEGORIES, TOTAL_PROBLEMS } from "@/lib/dsa/registry";
import { useProgress, accuracy, dueList, today } from "@/lib/progress";
import { useDsaProgress, solvedCount } from "@/lib/dsa-progress";
import { MasteryBar } from "@/components/ui";

export default function DashboardPage() {
  const progress = useProgress();
  const dsaProgress = useDsaProgress();
  const overallAccuracy = accuracy(progress.totalAttempts, progress.totalCorrect);
  const dueCount = dueList(progress, today()).length;
  const dsaSolved = solvedCount(
    dsaProgress,
    DSA_CATEGORIES.flatMap((c) => c.problems.map((p) => p.slug)),
  );

  const practiced = TOPICS.filter((t) => (progress.topics[t.id]?.attempts ?? 0) > 0);
  const weakest = [...practiced]
    .sort((a, b) => {
      const sa = progress.topics[a.id];
      const sb = progress.topics[b.id];
      return (
        (accuracy(sa?.attempts ?? 0, sa?.correct ?? 0) ?? 100) -
        (accuracy(sb?.attempts ?? 0, sb?.correct ?? 0) ?? 100)
      );
    })
    .slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight">
          Train the concepts.{" "}
          <span className="text-cyan-600 dark:text-cyan-400">Then build them.</span>
        </h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Every CodeArena build phase has a guide and a drill set: read the theory,
          then answer generated questions until it sticks. Questions repeat with
          fresh numbers, grade instantly, and always explain <em>why</em>.
        </p>
      </header>

      {/* Due-for-review banner */}
      {dueCount > 0 && (
        <Link
          href="/practice/review"
          className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-amber-300 bg-amber-50/60 p-4 transition-colors hover:border-amber-400 dark:border-amber-500/40 dark:bg-amber-500/5"
        >
          <span className="text-2xl">🧠</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              {dueCount} {dueCount === 1 ? "item is" : "items are"} due for review
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Catch them before they fade — spaced repetition is where the retention
              actually happens.
            </p>
          </div>
          <span className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-400">
            Review now →
          </span>
        </Link>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Questions answered" value={progress.totalAttempts || "—"} />
        <StatCard
          label="Overall accuracy"
          value={overallAccuracy === null ? "—" : `${overallAccuracy}%`}
        />
        <StatCard
          label="Practice streak"
          value={progress.streak.current > 0 ? `${progress.streak.current}d 🔥` : "—"}
        />
        <StatCard
          label="Exercise types"
          value={`${TOTAL_GENERATORS} across ${TOPICS.length} topics`}
          small
        />
      </div>

      {/* Weakest topics call-out */}
      {weakest.length > 0 && (progress.topics[weakest[0]!.id]?.attempts ?? 0) >= 5 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-500/5">
          <span className="font-semibold text-amber-700 dark:text-amber-400">
            Needs work:
          </span>{" "}
          {weakest.map((t, i) => (
            <span key={t.id}>
              {i > 0 && " · "}
              <Link
                href={`/practice/${t.id}`}
                className="font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-300"
              >
                {t.icon} {t.title}
              </Link>
            </span>
          ))}{" "}
          <span className="text-amber-700/80 dark:text-amber-400/80">
            — the picker will focus on what you&apos;re missing.
          </span>
        </div>
      )}

      {/* Topic grid */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Topics
          </h2>
          <Link
            href="/practice/review"
            className="text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-400"
          >
            🧠 Spaced review
          </Link>
          <Link
            href="/practice/mixed"
            className="text-sm font-medium text-cyan-700 hover:underline dark:text-cyan-400"
          >
            🔀 Mixed
          </Link>
          <Link
            href="/build"
            className="ml-auto text-sm text-cyan-700 hover:underline dark:text-cyan-400"
          >
            Build map →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((topic) => {
            const stats = progress.topics[topic.id];
            return (
              <Link
                key={topic.id}
                href={`/practice/${topic.id}`}
                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{topic.icon}</span>
                  <h3 className="text-sm font-semibold group-hover:text-cyan-700 dark:group-hover:text-cyan-400">
                    {topic.title}
                  </h3>
                </div>
                <p className="flex-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
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
      </section>

      {/* DSA */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Coding problems (DSA)
          </h2>
          <span className="text-xs text-slate-400">
            {dsaSolved}/{TOTAL_PROBLEMS} solved
          </span>
          <Link
            href="/dsa"
            className="ml-auto text-sm text-cyan-700 hover:underline dark:text-cyan-400"
          >
            Open the problem sets →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {DSA_CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/dsa/${c.id}`}
              className="group flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white p-4 text-center transition-colors hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500/50"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-xs font-medium leading-4 group-hover:text-cyan-700 dark:group-hover:text-cyan-400">
                {c.title}
              </span>
              <span className="text-[10px] text-slate-400">{c.problems.length} problems</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-12 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900/50">
        {[
          { step: "1", title: "Read the guide", body: "Each topic links its study guide — the same docs/ files from the repo, rendered with diagrams.", href: "/guides" },
          { step: "2", title: "Drill until fluent", body: "Generated questions and code exercises; wrong ones come back, and spaced review resurfaces them before you forget.", href: "/practice" },
          { step: "3", title: "Go build it", body: "The Build map links every concept to the real TODO gap in apps/web it prepares you for.", href: "/build" },
        ].map((s) => (
          <Link key={s.step} href={s.href} className="group">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 font-mono text-xs font-bold text-white">
              {s.step}
            </span>
            <h3 className="mt-2 text-sm font-semibold group-hover:text-cyan-700 dark:group-hover:text-cyan-400">
              {s.title}
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{s.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  small = false,
}: {
  label: string;
  value: number | string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-bold text-slate-900 dark:text-slate-50 ${small ? "text-sm leading-6" : "text-xl"}`}>
        {value}
      </p>
    </div>
  );
}
