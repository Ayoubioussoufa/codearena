import type { Lesson } from "../types";

const ZSET = "https://redis.io/docs/latest/develop/data-types/sorted-sets/";

export const lesson0018: Lesson = {
  slug: "0018-leaderboard",
  number: 18,
  track: "data",
  title: "A leaderboard with Redis sorted sets",
  summary:
    "How a sorted set ranks thousands of users in O(log N), how to break ties fairly with a composite score, and how the worker keeps it right with one atomic script.",
  minutes: 90,
  status: "ready",
  builds: "`leaderboard.mjs`: idempotent solves in one Lua script, fair ties, O(log N) ranks, and a rebuild from the source of truth",
  lab: { dir: "0018-leaderboard", writes: ["leaderboard.mjs"], check: "bash check.sh" },
  reference: "data",
  warmup: [
    { lesson: "0017-transactions-isolation", question: 4 },
    { lesson: "0013-queue-from-scratch", question: 4 },
  ],
  words: ["sorted set", "skip list", "composite score", "Lua script (EVAL)", "derived data", "rebuild"],
  answers: [
    { id: "codearena", label: "Section 6: your score, your tie-break, and where the update runs" },
    { id: "challenge", label: "Challenge: the users around me (optional)" },
  ],
  quiz: [
    {
      prompt: "What makes a sorted set the right structure for a leaderboard?",
      options: [
        "Redis stores sorted sets on disk, so the board survives any restart",
        "Sorted sets store numbers only, so they take less room than hashes",
        "Adding and ranking are both O(log N), on a set kept sorted",
        "A sorted set can be read by many clients without any locking",
      ],
      correct: 2,
      why: `A sorted set is a skip list plus a hash table, so adding a member, changing its score and asking its rank are all O(log N), and the set is always in order ([Redis: sorted sets](${ZSET})). A Postgres \`ORDER BY score\` with \`OFFSET\` gets slower as the board grows; this doesn't.`,
    },
    {
      prompt: "Two members of a sorted set have the same score. In what order does Redis return them?",
      options: [
        "By member name, in lexicographic order, not by who was first",
        "By insertion time, so whoever was added earlier comes out first",
        "Randomly, so the order of tied users can change between calls",
        "By member length, with the shorter names coming out in front",
      ],
      correct: 0,
      why: "Ties are ordered lexicographically by member (reversed with `REV`). Stable, but unfair: \"zack\" beats \"amy\" for no reason. To break ties by time, fold the time into the score itself: a composite score.",
    },
    {
      prompt: "Why must \"add the solve to the set, then add the points\" run as one Lua script?",
      options: [
        "Redis refuses two commands in a row from the same connection",
        "Two round trips are slower than one, so the board lags",
        "ZINCRBY cannot run unless a script has opened the sorted set",
        "A crash between them loses points that a retry then skips",
      ],
      correct: 3,
      why: "If the worker dies after `SADD` and before the points, the retry sees the solve already recorded and skips it: the points are gone for good. Redis runs a script atomically, with nothing interleaved ([scripting with Lua](https://redis.io/docs/latest/develop/programmability/eval-intro/)). It's lesson 14 again: check and write in one step.",
    },
    {
      prompt: "Why does the worker update Redis only after the verdict's transaction commits?",
      options: [
        "Or Redis would reject the update, since the row is still locked",
        "Or BullMQ would deliver the job again, and count it twice over",
        "Or a verdict rolled back later leaves its points on the board",
        "Or the user would see the verdict after their new rank appears",
      ],
      correct: 2,
      why: "Redis and Postgres don't share a transaction. Update Redis first, and a rollback in Postgres leaves points nobody earned. Update it after, and the worst case is a missing update, which the idempotent retry or a rebuild repairs.",
    },
    {
      prompt: "Redis lost its data. How do you get the leaderboard back?",
      options: [
        "Restore it from last night's Redis backup, if any",
        "Recompute it from the old BullMQ jobs still queued",
        "Rebuild it from Postgres, which still holds every solve",
        "Ask every user to resubmit their accepted solutions again",
      ],
      correct: 2,
      why: "The board is derived data: a fast view of facts that live in Postgres. As long as you can rebuild it from the source of truth, losing it costs minutes, not data. That's why the lab makes you write `rebuild`, and why it builds aside and swaps in.",
    },
  ],
};
