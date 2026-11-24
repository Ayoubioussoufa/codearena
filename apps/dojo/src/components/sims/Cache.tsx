"use client";
import { useMemo, useState } from "react";
import { CACHE_GOAL, CACHE_START, KEYS, cacheWon, runCache } from "@/lib/sims/cache";
import { SimFrame } from "./SimFrame";
import { Meter, Say, Slider, Stat, Toggle } from "./ui";

export default function Cache() {
  const [c, setC] = useState(CACHE_START);
  const r = useMemo(() => runCache(c), [c]);
  const won = cacheWon(c, r);
  const hint =
    c.skew < 0.8
      ? "The traffic is spread too evenly: whatever you keep, the next request is usually for something else."
      : c.capacity > CACHE_GOAL.capacity
        ? "It works, but that's a lot of memory. How few keys carry this traffic?"
        : r.hitRatio < CACHE_GOAL.hits
          ? "The hot keys don't all fit, or they're thrown away too soon."
          : "Fast and wrong: some of those hits are old copies of things that were edited since.";
  return (
    <SimFrame id="cache" won={won} onReset={() => setC(CACHE_START)}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Slider label="Room in the cache" value={c.capacity} min={0} max={120} step={5} show={`${c.capacity} of ${KEYS} keys`} onChange={(capacity) => setC({ ...c, capacity })} />
          <Slider label="How skewed the traffic is" value={c.skew} min={0} max={1.4} step={0.1} show={c.skew < 0.3 ? "all keys alike" : c.skew < 0.9 ? "some favourites" : "a few stars"} onChange={(skew) => setC({ ...c, skew })} />
          <Slider label="TTL: throw a copy away after" value={c.ttl} min={100} max={4000} step={100} show={`${c.ttl} requests`} onChange={(ttl) => setC({ ...c, ttl })} />
          <Toggle label="A write deletes the cached copy" on={c.invalidate} onChange={(invalidate) => setC({ ...c, invalidate })} />
        </div>
        <div>
          <p className="mb-1.5 text-sm text-slate-600 dark:text-slate-400">The {KEYS} keys, most popular first. Filled: in the cache now.</p>
          <div aria-hidden className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[3px]">
            {Array.from({ length: KEYS }, (_, k) => (
              <span key={k} className={`aspect-square rounded-[3px] transition-colors ${r.cached.has(k) ? "bg-cyan-600 dark:bg-cyan-400" : "bg-slate-200 dark:bg-slate-800"}`} />
            ))}
          </div>
        </div>
      </div>
      <Meter label="Hit ratio" value={r.hitRatio} max={1} mark={CACHE_GOAL.hits} show={`${(r.hitRatio * 100).toFixed(1)}%`} tone={r.hitRatio >= CACHE_GOAL.hits ? "ok" : "bad"} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Stale reads per 1,000" value={r.stalePer1000.toFixed(1)} tone={r.stalePer1000 <= CACHE_GOAL.stale ? "ok" : "bad"} />
        <Stat label="Database reads per 1,000" value={r.dbPer1000.toFixed(0)} />
        <Stat label="Average read" value={`${r.avgMs.toFixed(1)} ms`} />
      </div>
      <Say tone={won ? "ok" : "warn"}>{won ? "One key in five answers most of the traffic, and nobody reads an old copy. That's cache-aside doing its job." : hint}</Say>
    </SimFrame>
  );
}
