/**
 * DSA registry — the list every DSA page renders from.
 * Category order IS the recommended learning order: each pattern builds on
 * the ones before it (e.g. monotonic structures extend Stack; DFS/BFS extend
 * Trees; Graphs assume DFS/BFS; DP assumes recursion).
 */
import type { DsaCategory, DsaProblem, Difficulty } from "./types";
import { arraysHashing } from "./problems/arrays-hashing";
import { twoPointers } from "./problems/two-pointers";
import { slidingWindow } from "./problems/sliding-window";
import { stack } from "./problems/stack";
import { monotonicStackQueue } from "./problems/monotonic-stack-queue";
import { binarySearch } from "./problems/binary-search";
import { linkedList } from "./problems/linked-list";
import { trees } from "./problems/trees";
import { dfs } from "./problems/dfs";
import { bfs } from "./problems/bfs";
import { tries } from "./problems/tries";
import { heapPriorityQueue } from "./problems/heap-priority-queue";
import { recursionBacktracking } from "./problems/recursion-backtracking";
import { graphs } from "./problems/graphs";
import { intervals } from "./problems/intervals";
import { greedy } from "./problems/greedy";
import { dynamicProgramming } from "./problems/dynamic-programming";
import { bitManipulation } from "./problems/bit-manipulation";
import { mathGeometry } from "./problems/math-geometry";
import { gameTheory } from "./problems/game-theory";

export const DSA_CATEGORIES: DsaCategory[] = [
  arraysHashing,
  twoPointers,
  slidingWindow,
  stack,
  monotonicStackQueue,
  binarySearch,
  linkedList,
  trees,
  dfs,
  bfs,
  tries,
  heapPriorityQueue,
  recursionBacktracking,
  graphs,
  intervals,
  greedy,
  dynamicProgramming,
  bitManipulation,
  mathGeometry,
  gameTheory,
];

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export function getCategory(id: string): DsaCategory | undefined {
  return DSA_CATEGORIES.find((c) => c.id === id);
}

export function getProblem(
  categoryId: string,
  slug: string,
): { category: DsaCategory; problem: DsaProblem } | undefined {
  const category = getCategory(categoryId);
  const problem = category?.problems.find((p) => p.slug === slug);
  if (!category || !problem) return undefined;
  return { category, problem };
}

export const TOTAL_PROBLEMS = DSA_CATEGORIES.reduce(
  (sum, c) => sum + c.problems.length,
  0,
);

export function difficultyCounts(category: DsaCategory): Record<Difficulty, number> {
  const counts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of category.problems) counts[p.difficulty]++;
  return counts;
}
