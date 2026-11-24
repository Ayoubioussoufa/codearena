"use client";
import { useEffect, useState } from "react";
import { JOURNEY_START, JOURNEY_TARGET, bestSwitch, journey, journeyTotal, journeyWon, switchesOn, type JourneyConfig } from "@/lib/sims/journey";
import { FlowMap, type FlowNode } from "./FlowMap";
import { SimFrame } from "./SimFrame";
import { Btn, Meter, Say, Toggle } from "./ui";

const NODES: readonly FlowNode[] = [
  { id: "browser", label: "Browser", x: 64, y: 115 },
  { id: "dns", label: "DNS", x: 180, y: 34 },
  { id: "lb", label: "Balancer", x: 268, y: 115 },
  { id: "app", label: "App", x: 420, y: 115 },
  { id: "cache", label: "Cache", x: 572, y: 44 },
  { id: "db", label: "Database", x: 572, y: 186 },
];
const EDGES = [["browser", "dns"], ["browser", "lb"], ["lb", "app"], ["app", "cache"], ["app", "db"]] as const;
const SWITCHES: readonly { key: keyof JourneyConfig; label: string }[] = [
  { key: "near", label: "Servers near the user" },
  { key: "warm", label: "Connection already open" },
  { key: "hit", label: "Answer already cached" },
];

export default function Journey() {
  const [config, setConfig] = useState<JourneyConfig>(JOURNEY_START);
  const [guess, setGuess] = useState<keyof JourneyConfig | null>(null);
  const [at, setAt] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const hops = journey(config);
  const total = journeyTotal(config);
  const hop = at >= 0 ? hops[at] : undefined;
  const spent = hops.slice(0, at + 1).reduce((s, h) => s + h.ms, 0);
  const last = hops.length - 1;
  const done = at >= last;
  const won = guess !== null && done && journeyWon(config);

  useEffect(() => {
    if (!playing || done) return;
    const timer = setInterval(() => {
      setAt((i) => Math.min(i + 1, last));
    }, 1100);
    return () => clearInterval(timer);
  }, [playing, done, last]);

  function go(i: number) {
    setAt(i);
    if (i >= last) setPlaying(false);
  }
  function change(key: keyof JourneyConfig, on: boolean) {
    setConfig({ ...config, [key]: on });
    setAt(-1);
    setPlaying(false);
  }
  function reset() {
    setConfig(JOURNEY_START);
    setGuess(null);
    setAt(-1);
    setPlaying(false);
  }

  return (
    <SimFrame id="journey" won={won} onReset={reset}>
      {guess === null ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            A student in Rabat opens a page served from California: <strong>{total} ms</strong> before the first byte. You may flip one switch. <strong>Which one saves the most?</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {SWITCHES.map((s) => (
              <Btn key={s.key} onClick={() => setGuess(s.key)}>
                {s.label}
              </Btn>
            ))}
          </div>
        </div>
      ) : (
        <>
          <Say tone={guess === bestSwitch() ? "ok" : "warn"}>
            {guess === bestSwitch() ? "Right: " : "Not quite. "}
            moving close takes the trip from {journeyTotal(JOURNEY_START)} to {journeyTotal({ ...JOURNEY_START, near: true })} ms. An open connection gives {journeyTotal({ ...JOURNEY_START, warm: true })} ms, and a cached answer only {journeyTotal({ ...JOURNEY_START, hit: true })} ms. Now get it under {JOURNEY_TARGET}.
          </Say>
          <div className="flex flex-wrap gap-2">
            {SWITCHES.map((s) => (
              <Toggle key={s.key} label={s.label} on={config[s.key]} onChange={(on) => change(s.key, on)} />
            ))}
          </div>
        </>
      )}
      <FlowMap nodes={NODES} edges={EDGES} active={hop ? { from: hop.from, to: hop.to } : null} step={at} label="A request travelling from the browser to the database and back" />
      <Meter label={done ? "Time to first byte" : "Time so far"} value={spent} max={520} show={`${spent} ms`} mark={JOURNEY_TARGET} tone={spent > JOURNEY_TARGET ? "bad" : done ? "ok" : "plain"} />
      <Say tone={done && guess !== null ? (won ? "ok" : "warn") : "plain"}>
        {hop ? (
          <>
            <strong>
              {at + 1}. {hop.label}: +{hop.ms} ms.
            </strong>{" "}
            {hop.why}
            {done && guess !== null && !won && (total < JOURNEY_TARGET ? ` Under the limit, but with ${switchesOn(config)} switches: try two.` : ` ${total} ms in total: still too slow.`)}
          </>
        ) : (
          "Press Next to follow the request one hop at a time, or Play to watch it."
        )}
      </Say>
      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => go(Math.max(0, at - 1))} disabled={at <= 0}>
          ← Back
        </Btn>
        <Btn kind="main" onClick={() => go(at + 1)} disabled={done}>
          Next →
        </Btn>
        <Btn
          onClick={() => {
            if (done) setAt(-1);
            setPlaying(!playing || done);
          }}
        >
          {playing && !done ? "Pause" : done ? "Replay" : "Play"}
        </Btn>
      </div>
    </SimFrame>
  );
}
