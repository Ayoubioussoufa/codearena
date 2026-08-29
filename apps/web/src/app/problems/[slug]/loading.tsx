/**
 * src/app/problems/[slug]/loading.tsx — workspace skeleton while getProblem() resolves
 * TODOs: none — fully implemented scaffold (extra polish).
 */
export default function ProblemLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 animate-pulse px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Description skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-4 flex gap-2">
            <div className="h-5 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3.5 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3.5 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="mt-8 h-28 rounded-lg bg-slate-100 dark:bg-slate-950" />
          <div className="mt-4 h-28 rounded-lg bg-slate-100 dark:bg-slate-950" />
        </div>
        {/* Editor skeleton */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-36 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="ml-auto h-9 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-9 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-72 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          <div className="h-28 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        </div>
      </div>
    </div>
  );
}
