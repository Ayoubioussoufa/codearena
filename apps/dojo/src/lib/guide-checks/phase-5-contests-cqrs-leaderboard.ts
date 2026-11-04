/**
 * Checks for ../../docs/phase-5-contests-cqrs-leaderboard.md.
 * Checked 3 Nov 2026: ZREVRANGE deprecation (redis.io); score packing and the 2^53 limit re-derived; Redis pub/sub semantics as verified for lesson 20.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const phase5Checks: GuideCheckSet = {
  name: "Phase 5 guide",
  source: {
    label: "Redis docs: sorted sets",
    href: "https://redis.io/docs/latest/develop/data-types/sorted-sets/",
    note: "The leaderboard's data structure, from the people who built it: commands, complexities, and the leaderboard example. Lesson 18 builds one in a lab.",
  },
  terms: [
    "State machine",
    "CQRS",
    "Event",
    "Projection",
    "Eventual consistency",
    "Sorted set",
    "Score packing",
    "Delta protocol",
    "Frozen scoreboard",
    "Batch rating update",
  ],
  checks: [
    {
      id: "states",
      section: "Part A · State machines",
      questions: [
        {
          prompt: "Why model a contest's lifecycle as one state field instead of several booleans?",
          options: [
            "Booleans take more space in each row",
            "Booleans allow states that make no sense",
            "A state field makes every transition faster",
            "Booleans can't be indexed by the database",
          ],
          correct: 1,
          why: "`isStarted = false, isFrozen = true` is nonsense, but booleans allow it and someday a bug sets it. One field with one legal value at a time, and checked transitions, makes impossible states unrepresentable.",
        },
        {
          prompt: "The LEGAL table lets `running` go only to `frozen`. What happens to a short contest with no freeze?",
          options: [
            "It ends normally, since ended is a valid state",
            "It skips straight to rated when time is up",
            "It stays frozen forever once the time is up",
            "It can never end: running to ended always throws",
          ],
          correct: 3,
          why: "Anything you forget to list, you have forbidden. Walk every real path before shipping: add `running: [\"frozen\", \"ended\"]`, and likely a `cancelled` state. Failing loudly on a forgotten path is still far better than silently allowing nonsense.",
        },
      ],
      explain: "Draw CodeArena's contest state machine, including the paths the guide's first table forgot.",
    },
    {
      id: "cqrs",
      section: "Parts B–D · CQRS, projections, eventual consistency",
      questions: [
        {
          prompt: "Why does `RANK() OVER (ORDER BY score DESC)` on every request fail at scale?",
          options: [
            "Each read sorts the whole score table again",
            "RANK() can't handle more than ten thousand rows",
            "Window functions lock the table for every write",
            "Postgres caches only the first ranking it computes",
          ],
          correct: 0,
          why: "A thousand concurrent readers each trigger a full sort, and the database melts. CQRS gives reads their own model: a projection (a Redis sorted set) that's always sorted, fed by events from the write side.",
        },
        {
          prompt: "Redis dies in the middle of a contest. How do you recover the leaderboard?",
          options: [
            "Restore last week's Redis backup and wait",
            "Ask every participant to resubmit their code",
            "Replay all the judged submissions from Postgres",
            "Read the scores back from users' browsers",
          ],
          correct: 2,
          why: "The sorted set is a projection: derived data, rebuildable from the source of truth. Re-`ZADD` everyone from Postgres; you lose a moment of availability, not real state. RDB and AOF persistence help, but the rebuild is the real plan.",
        },
        {
          prompt: "A user says \"I solved C, but the leaderboard didn't move.\" Which is not one of the usual causes?",
          options: [
            "Normal lag while the projection catches up",
            "The projector is behind, or it crashed",
            "The sorted set has lost its ordering",
            "The verdict isn't actually judged just yet",
          ],
          correct: 2,
          why: "A sorted set is always sorted; that's the point. The usual causes are convergence lag, a lagging or crashed projector, or a write side that hasn't recorded the verdict. Say it honestly in the UI: \"accepted, updating leaderboard…\".",
        },
      ],
      explain: "Explain eventual consistency for CodeArena's leaderboard: what the user may see, why it's acceptable, and which side always wins a disagreement.",
    },
    {
      id: "zsets",
      section: "Part E · Redis sorted sets",
      questions: [
        {
          prompt: "Why pack points and time as `points × 1e6 + (999999 − seconds)`?",
          options: [
            "More points always win, and earlier breaks ties",
            "Redis requires every score to have six digits",
            "Packing makes the sorted set use less memory",
            "It hides each player's exact time from others",
          ],
          correct: 0,
          why: "Multiplying points by 1e6 puts them above every possible time value, so a point difference always beats a time difference; subtracting the time inverts it, so an earlier solve gives a bigger score.",
        },
        {
          prompt: "You switch to millisecond slots: `points × 1e12`. What goes wrong?",
          options: [
            "Redis rejects any score above one billion",
            "The contest must last under a second",
            "The ranks are returned in reversed order",
            "Scores pass 2^53, so ties quietly collapse",
          ],
          correct: 3,
          why: "Sorted-set scores are IEEE-754 doubles, exact only up to 2⁵³ ≈ 9 × 10¹⁵. Around 10¹⁶, consecutive integers merge: 1,000 millisecond values map to about 501 distinct doubles, with no error. Check the maximum packed value first.",
        },
      ],
      explain: "Compare Redis pub/sub and streams, and say which one fits \"push a leaderboard delta to connected gateways\".",
    },
    {
      id: "realtime",
      section: "Parts F–G · Real-time scale and the freeze",
      questions: [
        {
          prompt: "Why send leaderboard deltas instead of the whole board?",
          options: [
            "Clients can render only fifty rows at once",
            "Only the changes travel, so bandwidth stays small",
            "Deltas are encrypted, while full boards are not",
            "WebSockets limit each message to a single kilobyte",
          ],
          correct: 1,
          why: "A 5,000-row board, thousands of updates and thousands of viewers multiply into a bandwidth catastrophe. The client keeps its copy and applies only the changes, like a stock ticker.",
        },
        {
          prompt: "Why build a separate public projection for the frozen scoreboard?",
          options: [
            "Hidden scores must never reach the browser",
            "Clients can't filter rows by submission time",
            "Redis can't store two scores per player",
            "The rating job reads only frozen copies",
          ],
          correct: 0,
          why: "Client-side filtering would put the true scores in the browser, one dev-tools peek away. The true projection keeps updating for rating; the public one ignores submissions after the cutoff, and an atomic swap unfreezes it.",
        },
        {
          prompt: "Why compute contest ratings in one batch when the contest ends?",
          options: [
            "One batch runs faster than many small updates",
            "Ratings can't be computed before results are public",
            "Everyone is rated against the same final field",
            "Postgres can't update many rows in a transaction",
          ],
          correct: 2,
          why: "Online updates mid-contest would make your rating depend on processing order and feed changing ratings back into the same contest's expected scores. A batch, in one transaction, is fair and mathematically sound.",
        },
      ],
      explain: "A submission is sent 2 seconds before the deadline and judged after it. Does it count? Defend your rule, and say which clock decides.",
    },
  ],
};
