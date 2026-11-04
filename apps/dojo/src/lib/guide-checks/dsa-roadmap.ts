/**
 * Checks for content/dsa/dsa-roadmap.md.
 * A planning page; the source link was checked on 3 Nov 2026.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const dsaRoadmapChecks: GuideCheckSet = {
  name: "DSA Roadmap",
  source: {
    label: "AlgoMaster: \"DSA was HARD until I Learned these 20 Patterns\"",
    href: "https://blog.algomaster.io/p/20-dsa-patterns",
    note: "The pattern list this roadmap is built from, one paragraph per pattern. Read it once for the map, then live in the [DSA Patterns guide](/guides/dsa-patterns) while you solve.",
  },
  terms: [
    "Pattern",
    "When-to-use signal",
    "Template",
    "Spaced review",
    "Re-derivation",
    "Big-O",
  ],
  checks: [
    {
      id: "loop",
      section: "How to work it",
      questions: [
        {
          prompt: "What should you do before writing any code for a new problem?",
          options: [
            "Look up the problem's full solution on LeetCode",
            "Name the pattern the prompt is asking for",
            "Write a brute force in the dojo's editor",
            "Check how many people have solved it already",
          ],
          correct: 1,
          why: "Classify first: the when-to-use signal in the prompt points at a pattern and its template. Then say the Big-O out loud. If you can't explain why the trick is safe, you've memorised, not learned.",
        },
        {
          prompt: "When is a pattern \"finished\" in this roadmap?",
          options: [
            "When its problem counter in the dojo fills",
            "When you have solved every LeetCode extra too",
            "When a week has passed since you started",
            "When you can re-derive its template from cold",
          ],
          correct: 3,
          why: "Take roughly 60–70% of each category, skewed to Medium; the counts are what exists, not a quota. A pattern is done when you can rebuild its template from a blank editor and state its complexity without hesitating.",
        },
      ],
      explain: "Describe the daily loop: what you do first every day, and why re-deriving a template a week later matters more than the first solve.",
    },
    {
      id: "order",
      section: "The pattern order",
      questions: [
        {
          prompt: "Why does the roadmap put Trees before Graphs and Recursion before DP?",
          options: [
            "Each pattern builds on the earlier ones",
            "The earlier ones appear more in interviews",
            "The later ones have fewer dojo problems",
            "The order follows the LeetCode difficulty tags",
          ],
          correct: 0,
          why: "Monotonic structures extend Stack; DFS and BFS extend tree traversal; Graphs assume DFS/BFS; DP assumes recursion. Learning out of order means meeting a technique before the idea it rests on.",
        },
        {
          prompt: "Why does the dojo have no separate \"Strings\" pattern?",
          options: [
            "String problems rarely come up in real interviews",
            "Strings are covered by Math and Geometry instead",
            "String problems are the other patterns in disguise",
            "Python handles strings, so they need no practice",
          ],
          correct: 2,
          why: "Valid Anagram is hashing, Valid Palindrome is two pointers, Longest Substring Without Repeating is a sliding window, Decode String is a stack. The interview skill is recognising which pattern a string prompt is.",
        },
      ],
      explain: "Pick three patterns and, for each, give its when-to-use signal in one phrase.",
    },
  ],
};
