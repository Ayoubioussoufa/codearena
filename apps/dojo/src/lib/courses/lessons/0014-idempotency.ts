import type { Lesson } from "../types";

const ISO = "https://www.postgresql.org/docs/current/transaction-iso.html";

export const lesson0014: Lesson = {
  slug: "0014-idempotency",
  number: 14,
  track: "backend",
  title: "At-least-once, and making it harmless",
  summary:
    "A duplicate delivery judges once: one statement that checks and writes at once, a claim that expires, fencing, retries and a dead-letter state.",
  minutes: 90,
  status: "ready",
  builds: "three SQL statements that stay correct with 20 workers racing: a claim, a fenced finish, and the I-6 rotation fix",
  lab: { dir: "0014-idempotency", writes: ["claim.sql", "finish.sql", "rotate.sql"], check: "bash check.sh" },
  reference: "queues",
  warmup: [
    { lesson: "0013-queue-from-scratch", question: 4 },
    { lesson: "0013-queue-from-scratch", question: 2 },
  ],
  words: ["idempotent", "compare-and-set (a conditional update)", "lease", "fencing", "retry with backoff", "a terminal state"],
  answers: [
    { id: "codearena", label: "Section 5: the claim, the retries, and the user's view after the last retry" },
    { id: "challenge", label: "Challenge: a fencing token (optional)" },
  ],
  quiz: [
    {
      prompt: "Why is `UPDATE submissions SET status='RUNNING' … WHERE id = $1 AND status = 'PENDING' RETURNING id` safe with 20 workers running it at once?",
      options: [
        "Postgres runs every UPDATE alone, so two of them never overlap",
        "RETURNING retries the whole statement until just one row is updated",
        "The primary key stops two workers from writing the same row",
        "The loser waits for the lock, rechecks WHERE, and finds RUNNING",
      ],
      correct: 3,
      why: `The first UPDATE locks the row. The others wait; when it commits, each re-evaluates its WHERE clause against the new version of the row, which is no longer PENDING, so it updates nothing and returns no row ([Postgres: Read Committed](${ISO})). One statement both checks and writes, and tells you whether you won.`,
    },
    {
      prompt: "Why does the claim need an expiry, a lease?",
      options: [
        "Postgres deletes rows whose claims are older than a minute",
        "A worker that dies mid-run would keep its claim forever",
        "Leases make the judging faster, since workers must hurry up",
        "Without one, two workers could hold the same claim together",
      ],
      correct: 1,
      why: "A claim says \"I'm working on this\". If that worker crashes, nobody else may touch the submission, forever. A lease (the claim's time plus a duration) lets another worker take over once it has clearly expired. BullMQ's lock and its renewal are the same idea.",
    },
    {
      prompt: "A worker's lease expired, and another worker took the submission over. Why must `finish` check who holds the claim?",
      options: [
        "Or Postgres would reject the update, since the row is locked",
        "Or the submission would go back to PENDING and run again",
        "Or a worker whose claim expired could overwrite the new verdict",
        "Or the queue would deliver the job a third time somewhere",
      ],
      correct: 2,
      why: "The slow worker may still be alive, just late. Without the check it would finish after the new owner and overwrite a newer verdict. Making every write conditional on still owning the claim is called fencing (Martin Kleppmann's article on distributed locks explains it with a stronger version, a fencing token).",
    },
    {
      prompt: "Which failures should the worker retry?",
      options: [
        "Only failures of yours, like Docker or Postgres being down",
        "Every failure, including a wrong answer, up to three times",
        "Only time limits, in case the whole machine was busy",
        "None, because a retry always judges the same submission twice",
      ],
      correct: 0,
      why: "A verdict (WA, TLE, RE…) is a successful job: the submission was judged. Retrying it would just judge it again. Your own failures are transient and deserve retries, with exponential backoff so a struggling database isn't hammered.",
    },
    {
      prompt: "A submission's job failed on every retry. What should happen to it?",
      options: [
        "It stays PENDING, so the next deploy can pick it up again",
        "It becomes a Wrong Answer, as nothing ever proved the code right",
        "A final state the user sees, and the job in dead letters",
        "It is deleted with its row, so it stops blocking the queue",
      ],
      correct: 2,
      why: "A submission stuck in PENDING forever is the worst user experience: a spinner that never ends. Give it a terminal state (for example `INTERNAL_ERROR`, with a \"try again\" message), keep the job in the dead-letter queue for investigation, and alert on it.",
    },
  ],
};
