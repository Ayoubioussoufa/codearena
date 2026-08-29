/**
 * DSA — Sliding Window. A window [l, r] that grows and shrinks over a sequence,
 * maintaining a running summary so each element is added/removed O(1) times.
 */
import type { DsaCategory } from "../types";

export const slidingWindow: DsaCategory = {
  id: "sliding-window",
  title: "Sliding Window",
  icon: "🪟",
  docAnchor: "sliding-window",
  blurb: "A growing/shrinking window over a sequence — contiguous subarray/substring problems in O(n).",
  problems: [
    {
      slug: "best-time-to-buy-sell-stock",
      title: "Best Time to Buy and Sell Stock",
      difficulty: "Easy",
      category: "sliding-window",
      blurb: "Max profit from one buy and a later sell.",
      statement: [
        "Given `prices` where `prices[i]` is a stock's price on day i, return the maximum profit from buying on one day and selling on a later day. If no profit is possible, return 0.",
      ],
      examples: [
        { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy at 1, sell at 6." },
        { input: "prices = [7,6,4,3,1]", output: "0" },
      ],
      constraints: ["1 <= prices.length <= 10^5"],
      fnName: "maxProfit",
      starter: "function maxProfit(prices) {\n  \n}",
      solution:
        "function maxProfit(prices) {\n  let min = Infinity, best = 0;\n  for (const p of prices) {\n    min = Math.min(min, p);\n    best = Math.max(best, p - min);\n  }\n  return best;\n}",
      tests: [
        { args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
        { args: [[7, 6, 4, 3, 1]], expected: 0 },
        { args: [[1, 2]], expected: 1 },
        { args: [[2, 4, 1]], expected: 2 },
      ],
      approach:
        "Track the lowest price seen so far (the best day to have bought) and, at each day, the profit if you sold today. The running minimum is a one-sided window: the buy can be any earlier day, so you only ever need the cheapest one. O(n), O(1). It's the simplest member of the family — a window whose left edge only ever means 'best start so far'.",
      docAnchor: "sliding-window",
    },
    {
      slug: "longest-substring-without-repeating",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Longest window with all-distinct characters.",
      statement: [
        "Given a string `s`, return the length of the longest substring without repeating characters.",
      ],
      examples: [
        { input: 's = "abcabcbb"', output: "3", explanation: '"abc".' },
        { input: 's = "bbbbb"', output: "1" },
      ],
      constraints: ["0 <= s.length <= 5 * 10^4"],
      fnName: "lengthOfLongestSubstring",
      starter: "function lengthOfLongestSubstring(s) {\n  \n}",
      solution:
        "function lengthOfLongestSubstring(s) {\n  const seen = new Set();\n  let l = 0, best = 0;\n  for (let r = 0; r < s.length; r++) {\n    while (seen.has(s[r])) {\n      seen.delete(s[l]);\n      l++;\n    }\n    seen.add(s[r]);\n    best = Math.max(best, r - l + 1);\n  }\n  return best;\n}",
      tests: [
        { args: ["abcabcbb"], expected: 3 },
        { args: ["bbbbb"], expected: 1 },
        { args: ["pwwkew"], expected: 3 },
        { args: [""], expected: 0 },
      ],
      approach:
        "Grow the window by advancing the right edge; when the incoming character is already inside, shrink from the left until the duplicate is gone. A Set holds the current window's characters. Every index enters and leaves at most once, so O(n). The template — expand right, shrink left to restore an invariant — is the heart of variable-size windows.",
      docAnchor: "sliding-window",
    },
    {
      slug: "longest-repeating-character-replacement",
      title: "Longest Repeating Character Replacement",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Longest same-letter run allowing k replacements.",
      statement: [
        "Given a string `s` (uppercase letters) and an integer `k`, you may replace up to `k` characters. Return the length of the longest substring of a single repeated letter you can then form.",
      ],
      examples: [
        { input: 's = "ABAB", k = 2', output: "4" },
        { input: 's = "AABABBA", k = 1', output: "4" },
      ],
      constraints: ["1 <= s.length <= 10^5", "0 <= k <= s.length"],
      fnName: "characterReplacement",
      starter: "function characterReplacement(s, k) {\n  \n}",
      solution:
        "function characterReplacement(s, k) {\n  const count = {};\n  let l = 0, maxFreq = 0, best = 0;\n  for (let r = 0; r < s.length; r++) {\n    count[s[r]] = (count[s[r]] || 0) + 1;\n    maxFreq = Math.max(maxFreq, count[s[r]]);\n    while (r - l + 1 - maxFreq > k) {\n      count[s[l]]--;\n      l++;\n    }\n    best = Math.max(best, r - l + 1);\n  }\n  return best;\n}",
      tests: [
        { args: ["ABAB", 2], expected: 4 },
        { args: ["AABABBA", 1], expected: 4 },
        { args: ["AAAA", 0], expected: 4 },
        { args: ["ABCDE", 1], expected: 2 },
      ],
      approach:
        "A window is valid when (its length − the count of its most common letter) ≤ k, i.e. the other letters can all be replaced. Grow right; when that condition breaks, slide left. Tracking only the max frequency (never decreasing it) is a subtle but correct optimization — the answer never shrinks, so a stale maxFreq can't inflate it. O(n).",
      docAnchor: "sliding-window",
    },
    {
      slug: "permutation-in-string",
      title: "Permutation in String",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Does s2 contain a permutation of s1?",
      statement: [
        "Given strings `s1` and `s2`, return `true` if `s2` contains a substring that is a permutation of `s1` (a contiguous window with the same character counts).",
      ],
      examples: [
        { input: 's1 = "ab", s2 = "eidbaooo"', output: "true", explanation: '"ba" is a permutation of "ab".' },
        { input: 's1 = "ab", s2 = "eidboaoo"', output: "false" },
      ],
      constraints: ["1 <= s1.length, s2.length <= 10^4"],
      fnName: "checkInclusion",
      starter: "function checkInclusion(s1, s2) {\n  \n}",
      solution:
        "function checkInclusion(s1, s2) {\n  if (s1.length > s2.length) return false;\n  const a = 'a'.charCodeAt(0);\n  const need = new Array(26).fill(0);\n  const win = new Array(26).fill(0);\n  for (const c of s1) need[c.charCodeAt(0) - a]++;\n  for (let i = 0; i < s2.length; i++) {\n    win[s2.charCodeAt(i) - a]++;\n    if (i >= s1.length) win[s2.charCodeAt(i - s1.length) - a]--;\n    if (i >= s1.length - 1 && need.every((v, j) => v === win[j])) return true;\n  }\n  return false;\n}",
      tests: [
        { args: ["ab", "eidbaooo"], expected: true },
        { args: ["ab", "eidboaoo"], expected: false },
        { args: ["adc", "dcda"], expected: true },
        { args: ["hello", "ooolleoooleh"], expected: false },
      ],
      approach:
        "A permutation is just a matching character-count multiset, so slide a FIXED-size window (length of s1) across s2 and compare frequency vectors. Add the entering character, drop the leaving one — O(1) per step over a 26-length array. Fixed-width windows are the simplest variant: the size never changes, you just roll it forward.",
      docAnchor: "sliding-window",
    },
    {
      slug: "max-consecutive-ones-iii",
      title: "Max Consecutive Ones III",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Longest run of 1s if you may flip k zeros.",
      statement: [
        "Given a binary array `nums` and an integer `k`, return the length of the longest run of 1s obtainable by flipping at most `k` zeros to 1.",
      ],
      examples: [
        { input: "nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2", output: "6" },
        { input: "nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k = 3", output: "10" },
      ],
      constraints: ["1 <= nums.length <= 10^5"],
      fnName: "longestOnes",
      starter: "function longestOnes(nums, k) {\n  \n}",
      solution:
        "function longestOnes(nums, k) {\n  let l = 0, zeros = 0, best = 0;\n  for (let r = 0; r < nums.length; r++) {\n    if (nums[r] === 0) zeros++;\n    while (zeros > k) {\n      if (nums[l] === 0) zeros--;\n      l++;\n    }\n    best = Math.max(best, r - l + 1);\n  }\n  return best;\n}",
      tests: [
        { args: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], expected: 6 },
        { args: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], expected: 10 },
        { args: [[0, 0, 0], 0], expected: 0 },
        { args: [[1, 1, 1], 1], expected: 3 },
      ],
      approach:
        "Reframe: find the longest window containing at most k zeros (those are the ones you'd flip). Expand right, counting zeros; when they exceed k, shrink left past a zero to restore the budget. The window is always the best answer ending at r. O(n). 'At most k of X' problems almost always reduce to this window.",
      docAnchor: "sliding-window",
    },
    {
      slug: "minimum-window-substring",
      title: "Minimum Window Substring",
      difficulty: "Hard",
      category: "sliding-window",
      blurb: "Smallest window of s covering all of t's characters.",
      statement: [
        "Given strings `s` and `t`, return the shortest substring of `s` that contains every character of `t` (including multiplicities). If none exists, return the empty string.",
      ],
      examples: [
        { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
        { input: 's = "a", t = "a"', output: '"a"' },
      ],
      constraints: ["1 <= s.length, t.length <= 10^5"],
      fnName: "minWindow",
      starter: "function minWindow(s, t) {\n  \n}",
      solution:
        "function minWindow(s, t) {\n  if (t.length > s.length) return '';\n  const need = {};\n  let required = 0;\n  for (const c of t) {\n    if (need[c] === undefined) { need[c] = 0; required++; }\n    need[c]++;\n  }\n  const win = {};\n  let formed = 0, l = 0;\n  let best = [Infinity, 0, 0];\n  for (let r = 0; r < s.length; r++) {\n    const c = s[r];\n    win[c] = (win[c] || 0) + 1;\n    if (need[c] !== undefined && win[c] === need[c]) formed++;\n    while (formed === required) {\n      if (r - l + 1 < best[0]) best = [r - l + 1, l, r];\n      const lc = s[l];\n      win[lc]--;\n      if (need[lc] !== undefined && win[lc] < need[lc]) formed--;\n      l++;\n    }\n  }\n  return best[0] === Infinity ? '' : s.slice(best[1], best[2] + 1);\n}",
      tests: [
        { args: ["ADOBECODEBANC", "ABC"], expected: "BANC" },
        { args: ["a", "a"], expected: "a" },
        { args: ["a", "aa"], expected: "" },
        { args: ["aab", "aab"], expected: "aab" },
      ],
      approach:
        "Expand right until the window covers all of t (tracked by a `formed` counter of satisfied character requirements), then contract left as far as it stays valid, recording the smallest span. Each character is added and removed once → O(|s|). This 'grow to feasible, then shrink to minimal' is the hardest window template, and the pattern behind most 'smallest window that…' problems.",
      docAnchor: "sliding-window",
    },
    {
      slug: "maximum-average-subarray-i",
      title: "Maximum Average Subarray I",
      difficulty: "Easy",
      category: "sliding-window",
      blurb: "Best average over any window of exactly k elements.",
      statement: [
        "Return the maximum average of any contiguous subarray of length exactly `k`.",
      ],
      examples: [
        { input: "nums = [1,12,-5,-6,50,3], k = 4", output: "12.75", explanation: "(12 − 5 − 6 + 50) / 4." },
        { input: "nums = [5], k = 1", output: "5" },
      ],
      constraints: ["1 <= k <= nums.length <= 10^5"],
      fnName: "findMaxAverage",
      starter: "function findMaxAverage(nums, k) {\n  \n}",
      solution:
        "function findMaxAverage(nums, k) {\n  let sum = 0;\n  for (let i = 0; i < k; i++) sum += nums[i];\n  let best = sum;\n  for (let i = k; i < nums.length; i++) {\n    sum += nums[i] - nums[i - k];\n    best = Math.max(best, sum);\n  }\n  return best / k;\n}",
      tests: [
        { args: [[1, 12, -5, -6, 50, 3], 4], expected: 12.75, approx: 1e-9 },
        { args: [[5], 1], expected: 5 },
        { args: [[0, 4, 0, 3, 2], 1], expected: 4 },
        { args: [[-1, -2, -3], 2], expected: -1.5, approx: 1e-9 },
      ],
      approach:
        "The FIXED-size window in its purest form: compute the first window's sum, then roll — add the entering element, subtract the leaving one. Each slide is O(1) instead of re-summing k elements, so the whole thing is O(n). Two hygiene points: maximize the SUM and divide once at the end (fewer float operations), and note that a fixed-size window needs no shrink logic at all — if you find yourself writing a while-loop here, you're overcomplicating it. This is the template that variable-size windows extend.",
      docAnchor: "sliding-window",
    },
    {
      slug: "minimum-size-subarray-sum",
      title: "Minimum Size Subarray Sum",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Shortest window with sum ≥ target (all positives).",
      statement: [
        "Given positive integers `nums` and a `target`, return the length of the SHORTEST contiguous subarray with sum ≥ target, or `0` if none exists.",
      ],
      examples: [
        { input: "target = 7, nums = [2,3,1,2,4,3]", output: "2", explanation: "[4,3]." },
        { input: "target = 4, nums = [1,4,4]", output: "1" },
        { input: "target = 11, nums = [1,1,1,1,1,1,1,1]", output: "0" },
      ],
      constraints: ["1 <= nums.length <= 10^5", "1 <= nums[i] <= 10^4"],
      fnName: "minSubArrayLen",
      starter: "function minSubArrayLen(target, nums) {\n  \n}",
      solution:
        "function minSubArrayLen(target, nums) {\n  let lo = 0;\n  let sum = 0;\n  let best = Infinity;\n  for (let hi = 0; hi < nums.length; hi++) {\n    sum += nums[hi];\n    while (sum >= target) {\n      best = Math.min(best, hi - lo + 1);\n      sum -= nums[lo++];\n    }\n  }\n  return best === Infinity ? 0 : best;\n}",
      tests: [
        { args: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
        { args: [4, [1, 4, 4]], expected: 1 },
        { args: [11, [1, 1, 1, 1, 1, 1, 1, 1]], expected: 0 },
        { args: [3, [3]], expected: 1 },
      ],
      approach:
        "The shrink-aggressively variant: grow the window rightward, and while the constraint is SATISFIED, record the length and shrink from the left — because for 'shortest', a satisfying window should be squeezed as hard as possible before moving on. Compare with longest-window problems, which shrink only while the constraint is VIOLATED; which loop the while-condition guards is the entire difference between the two templates. All-positive numbers make the sum monotonic under both operations — exactly the property that makes the window valid (and its absence is why Shortest Subarray With Sum ≥ K, with negatives, needs a deque instead).",
      docAnchor: "sliding-window",
    },
    {
      slug: "fruit-into-baskets",
      title: "Fruit Into Baskets",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Longest window containing at most two distinct values.",
      statement: [
        "`fruits[i]` is the type of the i-th tree's fruit. You have two baskets, each holding ONE type. Picking a contiguous run of trees, return the maximum number of fruits you can collect (i.e. the longest window with at most 2 distinct types).",
      ],
      examples: [
        { input: "fruits = [1,2,1]", output: "3" },
        { input: "fruits = [1,2,3,2,2]", output: "4", explanation: "[2,3,2,2]." },
        { input: "fruits = [3,3,3,1,2,1,1,2,3,3,4]", output: "5" },
      ],
      constraints: ["1 <= fruits.length <= 10^5"],
      fnName: "totalFruit",
      starter: "function totalFruit(fruits) {\n  \n}",
      solution:
        "function totalFruit(fruits) {\n  const counts = new Map();\n  let lo = 0;\n  let best = 0;\n  for (let hi = 0; hi < fruits.length; hi++) {\n    counts.set(fruits[hi], (counts.get(fruits[hi]) || 0) + 1);\n    while (counts.size > 2) {\n      const f = fruits[lo++];\n      const c = counts.get(f) - 1;\n      if (c === 0) counts.delete(f);\n      else counts.set(f, c);\n    }\n    best = Math.max(best, hi - lo + 1);\n  }\n  return best;\n}",
      tests: [
        { args: [[1, 2, 1]], expected: 3 },
        { args: [[1, 2, 3, 2, 2]], expected: 4 },
        { args: [[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], expected: 5 },
        { args: [[7]], expected: 1 },
      ],
      approach:
        "'Longest substring with at most K distinct' with K = 2 and a fruit costume. The window invariant is 'counts.size ≤ 2', maintained by a count-map: extend right, and while a third type is present shrink left, DELETING a type's entry when its count hits zero (forgetting the delete makes size stick at 3 — the bug everyone writes once). Longest-variant shrinking: only while violated. Generalize K and you've solved a whole family; the map-of-counts + size check is the standard machinery for 'distinct elements' window constraints.",
      docAnchor: "sliding-window",
    },
    {
      slug: "longest-subarray-of-ones-after-deleting",
      title: "Longest Subarray of 1's After Deleting One Element",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Must delete exactly one element — window with ≤ 1 zero.",
      statement: [
        "Given a binary array, you MUST delete exactly one element. Return the length of the longest run of 1's in the result.",
      ],
      examples: [
        { input: "nums = [1,1,0,1]", output: "3", explanation: "Delete the 0." },
        { input: "nums = [0,1,1,1,0,1,1,0,1]", output: "5", explanation: "Delete the middle 0 → [1,1,1,1,1] around it." },
        { input: "nums = [1,1,1]", output: "2", explanation: "You must delete something." },
      ],
      constraints: ["1 <= nums.length <= 10^5"],
      fnName: "longestSubarray",
      starter: "function longestSubarray(nums) {\n  \n}",
      solution:
        "function longestSubarray(nums) {\n  let lo = 0;\n  let zeros = 0;\n  let best = 0;\n  for (let hi = 0; hi < nums.length; hi++) {\n    if (nums[hi] === 0) zeros++;\n    while (zeros > 1) {\n      if (nums[lo] === 0) zeros--;\n      lo++;\n    }\n    best = Math.max(best, hi - lo);\n  }\n  return best;\n}",
      tests: [
        { args: [[1, 1, 0, 1]], expected: 3 },
        { args: [[0, 1, 1, 1, 0, 1, 1, 0, 1]], expected: 5 },
        { args: [[1, 1, 1]], expected: 2 },
        { args: [[0, 0, 0]], expected: 0 },
      ],
      approach:
        "Maintain the longest window containing AT MOST ONE zero (the zero is your deletion slot); the answer for a window is its length MINUS one — the deleted element — which is exactly `hi - lo` without the usual +1. That accounting also silently handles the all-ones case (you still must delete something, so [1,1,1] → 2). A cousin of Max Consecutive Ones III with K = 1, plus a twist in what you count: window problems often differ only in the final expression, so slow down there.",
      docAnchor: "sliding-window",
    },
    {
      slug: "longest-substring-k-distinct",
      title: "Longest Substring with At Most K Distinct Characters",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Widest window holding ≤ k different characters.",
      statement: [
        "Given a string `s` and an integer `k`, return the length of the longest substring that contains **at most `k` distinct** characters.",
        "From *interactive-coding-challenges* (Online Judges). This is the general form of Fruit Into Baskets (which is k = 2).",
      ],
      examples: [
        { input: 's = "eceba", k = 2', output: "3", explanation: '"ece" has 2 distinct characters.' },
        { input: 's = "aa", k = 1', output: "2" },
      ],
      constraints: ["0 <= s.length <= 5·10^4", "0 <= k <= 50"],
      fnName: "lengthOfLongestSubstringKDistinct",
      starter: `function lengthOfLongestSubstringKDistinct(s, k) {\n  \n}`,
      solution: `function lengthOfLongestSubstringKDistinct(s, k) {\n  if (k === 0) return 0;\n  const count = new Map();\n  let l = 0, best = 0;\n  for (let r = 0; r < s.length; r++) {\n    count.set(s[r], (count.get(s[r]) || 0) + 1);\n    while (count.size > k) {\n      const c = s[l];\n      count.set(c, count.get(c) - 1);\n      if (count.get(c) === 0) count.delete(c);\n      l++;\n    }\n    best = Math.max(best, r - l + 1);\n  }\n  return best;\n}`,
      tests: [
        { args: ["eceba", 2], expected: 3 },
        { args: ["aa", 1], expected: 2 },
        { args: ["a", 0], expected: 0 },
        { args: ["abaccc", 2], expected: 4 },
        { args: ["", 3], expected: 0 },
      ],
      approach:
        "Variable-size sliding window with a hash map of character → count *inside* the window. Grow the right edge every step; whenever the map holds more than k distinct keys, shrink the left edge (decrementing counts, deleting a key when it hits 0) until you're back to ≤ k. Record the widest legal window. Each index enters and leaves once → O(n). `count.size` is the live 'distinct count' — the single value the window's legality hinges on.",
      docAnchor: "sliding-window",
    },
    {
      slug: "max-consecutive-ones",
      title: "Max Consecutive Ones",
      difficulty: "Easy",
      category: "sliding-window",
      blurb: "Longest run of consecutive 1s.",
      statement: [
        "Given a binary array `nums`, return the maximum number of consecutive `1`s.",
        "From AlgoMaster **AM-600** (Arrays). The zero-flip base case of Max Consecutive Ones III.",
      ],
      examples: [
        { input: "nums = [1,1,0,1,1,1]", output: "3" },
        { input: "nums = [1,0,1,1,0,1]", output: "2" },
      ],
      constraints: ["1 <= nums.length <= 10^5"],
      fnName: "findMaxConsecutiveOnes",
      starter: `function findMaxConsecutiveOnes(nums) {\n  \n}`,
      solution: `function findMaxConsecutiveOnes(nums) {\n  let best = 0, cur = 0;\n  for (const x of nums) {\n    if (x === 1) {\n      cur++;\n      best = Math.max(best, cur);\n    } else {\n      cur = 0;\n    }\n  }\n  return best;\n}`,
      tests: [
        { args: [[1, 1, 0, 1, 1, 1]], expected: 3 },
        { args: [[1, 0, 1, 1, 0, 1]], expected: 2 },
        { args: [[0, 0]], expected: 0 },
        { args: [[1, 1, 1]], expected: 3 },
      ],
      approach:
        "A degenerate sliding window: keep a running length of the current 1-streak, reset it to 0 on every 0, and track the max seen. O(n), O(1) space. It's the base case that generalizes to 'longest run of 1s if you may flip k zeros' (Max Consecutive Ones III) — where a real shrink-on-too-many-zeros window is needed.",
      docAnchor: "sliding-window",
    },
    {
      slug: "find-all-anagrams-in-a-string",
      title: "Find All Anagrams in a String",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Start indices of every anagram of p inside s.",
      statement: [
        "Given strings `s` and `p`, return an array of all **start indices** of `p`'s anagrams in `s`, in ascending order.",
        "Canonical must-do (AM-600 Sliding Window family).",
      ],
      examples: [
        { input: 's = "cbaebabacd", p = "abc"', output: "[0,6]", explanation: '"cba" at 0 and "bac" at 6.' },
        { input: 's = "abab", p = "ab"', output: "[0,1,2]" },
      ],
      constraints: ["1 <= s.length, p.length <= 3·10^4", "lowercase letters"],
      fnName: "findAnagrams",
      starter: `function findAnagrams(s, p) {\n  \n}`,
      solution: `function findAnagrams(s, p) {\n  const res = [];\n  if (p.length > s.length) return res;\n  const need = {}, window = {};\n  for (const c of p) need[c] = (need[c] || 0) + 1;\n  function match() {\n    for (const c in need) if ((window[c] || 0) !== need[c]) return false;\n    return true;\n  }\n  for (let i = 0; i < s.length; i++) {\n    window[s[i]] = (window[s[i]] || 0) + 1;\n    if (i >= p.length) {\n      const left = s[i - p.length];\n      window[left]--;\n      if (window[left] === 0) delete window[left];\n    }\n    if (i >= p.length - 1 && match()) res.push(i - p.length + 1);\n  }\n  return res;\n}`,
      tests: [
        { args: ["cbaebabacd", "abc"], expected: [0, 6] },
        { args: ["abab", "ab"], expected: [0, 1, 2] },
        { args: ["a", "aa"], expected: [] },
        { args: ["aa", "a"], expected: [0, 1] },
      ],
      approach:
        "A **fixed-size** sliding window of length `p.length`: add the incoming character, drop the one that fell off the left, and check whether the window's character counts equal `p`'s. Because the alphabet is fixed (26 letters), the comparison is O(1)-ish, giving O(n) overall. Anagram = 'same multiset of characters', so counts — not order — are the invariant to maintain.",
      docAnchor: "sliding-window",
    },
    {
      slug: "subarray-product-less-than-k",
      title: "Subarray Product Less Than K",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Count subarrays whose product is under k.",
      statement: [
        "Given an array of positive integers `nums` and an integer `k`, return the number of contiguous subarrays whose product is **strictly less than** `k`.",
        "Canonical must-do (AM-600 Sliding Window family).",
      ],
      examples: [
        { input: "nums = [10,5,2,6], k = 100", output: "8" },
        { input: "nums = [1,2,3], k = 0", output: "0" },
      ],
      constraints: ["1 <= nums.length <= 3·10^4", "1 <= nums[i] <= 1000"],
      fnName: "numSubarrayProductLessThanK",
      starter: `function numSubarrayProductLessThanK(nums, k) {\n  \n}`,
      solution: `function numSubarrayProductLessThanK(nums, k) {\n  if (k <= 1) return 0;\n  let product = 1, left = 0, count = 0;\n  for (let right = 0; right < nums.length; right++) {\n    product *= nums[right];\n    while (product >= k) {\n      product /= nums[left];\n      left++;\n    }\n    count += right - left + 1;\n  }\n  return count;\n}`,
      tests: [
        { args: [[10, 5, 2, 6], 100], expected: 8 },
        { args: [[1, 2, 3], 0], expected: 0 },
        { args: [[1, 1, 1], 2], expected: 6 },
        { args: [[10, 9, 10, 4, 3, 8, 3, 3, 6, 2, 10, 10, 9, 3], 19], expected: 18 },
      ],
      approach:
        "Grow the window right; whenever the running product reaches `k`, shrink from the left (dividing out) until it's legal again. The counting insight: once `[left..right]` is valid, **every subarray ending at `right`** that starts at or after `left` is also valid — that's `right - left + 1` new subarrays, added each step. Guard `k <= 1` (no positive product is < 1). O(n) — each index enters and leaves once.",
      docAnchor: "sliding-window",
    },
    {
      slug: "maximum-erasure-value",
      title: "Maximum Erasure Value",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Max sum of a subarray with all-unique elements.",
      statement: [
        "Given an array of positive integers `nums`, find the maximum **sum** of a contiguous subarray whose elements are all **distinct**.",
        "Canonical must-do (AM-600 Sliding Window family).",
      ],
      examples: [
        { input: "nums = [4,2,4,5,6]", output: "17", explanation: "[2,4,5,6] sums to 17." },
        { input: "nums = [5,2,1,2,5,2,1,2,5]", output: "8" },
      ],
      constraints: ["1 <= nums.length <= 10^5", "1 <= nums[i] <= 10^4"],
      fnName: "maximumUniqueSubarray",
      starter: `function maximumUniqueSubarray(nums) {\n  \n}`,
      solution: `function maximumUniqueSubarray(nums) {\n  const seen = new Set();\n  let l = 0, sum = 0, best = 0;\n  for (let r = 0; r < nums.length; r++) {\n    while (seen.has(nums[r])) {\n      seen.delete(nums[l]);\n      sum -= nums[l];\n      l++;\n    }\n    seen.add(nums[r]);\n    sum += nums[r];\n    best = Math.max(best, sum);\n  }\n  return best;\n}`,
      tests: [
        { args: [[4, 2, 4, 5, 6]], expected: 17 },
        { args: [[5, 2, 1, 2, 5, 2, 1, 2, 5]], expected: 8 },
        { args: [[1]], expected: 1 },
      ],
      approach:
        "Longest-Substring-Without-Repeating with a **running sum** attached. Grow the right edge; while the incoming value already sits in the window's set, shrink from the left (removing from the set *and* subtracting from the sum) until the duplicate is gone. Track the best sum. Maintaining the aggregate incrementally — rather than recomputing the window's sum — is what keeps it O(n).",
      docAnchor: "sliding-window",
    },
    {
      slug: "substrings-containing-all-three",
      title: "Number of Substrings Containing All Three Characters",
      difficulty: "Medium",
      category: "sliding-window",
      blurb: "Count substrings holding at least one a, b, and c.",
      statement: [
        "Given a string `s` of only the characters `a`, `b`, and `c`, return the number of substrings that contain **at least one of each**.",
        "Canonical must-do (AM-600 Sliding Window family).",
      ],
      examples: [
        { input: 's = "abcabc"', output: "10" },
        { input: 's = "aaacb"', output: "3" },
        { input: 's = "abc"', output: "1" },
      ],
      constraints: ["3 <= s.length <= 5·10^4"],
      fnName: "numberOfSubstrings",
      starter: `function numberOfSubstrings(s) {\n  \n}`,
      solution: `function numberOfSubstrings(s) {\n  const last = { a: -1, b: -1, c: -1 };\n  let count = 0;\n  for (let i = 0; i < s.length; i++) {\n    last[s[i]] = i;\n    count += Math.min(last.a, last.b, last.c) + 1;\n  }\n  return count;\n}`,
      tests: [
        { args: ["abcabc"], expected: 10 },
        { args: ["aaacb"], expected: 3 },
        { args: ["abc"], expected: 1 },
      ],
      approach:
        "For each end position `i`, every valid substring ending at `i` must start at or before the **most recent occurrence of the rarest-so-far character** — i.e. at or before `min(lastA, lastB, lastC)`. That gives exactly `min(...) + 1` new substrings per position (0 if any letter hasn't appeared, since its last index is −1). One pass, O(n), O(1) space — 'count substrings ending here' again.",
      docAnchor: "sliding-window",
    },
  ],
};
