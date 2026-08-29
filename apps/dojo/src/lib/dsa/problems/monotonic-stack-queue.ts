/**
 * DSA — Monotonic Stack & Queue. A stack/deque kept sorted by popping every
 * element the newcomer "beats". Turns O(n²) next-greater / window-extreme
 * scans into O(n): each element is pushed and popped at most once.
 */
import type { DsaCategory } from "../types";

export const monotonicStackQueue: DsaCategory = {
  id: "monotonic-stack-queue",
  title: "Monotonic Stack & Queue",
  icon: "📉",
  docAnchor: "monotonic-stack--queue",
  blurb:
    "Keep a stack/deque sorted by popping what the new element beats — next-greater, spans, and window extremes in O(n).",
  problems: [
    {
      slug: "next-greater-element-i",
      title: "Next Greater Element I",
      difficulty: "Easy",
      category: "monotonic-stack-queue",
      blurb: "For each queried value, the first greater element to its right.",
      statement: [
        "You are given two arrays: `nums1` is a subset of `nums2` (all values distinct). For each value in `nums1`, find the first element to its RIGHT in `nums2` that is strictly greater. Return the answers in `nums1` order; use `-1` if none exists.",
      ],
      examples: [
        { input: "nums1 = [4,1,2], nums2 = [1,3,4,2]", output: "[-1,3,-1]", explanation: "After 4 nothing is greater; after 1 comes 3; after 2 nothing." },
        { input: "nums1 = [2,4], nums2 = [1,2,3,4]", output: "[3,-1]" },
      ],
      constraints: ["1 <= nums1.length <= nums2.length <= 1000", "All values distinct"],
      fnName: "nextGreaterElement",
      starter: "function nextGreaterElement(nums1, nums2) {\n  \n}",
      solution:
        "function nextGreaterElement(nums1, nums2) {\n  const next = new Map();\n  const st = [];\n  for (const x of nums2) {\n    while (st.length && st[st.length - 1] < x) next.set(st.pop(), x);\n    st.push(x);\n  }\n  return nums1.map((x) => (next.has(x) ? next.get(x) : -1));\n}",
      tests: [
        { args: [[4, 1, 2], [1, 3, 4, 2]], expected: [-1, 3, -1] },
        { args: [[2, 4], [1, 2, 3, 4]], expected: [3, -1] },
        { args: [[1, 3, 5], [5, 3, 1, 4, 2]], expected: [4, 4, -1] },
        { args: [[7], [7]], expected: [-1] },
      ],
      approach:
        "Sweep nums2 once with a DECREASING stack: while the new element is greater than the stack top, that top just found its 'next greater' — pop it and record the answer in a map. Push the new element. Elements still on the stack at the end have no answer. Each element is pushed/popped once → O(n). This pop-when-beaten sweep is the core move of every monotonic-stack problem.",
      docAnchor: "monotonic-stack--queue",
    },
    {
      slug: "final-prices-with-discount",
      title: "Final Prices With a Special Discount",
      difficulty: "Easy",
      category: "monotonic-stack-queue",
      blurb: "Each item is discounted by the next price ≤ it.",
      statement: [
        "In a shop, the item at index `i` gets a discount equal to the FIRST price at an index `j > i` with `prices[j] <= prices[i]` (if any). Return the final price of every item.",
      ],
      examples: [
        { input: "prices = [8,4,6,2,3]", output: "[4,2,4,2,3]", explanation: "8 is discounted by 4, 4 by 2, 6 by 2; 2 and 3 get none." },
        { input: "prices = [1,2,3,4,5]", output: "[1,2,3,4,5]" },
      ],
      constraints: ["1 <= prices.length <= 500", "1 <= prices[i] <= 1000"],
      fnName: "finalPrices",
      starter: "function finalPrices(prices) {\n  \n}",
      solution:
        "function finalPrices(prices) {\n  const res = [...prices];\n  const st = [];\n  for (let i = 0; i < prices.length; i++) {\n    while (st.length && prices[st[st.length - 1]] >= prices[i]) {\n      const j = st.pop();\n      res[j] = prices[j] - prices[i];\n    }\n    st.push(i);\n  }\n  return res;\n}",
      tests: [
        { args: [[8, 4, 6, 2, 3]], expected: [4, 2, 4, 2, 3] },
        { args: [[1, 2, 3, 4, 5]], expected: [1, 2, 3, 4, 5] },
        { args: [[10, 1, 1, 6]], expected: [9, 0, 1, 6] },
      ],
      approach:
        "This is 'next smaller-or-equal to the right' in disguise — the mirror of next-greater. Keep a stack of indices with INCREASING prices; when a new price is ≤ the top's price, the top found its discount: pop and subtract. Same O(n) pop-when-beaten sweep, just with the comparison flipped. Recognizing which comparison direction a problem needs (>, >=, <, <=) is most of the work in this family.",
      docAnchor: "monotonic-stack--queue",
    },
    {
      slug: "stock-spans",
      title: "Online Stock Span",
      difficulty: "Medium",
      category: "monotonic-stack-queue",
      blurb: "For each day, how many consecutive prior days were ≤ today's price?",
      statement: [
        "Given daily stock `prices`, return for each day its SPAN: the number of consecutive days ending today with price less than or equal to today's price.",
      ],
      examples: [
        { input: "prices = [100,80,60,70,60,75,85]", output: "[1,1,1,2,1,4,6]", explanation: "75 covers 60,70,60,75 → span 4." },
        { input: "prices = [31,41,48,59,79]", output: "[1,2,3,4,5]" },
      ],
      constraints: ["1 <= prices.length <= 10^4"],
      fnName: "stockSpans",
      starter: "function stockSpans(prices) {\n  \n}",
      solution:
        "function stockSpans(prices) {\n  const st = []; // [price, span]\n  const res = [];\n  for (const p of prices) {\n    let span = 1;\n    while (st.length && st[st.length - 1][0] <= p) span += st.pop()[1];\n    st.push([p, span]);\n    res.push(span);\n  }\n  return res;\n}",
      tests: [
        { args: [[100, 80, 60, 70, 60, 75, 85]], expected: [1, 1, 1, 2, 1, 4, 6] },
        { args: [[31, 41, 48, 59, 79]], expected: [1, 2, 3, 4, 5] },
        { args: [[10, 4, 5, 90, 120, 80]], expected: [1, 1, 2, 4, 5, 1] },
      ],
      approach:
        "Keep a DECREASING stack of [price, span] pairs. A new price absorbs every stack entry with price ≤ it — adding their spans to its own — because those days are inside its span and can never matter to a later day (the new, higher price shadows them). This 'absorb what you beat, carry its weight' trick also powers Car Fleet-style problems, and shows spans/counts can ride along on the stack entries.",
      docAnchor: "monotonic-stack--queue",
    },
    {
      slug: "next-greater-element-ii",
      title: "Next Greater Element II",
      difficulty: "Medium",
      category: "monotonic-stack-queue",
      blurb: "Next greater element in a circular array.",
      statement: [
        "Given a CIRCULAR array `nums` (the element after the last is the first), return the next greater element for every position, or `-1` if none exists.",
      ],
      examples: [
        { input: "nums = [1,2,1]", output: "[2,-1,2]", explanation: "The last 1 wraps around to find 2." },
        { input: "nums = [1,2,3,4,3]", output: "[2,3,4,-1,4]" },
      ],
      constraints: ["1 <= nums.length <= 10^4"],
      fnName: "nextGreaterElements",
      starter: "function nextGreaterElements(nums) {\n  \n}",
      solution:
        "function nextGreaterElements(nums) {\n  const n = nums.length;\n  const res = new Array(n).fill(-1);\n  const st = []; // indices\n  for (let i = 0; i < 2 * n; i++) {\n    const x = nums[i % n];\n    while (st.length && nums[st[st.length - 1]] < x) res[st.pop()] = x;\n    if (i < n) st.push(i);\n  }\n  return res;\n}",
      tests: [
        { args: [[1, 2, 1]], expected: [2, -1, 2] },
        { args: [[1, 2, 3, 4, 3]], expected: [2, 3, 4, -1, 4] },
        { args: [[5, 4, 3, 2, 1]], expected: [-1, 5, 5, 5, 5] },
      ],
      approach:
        "Handle circularity by pretending the array is laid out twice: loop i from 0 to 2n−1 and read nums[i % n]. Run the usual decreasing index stack, but only PUSH during the first lap — the second lap exists purely to resolve leftovers. Pre-filling answers with -1 covers the elements never popped. 'Iterate twice with modulo' is the standard circular-array adapter for any monotonic sweep.",
      docAnchor: "monotonic-stack--queue",
    },
    {
      slug: "remove-k-digits",
      title: "Remove K Digits",
      difficulty: "Medium",
      category: "monotonic-stack-queue",
      blurb: "Delete k digits to make the smallest possible number.",
      statement: [
        "Given a string `num` representing a non-negative integer and an integer `k`, remove exactly `k` digits so the remaining number is as SMALL as possible. Return it without leading zeros (return \"0\" if empty).",
      ],
      examples: [
        { input: "num = \"1432219\", k = 3", output: "\"1219\"", explanation: "Remove 4, 3, and one 2." },
        { input: "num = \"10200\", k = 1", output: "\"200\"" },
        { input: "num = \"10\", k = 2", output: "\"0\"" },
      ],
      constraints: ["1 <= k <= num.length <= 10^5", "num has no leading zeros itself (except \"0\")"],
      fnName: "removeKdigits",
      starter: "function removeKdigits(num, k) {\n  \n}",
      solution:
        "function removeKdigits(num, k) {\n  const st = [];\n  for (const c of num) {\n    while (k > 0 && st.length && st[st.length - 1] > c) {\n      st.pop();\n      k--;\n    }\n    st.push(c);\n  }\n  while (k-- > 0) st.pop();\n  const res = st.join(\"\").replace(/^0+/, \"\");\n  return res === \"\" ? \"0\" : res;\n}",
      tests: [
        { args: ["1432219", 3], expected: "1219" },
        { args: ["10200", 1], expected: "200" },
        { args: ["10", 2], expected: "0" },
        { args: ["112", 1], expected: "11" },
      ],
      approach:
        "Greedy + monotonic stack: scanning left to right, whenever the previous kept digit is LARGER than the current one, deleting it makes the number smaller (a smaller digit moves into a more significant position) — so pop while you still have removals left. The stack stays increasing. If removals remain at the end, the digits are ascending, so trim from the tail. Strip leading zeros last. This 'build the lexicographically best subsequence with a budget of deletions' template reappears in many string problems.",
      docAnchor: "monotonic-stack--queue",
    },
    {
      slug: "132-pattern",
      title: "132 Pattern",
      difficulty: "Medium",
      category: "monotonic-stack-queue",
      blurb: "Does any i < j < k have nums[i] < nums[k] < nums[j]?",
      statement: [
        "Return `true` if `nums` contains a 132 pattern: indices `i < j < k` with `nums[i] < nums[k] < nums[j]` (small, then big, then middle).",
      ],
      examples: [
        { input: "nums = [1,2,3,4]", output: "false" },
        { input: "nums = [3,1,4,2]", output: "true", explanation: "[1, 4, 2]." },
        { input: "nums = [-1,3,2,0]", output: "true" },
      ],
      constraints: ["1 <= nums.length <= 2 * 10^5"],
      fnName: "find132pattern",
      starter: "function find132pattern(nums) {\n  \n}",
      solution:
        "function find132pattern(nums) {\n  const st = [];\n  let third = -Infinity; // the best '2' seen so far\n  for (let i = nums.length - 1; i >= 0; i--) {\n    if (nums[i] < third) return true;\n    while (st.length && st[st.length - 1] < nums[i]) third = st.pop();\n    st.push(nums[i]);\n  }\n  return false;\n}",
      tests: [
        { args: [[1, 2, 3, 4]], expected: false },
        { args: [[3, 1, 4, 2]], expected: true },
        { args: [[-1, 3, 2, 0]], expected: true },
        { args: [[1, 0, 1, -4, -3]], expected: false },
      ],
      approach:
        "Scan RIGHT to left with a decreasing stack. When the current element beats the stack top, every popped value is smaller than the current one but appears after it — a perfect '2' (the middle value). Keep the largest such popped value as `third`. If any later-scanned (i.e. earlier-indexed) element is below `third`, it's the '1' and the pattern exists. The insight: the stack top plays the '3', popped values play the '2', and scanning backwards makes both available when checking the '1'.",
      docAnchor: "monotonic-stack--queue",
    },
    {
      slug: "sum-of-subarray-minimums",
      title: "Sum of Subarray Minimums",
      difficulty: "Medium",
      category: "monotonic-stack-queue",
      blurb: "Sum min(subarray) over every contiguous subarray.",
      statement: [
        "Given an array `arr`, compute the sum of `min(b)` over EVERY contiguous subarray `b`, modulo 10^9 + 7.",
      ],
      examples: [
        { input: "arr = [3,1,2,4]", output: "17", explanation: "Minimums: 3,1,2,4,1,1,2,1,1,1 → 17." },
        { input: "arr = [11,81,94,43,3]", output: "444" },
      ],
      constraints: ["1 <= arr.length <= 3 * 10^4", "1 <= arr[i] <= 3 * 10^4"],
      fnName: "sumSubarrayMins",
      starter: "function sumSubarrayMins(arr) {\n  \n}",
      solution:
        "function sumSubarrayMins(arr) {\n  const MOD = 1000000007;\n  const n = arr.length;\n  const left = new Array(n);\n  const right = new Array(n);\n  const st = [];\n  for (let i = 0; i < n; i++) {\n    while (st.length && arr[st[st.length - 1]] > arr[i]) st.pop();\n    left[i] = st.length ? i - st[st.length - 1] : i + 1;\n    st.push(i);\n  }\n  st.length = 0;\n  for (let i = n - 1; i >= 0; i--) {\n    while (st.length && arr[st[st.length - 1]] >= arr[i]) st.pop();\n    right[i] = st.length ? st[st.length - 1] - i : n - i;\n    st.push(i);\n  }\n  let res = 0;\n  for (let i = 0; i < n; i++) {\n    res = (res + arr[i] * left[i] * right[i]) % MOD;\n  }\n  return res;\n}",
      tests: [
        { args: [[3, 1, 2, 4]], expected: 17 },
        { args: [[11, 81, 94, 43, 3]], expected: 444 },
        { args: [[1]], expected: 1 },
        { args: [[2, 2]], expected: 6 },
      ],
      approach:
        "Flip the question: instead of 'what's the min of each subarray', ask 'in how many subarrays is arr[i] THE minimum?' — that's left[i] × right[i], where left/right count how far you can extend before hitting a smaller element. Both distances come from monotonic-stack sweeps. Using strict < on one side and ≤ on the other breaks ties so equal values don't double-count. This 'contribution counting' technique converts O(n²) enumeration into O(n) and generalizes to sums of subarray maximums, ranges, etc.",
      docAnchor: "monotonic-stack--queue",
    },
    {
      slug: "remove-duplicate-letters",
      title: "Remove Duplicate Letters",
      difficulty: "Medium",
      category: "monotonic-stack-queue",
      blurb: "Smallest-in-order string containing each letter once.",
      statement: [
        "Given a string `s`, remove duplicate letters so every letter appears exactly once, and the result is the smallest in lexicographical order among all possible answers.",
      ],
      examples: [
        { input: "s = \"bcabc\"", output: "\"abc\"" },
        { input: "s = \"cbacdcbc\"", output: "\"acdb\"" },
      ],
      constraints: ["1 <= s.length <= 10^4", "s consists of lowercase letters"],
      fnName: "removeDuplicateLetters",
      starter: "function removeDuplicateLetters(s) {\n  \n}",
      solution:
        "function removeDuplicateLetters(s) {\n  const last = {};\n  for (let i = 0; i < s.length; i++) last[s[i]] = i;\n  const st = [];\n  const inStack = new Set();\n  for (let i = 0; i < s.length; i++) {\n    const c = s[i];\n    if (inStack.has(c)) continue;\n    while (\n      st.length &&\n      st[st.length - 1] > c &&\n      last[st[st.length - 1]] > i\n    ) {\n      inStack.delete(st.pop());\n    }\n    st.push(c);\n    inStack.add(c);\n  }\n  return st.join(\"\");\n}",
      tests: [
        { args: ["bcabc"], expected: "abc" },
        { args: ["cbacdcbc"], expected: "acdb" },
        { args: ["abacb"], expected: "abc" },
      ],
      approach:
        "A monotonic stack with a TWIST: you may only pop a bigger previous letter if it occurs again later (check its last-occurrence index) — otherwise popping would lose it forever. Skip letters already in the stack. The stack greedily stays as small-lexicographic as legality allows. The two guard conditions (is the top beatable? is popping safe?) are what elevate this above plain Remove K Digits — compare the two solutions side by side.",
      docAnchor: "monotonic-stack--queue",
    },
    {
      slug: "sliding-window-maximum",
      title: "Sliding Window Maximum",
      difficulty: "Hard",
      category: "monotonic-stack-queue",
      blurb: "Max of every window of size k — the monotonic deque classic.",
      statement: [
        "Given an array `nums` and window size `k`, return the maximum of every contiguous window of size `k`, left to right.",
      ],
      examples: [
        { input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", output: "[3,3,5,5,6,7]" },
        { input: "nums = [1], k = 1", output: "[1]" },
      ],
      constraints: ["1 <= k <= nums.length <= 10^5"],
      fnName: "maxSlidingWindow",
      starter: "function maxSlidingWindow(nums, k) {\n  \n}",
      solution:
        "function maxSlidingWindow(nums, k) {\n  const dq = []; // indices; values decreasing\n  const res = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();\n    dq.push(i);\n    if (dq[0] <= i - k) dq.shift();\n    if (i >= k - 1) res.push(nums[dq[0]]);\n  }\n  return res;\n}",
      tests: [
        { args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
        { args: [[1], 1], expected: [1] },
        { args: [[9, 8, 7, 6], 2], expected: [9, 8, 7] },
        { args: [[1, 2, 3], 2], expected: [2, 3] },
      ],
      approach:
        "The monotonic DEQUE: pop from the BACK every index whose value is ≤ the new one (they can never be a window max again — the newcomer is bigger and lives longer), and pop from the FRONT any index that slid out of the window. The front therefore always holds the current window's max. Each index enters and leaves once → O(n) total, versus O(nk) rescanning. The deque earns its keep exactly when you need eviction at BOTH ends: value-based at the back, age-based at the front.",
      docAnchor: "monotonic-stack--queue",
    },
    {
      slug: "shortest-subarray-with-sum-at-least-k",
      title: "Shortest Subarray With Sum ≥ K",
      difficulty: "Hard",
      category: "monotonic-stack-queue",
      blurb: "Negative numbers break plain sliding window — deque on prefix sums.",
      statement: [
        "Return the length of the SHORTEST non-empty subarray of `nums` with sum at least `k`, or `-1` if none exists. `nums` may contain negative numbers.",
      ],
      examples: [
        { input: "nums = [1], k = 1", output: "1" },
        { input: "nums = [1,2], k = 4", output: "-1" },
        { input: "nums = [2,-1,2], k = 3", output: "3" },
      ],
      constraints: ["1 <= nums.length <= 10^5", "-10^5 <= nums[i] <= 10^5"],
      fnName: "shortestSubarray",
      starter: "function shortestSubarray(nums, k) {\n  \n}",
      solution:
        "function shortestSubarray(nums, k) {\n  const n = nums.length;\n  const P = new Array(n + 1).fill(0);\n  for (let i = 0; i < n; i++) P[i + 1] = P[i] + nums[i];\n  let best = Infinity;\n  const dq = []; // indices into P; P values increasing\n  for (let j = 0; j <= n; j++) {\n    while (dq.length && P[j] - P[dq[0]] >= k) {\n      best = Math.min(best, j - dq.shift());\n    }\n    while (dq.length && P[dq[dq.length - 1]] >= P[j]) dq.pop();\n    dq.push(j);\n  }\n  return best === Infinity ? -1 : best;\n}",
      tests: [
        { args: [[1], 1], expected: 1 },
        { args: [[1, 2], 4], expected: -1 },
        { args: [[2, -1, 2], 3], expected: 3 },
        { args: [[84, -37, 32, 40, 95], 167], expected: 3 },
      ],
      approach:
        "With negatives, growing a window can shrink its sum, so two-pointer sliding window is invalid. Work on prefix sums P: a subarray (i, j] has sum P[j] − P[i] ≥ k. Keep a deque of candidate start indices with INCREASING P values. For each j: (1) pop from the front while the front satisfies the sum — it just produced its best (shortest) answer and a later j would only be longer; (2) pop from the back any index with P ≥ P[j] — j is a strictly better start (later AND smaller prefix). Both evictions are permanent, so O(n). This is the canonical 'sliding window fails, reach for a deque over prefix sums' problem.",
      docAnchor: "monotonic-stack--queue",
    },
    {
      slug: "shortest-unsorted-continuous-subarray",
      title: "Shortest Unsorted Continuous Subarray",
      difficulty: "Medium",
      category: "monotonic-stack-queue",
      blurb: "Sort just this window and the whole array is sorted.",
      statement: [
        "Given an integer array `nums`, find the **shortest contiguous subarray** such that sorting only that subarray makes the entire array sorted ascending. Return its length (0 if already sorted).",
        "Canonical must-do (AM-600 Monotonic family).",
      ],
      examples: [
        { input: "nums = [2,6,4,8,10,9,15]", output: "5", explanation: "Sort [6,4,8,10,9]." },
        { input: "nums = [1,2,3,4]", output: "0" },
      ],
      constraints: ["1 <= nums.length <= 10^4"],
      fnName: "findUnsortedSubarray",
      starter: `function findUnsortedSubarray(nums) {\n  \n}`,
      solution: `function findUnsortedSubarray(nums) {\n  const n = nums.length;\n  let end = -1, start = 0, maxSeen = -Infinity, minSeen = Infinity;\n  for (let i = 0; i < n; i++) {\n    maxSeen = Math.max(maxSeen, nums[i]);\n    if (nums[i] < maxSeen) end = i;\n  }\n  for (let i = n - 1; i >= 0; i--) {\n    minSeen = Math.min(minSeen, nums[i]);\n    if (nums[i] > minSeen) start = i;\n  }\n  return end === -1 ? 0 : end - start + 1;\n}`,
      tests: [
        { args: [[2, 6, 4, 8, 10, 9, 15]], expected: 5 },
        { args: [[1, 2, 3, 4]], expected: 0 },
        { args: [[1]], expected: 0 },
        { args: [[2, 1]], expected: 2 },
      ],
      approach:
        "Two sweeps instead of a stack. Left→right: any element smaller than the running **max** is out of place, so the last such index is the window's `end`. Right→left: any element larger than the running **min** is out of place, so the earliest such index is the `start`. If no violation exists the array was sorted (`end` stays −1). O(n), O(1) space — the same 'compare against a running extreme' logic a monotonic stack encodes.",
      docAnchor: "monotonic-stack-queue",
    },
    {
      slug: "maximum-width-ramp",
      title: "Maximum Width Ramp",
      difficulty: "Medium",
      category: "monotonic-stack-queue",
      blurb: "Widest i<j with nums[i] <= nums[j].",
      statement: [
        "A **ramp** is a pair `(i, j)` with `i < j` and `nums[i] <= nums[j]`; its width is `j - i`. Given `nums`, return the maximum width of any ramp, or 0 if none exists.",
        "Canonical must-do (AM-600 Monotonic family).",
      ],
      examples: [
        { input: "nums = [6,0,8,2,1,5]", output: "4", explanation: "(1, 5): nums[1]=0 <= nums[5]=5." },
        { input: "nums = [9,8,1,0,1,9,4,0,4,1]", output: "7" },
      ],
      constraints: ["2 <= nums.length <= 5·10^4"],
      fnName: "maxWidthRamp",
      starter: `function maxWidthRamp(nums) {\n  \n}`,
      solution: `function maxWidthRamp(nums) {\n  const stack = [];\n  for (let i = 0; i < nums.length; i++) {\n    if (stack.length === 0 || nums[stack[stack.length - 1]] > nums[i]) stack.push(i);\n  }\n  let best = 0;\n  for (let j = nums.length - 1; j >= 0; j--) {\n    while (stack.length && nums[stack[stack.length - 1]] <= nums[j]) {\n      best = Math.max(best, j - stack.pop());\n    }\n  }\n  return best;\n}`,
      tests: [
        { args: [[6, 0, 8, 2, 1, 5]], expected: 4 },
        { args: [[9, 8, 1, 0, 1, 9, 4, 0, 4, 1]], expected: 7 },
        { args: [[1, 2]], expected: 1 },
        { args: [[2, 1]], expected: 0 },
      ],
      approach:
        "Only **strictly decreasing** indices can ever be a ramp's left end (if an earlier index has a smaller-or-equal value, it always beats a later one), so build that decreasing-value index stack in one forward pass. Then scan `j` from the **right**, popping every stack index whose value it can support — each pop yields a candidate width, and popping from the right guarantees you take the widest first. O(n).",
      docAnchor: "monotonic-stack-queue",
    },
    {
      slug: "number-of-visible-people-in-a-queue",
      title: "Number of Visible People in a Queue",
      difficulty: "Hard",
      category: "monotonic-stack-queue",
      blurb: "How many people can each person see to their right?",
      statement: [
        "People stand in a line with the given `heights`. Person `i` can see person `j` (with `i < j`) if **everyone strictly between them is shorter than both**. Return an array where `answer[i]` is how many people person `i` can see to their right.",
        "Canonical must-do (AM-600 Monotonic Stack family).",
      ],
      examples: [
        { input: "heights = [10,6,8,5,11,9]", output: "[3,1,2,1,1,0]" },
        { input: "heights = [5,1,2,3,10]", output: "[4,1,1,1,0]" },
      ],
      constraints: ["1 <= heights.length <= 10^5", "heights are distinct"],
      fnName: "canSeePersonsCount",
      starter: `function canSeePersonsCount(heights) {\n  \n}`,
      solution: `function canSeePersonsCount(heights) {\n  const n = heights.length;\n  const res = new Array(n).fill(0);\n  const stack = [];\n  for (let i = n - 1; i >= 0; i--) {\n    let count = 0;\n    while (stack.length && stack[stack.length - 1] < heights[i]) {\n      stack.pop();\n      count++;\n    }\n    if (stack.length) count++;\n    res[i] = count;\n    stack.push(heights[i]);\n  }\n  return res;\n}`,
      tests: [
        { args: [[10, 6, 8, 5, 11, 9]], expected: [3, 1, 2, 1, 1, 0] },
        { args: [[5, 1, 2, 3, 10]], expected: [4, 1, 1, 1, 0] },
        { args: [[1]], expected: [0] },
      ],
      approach:
        "Scan from the **right** keeping a stack of heights that are increasing as you go down. Everyone shorter than the current person gets popped — each pop is someone they can see (nothing taller blocks the view yet). After popping, if the stack still has someone, that's the first person **taller** than them: visible too, and the last one (they block everything beyond). Each person is pushed/popped once → O(n).",
      docAnchor: "monotonic-stack-queue",
    },
    {
      slug: "sum-of-subarray-ranges",
      title: "Sum of Subarray Ranges",
      difficulty: "Medium",
      category: "monotonic-stack-queue",
      blurb: "Total of (max − min) over every subarray.",
      statement: [
        "The **range** of a subarray is its largest element minus its smallest. Given `nums`, return the sum of the ranges of **all** its subarrays.",
        "Canonical must-do (AM-600 Monotonic Stack family). The companion to Sum of Subarray Minimums.",
      ],
      examples: [
        { input: "nums = [1,2,3]", output: "4", explanation: "Ranges: 0,0,0,1,1,2." },
        { input: "nums = [4,-2,-3,4,1]", output: "59" },
      ],
      constraints: ["1 <= nums.length <= 1000", "-10^9 <= nums[i] <= 10^9"],
      fnName: "subArrayRanges",
      starter: `function subArrayRanges(nums) {\n  \n}`,
      solution: `function subArrayRanges(nums) {\n  let total = 0;\n  for (let i = 0; i < nums.length; i++) {\n    let mn = nums[i], mx = nums[i];\n    for (let j = i; j < nums.length; j++) {\n      mn = Math.min(mn, nums[j]);\n      mx = Math.max(mx, nums[j]);\n      total += mx - mn;\n    }\n  }\n  return total;\n}`,
      tests: [
        { args: [[1, 2, 3]], expected: 4 },
        { args: [[1, 3, 3]], expected: 4 },
        { args: [[4, -2, -3, 4, 1]], expected: 59 },
        { args: [[1]], expected: 0 },
      ],
      approach:
        "The O(n²) version shown extends each start index rightward, maintaining the running min and max — no need to rescan, so each subarray costs O(1). The **O(n) upgrade** is the monotonic-stack identity: `sum of ranges = (sum of all subarray maxima) − (sum of all subarray minima)`, and each of those is computed by finding, for every element, how many subarrays it dominates (Sum of Subarray Minimums). Knowing the decomposition is the interview point.",
      docAnchor: "monotonic-stack-queue",
    },
  ],
};
