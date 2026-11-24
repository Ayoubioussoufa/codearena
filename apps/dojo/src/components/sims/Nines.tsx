"use client";
import { useState } from "react";
import { MAX_COPIES, NINES_BUDGET, NINES_START, NINES_TARGET, PARTS, boxes, chain, downtime, ninesWon, partAvailability } from "@/lib/sims/nines";
import { SimFrame } from "./SimFrame";
import { Btn, Say, Stat } from "./ui";

const pct = (a: number) => `${(a * 100).toFixed(a >= 0.99995 ? 5 : 3)}%`;

export default function Nines() {
  const [copies, setCopies] = useState(NINES_START);
  const total = chain(copies);
  const used = boxes(copies);
  const won = ninesWon(copies);
  const weakest = PARTS.reduce((w, p) => (partAvailability(p, copies[p.id] ?? 1) < partAvailability(w, copies[w.id] ?? 1) ? p : w));
  return (
    <SimFrame id="nines" won={won} onReset={() => setCopies(NINES_START)}>
      <p className="text-sm">A request must pass through all four parts. Give a part a twin and it fails only when both do.</p>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PARTS.map((p) => {
          const n = copies[p.id] ?? 1;
          const set = (next: number) => setCopies({ ...copies, [p.id]: next });
          return (
            <li key={p.id} className={`flex flex-col gap-2 rounded-xl border-2 p-3 ${p === weakest ? "border-amber-500" : "border-slate-200 dark:border-slate-800"} bg-white dark:bg-slate-900`}>
              <span className="text-sm font-semibold">{p.name}</span>
              <span className="flex min-h-8 gap-1.5" aria-label={`${n} running`}>
                {Array.from({ length: n }, (_, i) => (
                  <span key={i} aria-hidden className="grid h-8 w-8 place-items-center rounded-md bg-slate-200 text-base dark:bg-slate-800">
                    🖥️
                  </span>
                ))}
              </span>
              <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{pct(partAvailability(p, n))}</span>
              <span className="flex gap-1.5">
                <Btn onClick={() => set(n - 1)} disabled={n <= 1}>
                  −
                </Btn>
                <Btn onClick={() => set(n + 1)} disabled={n >= MAX_COPIES}>
                  +
                </Btn>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Whole chain" value={pct(total)} tone={total >= NINES_TARGET ? "ok" : "bad"} />
        <Stat label="Down per year" value={downtime(total)} tone={total >= NINES_TARGET ? "ok" : "bad"} />
        <Stat label="Boxes" value={`${used} of ${NINES_BUDGET}`} tone={used <= NINES_BUDGET ? "ok" : "bad"} />
      </div>
      <Say tone={won ? "ok" : "plain"}>
        {won
          ? "Three nines. Notice you left the strongest link alone, and that the weakest one is now the ceiling: no amount of app servers would lift the chain above it."
          : used > NINES_BUDGET
            ? "Over budget. Which twin is buying you the least?"
            : `The weakest link right now is the ${weakest.name.toLowerCase()}: the chain can't be better than it.`}{" "}
        <span className="opacity-80">(This assumes failures are independent. Two boxes on one power cable aren&apos;t.)</span>
      </Say>
    </SimFrame>
  );
}
