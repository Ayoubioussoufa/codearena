"use client";
/** The engines behind many stations: traces, decks, picks and cases. */
import { useState, type ReactNode } from "react";
import type { SimId } from "@/lib/sims/catalog";
import type { Deck, PickLevel, Trace } from "@/lib/sims/engines";
import type { Situation } from "@/lib/sims/quiz";
import { Moves } from "./Moves";
import { SimFrame } from "./SimFrame";
import { Btn, Say } from "./ui";

export function LevelTabs({ names, solved, level, onOpen }: { names: readonly string[]; solved: readonly boolean[]; level: number; onOpen: (i: number) => void }) {
  if (names.length === 1) return null;
  return (
    <div role="group" aria-label="Levels" className="flex flex-wrap gap-2">
      {names.map((name, i) => (
        <Btn key={name} kind={i === level ? "main" : "soft"} onClick={() => onOpen(i)}>
          {solved[i] ? "✓ " : ""}
          {name}
        </Btn>
      ))}
    </div>
  );
}

/** A strip of progress: one segment per question. */
function Strip({ label, marks, current }: { label: string; marks: readonly (boolean | undefined)[]; current: number }) {
  return (
    <ol aria-label={label} className="flex gap-1.5">
      {marks.map((m, i) => (
        <li key={i} aria-label={`${i + 1}: ${m === undefined ? "open" : m ? "right" : "wrong"}`} className={`h-2 flex-1 rounded-full ${m === undefined ? (i === current ? "bg-cyan-600" : "bg-slate-200 dark:bg-slate-800") : m ? "bg-emerald-500" : "bg-rose-400"}`} />
      ))}
    </ol>
  );
}

/** Code scrolls sideways; messages (`wrap`) don't need to. */
export function Exhibit({ children, wrap = false }: { children: string; wrap?: boolean }) {
  return <pre className={`m-0 rounded-lg ${wrap ? "whitespace-pre-wrap" : "overflow-x-auto"} border border-slate-300 bg-slate-900 p-3 text-xs leading-5 text-slate-100 dark:border-slate-700 dark:bg-slate-950`}>{children}</pre>;
}

/** "You are the algorithm". `onBoard` hides the moves the board itself offers. */
export function TraceStation<S>({ id, trace, onBoard, children }: { id: SimId; trace: Trace<S>; onBoard?: (move: string) => boolean; children: (s: S, play: (move: string) => void) => ReactNode }) {
  const [level, setLevel] = useState(0);
  const [state, setState] = useState<S>(() => trace.start(0));
  const [mistakes, setMistakes] = useState(0);
  const [why, setWhy] = useState<string | null>(null);
  const [solved, setSolved] = useState<readonly boolean[]>(trace.levels.map(() => false));
  const over = trace.done(state);
  const clean = over && mistakes === 0;

  function open(i: number) {
    setLevel(i);
    setState(trace.start(i));
    setMistakes(0);
    setWhy(null);
  }
  function play(move: string) {
    if (over) return;
    if (!trace.correct(state).includes(move)) {
      setMistakes(mistakes + 1);
      setWhy(trace.why(state, move));
      return;
    }
    const next = trace.apply(state, move);
    setState(next);
    setWhy(null);
    if (trace.done(next) && mistakes === 0) setSolved(solved.map((s, i) => s || i === level));
  }
  const buttons = trace.moves(state).filter((m) => !onBoard?.(m.id));
  const nextOpen = solved.findIndex((s, i) => !s && i !== level);
  return (
    <SimFrame
      id={id}
      won={solved.every(Boolean)}
      onReset={() => {
        open(0);
        setSolved(trace.levels.map(() => false));
      }}
    >
      <LevelTabs names={trace.levels} solved={solved} level={level} onOpen={open} />
      {children(state, play)}
      {!over && buttons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {buttons.map((m) => (
            <Btn key={m.id} onClick={() => play(m.id)}>
              {m.label}
            </Btn>
          ))}
        </div>
      )}
      <Say tone={why !== null ? "bad" : over ? (clean ? "ok" : "warn") : "plain"}>
        {why !== null && <strong>Not that one. </strong>}
        {why ?? trace.say(state)}
        {over && !clean && ` Finished with ${mistakes} mistake${mistakes === 1 ? "" : "s"}: do it again without one.`}
      </Say>
      <div className="flex flex-wrap items-center gap-3">
        <Btn onClick={() => open(level)}>Restart this level</Btn>
        {clean && nextOpen >= 0 && (
          <Btn kind="main" onClick={() => open(nextOpen)}>
            Next level →
          </Btn>
        )}
        <span className="text-sm text-slate-600 dark:text-slate-400">Mistakes: {mistakes}</span>
      </div>
    </SimFrame>
  );
}

export function CardStation({ id, deck }: { id: SimId; deck: Deck }) {
  const [at, setAt] = useState(0);
  const [picks, setPicks] = useState<readonly string[]>([]);
  const card = deck.cards[at];
  const pick = picks[at];
  const right = deck.cards.filter((c, i) => picks[i] === c.answer).length;
  const over = picks.length === deck.cards.length;
  const won = over && right >= deck.pass;
  return (
    <SimFrame
      id={id}
      won={won}
      onReset={() => {
        setAt(0);
        setPicks([]);
      }}
    >
      <Strip label="Cards" marks={deck.cards.map((c, i) => (picks[i] === undefined ? undefined : picks[i] === c.answer))} current={at} />
      {card && (
        <>
          <p className="rounded-xl border-2 border-slate-300 bg-white px-4 py-5 text-center text-lg dark:border-slate-700 dark:bg-slate-900">{card.text}</p>
          <p className="text-sm font-semibold">{deck.ask}</p>
          <div className="flex flex-wrap gap-2">
            {(card.options ?? deck.options).map((o) => {
              const look =
                pick === undefined
                  ? "border-slate-300 bg-white hover:border-cyan-500 dark:border-slate-700 dark:bg-slate-900"
                  : o === card.answer
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                    : o === pick
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40"
                      : "border-slate-200 bg-white opacity-60 dark:border-slate-800 dark:bg-slate-900";
              return (
                <button key={o} type="button" disabled={pick !== undefined} onClick={() => setPicks([...picks, o])} className={`rounded-lg border-2 px-3.5 py-2 text-sm font-semibold transition-colors ${look}`}>
                  {pick !== undefined && o === card.answer ? "✓ " : pick === o ? "✗ " : ""}
                  {o}
                </button>
              );
            })}
          </div>
          {pick !== undefined && (
            <Say tone={pick === card.answer ? "ok" : "warn"}>
              <strong>{pick === card.answer ? "Right." : `It's ${card.answer}.`}</strong> {card.why}
            </Say>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Btn onClick={() => setAt(at - 1)} disabled={at === 0}>
              ← Back
            </Btn>
            <Btn kind="main" onClick={() => setAt(at + 1)} disabled={pick === undefined || at === deck.cards.length - 1}>
              Next card →
            </Btn>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {right} right of {picks.length}
            </span>
          </div>
        </>
      )}
      {over && (
        <Say tone={won ? "ok" : "warn"}>
          <strong>
            {right} of {deck.cards.length}.
          </strong>{" "}
          {won ? (right === deck.cards.length ? "Flawless." : "Passed.") : `You need ${deck.pass}. Reread the red ones, press Reset, and go again.`}
        </Say>
      )}
    </SimFrame>
  );
}

/** Tick exactly the right lines, then check. A wrong check says how far off, not where. */
export function PickStation({ id, levels, verb }: { id: SimId; levels: readonly PickLevel[]; verb: string }) {
  const [level, setLevel] = useState(0);
  const [picked, setPicked] = useState<readonly string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const [solved, setSolved] = useState<readonly boolean[]>(levels.map(() => false));
  const l = levels[level];
  const done = solved[level] === true;

  function open(i: number) {
    setLevel(i);
    setPicked([]);
    setMiss(null);
  }
  function toggle(x: string) {
    setPicked(picked.includes(x) ? picked.filter((p) => p !== x) : [...picked, x]);
    setMiss(null);
  }
  function check() {
    if (!l) return;
    const extra = picked.filter((p) => !l.right.includes(p)).length;
    const missing = l.right.filter((r) => !picked.includes(r)).length;
    if (extra + missing === 0) {
      setMiss(null);
      setSolved(solved.map((s, i) => s || i === level));
      return;
    }
    setMiss([extra > 0 && `${extra} too many`, missing > 0 && `${missing} missing`].filter(Boolean).join(", "));
  }
  return (
    <SimFrame
      id={id}
      won={solved.every(Boolean)}
      onReset={() => {
        open(0);
        setSolved(levels.map(() => false));
      }}
    >
      <LevelTabs names={levels.map((x) => x.name)} solved={solved} level={level} onOpen={open} />
      {l && (
        <>
          <p className="text-sm">{l.story}</p>
          {l.exhibit && <Exhibit>{l.exhibit}</Exhibit>}
          <ul className="flex flex-col gap-1.5">
            {l.items.map((x) => {
              const right = l.right.includes(x.id);
              const on = done ? right : picked.includes(x.id);
              return (
                <li key={x.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    disabled={done}
                    onClick={() => toggle(x.id)}
                    className={`flex w-full items-start gap-2.5 rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors ${on ? (done ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "border-cyan-600 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-950/40") : "border-slate-200 bg-white hover:border-cyan-400 dark:border-slate-800 dark:bg-slate-900"}`}
                  >
                    <span aria-hidden className="font-mono">{on ? "☑" : "☐"}</span>
                    <span className="min-w-0">
                      <span className="break-words font-mono">{x.label}</span>
                      {done && <span className="mt-0.5 block text-slate-600 dark:text-slate-400">{x.why}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <Btn kind="main" onClick={check} disabled={done}>
              {verb}
            </Btn>
            {done && level < levels.length - 1 && <Btn onClick={() => open(level + 1)}>Next level →</Btn>}
          </div>
          {(done || miss !== null) && <Say tone={done ? "ok" : "warn"}>{done ? "Exactly right." : `Not yet: ${miss}.`}</Say>}
        </>
      )}
    </SimFrame>
  );
}

/** A list of situations, one at a time. `extra` adds to a story: metrics, code. */
export function CaseStation<T extends Situation>({ id, cases, pass, noun, ask, endings, extra }: { id: SimId; cases: readonly T[]; pass: number; noun: string; ask: string; endings: { perfect: string; won: string; lost: string }; extra?: (x: T) => ReactNode }) {
  const [at, setAt] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const x = cases[at];
  const best = cases.filter((c) => picks[c.id] === c.best).length;
  const answered = Object.keys(picks).length;
  const over = answered === cases.length;
  const won = over && best >= pass;
  return (
    <SimFrame
      id={id}
      won={won}
      onReset={() => {
        setAt(0);
        setPicks({});
      }}
    >
      <Strip label={`Progress: ${noun}s`} marks={cases.map((c) => (picks[c.id] === undefined ? undefined : picks[c.id] === c.best))} current={at} />
      {x && (
        <>
          <div>
            <p className="text-base font-semibold">
              {noun} {at + 1} of {cases.length}: {x.title}
            </p>
            <p className="mt-1 text-sm">{x.story}</p>
          </div>
          {x.exhibit && <Exhibit>{x.exhibit}</Exhibit>}
          {extra?.(x)}
          <p className="text-sm font-semibold">{ask}</p>
          <Moves key={x.id} situation={x} picked={picks[x.id]} onPick={(i) => setPicks({ ...picks, [x.id]: i })} />
          <div className="flex flex-wrap items-center gap-3">
            <Btn onClick={() => setAt(at - 1)} disabled={at === 0}>
              ← Back
            </Btn>
            <Btn kind="main" onClick={() => setAt(at + 1)} disabled={picks[x.id] === undefined || at === cases.length - 1}>
              Next {noun.toLowerCase()} →
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
            {best} of {cases.length}.
          </strong>{" "}
          {best === cases.length ? endings.perfect : won ? endings.won : endings.lost}
        </Say>
      )}
    </SimFrame>
  );
}
