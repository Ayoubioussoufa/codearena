/**
 * Profile page (server component): header, stat cards, activity heatmap,
 * solved-by-difficulty bars and recent submissions.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { ActivityHeatmap } from "@/components/profile/ActivityHeatmap";
import { StreakCards } from "@/components/profile/StreakCards";
import { SolvedBars } from "@/components/profile/SolvedBars";
import { SubmissionsTable } from "@/components/profile/SubmissionsTable";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      {/* ── Header ── */}
      <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
        <Avatar name={user.displayName} src={user.avatarUrl} size="lg" />
        <div className="flex-1">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-baseline sm:gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{user.displayName}</h1>
            <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
              @{user.username}
            </p>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {user.countryFlag} {user.countryName} · joined{" "}
            {new Date(user.joinedAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {user.bio}
          </p>
        </div>
        <Link
          href="/settings"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Edit profile
        </Link>
      </header>

      {/* ── Stat cards ── */}
      <div className="mt-10">
        <StreakCards
          rating={user.rating}
          globalRank={user.globalRank}
          activity={user.activity}
        />
      </div>

      {/* ── Solved progress + heatmap ── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <SolvedBars solved={user.solved} totalProblems={user.totalProblems} />
        <ActivityHeatmap activity={user.activity} />
      </div>

      {/* ── Recent submissions ── */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent submissions
        </h2>
        <SubmissionsTable submissions={user.recentSubmissions} />
      </section>
    </div>
  );
}
