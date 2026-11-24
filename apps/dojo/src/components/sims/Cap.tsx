"use client";
import { useReducer } from "react";
import { CAP_START, capReducer, capWon, type Side } from "@/lib/sims/cap";
import { SimFrame } from "./SimFrame";
import { Btn, Check, Segmented } from "./ui";

const SIDES: readonly { side: Side; place: string }[] = [
  { side: "A", place: "Casablanca (2 of 3 votes)" },
  { side: "B", place: "Frankfurt (1 of 3 votes)" },
];

export default function Cap() {
  const [s, dispatch] = useReducer(capReducer, CAP_START);
  return (
    <SimFrame id="cap" won={capWon(s)} onReset={() => dispatch({ type: "reset" })}>
      <Segmented
        label="During a partition, this system prefers"
        value={s.mode}
        options={[
          { value: "CP", label: "CP: being right" },
          { value: "AP", label: "AP: answering" },
        ]}
        onChange={(mode) => dispatch({ type: "mode", mode })}
      />
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        {SIDES.map(({ side, place }, i) => (
          <div key={side} className={`rounded-xl border-2 border-slate-300 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-900 ${i === 1 ? "sm:order-3" : ""}`}>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {side} · {place}
            </p>
            <p className={`my-2 font-mono text-3xl font-bold ${s.value.A !== s.value.B ? "text-rose-700 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"}`}>{s.value[side]}</p>
            <div className="flex justify-center gap-2">
              <Btn onClick={() => dispatch({ type: "write", side })}>Write</Btn>
              <Btn onClick={() => dispatch({ type: "read", side })}>Read</Btn>
            </div>
          </div>
        ))}
        <div className="flex flex-col items-center gap-2 sm:order-2">
          <span aria-hidden className="text-2xl">
            {s.cut ? "✂️" : "🔗"}
          </span>
          {s.cut ? (
            <Btn kind="main" onClick={() => dispatch({ type: "heal" })}>
              Reconnect
            </Btn>
          ) : (
            <Btn kind="danger" onClick={() => dispatch({ type: "cut" })}>
              Cut the cable
            </Btn>
          )}
        </div>
      </div>
      <ol aria-live="polite" className="flex min-h-32 flex-col gap-1 rounded-lg border border-slate-200 bg-white p-3 font-mono text-sm dark:border-slate-800 dark:bg-slate-900">
        {s.log.length === 0 && <li className="text-slate-500">Write on one side and read on the other. Then cut the cable and do it again.</li>}
        {s.log.map((l, i) => (
          <li key={`${i}-${l.text}`} className={`${i === 0 ? "" : "opacity-60"} ${l.tone === "bad" ? "text-rose-700 dark:text-rose-400" : l.tone === "ok" ? "text-emerald-700 dark:text-emerald-400" : ""}`}>
            {l.text}
          </li>
        ))}
      </ol>
      <ul className="flex flex-col gap-1">
        <Check done={s.seen.refused}>A request refused, to stay right (CP)</Check>
        <Check done={s.seen.disagree}>Two sides giving different answers (AP)</Check>
        <Check done={s.seen.lost}>A write that vanished when the two sides met again</Check>
      </ul>
    </SimFrame>
  );
}
