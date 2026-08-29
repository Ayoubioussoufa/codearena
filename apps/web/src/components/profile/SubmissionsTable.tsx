/**
 * src/components/profile/SubmissionsTable.tsx — recent submissions list
 * TODOs: none — fully implemented scaffold.
 */
import Link from "next/link";
import type { Submission, Verdict } from "@/lib/types";
import { LANGUAGE_LABELS } from "@/lib/types";
import { DifficultyBadge } from "@/components/DifficultyBadge";

const VERDICT_STYLES: Record<Verdict, string> = {
  Accepted: "text-emerald-600 dark:text-emerald-400",
  "Wrong Answer": "text-rose-600 dark:text-rose-400",
  "Time Limit Exceeded": "text-amber-600 dark:text-amber-400",
  "Runtime Error": "text-orange-600 dark:text-orange-400",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionsTable({ submissions }: { submissions: Submission[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <tr>
            <th className="px-4 py-3 font-medium">Problem</th>
            <th className="px-4 py-3 font-medium">Verdict</th>
            <th className="px-4 py-3 font-medium">Language</th>
            <th className="px-4 py-3 font-medium">When</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {submissions.map((submission) => (
            <tr
              key={submission.id}
              className="bg-white transition-colors hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/problems/${submission.problemSlug}`}
                  className="font-medium hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {submission.problemTitle}
                </Link>
                <span className="ml-2">
                  <DifficultyBadge difficulty={submission.difficulty} />
                </span>
              </td>
              <td className={`px-4 py-3 font-medium ${VERDICT_STYLES[submission.verdict]}`}>
                {submission.verdict}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">
                {LANGUAGE_LABELS[submission.language]}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {formatWhen(submission.submittedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
