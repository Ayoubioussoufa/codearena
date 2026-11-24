"use client";
/** A drawing with real buttons on it: SVG lines, HTML nodes on top. */
import type { ReactNode } from "react";

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  label: string;
  /** Small text above the node in the top half, below it in the bottom half. */
  note?: string | undefined;
  tone: "open" | "done" | "next" | "ghost";
}
export interface CanvasEdge {
  from: string;
  to: string;
  label?: string | undefined;
  arrow?: boolean | undefined;
  strong?: boolean | undefined;
}
const LOOK = {
  open: "border-slate-400 bg-white text-slate-900 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100",
  done: "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500",
  next: "border-cyan-700 bg-cyan-50 text-cyan-900 dark:border-cyan-400 dark:bg-cyan-950 dark:text-cyan-100",
  ghost: "border-dashed border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-600",
};

export function Canvas({ id, width, height, nodes, edges, label, onPick, children }: { id: string; width: number; height: number; nodes: readonly CanvasNode[]; edges: readonly CanvasEdge[]; label: string; onPick?: (id: string) => void; children?: ReactNode }) {
  const find = (x: string) => nodes.find((n) => n.id === x);
  const tip = `tip-${id}`;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/60">
      <div role="group" aria-label={label} className="relative mx-auto" style={{ width: "100%", maxWidth: width * 1.3, minWidth: Math.min(width, 290), aspectRatio: `${width} / ${height}` }}>
        <svg aria-hidden viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full">
          <defs>
            <marker id={tip} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L8,4 L0,8 Z" className="fill-slate-500" />
            </marker>
          </defs>
          {edges.map((e) => {
            const a = find(e.from), b = find(e.to);
            if (!a || !b) return null;
            const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
            const cut = e.arrow ? 21 : 0;
            const x2 = b.x - ((b.x - a.x) / d) * cut, y2 = b.y - ((b.y - a.y) / d) * cut;
            return (
              <g key={`${e.from}-${e.to}`}>
                <line x1={a.x} y1={a.y} x2={x2} y2={y2} strokeWidth={e.strong ? 3 : 1.5} className={e.strong ? "stroke-emerald-600" : "stroke-slate-400 dark:stroke-slate-500"} markerEnd={e.arrow ? `url(#${tip})` : undefined} />
                {e.label && (
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 5} textAnchor="middle" className="fill-slate-800 stroke-white text-[13px] font-bold dark:fill-slate-100 dark:stroke-slate-900" strokeWidth={3.5} paintOrder="stroke">
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
          {children}
        </svg>
        {nodes.map((n) => {
          const body = (
            <>
              <span className={`grid h-9 min-w-9 place-items-center whitespace-nowrap rounded-full border-2 px-1.5 font-mono text-sm font-semibold transition-colors ${LOOK[n.tone]}`}>{n.label}</span>
              {n.note !== undefined && <span className={`absolute whitespace-nowrap rounded bg-white/90 px-1 font-mono text-xs dark:bg-slate-900/90 ${n.y < height / 2 ? "bottom-full mb-0.5" : "top-full mt-0.5"}`}>{n.note}</span>}
            </>
          );
          const place = { left: `${(n.x / width) * 100}%`, top: `${(n.y / height) * 100}%` };
          const cls = "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center";
          return onPick ? (
            <button key={n.id} type="button" aria-label={`${n.label}${n.note !== undefined ? `, ${n.note}` : ""}`} onClick={() => onPick(n.id)} className={cls} style={place}>
              {body}
            </button>
          ) : (
            <span key={n.id} className={cls} style={place}>
              {body}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** A row of cells that always fits: they shrink instead of scrolling. */
export interface Cell {
  text: string;
  /** Under the cell: a pointer name, an index. */
  mark?: string | undefined;
  tone?: "plain" | "in" | "hit" | "off" | undefined;
}
const CELL = {
  plain: "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900",
  in: "border-cyan-600 bg-cyan-50 text-cyan-900 dark:border-cyan-500 dark:bg-cyan-950/50 dark:text-cyan-100",
  hit: "border-emerald-600 bg-emerald-600 text-white",
  off: "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600",
};
export function Cells({ cells, label }: { cells: readonly Cell[]; label: string }) {
  return (
    <ol aria-label={label} className="flex gap-1">
      {cells.map((c, i) => (
        <li key={i} className="flex min-w-0 max-w-14 flex-1 flex-col items-center gap-0.5">
          <span className={`grid h-11 w-full place-items-center rounded-lg border-2 font-mono text-base font-semibold transition-colors ${CELL[c.tone ?? "plain"]}`}>{c.text}</span>
          <span className="h-5 whitespace-nowrap font-mono text-xs text-slate-700 dark:text-slate-300">{c.mark ?? ""}</span>
        </li>
      ))}
    </ol>
  );
}
