/**
 * src/components/profile/ActivityHeatmap.tsx — GitHub-style activity graph
 * TODOs: 1 × (practice - calendar data → UI grid)  ← DONE (built for you)
 * The card shell, legend and intensity colour classes are complete; the grid
 * itself is yours. No hooks or interactivity needed — this is pure
 * data-transformation + Tailwind grid work (it can stay a server component).
 */
import type { ActivityDay } from "@/lib/types";

/**
 * Intensity buckets, weakest → strongest. Use these for the cells so the
 * palette stays consistent with the legend below:
 *   [0] 0 submissions   [1] 1–2   [2] 3–4   [3] 5–6   [4] 7+
 */
export const INTENSITY_CLASSES = [
  "bg-slate-200 dark:bg-slate-800",
  "bg-sky-300 dark:bg-sky-900",
  "bg-sky-500 dark:bg-sky-700",
  "bg-blue-600 dark:bg-blue-500",
  "bg-blue-800 dark:bg-blue-300",
] as const;

const DAY_MS = 86_400_000;
const WEEKS = 26;

/** count → intensity bucket index (0–4), matching INTENSITY_CLASSES + legend. */
function bucket(n: number): number {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  if (n <= 4) return 2;
  if (n <= 6) return 3;
  return 4;
}

export function ActivityHeatmap({ activity }: { activity: ActivityDay[] }) {
  // Sparse data → O(1) lookup by "YYYY-MM-DD". An absent day means 0 subs.
  const countByDate = new Map(activity.map((act) => [act.date, act.count]));

  // ── Build the calendar the grid renders (the DATA doesn't drive layout) ──
  // Stay in UTC throughout: the data keys are UTC ISO days, and UTC has no
  // daylight-saving, so every "+1 day" is exactly 24h — that's what dodges the
  // weekday off-by-one the TODO warns about.
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  // First (top-left) cell = the Sunday (WEEKS-1) weeks before THIS week's
  // Sunday. this-week's-Sunday = today − today.getUTCDay() days.
  const firstSunday = new Date(
    today.getTime() - (today.getUTCDay() + (WEEKS - 1) * 7) * DAY_MS,
  );

  // WEEKS*7 cells in column-major (Sun→Sat) order, so each run of 7 fills one
  // column top-to-bottom under grid-flow-col + grid-rows-7 = one week.
  const cells = Array.from({ length: WEEKS * 7 }, (_, i) => {
    const date = new Date(firstSunday.getTime() + i * DAY_MS);
    const iso = date.toISOString().slice(0, 10);
    return {
      iso,
      count: countByDate.get(iso) ?? 0,
      isFuture: date.getTime() > today.getTime(),
      // Format in UTC too, or "Jul 12" can slip back to "Jul 11".
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
    };
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Activity
        </h2>
        <p className="text-xs text-slate-400">
          {activity.reduce((sum, day) => sum + day.count, 0)} submissions in the
          last year
        </p>
      </div>

      {/* overflow-x-auto → the grid scrolls inside the card instead of
          stretching it on narrow screens. w-max lets it be its natural width. */}
      <div className="mt-4 overflow-x-auto">
        <div className="grid grid-flow-col grid-rows-7 gap-1 w-max">
          {cells.map((cell, i) =>
            cell.isFuture ? (
              // Days after today: render nothing, but keep the cell's space so
              // the last column doesn't collapse upward.
              <span key={i} className="h-3 w-3" />
            ) : (
              <span
                key={i}
                title={`${cell.count === 0 ? "No" : cell.count} submissions on ${cell.label}`}
                className={`h-3 w-3 rounded-sm ${INTENSITY_CLASSES[bucket(cell.count)]}`}
              />
            ),
          )}
        </div>
      </div>

      {/* Legend (complete — reuses the same classes your cells must use) */}
      <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-slate-400">
        <span>Less</span>
        {INTENSITY_CLASSES.map((cls) => (
          <span key={cls} className={`h-3 w-3 rounded-sm ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
