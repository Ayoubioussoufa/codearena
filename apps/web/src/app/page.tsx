/**
 * src/app/page.tsx — Home
 * TODOs: none — stats strip (#1) and features grid (#2) laid out responsively.
 * The hero and CTA sections are complete reference patterns.
 */
import Link from "next/link";

const STATS = [
  { value: "500+", label: "Curated problems" },
  { value: "40K", label: "Arena players" },
  { value: "1.2M", label: "Submissions judged" },
  { value: "24/7", label: "Live contests" },
] as const;

const FEATURES = [
  {
    icon: "⚔️",
    title: "Ranked duels",
    description:
      "Go head-to-head in timed matches. Ratings update after every duel with a Glicko-2 system.",
  },
  {
    icon: "🧠",
    title: "Adaptive practice",
    description:
      "The problem feed adjusts to your skill estimate, so every session sits right at your edge.",
  },
  {
    icon: "⚡",
    title: "Instant judging",
    description:
      "Sandboxed execution returns verdicts in milliseconds across JavaScript, TypeScript and Python.",
  },
  {
    icon: "📈",
    title: "Deep analytics",
    description:
      "Track acceptance rate, topic mastery and streaks. Know exactly which weaknesses to attack next.",
  },
  {
    icon: "🏆",
    title: "Global leaderboard",
    description:
      "Climb weekly and all-time rankings. Country and friend leaderboards keep the rivalry personal.",
  },
  {
    icon: "🔁",
    title: "Spaced review",
    description:
      "Solved problems resurface right before you'd forget them, turning solutions into lasting skill.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero — COMPLETE: reference for responsive flex composition ── */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(59,130,246,0.12),transparent)]" />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:py-24">
          <div className="flex max-w-xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              Season 3 is live — new ranked queue
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Enter the arena.
              <br />
              <span className="text-blue-600 dark:text-blue-400">
                Code to win.
              </span>
            </h1>
            <p className="text-lg leading-8 text-slate-600 dark:text-slate-400">
              Solve curated problems, duel other programmers in real time, and
              watch your rating climb. CodeArena turns practice into sport.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500"
              >
                Start competing — free
              </Link>
              <Link
                href="/problems"
                className="rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Browse problems
              </Link>
            </div>
          </div>

          {/* Fake editor card */}
          <div className="w-full max-w-md flex-1 lg:max-w-none">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-blue-500/5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 font-mono text-xs text-slate-500">
                  two-sum.ts — ranked duel
                </span>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-slate-700 sm:text-sm dark:text-slate-300">
                <code>{`function twoSum(nums: number[], target: number) {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
}

// ✓ 57/57 tests passed · 4 ms · beats 98.2%`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for competitive momentum
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Everything you need to go from grinding problems to winning duels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50"
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner — COMPLETE: second reference pattern ── */}
      <section className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-900 px-6 py-12 text-center sm:px-12 lg:flex-row lg:justify-between lg:text-left dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to climb the ladder?
              </h2>
              <p className="mt-2 text-slate-400">
                Your first ranked duel is one sign-up away.
              </p>
            </div>
            <Link
              href="/register"
              className="rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-400"
            >
              Create your account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
