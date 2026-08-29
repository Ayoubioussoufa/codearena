/**
 * DSA — Game Theory & Brain Teasers. Two rational players, alternating
 * turns: reason backwards from the end (minimax over states), or find the
 * invariant that decides the game outright. Plus a few pure aha-puzzles.
 */
import type { DsaCategory } from "../types";

export const gameTheory: DsaCategory = {
  id: "game-theory",
  title: "Game Theory & Brain Teasers",
  icon: "🎲",
  docAnchor: "game-theory--brain-teasers",
  blurb:
    "Minimax on game states, winning/losing positions, and puzzles whose answer is an invariant, not an algorithm.",
  problems: [
    {
      slug: "nim-game",
      title: "Nim Game",
      difficulty: "Easy",
      category: "game-theory",
      blurb: "Remove 1–3 stones; taker of the last stone wins.",
      statement: [
        "You and a friend alternate removing 1 to 3 stones from a heap of `n`; you go first, and whoever takes the LAST stone wins. Both play optimally. Return whether you can win.",
      ],
      examples: [
        { input: "n = 4", output: "false", explanation: "Whatever you take, your friend takes the rest." },
        { input: "n = 1", output: "true" },
        { input: "n = 2", output: "true" },
      ],
      constraints: ["1 <= n <= 2^31 - 1"],
      fnName: "canWinNim",
      starter: "function canWinNim(n) {\n  \n}",
      solution:
        "function canWinNim(n) {\n  return n % 4 !== 0;\n}",
      tests: [
        { args: [4], expected: false },
        { args: [1], expected: true },
        { args: [2], expected: true },
        { args: [8], expected: false },
        { args: [7], expected: true },
      ],
      approach:
        "Classify positions as WINNING (some move leads the opponent into a losing position) or LOSING (every move leaves the opponent winning). Work upward: 1–3 win outright; 4 loses (all moves hand over a winner); 5–7 win by moving TO 4; 8 loses… the losing positions are exactly the multiples of 4, and optimal play means always handing your opponent one. Every impartial game yields to this backward classification — here it collapses to `n % 4 !== 0`. Start the category by doing the classification by hand for n = 1..10; the one-liner should feel earned, not memorized.",
      docAnchor: "game-theory--brain-teasers",
    },
    {
      slug: "divisor-game",
      title: "Divisor Game",
      difficulty: "Easy",
      category: "game-theory",
      blurb: "Subtract a proper divisor; the player who can't move loses.",
      statement: [
        "Starting with `n` on the board, players alternate choosing a divisor `x` of `n` with `0 < x < n` and replacing `n` by `n − x`. A player who cannot move loses. Alice goes first; both play optimally. Return whether Alice wins.",
      ],
      examples: [
        { input: "n = 2", output: "true", explanation: "Alice takes 1, Bob faces 1 and cannot move." },
        { input: "n = 3", output: "false" },
      ],
      constraints: ["1 <= n <= 1000"],
      fnName: "divisorGame",
      starter: "function divisorGame(n) {\n  \n}",
      solution:
        "function divisorGame(n) {\n  const win = new Array(n + 1).fill(false);\n  for (let i = 2; i <= n; i++) {\n    for (let x = 1; x < i; x++) {\n      if (i % x === 0 && !win[i - x]) {\n        win[i] = true;\n        break;\n      }\n    }\n  }\n  return win[n];\n}",
      tests: [
        { args: [2], expected: true },
        { args: [3], expected: false },
        { args: [1], expected: false },
        { args: [6], expected: true },
        { args: [1000], expected: true },
      ],
      approach:
        "The DP writes the winning/losing definition verbatim: win[i] is true iff SOME legal move x (a divisor of i) lands the opponent on a losing position win[i−x] = false. Base: 1 loses (no move). Run it and a pattern leaps out — even wins, odd loses. The proof is a parity invariant: odd numbers have only odd divisors, so odd → even always; from even you can always subtract 1 to hand back an odd. The layered lesson: brute-force the game DP FIRST, observe, then prove the invariant. Guessing 'n % 2 === 0' without the proof is pattern-matching, not game theory.",
      docAnchor: "game-theory--brain-teasers",
    },
    {
      slug: "bulb-switcher",
      title: "Bulb Switcher",
      difficulty: "Medium",
      category: "game-theory",
      blurb: "n bulbs, n toggle rounds — how many end up on?",
      statement: [
        "There are `n` bulbs, initially off. Round 1 toggles every bulb, round 2 every second bulb, …, round i every i-th bulb, up to round n. Return how many bulbs are ON at the end.",
      ],
      examples: [
        { input: "n = 3", output: "1", explanation: "After the rounds: [on, off, off]." },
        { input: "n = 0", output: "0" },
        { input: "n = 1", output: "1" },
      ],
      constraints: ["0 <= n <= 10^9"],
      fnName: "bulbSwitch",
      starter: "function bulbSwitch(n) {\n  \n}",
      solution:
        "function bulbSwitch(n) {\n  return Math.floor(Math.sqrt(n));\n}",
      tests: [
        { args: [3], expected: 1 },
        { args: [0], expected: 0 },
        { args: [1], expected: 1 },
        { args: [100], expected: 10 },
        { args: [99], expected: 9 },
      ],
      approach:
        "Bulb k is toggled once per DIVISOR of k. Divisors pair up (d with k/d), so almost every bulb gets an even number of toggles and ends OFF — except perfect squares, where the pair d = k/d = √k collapses into ONE toggle, leaving the count odd and the bulb ON. So the answer is how many perfect squares are ≤ n: ⌊√n⌋. Pure brain teaser: the 'algorithm' dissolves once you find the right counting argument. When a simulation looks like O(n log n) toggling, first ask what property of k the process is secretly counting.",
      docAnchor: "game-theory--brain-teasers",
    },
    {
      slug: "find-the-winner-of-the-circular-game",
      title: "Find the Winner of the Circular Game",
      difficulty: "Medium",
      category: "game-theory",
      blurb: "The Josephus problem: every k-th player leaves the circle.",
      statement: [
        "`n` friends sit in a circle, numbered 1..n. Starting the count at friend 1, every `k`-th friend counted leaves the circle, and counting resumes from the next friend. Return the number of the last friend remaining.",
      ],
      examples: [
        { input: "n = 5, k = 2", output: "3", explanation: "Leave order: 2, 4, 1, 5 — friend 3 survives." },
        { input: "n = 6, k = 5", output: "1" },
      ],
      constraints: ["1 <= k <= n <= 500"],
      fnName: "findTheWinner",
      starter: "function findTheWinner(n, k) {\n  \n}",
      solution:
        "function findTheWinner(n, k) {\n  let winner = 0; // 0-indexed survivor of the m-person game\n  for (let m = 2; m <= n; m++) {\n    winner = (winner + k) % m;\n  }\n  return winner + 1;\n}",
      tests: [
        { args: [5, 2], expected: 3 },
        { args: [6, 5], expected: 1 },
        { args: [1, 1], expected: 1 },
        { args: [4, 1], expected: 4 },
      ],
      approach:
        "The Josephus recurrence, built from one observation: after the first elimination (person k in 0-indexed position k−1), the remaining m−1 people form the SAME game, just relabeled — position 0 of the smaller game sits at old position k. So survivor(m) = (survivor(m−1) + k) mod m, seeded with survivor(1) = 0; run it up from 2 to n and convert to 1-indexing at the end. O(n) time, O(1) space versus O(nk) simulation. Solving a process by finding how the (m−1)-case EMBEDS in the m-case is a recurring trick for elimination games.",
      docAnchor: "game-theory--brain-teasers",
    },
    {
      slug: "stone-game",
      title: "Stone Game",
      difficulty: "Medium",
      category: "game-theory",
      blurb: "Take piles from either end; most stones wins.",
      statement: [
        "An EVEN number of `piles` with an odd total lies in a row. Players alternately take the entire pile from either END; Alice goes first. Both play optimally. Return whether Alice wins (ties impossible).",
      ],
      examples: [
        { input: "piles = [5,3,4,5]", output: "true", explanation: "Alice can always engineer taking 5 and 4." },
        { input: "piles = [3,7,2,3]", output: "true" },
      ],
      constraints: ["2 <= piles.length <= 500", "piles.length is even; total is odd"],
      fnName: "stoneGame",
      starter: "function stoneGame(piles) {\n  \n}",
      solution:
        "function stoneGame(piles) {\n  const n = piles.length;\n  const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n  for (let i = 0; i < n; i++) dp[i][i] = piles[i];\n  for (let len = 2; len <= n; len++) {\n    for (let i = 0; i + len - 1 < n; i++) {\n      const j = i + len - 1;\n      dp[i][j] = Math.max(piles[i] - dp[i + 1][j], piles[j] - dp[i][j - 1]);\n    }\n  }\n  return dp[0][n - 1] > 0;\n}",
      tests: [
        { args: [[5, 3, 4, 5]], expected: true },
        { args: [[3, 7, 2, 3]], expected: true },
        { args: [[1, 2]], expected: true },
        { args: [[7, 8, 8, 10]], expected: true },
      ],
      approach:
        "The INTERVAL-GAME DP in its cleanest form: dp[i][j] = best score DIFFERENCE (current player minus opponent) on piles i..j. Taking an end yields that pile MINUS the opponent's best difference on the remainder — the minus sign encodes the role swap, which is minimax compressed into one max. Fill by interval length; answer: is dp over the whole row positive? Delicious footnote: with even piles Alice can always claim all even-indexed or all odd-indexed piles, so `return true` is also correct — but the DP is what transfers to Predict the Winner, where no such parity trick exists.",
      docAnchor: "game-theory--brain-teasers",
    },
    {
      slug: "predict-the-winner",
      title: "Predict the Winner",
      difficulty: "Medium",
      category: "game-theory",
      blurb: "Same end-taking game — without the rigged setup.",
      statement: [
        "Players alternately take a number from either END of `nums`, accumulating what they take; Player 1 goes first. Both play optimally. Return whether Player 1 can score at least as much as Player 2 (a tie counts as a win).",
      ],
      examples: [
        { input: "nums = [1,5,2]", output: "false", explanation: "Whatever Player 1 takes, Player 2 secures the 5." },
        { input: "nums = [1,5,233,7]", output: "true" },
      ],
      constraints: ["1 <= nums.length <= 20", "0 <= nums[i] <= 10^7"],
      fnName: "predictTheWinner",
      starter: "function predictTheWinner(nums) {\n  \n}",
      solution:
        "function predictTheWinner(nums) {\n  const n = nums.length;\n  const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n  for (let i = 0; i < n; i++) dp[i][i] = nums[i];\n  for (let len = 2; len <= n; len++) {\n    for (let i = 0; i + len - 1 < n; i++) {\n      const j = i + len - 1;\n      dp[i][j] = Math.max(nums[i] - dp[i + 1][j], nums[j] - dp[i][j - 1]);\n    }\n  }\n  return dp[0][n - 1] >= 0;\n}",
      tests: [
        { args: [[1, 5, 2]], expected: false },
        { args: [[1, 5, 233, 7]], expected: true },
        { args: [[1]], expected: true },
        { args: [[1, 1]], expected: true },
      ],
      approach:
        "Identical DP to Stone Game — that's the point of doing them back to back: the score-difference formulation dp[i][j] = max(take-left, take-right) with the opponent's difference SUBTRACTED handles 'both play optimally' without ever tracking two separate scores. Only the finish line differs (≥ 0, ties allowed; odd lengths allowed, so no parity shortcut exists here). Once this pair clicks, you own the template for every alternating-turns-on-an-interval game: define the state as a range, the value as a difference, and let the sign flip do the minimax.",
      docAnchor: "game-theory--brain-teasers",
    },
    {
      slug: "guess-number-higher-or-lower-ii",
      title: "Guess Number Higher or Lower II",
      difficulty: "Medium",
      category: "game-theory",
      blurb: "Minimize the worst-case cost of guessing a hidden number.",
      statement: [
        "A number is hidden in `[1, n]`. Each wrong guess `g` costs `g` dollars and you learn higher/lower. Return the minimum amount that GUARANTEES you can win regardless of the hidden number.",
      ],
      examples: [
        { input: "n = 10", output: "16" },
        { input: "n = 1", output: "0" },
        { input: "n = 2", output: "1", explanation: "Guess 1; if wrong it's 2." },
      ],
      constraints: ["1 <= n <= 200"],
      fnName: "getMoneyAmount",
      starter: "function getMoneyAmount(n) {\n  \n}",
      solution:
        "function getMoneyAmount(n) {\n  const dp = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));\n  for (let len = 2; len <= n; len++) {\n    for (let lo = 1; lo + len - 1 <= n; lo++) {\n      const hi = lo + len - 1;\n      let best = Infinity;\n      for (let k = lo; k <= hi; k++) {\n        best = Math.min(best, k + Math.max(dp[lo][k - 1], dp[k + 1][hi]));\n      }\n      dp[lo][hi] = best;\n    }\n  }\n  return dp[1][n];\n}",
      tests: [
        { args: [10], expected: 16 },
        { args: [1], expected: 0 },
        { args: [2], expected: 1 },
        { args: [3], expected: 2 },
      ],
      approach:
        "MINIMAX where the 'opponent' is worst-case luck: guessing k on range [lo, hi] costs k plus the WORSE of the two resulting subranges (max — reality picks against you), and you choose the k minimizing that (min — you pick your guess). dp[range] over interval lengths, O(n³). Note dp[1][n] = 16 for n = 10, NOT what binary search costs — minimizing worst-case DOLLARS shifts the optimal guesses off-center (cheap early guesses hedge expensive late ones). Min-over-your-moves of max-over-outcomes is the exact shape of decision-making under adversarial uncertainty.",
      docAnchor: "game-theory--brain-teasers",
    },
    {
      slug: "chalkboard-xor-game",
      title: "Chalkboard XOR Game",
      difficulty: "Hard",
      category: "game-theory",
      blurb: "Erase numbers; whoever makes the XOR zero... it's subtle.",
      statement: [
        "Numbers are on a chalkboard. Players alternate ERASING one number; a player who erases a number that leaves the XOR of the rest equal to 0 LOSES — but if the XOR of all numbers is already 0 when your turn STARTS, you WIN. Alice goes first, both optimal. Return whether Alice wins.",
      ],
      examples: [
        { input: "nums = [1,1,2]", output: "false" },
        { input: "nums = [0,1]", output: "true" },
        { input: "nums = [1,2,3]", output: "true" },
      ],
      constraints: ["1 <= nums.length <= 1000", "0 <= nums[i] < 2^16"],
      fnName: "xorGame",
      starter: "function xorGame(nums) {\n  \n}",
      solution:
        "function xorGame(nums) {\n  let xor = 0;\n  for (const x of nums) xor ^= x;\n  return xor === 0 || nums.length % 2 === 0;\n}",
      tests: [
        { args: [[1, 1, 2]], expected: false },
        { args: [[0, 1]], expected: true },
        { args: [[1, 2, 3]], expected: true },
        { args: [[1, 1]], expected: true },
      ],
      approach:
        "Two-case invariant argument. If the total XOR is already 0, Alice wins by rule. Otherwise, claim: with an EVEN count and nonzero XOR, Alice can always erase safely — if every one of her erasures made the rest XOR to 0, then each element would equal the total XOR S; XOR-ing that equality over an even count forces S = 0, a contradiction. So Alice safely passes an odd count (nonzero XOR, or Bob loses immediately) back and the sizes only shrink — Bob eventually faces the trap. Parity + a proof by contradiction, zero search: peak 'find the invariant, skip the DP'. Compare with Nim — both reduce infinite-looking game trees to one arithmetic test.",
      docAnchor: "game-theory--brain-teasers",
    },
    {
      slug: "can-i-win",
      title: "Can I Win",
      difficulty: "Medium",
      category: "game-theory",
      blurb: "Pick unused numbers 1..M; first to push the total over wins.",
      statement: [
        "Players alternately pick DISTINCT integers from 1..`maxChoosableInteger` (each usable once, by either player), adding to a running total. The player whose pick makes the total reach or exceed `desiredTotal` wins. Return whether the FIRST player can force a win (both optimal).",
      ],
      examples: [
        { input: "maxChoosableInteger = 10, desiredTotal = 11", output: "false", explanation: "Whatever the first player picks, the second can finish." },
        { input: "maxChoosableInteger = 10, desiredTotal = 0", output: "true" },
        { input: "maxChoosableInteger = 10, desiredTotal = 1", output: "true" },
      ],
      constraints: ["1 <= maxChoosableInteger <= 20", "0 <= desiredTotal <= 300"],
      fnName: "canIWin",
      starter: "function canIWin(maxChoosableInteger, desiredTotal) {\n  \n}",
      solution:
        "function canIWin(maxChoosableInteger, desiredTotal) {\n  if (desiredTotal <= 0) return true;\n  const sum = (maxChoosableInteger * (maxChoosableInteger + 1)) / 2;\n  if (sum < desiredTotal) return false;\n  const memo = new Map();\n  function canWin(used, remaining) {\n    if (memo.has(used)) return memo.get(used);\n    for (let i = 1; i <= maxChoosableInteger; i++) {\n      const bit = 1 << i;\n      if (used & bit) continue;\n      if (i >= remaining || !canWin(used | bit, remaining - i)) {\n        memo.set(used, true);\n        return true;\n      }\n    }\n    memo.set(used, false);\n    return false;\n  }\n  return canWin(0, desiredTotal);\n}",
      tests: [
        { args: [10, 11], expected: false },
        { args: [10, 0], expected: true },
        { args: [10, 1], expected: true },
        { args: [10, 40], expected: false },
      ],
      approach:
        "Game DP with a BITMASK state: which numbers are used is the entire state (the remaining target follows from it, since the total picked is determined by the mask) — so memoize on the mask alone, 2^20 states max. A state wins if some available number finishes immediately OR forces the opponent into a losing state; that's the same winning/losing recursion as Nim, now over an exponential state space kept tractable by memoization. Don't skip the two pre-checks: target already met (win) and total pool too small (nobody can ever reach it — lose). Bitmask-memoized minimax is the endgame skill this category builds toward.",
      docAnchor: "game-theory--brain-teasers",
    },
    {
      slug: "poor-pigs",
      title: "Poor Pigs",
      difficulty: "Hard",
      category: "game-theory",
      blurb: "How few pigs identify the one poisoned bucket in time?",
      statement: [
        "One of `buckets` buckets is poisoned. A pig that drinks poison dies after exactly `minutesToDie` minutes; you have `minutesToTest` minutes total. Pigs can drink from any number of buckets simultaneously, and you can re-test surviving pigs each round. Return the MINIMUM number of pigs needed to guarantee finding the poisoned bucket.",
      ],
      examples: [
        { input: "buckets = 4, minutesToDie = 15, minutesToTest = 15", output: "2" },
        { input: "buckets = 4, minutesToDie = 15, minutesToTest = 30", output: "2" },
        { input: "buckets = 1000, minutesToDie = 15, minutesToTest = 60", output: "5" },
      ],
      constraints: ["1 <= buckets <= 1000", "1 <= minutesToDie <= minutesToTest <= 100"],
      fnName: "poorPigs",
      starter: "function poorPigs(buckets, minutesToDie, minutesToTest) {\n  \n}",
      solution:
        "function poorPigs(buckets, minutesToDie, minutesToTest) {\n  const states = Math.floor(minutesToTest / minutesToDie) + 1;\n  let pigs = 0;\n  while (Math.pow(states, pigs) < buckets) pigs++;\n  return pigs;\n}",
      tests: [
        { args: [4, 15, 15], expected: 2 },
        { args: [4, 15, 30], expected: 2 },
        { args: [1000, 15, 60], expected: 5 },
        { args: [1, 5, 5], expected: 0 },
      ],
      approach:
        "Information theory in disguise. One pig isn't a yes/no bit: with T = ⌊minutesToTest/minutesToDie⌋ rounds it has T+1 distinguishable OUTCOMES (dies in round 1, …, dies in round T, survives). p pigs therefore distinguish (T+1)^p scenarios, and you need that to cover every bucket: smallest p with (T+1)^p ≥ buckets. The constructive scheme: write each bucket's number in base T+1; pig i drinks, in round r, from every bucket whose i-th digit equals r — each pig's fate reads off one digit. Counting DISTINGUISHABLE OUTCOMES, then encoding the answer in a positional system, is the master key to 'how few tests' puzzles (it's also exactly how the two-egg-drop problem falls).",
      docAnchor: "game-theory--brain-teasers",
    },
    {
      slug: "count-of-matches-in-tournament",
      title: "Count of Matches in Tournament",
      difficulty: "Easy",
      category: "game-theory",
      blurb: "Total matches to crown one winner from n teams.",
      statement: [
        "In a knockout tournament with `n` teams: if the count is even, teams pair up and half advance; if odd, one team gets a bye and `(n-1)/2` matches are played. Return the **total number of matches** played until one winner remains.",
        "Canonical must-do (AM-600 Math / Game family).",
      ],
      examples: [
        { input: "n = 7", output: "6" },
        { input: "n = 14", output: "13" },
      ],
      constraints: ["1 <= n <= 200"],
      fnName: "numberOfMatches",
      starter: `function numberOfMatches(n) {\n  \n}`,
      solution: `function numberOfMatches(n) {\n  return n - 1;\n}`,
      tests: [
        { args: [7], expected: 6 },
        { args: [14], expected: 13 },
        { args: [1], expected: 0 },
        { args: [200], expected: 199 },
      ],
      approach:
        "You *can* simulate the rounds — but look at what a match does: **every match eliminates exactly one team**. To go from `n` teams to 1 winner you must eliminate `n - 1` teams, so the answer is always `n - 1`, regardless of byes or bracket shape. O(1). This is the archetypal 'find the invariant instead of simulating' puzzle — the same reflex that cracks Bulb Switcher and Nim.",
      docAnchor: "game-theory",
    },
    {
      slug: "find-the-winner-of-an-array-game",
      title: "Find the Winner of an Array Game",
      difficulty: "Medium",
      category: "game-theory",
      blurb: "First element to win k consecutive comparisons.",
      statement: [
        "The first two elements of `arr` compare; the larger wins and stays at the front, the loser goes to the end. Return the first element that wins **k consecutive** rounds.",
        "Canonical must-do (AM-600 Game / Simulation family).",
      ],
      examples: [
        { input: "arr = [2,1,3,5,4,6,7], k = 2", output: "5" },
        { input: "arr = [3,2,1], k = 10", output: "3" },
      ],
      constraints: ["2 <= arr.length <= 10^5", "1 <= k <= 10^9", "values are distinct"],
      fnName: "getWinner",
      starter: `function getWinner(arr, k) {\n  \n}`,
      solution: `function getWinner(arr, k) {\n  let cur = arr[0], wins = 0;\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] > cur) { cur = arr[i]; wins = 1; }\n    else wins++;\n    if (wins === k) return cur;\n  }\n  return cur;\n}`,
      tests: [
        { args: [[2, 1, 3, 5, 4, 6, 7], 2], expected: 5 },
        { args: [[3, 2, 1], 10], expected: 3 },
        { args: [[1, 11, 22, 33, 44, 55, 66, 77, 88, 99], 1000000000], expected: 99 },
        { args: [[2, 1, 3, 5, 4, 6, 7], 1], expected: 2 },
      ],
      approach:
        "Don't simulate the rotating queue — that's O(n·k) with a huge k. **One linear pass suffices**: carry the current champion and its win streak; a bigger element dethrones it (streak resets to 1), otherwise the streak grows. Key insight: if you reach the end of the array without hitting `k`, the **maximum element** is the champion and will win forever — so just return it. O(n), and `k` never appears in the complexity.",
      docAnchor: "game-theory",
    },
  ],
};
