/**
 * Leaderboard page (server component).
 *
 * The data is fetched on the server and handed to LeaderboardTable, a client
 * component that only derives ranks and sort order from it.
 */
import type { Metadata } from "next";
import { getLeaderboard } from "@/lib/api";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";

export const metadata: Metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Global leaderboard
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Season 3 · rankings update after every ranked duel.
        </p>
      </header>
      <LeaderboardTable entries={entries} />
    </div>
  );
}
