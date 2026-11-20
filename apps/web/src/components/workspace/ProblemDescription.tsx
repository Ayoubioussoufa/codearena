/**
 * Left pane: the problem statement (read-only).
 */
import type { Problem } from "@/lib/types";
import { DifficultyBadge } from "@/components/DifficultyBadge";

export function ProblemDescription({ problem }: { problem: Problem }) {
  return (
    <article className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {problem.id}. {problem.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Acceptance {problem.acceptanceRate}% ·{" "}
          {problem.totalSubmissions.toLocaleString("en-US")} submissions
        </p>
      </header>

      <div className="flex flex-col gap-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
        {problem.description.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        {problem.examples.map((example, i) => (
          <div key={example.input}>
            <h2 className="mb-2 text-sm font-semibold">Example {i + 1}</h2>
            <div className="rounded-lg bg-slate-50 p-4 font-mono text-xs leading-6 dark:bg-slate-950">
              <p>
                <span className="font-semibold text-slate-500">Input: </span>
                <span className="text-slate-800 dark:text-slate-200">{example.input}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-500">Output: </span>
                <span className="text-slate-800 dark:text-slate-200">{example.output}</span>
              </p>
              {example.explanation && (
                <p className="mt-1 font-sans text-slate-500 dark:text-slate-400">
                  {example.explanation}
                </p>
              )}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Constraints</h2>
        <ul className="flex list-inside list-disc flex-col gap-1 font-mono text-xs text-slate-600 dark:text-slate-400">
          {problem.constraints.map((constraint) => (
            <li key={constraint}>{constraint}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
