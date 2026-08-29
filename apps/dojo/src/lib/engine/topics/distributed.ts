/**
 * Topic: Distributed systems for contests (drills phases 4–6 guides:
 * CQRS/leaderboards, recommendations, observability/anti-cheat).
 */
import { choice, numeric } from "../helpers";
import type { Generator, Topic } from "../types";
import { distributedCodeGens } from "./distributed-code";

const DOC5 = { slug: "phase-5-contests-cqrs-leaderboard", label: "Phase 5 — Contests, CQRS & leaderboard" };
const DOC4 = { slug: "phase-4-recommendation-engine", label: "Phase 4 — Recommendation engine" };
const DOC6 = { slug: "phase-6-analytics-anticheat-observability", label: "Phase 6 — Analytics, anti-cheat & observability" };

const zsetRank: Generator = {
  id: "ds-zset-rank",
  title: "Redis sorted-set ranking",
  generate: (rng) => {
    const names = rng.shuffle(["ada", "linus", "grace", "edsger", "barbara"]).slice(0, 4);
    const scores = rng.shuffle([120, 180, 240, 310, 420]).slice(0, 4);
    const target = rng.int(0, 3);
    const bump = rng.pick([100, 150, 200] as const);
    const finalScores = names.map((n, i) => ({
      name: n,
      score: (scores[i] as number) + (i === target ? bump : 0),
    }));
    const sorted = [...finalScores].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((e) => e.name === names[target]);
    return numeric({
      genId: "ds-zset-rank",
      prompt: `A contest leaderboard is a Redis sorted set. After the ZINCRBY below, what is ${names[target]}'s ZREVRANK (0 = highest score)?`,
      code: names.map((n, i) => `ZADD lb ${scores[i]} ${n}`).join("\n") + `\nZINCRBY lb ${bump} ${names[target]}`,
      codeLang: "text",
      answer: rank,
      tolerance: 0,
      placeholder: "0-based rank",
      explanation: `${names[target]} ends at ${finalScores[target]?.score} points; sorted highest-first the set reads ${sorted.map((e) => `${e.name}(${e.score})`).join(" > ")}, so ZREVRANK = ${rank}. A Redis **sorted set** ("zset") is a collection that *keeps itself in score order automatically*. \`ZINCRBY\` bumped one player's score and slid them to their new spot in O(log N) (≈20 tiny steps even for a million players), and \`ZREVRANK\` read the position back in O(log N) too — nothing gets re-sorted. That's why a zset can serve a live scoreboard for 100k contestants where a fresh \`ORDER BY score\` on every request could not.`,
      docRef: DOC5,
    });
  },
};

const zsetComplexity: Generator = {
  id: "ds-zset-ops",
  title: "Sorted-set operations & costs",
  generate: (rng) => {
    const cases = [
      { op: "get the top 10 with scores", answer: "ZREVRANGE lb 0 9 WITHSCORES — O(log N + 10)", wrong: ["ZSCAN the whole set and sort client-side", "ZSCORE for every member — O(N)", "SORT lb BY score — O(N log N)"] , why: "Range-by-rank walks the skip list from the top: logarithmic descent to the start, then 10 sequential steps. Scanning or per-member ZSCORE reads all N members — exactly the work the data structure exists to avoid." },
      { op: "update one player's score after a solve", answer: "ZINCRBY lb <delta> <player> — O(log N)", wrong: ["Delete and re-create the whole set", "HSET score then re-sort hourly", "ZADD with the same score for everyone"], why: "ZINCRBY atomically adjusts the score and relinks the member's position — one O(log N) operation, safe under concurrency. Rebuilds or periodic re-sorts turn a real-time scoreboard into a batch job, and a hash loses ordering entirely." },
      { op: "show a player their own rank", answer: "ZREVRANK lb <player> — O(log N)", wrong: ["ZREVRANGE 0 -1 and indexOf client-side", "Count players with higher score via SQL each request", "Store rank as a field, updated for all players on every solve"], why: "Rank queries are the second superpower of zsets: the skip list carries span counts, so position is computed in O(log N) without materialising the ordering. Storing rank as data inverts the cost disastrously — one score change would invalidate up to N stored ranks." },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "ds-zset-ops",
      prompt: `Live leaderboard: what's the right way to ${c.op}?`,
      correct: c.answer,
      wrong: [...c.wrong],
      explanation: c.why,
      docRef: DOC5,
    });
  },
};

const cqrs: Generator = {
  id: "ds-cqrs",
  title: "CQRS & eventual consistency",
  generate: (rng) => {
    const lag = rng.int(1, 4);
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "ds-cqrs",
      prompt: variant
        ? `A solve is written to the events table; the leaderboard projection updates ~${lag}00 ms later. The solver refreshes instantly and doesn't see their points yet. What is this, and what's the standard remedy?`
        : "In CQRS, why keep the write model (events/commands) separate from the read model (projections)?",
      correct: variant
        ? "Eventual consistency of the read model — acceptable here; for the solver's own view, read-your-own-writes (optimistic UI or reading through the write path) hides the lag"
        : "Writes and reads want different shapes and scaling — commands validate invariants, while projections precompute query-ready views the read side can serve cheaply",
      wrong: variant
        ? [
            "A lost event — the projector must be restarted from scratch",
            "A race condition that CQRS is supposed to make impossible",
            "Cache poisoning — the CDN must be purged",
          ]
        : [
            "Because databases cannot handle both reads and writes",
            "To make every read strongly consistent with every write",
            "It's required by Redis before sorted sets can be used",
          ],
      explanation:
        "**CQRS** ('Command Query Responsibility Segregation') just means: keep the *write* side and the *read* side as separate models. The write side guards the rules at transaction speed; separate 'projector' code folds those writes into read-ready views (the Redis zset IS such a view). The price is a lag window — the read side is *eventually* consistent (correct in a moment, not instantly). That's fine for other people's screens, but a user finds their *own* action missing jarring — hence **read-your-own-writes**: show the user's own action optimistically, or serve their own data straight from the write side. Naming the trade-off is what lets you choose it on purpose.",
      docRef: DOC5,
    });
  },
};

const stateMachine: Generator = {
  id: "ds-statemachine",
  title: "Contest lifecycle state machine",
  generate: (rng) => {
    const transitions = [
      { from: "REGISTRATION", to: "RUNNING", ok: true, why: "Registration closing into the live phase is the happy path — guarded by the clock, it's exactly what the state machine encodes." },
      { from: "RUNNING", to: "FROZEN", ok: true, why: "Freezing the visible scoreboard near the end (while still accepting submissions) is a legitimate contest phase — the projection stops publishing, the write side keeps recording." },
      { from: "FINISHED", to: "RUNNING", ok: false, why: "Reopening a finished contest would invalidate published results and already-applied rating updates. The machine forbids it; a mistake needs a *new* compensating process, not time travel." },
      { from: "REGISTRATION", to: "FINISHED", ok: false, why: "Skipping RUNNING entirely means a contest that finished without ever being live — no valid guard can fire this. Every transition must be an explicit, guarded edge; anything not listed is rejected." },
    ] as const;
    const t = rng.pick(transitions);
    return choice(rng, {
      genId: "ds-statemachine",
      prompt: `Contest states: REGISTRATION → RUNNING → FROZEN → FINISHED. A command arrives to move a contest from ${t.from} to ${t.to}. Valid?`,
      correct: t.ok
        ? "Yes — it's an explicit edge in the machine (subject to its guard, e.g. the clock)"
        : "No — reject it; that edge doesn't exist in the machine",
      wrong: [
        t.ok
          ? "No — states may only be entered in alphabetical order"
          : "Yes — any state may transition to any other on demand",
        "Only if the database is locked first",
        "Valid, but only for admin users",
      ],
      explanation: `${t.why} The deeper point of modelling this explicitly: without a state machine, transition rules live as scattered if-statements across handlers, and impossible states (submissions to a finished contest) creep in through the gaps. With one, every mutation must name its edge — invalid transitions become *unrepresentable* rather than merely discouraged.`,
      docRef: DOC5,
    });
  },
};

const cosine: Generator = {
  id: "ds-cosine",
  title: "Cosine similarity by hand",
  generate: (rng) => {
    const pairs = [
      { a: [1, 0], b: [0, 1], sim: 0 },
      { a: [2, 2], b: [4, 4], sim: 1 },
      { a: [3, 4], b: [4, 3], sim: 0.96 },
      { a: [1, 2], b: [2, 4], sim: 1 },
      { a: [5, 0], b: [3, 4], sim: 0.6 },
    ] as const;
    const p = rng.pick(pairs);
    return numeric({
      genId: "ds-cosine",
      prompt: `Two users' tag-solve vectors: u = [${p.a.join(", ")}], v = [${p.b.join(", ")}]. Cosine similarity = (u·v)/(|u||v|). Round to 2 decimals.`,
      answer: p.sim,
      tolerance: 0.02,
      placeholder: "-1.00 – 1.00",
      explanation: `u·v = ${p.a[0]}·${p.b[0]} + ${p.a[1]}·${p.b[1]} = ${p.a[0] * p.b[0] + p.a[1] * p.b[1]}; |u| = ${Math.hypot(...p.a).toFixed(2)}, |v| = ${Math.hypot(...p.b).toFixed(2)} → similarity ≈ ${p.sim}. **Cosine similarity** scores how much two lists 'point the same way' (1 = same direction, 0 = unrelated). It looks at *direction*, not size — so [1,2] and [2,4] are identical tastes at different activity levels (sim = 1). That's exactly why recommenders prefer it: a power user and a casual user with the same interests should still match. Vectors at right angles (no shared tags) give 0.`,
      docRef: DOC4,
    });
  },
};

const ucb1: Generator = {
  id: "ds-ucb1",
  title: "Explore vs exploit (UCB1)",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    if (variant) {
      const meanA = rng.pick([0.5, 0.6] as const);
      const nA = rng.pick([100, 200] as const);
      const meanB = rng.pick([0.3, 0.4] as const);
      const nB = rng.pick([4, 5, 8] as const);
      const t = nA + nB;
      const ucbA = meanA + Math.sqrt((2 * Math.log(t)) / nA);
      const ucbB = meanB + Math.sqrt((2 * Math.log(t)) / nB);
      const pick = ucbB > ucbA ? "B" : "A";
      return choice(rng, {
        genId: "ds-ucb1",
        prompt: `Two recommendation strategies: A has mean reward ${meanA} over ${nA} tries; B has mean ${meanB} over only ${nB} tries. UCB1 picks the higher of mean + √(2·ln t / n). Which does it choose, and why?`,
        correct: pick === "B"
          ? `B — its huge uncertainty bonus (√(2·ln ${t}/${nB}) ≈ ${Math.sqrt((2 * Math.log(t)) / nB).toFixed(2)}) outweighs A's better mean`
          : `A — even with B's uncertainty bonus, A's total ${ucbA.toFixed(2)} still edges out B's ${ucbB.toFixed(2)}`,
        wrong: [
          pick === "B"
            ? "A — always exploit the best observed mean"
            : "B — always explore the least-tried option",
          "Neither — UCB1 requires equal try counts first",
          "It alternates strictly A, B, A, B forever",
        ],
        explanation: `UCB(A) = ${meanA} + ${Math.sqrt((2 * Math.log(t)) / nA).toFixed(2)} ≈ ${ucbA.toFixed(2)}; UCB(B) = ${meanB} + ${Math.sqrt((2 * Math.log(t)) / nB).toFixed(2)} ≈ ${ucbB.toFixed(2)}. The bonus term is 'optimism in the face of uncertainty': barely-tried arms get inflated credit, so the algorithm keeps buying information about them — but the bonus shrinks as √(ln t / n), so exploration decays once evidence accumulates. Pure exploitation gets stuck on early luck; pure exploration wastes traffic. UCB1 provably balances the two.`,
        docRef: DOC4,
      });
    }
    return choice(rng, {
      genId: "ds-ucb1",
      prompt: "The recommender always serves each user's single highest-scored problem. Users complain the feed is monotonous (all one tag). Which technique from the guide addresses this directly?",
      correct: "MMR re-ranking — trade a little relevance for diversity by penalising similarity to already-picked items",
      wrong: [
        "Raising the candidate-generation pool size",
        "Caching the scores for longer",
        "Switching cosine similarity to Euclidean distance",
      ],
      explanation:
        "Maximal Marginal Relevance selects items one at a time, scoring each as λ·relevance − (1−λ)·max-similarity-to-already-selected. The second term is what breaks the monoculture: once a DP problem is picked, other DP problems get discounted, letting a strong graph problem through. Bigger pools and longer caches don't change the *selection rule*, which is where the monotony lives. λ is your relevance-vs-variety dial.",
      docRef: DOC4,
    });
  },
};

const observability: Generator = {
  id: "ds-observability",
  title: "Tracing & anti-cheat",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "ds-observability",
        prompt: "A submission flows API → queue → judge → rating service. Which observability tool answers \"where did these 4 seconds go?\" for ONE specific submission?",
        correct: "Distributed tracing — one trace id propagated across services, with a span per hop",
        wrong: [
          "Metrics — a latency histogram per service",
          "Logs — grep each service for the submission id",
          "Uptime checks on each service",
        ],
        explanation:
          "The 'three pillars' of observability answer different questions. **Metrics** aggregate ('p95 latency is high' tells you *that* something's slow, not *which* request or hop); **logs** are separate per-service events unless you hand-stitch them. **Distributed tracing** is the stitched story: the API starts a **trace** (tagged with one shared 'trace id'), that id rides along on the queue message (the propagation step people forget), and every service adds a timed **span** (one segment of the journey) — the waterfall view then shows the 4 seconds sitting in, say, queue wait. This particular question is tracing's.",
        docRef: DOC6,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "ds-observability",
        prompt: "Why does the guide warn against a Prometheus label like `user_id` on a request counter?",
        correct: "Cardinality explosion — every distinct label value creates a separate time series, and 100k users means 100k series per metric",
        wrong: [
          "User ids are personally identifiable and thus illegal in metrics",
          "Prometheus only supports 10 labels per metric",
          "String labels are slower to increment than integer ones",
        ],
        explanation:
          "Prometheus stores one time series per unique label combination. Bounded labels (status code, route, method) multiply into dozens of series; unbounded ones (user id, submission id) multiply into millions and take the TSDB down. The rule: metrics get *dimensions*, not *identities*. Identities belong in logs and traces, which are built for high cardinality. This one mistake is the most common way teams break their own monitoring.",
        docRef: DOC6,
      });
    }
    return choice(rng, {
      genId: "ds-observability",
      prompt: "CodeArena's plagiarism pipeline: tokenize the AST → k-grams → hash → Winnowing → compare fingerprints. Why compare token k-grams instead of raw source text?",
      correct: "Renaming variables and reformatting don't change the token stream, so trivial disguises don't evade detection",
      wrong: [
        "Raw text comparison is illegal under copyright law",
        "Tokens compress better, saving storage",
        "ASTs are faster to build than reading the file",
      ],
      explanation:
        "The cheapest cheats — rename variables, change spacing, reorder comments — don't touch the code's *structure*. An **AST** (Abstract Syntax Tree — the parsed shape of the code) turns `for (let i…)` and `for (let idx…)` into the *same* token stream once names are normalised. Then **k-grams** (every run of k consecutive tokens) capture local structure, **Winnowing** keeps a small but guaranteed-representative sample of their hashes (so storage stays tiny), and **Jaccard** similarity (size of the overlap ÷ size of the union) scores how alike two fingerprints are. Each stage defeats a specific dodge or cost; plain text-diffing falls at the very first hurdle.",
      docRef: DOC6,
    });
  },
};

export const distributedTopic: Topic = {
  id: "distributed-systems",
  title: "Contests & systems",
  icon: "🌐",
  blurb: "Redis sorted sets, CQRS & projections, state machines, recommenders, bandits, tracing and anti-cheat.",
  docSlug: "phase-5-contests-cqrs-leaderboard",
  docTitle: "Phase 5 — Contests, CQRS & leaderboard",
  generators: [
    zsetRank,
    zsetComplexity,
    cqrs,
    stateMachine,
    cosine,
    ucb1,
    observability,
    ...distributedCodeGens,
  ],
};
