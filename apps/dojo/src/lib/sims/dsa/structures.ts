/** Traces over a linked list, a board, a tree, a grid, a heap and a timeline. */
import { at, swapped, type Trace } from "../engines";

/* ── Don't drop the list: reversing it ── */
const LISTS: readonly (readonly string[])[] = [["A", "B"], ["A", "B", "C"], []];
export interface ListState {
  nodes: readonly string[];
  /** Where each node's arrow points (index, or null). */
  arrows: readonly (number | null)[];
  prev: number | null;
  cur: number | null;
  saved: number | null;
  /** 0 save, 1 flip, 2 move prev, 3 move cur. */
  phase: number;
  returned: boolean;
}
const ORDER = ["save", "flip", "prev", "cur"] as const;
export const reverseTrace: Trace<ListState> = {
  levels: ["1. Two nodes", "2. Three nodes", "3. An empty list"],
  start(level) {
    const nodes = at(LISTS, level);
    return { nodes, arrows: nodes.map((_, i) => (i + 1 < nodes.length ? i + 1 : null)), prev: null, cur: nodes.length > 0 ? 0 : null, saved: null, phase: 0, returned: false };
  },
  moves: () => [
    { id: "flip", label: "cur.next = prev" },
    { id: "cur", label: "cur = next" },
    { id: "save", label: "next = cur.next" },
    { id: "prev", label: "prev = cur" },
    { id: "return prev", label: "return prev" },
    { id: "return cur", label: "return cur" },
  ],
  correct: (s) => (s.returned ? [] : s.cur === null ? ["return prev"] : [at(ORDER, s.phase)]),
  apply(s, move) {
    const cur = s.cur;
    if (move === "return prev" || cur === null) return { ...s, returned: true };
    const phase = (s.phase + 1) % 4;
    if (move === "save") return { ...s, saved: at(s.arrows, cur), phase };
    if (move === "flip") return { ...s, arrows: s.arrows.map((a, i) => (i === cur ? s.prev : a)), phase };
    if (move === "prev") return { ...s, prev: cur, phase };
    return { ...s, cur: s.saved, phase };
  },
  why(s, move) {
    if (s.cur === null) return move === "return cur" ? "cur is null. You'd hand back an empty list." : "cur is null: the loop is over.";
    if (move.startsWith("return")) return "cur still points at a node, so the loop isn't over.";
    if (move === "flip") return s.phase === 0 ? "That arrow is your only way to the rest of the list. Cut it now and the rest is lost." : "That arrow is already turned.";
    if (move === "cur") return s.phase === 0 ? "next hasn't been saved for this node yet." : s.phase === 1 ? "This node's arrow still points the old way." : "prev must reach this node before cur leaves it.";
    if (move === "prev") return s.phase === 3 ? "prev is already here." : "If prev moves first, this node's arrow will point at itself.";
    return "It's already saved.";
  },
  say(s) {
    if (s.returned) return s.nodes.length === 0 ? "null in, null out. The same code handles it." : `Reversed: ${[...s.nodes].reverse().join(" → ")}. O(1) extra space.`;
    return s.cur === null ? "cur is null." : `cur is ${at(s.nodes, s.cur)}. Next statement?`;
  },
  done: (s) => s.returned,
};

/* ── Be the backtracker: N queens, first solution ── */
const SIZES = [5, 4, 3] as const;
export interface QueensState {
  n: number;
  /** Column of the queen in each filled row. */
  cols: readonly number[];
  /** Columns before this one were already tried in the current row. */
  from: number;
  end: "solved" | "impossible" | null;
}
export const BACK = "back";
export const safe = (cols: readonly number[], col: number) => cols.every((c, r) => c !== col && Math.abs(c - col) !== cols.length - r);
const firstSafe = (s: QueensState): number | undefined => Array.from({ length: s.n }, (_, c) => c).find((c) => c >= s.from && safe(s.cols, c));
export const queensTrace: Trace<QueensState> = {
  levels: ["1. Five queens", "2. Four queens", "3. Three queens"],
  start: (level) => ({ n: at(SIZES, level), cols: [], from: 0, end: null }),
  moves: (s) => [...Array.from({ length: s.n }, (_, c) => ({ id: String(c), label: `Column ${c + 1}` })), { id: BACK, label: "Step back" }],
  correct(s) {
    if (s.end) return [];
    const c = firstSafe(s);
    return [c === undefined ? BACK : String(c)];
  },
  apply(s, move) {
    if (move === BACK) {
      const last = s.cols[s.cols.length - 1];
      return last === undefined ? { ...s, end: "impossible" } : { ...s, cols: s.cols.slice(0, -1), from: last + 1 };
    }
    const cols = [...s.cols, Number(move)];
    return { ...s, cols, from: 0, end: cols.length === s.n ? "solved" : null };
  },
  why(s, move) {
    const c = firstSafe(s);
    if (move === BACK) return `There's still a safe square in row ${s.cols.length + 1}.`;
    const col = Number(move);
    if (col < s.from) return "You already tried that one with the same queens above.";
    if (!safe(s.cols, col)) return `A queen above attacks column ${col + 1}.${c === undefined ? " So does one for every other square here." : ""}`;
    return "Safe, but take the first safe column from the left, so that nothing is tried twice.";
  },
  say: (s) => (s.end === "solved" ? `${s.n} queens, none attacked.` : s.end === "impossible" ? "You tried everything, and proved that it can't be done." : `Row ${s.cols.length + 1}${s.from > 0 ? `, from column ${s.from + 1}` : ""}.`),
  done: (s) => s.end !== null,
};

/* ── Four walks of one tree ── */
export interface TreeNode {
  id: string;
  left?: string;
  right?: string;
  x: number;
  y: number;
}
export const TREE: readonly TreeNode[] = [
  { id: "M", left: "C", right: "S", x: 160, y: 30 },
  { id: "C", left: "T", right: "R", x: 80, y: 90 },
  { id: "S", right: "P", x: 240, y: 90 },
  { id: "T", x: 40, y: 150 },
  { id: "R", left: "K", x: 120, y: 150 },
  { id: "P", left: "W", x: 280, y: 150 },
  { id: "K", x: 95, y: 210 },
  { id: "W", x: 250, y: 210 },
];
export const WALKS = ["pre", "in", "post", "level"] as const;
export type Walk = (typeof WALKS)[number];
export function walk(kind: Walk): string[] {
  const node = (id: string | undefined) => TREE.find((n) => n.id === id);
  if (kind === "level") {
    const out: string[] = [], queue = ["M"];
    for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
      out.push(id);
      const n = node(id);
      if (n?.left) queue.push(n.left);
      if (n?.right) queue.push(n.right);
    }
    return out;
  }
  const go = (id: string | undefined): string[] => {
    const n = node(id);
    if (!n) return [];
    const l = go(n.left), r = go(n.right);
    return kind === "pre" ? [n.id, ...l, ...r] : kind === "in" ? [...l, n.id, ...r] : [...l, ...r, n.id];
  };
  return go("M");
}
export interface TreeState {
  kind: Walk;
  visited: readonly string[];
}
const RULE: Record<Walk, string> = {
  pre: "Preorder: the node, then its left side, then its right.",
  in: "Inorder: the left side, the node, then the right.",
  post: "Postorder: both sides first, the node last.",
  level: "Level order: row by row, left to right, with a queue.",
};
export const treeTrace: Trace<TreeState> = {
  levels: ["1. Preorder", "2. Inorder", "3. Postorder", "4. Level order"],
  start: (level) => ({ kind: at(WALKS, level), visited: [] }),
  moves: () => TREE.map((n) => ({ id: n.id, label: n.id })),
  correct: (s) => walk(s.kind).slice(s.visited.length, s.visited.length + 1),
  apply: (s, move) => ({ ...s, visited: [...s.visited, move] }),
  why(s, move) {
    if (s.visited.includes(move)) return `${move} is already visited.`;
    return `Not ${move} yet. ${RULE[s.kind]}`;
  },
  say: (s) => (treeTrace.done(s) ? `${s.visited.join(" ")}.` : RULE[s.kind]),
  done: (s) => s.visited.length === TREE.length,
};

/* ── Ripples: BFS by layers ── */
const GRIDS: readonly { name: string; story: string; rows: readonly string[] }[] = [
  { name: "1. One stone", story: "S is the start. Click every square one step away, then two, and so on.", rows: ["S..#", ".#..", "...."] },
  { name: "2. Two stones", story: "Two starts, one queue: both begin at distance 0. Click the squares in the order they're reached.", rows: ["S...", ".#..", "..#S"] },
  { name: "3. Walled in", story: "Some squares may be out of reach. Say so when nothing is left.", rows: [".S#..", ".##..", "..#.."] },
];
export interface GridState {
  rows: readonly string[];
  story: string;
  /** "r,c" → distance, for the squares reached so far. */
  dist: ReadonlyMap<string, number>;
  over: boolean;
}
export const NOTHING = "nothing";
const key = (r: number, c: number) => `${r},${c}`;
export function distances(rows: readonly string[]): Map<string, number> {
  const open = (r: number, c: number) => rows[r]?.[c] !== undefined && rows[r]?.[c] !== "#";
  const dist = new Map<string, number>();
  const queue: [number, number][] = [];
  rows.forEach((row, r) => [...row].forEach((ch, c) => ch === "S" && (dist.set(key(r, c), 0), queue.push([r, c]))));
  for (let q = queue.shift(); q; q = queue.shift()) {
    const [r, c] = q;
    for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]] as const) {
      if (!open(nr, nc) || dist.has(key(nr, nc))) continue;
      dist.set(key(nr, nc), (dist.get(key(r, c)) ?? 0) + 1);
      queue.push([nr, nc]);
    }
  }
  return dist;
}
export const bfsTrace: Trace<GridState> = {
  levels: GRIDS.map((g) => g.name),
  start(level) {
    const g = at(GRIDS, level);
    return { rows: g.rows, story: g.story, dist: new Map([...distances(g.rows)].filter(([, d]) => d === 0)), over: false };
  },
  moves: (s) => [...s.rows.flatMap((row, r) => [...row].flatMap((ch, c) => (ch === "#" ? [] : [{ id: key(r, c), label: `Row ${r + 1}, column ${c + 1}` }]))), { id: NOTHING, label: "Nothing left to reach" }],
  correct(s) {
    if (s.over) return [];
    const left = [...distances(s.rows)].filter(([k]) => !s.dist.has(k));
    const next = Math.min(...left.map(([, d]) => d));
    return left.length === 0 ? [NOTHING] : left.filter(([, d]) => d === next).map(([k]) => k);
  },
  apply: (s, move) => (move === NOTHING ? { ...s, over: true } : { ...s, dist: new Map(s.dist).set(move, distances(s.rows).get(move) ?? 0) }),
  why(s, move) {
    if (move === NOTHING) return "There's still a square next to one you've reached.";
    if (s.dist.has(move)) return "That one is already reached.";
    const d = distances(s.rows).get(move);
    if (d === undefined) return "Nothing you've reached touches that square.";
    const now = Math.min(...bfsTrace.correct(s).map((k) => distances(s.rows).get(k) ?? 0));
    return `That one is ${d} away, and the squares at distance ${now} aren't finished.`;
  },
  say(s) {
    const total = [...s.rows.join("")].filter((ch) => ch !== "#").length;
    if (s.over) return total === s.dist.size ? "Every open square, at its shortest distance." : `${total - s.dist.size} squares can't be reached: their distance stays −1.`;
    return `${s.dist.size} of ${total} open squares reached.`;
  },
  done: (s) => s.over,
};

/* ── Bubble and sink: a min-heap ── */
const HEAPS: readonly { name: string; story: string; a: readonly number[]; i: number; up: boolean }[] = [
  { name: "1. Insert 1", story: "1 was added at the end of a min-heap. Put it in its place.", a: [2, 4, 3, 9, 7, 8, 1], i: 6, up: true },
  { name: "2. Insert 5", story: "5 was added at the end.", a: [2, 4, 3, 9, 7, 8, 6, 5], i: 7, up: true },
  { name: "3. Extract", story: "The minimum was taken, and the last value, 9, moved to the root.", a: [9, 4, 3, 10, 7, 8, 5], i: 0, up: false },
  { name: "4. Extract again", story: "The minimum was taken, and 6 moved to the root.", a: [6, 3, 5, 4, 9, 8, 7], i: 0, up: false },
];
export interface HeapState {
  a: readonly number[];
  i: number;
  up: boolean;
  story: string;
  over: boolean;
}
export const parent = (i: number) => Math.floor((i - 1) / 2);
export const heapTrace: Trace<HeapState> = {
  levels: HEAPS.map((h) => h.name),
  start(level) {
    const h = at(HEAPS, level);
    return { a: h.a, i: h.i, up: h.up, story: h.story, over: false };
  },
  moves: () => [
    { id: "parent", label: "Swap with its parent" },
    { id: "left", label: "Swap with its left child" },
    { id: "right", label: "Swap with its right child" },
    { id: "stop", label: "It's in its place" },
  ],
  correct(s) {
    if (s.over) return [];
    const x = at(s.a, s.i);
    if (s.up) return [s.i > 0 && at(s.a, parent(s.i)) > x ? "parent" : "stop"];
    const l = s.a[2 * s.i + 1] ?? Infinity, r = s.a[2 * s.i + 2] ?? Infinity;
    return [Math.min(l, r) >= x ? "stop" : l < r ? "left" : "right"];
  },
  apply(s, move) {
    if (move === "stop") return { ...s, over: true };
    const j = move === "parent" ? parent(s.i) : 2 * s.i + (move === "left" ? 1 : 2);
    return { ...s, a: swapped(s.a, s.i, j), i: j };
  },
  why(s, move) {
    const x = at(s.a, s.i);
    if (move === "stop") return s.up ? `Its parent, ${at(s.a, parent(s.i))}, is bigger. In a min-heap, parents are never bigger.` : `A child is smaller than ${x}.`;
    if (s.up) return move === "parent" ? (s.i === 0 ? "It's the root: there's no parent." : `Its parent, ${at(s.a, parent(s.i))}, is already smaller.`) : "It came in at the bottom, so nothing below it can be wrong.";
    if (move === "parent") return "It came from the top, so nothing above it can be wrong.";
    const j = 2 * s.i + (move === "left" ? 1 : 2);
    const child = s.a[j];
    if (child === undefined) return "There's no child on that side.";
    return child > x ? `${child} is bigger than ${x}: leave it below.` : "Swap with the smaller child, or the bigger one becomes the parent of the smaller.";
  },
  say: (s) => (s.over ? `A heap again: [${s.a.join(", ")}]. At most one swap per level, so O(log n).` : `${at(s.a, s.i)} is at index ${s.i}.`),
  done: (s) => s.over,
};

/* ── Fill the day: the most meetings ── */
export interface Meeting {
  id: string;
  start: number;
  end: number;
}
const m = (id: string, start: number, end: number): Meeting => ({ id, start, end });
const DAYS: readonly { name: string; meetings: readonly Meeting[] }[] = [
  { name: "1. The early bird", meetings: [m("A", 9, 17), m("B", 10, 11), m("C", 11, 13), m("D", 13, 15)] },
  { name: "2. The short one", meetings: [m("A", 9, 12), m("B", 11.5, 12.5), m("C", 12, 15), m("D", 15, 17), m("E", 14.5, 15.5)] },
  { name: "3. A full board", meetings: [m("A", 9, 10.5), m("B", 10, 11), m("C", 9.5, 13), m("D", 11, 12.5), m("E", 12, 14), m("F", 12.5, 14.5), m("G", 13.5, 17), m("H", 14.5, 16)] },
];
export interface DayState {
  meetings: readonly Meeting[];
  taken: readonly string[];
  over: boolean;
}
export const FULL = "full";
const free = (s: DayState): number => Math.max(0, ...s.meetings.filter((x) => s.taken.includes(x.id)).map((x) => x.end));
export const intervalsTrace: Trace<DayState> = {
  levels: DAYS.map((d) => d.name),
  start: (level) => ({ meetings: at(DAYS, level).meetings, taken: [], over: false }),
  moves: (s) => [...s.meetings.map((x) => ({ id: x.id, label: x.id })), { id: FULL, label: "The day is full" }],
  correct(s) {
    if (s.over) return [];
    const open = s.meetings.filter((x) => !s.taken.includes(x.id) && x.start >= free(s));
    const first = Math.min(...open.map((x) => x.end));
    return open.length === 0 ? [FULL] : open.filter((x) => x.end === first).map((x) => x.id);
  },
  apply: (s, move) => (move === FULL ? { ...s, over: true } : { ...s, taken: [...s.taken, move] }),
  why(s, move) {
    if (move === FULL) return "There's a meeting you could still attend.";
    if (s.taken.includes(move)) return "You've already accepted that one.";
    const x = s.meetings.find((y) => y.id === move);
    if (x && x.start < free(s)) return `${move} starts before the last one ends.`;
    return `${move} fits, but another one that fits ends sooner, and leaves more of the day.`;
  },
  say: (s) => (s.over ? `${s.taken.length} meetings, the most possible. A meeting may start the moment another ends.` : `${s.taken.length} accepted.`),
  done: (s) => s.over,
};
