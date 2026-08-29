/**
 * Coding index — every build-from-scratch track with live progress.
 * A track is an ordered ladder of "here's what to build, now write it" tasks
 * whose difficulty climbs across five levels as you clear them.
 */
"use client";

import Link from "next/link";
import { CODING_TRACKS, trackProgress, maxLevel } from "@/lib/engine/coding";
import { useProgress, accuracy } from "@/lib/progress";
import { MasteryBar } from "@/components/ui";

export default function CodingPage() {
  const progress = useProgress();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Coding</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Not quizzes — build tasks. Each track tells you exactly what to write and
          checks it like a judge. You&apos;re served the easiest task you haven&apos;t
          cleared yet, and clearing a whole level unlocks the next — so the more
          mornings you show up, the harder they get. Pick a track and start building.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {CODING_TRACKS.map((track) => {
          const stats = progress.topics[track.id];
          const prog = trackProgress(
            track,
            (genId) => progress.topics[track.id]?.generators[genId],
          );
          const top = maxLevel(track);
          return (
            <Link
              key={track.id}
              href={`/coding/${track.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{track.icon}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold group-hover:text-cyan-700 dark:group-hover:text-cyan-400">
                    {track.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {track.stack} · {prog.passed}/{prog.total} tasks · level {prog.unlocked}/{top}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {track.blurb}
              </p>
              {/* Level pips */}
              <div className="flex gap-1">
                {Array.from({ length: top }, (_, i) => i + 1).map((n) => (
                  <span
                    key={n}
                    className={`h-1.5 flex-1 rounded-full ${
                      n <= prog.cleared
                        ? "bg-emerald-500"
                        : n === prog.unlocked
                          ? "bg-cyan-500"
                          : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                ))}
              </div>
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
