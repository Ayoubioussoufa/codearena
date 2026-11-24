"use client";
import { useState } from "react";
import { LATENCY_STREAK, duel, human, real, type Op } from "@/lib/sims/latency";
import { SimFrame } from "./SimFrame";
import { Btn, Say } from "./ui";

export default function Latency() {
  const [seed, setSeed] = useState(1);
  const [picked, setPicked] = useState<Op | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const pair = duel(seed);
  const [slow, fast] = pair[0].ns > pair[1].ns ? pair : [pair[1], pair[0]];
  const ratio = slow.ns / fast.ns;

  function pick(op: Op) {
    if (picked) return;
    const next = op === slow ? streak + 1 : 0;
    setPicked(op);
    setStreak(next);
    setBest(Math.max(best, next));
  }
  function deal() {
    setSeed((Date.now() % 1_000_000) + 2);
    setPicked(null);
  }
  return (
    <SimFrame
      id="latency"
      won={best >= LATENCY_STREAK}
      onReset={() => {
        setStreak(0);
        setBest(0);
        deal();
      }}
    >
      <p className="text-sm">
        <strong>Which one takes longer?</strong>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {pair.map((op) => {
          const state = !picked ? "border-slate-300 bg-white hover:border-cyan-500 dark:border-slate-700 dark:bg-slate-900" : op === slow ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : op === picked ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";
          return (
            <button key={op.name} type="button" disabled={picked !== null} onClick={() => pick(op)} className={`min-h-28 rounded-xl border-2 p-4 text-left transition-colors ${state}`}>
              <span className="block text-base">{op.name}</span>
              {picked && (
                <span className="mt-2 block text-sm text-slate-600 dark:text-slate-400">
                  <strong className="font-mono text-slate-900 dark:text-slate-100">{real(op.ns)}</strong>, or {human(op.ns)} if a nanosecond were a second
                </span>
              )}
            </button>
          );
        })}
      </div>
      {picked && (
        <Say tone={picked === slow ? "ok" : "bad"}>
          <strong>{picked === slow ? "Yes." : "The other one."}</strong> It&apos;s {ratio >= 1000 ? Math.round(ratio).toLocaleString("en") : ratio.toFixed(ratio < 10 ? 1 : 0)}× slower.
        </Say>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Btn kind="main" onClick={deal} disabled={!picked}>
          Next duel →
        </Btn>
        <span className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
          Streak {streak} · best {best} of {LATENCY_STREAK}
        </span>
      </div>
    </SimFrame>
  );
}
