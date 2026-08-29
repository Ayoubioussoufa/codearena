/**
 * DSA — Stack. LIFO structure for matching, deferring, and the monotonic-stack
 * "next greater/smaller" family.
 */
import type { DsaCategory } from "../types";

export const stack: DsaCategory = {
  id: "stack",
  title: "Stack",
  icon: "🥞",
  docAnchor: "stack",
  blurb: "LIFO for matching brackets, evaluating expressions, and monotonic next-greater scans.",
  problems: [
    {
      slug: "valid-parentheses",
      title: "Valid Parentheses",
      difficulty: "Easy",
      category: "stack",
      blurb: "Are the brackets balanced and correctly nested?",
      statement: [
        "Given a string `s` of just `()[]{}`, return `true` if every open bracket is closed by the same type in the correct order.",
      ],
      examples: [
        { input: 's = "()[]{}"', output: "true" },
        { input: 's = "(]"', output: "false" },
      ],
      constraints: ["1 <= s.length <= 10^4"],
      fnName: "isValid",
      starter: "function isValid(s) {\n  \n}",
      solution:
        "function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  for (const c of s) {\n    if (c === '(' || c === '[' || c === '{') stack.push(c);\n    else if (stack.pop() !== pairs[c]) return false;\n  }\n  return stack.length === 0;\n}",
      tests: [
        { args: ["()[]{}"], expected: true },
        { args: ["(]"], expected: false },
        { args: ["([)]"], expected: false },
        { args: ["{[]}"], expected: true },
      ],
      approach:
        "Push opens; on a close, the most recently opened bracket must match — exactly what a stack's LIFO order gives you. A leftover stack at the end means unclosed opens. O(n). Nesting/matching problems are the canonical stack use: the stack top is always 'the thing that must resolve next'.",
      docAnchor: "stack",
    },
    {
      slug: "evaluate-rpn",
      title: "Evaluate Reverse Polish Notation",
      difficulty: "Medium",
      category: "stack",
      blurb: "Evaluate a postfix expression.",
      statement: [
        "Evaluate an arithmetic expression in Reverse Polish (postfix) Notation given as `tokens`. Valid operators are `+ - * /`; division truncates toward zero.",
      ],
      examples: [
        { input: 'tokens = ["2","1","+","3","*"]', output: "9", explanation: "(2 + 1) * 3." },
        { input: 'tokens = ["4","13","5","/","+"]', output: "6" },
      ],
      constraints: ["1 <= tokens.length <= 10^4"],
      fnName: "evalRPN",
      starter: "function evalRPN(tokens) {\n  \n}",
      solution:
        "function evalRPN(tokens) {\n  const st = [];\n  for (const t of tokens) {\n    if (t === '+' || t === '-' || t === '*' || t === '/') {\n      const b = st.pop(), a = st.pop();\n      if (t === '+') st.push(a + b);\n      else if (t === '-') st.push(a - b);\n      else if (t === '*') st.push(a * b);\n      else st.push(Math.trunc(a / b));\n    } else {\n      st.push(Number(t));\n    }\n  }\n  return st.pop();\n}",
      tests: [
        { args: [["2", "1", "+", "3", "*"]], expected: 9 },
        { args: [["4", "13", "5", "/", "+"]], expected: 6 },
        { args: [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]], expected: 22 },
        { args: [["3", "-4", "+"]], expected: -1 },
      ],
      approach:
        "Postfix needs no parentheses: push numbers; on an operator, pop the two operands, apply, push the result. Order matters for − and / (first pop is the right operand). O(n). RPN is why stack-based virtual machines exist — the stack IS the evaluation context.",
      docAnchor: "stack",
    },
    {
      slug: "daily-temperatures",
      title: "Daily Temperatures",
      difficulty: "Medium",
      category: "stack",
      blurb: "Days until a warmer temperature.",
      statement: [
        "Given daily `temperatures`, return an array where `answer[i]` is the number of days until a warmer temperature. If none exists, use 0.",
      ],
      examples: [
        { input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]" },
        { input: "temperatures = [30,40,50,60]", output: "[1,1,1,0]" },
      ],
      constraints: ["1 <= temperatures.length <= 10^5"],
      fnName: "dailyTemperatures",
      starter: "function dailyTemperatures(temperatures) {\n  \n}",
      solution:
        "function dailyTemperatures(temperatures) {\n  const res = new Array(temperatures.length).fill(0);\n  const st = [];\n  for (let i = 0; i < temperatures.length; i++) {\n    while (st.length && temperatures[i] > temperatures[st[st.length - 1]]) {\n      const j = st.pop();\n      res[j] = i - j;\n    }\n    st.push(i);\n  }\n  return res;\n}",
      tests: [
        { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
        { args: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
        { args: [[30, 60, 90]], expected: [1, 1, 0] },
        { args: [[50, 50, 50]], expected: [0, 0, 0] },
      ],
      approach:
        "Keep a stack of indices whose answer is still pending, with temperatures decreasing down the stack (a monotonic stack). Each new day resolves every colder pending day on top. Every index is pushed and popped once → O(n). 'Next greater element' problems are the signature monotonic-stack pattern.",
      docAnchor: "stack",
    },
    {
      slug: "generate-parentheses",
      title: "Generate Parentheses",
      difficulty: "Medium",
      category: "stack",
      blurb: "All well-formed combinations of n pairs.",
      statement: [
        "Given `n` pairs of parentheses, return all combinations of well-formed parentheses. Any order is fine.",
      ],
      examples: [
        { input: "n = 3", output: '["((()))","(()())","(())()","()(())","()()()"]' },
        { input: "n = 1", output: '["()"]' },
      ],
      constraints: ["1 <= n <= 8"],
      fnName: "generateParenthesis",
      starter: "function generateParenthesis(n) {\n  \n}",
      solution:
        "function generateParenthesis(n) {\n  const res = [];\n  function backtrack(cur, open, close) {\n    if (cur.length === 2 * n) { res.push(cur); return; }\n    if (open < n) backtrack(cur + '(', open + 1, close);\n    if (close < open) backtrack(cur + ')', open, close + 1);\n  }\n  backtrack('', 0, 0);\n  return res;\n}",
      tests: [
        { args: [1], expected: ["()"], unordered: true },
        { args: [2], expected: ["(())", "()()"], unordered: true },
        { args: [3], expected: ["((()))", "(()())", "(())()", "()(())", "()()()"], unordered: true },
      ],
      approach:
        "Build strings character by character, maintaining the balance invariant with two counts: you may add '(' while opens < n, and ')' only while closes < opens (so it never goes unbalanced). The implicit recursion stack explores every valid prefix and prunes invalid ones early. This backtracking-with-invariants shape generalizes to subsets, permutations, and combinations.",
      docAnchor: "stack",
    },
    {
      slug: "car-fleet",
      title: "Car Fleet",
      difficulty: "Medium",
      category: "stack",
      blurb: "How many fleets arrive at the destination?",
      statement: [
        "Cars head to a `target` mile marker. Car i starts at `position[i]` with constant `speed[i]`; a faster car catches up to a slower one ahead and then travels as a fleet at the slower speed. Return the number of fleets that arrive.",
      ],
      examples: [
        { input: "target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]", output: "3" },
        { input: "target = 10, position = [3], speed = [3]", output: "1" },
      ],
      constraints: ["1 <= position.length <= 10^5", "0 < speed[i]"],
      fnName: "carFleet",
      starter: "function carFleet(target, position, speed) {\n  \n}",
      solution:
        "function carFleet(target, position, speed) {\n  const cars = position\n    .map((p, i) => [p, speed[i]])\n    .sort((a, b) => b[0] - a[0]);\n  let fleets = 0, slowest = 0;\n  for (const [p, s] of cars) {\n    const time = (target - p) / s;\n    if (time > slowest) {\n      fleets++;\n      slowest = time;\n    }\n  }\n  return fleets;\n}",
      tests: [
        { args: [12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]], expected: 3 },
        { args: [10, [3], [3]], expected: 1 },
        { args: [100, [0, 2, 4], [4, 2, 1]], expected: 1 },
        { args: [10, [6, 8], [3, 2]], expected: 2 },
      ],
      approach:
        "Sort cars by starting position, closest-to-target first, and compute each one's arrival time if unobstructed. Scanning from the front, a car forms a new fleet only if it arrives LATER than the current lead fleet; otherwise it catches up and merges. The 'slowest time so far' acts as a monotonic stack of fleet leads. O(n log n) from the sort.",
      docAnchor: "stack",
    },
    {
      slug: "largest-rectangle-in-histogram",
      title: "Largest Rectangle in Histogram",
      difficulty: "Hard",
      category: "stack",
      blurb: "Biggest rectangle under a bar chart.",
      statement: [
        "Given `heights` of adjacent unit-width bars, return the area of the largest rectangle that fits entirely under the histogram.",
      ],
      examples: [
        { input: "heights = [2,1,5,6,2,3]", output: "10", explanation: "Bars 5 and 6 give 5×2." },
        { input: "heights = [2,4]", output: "4" },
      ],
      constraints: ["1 <= heights.length <= 10^5"],
      fnName: "largestRectangleArea",
      starter: "function largestRectangleArea(heights) {\n  \n}",
      solution:
        "function largestRectangleArea(heights) {\n  const st = [];\n  let best = 0;\n  for (let i = 0; i <= heights.length; i++) {\n    const h = i === heights.length ? 0 : heights[i];\n    while (st.length && heights[st[st.length - 1]] >= h) {\n      const height = heights[st.pop()];\n      const width = st.length ? i - st[st.length - 1] - 1 : i;\n      best = Math.max(best, height * width);\n    }\n    st.push(i);\n  }\n  return best;\n}",
      tests: [
        { args: [[2, 1, 5, 6, 2, 3]], expected: 10 },
        { args: [[2, 4]], expected: 4 },
        { args: [[2, 1, 2]], expected: 3 },
        { args: [[5]], expected: 5 },
      ],
      approach:
        "Keep a stack of bar indices with increasing heights. When a shorter bar appears, each taller bar on the stack can't extend past it, so pop and settle its rectangle: the height is the popped bar, the width spans from the new bar back to the previous stack entry. A trailing 0-height sentinel flushes the stack. Every bar is pushed/popped once → O(n). The monotonic stack turns an O(n²) 'how far can each bar extend' into linear time.",
      docAnchor: "stack",
    },
    {
      slug: "min-stack",
      title: "Min Stack",
      difficulty: "Medium",
      category: "stack",
      blurb: "push/pop/top/getMin, all O(1).",
      statement: [
        "Implement a stack supporting `push`, `pop`, `top`, and `getMin` (retrieve the minimum element), each in O(1) time. Process the operations in `ops` (with `args[i]` as arguments) and return each operation's result (`null` for push/pop).",
      ],
      examples: [
        {
          input: "ops = [\"push\",\"push\",\"push\",\"getMin\",\"pop\",\"top\",\"getMin\"], args = [[-2],[0],[-3],[],[],[],[]]",
          output: "[null,null,null,-3,null,0,-2]",
        },
      ],
      constraints: ["Operations are always valid (no pop/top on empty)"],
      fnName: "minStack",
      starter: "function minStack(ops, args) {\n  \n}",
      solution:
        "function minStack(ops, args) {\n  const st = [];\n  const mins = [];\n  const res = [];\n  for (let i = 0; i < ops.length; i++) {\n    const op = ops[i];\n    if (op === \"push\") {\n      const v = args[i][0];\n      st.push(v);\n      mins.push(mins.length ? Math.min(v, mins[mins.length - 1]) : v);\n      res.push(null);\n    } else if (op === \"pop\") {\n      st.pop();\n      mins.pop();\n      res.push(null);\n    } else if (op === \"top\") {\n      res.push(st[st.length - 1]);\n    } else {\n      res.push(mins[mins.length - 1]);\n    }\n  }\n  return res;\n}",
      tests: [
        {
          args: [["push", "push", "push", "getMin", "pop", "top", "getMin"], [[-2], [0], [-3], [], [], [], []]],
          expected: [null, null, null, -3, null, 0, -2],
        },
        {
          args: [["push", "getMin", "push", "getMin", "pop", "getMin"], [[5], [], [3], [], [], []]],
          expected: [null, 5, null, 3, null, 5],
        },
        {
          args: [["push", "top"], [[42], []]],
          expected: [null, 42],
        },
      ],
      approach:
        "The trick is a PARALLEL stack of prefix minimums: mins[i] = the minimum of the main stack's bottom i+1 elements, maintained by pushing min(new value, current min) on every push and popping in lockstep. getMin reads the top of mins. Why a plain 'min variable' fails: popping the minimum leaves you not knowing the SECOND minimum — the parallel stack remembers every historical answer. Shadow structures that snapshot an aggregate per stack-state solve a whole family (max-stack, stack with average, …).",
      docAnchor: "stack",
    },
    {
      slug: "simplify-path",
      title: "Simplify Path",
      difficulty: "Medium",
      category: "stack",
      blurb: "Canonicalize a Unix path: . stays, .. pops.",
      statement: [
        "Convert an absolute Unix `path` to its canonical form: single slashes, no trailing slash, `.` (current dir) removed, `..` (parent dir) resolved.",
      ],
      examples: [
        { input: "path = \"/home/\"", output: "\"/home\"" },
        { input: "path = \"/../\"", output: "\"/\"", explanation: "You cannot go above the root." },
        { input: "path = \"/a/./b/../../c/\"", output: "\"/c\"" },
      ],
      constraints: ["1 <= path.length <= 3000", "path starts with '/'"],
      fnName: "simplifyPath",
      starter: "function simplifyPath(path) {\n  \n}",
      solution:
        "function simplifyPath(path) {\n  const st = [];\n  for (const part of path.split(\"/\")) {\n    if (part === \"\" || part === \".\") continue;\n    if (part === \"..\") st.pop();\n    else st.push(part);\n  }\n  return \"/\" + st.join(\"/\");\n}",
      tests: [
        { args: ["/home/"], expected: "/home" },
        { args: ["/../"], expected: "/" },
        { args: ["/home//foo/"], expected: "/home/foo" },
        { args: ["/a/./b/../../c/"], expected: "/c" },
      ],
      approach:
        "Split on '/' and treat the directory chain as a stack: a real name pushes, '..' pops (harmlessly, on an empty stack — that's the 'can't rise above root' rule falling out for free), '.' and empty segments (from '//' runs) are skipped. Join with slashes at the end. The general lesson: hierarchical navigation — file paths, undo chains, XML nesting — is stack traversal wearing a domain costume; tokenize first, then map each token to push/pop/ignore.",
      docAnchor: "stack",
    },
    {
      slug: "decode-string",
      title: "Decode String",
      difficulty: "Medium",
      category: "stack",
      blurb: "Expand k[encoded] — nested — with two stacks.",
      statement: [
        "Decode strings of the form `k[inner]`, where `inner` is repeated `k` times; encodings can nest. Return the decoded string.",
      ],
      examples: [
        { input: "s = \"3[a]2[bc]\"", output: "\"aaabcbc\"" },
        { input: "s = \"3[a2[c]]\"", output: "\"accaccacc\"" },
        { input: "s = \"2[abc]3[cd]ef\"", output: "\"abcabccdcdcdef\"" },
      ],
      constraints: ["1 <= s.length <= 30", "Counts are 1–300; result length <= 10^5"],
      fnName: "decodeString",
      starter: "function decodeString(s) {\n  \n}",
      solution:
        "function decodeString(s) {\n  const counts = [];\n  const strs = [];\n  let cur = \"\";\n  let num = 0;\n  for (const ch of s) {\n    if (ch >= \"0\" && ch <= \"9\") {\n      num = num * 10 + (ch.charCodeAt(0) - 48);\n    } else if (ch === \"[\") {\n      counts.push(num);\n      strs.push(cur);\n      num = 0;\n      cur = \"\";\n    } else if (ch === \"]\") {\n      cur = strs.pop() + cur.repeat(counts.pop());\n    } else {\n      cur += ch;\n    }\n  }\n  return cur;\n}",
      tests: [
        { args: ["3[a]2[bc]"], expected: "aaabcbc" },
        { args: ["3[a2[c]]"], expected: "accaccacc" },
        { args: ["2[abc]3[cd]ef"], expected: "abcabccdcdcdef" },
        { args: ["10[a]"], expected: "aaaaaaaaaa" },
      ],
      approach:
        "Nesting means the inner expansion must finish before the outer one — LIFO — so: on '[', SUSPEND the current context (push the pending count and the string-built-so-far onto two stacks) and start fresh; on ']', RESUME (pop both, repeat the inner result, append to the outer prefix). Multi-digit numbers accumulate with num*10+digit. This suspend/resume-context pattern is exactly how interpreters handle nested scopes and how you convert any recursive grammar walk into an iterative one — worth seeing in this miniature.",
      docAnchor: "stack",
    },
    {
      slug: "asteroid-collision",
      title: "Asteroid Collision",
      difficulty: "Medium",
      category: "stack",
      blurb: "Rights meet lefts; smaller explodes. What survives?",
      statement: [
        "Asteroids move along a line: positive values move right, negative move left, all at equal speed; `|value|` is size. When two collide the smaller explodes (both, if equal). Return the surviving asteroids in order.",
      ],
      examples: [
        { input: "asteroids = [5,10,-5]", output: "[5,10]", explanation: "10 destroys -5." },
        { input: "asteroids = [8,-8]", output: "[]" },
        { input: "asteroids = [10,2,-5]", output: "[10]" },
      ],
      constraints: ["2 <= asteroids.length <= 10^4", "No zeros"],
      fnName: "asteroidCollision",
      starter: "function asteroidCollision(asteroids) {\n  \n}",
      solution:
        "function asteroidCollision(asteroids) {\n  const st = [];\n  for (const a of asteroids) {\n    let alive = true;\n    while (alive && a < 0 && st.length && st[st.length - 1] > 0) {\n      const top = st[st.length - 1];\n      if (top < -a) {\n        st.pop(); // the stack asteroid explodes; keep checking\n      } else if (top === -a) {\n        st.pop();\n        alive = false;\n      } else {\n        alive = false;\n      }\n    }\n    if (alive) st.push(a);\n  }\n  return st;\n}",
      tests: [
        { args: [[5, 10, -5]], expected: [5, 10] },
        { args: [[8, -8]], expected: [] },
        { args: [[10, 2, -5]], expected: [10] },
        { args: [[-2, -1, 1, 2]], expected: [-2, -1, 1, 2] },
      ],
      approach:
        "Collisions only happen one way: a LEFT-mover arriving at RIGHT-movers already passed — i.e., the new element fighting the stack top, possibly repeatedly. That 'new element may destroy a run of previous elements' shape is the monotonic-stack pop-loop with domain rules as the comparison: pop while the top is a smaller right-mover; die on an equal or bigger one. Left-movers with nothing to their left, and all right-movers, just push (test 4: everyone moving apart, nothing collides). Simulation problems that look stateful often reduce to exactly this stack fight.",
      docAnchor: "stack",
    },
    {
      slug: "implement-queue-using-stacks",
      title: "Implement Queue Using Two Stacks",
      difficulty: "Medium",
      category: "stack",
      blurb: "FIFO behavior from two LIFO stacks.",
      statement: [
        "Implement a FIFO queue using only two stacks. Support `push` (enqueue), `pop` (dequeue and return the front), `peek` (return the front), and `empty` (is it empty?). Process the operations in `ops` with arguments `args[i]`, and return each operation's result (`null` for push).",
        "From *interactive-coding-challenges* (Stacks & Queues: implement a queue using two stacks).",
      ],
      examples: [
        {
          input: 'ops = ["push","push","peek","pop","empty"], args = [[1],[2],[],[],[]]',
          output: "[null,null,1,1,false]",
        },
      ],
      constraints: ["1 <= x <= 9", "At most 100 operations; pop/peek only on a non-empty queue"],
      fnName: "queueUsingStacks",
      starter: `function queueUsingStacks(ops, args) {\n  \n}`,
      solution: `function queueUsingStacks(ops, args) {\n  const inS = [], outS = [], res = [];\n  function shift() {\n    if (outS.length === 0) while (inS.length) outS.push(inS.pop());\n  }\n  for (let i = 0; i < ops.length; i++) {\n    const op = ops[i];\n    if (op === "push") { inS.push(args[i][0]); res.push(null); }\n    else if (op === "pop") { shift(); res.push(outS.pop()); }\n    else if (op === "peek") { shift(); res.push(outS[outS.length - 1]); }\n    else { res.push(inS.length === 0 && outS.length === 0); }\n  }\n  return res;\n}`,
      tests: [
        { args: [["push", "push", "peek", "pop", "empty"], [[1], [2], [], [], []]], expected: [null, null, 1, 1, false] },
        { args: [["push", "pop", "empty"], [[5], [], []]], expected: [null, 5, true] },
        { args: [["push", "push", "push", "pop", "peek"], [[1], [2], [3], [], []]], expected: [null, null, null, 1, 2] },
      ],
      approach:
        "A stack reverses order; two stacks reverse it twice, giving back FIFO. Keep an `in` stack for pushes and an `out` stack for pops. When you need the front and `out` is empty, pour the whole `in` stack into `out` — that flips the order so the oldest element ends up on top. Because each element is moved at most once, `pop`/`peek` are **amortized O(1)** even though a single transfer is O(n). Composing simple structures to get new behavior is the lesson.",
      docAnchor: "stack",
    },
    {
      slug: "sort-stack",
      title: "Sort a Stack",
      difficulty: "Medium",
      category: "stack",
      blurb: "Sort a stack using only one extra stack.",
      statement: [
        "Given the contents of a stack as an array `arr` (index 0 is the bottom, the last index is the top), return the sorted contents (ascending, so the largest ends on top) — using only **one additional stack** as a buffer (no arrays, no built-in sort).",
        "From *interactive-coding-challenges* (Stacks & Queues: sort a stack using another stack as a buffer).",
      ],
      examples: [
        { input: "arr = [3,1,2]", output: "[1,2,3]" },
        { input: "arr = [5,2,9,1]", output: "[1,2,5,9]" },
      ],
      constraints: ["0 <= arr.length <= 10^3"],
      fnName: "sortStack",
      starter: `function sortStack(arr) {\n  \n}`,
      solution: `function sortStack(arr) {\n  const stack = [...arr];\n  const temp = [];\n  while (stack.length) {\n    const x = stack.pop();\n    while (temp.length && temp[temp.length - 1] > x) {\n      stack.push(temp.pop());\n    }\n    temp.push(x);\n  }\n  return temp;\n}`,
      tests: [
        { args: [[3, 1, 2]], expected: [1, 2, 3] },
        { args: [[5, 2, 9, 1]], expected: [1, 2, 5, 9] },
        { args: [[1]], expected: [1] },
        { args: [[]], expected: [] },
      ],
      approach:
        "Keep the buffer stack **sorted with the largest on top**. Pop from the source; while the buffer's top is bigger than what you're holding, pour those back onto the source (making room), then drop your value into its sorted slot in the buffer. Each element can bounce back and forth, giving O(n²) time and O(n) space — the price of the 'one extra stack only' constraint. It's insertion sort wearing a stack costume.",
      docAnchor: "stack",
    },
    {
      slug: "minimum-add-to-make-parentheses-valid",
      title: "Minimum Add to Make Parentheses Valid",
      difficulty: "Medium",
      category: "stack",
      blurb: "Fewest insertions to balance the brackets.",
      statement: [
        "Given a string `s` of `(` and `)`, return the minimum number of parentheses you must insert (anywhere) to make it valid (every open has a matching close and vice-versa).",
        "Canonical must-do (AM-600 Stack family).",
      ],
      examples: [
        { input: 's = "())"', output: "1" },
        { input: 's = "((("', output: "3" },
        { input: 's = "()))(("', output: "4" },
      ],
      constraints: ["1 <= s.length <= 1000"],
      fnName: "minAddToMakeValid",
      starter: `function minAddToMakeValid(s) {\n  \n}`,
      solution: `function minAddToMakeValid(s) {\n  let open = 0, add = 0;\n  for (const c of s) {\n    if (c === "(") open++;\n    else {\n      if (open > 0) open--;\n      else add++;\n    }\n  }\n  return add + open;\n}`,
      tests: [
        { args: ["())"], expected: 1 },
        { args: ["((("], expected: 3 },
        { args: ["()"], expected: 0 },
        { args: ["()))(("], expected: 4 },
      ],
      approach:
        "You only need the *count* of unmatched brackets, so a single counter replaces the stack: track currently-open `(`; each `)` either closes one (decrement) or is itself unmatched (`add++`). Whatever `open` remains at the end is unmatched opens. Answer = unmatched closes + unmatched opens. O(n), O(1) space — the 'balance counter' distillation of the bracket-matching stack.",
      docAnchor: "stack",
    },
    {
      slug: "remove-all-adjacent-duplicates-in-string",
      title: "Remove All Adjacent Duplicates in String",
      difficulty: "Easy",
      category: "stack",
      blurb: "Repeatedly delete equal adjacent pairs.",
      statement: [
        "Repeatedly remove two **adjacent, equal** characters from `s` until none remain, and return the final string. The result is unique regardless of removal order.",
        "Canonical must-do (AM-600 Stack family).",
      ],
      examples: [
        { input: 's = "abbaca"', output: '"ca"', explanation: '"bb" → "aaca" → "aa" → "ca".' },
        { input: 's = "azxxzy"', output: '"ay"' },
      ],
      constraints: ["1 <= s.length <= 10^5"],
      fnName: "removeAdjacentDuplicates",
      starter: `function removeAdjacentDuplicates(s) {\n  \n}`,
      solution: `function removeAdjacentDuplicates(s) {\n  const stack = [];\n  for (const c of s) {\n    if (stack.length && stack[stack.length - 1] === c) stack.pop();\n    else stack.push(c);\n  }\n  return stack.join("");\n}`,
      tests: [
        { args: ["abbaca"], expected: "ca" },
        { args: ["azxxzy"], expected: "ay" },
        { args: ["aaaa"], expected: "" },
        { args: ["abc"], expected: "abc" },
      ],
      approach:
        "A stack does the cascading removals for free: push each character, but if it equals the current top, pop instead (they annihilate). Because a new match is always against the *most recent* surviving character, one pass handles chains like `\"aaaa\" → \"\"`. O(n). This 'collapse adjacent pairs with a stack' idea also underlies score-of-parentheses and simplify-path style problems.",
      docAnchor: "stack",
    },
    {
      slug: "basic-calculator-ii",
      title: "Basic Calculator II",
      difficulty: "Medium",
      category: "stack",
      blurb: "Evaluate + - * / with correct precedence.",
      statement: [
        "Evaluate a simple expression string `s` containing non-negative integers and the operators `+ - * /`, separated by optional spaces (no parentheses). Integer division **truncates toward zero**. Respect operator precedence.",
        "Canonical must-do (AM-600 Stack family).",
      ],
      examples: [
        { input: 's = "3+2*2"', output: "7" },
        { input: 's = " 3/2 "', output: "1" },
        { input: 's = " 3+5 / 2 "', output: "5" },
      ],
      constraints: ["1 <= s.length <= 3·10^5", "The expression is always valid"],
      fnName: "calculate",
      starter: `function calculate(s) {\n  \n}`,
      solution: `function calculate(s) {\n  const stack = [];\n  let num = 0, op = "+";\n  for (let i = 0; i < s.length; i++) {\n    const c = s[i];\n    if (c >= "0" && c <= "9") num = num * 10 + (c.charCodeAt(0) - 48);\n    if ((c !== " " && (c < "0" || c > "9")) || i === s.length - 1) {\n      if (op === "+") stack.push(num);\n      else if (op === "-") stack.push(-num);\n      else if (op === "*") stack.push(stack.pop() * num);\n      else stack.push(Math.trunc(stack.pop() / num));\n      op = c;\n      num = 0;\n    }\n  }\n  return stack.reduce((a, b) => a + b, 0);\n}`,
      tests: [
        { args: ["3+2*2"], expected: 7 },
        { args: [" 3/2 "], expected: 1 },
        { args: [" 3+5 / 2 "], expected: 5 },
        { args: ["42"], expected: 42 },
      ],
      approach:
        "Precedence without parsing a tree: keep a stack of **pending addends**. When you finish a number, look at the *previous* operator — `+`/`-` push it (deferred), while `*`/`/` immediately combine with the stack top (they bind tighter, so they can be resolved right away). Sum the stack at the end. O(n). Deferring low-precedence work and eagerly applying high-precedence work is the trick that avoids a full expression parser.",
      docAnchor: "stack",
    },
    {
      slug: "score-of-parentheses",
      title: "Score of Parentheses",
      difficulty: "Medium",
      category: "stack",
      blurb: "() = 1, AB = A+B, (A) = 2*A.",
      statement: [
        "Given a balanced parentheses string `s`, compute its score by the rules: `\"()\"` scores 1, `AB` scores `A + B` (concatenation), and `(A)` scores `2 * A`.",
        "Canonical must-do (AM-600 Stack family).",
      ],
      examples: [
        { input: 's = "()"', output: "1" },
        { input: 's = "(())"', output: "2" },
        { input: 's = "()()"', output: "2" },
      ],
      constraints: ["2 <= s.length <= 50", "s is a balanced parentheses string"],
      fnName: "scoreOfParentheses",
      starter: `function scoreOfParentheses(s) {\n  \n}`,
      solution: `function scoreOfParentheses(s) {\n  const stack = [0];\n  for (const c of s) {\n    if (c === "(") stack.push(0);\n    else {\n      const v = stack.pop();\n      stack[stack.length - 1] += Math.max(2 * v, 1);\n    }\n  }\n  return stack[0];\n}`,
      tests: [
        { args: ["()"], expected: 1 },
        { args: ["(())"], expected: 2 },
        { args: ["()()"], expected: 2 },
        { args: ["(()(()))"], expected: 6 },
      ],
      approach:
        "Keep a stack where each entry is the **score accumulated at that nesting depth**. `(` opens a new depth (push 0); `)` closes it — pop the inner score `v` and add `max(2v, 1)` to the enclosing level (the `max` elegantly handles the empty `()` base case scoring 1 instead of 0). The bottom entry ends up holding the total. O(n) — the stack literally mirrors the nesting structure.",
      docAnchor: "stack",
    },
    {
      slug: "validate-stack-sequences",
      title: "Validate Stack Sequences",
      difficulty: "Medium",
      category: "stack",
      blurb: "Could these pushes and pops happen on one stack?",
      statement: [
        "Given two arrays `pushed` and `popped` (both permutations of distinct values), return `true` if they could be the push and pop sequences of the **same** stack.",
        "Canonical must-do (AM-600 Stack family).",
      ],
      examples: [
        { input: "pushed = [1,2,3,4,5], popped = [4,5,3,2,1]", output: "true" },
        { input: "pushed = [1,2,3,4,5], popped = [4,3,5,1,2]", output: "false" },
      ],
      constraints: ["1 <= pushed.length <= 1000", "values are distinct"],
      fnName: "validateStackSequences",
      starter: `function validateStackSequences(pushed, popped) {\n  \n}`,
      solution: `function validateStackSequences(pushed, popped) {\n  const stack = [];\n  let j = 0;\n  for (const x of pushed) {\n    stack.push(x);\n    while (stack.length && stack[stack.length - 1] === popped[j]) {\n      stack.pop();\n      j++;\n    }\n  }\n  return stack.length === 0;\n}`,
      tests: [
        { args: [[1, 2, 3, 4, 5], [4, 5, 3, 2, 1]], expected: true },
        { args: [[1, 2, 3, 4, 5], [4, 3, 5, 1, 2]], expected: false },
        { args: [[1], [1]], expected: true },
        { args: [[1, 2], [2, 1]], expected: true },
      ],
      approach:
        "Just **simulate it**, greedily. Push values in order, and after each push, pop as long as the stack top matches the next value the pop sequence demands. There's never a reason to delay a legal pop (nothing pushed later can help), so greedy is safe. If everything drains, the sequences are consistent; leftovers mean they're not. O(n) time and space.",
      docAnchor: "stack",
    },
    {
      slug: "make-the-string-great",
      title: "Make The String Great",
      difficulty: "Easy",
      category: "stack",
      blurb: "Remove adjacent pairs like 'aA' or 'Bb'.",
      statement: [
        "A string is **good** if it has no two adjacent characters that are the same letter in **opposite cases** (like `aA` or `Bb`). Repeatedly remove such pairs and return the resulting good string.",
        "Canonical must-do (AM-600 Stack family).",
      ],
      examples: [
        { input: 's = "leEeetcode"', output: '"leetcode"' },
        { input: 's = "abBAcC"', output: '""', explanation: "bB → aAcC → cC → empty." },
      ],
      constraints: ["1 <= s.length <= 100", "letters only"],
      fnName: "makeGood",
      starter: `function makeGood(s) {\n  \n}`,
      solution: `function makeGood(s) {\n  const stack = [];\n  for (const c of s) {\n    const top = stack[stack.length - 1];\n    if (top && top !== c && top.toLowerCase() === c.toLowerCase()) stack.pop();\n    else stack.push(c);\n  }\n  return stack.join("");\n}`,
      tests: [
        { args: ["leEeetcode"], expected: "leetcode" },
        { args: ["abBAcC"], expected: "" },
        { args: ["s"], expected: "s" },
        { args: ["Pp"], expected: "" },
      ],
      approach:
        "Same annihilation-stack as Remove All Adjacent Duplicates, with a different match rule: pop when the top and the new character are the **same letter but different case** (`top !== c` yet `toLowerCase()` equal). Because each removal exposes a new top, cascading collapses like `abBAcC → \"\"` resolve in a single pass. O(n).",
      docAnchor: "stack",
    },
  ],
};
