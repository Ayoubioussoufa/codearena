"use client";
/** Small controls shared by every station. */
import { useId, type ReactNode } from "react";

export type Tone = "ok" | "warn" | "bad" | "plain";

const TEXT: Record<Tone, string> = {
  ok: "text-emerald-700 dark:text-emerald-400",
  warn: "text-amber-700 dark:text-amber-400",
  bad: "text-rose-700 dark:text-rose-400",
  plain: "text-slate-800 dark:text-slate-200",
};
const FILL: Record<Tone, string> = { ok: "bg-emerald-500", warn: "bg-amber-500", bad: "bg-rose-500", plain: "bg-slate-400" };

export function Btn({ children, onClick, disabled = false, kind = "soft" }: { children: ReactNode; onClick: () => void; disabled?: boolean; kind?: "soft" | "main" | "danger" }) {
  const look = {
    main: "border-cyan-700 bg-cyan-700 text-white hover:bg-cyan-600 dark:border-cyan-500 dark:bg-cyan-600 dark:text-white",
    danger: "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
    soft: "border-slate-300 bg-white text-slate-700 hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-cyan-300",
  }[kind];
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${look}`}>
      {children}
    </button>
  );
}

export function Slider({ label, value, min, max, step = 1, show, onChange }: { label: string; value: number; min: number; max: number; step?: number; show: string; onChange: (n: number) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
        <span>{label}</span>
        <strong className="font-mono text-slate-900 dark:text-slate-100">{show}</strong>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={show} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-cyan-700 dark:accent-cyan-400" />
    </div>
  );
}

export function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${on ? "border-cyan-600 bg-cyan-50 text-cyan-900 dark:border-cyan-500 dark:bg-cyan-950/50 dark:text-cyan-100" : "border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"}`}
    >
      <span aria-hidden className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${on ? "bg-cyan-600" : "bg-slate-300 dark:bg-slate-700"}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-[left] ${on ? "left-3.5" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label}>
      <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-2.5 py-1 text-sm transition-colors ${o.value === value ? "border-cyan-700 bg-cyan-700 text-white dark:border-cyan-500 dark:bg-cyan-600" : "border-slate-300 bg-white text-slate-600 hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Stat({ label, value, tone = "plain" }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`font-mono text-base font-semibold ${TEXT[tone]}`}>{value}</p>
    </div>
  );
}

export function Meter({ label, value, max, show, tone, mark }: { label: string; value: number; max: number; show: string; tone: Tone; mark?: number }) {
  const width = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <strong className={`font-mono ${TEXT[tone]}`}>{show}</strong>
      </div>
      <div className="relative mt-1 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className={`h-full rounded-full transition-[width] duration-300 ${FILL[tone]}`} style={{ width: `${width}%` }} />
        {mark !== undefined && <span aria-hidden className="absolute inset-y-0 w-0.5 bg-slate-900 dark:bg-white" style={{ left: `${(mark / max) * 100}%` }} />}
      </div>
    </div>
  );
}

/** What just happened, read out to screen readers too. */
export function Say({ tone = "plain", children }: { tone?: Tone; children: ReactNode }) {
  const look = {
    ok: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
    warn: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
    bad: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
    plain: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300",
  }[tone];
  return (
    <div aria-live="polite" className={`rounded-lg border px-3.5 py-2.5 text-sm leading-6 ${look}`}>
      {children}
    </div>
  );
}

export function Check({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <li className={`flex gap-2 text-sm ${done ? "text-emerald-700 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}>
      <span aria-hidden>{done ? "✓" : "○"}</span>
      <span>
        {children}
        <span className="sr-only">{done ? " (done)" : " (to do)"}</span>
      </span>
    </li>
  );
}
