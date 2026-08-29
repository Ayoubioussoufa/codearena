/**
 * Compact "what this drills you to build" panel shown on a topic's practice
 * start screen. Receives already-scanned bridge data (serializable) from the
 * server route — this component itself does no filesystem work.
 */
import Link from "next/link";
import type { TopicBridge } from "@/lib/bridge";

export function BuildBridgePanel({ bridge }: { bridge: TopicBridge }) {
  const { webTodos, phaseTargets } = bridge;
  if (webTodos.length === 0 && phaseTargets.length === 0) return null;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          What you&apos;re practicing this to build
        </p>
        <Link href="/build" className="text-xs text-cyan-700 hover:underline dark:text-cyan-400">
          Full build map →
        </Link>
      </div>

      <ul className="mt-2 flex flex-col gap-2 text-sm">
        {webTodos.map((todo) => (
          <li key={`${todo.file}:${todo.line}`} className="flex items-start gap-2">
            <span
              className="mt-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
              title="an open TODO(practice) gap in apps/web"
            >
              todo
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-slate-600 dark:text-slate-300">{todo.skill}</span>
              <span className="ml-1.5 break-all font-mono text-xs text-slate-400">
                {todo.file.replace(/^apps\/web\/src\//, "")}:{todo.line}
              </span>
            </span>
          </li>
        ))}
        {phaseTargets.map((target) => (
          <li key={target.title} className="flex items-start gap-2">
            <span
              className="mt-0.5 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              title={target.app === "api" ? "backend build target" : "frontend build target"}
            >
              {target.app}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-slate-600 dark:text-slate-300">{target.title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-400">
                {target.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
