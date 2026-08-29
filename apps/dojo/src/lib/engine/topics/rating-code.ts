/**
 * Rating math — code exercises that RUN against numeric test cases.
 * Imported by rating.ts.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";

const DOC = { slug: "phase-3-rating-mastery-math", label: "Phase 3 — Rating, mastery & the math" };

const expectedScore: Generator = {
  id: "rm-code-expected",
  title: "✍️ Implement Elo expected score (runs for real)",
  generate: () =>
    codeTask({
      genId: "rm-code-expected",
      prompt:
        "Implement `expectedScore(ra, rb)` — player A's expected score against B: `1 / (1 + 10^((rb − ra) / 400))`. Executed against real test cases.",
      language: "javascript",
      starter: `function expectedScore(ra, rb) {\n  // the Elo formula\n}`,
      solution: `function expectedScore(ra, rb) {\n  return 1 / (1 + 10 ** ((rb - ra) / 400));\n}`,
      fn: {
        name: "expectedScore",
        tests: [
          { args: [1500, 1500], expected: 0.5, approx: 0.001 },
          { args: [1500, 1900], expected: 0.0909, approx: 0.001 },
          { args: [1700, 1500], expected: 0.7597, approx: 0.001 },
          { args: [1200, 1600], expected: 0.0909, approx: 0.001 },
        ],
      },
      explanation:
        "Sanity-check your implementation against the landmarks: equal ratings → exactly 0.5; a 400-point deficit → 1/11 ≈ 0.09 (that's the definition of the 400 scale: 10:1 odds); and it must depend only on the DIFFERENCE — (1200 vs 1600) equals (1500 vs 1900). Common bugs the tests catch: `ra - rb` instead of `rb - ra` (flips favorite and underdog) and dividing by 400 outside the exponent. This function is the heart of everything Phase 3 builds.",
      docRef: DOC,
    }),
};

const eloUpdate: Generator = {
  id: "rm-code-eloupdate",
  title: "✍️ Implement the rating update (runs for real)",
  generate: () =>
    codeTask({
      genId: "rm-code-eloupdate",
      prompt:
        "Implement `eloUpdate(rating, k, score, expected)` → the new rating after one game: `R' = R + K × (S − E)`. `score` is 1 for a win, 0 for a loss. Executed against real test cases.",
      language: "javascript",
      starter: `function eloUpdate(rating, k, score, expected) {\n  // one line of Elo\n}`,
      solution: `function eloUpdate(rating, k, score, expected) {\n  return rating + k * (score - expected);\n}`,
      fn: {
        name: "eloUpdate",
        tests: [
          { args: [1500, 32, 1, 0.5], expected: 1516, approx: 0.001 },
          { args: [1500, 32, 0, 0.75], expected: 1476, approx: 0.001 },
          { args: [2000, 16, 1, 0.909], expected: 2001.456, approx: 0.001 },
          { args: [1800, 24, 0, 0.3], expected: 1792.8, approx: 0.001 },
        ],
      },
      explanation:
        "Read the test cases as stories: an even-odds win at K=32 pays +16; losing as a 75% favourite costs −24 (upsets hurt); beating a much weaker player (E=0.909) earns a laughable +1.46 — the result barely surprised the model, so the rating barely moves. `(S − E)` is the *surprise term*, and K scales how loudly one game speaks. Notice the function is pure — no clock, no I/O — which is exactly what makes it property-testable later.",
      docRef: DOC,
    }),
};

const sigmoidFn: Generator = {
  id: "rm-code-sigmoid",
  title: "✍️ Implement the sigmoid (runs for real)",
  generate: () =>
    codeTask({
      genId: "rm-code-sigmoid",
      prompt:
        "Implement `sigmoid(x) = 1 / (1 + e^(−x))` — the squash that turns any log-odds into a probability. Executed against real test cases (use `Math.exp`).",
      language: "javascript",
      starter: `function sigmoid(x) {\n  // squash ℝ → (0, 1)\n}`,
      solution: `function sigmoid(x) {\n  return 1 / (1 + Math.exp(-x));\n}`,
      fn: {
        name: "sigmoid",
        tests: [
          { args: [0], expected: 0.5, approx: 0.001 },
          { args: [2], expected: 0.8808, approx: 0.001 },
          { args: [-2], expected: 0.1192, approx: 0.001 },
          { args: [10], expected: 0.9999, approx: 0.001 },
        ],
      },
      explanation:
        "The sigmoid is that S-shaped squash that turns any number into a 0–1 probability. Landmarks to internalise: σ(0) = 0.5 (no information → coin flip), σ(x) + σ(−x) = 1 (perfect symmetry — check tests 2 and 3), and it saturates fast (σ(10) ≈ 0.99995). Elo's expected score IS this function with the input scaled by ln(10)/400; IRT's 2PL is this function with input a(θ − b). One curve, three systems — implement it once by hand and all of Phase 3's formulas become variations on a single friend.",
      docRef: DOC,
    }),
};

export const ratingCodeGens: Generator[] = [expectedScore, eloUpdate, sigmoidFn];
