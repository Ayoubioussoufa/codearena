/**
 * Site footer.
 */
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 dark:text-slate-400">
        <p className="font-mono">
          © {new Date().getFullYear()} CodeArena — sharpen your edge.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/problems" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
            Problems
          </Link>
          <Link href="/contests" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
            Contests
          </Link>
          <Link href="/leaderboard" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
            Leaderboard
          </Link>
          <Link href="/register" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
            Join
          </Link>
        </div>
      </div>
    </footer>
  );
}
