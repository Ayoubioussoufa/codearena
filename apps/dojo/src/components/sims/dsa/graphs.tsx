"use client";
import { CYCLE, STOP, dijkstraTrace, topoTrace, waiting } from "@/lib/sims/dsa/graphs";
import { Canvas } from "../Canvas";
import { TraceStation } from "../engines";

export function Dijkstra() {
  return (
    <TraceStation id="dijkstra" trace={dijkstraTrace} onBoard={(m) => m !== STOP}>
      {(s, play) => (
        <>
          <p className="text-sm">The number by each node is the best distance from S found so far. Click the node to settle next.</p>
          <Canvas
            id="dijkstra"
            width={400}
            height={210}
            label="A road map"
            onPick={play}
            edges={s.edges.map((e) => ({ from: e.from, to: e.to, label: String(e.w), arrow: true, strong: s.settled.includes(e.from) && (s.dist[e.from] ?? 0) + e.w === s.dist[e.to] }))}
            nodes={s.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, label: n.id, note: s.dist[n.id] === undefined ? "∞" : String(s.dist[n.id]), tone: s.settled.includes(n.id) ? "done" : "open" }))}
          />
        </>
      )}
    </TraceStation>
  );
}

export function Topo() {
  return (
    <TraceStation id="topo" trace={topoTrace} onBoard={(m) => m !== CYCLE}>
      {(s, play) => (
        <>
          <p className="text-sm">An arrow points from what comes first to what needs it. Click something you can take now.</p>
          <Canvas
            id="topo"
            width={400}
            height={210}
            label="A graph of prerequisites"
            onPick={play}
            edges={s.edges.map((e) => ({ from: e.from, to: e.to, arrow: true, strong: s.taken.includes(e.from) }))}
            nodes={s.nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, label: n.id, note: s.taken.includes(n.id) ? `#${s.taken.indexOf(n.id) + 1}` : `needs ${waiting(s, n.id)}`, tone: s.taken.includes(n.id) ? "done" : "open" }))}
          />
        </>
      )}
    </TraceStation>
  );
}
