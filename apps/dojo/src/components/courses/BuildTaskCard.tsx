/**
 * "Today in CodeArena": the day's build in the real project, as directions.
 * Static (no state), so it renders on the server or inside client lists.
 */
import Link from "next/link";
import type { BuildTask } from "@/lib/courses/types";
import { Inline } from "./Inline";

export function BuildTaskCard({ task, date, open = true }: { task: BuildTask; date?: string; open?: boolean }) {
  return (
    <div className="task">
      <span className="label">Today in CodeArena{date ? ` · ${date}` : ""}</span>
      <p className="task-title">{task.title}</p>
      <p>
        <Inline text={task.goal} />
      </p>
      {task.before && task.before.length > 0 && (
        <p className="sans task-before">
          First:{" "}
          {task.before.map((b, i) => (
            <span key={b.href}>
              {i > 0 && " · "}
              <Link href={b.href}>{b.label}</Link>
            </span>
          ))}
        </p>
      )}
      <details open={open}>
        <summary>The steps, the tests first, and when you&apos;re done</summary>
        <ol>
          {task.steps.map((s, i) => (
            <li key={i}>
              <Inline text={s} />
            </li>
          ))}
        </ol>
        {task.testsFirst.length > 0 && (
          <>
            <p className="task-h">Write these tests first (they must fail before your code makes them pass)</p>
            <ul>
              {task.testsFirst.map((s, i) => (
                <li key={i}>
                  <Inline text={s} />
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="task-h">Done when</p>
        <ul className="checklist-plain">
          {task.doneWhen.map((s, i) => (
            <li key={i}>
              <Inline text={s} />
            </li>
          ))}
        </ul>
        {task.traps && task.traps.length > 0 && (
          <>
            <p className="task-h">Traps</p>
            <ul>
              {task.traps.map((s, i) => (
                <li key={i}>
                  <Inline text={s} />
                </li>
              ))}
            </ul>
          </>
        )}
        {task.branch && (
          <p className="sans muted" style={{ fontSize: "0.85rem" }}>
            Branch: <code>{task.branch}</code> · a PR, then merge when CI is green.
          </p>
        )}
      </details>
    </div>
  );
}
