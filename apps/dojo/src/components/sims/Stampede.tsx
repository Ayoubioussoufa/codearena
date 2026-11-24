"use client";
import { useState } from "react";
import { NO_FIXES, POOL, peak, stampede, stampedeWon, type Fixes, type Scenario } from "@/lib/sims/stampede";
import { SimFrame } from "./SimFrame";
import { Say, Toggle } from "./ui";

const FIXES: readonly { key: keyof Fixes; label: string }[] = [
  { key: "jitter", label: "Jitter the expiry times" },
  { key: "singleFlight", label: "Single-flight: one request refills" },
  { key: "stale", label: "Serve the old copy while refreshing" },
];
const SCENES: readonly { id: Scenario; title: string }[] = [
  { id: "hot", title: "One star key, 500 readers a second" },
  { id: "mass", title: "300 keys, all cached in the same second" },
];

function Bars({ scenario, fixes }: { scenario: Scenario; fixes: Fixes }) {
  const bars = stampede(scenario, fixes);
  const top = peak(bars);
  const scale = Math.max(120, top);
  const safe = top <= POOL;
  return (
    <div>
      <div className="relative flex h-32 items-end gap-px overflow-hidden rounded-lg border border-slate-200 bg-white px-1 dark:border-slate-800 dark:bg-slate-900" role="img" aria-label={`Peak of ${top} database queries at once`}>
        {bars.map((n, i) => (
          <span key={i} className={`flex-1 rounded-t-sm transition-[height] duration-300 ${n > POOL ? "bg-rose-500" : "bg-cyan-600 dark:bg-cyan-400"}`} style={{ height: `${(n / scale) * 100}%` }} />
        ))}
        <span aria-hidden className="absolute inset-x-0 border-t-2 border-dashed border-slate-500" style={{ bottom: `${(POOL / scale) * 100}%` }} />
      </div>
      <p className={`mt-1 text-sm font-semibold ${safe ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
        {safe ? "✓ survives" : "💥 database down"}: {top} queries at once (limit {POOL})
      </p>
    </div>
  );
}

export default function Stampede() {
  const [fixes, setFixes] = useState(NO_FIXES);
  const won = stampedeWon(fixes);
  const hot = peak(stampede("hot", fixes)) <= POOL;
  const mass = peak(stampede("mass", fixes)) <= POOL;
  return (
    <SimFrame id="stampede" won={won} onReset={() => setFixes(NO_FIXES)}>
      <p className="text-sm">A cached copy lasts one second. Then it expires. Each bar is 50 ms of database load; the dashed line is all it can take.</p>
      <div className="grid gap-5 md:grid-cols-2">
        {SCENES.map((s) => (
          <div key={s.id}>
            <p className="mb-1.5 text-sm font-semibold">{s.title}</p>
            <Bars scenario={s.id} fixes={fixes} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {FIXES.map((f) => (
          <Toggle key={f.key} label={f.label} on={fixes[f.key]} onChange={(on) => setFixes({ ...fixes, [f.key]: on })} />
        ))}
      </div>
      <Say tone={won ? "ok" : "warn"}>
        {won
          ? "Both survive: at most one refill per key, and the keys don't all expire at once."
          : hot
            ? "The star is safe. But 300 keys still ask for one refill each, at the same moment."
            : mass
              ? "The crowd of keys is spread out. But one star key has a single expiry, and 500 readers a second find it empty."
              : "Everyone misses at once, and everyone asks the database the same question."}
      </Say>
    </SimFrame>
  );
}
