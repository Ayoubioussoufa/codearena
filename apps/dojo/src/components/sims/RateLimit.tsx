"use client";
import { useReducer, useState } from "react";
import { ATTACK, HOLE, LIMIT, WINDOW, best, limiterReducer, limiterStart, type Limiter, type LimiterAction } from "@/lib/sims/ratelimit";
import { SimFrame } from "./SimFrame";
import { Btn, Check, Say, Segmented, Stat } from "./ui";

const LIMITERS: readonly { value: Limiter; label: string }[] = [
  { value: "fixed", label: "Fixed window" },
  { value: "sliding", label: "Sliding window" },
  { value: "bucket", label: "Token bucket" },
];
const SPAN = 30;

export default function RateLimit() {
  const [s, dispatch] = useReducer(limiterReducer, limiterStart("fixed"));
  const [results, setResults] = useState<Partial<Record<Limiter, number>>>({});
  const score = best(s.hits);
  const broke = (results.fixed ?? 0) >= HOLE;
  const won = broke && results.sliding !== undefined && results.bucket !== undefined;
  const start = Math.max(0, Math.floor(s.now / WINDOW) * WINDOW - WINDOW);

  function act(a: LimiterAction) {
    dispatch(a);
    const after = limiterReducer(s, a);
    const b = best(after.hits);
    if (b.sent >= ATTACK) setResults((r) => ({ ...r, [after.limiter]: Math.max(r[after.limiter] ?? 0, b.passed) }));
  }
  return (
    <SimFrame
      id="ratelimit"
      won={won}
      onReset={() => {
        dispatch({ type: "pick", limiter: "fixed" });
        setResults({});
      }}
    >
      <Segmented label={`The limit is always ${LIMIT} requests per ${WINDOW} seconds. Enforced by a`} value={s.limiter} options={LIMITERS} onChange={(limiter) => act({ type: "pick", limiter })} />
      <div>
        <div className="relative h-20 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" role="img" aria-label={`${s.hits.filter((h) => h.ok).length} requests passed, ${s.hits.filter((h) => !h.ok).length} refused, at second ${s.now}`}>
          {Array.from({ length: SPAN + 1 }, (_, i) => start + i).map((t) => (
            <span key={t} aria-hidden className={`absolute inset-y-0 ${t % WINDOW === 0 ? "w-0.5 bg-slate-400 dark:bg-slate-500" : "w-px bg-slate-200 dark:bg-slate-800"}`} style={{ left: `${((t - start) / SPAN) * 100}%` }} />
          ))}
          {[...new Set(s.hits.map((h) => h.t))].filter((t) => t >= start).map((t) => {
            const pass = s.hits.filter((h) => h.t === t && h.ok).length, fail = s.hits.filter((h) => h.t === t && !h.ok).length;
            return (
              <span key={t} aria-hidden className="absolute bottom-0 flex w-4 -translate-x-1/2 flex-col-reverse" style={{ left: `${((t - start) / SPAN) * 100}%` }}>
                <span className="bg-emerald-500" style={{ height: `${Math.min(pass, 12) * 3}px` }} />
                <span className="bg-rose-400" style={{ height: `${Math.min(fail, 12) * 3}px` }} />
              </span>
            );
          })}
          <span aria-hidden className="absolute inset-y-0 w-0.5 bg-cyan-600 transition-[left] dark:bg-cyan-300" style={{ left: `${((s.now - start) / SPAN) * 100}%` }} />
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Now: second {s.now}. Thick lines are every {WINDOW} seconds. Green passed, red refused.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn kind="main" onClick={() => act({ type: "send", count: 1 })}>
          Send 1
        </Btn>
        <Btn kind="main" onClick={() => act({ type: "send", count: 10 })}>
          Send 10
        </Btn>
        <Btn onClick={() => act({ type: "wait", seconds: 1 })}>Wait 1 s</Btn>
        <Btn onClick={() => act({ type: "wait", seconds: 5 })}>Wait 5 s</Btn>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Most passed within 2 s" value={String(score.passed)} tone={score.passed >= HOLE ? "bad" : "plain"} />
        <Stat label="Most sent within 2 s" value={String(score.sent)} />
        <Stat label="Tokens in the bucket" value={s.limiter === "bucket" ? String(Math.floor(s.tokens)) : "n/a"} />
      </div>
      <ul className="flex flex-col gap-1">
        <Check done={broke}>
          Fixed window: {HOLE}+ through in 2 seconds{results.fixed !== undefined && ` (${results.fixed})`}
        </Check>
        <Check done={results.sliding !== undefined}>
          The same {ATTACK} on the sliding window{results.sliding !== undefined && `: ${results.sliding} got through`}
        </Check>
        <Check done={results.bucket !== undefined}>
          The same {ATTACK} on the token bucket{results.bucket !== undefined && `: ${results.bucket} got through`}
        </Check>
      </ul>
      <Say tone={won ? "ok" : broke ? "warn" : "plain"}>
        {won
          ? "Same promise on paper, very different doors. The bucket allowed its 10, plus what dripped in while you waited."
          : broke
            ? "You're through: the counter was reset between your two bursts. Now try that timing on the other two."
            : "When exactly does a fixed window forget what you sent?"}
      </Say>
    </SimFrame>
  );
}
