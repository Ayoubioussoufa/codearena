/**
 * DSA — Breadth-First Search. Explore in rings with a queue: the first time
 * BFS reaches a state is via a shortest path (unweighted). Level-by-level
 * processing and multi-source starts are the two signature moves.
 */
import type { DsaCategory } from "../types";

export const bfs: DsaCategory = {
  id: "bfs",
  title: "Breadth-First Search",
  icon: "🌊",
  docAnchor: "bfs-breadth-first-search",
  blurb:
    "Expand in rings with a queue — shortest paths in unweighted graphs, level order, and multi-source spreads.",
  problems: [
    {
      slug: "minimum-depth-of-binary-tree",
      title: "Minimum Depth of Binary Tree",
      difficulty: "Easy",
      category: "bfs",
      blurb: "Shortest root-to-leaf distance — stop at the first leaf.",
      statement: [
        "Return the minimum depth of a binary tree: the number of nodes on the shortest path from the root to any LEAF.",
        "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode`.",
      ],
      examples: [
        { input: "root = [3,9,20,null,null,15,7]", output: "2" },
        { input: "root = [2,null,3,null,4,null,5,null,6]", output: "5", explanation: "The tree is a right-leaning chain; the only leaf is at depth 5." },
      ],
      constraints: ["0 <= number of nodes <= 10^5"],
      fnName: "minDepth",
      starter: "function minDepth(root) {\n  \n}",
      solution:
        "function minDepth(root) {\n  if (!root) return 0;\n  const queue = [[root, 1]];\n  let head = 0;\n  while (head < queue.length) {\n    const [node, depth] = queue[head++];\n    if (!node.left && !node.right) return depth;\n    if (node.left) queue.push([node.left, depth + 1]);\n    if (node.right) queue.push([node.right, depth + 1]);\n  }\n  return 0;\n}",
      tests: [
        { args: [[3, 9, 20, null, null, 15, 7]], expected: 2 },
        { args: [[2, null, 3, null, 4, null, 5, null, 6]], expected: 5 },
        { args: [[]], expected: 0 },
        { args: [[1]], expected: 1 },
      ],
      harness: { args: ["tree"] },
      approach:
        "MINIMUM depth is a shortest-path question, so BFS beats DFS: the first leaf the ring-by-ring expansion touches is the shallowest one, and you stop immediately — DFS must explore everything to be sure. Two details worth copying: pair each node with its depth in the queue, and use a head index instead of shift() (shift is O(n), turning BFS quadratic). The trap: a node with ONE child is not a leaf — depth must reach an actual leaf.",
      docAnchor: "bfs-breadth-first-search",
    },
    {
      slug: "shortest-path-in-binary-matrix",
      title: "Shortest Path in Binary Matrix",
      difficulty: "Medium",
      category: "bfs",
      blurb: "8-directional shortest route across a 0-grid.",
      statement: [
        "In an `n × n` grid of 0s (open) and 1s (blocked), a clear path runs from the top-left to the bottom-right cell moving in ANY of the 8 directions through 0-cells. Return the length of the shortest clear path (number of cells), or `-1`.",
      ],
      examples: [
        { input: "grid = [[0,1],[1,0]]", output: "2" },
        { input: "grid = [[0,0,0],[1,1,0],[1,1,0]]", output: "4" },
        { input: "grid = [[1,0],[0,0]]", output: "-1", explanation: "The start cell is blocked." },
      ],
      constraints: ["1 <= n <= 100"],
      fnName: "shortestPathBinaryMatrix",
      starter: "function shortestPathBinaryMatrix(grid) {\n  \n}",
      solution:
        "function shortestPathBinaryMatrix(grid) {\n  const n = grid.length;\n  if (grid[0][0] !== 0 || grid[n - 1][n - 1] !== 0) return -1;\n  const queue = [[0, 0, 1]];\n  let head = 0;\n  grid[0][0] = 2; // mark visited\n  while (head < queue.length) {\n    const [r, c, d] = queue[head++];\n    if (r === n - 1 && c === n - 1) return d;\n    for (let dr = -1; dr <= 1; dr++) {\n      for (let dc = -1; dc <= 1; dc++) {\n        if (dr === 0 && dc === 0) continue;\n        const nr = r + dr, nc = c + dc;\n        if (nr < 0 || nc < 0 || nr >= n || nc >= n || grid[nr][nc] !== 0) continue;\n        grid[nr][nc] = 2;\n        queue.push([nr, nc, d + 1]);\n      }\n    }\n  }\n  return -1;\n}",
      tests: [
        { args: [[[0, 1], [1, 0]]], expected: 2 },
        { args: [[[0, 0, 0], [1, 1, 0], [1, 1, 0]]], expected: 4 },
        { args: [[[1, 0], [0, 0]]], expected: -1 },
        { args: [[[0]]], expected: 1 },
      ],
      approach:
        "Textbook grid BFS with an 8-direction neighbour loop (two nested −1..1 loops, skipping 0,0 — less error-prone than listing 8 pairs). Mark cells visited WHEN ENQUEUED, not when dequeued: marking late lets a cell be enqueued several times before its first dequeue, which explodes the queue. Carry the distance in the queue entry. BFS guarantees the first arrival at the goal is optimal because all edges cost 1 — the moment edges get weights, this stops working and you need Dijkstra (see the Graphs category).",
      docAnchor: "bfs-breadth-first-search",
    },
    {
      slug: "01-matrix",
      title: "01 Matrix",
      difficulty: "Medium",
      category: "bfs",
      blurb: "Distance from every cell to the nearest 0 — start from ALL zeros.",
      statement: [
        "Given an `m × n` binary matrix, return a matrix where each cell holds the distance (4-directional steps) to the NEAREST 0.",
      ],
      examples: [
        { input: "mat = [[0,0,0],[0,1,0],[0,0,0]]", output: "[[0,0,0],[0,1,0],[0,0,0]]" },
        { input: "mat = [[0,0,0],[0,1,0],[1,1,1]]", output: "[[0,0,0],[0,1,0],[1,2,1]]" },
      ],
      constraints: ["1 <= m, n <= 10^4", "1 <= m * n <= 10^4", "At least one 0 exists"],
      fnName: "updateMatrix",
      starter: "function updateMatrix(mat) {\n  \n}",
      solution:
        "function updateMatrix(mat) {\n  const R = mat.length, C = mat[0].length;\n  const dist = Array.from({ length: R }, () => new Array(C).fill(-1));\n  const queue = [];\n  for (let r = 0; r < R; r++) {\n    for (let c = 0; c < C; c++) {\n      if (mat[r][c] === 0) {\n        dist[r][c] = 0;\n        queue.push([r, c]);\n      }\n    }\n  }\n  let head = 0;\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  while (head < queue.length) {\n    const [r, c] = queue[head++];\n    for (const [dr, dc] of dirs) {\n      const nr = r + dr, nc = c + dc;\n      if (nr < 0 || nc < 0 || nr >= R || nc >= C || dist[nr][nc] !== -1) continue;\n      dist[nr][nc] = dist[r][c] + 1;\n      queue.push([nr, nc]);\n    }\n  }\n  return dist;\n}",
      tests: [
        { args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: [[0, 0, 0], [0, 1, 0], [0, 0, 0]] },
        { args: [[[0, 0, 0], [0, 1, 0], [1, 1, 1]]], expected: [[0, 0, 0], [0, 1, 0], [1, 2, 1]] },
        { args: [[[0, 1], [1, 1]]], expected: [[0, 1], [1, 2]] },
      ],
      approach:
        "MULTI-SOURCE BFS: instead of running a BFS from every 1 (O((mn)²)), seed the queue with ALL zeros at distance 0 and expand once. The wavefront grows outward from every zero simultaneously, so the first time it touches a cell it carries that cell's true nearest-zero distance. O(mn). Whenever a problem says 'distance to the nearest X' with many X's, flip it: start FROM the X's, not from each asking cell. Rotting Oranges (Graphs) is this same template with a time dimension.",
      docAnchor: "bfs-breadth-first-search",
    },
    {
      slug: "walls-and-gates",
      title: "Walls and Gates",
      difficulty: "Medium",
      category: "bfs",
      blurb: "Fill each room with its distance to the nearest gate.",
      statement: [
        "You are given a grid where `-1` is a wall, `0` is a gate, and `2147483647` (INF) is an empty room. Fill every room with the distance to its nearest gate (leave INF if unreachable) and return the grid.",
      ],
      examples: [
        {
          input: "rooms = [[INF,-1,0,INF],[INF,INF,INF,-1],[INF,-1,INF,-1],[0,-1,INF,INF]]",
          output: "[[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]",
        },
        { input: "rooms = [[-1]]", output: "[[-1]]" },
      ],
      constraints: ["1 <= rows, cols <= 250"],
      fnName: "wallsAndGates",
      starter: "function wallsAndGates(rooms) {\n  \n}",
      solution:
        "function wallsAndGates(rooms) {\n  const R = rooms.length, C = rooms[0].length;\n  const INF = 2147483647;\n  const queue = [];\n  for (let r = 0; r < R; r++) {\n    for (let c = 0; c < C; c++) {\n      if (rooms[r][c] === 0) queue.push([r, c]);\n    }\n  }\n  let head = 0;\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  while (head < queue.length) {\n    const [r, c] = queue[head++];\n    for (const [dr, dc] of dirs) {\n      const nr = r + dr, nc = c + dc;\n      if (nr < 0 || nc < 0 || nr >= R || nc >= C || rooms[nr][nc] !== INF) continue;\n      rooms[nr][nc] = rooms[r][c] + 1;\n      queue.push([nr, nc]);\n    }\n  }\n  return rooms;\n}",
      tests: [
        {
          args: [[[2147483647, -1, 0, 2147483647], [2147483647, 2147483647, 2147483647, -1], [2147483647, -1, 2147483647, -1], [0, -1, 2147483647, 2147483647]]],
          expected: [[3, -1, 0, 1], [2, 2, 1, -1], [1, -1, 2, -1], [0, -1, 3, 4]],
        },
        { args: [[[-1]]], expected: [[-1]] },
        { args: [[[0, 2147483647], [2147483647, 2147483647]]], expected: [[0, 1], [1, 2]] },
      ],
      approach:
        "Same multi-source template as 01 Matrix, with two ideas layered on: gates are the sources, and the INF value doubles as the 'not visited yet' marker — writing a distance into a room simultaneously answers it and closes it to re-visits. Walls are simply never expanded into (they fail the `=== INF` check). Notice how little code changes between 01 Matrix, this, and Rotting Oranges: multi-source BFS is one template with different costumes.",
      docAnchor: "bfs-breadth-first-search",
    },
    {
      slug: "nearest-exit-from-maze",
      title: "Nearest Exit From Entrance in Maze",
      difficulty: "Medium",
      category: "bfs",
      blurb: "Fewest steps to any border cell — except the entrance itself.",
      statement: [
        "In a maze of `\".\"` (open) and `\"+\"` (wall), starting at `entrance = [row, col]`, return the fewest steps to reach an EXIT: an open border cell other than the entrance. Return `-1` if impossible.",
      ],
      examples: [
        { input: "maze = [[\"+\",\"+\",\".\",\"+\"],[\".\",\".\",\".\",\"+\"],[\"+\",\"+\",\"+\",\".\"]], entrance = [1,2]", output: "1" },
        { input: "maze = [[\"+\",\"+\",\"+\"],[\".\",\".\",\".\"],[\"+\",\"+\",\"+\"]], entrance = [1,0]", output: "2" },
        { input: "maze = [[\".\",\"+\"]], entrance = [0,0]", output: "-1" },
      ],
      constraints: ["1 <= rows, cols <= 100", "entrance is an open cell"],
      fnName: "nearestExit",
      starter: "function nearestExit(maze, entrance) {\n  \n}",
      solution:
        "function nearestExit(maze, entrance) {\n  const R = maze.length, C = maze[0].length;\n  const [er, ec] = entrance;\n  const queue = [[er, ec, 0]];\n  let head = 0;\n  maze[er][ec] = \"+\"; // mark visited\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  while (head < queue.length) {\n    const [r, c, d] = queue[head++];\n    const isBorder = r === 0 || c === 0 || r === R - 1 || c === C - 1;\n    if (isBorder && d > 0) return d;\n    for (const [dr, dc] of dirs) {\n      const nr = r + dr, nc = c + dc;\n      if (nr < 0 || nc < 0 || nr >= R || nc >= C || maze[nr][nc] !== \".\") continue;\n      maze[nr][nc] = \"+\";\n      queue.push([nr, nc, d + 1]);\n    }\n  }\n  return -1;\n}",
      tests: [
        { args: [[["+", "+", ".", "+"], [".", ".", ".", "+"], ["+", "+", "+", "."]], [1, 2]], expected: 1 },
        { args: [[["+", "+", "+"], [".", ".", "."], ["+", "+", "+"]], [1, 0]], expected: 2 },
        { args: [[[".", "+"]], [0, 0]], expected: -1 },
      ],
      approach:
        "Plain single-source BFS; all the interest is in the GOAL TEST: an exit is a border cell with distance > 0, which cleanly excludes the entrance even when the entrance is itself on the border (test 3 exists exactly for that). Re-using the wall character '+' as the visited mark avoids allocating a visited set — a common grid-BFS economy. When a BFS problem feels tricky, check whether the trickiness lives in the goal condition rather than the traversal.",
      docAnchor: "bfs-breadth-first-search",
    },
    {
      slug: "jump-game-iii",
      title: "Jump Game III",
      difficulty: "Medium",
      category: "bfs",
      blurb: "From start, jump ±arr[i] — can you land on a zero?",
      statement: [
        "From index `i` you may jump to `i + arr[i]` or `i − arr[i]` (staying in bounds). Starting at `start`, return `true` if you can reach ANY index holding value 0.",
      ],
      examples: [
        { input: "arr = [4,2,3,0,3,1,2], start = 5", output: "true", explanation: "5 → 4 → 1 → 3." },
        { input: "arr = [3,0,2,1,2], start = 2", output: "false" },
      ],
      constraints: ["1 <= arr.length <= 5 * 10^4", "0 <= arr[i] < arr.length"],
      fnName: "canReach",
      starter: "function canReach(arr, start) {\n  \n}",
      solution:
        "function canReach(arr, start) {\n  const n = arr.length;\n  const seen = new Array(n).fill(false);\n  const queue = [start];\n  seen[start] = true;\n  let head = 0;\n  while (head < queue.length) {\n    const i = queue[head++];\n    if (arr[i] === 0) return true;\n    for (const j of [i + arr[i], i - arr[i]]) {\n      if (j >= 0 && j < n && !seen[j]) {\n        seen[j] = true;\n        queue.push(j);\n      }\n    }\n  }\n  return false;\n}",
      tests: [
        { args: [[4, 2, 3, 0, 3, 1, 2], 5], expected: true },
        { args: [[4, 2, 3, 0, 3, 1, 2], 0], expected: true },
        { args: [[3, 0, 2, 1, 2], 2], expected: false },
        { args: [[0], 0], expected: true },
      ],
      approach:
        "The graph is IMPLICIT: indices are nodes, and each node has at most two edges (i ± arr[i]) that you compute on the fly instead of storing. Everything else is standard BFS with a visited array (indices can revisit each other in cycles, so the guard is mandatory). Learning to see 'states + moves' as a graph without ever materializing an adjacency list is the bridge to the harder search problems below — locks, gene edits, word ladders.",
      docAnchor: "bfs-breadth-first-search",
    },
    {
      slug: "open-the-lock",
      title: "Open the Lock",
      difficulty: "Medium",
      category: "bfs",
      blurb: "Fewest wheel turns from 0000 to the target, avoiding deadends.",
      statement: [
        "A lock has 4 wheels, each showing 0–9 and turnable one step in either direction (9 wraps to 0). Starting from `\"0000\"`, return the minimum number of single-wheel turns to reach `target`, never landing on any code in `deadends`. Return `-1` if impossible.",
      ],
      examples: [
        { input: "deadends = [\"0201\",\"0101\",\"0102\",\"1212\",\"2002\"], target = \"0202\"", output: "6" },
        { input: "deadends = [\"8888\"], target = \"0009\"", output: "1" },
        { input: "deadends = [\"0000\"], target = \"8888\"", output: "-1" },
      ],
      constraints: ["1 <= deadends.length <= 500", "target is not \"0000\""],
      fnName: "openLock",
      starter: "function openLock(deadends, target) {\n  \n}",
      solution:
        "function openLock(deadends, target) {\n  const dead = new Set(deadends);\n  if (dead.has(\"0000\")) return -1;\n  if (target === \"0000\") return 0;\n  const seen = new Set([\"0000\"]);\n  let frontier = [\"0000\"];\n  let steps = 0;\n  while (frontier.length) {\n    steps++;\n    const next = [];\n    for (const cur of frontier) {\n      for (let i = 0; i < 4; i++) {\n        const d = cur.charCodeAt(i) - 48;\n        for (const nd of [(d + 1) % 10, (d + 9) % 10]) {\n          const s = cur.slice(0, i) + nd + cur.slice(i + 1);\n          if (seen.has(s) || dead.has(s)) continue;\n          if (s === target) return steps;\n          seen.add(s);\n          next.push(s);\n        }\n      }\n    }\n    frontier = next;\n  }\n  return -1;\n}",
      tests: [
        { args: [["0201", "0101", "0102", "1212", "2002"], "0202"], expected: 6 },
        { args: [["8888"], "0009"], expected: 1 },
        { args: [["0000"], "8888"], expected: -1 },
        { args: [["8887", "8889", "8878", "8898", "8788", "8988", "7888", "9888"], "8888"], expected: -1 },
      ],
      approach:
        "A state-space BFS: 10,000 possible codes are the nodes; each has 8 neighbours (4 wheels × 2 directions). Deadends are simply deleted nodes — merge them into the visited check. This solution shows the LEVEL-BY-LEVEL frontier style (swap arrays, increment steps per ring) as an alternative to storing the distance per entry; both are standard, and the frontier style is handy whenever 'how many rings deep am I' is the answer itself. Note (d+9)%10 for 'turn down' — the wrap-around without an if.",
      docAnchor: "bfs-breadth-first-search",
    },
    {
      slug: "perfect-squares",
      title: "Perfect Squares",
      difficulty: "Medium",
      category: "bfs",
      blurb: "Fewest perfect squares summing to n.",
      statement: [
        "Return the least number of perfect square numbers (1, 4, 9, 16, …) that sum to `n`.",
      ],
      examples: [
        { input: "n = 12", output: "3", explanation: "12 = 4 + 4 + 4 (not 9+1+1+1)." },
        { input: "n = 13", output: "2", explanation: "13 = 4 + 9." },
      ],
      constraints: ["1 <= n <= 10^4"],
      fnName: "numSquares",
      starter: "function numSquares(n) {\n  \n}",
      solution:
        "function numSquares(n) {\n  const seen = new Array(n + 1).fill(false);\n  let frontier = [n];\n  seen[n] = true;\n  let steps = 0;\n  while (frontier.length) {\n    steps++;\n    const next = [];\n    for (const cur of frontier) {\n      for (let s = 1; s * s <= cur; s++) {\n        const rest = cur - s * s;\n        if (rest === 0) return steps;\n        if (!seen[rest]) {\n          seen[rest] = true;\n          next.push(rest);\n        }\n      }\n    }\n    frontier = next;\n  }\n  return 0;\n}",
      tests: [
        { args: [12], expected: 3 },
        { args: [13], expected: 2 },
        { args: [1], expected: 1 },
        { args: [7], expected: 4 },
      ],
      approach:
        "Reframe: each 'move' subtracts a square, and you want the FEWEST moves from n to 0 — a shortest path on the numbers 0..n, so BFS level-counting answers it. The visited array is what keeps it fast: many subtraction orders reach the same remainder, and only the first (shallowest) arrival matters. This problem is also solvable with DP (dp[i] = 1 + min dp[i − s²]) — comparing the two is instructive: BFS explores by distance and can stop early; DP fills the whole table. When you only need THE minimum, BFS often wins.",
      docAnchor: "bfs-breadth-first-search",
    },
    {
      slug: "minimum-genetic-mutation",
      title: "Minimum Genetic Mutation",
      difficulty: "Medium",
      category: "bfs",
      blurb: "Fewest single-character mutations through a gene bank.",
      statement: [
        "A gene is an 8-character string over `A/C/G/T`. One mutation changes one character, and every intermediate (and final) gene must exist in `bank`. Return the minimum number of mutations from `startGene` to `endGene`, or `-1`.",
      ],
      examples: [
        { input: "startGene = \"AACCGGTT\", endGene = \"AACCGGTA\", bank = [\"AACCGGTA\"]", output: "1" },
        { input: "startGene = \"AACCGGTT\", endGene = \"AAACGGTA\", bank = [\"AACCGGTA\",\"AACCGCTA\",\"AAACGGTA\"]", output: "2" },
      ],
      constraints: ["0 <= bank.length <= 10"],
      fnName: "minMutation",
      starter: "function minMutation(startGene, endGene, bank) {\n  \n}",
      solution:
        "function minMutation(startGene, endGene, bank) {\n  const valid = new Set(bank);\n  if (!valid.has(endGene)) return -1;\n  const seen = new Set([startGene]);\n  let frontier = [startGene];\n  let steps = 0;\n  const chars = [\"A\", \"C\", \"G\", \"T\"];\n  while (frontier.length) {\n    steps++;\n    const next = [];\n    for (const gene of frontier) {\n      for (let i = 0; i < 8; i++) {\n        for (const ch of chars) {\n          if (ch === gene[i]) continue;\n          const g = gene.slice(0, i) + ch + gene.slice(i + 1);\n          if (!valid.has(g) || seen.has(g)) continue;\n          if (g === endGene) return steps;\n          seen.add(g);\n          next.push(g);\n        }\n      }\n    }\n    frontier = next;\n  }\n  return -1;\n}",
      tests: [
        { args: ["AACCGGTT", "AACCGGTA", ["AACCGGTA"]], expected: 1 },
        { args: ["AACCGGTT", "AAACGGTA", ["AACCGGTA", "AACCGCTA", "AAACGGTA"]], expected: 2 },
        { args: ["AACCGGTT", "AACCGGTA", []], expected: -1 },
      ],
      approach:
        "Identical skeleton to Open the Lock: strings are states, single-character edits are edges, and the bank acts as a whitelist (the inverse of deadends' blacklist). Generate all 8 × 3 neighbours, keep only bank members, BFS ring by ring. Checking the end gene is in the bank up front saves a doomed search. This is the warm-up for Word Ladder, where the same idea needs one more optimization to survive a large dictionary.",
      docAnchor: "bfs-breadth-first-search",
    },
    {
      slug: "word-ladder",
      title: "Word Ladder",
      difficulty: "Hard",
      category: "bfs",
      blurb: "Shortest chain of one-letter changes between two words.",
      statement: [
        "Given `beginWord`, `endWord`, and a `wordList`, each step changes exactly one letter and must land on a word in the list. Return the NUMBER OF WORDS in the shortest chain from `beginWord` to `endWord` (inclusive), or `0` if none exists.",
      ],
      examples: [
        { input: "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]", output: "5", explanation: "hit → hot → dot → dog → cog." },
        { input: "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]", output: "0" },
      ],
      constraints: ["1 <= wordList.length <= 5000", "All words have the same length"],
      fnName: "ladderLength",
      starter: "function ladderLength(beginWord, endWord, wordList) {\n  \n}",
      solution:
        "function ladderLength(beginWord, endWord, wordList) {\n  const words = new Set(wordList);\n  if (!words.has(endWord)) return 0;\n  let frontier = [beginWord];\n  words.delete(beginWord);\n  let length = 1;\n  const letters = \"abcdefghijklmnopqrstuvwxyz\";\n  while (frontier.length) {\n    length++;\n    const next = [];\n    for (const word of frontier) {\n      for (let i = 0; i < word.length; i++) {\n        for (const ch of letters) {\n          if (ch === word[i]) continue;\n          const w = word.slice(0, i) + ch + word.slice(i + 1);\n          if (!words.has(w)) continue;\n          if (w === endWord) return length;\n          words.delete(w);\n          next.push(w);\n        }\n      }\n    }\n    frontier = next;\n  }\n  return 0;\n}",
      tests: [
        { args: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]], expected: 5 },
        { args: ["hit", "cog", ["hot", "dot", "dog", "lot", "log"]], expected: 0 },
        { args: ["a", "c", ["a", "b", "c"]], expected: 2 },
      ],
      approach:
        "The capstone state-space BFS. The key efficiency move: DELETE words from the set as you enqueue them — the set itself becomes the visited structure, and each dictionary word is examined at most once, keeping the search near O(N · L · 26) instead of quadratic pair-comparisons. Generating neighbours by trying all 26 letters per position beats comparing every word pair for large dictionaries. The answer counts WORDS, not steps — hence starting length at 1. If this feels routine after Open the Lock and Genetic Mutation, that's the point: one template, many skins.",
      docAnchor: "bfs-breadth-first-search",
    },
    {
      slug: "average-of-levels-in-binary-tree",
      title: "Average of Levels in Binary Tree",
      difficulty: "Easy",
      category: "bfs",
      blurb: "Average node value on each level, top down.",
      statement: [
        "Given the `root` of a binary tree, return an array of the **average value of the nodes on each level**, from the root level downward.",
        "Canonical must-do (AM-600 BFS family).",
      ],
      examples: [
        { input: "root = [3,9,20,null,null,15,7]", output: "[3,14.5,11]" },
        { input: "root = [1,2,3]", output: "[1,2.5]" },
      ],
      constraints: ["1 <= number of nodes <= 10^4"],
      fnName: "averageOfLevels",
      starter: `function averageOfLevels(root) {\n  \n}`,
      solution: `function averageOfLevels(root) {\n  if (!root) return [];\n  const res = [];\n  let level = [root];\n  while (level.length) {\n    let sum = 0;\n    const next = [];\n    for (const node of level) {\n      sum += node.val;\n      if (node.left) next.push(node.left);\n      if (node.right) next.push(node.right);\n    }\n    res.push(sum / level.length);\n    level = next;\n  }\n  return res;\n}`,
      tests: [
        { args: [[3, 9, 20, null, null, 15, 7]], expected: [3, 14.5, 11] },
        { args: [[1]], expected: [1] },
        { args: [[1, 2, 3]], expected: [1, 2.5] },
        { args: [[5, 3, 8]], expected: [5, 5.5] },
      ],
      harness: { args: ["tree"], output: "raw" },
      approach:
        "Level-by-level BFS using the **frontier-swap** form: hold the current level in an array, sum its values while collecting all its children into the next array, record `sum / level.length`, then move on. Keeping whole levels (rather than a flat queue) is what makes 'per level' aggregates trivial — no need to track depths or sentinel markers. O(n).",
      docAnchor: "bfs",
    },
    {
      slug: "binary-tree-zigzag-level-order",
      title: "Binary Tree Zigzag Level Order Traversal",
      difficulty: "Medium",
      category: "bfs",
      blurb: "Level order, alternating left→right and right→left.",
      statement: [
        "Given the `root` of a binary tree, return its **zigzag level order traversal**: the first level left-to-right, the next right-to-left, alternating thereafter.",
        "Canonical must-do (AM-600 BFS family).",
      ],
      examples: [
        { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[20,9],[15,7]]" },
        { input: "root = [1]", output: "[[1]]" },
      ],
      constraints: ["0 <= number of nodes <= 2000"],
      fnName: "zigzagLevelOrder",
      starter: `function zigzagLevelOrder(root) {\n  \n}`,
      solution: `function zigzagLevelOrder(root) {\n  if (!root) return [];\n  const res = [];\n  let level = [root];\n  let leftToRight = true;\n  while (level.length) {\n    const vals = [], next = [];\n    for (const node of level) {\n      vals.push(node.val);\n      if (node.left) next.push(node.left);\n      if (node.right) next.push(node.right);\n    }\n    res.push(leftToRight ? vals : vals.reverse());\n    leftToRight = !leftToRight;\n    level = next;\n  }\n  return res;\n}`,
      tests: [
        { args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [20, 9], [15, 7]] },
        { args: [[1]], expected: [[1]] },
        { args: [[]], expected: [] },
        { args: [[1, 2, 3, 4, 5, 6, 7]], expected: [[1], [3, 2], [4, 5, 6, 7]] },
      ],
      harness: { args: ["tree"], output: "raw" },
      approach:
        "Do a completely normal level-order BFS and just **reverse every other level's values** before recording it. Resist the urge to enqueue children in alternating order — that corrupts the next level's ordering. Flipping a boolean per level keeps the traversal itself untouched. O(n).",
      docAnchor: "bfs",
    },
    {
      slug: "as-far-from-land-as-possible",
      title: "As Far from Land as Possible",
      difficulty: "Medium",
      category: "bfs",
      blurb: "Water cell with the largest distance to any land.",
      statement: [
        "Given an `n × n` grid of `0` (water) and `1` (land), find the **water** cell whose Manhattan distance to the nearest land is maximized, and return that distance. If the grid is all land or all water, return `-1`.",
        "Canonical must-do (AM-600 BFS family).",
      ],
      examples: [
        { input: "grid = [[1,0,1],[0,0,0],[1,0,1]]", output: "2", explanation: "The centre cell is distance 2 from every land." },
        { input: "grid = [[1,0,0],[0,0,0],[0,0,0]]", output: "4" },
      ],
      constraints: ["1 <= n <= 100", "grid[i][j] is 0 or 1"],
      fnName: "maxDistance",
      starter: `function maxDistance(grid) {\n  \n}`,
      solution: `function maxDistance(grid) {\n  const n = grid.length;\n  const queue = [];\n  const dist = Array.from({ length: n }, () => new Array(n).fill(-1));\n  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {\n    if (grid[i][j] === 1) { queue.push([i, j]); dist[i][j] = 0; }\n  }\n  if (queue.length === 0 || queue.length === n * n) return -1;\n  let best = 0, head = 0;\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  while (head < queue.length) {\n    const [i, j] = queue[head++];\n    for (const [di, dj] of dirs) {\n      const ni = i + di, nj = j + dj;\n      if (ni >= 0 && nj >= 0 && ni < n && nj < n && dist[ni][nj] === -1) {\n        dist[ni][nj] = dist[i][j] + 1;\n        best = Math.max(best, dist[ni][nj]);\n        queue.push([ni, nj]);\n      }\n    }\n  }\n  return best;\n}`,
      tests: [
        { args: [[[1, 0, 1], [0, 0, 0], [1, 0, 1]]], expected: 2 },
        { args: [[[1, 0, 0], [0, 0, 0], [0, 0, 0]]], expected: 4 },
        { args: [[[1, 1], [1, 1]]], expected: -1 },
      ],
      approach:
        "**Multi-source BFS**: seed the queue with *every* land cell at distance 0 and expand outward simultaneously. Because BFS spreads in equal rings, the last water cell reached is the farthest from all land — so the answer is simply the maximum distance assigned. Doing a separate BFS per water cell would be O(n⁴); this is O(n²). Using a head index instead of `shift()` keeps the queue O(1) per pop.",
      docAnchor: "bfs",
    },
  ],
};
