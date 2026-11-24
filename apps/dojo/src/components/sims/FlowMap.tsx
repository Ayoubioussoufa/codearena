"use client";
/** Boxes and wires, with one wire lit and a dot travelling along it. */
import { useEffect, useRef, type CSSProperties } from "react";

export interface FlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
}
export interface FlowProps {
  nodes: readonly FlowNode[];
  edges: readonly (readonly [string, string])[];
  active: { from: string; to: string } | null;
  /** Changes on every step, so the dot starts again. */
  step: number;
  broken?: string | undefined;
  label: string;
}
const W = 104, H = 40;

export function FlowMap({ nodes, edges, active, step, broken, label }: FlowProps) {
  const at = (id: string) => nodes.find((n) => n.id === id) ?? { id, label: id, x: 0, y: 0 };
  const lit = (a: string, b: string) => active !== null && ((active.from === a && active.to === b) || (active.from === b && active.to === a));
  const from = active ? at(active.from) : null;
  const to = active ? at(active.to) : null;
  const box = useRef<HTMLDivElement>(null);
  const middle = from && to ? (from.x + to.x) / 2 / 640 : null;

  // On a phone the diagram is wider than the screen: follow the action.
  useEffect(() => {
    const el = box.current;
    if (!el || middle === null || el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: middle * el.scrollWidth - el.clientWidth / 2, behavior: "smooth" });
  }, [middle, step]);

  return (
    <div ref={box} className="overflow-x-auto">
      <svg viewBox="0 0 640 230" role="img" aria-label={label} className="h-auto w-full min-w-[34rem]">
        {edges.map(([a, b]) => {
          const p = at(a), q = at(b);
          return <line key={`${a}-${b}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} className={lit(a, b) ? "stroke-cyan-600 dark:stroke-cyan-400" : "stroke-slate-300 dark:stroke-slate-700"} strokeWidth={lit(a, b) ? 4 : 2} />;
        })}
        {from && to && (
          <circle key={step} r={8} className="sim-dot fill-cyan-700 stroke-white dark:fill-cyan-300 dark:stroke-slate-900" strokeWidth={2} style={{ "--x0": `${from.x}px`, "--y0": `${from.y}px`, "--x1": `${to.x}px`, "--y1": `${to.y}px` } as CSSProperties} />
        )}
        {nodes.map((n) => {
          const on = active !== null && (active.from === n.id || active.to === n.id);
          const dead = broken === n.id;
          return (
            <g key={n.id}>
              <rect x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} rx={10} strokeWidth={2} className={dead ? "fill-rose-100 stroke-rose-600 dark:fill-rose-950 dark:stroke-rose-400" : on ? "fill-cyan-50 stroke-cyan-700 dark:fill-cyan-950 dark:stroke-cyan-300" : "fill-white stroke-slate-400 dark:fill-slate-900 dark:stroke-slate-600"} />
              <text x={n.x} y={n.y + 5} textAnchor="middle" className="fill-slate-800 text-[14px] dark:fill-slate-200">
                {dead ? "💥 " : ""}
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
