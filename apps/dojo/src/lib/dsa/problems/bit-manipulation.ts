/**
 * DSA — Bit Manipulation. Numbers as arrays of 32 booleans: XOR cancels
 * pairs, n & (n-1) clears the lowest set bit, masks encode sets. Small
 * vocabulary, outsized power.
 */
import type { DsaCategory } from "../types";

export const bitManipulation: DsaCategory = {
  id: "bit-manipulation",
  title: "Bit Manipulation",
  icon: "🎛️",
  docAnchor: "bit-manipulation",
  blurb:
    "XOR cancellation, n & (n−1), and bitmask sets — constant-space tricks the other patterns can't touch.",
  problems: [
    {
      slug: "single-number",
      title: "Single Number",
      difficulty: "Easy",
      category: "bit-manipulation",
      blurb: "Every element appears twice except one — find it in O(1) space.",
      statement: [
        "Every element of `nums` appears exactly twice except one, which appears once. Find it in linear time and CONSTANT extra space.",
      ],
      examples: [
        { input: "nums = [2,2,1]", output: "1" },
        { input: "nums = [4,1,2,1,2]", output: "4" },
      ],
      constraints: ["1 <= nums.length <= 3 * 10^4", "Exactly one element appears once"],
      fnName: "singleNumber",
      starter: "function singleNumber(nums) {\n  \n}",
      solution:
        "function singleNumber(nums) {\n  let acc = 0;\n  for (const x of nums) acc ^= x;\n  return acc;\n}",
      tests: [
        { args: [[2, 2, 1]], expected: 1 },
        { args: [[4, 1, 2, 1, 2]], expected: 4 },
        { args: [[1]], expected: 1 },
        { args: [[-3, 7, -3]], expected: 7 },
      ],
      approach:
        "XOR's two axioms do all the work: x ^ x = 0 (pairs annihilate) and x ^ 0 = x, plus commutativity so ORDER doesn't matter — XOR everything and the pairs cancel regardless of arrangement, leaving the singleton. No hash set, no sort. This cancellation property is bit manipulation's flagship: whenever a problem says 'appears an even number of times except…', your first thought should be XOR.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "number-of-1-bits",
      title: "Number of 1 Bits",
      difficulty: "Easy",
      category: "bit-manipulation",
      blurb: "Count set bits — meet n & (n−1).",
      statement: [
        "Return the number of `1` bits in the binary representation of the non-negative integer `n` (its Hamming weight).",
      ],
      examples: [
        { input: "n = 11", output: "3", explanation: "1011." },
        { input: "n = 128", output: "1" },
      ],
      constraints: ["0 <= n <= 2^31 - 1"],
      fnName: "hammingWeight",
      starter: "function hammingWeight(n) {\n  \n}",
      solution:
        "function hammingWeight(n) {\n  let count = 0;\n  while (n !== 0) {\n    n = n & (n - 1);\n    count++;\n  }\n  return count;\n}",
      tests: [
        { args: [11], expected: 3 },
        { args: [128], expected: 1 },
        { args: [0], expected: 0 },
        { args: [2147483645], expected: 30 },
      ],
      approach:
        "`n & (n − 1)` clears the LOWEST set bit: subtracting 1 flips that bit and everything below it, and the AND wipes the flipped region. Loop until zero, counting iterations — it runs once per SET bit, not once per bit position, so 128 (one bit) takes a single step. This one identity powers set-bit counting, the power-of-two test, and Brian Kernighan-style subset tricks; it's the single most reusable line in this category.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "counting-bits",
      title: "Counting Bits",
      difficulty: "Easy",
      category: "bit-manipulation",
      blurb: "Popcount of every number 0..n via DP on bits.",
      statement: [
        "Return an array `ans` of length `n + 1` where `ans[i]` is the number of `1` bits in `i`. Aim for O(n) — not O(n log n).",
      ],
      examples: [
        { input: "n = 2", output: "[0,1,1]" },
        { input: "n = 5", output: "[0,1,1,2,1,2]" },
      ],
      constraints: ["0 <= n <= 10^5"],
      fnName: "countBits",
      starter: "function countBits(n) {\n  \n}",
      solution:
        "function countBits(n) {\n  const dp = new Array(n + 1).fill(0);\n  for (let i = 1; i <= n; i++) {\n    dp[i] = dp[i >> 1] + (i & 1);\n  }\n  return dp;\n}",
      tests: [
        { args: [2], expected: [0, 1, 1] },
        { args: [5], expected: [0, 1, 1, 2, 1, 2] },
        { args: [0], expected: [0] },
        { args: [8], expected: [0, 1, 1, 2, 1, 2, 2, 3, 1] },
      ],
      approach:
        "A DP where the recurrence is a bit operation: i >> 1 is i with its last bit dropped — a number you've ALREADY counted — so popcount(i) = popcount(i >> 1) + (last bit of i). One array pass, O(1) per entry. The alternative dp[i] = dp[i & (i−1)] + 1 (drop the lowest set bit instead) works identically. Bit structure often hands you a smaller subproblem for free; this is the cleanest example of DP and bits composing.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "missing-number",
      title: "Missing Number",
      difficulty: "Easy",
      category: "bit-manipulation",
      blurb: "Which of 0..n is absent?",
      statement: [
        "`nums` contains n distinct numbers from the range `[0, n]` — one number of the range is missing. Return it in O(n) time, O(1) space.",
      ],
      examples: [
        { input: "nums = [3,0,1]", output: "2" },
        { input: "nums = [0,1]", output: "2" },
        { input: "nums = [9,6,4,2,3,5,7,0,1]", output: "8" },
      ],
      constraints: ["1 <= n <= 10^4", "All numbers distinct"],
      fnName: "missingNumber",
      starter: "function missingNumber(nums) {\n  \n}",
      solution:
        "function missingNumber(nums) {\n  let acc = nums.length;\n  for (let i = 0; i < nums.length; i++) {\n    acc ^= i ^ nums[i];\n  }\n  return acc;\n}",
      tests: [
        { args: [[3, 0, 1]], expected: 2 },
        { args: [[0, 1]], expected: 2 },
        { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
        { args: [[0]], expected: 1 },
      ],
      approach:
        "Engineer the pair-cancellation yourself: XOR together every index 0..n AND every value in the array. Each present number appears twice (once as an index, once as a value) and vanishes; the missing number appears only once — as an index — and survives. Seeding the accumulator with n covers the top index. The Gauss-sum alternative (n(n+1)/2 − sum) is equally valid; XOR just sidesteps any overflow conversation. Constructing artificial pairs so XOR can cancel them is the transferable move.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "power-of-two",
      title: "Power of Two",
      difficulty: "Easy",
      category: "bit-manipulation",
      blurb: "Is n a power of two? One expression, no loop.",
      statement: [
        "Return `true` if the integer `n` is a power of two (n = 2^k for some k ≥ 0), without loops or recursion if you can.",
      ],
      examples: [
        { input: "n = 1", output: "true", explanation: "2^0." },
        { input: "n = 16", output: "true" },
        { input: "n = 3", output: "false" },
      ],
      constraints: ["-2^31 <= n <= 2^31 - 1"],
      fnName: "isPowerOfTwo",
      starter: "function isPowerOfTwo(n) {\n  \n}",
      solution:
        "function isPowerOfTwo(n) {\n  return n > 0 && (n & (n - 1)) === 0;\n}",
      tests: [
        { args: [1], expected: true },
        { args: [16], expected: true },
        { args: [3], expected: false },
        { args: [0], expected: false },
        { args: [-16], expected: false },
      ],
      approach:
        "A power of two has EXACTLY one set bit, and `n & (n − 1)` clears the lowest set bit — so for powers of two (and only them) the result is zero. The `n > 0` guard rejects 0 (no set bits) and negatives. Same identity as Number of 1 Bits wearing different clothes: once you know 'popcount == 1', the expression writes itself. Also file away: (n & −n) isolates the lowest set bit — the sibling identity, central to Fenwick trees.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "reverse-bits",
      title: "Reverse Bits",
      difficulty: "Easy",
      category: "bit-manipulation",
      blurb: "Mirror a 32-bit unsigned integer.",
      statement: [
        "Reverse the bits of a 32-bit UNSIGNED integer and return the resulting unsigned integer.",
      ],
      examples: [
        { input: "n = 43261596", output: "964176192", explanation: "00000010100101000001111010011100 → 00111001011110000010100101000000." },
        { input: "n = 4294967293", output: "3221225471" },
      ],
      constraints: ["0 <= n < 2^32"],
      fnName: "reverseBits",
      starter: "function reverseBits(n) {\n  \n}",
      solution:
        "function reverseBits(n) {\n  let res = 0;\n  for (let i = 0; i < 32; i++) {\n    res = res * 2 + (n & 1);\n    n >>>= 1;\n  }\n  return res;\n}",
      tests: [
        { args: [43261596], expected: 964176192 },
        { args: [4294967293], expected: 3221225471 },
        { args: [0], expected: 0 },
        { args: [1], expected: 2147483648 },
      ],
      approach:
        "Peel bits off one end, press them onto the other: 32 times, take the low bit (n & 1), append it to the result, shift n right. Two JS-specific signposts: `>>>` is the UNSIGNED right shift (plain `>>` drags the sign bit along), and building the result with `* 2` instead of `<< 1` dodges the fact that JS bitwise ops work on SIGNED 32-bit values — `res << 1` would go negative once bit 31 lands. Every bit-twiddling exercise in JS eventually collides with these two facts; better to meet them here.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "single-number-ii",
      title: "Single Number II",
      difficulty: "Medium",
      category: "bit-manipulation",
      blurb: "Every element thrice except one — XOR alone won't cut it.",
      statement: [
        "Every element of `nums` appears exactly THREE times except one, which appears once. Find it in linear time and constant space.",
      ],
      examples: [
        { input: "nums = [2,2,3,2]", output: "3" },
        { input: "nums = [0,1,0,1,0,1,99]", output: "99" },
      ],
      constraints: ["1 <= nums.length <= 3 * 10^4"],
      fnName: "singleNumber",
      starter: "function singleNumber(nums) {\n  \n}",
      solution:
        "function singleNumber(nums) {\n  let ones = 0;\n  let twos = 0;\n  for (const x of nums) {\n    ones = (ones ^ x) & ~twos;\n    twos = (twos ^ x) & ~ones;\n  }\n  return ones;\n}",
      tests: [
        { args: [[2, 2, 3, 2]], expected: 3 },
        { args: [[0, 1, 0, 1, 0, 1, 99]], expected: 99 },
        { args: [[30000, 500, 100, 30000, 100, 30000, 100]], expected: 500 },
        { args: [[-2, -2, 1, -2]], expected: 1 },
      ],
      approach:
        "Since 3 is odd, XOR can't cancel triples — you need a counter that wraps at 3 PER BIT. `ones` and `twos` implement exactly that: for each bit, (twos, ones) counts appearances mod 3 (00 → 01 → 10 → 00), and the masking (`& ~twos`, `& ~ones`) performs the wrap. The singleton's bits, seen once, rest in `ones`. The per-bit view (imagine 32 independent little counters) is how to actually understand it — and it generalizes: for 'every element k times', build a mod-k bit counter. The fallback of summing each bit position across all numbers and taking mod 3 is slower but transparent; derive the two-variable trick from it once.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "sum-of-two-integers",
      title: "Sum of Two Integers",
      difficulty: "Medium",
      category: "bit-manipulation",
      blurb: "Add without + or −: XOR is sum, AND is carry.",
      statement: [
        "Return `a + b` without using the `+` or `-` operators. Inputs fit in 32-bit signed range.",
      ],
      examples: [
        { input: "a = 1, b = 2", output: "3" },
        { input: "a = 2, b = 3", output: "5" },
        { input: "a = -1, b = 1", output: "0" },
      ],
      constraints: ["-1000 <= a, b <= 1000"],
      fnName: "getSum",
      starter: "function getSum(a, b) {\n  \n}",
      solution:
        "function getSum(a, b) {\n  while (b !== 0) {\n    const carry = (a & b) << 1;\n    a = a ^ b;\n    b = carry;\n  }\n  return a;\n}",
      tests: [
        { args: [1, 2], expected: 3 },
        { args: [2, 3], expected: 5 },
        { args: [-1, 1], expected: 0 },
        { args: [-2, 3], expected: 1 },
      ],
      approach:
        "Binary addition splits into two independent pieces: XOR adds each bit column IGNORING carries, and AND-then-shift-left computes exactly the carries that were ignored. Loop, feeding the carries back in, until none remain — each pass pushes carries at least one bit left, so it terminates within 32 iterations (negatives work automatically in two's complement; the sign bit is just another bit). This is genuinely how hardware adders decompose the problem. If asked 'implement multiplication without ×' next, the same shift-and-add thinking applies.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "bitwise-and-of-numbers-range",
      title: "Bitwise AND of Numbers Range",
      difficulty: "Medium",
      category: "bit-manipulation",
      blurb: "AND of every integer from left to right at once.",
      statement: [
        "Return the bitwise AND of ALL integers in the inclusive range `[left, right]` — without iterating the range.",
      ],
      examples: [
        { input: "left = 5, right = 7", output: "4", explanation: "5 & 6 & 7 = 4." },
        { input: "left = 1, right = 2147483647", output: "0" },
      ],
      constraints: ["0 <= left <= right <= 2^31 - 1"],
      fnName: "rangeBitwiseAnd",
      starter: "function rangeBitwiseAnd(left, right) {\n  \n}",
      solution:
        "function rangeBitwiseAnd(left, right) {\n  let shift = 0;\n  while (left < right) {\n    left >>= 1;\n    right >>= 1;\n    shift++;\n  }\n  return left << shift;\n}",
      tests: [
        { args: [5, 7], expected: 4 },
        { args: [0, 0], expected: 0 },
        { args: [1, 2147483647], expected: 0 },
        { args: [12, 15], expected: 12 },
      ],
      approach:
        "Any bit that CHANGES anywhere in the range is 0 somewhere in it, so it dies in the AND. What survives is precisely the COMMON BINARY PREFIX of left and right — everything below the highest differing bit gets zeroed (some number in between flips it). So: right-shift both until equal (stripping the differing suffix), then shift back. Reframing 'combine a whole range' as 'find the shared prefix' is the insight; brute-forcing 2³¹ ANDs is the trap the constraints set for you.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "maximum-product-of-word-lengths",
      title: "Maximum Product of Word Lengths",
      difficulty: "Medium",
      category: "bit-manipulation",
      blurb: "Longest pair of words sharing no letters — sets as bitmasks.",
      statement: [
        "Return the maximum of `words[i].length * words[j].length` over pairs of words that share NO common letters, or `0` if no such pair exists.",
      ],
      examples: [
        { input: "words = [\"abcw\",\"baz\",\"foo\",\"bar\",\"xtfn\",\"abcdef\"]", output: "16", explanation: "\"abcw\" and \"xtfn\"." },
        { input: "words = [\"a\",\"aa\",\"aaa\",\"aaaa\"]", output: "0" },
      ],
      constraints: ["2 <= words.length <= 1000", "Lowercase letters only"],
      fnName: "maxProduct",
      starter: "function maxProduct(words) {\n  \n}",
      solution:
        "function maxProduct(words) {\n  const masks = words.map((w) => {\n    let m = 0;\n    for (const ch of w) m |= 1 << (ch.charCodeAt(0) - 97);\n    return m;\n  });\n  let best = 0;\n  for (let i = 0; i < words.length; i++) {\n    for (let j = i + 1; j < words.length; j++) {\n      if ((masks[i] & masks[j]) === 0) {\n        best = Math.max(best, words[i].length * words[j].length);\n      }\n    }\n  }\n  return best;\n}",
      tests: [
        { args: [["abcw", "baz", "foo", "bar", "xtfn", "abcdef"]], expected: 16 },
        { args: [["a", "ab", "abc", "d", "cd", "bcd", "abcd"]], expected: 4 },
        { args: [["a", "aa", "aaa", "aaaa"]], expected: 0 },
      ],
      approach:
        "The BITMASK-AS-SET pattern: 26 lowercase letters fit in 26 bits, so each word's letter set becomes one integer — bit i set means letter i present. 'Share no letters' collapses from a set-intersection loop into `(m1 & m2) === 0`, one CPU instruction per pair. Precompute masks once (O(total letters)), then the pairwise check is O(n²) cheap comparisons. Encoding small sets as integers — and getting union (|), intersection (&), complement (~) for free — is the gateway to bitmask DP over subsets.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "hamming-distance",
      title: "Hamming Distance",
      difficulty: "Easy",
      category: "bit-manipulation",
      blurb: "How many bit positions differ between x and y?",
      statement: [
        "The **Hamming distance** between two integers is the number of bit positions at which their binary representations differ. Given `x` and `y`, return their Hamming distance.",
        "From *interactive-coding-challenges* (Bit Manipulation: number of bits to flip to convert a into b).",
      ],
      examples: [
        { input: "x = 1, y = 4", output: "2", explanation: "0001 vs 0100 differ in 2 positions." },
        { input: "x = 3, y = 1", output: "1" },
      ],
      constraints: ["0 <= x, y <= 2^31 - 1"],
      fnName: "hammingDistance",
      starter: `function hammingDistance(x, y) {\n  \n}`,
      solution: `function hammingDistance(x, y) {\n  let z = x ^ y;\n  let count = 0;\n  while (z) {\n    count += z & 1;\n    z >>>= 1;\n  }\n  return count;\n}`,
      tests: [
        { args: [1, 4], expected: 2 },
        { args: [3, 1], expected: 1 },
        { args: [0, 0], expected: 0 },
        { args: [7, 0], expected: 3 },
      ],
      approach:
        "**XOR is the 'difference detector':** `x ^ y` has a 1 in exactly the positions where the bits differ, so the answer is just the number of set bits in `x ^ y` (its 'popcount'). Count them by testing the lowest bit (`z & 1`) and shifting right with the **unsigned** shift `>>>` (so bit 31 doesn't sign-extend and loop forever). One XOR turns 'how many flips?' into 'how many 1s?'.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "single-number-iii",
      title: "Single Number III",
      difficulty: "Medium",
      category: "bit-manipulation",
      blurb: "Two numbers appear once; the rest twice. Find both.",
      statement: [
        "Exactly two elements of `nums` appear only once; every other element appears exactly twice. Return the two single elements, in ascending order.",
        "From AlgoMaster **AM-600** (Bit Manipulation).",
      ],
      examples: [
        { input: "nums = [1,2,1,3,2,5]", output: "[3,5]" },
        { input: "nums = [0,1]", output: "[0,1]" },
      ],
      constraints: ["2 <= nums.length <= 3·10^4", "Exactly two elements appear once"],
      fnName: "singleNumber",
      starter: `function singleNumber(nums) {\n  \n}`,
      solution: `function singleNumber(nums) {\n  let xorAll = 0;\n  for (const x of nums) xorAll ^= x;\n  const diff = xorAll & (-xorAll);\n  let a = 0, b = 0;\n  for (const x of nums) {\n    if (x & diff) a ^= x;\n    else b ^= x;\n  }\n  return [a, b].sort((p, q) => p - q);\n}`,
      tests: [
        { args: [[1, 2, 1, 3, 2, 5]], expected: [3, 5] },
        { args: [[-1, 0]], expected: [-1, 0] },
        { args: [[0, 1]], expected: [0, 1] },
        { args: [[1, 1, 2, 2, 7, 9]], expected: [7, 9] },
      ],
      approach:
        "XOR-ing everything cancels the pairs and leaves `a ^ b` (the two loners XOR'd). Since a ≠ b, that result has at least one set bit — grab the **lowest set bit** with `x & (-x)`. That bit differs between a and b, so it *partitions* all the numbers into two groups; XOR each group separately and the pairs cancel again, isolating one loner per group. Two passes, O(1) space — a beautiful 'XOR to cancel, one bit to split' combo.",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "set-mismatch",
      title: "Set Mismatch",
      difficulty: "Easy",
      category: "bit-manipulation",
      blurb: "One number is duplicated, one is missing. Find both.",
      statement: [
        "You have the numbers `1…n` but one number got duplicated (replacing another), so one value appears twice and one is missing. Given the array `nums`, return `[duplicated, missing]`.",
        "From AlgoMaster **AM-600** (Bit Manipulation).",
      ],
      examples: [
        { input: "nums = [1,2,2,4]", output: "[2,3]" },
        { input: "nums = [1,1]", output: "[1,2]" },
      ],
      constraints: ["2 <= nums.length <= 10^4", "nums contains values from 1..n"],
      fnName: "findErrorNums",
      starter: `function findErrorNums(nums) {\n  \n}`,
      solution: `function findErrorNums(nums) {\n  const n = nums.length;\n  let xr = 0;\n  for (let i = 0; i < n; i++) xr ^= nums[i] ^ (i + 1);\n  const bit = xr & (-xr);\n  let a = 0, b = 0;\n  for (let i = 0; i < n; i++) {\n    const v = nums[i], idx = i + 1;\n    if (v & bit) a ^= v; else b ^= v;\n    if (idx & bit) a ^= idx; else b ^= idx;\n  }\n  let countA = 0;\n  for (const x of nums) if (x === a) countA++;\n  return countA > 0 ? [a, b] : [b, a];\n}`,
      tests: [
        { args: [[1, 2, 2, 4]], expected: [2, 3] },
        { args: [[1, 1]], expected: [1, 2] },
        { args: [[3, 2, 3, 4, 6, 5]], expected: [3, 1] },
        { args: [[2, 2]], expected: [2, 1] },
      ],
      approach:
        "XOR every array value together with every ideal value `1…n`: matched numbers cancel, leaving `dup ^ missing`. Split on its lowest set bit (same trick as Single Number III) to isolate the two mismatched values — but you don't yet know which is the duplicate. A quick count in `nums` disambiguates: the one that actually appears is the duplicate. O(n) time, O(1) space. (The straightforward alternative is a hash set — but XOR keeps it constant-space.)",
      docAnchor: "bit-manipulation",
    },
    {
      slug: "number-complement",
      title: "Number Complement",
      difficulty: "Easy",
      category: "bit-manipulation",
      blurb: "Flip every bit of the number's binary form.",
      statement: [
        "Given a positive integer `num`, return its **complement**: the number you get by flipping every bit in its binary representation (ignoring leading zeros). E.g. 5 is `101` → `010` = 2.",
        "Canonical must-do (AM-600 Bit Manipulation family).",
      ],
      examples: [
        { input: "num = 5", output: "2", explanation: "101 → 010." },
        { input: "num = 1", output: "0" },
      ],
      constraints: ["1 <= num < 2^31"],
      fnName: "findComplement",
      starter: `function findComplement(num) {\n  \n}`,
      solution: `function findComplement(num) {\n  let mask = 1;\n  while (mask < num) mask = mask * 2 + 1;\n  return mask ^ num;\n}`,
      tests: [
        { args: [5], expected: 2 },
        { args: [1], expected: 0 },
        { args: [7], expected: 0 },
        { args: [10], expected: 5 },
      ],
      approach:
        "A plain `~num` flips all 32 bits including the leading zeros (and the sign), which isn't what's wanted. So build a **mask of all 1s exactly as wide as `num`** (`1, 11, 111, …` via `mask*2+1`) and XOR with it — XOR-ing with 1 flips a bit, and the mask stops at the number's own width. O(log num). Constructing a width-matched mask is the standard fix for 'ignore leading zeros' bit problems.",
      docAnchor: "bit-manipulation",
    },
  ],
};
