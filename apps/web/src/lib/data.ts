/**
 * Mock data served by lib/api.ts, for the pages not yet backed by the API.
 *
 * LEADERBOARD_ENTRIES is deliberately unsorted: LeaderboardTable ranks it.
 */

import type {
  ActivityDay,
  Contest,
  Language,
  LeaderboardEntry,
  Problem,
  Submission,
  UserProfile,
} from "./types";
// 333 problems imported from the dojo DSA catalog (auto-generated file).
import { DSA_PROBLEMS } from "./dsa-problems";

function starterFor(
  jsName: string,
  pyName: string,
  params: string,
): Record<Language, string> {
  return {
    javascript: `/**\n * Write your solution below, then hit Run.\n */\nfunction ${jsName}(${params}) {\n  \n}\n`,
    typescript: `/**\n * Write your solution below, then hit Run.\n */\nfunction ${jsName}(${params}): unknown {\n  \n}\n`,
    python: `# Write your solution below, then hit Run.\ndef ${pyName}(${params}):\n    pass\n`,
  };
}

export const PROBLEMS: Problem[] = [
  {
    id: 1,
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    acceptanceRate: 48.2,
    totalSubmissions: 128_430,
    description: [
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.",
      "You may assume that each input has exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "nums[0] + nums[1] == 9, so we return [0, 1].",
      },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "Only one valid answer exists.",
    ],
    starterCode: starterFor("twoSum", "two_sum", "nums, target"),
  },
  {
    id: 2,
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    acceptanceRate: 41.7,
    totalSubmissions: 96_112,
    description: [
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      "An input string is valid if open brackets are closed by the same type of bracket and in the correct order, and every close bracket has a corresponding open bracket.",
    ],
    examples: [
      { input: 's = "()[]{}"', output: "true" },
      {
        input: 's = "(]"',
        output: "false",
        explanation: "The '(' is closed by ']', which is the wrong type.",
      },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only: '()[]{}'.",
    ],
    starterCode: starterFor("isValid", "is_valid", "s"),
  },
  {
    id: 3,
    slug: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    acceptanceRate: 62.1,
    totalSubmissions: 74_902,
    description: [
      "You are given the heads of two sorted linked lists list1 and list2.",
      "Merge the two lists into one sorted list by splicing together the nodes of the input lists, and return the head of the merged list.",
    ],
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" },
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order.",
    ],
    starterCode: starterFor("mergeTwoLists", "merge_two_lists", "list1, list2"),
  },
  {
    id: 4,
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming"],
    acceptanceRate: 54.5,
    totalSubmissions: 88_764,
    description: [
      "You are given an array prices where prices[i] is the price of a stock on the i-th day.",
      "Maximise your profit by choosing one day to buy and a later day to sell. Return the maximum profit; if no profit is possible, return 0.",
    ],
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price 1), sell on day 5 (price 6).",
      },
      { input: "prices = [7,6,4,3,1]", output: "0" },
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    starterCode: starterFor("maxProfit", "max_profit", "prices"),
  },
  {
    id: 5,
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["Array", "Binary Search"],
    acceptanceRate: 58.9,
    totalSubmissions: 65_331,
    description: [
      "Given a sorted (ascending) array of integers nums and an integer target, return the index of target if it exists, otherwise return -1.",
      "You must write an algorithm with O(log n) runtime complexity.",
    ],
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    starterCode: starterFor("search", "search", "nums, target"),
  },
  {
    id: 6,
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Hash Table", "String", "Sliding Window"],
    acceptanceRate: 35.4,
    totalSubmissions: 143_998,
    description: [
      "Given a string s, find the length of the longest substring without duplicate characters.",
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with a length of 3.',
      },
      { input: 's = "bbbbb"', output: "1" },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
    starterCode: starterFor(
      "lengthOfLongestSubstring",
      "length_of_longest_substring",
      "s",
    ),
  },
  {
    id: 7,
    slug: "3sum",
    title: "3Sum",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    acceptanceRate: 33.8,
    totalSubmissions: 118_540,
    description: [
      "Given an integer array nums, return all the unique triplets [nums[i], nums[j], nums[k]] such that i, j and k are distinct and nums[i] + nums[j] + nums[k] == 0.",
      "The solution set must not contain duplicate triplets.",
    ],
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
      },
      { input: "nums = [0,1,1]", output: "[]" },
    ],
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    starterCode: starterFor("threeSum", "three_sum", "nums"),
  },
  {
    id: 8,
    slug: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    tags: ["Dynamic Programming", "Breadth-First Search"],
    acceptanceRate: 44.6,
    totalSubmissions: 71_226,
    description: [
      "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.",
      "Return the fewest number of coins needed to make up that amount. If the amount cannot be made up by any combination of the coins, return -1. You may assume an infinite supply of each kind of coin.",
    ],
    examples: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        explanation: "11 = 5 + 5 + 1",
      },
      { input: "coins = [2], amount = 3", output: "-1" },
    ],
    constraints: [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4",
    ],
    starterCode: starterFor("coinChange", "coin_change", "coins, amount"),
  },
  {
    id: 9,
    slug: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    tags: ["Depth-First Search", "Breadth-First Search", "Matrix"],
    acceptanceRate: 59.3,
    totalSubmissions: 84_419,
    description: [
      "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
      "An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.",
    ],
    examples: [
      {
        input:
          'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]',
        output: "2",
      },
    ],
    constraints: [
      "m == grid.length, n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'.",
    ],
    starterCode: starterFor("numIslands", "num_islands", "grid"),
  },
  {
    id: 10,
    slug: "lru-cache",
    title: "LRU Cache",
    difficulty: "Medium",
    tags: ["Design", "Hash Table", "Linked List"],
    acceptanceRate: 43.9,
    totalSubmissions: 67_845,
    description: [
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.",
      "Implement get(key) and put(key, value); both must run in O(1) average time complexity. When the cache exceeds its capacity, evict the least recently used key.",
    ],
    examples: [
      {
        input:
          '["LRUCache","put","put","get","put","get"] / [[2],[1,1],[2,2],[1],[3,3],[2]]',
        output: "[null,null,null,1,null,-1]",
        explanation: "put(3,3) evicts key 2, so get(2) returns -1.",
      },
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key, value <= 10^4",
      "At most 2 * 10^5 calls to get and put.",
    ],
    starterCode: starterFor("lruCache", "lru_cache", "capacity"),
  },
  {
    id: 11,
    slug: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Stack"],
    acceptanceRate: 52.4,
    totalSubmissions: 59_204,
    description: [
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    ],
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: "The elevation map traps 6 units of rain water.",
      },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
    constraints: [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5",
    ],
    starterCode: starterFor("trap", "trap", "height"),
  },
  {
    id: 12,
    slug: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    acceptanceRate: 38.2,
    totalSubmissions: 102_763,
    description: [
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
      "The overall run time complexity should be O(log (m+n)).",
    ],
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "The merged array is [1,2,3] and its median is 2.",
      },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000" },
    ],
    constraints: [
      "0 <= m, n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6",
    ],
    starterCode: starterFor(
      "findMedianSortedArrays",
      "find_median_sorted_arrays",
      "nums1, nums2",
    ),
  },
  // Everything from the dojo DSA set (deduped by slug). Spreading keeps the
  // 17 hand-authored problems first, then ids 1000+ from the catalog.
  ...DSA_PROBLEMS,
];

/** Intentionally unsorted — ranking is YOUR derived state on the leaderboard page. */
export const LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { id: 1, username: "quicksort_queen", countryFlag: "🇩🇪", countryName: "Germany", rating: 2311, solved: { easy: 142, medium: 208, hard: 61 }, acceptedSubmissions: 1240, totalSubmissions: 2050, streakDays: 34 },
  { id: 2, username: "amani_dev", countryFlag: "🇰🇲", countryName: "Comoros", rating: 1968, solved: { easy: 120, medium: 96, hard: 14 }, acceptedSubmissions: 690, totalSubmissions: 1315, streakDays: 87 },
  { id: 3, username: "segfault_sensei", countryFlag: "🇯🇵", countryName: "Japan", rating: 2740, solved: { easy: 201, medium: 342, hard: 155 }, acceptedSubmissions: 2410, totalSubmissions: 3390, streakDays: 12 },
  { id: 4, username: "borrow_checker", countryFlag: "🇺🇸", countryName: "United States", rating: 2102, solved: { easy: 98, medium: 174, hard: 43 }, acceptedSubmissions: 980, totalSubmissions: 1740, streakDays: 5 },
  { id: 5, username: "off_by_wanjiru", countryFlag: "🇰🇪", countryName: "Kenya", rating: 2455, solved: { easy: 156, medium: 240, hard: 88 }, acceptedSubmissions: 1520, totalSubmissions: 2310, streakDays: 61 },
  { id: 6, username: "null_terminator", countryFlag: "🇫🇷", countryName: "France", rating: 1720, solved: { easy: 88, medium: 61, hard: 6 }, acceptedSubmissions: 410, totalSubmissions: 890, streakDays: 21 },
  { id: 7, username: "dp_or_die", countryFlag: "🇮🇳", countryName: "India", rating: 2618, solved: { easy: 175, medium: 301, hard: 121 }, acceptedSubmissions: 1990, totalSubmissions: 2870, streakDays: 44 },
  { id: 8, username: "heap_hoon", countryFlag: "🇰🇷", countryName: "South Korea", rating: 2290, solved: { easy: 133, medium: 195, hard: 57 }, acceptedSubmissions: 1180, totalSubmissions: 1985, streakDays: 9 },
  { id: 9, username: "lazy_evaluator", countryFlag: "🇧🇷", countryName: "Brazil", rating: 1855, solved: { easy: 104, medium: 82, hard: 11 }, acceptedSubmissions: 560, totalSubmissions: 1130, streakDays: 17 },
  { id: 10, username: "regex_rania", countryFlag: "🇲🇦", countryName: "Morocco", rating: 2531, solved: { easy: 160, medium: 262, hard: 97 }, acceptedSubmissions: 1680, totalSubmissions: 2480, streakDays: 28 },
  { id: 11, username: "tail_call_tomas", countryFlag: "🇦🇷", countryName: "Argentina", rating: 2007, solved: { easy: 115, medium: 128, hard: 22 }, acceptedSubmissions: 790, totalSubmissions: 1490, streakDays: 3 },
  { id: 12, username: "big_o_no", countryFlag: "🇳🇬", countryName: "Nigeria", rating: 2199, solved: { easy: 127, medium: 168, hard: 39 }, acceptedSubmissions: 1050, totalSubmissions: 1860, streakDays: 52 },
];

/* ── Current user (mock session) ─────────────────────────────────────────── */

/**
 * Seeded PRNG (mulberry32) so the generated activity is identical on every
 * import — no hydration or build nondeterminism.
 */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Roughly a year of submission activity ending today. Weekdays are busier
 * than weekends, the last 12 days are guaranteed active (a live streak), and
 * there is a deliberate multi-week hot stretch mid-year so "longest streak"
 * differs from "current streak".
 */
function generateActivity(): ActivityDay[] {
  const rand = mulberry32(0xc0dea);
  const days: ActivityDay[] = [];
  const today = new Date();
  const TOTAL_DAYS = 364;

  for (let back = TOTAL_DAYS - 1; back >= 0; back--) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - back);
    const weekday = date.getUTCDay();
    const isWeekend = weekday === 0 || weekday === 6;

    const inHotStretch = back >= 150 && back <= 187; // guaranteed 38-day run
    const inCurrentStreak = back < 12; // guaranteed live streak
    const active =
      inHotStretch || inCurrentStreak || rand() < (isWeekend ? 0.35 : 0.62);

    if (active) {
      const burst = rand();
      const count = burst > 0.92 ? 7 + Math.floor(rand() * 5) : 1 + Math.floor(rand() * 5);
      days.push({ date: isoDay(date), count });
    }
  }
  return days;
}

function submissionAt(daysAgo: number, hour: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, 12 + daysAgo, 0, 0);
  return d.toISOString();
}

const RECENT_SUBMISSIONS: Submission[] = [
  { id: 9241, problemSlug: "coin-change", problemTitle: "Coin Change", difficulty: "Medium", verdict: "Accepted", language: "typescript", submittedAt: submissionAt(0, 9) },
  { id: 9226, problemSlug: "coin-change", problemTitle: "Coin Change", difficulty: "Medium", verdict: "Wrong Answer", language: "typescript", submittedAt: submissionAt(0, 8) },
  { id: 9180, problemSlug: "number-of-islands", problemTitle: "Number of Islands", difficulty: "Medium", verdict: "Accepted", language: "python", submittedAt: submissionAt(1, 21) },
  { id: 9114, problemSlug: "trapping-rain-water", problemTitle: "Trapping Rain Water", difficulty: "Hard", verdict: "Time Limit Exceeded", language: "python", submittedAt: submissionAt(2, 19) },
  { id: 9070, problemSlug: "3sum", problemTitle: "3Sum", difficulty: "Medium", verdict: "Accepted", language: "javascript", submittedAt: submissionAt(3, 22) },
  { id: 9031, problemSlug: "lru-cache", problemTitle: "LRU Cache", difficulty: "Medium", verdict: "Runtime Error", language: "javascript", submittedAt: submissionAt(4, 17) },
  { id: 8994, problemSlug: "binary-search", problemTitle: "Binary Search", difficulty: "Easy", verdict: "Accepted", language: "typescript", submittedAt: submissionAt(5, 12) },
  { id: 8952, problemSlug: "valid-parentheses", problemTitle: "Valid Parentheses", difficulty: "Easy", verdict: "Accepted", language: "python", submittedAt: submissionAt(6, 10) },
];

/** The mock signed-in user — consistent with the amani_dev leaderboard entry. */
export const CURRENT_USER: UserProfile = {
  username: "amani_dev",
  displayName: "Amani B.",
  bio: "Full-stack dev sharpening algorithms one duel at a time. TypeScript by day, Python by night.",
  avatarUrl: null,
  countryFlag: "🇰🇲",
  countryName: "Comoros",
  rating: 1968,
  globalRank: 10,
  joinedAt: "2025-11-03",
  solved: { easy: 120, medium: 96, hard: 14 },
  totalProblems: { easy: 210, medium: 205, hard: 85 },
  activity: generateActivity(),
  recentSubmissions: RECENT_SUBMISSIONS,
};

/* ── Contests ─────────────────────────────────────────────────────────────── */

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

export const CONTESTS: Contest[] = [
  {
    id: 31,
    name: "Weekly Arena #31",
    description: "Four problems, 90 minutes, full ranked rating swing.",
    startsAt: hoursFromNow(-0.75),
    durationMinutes: 90,
    registeredCount: 3412,
    status: "live",
  },
  {
    id: 32,
    name: "Weekly Arena #32",
    description: "Four problems, 90 minutes, full ranked rating swing.",
    startsAt: hoursFromNow(52),
    durationMinutes: 90,
    registeredCount: 1876,
    status: "upcoming",
  },
  {
    id: 33,
    name: "Algorithm Blitz — DP Special",
    description: "Six dynamic-programming problems in 120 minutes. Sponsored round.",
    startsAt: hoursFromNow(9 * 24 + 3),
    durationMinutes: 120,
    registeredCount: 942,
    status: "upcoming",
  },
  {
    id: 30,
    name: "Weekly Arena #30",
    description: "Four problems, 90 minutes, full ranked rating swing.",
    startsAt: hoursFromNow(-7 * 24),
    durationMinutes: 90,
    registeredCount: 3388,
    status: "past",
    winner: "segfault_sensei",
  },
  {
    id: 29,
    name: "Graph Gauntlet",
    description: "Five graph problems, 120 minutes, themed badges for the top 100.",
    startsAt: hoursFromNow(-16 * 24),
    durationMinutes: 120,
    registeredCount: 2751,
    status: "past",
    winner: "dp_or_die",
  },
];
