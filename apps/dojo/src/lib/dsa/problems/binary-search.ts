/**
 * DSA — Binary Search. Halve the search space each step: O(log n) on sorted
 * data, or on any monotonic "is k feasible?" predicate (binary search the answer).
 */
import type { DsaCategory } from "../types";

export const binarySearch: DsaCategory = {
  id: "binary-search",
  title: "Binary Search",
  icon: "🎯",
  docAnchor: "binary-search",
  blurb: "Halve the space each step — sorted arrays and monotonic 'search the answer' predicates.",
  problems: [
    {
      slug: "binary-search",
      title: "Binary Search",
      difficulty: "Easy",
      category: "binary-search",
      blurb: "Index of target in a sorted array, or -1.",
      statement: [
        "Given a sorted (ascending) array `nums` and a `target`, return its index, or -1 if absent. Run in O(log n).",
      ],
      examples: [
        { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
        { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
      ],
      constraints: ["1 <= nums.length <= 10^4", "nums is sorted, all distinct"],
      fnName: "search",
      starter: "function search(nums, target) {\n  \n}",
      solution:
        "function search(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    const m = (l + r) >> 1;\n    if (nums[m] === target) return m;\n    if (nums[m] < target) l = m + 1;\n    else r = m - 1;\n  }\n  return -1;\n}",
      tests: [
        { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
        { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
        { args: [[5], 5], expected: 0 },
        { args: [[2, 5], 5], expected: 1 },
      ],
      approach:
        "Compare the middle element to the target; because the array is sorted, one comparison eliminates half the remaining range. Use inclusive bounds `l <= r` and move past the midpoint (`m+1`/`m-1`) to guarantee progress and avoid infinite loops. O(log n). The off-by-one discipline here is what every harder binary search reuses.",
      docAnchor: "binary-search",
    },
    {
      slug: "search-a-2d-matrix",
      title: "Search a 2D Matrix",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "Search a row-sorted, row-chained matrix.",
      statement: [
        "Each row of `matrix` is sorted ascending, and the first value of each row exceeds the last of the previous row. Return `true` if `target` is present.",
      ],
      examples: [
        { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3", output: "true" },
        { input: "same matrix, target = 13", output: "false" },
      ],
      constraints: ["1 <= rows, cols <= 100"],
      fnName: "searchMatrix",
      starter: "function searchMatrix(matrix, target) {\n  \n}",
      solution:
        "function searchMatrix(matrix, target) {\n  const rows = matrix.length, cols = matrix[0].length;\n  let l = 0, r = rows * cols - 1;\n  while (l <= r) {\n    const m = (l + r) >> 1;\n    const val = matrix[Math.floor(m / cols)][m % cols];\n    if (val === target) return true;\n    if (val < target) l = m + 1;\n    else r = m - 1;\n  }\n  return false;\n}",
      tests: [
        { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], expected: true },
        { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], expected: false },
        { args: [[[1]], 1], expected: true },
        { args: [[[1, 3]], 2], expected: false },
      ],
      approach:
        "The chaining condition means the whole matrix is one sorted list read row by row. Binary search over indices 0…(rows·cols−1) and map each flat index m to a cell via (⌊m/cols⌋, m mod cols). O(log(rows·cols)). The lesson: reshape the data so a single binary search applies, instead of searching rows then columns.",
      docAnchor: "binary-search",
    },
    {
      slug: "koko-eating-bananas",
      title: "Koko Eating Bananas",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "Minimum eating speed to finish in h hours.",
      statement: [
        "Koko eats from `piles`; at speed k she eats k bananas/hour from one pile (finishing a smaller pile early). Return the minimum integer k that finishes all piles within `h` hours.",
      ],
      examples: [
        { input: "piles = [3,6,7,11], h = 8", output: "4" },
        { input: "piles = [30,11,23,4,20], h = 5", output: "30" },
      ],
      constraints: ["1 <= piles.length <= 10^4", "piles.length <= h"],
      fnName: "minEatingSpeed",
      starter: "function minEatingSpeed(piles, h) {\n  \n}",
      solution:
        "function minEatingSpeed(piles, h) {\n  let l = 1, r = Math.max(...piles);\n  while (l < r) {\n    const k = (l + r) >> 1;\n    let hours = 0;\n    for (const p of piles) hours += Math.ceil(p / k);\n    if (hours <= h) r = k;\n    else l = k + 1;\n  }\n  return l;\n}",
      tests: [
        { args: [[3, 6, 7, 11], 8], expected: 4 },
        { args: [[30, 11, 23, 4, 20], 5], expected: 30 },
        { args: [[30, 11, 23, 4, 20], 6], expected: 23 },
        { args: [[312884470], 968709470], expected: 1 },
      ],
      approach:
        "You're not searching the array — you're searching the ANSWER. 'Can Koko finish at speed k?' is monotonic: if k works, so does every larger speed. Binary search k over [1, max pile], each check summing ⌈pile/k⌉ hours, and keep the smallest feasible k. O(n log maxPile). 'Binary search on the answer' unlocks a huge class of optimization problems.",
      docAnchor: "binary-search",
    },
    {
      slug: "find-minimum-in-rotated-sorted-array",
      title: "Find Minimum in Rotated Sorted Array",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "Minimum of a rotated ascending array.",
      statement: [
        "A sorted ascending array of distinct values was rotated at an unknown pivot. Return its minimum in O(log n).",
      ],
      examples: [
        { input: "nums = [3,4,5,1,2]", output: "1" },
        { input: "nums = [4,5,6,7,0,1,2]", output: "0" },
      ],
      constraints: ["1 <= nums.length <= 5000", "all distinct"],
      fnName: "findMin",
      starter: "function findMin(nums) {\n  \n}",
      solution:
        "function findMin(nums) {\n  let l = 0, r = nums.length - 1;\n  while (l < r) {\n    const m = (l + r) >> 1;\n    if (nums[m] > nums[r]) l = m + 1;\n    else r = m;\n  }\n  return nums[l];\n}",
      tests: [
        { args: [[3, 4, 5, 1, 2]], expected: 1 },
        { args: [[4, 5, 6, 7, 0, 1, 2]], expected: 0 },
        { args: [[11, 13, 15, 17]], expected: 11 },
        { args: [[2, 1]], expected: 1 },
      ],
      approach:
        "Compare the midpoint to the RIGHT end. If nums[m] > nums[r], the rotation point (and the minimum) is strictly to the right, so move l past m. Otherwise the min is at m or to its left, so pull r to m. The loop converges on the single unsorted 'drop', which is the minimum. O(log n). Comparing to a fixed end is the trick for rotated arrays.",
      docAnchor: "binary-search",
    },
    {
      slug: "search-in-rotated-sorted-array",
      title: "Search in Rotated Sorted Array",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "Find target in a rotated sorted array.",
      statement: [
        "Given a rotated sorted array of distinct integers `nums` and a `target`, return its index or -1, in O(log n).",
      ],
      examples: [
        { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
        { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" },
      ],
      constraints: ["1 <= nums.length <= 5000", "all distinct"],
      fnName: "searchRotated",
      starter: "function searchRotated(nums, target) {\n  \n}",
      solution:
        "function searchRotated(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    const m = (l + r) >> 1;\n    if (nums[m] === target) return m;\n    if (nums[l] <= nums[m]) {\n      if (nums[l] <= target && target < nums[m]) r = m - 1;\n      else l = m + 1;\n    } else {\n      if (nums[m] < target && target <= nums[r]) l = m + 1;\n      else r = m - 1;\n    }\n  }\n  return -1;\n}",
      tests: [
        { args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4 },
        { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
        { args: [[1], 0], expected: -1 },
        { args: [[5, 1, 3], 5], expected: 0 },
      ],
      approach:
        "At each midpoint, exactly one side [l..m] or [m..r] is properly sorted (compare nums[l] to nums[m]). Check whether the target lies within that sorted half's range; if so, search it, else search the other half. Every step still halves the range → O(log n). Identifying the sorted half is the key move for any rotated-array search.",
      docAnchor: "binary-search",
    },
    {
      slug: "median-of-two-sorted-arrays",
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      category: "binary-search",
      blurb: "Median of two sorted arrays in O(log(m+n)).",
      statement: [
        "Given two sorted arrays `a` and `b`, return the median of the combined set. The overall run time must be O(log(m+n)).",
      ],
      examples: [
        { input: "a = [1,3], b = [2]", output: "2.0" },
        { input: "a = [1,2], b = [3,4]", output: "2.5" },
      ],
      constraints: ["0 <= a.length, b.length <= 1000", "1 <= a.length + b.length"],
      fnName: "findMedianSortedArrays",
      starter: "function findMedianSortedArrays(a, b) {\n  \n}",
      solution:
        "function findMedianSortedArrays(a, b) {\n  if (a.length > b.length) return findMedianSortedArrays(b, a);\n  const m = a.length, n = b.length, half = Math.floor((m + n + 1) / 2);\n  let l = 0, r = m;\n  while (l <= r) {\n    const i = (l + r) >> 1;\n    const j = half - i;\n    const aL = i > 0 ? a[i - 1] : -Infinity;\n    const aR = i < m ? a[i] : Infinity;\n    const bL = j > 0 ? b[j - 1] : -Infinity;\n    const bR = j < n ? b[j] : Infinity;\n    if (aL <= bR && bL <= aR) {\n      if ((m + n) % 2 === 1) return Math.max(aL, bL);\n      return (Math.max(aL, bL) + Math.min(aR, bR)) / 2;\n    } else if (aL > bR) {\n      r = i - 1;\n    } else {\n      l = i + 1;\n    }\n  }\n  return 0;\n}",
      tests: [
        { args: [[1, 3], [2]], expected: 2, approx: 0.0001 },
        { args: [[1, 2], [3, 4]], expected: 2.5, approx: 0.0001 },
        { args: [[0, 0], [0, 0]], expected: 0, approx: 0.0001 },
        { args: [[], [1]], expected: 1, approx: 0.0001 },
      ],
      approach:
        "Binary search a partition of the SHORTER array: pick i elements from a and the complementary j from b so the left halves hold exactly half the total. The partition is correct when both left maxes are ≤ both right mins; otherwise slide i. The median then comes from those four boundary values. O(log(min(m,n))) — the elegant, notoriously fiddly one; the boundary sentinels (±∞) are what keep the edges clean.",
      docAnchor: "binary-search",
    },
    {
      slug: "search-insert-position",
      title: "Search Insert Position",
      difficulty: "Easy",
      category: "binary-search",
      blurb: "Where the target is — or where it would go.",
      statement: [
        "Given a sorted array of distinct integers and a `target`, return the index of the target, or the index where it WOULD be inserted to keep the array sorted. O(log n) required.",
      ],
      examples: [
        { input: "nums = [1,3,5,6], target = 5", output: "2" },
        { input: "nums = [1,3,5,6], target = 2", output: "1" },
        { input: "nums = [1,3,5,6], target = 7", output: "4" },
      ],
      constraints: ["1 <= nums.length <= 10^4", "Distinct, sorted ascending"],
      fnName: "searchInsert",
      starter: "function searchInsert(nums, target) {\n  \n}",
      solution:
        "function searchInsert(nums, target) {\n  let lo = 0;\n  let hi = nums.length;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}",
      tests: [
        { args: [[1, 3, 5, 6], 5], expected: 2 },
        { args: [[1, 3, 5, 6], 2], expected: 1 },
        { args: [[1, 3, 5, 6], 7], expected: 4 },
        { args: [[1, 3, 5, 6], 0], expected: 0 },
      ],
      approach:
        "This is LOWER BOUND: the first index whose value is ≥ target — which is simultaneously 'where the target is' and 'where it belongs'. The half-open [lo, hi) formulation shown (hi starts at length, loop while lo < hi, no ±1 on hi) is the cleanest binary search to memorize because it cannot infinite-loop and its answer can legitimately be n (insert at the end). Lower/upper bound, not 'find exact match', is the form of binary search you'll actually reuse everywhere.",
      docAnchor: "binary-search",
    },
    {
      slug: "find-peak-element",
      title: "Find Peak Element",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "Binary search without a sorted array — follow the slope.",
      statement: [
        "A peak is an element strictly greater than its neighbours (out-of-bounds counts as −∞). Given `nums` where adjacent elements differ, return the index of a peak, in O(log n). The tests use arrays with a single peak.",
      ],
      examples: [
        { input: "nums = [1,2,3,1]", output: "2" },
        { input: "nums = [3,2,1]", output: "0" },
      ],
      constraints: ["1 <= nums.length <= 1000", "nums[i] !== nums[i+1]"],
      fnName: "findPeakElement",
      starter: "function findPeakElement(nums) {\n  \n}",
      solution:
        "function findPeakElement(nums) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] < nums[mid + 1]) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}",
      tests: [
        { args: [[1, 2, 3, 1]], expected: 2 },
        { args: [[3, 2, 1]], expected: 0 },
        { args: [[1, 3, 2]], expected: 1 },
        { args: [[1, 2]], expected: 1 },
      ],
      approach:
        "The array isn't sorted — yet binary search works, because the DECISION is still reliable: compare mid with mid+1. If the slope rises (nums[mid] < nums[mid+1]), a peak must exist to the RIGHT (keep climbing and you either rise forever — impossible — or hit a peak); if it falls, a peak exists at mid or left. Each step halves the range while provably keeping a peak inside. The takeaway that unlocks many 'how is this binary-searchable?' problems: you don't need sortedness, you need any test that tells you which half certainly contains an answer.",
      docAnchor: "binary-search",
    },
    {
      slug: "capacity-to-ship-packages",
      title: "Capacity to Ship Packages Within D Days",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "Smallest ship capacity that meets the deadline.",
      statement: [
        "Packages with given `weights` must ship IN ORDER, one contiguous batch per day. Return the least ship capacity that ships everything within `days` days.",
      ],
      examples: [
        { input: "weights = [1,2,3,4,5,6,7,8,9,10], days = 5", output: "15", explanation: "Days: [1..5], [6,7], [8], [9], [10]." },
        { input: "weights = [3,2,2,4,1,4], days = 3", output: "6" },
      ],
      constraints: ["1 <= weights.length <= 5 * 10^4", "1 <= days <= weights.length"],
      fnName: "shipWithinDays",
      starter: "function shipWithinDays(weights, days) {\n  \n}",
      solution:
        "function shipWithinDays(weights, days) {\n  let lo = Math.max(...weights);\n  let hi = weights.reduce((a, b) => a + b, 0);\n  function daysNeeded(cap) {\n    let d = 1;\n    let load = 0;\n    for (const w of weights) {\n      if (load + w > cap) {\n        d++;\n        load = 0;\n      }\n      load += w;\n    }\n    return d;\n  }\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (daysNeeded(mid) <= days) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}",
      tests: [
        { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expected: 15 },
        { args: [[3, 2, 2, 4, 1, 4], 3], expected: 6 },
        { args: [[1, 2, 3, 1, 1], 4], expected: 3 },
        { args: [[10], 1], expected: 10 },
      ],
      approach:
        "BINARY SEARCH ON THE ANSWER: capacity is monotonic — if capacity c works, every capacity above c works — so the feasible capacities form a suffix, and you binary-search for its first element. The checker greedily packs each day until adding the next package would overflow: greedy is optimal here because order is fixed. Bounds matter: lo = max(weights) (a day must fit the heaviest single package), hi = total (one day ships all). Same skeleton as Koko Eating Bananas; Split Array Largest Sum is next and identical in shape.",
      docAnchor: "binary-search",
    },
    {
      slug: "split-array-largest-sum",
      title: "Split Array Largest Sum",
      difficulty: "Hard",
      category: "binary-search",
      blurb: "Split into k parts minimizing the biggest part.",
      statement: [
        "Split `nums` into `k` non-empty CONTIGUOUS subarrays so that the largest subarray sum is as small as possible; return that minimized largest sum.",
      ],
      examples: [
        { input: "nums = [7,2,5,10,8], k = 2", output: "18", explanation: "[7,2,5] and [10,8]." },
        { input: "nums = [1,2,3,4,5], k = 2", output: "9", explanation: "[1,2,3] and [4,5]." },
      ],
      constraints: ["1 <= nums.length <= 1000", "1 <= k <= nums.length"],
      fnName: "splitArray",
      starter: "function splitArray(nums, k) {\n  \n}",
      solution:
        "function splitArray(nums, k) {\n  let lo = Math.max(...nums);\n  let hi = nums.reduce((a, b) => a + b, 0);\n  function partsNeeded(cap) {\n    let parts = 1;\n    let sum = 0;\n    for (const x of nums) {\n      if (sum + x > cap) {\n        parts++;\n        sum = 0;\n      }\n      sum += x;\n    }\n    return parts;\n  }\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (partsNeeded(mid) <= k) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}",
      tests: [
        { args: [[7, 2, 5, 10, 8], 2], expected: 18 },
        { args: [[1, 2, 3, 4, 5], 2], expected: 9 },
        { args: [[1, 4, 4], 3], expected: 4 },
        { args: [[5], 1], expected: 5 },
      ],
      approach:
        "The famous 'minimize the maximum' — and notice it is LITERALLY the same code as Capacity to Ship Packages with the names changed: cap ↔ largest allowed sum, days ↔ parts. Guess a ceiling, greedily count how many contiguous parts respect it, and binary-search the smallest ceiling needing ≤ k parts (fewer parts than k is fine — splitting further only helps). When you spot the words 'minimize the largest' or 'maximize the smallest' over contiguous groupings, this template should load instantly; the hard part is recognizing, not coding. (There's also an O(n²k) interval DP — strictly worse here, but good to know it exists.)",
      docAnchor: "binary-search",
    },
    {
      slug: "magic-index",
      title: "Magic Index",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "Smallest i where arr[i] === i, in a sorted distinct array.",
      statement: [
        "A **magic index** in an array is an index `i` where `arr[i] === i`. Given a **sorted array of distinct integers**, return the smallest magic index, or `-1` if none exists.",
        "From *interactive-coding-challenges* (Recursion & DP: find the magic index) — solved with binary search.",
      ],
      examples: [
        { input: "arr = [-1,0,2,4,5]", output: "2", explanation: "arr[2] === 2." },
        { input: "arr = [1,2,3,4]", output: "-1" },
      ],
      constraints: ["1 <= arr.length <= 10^5", "arr is sorted ascending with distinct integers"],
      fnName: "magicIndex",
      starter: `function magicIndex(arr) {\n  \n}`,
      solution: `function magicIndex(arr) {\n  let lo = 0, hi = arr.length - 1, ans = -1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] === mid) { ans = mid; hi = mid - 1; }\n    else if (arr[mid] < mid) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return ans;\n}`,
      tests: [
        { args: [[-1, 0, 2, 4, 5]], expected: 2 },
        { args: [[1, 2, 3, 4]], expected: -1 },
        { args: [[-5, -3, 1, 3, 5]], expected: 3 },
        { args: [[0, 2, 5, 7]], expected: 0 },
      ],
      approach:
        "With **distinct** sorted integers, `arr[i] - i` never decreases (each step arr rises by ≥1, i by exactly 1). That monotonicity is what unlocks binary search: if `arr[mid] < mid`, every index left of mid is also too small, so search right; if `arr[mid] > mid`, search left; on a hit, record it and keep going left for the *smallest*. O(log n) instead of the O(n) scan. (The classic follow-up — allowing duplicates — breaks the monotonicity and forces a branching search.)",
      docAnchor: "binary-search",
    },
    {
      slug: "find-first-and-last-position",
      title: "Find First and Last Position of Element",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "The [start, end] index range of a target.",
      statement: [
        "Given a sorted array `nums` and a `target`, return `[firstIndex, lastIndex]` of the target's range, or `[-1, -1]` if absent. Must run in O(log n).",
        "Canonical must-do (AM-600 Binary Search family).",
      ],
      examples: [
        { input: "nums = [5,7,7,8,8,10], target = 8", output: "[3,4]" },
        { input: "nums = [5,7,7,8,8,10], target = 6", output: "[-1,-1]" },
      ],
      constraints: ["0 <= nums.length <= 10^5", "nums is sorted non-decreasing"],
      fnName: "searchRange",
      starter: `function searchRange(nums, target) {\n  \n}`,
      solution: `function searchRange(nums, target) {\n  function bound(isFirst) {\n    let lo = 0, hi = nums.length - 1, res = -1;\n    while (lo <= hi) {\n      const mid = (lo + hi) >> 1;\n      if (nums[mid] === target) {\n        res = mid;\n        if (isFirst) hi = mid - 1; else lo = mid + 1;\n      } else if (nums[mid] < target) lo = mid + 1;\n      else hi = mid - 1;\n    }\n    return res;\n  }\n  return [bound(true), bound(false)];\n}`,
      tests: [
        { args: [[5, 7, 7, 8, 8, 10], 8], expected: [3, 4] },
        { args: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
        { args: [[], 0], expected: [-1, -1] },
        { args: [[1], 1], expected: [0, 0] },
      ],
      approach:
        "Run binary search **twice**: once biased left (on a hit, keep searching the left half for an earlier occurrence) and once biased right. Each finds one edge of the target's block in O(log n). The key move is *not* stopping at the first match — record it and keep shrinking toward the boundary you want. This 'find the boundary, not the value' idea is the heart of most binary-search variants.",
      docAnchor: "binary-search",
    },
    {
      slug: "single-element-in-sorted-array",
      title: "Single Element in a Sorted Array",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "Every element appears twice except one — find it in O(log n).",
      statement: [
        "In a sorted array where every element appears exactly twice except one that appears once, return the single element. Must run in O(log n) time.",
        "Canonical must-do (AM-600 Binary Search family).",
      ],
      examples: [
        { input: "nums = [1,1,2,3,3,4,4,8,8]", output: "2" },
        { input: "nums = [3,3,7,7,10,11,11]", output: "10" },
      ],
      constraints: ["1 <= nums.length <= 10^5", "nums.length is odd"],
      fnName: "singleNonDuplicate",
      starter: `function singleNonDuplicate(nums) {\n  \n}`,
      solution: `function singleNonDuplicate(nums) {\n  let lo = 0, hi = nums.length - 1;\n  while (lo < hi) {\n    let mid = (lo + hi) >> 1;\n    if (mid % 2 === 1) mid--;\n    if (nums[mid] === nums[mid + 1]) lo = mid + 2;\n    else hi = mid;\n  }\n  return nums[lo];\n}`,
      tests: [
        { args: [[1, 1, 2, 3, 3, 4, 4, 8, 8]], expected: 2 },
        { args: [[3, 3, 7, 7, 10, 11, 11]], expected: 10 },
        { args: [[1]], expected: 1 },
        { args: [[1, 1, 2]], expected: 2 },
      ],
      approach:
        "Before the single element, each pair starts at an **even** index (0,2,4…); after it, that alignment shifts by one. So force `mid` to an even index and check `nums[mid] === nums[mid+1]`: if they pair up, the single is to the *right* (`lo = mid+2`); if not, it's at `mid` or to the *left* (`hi = mid`). O(log n) — a parity-based binary search, not a linear XOR scan.",
      docAnchor: "binary-search",
    },
    {
      slug: "first-bad-version",
      title: "First Bad Version",
      difficulty: "Easy",
      category: "binary-search",
      blurb: "First version that fails, given all after it fail too.",
      statement: [
        "Versions `1..n` are in order; once a version is bad, every later one is bad too. Given `n` and the first bad version `bad`, return the first bad version using as few checks as possible (binary search).",
        "Canonical must-do (AM-600 Binary Search family). (Normally `isBadVersion` is an API; here `bad` is passed in.)",
      ],
      examples: [
        { input: "n = 5, bad = 4", output: "4" },
        { input: "n = 1, bad = 1", output: "1" },
      ],
      constraints: ["1 <= bad <= n <= 2^31 - 1"],
      fnName: "firstBadVersion",
      starter: `function firstBadVersion(n, bad) {\n  \n}`,
      solution: `function firstBadVersion(n, bad) {\n  let lo = 1, hi = n;\n  while (lo < hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (mid >= bad) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}`,
      tests: [
        { args: [5, 4], expected: 4 },
        { args: [1, 1], expected: 1 },
        { args: [10, 1], expected: 1 },
        { args: [10, 10], expected: 10 },
      ],
      approach:
        "The good→bad transition is a **monotonic predicate** (`isBad` flips from false to true and stays true), which is exactly what binary search finds: if `mid` is bad, the first bad is `mid` or earlier (`hi = mid`); if good, it's after (`lo = mid+1`). Use `lo + (hi-lo)/2` to avoid overflow on huge n. O(log n). 'Binary-search the boundary of a monotonic condition' is the reusable pattern.",
      docAnchor: "binary-search",
    },
    {
      slug: "valid-perfect-square",
      title: "Valid Perfect Square",
      difficulty: "Easy",
      category: "binary-search",
      blurb: "Is num a perfect square — without using sqrt?",
      statement: [
        "Given a positive integer `num`, return `true` if it is a perfect square (the square of an integer). Do **not** use any built-in square-root function.",
        "Canonical must-do (AM-600 Binary Search family).",
      ],
      examples: [
        { input: "num = 16", output: "true" },
        { input: "num = 14", output: "false" },
      ],
      constraints: ["1 <= num <= 2^31 - 1"],
      fnName: "isPerfectSquare",
      starter: `function isPerfectSquare(num) {\n  \n}`,
      solution: `function isPerfectSquare(num) {\n  let lo = 1, hi = num;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    const sq = mid * mid;\n    if (sq === num) return true;\n    if (sq < num) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return false;\n}`,
      tests: [
        { args: [16], expected: true },
        { args: [14], expected: false },
        { args: [1], expected: true },
        { args: [808201], expected: true },
      ],
      approach:
        "Squaring is monotonic, so binary-search the candidate root in `[1, num]`: compare `mid*mid` against `num` and halve the range. O(log num) instead of trying every integer. This is the same 'binary search over the answer space' move as Koko Eating Bananas — the array isn't given, you *invent* the sorted range.",
      docAnchor: "binary-search",
    },
    {
      slug: "arranging-coins",
      title: "Arranging Coins",
      difficulty: "Easy",
      category: "binary-search",
      blurb: "How many complete staircase rows can n coins build?",
      statement: [
        "You build a staircase where row `i` needs exactly `i` coins. Given `n` coins, return the number of **complete** rows you can build.",
        "Canonical must-do (AM-600 Binary Search / Math family).",
      ],
      examples: [
        { input: "n = 5", output: "2", explanation: "Rows of 1 and 2 use 3 coins; a third row needs 3 more." },
        { input: "n = 8", output: "3" },
      ],
      constraints: ["0 <= n <= 2^31 - 1"],
      fnName: "arrangeCoins",
      starter: `function arrangeCoins(n) {\n  \n}`,
      solution: `function arrangeCoins(n) {\n  let lo = 0, hi = n, ans = 0;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    const need = mid * (mid + 1) / 2;\n    if (need <= n) { ans = mid; lo = mid + 1; }\n    else hi = mid - 1;\n  }\n  return ans;\n}`,
      tests: [
        { args: [5], expected: 2 },
        { args: [8], expected: 3 },
        { args: [1], expected: 1 },
        { args: [0], expected: 0 },
      ],
      approach:
        "`k` complete rows need `k(k+1)/2` coins, which **increases monotonically** in k — so binary-search the largest k whose requirement still fits in n. O(log n) rather than looping row by row. (Closed form: `k = ⌊(√(8n+1) − 1)/2⌋`, but binary search avoids floating-point precision worries at large n.)",
      docAnchor: "binary-search",
    },
    {
      slug: "find-smallest-letter-greater-than-target",
      title: "Find Smallest Letter Greater Than Target",
      difficulty: "Easy",
      category: "binary-search",
      blurb: "Next letter after target, wrapping around.",
      statement: [
        "Given a sorted array of `letters` and a `target` character, return the **smallest letter strictly greater than** target. Letters wrap around, so if none is greater, return the first letter.",
        "Canonical must-do (AM-600 Binary Search family).",
      ],
      examples: [
        { input: 'letters = ["c","f","j"], target = "a"', output: '"c"' },
        { input: 'letters = ["c","f","j"], target = "j"', output: '"c"', explanation: "Wraps around." },
      ],
      constraints: ["2 <= letters.length <= 10^4", "letters is sorted non-decreasing"],
      fnName: "nextGreatestLetter",
      starter: `function nextGreatestLetter(letters, target) {\n  \n}`,
      solution: `function nextGreatestLetter(letters, target) {\n  let lo = 0, hi = letters.length - 1, ans = letters[0];\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (letters[mid] > target) { ans = letters[mid]; hi = mid - 1; }\n    else lo = mid + 1;\n  }\n  return ans;\n}`,
      tests: [
        { args: [["c", "f", "j"], "a"], expected: "c" },
        { args: [["c", "f", "j"], "c"], expected: "f" },
        { args: [["c", "f", "j"], "j"], expected: "c" },
        { args: [["x", "x", "y", "y"], "z"], expected: "x" },
      ],
      approach:
        "A **first-true** binary search over the predicate 'letter > target': whenever a midpoint qualifies, record it and keep searching left for something even smaller that still qualifies. Initialising the answer to `letters[0]` handles the wrap-around for free — if nothing ever qualifies, the initial value is returned. O(log n).",
      docAnchor: "binary-search",
    },
    {
      slug: "peak-index-in-a-mountain-array",
      title: "Peak Index in a Mountain Array",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "Find the summit of an up-then-down array.",
      statement: [
        "A **mountain array** strictly increases to a single peak, then strictly decreases. Given such an `arr`, return the index of the peak in O(log n).",
        "Canonical must-do (AM-600 Binary Search family).",
      ],
      examples: [
        { input: "arr = [0,1,0]", output: "1" },
        { input: "arr = [0,10,5,2]", output: "1" },
      ],
      constraints: ["3 <= arr.length <= 10^5", "arr is a valid mountain array"],
      fnName: "peakIndexInMountainArray",
      starter: `function peakIndexInMountainArray(arr) {\n  \n}`,
      solution: `function peakIndexInMountainArray(arr) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] < arr[mid + 1]) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}`,
      tests: [
        { args: [[0, 1, 0]], expected: 1 },
        { args: [[0, 2, 1, 0]], expected: 1 },
        { args: [[0, 10, 5, 2]], expected: 1 },
        { args: [[3, 4, 5, 1]], expected: 2 },
      ],
      approach:
        "Binary search on the **slope** rather than on values: if `arr[mid] < arr[mid+1]` you're still climbing, so the peak is strictly right (`lo = mid+1`); otherwise you're at or past it (`hi = mid`). The `lo < hi` loop converges on the summit without ever needing an equality case. O(log n). Same machinery as Find Peak Element, but the mountain guarantee makes it unambiguous.",
      docAnchor: "binary-search",
    },
    {
      slug: "find-k-closest-elements",
      title: "Find K Closest Elements",
      difficulty: "Medium",
      category: "binary-search",
      blurb: "The k values nearest x, in ascending order.",
      statement: [
        "Given a **sorted** array `arr`, an integer `k`, and a value `x`, return the `k` closest values to `x`, sorted ascending. Ties prefer the **smaller** value.",
        "Canonical must-do (AM-600 Binary Search family).",
      ],
      examples: [
        { input: "arr = [1,2,3,4,5], k = 4, x = 3", output: "[1,2,3,4]" },
        { input: "arr = [1,2,3,4,5], k = 4, x = -1", output: "[1,2,3,4]" },
      ],
      constraints: ["1 <= k <= arr.length <= 10^4", "arr is sorted ascending"],
      fnName: "findClosestElements",
      starter: `function findClosestElements(arr, k, x) {\n  \n}`,
      solution: `function findClosestElements(arr, k, x) {\n  let lo = 0, hi = arr.length - k;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (x - arr[mid] > arr[mid + k] - x) lo = mid + 1;\n    else hi = mid;\n  }\n  return arr.slice(lo, lo + k);\n}`,
      tests: [
        { args: [[1, 2, 3, 4, 5], 4, 3], expected: [1, 2, 3, 4] },
        { args: [[1, 2, 3, 4, 5], 4, -1], expected: [1, 2, 3, 4] },
        { args: [[1, 1, 2, 2, 2, 2, 2, 3, 3], 3, 3], expected: [2, 3, 3] },
      ],
      approach:
        "Since the answer is a **contiguous window** of length k, binary-search its *starting index* in `[0, n-k]` instead of searching for x. At each candidate start, compare the element about to be dropped (`arr[mid]`) against the one about to be gained (`arr[mid+k]`): if the left one is farther from x, slide right. The `>` (not `>=`) is what makes ties favour the smaller value. O(log(n−k) + k).",
      docAnchor: "binary-search",
    },
  ],
};
