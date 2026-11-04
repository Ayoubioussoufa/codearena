/**
 * Checks for content/dsa/dsa-patterns.md.
 * Questions drawn from the guide's own measured budgets, constraint table and invariants (3 Nov 2026); source checked at cses.fi.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const dsaPatternsChecks: GuideCheckSet = {
  name: "DSA Patterns guide",
  source: {
    label: "Antti Laaksonen, Competitive Programmer's Handbook (free)",
    href: "https://cses.fi/book/index.php",
    note: "The standard free textbook behind the CSES problem set: rigorous chapters on every pattern here, with complexity analysis. Read the chapter for a pattern after its section in this guide.",
  },
  terms: [
    "Loop invariant",
    "Sliding window",
    "Monotonic stack",
    "Binary search on the answer",
    "Backtracking",
    "BFS frontier",
    "Min-heap of size k",
    "Topological sort",
    "Exchange argument",
    "Dynamic programming state",
    "Bitmask DP",
  ],
  checks: [
    {
      id: "recognize",
      section: "Recognition, constraints, invariants",
      questions: [
        {
          prompt: "The constraints say n ≤ 20. What is the setter most likely telling you?",
          options: [
            "The input is sorted, so binary search",
            "Every subset fits, so think in bitmasks",
            "Only one linear pass is allowed here",
            "Quadratic is too slow, so use hashing",
          ],
          correct: 1,
          why: "2²⁰ is about a million subsets, and even O(2ⁿ · n) is 2 × 10⁷: affordable. Nothing else explains such a tiny bound; it's the strongest signal in competitive programming. At n ≤ 10⁵ you'd think O(n log n) instead.",
        },
        {
          prompt: "n ≤ 5,000 and you have an O(n²) DP. What do you do?",
          options: [
            "Look for a faster trick before coding anything",
            "Rewrite it as recursion so it runs faster",
            "Switch to Python, which handles big loops better",
            "Write it: quadratic is what the setter intended",
          ],
          correct: 3,
          why: "5,000² = 2.5 × 10⁷ operations, inside the safe budget, so the bound was chosen to allow quadratic. At n ≤ 10⁵, O(n²) is 10¹⁰ and dead: that gap is where most TLEs live. Python is 10–30× slower, the opposite of helping.",
        },
        {
          prompt: "In JavaScript, roughly how many simple operations fit safely in a one-second judge?",
          options: [
            "About ten million",
            "About ten thousand",
            "About ten billion",
            "About one hundred",
          ],
          correct: 0,
          why: "Measured in this dojo's Node: 10⁷ real operations is safe, 10⁸ is the danger zone, 10⁹ is a TLE. Python is 10–30× slower, so budget about 10⁶ there.",
        },
      ],
      explain: "Explain what a loop invariant is, then state the invariant of the longest-valid-window template and how it tells you where to shrink.",
    },
    {
      id: "arrays",
      section: "Arrays & Hashing, Two Pointers, Sliding Window",
      questions: [
        {
          prompt: "\"Longest substring with at most k distinct characters.\" Which pattern?",
          options: [
            "Two pointers converging from the two ends",
            "A heap of the most frequent characters",
            "A sliding window over the contiguous run",
            "Recursion that tries every substring in turn",
          ],
          correct: 2,
          why: "\"Longest/shortest/contains\" over a contiguous run is the sliding-window signal: grow the right edge, shrink the left while the window is invalid, and record after the shrink, so every recorded window was valid.",
        },
        {
          prompt: "Why is a fixed-size sliding window O(n) rather than O(n·k)?",
          options: [
            "The window gets sorted once and then reused",
            "Only every k-th window is ever actually checked",
            "Each step adds one element and drops one",
            "The elements are hashed into the k buckets",
          ],
          correct: 2,
          why: "The invariant is \"the running sum holds exactly the last k elements\": moving the window adds the newcomer and subtracts the one leaving. You never re-read what you already summed.",
        },
      ],
      explain: "\"Two sum\" on an unsorted array, then on a sorted one: which pattern for each, and what's each one's time and space complexity?",
    },
    {
      id: "linear",
      section: "Linked List, Stack, Monotonic Stack & Queue",
      questions: [
        {
          prompt: "Why put a dummy head before the first node in linked-list problems?",
          options: [
            "So the first node needs no special case",
            "So the list can be traversed in reverse",
            "So freed nodes are collected a bit sooner",
            "So the list's length is stored for free",
          ],
          correct: 0,
          why: "A fake node before the real head means \"insert or delete before the first node\" looks like every other case, and the answer is simply `dummy.next`. And always save `next` before rewiring, or you lose the rest of the list.",
        },
        {
          prompt: "\"Next greater element\" for every item. Which structure, and what does a pop mean?",
          options: [
            "A min-heap; each pop gives the next answer",
            "A queue; each dequeue finds the next element",
            "A hashmap; each lookup finds the next one",
            "A decreasing stack; each pop finds its answer",
          ],
          correct: 3,
          why: "Keep the stack decreasing: when a bigger value arrives, everything smaller on top has just found its next greater element and is popped. Whatever is left at the end never had one. Each item is pushed and popped once: O(n).",
        },
      ],
      explain: "Reverse a linked list in words: the three pointers, the order you rewire them, and the invariant at the top of each iteration.",
    },
    {
      id: "search",
      section: "Binary Search",
      questions: [
        {
          prompt: "In JavaScript, why use `Math.floor((l + r) / 2)` and never `(l + r) >> 1` for the midpoint?",
          options: [
            "Bit shifts round up, so the loop skips values",
            "Bit shifts coerce to 32 bits and turn negative",
            "Math.floor is faster on every single modern JS engine",
            "Shifting only works on arrays of under 1000 items",
          ],
          correct: 1,
          why: "Every bit-shift operator converts its operand to a 32-bit integer, so once `l + r` passes 2³¹ the midpoint goes negative and the loop never terminates. `Math.floor` is correct and simplest.",
        },
        {
          prompt: "\"Minimize the largest daily load so that all packages ship within D days.\" What's the approach?",
          options: [
            "Binary search on the answer, checking if it works",
            "Sort the packages, and then ship the heaviest first",
            "Try each split by backtracking, and keep the best",
            "Use a heap that always loads the lightest day",
          ],
          correct: 0,
          why: "\"Minimize the max k that works\" is the signal: if a load limit works, every larger one works too (a monotonic predicate), so binary search the first limit that passes, checking each candidate with a greedy pass in O(n).",
        },
      ],
      explain: "Compare the exact-match and first-true binary search templates: the loop condition, how `r` moves, and why each one terminates.",
    },
    {
      id: "backtracking",
      section: "Recursion, Backtracking, Sorting",
      questions: [
        {
          prompt: "In backtracking, why must you undo the choice (pop) after the recursive call returns?",
          options: [
            "So the recursion depth never grows past n levels",
            "So each subset is printed in sorted order later",
            "So the shared path stays correct for later branches",
            "So the garbage collector can reclaim the old memory",
          ],
          correct: 2,
          why: "One shared array is safe only if every call leaves it exactly as it found it: choose, explore, unchoose. Forget the pop and every later branch inherits a stale element.",
        },
        {
          prompt: "Why pass `(a, b) => a - b` to `[10, 2, 1].sort()` in JavaScript?",
          options: [
            "The default sort is unstable for any numbers",
            "The default sort compares the values as strings",
            "The default sort orders all numbers in reverse",
            "The default sort only works on short arrays",
          ],
          correct: 1,
          why: "Without a comparator, JavaScript converts elements to strings, so \"10\" sorts before \"2\". A numeric comparator fixes it. (Modern JS sort is stable; that was never the problem here.)",
        },
      ],
      explain: "Generate all subsets of [1, 2, 3] out loud, step by step, and give the complexity.",
    },
    {
      id: "traversal",
      section: "Trees, DFS, BFS",
      questions: [
        {
          prompt: "\"Fewest steps from the start cell to the exit in a grid.\" Which traversal?",
          options: [
            "DFS, since it explores one path deeply",
            "An inorder traversal of the grid's cells",
            "Binary search over the possible step counts",
            "BFS, since it explores level by level",
          ],
          correct: 3,
          why: "BFS reaches every cell at distance d before any at d + 1, so the first time it reaches the exit is the fewest steps. DFS finds a path, not the shortest. Mark cells visited when you enqueue them, not when you pop them.",
        },
        {
          prompt: "Why do the guide's BFS templates swap frontier arrays instead of calling `queue.shift()`?",
          options: [
            "shift() changes the order the nodes are visited in",
            "shift() is O(n), so the BFS would become quadratic",
            "shift() fails on arrays with over a million items",
            "shift() mutates the array, which breaks the visited set",
          ],
          correct: 1,
          why: "`shift()` moves every remaining element down one slot, so a BFS over n nodes costs O(n²). Swapping a `frontier` array for a `next` one per level (or advancing a head index) keeps it O(n).",
        },
      ],
      explain: "Validate a BST in words: why comparing each node only with its own children is wrong, and what you pass down instead.",
    },
    {
      id: "structures",
      section: "Tries, Strings, Heaps",
      questions: [
        {
          prompt: "You need the k largest values from a stream of a million numbers. Which structure?",
          options: [
            "A max-heap holding every number seen so far",
            "A sorted array, re-sorted after each new number",
            "A hash map counting each number that arrives",
            "A min-heap holding only the k largest seen",
          ],
          correct: 3,
          why: "Keep a min-heap of size k: its top is the smallest of your current top k, so a new number only enters if it beats that top. O(n log k) time and O(k) memory, instead of storing a million numbers.",
        },
        {
          prompt: "Many words must be checked by prefix, or against one long text. Which structure?",
          options: [
            "A trie, sharing each common prefix once",
            "A heap, ordering the words by length",
            "A stack, pushing each word that appears",
            "A queue, matching words in arrival order",
          ],
          correct: 0,
          why: "A trie stores words character by character, so all words starting with \"pro\" share one path. A prefix lookup costs the prefix's length, whatever the dictionary's size.",
        },
      ],
      explain: "Explain why a heap gives you its minimum in O(1) and inserts or pops in O(log n), and what heap order does not tell you.",
    },
    {
      id: "graphs",
      section: "Graphs",
      questions: [
        {
          prompt: "Course prerequisites: can every course be finished? Which algorithm?",
          options: [
            "Dijkstra, so shortest paths decide the order",
            "Binary search over the count of courses",
            "Topological sort; stuck nodes mean a cycle",
            "A min-heap holding the courses by name",
          ],
          correct: 2,
          why: "Kahn's algorithm repeatedly takes courses with in-degree 0. If some course never reaches in-degree 0, it's stuck behind a cycle, so not every course can be finished. The cycle check comes for free.",
        },
        {
          prompt: "In Dijkstra with a binary heap, why is `if (d > dist[u]) continue` required?",
          options: [
            "Negative edge weights would otherwise loop forever",
            "Without it, the heap would overflow memory",
            "Outdated queue entries are skipped, not deleted",
            "It lets the algorithm handle directed graphs",
          ],
          correct: 2,
          why: "You never delete an old, longer entry when a shorter path is found; you push the new one. When the stale entry is popped later, that line skips it. Dijkstra still needs non-negative weights; Bellman-Ford handles negative ones.",
        },
      ],
      explain: "Shortest paths: when do you use BFS, 0-1 BFS, Dijkstra, or Bellman-Ford? Give the edge-weight condition for each.",
    },
    {
      id: "greedy",
      section: "Intervals, Greedy, Bit Manipulation",
      questions: [
        {
          prompt: "How do you know a greedy choice is safe?",
          options: [
            "A swap argument: putting it in never hurts",
            "It passes the examples given in the problem",
            "It runs in linear time, which proves it",
            "Each step picks the biggest value still left",
          ],
          correct: 0,
          why: "The exchange argument: if an optimal solution disagrees with the greedy choice, swap the greedy choice in without making it worse; repeat, and the optimal solution becomes the greedy one. If you can build a counter-example instead, you need DP.",
        },
        {
          prompt: "Maximum number of non-overlapping intervals. How do you sort them?",
          options: [
            "By start time, then take each one that fits",
            "By length, shortest first, then any one that fits",
            "By how many of the others each one overlaps",
            "By end time, then take each one that fits",
          ],
          correct: 3,
          why: "Taking the interval that ends first leaves the most room for the rest; the exchange argument proves it. Sorting by start time fails on one long interval that starts first and blocks many short ones.",
        },
      ],
      explain: "Explain why `x & (x - 1)` clears the lowest set bit, and name one problem where you'd use it.",
    },
    {
      id: "dp",
      section: "Dynamic Programming",
      questions: [
        {
          prompt: "A greedy idea has a counter-example. What should you try next?",
          options: [
            "Sorting the input differently, then the same greedy",
            "Dynamic programming, defining a state and a transition",
            "A binary search over the greedy's final answer",
            "A heap that replays the greedy's choices again",
          ],
          correct: 1,
          why: "A counter-example means the locally best choice can block a better future, so you must consider several choices per step and remember results: DP. Define the state, the transition, the base case, and solve each subproblem once.",
        },
        {
          prompt: "In bitmask DP, why does iterating masks in increasing numeric order work?",
          options: [
            "Adding an element only increases the mask's value",
            "Masks with more bits are always processed first",
            "The order never matters in bitmask DP problems",
            "Each mask depends only on the previous mask",
          ],
          correct: 0,
          why: "Setting a bit always makes the number bigger, so every mask's smaller sub-states are already final when it's processed. That's what lets a plain `for (mask = 0; mask < 1 << n; mask++)` loop be correct.",
        },
      ],
      explain: "Define the state, transition and base case for climbing stairs (1 or 2 steps at a time), then say how you'd shrink its memory to O(1).",
    },
    {
      id: "rest",
      section: "Math, games, and cross-cutting tricks",
      questions: [
        {
          prompt: "\"Both players play optimally; who wins?\" with n up to 10⁹. What are you looking for?",
          options: [
            "A full game tree explored with memoized recursion",
            "Greedy moves that grab the most each turn",
            "A pattern or invariant that gives a formula",
            "A simulation of every single possible move order",
          ],
          correct: 2,
          why: "n up to 10⁹ rules out exploring states, so the answer is a formula: a parity rule or a multiple pattern. Find it with a small memoized search, then verify the guessed invariant against brute force before trusting it.",
        },
        {
          prompt: "\"Sum of any subarray, asked many times.\" Which micro-move?",
          options: [
            "A sorted copy, searched once for each query",
            "Prefix sums, so each query is one subtraction",
            "A heap, popping the range's values per query",
            "A trie of every subarray sum, prebuilt once",
          ],
          correct: 1,
          why: "Precompute `prefix[i]` = sum of the first i elements once in O(n); then sum(l..r) = prefix[r + 1] − prefix[l] in O(1) per query.",
        },
      ],
      explain: "Run the edge-case checklist on \"maximum subarray sum\": which inputs do you test before you say done?",
    },
  ],
};
