/**
 * DSA — Dynamic Programming. Overlapping subproblems + optimal substructure:
 * define a state, a recurrence, and base cases; fill a table bottom-up.
 */
import type { DsaCategory } from "../types";

export const dynamicProgramming: DsaCategory = {
  id: "dynamic-programming",
  title: "Dynamic Programming",
  icon: "🧩",
  docAnchor: "dynamic-programming",
  blurb: "State + recurrence + base case: reuse subproblem answers instead of recomputing.",
  problems: [
    {
      slug: "climbing-stairs",
      title: "Climbing Stairs",
      difficulty: "Easy",
      category: "dynamic-programming",
      blurb: "Ways to climb n stairs taking 1 or 2 at a time.",
      statement: [
        "You climb `n` stairs, 1 or 2 steps at a time. Return the number of distinct ways to reach the top.",
      ],
      examples: [
        { input: "n = 2", output: "2", explanation: "1+1, or 2." },
        { input: "n = 3", output: "3" },
      ],
      constraints: ["1 <= n <= 45"],
      fnName: "climbStairs",
      starter: "function climbStairs(n) {\n  \n}",
      solution:
        "function climbStairs(n) {\n  let a = 1, b = 1;\n  for (let i = 0; i < n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return a;\n}",
      tests: [
        { args: [2], expected: 2 },
        { args: [3], expected: 3 },
        { args: [5], expected: 8 },
        { args: [1], expected: 1 },
      ],
      approach:
        "Ways to reach step n = ways to reach n−1 (then a 1-step) + ways to reach n−2 (then a 2-step) — it's the Fibonacci recurrence. Only the last two values matter, so two rolling variables give O(n) time, O(1) space. This is the 'hello world' of DP: spot the recurrence, then realize you don't need the whole table.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "min-cost-climbing-stairs",
      title: "Min Cost Climbing Stairs",
      difficulty: "Easy",
      category: "dynamic-programming",
      blurb: "Cheapest way to the top paying per step.",
      statement: [
        "`cost[i]` is the price to step off stair i (then move 1 or 2 stairs up). You may start at index 0 or 1. Return the minimum cost to reach the top (just past the last stair).",
      ],
      examples: [
        { input: "cost = [10,15,20]", output: "15", explanation: "Start at index 1, pay 15, step two to the top." },
        { input: "cost = [1,100,1,1,1,100,1,1,100,1]", output: "6" },
      ],
      constraints: ["2 <= cost.length <= 1000"],
      fnName: "minCostClimbingStairs",
      starter: "function minCostClimbingStairs(cost) {\n  \n}",
      solution:
        "function minCostClimbingStairs(cost) {\n  let a = 0, b = 0;\n  for (let i = 2; i <= cost.length; i++) {\n    const cur = Math.min(b + cost[i - 1], a + cost[i - 2]);\n    a = b;\n    b = cur;\n  }\n  return b;\n}",
      tests: [
        { args: [[10, 15, 20]], expected: 15 },
        { args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expected: 6 },
        { args: [[0, 0, 0, 0]], expected: 0 },
        { args: [[1, 2]], expected: 1 },
      ],
      approach:
        "Let dp[i] be the min cost to REACH stair i. You arrive either from i−1 (paying cost[i−1]) or i−2 (paying cost[i−2]), so dp[i] = min of those. The top is dp[length], and the free start means dp[0] = dp[1] = 0. Two rolling variables → O(n)/O(1). Same shape as Climbing Stairs, now minimizing a cost instead of counting paths.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "house-robber",
      title: "House Robber",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Max loot without robbing two adjacent houses.",
      statement: [
        "Given `nums` (money in each house along a street), return the maximum you can rob without ever taking two adjacent houses.",
      ],
      examples: [
        { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob houses 0 and 2." },
        { input: "nums = [2,7,9,3,1]", output: "12" },
      ],
      constraints: ["1 <= nums.length <= 100"],
      fnName: "rob",
      starter: "function rob(nums) {\n  \n}",
      solution:
        "function rob(nums) {\n  let prev = 0, cur = 0;\n  for (const n of nums) {\n    const take = Math.max(cur, prev + n);\n    prev = cur;\n    cur = take;\n  }\n  return cur;\n}",
      tests: [
        { args: [[1, 2, 3, 1]], expected: 4 },
        { args: [[2, 7, 9, 3, 1]], expected: 12 },
        { args: [[2, 1, 1, 2]], expected: 4 },
        { args: [[5]], expected: 5 },
      ],
      approach:
        "At each house choose: skip it (keep the best-so-far `cur`), or rob it (add its money to the best up to two houses back, `prev`). dp[i] = max(dp[i−1], dp[i−2] + nums[i]). Two rolling variables capture dp[i−1] and dp[i−2] → O(n)/O(1). The 'take it or leave it, carry the constraint' framing is the template for a whole family (House Robber II, delete-and-earn).",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "house-robber-ii",
      title: "House Robber II",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "House Robber, but the street is a circle.",
      statement: [
        "The houses are arranged in a CIRCLE, so the first and last are adjacent. Return the max you can rob without taking two adjacent houses.",
      ],
      examples: [
        { input: "nums = [2,3,2]", output: "3", explanation: "Can't rob both ends; take house 1." },
        { input: "nums = [1,2,3,1]", output: "4" },
      ],
      constraints: ["1 <= nums.length <= 100"],
      fnName: "robII",
      starter: "function robII(nums) {\n  \n}",
      solution:
        "function robII(nums) {\n  if (nums.length === 1) return nums[0];\n  const line = (arr) => {\n    let prev = 0, cur = 0;\n    for (const n of arr) {\n      const take = Math.max(cur, prev + n);\n      prev = cur;\n      cur = take;\n    }\n    return cur;\n  };\n  return Math.max(line(nums.slice(1)), line(nums.slice(0, -1)));\n}",
      tests: [
        { args: [[2, 3, 2]], expected: 3 },
        { args: [[1, 2, 3, 1]], expected: 4 },
        { args: [[1, 2, 3]], expected: 3 },
        { args: [[0]], expected: 0 },
      ],
      approach:
        "The circle adds one constraint: houses 0 and n−1 can't both be robbed. So the answer is the better of two linear House-Robber runs — one that excludes the first house, one that excludes the last — since at least one end must be skipped. Reusing the solved linear subproblem is the whole trick. O(n). Reducing a new problem to one you've already cracked is a DP superpower.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "coin-change",
      title: "Coin Change",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Fewest coins to make an amount.",
      statement: [
        "Given coin denominations `coins` (unlimited supply) and an `amount`, return the fewest coins that sum to it, or -1 if impossible.",
      ],
      examples: [
        { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "5 + 5 + 1." },
        { input: "coins = [2], amount = 3", output: "-1" },
      ],
      constraints: ["1 <= coins.length <= 12", "0 <= amount <= 10^4"],
      fnName: "coinChange",
      starter: "function coinChange(coins, amount) {\n  \n}",
      solution:
        "function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let a = 1; a <= amount; a++) {\n    for (const c of coins) {\n      if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}",
      tests: [
        { args: [[1, 2, 5], 11], expected: 3 },
        { args: [[2], 3], expected: -1 },
        { args: [[1], 0], expected: 0 },
        { args: [[2, 5, 10, 1], 27], expected: 4 },
      ],
      approach:
        "dp[a] = fewest coins to make amount a. For each amount, try every coin c ≤ a and take 1 + dp[a−c]; the base case dp[0] = 0. Unreachable amounts stay at Infinity → −1. O(amount · coins). Greedy (always take the biggest coin) fails on denominations like [1,3,4] making 6, which is exactly why this needs DP.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "longest-increasing-subsequence",
      title: "Longest Increasing Subsequence",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Length of the longest strictly increasing subsequence.",
      statement: [
        "Given `nums`, return the length of the longest strictly increasing subsequence (elements need not be contiguous).",
      ],
      examples: [
        { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", explanation: "[2,3,7,101]." },
        { input: "nums = [0,1,0,3,2,3]", output: "4" },
      ],
      constraints: ["1 <= nums.length <= 2500"],
      fnName: "lengthOfLIS",
      starter: "function lengthOfLIS(nums) {\n  \n}",
      solution:
        "function lengthOfLIS(nums) {\n  const tails = [];\n  for (const n of nums) {\n    let l = 0, r = tails.length;\n    while (l < r) {\n      const m = (l + r) >> 1;\n      if (tails[m] < n) l = m + 1;\n      else r = m;\n    }\n    tails[l] = n;\n  }\n  return tails.length;\n}",
      tests: [
        { args: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
        { args: [[0, 1, 0, 3, 2, 3]], expected: 4 },
        { args: [[7, 7, 7, 7]], expected: 1 },
        { args: [[1, 3, 6, 7, 9, 4, 10, 5, 6]], expected: 6 },
      ],
      approach:
        "The O(n²) DP is dp[i] = 1 + max(dp[j]) over j < i with nums[j] < nums[i]. The slick O(n log n) version keeps `tails`, where tails[k] is the smallest possible tail of an increasing subsequence of length k+1; binary-search each number into place. The length of `tails` is the answer. A great example of patience sorting sharpening a quadratic DP.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "word-break",
      title: "Word Break",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Can s be segmented into dictionary words?",
      statement: [
        "Given a string `s` and a dictionary `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words (each word reusable).",
      ],
      examples: [
        { input: 's = "leetcode", wordDict = ["leet","code"]', output: "true" },
        { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: "false" },
      ],
      constraints: ["1 <= s.length <= 300"],
      fnName: "wordBreak",
      starter: "function wordBreak(s, wordDict) {\n  \n}",
      solution:
        "function wordBreak(s, wordDict) {\n  const words = new Set(wordDict);\n  const dp = new Array(s.length + 1).fill(false);\n  dp[0] = true;\n  for (let i = 1; i <= s.length; i++) {\n    for (let j = 0; j < i; j++) {\n      if (dp[j] && words.has(s.slice(j, i))) {\n        dp[i] = true;\n        break;\n      }\n    }\n  }\n  return dp[s.length];\n}",
      tests: [
        { args: ["leetcode", ["leet", "code"]], expected: true },
        { args: ["applepenapple", ["apple", "pen"]], expected: true },
        { args: ["catsandog", ["cats", "dog", "sand", "and", "cat"]], expected: false },
        { args: ["a", ["a"]], expected: true },
      ],
      approach:
        "dp[i] = 'can the first i characters be segmented?'. It's true if some split point j has dp[j] true AND the chunk s[j..i) is a dictionary word. dp[0] = true (empty string). O(n²) substrings × set lookup. The insight is choosing the state as a prefix boundary — the same 1-D 'is this prefix reachable?' idea as Coin Change.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "longest-common-subsequence",
      title: "Longest Common Subsequence",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Length of the longest subsequence common to two strings.",
      statement: [
        "Given two strings `text1` and `text2`, return the length of their longest common subsequence (characters in order, not necessarily contiguous). Return 0 if there is none.",
      ],
      examples: [
        { input: 'text1 = "abcde", text2 = "ace"', output: "3", explanation: '"ace".' },
        { input: 'text1 = "abc", text2 = "def"', output: "0" },
      ],
      constraints: ["1 <= text1.length, text2.length <= 1000"],
      fnName: "longestCommonSubsequence",
      starter: "function longestCommonSubsequence(text1, text2) {\n  \n}",
      solution:
        "function longestCommonSubsequence(text1, text2) {\n  const m = text1.length, n = text2.length;\n  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (text1[i - 1] === text2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;\n      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n    }\n  }\n  return dp[m][n];\n}",
      tests: [
        { args: ["abcde", "ace"], expected: 3 },
        { args: ["abc", "abc"], expected: 3 },
        { args: ["abc", "def"], expected: 0 },
        { args: ["bsbininm", "jmjkbkjkv"], expected: 1 },
      ],
      approach:
        "The classic 2-D grid DP: dp[i][j] is the LCS of the first i chars of text1 and first j of text2. If the current characters match, extend the diagonal (dp[i−1][j−1] + 1); otherwise take the best of dropping one character from either string (max of left/up). O(m·n). This grid is the parent pattern for edit distance, string alignment, and diffing.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "unique-paths",
      title: "Unique Paths",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Grid routes moving only right and down — 2D DP's hello world.",
      statement: [
        "A robot starts at the top-left of an `m × n` grid and moves only RIGHT or DOWN. Return the number of distinct paths to the bottom-right corner.",
      ],
      examples: [
        { input: "m = 3, n = 7", output: "28" },
        { input: "m = 3, n = 2", output: "3" },
      ],
      constraints: ["1 <= m, n <= 100"],
      fnName: "uniquePaths",
      starter: "function uniquePaths(m, n) {\n  \n}",
      solution:
        "function uniquePaths(m, n) {\n  let row = new Array(n).fill(1);\n  for (let r = 1; r < m; r++) {\n    for (let c = 1; c < n; c++) {\n      row[c] += row[c - 1];\n    }\n  }\n  return row[n - 1];\n}",
      tests: [
        { args: [3, 7], expected: 28 },
        { args: [3, 2], expected: 3 },
        { args: [1, 1], expected: 1 },
        { args: [10, 10], expected: 48620 },
      ],
      approach:
        "The cleanest 2D counting DP: paths(r, c) = paths(from above) + paths(from the left), because the last step came from exactly one of those — mutually exclusive cases ADD, the marker of counting DPs (optimization DPs take min/max instead). Edges are all 1 (one straight path). The solution shows the standard space squeeze: keep ONE row, where row[c] pre-update holds 'from above' and row[c−1] post-update holds 'from the left' — O(n) memory. Closing the loop: the answer is also C(m+n−2, m−1) — DP tables sometimes hide closed forms; this one's a nice sanity-check on your combinatorics.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "edit-distance",
      title: "Edit Distance",
      difficulty: "Hard",
      category: "dynamic-programming",
      blurb: "Fewest insert/delete/replace ops turning one word into another.",
      statement: [
        "Return the minimum number of operations (insert a character, delete a character, replace a character) to convert `word1` into `word2`.",
      ],
      examples: [
        { input: "word1 = \"horse\", word2 = \"ros\"", output: "3", explanation: "horse → rorse → rose → ros." },
        { input: "word1 = \"intention\", word2 = \"execution\"", output: "5" },
      ],
      constraints: ["0 <= lengths <= 500"],
      fnName: "minDistance",
      starter: "function minDistance(word1, word2) {\n  \n}",
      solution:
        "function minDistance(word1, word2) {\n  const m = word1.length;\n  const n = word2.length;\n  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n  for (let i = 0; i <= m; i++) dp[i][0] = i;\n  for (let j = 0; j <= n; j++) dp[0][j] = j;\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (word1[i - 1] === word2[j - 1]) {\n        dp[i][j] = dp[i - 1][j - 1];\n      } else {\n        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);\n      }\n    }\n  }\n  return dp[m][n];\n}",
      tests: [
        { args: ["horse", "ros"], expected: 3 },
        { args: ["intention", "execution"], expected: 5 },
        { args: ["", "abc"], expected: 3 },
        { args: ["abc", "abc"], expected: 0 },
      ],
      approach:
        "Levenshtein distance — the summit of two-string DP. State: dp[i][j] = cost of converting the first i chars of word1 into the first j of word2. Matching last characters cost nothing (shrink both); otherwise pay 1 and take the best of the three ops, each mapping to a neighbour cell: replace = diagonal, delete = up, insert = left. Base row/column encode 'convert to/from empty' = pure inserts/deletes. It's LCS's recurrence with min instead of max plus a third arm — put the two side by side and two-string DP stops being a family of tricks and becomes ONE idea: walk both suffixes, decide about the last characters. Powers diff tools, spellcheck, and DNA alignment verbatim.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "0-1-knapsack",
      title: "0/1 Knapsack",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Max value of items that fit in the capacity.",
      statement: [
        "Given item `weights` and `values` (same length) and a knapsack `capacity`, choose a subset of items whose total weight is ≤ capacity to **maximize total value**. Each item may be taken at most once (0 or 1). Return the maximum value.",
        "From *interactive-coding-challenges* (Recursion & DP: maximize items placed in a knapsack).",
      ],
      examples: [
        { input: "weights = [1,3,4,5], values = [1,4,5,7], capacity = 7", output: "9", explanation: "Take items of weight 3 and 4 → value 4 + 5 = 9." },
        { input: "weights = [2,3,4], values = [3,4,5], capacity = 5", output: "7" },
      ],
      constraints: ["1 <= weights.length <= 100", "0 <= capacity <= 10^4"],
      fnName: "knapsack",
      starter: `function knapsack(weights, values, capacity) {\n  \n}`,
      solution: `function knapsack(weights, values, capacity) {\n  const dp = new Array(capacity + 1).fill(0);\n  for (let i = 0; i < weights.length; i++) {\n    for (let c = capacity; c >= weights[i]; c--) {\n      dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);\n    }\n  }\n  return dp[capacity];\n}`,
      tests: [
        { args: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
        { args: [[2, 3, 4], [3, 4, 5], 5], expected: 7 },
        { args: [[1, 2], [10, 20], 0], expected: 0 },
        { args: [[6], [10], 5], expected: 0 },
      ],
      approach:
        "`dp[c]` = the best value achievable with capacity `c`. For each item, decide take-it-or-leave-it: `dp[c] = max(leave = dp[c], take = dp[c - weight] + value)`. The subtle-but-crucial detail: iterate capacity **downward** so each item is used at most **once** (an upward loop would let you reuse it — that's the *unbounded* knapsack / coin-change variant). O(n · capacity) time, O(capacity) space. 'For each item, take or skip' is the DP shape behind subset-sum, partition, and coin problems.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "coin-change-ii",
      title: "Coin Change II (count combinations)",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "How many distinct ways to make the amount?",
      statement: [
        "Given coin denominations `coins` (unlimited supply of each) and a target `amount`, return the **number of distinct combinations** that sum to the amount. Order doesn't matter — `1+2` and `2+1` count once. Return 0 if it can't be made.",
        "From *interactive-coding-challenges* (Recursion & DP: unique number of ways to represent n cents).",
      ],
      examples: [
        { input: "amount = 5, coins = [1,2,5]", output: "4", explanation: "5; 2+2+1; 2+1+1+1; 1+1+1+1+1." },
        { input: "amount = 3, coins = [2]", output: "0" },
      ],
      constraints: ["0 <= amount <= 5000", "1 <= coins.length <= 300", "coin values are distinct"],
      fnName: "change",
      starter: `function change(amount, coins) {\n  \n}`,
      solution: `function change(amount, coins) {\n  const dp = new Array(amount + 1).fill(0);\n  dp[0] = 1;\n  for (const coin of coins) {\n    for (let a = coin; a <= amount; a++) {\n      dp[a] += dp[a - coin];\n    }\n  }\n  return dp[amount];\n}`,
      tests: [
        { args: [5, [1, 2, 5]], expected: 4 },
        { args: [3, [2]], expected: 0 },
        { args: [10, [10]], expected: 1 },
        { args: [0, [7]], expected: 1 },
      ],
      approach:
        "`dp[a]` = number of ways to make amount `a`. The order of the two loops is everything: looping **coins on the outside, amount inside** counts each *combination* once (you commit to using coin values in a fixed order, so you never recount 1+2 vs 2+1). Swapping the loops would count *permutations* instead. `dp[0] = 1` is the empty combination. This 'outer loop over items = combinations, inner = permutations' rule is the classic coin-change gotcha.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "partition-equal-subset-sum",
      title: "Partition Equal Subset Sum",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Can the array split into two equal-sum halves?",
      statement: [
        "Given an array `nums` of positive integers, return `true` if it can be partitioned into two subsets with **equal sum**.",
        "Canonical must-do (AM-600 DP family). A 0/1-knapsack / subset-sum problem.",
      ],
      examples: [
        { input: "nums = [1,5,11,5]", output: "true", explanation: "[1,5,5] and [11]." },
        { input: "nums = [1,2,3,5]", output: "false" },
      ],
      constraints: ["1 <= nums.length <= 200", "1 <= nums[i] <= 100"],
      fnName: "canPartition",
      starter: `function canPartition(nums) {\n  \n}`,
      solution: `function canPartition(nums) {\n  const total = nums.reduce((a, b) => a + b, 0);\n  if (total % 2 !== 0) return false;\n  const target = total / 2;\n  const dp = new Array(target + 1).fill(false);\n  dp[0] = true;\n  for (const num of nums) {\n    for (let j = target; j >= num; j--) {\n      if (dp[j - num]) dp[j] = true;\n    }\n  }\n  return dp[target];\n}`,
      tests: [
        { args: [[1, 5, 11, 5]], expected: true },
        { args: [[1, 2, 3, 5]], expected: false },
        { args: [[1, 1]], expected: true },
        { args: [[2, 2, 3, 5]], expected: false },
      ],
      approach:
        "Two equal halves means one subset sums to `total/2` — so if the total is odd, it's instantly false, and otherwise it's **subset-sum**: can any subset reach `target = total/2`? `dp[j]` = 'some subset sums to j'; for each number, update `j` from high to low (the 0/1-knapsack direction, so each number is used once). O(n · target). Recognising 'partition' as disguised subset-sum is the whole leap.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "decode-ways",
      title: "Decode Ways",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "How many ways to decode a digit string (1→A..26→Z)?",
      statement: [
        "A message of digits is encoded with A=1 … Z=26. Given a digit string `s`, return the number of ways to decode it. A leading `0`, or any `0` that can't pair into 10/20, contributes no valid decoding.",
        "Canonical must-do (AM-600 DP family).",
      ],
      examples: [
        { input: 's = "12"', output: "2", explanation: '"AB" (1 2) or "L" (12).' },
        { input: 's = "226"', output: "3", explanation: '"BZ", "VF", "BBF".' },
        { input: 's = "06"', output: "0" },
      ],
      constraints: ["1 <= s.length <= 100", "s contains only digits"],
      fnName: "numDecodings",
      starter: `function numDecodings(s) {\n  \n}`,
      solution: `function numDecodings(s) {\n  if (s.length === 0 || s[0] === "0") return 0;\n  const n = s.length;\n  let prev2 = 1, prev1 = 1;\n  for (let i = 1; i < n; i++) {\n    let cur = 0;\n    if (s[i] !== "0") cur += prev1;\n    const two = Number(s[i - 1] + s[i]);\n    if (two >= 10 && two <= 26) cur += prev2;\n    prev2 = prev1;\n    prev1 = cur;\n  }\n  return prev1;\n}`,
      tests: [
        { args: ["12"], expected: 2 },
        { args: ["226"], expected: 3 },
        { args: ["06"], expected: 0 },
        { args: ["10"], expected: 1 },
        { args: ["0"], expected: 0 },
      ],
      approach:
        "A 1-D DP like a constrained Fibonacci: `ways(i)` = ways to decode the prefix ending at `i`. Add `ways(i-1)` if the current digit alone is valid (not '0'), and add `ways(i-2)` if the last two digits form 10–26. Zeros are the trap — a '0' must pair into exactly 10 or 20 or the whole string is undecodable. Only the last two values are needed → O(n) time, O(1) space.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "maximum-product-subarray",
      title: "Maximum Product Subarray",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Largest product of a contiguous subarray (with negatives).",
      statement: [
        "Given an integer array `nums`, find a contiguous non-empty subarray with the **largest product**, and return that product.",
        "Canonical must-do (AM-600 DP / Arrays family).",
      ],
      examples: [
        { input: "nums = [2,3,-2,4]", output: "6", explanation: "[2,3] → 6." },
        { input: "nums = [-2,3,-4]", output: "24", explanation: "[-2,3,-4] → 24." },
      ],
      constraints: ["1 <= nums.length <= 2·10^4", "-10 <= nums[i] <= 10"],
      fnName: "maxProduct",
      starter: `function maxProduct(nums) {\n  \n}`,
      solution: `function maxProduct(nums) {\n  let best = nums[0], curMax = nums[0], curMin = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    const x = nums[i];\n    const a = curMax * x, b = curMin * x;\n    curMax = Math.max(x, a, b);\n    curMin = Math.min(x, a, b);\n    best = Math.max(best, curMax);\n  }\n  return best;\n}`,
      tests: [
        { args: [[2, 3, -2, 4]], expected: 6 },
        { args: [[-2, 0, -1]], expected: 0 },
        { args: [[-2, 3, -4]], expected: 24 },
        { args: [[-2]], expected: -2 },
      ],
      approach:
        "Unlike max-*sum* subarray (Kadane), products flip sign: a big **negative** times another negative becomes the new maximum. So track BOTH the running max and running min product ending here — each step, the new max/min is the best/worst of `x`, `curMax·x`, `curMin·x`. A zero resets both (via the `x` option). O(n), O(1) space. 'Carry the min because negatives invert' is the key insight.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "minimum-path-sum",
      title: "Minimum Path Sum",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Cheapest top-left → bottom-right path in a grid.",
      statement: [
        "Given an `m × n` grid of non-negative numbers, find a path from top-left to bottom-right that **minimizes the sum** of the numbers along it. You may only move right or down. Return that minimum sum.",
        "Canonical must-do (AM-600 DP family).",
      ],
      examples: [
        { input: "grid = [[1,3,1],[1,5,1],[4,2,1]]", output: "7", explanation: "1→3→1→1→1." },
        { input: "grid = [[1,2,3],[4,5,6]]", output: "12" },
      ],
      constraints: ["1 <= m, n <= 200", "0 <= grid[i][j] <= 200"],
      fnName: "minPathSum",
      starter: `function minPathSum(grid) {\n  \n}`,
      solution: `function minPathSum(grid) {\n  const m = grid.length, n = grid[0].length;\n  const dp = grid[0].slice();\n  for (let j = 1; j < n; j++) dp[j] = dp[j - 1] + grid[0][j];\n  for (let i = 1; i < m; i++) {\n    dp[0] += grid[i][0];\n    for (let j = 1; j < n; j++) {\n      dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j];\n    }\n  }\n  return dp[n - 1];\n}`,
      tests: [
        { args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expected: 7 },
        { args: [[[1, 2, 3], [4, 5, 6]]], expected: 12 },
        { args: [[[5]]], expected: 5 },
        { args: [[[1, 2], [1, 1]]], expected: 3 },
      ],
      approach:
        "Since you can only arrive at a cell from **above or the left**, the cheapest way to reach it is `grid[i][j] + min(from above, from left)`. Fill row by row. Rolling a single 1-D array works because `dp[j]` still holds the row above when you read it, and `dp[j-1]` already holds this row's left neighbour — O(n) space instead of O(m·n). O(m·n) time.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "unique-paths-ii",
      title: "Unique Paths II (with obstacles)",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Count grid paths when some cells are blocked.",
      statement: [
        "A robot starts at the top-left of an `m × n` grid and wants to reach the bottom-right, moving only right or down. Cells marked `1` are **obstacles** (impassable), `0` is free. Return the number of distinct paths.",
        "Canonical must-do (AM-600 DP family).",
      ],
      examples: [
        { input: "grid = [[0,0,0],[0,1,0],[0,0,0]]", output: "2" },
        { input: "grid = [[0,1],[0,0]]", output: "1" },
      ],
      constraints: ["1 <= m, n <= 100", "grid[i][j] is 0 or 1"],
      fnName: "uniquePathsWithObstacles",
      starter: `function uniquePathsWithObstacles(grid) {\n  \n}`,
      solution: `function uniquePathsWithObstacles(grid) {\n  const m = grid.length, n = grid[0].length;\n  const dp = new Array(n).fill(0);\n  dp[0] = grid[0][0] === 1 ? 0 : 1;\n  for (let i = 0; i < m; i++) {\n    for (let j = 0; j < n; j++) {\n      if (grid[i][j] === 1) dp[j] = 0;\n      else if (j > 0) dp[j] += dp[j - 1];\n    }\n  }\n  return dp[n - 1];\n}`,
      tests: [
        { args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 2 },
        { args: [[[0, 1], [0, 0]]], expected: 1 },
        { args: [[[1]]], expected: 0 },
        { args: [[[0, 0], [0, 0]]], expected: 2 },
      ],
      approach:
        "Same recurrence as Unique Paths — `ways[i][j] = ways(above) + ways(left)` — with one extra rule: an **obstacle sets its cell to 0** (no path can pass through it), which naturally propagates the blockage rightward and downward. Rolling one row gives O(n) space. Watch the start cell being an obstacle (answer 0). O(m·n).",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "target-sum",
      title: "Target Sum",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Ways to assign + / − to reach the target.",
      statement: [
        "Given an array `nums` and an integer `target`, put a `+` or `−` in front of each number so the resulting expression equals `target`. Return the **number of ways** to do it.",
        "Canonical must-do (AM-600 DP family).",
      ],
      examples: [
        { input: "nums = [1,1,1,1,1], target = 3", output: "5" },
        { input: "nums = [1], target = 1", output: "1" },
      ],
      constraints: ["1 <= nums.length <= 20", "0 <= nums[i] <= 1000"],
      fnName: "findTargetSumWays",
      starter: `function findTargetSumWays(nums, target) {\n  \n}`,
      solution: `function findTargetSumWays(nums, target) {\n  const total = nums.reduce((a, b) => a + b, 0);\n  if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;\n  const s = (total + target) / 2;\n  const dp = new Array(s + 1).fill(0);\n  dp[0] = 1;\n  for (const num of nums) {\n    for (let j = s; j >= num; j--) dp[j] += dp[j - num];\n  }\n  return dp[s];\n}`,
      tests: [
        { args: [[1, 1, 1, 1, 1], 3], expected: 5 },
        { args: [[1], 1], expected: 1 },
        { args: [[1], 2], expected: 0 },
        { args: [[0, 0, 0, 0, 0, 0, 0, 0, 1], 1], expected: 256 },
      ],
      approach:
        "Rewrite the problem algebraically: let `P` be the numbers you make positive and `N` the negatives. Then `P − N = target` and `P + N = total`, so `P = (total + target) / 2`. The question becomes **'how many subsets sum to P?'** — a counting subset-sum DP (`dp[j] += dp[j-num]`, iterating j downward so each number is used once). Bail early when the target is unreachable or the parity is wrong. O(n · P). Turning ± assignment into subset-sum is the whole insight.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "maximal-square",
      title: "Maximal Square",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Area of the largest all-1s square in a matrix.",
      statement: [
        "Given a binary `matrix` of `0`s and `1`s, find the largest **square** containing only 1s and return its **area**.",
        "Canonical must-do (AM-600 DP family).",
      ],
      examples: [
        { input: "matrix = [[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]]", output: "4" },
        { input: "matrix = [[0,1],[1,0]]", output: "1" },
      ],
      constraints: ["1 <= rows, cols <= 300", "matrix[i][j] is 0 or 1"],
      fnName: "maximalSquare",
      starter: `function maximalSquare(matrix) {\n  \n}`,
      solution: `function maximalSquare(matrix) {\n  const m = matrix.length, n = matrix[0].length;\n  const dp = new Array(n + 1).fill(0);\n  let best = 0, prev = 0;\n  for (let i = 1; i <= m; i++) {\n    prev = 0;\n    for (let j = 1; j <= n; j++) {\n      const temp = dp[j];\n      if (matrix[i - 1][j - 1] === 1) {\n        dp[j] = Math.min(dp[j], dp[j - 1], prev) + 1;\n        best = Math.max(best, dp[j]);\n      } else dp[j] = 0;\n      prev = temp;\n    }\n  }\n  return best * best;\n}`,
      tests: [
        { args: [[[1, 0, 1, 0, 0], [1, 0, 1, 1, 1], [1, 1, 1, 1, 1], [1, 0, 0, 1, 0]]], expected: 4 },
        { args: [[[0, 1], [1, 0]]], expected: 1 },
        { args: [[[0]]], expected: 0 },
        { args: [[[1, 1], [1, 1]]], expected: 4 },
      ],
      approach:
        "Let `dp[i][j]` = the side length of the largest all-1s square whose **bottom-right corner** is at (i,j). If the cell is 1, that square is limited by its three neighbours: `min(above, left, diagonal) + 1` — all three must support it. Track the best side and square it at the end. Rolling one row (with a `prev` variable holding the diagonal) gives O(n) space, O(m·n) time. Anchoring the state at a corner is the move that makes squares tractable.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "longest-palindromic-substring",
      title: "Longest Palindromic Substring",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Longest contiguous palindrome (leftmost if tied).",
      statement: [
        "Given a string `s`, return the **longest palindromic substring**. If several have the same maximum length, return the **leftmost** one.",
        "Canonical must-do (AM-600 DP / Strings family).",
      ],
      examples: [
        { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also length 3, but "bab" starts earlier.' },
        { input: 's = "cbbd"', output: '"bb"' },
      ],
      constraints: ["1 <= s.length <= 1000"],
      fnName: "longestPalindromicSubstring",
      starter: `function longestPalindromicSubstring(s) {\n  \n}`,
      solution: `function longestPalindromicSubstring(s) {\n  if (s.length === 0) return "";\n  let start = 0, maxLen = 1;\n  function expand(l, r) {\n    while (l >= 0 && r < s.length && s[l] === s[r]) { l--; r++; }\n    const len = r - l - 1;\n    if (len > maxLen) { maxLen = len; start = l + 1; }\n  }\n  for (let i = 0; i < s.length; i++) {\n    expand(i, i);\n    expand(i, i + 1);\n  }\n  return s.slice(start, start + maxLen);\n}`,
      tests: [
        { args: ["babad"], expected: "bab" },
        { args: ["cbbd"], expected: "bb" },
        { args: ["a"], expected: "a" },
        { args: ["ac"], expected: "a" },
      ],
      approach:
        "**Expand around centre.** Every palindrome has a centre, and there are `2n-1` of them — n single characters (odd lengths) plus n-1 gaps between characters (even lengths). Grow outward from each while the ends match, and keep the longest. O(n²) time, **O(1) space** — beating the O(n²)-space DP table. Using strict `>` when updating keeps the *leftmost* winner on ties. (Manacher's algorithm does it in O(n) — name-drop it, don't code it.)",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "best-time-to-buy-and-sell-stock-with-cooldown",
      title: "Best Time to Buy and Sell Stock with Cooldown",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Unlimited trades, but one rest day after selling.",
      statement: [
        "Given daily `prices`, maximize profit with unlimited transactions, except: after you **sell**, you must wait one day (cooldown) before buying again. You may hold at most one share.",
        "Canonical must-do (AM-600 DP family).",
      ],
      examples: [
        { input: "prices = [1,2,3,0,2]", output: "3", explanation: "buy 1, sell 2, cooldown, buy 0, sell 2." },
        { input: "prices = [1]", output: "0" },
      ],
      constraints: ["1 <= prices.length <= 5000"],
      fnName: "maxProfitCooldown",
      starter: `function maxProfitCooldown(prices) {\n  \n}`,
      solution: `function maxProfitCooldown(prices) {\n  let hold = -Infinity, sold = 0, rest = 0;\n  for (const p of prices) {\n    const prevSold = sold;\n    sold = hold + p;\n    hold = Math.max(hold, rest - p);\n    rest = Math.max(rest, prevSold);\n  }\n  return Math.max(sold, rest);\n}`,
      tests: [
        { args: [[1, 2, 3, 0, 2]], expected: 3 },
        { args: [[1]], expected: 0 },
        { args: [[2, 1]], expected: 0 },
        { args: [[1, 2, 4]], expected: 3 },
      ],
      approach:
        "A **state machine** DP with three states per day: `hold` (own a share), `sold` (just sold today — tomorrow is cooldown), and `rest` (own nothing, free to buy). The transitions write themselves: you can only buy from `rest` (`rest - p`), selling moves `hold → sold` (`hold + p`), and `rest` absorbs yesterday's `sold`. Keeping only the previous day's values gives O(n) time, O(1) space. Naming the states is 90% of solving cooldown/fee stock variants.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "integer-break",
      title: "Integer Break",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Split n into ≥2 parts with the largest product.",
      statement: [
        "Given an integer `n`, break it into the sum of **at least two** positive integers and maximize the product of those integers. Return that maximum product.",
        "Canonical must-do (AM-600 DP family).",
      ],
      examples: [
        { input: "n = 2", output: "1", explanation: "2 = 1 + 1." },
        { input: "n = 10", output: "36", explanation: "10 = 3 + 3 + 4." },
      ],
      constraints: ["2 <= n <= 58"],
      fnName: "integerBreak",
      starter: `function integerBreak(n) {\n  \n}`,
      solution: `function integerBreak(n) {\n  const dp = new Array(n + 1).fill(0);\n  dp[1] = 1;\n  for (let i = 2; i <= n; i++) {\n    for (let j = 1; j < i; j++) {\n      dp[i] = Math.max(dp[i], j * (i - j), j * dp[i - j]);\n    }\n  }\n  return dp[n];\n}`,
      tests: [
        { args: [2], expected: 1 },
        { args: [10], expected: 36 },
        { args: [3], expected: 2 },
        { args: [4], expected: 4 },
      ],
      approach:
        "For each `i`, try every first piece `j` and take the best of **stopping there** (`j * (i-j)`, exactly two parts) or **breaking the rest further** (`j * dp[i-j]`). Both options are needed — that's the classic bug. O(n²). The mathematical shortcut worth knowing: the optimum uses as many **3s** as possible (with a 4 = 2+2 left over when the remainder is 1), because 3 maximizes the per-unit product.",
      docAnchor: "dynamic-programming",
    },
    {
      slug: "minimum-falling-path-sum",
      title: "Minimum Falling Path Sum",
      difficulty: "Medium",
      category: "dynamic-programming",
      blurb: "Cheapest top-to-bottom path with diagonal steps.",
      statement: [
        "Given an `n × n` matrix, a **falling path** starts at any cell in the first row and moves down, each step going to the cell directly below or diagonally below-left/below-right. Return the minimum sum of any falling path.",
        "Canonical must-do (AM-600 DP family).",
      ],
      examples: [
        { input: "matrix = [[2,1,3],[6,5,4],[7,8,9]]", output: "13", explanation: "1 → 4 → 8." },
        { input: "matrix = [[-19,57],[-40,-5]]", output: "-59" },
      ],
      constraints: ["1 <= n <= 100", "-100 <= matrix[i][j] <= 100"],
      fnName: "minFallingPathSum",
      starter: `function minFallingPathSum(matrix) {\n  \n}`,
      solution: `function minFallingPathSum(matrix) {\n  const n = matrix.length;\n  let prev = matrix[0].slice();\n  for (let i = 1; i < n; i++) {\n    const cur = new Array(n);\n    for (let j = 0; j < n; j++) {\n      let best = prev[j];\n      if (j > 0) best = Math.min(best, prev[j - 1]);\n      if (j < n - 1) best = Math.min(best, prev[j + 1]);\n      cur[j] = matrix[i][j] + best;\n    }\n    prev = cur;\n  }\n  return Math.min(...prev);\n}`,
      tests: [
        { args: [[[2, 1, 3], [6, 5, 4], [7, 8, 9]]], expected: 13 },
        { args: [[[-19, 57], [-40, -5]]], expected: -59 },
        { args: [[[7]]], expected: 7 },
      ],
      approach:
        "Row-by-row DP: the cheapest way to land on cell `(i,j)` is its own value plus the best of the **three** cells above it (`j-1`, `j`, `j+1`, clamped at the edges). Sweep downward keeping only the previous row, then take the minimum of the last row — the path can end anywhere. O(n²) time, O(n) space. The edge clamping is where off-by-one bugs live.",
      docAnchor: "dynamic-programming",
    },
  ],
};
