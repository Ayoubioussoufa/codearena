/**
 * Contests & systems — code exercises (two run for real, one command task).
 * Imported by distributed.ts.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";

const DOC4 = { slug: "phase-4-recommendation-engine", label: "Phase 4 — Recommendation engine" };
const DOC5 = { slug: "phase-5-contests-cqrs-leaderboard", label: "Phase 5 — Contests, CQRS & leaderboard" };
const DOC6 = { slug: "phase-6-analytics-anticheat-observability", label: "Phase 6 — Anti-cheat & observability" };

const cosineFn: Generator = {
  id: "ds-code-cosine",
  title: "✍️ Implement cosine similarity (runs for real)",
  generate: () =>
    codeTask({
      genId: "ds-code-cosine",
      prompt:
        "Implement `cosineSim(u, v)` for two equal-length number arrays: `(u·v) / (|u| × |v|)`. Executed against real test cases.",
      language: "javascript",
      starter: `function cosineSim(u, v) {\n  // dot product over the product of magnitudes\n}`,
      solution: `function cosineSim(u, v) {\n  let dot = 0;\n  let nu = 0;\n  let nv = 0;\n  for (let i = 0; i < u.length; i++) {\n    dot += u[i] * v[i];\n    nu += u[i] * u[i];\n    nv += v[i] * v[i];\n  }\n  return dot / (Math.sqrt(nu) * Math.sqrt(nv));\n}`,
      fn: {
        name: "cosineSim",
        tests: [
          { args: [[1, 0], [0, 1]], expected: 0, approx: 0.001 },
          { args: [[2, 2], [4, 4]], expected: 1, approx: 0.001 },
          { args: [[3, 4], [4, 3]], expected: 0.96, approx: 0.001 },
          { args: [[1, 2, 2], [2, 4, 4]], expected: 1, approx: 0.001 },
        ],
      },
      explanation:
        "The tests encode the geometry: orthogonal vectors (no shared tags) → 0; parallel vectors → 1 even when magnitudes differ ([2,2] vs [4,4], [1,2,2] vs [2,4,4]) — cosine measures ANGLE, deliberately ignoring how active a user is. That magnitude-blindness is why recommenders prefer it to Euclidean distance: a casual user and a grinder with identical tastes should be neighbours. Classic bug: forgetting the square root and computing against |u|²|v|².",
      docRef: DOC4,
    }),
};

const jaccardFn: Generator = {
  id: "ds-code-jaccard",
  title: "✍️ Implement Jaccard similarity (runs for real)",
  generate: () =>
    codeTask({
      genId: "ds-code-jaccard",
      prompt:
        "Anti-cheat compares fingerprint sets with Jaccard similarity: `|A ∩ B| / |A ∪ B|`. Implement `jaccard(a, b)` for two arrays of numbers (treat them as sets). Executed against real test cases.",
      language: "javascript",
      starter: `function jaccard(a, b) {\n  // intersection size over union size\n}`,
      solution: `function jaccard(a, b) {\n  const setA = new Set(a);\n  const setB = new Set(b);\n  let intersection = 0;\n  for (const x of setA) {\n    if (setB.has(x)) intersection++;\n  }\n  const union = setA.size + setB.size - intersection;\n  return intersection / union;\n}`,
      fn: {
        name: "jaccard",
        tests: [
          { args: [[1, 2, 3], [2, 3, 4]], expected: 0.5, approx: 0.001 },
          { args: [[7], [7]], expected: 1, approx: 0.001 },
          { args: [[1, 2], [3, 4]], expected: 0, approx: 0.001 },
          { args: [[1, 1, 2], [1, 2, 2]], expected: 1, approx: 0.001 },
        ],
      },
      explanation:
        "This is the last stage of the plagiarism pipeline: after Winnowing reduces each submission to a fingerprint **set**, Jaccard scores the overlap — how many fingerprints they *share* divided by how many they have *between them* (identical sets → 1, none shared → 0, half-shared → 0.5). The sneaky test is `[1,1,2]` vs `[1,2,2]`: as SETS both are {1,2}, so the answer is 1 — if you got 0.33 you compared them as arrays, and duplicate fingerprints would distort every score. Note the shortcut `|A∪B| = |A| + |B| − |A∩B|`, cheaper than building the union outright.",
      docRef: DOC6,
    }),
};

const zsetCommands: Generator = {
  id: "ds-code-zset",
  title: "✍️ Write the leaderboard commands",
  generate: () =>
    codeTask({
      genId: "ds-code-zset",
      prompt:
        "Write the three Redis commands for a contest leaderboard `lb`: (1) register `amani_dev` with score 1200, (2) add 150 points after a solve, (3) read their 0-based rank from the TOP.",
      language: "bash",
      starter: `# 1) register\n# 2) add points\n# 3) rank from the top`,
      solution: `ZADD lb 1200 amani_dev\nZINCRBY lb 150 amani_dev\nZREVRANK lb amani_dev`,
      checks: [
        { re: "ZADD\\s+lb\\s+1200\\s+amani_dev", flags: "i", label: "`ZADD lb 1200 amani_dev` (score before member)" },
        { re: "ZINCRBY\\s+lb\\s+150\\s+amani_dev", flags: "i", label: "`ZINCRBY lb 150 amani_dev` — atomic in-place bump" },
        { re: "ZREVRANK\\s+lb\\s+amani_dev", flags: "i", label: "`ZREVRANK` — rank in DESCENDING score order" },
        { re: "SORT\\b|KEYS\\b", flags: "i", expect: false, label: "no SORT / KEYS crutches" },
      ],
      explanation:
        "Argument order trips everyone once: ZADD takes `key SCORE member`, not member-then-score. ZINCRBY is the crucial one for contests — it adjusts the score AND repositions the member in O(log N), atomically, so concurrent solves can't lose updates. And the REV in ZREVRANK matters: plain ZRANK counts from the LOWEST score, which would rank your best player last. Top-10 display is `ZREVRANGE lb 0 9 WITHSCORES` — same descending logic.",
      docRef: DOC5,
    }),
};

export const distributedCodeGens: Generator[] = [cosineFn, jaccardFn, zsetCommands];
