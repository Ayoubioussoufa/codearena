/**
 * Topic: Rating & mastery math (drills docs/phase-3-rating-mastery-math.md).
 * Heavy on computed numeric answers — every variant has fresh numbers.
 */
import { choice, numeric } from "../helpers";
import type { Generator, Topic } from "../types";
import { ratingCodeGens } from "./rating-code";

const DOC = { slug: "phase-3-rating-mastery-math", label: "Phase 3 — Rating, mastery & the math" };

function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

const eloExpected: Generator = {
  id: "rm-elo-expected",
  title: "Elo expected score",
  generate: (rng) => {
    const ra = rng.int(14, 22) * 100;
    const diff = rng.pick([-400, -200, -100, 100, 200, 400] as const);
    const rb = ra + diff;
    const expected = round2(1 / (1 + Math.pow(10, (rb - ra) / 400)));
    return numeric({
      genId: "rm-elo-expected",
      prompt: `Player A is rated ${ra}, player B is rated ${rb}. Using Elo, what is A's expected score E_A = 1 / (1 + 10^((R_B − R_A)/400))? Round to 2 decimals.`,
      answer: expected,
      tolerance: 0.015,
      placeholder: "0.00 – 1.00",
      explanation: `E_A = 1 / (1 + 10^((${rb} − ${ra})/400)) = 1 / (1 + 10^(${(rb - ra) / 400})) ≈ ${expected}. "**Expected score**" is just the win probability the formula gives player A — a number from 0 to 1. The 400 is a scale choice: a 400-point gap means 10-to-1 odds, 200 points ≈ 76-to-24. That expected score doubles as the fair 'stake': the update R' = R + K(S − E) only moves a rating by how much the result *surprised* the model, which is why beating a far weaker player earns almost nothing.`,
      docRef: DOC,
    });
  },
};

const eloUpdate: Generator = {
  id: "rm-elo-update",
  title: "Elo rating update",
  generate: (rng) => {
    const r = rng.int(15, 21) * 100;
    const k = rng.pick([16, 24, 32] as const);
    const e = rng.pick([0.25, 0.4, 0.5, 0.6, 0.75] as const);
    const won = rng.chance(0.5);
    const s = won ? 1 : 0;
    const next = round2(r + k * (s - e));
    return numeric({
      genId: "rm-elo-update",
      prompt: `Rating ${r}, K = ${k}, expected score E = ${e}. The player ${won ? "WINS" : "LOSES"} (S = ${s}). New rating R' = R + K·(S − E)?`,
      answer: next,
      tolerance: 0.51,
      placeholder: "new rating",
      explanation: `R' = ${r} + ${k}·(${s} − ${e}) = ${r} ${s - e >= 0 ? "+" : "−"} ${Math.abs(round2(k * (s - e)))} = ${next}. Notice the asymmetry: ${won ? `winning when already favoured E=${e} pays only ${round2(k * (1 - e))} points` : `losing as ${e > 0.5 ? "the favourite costs a hefty" : "the underdog costs only"} ${Math.abs(round2(k * (0 - e)))} points`}. K is the volatility dial — big K reacts fast but jitters; small K is stable but slow to recognise improvement. Glicko-2's insight is making that dial per-player (the RD), instead of one global K.`,
      docRef: DOC,
    });
  },
};

const glickoRd: Generator = {
  id: "rm-glicko-rd",
  title: "Glicko: rating deviation",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "rm-glicko-rd",
      prompt: variant
        ? "In Glicko-2, what does a player's RD (rating deviation) represent, and how does inactivity affect it?"
        : "Two players are both rated 1800: one has RD 40, the other RD 300. Whose rating moves more after an upset loss, and why?",
      correct: variant
        ? "The uncertainty of the rating estimate — it shrinks with games played and grows during inactivity"
        : "The RD-300 player's — high uncertainty means the system weights new evidence more heavily",
      wrong: variant
        ? [
            "The player's rating volatility bonus added after each win",
            "The maximum points a player can gain in one match",
            "A penalty subtracted for losing streaks",
          ]
        : [
            "The RD-40 player's — precise ratings react faster",
            "Both move equally — RD only affects matchmaking",
            "Neither moves — upsets are discarded as outliers",
          ],
      explanation:
        "Glicko treats your rating as a *range* of likely values, not a single point: the rating itself is the best guess (the average), and **RD** measures how sure the system is — it's the 'standard deviation', a number for how spread-out those likely values are. Lots of recent games → small RD → the system is confident → results barely move you. Long absence → RD grows → your next results move you a lot, because the system honestly admits it no longer knows how good you are. This is the fix for Elo's one-size-fits-all K — and it's why a returning player's rating swings wildly for a few games before settling.",
      docRef: DOC,
    });
  },
};

const irt2pl: Generator = {
  id: "rm-irt",
  title: "IRT 2PL probability",
  generate: (rng) => {
    const theta = rng.pick([-1, -0.5, 0, 0.5, 1, 1.5] as const);
    const b = rng.pick([-1, -0.5, 0, 0.5, 1] as const);
    const a = rng.pick([1, 1.5, 2] as const);
    const p = round2(1 / (1 + Math.exp(-a * (theta - b))));
    return numeric({
      genId: "rm-irt",
      prompt: `IRT 2PL: learner ability θ = ${theta}, problem difficulty b = ${b}, discrimination a = ${a}. P(correct) = 1 / (1 + e^(−a(θ − b))). Round to 2 decimals.`,
      answer: p,
      tolerance: 0.02,
      placeholder: "0.00 – 1.00",
      explanation: `a(θ − b) = ${a}·(${theta} − ${b}) = ${round2(a * (theta - b))}, and the **sigmoid** of that is ≈ ${p}. (A sigmoid is the S-shaped function 1/(1+e^(−x)) that squashes any number into a 0–1 probability.) Read it structurally: when ability equals difficulty (θ = b) the probability is exactly 0.5 — so b is 'the ability level where this problem is a coin flip'. The **discrimination** a controls how steep the S-curve is: high-a problems sharply separate skill levels, low-a ones are noisy signals. CodeArena's adaptive feed is this formula aimed at problem *selection*: pick items where P(correct) ≈ 0.5–0.7, where you learn the most per attempt.`,
      docRef: DOC,
    });
  },
};

const logOdds: Generator = {
  id: "rm-logodds",
  title: "Probability ↔ odds",
  generate: (rng) => {
    const p = rng.pick([0.2, 0.25, 0.5, 0.75, 0.8, 0.9] as const);
    const odds = round2(p / (1 - p));
    return numeric({
      genId: "rm-logodds",
      prompt: `A player wins with probability ${p}. What are the odds in favour, as a single number (odds = p / (1 − p))? Round to 2 decimals.`,
      answer: odds,
      tolerance: 0.02,
      placeholder: "odds",
      explanation: `odds = ${p} / ${round2(1 - p)} = ${odds}${p === 0.5 ? " — even money" : ""}. **Odds** are simply 'chance it happens ÷ chance it doesn't' (a probability of 0.75 = 3-to-1 odds). They're the bridge to rating systems: an Elo rating *difference* is literally the **log-odds** (the logarithm of the odds) scaled by 400/log(10) — which is why 'ratings add up' cleanly, because log-odds add. Multiplying odds across independent events stays tidy where multiplying probabilities gets messy, which is why logistic models (Elo, IRT, logistic regression) all work in log-odds space and only convert back to a probability at the very end, via the sigmoid.`,
      docRef: DOC,
    });
  },
};

const fsrs: Generator = {
  id: "rm-fsrs",
  title: "Spaced repetition (FSRS) concepts",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "rm-fsrs",
        prompt: "In FSRS terms, what is a memory's *stability*?",
        correct: "How long the memory lasts — the time for recall probability to decay to 90%",
        wrong: [
          "The percentage of reviews the user has gotten right",
          "A fixed multiplier of 2.5 applied to every interval",
          "The user's overall rating on the platform",
        ],
        explanation:
          "FSRS models each memory with (difficulty, stability, retrievability). Stability is the decay timescale: high stability = the memory fades slowly, so the next review can wait longer. Every successful recall at the *right moment* (when retrievability has dropped, i.e. the recall was effortful) increases stability the most — that's the spacing effect, and it's why the scheduler deliberately waits until you've *almost* forgotten. A fixed 2.5× multiplier is the old SM-2 heuristic FSRS replaces with a fitted model.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "rm-fsrs",
        prompt: "Why does CodeArena resurface a problem you solved 3 weeks ago rather than one you solved yesterday?",
        correct: "Retrievability decays with time — the 3-week-old memory is near the forgetting threshold, where review strengthens it most",
        wrong: [
          "Older solves are worth more leaderboard points",
          "The yesterday problem is locked by a cooldown timer",
          "Reviews are scheduled purely at random for variety",
        ],
        explanation:
          "Reviewing something you'd recall at 99% anyway teaches almost nothing; reviewing at ~90% retrievability — right before the cliff — produces the biggest stability gain per minute spent. So the scheduler computes each memory's decay and queues the ones approaching the threshold. Reviewing yesterday's solve is comfortable but near-worthless; the slightly-uncomfortable one is where learning happens. (The same 'desirable difficulty' logic drives the dojo's own weighted question picking.)",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "rm-fsrs",
      prompt: "A property-based test for the rating function asserts: \"for any two results, applying them in either order yields the same final rating.\" What is this style of test checking?",
      correct: "An invariant over many generated inputs — properties, not hand-picked examples",
      wrong: [
        "A snapshot of one known input/output pair",
        "The UI renders the rating correctly",
        "That the function runs within a time budget",
      ],
      explanation:
        "Example tests check points ('1500 + win vs 1600 → 1512'); property tests check *laws* across thousands of random inputs — commutativity, monotonicity ('winning never lowers a rating'), boundedness. For pure math like rating updates they're devastatingly effective, because the law is easier to state than every interesting case is to enumerate. Keeping the rating function pure (no I/O, no clock) is what makes this possible — a design pressure worth feeling early.",
      docRef: DOC,
    });
  },
};

export const ratingTopic: Topic = {
  id: "rating-math",
  title: "Rating math",
  icon: "📈",
  blurb: "Elo expected scores and updates, Glicko RD, IRT probabilities, odds and FSRS — with fresh numbers every attempt.",
  docSlug: "phase-3-rating-mastery-math",
  docTitle: "Phase 3 — Rating, mastery & math",
  generators: [
    eloExpected,
    eloUpdate,
    glickoRd,
    irt2pl,
    logOdds,
    fsrs,
    ...ratingCodeGens,
  ],
};
