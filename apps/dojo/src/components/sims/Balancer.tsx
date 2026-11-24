"use client";
import { useEffect, useMemo, useState } from "react";
import { BALANCER_START, CAPACITY, DYING, KILL_AT, balancerWon, runBalancer, type Algorithm, type BalancerConfig } from "@/lib/sims/balancer";
import { SimFrame } from "./SimFrame";
import { Btn, Say, Segmented, Slider, Stat, Toggle } from "./ui";

const ALGORITHMS: readonly { value: Algorithm; label: string }[] = [
  { value: "round-robin", label: "Round-robin" },
  { value: "random", label: "Random" },
  { value: "ip-hash", label: "IP hash" },
  { value: "least", label: "Least busy" },
];
const FULL = 60;

export default function Balancer() {
  const [c, setC] = useState<BalancerConfig>(BALANCER_START);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const r = useMemo(() => runBalancer(c), [c]);
  const last = r.frames.length - 1;
  const frame = r.frames[Math.min(at, last)];
  const ended = at >= last;
  const won = ended && balancerWon(r);

  useEffect(() => {
    if (!playing || ended) return;
    const timer = setInterval(() => setAt((i) => i + 1), 180);
    return () => clearInterval(timer);
  }, [playing, ended]);

  function change(next: BalancerConfig) {
    setC(next);
    setAt(0);
    setPlaying(false);
  }
  const verdict =
    r.p95 >= 300 && c.algorithm !== "least"
      ? "Server 4 is an old machine, and this rule keeps handing it work it can't finish."
      : r.failed > 0 && !c.healthChecks
        ? "Server 2 died, and the balancer kept sending it guests."
        : r.lostSessions > 0
          ? "Server 2 took 250 logins to the grave: they lived in its memory."
          : "Close. Look at the red number.";
  return (
    <SimFrame id="balancer" won={won} onReset={() => change(BALANCER_START)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Segmented label="How the balancer chooses" value={c.algorithm} options={ALGORITHMS} onChange={(algorithm) => change({ ...c, algorithm })} />
        <Segmented
          label="Who is logged in lives in"
          value={c.sessions}
          options={[
            { value: "memory", label: "each server's memory" },
            { value: "shared", label: "a shared store" },
          ]}
          onChange={(sessions) => change({ ...c, sessions })}
        />
      </div>
      <div>
        <Toggle label="Health checks: skip servers that don't answer" on={c.healthChecks} onChange={(healthChecks) => change({ ...c, healthChecks })} />
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {CAPACITY.map((cap, s) => {
          const q = frame?.queues[s] ?? 0;
          const alive = frame?.alive[s] ?? true;
          return (
            <div key={s} className="text-center text-xs text-slate-600 dark:text-slate-400">
              <div className={`relative flex h-36 items-end overflow-hidden rounded-lg border-2 ${alive ? "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900" : "border-rose-500 bg-rose-50 dark:bg-rose-950/40"}`}>
                <div className={`w-full transition-[height] duration-150 ${q > 15 ? "bg-rose-500" : q > 6 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ height: `${Math.min(100, (q / FULL) * 100)}%` }} />
                <span className="absolute inset-x-0 top-2 font-mono text-sm text-slate-900 dark:text-slate-100">{alive ? q : "💀"}</span>
              </div>
              <p className="mt-1">
                Server {s + 1}
                <br />
                {cap}/s{s === 3 ? " (old)" : ""}
                {s === DYING ? ` dies at ${KILL_AT} s` : ""}
              </p>
            </div>
          );
        })}
      </div>
      <Slider label="100 requests a second arrive. Time:" value={Math.min(at, last)} min={0} max={last} show={`${(frame?.t ?? 0).toFixed(1)} s`} onChange={setAt} />
      <div className="flex flex-wrap gap-2">
        <Btn
          kind="main"
          onClick={() => {
            if (ended) setAt(0);
            setPlaying(ended || !playing);
          }}
        >
          {playing && !ended ? "Pause" : ended ? "Run again" : "Open the doors"}
        </Btn>
        <Btn onClick={() => setAt(last)} disabled={ended}>
          Skip to the end
        </Btn>
      </div>
      {ended && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="p95 response" value={`${Math.round(r.p95).toLocaleString("en")} ms`} tone={r.p95 < 300 ? "ok" : "bad"} />
            <Stat label="Failed requests" value={String(r.failed)} tone={r.failed === 0 ? "ok" : "bad"} />
            <Stat label="Users logged out" value={String(r.lostSessions)} tone={r.lostSessions === 0 ? "ok" : "bad"} />
          </div>
          <Say tone={won ? "ok" : "warn"}>{won ? "Nobody noticed that a server died. That's what stateless buys you." : verdict}</Say>
        </>
      )}
    </SimFrame>
  );
}
