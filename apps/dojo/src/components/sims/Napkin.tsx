"use client";
import { useState } from "react";
import { NAPKIN_STREAK, NAPKIN_TOLERANCE, compact, napkinRound, sliderToValue, timesOff } from "@/lib/sims/napkin";
import { SimFrame } from "./SimFrame";
import { Btn, Say, Slider } from "./ui";

export default function Napkin() {
  const [seed, setSeed] = useState(1);
  const [pos, setPos] = useState(50);
  const [locked, setLocked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [won, setWon] = useState(false);
  const round = napkinRound(seed);
  const guess = sliderToValue(pos);
  const off = timesOff(guess, round.answer);
  const good = off <= NAPKIN_TOLERANCE;

  function lock() {
    const next = good ? streak + 1 : 0;
    setLocked(true);
    setStreak(next);
    if (next >= NAPKIN_STREAK) setWon(true);
  }
  function deal() {
    setSeed((Date.now() % 1_000_000) + 2);
    setPos(50);
    setLocked(false);
  }
  return (
    <SimFrame
      id="napkin"
      won={won}
      onReset={() => {
        setStreak(0);
        setWon(false);
        deal();
      }}
    >
      <p className="text-sm">
        {round.scenario} <strong>{round.ask}</strong>
      </p>
      <Slider label="Your guess (each step is bigger than the last)" value={pos} min={0} max={100} show={`≈ ${compact(guess)} ${round.unit}`} onChange={(n) => !locked && setPos(n)} />
      {locked && (
        <Say tone={good ? "ok" : off <= 10 ? "warn" : "bad"}>
          <strong>{off < 1.2 ? "Spot on." : good ? "Same napkin." : `${off.toFixed(off < 10 ? 1 : 0)}× off.`}</strong> The answer is about {compact(round.answer)} {round.unit}.
          <ol className="mt-1 list-decimal pl-5 font-mono text-[0.85em]">
            {round.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </Say>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {locked ? (
          <Btn kind="main" onClick={deal}>
            Next napkin →
          </Btn>
        ) : (
          <Btn kind="main" onClick={lock}>
            Lock it in
          </Btn>
        )}
        <span className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
          Streak: {"🧻".repeat(Math.min(streak, 10)) || "none yet"} {streak > 0 && `(${streak})`}
        </span>
      </div>
    </SimFrame>
  );
}
