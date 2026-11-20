/**
 * Live countdown.
 *
 * Renders a placeholder on the server and first paint, then ticks every
 * second on the client (timer callbacks may set state; setting it
 * synchronously in the effect body would trip the React lint rule).
 */
"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  startsAt: string;
  durationMinutes: number;
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86_400);
  const h = Math.floor((total % 86_400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export function Countdown({ startsAt, durationMinutes }: CountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const kickoff = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
    };
  }, []);

  if (now === null) {
    return <span className="font-mono text-slate-400">—</span>;
  }

  const start = new Date(startsAt).getTime();
  const end = start + durationMinutes * 60_000;

  if (now >= end) {
    return <span className="font-mono text-slate-400">ended</span>;
  }
  if (now >= start) {
    return (
      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
        ends in {formatRemaining(end - now)}
      </span>
    );
  }
  return (
    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
      in {formatRemaining(start - now)}
    </span>
  );
}
