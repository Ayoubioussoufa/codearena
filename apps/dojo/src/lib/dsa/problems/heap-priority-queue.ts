/**
 * DSA — Heap / Priority Queue. Repeatedly need the current min or max while
 * items keep arriving? That's a heap: O(log n) insert/extract. JS has no
 * built-in, so solutions either inline a small binary heap or use a sorted
 * array (fine for these sizes; the approach notes the heap version).
 */
import type { DsaCategory } from "../types";

export const heapPriorityQueue: DsaCategory = {
  id: "heap-priority-queue",
  title: "Heap / Priority Queue",
  icon: "⛰️",
  docAnchor: "heaps-and-priority-queues",
  blurb:
    "Always know the current best: top-k selection, streaming medians, greedy simulations with changing extremes.",
  problems: [
    {
      slug: "last-stone-weight",
      title: "Last Stone Weight",
      difficulty: "Easy",
      category: "heap-priority-queue",
      blurb: "Smash the two heaviest stones until at most one remains.",
      statement: [
        "Repeatedly take the two HEAVIEST stones (x ≤ y) and smash them: if equal both vanish; otherwise a stone of weight `y − x` remains. Return the weight of the last stone (0 if none).",
      ],
      examples: [
        { input: "stones = [2,7,4,1,8,1]", output: "1", explanation: "8&7→1, 4&2→2, 2&1→1, 1&1→0, leaving 1." },
        { input: "stones = [1]", output: "1" },
      ],
      constraints: ["1 <= stones.length <= 30"],
      fnName: "lastStoneWeight",
      starter: "function lastStoneWeight(stones) {\n  \n}",
      solution:
        "function lastStoneWeight(stones) {\n  const heap = [];\n  function push(v) {\n    heap.push(v);\n    let i = heap.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (heap[p] >= heap[i]) break;\n      [heap[p], heap[i]] = [heap[i], heap[p]];\n      i = p;\n    }\n  }\n  function pop() {\n    const top = heap[0];\n    const last = heap.pop();\n    if (heap.length) {\n      heap[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < heap.length && heap[l] > heap[m]) m = l;\n        if (r < heap.length && heap[r] > heap[m]) m = r;\n        if (m === i) break;\n        [heap[m], heap[i]] = [heap[i], heap[m]];\n        i = m;\n      }\n    }\n    return top;\n  }\n  for (const s of stones) push(s);\n  while (heap.length > 1) {\n    const y = pop(), x = pop();\n    if (y !== x) push(y - x);\n  }\n  return heap.length ? heap[0] : 0;\n}",
      tests: [
        { args: [[2, 7, 4, 1, 8, 1]], expected: 1 },
        { args: [[1]], expected: 1 },
        { args: [[3, 3]], expected: 0 },
        { args: [[10, 2]], expected: 8 },
      ],
      approach:
        "The simulation needs 'give me the current maximum' over and over while the multiset keeps changing — the exact job description of a max-heap: push all stones, then pop-pop-push until one remains, O(n log n). This solution also shows the full array-backed binary heap you'll reuse everywhere in JS: parent at (i−1)/2, children at 2i+1 and 2i+2, sift-up on push, sift-down on pop. Type it once from memory — every other problem in this category assumes you can.",
      docAnchor: "heaps-and-priority-queues",
    },
    {
      slug: "kth-largest-element-in-a-stream",
      title: "Kth Largest Element in a Stream",
      difficulty: "Easy",
      category: "heap-priority-queue",
      blurb: "After each new score, report the kth largest so far.",
      statement: [
        "Process operations: `\"KthLargest\"` initializes with `k` and an array of scores; each `\"add\"` inserts a score and returns the kth LARGEST score seen so far. Return each operation's result (`null` for the constructor).",
      ],
      examples: [
        {
          input: "ops = [\"KthLargest\",\"add\",\"add\",\"add\",\"add\",\"add\"], args = [[3,[4,5,8,2]],[3],[5],[10],[9],[4]]",
          output: "[null,4,5,5,8,8]",
        },
      ],
      constraints: ["1 <= k <= 10^4", "It is guaranteed k elements exist by the first add"],
      fnName: "kthLargest",
      starter: "function kthLargest(ops, args) {\n  \n}",
      solution:
        "function kthLargest(ops, args) {\n  const res = [];\n  let k = 0;\n  let arr = []; // ascending, kept at length <= k\n  function insert(v) {\n    let lo = 0, hi = arr.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (arr[mid] < v) lo = mid + 1;\n      else hi = mid;\n    }\n    arr.splice(lo, 0, v);\n    if (arr.length > k) arr.shift();\n  }\n  for (let i = 0; i < ops.length; i++) {\n    if (ops[i] === \"KthLargest\") {\n      k = args[i][0];\n      arr = [];\n      for (const v of args[i][1]) insert(v);\n      res.push(null);\n    } else {\n      insert(args[i][0]);\n      res.push(arr[0]);\n    }\n  }\n  return res;\n}",
      tests: [
        {
          args: [["KthLargest", "add", "add", "add", "add", "add"], [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]],
          expected: [null, 4, 5, 5, 8, 8],
        },
        {
          args: [["KthLargest", "add", "add"], [[1, []], [-3], [0]]],
          expected: [null, -3, 0],
        },
        {
          args: [["KthLargest", "add"], [[2, [7, 7]], [7]]],
          expected: [null, 7],
        },
      ],
      approach:
        "The defining top-k trick: keep only the k best in a MIN-structure. Its smallest element (the root / arr[0]) is exactly the kth largest overall, and any newcomer either beats it (evict, insert) or is irrelevant. Memory stays O(k) no matter how long the stream runs. This solution uses a binary-insert sorted array (simple, O(k) per add from splice); the heap version makes each add O(log k) — same invariant, better complexity. 'Min-heap of size k for kth largest' feels backwards until you internalize WHY: the boundary element is what you must know, and it sits at a min-root.",
      docAnchor: "heaps-and-priority-queues",
    },
    {
      slug: "kth-largest-element-in-an-array",
      title: "Kth Largest Element in an Array",
      difficulty: "Medium",
      category: "heap-priority-queue",
      blurb: "The kth largest — without fully sorting (in spirit).",
      statement: [
        "Given `nums` and `k`, return the kth LARGEST element (duplicates count separately, so it's the kth in sorted order, not the kth distinct value).",
      ],
      examples: [
        { input: "nums = [3,2,1,5,6,4], k = 2", output: "5" },
        { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4" },
      ],
      constraints: ["1 <= k <= nums.length <= 10^5"],
      fnName: "findKthLargest",
      starter: "function findKthLargest(nums, k) {\n  \n}",
      solution:
        "function findKthLargest(nums, k) {\n  return [...nums].sort((a, b) => b - a)[k - 1];\n}",
      tests: [
        { args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
        { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
        { args: [[1], 1], expected: 1 },
        { args: [[2, 1], 2], expected: 1 },
      ],
      approach:
        "Three ladder rungs, know all three: (1) sort and index — O(n log n), the one-liner shown; (2) min-heap of size k — O(n log k), wins when k ≪ n or the data streams in (see Kth Largest in a Stream); (3) quickselect — partition around a pivot and recurse into ONE side, average O(n), the theoretical best. Interviewers usually want you to SAY all three and implement (2) or (3). The sort answer is fine to start with — then improve it out loud.",
      docAnchor: "heaps-and-priority-queues",
    },
    {
      slug: "k-closest-points-to-origin",
      title: "K Closest Points to Origin",
      difficulty: "Medium",
      category: "heap-priority-queue",
      blurb: "The k points nearest (0,0).",
      statement: [
        "Given `points` on a plane, return the `k` points closest to the origin (any order). Answers are unique for the given tests.",
      ],
      examples: [
        { input: "points = [[1,3],[-2,2]], k = 1", output: "[[-2,2]]", explanation: "√8 < √10." },
        { input: "points = [[3,3],[5,-1],[-2,4]], k = 2", output: "[[3,3],[-2,4]]" },
      ],
      constraints: ["1 <= k <= points.length <= 10^4"],
      fnName: "kClosest",
      starter: "function kClosest(points, k) {\n  \n}",
      solution:
        "function kClosest(points, k) {\n  return [...points]\n    .sort((a, b) => a[0] * a[0] + a[1] * a[1] - (b[0] * b[0] + b[1] * b[1]))\n    .slice(0, k);\n}",
      tests: [
        { args: [[[1, 3], [-2, 2]], 1], expected: [[-2, 2]] },
        { args: [[[3, 3], [5, -1], [-2, 4]], 2], expected: [[3, 3], [-2, 4]], unordered: true },
        { args: [[[0, 1]], 1], expected: [[0, 1]] },
      ],
      approach:
        "Two habits to bank: compare SQUARED distances (x²+y²) — sqrt is monotonic, so it never changes the order and only costs precision and time; and recognize this as the same top-k family as Kth Largest — a MAX-heap of size k (evict the farthest kept point when a closer one arrives) gives O(n log k) and, crucially, works when the points stream in and you can't hold them all. The sort is the honest baseline; say the heap upgrade in interviews.",
      docAnchor: "heaps-and-priority-queues",
    },
    {
      slug: "top-k-frequent-words",
      title: "Top K Frequent Words",
      difficulty: "Medium",
      category: "heap-priority-queue",
      blurb: "Most frequent words; ties broken alphabetically.",
      statement: [
        "Return the `k` most frequent strings in `words`, ordered by frequency (highest first) and alphabetically within equal frequency.",
      ],
      examples: [
        { input: "words = [\"i\",\"love\",\"leetcode\",\"i\",\"love\",\"coding\"], k = 2", output: "[\"i\",\"love\"]" },
        { input: "words = [\"the\",\"day\",\"is\",\"sunny\",\"the\",\"the\",\"the\",\"sunny\",\"is\",\"is\"], k = 4", output: "[\"the\",\"is\",\"sunny\",\"day\"]" },
      ],
      constraints: ["1 <= words.length <= 500", "1 <= k <= number of distinct words"],
      fnName: "topKFrequentWords",
      starter: "function topKFrequentWords(words, k) {\n  \n}",
      solution:
        "function topKFrequentWords(words, k) {\n  const freq = new Map();\n  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);\n  return [...freq.keys()]\n    .sort((a, b) => freq.get(b) - freq.get(a) || (a < b ? -1 : 1))\n    .slice(0, k);\n}",
      tests: [
        { args: [["i", "love", "leetcode", "i", "love", "coding"], 2], expected: ["i", "love"] },
        { args: [["the", "day", "is", "sunny", "the", "the", "the", "sunny", "is", "is"], 4], expected: ["the", "is", "sunny", "day"] },
        { args: [["a"], 1], expected: ["a"] },
      ],
      approach:
        "Count with a hash map, then order by a COMPOUND comparator: frequency descending, then alphabetical — the `||` chaining idiom (`byFreq || byAlpha`) is the clean way to express tie-breaks and is worth committing to muscle memory. The heap version keeps k entries with the comparator INVERTED (the weakest candidate at the root, so it's the one evicted) — inverting the comparator for the size-k heap is the detail people get wrong; re-derive it from 'the root is what leaves next'.",
      docAnchor: "heaps-and-priority-queues",
    },
    {
      slug: "minimum-cost-to-connect-sticks",
      title: "Minimum Cost to Connect Sticks",
      difficulty: "Medium",
      category: "heap-priority-queue",
      blurb: "Merging two sticks costs their sum — minimize the total.",
      statement: [
        "Connecting two sticks of lengths a and b costs `a + b` and produces one stick of length `a + b`. Return the minimum total cost to connect all `sticks` into one (0 if there's only one).",
      ],
      examples: [
        { input: "sticks = [2,4,3]", output: "14", explanation: "2+3=5, then 5+4=9; 5+9=14." },
        { input: "sticks = [1,8,3,5]", output: "30" },
        { input: "sticks = [5]", output: "0" },
      ],
      constraints: ["1 <= sticks.length <= 10^4"],
      fnName: "connectSticks",
      starter: "function connectSticks(sticks) {\n  \n}",
      solution:
        "function connectSticks(sticks) {\n  const arr = [...sticks].sort((a, b) => a - b);\n  let total = 0;\n  while (arr.length > 1) {\n    const a = arr.shift();\n    const b = arr.shift();\n    const s = a + b;\n    total += s;\n    let lo = 0, hi = arr.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (arr[mid] < s) lo = mid + 1;\n      else hi = mid;\n    }\n    arr.splice(lo, 0, s);\n  }\n  return total;\n}",
      tests: [
        { args: [[2, 4, 3]], expected: 14 },
        { args: [[1, 8, 3, 5]], expected: 30 },
        { args: [[5]], expected: 0 },
        { args: [[1, 2, 3, 4]], expected: 19 },
      ],
      approach:
        "A stick's length is re-paid every time it's part of a merge, so long sticks must merge LATE and short sticks early — hence: always merge the two current minimums. That 'repeatedly combine the two smallest' loop is Huffman coding's exact skeleton (there it builds optimal prefix codes) and needs a structure serving changing minimums: a min-heap for O(n log n). The sorted-array-with-binary-insert shown is the same algorithm with an O(n) insert — acceptable here, and a nice foil for asking 'what does the heap actually buy?'",
      docAnchor: "heaps-and-priority-queues",
    },
    {
      slug: "ugly-number-ii",
      title: "Ugly Number II",
      difficulty: "Medium",
      category: "heap-priority-queue",
      blurb: "The nth number whose only prime factors are 2, 3, 5.",
      statement: [
        "An ugly number has no prime factors other than 2, 3, and 5 (1 counts). Return the `n`th ugly number.",
      ],
      examples: [
        { input: "n = 10", output: "12", explanation: "1, 2, 3, 4, 5, 6, 8, 9, 10, 12." },
        { input: "n = 1", output: "1" },
      ],
      constraints: ["1 <= n <= 1690"],
      fnName: "nthUglyNumber",
      starter: "function nthUglyNumber(n) {\n  \n}",
      solution:
        "function nthUglyNumber(n) {\n  const ugly = [1];\n  let i2 = 0, i3 = 0, i5 = 0;\n  while (ugly.length < n) {\n    const next = Math.min(ugly[i2] * 2, ugly[i3] * 3, ugly[i5] * 5);\n    ugly.push(next);\n    if (next === ugly[i2] * 2) i2++;\n    if (next === ugly[i3] * 3) i3++;\n    if (next === ugly[i5] * 5) i5++;\n  }\n  return ugly[n - 1];\n}",
      tests: [
        { args: [10], expected: 12 },
        { args: [1], expected: 1 },
        { args: [15], expected: 24 },
        { args: [7], expected: 8 },
      ],
      approach:
        "Every ugly number is a previous ugly number × 2, × 3, or × 5 — so GENERATE them in order instead of testing candidates. The heap version: pop the smallest, push its three multiples, dedupe, repeat n times. The three-pointer version shown is the refined form: pointer i2 marks the next ugly number waiting to be doubled (similarly i3, i5); take the min of the three candidates and advance every pointer that produced it (advancing multiple pointers at once is the dedupe — 6 comes from both 2·3 and 3·2). Heap = general tool; pointers = this problem's closed form. Meeting both teaches you when a heap is scaffolding you can later remove.",
      docAnchor: "heaps-and-priority-queues",
    },
    {
      slug: "task-scheduler",
      title: "Task Scheduler",
      difficulty: "Medium",
      category: "heap-priority-queue",
      blurb: "Schedule identical tasks with a cooldown between repeats.",
      statement: [
        "Given `tasks` (letters) and a cooldown `n`, identical tasks must be at least `n` intervals apart; the CPU can idle. Return the minimum number of intervals to finish all tasks.",
      ],
      examples: [
        { input: "tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 2", output: "8", explanation: "A B idle A B idle A B." },
        { input: "tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 0", output: "6" },
      ],
      constraints: ["1 <= tasks.length <= 10^4", "0 <= n <= 100"],
      fnName: "leastInterval",
      starter: "function leastInterval(tasks, n) {\n  \n}",
      solution:
        "function leastInterval(tasks, n) {\n  const counts = new Array(26).fill(0);\n  for (const t of tasks) counts[t.charCodeAt(0) - 65]++;\n  const maxCount = Math.max(...counts);\n  const maxTies = counts.filter((c) => c === maxCount).length;\n  return Math.max(tasks.length, (maxCount - 1) * (n + 1) + maxTies);\n}",
      tests: [
        { args: [["A", "A", "A", "B", "B", "B"], 2], expected: 8 },
        { args: [["A", "A", "A", "B", "B", "B"], 0], expected: 6 },
        { args: [["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], 2], expected: 16 },
        { args: [["A", "B", "C"], 5], expected: 3 },
      ],
      approach:
        "Picture the most frequent task pinning down the schedule: its maxCount occurrences create (maxCount − 1) gaps of width n+1, and tasks tied for the max add one slot each to the final row — that's (maxCount−1)(n+1) + ties. If there are enough OTHER tasks to fill every gap, no idling is needed and the answer is simply tasks.length: hence the max of the two. The heap alternative simulates round by round (pop the most frequent available, hold it in cooldown) — more code, same answer, but it generalizes to variable cooldowns where the formula breaks. Know the formula, understand it via the simulation.",
      docAnchor: "heaps-and-priority-queues",
    },
    {
      slug: "furthest-building-you-can-reach",
      title: "Furthest Building You Can Reach",
      difficulty: "Medium",
      category: "heap-priority-queue",
      blurb: "Spend ladders on the biggest climbs, bricks on the rest.",
      statement: [
        "Walking left to right over `heights`, climbing UP a difference `d > 0` costs either `d` bricks or one ladder (any size). Given `bricks` and `ladders`, return the furthest building index you can reach.",
      ],
      examples: [
        { input: "heights = [4,2,7,6,9,14,12], bricks = 5, ladders = 1", output: "4", explanation: "Bricks for +5 and +3, ladder saved... best is index 4." },
        { input: "heights = [14,3,19,3], bricks = 17, ladders = 0", output: "3" },
      ],
      constraints: ["1 <= heights.length <= 10^5", "0 <= bricks, ladders <= 10^9"],
      fnName: "furthestBuilding",
      starter: "function furthestBuilding(heights, bricks, ladders) {\n  \n}",
      solution:
        "function furthestBuilding(heights, bricks, ladders) {\n  const heap = []; // min-heap of climbs currently covered by ladders\n  function push(v) {\n    heap.push(v);\n    let i = heap.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (heap[p] <= heap[i]) break;\n      [heap[p], heap[i]] = [heap[i], heap[p]];\n      i = p;\n    }\n  }\n  function pop() {\n    const top = heap[0];\n    const last = heap.pop();\n    if (heap.length) {\n      heap[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < heap.length && heap[l] < heap[m]) m = l;\n        if (r < heap.length && heap[r] < heap[m]) m = r;\n        if (m === i) break;\n        [heap[m], heap[i]] = [heap[i], heap[m]];\n        i = m;\n      }\n    }\n    return top;\n  }\n  for (let i = 1; i < heights.length; i++) {\n    const d = heights[i] - heights[i - 1];\n    if (d <= 0) continue;\n    push(d);\n    if (heap.length > ladders) bricks -= pop();\n    if (bricks < 0) return i - 1;\n  }\n  return heights.length - 1;\n}",
      tests: [
        { args: [[4, 2, 7, 6, 9, 14, 12], 5, 1], expected: 4 },
        { args: [[4, 12, 2, 7, 3, 18, 20, 3, 19], 10, 2], expected: 7 },
        { args: [[14, 3, 19, 3], 17, 0], expected: 3 },
        { args: [[1, 1, 1], 0, 0], expected: 2 },
      ],
      approach:
        "You obviously want ladders on the LARGEST climbs — but you can't know the largest in advance while walking. The heap makes the greedy retroactive: tentatively assign every climb a ladder; when ladders run out (heap size exceeds the count), demote the SMALLEST tentatively-laddered climb to bricks (pop the min-heap). The assignment stays optimal at every step without knowing the future. This 'commit provisionally, revoke the cheapest commitment when over budget' move is a heap specialty that pure sorting can't replicate — the decisions interleave with the walk.",
      docAnchor: "heaps-and-priority-queues",
    },
    {
      slug: "find-median-from-data-stream",
      title: "Find Median from Data Stream",
      difficulty: "Hard",
      category: "heap-priority-queue",
      blurb: "Support addNum and findMedian on a growing stream.",
      statement: [
        "Process operations: `\"addNum\"` inserts an integer; `\"findMedian\"` returns the median of all numbers so far (the mean of the two middle values when the count is even). Return each operation's result (`null` for adds).",
      ],
      examples: [
        {
          input: "ops = [\"addNum\",\"addNum\",\"findMedian\",\"addNum\",\"findMedian\"], args = [[1],[2],[],[3],[]]",
          output: "[null,null,1.5,null,2]",
        },
      ],
      constraints: ["-10^5 <= num <= 10^5", "findMedian is only called after at least one add"],
      fnName: "medianFinder",
      starter: "function medianFinder(ops, args) {\n  \n}",
      solution:
        "function medianFinder(ops, args) {\n  const arr = []; // kept sorted\n  const res = [];\n  for (let i = 0; i < ops.length; i++) {\n    if (ops[i] === \"addNum\") {\n      const v = args[i][0];\n      let lo = 0, hi = arr.length;\n      while (lo < hi) {\n        const mid = (lo + hi) >> 1;\n        if (arr[mid] < v) lo = mid + 1;\n        else hi = mid;\n      }\n      arr.splice(lo, 0, v);\n      res.push(null);\n    } else {\n      const n = arr.length;\n      res.push(n % 2 === 1 ? arr[(n - 1) / 2] : (arr[n / 2 - 1] + arr[n / 2]) / 2);\n    }\n  }\n  return res;\n}",
      tests: [
        {
          args: [["addNum", "addNum", "findMedian", "addNum", "findMedian"], [[1], [2], [], [3], []]],
          expected: [null, null, 1.5, null, 2],
        },
        {
          args: [["addNum", "findMedian"], [[5], []]],
          expected: [null, 5],
        },
        {
          args: [["addNum", "addNum", "addNum", "addNum", "findMedian"], [[10], [2], [6], [4], []]],
          expected: [null, null, null, null, 5],
        },
      ],
      approach:
        "The famous TWO-HEAP design: a max-heap holding the smaller half and a min-heap holding the larger half, rebalanced so their sizes differ by at most one — the median is then a root (or the mean of both roots), O(log n) per add, O(1) per query. The sorted-array version shown is the honest O(n)-insert baseline; it makes the invariant visible (the median lives at the middle) before the two heaps make it fast. Splitting data into two halves guarded by opposite-facing heaps also solves sliding-window medians and IQR tracking — it's a design, not a trick.",
      docAnchor: "heaps-and-priority-queues",
    },
    {
      slug: "kth-smallest-in-sorted-matrix",
      title: "Kth Smallest Element in a Sorted Matrix",
      difficulty: "Medium",
      category: "heap-priority-queue",
      blurb: "kth smallest in a row- and column-sorted matrix.",
      statement: [
        "Given an `n × n` matrix where each row and each column is sorted ascending, return the `k`-th smallest element (in overall sorted order, counting duplicates).",
        "Canonical must-do (AM-600 Heap / Binary Search family).",
      ],
      examples: [
        { input: "matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8", output: "13" },
        { input: "matrix = [[-5]], k = 1", output: "-5" },
      ],
      constraints: ["1 <= n <= 300", "1 <= k <= n^2"],
      fnName: "kthSmallest",
      starter: `function kthSmallest(matrix, k) {\n  \n}`,
      solution: `function kthSmallest(matrix, k) {\n  const flat = [];\n  for (const row of matrix) for (const x of row) flat.push(x);\n  flat.sort((a, b) => a - b);\n  return flat[k - 1];\n}`,
      tests: [
        { args: [[[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8], expected: 13 },
        { args: [[[-5]], 1], expected: -5 },
        { args: [[[1, 2], [1, 3]], 2], expected: 1 },
        { args: [[[1, 2], [1, 3]], 4], expected: 3 },
      ],
      approach:
        "The reference here flattens and sorts (O(n² log n)) — correct and simple. But the *intended* techniques exploit the sortedness: (1) a **min-heap** seeded with each row's first element, popped k times, each pop pushing the next element in that row → O(k log n); or (2) **binary search on the value** range, counting how many elements ≤ mid (walk from bottom-left) → O(n log(max−min)). Knowing both beats the brute flatten in an interview.",
      docAnchor: "heap-priority-queue",
    },
    {
      slug: "reduce-array-size-to-half",
      title: "Reduce Array Size to the Half",
      difficulty: "Medium",
      category: "heap-priority-queue",
      blurb: "Fewest distinct values to remove half the array.",
      statement: [
        "Choose a set of integers to remove entirely from `arr` so that **at least half** the array's elements are removed. Return the minimum size of such a set.",
        "Canonical must-do (AM-600 Heap / Greedy family).",
      ],
      examples: [
        { input: "arr = [3,3,3,3,5,5,5,2,2,7]", output: "2", explanation: "Removing 3s and 5s deletes 7 of 10." },
        { input: "arr = [7,7,7,7,7,7]", output: "1" },
      ],
      constraints: ["2 <= arr.length <= 10^5", "arr.length is even"],
      fnName: "minSetSize",
      starter: `function minSetSize(arr) {\n  \n}`,
      solution: `function minSetSize(arr) {\n  const count = {};\n  for (const x of arr) count[x] = (count[x] || 0) + 1;\n  const freqs = Object.values(count).sort((a, b) => b - a);\n  let removed = 0, sets = 0;\n  for (const f of freqs) {\n    removed += f;\n    sets++;\n    if (removed >= arr.length / 2) break;\n  }\n  return sets;\n}`,
      tests: [
        { args: [[3, 3, 3, 3, 5, 5, 5, 2, 2, 7]], expected: 2 },
        { args: [[7, 7, 7, 7, 7, 7]], expected: 1 },
        { args: [[1, 9]], expected: 1 },
      ],
      approach:
        "Greedy: to delete the most elements with the fewest choices, always remove the **most frequent** value next. Count frequencies, sort them descending (or feed a max-heap), and keep taking until the removed total reaches half the length. O(n + k log k). A max-heap gives the same answer while only extracting as many as you need — the natural fit when k is huge.",
      docAnchor: "heap-priority-queue",
    },
    {
      slug: "k-weakest-rows-in-a-matrix",
      title: "The K Weakest Rows in a Matrix",
      difficulty: "Easy",
      category: "heap-priority-queue",
      blurb: "k rows with fewest soldiers, ties by index.",
      statement: [
        "Each row of a binary `mat` has soldiers (`1`s) before civilians (`0`s). Row `i` is **weaker** than row `j` if it has fewer soldiers, or the same number but a smaller index. Return the indices of the `k` weakest rows, weakest first.",
        "Canonical must-do (AM-600 Heap family).",
      ],
      examples: [
        { input: "mat = [[1,1,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,0,0,0],[1,1,1,1,1]], k = 3", output: "[2,0,3]" },
        { input: "mat = [[1,0,0,0],[1,1,1,1],[1,0,0,0],[1,0,0,0]], k = 2", output: "[0,2]" },
      ],
      constraints: ["2 <= mat.length <= 100", "1 <= k <= mat.length"],
      fnName: "kWeakestRows",
      starter: `function kWeakestRows(mat, k) {\n  \n}`,
      solution: `function kWeakestRows(mat, k) {\n  const rows = mat.map((row, i) => [row.reduce((a, b) => a + b, 0), i]);\n  rows.sort((a, b) => a[0] - b[0] || a[1] - b[1]);\n  return rows.slice(0, k).map((r) => r[1]);\n}`,
      tests: [
        { args: [[[1, 1, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 1, 0, 0, 0], [1, 1, 1, 1, 1]], 3], expected: [2, 0, 3] },
        { args: [[[1, 0, 0, 0], [1, 1, 1, 1], [1, 0, 0, 0], [1, 0, 0, 0]], 2], expected: [0, 2] },
        { args: [[[1, 1], [1, 0]], 1], expected: [1] },
      ],
      approach:
        "Pair each row with `(soldierCount, index)` and sort by that tuple — the **index tiebreak** is the whole subtlety, and JS's `a[0]-b[0] || a[1]-b[1]` expresses it in one line. O(m·n + m log m). The heap framing: keep a size-k max-heap of those tuples and evict the strongest, giving O(m log k) when k ≪ m. Since soldiers are left-aligned, a binary search per row also counts them in O(log n).",
      docAnchor: "heap-priority-queue",
    },
    {
      slug: "minimum-number-of-refueling-stops",
      title: "Minimum Number of Refueling Stops",
      difficulty: "Hard",
      category: "heap-priority-queue",
      blurb: "Fewest stops to reach the target.",
      statement: [
        "A car starts with `startFuel` and burns 1 fuel per mile toward `target`. `stations[i] = [position, fuel]`. Return the minimum number of refueling stops to reach the target, or `-1` if impossible.",
        "Canonical must-do (AM-600 Heap / Greedy family).",
      ],
      examples: [
        { input: "target = 100, startFuel = 10, stations = [[10,60],[20,30],[30,30],[60,40]]", output: "2" },
        { input: "target = 100, startFuel = 1, stations = [[10,100]]", output: "-1" },
      ],
      constraints: ["1 <= target <= 10^9", "0 <= stations.length <= 500"],
      fnName: "minRefuelStops",
      starter: `function minRefuelStops(target, startFuel, stations) {\n  \n}`,
      solution: `function minRefuelStops(target, startFuel, stations) {\n  const heap = [];\n  let fuel = startFuel, stops = 0, i = 0;\n  while (fuel < target) {\n    while (i < stations.length && stations[i][0] <= fuel) {\n      heap.push(stations[i][1]);\n      heap.sort((a, b) => b - a);\n      i++;\n    }\n    if (heap.length === 0) return -1;\n    fuel += heap.shift();\n    stops++;\n  }\n  return stops;\n}`,
      tests: [
        { args: [1, 1, []], expected: 0 },
        { args: [100, 1, [[10, 100]]], expected: -1 },
        { args: [100, 10, [[10, 60], [20, 30], [30, 30], [60, 40]]], expected: 2 },
        { args: [100, 50, [[25, 50], [50, 25]]], expected: 1 },
      ],
      approach:
        "The trick is you don't have to decide at each station — you can **refuel retroactively**. Drive as far as your fuel allows, dropping every station you pass into a max-heap of 'fuel I could have taken'. When you're stuck, greedily take the **biggest** deferred can and count a stop. If the heap is empty, you're stranded. Each station is pushed and popped once → O(n log n). 'Defer the choice until you're forced, then take the best' is the reusable pattern.",
      docAnchor: "heap-priority-queue",
    },
  ],
};
