/**
 * Contests page (server component). The countdown ticks on the client, in
 * components/contests/Countdown.tsx.
 */
import type { Metadata } from "next";
import { getContests } from "@/lib/api";
import { Countdown } from "@/components/contests/Countdown";
import type { Contest } from "@/lib/types";

export const metadata: Metadata = { title: "Contests" };

function formatStart(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ContestsPage() {
  const contests = await getContests();
  const liveAndUpcoming = contests.filter((c) => c.status !== "past");
  const past = contests.filter((c) => c.status === "past");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Contests</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Compete live — ratings on the line.
        </p>
      </header>

      {/* Live + upcoming */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {liveAndUpcoming.map((contest) => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>

      {/* Past */}
      <section className="mt-12">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Past contests
        </h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium">Contest</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Participants</th>
                <th className="px-4 py-3 font-medium">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {past.map((contest) => (
                <tr
                  key={contest.id}
                  className="bg-white dark:bg-slate-950"
                >
                  <td className="px-4 py-3 font-medium">{contest.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatStart(contest.startsAt)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {contest.registeredCount.toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="mr-1.5">🏆</span>
                    <span className="font-mono text-xs">{contest.winner}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ContestCard({ contest }: { contest: Contest }) {
  const isLive = contest.status === "live";
  return (
    <div
      className={`flex flex-col rounded-xl border p-5 ${
        isLive
          ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/40 dark:bg-emerald-500/5"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{contest.name}</h3>
        {isLive && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            LIVE
          </span>
        )}
      </div>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {contest.description}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-700">
        <div>
          <p>{formatStart(contest.startsAt)}</p>
          <p className="mt-0.5">
            {contest.durationMinutes} min ·{" "}
            {contest.registeredCount.toLocaleString("en-US")} registered
          </p>
        </div>
        <Countdown startsAt={contest.startsAt} durationMinutes={contest.durationMinutes} />
      </div>
      <button
        type="button"
        className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
          isLive
            ? "bg-emerald-600 hover:bg-emerald-500"
            : "bg-blue-600 hover:bg-blue-500"
        }`}
      >
        {isLive ? "Enter arena" : "Register"}
      </button>
    </div>
  );
}
