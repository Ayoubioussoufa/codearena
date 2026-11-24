"use client";
import { useReducer, useState } from "react";
import { WHERETO, WHICHTEST, WORTHIT } from "@/lib/sims/arch/decks";
import { LAYERS, errorTrace } from "@/lib/sims/arch/errors";
import { CALLS, ORDER_START, holds, invariantWon, orderReducer, sum } from "@/lib/sims/arch/invariant";
import { DESIGNS, crashAt, type CrashResult, type Design } from "@/lib/sims/arch/outbox";
import { ARROWS, BLAST, BOUNDARY } from "@/lib/sims/arch/picks";
import { VILLAINS, VILLAINS_PASS } from "@/lib/sims/arch/villains";
import { CardStation, CaseStation, PickStation, TraceStation } from "../engines";
import { SimFrame } from "../SimFrame";
import { Btn, Check, Say, Segmented, Stat, Toggle } from "../ui";

export const Blast = () => <PickStation id="blast" levels={BLAST} verb="These files change" />;
export const Arrows = () => <PickStation id="arrows" levels={ARROWS} verb="Flag these" />;
export const Boundary = () => <PickStation id="boundary" levels={BOUNDARY} verb="These get out" />;
export const Whereto = () => <CardStation id="whereto" deck={WHERETO} />;
export const Worthit = () => <CardStation id="worthit" deck={WORTHIT} />;
export const Whichtest = () => <CardStation id="whichtest" deck={WHICHTEST} />;

export function Invariant() {
  const [s, send] = useReducer(orderReducer, ORDER_START);
  const ok = holds(s);
  return (
    <SimFrame id="invariant" won={invariantWon(s)} onReset={() => send({ type: "reset" })}>
      <p className="text-sm">The rule: an order&apos;s total is always the sum of its lines. You are the rest of the codebase, calling whatever compiles.</p>
      <Segmented label="The Order class" value={s.closed ? "closed" : "open"} options={[{ value: "open", label: "Everything public" }, { value: "closed", label: "One door: addLine()" }]} onChange={(v) => send({ type: "door", closed: v === "closed" })} />
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Lines" value={s.lines.join(" + ")} />
        <Stat label="Their sum" value={String(sum(s.lines))} />
        <Stat label="total" value={String(s.total)} tone={ok ? "ok" : "bad"} />
      </div>
      <div className="flex flex-wrap gap-2">
        {CALLS.map((c) => (
          <Btn key={c.id} onClick={() => send({ type: "call", id: c.id })}>
            <span className="font-mono">
              {s.tried.includes(c.id) ? "✓ " : ""}
              {c.code}
            </span>
          </Btn>
        ))}
      </div>
      <Say tone={s.log[0]?.tone === "bad" ? "bad" : s.log[0]?.tone === "ok" ? "ok" : "plain"}>{s.log[0]?.text ?? "Call something."}</Say>
      <ul className="flex flex-col gap-1">
        <Check done={s.broke}>The rule was broken through an open door</Check>
        <Check done={s.closed && CALLS.every((c) => s.tried.includes(c.id))}>All four calls tried on the closed one</Check>
      </ul>
    </SimFrame>
  );
}

export function Errors() {
  return (
    <TraceStation id="errors" trace={errorTrace}>
      {(s) => (
        <>
          <p className="text-sm">{s.story}</p>
          <ol className="grid grid-cols-3 gap-2">
            {LAYERS.map((name, i) => (
              <li key={name} aria-current={i === s.layer ? "step" : undefined} className={`rounded-lg border-2 px-1 py-2 text-center font-mono text-xs sm:text-sm ${i === s.layer ? "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200" : i < s.layer ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"}`}>
                {i === s.layer ? "💥 " : i < s.layer ? "✓ " : ""}
                {name}
              </li>
            ))}
          </ol>
        </>
      )}
    </TraceStation>
  );
}

const NAMES: readonly { value: Design; label: string }[] = (["inside", "after", "outbox"] as const).map((d) => ({ value: d, label: DESIGNS[d].name }));
const fine = (r: CrashResult) => r.verdict === "good" || r.verdict === "nothing";
export function Outbox() {
  const [design, setDesign] = useState<Design>("inside");
  const [idempotent, setIdempotent] = useState(false);
  const [crash, setCrash] = useState<number | null>(null);
  /** Crash points tried, per design and key. */
  const [tried, setTried] = useState<Readonly<Record<string, readonly number[]>>>({});
  const [seen, setSeen] = useState({ robbed: false, free: false, survived: false });
  const steps = DESIGNS[design].steps;
  const key = `${design}-${idempotent}`;
  const mine = tried[key] ?? [];
  const r = crash === null ? null : crashAt(design, crash, idempotent);

  function pull(at: number) {
    const result = crashAt(design, at, idempotent);
    const now = mine.includes(at) ? mine : [...mine, at];
    setCrash(at);
    setTried({ ...tried, [key]: now });
    setSeen({
      robbed: seen.robbed || result.verdict === "robbed",
      free: seen.free || result.verdict === "free",
      survived: seen.survived || (now.length === steps.length + 1 && now.every((n) => fine(crashAt(design, n, idempotent)))),
    });
  }
  return (
    <SimFrame
      id="outbox"
      won={seen.robbed && seen.free && seen.survived}
      onReset={() => {
        setDesign("inside");
        setIdempotent(false);
        setCrash(null);
        setTried({});
        setSeen({ robbed: false, free: false, survived: false });
      }}
    >
      <p className="text-sm">Place an order and charge a card. Pull the plug anywhere, then look at what&apos;s left after the restart.</p>
      <Segmented label="Design" value={design} options={NAMES} onChange={(v) => { setDesign(v); setCrash(null); }} />
      <Toggle label="Send an idempotency key with the charge" on={idempotent} onChange={(v) => { setIdempotent(v); setCrash(null); }} />
      <ol className="flex flex-col gap-1">
        {Array.from({ length: steps.length + 1 }, (_, i) => {
          const step = steps[i];
          const result = mine.includes(i) ? crashAt(design, i, idempotent) : null;
          return (
            <li key={i} className="flex flex-col gap-1">
              <button type="button" aria-pressed={crash === i} onClick={() => pull(i)} className={`w-fit rounded-lg border px-2.5 py-1 text-left text-xs ${crash === i ? "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200" : "border-dashed border-slate-300 text-slate-600 hover:border-rose-400 dark:border-slate-700 dark:text-slate-400"}`}>
                {result ? (fine(result) ? "✓ " : "✗ ") : "⚡ "}
                {step ? "crash here" : "no crash"}
              </button>
              {step && <span className={`rounded-lg border-2 px-3 py-1.5 font-mono text-sm ${crash !== null && i < crash ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"}`}>{step.label}</span>}
            </li>
          );
        })}
      </ol>
      {r && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Order in the database" value={r.order ? "yes" : "no"} />
            <Stat label="Charges on the card" value={String(r.charges)} tone={r.charges > 1 ? "bad" : "plain"} />
          </div>
          <Say tone={fine(r) ? "ok" : "bad"}>{r.text}</Say>
        </>
      )}
      <ul className="flex flex-col gap-1">
        <Check done={seen.robbed}>A crash that takes money with no order</Check>
        <Check done={seen.free}>A crash that leaves an order nobody pays for</Check>
        <Check done={seen.survived}>A design tested at every point, and safe at all of them</Check>
      </ul>
    </SimFrame>
  );
}

export function Villains() {
  return <CaseStation id="villains" cases={VILLAINS} pass={VILLAINS_PASS} noun="Suspect" ask="Who is it, and what's the cure?" endings={{ perfect: "Case closed, all of them.", won: "Most of them won't trouble you again.", lost: `You need ${VILLAINS_PASS}. Reread the lessons of the red ones, press Reset, and reopen the case.` }} />;
}
