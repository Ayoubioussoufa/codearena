/** Traces over a drawn graph: Dijkstra and topological order. */
import { at, type Trace } from "../engines";

export interface GraphNode {
  id: string;
  x: number;
  y: number;
}
export interface Edge {
  from: string;
  to: string;
  w: number;
}
export interface Drawing {
  nodes: readonly GraphNode[];
  edges: readonly Edge[];
}
const n = (id: string, x: number, y: number): GraphNode => ({ id, x, y });
const e = (from: string, to: string, w = 1): Edge => ({ from, to, w });
export const STOP = "stop";

/* ── Settle the closest ── */
const ROADS: readonly (Drawing & { name: string })[] = [
  {
    name: "1. The long way round",
    nodes: [n("S", 40, 100), n("A", 150, 40), n("B", 150, 160), n("C", 270, 100), n("D", 360, 100)],
    edges: [e("S", "A", 6), e("S", "B", 1), e("B", "A", 2), e("A", "C", 3), e("B", "C", 7), e("C", "D", 1)],
  },
  {
    name: "2. A better price",
    nodes: [n("S", 40, 100), n("A", 140, 40), n("B", 140, 160), n("C", 250, 40), n("D", 250, 160), n("E", 360, 100)],
    edges: [e("S", "A", 4), e("S", "B", 2), e("B", "A", 1), e("A", "C", 5), e("B", "D", 8), e("A", "D", 4), e("C", "E", 3), e("D", "E", 2)],
  },
  {
    name: "3. An island",
    nodes: [n("S", 40, 100), n("A", 140, 40), n("B", 140, 160), n("C", 250, 100), n("X", 360, 50), n("Y", 360, 150)],
    edges: [e("S", "A", 3), e("S", "B", 3), e("A", "C", 2), e("B", "C", 1), e("X", "Y", 1), e("X", "C", 1)],
  },
];
export interface RoadState extends Drawing {
  dist: Readonly<Record<string, number>>;
  settled: readonly string[];
  over: boolean;
}
export const dijkstraTrace: Trace<RoadState> = {
  levels: ROADS.map((r) => r.name),
  start(level) {
    const r = at(ROADS, level);
    return { nodes: r.nodes, edges: r.edges, dist: { S: 0 }, settled: [], over: false };
  },
  moves: (s) => [...s.nodes.map((x) => ({ id: x.id, label: x.id })), { id: STOP, label: "Nothing left to settle" }],
  correct(s) {
    if (s.over) return [];
    const open = s.nodes.filter((x) => !s.settled.includes(x.id) && s.dist[x.id] !== undefined).map((x) => x.id);
    const best = Math.min(...open.map((id) => s.dist[id] ?? Infinity));
    return open.length === 0 ? [STOP] : open.filter((id) => s.dist[id] === best);
  },
  apply(s, move) {
    if (move === STOP) return { ...s, over: true };
    const dist = { ...s.dist };
    const here = dist[move] ?? 0;
    for (const x of s.edges) if (x.from === move && here + x.w < (dist[x.to] ?? Infinity)) dist[x.to] = here + x.w;
    return { ...s, dist, settled: [...s.settled, move] };
  },
  why(s, move) {
    if (move === STOP) return "A node with a known distance is still waiting.";
    if (s.settled.includes(move)) return `${move} is settled: its distance is final.`;
    if (s.dist[move] === undefined) return `No road has reached ${move} yet, so its distance is ∞.`;
    return `${move} is at ${s.dist[move]}, and something closer is waiting. ${move} might still get cheaper through it.`;
  },
  say(s) {
    if (s.over) {
      const lost = s.nodes.filter((x) => s.dist[x.id] === undefined).map((x) => x.id);
      return lost.length === 0 ? "Every distance is final." : `${lost.join(" and ")} can't be reached: the distance stays ∞.`;
    }
    return s.settled.length === 0 ? "Which node do you settle first?" : `${s.settled.length} settled. Which one next?`;
  },
  done: (s) => s.over,
};

/* ── What can I take now? ── */
const COURSES: readonly (Drawing & { name: string })[] = [
  {
    name: "1. A degree",
    nodes: [n("Maths", 70, 40), n("C", 70, 150), n("Algo", 200, 40), n("OS", 200, 150), n("DB", 330, 95)],
    edges: [e("Maths", "Algo"), e("C", "Algo"), e("C", "OS"), e("Algo", "DB"), e("OS", "DB")],
  },
  {
    name: "2. A build",
    nodes: [n("env", 60, 100), n("db", 160, 40), n("types", 160, 160), n("api", 260, 100), n("web", 350, 160), n("e2e", 350, 40)],
    edges: [e("env", "db"), e("db", "api"), e("types", "api"), e("types", "web"), e("api", "e2e"), e("web", "e2e")],
  },
  {
    name: "3. Something's wrong",
    nodes: [n("A", 60, 100), n("B", 160, 40), n("C", 270, 40), n("D", 215, 160), n("E", 350, 100)],
    edges: [e("A", "B"), e("B", "C"), e("C", "D"), e("D", "B"), e("C", "E")],
  },
];
export interface TopoState extends Drawing {
  taken: readonly string[];
  cycle: boolean;
}
export const CYCLE = "cycle";
export const waiting = (s: TopoState, id: string) => s.edges.filter((x) => x.to === id && !s.taken.includes(x.from)).length;
export const topoTrace: Trace<TopoState> = {
  levels: COURSES.map((c) => c.name),
  start: (level) => ({ nodes: at(COURSES, level).nodes, edges: at(COURSES, level).edges, taken: [], cycle: false }),
  moves: (s) => [...s.nodes.map((x) => ({ id: x.id, label: x.id })), { id: CYCLE, label: "It's a cycle" }],
  correct(s) {
    if (topoTrace.done(s)) return [];
    const ready = s.nodes.filter((x) => !s.taken.includes(x.id) && waiting(s, x.id) === 0).map((x) => x.id);
    return ready.length > 0 ? ready : [CYCLE];
  },
  apply: (s, move) => (move === CYCLE ? { ...s, cycle: true } : { ...s, taken: [...s.taken, move] }),
  why(s, move) {
    if (move === CYCLE) return "Something has no prerequisite left: take it first.";
    if (s.taken.includes(move)) return `${move} is already taken.`;
    return `${move} still waits for ${s.edges.filter((x) => x.to === move && !s.taken.includes(x.from)).map((x) => x.from).join(" and ")}.`;
  },
  say: (s) => (s.cycle ? `Only ${s.taken.length} of ${s.nodes.length} could be taken. Fewer than all means there's a cycle.` : topoTrace.done(s) ? `Order: ${s.taken.join(", ")}.` : "Which one has no prerequisite left?"),
  done: (s) => s.cycle || s.taken.length === s.nodes.length,
};
