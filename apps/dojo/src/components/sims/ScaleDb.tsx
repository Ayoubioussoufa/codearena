"use client";
import { useState } from "react";
import { DB_START, LEVELS, NODE_TB, SAFE, sizeDb, type DbConfig } from "@/lib/sims/scaledb";
import { SimFrame } from "./SimFrame";
import { Btn, Meter, Say, Slider, Stat, Toggle } from "./ui";

export default function ScaleDb() {
  const [level, setLevel] = useState(0);
  const [c, setC] = useState<DbConfig>(DB_START);
  const [solved, setSolved] = useState<readonly boolean[]>(LEVELS.map(() => false));
  const l = LEVELS[level] ?? (LEVELS[0] as (typeof LEVELS)[number]);
  const r = sizeDb(l, c);
  const won = solved.every(Boolean);

  function open(i: number) {
    setLevel(i);
    setC(DB_START);
  }
  function ship() {
    if (r.ok) setSolved(solved.map((s, i) => s || i === level));
  }
  const why =
    r.storage > 1
      ? `${l.terabytes} TB won't fit: each node of a shard stores the whole shard, and a machine holds ${NODE_TB}${c.big ? " × 2" : ""} TB.`
      : r.utilisation > SAFE
        ? c.replicas > 0 && l.writes * 2 > l.reads
          ? "Every replica replays every write, so adding copies never makes writes lighter."
          : "The nodes are too hot. Is it the reads, or the writes?"
        : r.cost > l.budget
          ? "It holds, but it's too expensive. There's a cheaper tool for this pressure."
          : "That works. Ship it.";
  return (
    <SimFrame
      id="scaledb"
      won={won}
      onReset={() => {
        open(0);
        setSolved(LEVELS.map(() => false));
      }}
    >
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((x, i) => (
          <Btn key={x.name} kind={i === level ? "main" : "soft"} onClick={() => open(i)}>
            {solved[i] ? "✓ " : ""}
            {i + 1}. {x.name}
          </Btn>
        ))}
      </div>
      <p className="text-sm">{l.story}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Reads" value={`${l.reads.toLocaleString("en")}/s`} />
        <Stat label="Writes" value={`${l.writes.toLocaleString("en")}/s`} />
        <Stat label="Reads that repeat" value={`${Math.round(l.cacheable * 100)}%`} />
        <Stat label="Data" value={`${l.terabytes} TB`} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Slider label="Shards" value={c.shards} min={1} max={6} show={String(c.shards)} onChange={(shards) => setC({ ...c, shards })} />
        <Slider label="Replicas of each shard" value={c.replicas} min={0} max={6} show={String(c.replicas)} onChange={(replicas) => setC({ ...c, replicas })} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Toggle label="Cache in front (cost 2)" on={c.cache} onChange={(cache) => setC({ ...c, cache })} />
        <Toggle label="Double-size machines (cost 3 each)" on={c.big} onChange={(big) => setC({ ...c, big })} />
      </div>
      <div aria-hidden className="flex flex-wrap gap-3">
        {c.cache && <span className="rounded-lg border-2 border-amber-500 bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950/40">⚡ cache</span>}
        {Array.from({ length: c.shards }, (_, s) => (
          <span key={s} className="flex gap-1 rounded-lg border-2 border-slate-300 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            {Array.from({ length: 1 + c.replicas }, (_, n) => (
              <span key={n} className={`grid place-items-center rounded ${c.big ? "h-9 w-9" : "h-7 w-7"} text-xs ${n === 0 ? "bg-cyan-700 text-white" : "bg-slate-200 dark:bg-slate-800"}`}>
                {n === 0 ? "P" : "R"}
              </span>
            ))}
          </span>
        ))}
      </div>
      <Meter label="Load on every node" value={r.utilisation} max={1.4} mark={SAFE} show={`${Math.round(r.utilisation * 100)}%`} tone={r.utilisation <= SAFE ? "ok" : r.utilisation <= 1 ? "warn" : "bad"} />
      <Meter label="Disk on every node" value={r.storage} max={1.4} mark={1} show={`${Math.round(r.storage * 100)}%`} tone={r.storage <= 1 ? "ok" : "bad"} />
      <div className="flex flex-wrap items-center gap-3">
        <Stat label="Cost" value={`${r.cost} of ${l.budget}`} tone={r.cost <= l.budget ? "ok" : "bad"} />
        <Btn kind="main" onClick={ship} disabled={!r.ok}>
          Ship it
        </Btn>
        {solved[level] && level < LEVELS.length - 1 && <Btn onClick={() => open(level + 1)}>Next level →</Btn>}
      </div>
      <Say tone={r.ok ? "ok" : "warn"}>{solved[level] ? "Shipped. " : ""}{why}</Say>
    </SimFrame>
  );
}
