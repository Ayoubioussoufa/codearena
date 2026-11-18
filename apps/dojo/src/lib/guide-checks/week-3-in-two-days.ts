/**
 * Checks for content/supplements/week-3-in-two-days.md.
 * Decide-before-you-build questions for the two-day week 3 guide; BullMQ and NestJS claims checked against their docs on 14 Nov 2026.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const week3TwoDaysChecks: GuideCheckSet = {
  name: "Week 3 in two days",
  source: {
    label: "BullMQ: retrying failing jobs",
    href: "https://docs.bullmq.io/guide/retrying-failing-jobs",
    note: "Short, and it settles the rule the whole queue depends on: a throw fails the job, attempts turns that into a retry, and a returned verdict is a success.",
  },
  terms: [
    "Port",
    "Adapter",
    "Idempotent",
    "At-least-once delivery",
    "Claim",
    "Lease",
    "Fencing",
    "Partial index",
    "Cursor pagination",
    "Derived data",
  ],
  checks: [
    {
      id: "w3-api",
      section: "Block A · POST /submissions",
      questions: [
        {
          prompt: "Why does POST /submissions answer 202 and not 201?",
          options: [
            "The row is created, not validated",
            "The work is accepted, not finished",
            "The user is known, not trusted",
            "The queue is optional, not required",
          ],
          correct: 1,
          why: "202 Accepted means the request was taken but the processing isn't complete. The verdict arrives later, from the worker.",
        },
        {
          prompt: "The API writes the PENDING row first, then enqueues the job. What does the other order risk?",
          options: [
            "A row gets written two times",
            "A user sees two verdicts later",
            "A queue rejects the next job",
            "A worker finds no row yet",
          ],
          correct: 3,
          why: "If the job is enqueued first, a fast worker can pick it up before the row is committed, and fail on a submission that doesn't exist yet. Row-then-job leaves, at worst, a PENDING row with no job, which you can find and re-enqueue.",
        },
        {
          prompt: "Someone asks for a submission that belongs to another user. Why 404 and not 403?",
          options: [
            "A 403 confirms the id exists",
            "A 403 skips the auth guard",
            "A 404 is quicker to build",
            "A 404 is cached by browsers",
          ],
          correct: 0,
          why: "403 says \"this exists, and you may not see it\". 404 gives the same answer for \"doesn't exist\" and \"isn't yours\", so ids can't be probed.",
        },
      ],
      explain: "Answer the \"Halfway?\" question for POST /submissions in your own words: the API dies between writing the row and enqueuing the job. What state is left, and how would you repair it?",
    },
    {
      id: "w3-queue",
      section: "Block B · The queue",
      questions: [
        {
          prompt: "A submission gets WRONG_ANSWER. What should the processor do?",
          options: [
            "Save the verdict and throw",
            "Skip the save and throw",
            "Save the verdict and return",
            "Skip the save and return",
          ],
          correct: 2,
          why: "A verdict is a successful job, whatever the verdict says. Throwing tells BullMQ the job failed, and with attempts set it would be judged again.",
        },
        {
          prompt: "Why does the job carry only the submission's id, not the code?",
          options: [
            "The queue would reject long strings",
            "The worker cannot parse JSON bodies",
            "The database stays the one source",
            "The API would require Docker too",
          ],
          correct: 2,
          why: "The row is the source of truth: the worker always reads the current state, Redis doesn't hold copies of user code, and jobs stay tiny.",
        },
        {
          prompt: "Using the submission id as the job id protects against which duplicate?",
          options: [
            "The same job enqueued twice",
            "The same job stalled twice",
            "The same user posting twice",
            "The same worker started twice",
          ],
          correct: 0,
          why: "BullMQ ignores an add whose job id already exists in the queue. It does nothing about a job that is delivered again after a stall or a crash: that needs the claim.",
        },
      ],
      explain: "Explain why \"a throw means retry\" forces you to separate infrastructure errors from verdicts, with one example of each.",
    },
    {
      id: "w3-claim",
      section: "Block C · Twice, together, halfway",
      questions: [
        {
          prompt: "Two workers read PENDING, then both update to running. What fixes it?",
          options: [
            "Put a mutex inside the worker",
            "Put the read inside a retry",
            "Put a delay before the update",
            "Put the check inside the update",
          ],
          correct: 3,
          why: "One conditional UPDATE lets the database pick a single winner: the second one re-checks its WHERE after the first commits and matches nothing. An in-memory mutex doesn't exist across two processes.",
        },
        {
          prompt: "Why must saving the verdict also check who holds the claim?",
          options: [
            "A fast worker may finish early",
            "A slow worker may finish late",
            "A new worker may start early",
            "A dead worker may restart late",
          ],
          correct: 1,
          why: "After a lease expires, a second worker takes over. The first may only have been slow, and without the check it would overwrite the newer verdict. That check is fencing.",
        },
        {
          prompt: "A job is added with a backoff but no attempts option. What happens when it fails?",
          options: [
            "It is never retried again",
            "It is retried three times",
            "It is retried until done",
            "It is moved to waiting",
          ],
          correct: 0,
          why: "BullMQ's docs: without attempts, a failed job is not retried. Backoff only sets the wait between retries that attempts allows.",
        },
      ],
      explain: "Describe your claim: its condition, the lease duration and how you chose it, and what happens to a job whose claim is lost.",
    },
    {
      id: "w3-plans",
      section: "Block E · Six queries, six plans",
      questions: [
        {
          prompt: "A plan estimates 12 rows, and the node actually returns 90,000. What do you check first?",
          options: [
            "Whether the connection is slow",
            "Whether the index is unique",
            "Whether the statistics are stale",
            "Whether the table is locked",
          ],
          correct: 2,
          why: "The planner chooses from statistics. A large gap between estimated and actual rows usually means ANALYZE hasn't run since the data changed.",
        },
        {
          prompt: "Why is page 500 slow with OFFSET, even with the right index?",
          options: [
            "It sorts every page it returns",
            "It reads every row it skips",
            "It locks every row it reads",
            "It rebuilds the index it uses",
          ],
          correct: 1,
          why: "OFFSET can't jump: Postgres walks through all the skipped rows and throws them away. A cursor on (createdAt, id) starts the index scan at the right place.",
        },
        {
          prompt: "What makes a partial index on accepted submissions smaller?",
          options: [
            "It stores only the leading column",
            "It packs all the repeated values",
            "It drops all the deleted tuples",
            "It stores only the matching rows",
          ],
          correct: 3,
          why: "A partial index has a WHERE clause, and only rows that satisfy it get an entry. Fewer entries: a smaller tree, fewer pages to read.",
        },
      ],
      explain: "Pick your best before/after of the six and explain it as you would in an interview: what was slow, what you changed, the numbers, and why the fix works.",
    },
    {
      id: "w3-board",
      section: "Block F · The leaderboard",
      questions: [
        {
          prompt: "The verdict is saved, then the worker dies before updating Redis. Why is that recoverable?",
          options: [
            "The board is saved to disk hourly",
            "The board can be rebuilt from SQL",
            "The job is replayed by the queue",
            "The user can submit the code again",
          ],
          correct: 1,
          why: "The leaderboard is derived data: Postgres holds the accepted submissions, so the sorted set can always be recomputed from them.",
        },
        {
          prompt: "How does the same solve, delivered twice, count once?",
          options: [
            "Add to a list, check the length",
            "Read the old score, then write it",
            "Lock the whole key, then write it",
            "Add to a set, check the reply",
          ],
          correct: 3,
          why: "SADD returns 1 only when the member is new. Bump the score only in that case, and do both in one script so nothing can interleave.",
        },
      ],
      explain: "Explain why ranking 50,000 users is cheap in a sorted set and expensive as a GROUP BY, and what you gave up by moving it to Redis.",
    },
  ],
};
