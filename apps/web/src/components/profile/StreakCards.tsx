/**
 * src/components/profile/StreakCards.tsx — rating/rank/streak stat cards
 * TODOs: none — the two streaks are derived from the activity list.
 * The four cards are complete; rating and rank are passed in ready-made.
 */
import type { ActivityDay } from "@/lib/types";

interface StreakCardsProps {
  rating: number;
  globalRank: number;
  activity: ActivityDay[];
}

const DAY_MS = 86_400_000;

export function StreakCards({ rating, globalRank, activity }: StreakCardsProps) {
  const countByDate = new Map(activity.map((act) => [act.date, act.count]));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  // "YYYY-MM-DD" → an integer day number (UTC), so consecutive days differ by 1.
  const dayNumber = (isoDate: string) => Date.parse(isoDate + "T00:00:00Z") / DAY_MS;

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  // Longest streak: scan the (sorted) activity for consecutive-day runs.
  let longestStreak = 0;
  let run = 0;
  let prevDay: number | null = null;
  for (const { date } of activity) {
    const d = dayNumber(date);
    run = prevDay !== null && d - prevDay === 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    prevDay = d;
  }

  // Current streak: walk back from today. A missing *today* doesn't break it
  // yet (you may not have submitted yet today); a missing yesterday does.
  let currentStreak = 0;
  let day = new Date(today);
  if (!countByDate.has(iso(day))) day = new Date(day.getTime() - DAY_MS);
  while (countByDate.has(iso(day))) {
    currentStreak += 1;
    day = new Date(day.getTime() - DAY_MS);
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Rating" value={rating} accent />
      <StatCard label="Global rank" value={`#${globalRank}`} />
      <StatCard label="Current streak" value={`${currentStreak}d 🔥`} />
      <StatCard label="Longest streak" value={`${longestStreak}d`} />
    </div>
  );
}

/* ── Presentational helper (complete) ── */

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value?: number | string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`mt-1 truncate text-xl font-bold ${
          accent
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-900 dark:text-slate-50"
        }`}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}
