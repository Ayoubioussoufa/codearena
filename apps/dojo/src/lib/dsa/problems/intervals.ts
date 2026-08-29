/**
 * DSA — Intervals. Sort by start (or end), then sweep once, merging or
 * counting overlaps. The sort is what makes a single linear pass correct.
 */
import type { DsaCategory } from "../types";

export const intervals: DsaCategory = {
  id: "intervals",
  title: "Intervals",
  icon: "📏",
  docAnchor: "intervals",
  blurb: "Sort by an endpoint, then sweep: merge, insert, count overlaps, size a resource.",
  problems: [
    {
      slug: "merge-intervals",
      title: "Merge Intervals",
      difficulty: "Medium",
      category: "intervals",
      blurb: "Merge all overlapping intervals.",
      statement: [
        "Given an array of `intervals` where `intervals[i] = [start, end]`, merge all overlapping intervals and return the non-overlapping intervals that cover the same ranges (sorted by start).",
      ],
      examples: [
        { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]" },
        { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]" },
      ],
      constraints: ["1 <= intervals.length <= 10^4"],
      fnName: "merge",
      starter: "function merge(intervals) {\n  \n}",
      solution:
        "function merge(intervals) {\n  const arr = [...intervals].sort((a, b) => a[0] - b[0]);\n  const res = [];\n  for (const [s, e] of arr) {\n    if (res.length && s <= res[res.length - 1][1]) {\n      res[res.length - 1][1] = Math.max(res[res.length - 1][1], e);\n    } else {\n      res.push([s, e]);\n    }\n  }\n  return res;\n}",
      tests: [
        { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
        { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
        { args: [[[1, 4], [2, 3]]], expected: [[1, 4]] },
        { args: [[[1, 4]]], expected: [[1, 4]] },
      ],
      approach:
        "Sort by start so overlapping intervals are adjacent. Then sweep: if the current interval starts at or before the last kept interval's end, they overlap — extend that end; otherwise start a new interval. One pass after an O(n log n) sort. Sorting-then-sweeping is the entire interval playbook; almost every interval problem opens with 'sort by start or end'.",
      docAnchor: "intervals",
    },
    {
      slug: "insert-interval",
      title: "Insert Interval",
      difficulty: "Medium",
      category: "intervals",
      blurb: "Insert a new interval into a sorted, non-overlapping list.",
      statement: [
        "Given a list of non-overlapping `intervals` sorted by start, insert `newInterval`, merging as needed, and return the result still sorted and non-overlapping.",
      ],
      examples: [
        { input: "intervals = [[1,3],[6,9]], newInterval = [2,5]", output: "[[1,5],[6,9]]" },
        { input: "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]", output: "[[1,2],[3,10],[12,16]]" },
      ],
      constraints: ["0 <= intervals.length <= 10^4", "intervals is sorted by start"],
      fnName: "insert",
      starter: "function insert(intervals, newInterval) {\n  \n}",
      solution:
        "function insert(intervals, newInterval) {\n  const res = [];\n  let i = 0;\n  const n = intervals.length;\n  while (i < n && intervals[i][1] < newInterval[0]) res.push(intervals[i++]);\n  let s = newInterval[0], e = newInterval[1];\n  while (i < n && intervals[i][0] <= e) {\n    s = Math.min(s, intervals[i][0]);\n    e = Math.max(e, intervals[i][1]);\n    i++;\n  }\n  res.push([s, e]);\n  while (i < n) res.push(intervals[i++]);\n  return res;\n}",
      tests: [
        { args: [[[1, 3], [6, 9]], [2, 5]], expected: [[1, 5], [6, 9]] },
        { args: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]], expected: [[1, 2], [3, 10], [12, 16]] },
        { args: [[], [5, 7]], expected: [[5, 7]] },
        { args: [[[1, 5]], [2, 3]], expected: [[1, 5]] },
      ],
      approach:
        "Because the input is already sorted and non-overlapping, you can do it in one pass without re-sorting: copy intervals entirely left of the new one, then absorb every interval that overlaps the new one (expanding its bounds), place the merged interval, and copy the rest. O(n). Exploiting pre-sorted input to skip the sort is the optimization that separates this from Merge Intervals.",
      docAnchor: "intervals",
    },
    {
      slug: "non-overlapping-intervals",
      title: "Non-overlapping Intervals",
      difficulty: "Medium",
      category: "intervals",
      blurb: "Minimum removals to make intervals non-overlapping.",
      statement: [
        "Given `intervals`, return the minimum number you must remove so the rest are non-overlapping.",
      ],
      examples: [
        { input: "intervals = [[1,2],[2,3],[3,4],[1,3]]", output: "1", explanation: "Remove [1,3]." },
        { input: "intervals = [[1,2],[1,2],[1,2]]", output: "2" },
      ],
      constraints: ["1 <= intervals.length <= 10^5"],
      fnName: "eraseOverlapIntervals",
      starter: "function eraseOverlapIntervals(intervals) {\n  \n}",
      solution:
        "function eraseOverlapIntervals(intervals) {\n  const arr = [...intervals].sort((a, b) => a[1] - b[1]);\n  let count = 0;\n  let end = -Infinity;\n  for (const [s, e] of arr) {\n    if (s >= end) end = e;\n    else count++;\n  }\n  return count;\n}",
      tests: [
        { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expected: 1 },
        { args: [[[1, 2], [1, 2], [1, 2]]], expected: 2 },
        { args: [[[1, 2], [2, 3]]], expected: 0 },
        { args: [[[1, 100], [11, 22], [1, 11], [2, 12]]], expected: 2 },
      ],
      approach:
        "This is the classic 'activity selection' greedy in disguise: to KEEP the most intervals (and thus remove the fewest), always keep the one that finishes earliest, because it leaves the most room for the rest. Sort by end, then greedily accept an interval whose start is ≥ the last kept end; count the ones you skip. O(n log n). Sorting by END (not start) is the crucial, non-obvious choice.",
      docAnchor: "intervals",
    },
    {
      slug: "meeting-rooms",
      title: "Meeting Rooms",
      difficulty: "Easy",
      category: "intervals",
      blurb: "Can one person attend all meetings?",
      statement: [
        "Given meeting time `intervals`, return `true` if a single person could attend all of them (no two overlap).",
      ],
      examples: [
        { input: "intervals = [[0,30],[5,10],[15,20]]", output: "false" },
        { input: "intervals = [[7,10],[2,4]]", output: "true" },
      ],
      constraints: ["0 <= intervals.length <= 10^4"],
      fnName: "canAttendMeetings",
      starter: "function canAttendMeetings(intervals) {\n  \n}",
      solution:
        "function canAttendMeetings(intervals) {\n  const arr = [...intervals].sort((a, b) => a[0] - b[0]);\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i][0] < arr[i - 1][1]) return false;\n  }\n  return true;\n}",
      tests: [
        { args: [[[0, 30], [5, 10], [15, 20]]], expected: false },
        { args: [[[7, 10], [2, 4]]], expected: true },
        { args: [[]], expected: true },
        { args: [[[1, 2], [2, 3]]], expected: true },
      ],
      approach:
        "Sort by start time; then any conflict must be between neighbours, so check whether each meeting begins before the previous one ends. One pass after the sort. This is the minimal interval problem, and the direct warm-up for Meeting Rooms II — the same sorted-order reasoning, one step simpler.",
      docAnchor: "intervals",
    },
    {
      slug: "meeting-rooms-ii",
      title: "Meeting Rooms II",
      difficulty: "Medium",
      category: "intervals",
      blurb: "Minimum rooms to hold all meetings.",
      statement: [
        "Given meeting time `intervals`, return the minimum number of rooms required so that no two overlapping meetings share a room.",
      ],
      examples: [
        { input: "intervals = [[0,30],[5,10],[15,20]]", output: "2" },
        { input: "intervals = [[7,10],[2,4]]", output: "1" },
      ],
      constraints: ["0 <= intervals.length <= 10^4"],
      fnName: "minMeetingRooms",
      starter: "function minMeetingRooms(intervals) {\n  \n}",
      solution:
        "function minMeetingRooms(intervals) {\n  const starts = intervals.map((i) => i[0]).sort((a, b) => a - b);\n  const ends = intervals.map((i) => i[1]).sort((a, b) => a - b);\n  let rooms = 0, maxRooms = 0;\n  let s = 0, e = 0;\n  while (s < starts.length) {\n    if (starts[s] < ends[e]) { rooms++; s++; maxRooms = Math.max(maxRooms, rooms); }\n    else { rooms--; e++; }\n  }\n  return maxRooms;\n}",
      tests: [
        { args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
        { args: [[[7, 10], [2, 4]]], expected: 1 },
        { args: [[]], expected: 0 },
        { args: [[[1, 5], [2, 6], [3, 7]]], expected: 3 },
      ],
      approach:
        "The answer is the maximum number of meetings in progress at any instant. Separate and sort all start and end times, then sweep a timeline: a start before the next end needs a new room (increment), an end frees one (decrement). The peak room count is the answer. O(n log n). This 'two sorted event streams' sweep is equivalent to a min-heap of end times, and it's the template for any 'max concurrent' question.",
      docAnchor: "intervals",
    },
    {
      slug: "summary-ranges",
      title: "Summary Ranges",
      difficulty: "Easy",
      category: "intervals",
      blurb: "Collapse a sorted array into range strings.",
      statement: [
        "Given a SORTED array of unique integers, return the smallest list of ranges covering exactly its numbers: \"a->b\" for a run, \"a\" for a lone value.",
      ],
      examples: [
        { input: "nums = [0,1,2,4,5,7]", output: "[\"0->2\",\"4->5\",\"7\"]" },
        { input: "nums = [0,2,3,4,6,8,9]", output: "[\"0\",\"2->4\",\"6\",\"8->9\"]" },
      ],
      constraints: ["0 <= nums.length <= 20", "Sorted, unique"],
      fnName: "summaryRanges",
      starter: "function summaryRanges(nums) {\n  \n}",
      solution:
        "function summaryRanges(nums) {\n  const res = [];\n  let i = 0;\n  while (i < nums.length) {\n    const start = nums[i];\n    while (i + 1 < nums.length && nums[i + 1] === nums[i] + 1) i++;\n    res.push(start === nums[i] ? String(start) : start + \"->\" + nums[i]);\n    i++;\n  }\n  return res;\n}",
      tests: [
        { args: [[0, 1, 2, 4, 5, 7]], expected: ["0->2", "4->5", "7"] },
        { args: [[0, 2, 3, 4, 6, 8, 9]], expected: ["0", "2->4", "6", "8->9"] },
        { args: [[]], expected: [] },
        { args: [[5]], expected: ["5"] },
      ],
      approach:
        "The inverse of merging: DETECT runs instead of overlaps. Anchor `start`, extend the inner while as long as consecutive values differ by exactly 1, emit, continue after the run — a run-length grouping loop whose two-level structure (outer per group, inner per run) reads far cleaner than one loop with flags. It's the same 'sorted makes neighbours the only thing that matters' logic the whole category runs on, in its simplest costume. Off-by-ones live at single-element runs; test 4 pins that.",
      docAnchor: "intervals",
    },
    {
      slug: "interval-list-intersections",
      title: "Interval List Intersections",
      difficulty: "Medium",
      category: "intervals",
      blurb: "Pairwise intersections of two sorted interval lists.",
      statement: [
        "Given two lists of disjoint sorted intervals, return their intersections (every interval common to both lists).",
      ],
      examples: [
        {
          input: "first = [[0,2],[5,10],[13,23],[24,25]], second = [[1,5],[8,12],[15,24],[25,26]]",
          output: "[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]",
        },
        { input: "first = [], second = [[4,8]]", output: "[]" },
      ],
      constraints: ["0 <= lengths <= 1000", "Each list is sorted and disjoint"],
      fnName: "intervalIntersection",
      starter: "function intervalIntersection(firstList, secondList) {\n  \n}",
      solution:
        "function intervalIntersection(firstList, secondList) {\n  const res = [];\n  let i = 0;\n  let j = 0;\n  while (i < firstList.length && j < secondList.length) {\n    const lo = Math.max(firstList[i][0], secondList[j][0]);\n    const hi = Math.min(firstList[i][1], secondList[j][1]);\n    if (lo <= hi) res.push([lo, hi]);\n    if (firstList[i][1] < secondList[j][1]) i++;\n    else j++;\n  }\n  return res;\n}",
      tests: [
        {
          args: [[[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]],
          expected: [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]],
        },
        { args: [[], [[4, 8]]], expected: [] },
        { args: [[[1, 7]], [[3, 10]]], expected: [[3, 7]] },
      ],
      approach:
        "Two pointers over two sorted lists — the merge-step shape from merge sort, repurposed. The intersection formula is worth engraving: [max(starts), min(ends)], nonempty iff max(start) ≤ min(end); that pair of max/min expressions answers 'do two intervals overlap?' everywhere, forever. Advance whichever interval ENDS first — it can't intersect anything further in the other list, while the longer-lasting one still might. Each step retires one interval, so O(m + n).",
      docAnchor: "intervals",
    },
    {
      slug: "minimum-number-of-arrows-to-burst-balloons",
      title: "Minimum Number of Arrows to Burst Balloons",
      difficulty: "Medium",
      category: "intervals",
      blurb: "Fewest vertical arrows through all the intervals.",
      statement: [
        "Balloons are horizontal intervals `[start, end]`. A vertical arrow at x bursts every balloon with start ≤ x ≤ end. Return the minimum number of arrows to burst all balloons.",
      ],
      examples: [
        { input: "points = [[10,16],[2,8],[1,6],[7,12]]", output: "2", explanation: "x = 6 and x = 11." },
        { input: "points = [[1,2],[3,4],[5,6]]", output: "3" },
        { input: "points = [[1,2],[2,3],[3,4]]", output: "2" },
      ],
      constraints: ["1 <= points.length <= 10^5"],
      fnName: "findMinArrowShots",
      starter: "function findMinArrowShots(points) {\n  \n}",
      solution:
        "function findMinArrowShots(points) {\n  const arr = [...points].sort((a, b) => a[1] - b[1]);\n  let arrows = 1;\n  let arrowX = arr[0][1];\n  for (const [s, e] of arr) {\n    if (s > arrowX) {\n      arrows++;\n      arrowX = e;\n    }\n  }\n  return arrows;\n}",
      tests: [
        { args: [[[10, 16], [2, 8], [1, 6], [7, 12]]], expected: 2 },
        { args: [[[1, 2], [3, 4], [5, 6]]], expected: 3 },
        { args: [[[1, 2], [2, 3], [3, 4]]], expected: 2 },
        { args: [[[1, 10]]], expected: 1 },
      ],
      approach:
        "Sort by END and shoot every arrow at the earliest unfinished balloon's end — the latest position that still bursts it, so it greedily catches the most overlappers. Any balloon starting after the arrow's x needs a fresh arrow at ITS end, and so on. This is Non-overlapping Intervals inverted: there you counted removals; here arrows = the number of non-overlapping 'groups' = kept intervals in that problem. Same sort, same sweep, complementary counts — seeing that duality is the real prize. Touching counts (start === arrowX bursts), hence the strict `>`.",
      docAnchor: "intervals",
    },
    {
      slug: "car-pooling",
      title: "Car Pooling",
      difficulty: "Medium",
      category: "intervals",
      blurb: "Do all trips fit under the seat cap? Difference array sweep.",
      statement: [
        "`trips[i] = [passengers, from, to]`: passengers ride from km `from` to km `to` (dropped off AT to). The car drives one direction with `capacity` seats. Return whether all trips fit.",
      ],
      examples: [
        { input: "trips = [[2,1,5],[3,3,7]], capacity = 4", output: "false" },
        { input: "trips = [[2,1,5],[3,3,7]], capacity = 5", output: "true" },
        { input: "trips = [[2,1,5],[3,5,7]], capacity = 3", output: "true", explanation: "Drop-off at 5 frees seats before the pickup at 5." },
      ],
      constraints: ["1 <= trips.length <= 1000", "0 <= from < to <= 1000"],
      fnName: "carPooling",
      starter: "function carPooling(trips, capacity) {\n  \n}",
      solution:
        "function carPooling(trips, capacity) {\n  const delta = new Array(1001).fill(0);\n  for (const [num, from, to] of trips) {\n    delta[from] += num;\n    delta[to] -= num;\n  }\n  let onboard = 0;\n  for (const d of delta) {\n    onboard += d;\n    if (onboard > capacity) return false;\n  }\n  return true;\n}",
      tests: [
        { args: [[[2, 1, 5], [3, 3, 7]], 4], expected: false },
        { args: [[[2, 1, 5], [3, 3, 7]], 5], expected: true },
        { args: [[[2, 1, 5], [3, 5, 7]], 3], expected: true },
        { args: [[[9, 0, 1], [3, 3, 7]], 9], expected: true },
      ],
      approach:
        "The DIFFERENCE ARRAY: record only the CHANGES (+passengers at pickup, −passengers at drop-off), then one prefix-sum sweep reconstructs the live passenger count at every kilometre — Meeting Rooms II's event sweep, exploiting the small bounded coordinate space (≤1000) to use array indices instead of sorting events. O(trips + range). Drop-off before pickup at the same point falls out automatically: both deltas land on the same index and sum before the check. Bounded coordinates → difference array; unbounded → sort the events. Keep both in the holster.",
      docAnchor: "intervals",
    },
    {
      slug: "remove-covered-intervals",
      title: "Remove Covered Intervals",
      difficulty: "Medium",
      category: "intervals",
      blurb: "Count intervals not swallowed by another.",
      statement: [
        "Interval `[a,b]` is covered by `[c,d]` if c <= a and b <= d. Remove every covered interval and return how many REMAIN.",
      ],
      examples: [
        { input: "intervals = [[1,4],[3,6],[2,8]]", output: "2", explanation: "[3,6] is covered by [2,8]." },
        { input: "intervals = [[1,4],[2,3]]", output: "1" },
      ],
      constraints: ["1 <= intervals.length <= 1000", "All intervals distinct"],
      fnName: "removeCoveredIntervals",
      starter: "function removeCoveredIntervals(intervals) {\n  \n}",
      solution:
        "function removeCoveredIntervals(intervals) {\n  const arr = [...intervals].sort((a, b) => a[0] - b[0] || b[1] - a[1]);\n  let count = 0;\n  let maxEnd = 0;\n  for (const [, e] of arr) {\n    if (e > maxEnd) {\n      count++;\n      maxEnd = e;\n    }\n  }\n  return count;\n}",
      tests: [
        { args: [[[1, 4], [3, 6], [2, 8]]], expected: 2 },
        { args: [[[1, 4], [2, 3]]], expected: 1 },
        { args: [[[0, 10], [5, 12]]], expected: 2 },
        { args: [[[1, 2], [1, 4], [3, 4]]], expected: 1 },
      ],
      approach:
        "The insight is in the TIE-BREAK: sort by start ascending, and by end DESCENDING among equal starts. After that sort, an interval is covered exactly when its end doesn't exceed the largest end seen so far — same start means the longer one comes first and swallows the shorter (test 4: [1,4] precedes [1,2]); earlier start with bigger end swallows outright. One sweep tracking maxEnd counts the survivors. Interval problems are 90% choosing the right sort key — this one exists to make you respect the secondary key.",
      docAnchor: "intervals",
    },
    {
      slug: "maximum-length-of-pair-chain",
      title: "Maximum Length of Pair Chain",
      difficulty: "Medium",
      category: "intervals",
      blurb: "Longest chain where each pair's start beats the last end.",
      statement: [
        "You're given `pairs` where each `pairs[i] = [a, b]` with `a < b`. Pair `[c, d]` can follow `[a, b]` iff `b < c`. Return the length of the longest chain you can form (pairs can be used in any order).",
        "Canonical must-do (AM-600 Intervals / Greedy family).",
      ],
      examples: [
        { input: "pairs = [[1,2],[2,3],[3,4]]", output: "2", explanation: "[1,2] → [3,4]." },
        { input: "pairs = [[1,2],[7,8],[4,5]]", output: "3" },
      ],
      constraints: ["1 <= pairs.length <= 1000"],
      fnName: "findLongestChain",
      starter: `function findLongestChain(pairs) {\n  \n}`,
      solution: `function findLongestChain(pairs) {\n  pairs.sort((a, b) => a[1] - b[1]);\n  let count = 0, curEnd = -Infinity;\n  for (const [a, b] of pairs) {\n    if (a > curEnd) { count++; curEnd = b; }\n  }\n  return count;\n}`,
      tests: [
        { args: [[[1, 2], [2, 3], [3, 4]]], expected: 2 },
        { args: [[[1, 2], [7, 8], [4, 5]]], expected: 3 },
        { args: [[[1, 2]]], expected: 1 },
        { args: [[[-10, -8], [8, 9], [-5, 0], [6, 10], [-6, -4], [1, 7]]], expected: 4 },
      ],
      approach:
        "Identical to activity selection: **sort by end value**, then greedily take a pair whenever its start clears the last chosen end. Ending as early as possible leaves the most room for future pairs — the exchange argument that proves greedy optimal here. O(n log n). (A DP by longest-chain-ending-at-i also works but is O(n²); the greedy is the intended answer.)",
      docAnchor: "intervals",
    },
    {
      slug: "teemo-attacking",
      title: "Teemo Attacking",
      difficulty: "Easy",
      category: "intervals",
      blurb: "Total poisoned time with overlapping durations.",
      statement: [
        "Attacks happen at the ascending times in `timeSeries`, each poisoning for `duration` seconds. A new attack **resets** (does not stack) the poison. Return the total number of seconds spent poisoned.",
        "Canonical must-do (AM-600 Intervals family).",
      ],
      examples: [
        { input: "timeSeries = [1,4], duration = 2", output: "4", explanation: "Poisoned at 1-2 and 4-5." },
        { input: "timeSeries = [1,2], duration = 2", output: "3", explanation: "The second attack resets at 2." },
      ],
      constraints: ["1 <= timeSeries.length <= 10^4", "0 <= duration <= 10^7"],
      fnName: "findPoisonedDuration",
      starter: `function findPoisonedDuration(timeSeries, duration) {\n  \n}`,
      solution: `function findPoisonedDuration(timeSeries, duration) {\n  if (timeSeries.length === 0) return 0;\n  let total = 0;\n  for (let i = 1; i < timeSeries.length; i++) {\n    total += Math.min(duration, timeSeries[i] - timeSeries[i - 1]);\n  }\n  return total + duration;\n}`,
      tests: [
        { args: [[1, 4], 2], expected: 4 },
        { args: [[1, 2], 2], expected: 3 },
        { args: [[1, 2, 3, 4, 5], 5], expected: 9 },
        { args: [[5], 3], expected: 3 },
      ],
      approach:
        "Each attack contributes its full `duration` **unless** the next attack arrives sooner and cuts it short — so each interval really contributes `min(duration, gap to next attack)`. Sum those for all but the last attack, then add a full `duration` for the final one (nothing interrupts it). O(n), no interval merging needed — the overlap resolves to a simple `min`.",
      docAnchor: "intervals",
    },
    {
      slug: "my-calendar-i",
      title: "My Calendar I",
      difficulty: "Medium",
      category: "intervals",
      blurb: "Book events, rejecting any double-booking.",
      statement: [
        "Process a list of `bookings`, each `[start, end)`. A booking succeeds only if it does **not** overlap any previously accepted booking (touching endpoints are fine — `[10,20)` and `[20,30)` don't overlap). Return an array of booleans: whether each booking was accepted.",
        "Canonical must-do (AM-600 Intervals family).",
      ],
      examples: [
        { input: "bookings = [[10,20],[15,25],[20,30]]", output: "[true,false,true]" },
        { input: "bookings = [[1,10],[2,3]]", output: "[true,false]" },
      ],
      constraints: ["1 <= bookings.length <= 1000", "0 <= start < end <= 10^9"],
      fnName: "myCalendar",
      starter: `function myCalendar(bookings) {\n  \n}`,
      solution: `function myCalendar(bookings) {\n  const booked = [];\n  const res = [];\n  for (const [start, end] of bookings) {\n    let ok = true;\n    for (const [s, e] of booked) {\n      if (start < e && s < end) { ok = false; break; }\n    }\n    if (ok) booked.push([start, end]);\n    res.push(ok);\n  }\n  return res;\n}`,
      tests: [
        { args: [[[10, 20], [15, 25], [20, 30]]], expected: [true, false, true] },
        { args: [[[1, 2], [2, 3]]], expected: [true, true] },
        { args: [[[1, 10], [2, 3]]], expected: [true, false] },
      ],
      approach:
        "The overlap test is the thing to memorize: two half-open intervals `[a,b)` and `[c,d)` overlap **iff `a < d && c < b`**. Get this right and touching endpoints (20 meeting 20) correctly count as non-overlapping. Checking every existing booking is O(n) per insert → O(n²) total; the production version keeps bookings in a **balanced BST / sorted structure** so each check is O(log n) via the nearest neighbours.",
      docAnchor: "intervals",
    },
  ],
};
