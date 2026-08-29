/**
 * DSA — Linked List. Pointer manipulation: dummy heads, fast/slow pointers,
 * in-place reversal. Inputs are arrays built into ListNodes by the harness;
 * return the head and it's serialized back to an array.
 */
import type { DsaCategory } from "../types";

export const linkedList: DsaCategory = {
  id: "linked-list",
  title: "Linked List",
  icon: "🔗",
  docAnchor: "linked-list",
  blurb: "Dummy heads, fast/slow pointers, in-place reversal. Inputs are arrays, outputs the head.",
  problems: [
    {
      slug: "reverse-linked-list",
      title: "Reverse Linked List",
      difficulty: "Easy",
      category: "linked-list",
      blurb: "Reverse a singly linked list.",
      statement: [
        "Given the `head` of a singly linked list, reverse it and return the new head.",
        "The input array is built into a `ListNode` chain (`.val`, `.next`); return the head and it's serialized back to an array.",
      ],
      examples: [
        { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
        { input: "head = []", output: "[]" },
      ],
      constraints: ["0 <= nodes <= 5000"],
      fnName: "reverseList",
      starter: "function reverseList(head) {\n  \n}",
      solution:
        "function reverseList(head) {\n  let prev = null, cur = head;\n  while (cur) {\n    const next = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = next;\n  }\n  return prev;\n}",
      harness: { args: ["list"], output: "list" },
      tests: [
        { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
        { args: [[]], expected: [] },
        { args: [[1, 2]], expected: [2, 1] },
        { args: [[7]], expected: [7] },
      ],
      approach:
        "Walk the list flipping each `.next` to point at the previous node, carrying three pointers: prev, cur, and a saved next (so you don't lose the rest of the list when you rewire). prev ends on the old tail = new head. O(n) time, O(1) space. This three-pointer reversal is the single most reused linked-list primitive (palindrome, reorder, reverse-in-groups).",
      docAnchor: "linked-list",
    },
    {
      slug: "merge-two-sorted-lists",
      title: "Merge Two Sorted Lists",
      difficulty: "Easy",
      category: "linked-list",
      blurb: "Merge two sorted lists into one.",
      statement: [
        "Given the heads of two sorted linked lists `l1` and `l2`, splice them into one sorted list and return its head.",
      ],
      examples: [
        { input: "l1 = [1,2,4], l2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
        { input: "l1 = [], l2 = [0]", output: "[0]" },
      ],
      constraints: ["0 <= nodes in each list <= 50"],
      fnName: "mergeTwoLists",
      starter: "function mergeTwoLists(l1, l2) {\n  \n}",
      solution:
        "function mergeTwoLists(l1, l2) {\n  const dummy = { val: 0, next: null };\n  let tail = dummy;\n  while (l1 && l2) {\n    if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }\n    else { tail.next = l2; l2 = l2.next; }\n    tail = tail.next;\n  }\n  tail.next = l1 || l2;\n  return dummy.next;\n}",
      harness: { args: ["list", "list"], output: "list" },
      tests: [
        { args: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
        { args: [[], []], expected: [] },
        { args: [[], [0]], expected: [0] },
        { args: [[2, 5], [1, 3, 4]], expected: [1, 2, 3, 4, 5] },
      ],
      approach:
        "A dummy head node removes the 'which list starts the result' special case: keep a `tail` pointer, repeatedly append the smaller of the two front nodes, and when one list runs out, attach the entire remaining other list in O(1). O(n + m) time, O(1) space. Dummy heads are the cleanest way to avoid null-head edge cases in almost every list-building problem.",
      docAnchor: "linked-list",
    },
    {
      slug: "middle-of-the-linked-list",
      title: "Middle of the Linked List",
      difficulty: "Easy",
      category: "linked-list",
      blurb: "Return the middle node (second of two, if even).",
      statement: [
        "Given the `head` of a singly linked list, return the middle node. If there are two middle nodes, return the second one. (Return the node; it serializes from there to the end.)",
      ],
      examples: [
        { input: "head = [1,2,3,4,5]", output: "[3,4,5]" },
        { input: "head = [1,2,3,4,5,6]", output: "[4,5,6]" },
      ],
      constraints: ["1 <= nodes <= 100"],
      fnName: "middleNode",
      starter: "function middleNode(head) {\n  \n}",
      solution:
        "function middleNode(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  return slow;\n}",
      harness: { args: ["list"], output: "list" },
      tests: [
        { args: [[1, 2, 3, 4, 5]], expected: [3, 4, 5] },
        { args: [[1, 2, 3, 4, 5, 6]], expected: [4, 5, 6] },
        { args: [[1]], expected: [1] },
        { args: [[1, 2]], expected: [2] },
      ],
      approach:
        "Two pointers, fast moving twice as fast: when fast reaches the end, slow is at the middle. This 'tortoise and hare' avoids a first pass to count the length. O(n) time, O(1) space. The same fast/slow trick detects cycles and finds the k-th-from-end node.",
      docAnchor: "linked-list",
    },
    {
      slug: "remove-nth-node-from-end",
      title: "Remove Nth Node From End of List",
      difficulty: "Medium",
      category: "linked-list",
      blurb: "Delete the n-th node counting from the tail.",
      statement: [
        "Given the `head` of a list and an integer `n`, remove the n-th node from the end and return the head.",
      ],
      examples: [
        { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]" },
        { input: "head = [1], n = 1", output: "[]" },
      ],
      constraints: ["1 <= n <= list length <= 30"],
      fnName: "removeNthFromEnd",
      starter: "function removeNthFromEnd(head, n) {\n  \n}",
      solution:
        "function removeNthFromEnd(head, n) {\n  const dummy = { val: 0, next: head };\n  let fast = dummy, slow = dummy;\n  for (let i = 0; i < n; i++) fast = fast.next;\n  while (fast.next) {\n    fast = fast.next;\n    slow = slow.next;\n  }\n  slow.next = slow.next.next;\n  return dummy.next;\n}",
      harness: { args: ["list"], output: "list" },
      tests: [
        { args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
        { args: [[1], 1], expected: [] },
        { args: [[1, 2], 1], expected: [1] },
        { args: [[1, 2, 3], 3], expected: [2, 3] },
      ],
      approach:
        "Advance a fast pointer n nodes ahead, then move fast and slow together until fast hits the end — now slow sits just before the target, ready to unlink it. A dummy head handles the case of removing the first node without a special branch. One pass, O(n) time, O(1) space. The 'n-ahead gap' is the standard way to find a position relative to an unknown end.",
      docAnchor: "linked-list",
    },
    {
      slug: "reorder-list",
      title: "Reorder List",
      difficulty: "Medium",
      category: "linked-list",
      blurb: "Interleave: L0 → Ln → L1 → Ln-1 → …",
      statement: [
        "Given the `head` of a list, reorder it to L0 → Ln → L1 → Ln−1 → L2 → Ln−2 → … in place (don't change values, only pointers). Return the head.",
      ],
      examples: [
        { input: "head = [1,2,3,4]", output: "[1,4,2,3]" },
        { input: "head = [1,2,3,4,5]", output: "[1,5,2,4,3]" },
      ],
      constraints: ["1 <= nodes <= 5 * 10^4"],
      fnName: "reorderList",
      starter: "function reorderList(head) {\n  \n}",
      solution:
        "function reorderList(head) {\n  if (!head || !head.next) return head;\n  let slow = head, fast = head;\n  while (fast.next && fast.next.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  let second = slow.next;\n  slow.next = null;\n  let prev = null;\n  while (second) {\n    const next = second.next;\n    second.next = prev;\n    prev = second;\n    second = next;\n  }\n  let first = head;\n  second = prev;\n  while (second) {\n    const n1 = first.next, n2 = second.next;\n    first.next = second;\n    second.next = n1;\n    first = n1;\n    second = n2;\n  }\n  return head;\n}",
      harness: { args: ["list"], output: "list" },
      tests: [
        { args: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] },
        { args: [[1, 2, 3, 4, 5]], expected: [1, 5, 2, 4, 3] },
        { args: [[1]], expected: [1] },
        { args: [[1, 2]], expected: [1, 2] },
      ],
      approach:
        "Compose three primitives: find the middle (fast/slow), reverse the second half (three-pointer), then merge the two halves alternately. Each is O(n) and O(1) space, so the whole thing is too — no array copy. Reorder List is the classic 'linked-list problems are built from a few reusable moves' exercise; recognising the sub-problems is the skill.",
      docAnchor: "linked-list",
    },
    {
      slug: "palindrome-linked-list",
      title: "Palindrome Linked List",
      difficulty: "Easy",
      category: "linked-list",
      blurb: "Does the list read the same forwards and backwards?",
      statement: [
        "Given the `head` of a singly linked list, return `true` if the sequence of values is a palindrome.",
      ],
      examples: [
        { input: "head = [1,2,2,1]", output: "true" },
        { input: "head = [1,2]", output: "false" },
      ],
      constraints: ["1 <= nodes <= 10^5"],
      fnName: "isPalindrome",
      starter: "function isPalindrome(head) {\n  \n}",
      solution:
        "function isPalindrome(head) {\n  const vals = [];\n  let cur = head;\n  while (cur) {\n    vals.push(cur.val);\n    cur = cur.next;\n  }\n  let l = 0, r = vals.length - 1;\n  while (l < r) {\n    if (vals[l] !== vals[r]) return false;\n    l++;\n    r--;\n  }\n  return true;\n}",
      harness: { args: ["list"], output: "raw" },
      tests: [
        { args: [[1, 2, 2, 1]], expected: true },
        { args: [[1, 2]], expected: false },
        { args: [[1]], expected: true },
        { args: [[1, 2, 3, 2, 1]], expected: true },
      ],
      approach:
        "The simple approach copies values to an array and two-pointers it — O(n) time and O(n) space. The O(1)-space interview answer reuses two list primitives: find the middle, reverse the second half, then compare the halves node by node (and optionally restore the list). Knowing both, and when the space win is worth the extra pointer surgery, is the point.",
      docAnchor: "linked-list",
    },
    {
      slug: "remove-duplicates-from-sorted-list",
      title: "Remove Duplicates from Sorted List",
      difficulty: "Easy",
      category: "linked-list",
      blurb: "Collapse runs of equal values in a sorted list.",
      statement: [
        "Given the head of a SORTED linked list, delete duplicates so each value appears once, and return the list.",
        "Inputs are arrays; the harness builds the `ListNode` chain (`.val`, `.next`) and serializes your returned list back.",
      ],
      examples: [
        { input: "head = [1,1,2]", output: "[1,2]" },
        { input: "head = [1,1,2,3,3]", output: "[1,2,3]" },
      ],
      constraints: ["0 <= number of nodes <= 300", "Sorted ascending"],
      fnName: "deleteDuplicates",
      starter: "function deleteDuplicates(head) {\n  \n}",
      solution:
        "function deleteDuplicates(head) {\n  let node = head;\n  while (node && node.next) {\n    if (node.next.val === node.val) {\n      node.next = node.next.next;\n    } else {\n      node = node.next;\n    }\n  }\n  return head;\n}",
      tests: [
        { args: [[1, 1, 2]], expected: [1, 2] },
        { args: [[1, 1, 2, 3, 3]], expected: [1, 2, 3] },
        { args: [[]], expected: [] },
        { args: [[7, 7, 7]], expected: [7] },
      ],
      harness: { args: ["list"], output: "list" },
      approach:
        "Sortedness puts duplicates ADJACENT, so one pointer suffices: if the next node repeats the current value, splice it out (node.next = node.next.next) and — crucially — DON'T advance, because the new next might repeat too (test 4's [7,7,7] catches advancing too early). Advance only on a value change. Deletion in a linked list is always this: stand on the predecessor and rewire; you never touch the deleted node itself.",
      docAnchor: "linked-list",
    },
    {
      slug: "swap-nodes-in-pairs",
      title: "Swap Nodes in Pairs",
      difficulty: "Medium",
      category: "linked-list",
      blurb: "Swap every two adjacent nodes — pointers, not values.",
      statement: [
        "Swap every two adjacent nodes of the list and return its head. You must swap the NODES (rewire pointers), not just the values.",
      ],
      examples: [
        { input: "head = [1,2,3,4]", output: "[2,1,4,3]" },
        { input: "head = [1,2,3]", output: "[2,1,3]" },
      ],
      constraints: ["0 <= number of nodes <= 100"],
      fnName: "swapPairs",
      starter: "function swapPairs(head) {\n  \n}",
      solution:
        "function swapPairs(head) {\n  const dummy = new ListNode(0, head);\n  let prev = dummy;\n  while (prev.next && prev.next.next) {\n    const a = prev.next;\n    const b = a.next;\n    a.next = b.next;\n    b.next = a;\n    prev.next = b;\n    prev = a;\n  }\n  return dummy.next;\n}",
      tests: [
        { args: [[1, 2, 3, 4]], expected: [2, 1, 4, 3] },
        { args: [[1, 2, 3]], expected: [2, 1, 3] },
        { args: [[]], expected: [] },
        { args: [[1]], expected: [1] },
      ],
      harness: { args: ["list"], output: "list" },
      approach:
        "Every local rewiring needs the node BEFORE the action — and for the first pair no such node exists, hence the DUMMY head, the single most useful linked-list idiom. Then each iteration is three rewires drawn best on paper: a→(after b), b→a, prev→b, and prev advances to a (now the pair's tail). The dummy-node + prev-anchor scaffolding is identical in Remove Nth Node and Reverse in k-Groups; master the 2-group and the k-group is a loop away.",
      docAnchor: "linked-list",
    },
    {
      slug: "partition-list",
      title: "Partition List",
      difficulty: "Medium",
      category: "linked-list",
      blurb: "Stable partition around x with two building lists.",
      statement: [
        "Partition the list around value `x`: all nodes with value < x come before all nodes ≥ x, PRESERVING the original relative order within each side. Return the head.",
      ],
      examples: [
        { input: "head = [1,4,3,2,5,2], x = 3", output: "[1,2,2,4,3,5]" },
        { input: "head = [2,1], x = 2", output: "[1,2]" },
      ],
      constraints: ["0 <= number of nodes <= 200", "-100 <= x <= 100"],
      fnName: "partition",
      starter: "function partition(head, x) {\n  \n}",
      solution:
        "function partition(head, x) {\n  const beforeHead = new ListNode(0);\n  const afterHead = new ListNode(0);\n  let before = beforeHead;\n  let after = afterHead;\n  for (let node = head; node; node = node.next) {\n    if (node.val < x) {\n      before.next = node;\n      before = node;\n    } else {\n      after.next = node;\n      after = node;\n    }\n  }\n  after.next = null;\n  before.next = afterHead.next;\n  return beforeHead.next;\n}",
      tests: [
        { args: [[1, 4, 3, 2, 5, 2], 3], expected: [1, 2, 2, 4, 3, 5] },
        { args: [[2, 1], 2], expected: [1, 2] },
        { args: [[], 0], expected: [] },
        { args: [[5, 6], 3], expected: [5, 6] },
      ],
      harness: { args: ["list", "raw"], output: "list" },
      approach:
        "Instead of deleting/inserting within one list (fiddly), BUILD TWO lists: walk once, appending each node to a 'before' or 'after' chain — appending preserves encounter order, which is exactly the stability requirement — then stitch: before-tail → after-head, and null-terminate the after-tail (skip that and you may keep a stale pointer into the old order: a cycle). Two dummies make both appends uniform. Building output lists instead of surgically editing one is frequently the simpler correct choice.",
      docAnchor: "linked-list",
    },
    {
      slug: "add-two-numbers",
      title: "Add Two Numbers",
      difficulty: "Medium",
      category: "linked-list",
      blurb: "Sum two numbers stored digit-by-digit in reverse.",
      statement: [
        "Each list stores a non-negative integer in REVERSE order, one digit per node. Add the two numbers and return the sum as a list in the same format.",
      ],
      examples: [
        { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807." },
        { input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]", output: "[8,9,9,9,0,0,0,1]" },
      ],
      constraints: ["1 <= list lengths <= 100", "No leading zeros except the number 0"],
      fnName: "addTwoNumbers",
      starter: "function addTwoNumbers(l1, l2) {\n  \n}",
      solution:
        "function addTwoNumbers(l1, l2) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  let carry = 0;\n  while (l1 || l2 || carry) {\n    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;\n    carry = Math.floor(sum / 10);\n    tail.next = new ListNode(sum % 10);\n    tail = tail.next;\n    if (l1) l1 = l1.next;\n    if (l2) l2 = l2.next;\n  }\n  return dummy.next;\n}",
      tests: [
        { args: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] },
        { args: [[0], [0]], expected: [0] },
        { args: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], expected: [8, 9, 9, 9, 0, 0, 0, 1] },
      ],
      harness: { args: ["list", "list"], output: "list" },
      approach:
        "Reverse storage makes the lists START at the ones place, so you add exactly like on paper: digit + digit + carry, write sum % 10, carry sum / 10. The elegant part is the loop condition `l1 || l2 || carry` — it simultaneously handles different lengths (a missing node contributes 0) and the final carry that creates a NEW digit (999 + 1 → four digits), with zero special-casing. This 'run until all sources AND the carry are exhausted' condition is the pattern for merging unequal-length digit streams anywhere.",
      docAnchor: "linked-list",
    },
    {
      slug: "remove-linked-list-elements",
      title: "Remove Linked List Elements",
      difficulty: "Easy",
      category: "linked-list",
      blurb: "Delete every node equal to a value.",
      statement: [
        "Given the `head` of a linked list and a value `val`, remove all nodes whose value equals `val` and return the new head.",
        "Canonical must-do (AM-600 Linked List family).",
      ],
      examples: [
        { input: "head = [1,2,6,3,4,5,6], val = 6", output: "[1,2,3,4,5]" },
        { input: "head = [7,7,7,7], val = 7", output: "[]" },
      ],
      constraints: ["0 <= list length <= 10^4"],
      fnName: "removeElements",
      starter: `function removeElements(head, val) {\n  \n}`,
      solution: `function removeElements(head, val) {\n  const dummy = new ListNode(0, head);\n  let cur = dummy;\n  while (cur.next) {\n    if (cur.next.val === val) cur.next = cur.next.next;\n    else cur = cur.next;\n  }\n  return dummy.next;\n}`,
      tests: [
        { args: [[1, 2, 6, 3, 4, 5, 6], 6], expected: [1, 2, 3, 4, 5] },
        { args: [[], 1], expected: [] },
        { args: [[7, 7, 7, 7], 7], expected: [] },
        { args: [[1, 2, 3], 4], expected: [1, 2, 3] },
      ],
      harness: { args: ["list", "raw"], output: "list" },
      approach:
        "A **dummy head** node before the real head removes the special case of deleting the first node (or an all-matching list) — you always have a `prev` to rewire. Walk with `cur`: when `cur.next` matches, splice it out (`cur.next = cur.next.next`); otherwise advance. Return `dummy.next`. O(n), O(1) space.",
      docAnchor: "linked-list",
    },
    {
      slug: "odd-even-linked-list",
      title: "Odd Even Linked List",
      difficulty: "Medium",
      category: "linked-list",
      blurb: "Group odd-position nodes before even-position ones.",
      statement: [
        "Group all nodes at **odd positions** (1st, 3rd, 5th…) together, followed by the nodes at **even positions**, preserving relative order within each group. Return the reordered list. Do it in O(1) extra space.",
        "Canonical must-do (AM-600 Linked List family).",
      ],
      examples: [
        { input: "head = [1,2,3,4,5]", output: "[1,3,5,2,4]" },
        { input: "head = [2,1,3,5,6,4,7]", output: "[2,3,6,7,1,5,4]" },
      ],
      constraints: ["0 <= list length <= 10^4"],
      fnName: "oddEvenList",
      starter: `function oddEvenList(head) {\n  \n}`,
      solution: `function oddEvenList(head) {\n  if (!head) return head;\n  let odd = head, even = head.next;\n  const evenHead = even;\n  while (even && even.next) {\n    odd.next = even.next;\n    odd = odd.next;\n    even.next = odd.next;\n    even = even.next;\n  }\n  odd.next = evenHead;\n  return head;\n}`,
      tests: [
        { args: [[1, 2, 3, 4, 5]], expected: [1, 3, 5, 2, 4] },
        { args: [[2, 1, 3, 5, 6, 4, 7]], expected: [2, 3, 6, 7, 1, 5, 4] },
        { args: [[]], expected: [] },
        { args: [[1]], expected: [1] },
      ],
      harness: { args: ["list"], output: "list" },
      approach:
        "Weave two sub-lists in one pass: an `odd` pointer and an `even` pointer, each hopping **two** nodes at a time to gather their group, while remembering `evenHead` so you can stitch the even list onto the end of the odd list at the finish. Pure pointer surgery — O(n) time, O(1) space, no new nodes.",
      docAnchor: "linked-list",
    },
    {
      slug: "reverse-linked-list-ii",
      title: "Reverse Linked List II",
      difficulty: "Medium",
      category: "linked-list",
      blurb: "Reverse only positions left..right.",
      statement: [
        "Given the `head` of a list and 1-indexed positions `left <= right`, reverse the nodes from position `left` to `right` and return the list.",
        "Canonical must-do (AM-600 Linked List family).",
      ],
      examples: [
        { input: "head = [1,2,3,4,5], left = 2, right = 4", output: "[1,4,3,2,5]" },
        { input: "head = [5], left = 1, right = 1", output: "[5]" },
      ],
      constraints: ["1 <= left <= right <= list length"],
      fnName: "reverseBetween",
      starter: `function reverseBetween(head, left, right) {\n  \n}`,
      solution: `function reverseBetween(head, left, right) {\n  const dummy = new ListNode(0, head);\n  let prev = dummy;\n  for (let i = 0; i < left - 1; i++) prev = prev.next;\n  let cur = prev.next;\n  for (let i = 0; i < right - left; i++) {\n    const next = cur.next;\n    cur.next = next.next;\n    next.next = prev.next;\n    prev.next = next;\n  }\n  return dummy.next;\n}`,
      tests: [
        { args: [[1, 2, 3, 4, 5], 2, 4], expected: [1, 4, 3, 2, 5] },
        { args: [[5], 1, 1], expected: [5] },
        { args: [[3, 5], 1, 2], expected: [5, 3] },
        { args: [[1, 2, 3, 4, 5], 1, 5], expected: [5, 4, 3, 2, 1] },
      ],
      harness: { args: ["list", "raw", "raw"], output: "list" },
      approach:
        "Walk `prev` to the node just before position `left` (a dummy head handles `left = 1`), then do the **head-insertion** reversal `right - left` times: repeatedly pull the node after `cur` and splice it right after `prev`. This reverses the sublist in place in one pass without touching anything outside `[left, right]`. O(n), O(1) space.",
      docAnchor: "linked-list",
    },
    {
      slug: "rotate-list",
      title: "Rotate List",
      difficulty: "Medium",
      category: "linked-list",
      blurb: "Rotate the list right by k places.",
      statement: [
        "Given the `head` of a linked list, rotate it to the **right** by `k` places and return the new head. `k` may exceed the list length.",
        "Canonical must-do (AM-600 Linked List family).",
      ],
      examples: [
        { input: "head = [1,2,3,4,5], k = 2", output: "[4,5,1,2,3]" },
        { input: "head = [0,1,2], k = 4", output: "[2,0,1]" },
      ],
      constraints: ["0 <= list length <= 500", "0 <= k <= 2·10^9"],
      fnName: "rotateRight",
      starter: `function rotateRight(head, k) {\n  \n}`,
      solution: `function rotateRight(head, k) {\n  if (!head || !head.next || k === 0) return head;\n  let n = 1, tail = head;\n  while (tail.next) { tail = tail.next; n++; }\n  k = k % n;\n  if (k === 0) return head;\n  tail.next = head;\n  let newTail = head;\n  for (let i = 0; i < n - k - 1; i++) newTail = newTail.next;\n  const newHead = newTail.next;\n  newTail.next = null;\n  return newHead;\n}`,
      tests: [
        { args: [[1, 2, 3, 4, 5], 2], expected: [4, 5, 1, 2, 3] },
        { args: [[0, 1, 2], 4], expected: [2, 0, 1] },
        { args: [[], 1], expected: [] },
        { args: [[1], 99], expected: [1] },
      ],
      harness: { args: ["list", "raw"], output: "list" },
      approach:
        "Measure the length while walking to the tail, reduce `k % n` (rotating by a full length changes nothing), then **close the list into a ring** by linking tail→head. The new tail sits `n - k - 1` steps from the old head; cut there and the node after it is the new head. One and a bit passes, O(n) time, O(1) space. Making it circular first is what turns fiddly pointer bookkeeping into a clean cut.",
      docAnchor: "linked-list",
    },
    {
      slug: "merge-nodes-in-between-zeros",
      title: "Merge Nodes in Between Zeros",
      difficulty: "Medium",
      category: "linked-list",
      blurb: "Collapse each 0-delimited run into its sum.",
      statement: [
        "A linked list starts and ends with `0`, with `0`s separating groups of non-zero values. Replace each group with a single node holding that group's **sum**, and remove all the zeros. Return the resulting list.",
        "Canonical must-do (AM-600 Linked List family).",
      ],
      examples: [
        { input: "head = [0,3,1,0,4,5,2,0]", output: "[4,11]", explanation: "3+1 = 4, 4+5+2 = 11." },
        { input: "head = [0,1,0,3,0,2,2,0]", output: "[1,3,4]" },
      ],
      constraints: ["3 <= list length <= 2000", "First and last values are 0"],
      fnName: "mergeNodes",
      starter: `function mergeNodes(head) {\n  \n}`,
      solution: `function mergeNodes(head) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  let cur = head.next;\n  let sum = 0;\n  while (cur) {\n    if (cur.val === 0) {\n      tail.next = new ListNode(sum);\n      tail = tail.next;\n      sum = 0;\n    } else {\n      sum += cur.val;\n    }\n    cur = cur.next;\n  }\n  return dummy.next;\n}`,
      tests: [
        { args: [[0, 3, 1, 0, 4, 5, 2, 0]], expected: [4, 11] },
        { args: [[0, 1, 0, 3, 0, 2, 2, 0]], expected: [1, 3, 4] },
        { args: [[0, 5, 0]], expected: [5] },
      ],
      harness: { args: ["list"], output: "list" },
      approach:
        "A single pass with an accumulator: skip the leading zero, add up non-zero values, and every time you hit a `0` that's a group boundary — emit a node holding the sum and reset. A **dummy head** plus a `tail` pointer makes appending trivial (no special case for the first output node). O(n) time; O(1) extra beyond the output.",
      docAnchor: "linked-list",
    },
  ],
};
