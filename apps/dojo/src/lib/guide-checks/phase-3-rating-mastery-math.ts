/**
 * Checks for ../../docs/phase-3-rating-mastery-math.md.
 * Checked 3 Nov 2026: Glickman's "Example of the Glicko-2 system" (tau range, worked example 1464.06 / 151.52), the FSRS algorithm wiki (FSRS-4.5 curve, FSRS-6 trainable decay); Elo and FSRS numbers re-derived.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const phase3Checks: GuideCheckSet = {
  name: "Phase 3 guide",
  source: {
    label: "Mark Glickman, \"Example of the Glicko-2 system\"",
    href: "https://www.glicko.net/glicko/glicko2.pdf",
    note: "Five pages, with the exact algorithm and a worked example your code must reproduce (1500 → 1464.06, RD 200 → 151.52). For Part D, the [FSRS algorithm wiki](https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm).",
  },
  terms: [
    "Sigmoid",
    "Log-odds",
    "Gradient ascent",
    "Elo K-factor",
    "Rating deviation",
    "Volatility",
    "Item difficulty",
    "Discrimination",
    "Stability",
    "Property-based test",
  ],
  checks: [
    {
      id: "toolkit",
      section: "Part A · The math toolkit",
      questions: [
        {
          prompt: "What is `sigmoid(0)`, and what does it mean for a rating difference of zero?",
          options: [
            "0: a zero difference means no chance",
            "0.5: no advantage gives an even chance",
            "1: equal players always draw the game",
            "e, which is Euler's number, about 2.718",
          ],
          correct: 1,
          why: "`sigmoid(x) = 1 / (1 + e^-x)`, so at 0 it's 1/2. Large positive differences approach 1, large negative ones approach 0, and the curve only ever rises: more advantage never lowers your chance.",
        },
        {
          prompt: "\"Your rating is 1843\" after two games. What's wrong with that statement?",
          options: [
            "It uses a points scale instead of percentages",
            "It should be rounded to the nearest hundred",
            "It ignores how long the two games took",
            "It gives a point estimate with no uncertainty",
          ],
          correct: 3,
          why: "Two games is little evidence, so the honest statement is \"1843 ± 300\". The core lesson of the phase: never report a point estimate without its uncertainty. Elo can't; Glicko and IRT track it.",
        },
      ],
      explain: "Explain why rating systems use a points scale: what log-odds have to do with \"200 points stronger\" meaning the same edge anywhere on the scale.",
    },
    {
      id: "ratings",
      section: "Part B · Elo, Glicko, Glicko-2",
      questions: [
        {
          prompt: "In Elo, when does a win move your rating the most?",
          options: [
            "When you were expected to lose the game",
            "When you were expected to win the game",
            "When the two players have the same rating",
            "When the game lasted much longer than usual",
          ],
          correct: 0,
          why: "The update is `K × (S − E)`, the surprise. Beating someone you had a 0.1 chance against gains `0.9K`; beating someone you were expected to beat gains `0.1K`. Upsets move ratings most.",
        },
        {
          prompt: "A player returns after a year away. What does Glicko do to their rating deviation, and why?",
          options: [
            "It shrinks, because the rating has stayed so stable",
            "It resets to zero, since nothing is known yet",
            "It grows, because the old evidence has gone stale",
            "It stays the same, since no games were played",
          ],
          correct: 2,
          why: "Confidence decays with stale evidence, so RD widens during inactivity. A high RD then lets the rating move quickly to find the player's true level once they play again.",
        },
        {
          prompt: "What does Glicko-2's volatility σ capture that RD doesn't?",
          options: [
            "How many games the player has played",
            "How long since the player's last game",
            "How consistent all the player's results are",
            "How strong the player's usual opponents are",
          ],
          correct: 2,
          why: "RD is how sure we are about the rating; σ is how erratic the player is. A steady 1600 has low σ; someone who beats masters and loses to beginners has high σ, so their rating may swing more. The constant τ limits how fast σ changes (Glickman suggests 0.3 to 1.2).",
        },
      ],
      explain: "Give the three interview reasons for choosing Glicko-2 over Elo.",
    },
    {
      id: "irt",
      section: "Part C · Item Response Theory",
      questions: [
        {
          prompt: "In the 2PL model, what is P(correct) when ability θ equals difficulty b?",
          options: [
            "0.5, whatever the discrimination of the item is",
            "1, because the person matches the item exactly",
            "0, because the item sits at their limits",
            "It depends on the discrimination of the item",
          ],
          correct: 0,
          why: "`P = sigmoid(a × (θ − b))`; at θ = b the inside is 0 for any `a`, so P = 0.5: a coin flip, and the point where the item tells you the most about that person.",
        },
        {
          prompt: "An item's discrimination `a` is 0. What does it tell you?",
          options: [
            "Everything: it splits the strong from the weak perfectly",
            "It's the hardest item anywhere in the problem set",
            "It's the easiest item anywhere in the problem set",
            "Nothing: everyone has a 50% chance of solving it",
          ],
          correct: 3,
          why: "With `a = 0`, `a × (θ − b)` is 0 for everyone, so P = 0.5 regardless of ability: pure noise for measurement. You'd drop or flag it.",
        },
        {
          prompt: "Two submissions update the same user's θ at the same moment. What's the risk?",
          options: [
            "A deadlock, so the later update must wait longer",
            "A lost update, so the update must be transactional",
            "Nothing, since gradient steps can run in any order",
            "A rounding error, so θ needs integer storage instead",
          ],
          correct: 1,
          why: "Both read the same θ, both add their step, and the second write erases the first: Phase 1's lost update. Wrap the read-modify-write in a transaction or make the update atomic.",
        },
      ],
      explain: "Explain why 2PL is the sweet spot between 1PL (Rasch) and 3PL for a coding platform.",
    },
    {
      id: "fsrs",
      section: "Part D · FSRS",
      questions: [
        {
          prompt: "In FSRS, what does \"stability = 15\" mean?",
          options: [
            "In 15 days, recall probability falls to 90%",
            "After 15 reviews, the card is fully learned",
            "The card is reviewed every 15 days forever",
            "Recall drops by 15% after each single day",
          ],
          correct: 0,
          why: "Stability is defined by the curve: R(S) = 0.9, so S is the number of days until recall probability falls to 90%. Each successful review raises S; a lapse lowers it.",
        },
        {
          prompt: "Lowering the target retention from 90% to 80% does what to a 15-day interval?",
          options: [
            "It shortens it to about 12 days",
            "It keeps it at exactly 15 days",
            "It stretches it to about 36 days",
            "It doubles it to exactly 30 days",
          ],
          correct: 2,
          why: "t = (S / FACTOR) × (r^(1/DECAY) − 1) = 63.94 × (0.8^−2 − 1) ≈ 36 days. You review less than half as often, and forget about twice as often: the retention trade-off, quantified.",
        },
        {
          prompt: "Why does FSRS beat SM-2?",
          options: [
            "It uses the same fixed multipliers per card",
            "It's a model fitted to real review logs",
            "It ignores how hard each card has been",
            "It schedules every card at the same time",
          ],
          correct: 1,
          why: "SM-2 is hand-tuned rules and an ease factor; FSRS models difficulty, stability and retrievability explicitly and is trained on millions of reviews, so it predicts recall more accurately and needs fewer reviews for the same retention.",
        },
      ],
      explain: "Derive FACTOR = 19/81 from the requirement R(S) = 0.9 with DECAY = −0.5.",
    },
    {
      id: "engineering",
      section: "Part E · Engineering the math",
      questions: [
        {
          prompt: "The rating update needs the current time. How does it stay a pure function?",
          options: [
            "It reads Date.now() just once, then caches it",
            "It stores the time in a global constant",
            "It asks the database for the server time",
            "The caller passes now in as an argument",
          ],
          correct: 3,
          why: "A pure function gives the same output for the same input and touches no clock, network or database. Pass `now` in and the math stays pure and testable against Glickman's paper; the thin service layer does the I/O.",
        },
        {
          prompt: "What does property-based testing check that example tests don't?",
          options: [
            "One known input against its one expected output",
            "A law that holds for every generated input",
            "That the code runs faster than its budget",
            "That each line of the function was executed",
          ],
          correct: 1,
          why: "You state a law (\"winning never lowers your rating\") and fast-check throws hundreds of random inputs at it, then shrinks any failure to the simplest counterexample.",
        },
      ],
      explain: "Name three invariants worth property-testing in CodeArena's rating and review math, one each for Glicko-2, IRT and FSRS.",
    },
  ],
};
