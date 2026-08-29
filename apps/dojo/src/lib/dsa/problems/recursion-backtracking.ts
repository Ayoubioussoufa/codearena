/**
 * DSA — Recursion & Backtracking. Build a candidate incrementally; at each
 * step choose → recurse → un-choose (backtrack). Explores a decision tree,
 * pruning branches that can't lead to a valid answer.
 */
import type { DsaCategory } from "../types";

export const recursionBacktracking: DsaCategory = {
  id: "recursion-backtracking",
  title: "Recursion & Backtracking",
  icon: "🌿",
  docAnchor: "recursion--backtracking",
  blurb: "Choose → recurse → un-choose. Subsets, permutations, combinations, and constraint search.",
  problems: [
    {
      slug: "subsets",
      title: "Subsets",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "All subsets of a distinct-element array (the power set).",
      statement: [
        "Given an array `nums` of distinct integers, return all possible subsets (the power set), in any order. No duplicate subsets.",
      ],
      examples: [
        { input: "nums = [1,2,3]", output: "[[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]" },
        { input: "nums = [0]", output: "[[],[0]]" },
      ],
      constraints: ["1 <= nums.length <= 10", "all distinct"],
      fnName: "subsets",
      starter: "function subsets(nums) {\n  \n}",
      solution:
        "function subsets(nums) {\n  const res = [];\n  function backtrack(start, cur) {\n    res.push([...cur]);\n    for (let i = start; i < nums.length; i++) {\n      cur.push(nums[i]);\n      backtrack(i + 1, cur);\n      cur.pop();\n    }\n  }\n  backtrack(0, []);\n  return res;\n}",
      tests: [
        { args: [[1, 2, 3]], expected: [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]], unordered: true },
        { args: [[0]], expected: [[], [0]], unordered: true },
        { args: [[1, 2]], expected: [[], [1], [2], [1, 2]], unordered: true },
      ],
      approach:
        "For each element you make a binary choice — include it or not — so there are 2ⁿ subsets. The backtracking template records the current subset at every node of the decision tree, then for each remaining element chooses it, recurses, and un-chooses (the `pop`). Passing a `start` index avoids revisiting earlier elements, which is what prevents duplicate subsets. O(n·2ⁿ). This is the archetypal backtracking skeleton.",
      docAnchor: "recursion--backtracking",
    },
    {
      slug: "subsets-ii",
      title: "Subsets II",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "Power set of an array that may contain duplicates.",
      statement: [
        "Given an array `nums` that MAY contain duplicates, return all unique subsets, in any order.",
      ],
      examples: [
        { input: "nums = [1,2,2]", output: "[[],[1],[2],[1,2],[2,2],[1,2,2]]" },
        { input: "nums = [0]", output: "[[],[0]]" },
      ],
      constraints: ["1 <= nums.length <= 10"],
      fnName: "subsetsWithDup",
      starter: "function subsetsWithDup(nums) {\n  \n}",
      solution:
        "function subsetsWithDup(nums) {\n  const arr = [...nums].sort((a, b) => a - b);\n  const res = [];\n  function backtrack(start, cur) {\n    res.push([...cur]);\n    for (let i = start; i < arr.length; i++) {\n      if (i > start && arr[i] === arr[i - 1]) continue;\n      cur.push(arr[i]);\n      backtrack(i + 1, cur);\n      cur.pop();\n    }\n  }\n  backtrack(0, []);\n  return res;\n}",
      tests: [
        { args: [[1, 2, 2]], expected: [[], [1], [2], [1, 2], [2, 2], [1, 2, 2]], unordered: true },
        { args: [[0]], expected: [[], [0]], unordered: true },
        { args: [[1, 1]], expected: [[], [1], [1, 1]], unordered: true },
      ],
      approach:
        "Duplicates create duplicate subsets unless you skip them deliberately. Sort first so equal values are adjacent, then at each level skip a value equal to its predecessor *within the same loop position* (`i > start`) — this keeps the first occurrence's branch (which can still use later duplicates) while pruning the redundant siblings. The 'sort + skip equal at the same depth' idiom recurs in combination-sum-ii and permutations-ii.",
      docAnchor: "recursion--backtracking",
    },
    {
      slug: "permutations",
      title: "Permutations",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "All orderings of a distinct-element array.",
      statement: [
        "Given an array `nums` of distinct integers, return all possible permutations, in any order.",
      ],
      examples: [
        { input: "nums = [1,2,3]", output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]" },
        { input: "nums = [0,1]", output: "[[0,1],[1,0]]" },
      ],
      constraints: ["1 <= nums.length <= 6", "all distinct"],
      fnName: "permute",
      starter: "function permute(nums) {\n  \n}",
      solution:
        "function permute(nums) {\n  const res = [];\n  const used = new Array(nums.length).fill(false);\n  function backtrack(cur) {\n    if (cur.length === nums.length) { res.push([...cur]); return; }\n    for (let i = 0; i < nums.length; i++) {\n      if (used[i]) continue;\n      used[i] = true;\n      cur.push(nums[i]);\n      backtrack(cur);\n      cur.pop();\n      used[i] = false;\n    }\n  }\n  backtrack([]);\n  return res;\n}",
      tests: [
        { args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], unordered: true },
        { args: [[0, 1]], expected: [[0, 1], [1, 0]], unordered: true },
        { args: [[1]], expected: [[1]], unordered: true },
      ],
      approach:
        "Unlike subsets, order matters and every element is used, so instead of a `start` index you track which elements are already `used`. At each depth pick any unused element, recurse, then release it. The tree has n! leaves. O(n·n!). The used-array (or swapping in place) is the distinguishing feature of permutation backtracking versus combination backtracking.",
      docAnchor: "recursion--backtracking",
    },
    {
      slug: "combinations",
      title: "Combinations",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "All k-sized combinations from 1..n.",
      statement: [
        "Given integers `n` and `k`, return all combinations of `k` numbers chosen from the range [1, n], in any order.",
      ],
      examples: [
        { input: "n = 4, k = 2", output: "[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]" },
        { input: "n = 1, k = 1", output: "[[1]]" },
      ],
      constraints: ["1 <= k <= n <= 20"],
      fnName: "combine",
      starter: "function combine(n, k) {\n  \n}",
      solution:
        "function combine(n, k) {\n  const res = [];\n  function backtrack(start, cur) {\n    if (cur.length === k) { res.push([...cur]); return; }\n    for (let i = start; i <= n; i++) {\n      cur.push(i);\n      backtrack(i + 1, cur);\n      cur.pop();\n    }\n  }\n  backtrack(1, []);\n  return res;\n}",
      tests: [
        { args: [4, 2], expected: [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]], unordered: true },
        { args: [1, 1], expected: [[1]], unordered: true },
        { args: [3, 3], expected: [[1, 2, 3]], unordered: true },
      ],
      approach:
        "Combinations are order-insensitive selections, so — like subsets — a `start` index enforces increasing order and prevents [1,2] and [2,1] from both appearing. Stop the recursion once the current combination reaches size k. A useful pruning: stop the loop early when not enough numbers remain to complete the combination. O(k·C(n,k)).",
      docAnchor: "recursion--backtracking",
    },
    {
      slug: "combination-sum",
      title: "Combination Sum",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "Combinations that sum to target (reuse allowed).",
      statement: [
        "Given distinct `candidates` and a `target`, return all unique combinations that sum to target. The same number may be used unlimited times. Any order.",
      ],
      examples: [
        { input: "candidates = [2,3,6,7], target = 7", output: "[[2,2,3],[7]]" },
        { input: "candidates = [2], target = 1", output: "[]" },
      ],
      constraints: ["1 <= candidates.length <= 30", "all distinct"],
      fnName: "combinationSum",
      starter: "function combinationSum(candidates, target) {\n  \n}",
      solution:
        "function combinationSum(candidates, target) {\n  const res = [];\n  function backtrack(start, cur, remain) {\n    if (remain === 0) { res.push([...cur]); return; }\n    if (remain < 0) return;\n    for (let i = start; i < candidates.length; i++) {\n      cur.push(candidates[i]);\n      backtrack(i, cur, remain - candidates[i]);\n      cur.pop();\n    }\n  }\n  backtrack(0, [], target);\n  return res;\n}",
      tests: [
        { args: [[2, 3, 6, 7], 7], expected: [[2, 2, 3], [7]], unordered: true },
        { args: [[2, 3, 5], 8], expected: [[2, 2, 2, 2], [2, 3, 3], [3, 5]], unordered: true },
        { args: [[2], 1], expected: [], unordered: true },
      ],
      approach:
        "Reuse is allowed, so recurse with the SAME index `i` (not i+1) — that lets a candidate repeat while the `start` still forbids going backwards, which prevents permutation-style duplicates. Prune whenever the remaining target goes negative. The choice of recursing with `i` vs `i+1` is exactly the 'with vs without replacement' knob across these problems.",
      docAnchor: "recursion--backtracking",
    },
    {
      slug: "combination-sum-ii",
      title: "Combination Sum II",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "Sum to target, each number used at most once, no duplicate combos.",
      statement: [
        "Given `candidates` (which may contain duplicates) and a `target`, return all unique combinations summing to target. Each number may be used at most once. Any order.",
      ],
      examples: [
        { input: "candidates = [10,1,2,7,6,1,5], target = 8", output: "[[1,1,6],[1,2,5],[1,7],[2,6]]" },
        { input: "candidates = [2,5,2,1,2], target = 5", output: "[[1,2,2],[5]]" },
      ],
      constraints: ["1 <= candidates.length <= 100"],
      fnName: "combinationSum2",
      starter: "function combinationSum2(candidates, target) {\n  \n}",
      solution:
        "function combinationSum2(candidates, target) {\n  const arr = [...candidates].sort((a, b) => a - b);\n  const res = [];\n  function backtrack(start, cur, remain) {\n    if (remain === 0) { res.push([...cur]); return; }\n    for (let i = start; i < arr.length; i++) {\n      if (i > start && arr[i] === arr[i - 1]) continue;\n      if (arr[i] > remain) break;\n      cur.push(arr[i]);\n      backtrack(i + 1, cur, remain - arr[i]);\n      cur.pop();\n    }\n  }\n  backtrack(0, [], target);\n  return res;\n}",
      tests: [
        { args: [[10, 1, 2, 7, 6, 1, 5], 8], expected: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]], unordered: true },
        { args: [[2, 5, 2, 1, 2], 5], expected: [[1, 2, 2], [5]], unordered: true },
        { args: [[1, 1, 1], 2], expected: [[1, 1]], unordered: true },
      ],
      approach:
        "This combines two ideas: 'each used once' means recurse with i+1, and 'duplicate values, no duplicate combos' means sort then skip equal siblings at the same depth (`i > start`). Sorting also enables the `arr[i] > remain` early break, since all later values are larger. It's the union of combination-sum and subsets-ii — recognising that saves you from reinventing the de-dup logic.",
      docAnchor: "recursion--backtracking",
    },
    {
      slug: "word-search",
      title: "Word Search",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "Does a word exist along adjacent cells in a grid?",
      statement: [
        "Given an m×n grid of characters `board` and a `word`, return `true` if the word can be formed from sequentially adjacent cells (horizontal/vertical neighbours), using each cell at most once.",
      ],
      examples: [
        { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true" },
        { input: "same board, word = \"ABCB\"", output: "false" },
      ],
      constraints: ["1 <= board cells <= 200", "1 <= word.length <= 15"],
      fnName: "exist",
      starter: "function exist(board, word) {\n  \n}",
      solution:
        "function exist(board, word) {\n  const rows = board.length, cols = board[0].length;\n  function dfs(r, c, i) {\n    if (i === word.length) return true;\n    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[i]) return false;\n    const tmp = board[r][c];\n    board[r][c] = '#';\n    const found =\n      dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) ||\n      dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);\n    board[r][c] = tmp;\n    return found;\n  }\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (dfs(r, c, 0)) return true;\n    }\n  }\n  return false;\n}",
      tests: [
        { args: [[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "ABCCED"], expected: true },
        { args: [[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "SEE"], expected: true },
        { args: [[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "ABCB"], expected: false },
        { args: [[["A"]], "A"], expected: true },
      ],
      approach:
        "From every cell, DFS matching the word one character at a time. The backtracking detail that makes it correct: temporarily mark the current cell (e.g. '#') so the path can't reuse it, then RESTORE it when the branch fails — otherwise you'd corrupt the grid for other starting points. O(cells · 4^len). Marking-and-restoring shared state is the grid-DFS signature.",
      docAnchor: "recursion--backtracking",
    },
    {
      slug: "palindrome-partitioning",
      title: "Palindrome Partitioning",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "All ways to cut s into palindromic substrings.",
      statement: [
        "Given a string `s`, partition it so every substring is a palindrome, and return all such partitionings. Any order.",
      ],
      examples: [
        { input: 's = "aab"', output: '[["a","a","b"],["aa","b"]]' },
        { input: 's = "a"', output: '[["a"]]' },
      ],
      constraints: ["1 <= s.length <= 16"],
      fnName: "partition",
      starter: "function partition(s) {\n  \n}",
      solution:
        "function partition(s) {\n  const res = [];\n  function isPal(l, r) {\n    while (l < r) { if (s[l] !== s[r]) return false; l++; r--; }\n    return true;\n  }\n  function backtrack(start, cur) {\n    if (start === s.length) { res.push([...cur]); return; }\n    for (let end = start; end < s.length; end++) {\n      if (isPal(start, end)) {\n        cur.push(s.slice(start, end + 1));\n        backtrack(end + 1, cur);\n        cur.pop();\n      }\n    }\n  }\n  backtrack(0, []);\n  return res;\n}",
      tests: [
        { args: ["aab"], expected: [["a", "a", "b"], ["aa", "b"]], unordered: true },
        { args: ["a"], expected: [["a"]], unordered: true },
        { args: ["aba"], expected: [["a", "b", "a"], ["aba"]], unordered: true },
      ],
      approach:
        "At each position, try every prefix that is a palindrome as the next 'piece', then recurse on the remainder — a cut is only allowed where the left part is already a palindrome, which prunes the tree. When you reach the end, the accumulated pieces are one valid partition. O(n·2ⁿ) worst case. Choosing where to cut, subject to a validity check, is backtracking over strings.",
      docAnchor: "recursion--backtracking",
    },
    {
      slug: "letter-combinations-of-a-phone-number",
      title: "Letter Combinations of a Phone Number",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "All texts a digit string could spell.",
      statement: [
        "Given a string of digits 2–9, return all letter combinations the digits could represent on a phone keypad (2 = abc, 3 = def, …, 9 = wxyz), in any order. Empty input → empty list.",
      ],
      examples: [
        { input: "digits = \"23\"", output: "[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]" },
        { input: "digits = \"\"", output: "[]" },
        { input: "digits = \"2\"", output: "[\"a\",\"b\",\"c\"]" },
      ],
      constraints: ["0 <= digits.length <= 4", "Digits 2–9 only"],
      fnName: "letterCombinations",
      starter: "function letterCombinations(digits) {\n  \n}",
      solution:
        "function letterCombinations(digits) {\n  if (digits.length === 0) return [];\n  const pad = {\n    2: \"abc\", 3: \"def\", 4: \"ghi\", 5: \"jkl\",\n    6: \"mno\", 7: \"pqrs\", 8: \"tuv\", 9: \"wxyz\",\n  };\n  const res = [];\n  function build(i, prefix) {\n    if (i === digits.length) {\n      res.push(prefix);\n      return;\n    }\n    for (const ch of pad[digits[i]]) {\n      build(i + 1, prefix + ch);\n    }\n  }\n  build(0, \"\");\n  return res;\n}",
      tests: [
        { args: ["23"], expected: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"], unordered: true },
        { args: [""], expected: [] },
        { args: ["2"], expected: ["a", "b", "c"], unordered: true },
      ],
      approach:
        "The gentlest possible backtracking: one decision per digit (which of its letters), depth = number of digits, so the recursion tree's leaves ARE the answers. Because strings are immutable in JS, passing `prefix + ch` down means there's nothing to undo — the 'un-choose' step of backtracking happens automatically. Contrast with Subsets/Permutations where a shared mutable path needs an explicit pop. A cartesian product is backtracking with no constraints; add constraints and you get the rest of this category.",
      docAnchor: "recursion--backtracking",
    },
    {
      slug: "n-queens",
      title: "N-Queens",
      difficulty: "Hard",
      category: "recursion-backtracking",
      blurb: "Place n non-attacking queens — the classic constraint search.",
      statement: [
        "Place `n` queens on an n×n board so no two attack each other (same row, column, or diagonal). Return ALL distinct solutions; each solution is an array of strings where 'Q' marks a queen and '.' an empty square.",
      ],
      examples: [
        { input: "n = 4", output: "[[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\"..Q.\",\"Q...\",\"...Q\",\".Q..\"]]" },
        { input: "n = 1", output: "[[\"Q\"]]" },
      ],
      constraints: ["1 <= n <= 9"],
      fnName: "solveNQueens",
      starter: "function solveNQueens(n) {\n  \n}",
      solution:
        "function solveNQueens(n) {\n  const res = [];\n  const cols = new Set();\n  const diag1 = new Set(); // r - c\n  const diag2 = new Set(); // r + c\n  const queenCol = new Array(n);\n  function place(r) {\n    if (r === n) {\n      res.push(\n        queenCol.map((c) => \".\".repeat(c) + \"Q\" + \".\".repeat(n - c - 1)),\n      );\n      return;\n    }\n    for (let c = 0; c < n; c++) {\n      if (cols.has(c) || diag1.has(r - c) || diag2.has(r + c)) continue;\n      cols.add(c);\n      diag1.add(r - c);\n      diag2.add(r + c);\n      queenCol[r] = c;\n      place(r + 1);\n      cols.delete(c);\n      diag1.delete(r - c);\n      diag2.delete(r + c);\n    }\n  }\n  place(0);\n  return res;\n}",
      tests: [
        {
          args: [4],
          expected: [[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]],
          unordered: true,
        },
        { args: [1], expected: [["Q"]] },
        { args: [2], expected: [] },
        { args: [3], expected: [] },
      ],
      approach:
        "The canonical constraint-satisfaction search, with every classic optimization visible: place one queen PER ROW (rows can't conflict by construction, shrinking the search from n² squares to n columns per level), and test the three remaining constraints in O(1) via sets keyed on the two diagonal invariants — r − c is constant on one diagonal family, r + c on the other. Choose → recurse → UNDO (the three deletes) is bare backtracking. n = 2 and 3 returning empty is the search correctly proving unsatisfiability. Every scheduling/assignment backtracker you'll ever write is N-Queens with different constraint sets.",
      docAnchor: "recursion--backtracking",
    },
    {
      slug: "towers-of-hanoi",
      title: "Towers of Hanoi",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "The move sequence to shift n disks, peg 0 → peg 2.",
      statement: [
        "Move a stack of `n` disks from peg `0` to peg `2`, using peg `1` as spare. Rules: move one disk at a time, and never place a larger disk on a smaller one. Return the list of moves as `[from, to]` pairs, in order.",
        "From *interactive-coding-challenges* (Recursion & DP: Towers of Hanoi with 3 towers and N disks).",
      ],
      examples: [
        { input: "n = 1", output: "[[0,2]]" },
        { input: "n = 2", output: "[[0,1],[0,2],[1,2]]", explanation: "Small disk out of the way, big disk across, small disk on top." },
      ],
      constraints: ["1 <= n <= 15"],
      fnName: "hanoi",
      starter: `function hanoi(n) {\n  \n}`,
      solution: `function hanoi(n) {\n  const moves = [];\n  function solve(k, from, to, aux) {\n    if (k === 0) return;\n    solve(k - 1, from, aux, to);\n    moves.push([from, to]);\n    solve(k - 1, aux, to, from);\n  }\n  solve(n, 0, 2, 1);\n  return moves;\n}`,
      tests: [
        { args: [1], expected: [[0, 2]] },
        { args: [2], expected: [[0, 1], [0, 2], [1, 2]] },
        { args: [3], expected: [[0, 2], [0, 1], [2, 1], [0, 2], [1, 0], [1, 2], [0, 2]] },
      ],
      approach:
        "The recursive insight collapses a scary puzzle into three lines: to move `n` disks from A to C, first move the top `n-1` out of the way onto B (recursive subproblem), move the single biggest disk A→C, then move those `n-1` from B onto C (another subproblem). The base case is 0 disks (do nothing). It always takes 2ⁿ−1 moves — a clean demonstration that some problems are naturally exponential, and that recursion expresses 'solve two smaller copies, then combine' effortlessly.",
      docAnchor: "recursion-backtracking",
    },
    {
      slug: "permutations-ii",
      title: "Permutations II",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "All unique permutations when values repeat.",
      statement: [
        "Given a collection `nums` that may contain **duplicates**, return all **unique** permutations, in any order.",
        "Canonical must-do (AM-600 Backtracking family).",
      ],
      examples: [
        { input: "nums = [1,1,2]", output: "[[1,1,2],[1,2,1],[2,1,1]]" },
        { input: "nums = [1,2,3]", output: "6 permutations" },
      ],
      constraints: ["1 <= nums.length <= 8"],
      fnName: "permuteUnique",
      starter: `function permuteUnique(nums) {\n  \n}`,
      solution: `function permuteUnique(nums) {\n  nums.sort((a, b) => a - b);\n  const res = [], used = new Array(nums.length).fill(false), cur = [];\n  function backtrack() {\n    if (cur.length === nums.length) { res.push([...cur]); return; }\n    for (let i = 0; i < nums.length; i++) {\n      if (used[i]) continue;\n      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue;\n      used[i] = true; cur.push(nums[i]);\n      backtrack();\n      cur.pop(); used[i] = false;\n    }\n  }\n  backtrack();\n  return res;\n}`,
      tests: [
        { args: [[1, 1, 2]], expected: [[1, 1, 2], [1, 2, 1], [2, 1, 1]], unordered: true },
        { args: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], unordered: true },
        { args: [[2, 2]], expected: [[2, 2]], unordered: true },
      ],
      approach:
        "Standard permutation backtracking (choose an unused index, recurse, un-choose) plus one **de-dup rule**: sort first, then skip a value if it equals its predecessor *and that predecessor isn't currently used* (`nums[i]===nums[i-1] && !used[i-1]`). That condition forces equal values to be placed in left-to-right order, so each distinct permutation is generated exactly once. O(n · n!). The 'skip equal siblings at the same depth' idea recurs across combination/subset problems with duplicates.",
      docAnchor: "recursion-backtracking",
    },
    {
      slug: "restore-ip-addresses",
      title: "Restore IP Addresses",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "All valid IPs formable by inserting 3 dots.",
      statement: [
        "Given a string `s` of digits, return **all** valid IP addresses formable by inserting three dots (no reordering). A segment is valid if it's 0–255 and has no leading zero (except '0' itself). Any order of results is accepted.",
        "Canonical must-do (AM-600 Backtracking family).",
      ],
      examples: [
        { input: 's = "25525511135"', output: '["255.255.11.135","255.255.111.35"]' },
        { input: 's = "0000"', output: '["0.0.0.0"]' },
      ],
      constraints: ["1 <= s.length <= 20", "s consists of digits only"],
      fnName: "restoreIpAddresses",
      starter: `function restoreIpAddresses(s) {\n  \n}`,
      solution: `function restoreIpAddresses(s) {\n  const res = [];\n  function backtrack(start, parts) {\n    if (parts.length === 4) {\n      if (start === s.length) res.push(parts.join("."));\n      return;\n    }\n    for (let len = 1; len <= 3 && start + len <= s.length; len++) {\n      const seg = s.slice(start, start + len);\n      if ((seg.length > 1 && seg[0] === "0") || Number(seg) > 255) continue;\n      backtrack(start + len, [...parts, seg]);\n    }\n  }\n  backtrack(0, []);\n  return res;\n}`,
      tests: [
        { args: ["25525511135"], expected: ["255.255.11.135", "255.255.111.35"], unordered: true },
        { args: ["0000"], expected: ["0.0.0.0"], unordered: true },
        { args: ["1111"], expected: ["1.1.1.1"], unordered: true },
        { args: ["101023"], expected: ["1.0.10.23", "1.0.102.3", "10.1.0.23", "10.10.2.3", "101.0.2.3"], unordered: true },
      ],
      approach:
        "Backtrack over the **4 segments**: at each level try consuming 1, 2, or 3 digits, keep the segment only if it's a legal octet (≤ 255, no leading zero), and recurse. You succeed only when exactly 4 parts consume the whole string. The bounded structure (always 4 parts, ≤ 3 digits each) prunes the search hard, so it's fast despite being exhaustive. Validity checks as pruning conditions is the pattern.",
      docAnchor: "recursion-backtracking",
    },
    {
      slug: "combination-sum-iii",
      title: "Combination Sum III",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "k distinct digits 1-9 summing to n.",
      statement: [
        "Find all valid combinations of `k` numbers that sum to `n`, using only the digits `1..9`, each **at most once**. Return the combinations in any order (no duplicates).",
        "Canonical must-do (AM-600 Backtracking family).",
      ],
      examples: [
        { input: "k = 3, n = 7", output: "[[1,2,4]]" },
        { input: "k = 3, n = 9", output: "[[1,2,6],[1,3,5],[2,3,4]]" },
      ],
      constraints: ["2 <= k <= 9", "1 <= n <= 60"],
      fnName: "combinationSum3",
      starter: `function combinationSum3(k, n) {\n  \n}`,
      solution: `function combinationSum3(k, n) {\n  const res = [], cur = [];\n  function backtrack(start, remaining) {\n    if (cur.length === k) {\n      if (remaining === 0) res.push([...cur]);\n      return;\n    }\n    for (let i = start; i <= 9; i++) {\n      if (i > remaining) break;\n      cur.push(i);\n      backtrack(i + 1, remaining - i);\n      cur.pop();\n    }\n  }\n  backtrack(1, n);\n  return res;\n}`,
      tests: [
        { args: [3, 7], expected: [[1, 2, 4]], unordered: true },
        { args: [3, 9], expected: [[1, 2, 6], [1, 3, 5], [2, 3, 4]], unordered: true },
        { args: [4, 1], expected: [], unordered: true },
        { args: [9, 45], expected: [[1, 2, 3, 4, 5, 6, 7, 8, 9]], unordered: true },
      ],
      approach:
        "Combination backtracking with a `start` index so digits are only ever chosen in increasing order — that alone prevents both duplicates and reuse. Two prunes keep it fast: stop the loop once `i > remaining` (all later digits are bigger), and only record when you have exactly `k` digits AND the remainder hit 0. The search space is tiny (≤ 2⁹) because of the 1–9 bound.",
      docAnchor: "recursion-backtracking",
    },
    {
      slug: "letter-case-permutation",
      title: "Letter Case Permutation",
      difficulty: "Medium",
      category: "recursion-backtracking",
      blurb: "Every combination of upper/lower for the letters.",
      statement: [
        "Given a string `s`, transform every **letter** to lowercase or uppercase independently to produce all possible strings. Digits stay unchanged. Return all results in any order.",
        "Canonical must-do (AM-600 Backtracking family).",
      ],
      examples: [
        { input: 's = "a1b2"', output: '["a1b2","a1B2","A1b2","A1B2"]' },
        { input: 's = "3z4"', output: '["3z4","3Z4"]' },
      ],
      constraints: ["1 <= s.length <= 12"],
      fnName: "letterCasePermutation",
      starter: `function letterCasePermutation(s) {\n  \n}`,
      solution: `function letterCasePermutation(s) {\n  const res = [];\n  function backtrack(i, cur) {\n    if (i === s.length) { res.push(cur); return; }\n    const c = s[i];\n    if (c >= "0" && c <= "9") backtrack(i + 1, cur + c);\n    else {\n      backtrack(i + 1, cur + c.toLowerCase());\n      backtrack(i + 1, cur + c.toUpperCase());\n    }\n  }\n  backtrack(0, "");\n  return res;\n}`,
      tests: [
        { args: ["a1b2"], expected: ["a1b2", "a1B2", "A1b2", "A1B2"], unordered: true },
        { args: ["3z4"], expected: ["3z4", "3Z4"], unordered: true },
        { args: ["12345"], expected: ["12345"], unordered: true },
      ],
      approach:
        "A binary decision tree: at each position, a **digit** has one branch (keep it) while a **letter** has two (lower or upper). Recurse to the end of the string and record. With `L` letters you get exactly 2^L results — the output size dominates, so O(2^L · n). Passing the built string down means no explicit undo step is needed.",
      docAnchor: "recursion-backtracking",
    },
  ],
};
