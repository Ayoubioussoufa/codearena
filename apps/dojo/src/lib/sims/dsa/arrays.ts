/** Traces over a row of cells: hashing, two pointers, window, stack, search, DP. */
import { at, type Trace } from "../engines";

/* ── Have I seen it? Two-sum in one pass ── */
const SUMS: readonly { name: string; nums: readonly number[]; target: number }[] = [
  { name: "1. A pair", nums: [2, 11, 7, 15], target: 9 },
  { name: "2. Not with itself", nums: [3, 2, 4], target: 6 },
  { name: "3. Negative", nums: [5, -2, 8, 1, 4], target: 2 },
  { name: "4. No pair", nums: [5, 1, 3], target: 10 },
];
export interface HashState {
  nums: readonly number[];
  target: number;
  i: number;
  /** Value → index, for everything stored so far. */
  seen: ReadonlyMap<number, number>;
  answer: readonly [number, number] | "none" | null;
}
export const hashingTrace: Trace<HashState> = {
  levels: SUMS.map((x) => x.name),
  start: (level) => ({ nums: at(SUMS, level).nums, target: at(SUMS, level).target, i: 0, seen: new Map(), answer: null }),
  moves: () => [
    { id: "store", label: "Not there: store this one" },
    { id: "found", label: "It's in the map: answer" },
    { id: "none", label: "There is no pair" },
  ],
  correct(s) {
    if (s.answer !== null) return [];
    const x = s.nums[s.i];
    return [x === undefined ? "none" : s.seen.has(s.target - x) ? "found" : "store"];
  },
  apply(s, move) {
    const x = s.nums[s.i];
    if (move === "none" || x === undefined) return { ...s, answer: "none" };
    if (move === "found") return { ...s, answer: [s.seen.get(s.target - x) ?? -1, s.i] };
    return { ...s, seen: new Map(s.seen).set(x, s.i), i: s.i + 1 };
  },
  why(s, move) {
    const x = s.nums[s.i];
    if (x === undefined) return "There are no numbers left to look at.";
    const need = s.target - x;
    if (move === "none") return "You haven't looked at every number yet.";
    if (move === "store") return `${x} needs ${need}, and ${need} is in the map. You'd walk past the answer.`;
    return need === x ? `${x} needs another ${need}. The only one so far is the one in your hand, and it isn't stored yet.` : `${x} needs ${need}, and the map doesn't have it.`;
  },
  say(s) {
    if (s.answer === "none") return "Checked them all in one pass: no pair.";
    if (s.answer) return `Indexes ${s.answer[0]} and ${s.answer[1]}. One pass, no second loop.`;
    const x = s.nums[s.i];
    return x === undefined ? "The array is finished." : `Looking at ${x}. The target is ${s.target}.`;
  },
  done: (s) => s.answer !== null,
};

/* ── Two fingers: a pair in a sorted array ── */
const PAIRS: readonly { name: string; nums: readonly number[]; target: number }[] = [
  { name: "1. A pair", nums: [1, 3, 4, 6, 8, 11], target: 10 },
  { name: "2. Negative", nums: [-7, -2, 0, 3, 5, 9], target: 1 },
  { name: "3. No pair", nums: [2, 4, 9, 12], target: 20 },
];
export interface PointerState {
  nums: readonly number[];
  target: number;
  l: number;
  r: number;
  end: "found" | "none" | null;
}
export const pointersTrace: Trace<PointerState> = {
  levels: PAIRS.map((x) => x.name),
  start(level) {
    const p = at(PAIRS, level);
    return { nums: p.nums, target: p.target, l: 0, r: p.nums.length - 1, end: null };
  },
  moves: () => [
    { id: "left", label: "Move left finger →" },
    { id: "right", label: "← Move right finger" },
    { id: "found", label: "Found it" },
    { id: "none", label: "There is no pair" },
  ],
  correct(s) {
    if (s.end) return [];
    if (s.l >= s.r) return ["none"];
    const total = at(s.nums, s.l) + at(s.nums, s.r);
    return [total === s.target ? "found" : total < s.target ? "left" : "right"];
  },
  apply: (s, move) => (move === "left" ? { ...s, l: s.l + 1 } : move === "right" ? { ...s, r: s.r - 1 } : { ...s, end: move === "found" ? "found" : "none" }),
  why(s, move) {
    if (s.l >= s.r) return "The fingers have met: every pair has been ruled out.";
    const total = at(s.nums, s.l) + at(s.nums, s.r);
    if (move === "none") return "The fingers haven't met yet.";
    if (move === "found") return `${total} isn't ${s.target}.`;
    if (total === s.target) return "Look at the sum.";
    return total < s.target ? `${total} is too small, and the right finger is already on the biggest number left.` : `${total} is too big, and the left finger is already on the smallest number left.`;
  },
  say(s) {
    if (s.end === "found") return `${at(s.nums, s.l)} + ${at(s.nums, s.r)} = ${s.target}. Each move ruled out a whole row of pairs.`;
    if (s.end === "none") return "No pair, and you proved it without trying them all.";
    return s.l >= s.r ? "The fingers have met." : `${at(s.nums, s.l)} + ${at(s.nums, s.r)} = ${at(s.nums, s.l) + at(s.nums, s.r)}. Target: ${s.target}.`;
  },
  done: (s) => s.end !== null,
};

/* ── Grow or shrink: longest substring without repeats ── */
const WORDS = ["abca", "pwwke", "abba", "dvdf"] as const;
export interface WindowState {
  text: string;
  l: number;
  /** One past the last letter inside. */
  r: number;
  best: string;
  over: boolean;
}
const inside = (s: WindowState) => s.text.slice(s.l, s.r);
const legal = (s: WindowState) => new Set(inside(s)).size === s.r - s.l;
export const windowTrace: Trace<WindowState> = {
  levels: WORDS.map((w, i) => `${i + 1}. ${w}`),
  start: (level) => ({ text: at(WORDS, level), l: 0, r: 0, best: "", over: false }),
  moves: () => [
    { id: "grow", label: "Grow: take the next letter" },
    { id: "shrink", label: "Shrink: drop the first letter" },
    { id: "done", label: "Finished" },
  ],
  correct: (s) => (s.over ? [] : !legal(s) ? ["shrink"] : s.r < s.text.length ? ["grow"] : ["done"]),
  apply(s, move) {
    if (move === "done") return { ...s, over: true };
    const next = move === "grow" ? { ...s, r: s.r + 1 } : { ...s, l: s.l + 1 };
    return legal(next) && next.r - next.l > next.best.length ? { ...next, best: inside(next) } : next;
  },
  why(s, move) {
    if (!legal(s)) return move === "grow" ? "There's a repeat inside, and growing can't remove it." : "The window still holds a repeat.";
    if (move === "shrink") return s.r < s.text.length ? "The window is legal. Why give a letter away?" : "Shrinking a legal window at the end can only make it shorter.";
    return move === "grow" ? "There's no letter left to take." : "There are letters left to try.";
  },
  say: (s) => (s.over ? `Best: "${s.best}", ${s.best.length} letters. Each letter entered once and left at most once, so it's O(n).` : `Window: "${inside(s)}"${legal(s) ? "" : ", with a repeat"}. Best so far: ${s.best.length}.`),
  done: (s) => s.over,
};

/* ── The waiting line: next greater element ── */
const TEMPS: readonly (readonly number[])[] = [[2, 1, 3], [5, 4, 3, 6], [3, 3, 5, 1], [6, 2, 4, 1, 5]];
export interface StackState {
  nums: readonly number[];
  i: number;
  /** Indexes still waiting, bottom first. */
  stack: readonly number[];
  answers: readonly (number | null)[];
  over: boolean;
}
export const nextgreaterTrace: Trace<StackState> = {
  levels: TEMPS.map((t, i) => `${i + 1}. [${t.join(", ")}]`),
  start(level) {
    const nums = at(TEMPS, level);
    return { nums, i: 0, stack: [], answers: nums.map(() => null), over: false };
  },
  moves: () => [
    { id: "pop", label: "Pop: the top has its answer" },
    { id: "push", label: "Push this one" },
    { id: "done", label: "Finished: the rest have none" },
  ],
  correct(s) {
    if (s.over) return [];
    const x = s.nums[s.i], top = s.stack[s.stack.length - 1];
    if (x === undefined) return ["done"];
    return [top !== undefined && at(s.nums, top) < x ? "pop" : "push"];
  },
  apply(s, move) {
    if (move === "done") return { ...s, over: true };
    if (move === "push") return { ...s, stack: [...s.stack, s.i], i: s.i + 1 };
    const top = s.stack[s.stack.length - 1];
    return { ...s, stack: s.stack.slice(0, -1), answers: s.answers.map((a, i) => (i === top ? at(s.nums, s.i) : a)) };
  },
  why(s, move) {
    const x = s.nums[s.i], top = s.stack[s.stack.length - 1];
    if (x === undefined) return "Nobody new is arriving, so nobody on the stack can get an answer.";
    if (move === "done") return `${x} hasn't had its turn.`;
    if (move === "push") return `The top, ${top === undefined ? "" : at(s.nums, top)}, has been waiting for someone like ${x}. Answer it first.`;
    if (top === undefined) return "The stack is empty.";
    return at(s.nums, top) === x ? `${x} isn't greater than ${x}: equal doesn't count.` : `${x} isn't greater than ${at(s.nums, top)}, so the top keeps waiting.`;
  },
  say: (s) => (s.over ? "Every element was pushed once and popped at most once: O(n)." : s.i >= s.nums.length ? "The array is finished." : `${at(s.nums, s.i)} arrives.`),
  done: (s) => s.over,
};

/* ── Halve it: the first true ── */
interface Search {
  name: string;
  story: string;
  labels: readonly string[];
  ok: readonly boolean[];
  /** What the test at index i says. */
  test: readonly string[];
}
const PILES = [3, 6, 7, 11];
const hours = (speed: number) => PILES.reduce((t, p) => t + Math.ceil(p / speed), 0);
const DUPES = [1, 3, 3, 3, 8, 9, 12, 15];
const SEARCHES: readonly Search[] = [
  { name: "1. First bad version", story: "Versions 1 to 8. Once one is bad, all the later ones are. Find the first bad one.", labels: ["1", "2", "3", "4", "5", "6", "7", "8"], ok: [false, false, false, false, false, true, true, true], test: [1, 2, 3, 4, 5, 6, 7, 8].map((v) => `version ${v} is ${v >= 6 ? "bad" : "fine"}`) },
  { name: "2. First 3", story: "Find the first value ≥ 3. There are several 3s.", labels: DUPES.map(String), ok: DUPES.map((x) => x >= 3), test: DUPES.map((x) => `${x} ≥ 3 is ${x >= 3}`) },
  { name: "3. Search the answer", story: `Piles of [${PILES.join(", ")}] bananas, 8 hours, one pile at a time. Find the smallest speed that finishes.`, labels: Array.from({ length: 11 }, (_, i) => String(i + 1)), ok: Array.from({ length: 11 }, (_, i) => hours(i + 1) <= 8), test: Array.from({ length: 11 }, (_, i) => `at speed ${i + 1} it takes ${hours(i + 1)} hours: ${hours(i + 1) <= 8 ? "in time" : "too slow"}`) },
];
export interface SearchState extends Search {
  lo: number;
  hi: number;
  tested: readonly number[];
  over: boolean;
}
export const mid = (s: SearchState) => Math.floor((s.lo + s.hi) / 2);
export const bsearchTrace: Trace<SearchState> = {
  levels: SEARCHES.map((x) => x.name),
  start(level) {
    const x = at(SEARCHES, level);
    return { ...x, lo: 0, hi: x.labels.length - 1, tested: [], over: false };
  },
  moves: () => [
    { id: "hi=mid", label: "hi = mid" },
    { id: "hi=mid-1", label: "hi = mid − 1" },
    { id: "lo=mid", label: "lo = mid" },
    { id: "lo=mid+1", label: "lo = mid + 1" },
    { id: "return", label: "return lo" },
  ],
  correct: (s) => (s.over ? [] : s.lo === s.hi ? ["return"] : [at(s.ok, mid(s)) ? "hi=mid" : "lo=mid+1"]),
  apply(s, move) {
    if (move === "return") return { ...s, over: true };
    const m = mid(s), tested = [...s.tested, m];
    return move === "hi=mid" ? { ...s, hi: m, tested } : { ...s, lo: m + 1, tested };
  },
  why(s, move) {
    if (s.lo === s.hi) return "One candidate is left, so it's the answer.";
    if (move === "return") return "Several candidates are left.";
    if (at(s.ok, mid(s))) return move === "hi=mid-1" ? "mid passes, so it may be the answer itself. You'd throw it away." : "mid passes, so the first one that passes is at mid or before it.";
    return move === "lo=mid" ? "mid fails, so it can't be the answer. Keep it and the loop may never end." : "mid fails, so the answer is after it.";
  },
  say: (s) => (s.over ? `Answer: ${at(s.labels, s.lo)}, after ${s.tested.length} tests instead of up to ${s.labels.length}.` : s.lo === s.hi ? "lo and hi have met." : `Testing the middle: ${at(s.test, mid(s))}.`),
  done: (s) => s.over,
};

/* ── Fill the table: fewest coins ── */
const COINS: readonly { name: string; coins: readonly number[]; amount: number }[] = [
  { name: "1. Coins 1, 3, 4", coins: [1, 3, 4], amount: 6 },
  { name: "2. Coins 2, 5", coins: [2, 5], amount: 8 },
  { name: "3. Coins 1, 5, 6", coins: [1, 5, 6], amount: 11 },
];
export const NEVER = "never";
export interface DpState {
  coins: readonly number[];
  amount: number;
  /** Fewest coins for each amount filled so far; null = impossible. */
  table: readonly (number | null)[];
}
export function cell(coins: readonly number[], table: readonly (number | null)[], i: number): number | null {
  const from = coins.map((c) => (i - c < 0 ? null : (table[i - c] ?? null))).filter((x): x is number => x !== null);
  return from.length === 0 ? null : Math.min(...from) + 1;
}
export const dpTrace: Trace<DpState> = {
  levels: COINS.map((x) => x.name),
  start: (level) => ({ coins: at(COINS, level).coins, amount: at(COINS, level).amount, table: [0] }),
  moves: () => [...[1, 2, 3, 4, 5].map((n) => ({ id: String(n), label: String(n) })), { id: NEVER, label: "impossible" }],
  correct(s) {
    if (dpTrace.done(s)) return [];
    const c = cell(s.coins, s.table, s.table.length);
    return [c === null ? NEVER : String(c)];
  },
  apply: (s, move) => ({ ...s, table: [...s.table, move === NEVER ? null : Number(move)] }),
  why(s, move) {
    const i = s.table.length;
    const back = s.coins.filter((c) => c <= i).map((c) => `table[${i - c}] = ${s.table[i - c] ?? "impossible"}`);
    if (back.length === 0) return `No coin fits into ${i}, and you can't pay it with nothing.`;
    return `${move === NEVER ? "Some coin does get you there." : "Not quite."} Look back by each coin: ${back.join(", ")}. Take the smallest, plus one.`;
  },
  say: (s) => (dpTrace.done(s) ? `table[${s.amount}] = ${s.table[s.amount] ?? "impossible"}. Each cell read ${s.coins.length} others.` : `Fewest coins for ${s.table.length}?`),
  done: (s) => s.table.length > s.amount,
};
