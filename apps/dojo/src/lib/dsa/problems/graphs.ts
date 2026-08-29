/**
 * DSA — Graphs. Nodes + edges explored with DFS/BFS; grids are implicit
 * graphs (each cell adjacent to its 4 neighbours). Inputs are plain grids /
 * adjacency data — no node objects needed.
 */
import type { DsaCategory } from "../types";

export const graphs: DsaCategory = {
  id: "graphs",
  title: "Graphs",
  icon: "🕸️",
  docAnchor: "graphs",
  blurb: "DFS/BFS over grids and adjacency lists; connectivity, cycles, shortest paths, topological order.",
  problems: [
    {
      slug: "number-of-islands",
      title: "Number of Islands",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Count connected groups of land in a grid.",
      statement: [
        "Given an m×n grid of '1' (land) and '0' (water) as strings, return the number of islands. An island is land connected 4-directionally, surrounded by water.",
      ],
      examples: [
        { input: 'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]', output: "2" },
        { input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: "1" },
      ],
      constraints: ["1 <= m, n <= 300"],
      fnName: "numIslands",
      starter: "function numIslands(grid) {\n  \n}",
      solution:
        "function numIslands(grid) {\n  if (!grid.length) return 0;\n  const rows = grid.length, cols = grid[0].length;\n  let count = 0;\n  function dfs(r, c) {\n    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return;\n    grid[r][c] = '0';\n    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n  }\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === '1') { count++; dfs(r, c); }\n    }\n  }\n  return count;\n}",
      tests: [
        { args: [[["1", "1", "0"], ["1", "0", "0"], ["0", "0", "1"]]], expected: 2 },
        { args: [[["1", "1", "1"], ["0", "1", "0"], ["1", "1", "1"]]], expected: 1 },
        { args: [[["0"]]], expected: 0 },
        { args: [[["1", "0", "1"], ["0", "1", "0"], ["1", "0", "1"]]], expected: 5 },
      ],
      approach:
        "A grid is a graph where each land cell connects to its 4 neighbours. Scan for an unvisited land cell — that's a new island — and flood-fill it (DFS/BFS) to sink the whole component so it isn't recounted. Marking visited by overwriting '1'→'0' avoids a separate visited set. O(m·n): every cell is touched a constant number of times. Flood fill is the go-to for 'count/size of connected regions'.",
      docAnchor: "graphs",
    },
    {
      slug: "max-area-of-island",
      title: "Max Area of Island",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Size of the largest connected land region.",
      statement: [
        "Given an m×n binary grid (1 = land, 0 = water), return the area (cell count) of the largest island, or 0 if there is none.",
      ],
      examples: [
        { input: "grid = [[0,0,1,0],[0,1,1,0],[0,0,0,1]]", output: "3" },
        { input: "grid = [[0,0,0],[0,0,0]]", output: "0" },
      ],
      constraints: ["1 <= m, n <= 50"],
      fnName: "maxAreaOfIsland",
      starter: "function maxAreaOfIsland(grid) {\n  \n}",
      solution:
        "function maxAreaOfIsland(grid) {\n  const rows = grid.length, cols = grid[0].length;\n  let best = 0;\n  function dfs(r, c) {\n    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== 1) return 0;\n    grid[r][c] = 0;\n    return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);\n  }\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === 1) best = Math.max(best, dfs(r, c));\n    }\n  }\n  return best;\n}",
      tests: [
        { args: [[[0, 0, 1, 0], [0, 1, 1, 0], [0, 0, 0, 1]]], expected: 3 },
        { args: [[[0, 0, 0], [0, 0, 0]]], expected: 0 },
        { args: [[[1, 1], [1, 1]]], expected: 4 },
        { args: [[[1, 0, 1], [0, 0, 0], [1, 1, 1]]], expected: 3 },
      ],
      approach:
        "Same flood fill as counting islands, but the DFS RETURNS the size of the component it sinks: 1 for the current cell plus the sizes flooded in each direction. Track the max across all starting cells. O(m·n). Turning a DFS into a value-returning recursion (area, sum, depth) is a small but powerful shift.",
      docAnchor: "graphs",
    },
    {
      slug: "course-schedule",
      title: "Course Schedule",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Can all courses be finished given prerequisites? (cycle detection)",
      statement: [
        "There are `numCourses` labelled 0..n−1. `prerequisites[i] = [a, b]` means you must take b before a. Return `true` if you can finish every course.",
      ],
      examples: [
        { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true" },
        { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false" },
      ],
      constraints: ["1 <= numCourses <= 2000"],
      fnName: "canFinish",
      starter: "function canFinish(numCourses, prerequisites) {\n  \n}",
      solution:
        "function canFinish(numCourses, prerequisites) {\n  const adj = Array.from({ length: numCourses }, () => []);\n  for (const [a, b] of prerequisites) adj[a].push(b);\n  const state = new Array(numCourses).fill(0); // 0 = unvisited, 1 = visiting, 2 = done\n  function dfs(node) {\n    if (state[node] === 1) return false; // back-edge → cycle\n    if (state[node] === 2) return true;\n    state[node] = 1;\n    for (const next of adj[node]) if (!dfs(next)) return false;\n    state[node] = 2;\n    return true;\n  }\n  for (let i = 0; i < numCourses; i++) if (!dfs(i)) return false;\n  return true;\n}",
      tests: [
        { args: [2, [[1, 0]]], expected: true },
        { args: [2, [[1, 0], [0, 1]]], expected: false },
        { args: [4, [[1, 0], [2, 1], [3, 2]]], expected: true },
        { args: [3, [[0, 1], [1, 2], [2, 0]]], expected: false },
      ],
      approach:
        "Prerequisites form a directed graph; you can finish everything iff it has no cycle (a topological order exists). Do a DFS with three colours: unvisited, 'currently on the stack' (visiting), and done. Reaching a node that's still 'visiting' means a back edge — a cycle — so return false. O(V + E). Cycle detection via the visiting/done distinction is the core of dependency and build-order problems.",
      docAnchor: "graphs",
    },
    {
      slug: "number-of-connected-components",
      title: "Number of Connected Components",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Count connected components in an undirected graph.",
      statement: [
        "Given `n` nodes labelled 0..n−1 and a list of undirected `edges`, return the number of connected components.",
      ],
      examples: [
        { input: "n = 5, edges = [[0,1],[1,2],[3,4]]", output: "2" },
        { input: "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]", output: "1" },
      ],
      constraints: ["1 <= n <= 2000"],
      fnName: "countComponents",
      starter: "function countComponents(n, edges) {\n  \n}",
      solution:
        "function countComponents(n, edges) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  function find(x) {\n    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }\n    return x;\n  }\n  let count = n;\n  for (const [a, b] of edges) {\n    const ra = find(a), rb = find(b);\n    if (ra !== rb) { parent[ra] = rb; count--; }\n  }\n  return count;\n}",
      tests: [
        { args: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
        { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expected: 1 },
        { args: [4, []], expected: 4 },
        { args: [1, []], expected: 1 },
      ],
      approach:
        "Union-Find (disjoint set union): start with n components, and every edge that joins two DIFFERENT sets merges them and decrements the count. `find` with path compression keeps it near-O(1) amortised, so the whole thing is ~O(V + E·α). Union-Find is the specialist tool for connectivity and 'are these two in the same group?' — often simpler than a DFS for this exact question.",
      docAnchor: "graphs",
    },
    {
      slug: "rotting-oranges",
      title: "Rotting Oranges",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Minutes until all oranges rot (multi-source BFS).",
      statement: [
        "In a grid, 0 = empty, 1 = fresh orange, 2 = rotten. Each minute, a rotten orange rots its 4-directional fresh neighbours. Return the minutes until none are fresh, or -1 if some can never rot.",
      ],
      examples: [
        { input: "grid = [[2,1,1],[1,1,0],[0,1,1]]", output: "4" },
        { input: "grid = [[2,1,1],[0,1,1],[1,0,1]]", output: "-1" },
      ],
      constraints: ["1 <= m, n <= 10"],
      fnName: "orangesRotting",
      starter: "function orangesRotting(grid) {\n  \n}",
      solution:
        "function orangesRotting(grid) {\n  const rows = grid.length, cols = grid[0].length;\n  let fresh = 0;\n  let queue = [];\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === 2) queue.push([r, c]);\n      else if (grid[r][c] === 1) fresh++;\n    }\n  }\n  let minutes = 0;\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  while (queue.length && fresh > 0) {\n    const next = [];\n    for (const [r, c] of queue) {\n      for (const [dr, dc] of dirs) {\n        const nr = r + dr, nc = c + dc;\n        if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && grid[nr][nc] === 1) {\n          grid[nr][nc] = 2;\n          fresh--;\n          next.push([nr, nc]);\n        }\n      }\n    }\n    queue = next;\n    minutes++;\n  }\n  return fresh === 0 ? minutes : -1;\n}",
      tests: [
        { args: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expected: 4 },
        { args: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expected: -1 },
        { args: [[[0, 2]]], expected: 0 },
        { args: [[[1]]], expected: -1 },
      ],
      approach:
        "This is BFS from MANY sources at once: seed the queue with every rotten orange, then expand level by level, each level being one minute. Multi-source BFS finds the simultaneous shortest 'infection' time. Count remaining fresh oranges to detect the unreachable case (-1). O(m·n). BFS layers = time/distance is the key intuition; multiple sources just start the wavefront wider.",
      docAnchor: "graphs",
    },
    {
      slug: "pacific-atlantic-water-flow",
      title: "Pacific Atlantic Water Flow",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Cells from which water can reach both oceans.",
      statement: [
        "Given an m×n `heights` grid, the Pacific touches the top and left edges, the Atlantic the bottom and right. Water flows from a cell to an equal-or-lower neighbour. Return all cells [r, c] from which water can reach BOTH oceans (any order).",
      ],
      examples: [
        { input: "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]", output: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]" },
        { input: "heights = [[1]]", output: "[[0,0]]" },
      ],
      constraints: ["1 <= m, n <= 200"],
      fnName: "pacificAtlantic",
      starter: "function pacificAtlantic(heights) {\n  \n}",
      solution:
        "function pacificAtlantic(heights) {\n  const rows = heights.length, cols = heights[0].length;\n  const pac = Array.from({ length: rows }, () => new Array(cols).fill(false));\n  const atl = Array.from({ length: rows }, () => new Array(cols).fill(false));\n  function dfs(r, c, seen, prev) {\n    if (r < 0 || c < 0 || r >= rows || c >= cols || seen[r][c] || heights[r][c] < prev) return;\n    seen[r][c] = true;\n    dfs(r + 1, c, seen, heights[r][c]);\n    dfs(r - 1, c, seen, heights[r][c]);\n    dfs(r, c + 1, seen, heights[r][c]);\n    dfs(r, c - 1, seen, heights[r][c]);\n  }\n  for (let c = 0; c < cols; c++) { dfs(0, c, pac, -Infinity); dfs(rows - 1, c, atl, -Infinity); }\n  for (let r = 0; r < rows; r++) { dfs(r, 0, pac, -Infinity); dfs(r, cols - 1, atl, -Infinity); }\n  const res = [];\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (pac[r][c] && atl[r][c]) res.push([r, c]);\n    }\n  }\n  return res;\n}",
      harness: { output: "raw" },
      tests: [
        { args: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]], expected: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]], unordered: true },
        { args: [[[1]]], expected: [[0, 0]], unordered: true },
        { args: [[[2, 1], [1, 2]]], expected: [[0, 0], [0, 1], [1, 0], [1, 1]], unordered: true },
      ],
      approach:
        "Don't ask 'where can each cell drain to' — invert it: from each ocean's edge cells, walk UPHILL (to equal-or-higher neighbours) marking everything that ocean can reach. Do it once per ocean, then intersect the two reachable sets. Two grid traversals instead of one-per-cell searches turns O((mn)²) into O(mn). Reversing the direction of a flow/reachability question is a powerful graph trick.",
      docAnchor: "graphs",
    },
    {
      slug: "graph-valid-tree",
      title: "Graph Valid Tree",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Do these edges form exactly a tree?",
      statement: [
        "Given `n` nodes (0..n−1) and an undirected edge list, return whether the edges form a VALID TREE: connected and acyclic.",
      ],
      examples: [
        { input: "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]", output: "true" },
        { input: "n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]", output: "false", explanation: "1-2-3 forms a cycle." },
      ],
      constraints: ["1 <= n <= 2000"],
      fnName: "validTree",
      starter: "function validTree(n, edges) {\n  \n}",
      solution:
        "function validTree(n, edges) {\n  if (edges.length !== n - 1) return false;\n  const adj = Array.from({ length: n }, () => []);\n  for (const [a, b] of edges) {\n    adj[a].push(b);\n    adj[b].push(a);\n  }\n  const seen = new Set([0]);\n  const stack = [0];\n  while (stack.length) {\n    const v = stack.pop();\n    for (const nb of adj[v]) {\n      if (!seen.has(nb)) {\n        seen.add(nb);\n        stack.push(nb);\n      }\n    }\n  }\n  return seen.size === n;\n}",
      tests: [
        { args: [5, [[0, 1], [0, 2], [0, 3], [1, 4]]], expected: true },
        { args: [5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]], expected: false },
        { args: [1, []], expected: true },
        { args: [4, [[0, 1], [2, 3]]], expected: false },
      ],
      approach:
        "Lean on the graph-theory fact that does most of the work: a graph on n nodes is a tree IFF it has exactly n − 1 edges AND is connected — given the edge count, acyclicity and connectivity imply each other (a cycle would 'waste' an edge, disconnecting something). So: check the count (O(1) rejection), then one DFS from node 0 and compare visited count to n. Test 4 shows why the count alone isn't enough: right number of edges, but two islands. Counting arguments before traversal — cheap necessary conditions first — is good graph hygiene generally.",
      docAnchor: "graphs",
    },
    {
      slug: "redundant-connection",
      title: "Redundant Connection",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Find the edge that closed the cycle — Union-Find's debut.",
      statement: [
        "A tree of n nodes got ONE extra edge. Given the edge list, return the edge that can be removed to restore a tree — if several qualify, the one appearing LAST in the input.",
      ],
      examples: [
        { input: "edges = [[1,2],[1,3],[2,3]]", output: "[2,3]" },
        { input: "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]", output: "[1,4]" },
      ],
      constraints: ["3 <= n <= 1000", "Nodes are 1..n"],
      fnName: "findRedundantConnection",
      starter: "function findRedundantConnection(edges) {\n  \n}",
      solution:
        "function findRedundantConnection(edges) {\n  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);\n  function find(x) {\n    while (parent[x] !== x) {\n      parent[x] = parent[parent[x]]; // path halving\n      x = parent[x];\n    }\n    return x;\n  }\n  for (const [a, b] of edges) {\n    const ra = find(a);\n    const rb = find(b);\n    if (ra === rb) return [a, b];\n    parent[ra] = rb;\n  }\n  return [];\n}",
      tests: [
        { args: [[[1, 2], [1, 3], [2, 3]]], expected: [2, 3] },
        { args: [[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], expected: [1, 4] },
        { args: [[[1, 2], [2, 3], [1, 3]]], expected: [1, 3] },
      ],
      approach:
        "Meet UNION-FIND (disjoint set union), the third graph tool after DFS/BFS. Each node points toward a representative 'root'; find() follows the chain (with path-halving so chains stay flat), union() links two roots. Process edges in order: an edge whose endpoints ALREADY share a root would close a cycle — and since it's the first such edge encountered, it's also the last-in-input one that qualifies. Near-O(1) amortized per operation. DFS could find the cycle too, but DSU answers 'are these connected YET?' incrementally — which is exactly what Kruskal's MST and dynamic-connectivity problems need next.",
      docAnchor: "graphs",
    },
    {
      slug: "network-delay-time",
      title: "Network Delay Time",
      difficulty: "Medium",
      category: "graphs",
      blurb: "When does the slowest node hear the signal? Dijkstra.",
      statement: [
        "`times[i] = [u, v, w]`: a signal takes `w` ms from node `u` to node `v` (directed). A signal starts at node `k`. Return the time for ALL `n` nodes to receive it, or `-1` if some node never does.",
      ],
      examples: [
        { input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", output: "2" },
        { input: "times = [[1,2,1]], n = 2, k = 2", output: "-1" },
      ],
      constraints: ["1 <= k <= n <= 100", "1 <= w <= 100"],
      fnName: "networkDelayTime",
      starter: "function networkDelayTime(times, n, k) {\n  \n}",
      solution:
        "function networkDelayTime(times, n, k) {\n  const adj = Array.from({ length: n + 1 }, () => []);\n  for (const [u, v, w] of times) adj[u].push([v, w]);\n  const dist = new Array(n + 1).fill(Infinity);\n  dist[k] = 0;\n  const done = new Array(n + 1).fill(false);\n  for (let iter = 0; iter < n; iter++) {\n    let u = -1;\n    for (let i = 1; i <= n; i++) {\n      if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i;\n    }\n    if (u === -1 || dist[u] === Infinity) break;\n    done[u] = true;\n    for (const [v, w] of adj[u]) {\n      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n    }\n  }\n  let max = 0;\n  for (let i = 1; i <= n; i++) max = Math.max(max, dist[i]);\n  return max === Infinity ? -1 : max;\n}",
      tests: [
        { args: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], expected: 2 },
        { args: [[[1, 2, 1]], 2, 1], expected: 1 },
        { args: [[[1, 2, 1]], 2, 2], expected: -1 },
        { args: [[[1, 2, 1], [2, 3, 2], [1, 3, 4]], 3, 1], expected: 3 },
      ],
      approach:
        "WEIGHTED shortest paths — BFS's ring-counting breaks the moment edges have different costs, and Dijkstra replaces it: repeatedly finalize the unvisited node with the smallest tentative distance (greedy, valid because all weights are non-negative — a future path into it can't be shorter), then relax its outgoing edges. Shown with O(n²) linear min-selection — perfectly right for n ≤ 100 and pedagogically bare; swap in a min-heap for the O(E log V) version on big sparse graphs (JS: hand-rolled heap, see the Heap category). The answer is the LARGEST finalized distance: the last node to hear the news. Test 4's direct-vs-detour (4 vs 1+2) is the relaxation step earning its keep.",
      docAnchor: "graphs",
    },
    {
      slug: "min-cost-to-connect-all-points",
      title: "Min Cost to Connect All Points",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Cheapest wiring connecting every point — a minimum spanning tree.",
      statement: [
        "Connect all `points` (Manhattan distance = cost between any two) so every point reaches every other, at minimum total cost. Return that cost.",
      ],
      examples: [
        { input: "points = [[0,0],[2,2],[3,10],[5,2],[7,0]]", output: "20" },
        { input: "points = [[3,12],[-2,5],[-4,1]]", output: "18" },
      ],
      constraints: ["1 <= points.length <= 1000", "All points distinct"],
      fnName: "minCostConnectPoints",
      starter: "function minCostConnectPoints(points) {\n  \n}",
      solution:
        "function minCostConnectPoints(points) {\n  const n = points.length;\n  const inTree = new Array(n).fill(false);\n  const minDist = new Array(n).fill(Infinity);\n  minDist[0] = 0;\n  let total = 0;\n  for (let iter = 0; iter < n; iter++) {\n    let u = -1;\n    for (let i = 0; i < n; i++) {\n      if (!inTree[i] && (u === -1 || minDist[i] < minDist[u])) u = i;\n    }\n    inTree[u] = true;\n    total += minDist[u];\n    for (let v = 0; v < n; v++) {\n      if (!inTree[v]) {\n        const d =\n          Math.abs(points[u][0] - points[v][0]) +\n          Math.abs(points[u][1] - points[v][1]);\n        if (d < minDist[v]) minDist[v] = d;\n      }\n    }\n  }\n  return total;\n}",
      tests: [
        { args: [[[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]], expected: 20 },
        { args: [[[3, 12], [-2, 5], [-4, 1]]], expected: 18 },
        { args: [[[0, 0]]], expected: 0 },
        { args: [[[0, 0], [1, 1], [1, 0], [-1, 1]]], expected: 4 },
      ],
      approach:
        "The MINIMUM SPANNING TREE problem, solved with Prim's algorithm — and notice it is Dijkstra's twin: the same 'pick the cheapest unvisited node, then update neighbours' loop, except minDist[v] holds the cheapest SINGLE EDGE connecting v to the tree, not a path total. The greedy is justified by the cut property: the lightest edge crossing any tree/non-tree divide is always safe. This graph is COMPLETE (every pair connected), which is precisely when O(n²) Prim beats heap-based Prim and Kruskal — no edge list to sort, just scan. Kruskal (sort edges + the Union-Find you just met) is the alternative when edges are sparse.",
      docAnchor: "graphs",
    },
    {
      slug: "course-schedule-ii",
      title: "Course Schedule II (build order)",
      difficulty: "Medium",
      category: "graphs",
      blurb: "A valid order to take all courses (topological sort).",
      statement: [
        "There are `numCourses` courses labeled `0…numCourses-1`. `prerequisites[i] = [a, b]` means you must take course `b` **before** course `a`. Return a valid order to finish all courses. If several are valid, return the **lexicographically smallest** one (always take the lowest-numbered available course next). If it's impossible (a cycle), return `[]`.",
        "From *interactive-coding-challenges* (Graphs & Trees: find a build order given projects and dependencies).",
      ],
      examples: [
        { input: "numCourses = 2, prerequisites = [[1,0]]", output: "[0,1]", explanation: "Take 0, then 1." },
        { input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]", output: "[0,1,2,3]" },
      ],
      constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= numCourses·(numCourses-1)"],
      fnName: "findOrder",
      starter: `function findOrder(numCourses, prerequisites) {\n  \n}`,
      solution: `function findOrder(numCourses, prerequisites) {\n  const adj = Array.from({ length: numCourses }, () => []);\n  const indeg = new Array(numCourses).fill(0);\n  for (const [a, b] of prerequisites) {\n    adj[b].push(a);\n    indeg[a]++;\n  }\n  const ready = [];\n  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) ready.push(i);\n  const order = [];\n  while (ready.length) {\n    ready.sort((x, y) => x - y);\n    const u = ready.shift();\n    order.push(u);\n    for (const v of adj[u]) {\n      if (--indeg[v] === 0) ready.push(v);\n    }\n  }\n  return order.length === numCourses ? order : [];\n}`,
      tests: [
        { args: [2, [[1, 0]]], expected: [0, 1] },
        { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: [0, 1, 2, 3] },
        { args: [1, []], expected: [0] },
        { args: [2, [[0, 1], [1, 0]]], expected: [] },
      ],
      approach:
        "This is **topological sort** via Kahn's algorithm: count each course's incoming prerequisites (in-degree), start with the ones that have none, and repeatedly take a ready course and 'remove' it — decrementing its dependents' in-degrees, which unlocks new ready courses. If you process fewer than all courses, a **cycle** exists (impossible). Picking the smallest ready course each step (a sorted ready-set) makes the answer deterministic; a plain queue returns any valid order.",
      docAnchor: "graphs",
    },
    {
      slug: "find-the-town-judge",
      title: "Find the Town Judge",
      difficulty: "Easy",
      category: "graphs",
      blurb: "Who is trusted by all but trusts no one?",
      statement: [
        "In a town of `n` people (1..n), a **judge** trusts nobody, is trusted by everyone else, and there is at most one. `trust[i] = [a, b]` means person `a` trusts person `b`. Return the judge's label, or `-1`.",
        "Canonical must-do (AM-600 Graphs family).",
      ],
      examples: [
        { input: "n = 2, trust = [[1,2]]", output: "2" },
        { input: "n = 3, trust = [[1,3],[2,3],[3,1]]", output: "-1" },
      ],
      constraints: ["1 <= n <= 1000"],
      fnName: "findJudge",
      starter: `function findJudge(n, trust) {\n  \n}`,
      solution: `function findJudge(n, trust) {\n  const score = new Array(n + 1).fill(0);\n  for (const [a, b] of trust) {\n    score[a]--;\n    score[b]++;\n  }\n  for (let i = 1; i <= n; i++) {\n    if (score[i] === n - 1) return i;\n  }\n  return -1;\n}`,
      tests: [
        { args: [2, [[1, 2]]], expected: 2 },
        { args: [3, [[1, 3], [2, 3]]], expected: 3 },
        { args: [3, [[1, 3], [2, 3], [3, 1]]], expected: -1 },
        { args: [1, []], expected: 1 },
      ],
      approach:
        "Think in **degrees**: each 'a trusts b' is an out-edge for a and an in-edge for b. Give each person a score of (in-degree − out-degree). The judge is trusted by all n−1 others and trusts no one, so their score is exactly `n-1`; nobody else can reach that. One pass to score, one to find. O(V + E), O(V) space — a graph problem that dissolves into simple counting.",
      docAnchor: "graphs",
    },
    {
      slug: "is-graph-bipartite",
      title: "Is Graph Bipartite?",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Can the nodes be 2-colored with no same-color edge?",
      statement: [
        "Given an undirected graph as an adjacency list (`graph[u]` lists u's neighbours), return `true` if it is **bipartite** — its nodes can be split into two sets so that every edge connects the two sets (equivalently, it's 2-colorable).",
        "Canonical must-do (AM-600 Graphs family).",
      ],
      examples: [
        { input: "graph = [[1,3],[0,2],[1,3],[0,2]]", output: "true" },
        { input: "graph = [[1,2,3],[0,2],[0,1,3],[0,2]]", output: "false" },
      ],
      constraints: ["1 <= graph.length <= 100"],
      fnName: "isBipartite",
      starter: `function isBipartite(graph) {\n  \n}`,
      solution: `function isBipartite(graph) {\n  const n = graph.length;\n  const color = new Array(n).fill(0);\n  for (let start = 0; start < n; start++) {\n    if (color[start] !== 0) continue;\n    const queue = [start];\n    color[start] = 1;\n    while (queue.length) {\n      const u = queue.shift();\n      for (const v of graph[u]) {\n        if (color[v] === 0) { color[v] = -color[u]; queue.push(v); }\n        else if (color[v] === color[u]) return false;\n      }\n    }\n  }\n  return true;\n}`,
      tests: [
        { args: [[[1, 3], [0, 2], [1, 3], [0, 2]]], expected: true },
        { args: [[[1, 2, 3], [0, 2], [0, 1, 3], [0, 2]]], expected: false },
        { args: [[[]]], expected: true },
        { args: [[[1], [0]]], expected: true },
      ],
      approach:
        "Bipartite = 2-colorable = no odd-length cycle. BFS (or DFS) from each unvisited node, coloring it, then giving every neighbour the **opposite** color; if you ever meet a neighbour that already has the *same* color, an odd cycle exists → not bipartite. Loop over all start nodes to cover disconnected components. O(V + E). Graph coloring is the reusable frame (also job scheduling, conflict detection).",
      docAnchor: "graphs",
    },
    {
      slug: "number-of-provinces",
      title: "Number of Provinces",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Connected components in an adjacency matrix.",
      statement: [
        "`isConnected[i][j] = 1` means city `i` and city `j` are directly connected. A **province** is a group of directly or indirectly connected cities. Return the number of provinces.",
        "Canonical must-do (AM-600 Graphs / Union-Find family).",
      ],
      examples: [
        { input: "isConnected = [[1,1,0],[1,1,0],[0,0,1]]", output: "2" },
        { input: "isConnected = [[1,0,0],[0,1,0],[0,0,1]]", output: "3" },
      ],
      constraints: ["1 <= n <= 200", "isConnected[i][i] === 1 and the matrix is symmetric"],
      fnName: "findCircleNum",
      starter: `function findCircleNum(isConnected) {\n  \n}`,
      solution: `function findCircleNum(isConnected) {\n  const n = isConnected.length;\n  const visited = new Array(n).fill(false);\n  let count = 0;\n  function dfs(i) {\n    visited[i] = true;\n    for (let j = 0; j < n; j++) {\n      if (isConnected[i][j] === 1 && !visited[j]) dfs(j);\n    }\n  }\n  for (let i = 0; i < n; i++) {\n    if (!visited[i]) { count++; dfs(i); }\n  }\n  return count;\n}`,
      tests: [
        { args: [[[1, 1, 0], [1, 1, 0], [0, 0, 1]]], expected: 2 },
        { args: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expected: 3 },
        { args: [[[1]]], expected: 1 },
        { args: [[[1, 1], [1, 1]]], expected: 1 },
      ],
      approach:
        "Counting **connected components**: loop over every city, and each time you find an unvisited one, that's a brand-new province — increment the count and DFS to mark everything reachable from it. The adjacency *matrix* means each DFS scans a row, giving O(n²). (Union-Find is the alternative: union every connected pair, then count distinct roots — the standard 'same group?' tool.)",
      docAnchor: "graphs",
    },
    {
      slug: "find-center-of-star-graph",
      title: "Find Center of Star Graph",
      difficulty: "Easy",
      category: "graphs",
      blurb: "The one node every edge touches.",
      statement: [
        "A **star graph** has one center node connected to every other node, and no other edges. Given the `edges` of such a graph, return the center node.",
        "Canonical must-do (AM-600 Graphs family).",
      ],
      examples: [
        { input: "edges = [[1,2],[2,3],[4,2]]", output: "2" },
        { input: "edges = [[1,2],[5,1],[1,3],[1,4]]", output: "1" },
      ],
      constraints: ["3 <= n <= 10^5", "edges describes a valid star graph"],
      fnName: "findCenter",
      starter: `function findCenter(edges) {\n  \n}`,
      solution: `function findCenter(edges) {\n  const [a, b] = edges[0];\n  const [c, d] = edges[1];\n  return (a === c || a === d) ? a : b;\n}`,
      tests: [
        { args: [[[1, 2], [2, 3], [4, 2]]], expected: 2 },
        { args: [[[1, 2], [5, 1], [1, 3], [1, 4]]], expected: 1 },
        { args: [[[1, 2], [2, 3], [2, 4]]], expected: 2 },
      ],
      approach:
        "You don't need to count degrees across the whole graph — the center appears in **every** edge, so it must be the node shared by the first two edges. Compare edge 0's endpoints against edge 1's and return the common one. O(1) time and space; the naive degree-counting solution is O(E). Recognising that the problem's guarantee (it *is* a star) lets you skip the general algorithm is the lesson.",
      docAnchor: "graphs",
    },
    {
      slug: "find-eventual-safe-states",
      title: "Find Eventual Safe States",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Nodes from which every path reaches a terminal.",
      statement: [
        "In a directed graph given as an adjacency list, a node is **safe** if every possible path starting from it leads to a terminal node (one with no outgoing edges) — i.e. it can never get stuck in a cycle. Return all safe nodes in ascending order.",
        "Canonical must-do (AM-600 Graphs family).",
      ],
      examples: [
        { input: "graph = [[1,2],[2,3],[5],[0],[5],[],[]]", output: "[2,4,5,6]" },
        { input: "graph = [[1,2,3,4],[1,2],[3,4],[0,4],[]]", output: "[4]" },
      ],
      constraints: ["1 <= graph.length <= 10^4"],
      fnName: "eventualSafeNodes",
      starter: `function eventualSafeNodes(graph) {\n  \n}`,
      solution: `function eventualSafeNodes(graph) {\n  const n = graph.length;\n  const color = new Array(n).fill(0);\n  function safe(u) {\n    if (color[u] > 0) return color[u] === 2;\n    color[u] = 1;\n    for (const v of graph[u]) {\n      if (!safe(v)) return false;\n    }\n    color[u] = 2;\n    return true;\n  }\n  const res = [];\n  for (let i = 0; i < n; i++) if (safe(i)) res.push(i);\n  return res;\n}`,
      tests: [
        { args: [[[1, 2], [2, 3], [5], [0], [5], [], []]], expected: [2, 4, 5, 6] },
        { args: [[[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]], expected: [4] },
        { args: [[[]]], expected: [0] },
      ],
      approach:
        "This is **cycle detection with three-color DFS**, the standard tool for directed graphs. `0` = unvisited, `1` = *currently on the recursion stack* (in progress), `2` = proven safe. Reaching a node coloured `1` means you looped back into your own path → a cycle → unsafe. A node is safe only if **all** its successors are safe. Memoizing via the colours keeps it O(V + E). (Equivalently: reverse the edges and run a topological peel from the terminals.)",
      docAnchor: "graphs",
    },
    {
      slug: "minimum-vertices-to-reach-all-nodes",
      title: "Minimum Number of Vertices to Reach All Nodes",
      difficulty: "Medium",
      category: "graphs",
      blurb: "Smallest start set covering a DAG.",
      statement: [
        "Given a **directed acyclic graph** with `n` nodes and a list of `edges`, return the smallest set of vertices from which all nodes are reachable. (The answer is unique; return it in ascending order.)",
        "Canonical must-do (AM-600 Graphs family).",
      ],
      examples: [
        { input: "n = 6, edges = [[0,1],[0,2],[2,5],[3,4],[4,2]]", output: "[0,3]" },
        { input: "n = 5, edges = [[0,1],[2,1],[3,1],[1,4],[2,4]]", output: "[0,2,3]" },
      ],
      constraints: ["2 <= n <= 10^5", "The graph is a DAG"],
      fnName: "findSmallestSetOfVertices",
      starter: `function findSmallestSetOfVertices(n, edges) {\n  \n}`,
      solution: `function findSmallestSetOfVertices(n, edges) {\n  const hasIncoming = new Array(n).fill(false);\n  for (const [, to] of edges) hasIncoming[to] = true;\n  const res = [];\n  for (let i = 0; i < n; i++) if (!hasIncoming[i]) res.push(i);\n  return res;\n}`,
      tests: [
        { args: [6, [[0, 1], [0, 2], [2, 5], [3, 4], [4, 2]]], expected: [0, 3] },
        { args: [5, [[0, 1], [2, 1], [3, 1], [1, 4], [2, 4]]], expected: [0, 2, 3] },
        { args: [2, []], expected: [0, 1] },
      ],
      approach:
        "No traversal needed at all — reason about **in-degree**. A node with an incoming edge is reachable from someone else, so you never *need* to start there. A node with **zero in-degree** can't be reached by anyone, so it *must* be in the set. Since the graph is acyclic, those zero-in-degree nodes together reach everything. Count in-degrees, collect the zeros: O(V + E), one pass. Recognising that the DAG guarantee makes traversal unnecessary is the insight.",
      docAnchor: "graphs",
    },
  ],
};
