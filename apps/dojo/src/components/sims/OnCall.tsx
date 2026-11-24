"use client";
import { useState } from "react";
import { INCIDENTS, ONCALL_PASS } from "@/lib/sims/oncall";
import { Moves } from "./Moves";
import { SimFrame } from "./SimFrame";
import { Btn, Say, Stat } from "./ui";

export default function OnCall() {
  const [at, setAt] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const incident = INCIDENTS[at];
  const best = INCIDENTS.filter((x) => picks[x.id] === x.best).length;
  const answered = Object.keys(picks).length;
  const over = answered === INCIDENTS.length;
  const won = over && best >= ONCALL_PASS;
  return (
    <SimFrame
      id="oncall"
      won={won}
      onReset={() => {
        setAt(0);
        setPicks({});
      }}
    >
      <ol aria-label="Shift progress" className="flex gap-1.5">
        {INCIDENTS.map((x, i) => {
          const p = picks[x.id];
          return <li key={x.id} aria-label={`Incident ${i + 1}: ${p === undefined ? "open" : p === x.best ? "best move" : "not the best move"}`} className={`h-2 flex-1 rounded-full ${p === undefined ? (i === at ? "bg-cyan-600" : "bg-slate-200 dark:bg-slate-800") : p === x.best ? "bg-emerald-500" : "bg-rose-400"}`} />;
        })}
      </ol>
      {incident && (
        <>
          <div>
            <p className="text-base font-semibold">
              🚨 Incident {at + 1} of {INCIDENTS.length}: {incident.title}
            </p>
            <p className="mt-1 text-sm">{incident.story}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {incident.metrics.map((m) => (
              <Stat key={m.label} label={m.label} value={m.value} tone={m.bad ? "bad" : "plain"} />
            ))}
          </div>
          <p className="text-sm font-semibold">Your first move?</p>
          <Moves situation={incident} picked={picks[incident.id]} onPick={(i) => setPicks({ ...picks, [incident.id]: i })} />
          <div className="flex flex-wrap items-center gap-3">
            <Btn onClick={() => setAt(at - 1)} disabled={at === 0}>
              ← Back
            </Btn>
            <Btn kind="main" onClick={() => setAt(at + 1)} disabled={picks[incident.id] === undefined || at === INCIDENTS.length - 1}>
              Next incident →
            </Btn>
            <span className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
              {best} best of {answered} answered
            </span>
          </div>
        </>
      )}
      {over && (
        <Say tone={won ? "ok" : "warn"}>
          <strong>
            Shift over: {best} of {INCIDENTS.length}.
          </strong>{" "}
          {best === INCIDENTS.length ? "Flawless. Go and get some sleep." : won ? "The site is up, and so are you." : `You need ${ONCALL_PASS}. Reread the lessons of the red ones, press Reset, and take another shift.`}
        </Say>
      )}
    </SimFrame>
  );
}
