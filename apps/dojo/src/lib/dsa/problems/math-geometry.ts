/**
 * DSA — Math & Geometry. Digit manipulation, number theory, matrix walks,
 * and coordinate reasoning. Less about one big pattern, more about a toolbox:
 * simulate carefully, exploit symmetry, and mind the overflow rules.
 */
import type { DsaCategory } from "../types";

export const mathGeometry: DsaCategory = {
  id: "math-geometry",
  title: "Math & Geometry",
  icon: "🧮",
  docAnchor: "math--geometry",
  blurb:
    "Digits, primes, powers, and matrix choreography — careful simulation and the occasional closed form.",
  problems: [
    {
      slug: "plus-one",
      title: "Plus One",
      difficulty: "Easy",
      category: "math-geometry",
      blurb: "Increment a number stored as a digit array.",
      statement: [
        "Given `digits` representing a large integer (most significant first, no leading zeros), add one and return the resulting digit array.",
      ],
      examples: [
        { input: "digits = [1,2,3]", output: "[1,2,4]" },
        { input: "digits = [9,9]", output: "[1,0,0]" },
      ],
      constraints: ["1 <= digits.length <= 100"],
      fnName: "plusOne",
      starter: "function plusOne(digits) {\n  \n}",
      solution:
        "function plusOne(digits) {\n  const res = [...digits];\n  for (let i = res.length - 1; i >= 0; i--) {\n    if (res[i] < 9) {\n      res[i]++;\n      return res;\n    }\n    res[i] = 0;\n  }\n  res.unshift(1);\n  return res;\n}",
      tests: [
        { args: [[1, 2, 3]], expected: [1, 2, 4] },
        { args: [[9, 9]], expected: [1, 0, 0] },
        { args: [[0]], expected: [1] },
        { args: [[8, 9, 9]], expected: [9, 0, 0] },
      ],
      approach:
        "Grade-school carrying, coded directly: walk from the last digit; a digit below 9 just increments and you're DONE (early return — most calls end here); a 9 becomes 0 and the carry continues left. Only if you fall off the front (all nines) do you grow the array. The reason this problem exists: the number is too big for an integer type, so you work in digit space — the same reason banks store money in cents and big-integer libraries store limb arrays. Carry propagation with an early exit is the whole lesson.",
      docAnchor: "math--geometry",
    },
    {
      slug: "happy-number",
      title: "Happy Number",
      difficulty: "Easy",
      category: "math-geometry",
      blurb: "Does repeatedly summing squared digits reach 1?",
      statement: [
        "Replace `n` by the sum of the squares of its digits, repeatedly. If the process reaches 1, `n` is happy — return whether it does (unhappy numbers loop forever).",
      ],
      examples: [
        { input: "n = 19", output: "true", explanation: "1²+9²=82 → 68 → 100 → 1." },
        { input: "n = 2", output: "false" },
      ],
      constraints: ["1 <= n <= 2^31 - 1"],
      fnName: "isHappy",
      starter: "function isHappy(n) {\n  \n}",
      solution:
        "function isHappy(n) {\n  const seen = new Set();\n  while (n !== 1 && !seen.has(n)) {\n    seen.add(n);\n    let sum = 0;\n    while (n > 0) {\n      const d = n % 10;\n      sum += d * d;\n      n = Math.floor(n / 10);\n    }\n    n = sum;\n  }\n  return n === 1;\n}",
      tests: [
        { args: [19], expected: true },
        { args: [2], expected: false },
        { args: [1], expected: true },
        { args: [7], expected: true },
      ],
      approach:
        "Two ingredients: digit extraction (n % 10 peels the last digit, Math.floor(n / 10) drops it — the universal digit-loop you'll reuse constantly) and CYCLE DETECTION, because 'loops forever' must be caught, not waited out. A seen-set does it in O(cycle) space; the elegant upgrade is Floyd's tortoise-and-hare (slow/fast pointers on the sequence itself, O(1) space) — the very same algorithm as Linked List Cycle, revealing that any deterministic iterated function IS a linked list.",
      docAnchor: "math--geometry",
    },
    {
      slug: "sqrt-x",
      title: "Sqrt(x)",
      difficulty: "Easy",
      category: "math-geometry",
      blurb: "Integer square root — binary search on the answer.",
      statement: [
        "Return the square root of the non-negative integer `x`, rounded DOWN to the nearest integer. Do not use built-in exponent/sqrt functions.",
      ],
      examples: [
        { input: "x = 4", output: "2" },
        { input: "x = 8", output: "2", explanation: "√8 ≈ 2.83, rounded down." },
      ],
      constraints: ["0 <= x <= 2^31 - 1"],
      fnName: "mySqrt",
      starter: "function mySqrt(x) {\n  \n}",
      solution:
        "function mySqrt(x) {\n  if (x < 2) return x;\n  let lo = 1;\n  let hi = Math.floor(x / 2);\n  let ans = 1;\n  while (lo <= hi) {\n    const mid = Math.floor((lo + hi) / 2);\n    if (mid * mid <= x) {\n      ans = mid;\n      lo = mid + 1;\n    } else {\n      hi = mid - 1;\n    }\n  }\n  return ans;\n}",
      tests: [
        { args: [4], expected: 2 },
        { args: [8], expected: 2 },
        { args: [0], expected: 0 },
        { args: [1], expected: 1 },
        { args: [2147395599], expected: 46339 },
      ],
      approach:
        "'Largest k with k² ≤ x' is a monotonic predicate, so BINARY SEARCH ON THE ANSWER applies: k² ≤ x is true for a prefix of integers and false after — find the boundary, remembering the last true (`ans`) as the search narrows. O(log x). This is the same search-on-answer template as Koko Eating Bananas, applied to arithmetic instead of arrays. (Newton's method converges faster and is a lovely follow-up, but binary search is the transferable pattern.)",
      docAnchor: "math--geometry",
    },
    {
      slug: "reverse-integer",
      title: "Reverse Integer",
      difficulty: "Medium",
      category: "math-geometry",
      blurb: "Reverse digits; return 0 on 32-bit overflow.",
      statement: [
        "Reverse the digits of a signed 32-bit integer `x`. If the reversed value overflows the range `[-2^31, 2^31 - 1]`, return `0`.",
      ],
      examples: [
        { input: "x = 123", output: "321" },
        { input: "x = -123", output: "-321" },
        { input: "x = 120", output: "21" },
      ],
      constraints: ["-2^31 <= x <= 2^31 - 1"],
      fnName: "reverse",
      starter: "function reverse(x) {\n  \n}",
      solution:
        "function reverse(x) {\n  const sign = x < 0 ? -1 : 1;\n  let n = Math.abs(x);\n  let r = 0;\n  while (n > 0) {\n    r = r * 10 + (n % 10);\n    n = Math.floor(n / 10);\n  }\n  r *= sign;\n  if (r < -2147483648 || r > 2147483647) return 0;\n  return r;\n}",
      tests: [
        { args: [123], expected: 321 },
        { args: [-123], expected: -321 },
        { args: [120], expected: 21 },
        { args: [1534236469], expected: 0 },
      ],
      approach:
        "The reverse itself is the standard digit loop run in 'push' mode: r = r·10 + lastDigit re-assembles the digits in reverse order, and trailing zeros disappear for free (they're pushed first, onto nothing). The REAL topic is overflow discipline: 1534236469 reverses to 9,646,324,351 — fine for JS's float doubles, fatal for a real int32. JS lets you check after the fact; in C++/Java/Rust you must check BEFORE the multiply (r > MAX/10, etc.). Interviewers ask this to see whether you know integer limits exist at all.",
      docAnchor: "math--geometry",
    },
    {
      slug: "pow-x-n",
      title: "Pow(x, n)",
      difficulty: "Medium",
      category: "math-geometry",
      blurb: "x^n in O(log n) by squaring.",
      statement: [
        "Implement `pow(x, n)` computing x raised to the integer power `n` (which may be negative), in O(log n) multiplications.",
      ],
      examples: [
        { input: "x = 2, n = 10", output: "1024" },
        { input: "x = 2.1, n = 3", output: "9.261" },
        { input: "x = 2, n = -2", output: "0.25" },
      ],
      constraints: ["-100 < x < 100", "-2^31 <= n <= 2^31 - 1"],
      fnName: "myPow",
      starter: "function myPow(x, n) {\n  \n}",
      solution:
        "function myPow(x, n) {\n  if (n < 0) {\n    x = 1 / x;\n    n = -n;\n  }\n  let result = 1;\n  while (n > 0) {\n    if (n % 2 === 1) result *= x;\n    x *= x;\n    n = Math.floor(n / 2);\n  }\n  return result;\n}",
      tests: [
        { args: [2, 10], expected: 1024 },
        { args: [2.1, 3], expected: 9.261, approx: 1e-9 },
        { args: [2, -2], expected: 0.25 },
        { args: [5, 0], expected: 1 },
      ],
      approach:
        "FAST EXPONENTIATION (binary exponentiation): read n's bits low to high; keep squaring x (x¹, x², x⁴, x⁸…) and multiply into the result exactly the powers whose bit is set — 2¹⁰ = x⁸·x², two multiplies instead of ten. O(log n) versus O(n). Negative n: invert x once up front. This is a genuinely load-bearing algorithm — modular exponentiation in RSA/Diffie-Hellman is this exact loop with a mod after each multiply, and matrix exponentiation (Fibonacci in O(log n)) is it again with matrices.",
      docAnchor: "math--geometry",
    },
    {
      slug: "count-primes",
      title: "Count Primes",
      difficulty: "Medium",
      category: "math-geometry",
      blurb: "How many primes below n? Sieve, don't test.",
      statement: [
        "Return the number of prime numbers STRICTLY less than `n`.",
      ],
      examples: [
        { input: "n = 10", output: "4", explanation: "2, 3, 5, 7." },
        { input: "n = 0", output: "0" },
        { input: "n = 1", output: "0" },
      ],
      constraints: ["0 <= n <= 5 * 10^6"],
      fnName: "countPrimes",
      starter: "function countPrimes(n) {\n  \n}",
      solution:
        "function countPrimes(n) {\n  if (n < 3) return 0;\n  const composite = new Array(n).fill(false);\n  let count = 0;\n  for (let i = 2; i < n; i++) {\n    if (composite[i]) continue;\n    count++;\n    for (let j = i * i; j < n; j += i) {\n      composite[j] = true;\n    }\n  }\n  return count;\n}",
      tests: [
        { args: [10], expected: 4 },
        { args: [0], expected: 0 },
        { args: [1], expected: 0 },
        { args: [100], expected: 25 },
      ],
      approach:
        "The Sieve of Eratosthenes flips the question from 'is each number prime?' (n trial-divisions) to 'which numbers are composite?': every prime found crosses off its own multiples. Two classic refinements are already in the code — start crossing at i² (smaller multiples were crossed by smaller primes), which also means you could stop sieving at √n — giving O(n log log n), effectively linear. Testing each number independently in √n time is the trap; batch-marking is the lesson, and it reappears in any 'precompute a property for all numbers up to n' problem.",
      docAnchor: "math--geometry",
    },
    {
      slug: "rotate-image",
      title: "Rotate Image",
      difficulty: "Medium",
      category: "math-geometry",
      blurb: "Rotate an n×n matrix 90° clockwise in place.",
      statement: [
        "Rotate the `n × n` matrix 90 degrees CLOCKWISE, in place (modify and return the input matrix, no second matrix).",
      ],
      examples: [
        { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]" },
        { input: "matrix = [[1]]", output: "[[1]]" },
      ],
      constraints: ["1 <= n <= 20"],
      fnName: "rotate",
      starter: "function rotate(matrix) {\n  \n}",
      solution:
        "function rotate(matrix) {\n  const n = matrix.length;\n  for (let r = 0; r < n; r++) {\n    for (let c = r + 1; c < n; c++) {\n      [matrix[r][c], matrix[c][r]] = [matrix[c][r], matrix[r][c]];\n    }\n  }\n  for (const row of matrix) row.reverse();\n  return matrix;\n}",
      tests: [
        { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
        { args: [[[1]]], expected: [[1]] },
        {
          args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]],
          expected: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]],
        },
      ],
      approach:
        "Decompose the rotation into two mirror-image operations: TRANSPOSE (swap across the main diagonal — note the inner loop starts at r+1 so each pair swaps once) then REVERSE each row. Composing two reflections yields a rotation — that's a real theorem from geometry, and it turns a fiddly four-way cyclic swap into two loops anyone can verify. Counter-clockwise? Transpose then reverse COLUMNS. Decomposing transformations into simpler self-inverse steps is the idea worth keeping.",
      docAnchor: "math--geometry",
    },
    {
      slug: "spiral-matrix",
      title: "Spiral Matrix",
      difficulty: "Medium",
      category: "math-geometry",
      blurb: "Read a matrix in spiral order.",
      statement: [
        "Return all elements of the `m × n` matrix in clockwise spiral order, starting from the top-left.",
      ],
      examples: [
        { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,6,9,8,7,4,5]" },
        { input: "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]", output: "[1,2,3,4,8,12,11,10,9,5,6,7]" },
      ],
      constraints: ["1 <= m, n <= 10"],
      fnName: "spiralOrder",
      starter: "function spiralOrder(matrix) {\n  \n}",
      solution:
        "function spiralOrder(matrix) {\n  const res = [];\n  let top = 0;\n  let bottom = matrix.length - 1;\n  let left = 0;\n  let right = matrix[0].length - 1;\n  while (top <= bottom && left <= right) {\n    for (let c = left; c <= right; c++) res.push(matrix[top][c]);\n    top++;\n    for (let r = top; r <= bottom; r++) res.push(matrix[r][right]);\n    right--;\n    if (top <= bottom) {\n      for (let c = right; c >= left; c--) res.push(matrix[bottom][c]);\n      bottom--;\n    }\n    if (left <= right) {\n      for (let r = bottom; r >= top; r--) res.push(matrix[r][left]);\n      left++;\n    }\n  }\n  return res;\n}",
      tests: [
        { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
        { args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expected: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
        { args: [[[7]]], expected: [7] },
        { args: [[[1], [2], [3]]], expected: [1, 2, 3] },
      ],
      approach:
        "Maintain four SHRINKING BOUNDARIES (top, bottom, left, right); each lap walks the top row, right column, bottom row, left column, contracting the corresponding boundary after each side. The two mid-loop `if` guards are the entire difficulty: after consuming the top row and right column, a single-row or single-column remainder would otherwise be walked TWICE (once forward, once backward). Boundary-shrinking simulation — with guards for degenerate leftovers — also drives Rotate Image's cycle version and Set Matrix Zeroes' in-place variant; it's the disciplined way to 'just simulate it'.",
      docAnchor: "math--geometry",
    },
    {
      slug: "set-matrix-zeroes",
      title: "Set Matrix Zeroes",
      difficulty: "Medium",
      category: "math-geometry",
      blurb: "Zero out the row and column of every zero — carefully.",
      statement: [
        "If an element of the matrix is 0, set its ENTIRE row and column to 0, in place. Return the matrix.",
      ],
      examples: [
        { input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]" },
        { input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]", output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]" },
      ],
      constraints: ["1 <= m, n <= 200"],
      fnName: "setZeroes",
      starter: "function setZeroes(matrix) {\n  \n}",
      solution:
        "function setZeroes(matrix) {\n  const R = matrix.length;\n  const C = matrix[0].length;\n  const zeroRows = new Set();\n  const zeroCols = new Set();\n  for (let r = 0; r < R; r++) {\n    for (let c = 0; c < C; c++) {\n      if (matrix[r][c] === 0) {\n        zeroRows.add(r);\n        zeroCols.add(c);\n      }\n    }\n  }\n  for (let r = 0; r < R; r++) {\n    for (let c = 0; c < C; c++) {\n      if (zeroRows.has(r) || zeroCols.has(c)) matrix[r][c] = 0;\n    }\n  }\n  return matrix;\n}",
      tests: [
        { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] },
        { args: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], expected: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]] },
        { args: [[[1, 2], [3, 4]]], expected: [[1, 2], [3, 4]] },
      ],
      approach:
        "The trap is zeroing WHILE scanning: freshly written zeros then trigger more zeroing and the cascade eats the matrix. So separate the phases — first RECORD which rows/columns are guilty (two sets, O(m+n) space), then apply. The celebrated O(1)-space refinement stores those flags IN the matrix itself, using row 0 and column 0 as the scratch space (with two booleans remembering whether they were guilty themselves). Phase separation first, then the storage trick — in that order.",
      docAnchor: "math--geometry",
    },
    {
      slug: "max-points-on-a-line",
      title: "Max Points on a Line",
      difficulty: "Hard",
      category: "math-geometry",
      blurb: "Most collinear points — slopes as exact fractions.",
      statement: [
        "Given `points` on a plane, return the maximum number of points lying on one straight line.",
      ],
      examples: [
        { input: "points = [[1,1],[2,2],[3,3]]", output: "3" },
        { input: "points = [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]", output: "4" },
      ],
      constraints: ["1 <= points.length <= 300", "All points distinct"],
      fnName: "maxPoints",
      starter: "function maxPoints(points) {\n  \n}",
      solution:
        "function maxPoints(points) {\n  const n = points.length;\n  if (n <= 2) return n;\n  function gcd(a, b) {\n    return b === 0 ? a : gcd(b, a % b);\n  }\n  let best = 2;\n  for (let i = 0; i < n; i++) {\n    const slopes = new Map();\n    for (let j = i + 1; j < n; j++) {\n      let dx = points[j][0] - points[i][0];\n      let dy = points[j][1] - points[i][1];\n      const g = gcd(Math.abs(dx), Math.abs(dy)) || 1;\n      dx /= g;\n      dy /= g;\n      if (dx < 0 || (dx === 0 && dy < 0)) {\n        dx = -dx;\n        dy = -dy;\n      }\n      const key = dx + \",\" + dy;\n      const cnt = (slopes.get(key) || 0) + 1;\n      slopes.set(key, cnt);\n      best = Math.max(best, cnt + 1);\n    }\n  }\n  return best;\n}",
      tests: [
        { args: [[[1, 1], [2, 2], [3, 3]]], expected: 3 },
        { args: [[[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]]], expected: 4 },
        { args: [[[0, 0]]], expected: 1 },
        { args: [[[0, 0], [1, 1], [0, 1]]], expected: 2 },
      ],
      approach:
        "Anchor on each point and bucket every other point by the DIRECTION to it — collinear-through-anchor means same direction. The geometry is easy; the correctness is all in the key: floating slopes (dy/dx) collide on precision, so store the direction as an exact reduced fraction — divide (dx, dy) by their gcd and normalize the sign to a canonical half-plane so (1,2) and (−1,−2) unify. Vertical lines fall out naturally as (0, 1). The meta-lesson generalizes far beyond geometry: when a float would be a map key, find the exact canonical form instead.",
      docAnchor: "math--geometry",
    },
    {
      slug: "add-digits",
      title: "Add Digits (digital root)",
      difficulty: "Easy",
      category: "math-geometry",
      blurb: "Repeatedly sum digits until one digit remains.",
      statement: [
        "Given a non-negative integer `num`, repeatedly add its digits until the result has a single digit, and return it. Example: 38 → 3+8 = 11 → 1+1 = 2.",
        "From *interactive-coding-challenges* (Mathematics & Probability: find the digital root).",
      ],
      examples: [
        { input: "num = 38", output: "2" },
        { input: "num = 0", output: "0" },
      ],
      constraints: ["0 <= num <= 2^31 - 1"],
      fnName: "addDigits",
      starter: `function addDigits(num) {\n  \n}`,
      solution: `function addDigits(num) {\n  while (num >= 10) {\n    let s = 0;\n    while (num > 0) {\n      s += num % 10;\n      num = Math.floor(num / 10);\n    }\n    num = s;\n  }\n  return num;\n}`,
      tests: [
        { args: [38], expected: 2 },
        { args: [0], expected: 0 },
        { args: [9], expected: 9 },
        { args: [12345], expected: 6 },
      ],
      approach:
        "The straightforward answer loops: peel digits with `%10` and `/10`, sum them, repeat until one digit is left — O(log₁₀ num) per pass, a couple of passes. The *slick* answer is the **digital root** formula: the result equals `1 + (num - 1) % 9` for num > 0 (and 0 for 0), giving O(1) with no loop — a nice example of spotting the math behind a process (numbers mod 9 preserve digit sums). Either passes; knowing the formula exists is the interview flex.",
      docAnchor: "math-geometry",
    },
    {
      slug: "roman-to-integer",
      title: "Roman to Integer",
      difficulty: "Easy",
      category: "math-geometry",
      blurb: "Convert a Roman numeral to its integer value.",
      statement: [
        "Given a Roman numeral string `s` (symbols I=1, V=5, X=10, L=50, C=100, D=500, M=1000, with the usual subtractive cases like IV=4, IX=9, XL=40…), return its integer value.",
        "Canonical must-do (AM-600 Math family).",
      ],
      examples: [
        { input: 's = "III"', output: "3" },
        { input: 's = "MCMXCIV"', output: "1994", explanation: "M=1000, CM=900, XC=90, IV=4." },
      ],
      constraints: ["1 <= s.length <= 15", "s is a valid Roman numeral in [1, 3999]"],
      fnName: "romanToInt",
      starter: `function romanToInt(s) {\n  \n}`,
      solution: `function romanToInt(s) {\n  const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };\n  let total = 0;\n  for (let i = 0; i < s.length; i++) {\n    if (i + 1 < s.length && val[s[i]] < val[s[i + 1]]) total -= val[s[i]];\n    else total += val[s[i]];\n  }\n  return total;\n}`,
      tests: [
        { args: ["III"], expected: 3 },
        { args: ["LVIII"], expected: 58 },
        { args: ["MCMXCIV"], expected: 1994 },
        { args: ["IV"], expected: 4 },
      ],
      approach:
        "The subtractive rule has a clean encoding: scan left to right and if a symbol is **smaller than the one after it** (like I before V), subtract it; otherwise add it. That single comparison handles IV/IX/XL/XC/CD/CM without special-casing each. O(n).",
      docAnchor: "math-geometry",
    },
    {
      slug: "factorial-trailing-zeroes",
      title: "Factorial Trailing Zeroes",
      difficulty: "Medium",
      category: "math-geometry",
      blurb: "How many trailing zeros does n! have?",
      statement: [
        "Given an integer `n`, return the number of trailing zeros in `n!` (n factorial). Aim for better than O(n).",
        "Canonical must-do (AM-600 Math family).",
      ],
      examples: [
        { input: "n = 3", output: "0", explanation: "3! = 6." },
        { input: "n = 5", output: "1", explanation: "5! = 120." },
        { input: "n = 25", output: "6" },
      ],
      constraints: ["0 <= n <= 10^4"],
      fnName: "trailingZeroes",
      starter: `function trailingZeroes(n) {\n  \n}`,
      solution: `function trailingZeroes(n) {\n  let count = 0;\n  while (n > 0) {\n    n = Math.floor(n / 5);\n    count += n;\n  }\n  return count;\n}`,
      tests: [
        { args: [3], expected: 0 },
        { args: [5], expected: 1 },
        { args: [25], expected: 6 },
        { args: [100], expected: 24 },
        { args: [0], expected: 0 },
      ],
      approach:
        "A trailing zero comes from a factor of 10 = 2×5, and in `n!` fives are far rarer than twos — so the answer is just **how many factors of 5** are in n!. Count multiples of 5, plus multiples of 25 (which contribute a second 5), plus 125, and so on: `n/5 + n/25 + n/125 + …`, which the loop computes by repeatedly dividing by 5. O(log₅ n) — no need to compute the (astronomically large) factorial.",
      docAnchor: "math-geometry",
    },
    {
      slug: "palindrome-number",
      title: "Palindrome Number",
      difficulty: "Easy",
      category: "math-geometry",
      blurb: "Is the integer the same forwards and backwards?",
      statement: [
        "Given an integer `x`, return `true` if it reads the same forwards and backwards. Solve it **without converting to a string**.",
        "Canonical must-do (AM-600 Math family).",
      ],
      examples: [
        { input: "x = 121", output: "true" },
        { input: "x = -121", output: "false", explanation: "Reads -121 vs 121-." },
        { input: "x = 10", output: "false" },
      ],
      constraints: ["-2^31 <= x <= 2^31 - 1"],
      fnName: "isPalindromeNumber",
      starter: `function isPalindromeNumber(x) {\n  \n}`,
      solution: `function isPalindromeNumber(x) {\n  if (x < 0) return false;\n  let reversed = 0, original = x;\n  while (x > 0) {\n    reversed = reversed * 10 + (x % 10);\n    x = Math.floor(x / 10);\n  }\n  return reversed === original;\n}`,
      tests: [
        { args: [121], expected: true },
        { args: [-121], expected: false },
        { args: [10], expected: false },
        { args: [0], expected: true },
      ],
      approach:
        "Rebuild the number backwards with the digit loop — peel the last digit (`x % 10`), append it to `reversed` (`reversed * 10 + digit`), drop it (`x / 10`) — then compare with the original. Negatives are never palindromes (the minus sign only sits in front). O(log₁₀ x). The classic optimization is reversing only *half* the digits to dodge overflow in fixed-width languages.",
      docAnchor: "math-geometry",
    },
    {
      slug: "excel-sheet-column-number",
      title: "Excel Sheet Column Number",
      difficulty: "Easy",
      category: "math-geometry",
      blurb: "A=1, Z=26, AA=27 — decode the column title.",
      statement: [
        'Given a spreadsheet column title (`"A"`, `"B"`, … `"Z"`, `"AA"`, `"AB"`, …), return its column number.',
        "Canonical must-do (AM-600 Math family).",
      ],
      examples: [
        { input: 'columnTitle = "A"', output: "1" },
        { input: 'columnTitle = "AB"', output: "28" },
        { input: 'columnTitle = "ZY"', output: "701" },
      ],
      constraints: ["1 <= columnTitle.length <= 7", "Uppercase letters only"],
      fnName: "titleToNumber",
      starter: `function titleToNumber(columnTitle) {\n  \n}`,
      solution: `function titleToNumber(columnTitle) {\n  let result = 0;\n  for (const c of columnTitle) {\n    result = result * 26 + (c.charCodeAt(0) - 64);\n  }\n  return result;\n}`,
      tests: [
        { args: ["A"], expected: 1 },
        { args: ["AB"], expected: 28 },
        { args: ["ZY"], expected: 701 },
        { args: ["FXSHRXW"], expected: 2147483647 },
      ],
      approach:
        "It's **base-26 with digits 1–26** (not 0–25 — there's no 'zero' letter, which is what makes AA = 27 rather than 26). So the usual positional trick applies: `result = result * 26 + value(letter)`, sweeping left to right, where `value = charCode - 64` puts A at 1. O(n). Recognising a disguised base conversion is the whole problem.",
      docAnchor: "math-geometry",
    },
    {
      slug: "excel-sheet-column-title",
      title: "Excel Sheet Column Title",
      difficulty: "Medium",
      category: "math-geometry",
      blurb: "1 → A, 28 → AB — the inverse conversion.",
      statement: [
        'Given a positive integer `columnNumber`, return its Excel column title (1 → `"A"`, 26 → `"Z"`, 27 → `"AA"`, 28 → `"AB"`, …).',
        "Canonical must-do (AM-600 Math family). The inverse of Excel Sheet Column Number.",
      ],
      examples: [
        { input: "columnNumber = 1", output: '"A"' },
        { input: "columnNumber = 28", output: '"AB"' },
        { input: "columnNumber = 701", output: '"ZY"' },
      ],
      constraints: ["1 <= columnNumber <= 2^31 - 1"],
      fnName: "convertToTitle",
      starter: `function convertToTitle(columnNumber) {\n  \n}`,
      solution: `function convertToTitle(columnNumber) {\n  let res = "";\n  while (columnNumber > 0) {\n    columnNumber--;\n    res = String.fromCharCode(65 + (columnNumber % 26)) + res;\n    columnNumber = Math.floor(columnNumber / 26);\n  }\n  return res;\n}`,
      tests: [
        { args: [1], expected: "A" },
        { args: [28], expected: "AB" },
        { args: [701], expected: "ZY" },
        { args: [2147483647], expected: "FXSHRXW" },
      ],
      approach:
        "It's base-26 **without a zero digit** (A is 1, not 0), so the plain `% 26` conversion is off by one at every step. The fix is a single line: **decrement before taking the remainder** (`columnNumber--`), which shifts the range from 1–26 into 0–25 so `A` lands correctly and 26 → `\"Z\"` instead of an impossible `\"A0\"`. Build the string right-to-left. O(log₂₆ n). This one-off decrement is the entire difficulty.",
      docAnchor: "math-geometry",
    },
  ],
};
