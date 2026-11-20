/**
 * Run results (presentational).
 */
"use client";

import type { RunResult } from "@/lib/types";

export interface OutputPanelProps {
  result: RunResult | null;
  isRunning: boolean;
}

export function OutputPanel({ result, isRunning }: OutputPanelProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Output
      </h2>

      {isRunning ? (
        <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
          Judging your submission…
        </p>
      ) : result === null ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Run your code to see the verdict here.
        </p>
      ) : result.status === "error" ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          {result.message}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p
            className={`text-sm font-semibold ${
              result.status === "passed"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {result.status === "passed" ? "Accepted" : "Wrong Answer"}
            <span className="ml-2 font-normal text-slate-400">
              {result.runtimeMs} ms
            </span>
          </p>
          <ul className="flex flex-col gap-2">
            {result.tests.map((test) => (
              <li
                key={test.name}
                className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs dark:bg-slate-950"
              >
                <span className={test.passed ? "text-emerald-500" : "text-rose-500"}>
                  {test.passed ? "✓" : "✗"}
                </span>
                <span className="flex-1">
                  <span className="text-slate-700 dark:text-slate-300">{test.name}</span>
                  {!test.passed && (
                    <span className="mt-1 block text-slate-500">
                      expected {test.expected} · got {test.received}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
