"use client";
import { useMemo, useState } from "react";
import { MEMORY, QUEUE_GOAL, QUEUE_START, SECONDS, arrivalsAt, queueWon, runQueue, type QueueConfig } from "@/lib/sims/queue";
import { SimFrame } from "./SimFrame";
import { Say, Slider, Stat } from "./ui";

const W = 640, H = 170;
const path = (ys: readonly number[], top: number) => ys.map((y, x) => `${x === 0 ? "M" : "L"}${((x / (SECONDS - 1)) * W).toFixed(1)},${(H - (Math.min(y, top) / top) * H).toFixed(1)}`).join(" ");

export default function QueueNight() {
  const [c, setC] = useState<QueueConfig>(QUEUE_START);
  const r = useMemo(() => runQueue(c), [c]);
  const won = queueWon(r);
  const top = Math.max(MEMORY * 1.1, ...r.depth);
  const hint = r.crashed
    ? "The line outgrew Redis's memory, and the queue itself went down. That's the slow-motion outage."
    : r.rejected > QUEUE_GOAL.rejected
      ? "The bound protects the machine by turning people away. Too many of them, here: the line needs to move faster, not be shorter."
      : r.p95 > QUEUE_GOAL.p95
        ? "Nobody is lost, but they wait too long. More hands during the burst?"
        : "They're all served, and you're paying a contest-night staff for a quiet evening.";
  return (
    <SimFrame id="queue" won={won} onReset={() => setC(QUEUE_START)}>
      <p className="text-sm">
        A contest opens at 0:20 and closes at 1:20. Submissions jump from {arrivalsAt(0)} to {arrivalsAt(30)} a second, and each one keeps a worker busy for 3 seconds. New workers take 15 seconds to boot.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Queue depth over four minutes, at most ${Math.max(...r.depth)} jobs`} className="h-auto w-full rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <rect x={(20 / SECONDS) * W} width={(60 / SECONDS) * W} y={0} height={H} className="fill-amber-200/50 dark:fill-amber-900/30" />
        <line x1={0} x2={W} y1={H - (MEMORY / top) * H} y2={H - (MEMORY / top) * H} strokeDasharray="6 5" strokeWidth={1.5} className="stroke-rose-500" />
        <path d={path(r.depth, top)} fill="none" strokeWidth={3} className={r.crashed ? "stroke-rose-600" : "stroke-cyan-700 dark:stroke-cyan-400"} />
        <path d={path(r.workers.map((w) => w * 10), top)} fill="none" strokeWidth={2} strokeDasharray="3 3" className="stroke-emerald-600 dark:stroke-emerald-400" />
      </svg>
      <p className="text-xs text-slate-500 dark:text-slate-400">Solid: jobs waiting. Dotted green: workers (× 10). Red dashes: Redis is out of memory. Shaded: the contest.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <Slider label="Workers, always on" value={c.base} min={0} max={100} step={5} show={String(c.base)} onChange={(base) => setC({ ...c, base, max: Math.max(c.max, base) })} />
        <Slider label="Autoscale up to" value={c.max} min={0} max={100} step={5} show={c.max <= c.base ? "off" : String(c.max)} onChange={(max) => setC({ ...c, max: Math.max(max, c.base) })} />
        <Slider label="Reject when this many wait" value={c.bound} min={0} max={1400} step={100} show={c.bound === 0 ? "never" : `${c.bound}`} onChange={(bound) => setC({ ...c, bound })} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="p95 wait" value={`${r.p95} s`} tone={r.p95 <= QUEUE_GOAL.p95 ? "ok" : "bad"} />
        <Stat label="Turned away" value={`${(r.rejected * 100).toFixed(1)}%`} tone={r.rejected <= QUEUE_GOAL.rejected ? "ok" : "bad"} />
        <Stat label="Worker-minutes" value={r.cost.toFixed(0)} tone={r.cost <= QUEUE_GOAL.cost ? "ok" : "bad"} />
        <Stat label="Longest line" value={String(Math.max(...r.depth))} tone={r.crashed ? "bad" : "plain"} />
      </div>
      <Say tone={won ? "ok" : r.crashed ? "bad" : "warn"}>{won ? "The line grew, the workers followed it, and they left when it was empty. That's a queue doing its job." : hint}</Say>
    </SimFrame>
  );
}
