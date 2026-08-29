/**
 * src/app/not-found.tsx — custom 404
 * TODOs: none — fully implemented scaffold (extra page for polish).
 */
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 font-mono text-xs text-slate-500">judge output</span>
          </div>
          <pre className="p-4 font-mono text-xs leading-6 text-slate-700 dark:text-slate-300">
            <code>{`$ resolve ./page
Error 404: route not found
  at Router.match (arena/router.ts:42)

verdict: WRONG ANSWER`}</code>
          </pre>
        </div>
        <h1 className="mt-8 text-2xl font-bold tracking-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Even the best submissions miss an edge case sometimes.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Back home
          </Link>
          <Link
            href="/problems"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Browse problems
          </Link>
        </div>
      </div>
    </div>
  );
}
