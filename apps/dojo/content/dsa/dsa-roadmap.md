# DSA Roadmap — the AM-600 curriculum, mapped to your dojo

A 3–4 month plan through the 20 interview patterns, anchored on the **341 runnable, test-verified
problems in this dojo**. Solve those here — they run against real tests and feed your
[spaced-review queue](/practice/review). Each pattern also lists supplementary
[AlgoMaster **AM-600**](https://algomaster.io/practice/dsa-patterns?tab=am-600) problems to do on
LeetCode if you want extra reps in that shape.

> **The dojo is the plan; LeetCode is the overflow.** Finishing the 341 problems here *is* finishing
> this roadmap. The per-pattern counts on this page are generated from the problem registry, and
> [`/dsa`](/dsa) is always authoritative for exact titles and your solve state.

## How to work it (the loop that actually builds skill)

For each pattern, in the order below:

1. **Read the pattern section** in the [DSA Patterns guide](/guides/dsa-patterns) — the *when-to-use
   signal*, the template, and the traps. 15 minutes — the *variant skeletons* live in that same section, so keep it open while you solve.
2. **Solve the dojo problems** for that pattern in the [DSA tab](/dsa) — Easy → Medium → Hard. These
   are hands-on: you write code, it runs against tests, and misses reveal the reference solution.
3. **Add the AM-600 extras** for that pattern (the ones not yet in the dojo) on LeetCode.
4. **Feed spaced review.** Every miss resurfaces in [/practice/review](/practice/review) right before
   you'd forget it — drain that queue daily. Re-deriving a template from memory a week later is where
   fluency forms, not the first solve.

**Golden rules:** classify *before* coding (name the pattern from the prompt), say the **Big-O out
loud**, and if you can't explain *why* the trick is safe, you've memorised, not learned.

---

## The 20 patterns, in learning order

Order matters — each pattern builds on the ones before it (monotonic structures extend Stack; DFS/BFS
extend Trees; Graphs assume DFS/BFS; DP assumes Recursion).

**How to read a row.** *Dojo* is what is runnable and test-verified in this app right now, with its
Easy/Medium/Hard split — [`/dsa`](/dsa) is always the source of truth for exact titles and your solve
state, so this page gives counts rather than lists that drift. *Also on LeetCode* is the supplementary
AM-600 set for that pattern: do these **after** the dojo category is green, and only where you want
extra reps — they are not required to finish the roadmap.

### Arrays & Hashing — "have I seen this / count / group / find the pair"
- **Dojo — 31 problems** (19 Easy · 11 Medium · 1 Hard) → [practice](/dsa/arrays-hashing)
- **Also on LeetCode (AM-600):** Third Maximum Number (E) · Shuffle the Array (E) · Remove Duplicates from Sorted Array I/II (E/M) · Remove Element (E) · Majority Element II (M) · Rotate Array (M) · Increasing Triplet Subsequence (M) · Next Permutation (M) · First Missing Positive (H) · Design HashMap (E) · Word Pattern (E) · Find All Numbers Disappeared (E) · Isomorphic Strings (E) · Contains Duplicate II (E) · Intersection of Two Arrays II (E) · Encode/Decode TinyURL (M) · Reorganize String (M) · Number of Matching Subsequences (M)

### Two Pointers — *sorted array, pair/triplet, palindrome, partition in place*
- **Dojo — 30 problems** (17 Easy · 12 Medium · 1 Hard) → [practice](/dsa/two-pointers)
- **Also on LeetCode (AM-600):** Merge Strings Alternately (E) · Squares of a Sorted Array (E) · Backspace String Compare (E) · Valid Word Abbreviation (E) · Count Binary Substrings (E) · 4Sum (M) · Boats to Save People (M) · Partition Labels (M)

### Sliding Window — "longest/shortest/contains" over a contiguous run
- **Dojo — 16 problems** (3 Easy · 12 Medium · 1 Hard) → [practice](/dsa/sliding-window)
- **Also on LeetCode (AM-600):** Longest Substring with At Most Two Distinct (M) · Count Number of Nice Subarrays (M) · Maximum Points You Can Obtain from Cards (M) · Replace the Substring for Balanced String (M) · Number of Substrings Containing All Three Characters (M) · Longest Nice Subarray (M) · Subarrays with K Different Integers (H) · Sliding Window Median (H)

### Stack — *matching brackets, expression eval, undo*
- **Dojo — 18 problems** (3 Easy · 14 Medium · 1 Hard) → [practice](/dsa/stack)
- **Also on LeetCode (AM-600):** Basic Calculator II (M) · Basic Calculator (H) · Remove All Adjacent Duplicates I/II (E/M) · Baseball Game (E) · Score of Parentheses (M) · Exclusive Time of Functions (M) · Flatten Nested List Iterator (M) · Maximum Nesting Depth of Parentheses (E) · Removing Stars From a String (M)

### Monotonic Stack & Queue — *next greater/smaller, window max/min, spans*
- **Dojo — 14 problems** (2 Easy · 9 Medium · 3 Hard) → [practice](/dsa/monotonic-stack-queue)
- **Also on LeetCode (AM-600):** Sum of Subarray Ranges (M) · Maximum Width Ramp (M) · Jump Game VI (M) · Number of Visible People in a Queue (H) · Constrained Subsequence Sum (H) · Maximal Rectangle (H) · Steps to Make Array Non-decreasing (M)

### Binary Search — *sorted input, boundary/first-true, "minimize the max"*
- **Dojo — 19 problems** (6 Easy · 11 Medium · 2 Hard) → [practice](/dsa/binary-search)
- **Also on LeetCode (AM-600):** Find First and Last Position (M) · Search in Rotated Sorted Array II (M) · Find Minimum in Rotated Sorted Array II (H) · Kth Smallest Element in a Sorted Matrix (M) · Find K Closest Elements (M) · Time Based Key-Value Store (M) · Peak Index in a Mountain Array (M) · Guess Number Higher or Lower (E) · Minimize Max Distance to Gas Station (H) · Divide Chocolate / Aggressive Cows (M)

### Linked List — *reverse/reorder/merge, n-th from end, cycle*
- **Dojo — 15 problems** (6 Easy · 9 Medium · 0 Hard) → [practice](/dsa/linked-list)
- **Also on LeetCode (AM-600):** Linked List Cycle I/II (E/M) · Copy List with Random Pointer (M) · LRU Cache (M) · Intersection of Two Linked Lists (E) · Merge k Sorted Lists (H) · Sort List (M) · Rotate List (M) · Odd Even Linked List (M) · Reverse Nodes in k-Group (H) · Remove Linked List Elements (E) · Design Linked List (M) · Flatten a Multilevel Doubly Linked List (M)

### Trees — *depth/path/ancestor, traversal, BST validation*
- **Dojo — 21 problems** (10 Easy · 10 Medium · 1 Hard) → [practice](/dsa/trees)
- **Also on LeetCode (AM-600):** Inorder/Preorder/Postorder Traversal, iterative (E) · Symmetric Tree (E) · Subtree of Another Tree (E) · Count Complete Tree Nodes (E) · Path Sum II/III (M) · Construct Binary Tree from Preorder & Inorder (M) · Lowest Common Ancestor of a Binary Tree (M) · Flatten Binary Tree to Linked List (M) · Zigzag Level Order Traversal (M) · Delete Node in a BST (M) · Sum Root to Leaf Numbers (M) · Serialize and Deserialize Binary Tree (H) · Binary Tree Maximum Path Sum (H)

### Depth-First Search — *flood fill, region, "can you reach", all paths*
- **Dojo — 13 problems** (5 Easy · 8 Medium · 0 Hard) → [practice](/dsa/dfs)
- **Also on LeetCode (AM-600):** Number of Provinces (M) · Clone Graph (M) · Word Search (M) · Number of Closed Islands (M) · Time Needed to Inform All Employees (M) · Reconstruct Itinerary (H) · Longest Increasing Path in a Matrix (H) · Making A Large Island (H) · Critical Connections in a Network (H)

### Breadth-First Search — *shortest/fewest steps, nearest-X-for-every-cell, level order*
- **Dojo — 13 problems** (2 Easy · 10 Medium · 1 Hard) → [practice](/dsa/bfs)
- **Also on LeetCode (AM-600):** Rotting Oranges (M) · Shortest Bridge (M) · As Far from Land as Possible (M) · Snakes and Ladders (M) · Shortest Path with Alternating Colors (M) · Word Ladder II (H) · Bus Routes (H) · Sliding Puzzle (H) · Cut Off Trees for Golf Event (H)

### Tries — *"starts with", autocomplete, wildcard dictionary*
- **Dojo — 12 problems** (1 Easy · 10 Medium · 1 Hard) → [practice](/dsa/tries)
- **Also on LeetCode (AM-600):** Index Pairs of a String (E) · Camelcase Matching (M) · Word Break II (H) · Palindrome Pairs (H) · Stream of Characters (H) · Concatenated Words (H) · Prefix and Suffix Search (H) · Design Search Autocomplete System (H)

### Heap / Priority Queue — *k-largest/closest/most-frequent, streaming median*
- **Dojo — 14 problems** (3 Easy · 9 Medium · 2 Hard) → [practice](/dsa/heap-priority-queue)
- **Also on LeetCode (AM-600):** Sort Characters By Frequency (M) · Reorganize String (M) · Kth Smallest Element in a Sorted Matrix (M) · Single-Threaded CPU (M) · Seat Reservation Manager (M) · Merge k Sorted Lists (H) · Sliding Window Median (H) · Minimum Cost to Hire K Workers (H) · IPO (H) · Maximum Performance of a Team (H)

### Recursion & Backtracking — *"generate all subsets/permutations/combinations"*
- **Dojo — 15 problems** (0 Easy · 14 Medium · 1 Hard) → [practice](/dsa/recursion-backtracking)
- **Also on LeetCode (AM-600):** Combination Sum III (M) · Permutations II (M) · Restore IP Addresses (M) · Letter Case Permutation (M) · Gray Code (M) · Beautiful Arrangement (M) · Partition to K Equal Sum Subsets (M) · Matchsticks to Square (M) · Sudoku Solver (H) · Expression Add Operators (H)

### Graphs — *islands/regions, prerequisites, fewest steps, connectivity*
- **Dojo — 17 problems** (2 Easy · 15 Medium · 0 Hard) → [practice](/dsa/graphs)
- **Also on LeetCode (AM-600):** Course Schedule II (M) · Number of Connected Components (M) · Accounts Merge (M) · Evaluate Division (M) · Is Graph Bipartite? (M) · Find Eventual Safe States (M) · Path with Maximum Probability (M) · Minimum Height Trees (M) · Cheapest Flights Within K Stops (M) · Alien Dictionary (H) · Swim in Rising Water (H) · Number of Islands II (H)

### Intervals — *merge/overlap, rooms/resources needed*
- **Dojo — 13 problems** (3 Easy · 10 Medium · 0 Hard) → [practice](/dsa/intervals)
- **Also on LeetCode (AM-600):** My Calendar I/II (M) · Maximum Number of Events That Can Be Attended (M) · Divide Intervals Into Minimum Number of Groups (M) · Employee Free Time (H) · Meeting Rooms III (H) · Data Stream as Disjoint Intervals (H) · My Calendar III (H) · Range Module (H)

### Greedy — *"max/min you can achieve" with an obvious local choice*
- **Dojo — 15 problems** (4 Easy · 10 Medium · 1 Hard) → [practice](/dsa/greedy)
- **Also on LeetCode (AM-600):** Lemonade Change (E) · Maximum Units on a Truck (E) · Two City Scheduling (M) · Wiggle Subsequence (M) · Queue Reconstruction by Height (M) · Task Scheduler (M) · Minimum Deletions to Make Character Frequencies Unique (M) · Advantage Shuffle (M) · Split Array into Consecutive Subsequences (M) · Jump Game VII (M) · Minimum Number of Refueling Stops (H)

### Dynamic Programming — *"number of ways", "min/max cost", subsequences*
- **Dojo — 23 problems** (2 Easy · 20 Medium · 1 Hard) → [practice](/dsa/dynamic-programming)
- **Also on LeetCode (AM-600):** Decode Ways (M) · Palindromic Substrings (M) · Longest Palindromic Substring (M) · Partition Equal Subset Sum (M) · Target Sum (M) · Maximal Square (M) · Minimum Path Sum (M) · Triangle (M) · Interleaving String (M) · Unique Paths II (M) · Longest String Chain (M) · Best Time to Buy & Sell Stock with Cooldown (M) · …with Transaction Fee (M) · …III / IV, k transactions (H) · Distinct Subsequences (H) · Longest Valid Parentheses (H) · Burst Balloons (H) · Regular Expression Matching (H) · Wildcard Matching (H)

### Bit Manipulation — *"appears once", "without +", O(1) space, sets ≤ 32*
- **Dojo — 14 problems** (9 Easy · 5 Medium · 0 Hard) → [practice](/dsa/bit-manipulation)
- **Also on LeetCode (AM-600):** Set Mismatch (E) · Complement of Base 10 Integer (E) · Binary Watch (E) · Single Number III (M) · Total Hamming Distance (M) · Gray Code (M) · UTF-8 Validation (M) · Divide Two Integers (M) · Subsets via bitmask enumeration (M)

### Math & Geometry — *digits, primes, powers, matrix rotate/spiral*
- **Dojo — 16 problems** (7 Easy · 8 Medium · 1 Hard) → [practice](/dsa/math-geometry)
- **Also on LeetCode (AM-600):** Excel Sheet Column Number/Title (E) · Roman to Integer (E) · Add Binary (E) · Ugly Number (E) · Rectangle Overlap (E) · Integer to Roman (M) · Multiply Strings (M) · String to Integer, atoi (M) · Fraction to Recurring Decimal (M) · Valid Square (M) · Factorial Trailing Zeroes (M) · Robot Bounded In Circle (M) · Random Point in Non-overlapping Rectangles (M)

### Game Theory & Brain Teasers — *optimal play, parity arguments, invariants*
- **Dojo — 12 problems** (3 Easy · 7 Medium · 2 Hard) → [practice](/dsa/game-theory)
- **Also on LeetCode (AM-600):** Nim Game (E) · Divisor Game (E) · Stone Game (M) · Predict the Winner (M) · Flip Game II (M) · Can I Win (M) · Stone Game II/III (M) · Cat and Mouse (H)

**Total in the dojo: 341 runnable problems** — 107 Easy · 214 Medium · 20 Hard, across all 20 patterns.

> **Where did "Strings" go?** AM-600 lists Strings as its own pattern; this dojo doesn't, because
> string problems *are* the other patterns wearing different clothes — Valid Anagram is hashing,
> Valid Palindrome is two pointers, Longest Substring Without Repeating is a sliding window, Decode
> String is a stack. You meet them distributed across the categories above, which is the more useful
> way to file them: the interview skill is recognising *which pattern* a string prompt is, not
> memorising a "strings" bucket. Worth doing on LeetCode for extra parsing reps: Reverse String (E) ·
> Length of Last Word (E) · Valid Palindrome II (E) · Longest Common Prefix (E) · strStr (E) ·
> Zigzag Conversion (M) · Count and Say (M) · Reverse Words in a String (M) · One Edit Distance (M) ·
> Text Justification (H).

---

## The 3–4 month schedule

DSA runs at 1–2 problems/day on normal weeks, with **travel week as a DSA immersion**. Do the patterns in the order above; each "week" is a focus, not a hard boundary.

| Weeks | Focus patterns | Available | Cumulative | Milestone |
|---|---|---|---|---|
| **Month 1 (wk 1–4)** | Arrays & Hashing → Two Pointers → Sliding Window → Stack | 95 | 95 | The array/string/stack core solid |
| **Month 2 (wk 5–8)** | Monotonic → Binary Search → Linked List → Trees → DFS/BFS | 95 | 190 | Recursion & tree/graph traversal fluent |
| **Month 3 (wk 9–12)** | Tries → Heap → Backtracking → Graphs → Intervals | 71 | 261 | The "structure-heavy" patterns |
| **Month 4 (wk 13–16)** | Greedy → Dynamic Programming (the big one) → Bit → Math → Game Theory | 80 | 341 | DP mastered; full breadth; interview-ready |

> **"Available" is not a quota.** Those columns count what *exists* in each block, not what you must
> solve. Arrays & Hashing alone holds 31 problems and 19 of them are Easy — past the first eight or
> so you are practising typing, not thinking. Take roughly **60–70% of each category**, skewed toward
> its Medium problems, and spend the time you save on Trees, Graphs and DP, where the returns are
> real. A pattern is finished when you can re-derive its template cold — not when the counter is full.

- **Every day:** clear the [spaced-review queue](/practice/review) first (15 min) — non-negotiable.
- **Weekend:** 2× the weekday problem count; revisit one *previously hard* problem from memory.
- **End of each pattern:** you're done when you can re-derive its template from a blank editor and
  state its Big-O without hesitating.

## Tracking progress

- The **interactive dojo problems** auto-track: solved state, per-category mastery bars, and the daily
  streak, all in [/dsa](/dsa) and the [dashboard](/practice) (localStorage, no account).
- The **LeetCode-only AM-600 extras** listed per pattern above are not tracked here — tick them off on
  AlgoMaster or a plain checklist. They are supplementary reps, not roadmap requirements: finishing the
  341 dojo problems *is* finishing this roadmap.

## Sources
- [AlgoMaster AM-600 practice list](https://algomaster.io/practice/dsa-patterns?tab=am-600)
- [awesome-leetcode-resources (ashishps1 / AlgoMaster)](https://github.com/ashishps1/awesome-leetcode-resources)
- [AlgoMaster: 20 DSA patterns](https://blog.algomaster.io/p/20-dsa-patterns)
