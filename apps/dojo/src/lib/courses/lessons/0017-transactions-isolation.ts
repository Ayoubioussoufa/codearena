import type { Lesson } from "../types";

const ISO = "https://www.postgresql.org/docs/current/transaction-iso.html";

export const lesson0017: Lesson = {
  slug: "0017-transactions-isolation",
  number: 17,
  track: "data",
  title: "Transactions and isolation, in two terminals",
  summary:
    "Reproduce a lost update, a non-repeatable read and write skew by hand, then make \"first Accepted counts once\" correct two ways: at READ COMMITTED, and at SERIALIZABLE with retries.",
  minutes: 100,
  status: "ready",
  builds: "a race you can see in two terminals, and three fixes that hold with 30 sessions at once",
  lab: { dir: "0017-transactions-isolation", writes: ["increment.sql", "first-solve.sql", "serializable.sql", "migration.sql"], check: "bash check.sh" },
  reference: "data",
  warmup: [
    { lesson: "0014-idempotency", question: 0 },
    { lesson: "0016-reading-plans", question: 4 },
  ],
  words: ["transaction", "isolation level", "snapshot", "lost update", "write skew", "serialization failure"],
  answers: [
    { id: "codearena", label: "Section 5: the write path's statements, its race, and the mechanism you chose" },
    { id: "challenge", label: "Challenge: SELECT … FOR UPDATE and a deadlock (optional)" },
  ],
  quiz: [
    {
      prompt: "Postgres's default level is READ COMMITTED. What does each statement see?",
      options: [
        "The transaction sees one snapshot, taken when it starts",
        "Each statement sees what was committed before it started",
        "Transactions run one after another, as if never concurrent",
        "Statements can see changes that others have not committed",
      ],
      correct: 1,
      why: `Each statement takes a fresh snapshot, so two SELECTs in one transaction can disagree: a non-repeatable read. REPEATABLE READ takes one snapshot for the whole transaction. Postgres never shows uncommitted data, even at READ UNCOMMITTED ([transaction isolation](${ISO})).`,
    },
    {
      prompt: "The lab's starter increment ran 30 times at once and ended at n = 4. What happened?",
      options: [
        "Postgres drops the updates that land in the same millisecond",
        "The sleep made the sessions time out before they committed",
        "Thirty sessions are too many connections for Postgres to allow",
        "Each session wrote a value computed from a stale read",
      ],
      correct: 3,
      why: "That's the lost update. Each session read n, computed n + 1 in the client, and wrote it back. Twenty-six of them wrote a value computed from a read that was already out of date, overwriting someone else's increment.",
    },
    {
      prompt: "Why is `UPDATE counters SET n = n + 1` safe, even at READ COMMITTED?",
      options: [
        "Arithmetic in SQL runs faster than the sleep in the starter",
        "Postgres retries a failed UPDATE again and again until it succeeds",
        "It waits for the row lock, then rereads the newest value",
        "On its own, a statement always runs at the SERIALIZABLE level",
      ],
      correct: 2,
      why: "The read and the write are one statement. A second UPDATE on the same row waits for the first to commit, then re-evaluates against the newest version of the row, so it adds 1 to the new value. It's the same mechanism that made lesson 14's claim safe.",
    },
    {
      prompt: "Two admins each check \"are there at least 2 admins?\", see 2, and demote themselves, at REPEATABLE READ. Both commit; zero admins remain. What is this?",
      options: [
        "Write skew: each one acted on a premise the other broke",
        "A lost update: the second commit overwrote the first one's change",
        "A dirty read: each one saw the other one's uncommitted change",
        "A phantom: a new admin row appeared between the two reads",
      ],
      correct: 0,
      why: "They updated different rows, so nothing conflicted at the row level, and each snapshot honestly showed two admins. Only SERIALIZABLE detects this: one commit fails with a serialization failure, as you'll see in your two terminals. Kleppmann's DDIA calls it write skew.",
    },
    {
      prompt: "You run the write path at SERIALIZABLE. What must your code do?",
      options: [
        "Lock every table it reads, so that failures can't happen",
        "Retry the whole transaction when it fails with code 40001",
        "Nothing: Postgres will retry the failed transaction on its own",
        "Avoid UPDATE statements, since only those can ever fail here",
      ],
      correct: 1,
      why: "SERIALIZABLE turns races into errors (SQLSTATE 40001) instead of wrong data. The manual is explicit: applications must be prepared to retry ([serialization failure handling](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)). In CodeArena's Prisma 7.8 with the pg adapter, 40001 and deadlocks arrive as error code P2034.",
    },
  ],
};
