/**
 * DSA — Greedy. Make the locally optimal choice at each step and never
 * reconsider. Fast and simple *when* a greedy choice is provably safe — the
 * hard part is proving it (or spotting the counter-example that needs DP).
 */
import type { DsaCategory } from "../types";

export const greedy: DsaCategory = {
  id: "greedy",
  title: "Greedy",
  icon: "💰",
  docAnchor: "greedy",
  blurb: "Locally optimal choices that provably reach a global optimum — jumps, intervals, gas, scheduling.",
  problems: [
    {
      slug: "maximum-subarray",
      title: "Maximum Subarray",
      difficulty: "Medium",
      category: "greedy",
      blurb: "Largest sum of a contiguous subarray (Kadane).",
      statement: [
        "Given an integer array `nums`, return the largest sum of any contiguous subarray (at least one element).",
      ],
      examples: [
        { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1]." },
        { input: "nums = [5,4,-1,7,8]", output: "23" },
      ],
      constraints: ["1 <= nums.length <= 10^5"],
      fnName: "maxSubArray",
      starter: "function maxSubArray(nums) {\n  \n}",
      solution:
        "function maxSubArray(nums) {\n  let best = nums[0], cur = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    best = Math.max(best, cur);\n  }\n  return best;\n}",
      tests: [
        { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
        { args: [[5, 4, -1, 7, 8]], expected: 23 },
        { args: [[-1]], expected: -1 },
        { args: [[-2, -1]], expected: -1 },
      ],
      approach:
        "Kadane's algorithm: at each element decide greedily whether to extend the current subarray or start fresh from here — `cur = max(nums[i], cur + nums[i])`. The greedy choice is safe because a running sum that has gone negative can only hurt any future subarray, so you drop it. Track the best seen. O(n), O(1). It's greedy and DP at once (the state is 'best subarray ending here').",
      docAnchor: "greedy",
    },
    {
      slug: "jump-game",
      title: "Jump Game",
      difficulty: "Medium",
      category: "greedy",
      blurb: "Can you reach the last index?",
      statement: [
        "Given `nums` where `nums[i]` is the max jump length from index i, return `true` if you can reach the last index starting from index 0.",
      ],
      examples: [
        { input: "nums = [2,3,1,1,4]", output: "true" },
        { input: "nums = [3,2,1,0,4]", output: "false" },
      ],
      constraints: ["1 <= nums.length <= 10^4"],
      fnName: "canJump",
      starter: "function canJump(nums) {\n  \n}",
      solution:
        "function canJump(nums) {\n  let goal = nums.length - 1;\n  for (let i = nums.length - 2; i >= 0; i--) {\n    if (i + nums[i] >= goal) goal = i;\n  }\n  return goal === 0;\n}",
      tests: [
        { args: [[2, 3, 1, 1, 4]], expected: true },
        { args: [[3, 2, 1, 0, 4]], expected: false },
        { args: [[0]], expected: true },
        { args: [[2, 0, 0]], expected: true },
      ],
      approach:
        "Work backwards: keep the leftmost index that can still reach the goal. Scanning right-to-left, if index i can jump to the current goal, i becomes the new goal. If the goal shrinks all the way to 0, index 0 can reach the end. O(n), O(1). The greedy insight — 'can I reach the current target?' collapses the exponential path search — is what makes it linear.",
      docAnchor: "greedy",
    },
    {
      slug: "jump-game-ii",
      title: "Jump Game II",
      difficulty: "Medium",
      category: "greedy",
      blurb: "Fewest jumps to reach the last index.",
      statement: [
        "Given `nums` (as in Jump Game, and assuming the end is always reachable), return the minimum number of jumps to reach the last index.",
      ],
      examples: [
        { input: "nums = [2,3,1,1,4]", output: "2", explanation: "Jump 1 to index 1, then 3 to the end." },
        { input: "nums = [2,3,0,1,4]", output: "2" },
      ],
      constraints: ["1 <= nums.length <= 10^4"],
      fnName: "jump",
      starter: "function jump(nums) {\n  \n}",
      solution:
        "function jump(nums) {\n  let jumps = 0, curEnd = 0, farthest = 0;\n  for (let i = 0; i < nums.length - 1; i++) {\n    farthest = Math.max(farthest, i + nums[i]);\n    if (i === curEnd) {\n      jumps++;\n      curEnd = farthest;\n    }\n  }\n  return jumps;\n}",
      tests: [
        { args: [[2, 3, 1, 1, 4]], expected: 2 },
        { args: [[2, 3, 0, 1, 4]], expected: 2 },
        { args: [[1, 1, 1, 1]], expected: 3 },
        { args: [[0]], expected: 0 },
      ],
      approach:
        "Think in levels, like BFS: within the range reachable by the current number of jumps, find the farthest you could next reach. When you reach the end of the current jump's range, you're forced to jump again, extending the range to that farthest point. O(n), O(1). This 'implicit BFS by ranges' is the elegant leap over the naïve O(n²) DP.",
      docAnchor: "greedy",
    },
    {
      slug: "gas-station",
      title: "Gas Station",
      difficulty: "Medium",
      category: "greedy",
      blurb: "Starting station to complete the circular route.",
      statement: [
        "There are n gas stations in a circle. `gas[i]` is the fuel at station i; `cost[i]` is the fuel to drive to station i+1. Starting with an empty tank, return the index of the station from which you can complete the loop, or -1. The answer is unique if it exists.",
      ],
      examples: [
        { input: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]", output: "3" },
        { input: "gas = [2,3,4], cost = [3,4,3]", output: "-1" },
      ],
      constraints: ["1 <= n <= 10^5"],
      fnName: "canCompleteCircuit",
      starter: "function canCompleteCircuit(gas, cost) {\n  \n}",
      solution:
        "function canCompleteCircuit(gas, cost) {\n  let total = 0, tank = 0, start = 0;\n  for (let i = 0; i < gas.length; i++) {\n    const diff = gas[i] - cost[i];\n    total += diff;\n    tank += diff;\n    if (tank < 0) {\n      start = i + 1;\n      tank = 0;\n    }\n  }\n  return total >= 0 ? start : -1;\n}",
      tests: [
        { args: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expected: 3 },
        { args: [[2, 3, 4], [3, 4, 3]], expected: -1 },
        { args: [[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]], expected: 4 },
        { args: [[3, 3, 4], [3, 4, 4]], expected: -1 },
      ],
      approach:
        "Two facts: if total gas ≥ total cost, a solution exists; and if you run dry somewhere between start and i, then NO station in that stretch can be the start (each was reached with ≥0 tank, so removing them only hurts) — so the next viable start is i+1. One pass tracking a running tank and resetting the start on empty. O(n), O(1). The 'failed prefix can't contain the answer' argument is the greedy's whole justification.",
      docAnchor: "greedy",
    },
    {
      slug: "hand-of-straights",
      title: "Hand of Straights",
      difficulty: "Medium",
      category: "greedy",
      blurb: "Can the hand be split into consecutive groups of size W?",
      statement: [
        "Given an array `hand` of card values and a `groupSize`, return `true` if the cards can be rearranged into groups, each of `groupSize` consecutive values.",
      ],
      examples: [
        { input: "hand = [1,2,3,6,2,3,4,7,8], groupSize = 3", output: "true", explanation: "[1,2,3],[2,3,4],[6,7,8]." },
        { input: "hand = [1,2,3,4,5], groupSize = 4", output: "false" },
      ],
      constraints: ["1 <= hand.length <= 10^4"],
      fnName: "isNStraightHand",
      starter: "function isNStraightHand(hand, groupSize) {\n  \n}",
      solution:
        "function isNStraightHand(hand, groupSize) {\n  if (hand.length % groupSize !== 0) return false;\n  const count = new Map();\n  for (const c of hand) count.set(c, (count.get(c) || 0) + 1);\n  const keys = [...count.keys()].sort((a, b) => a - b);\n  for (const k of keys) {\n    const c = count.get(k);\n    if (c > 0) {\n      for (let i = k; i < k + groupSize; i++) {\n        const ci = count.get(i) || 0;\n        if (ci < c) return false;\n        count.set(i, ci - c);\n      }\n    }\n  }\n  return true;\n}",
      tests: [
        { args: [[1, 2, 3, 6, 2, 3, 4, 7, 8], 3], expected: true },
        { args: [[1, 2, 3, 4, 5], 4], expected: false },
        { args: [[1, 1, 2, 2, 3, 3], 3], expected: true },
        { args: [[8, 10, 12], 3], expected: false },
      ],
      approach:
        "Greedily anchor each group at the smallest remaining card: it MUST begin a group, so consume it and the next groupSize−1 consecutive values, failing if any are missing. Counting cards and processing the keys in ascending order guarantees you always fix the smallest unhandled value first — the safe greedy choice. O(n log n) for the sort plus the consuming passes. 'Always resolve the minimum forced element first' recurs in scheduling/heap problems.",
      docAnchor: "greedy",
    },
    {
      slug: "assign-cookies",
      title: "Assign Cookies",
      difficulty: "Easy",
      category: "greedy",
      blurb: "Satisfy the most children with the cookies you have.",
      statement: [
        "Child `i` is content with a cookie of size ≥ `g[i]`; each child gets at most one cookie. Given greed factors `g` and cookie sizes `s`, return the maximum number of content children.",
      ],
      examples: [
        { input: "g = [1,2,3], s = [1,1]", output: "1" },
        { input: "g = [1,2], s = [1,2,3]", output: "2" },
      ],
      constraints: ["0 <= lengths <= 3 * 10^4"],
      fnName: "findContentChildren",
      starter: "function findContentChildren(g, s) {\n  \n}",
      solution:
        "function findContentChildren(g, s) {\n  const kids = [...g].sort((a, b) => a - b);\n  const cookies = [...s].sort((a, b) => a - b);\n  let i = 0;\n  for (const c of cookies) {\n    if (i < kids.length && c >= kids[i]) i++;\n  }\n  return i;\n}",
      tests: [
        { args: [[1, 2, 3], [1, 1]], expected: 1 },
        { args: [[1, 2], [1, 2, 3]], expected: 2 },
        { args: [[], [1]], expected: 0 },
        { args: [[10, 9, 8, 7], [5, 6, 7, 8]], expected: 2 },
      ],
      approach:
        "Sort both sides and walk them together: give each cookie (smallest first) to the least greedy unsatisfied child it fits; too small for even them → the cookie helps nobody, discard it. The exchange argument that makes it optimal: if some optimal solution gives a bigger cookie to the easy child, SWAPPING it with a smaller sufficient one changes nothing and frees the big cookie — so the greedy choice is never worse. Sort-both-then-two-pointers with an exchange proof is the entry ticket to greedy thinking; every later greedy leans on some version of that swap.",
      docAnchor: "greedy",
    },
    {
      slug: "boats-to-save-people",
      title: "Boats to Save People",
      difficulty: "Medium",
      category: "greedy",
      blurb: "Two per boat, weight-limited — pair heavy with light.",
      statement: [
        "Each boat carries at most TWO people with combined weight ≤ `limit` (everyone individually fits). Return the minimum number of boats for all `people`.",
      ],
      examples: [
        { input: "people = [1,2], limit = 3", output: "1" },
        { input: "people = [3,2,2,1], limit = 3", output: "3" },
        { input: "people = [3,5,3,4], limit = 5", output: "4" },
      ],
      constraints: ["1 <= people.length <= 5 * 10^4", "1 <= people[i] <= limit"],
      fnName: "numRescueBoats",
      starter: "function numRescueBoats(people, limit) {\n  \n}",
      solution:
        "function numRescueBoats(people, limit) {\n  const arr = [...people].sort((a, b) => a - b);\n  let lo = 0;\n  let hi = arr.length - 1;\n  let boats = 0;\n  while (lo <= hi) {\n    if (arr[lo] + arr[hi] <= limit) lo++;\n    hi--;\n    boats++;\n  }\n  return boats;\n}",
      tests: [
        { args: [[1, 2], 3], expected: 1 },
        { args: [[3, 2, 2, 1], 3], expected: 3 },
        { args: [[3, 5, 3, 4], 5], expected: 4 },
        { args: [[2, 2], 6], expected: 1 },
      ],
      approach:
        "Sort, then pinch from both ends: the HEAVIEST person must board something — the only question is whether the LIGHTEST person can share (any other companion is heavier, so if the lightest doesn't fit, nobody does). If they fit, both board; either way the heavy one departs. Each iteration is one boat. Why not pair medium with medium? The exchange argument again: any valid pairing can be rearranged into heaviest+lightest form without adding boats. Greedy on a sorted array with two pointers — the categories you've drilled compose, and that composition is the pattern.",
      docAnchor: "greedy",
    },
    {
      slug: "partition-labels",
      title: "Partition Labels",
      difficulty: "Medium",
      category: "greedy",
      blurb: "Cut the string so no letter spans two parts.",
      statement: [
        "Split `s` into as MANY parts as possible so that each letter appears in at most one part; return the part sizes in order.",
      ],
      examples: [
        { input: "s = \"ababcbacadefegdehijhklij\"", output: "[9,7,8]" },
        { input: "s = \"eccbbbbdec\"", output: "[10]" },
      ],
      constraints: ["1 <= s.length <= 500", "Lowercase letters"],
      fnName: "partitionLabels",
      starter: "function partitionLabels(s) {\n  \n}",
      solution:
        "function partitionLabels(s) {\n  const last = {};\n  for (let i = 0; i < s.length; i++) last[s[i]] = i;\n  const res = [];\n  let start = 0;\n  let end = 0;\n  for (let i = 0; i < s.length; i++) {\n    end = Math.max(end, last[s[i]]);\n    if (i === end) {\n      res.push(i - start + 1);\n      start = i + 1;\n    }\n  }\n  return res;\n}",
      tests: [
        { args: ["ababcbacadefegdehijhklij"], expected: [9, 7, 8] },
        { args: ["eccbbbbdec"], expected: [10] },
        { args: ["a"], expected: [1] },
        { args: ["abcd"], expected: [1, 1, 1, 1] },
      ],
      approach:
        "Precompute each letter's LAST occurrence; then sweep with an expanding deadline: every letter you meet stretches the current part's mandatory end to at least that letter's last index, and when the sweep index REACHES the deadline, nothing inside points past it — cut here, provably the earliest legal cut (hence the most parts). It's the interval world's merging in disguise — each letter is an interval [first, last], and parts are the merged components — solved with just a running max. Greedy 'earliest moment the constraint closes' + a precomputed lookup: a pairing worth remembering.",
      docAnchor: "greedy",
    },
    {
      slug: "valid-parenthesis-string",
      title: "Valid Parenthesis String",
      difficulty: "Medium",
      category: "greedy",
      blurb: "'*' can be (, ), or empty — is the string balanceable?",
      statement: [
        "`s` contains `(`, `)`, and `*`, where each `*` may stand for `(`, `)`, or the empty string. Return whether some interpretation makes `s` a valid parenthesis string.",
      ],
      examples: [
        { input: "s = \"()\"", output: "true" },
        { input: "s = \"(*)\"", output: "true" },
        { input: "s = \"(*))\"", output: "true" },
        { input: "s = \")(\"", output: "false" },
      ],
      constraints: ["1 <= s.length <= 100"],
      fnName: "checkValidString",
      starter: "function checkValidString(s) {\n  \n}",
      solution:
        "function checkValidString(s) {\n  let lo = 0; // fewest possible unmatched '('\n  let hi = 0; // most possible unmatched '('\n  for (const ch of s) {\n    if (ch === \"(\") {\n      lo++;\n      hi++;\n    } else if (ch === \")\") {\n      lo--;\n      hi--;\n    } else {\n      lo--;\n      hi++;\n    }\n    if (hi < 0) return false;\n    if (lo < 0) lo = 0;\n  }\n  return lo === 0;\n}",
      tests: [
        { args: ["()"], expected: true },
        { args: ["(*)"], expected: true },
        { args: ["(*))"], expected: true },
        { args: [")("], expected: false },
        { args: ["*)("], expected: false },
      ],
      approach:
        "Track a RANGE instead of branching three ways per '*' (that's 3^n): lo and hi bound the possible count of unmatched '(' — a '*' widens the range in both directions (it might be '(' or ')'/empty). Validity needs two things: hi never dips below zero (even all-'(' interpretations can't rescue too many ')'s — fail fast), and lo can reach exactly 0 at the end. Clamping lo at 0 discards impossible negative counts without losing real ones. Collapsing exponential nondeterminism into a min/max interval you update in O(1) is a genuinely deep trick — it's an interval abstraction over all possible states.",
      docAnchor: "greedy",
    },
    {
      slug: "candy",
      title: "Candy",
      difficulty: "Hard",
      category: "greedy",
      blurb: "Higher-rated kids beat neighbours; minimize total candies.",
      statement: [
        "Children stand in a line with `ratings`. Each gets ≥ 1 candy, and anyone rated higher than an adjacent child must get more candies than that neighbour. Return the minimum total.",
      ],
      examples: [
        { input: "ratings = [1,0,2]", output: "5", explanation: "Candies [2,1,2]." },
        { input: "ratings = [1,2,2]", output: "4", explanation: "Candies [1,2,1]." },
      ],
      constraints: ["1 <= ratings.length <= 2 * 10^4"],
      fnName: "candy",
      starter: "function candy(ratings) {\n  \n}",
      solution:
        "function candy(ratings) {\n  const n = ratings.length;\n  const candies = new Array(n).fill(1);\n  for (let i = 1; i < n; i++) {\n    if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;\n  }\n  for (let i = n - 2; i >= 0; i--) {\n    if (ratings[i] > ratings[i + 1]) {\n      candies[i] = Math.max(candies[i], candies[i + 1] + 1);\n    }\n  }\n  return candies.reduce((a, b) => a + b, 0);\n}",
      tests: [
        { args: [[1, 0, 2]], expected: 5 },
        { args: [[1, 2, 2]], expected: 4 },
        { args: [[1, 3, 2, 2, 1]], expected: 7 },
        { args: [[5]], expected: 1 },
      ],
      approach:
        "The constraint points BOTH ways, and that's the trap: satisfying left-neighbour rules breaks right-neighbour rules and vice versa if you try one pass. So DECOMPOSE: a left-to-right pass enforces only 'higher than left neighbour ⇒ more candy', then a right-to-left pass enforces the mirror rule, taking max with what's already there so pass one's guarantees survive. Each pass is a trivial greedy; their composition satisfies both rule sets minimally. Splitting a bidirectional constraint into two one-directional sweeps combined by max/min also cracks Trapping Rain Water and Product Except Self — it's a load-bearing technique, not a puzzle hack.",
      docAnchor: "greedy",
    },
    {
      slug: "best-time-to-buy-and-sell-stock-ii",
      title: "Best Time to Buy and Sell Stock II",
      difficulty: "Medium",
      category: "greedy",
      blurb: "Unlimited transactions — total max profit.",
      statement: [
        "Given daily `prices`, you may buy and sell as many times as you like (but hold at most one share at a time — sell before buying again). Return the maximum total profit.",
        "From AlgoMaster **AM-600** (Arrays / Greedy).",
      ],
      examples: [
        { input: "prices = [7,1,5,3,6,4]", output: "7", explanation: "Buy 1 sell 5 (+4), buy 3 sell 6 (+3)." },
        { input: "prices = [1,2,3,4,5]", output: "4", explanation: "Buy 1, sell 5." },
      ],
      constraints: ["1 <= prices.length <= 3·10^4"],
      fnName: "maxProfit",
      starter: `function maxProfit(prices) {\n  \n}`,
      solution: `function maxProfit(prices) {\n  let profit = 0;\n  for (let i = 1; i < prices.length; i++) {\n    if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];\n  }\n  return profit;\n}`,
      tests: [
        { args: [[7, 1, 5, 3, 6, 4]], expected: 7 },
        { args: [[1, 2, 3, 4, 5]], expected: 4 },
        { args: [[7, 6, 4, 3, 1]], expected: 0 },
        { args: [[1]], expected: 0 },
      ],
      approach:
        "The greedy insight: with unlimited transactions, **capture every up-day**. Any rising stretch from x to y equals the sum of its consecutive daily gains, so just add `prices[i] - prices[i-1]` whenever today beats yesterday — it's algebraically identical to buying at each valley and selling at each peak, but trivially simple. O(n). The exchange-argument proof (skipping a positive step never helps) is the greedy justification interviewers want.",
      docAnchor: "greedy",
    },
    {
      slug: "increasing-triplet-subsequence",
      title: "Increasing Triplet Subsequence",
      difficulty: "Medium",
      category: "greedy",
      blurb: "Do three indices form a strictly increasing triple?",
      statement: [
        "Given an integer array `nums`, return `true` if there exist indices `i < j < k` with `nums[i] < nums[j] < nums[k]`.",
        "From AlgoMaster **AM-600** (Arrays / Greedy).",
      ],
      examples: [
        { input: "nums = [1,2,3,4,5]", output: "true" },
        { input: "nums = [5,4,3,2,1]", output: "false" },
        { input: "nums = [2,1,5,0,4,6]", output: "true", explanation: "0 < 4 < 6." },
      ],
      constraints: ["1 <= nums.length <= 5·10^5"],
      fnName: "increasingTriplet",
      starter: `function increasingTriplet(nums) {\n  \n}`,
      solution: `function increasingTriplet(nums) {\n  let first = Infinity, second = Infinity;\n  for (const x of nums) {\n    if (x <= first) first = x;\n    else if (x <= second) second = x;\n    else return true;\n  }\n  return false;\n}`,
      tests: [
        { args: [[1, 2, 3, 4, 5]], expected: true },
        { args: [[5, 4, 3, 2, 1]], expected: false },
        { args: [[2, 1, 5, 0, 4, 6]], expected: true },
        { args: [[1, 1, 1]], expected: false },
      ],
      approach:
        "Track the **smallest value seen so far** (`first`) and the **smallest value that has something smaller before it** (`second`). Any number bigger than both completes a triple → return true. The mind-bender: `first` may later drop *below* the current `second`, which looks wrong, but it's safe — a `second` only ever got set because a valid smaller `first` existed earlier, so the ordering guarantee still holds. O(n) time, O(1) space, one clever pass instead of DP.",
      docAnchor: "greedy",
    },
    {
      slug: "lemonade-change",
      title: "Lemonade Change",
      difficulty: "Easy",
      category: "greedy",
      blurb: "Can you give correct change to every customer?",
      statement: [
        "Each lemonade costs $5. Customers pay with a `5`, `10`, or `20` bill (in the order given by `bills`) and you must give correct change, starting with no cash. Return `true` if you can serve everyone.",
        "Canonical must-do (AM-600 Greedy family).",
      ],
      examples: [
        { input: "bills = [5,5,5,10,20]", output: "true" },
        { input: "bills = [5,5,10,10,20]", output: "false" },
      ],
      constraints: ["1 <= bills.length <= 10^5", "bills[i] is 5, 10, or 20"],
      fnName: "lemonadeChange",
      starter: `function lemonadeChange(bills) {\n  \n}`,
      solution: `function lemonadeChange(bills) {\n  let five = 0, ten = 0;\n  for (const b of bills) {\n    if (b === 5) five++;\n    else if (b === 10) {\n      if (five === 0) return false;\n      five--; ten++;\n    } else {\n      if (ten > 0 && five > 0) { ten--; five--; }\n      else if (five >= 3) five -= 3;\n      else return false;\n    }\n  }\n  return true;\n}`,
      tests: [
        { args: [[5, 5, 5, 10, 20]], expected: true },
        { args: [[5, 5, 10, 10, 20]], expected: false },
        { args: [[5, 5, 10]], expected: true },
        { args: [[10, 10]], expected: false },
      ],
      approach:
        "Only $5 and $10 bills are ever useful as change (a $20 is never handed back), so just track how many of each you hold. The one **greedy** decision is at a $20: prefer giving a 10 + 5 over three 5s, because $5 bills are the scarce, flexible currency you want to hoard. Failing to conserve fives is the trap. O(n), O(1) space.",
      docAnchor: "greedy",
    },
    {
      slug: "maximum-units-on-a-truck",
      title: "Maximum Units on a Truck",
      difficulty: "Easy",
      category: "greedy",
      blurb: "Fill the truck with the highest-value boxes first.",
      statement: [
        "`boxTypes[i] = [numberOfBoxes, unitsPerBox]`. A truck holds at most `truckSize` boxes. Load boxes to maximize total **units**, and return that maximum.",
        "Canonical must-do (AM-600 Greedy family).",
      ],
      examples: [
        { input: "boxTypes = [[1,3],[2,2],[3,1]], truckSize = 4", output: "8", explanation: "1×3 + 2×2 + 1×1 = 8." },
        { input: "boxTypes = [[5,10],[2,5],[4,7],[3,9]], truckSize = 10", output: "91" },
      ],
      constraints: ["1 <= boxTypes.length <= 1000", "1 <= truckSize <= 10^6"],
      fnName: "maximumUnits",
      starter: `function maximumUnits(boxTypes, truckSize) {\n  \n}`,
      solution: `function maximumUnits(boxTypes, truckSize) {\n  boxTypes.sort((a, b) => b[1] - a[1]);\n  let units = 0, remaining = truckSize;\n  for (const [num, per] of boxTypes) {\n    if (remaining <= 0) break;\n    const take = Math.min(num, remaining);\n    units += take * per;\n    remaining -= take;\n  }\n  return units;\n}`,
      tests: [
        { args: [[[1, 3], [2, 2], [3, 1]], 4], expected: 8 },
        { args: [[[5, 10], [2, 5], [4, 7], [3, 9]], 10], expected: 91 },
        { args: [[[1, 1]], 1], expected: 1 },
      ],
      approach:
        "A fractional-knapsack-style greedy: **sort box types by units-per-box, descending**, and fill the truck from the most valuable down, taking as many of each as fit. Since any box slot is interchangeable, always spending it on the highest available unit value is provably optimal. O(n log n) from the sort.",
      docAnchor: "greedy",
    },
    {
      slug: "can-place-flowers",
      title: "Can Place Flowers",
      difficulty: "Easy",
      category: "greedy",
      blurb: "Can you plant n flowers with no two adjacent?",
      statement: [
        "A `flowerbed` array has `0` for empty plots and `1` for planted ones. Flowers cannot be planted in **adjacent** plots. Return `true` if `n` new flowers can be planted without violating that rule.",
        "Canonical must-do (AM-600 Greedy family).",
      ],
      examples: [
        { input: "flowerbed = [1,0,0,0,1], n = 1", output: "true" },
        { input: "flowerbed = [1,0,0,0,1], n = 2", output: "false" },
      ],
      constraints: ["1 <= flowerbed.length <= 2·10^4", "flowerbed[i] is 0 or 1"],
      fnName: "canPlaceFlowers",
      starter: `function canPlaceFlowers(flowerbed, n) {\n  \n}`,
      solution: `function canPlaceFlowers(flowerbed, n) {\n  let count = 0;\n  const bed = flowerbed.slice();\n  for (let i = 0; i < bed.length; i++) {\n    if (bed[i] === 0 && (i === 0 || bed[i - 1] === 0) && (i === bed.length - 1 || bed[i + 1] === 0)) {\n      bed[i] = 1;\n      count++;\n    }\n  }\n  return count >= n;\n}`,
      tests: [
        { args: [[1, 0, 0, 0, 1], 1], expected: true },
        { args: [[1, 0, 0, 0, 1], 2], expected: false },
        { args: [[0, 0, 1, 0, 0], 1], expected: true },
        { args: [[0], 1], expected: true },
      ],
      approach:
        "Scan left to right and plant **as early as possible** whenever a plot and both neighbours are empty (treating off-the-end as empty). Planting at the earliest legal spot never blocks a placement you could otherwise have made — the exchange argument that makes this greedy optimal. Mutate a copy as you go so later checks see the new flower. O(n).",
      docAnchor: "greedy",
    },
  ],
};
