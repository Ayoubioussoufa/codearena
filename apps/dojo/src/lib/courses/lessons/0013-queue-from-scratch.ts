import type { Lesson } from "../types";

const LMOVE = "https://redis.io/docs/latest/commands/lmove/";

export const lesson0013: Lesson = {
  slug: "0013-queue-from-scratch",
  number: 13,
  track: "backend",
  title: "A job queue from scratch",
  summary:
    "Build a reliable queue on Redis lists, find every hole in it, then see what BullMQ adds. Ends with POST /submissions → 202.",
  minutes: 100,
  status: "ready",
  builds: "`queue.mjs`, a reliable job queue on Redis, with recovery, retries and a dead-letter list",
  lab: { dir: "0013-queue-from-scratch", writes: ["queue.mjs"], check: "bash check.sh" },
  reference: "queues",
  warmup: [
    { lesson: "0012-request-pipeline", question: 0 },
    { lesson: "0009-facts-to-verdicts", question: 2 },
  ],
  words: ["job queue", "producer and consumer", "processing list", "at-least-once delivery", "dead-letter queue", "202 Accepted"],
  answers: [
    { id: "codearena", label: "Section 5: your two decisions for POST /submissions" },
    { id: "challenge", label: "Challenge: a visibility timeout (optional)" },
  ],
  quiz: [
    {
      prompt: "Why does `POST /submissions` answer 202 instead of judging inside the request?",
      options: [
        "Browsers parse a 202 response faster than they parse 201",
        "Judging in the request would need the worker's database access",
        "Accepted, not done: judging takes seconds, too long to hold",
        "HTTP forbids any response that takes longer than one second",
      ],
      correct: 2,
      why: "Judging is slow (containers, several tests) and must run where Docker is, not in the API. `202 Accepted` says \"I have it, not done yet\" ([MDN: 202](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202)); the client then reads the result from `GET /submissions/:id`. A 201 would promise a finished resource.",
    },
    {
      prompt: "Why put only the submission's id in the job, never the code?",
      options: [
        "The database row is the truth; a queue isn't storage",
        "Redis can only store numbers, so code would be refused",
        "The worker can't read JSON, only plain numeric job ids",
        "Queued code would start running before the sandbox was ready",
      ],
      correct: 0,
      why: "The submission row is authoritative: the worker reads the code, the problem and the tests from it, and writes the verdict back. A queue holds pointers to work. 50 KB of code per job would sit in Redis's memory, and could disagree with the row.",
    },
    {
      prompt: "The API writes the PENDING row first, then enqueues. What goes wrong if you swap the two?",
      options: [
        "Or the queue would reject the job, since ids must already exist",
        "Or the worker could get a job whose row isn't there yet",
        "Or Prisma would lock the table until the job has been judged",
        "Or the 202 response would be sent before the row is visible",
      ],
      correct: 1,
      why: "A fast worker can take the job before the API's insert commits, look for the row, and find nothing. It fails only under load, which makes it the worst kind of bug. Row first, then the job (and if enqueueing fails, the row stays PENDING for a sweeper to retry: that's the idea behind the outbox pattern).",
    },
    {
      prompt: "Plain `RPOP` against `LMOVE` into a processing list: what does the processing list buy you?",
      options: [
        "Two workers can then share one job and judge it together",
        "Redis keeps a full history of every job for later audits",
        "Jobs get sorted by their priority instead of by arrival time",
        "A crashed worker's job stays visible, so it can run again",
      ],
      correct: 3,
      why: `With \`RPOP\`, a job lives only in the worker's memory once taken: a crash loses it. \`LMOVE\` takes it and parks it in a processing list in one atomic step, and \`LREM\` removes it when done; anything left there after a crash can be put back. Redis documents this as the reliable queue pattern ([LMOVE](${LMOVE})).`,
    },
    {
      prompt: "A worker judges a submission, then crashes before `ack`. `recover()` redelivers the job. What does that mean for the judge?",
      options: [
        "Delivery is exactly once, since Redis has moved the job atomically",
        "The job is lost for good, because recover only moves ids",
        "Delivery is at least once, so judging twice must be harmless",
        "Nothing changes at all: the same code can't be judged twice",
      ],
      correct: 2,
      why: "Any queue that survives crashes can deliver a job twice: the crash can happen after the work and before the acknowledgment. You can't prevent the second delivery; you make it harmless. That's lesson 14: idempotency.",
    },
  ],
};
