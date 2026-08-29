/**
 * DSA — Trees. Recursion over a hierarchical structure: solve for a node in
 * terms of its children's answers. Inputs are LeetCode level-order arrays
 * (null = missing child), built into TreeNodes by the harness.
 */
import type { DsaCategory } from "../types";

export const trees: DsaCategory = {
  id: "trees",
  title: "Trees",
  icon: "🌳",
  docAnchor: "trees",
  blurb: "Recurse over children; DFS/BFS traversals and BST order. Inputs are level-order arrays.",
  problems: [
    {
      slug: "maximum-depth-of-binary-tree",
      title: "Maximum Depth of Binary Tree",
      difficulty: "Easy",
      category: "trees",
      blurb: "Height of a binary tree.",
      statement: [
        "Given the `root` of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to a leaf.",
        "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode` with `.val`, `.left`, `.right`.",
      ],
      examples: [
        { input: "root = [3,9,20,null,null,15,7]", output: "3" },
        { input: "root = [1,null,2]", output: "2" },
      ],
      constraints: ["0 <= number of nodes <= 10^4"],
      fnName: "maxDepth",
      starter: "function maxDepth(root) {\n  \n}",
      solution:
        "function maxDepth(root) {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}",
      harness: { args: ["tree"], output: "raw" },
      tests: [
        { args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
        { args: [[]], expected: 0 },
        { args: [[1, 2]], expected: 2 },
        { args: [[1, null, 2, null, 3]], expected: 3 },
      ],
      approach:
        "The depth of a tree is 1 + the deeper of its two subtrees, and an empty tree has depth 0 — that recurrence *is* the solution. O(n) time (each node visited once), O(h) space for the call stack where h is the height. This 'answer for a node from its children's answers' shape is the template every tree problem reuses.",
      docAnchor: "trees",
    },
    {
      slug: "same-tree",
      title: "Same Tree",
      difficulty: "Easy",
      category: "trees",
      blurb: "Are two trees structurally identical with equal values?",
      statement: [
        "Given the roots `p` and `q` of two binary trees, return `true` if they are identical in structure and node values.",
      ],
      examples: [
        { input: "p = [1,2,3], q = [1,2,3]", output: "true" },
        { input: "p = [1,2], q = [1,null,2]", output: "false" },
      ],
      constraints: ["0 <= nodes <= 100"],
      fnName: "isSameTree",
      starter: "function isSameTree(p, q) {\n  \n}",
      solution:
        "function isSameTree(p, q) {\n  if (!p && !q) return true;\n  if (!p || !q || p.val !== q.val) return false;\n  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);\n}",
      harness: { args: ["tree", "tree"], output: "raw" },
      tests: [
        { args: [[1, 2, 3], [1, 2, 3]], expected: true },
        { args: [[1, 2], [1, null, 2]], expected: false },
        { args: [[1, 2, 1], [1, 1, 2]], expected: false },
        { args: [[], []], expected: true },
      ],
      approach:
        "Two trees are the same if both roots are null, or both exist with equal values AND their left subtrees match AND their right subtrees match. The base cases (both null → equal; one null or values differ → not) do the heavy lifting; the recursion is a direct structural mirror. O(n), O(h) stack. The same 'compare structurally in lockstep' idea underlies subtree and symmetry checks.",
      docAnchor: "trees",
    },
    {
      slug: "invert-binary-tree",
      title: "Invert Binary Tree",
      difficulty: "Easy",
      category: "trees",
      blurb: "Mirror a binary tree left-to-right.",
      statement: [
        "Given the `root` of a binary tree, invert it (swap every node's left and right subtrees) and return the root.",
        "Return the tree; the harness serializes it back to a level-order array.",
      ],
      examples: [
        { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]" },
        { input: "root = [2,1,3]", output: "[2,3,1]" },
      ],
      constraints: ["0 <= nodes <= 100"],
      fnName: "invertTree",
      starter: "function invertTree(root) {\n  \n}",
      solution:
        "function invertTree(root) {\n  if (!root) return null;\n  const left = invertTree(root.left);\n  const right = invertTree(root.right);\n  root.left = right;\n  root.right = left;\n  return root;\n}",
      harness: { args: ["tree"], output: "tree" },
      tests: [
        { args: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1] },
        { args: [[2, 1, 3]], expected: [2, 3, 1] },
        { args: [[]], expected: [] },
        { args: [[1, 2]], expected: [1, null, 2] },
      ],
      approach:
        "Invert both subtrees, then swap them at the current node — the recursion does the rest. It works top-down or bottom-up; the key is that swapping and recursing are independent. O(n) time, O(h) stack. (Famously the problem that 'you can't invert a binary tree' — it's four lines.)",
      docAnchor: "trees",
    },
    {
      slug: "balanced-binary-tree",
      title: "Balanced Binary Tree",
      difficulty: "Easy",
      category: "trees",
      blurb: "Is every node's two subtrees within height 1?",
      statement: [
        "Given the `root` of a binary tree, return `true` if it is height-balanced: for every node, the heights of its left and right subtrees differ by at most 1.",
      ],
      examples: [
        { input: "root = [3,9,20,null,null,15,7]", output: "true" },
        { input: "root = [1,2,2,3,3,null,null,4,4]", output: "false" },
      ],
      constraints: ["0 <= nodes <= 5000"],
      fnName: "isBalanced",
      starter: "function isBalanced(root) {\n  \n}",
      solution:
        "function isBalanced(root) {\n  function height(node) {\n    if (!node) return 0;\n    const l = height(node.left);\n    if (l === -1) return -1;\n    const r = height(node.right);\n    if (r === -1) return -1;\n    if (Math.abs(l - r) > 1) return -1;\n    return 1 + Math.max(l, r);\n  }\n  return height(root) !== -1;\n}",
      harness: { args: ["tree"], output: "raw" },
      tests: [
        { args: [[3, 9, 20, null, null, 15, 7]], expected: true },
        { args: [[1, 2, 2, 3, 3, null, null, 4, 4]], expected: false },
        { args: [[]], expected: true },
        { args: [[1, 2, null, 3]], expected: false },
      ],
      approach:
        "The naïve solution recomputes heights at every node — O(n²). The trick is to compute height and balance in ONE bottom-up pass: return the real height, or a sentinel −1 the instant any subtree is unbalanced, which propagates straight up. O(n), O(h). Folding a second answer (balance) into a single traversal is a recurring optimization for tree problems.",
      docAnchor: "trees",
    },
    {
      slug: "diameter-of-binary-tree",
      title: "Diameter of Binary Tree",
      difficulty: "Easy",
      category: "trees",
      blurb: "Longest path between any two nodes (in edges).",
      statement: [
        "Given the `root` of a binary tree, return its diameter — the number of edges on the longest path between any two nodes. The path need not pass through the root.",
      ],
      examples: [
        { input: "root = [1,2,3,4,5]", output: "3", explanation: "Path 4→2→1→3 or 5→2→1→3." },
        { input: "root = [1,2]", output: "1" },
      ],
      constraints: ["1 <= nodes <= 10^4"],
      fnName: "diameterOfBinaryTree",
      starter: "function diameterOfBinaryTree(root) {\n  \n}",
      solution:
        "function diameterOfBinaryTree(root) {\n  let best = 0;\n  function depth(node) {\n    if (!node) return 0;\n    const l = depth(node.left);\n    const r = depth(node.right);\n    best = Math.max(best, l + r);\n    return 1 + Math.max(l, r);\n  }\n  depth(root);\n  return best;\n}",
      harness: { args: ["tree"], output: "raw" },
      tests: [
        { args: [[1, 2, 3, 4, 5]], expected: 3 },
        { args: [[1, 2]], expected: 1 },
        { args: [[]], expected: 0 },
        { args: [[1, null, 2, null, 3]], expected: 2 },
      ],
      approach:
        "The longest path through a given node uses its left depth + right depth. So compute depth recursively, and as a side effect track the max (left + right) seen at any node — that's the diameter. One O(n) traversal, O(h) stack. 'Compute one thing, track a global best on the side' is the pattern for max-path-sum and many tree optima.",
      docAnchor: "trees",
    },
    {
      slug: "binary-tree-level-order-traversal",
      title: "Binary Tree Level Order Traversal",
      difficulty: "Medium",
      category: "trees",
      blurb: "Values grouped level by level (BFS).",
      statement: [
        "Given the `root` of a binary tree, return its level-order traversal: a list of levels, each a list of node values left to right.",
      ],
      examples: [
        { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
        { input: "root = []", output: "[]" },
      ],
      constraints: ["0 <= nodes <= 2000"],
      fnName: "levelOrder",
      starter: "function levelOrder(root) {\n  \n}",
      solution:
        "function levelOrder(root) {\n  if (!root) return [];\n  const res = [];\n  let queue = [root];\n  while (queue.length) {\n    const level = [];\n    const next = [];\n    for (const node of queue) {\n      level.push(node.val);\n      if (node.left) next.push(node.left);\n      if (node.right) next.push(node.right);\n    }\n    res.push(level);\n    queue = next;\n  }\n  return res;\n}",
      harness: { args: ["tree"], output: "raw" },
      tests: [
        { args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
        { args: [[]], expected: [] },
        { args: [[1]], expected: [[1]] },
        { args: [[1, 2, 3, 4, null, null, 5]], expected: [[1], [2, 3], [4, 5]] },
      ],
      approach:
        "Breadth-first: process the current level fully while collecting the next level's nodes, then swap. Handling one level per outer iteration is what lets you group values by depth (versus DFS, which would need to pass a level index). O(n) time, O(width) space for the queue. BFS is the go-to whenever 'levels' or 'shortest path in an unweighted graph' appears.",
      docAnchor: "trees",
    },
    {
      slug: "validate-binary-search-tree",
      title: "Validate Binary Search Tree",
      difficulty: "Medium",
      category: "trees",
      blurb: "Is it a valid BST?",
      statement: [
        "Given the `root` of a binary tree, return `true` if it is a valid binary search tree: every node's left subtree holds only smaller values, its right subtree only larger, and both subtrees are themselves BSTs.",
      ],
      examples: [
        { input: "root = [2,1,3]", output: "true" },
        { input: "root = [5,1,4,null,null,3,6]", output: "false", explanation: "4's subtree contains 3, which is < 5." },
      ],
      constraints: ["1 <= nodes <= 10^4"],
      fnName: "isValidBST",
      starter: "function isValidBST(root) {\n  \n}",
      solution:
        "function isValidBST(root) {\n  function valid(node, lo, hi) {\n    if (!node) return true;\n    if (node.val <= lo || node.val >= hi) return false;\n    return valid(node.left, lo, node.val) && valid(node.right, node.val, hi);\n  }\n  return valid(root, -Infinity, Infinity);\n}",
      harness: { args: ["tree"], output: "raw" },
      tests: [
        { args: [[2, 1, 3]], expected: true },
        { args: [[5, 1, 4, null, null, 3, 6]], expected: false },
        { args: [[2, 2, 2]], expected: false },
        { args: [[5, 4, 6, null, null, 3, 7]], expected: false },
      ],
      approach:
        "The classic bug is checking only node-vs-child; the real rule is that every node must fall within a (low, high) range that TIGHTENS as you descend — going left caps the high at the parent's value, going right raises the low. Pass the bounds down the recursion. O(n), O(h). (An in-order traversal producing a strictly increasing sequence is the equivalent alternative.)",
      docAnchor: "trees",
    },
    {
      slug: "lowest-common-ancestor-of-a-bst",
      title: "Lowest Common Ancestor of a BST",
      difficulty: "Medium",
      category: "trees",
      blurb: "Deepest node that is an ancestor of both values.",
      statement: [
        "Given the `root` of a binary SEARCH tree and two values `p` and `q` present in it, return the value of their lowest common ancestor (the deepest node having both in its subtrees; a node can be an ancestor of itself).",
        "Here `p` and `q` are passed as plain values, and you return the LCA node's value.",
      ],
      examples: [
        { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8", output: "6" },
        { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4", output: "2" },
      ],
      constraints: ["2 <= nodes <= 10^5", "p and q exist in the tree"],
      fnName: "lowestCommonAncestor",
      starter: "function lowestCommonAncestor(root, p, q) {\n  \n}",
      solution:
        "function lowestCommonAncestor(root, p, q) {\n  let node = root;\n  while (node) {\n    if (p < node.val && q < node.val) node = node.left;\n    else if (p > node.val && q > node.val) node = node.right;\n    else return node.val;\n  }\n}",
      harness: { args: ["tree"], output: "raw" },
      tests: [
        { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8], expected: 6 },
        { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4], expected: 2 },
        { args: [[2, 1], 2, 1], expected: 2 },
        { args: [[5, 3, 8, 1, 4, 7, 9], 1, 4], expected: 3 },
      ],
      approach:
        "In a BST the ordering does the searching: if both targets are smaller than the current node, the LCA is in the left subtree; if both larger, the right; otherwise they straddle this node (or one equals it), so it IS the split point — the LCA. No recursion needed, and it's O(h) time, O(1) space. Exploiting BST order to prune is the whole point of the structure.",
      docAnchor: "trees",
    },
    {
      slug: "binary-tree-right-side-view",
      title: "Binary Tree Right Side View",
      difficulty: "Medium",
      category: "trees",
      blurb: "The rightmost node of every level.",
      statement: [
        "Standing to the right of the tree, return the values you can see, top to bottom (the last node of each level).",
        "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode`.",
      ],
      examples: [
        { input: "root = [1,2,3,null,5,null,4]", output: "[1,3,4]" },
        { input: "root = [1,null,3]", output: "[1,3]" },
        { input: "root = []", output: "[]" },
      ],
      constraints: ["0 <= number of nodes <= 100"],
      fnName: "rightSideView",
      starter: "function rightSideView(root) {\n  \n}",
      solution:
        "function rightSideView(root) {\n  if (!root) return [];\n  const res = [];\n  let level = [root];\n  while (level.length) {\n    res.push(level[level.length - 1].val);\n    const next = [];\n    for (const node of level) {\n      if (node.left) next.push(node.left);\n      if (node.right) next.push(node.right);\n    }\n    level = next;\n  }\n  return res;\n}",
      tests: [
        { args: [[1, 2, 3, null, 5, null, 4]], expected: [1, 3, 4] },
        { args: [[1, null, 3]], expected: [1, 3] },
        { args: [[]], expected: [] },
        { args: [[1, 2]], expected: [1, 2] },
      ],
      harness: { args: ["tree"] },
      approach:
        "Level-order traversal (BFS) where you keep only each level's LAST node — the whole-level-at-once style (swap `level` for `next` each round) makes 'last of the level' trivial to read off. The instructive trap: it is NOT just 'follow right children' — test 1's answer includes 4, which hangs off the LEFT subtree where the right side has run out (test 4 too). A DFS variant also works: visit right-first, record the first node seen at each new depth. Level-indexed selection questions (leftmost, largest per row) are all this skeleton.",
      docAnchor: "trees",
    },
    {
      slug: "kth-smallest-element-in-a-bst",
      title: "Kth Smallest Element in a BST",
      difficulty: "Medium",
      category: "trees",
      blurb: "In-order traversal, stopped early.",
      statement: [
        "Return the kth smallest value (1-indexed) in a binary search tree.",
        "The input is a level-order array (null marks a missing child); the harness builds it into a `TreeNode`.",
      ],
      examples: [
        { input: "root = [3,1,4,null,2], k = 1", output: "1" },
        { input: "root = [5,3,6,2,4,null,null,1], k = 3", output: "3" },
      ],
      constraints: ["1 <= k <= number of nodes <= 10^4"],
      fnName: "kthSmallest",
      starter: "function kthSmallest(root, k) {\n  \n}",
      solution:
        "function kthSmallest(root, k) {\n  const st = [];\n  let node = root;\n  while (node || st.length) {\n    while (node) {\n      st.push(node);\n      node = node.left;\n    }\n    node = st.pop();\n    k--;\n    if (k === 0) return node.val;\n    node = node.right;\n  }\n  return -1;\n}",
      tests: [
        { args: [[3, 1, 4, null, 2], 1], expected: 1 },
        { args: [[5, 3, 6, 2, 4, null, null, 1], 3], expected: 3 },
        { args: [[2, 1, 3], 3], expected: 3 },
      ],
      harness: { args: ["tree", "raw"] },
      approach:
        "The BST's defining superpower: IN-ORDER traversal visits values in sorted order, so the kth smallest is simply the kth node visited. The ITERATIVE in-order (push the whole left spine, pop, hop right) matters here specifically because it can STOP at k — the recursive version happily walks the rest of the tree unless you thread an abort flag through it. O(h + k). Follow-up worth pondering: with frequent queries, store subtree sizes in each node and descend arithmetically in O(h). In-order ⇔ sorted is the fact half of all BST problems hinge on.",
      docAnchor: "trees",
    },
    {
      slug: "convert-sorted-array-to-bst",
      title: "Convert Sorted Array to BST (minimal height)",
      difficulty: "Easy",
      category: "trees",
      blurb: "Build a balanced BST from a sorted array.",
      statement: [
        "Given a **sorted** (ascending) array of unique integers `nums`, build a **height-balanced** binary search tree and return its root. For a deterministic answer, always pick the **left-middle** element `(lo + hi) >> 1` as the subtree root.",
        "From *interactive-coding-challenges* (Graphs & Trees: BST with minimal height from a sorted array).",
      ],
      examples: [
        { input: "nums = [-10,-3,0,5,9]", output: "[0,-10,5,null,-3,null,9]", explanation: "0 is the middle; recurse on each half." },
        { input: "nums = [1,3]", output: "[1,null,3]" },
      ],
      constraints: ["1 <= nums.length <= 10^4", "nums is sorted, strictly increasing"],
      fnName: "sortedArrayToBST",
      starter: `function sortedArrayToBST(nums) {\n  \n}`,
      solution: `function sortedArrayToBST(nums) {\n  function build(lo, hi) {\n    if (lo > hi) return null;\n    const mid = (lo + hi) >> 1;\n    const node = new TreeNode(nums[mid]);\n    node.left = build(lo, mid - 1);\n    node.right = build(mid + 1, hi);\n    return node;\n  }\n  return build(0, nums.length - 1);\n}`,
      tests: [
        { args: [[-10, -3, 0, 5, 9]], expected: [0, -10, 5, null, -3, null, 9] },
        { args: [[1, 2, 3]], expected: [2, 1, 3] },
        { args: [[1, 3]], expected: [1, null, 3] },
        { args: [[7]], expected: [7] },
      ],
      harness: { args: ["raw"], output: "tree" },
      approach:
        "A balanced tree keeps its middle element at the root, so both halves have equal depth. Pick the middle of the (sorted) array as the root, then recursively build the left subtree from the left half and the right subtree from the right half. Because the array is sorted, this is automatically a valid BST *and* height-balanced — height O(log n). Divide-and-conquer on a sorted array is the same shape as binary search, but building a structure instead of finding a value.",
      docAnchor: "trees",
    },
    {
      slug: "inorder-successor-bst",
      title: "Inorder Successor in a BST",
      difficulty: "Medium",
      category: "trees",
      blurb: "Next-larger value after p in a BST.",
      statement: [
        "Given the `root` of a binary search tree and a value `p` present in it, return the value of `p`'s **in-order successor** (the smallest value strictly greater than `p`), or `null` if `p` is the largest value.",
        "From *interactive-coding-challenges* (Graphs & Trees: in-order successor in a BST).",
      ],
      examples: [
        { input: "root = [5,3,6,2,4], p = 3", output: "4" },
        { input: "root = [5,3,6,2,4], p = 6", output: "null", explanation: "6 is the largest value." },
      ],
      constraints: ["1 <= number of nodes <= 10^4", "All node values are unique; p exists in the tree"],
      fnName: "inorderSuccessor",
      starter: `function inorderSuccessor(root, p) {\n  \n}`,
      solution: `function inorderSuccessor(root, p) {\n  let succ = null;\n  let cur = root;\n  while (cur) {\n    if (cur.val > p) {\n      succ = cur.val;\n      cur = cur.left;\n    } else {\n      cur = cur.right;\n    }\n  }\n  return succ;\n}`,
      tests: [
        { args: [[5, 3, 6, 2, 4], 3], expected: 4 },
        { args: [[5, 3, 6, 2, 4], 4], expected: 5 },
        { args: [[5, 3, 6, 2, 4], 6], expected: null },
        { args: [[2, 1, 3], 1], expected: 2 },
      ],
      harness: { args: ["tree", "raw"], output: "raw" },
      approach:
        "Exploit the BST ordering instead of doing a full in-order traversal. Walk down from the root: whenever a node's value is greater than `p`, it's a *candidate* successor — record it and go **left** to look for an even smaller one that still beats `p`; otherwise go **right**. The last candidate you recorded is the answer. O(h) time, O(1) space — no traversal, no parent pointers needed.",
      docAnchor: "trees",
    },
    {
      slug: "symmetric-tree",
      title: "Symmetric Tree",
      difficulty: "Easy",
      category: "trees",
      blurb: "Is the tree a mirror image of itself?",
      statement: [
        "Given the `root` of a binary tree, return `true` if it is a **mirror of itself** (symmetric around its center).",
        "Canonical must-do (AM-600 Trees family).",
      ],
      examples: [
        { input: "root = [1,2,2,3,4,4,3]", output: "true" },
        { input: "root = [1,2,2,null,3,null,3]", output: "false" },
      ],
      constraints: ["1 <= number of nodes <= 1000"],
      fnName: "isSymmetric",
      starter: `function isSymmetric(root) {\n  \n}`,
      solution: `function isSymmetric(root) {\n  function mirror(a, b) {\n    if (!a && !b) return true;\n    if (!a || !b || a.val !== b.val) return false;\n    return mirror(a.left, b.right) && mirror(a.right, b.left);\n  }\n  return !root || mirror(root.left, root.right);\n}`,
      tests: [
        { args: [[1, 2, 2, 3, 4, 4, 3]], expected: true },
        { args: [[1, 2, 2, null, 3, null, 3]], expected: false },
        { args: [[1]], expected: true },
        { args: [[]], expected: true },
      ],
      harness: { args: ["tree"], output: "raw" },
      approach:
        "Symmetry isn't about one node — it's about two subtrees mirroring each other. Compare the left and right subtrees with a helper that checks `a.val === b.val` and then recurses on the **outer** pairs (`a.left` vs `b.right`) and **inner** pairs (`a.right` vs `b.left`). Crossing left-with-right is what encodes 'mirror'. O(n).",
      docAnchor: "trees",
    },
    {
      slug: "path-sum-ii",
      title: "Path Sum II",
      difficulty: "Medium",
      category: "trees",
      blurb: "All root-to-leaf paths that sum to the target.",
      statement: [
        "Given the `root` of a binary tree and a `targetSum`, return **all root-to-leaf paths** where the sum of the node values equals `targetSum`. Each path is the list of node values; any order of paths is accepted.",
        "Canonical must-do (AM-600 Trees / Backtracking family).",
      ],
      examples: [
        { input: "root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22", output: "[[5,4,11,2],[5,8,4,5]]" },
        { input: "root = [1,2,3], targetSum = 5", output: "[]" },
      ],
      constraints: ["0 <= number of nodes <= 5000"],
      fnName: "pathSum",
      starter: `function pathSum(root, targetSum) {\n  \n}`,
      solution: `function pathSum(root, targetSum) {\n  const res = [];\n  function dfs(node, remaining, path) {\n    if (!node) return;\n    path.push(node.val);\n    if (!node.left && !node.right && remaining === node.val) {\n      res.push([...path]);\n    } else {\n      dfs(node.left, remaining - node.val, path);\n      dfs(node.right, remaining - node.val, path);\n    }\n    path.pop();\n  }\n  dfs(root, targetSum, []);\n  return res;\n}`,
      tests: [
        { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22], expected: [[5, 4, 11, 2], [5, 8, 4, 5]], unordered: true },
        { args: [[1, 2, 3], 5], expected: [], unordered: true },
        { args: [[], 0], expected: [], unordered: true },
        { args: [[1, 2], 3], expected: [[1, 2]], unordered: true },
      ],
      harness: { args: ["tree", "raw"], output: "raw" },
      approach:
        "DFS with **backtracking**: push the current node onto the path and subtract its value from the remaining target. At a *leaf*, if the remaining exactly equals the node's value, save a **copy** of the path (copy! — the array keeps mutating). On the way back up, `path.pop()` un-does the choice so sibling branches start clean. O(n) nodes visited; copying paths is the extra cost. The choose→recurse→un-choose shape is textbook backtracking.",
      docAnchor: "trees",
    },
    {
      slug: "count-complete-tree-nodes",
      title: "Count Complete Tree Nodes",
      difficulty: "Medium",
      category: "trees",
      blurb: "Number of nodes in a complete binary tree.",
      statement: [
        "Given the `root` of a **complete** binary tree (every level full except possibly the last, which is filled left-to-right), return the number of nodes.",
        "Canonical must-do (AM-600 Trees family).",
      ],
      examples: [
        { input: "root = [1,2,3,4,5,6]", output: "6" },
        { input: "root = []", output: "0" },
      ],
      constraints: ["0 <= number of nodes <= 5·10^4"],
      fnName: "countNodes",
      starter: `function countNodes(root) {\n  \n}`,
      solution: `function countNodes(root) {\n  if (!root) return 0;\n  return 1 + countNodes(root.left) + countNodes(root.right);\n}`,
      tests: [
        { args: [[1, 2, 3, 4, 5, 6]], expected: 6 },
        { args: [[]], expected: 0 },
        { args: [[1]], expected: 1 },
        { args: [[1, 2, 3, 4, 5, 6, 7]], expected: 7 },
      ],
      harness: { args: ["tree"], output: "raw" },
      approach:
        "The honest O(n) answer just recurses and counts. But the point of *complete* trees is you can do better: if the leftmost and rightmost depths match, the subtree is **perfect** → `2^h - 1` nodes with no recursion; otherwise recurse on both children. That measures height (O(log n)) at each of O(log n) levels → **O(log²n)**. Worth naming even when you code the simple version.",
      docAnchor: "trees",
    },
    {
      slug: "sum-of-left-leaves",
      title: "Sum of Left Leaves",
      difficulty: "Easy",
      category: "trees",
      blurb: "Add up every leaf that is a left child.",
      statement: [
        "Given the `root` of a binary tree, return the sum of all **left leaves** — leaf nodes that are the left child of their parent.",
        "Canonical must-do (AM-600 Trees family).",
      ],
      examples: [
        { input: "root = [3,9,20,null,null,15,7]", output: "24", explanation: "Left leaves 9 and 15." },
        { input: "root = [1]", output: "0" },
      ],
      constraints: ["1 <= number of nodes <= 1000"],
      fnName: "sumOfLeftLeaves",
      starter: `function sumOfLeftLeaves(root) {\n  \n}`,
      solution: `function sumOfLeftLeaves(root) {\n  if (!root) return 0;\n  let sum = 0;\n  if (root.left && !root.left.left && !root.left.right) sum += root.left.val;\n  else sum += sumOfLeftLeaves(root.left);\n  sum += sumOfLeftLeaves(root.right);\n  return sum;\n}`,
      tests: [
        { args: [[3, 9, 20, null, null, 15, 7]], expected: 24 },
        { args: [[1]], expected: 0 },
        { args: [[]], expected: 0 },
        { args: [[1, 2, 3, 4, 5]], expected: 4 },
      ],
      harness: { args: ["tree"], output: "raw" },
      approach:
        "'Left leaf' is a property of the **parent-child relationship**, not of the node alone — a node can't tell you whether it's a left child. So the check happens one level up: from each node, if its *left child* exists and is a leaf, add that child's value; otherwise recurse into it. Always recurse right normally. O(n).",
      docAnchor: "trees",
    },
    {
      slug: "subtree-of-another-tree",
      title: "Subtree of Another Tree",
      difficulty: "Easy",
      category: "trees",
      blurb: "Does subRoot appear as a subtree of root?",
      statement: [
        "Given the roots of two binary trees `root` and `subRoot`, return `true` if there is a subtree of `root` with the **same structure and values** as `subRoot`.",
        "Canonical must-do (AM-600 Trees family).",
      ],
      examples: [
        { input: "root = [3,4,5,1,2], subRoot = [4,1,2]", output: "true" },
        { input: "root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]", output: "false" },
      ],
      constraints: ["1 <= nodes in root <= 2000", "1 <= nodes in subRoot <= 1000"],
      fnName: "isSubtree",
      starter: `function isSubtree(root, subRoot) {\n  \n}`,
      solution: `function isSubtree(root, subRoot) {\n  function same(a, b) {\n    if (!a && !b) return true;\n    if (!a || !b || a.val !== b.val) return false;\n    return same(a.left, b.left) && same(a.right, b.right);\n  }\n  if (!root) return !subRoot;\n  if (same(root, subRoot)) return true;\n  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);\n}`,
      tests: [
        { args: [[3, 4, 5, 1, 2], [4, 1, 2]], expected: true },
        { args: [[3, 4, 5, 1, 2, null, null, null, null, 0], [4, 1, 2]], expected: false },
        { args: [[1], [1]], expected: true },
        { args: [[1, 1], [1]], expected: true },
      ],
      harness: { args: ["tree", "tree"], output: "raw" },
      approach:
        "Two nested recursions: `same(a, b)` checks whether two trees are **identical** (the Same Tree problem), and the outer walk tries `same(node, subRoot)` at every node of `root`, recursing until one matches. O(m·n) worst case. The trap is matching only values without structure — the second example fails precisely because an extra child makes the shapes differ.",
      docAnchor: "trees",
    },
    {
      slug: "binary-tree-inorder-traversal",
      title: "Binary Tree Inorder Traversal",
      difficulty: "Easy",
      category: "trees",
      blurb: "Left, node, right — iteratively.",
      statement: [
        "Given the `root` of a binary tree, return its **inorder** traversal (left subtree, node, right subtree) as an array. Try it iteratively with an explicit stack.",
        "Canonical must-do (AM-600 Trees family).",
      ],
      examples: [
        { input: "root = [1,null,2,3]", output: "[1,3,2]" },
        { input: "root = [1,2,3,4,5]", output: "[4,2,5,1,3]" },
      ],
      constraints: ["0 <= number of nodes <= 100"],
      fnName: "inorderTraversal",
      starter: `function inorderTraversal(root) {\n  \n}`,
      solution: `function inorderTraversal(root) {\n  const res = [];\n  const stack = [];\n  let cur = root;\n  while (cur || stack.length) {\n    while (cur) { stack.push(cur); cur = cur.left; }\n    cur = stack.pop();\n    res.push(cur.val);\n    cur = cur.right;\n  }\n  return res;\n}`,
      tests: [
        { args: [[1, null, 2, 3]], expected: [1, 3, 2] },
        { args: [[]], expected: [] },
        { args: [[1]], expected: [1] },
        { args: [[1, 2, 3, 4, 5]], expected: [4, 2, 5, 1, 3] },
      ],
      harness: { args: ["tree"], output: "raw" },
      approach:
        "The iterative form makes the recursion's hidden stack explicit: **dive left** pushing every node, then pop (that node's left subtree is finished, so visit it), then pivot to its right child and repeat. O(n) time, O(h) space. Worth owning because inorder on a **BST yields sorted order** — the property behind Kth Smallest in a BST and Validate BST.",
      docAnchor: "trees",
    },
    {
      slug: "binary-tree-maximum-path-sum",
      title: "Binary Tree Maximum Path Sum",
      difficulty: "Hard",
      category: "trees",
      blurb: "Best sum along any node-to-node path.",
      statement: [
        "A **path** is any sequence of connected nodes (it need not pass through the root). Given the `root` of a binary tree, return the maximum sum of the values along any non-empty path.",
        "Canonical must-do (AM-600 Trees family).",
      ],
      examples: [
        { input: "root = [1,2,3]", output: "6", explanation: "2 → 1 → 3." },
        { input: "root = [-10,9,20,null,null,15,7]", output: "42", explanation: "15 → 20 → 7." },
      ],
      constraints: ["1 <= number of nodes <= 3·10^4", "-1000 <= values <= 1000"],
      fnName: "maxPathSum",
      starter: `function maxPathSum(root) {\n  \n}`,
      solution: `function maxPathSum(root) {\n  let best = -Infinity;\n  function gain(node) {\n    if (!node) return 0;\n    const left = Math.max(gain(node.left), 0);\n    const right = Math.max(gain(node.right), 0);\n    best = Math.max(best, node.val + left + right);\n    return node.val + Math.max(left, right);\n  }\n  gain(root);\n  return best;\n}`,
      tests: [
        { args: [[1, 2, 3]], expected: 6 },
        { args: [[-10, 9, 20, null, null, 15, 7]], expected: 42 },
        { args: [[-3]], expected: -3 },
        { args: [[2, -1]], expected: 2 },
      ],
      harness: { args: ["tree"], output: "raw" },
      approach:
        "Two different quantities, and conflating them is the classic bug. What a node **returns** to its parent is the best *downward* path through it — it can only use ONE child (`val + max(left, right)`), because a path can't fork and still continue upward. What a node **records** as a global answer is the best path *peaking* at it, which may use BOTH children (`val + left + right`). Clamp negative child gains to 0 (skip that branch). O(n).",
      docAnchor: "trees",
    },
    {
      slug: "lowest-common-ancestor-binary-tree",
      title: "Lowest Common Ancestor of a Binary Tree",
      difficulty: "Medium",
      category: "trees",
      blurb: "LCA without BST ordering to exploit.",
      statement: [
        "Given the `root` of a binary tree (NOT a BST) and two values `p` and `q` present in it, return the value of their **lowest common ancestor** — the deepest node having both as descendants (a node may be a descendant of itself).",
        "Canonical must-do (AM-600 Trees family). Harder than the BST version: there's no ordering to guide you.",
      ],
      examples: [
        { input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1", output: "3" },
        { input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4", output: "5", explanation: "5 is an ancestor of 4." },
      ],
      constraints: ["2 <= number of nodes <= 10^5", "All values unique; p and q exist"],
      fnName: "lowestCommonAncestor",
      starter: `function lowestCommonAncestor(root, p, q) {\n  \n}`,
      solution: `function lowestCommonAncestor(root, p, q) {\n  function dfs(node) {\n    if (!node) return null;\n    if (node.val === p || node.val === q) return node;\n    const left = dfs(node.left);\n    const right = dfs(node.right);\n    if (left && right) return node;\n    return left || right;\n  }\n  const res = dfs(root);\n  return res ? res.val : null;\n}`,
      tests: [
        { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expected: 3 },
        { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], expected: 5 },
        { args: [[1, 2], 1, 2], expected: 1 },
      ],
      harness: { args: ["tree", "raw", "raw"], output: "raw" },
      approach:
        "Post-order search that returns 'what did I find below me?'. If a node **is** p or q, return it. Otherwise recurse both ways: if **both** sides return something, this node is where the two paths meet — it's the LCA. If only one side does, pass that result upward. The elegance is that 'a node is its own ancestor' falls out for free (test 2). O(n), single pass — no parent pointers or path lists needed.",
      docAnchor: "trees",
    },
    {
      slug: "sum-root-to-leaf-numbers",
      title: "Sum Root to Leaf Numbers",
      difficulty: "Medium",
      category: "trees",
      blurb: "Each root-to-leaf path is a digit string; sum them.",
      statement: [
        "Each root-to-leaf path in a binary tree of digits (0–9) spells a number (e.g. `1 → 2 → 3` is `123`). Return the **total sum** of all root-to-leaf numbers.",
        "Canonical must-do (AM-600 Trees family).",
      ],
      examples: [
        { input: "root = [1,2,3]", output: "25", explanation: "12 + 13." },
        { input: "root = [4,9,0,5,1]", output: "1026", explanation: "495 + 491 + 40." },
      ],
      constraints: ["1 <= number of nodes <= 1000", "0 <= node value <= 9"],
      fnName: "sumNumbers",
      starter: `function sumNumbers(root) {\n  \n}`,
      solution: `function sumNumbers(root) {\n  function dfs(node, cur) {\n    if (!node) return 0;\n    const val = cur * 10 + node.val;\n    if (!node.left && !node.right) return val;\n    return dfs(node.left, val) + dfs(node.right, val);\n  }\n  return dfs(root, 0);\n}`,
      tests: [
        { args: [[1, 2, 3]], expected: 25 },
        { args: [[4, 9, 0, 5, 1]], expected: 1026 },
        { args: [[1]], expected: 1 },
        { args: [[]], expected: 0 },
      ],
      harness: { args: ["tree"], output: "raw" },
      approach:
        "Carry the number built so far **down** the recursion (`cur * 10 + node.val` — the digit-appending trick), and return it at a leaf. Internal nodes just sum their children's results. No backtracking needed because the accumulator is passed by value, so each branch gets its own copy. O(n).",
      docAnchor: "trees",
    },
  ],
};
