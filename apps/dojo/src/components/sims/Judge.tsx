"use client";
import { useState } from "react";
import { DISASTERS, JUDGE_STEPS } from "@/lib/sims/judge";
import { FlowMap, type FlowNode } from "./FlowMap";
import { Moves } from "./Moves";
import { SimFrame } from "./SimFrame";
import { Btn, Say } from "./ui";

const NODES: readonly FlowNode[] = [
  { id: "browser", label: "Browser", x: 60, y: 56 },
  { id: "api", label: "API", x: 196, y: 56 },
  { id: "queue", label: "Queue", x: 332, y: 56 },
  { id: "worker", label: "Worker", x: 462, y: 56 },
  { id: "sandbox", label: "Sandbox", x: 584, y: 56 },
  { id: "postgres", label: "Postgres", x: 332, y: 184 },
  { id: "board", label: "Leaderboard", x: 560, y: 184 },
];
const EDGES = [["browser", "api"], ["api", "postgres"], ["api", "queue"], ["queue", "worker"], ["worker", "postgres"], ["worker", "sandbox"], ["worker", "board"]] as const;
const VICTIM: Record<string, string> = { "api-dies": "api", "worker-dies": "worker", "docker-down": "sandbox", "redis-after": "board", "slow-worker": "worker" };

export default function Judge() {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const d = open === null ? undefined : DISASTERS[open];
  const survived = DISASTERS.filter((x) => picks[x.id] === x.best).length;
  const answered = DISASTERS.filter((x) => picks[x.id] !== undefined).length;
  const shown = d ? d.step : step;
  const s = JUDGE_STEPS[shown];

  function sabotage(i: number) {
    setOpen(i);
  }
  function reset() {
    setStep(0);
    setOpen(null);
    setPicks({});
  }
  return (
    <SimFrame id="judge" won={survived === DISASTERS.length} onReset={reset}>
      <p className="text-sm">
        This is CodeArena&apos;s real path, from Submit to the leaderboard. Walk it once, then break it: each disaster asks what saves the submission <em>in the code as it is today</em>.
      </p>
      <FlowMap nodes={NODES} edges={EDGES} active={s ? { from: s.from, to: s.to } : null} step={shown} broken={d ? VICTIM[d.id] : undefined} label="A submission travelling through CodeArena's judge" />
      <div className="flex flex-wrap items-center gap-2">
        <Btn onClick={() => { setOpen(null); setStep(Math.max(0, shown - 1)); }} disabled={shown === 0}>
          ← Back
        </Btn>
        <Btn kind="main" onClick={() => { setOpen(null); setStep(Math.min(JUDGE_STEPS.length - 1, shown + 1)); }} disabled={shown === JUDGE_STEPS.length - 1}>
          Next →
        </Btn>
        <span className="text-sm" aria-live="polite">
          {shown + 1}. {s?.label}
        </span>
      </div>
      <div>
        <p className="mb-1.5 text-sm text-slate-600 dark:text-slate-400">Disasters, easiest first:</p>
        <div className="flex flex-wrap gap-2">
          {DISASTERS.map((x, i) => {
            const p = picks[x.id];
            return (
              <Btn key={x.id} kind={i === open ? "danger" : "soft"} onClick={() => sabotage(i)}>
                {p === undefined ? "💣" : p === x.best ? "✓" : "✗"} {x.title}
              </Btn>
            );
          })}
        </div>
      </div>
      {d && (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            {d.story} <strong>What happens?</strong>
          </p>
          <Moves situation={d} picked={picks[d.id]} onPick={(i) => setPicks({ ...picks, [d.id]: i })} />
        </div>
      )}
      {answered === DISASTERS.length && survived < DISASTERS.length && (
        <Say tone="warn">
          {survived} of {DISASTERS.length}. Read the outcomes of the ones you missed, then press Reset and take the whole set again: this is the follow-up gauntlet of your own interview.
        </Say>
      )}
      <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
        Survived {survived} of {DISASTERS.length}
      </p>
    </SimFrame>
  );
}
