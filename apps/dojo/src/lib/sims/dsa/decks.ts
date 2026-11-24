import type { Deck } from "../engines";

export const PATTERN: Deck = {
  ask: "Which pattern first?",
  options: [],
  pass: 12,
  cards: [
    { text: "Given an unsorted array, return the indexes of two numbers that add up to the target.", options: ["Hash map", "Sliding window", "Heap", "BFS"], answer: "Hash map", why: "Unsorted, and you need indexes: look up the complement." },
    { text: "Longest substring with at most two distinct characters.", options: ["Dynamic programming", "Sliding window", "Trie", "Binary search"], answer: "Sliding window", why: "\"Longest substring with at most k\": contiguous, with a condition that growing breaks and shrinking repairs." },
    { text: "Minimum number of moves for a knight to reach a square.", options: ["DFS", "Greedy", "BFS", "Dijkstra"], answer: "BFS", why: "Fewest steps, and every step costs the same." },
    { text: "The 10 most frequent words of a huge log.", options: ["Two pointers", "Union-find", "Backtracking", "Hash map and heap"], answer: "Hash map and heap", why: "Count, then keep the top k." },
    { text: "All the ways to write 8 pairs of balanced brackets.", options: ["Backtracking", "Greedy", "Monotonic stack", "Prefix sums"], answer: "Backtracking", why: "\"All the ways\", and n is tiny." },
    { text: "For each day, how many days until a warmer one?", options: ["Heap", "Monotonic stack", "Sliding window", "Binary search"], answer: "Monotonic stack", why: "The next greater element, for everyone." },
    { text: "The smallest ship capacity that delivers every package within D days.", options: ["Dijkstra", "Dynamic programming", "Binary search on the answer", "Intervals"], answer: "Binary search on the answer", why: "If a capacity works, every bigger one does: find the first that works." },
    { text: "In how many ways can you climb n stairs, 1 or 2 at a time?", options: ["Dynamic programming", "BFS", "Two pointers", "Union-find"], answer: "Dynamic programming", why: "\"How many ways\", built from smaller answers." },
    { text: "Can you finish all the courses, given their prerequisites?", options: ["Intervals", "Trie", "Heap", "Topological sort"], answer: "Topological sort", why: "Prerequisites make a directed graph. Is there a cycle?" },
    { text: "Merge all the overlapping meetings.", options: ["Monotonic stack", "Sort, then sweep", "Hash map", "Binary search"], answer: "Sort, then sweep", why: "Sort by start, and each one only touches the last you kept." },
    { text: "The cheapest flight from A to B, with prices on the routes.", options: ["BFS", "DFS", "Dijkstra", "Union-find"], answer: "Dijkstra", why: "Shortest path with weights that aren't negative." },
    { text: "Suggest words as the user types a prefix.", options: ["Trie", "Heap", "Sliding window", "Greedy"], answer: "Trie", why: "Shared prefixes are shared branches." },
    { text: "Many queries: the sum of nums[l..r]. The array never changes.", options: ["Sliding window", "Prefix sums", "Two pointers", "Heap"], answer: "Prefix sums", why: "One pass to prepare, and every query is a subtraction." },
    { text: "After each new friendship, how many groups of friends are there?", options: ["Topological sort", "Dijkstra", "Backtracking", "Union-find"], answer: "Union-find", why: "Groups that only ever merge." },
  ],
};

export const BUDGET: Deck = {
  ask: "What's the slowest complexity that still fits?",
  options: ["O(n!)", "O(2ⁿ)", "O(n³)", "O(n²)", "O(n log n)", "O(n)", "O(log n)"],
  pass: 9,
  cards: [
    { text: "n ≤ 20", answer: "O(2ⁿ)", why: "2²⁰ is a million. 20! is 2 × 10¹⁸." },
    { text: "n ≤ 100,000", answer: "O(n log n)", why: "10⁵ × 17 is under 2 million. n² would be 10¹⁰." },
    { text: "n ≤ 300", answer: "O(n³)", why: "300³ is 27 million." },
    { text: "n ≤ 1,000,000,000", answer: "O(log n)", why: "Even one pass is too slow: 30 halvings do it." },
    { text: "n ≤ 9", answer: "O(n!)", why: "9! is 362,880." },
    { text: "n ≤ 3,000", answer: "O(n²)", why: "9 million. n³ would be 2.7 × 10¹⁰." },
    { text: "n ≤ 50,000,000", answer: "O(n)", why: "One pass. With a log, it's over a billion." },
    { text: "n ≤ 200, all pairs of cities", answer: "O(n³)", why: "8 million: Floyd–Warshall is invited." },
    { text: "n ≤ 18, every subset", answer: "O(2ⁿ)", why: "262,144 subsets. The statement is nearly telling you." },
    { text: "n ≤ 10¹⁸, one number", answer: "O(log n)", why: "Digits, halving, or fast power." },
  ],
};
