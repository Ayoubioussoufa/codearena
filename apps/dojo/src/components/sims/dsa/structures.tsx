"use client";
import { BACK, FULL, NOTHING, TREE, bfsTrace, heapTrace, intervalsTrace, parent, queensTrace, reverseTrace, treeTrace } from "@/lib/sims/dsa/structures";
import { Canvas, Cells } from "../Canvas";
import { TraceStation } from "../engines";

export function Reverse() {
  return (
    <TraceStation id="reverse" trace={reverseTrace}>
      {(s) => {
        const name = (i: number | null) => (i === null ? "null" : s.nodes[i]);
        return (
          <>
            <p className="text-sm">Reverse the list in place: turn each arrow round, one statement at a time.</p>
            <div className="flex flex-wrap items-start gap-3">
              {s.nodes.length === 0 && <span className="font-mono text-sm">head = null</span>}
              {s.nodes.map((n, i) => (
                <div key={n} className="w-20 text-center">
                  <span className={`grid h-12 place-items-center rounded-lg border-2 font-mono font-semibold ${i === s.cur ? "border-cyan-600 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-950/50" : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"}`}>{n}</span>
                  <span className={`mt-1 block font-mono text-xs ${s.arrows[i] === null || (s.arrows[i] ?? 0) < i ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>→ {name(s.arrows[i] ?? null)}</span>
                </div>
              ))}
            </div>
            <dl className="grid grid-cols-3 gap-3 font-mono text-sm">
              {([["prev", s.prev], ["cur", s.cur], ["next", s.saved]] as const).map(([k, v]) => (
                <div key={k} className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                  <dt className="text-xs text-slate-500 dark:text-slate-400">{k}</dt>
                  <dd className="m-0 font-semibold">{name(v)}</dd>
                </div>
              ))}
            </dl>
          </>
        );
      }}
    </TraceStation>
  );
}

export function Queens() {
  return (
    <TraceStation id="queens" trace={queensTrace} onBoard={(m) => m !== BACK}>
      {(s, play) => (
        <>
          <p className="text-sm">One queen per row, none attacking another. Try columns from left to right, and step back when a row has no safe square.</p>
          <div className="mx-auto grid w-full max-w-72 gap-1" style={{ gridTemplateColumns: `repeat(${s.n}, minmax(0, 1fr))` }}>
            {Array.from({ length: s.n * s.n }, (_, k) => {
              const r = Math.floor(k / s.n), c = k % s.n;
              const queen = s.cols[r] === c;
              const row = r === s.cols.length && !s.end;
              return (
                <button
                  key={k}
                  type="button"
                  disabled={!row}
                  aria-label={`Row ${r + 1}, column ${c + 1}${queen ? ", queen" : ""}`}
                  onClick={() => play(String(c))}
                  className={`grid aspect-square place-items-center rounded text-2xl ${row ? "border-2 border-cyan-600 bg-white hover:bg-cyan-50 dark:border-cyan-500 dark:bg-slate-900" : (r + c) % 2 === 0 ? "bg-slate-200 dark:bg-slate-800" : "bg-slate-100 dark:bg-slate-900"}`}
                >
                  {queen ? "♛" : row && c < s.from ? <span className="text-sm text-slate-400">✗</span> : ""}
                </button>
              );
            })}
          </div>
        </>
      )}
    </TraceStation>
  );
}

export function TreeWalk() {
  return (
    <TraceStation id="tree" trace={treeTrace} onBoard={() => true}>
      {(s, play) => (
        <>
          <p className="text-sm">Click the nodes in the order this walk visits them.</p>
          <Canvas id="tree" width={320} height={240} label="A binary tree" onPick={play} edges={TREE.flatMap((n) => [n.left, n.right].flatMap((c) => (c ? [{ from: n.id, to: c }] : [])))} nodes={TREE.map((n) => ({ id: n.id, x: n.x, y: n.y, label: n.id, tone: s.visited.includes(n.id) ? "done" : "open" }))} />
          <p className="font-mono text-sm" aria-label="Visited so far">{s.visited.length === 0 ? "…" : s.visited.join(" → ")}</p>
        </>
      )}
    </TraceStation>
  );
}

export function Bfs() {
  return (
    <TraceStation id="bfs" trace={bfsTrace} onBoard={(m) => m !== NOTHING}>
      {(s, play) => {
        const cols = s.rows[0]?.length ?? 1;
        return (
          <>
            <p className="text-sm">{s.story}</p>
            <div className="mx-auto grid w-full max-w-80 gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {s.rows.flatMap((row, r) =>
                [...row].map((ch, c) => {
                  const k = `${r},${c}`, d = s.dist.get(k);
                  return ch === "#" ? (
                    <span key={k} aria-label="Wall" className="aspect-square rounded bg-slate-700 dark:bg-slate-600" />
                  ) : (
                    <button
                      key={k}
                      type="button"
                      aria-label={`Row ${r + 1}, column ${c + 1}${d === undefined ? "" : `, distance ${d}`}`}
                      onClick={() => play(k)}
                      className={`grid aspect-square place-items-center rounded border-2 font-mono text-lg font-semibold ${d === undefined ? "border-slate-300 bg-white hover:border-cyan-500 dark:border-slate-700 dark:bg-slate-900" : d === 0 ? "border-emerald-600 bg-emerald-600 text-white" : "border-cyan-600 bg-cyan-50 text-cyan-900 dark:border-cyan-500 dark:bg-cyan-950/60 dark:text-cyan-100"}`}
                    >
                      {d === 0 ? "S" : (d ?? "")}
                    </button>
                  );
                }),
              )}
            </div>
          </>
        );
      }}
    </TraceStation>
  );
}

const SPOTS = [[160, 24], [80, 84], [240, 84], [40, 144], [120, 144], [200, 144], [280, 144], [20, 204]] as const;
export function Heap() {
  return (
    <TraceStation id="heap" trace={heapTrace}>
      {(s) => (
        <>
          <p className="text-sm">{s.story}</p>
          <Canvas
            id="heap"
            width={320}
            height={s.a.length > 7 ? 230 : 172}
            label="The heap as a tree"
            edges={s.a.flatMap((_, i) => (i === 0 ? [] : [{ from: String(parent(i)), to: String(i) }]))}
            nodes={s.a.map((x, i) => ({ id: String(i), x: SPOTS[i]?.[0] ?? 0, y: SPOTS[i]?.[1] ?? 0, label: String(x), tone: s.over ? "done" : i === s.i ? "next" : "open" }))}
          />
          <Cells label="The same heap as an array" cells={s.a.map((x, i) => ({ text: String(x), mark: String(i), tone: i === s.i && !s.over ? "in" : "plain" }))} />
        </>
      )}
    </TraceStation>
  );
}

const FROM = 9, TO = 17;
const clock = (h: number) => `${Math.floor(h)}:${h % 1 === 0 ? "00" : "30"}`;
export function Intervals() {
  return (
    <TraceStation id="intervals" trace={intervalsTrace} onBoard={(m) => m !== FULL}>
      {(s, play) => (
        <>
          <p className="text-sm">Accept as many meetings as you can. They mustn&apos;t overlap. Click the one to accept next.</p>
          <div className="flex flex-col gap-1.5">
            {s.meetings.map((x) => {
              const on = s.taken.includes(x.id);
              return (
                <div key={x.id} className="relative h-9 rounded bg-slate-200/60 dark:bg-slate-800/60">
                  <button
                    type="button"
                    aria-label={`Meeting ${x.id}, ${clock(x.start)} to ${clock(x.end)}${on ? ", accepted" : ""}`}
                    onClick={() => play(x.id)}
                    className={`absolute inset-y-0 overflow-hidden whitespace-nowrap rounded border-2 px-1 text-left text-xs font-semibold ${on ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-400 bg-white hover:border-cyan-600 dark:border-slate-600 dark:bg-slate-900"}`}
                    style={{ left: `${((x.start - FROM) / (TO - FROM)) * 100}%`, width: `${((x.end - x.start) / (TO - FROM)) * 100}%` }}
                  >
                    {x.id}
                    {x.end - x.start >= 2 && ` ${clock(x.start)}–${clock(x.end)}`}
                  </button>
                </div>
              );
            })}
            <div className="flex justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
              {[9, 11, 13, 15, 17].map((h) => (
                <span key={h}>{clock(h)}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </TraceStation>
  );
}
