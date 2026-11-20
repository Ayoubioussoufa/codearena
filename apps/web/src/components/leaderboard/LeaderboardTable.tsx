/**
 * Ranked leaderboard table with summary cards.
 *
 * Rank is fixed by rating; the sort buttons only change the display order.
 * Rows and stats are derived from the entries and memoized.
 */
"use client";

import { useMemo, useState } from "react";
import type {
  LeaderboardEntry,
  LeaderboardSortKey,
  LeaderboardStats,
  RankedRow,
} from "@/lib/types";

const SORT_OPTIONS: { key: LeaderboardSortKey; label: string }[] = [
  { key: "rating", label: "Rating" },
  { key: "solved", label: "Problems solved" },
  { key: "streak", label: "Streak" },
];

const SORT_VALUE: Record<LeaderboardSortKey, (row: RankedRow) => number> = {
  rating: (row) => row.rating,
  solved: (row) => row.totalSolved!,
  streak: (row) => row.streakDays,
};

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  const [sortKey, setSortKey] = useState<LeaderboardSortKey>("rating");

  // Ranked rows: rank fixed by rating, display ordered by the active sortKey,
  // memoized, and built from copies so `entries` is never mutated.
  const rows: RankedRow[] = useMemo(() => {
    const PICK = SORT_VALUE[sortKey];
    const ranked = entries
      .map((entry) => ({
        ...entry,
        totalSolved:
          entry.solved.easy + entry.solved.medium + entry.solved.hard,
        acceptanceRate: Math.round((entry.acceptedSubmissions * 1000) / entry.totalSubmissions) / 10,
        rank: 0,
      }))
      .sort((a, b) => b.rating - a.rating);
    ranked.forEach((entry, i) => {
      entry.rank = i + 1;
    });
    return [...ranked].sort((a, b) => PICK(b) - PICK(a));
  }, [entries, sortKey]);


  // const rows: RankedRow[] = entries.map((entry) => ({ ...entry }));

  // Summary stats derived from entries alone (independent of the active sort).
  const stats: LeaderboardStats = useMemo(() => {
    const totalPlayers = entries.length;
    const totalSolved = entries.reduce(
      (total, entry) => total + entry.solved.easy + entry.solved.medium + entry.solved.hard,
      0,
    );
    const averageRating = Math.round(entries.reduce((total, entry) => total + entry.rating, 0) / totalPlayers);
    const longestStreak = entries.reduce((best, e) =>
      e.streakDays > best.streakDays ? e : best,
    );
    return {
      totalPlayers,
      totalSolved,
      averageRating,
      longestStreak: {
        username: longestStreak.username,
        days: longestStreak.streakDays,
      },
    };
  }, [entries]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Players" value={stats?.totalPlayers} />
        <StatCard label="Problems solved" value={stats?.totalSolved} />
        <StatCard label="Average rating" value={stats?.averageRating} />
        <StatCard
          label="Longest streak"
          value={
            stats
              ? `${stats.longestStreak.days}d · ${stats.longestStreak.username}`
              : undefined
          }
        />
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">Sort by</span>
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSortKey(option.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              sortKey === option.key
                ? "bg-blue-600 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* ── Table (stacks into cards on phones) ── */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Solved</th>
              <th className="px-4 py-3 font-medium">Acceptance</th>
              <th className="px-4 py-3 font-medium">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="bg-white transition-colors hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900"
              >
                <td className="px-4 py-3 font-mono font-semibold text-slate-500">
                  {row.rank !== undefined ? `#${row.rank}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="mr-2">{row.countryFlag}</span>
                  <span className="font-medium">{row.username}</span>
                  <span className="ml-2 hidden text-xs text-slate-400 sm:inline">
                    {row.countryName}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {row.rating}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold">
                    {row.totalSolved !== undefined ? row.totalSolved : "—"}
                  </span>
                  <span className="ml-2 font-mono text-xs text-slate-400">
                    {row.solved.easy}E / {row.solved.medium}M / {row.solved.hard}H
                  </span>
                </td>
                <td className="px-4 py-3 font-mono">
                  {row.acceptanceRate !== undefined ? `${row.acceptanceRate}%` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono">{row.streakDays}d</span>
                  {row.streakDays >= 30 && <span className="ml-1">🔥</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Presentational helper ── */

function StatCard({ label, value }: { label: string; value?: number | string | undefined}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xl font-bold text-slate-900 dark:text-slate-50">
        {value ?? "—"}
      </p>
    </div>
  );
}
