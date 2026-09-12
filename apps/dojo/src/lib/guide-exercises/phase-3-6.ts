/**
 * Exercises for Phases 3–6 — rating maths, recommendations, CQRS and
 * observability.
 *
 * These are Week 5 and beyond. The maths ones are deliberately arithmetic you
 * can do in your head: the point is knowing which direction a number moves and
 * why, not reproducing a formula.
 */
import type { GuideExercise } from "./types";

/* ── Phase 3 — rating and mastery ───────────────────────────────────── */
export const phase3Exercises: GuideExercise[] = [
  {
    id: "sigmoid-intuition",
    title: "Read the sigmoid",
    prompt:
      "σ(x) = 1 / (1 + e^-x). Give σ for each input, and say in one line what the function is for.",
    language: "text",
    given: `e^0 = 1 · large positive x → e^-x ≈ 0 · large negative x → e^-x is huge`,
    starter: `σ(0)   =
σ(+∞)  =
σ(-∞)  =
what it is for:
`,
    solution: `σ(0)   = 0.5
σ(+∞)  = 1
σ(-∞)  = 0
what it is for: squashing any real number into a probability between 0 and 1, so a rating DIFFERENCE becomes a chance of winning.
`,
    hint: "Substitute into the formula for x = 0. The other two follow from what e^-x does at the extremes.",
    explanation:
      "The sigmoid is the bridge between **an unbounded score and a bounded probability**. A rating difference can be anything from -2000 to +2000; a probability must sit in [0, 1]. σ maps one onto the other smoothly, and σ(0) = 0.5 encodes the thing you would want anyway: equal ratings mean an even match. Every rating system in this phase — Elo, Glicko, 2PL — is this function with different things fed into it.",
    checks: [
      { re: "σ\\(0\\)\\s*=\\s*0?\\.5", label: "σ(0) = 0.5" },
      { re: "σ\\(\\+∞\\)\\s*=\\s*1", label: "σ(+∞) = 1" },
      { re: "σ\\(-∞\\)\\s*=\\s*0", label: "σ(-∞) = 0" },
      { re: "probab", flags: "i", label: "names it as producing a probability" },
    ],
  },

  {
    id: "elo-update",
    title: "Apply one Elo update",
    prompt:
      "A 1500 player beats a 1500 player, K = 32. Work out the expected score, the new rating, and what the loser's becomes.",
    language: "text",
    given: `E = 1 / (1 + 10^((Rb - Ra)/400))
R' = R + K × (S - E),  S = 1 for a win, 0 for a loss`,
    starter: `expected score E:
winner's new rating:
loser's new rating:
`,
    solution: `expected score E: 0.5  (equal ratings → 10^0 = 1 → 1/2)
winner's new rating: 1500 + 32 × (1 - 0.5) = 1516
loser's new rating:  1500 + 32 × (0 - 0.5) = 1484
`,
    hint: "Equal ratings make the exponent zero, and anything to the power of zero is one.",
    explanation:
      "Two properties fall out of this one line. **Elo is zero-sum**: +16 and -16, so total rating in the system is conserved. And **the update is proportional to surprise** — beating an equal opponent moves you 16 points, while beating someone 400 points above you (E ≈ 0.09) moves you ~29. K controls how fast ratings react: high K means volatile and responsive, low K means stable and slow. That single trade-off is what Glicko replaces with something principled.",
    checks: [
      { re: "0?\\.5", label: "E = 0.5 for equal ratings" },
      { re: "1516", label: "winner goes to 1516" },
      { re: "1484", label: "loser goes to 1484" },
    ],
  },

  {
    id: "glicko-rd",
    title: "Say what RD buys you",
    prompt:
      "Elo has one number per player and Glicko has two. Answer both questions in one line each.",
    language: "text",
    given: `Glicko: rating R, and rating deviation RD (uncertainty).`,
    starter: `1. what RD represents:
2. what happens to a player's rating change as RD grows:
`,
    solution: `1. what RD represents: how uncertain the system is about that rating — high after few games or a long absence, low after many recent ones.
2. what happens: a larger RD means a larger rating change, because the system trusts the current estimate less and lets new evidence move it further.
`,
    hint: "Elo's K is a fixed guess at how much to trust a rating. Glicko replaces the guess with a number it actually measures.",
    explanation:
      "Elo's K is a constant that has to be wrong for someone: too high for a veteran with 2,000 games, too low for a newcomer with three. **RD makes the learning rate personal** — a new player's rating moves fast because it is barely known, and a veteran's barely moves because it is. RD also *grows over time* with inactivity, so a returning player is re-measured quickly rather than coasting on a two-year-old number. Glicko-2 adds volatility: how erratic this player's results are, independent of how well known they are.",
    checks: [
      { re: "uncertain|confiden|deviation|how well known", flags: "i", label: "RD is uncertainty" },
      { re: "larg|more|big|faster|great", flags: "i", label: "higher RD means a bigger change" },
      { re: "new|inactiv|few games|absence", flags: "i", label: "connects it to new or returning players" },
    ],
  },
];

/* ── Phase 4 — recommendation ───────────────────────────────────────── */
export const phase4Exercises: GuideExercise[] = [
  {
    id: "linear-score",
    title: "Combine the features",
    prompt:
      "Write the scoring function: difficulty fit, tag need and review urgency, weighted and summed, with the contributions returned so a recommendation can explain itself.",
    language: "typescript",
    given: `// Every feature returns 0..1.
// fit(user, problem) · tagNeed(user, problem) · reviewUrgency(user, problem)`,
    starter: `const WEIGHTS = { fit: 0.5, tagNeed: 0.3, review: 0.2 };

function score(user: User, problem: Problem) {
  // TODO: return the total AND why
}
`,
    solution: `const WEIGHTS = { fit: 0.5, tagNeed: 0.3, review: 0.2 };

function score(user: User, problem: Problem) {
  const features = {
    fit: fit(user, problem),
    tagNeed: tagNeed(user, problem),
    review: reviewUrgency(user, problem),
  };

  const contributions = {
    fit: features.fit * WEIGHTS.fit,
    tagNeed: features.tagNeed * WEIGHTS.tagNeed,
    review: features.review * WEIGHTS.review,
  };

  const total = Object.values(contributions).reduce((a, b) => a + b, 0);

  return { total, features, contributions };
}
`,
    hint: "Returning only the total throws away the reason. Keep each feature's contribution so the UI can say why.",
    explanation:
      "A linear weighted sum is deliberately the least clever option, and that is the point: it is **debuggable**. When a recommendation looks wrong you can see exactly which feature dominated, and tune one weight. A neural model might rank marginally better and would leave you with nothing to say to a user asking 'why this problem?'. Returning the contributions is what makes the *Why this?* panel possible — and a recommender that can explain itself is one people trust.",
    checks: [
      { re: "fit\\(user", label: "computes the difficulty fit" },
      { re: "tagNeed\\(user", label: "computes the tag need" },
      { re: "reviewUrgency\\(user", label: "computes review urgency" },
      { re: "WEIGHTS\\.", label: "applies the weights" },
      { re: "contributions|breakdown|reasons", label: "returns the per-feature contributions" },
      { re: "total", label: "returns the total" },
    ],
  },
  {
    id: "explore-exploit",
    title: "Explain the dilemma",
    prompt:
      "Answer both in one line each.",
    language: "text",
    given: `The recommender always shows the highest-scoring problem.`,
    starter: `1. what always exploiting costs you:
2. what UCB1 adds to the score, and why:
`,
    solution: `1. what always exploiting costs you: you never learn whether the problems you rank low are actually good — the estimate for anything unshown never improves, so a bad initial guess is permanent.
2. what UCB1 adds: a bonus that grows with how UNSEEN an item is, so rarely-shown items get tried occasionally; the bonus shrinks as evidence accumulates.
`,
    hint: "The score is an estimate. An estimate you never test cannot get better, and the recommender cannot tell a bad item from an untried one.",
    explanation:
      "Pure exploitation locks in your initial guesses: an item ranked low is never shown, never gets feedback, and stays low forever regardless of whether it was any good. **UCB1 is optimism in the face of uncertainty** — it adds a confidence bonus that is large when an item is barely tried and shrinks as evidence arrives. So exploration happens automatically and self-limits, rather than needing a random ε that wastes the same fraction of recommendations forever.",
    checks: [
      { re: "never|not learn|no feedback|stuck|permanent", flags: "i", label: "names the cost of never exploring" },
      { re: "uncertain|unseen|rare|few|bonus", flags: "i", label: "the bonus grows with uncertainty" },
      { re: "shrink|decreas|less|more data|accumulat", flags: "i", label: "and shrinks with evidence" },
    ],
  },
];

/* ── Phase 5 — contests, CQRS, leaderboard ──────────────────────────── */
export const phase5Exercises: GuideExercise[] = [
  {
    id: "cqrs-split",
    title: "Say what CQRS separates",
    prompt: "Answer all three in one line each.",
    language: "text",
    given: `A contest leaderboard is read thousands of times a second and written
whenever a submission is judged.`,
    starter: `1. what is separated:
2. why that helps here:
3. what it costs:
`,
    solution: `1. what is separated: the write model (commands, normalised, correct) from the read model (queries, denormalised, fast).
2. why that helps: reads and writes have opposite requirements — the read model can be shaped exactly for "top 100 right now" without compromising the write model's integrity, and each scales independently.
3. what it costs: eventual consistency, and two models to keep in sync. A just-judged submission may not appear on the leaderboard for a moment.
`,
    hint: "The two sides want opposite things. One wants normalised and correct; the other wants denormalised and instant.",
    explanation:
      "CQRS is worth it exactly when reads and writes have **genuinely different shapes**, which a leaderboard does: writes are one submission at a time and must be correct, reads are 'top 100 by score' thousands of times a second. Splitting lets the read side be a Redis sorted set while the write side stays a relational table with constraints. The cost is real and must be stated: the two can disagree briefly. If your reads and writes want the same shape, CQRS is complexity with no payoff.",
    checks: [
      { re: "write|command", flags: "i", label: "names the write side" },
      { re: "read|quer", flags: "i", label: "names the read side" },
      { re: "denormal|shaped|optimi|fast", flags: "i", label: "the read model is shaped for reading" },
      { re: "eventual|consisten|sync|lag|delay", flags: "i", label: "names eventual consistency as the cost" },
    ],
  },
  {
    id: "redis-leaderboard",
    title: "Build the leaderboard commands",
    prompt:
      "Write the Redis commands: record a score, get the top 10 with scores, and get one user's rank.",
    language: "bash",
    given: `# A sorted set keyed contest:42
# Redis ranks are 0-based and ascending by default.`,
    starter: `# 1. record user 7 scoring 250

# 2. top 10, highest first, with scores

# 3. user 7's rank, 1-based, counting from the top
`,
    solution: `# 1. record user 7 scoring 250
ZADD contest:42 250 user:7

# 2. top 10, highest first, with scores
ZREVRANGE contest:42 0 9 WITHSCORES

# 3. user 7's rank, 1-based, counting from the top
ZREVRANK contest:42 user:7      # then add 1 — Redis is 0-based
`,
    hint: "The `REV` variants count from the highest score. Without them you get the bottom of the leaderboard.",
    explanation:
      "A sorted set gives **O(log n) insert and O(log n + k) range reads**, which is why this is a Redis problem and not a SQL one — `ORDER BY score DESC LIMIT 10` re-sorts or walks an index on every call, at thousands of calls a second. `ZREVRANK` answering 'what rank am I' in O(log n) is the part that has no cheap relational equivalent at all. Two details bite: ranks are **0-based**, so a leaderboard position needs `+1`, and ties are broken lexicographically by member unless you pack a tiebreaker into the score.",
    checks: [
      { re: "ZADD", label: "ZADD to record the score" },
      { re: "ZREVRANGE|ZRANGE[^\\n]*REV", label: "ZREVRANGE for the top N" },
      { re: "WITHSCORES", label: "WITHSCORES to return the scores" },
      { re: "ZREVRANK", label: "ZREVRANK for the rank" },
      { re: "0\\s*9|0 9", label: "0..9 for ten entries" },
    ],
  },
];

/* ── Phase 6 — analytics, anti-cheat, observability ─────────────────── */
export const phase6Exercises: GuideExercise[] = [
  {
    id: "plagiarism-pipeline",
    title: "Order the plagiarism pipeline",
    prompt:
      "Put the four steps in order and say in one clause what each buys you.",
    language: "text",
    given: `Available: k-grams · Jaccard similarity · winnowing · structural tokenising`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. structural tokenising — replace identifiers and literals with their token TYPE, so renaming variables changes nothing
2. k-grams — slide a window over the token stream, so reordering whole blocks still leaves matching runs
3. winnowing — keep only a deterministic subset of hashes, so comparison is cheap but matches are still guaranteed to be found
4. Jaccard similarity — |intersection| / |union| of the kept hashes, giving a 0..1 score
`,
    hint: "Each step defeats a different disguise. The first kills renaming; the last turns two sets into one number.",
    explanation:
      "Each step exists to defeat a specific evasion. Comparing raw text fails on a rename; **tokenising structurally** makes `int x` and `int total` identical. Comparing whole files fails on reordering; **k-grams** keep local structure. Keeping every hash is too expensive at scale; **winnowing** keeps a window's minimum, which is deterministic — so identical passages still produce identical hashes rather than relying on luck. And the output is a *score*, never a verdict: a high Jaccard flags a pair for a human, because the false-positive cost of accusing someone is far higher than the cost of a second look.",
    checks: [
      { re: "1\\.[^\\n]*(token|structur|normalis|normaliz)", flags: "mi", label: "1 — tokenise structurally" },
      { re: "2\\.[^\\n]*k.?gram", flags: "mi", label: "2 — k-grams" },
      { re: "3\\.[^\\n]*winnow", flags: "mi", label: "3 — winnowing" },
      { re: "4\\.[^\\n]*jaccard", flags: "mi", label: "4 — Jaccard similarity" },
    ],
  },
  {
    id: "structured-logging",
    title: "Make a log line queryable",
    prompt:
      "Rewrite this so you could answer 'how many submissions failed for user 7 in the last hour' without grep and a regex.",
    language: "typescript",
    given: `// The logger accepts an object.`,
    starter: `logger.log(\`Submission \${id} for user \${userId} failed after \${ms}ms\`);
`,
    solution: `logger.error({
  event: 'submission.failed',
  submissionId: id,
  userId,
  durationMs: ms,
  traceId,
});
`,
    hint: "A message is one string. A log line with named fields is a row you can filter and aggregate.",
    explanation:
      "An interpolated string forces every question through a regex, and the regex breaks the day someone rewords the message. **Structured fields make a log line a queryable record**: filter by `userId`, aggregate `durationMs`, count by `event`. The `event` name matters more than the prose — it is the stable key you group by. And `traceId` is what stitches this line to the same request's lines in every other service, which is the difference between a log and observability. Note the level too: a failure is `error`, not `log`.",
    checks: [
      { re: "logger\\.(error|warn)", label: "logs at the right level" },
      { re: "event\\s*:", label: "has a stable event name" },
      { re: "userId", label: "userId is a field, not prose" },
      { re: "durationMs|duration", label: "the duration is a number you can aggregate" },
      { re: "traceId|requestId|correlationId", label: "carries a trace id" },
      { re: "logger\\.log\\(`", expect: false, label: "no interpolated message string" },
    ],
  },
  {
    id: "three-pillars",
    title: "Pick the right pillar",
    prompt: "Write `logs`, `metrics`, or `traces` for each.",
    language: "text",
    given: `1. "the p99 latency of /submissions over the last day"
2. "why did THIS request take 8 seconds"
3. "what exactly happened when submission 1234 failed"
4. "are we serving more 5xx than yesterday"`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. metrics — an aggregate over time
2. traces — the breakdown of one request across services
3. logs — the detail of one specific event
4. metrics — a trend, compared against a baseline
`,
    hint: "One is aggregate, one is a single request end to end, one is a single event's detail. Two of the four are the same kind.",
    explanation:
      "**Metrics tell you something is wrong; traces tell you where; logs tell you what.** That is the usual debugging order, and reaching for the wrong pillar is why investigations stall — you cannot find a p99 in logs without aggregating them expensively, and you cannot see *why one request* was slow from a metric, because the aggregate has already discarded it. Build structured logging first, because it is cheapest and the other two are easier once every line carries a trace id.",
    checks: [
      { re: "1\\.\\s*metric", flags: "mi", label: "1 — metrics" },
      { re: "2\\.\\s*trace", flags: "mi", label: "2 — traces" },
      { re: "3\\.\\s*log", flags: "mi", label: "3 — logs" },
      { re: "4\\.\\s*metric", flags: "mi", label: "4 — metrics" },
    ],
  },
  {
    id: "materialized-view",
    title: "Decide when to materialise",
    prompt: "Write `yes` or `no` for each, with one clause of reasoning.",
    language: "text",
    given: `1. a dashboard of all-time stats, refreshed nightly
2. a user's current submission count, shown on their profile
3. "problems solved per difficulty" across 10M submissions, on a homepage`,
    starter: `1.
2.
3.
`,
    solution: `1. yes — expensive, asked often, and a day-old number is fine
2. no — a single indexed COUNT is cheap, and the number must be current
3. yes — far too expensive to compute per request, and slightly stale is acceptable
`,
    hint: "Three questions: is it expensive, is it asked often, and can the answer be slightly old? Materialise only when all three are yes.",
    explanation:
      "A materialised view trades **freshness for speed**, so it only pays when staleness is acceptable — which rules out anything a user expects to change the instant they act. Case 2 is the trap: it looks like an aggregate and is a cheap indexed count, so materialising it adds a refresh job and a window where a user submits and their count does not move. The refresh strategy is the other half of the decision: nightly is simple, on-write is fresher and more complex, and that choice belongs in the ADR beside the view itself.",
    checks: [
      { re: "1\\.\\s*yes", flags: "mi", label: "1 — yes" },
      { re: "2\\.\\s*no", flags: "mi", label: "2 — no" },
      { re: "3\\.\\s*yes", flags: "mi", label: "3 — yes" },
    ],
  },
];
