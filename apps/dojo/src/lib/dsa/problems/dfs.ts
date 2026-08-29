/**
 * DSA — Depth-First Search. Go as deep as possible, backtrack, repeat: on
 * grids, adjacency lists, and trees. Mark visited BEFORE recursing, and let
 * the recursion (or an explicit stack) carry the state.
 */
import type { DsaCategory } from "../types";

export const dfs: DsaCategory = {
  id: "dfs",
  title: "Depth-First Search",
  icon: "🧗",
  docAnchor: "dfs-depth-first-search",
  blurb:
    "Dive deep, backtrack, repeat — flood fills, region marking, path existence, and tree walks.",
  problems: [
    {
      slug: "flood-fill",
      title: "Flood Fill",
      difficulty: "Easy",
      category: "dfs",
      blurb: "Paint-bucket tool: recolor a connected region.",
      statement: [
        "Given an image as a grid of colors, a start pixel `(sr, sc)`, and a new `color`, recolor the start pixel and every pixel 4-directionally connected to it that shares its ORIGINAL color. Return the image.",
      ],
      examples: [
        {
          input: "image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2",
          output: "[[2,2,2],[2,2,0],[2,0,1]]",
          explanation: "The bottom-right 1 is not connected to the start.",
        },
        { input: "image = [[0,0,0],[0,0,0]], sr = 0, sc = 0, color = 0", output: "[[0,0,0],[0,0,0]]" },
      ],
      constraints: ["1 <= rows, cols <= 50"],
      fnName: "floodFill",
      starter: "function floodFill(image, sr, sc, color) {\n  \n}",
      solution:
        "function floodFill(image, sr, sc, color) {\n  const start = image[sr][sc];\n  if (start === color) return image;\n  const R = image.length, C = image[0].length;\n  function fill(r, c) {\n    if (r < 0 || c < 0 || r >= R || c >= C || image[r][c] !== start) return;\n    image[r][c] = color;\n    fill(r + 1, c);\n    fill(r - 1, c);\n    fill(r, c + 1);\n    fill(r, c - 1);\n  }\n  fill(sr, sc);\n  return image;\n}",
      tests: [
        { args: [[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2], expected: [[2, 2, 2], [2, 2, 0], [2, 0, 1]] },
        { args: [[[0, 0, 0], [0, 0, 0]], 0, 0, 0], expected: [[0, 0, 0], [0, 0, 0]] },
        { args: [[[0, 1, 0]], 0, 1, 5], expected: [[0, 5, 0]] },
      ],
      approach:
        "The template grid DFS: recurse into the 4 neighbours, with the boundary + wrong-color check as the very first line of the recursion (checking INSIDE the call keeps the call sites clean). Recoloring the pixel doubles as the visited mark — no separate set needed. One subtlety: if the new color equals the old one, every pixel 'still needs filling' forever — return early. Every region/island problem is this function with a different payload.",
      docAnchor: "dfs-depth-first-search",
    },
    {
      slug: "island-perimeter",
      title: "Island Perimeter",
      difficulty: "Easy",
      category: "dfs",
      blurb: "Total boundary length of the single island in a grid.",
      statement: [
        "A grid has exactly one island (1 = land, 0 = water, no lakes). Each cell is a 1×1 square. Return the island's perimeter.",
      ],
      examples: [
        { input: "grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]", output: "16" },
        { input: "grid = [[1]]", output: "4" },
        { input: "grid = [[1,0]]", output: "4" },
      ],
      constraints: ["1 <= rows, cols <= 100"],
      fnName: "islandPerimeter",
      starter: "function islandPerimeter(grid) {\n  \n}",
      solution:
        "function islandPerimeter(grid) {\n  const R = grid.length, C = grid[0].length;\n  let per = 0;\n  for (let r = 0; r < R; r++) {\n    for (let c = 0; c < C; c++) {\n      if (grid[r][c] !== 1) continue;\n      per += 4;\n      if (r > 0 && grid[r - 1][c] === 1) per -= 2;\n      if (c > 0 && grid[r][c - 1] === 1) per -= 2;\n    }\n  }\n  return per;\n}",
      tests: [
        { args: [[[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]], expected: 16 },
        { args: [[[1]]], expected: 4 },
        { args: [[[1, 0]]], expected: 4 },
        { args: [[[1, 1]]], expected: 6 },
      ],
      approach:
        "Each land cell contributes 4 edges; every pair of adjacent land cells hides 2 of them (one from each). So: perimeter = 4·(land) − 2·(adjacent pairs), counting each pair once by only looking up and left. You CAN solve it with a DFS that adds 1 for every step off the island — good practice — but the counting version shows a recurring meta-lesson: sometimes the 'graph problem' has a direct arithmetic answer.",
      docAnchor: "dfs-depth-first-search",
    },
    {
      slug: "find-if-path-exists-in-graph",
      title: "Find if Path Exists in Graph",
      difficulty: "Easy",
      category: "dfs",
      blurb: "Is there any route between two vertices?",
      statement: [
        "You are given `n` vertices (0 to n−1) and an undirected edge list `edges`. Return `true` if there is any path from `source` to `destination`.",
      ],
      examples: [
        { input: "n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2", output: "true" },
        { input: "n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5", output: "false" },
      ],
      constraints: ["1 <= n <= 2 * 10^5", "0 <= edges.length <= 2 * 10^5"],
      fnName: "validPath",
      starter: "function validPath(n, edges, source, destination) {\n  \n}",
      solution:
        "function validPath(n, edges, source, destination) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [a, b] of edges) {\n    adj[a].push(b);\n    adj[b].push(a);\n  }\n  const seen = new Set([source]);\n  const stack = [source];\n  while (stack.length) {\n    const v = stack.pop();\n    if (v === destination) return true;\n    for (const nb of adj[v]) {\n      if (!seen.has(nb)) {\n        seen.add(nb);\n        stack.push(nb);\n      }\n    }\n  }\n  return false;\n}",
      tests: [
        { args: [3, [[0, 1], [1, 2], [2, 0]], 0, 2], expected: true },
        { args: [6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5], expected: false },
        { args: [1, [], 0, 0], expected: true },
      ],
      approach:
        "First: convert the edge list into an adjacency list — nearly every graph problem starts with this build step, and forgetting to add BOTH directions for undirected edges is the classic bug. Then an iterative DFS with an explicit stack: pop, check, push unseen neighbours. Mark nodes as seen when PUSHED, not when popped — marking on pop lets the same node enter the stack many times. Reachability is DFS at its purest: no distances, no order, just 'can I get there'.",
      docAnchor: "dfs-depth-first-search",
    },
    {
      slug: "keys-and-rooms",
      title: "Keys and Rooms",
      difficulty: "Medium",
      category: "dfs",
      blurb: "Starting in room 0, can you unlock every room?",
      statement: [
        "There are `n` rooms; `rooms[i]` lists the keys lying in room `i`. You start in room 0 (unlocked). You may only enter a room whose key you have collected. Return `true` if you can visit every room.",
      ],
      examples: [
        { input: "rooms = [[1],[2],[3],[]]", output: "true", explanation: "0 → 1 → 2 → 3." },
        { input: "rooms = [[1,3],[3,0,1],[2],[0]]", output: "false", explanation: "Room 2 is never reachable." },
      ],
      constraints: ["2 <= rooms.length <= 1000"],
      fnName: "canVisitAllRooms",
      starter: "function canVisitAllRooms(rooms) {\n  \n}",
      solution:
        "function canVisitAllRooms(rooms) {\n  const seen = new Set([0]);\n  const stack = [0];\n  while (stack.length) {\n    const room = stack.pop();\n    for (const key of rooms[room]) {\n      if (!seen.has(key)) {\n        seen.add(key);\n        stack.push(key);\n      }\n    }\n  }\n  return seen.size === rooms.length;\n}",
      tests: [
        { args: [[[1], [2], [3], []]], expected: true },
        { args: [[[1, 3], [3, 0, 1], [2], [0]]], expected: false },
        { args: [[[1], [0]]], expected: true },
      ],
      approach:
        "Strip the story and it's plain reachability: rooms are vertices, keys are directed edges, and the question is whether DFS from 0 reaches all n vertices. Compare the final visited-set size to n. Half the skill in graph interviews is this TRANSLATION step — spotting that keys/prerequisites/emails/accounts are edges in disguise. Note the graph is directed here: a key to room 3 doesn't mean room 3 holds a key back.",
      docAnchor: "dfs-depth-first-search",
    },
    {
      slug: "path-sum",
      title: "Path Sum",
      difficulty: "Easy",
      category: "dfs",
      blurb: "Does a root-to-leaf path add up to the target?",
      statement: [
        "Given the root of a binary tree and `targetSum`, return `true` if some ROOT-TO-LEAF path sums to `targetSum`.",
        "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode` with `.val`, `.left`, `.right`.",
      ],
      examples: [
        { input: "root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22", output: "true", explanation: "5 → 4 → 11 → 2." },
        { input: "root = [1,2,3], targetSum = 5", output: "false" },
      ],
      constraints: ["0 <= number of nodes <= 5000"],
      fnName: "hasPathSum",
      starter: "function hasPathSum(root, targetSum) {\n  \n}",
      solution:
        "function hasPathSum(root, targetSum) {\n  if (!root) return false;\n  if (!root.left && !root.right) return targetSum === root.val;\n  const rest = targetSum - root.val;\n  return hasPathSum(root.left, rest) || hasPathSum(root.right, rest);\n}",
      tests: [
        { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22], expected: true },
        { args: [[1, 2, 3], 5], expected: false },
        { args: [[], 0], expected: false },
        { args: [[1, 2], 1], expected: false },
      ],
      harness: { args: ["tree", "raw"] },
      approach:
        "Tree DFS with an ACCUMULATOR passed down: instead of summing paths bottom-up, subtract the current value from the target on the way down and ask 'can a subtree finish the remaining amount?'. The two base cases carry all the correctness: an empty tree has no paths (false), and a LEAF succeeds only if it exactly finishes the sum. Watch the trap in test 4: [1,2] with target 1 is false, because 1 alone isn't a root-to-LEAF path. Threading state down the recursion like this is the shape of most tree-path problems.",
      docAnchor: "dfs-depth-first-search",
    },
    {
      slug: "count-good-nodes-in-binary-tree",
      title: "Count Good Nodes in Binary Tree",
      difficulty: "Medium",
      category: "dfs",
      blurb: "Nodes ≥ every ancestor on their path.",
      statement: [
        "A node is GOOD if no node on the path from the root to it has a greater value. Return the number of good nodes.",
        "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode`.",
      ],
      examples: [
        { input: "root = [3,1,4,3,null,1,5]", output: "4", explanation: "Root 3, the 4, the 5, and the leaf 3." },
        { input: "root = [3,3,null,4,2]", output: "3" },
      ],
      constraints: ["1 <= number of nodes <= 10^5"],
      fnName: "goodNodes",
      starter: "function goodNodes(root) {\n  \n}",
      solution:
        "function goodNodes(root) {\n  function walk(node, maxSoFar) {\n    if (!node) return 0;\n    const good = node.val >= maxSoFar ? 1 : 0;\n    const m = Math.max(maxSoFar, node.val);\n    return good + walk(node.left, m) + walk(node.right, m);\n  }\n  return walk(root, -Infinity);\n}",
      tests: [
        { args: [[3, 1, 4, 3, null, 1, 5]], expected: 4 },
        { args: [[3, 3, null, 4, 2]], expected: 3 },
        { args: [[1]], expected: 1 },
      ],
      harness: { args: ["tree"] },
      approach:
        "Pass the maximum value seen along the current root path DOWN as a parameter. Each node compares itself to that running max — that one comparison IS the 'good' test — then hands the updated max to its children. Start with −Infinity so the root is always good. This is the same threading-state-down pattern as Path Sum; together they cover most 'property of the root-to-node path' questions. O(n) time, O(height) stack.",
      docAnchor: "dfs-depth-first-search",
    },
    {
      slug: "employee-importance",
      title: "Employee Importance",
      difficulty: "Medium",
      category: "dfs",
      blurb: "Sum importance over a management subtree.",
      statement: [
        "Each employee is `[id, importance, subordinateIds]`. Given the list `employees` and an `id`, return that employee's TOTAL importance: their own plus (recursively) all their direct and indirect subordinates'.",
      ],
      examples: [
        { input: "employees = [[1,5,[2,3]],[2,3,[]],[3,3,[]]], id = 1", output: "11", explanation: "5 + 3 + 3." },
        { input: "employees = [[1,2,[5]],[5,-3,[]]], id = 5", output: "-3" },
      ],
      constraints: ["1 <= employees.length <= 2000", "One employee per id; the hierarchy is a tree"],
      fnName: "getImportance",
      starter: "function getImportance(employees, id) {\n  \n}",
      solution:
        "function getImportance(employees, id) {\n  const byId = new Map(employees.map((e) => [e[0], e]));\n  function total(eid) {\n    const [, importance, subs] = byId.get(eid);\n    let sum = importance;\n    for (const s of subs) sum += total(s);\n    return sum;\n  }\n  return total(id);\n}",
      tests: [
        { args: [[[1, 5, [2, 3]], [2, 3, []], [3, 3, []]], 1], expected: 11 },
        { args: [[[1, 2, [5]], [5, -3, []]], 5], expected: -3 },
        { args: [[[1, 4, []]], 1], expected: 4 },
      ],
      approach:
        "Two steps that generalize far beyond this puzzle: (1) index the flat records by id in a Map so lookups are O(1) — DFS over records that point at each other by id always wants this; (2) recurse: total(e) = own importance + Σ total(subordinates). The org chart is a tree, so no visited-set is needed; if the input could contain cycles you'd add one. Recognizing 'flat rows + id references = a graph' is the transferable skill.",
      docAnchor: "dfs-depth-first-search",
    },
    {
      slug: "surrounded-regions",
      title: "Surrounded Regions",
      difficulty: "Medium",
      category: "dfs",
      blurb: "Capture every O-region not touching the border.",
      statement: [
        "Given a board of `\"X\"` and `\"O\"`, flip every `\"O\"` region that is FULLY surrounded by `\"X\"` into `\"X\"`. A region touching the border is not surrounded. Return the board.",
      ],
      examples: [
        {
          input: "board = [[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"O\",\"X\"],[\"X\",\"X\",\"O\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]",
          output: "[[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]",
          explanation: "The interior O-region is captured; the O on the bottom row touches the border, so it survives.",
        },
        { input: "board = [[\"O\"]]", output: "[[\"O\"]]" },
      ],
      constraints: ["1 <= rows, cols <= 200"],
      fnName: "solve",
      starter: "function solve(board) {\n  \n}",
      solution:
        "function solve(board) {\n  const R = board.length, C = board[0].length;\n  function mark(r, c) {\n    if (r < 0 || c < 0 || r >= R || c >= C || board[r][c] !== \"O\") return;\n    board[r][c] = \"#\";\n    mark(r + 1, c);\n    mark(r - 1, c);\n    mark(r, c + 1);\n    mark(r, c - 1);\n  }\n  for (let r = 0; r < R; r++) {\n    mark(r, 0);\n    mark(r, C - 1);\n  }\n  for (let c = 0; c < C; c++) {\n    mark(0, c);\n    mark(R - 1, c);\n  }\n  for (let r = 0; r < R; r++) {\n    for (let c = 0; c < C; c++) {\n      if (board[r][c] === \"O\") board[r][c] = \"X\";\n      else if (board[r][c] === \"#\") board[r][c] = \"O\";\n    }\n  }\n  return board;\n}",
      tests: [
        {
          args: [[["X", "X", "X", "X"], ["X", "O", "O", "X"], ["X", "X", "O", "X"], ["X", "O", "X", "X"]]],
          expected: [["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "O", "X", "X"]],
        },
        { args: [[["O"]]], expected: [["O"]] },
        { args: [[["O", "X"], ["X", "O"]]], expected: [["O", "X"], ["X", "O"]] },
      ],
      approach:
        "Solve the COMPLEMENT: finding 'surrounded' regions directly is awkward, but 'safe' regions are easy — they're exactly the O-regions reachable from the border. DFS from every border O, marking survivors with a temporary '#'. Then one sweep: remaining O → captured (flip to X), # → restore to O. Inverting the question ('mark what survives, not what dies') plus a temporary third state is a combination that shows up all over grid problems.",
      docAnchor: "dfs-depth-first-search",
    },
    {
      slug: "all-paths-from-source-to-target",
      title: "All Paths From Source to Target",
      difficulty: "Medium",
      category: "dfs",
      blurb: "Enumerate every path through a DAG.",
      statement: [
        "Given a directed acyclic graph where `graph[i]` lists the nodes reachable from `i`, return ALL paths from node `0` to node `n − 1`, in any order.",
      ],
      examples: [
        { input: "graph = [[1,2],[3],[3],[]]", output: "[[0,1,3],[0,2,3]]" },
        { input: "graph = [[1],[]]", output: "[[0,1]]" },
      ],
      constraints: ["2 <= n <= 15", "The graph is a DAG (no cycles)"],
      fnName: "allPathsSourceTarget",
      starter: "function allPathsSourceTarget(graph) {\n  \n}",
      solution:
        "function allPathsSourceTarget(graph) {\n  const target = graph.length - 1;\n  const res = [];\n  const path = [0];\n  function walk(node) {\n    if (node === target) {\n      res.push([...path]);\n      return;\n    }\n    for (const next of graph[node]) {\n      path.push(next);\n      walk(next);\n      path.pop();\n    }\n  }\n  walk(0);\n  return res;\n}",
      tests: [
        { args: [[[1, 2], [3], [3], []]], expected: [[0, 1, 3], [0, 2, 3]], unordered: true },
        { args: [[[1], []]], expected: [[0, 1]] },
        {
          args: [[[4, 3, 1], [3, 2, 4], [3], [4], []]],
          expected: [[0, 4], [0, 3, 4], [0, 1, 3, 4], [0, 1, 2, 3, 4], [0, 1, 4]],
          unordered: true,
        },
      ],
      approach:
        "DFS + backtracking: push the next node onto the running path, recurse, pop on the way out — the push/pop pair around the recursive call is the backtracking signature. Copy the path (spread) when recording a hit, or later mutations corrupt stored answers. Because the graph is a DAG, no visited-set is needed: paths can't loop. Contrast with reachability DFS, where you mark visited precisely because you DON'T want to re-walk — enumerating all paths is the one time re-visiting (via different routes) is the point.",
      docAnchor: "dfs-depth-first-search",
    },
    {
      slug: "count-sub-islands",
      title: "Count Sub Islands",
      difficulty: "Medium",
      category: "dfs",
      blurb: "Islands of grid2 that sit entirely on land of grid1.",
      statement: [
        "Given two grids of the same size, an island in `grid2` is a SUB-ISLAND if every one of its cells is also land (`1`) in `grid1`. Return the number of sub-islands.",
      ],
      examples: [
        {
          input: "grid1 = [[1,1,1,0,0],[0,1,1,1,1],[0,0,0,0,0],[1,0,0,0,0],[1,1,0,1,1]], grid2 = [[1,1,1,0,0],[0,0,1,1,1],[0,1,0,0,0],[1,0,1,1,0],[0,1,0,1,0]]",
          output: "3",
        },
        { input: "grid1 = [[1,1],[1,1]], grid2 = [[1,1],[1,1]]", output: "1" },
      ],
      constraints: ["1 <= rows, cols <= 500"],
      fnName: "countSubIslands",
      starter: "function countSubIslands(grid1, grid2) {\n  \n}",
      solution:
        "function countSubIslands(grid1, grid2) {\n  const R = grid2.length, C = grid2[0].length;\n  function sink(r, c) {\n    if (r < 0 || c < 0 || r >= R || c >= C || grid2[r][c] !== 1) return true;\n    grid2[r][c] = 0;\n    let ok = grid1[r][c] === 1;\n    ok = sink(r + 1, c) && ok;\n    ok = sink(r - 1, c) && ok;\n    ok = sink(r, c + 1) && ok;\n    ok = sink(r, c - 1) && ok;\n    return ok;\n  }\n  let count = 0;\n  for (let r = 0; r < R; r++) {\n    for (let c = 0; c < C; c++) {\n      if (grid2[r][c] === 1 && sink(r, c)) count++;\n    }\n  }\n  return count;\n}",
      tests: [
        {
          args: [
            [[1, 1, 1, 0, 0], [0, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 0, 1, 1]],
            [[1, 1, 1, 0, 0], [0, 0, 1, 1, 1], [0, 1, 0, 0, 0], [1, 0, 1, 1, 0], [0, 1, 0, 1, 0]],
          ],
          expected: 3,
        },
        { args: [[[1, 1], [1, 1]], [[1, 1], [1, 1]]], expected: 1 },
        { args: [[[0]], [[1]]], expected: 0 },
      ],
      approach:
        "One DFS per grid2 island, but the recursion RETURNS a verdict: 'was every cell of this island land in grid1?'. Combine child results with AND — and note the deliberate `sink(...) && ok` ordering, which keeps exploring (to sink the whole island) even after the verdict is already false. Short-circuiting the other way (`ok && sink(...)`) would leave half-sunk islands that get recounted. Aggregating a boolean up a traversal, without aborting it, is the pattern to take away.",
      docAnchor: "dfs-depth-first-search",
    },
    {
      slug: "binary-tree-paths",
      title: "Binary Tree Paths",
      difficulty: "Easy",
      category: "dfs",
      blurb: "Every root-to-leaf path as a string.",
      statement: [
        'Given the `root` of a binary tree, return all root-to-leaf paths as strings in the form `"1->2->5"`, in any order.',
        "Canonical must-do (AM-600 Trees / DFS family).",
      ],
      examples: [
        { input: "root = [1,2,3,null,5]", output: '["1->2->5","1->3"]' },
        { input: "root = [1]", output: '["1"]' },
      ],
      constraints: ["0 <= number of nodes <= 100"],
      fnName: "binaryTreePaths",
      starter: `function binaryTreePaths(root) {\n  \n}`,
      solution: `function binaryTreePaths(root) {\n  const res = [];\n  function dfs(node, path) {\n    if (!node) return;\n    const cur = path === "" ? String(node.val) : path + "->" + node.val;\n    if (!node.left && !node.right) { res.push(cur); return; }\n    dfs(node.left, cur);\n    dfs(node.right, cur);\n  }\n  dfs(root, "");\n  return res;\n}`,
      tests: [
        { args: [[1, 2, 3, null, 5]], expected: ["1->2->5", "1->3"], unordered: true },
        { args: [[1]], expected: ["1"], unordered: true },
        { args: [[]], expected: [], unordered: true },
        { args: [[1, 2]], expected: ["1->2"], unordered: true },
      ],
      harness: { args: ["tree"], output: "raw" },
      approach:
        "DFS carrying the path *built so far* as a parameter. Because the string is passed down (not mutated), each branch automatically gets its own copy — no explicit backtracking needed. Record a result only at a **leaf** (no left and no right child). O(n) nodes, and the path strings are the extra space.",
      docAnchor: "dfs",
    },
    {
      slug: "path-sum-iii",
      title: "Path Sum III",
      difficulty: "Medium",
      category: "dfs",
      blurb: "Count downward paths summing to target (any start).",
      statement: [
        "Given the `root` of a binary tree and a `targetSum`, return the **number of paths** that sum to the target. Paths must go downward (parent → child) but need not start at the root or end at a leaf.",
        "Canonical must-do (AM-600 Trees / DFS family).",
      ],
      examples: [
        { input: "root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8", output: "3" },
        { input: "root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22", output: "3" },
      ],
      constraints: ["0 <= number of nodes <= 1000", "-10^9 <= values <= 10^9"],
      fnName: "pathSumIII",
      starter: `function pathSumIII(root, targetSum) {\n  \n}`,
      solution: `function pathSumIII(root, targetSum) {\n  const prefix = new Map();\n  prefix.set(0, 1);\n  let count = 0;\n  function dfs(node, sum) {\n    if (!node) return;\n    sum += node.val;\n    count += prefix.get(sum - targetSum) || 0;\n    prefix.set(sum, (prefix.get(sum) || 0) + 1);\n    dfs(node.left, sum);\n    dfs(node.right, sum);\n    prefix.set(sum, prefix.get(sum) - 1);\n  }\n  dfs(root, 0);\n  return count;\n}`,
      tests: [
        { args: [[10, 5, -3, 3, 2, null, 11, 3, -2, null, 1], 8], expected: 3 },
        { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22], expected: 3 },
        { args: [[1], 1], expected: 1 },
        { args: [[], 0], expected: 0 },
      ],
      harness: { args: ["tree", "raw"], output: "raw" },
      approach:
        "The brute force (start a fresh DFS at every node) is O(n²). The trick is the **prefix-sum hash map** from subarray-sum-equals-k, lifted onto a tree: track the running sum from the root, and at each node add `count[runningSum - target]` — the number of earlier ancestors whose prefix makes a valid path ending here. Crucially, **decrement the map on the way back up** so sums from one branch never leak into a sibling. O(n).",
      docAnchor: "dfs",
    },
    {
      slug: "number-of-enclaves",
      title: "Number of Enclaves",
      difficulty: "Medium",
      category: "dfs",
      blurb: "Land cells that can't walk off the grid.",
      statement: [
        "Given a binary `grid` where `1` is land and `0` is sea, you may walk between adjacent land cells or off the grid's border. Return the number of land cells from which you **cannot** walk off the border.",
        "Canonical must-do (AM-600 DFS family).",
      ],
      examples: [
        { input: "grid = [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]", output: "3" },
        { input: "grid = [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]]", output: "0" },
      ],
      constraints: ["1 <= rows, cols <= 500"],
      fnName: "numEnclaves",
      starter: `function numEnclaves(grid) {\n  \n}`,
      solution: `function numEnclaves(grid) {\n  const m = grid.length, n = grid[0].length;\n  function dfs(i, j) {\n    if (i < 0 || j < 0 || i >= m || j >= n || grid[i][j] !== 1) return;\n    grid[i][j] = 0;\n    dfs(i + 1, j); dfs(i - 1, j); dfs(i, j + 1); dfs(i, j - 1);\n  }\n  for (let i = 0; i < m; i++) { dfs(i, 0); dfs(i, n - 1); }\n  for (let j = 0; j < n; j++) { dfs(0, j); dfs(m - 1, j); }\n  let count = 0;\n  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) count += grid[i][j];\n  return count;\n}`,
      tests: [
        { args: [[[0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]], expected: 3 },
        { args: [[[0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]]], expected: 0 },
        { args: [[[0, 0], [0, 0]]], expected: 0 },
      ],
      approach:
        "**Invert the question.** Instead of testing each island for escape routes, flood-fill inward from the **border** and erase every land cell reachable from outside. Whatever land survives is landlocked — just count it. One pass of border DFS plus one count, O(rows·cols). The same 'attack from the boundary' trick solves Surrounded Regions and Pacific Atlantic Water Flow.",
      docAnchor: "dfs",
    },
  ],
};
