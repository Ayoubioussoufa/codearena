import type { Lesson } from "../types";

const EXPLAIN = "https://www.postgresql.org/docs/current/using-explain.html";

export const lesson0016: Lesson = {
  slug: "0016-reading-plans",
  number: 16,
  track: "data",
  title: "Reading EXPLAIN ANALYZE",
  summary:
    "Read a query plan line by line, then rewrite three slow CodeArena queries: keyset pagination (I-10), one query instead of N+1, and counting inside the index.",
  minutes: 100,
  status: "ready",
  builds: "three rewritten queries with the same answers: 1,000 rows touched down to 20, 2,468 statements down to 1, 6,368 buffers down to about 70",
  lab: { dir: "0016-reading-plans", writes: ["page.sql", "solved.sql", "list.sql"], check: "bash check.sh" },
  reference: "data",
  warmup: [
    { lesson: "0015-how-an-index-works", question: 1 },
    { lesson: "0015-how-an-index-works", question: 3 },
  ],
  words: ["query plan", "actual rows and loops", "keyset pagination", "N+1 queries", "heap fetch", "planner statistics"],
  answers: [
    { id: "codearena", label: "Section 4: today's three queries for docs/perf, and what you expect each plan to show" },
    { id: "challenge", label: "Challenge: a stale-statistics plan (optional)" },
  ],
  quiz: [
    {
      prompt: "Inside a Nested Loop, a node shows `actual rows=313 loops=21`. How many rows did it produce?",
      options: [
        "Exactly 313 in all, because loops repeat the same rows",
        "Exactly 21 in all, just one row for every loop",
        "About 6,573 in all, because rows are averaged per loop",
        "About 334 in all, the rows and loops added together",
      ],
      correct: 2,
      why: `When a node runs several times, \`rows\` and \`time\` are averages per execution; multiply by \`loops\` for the total ([Postgres: using EXPLAIN](${EXPLAIN})). This is the most common misreading of a plan: a cheap-looking inner node can be where all the time goes.`,
    },
    {
      prompt: "Why does `OFFSET 980 LIMIT 20` get slower the deeper you page?",
      options: [
        "OFFSET disables every index, so the table is read in full",
        "It still reads the 980 earlier rows, then throws them away",
        "Postgres must sort the whole table before it can skip rows",
        "Each OFFSET opens a new transaction that has to be committed",
      ],
      correct: 1,
      why: "OFFSET has no way to jump: it produces the rows and discards them. The lab's plan shows it as `rows=1000` under a `Limit` that returns 20. Keyset pagination starts from where the last page ended, so page 50 costs the same as page 1 ([Use The Index, Luke: fetch next page](https://use-the-index-luke.com/sql/partial-results/fetch-next-page)).",
    },
    {
      prompt: "I-10: why does keyset pagination keep working when the cursor's row is deleted?",
      options: [
        "Postgres keeps deleted rows until all the cursors are closed",
        "The id sequence never reuses numbers, so order is stable",
        "Keyset queries lock the page rows until they are read",
        "The cursor carries the values, so no row must exist",
      ],
      correct: 3,
      why: "`WHERE (created_at, id) < ($ts, $id)` compares against values the client sent back; it never looks the cursor row up. A cursor that is only an id has to fetch that row to learn where to continue, and when the row is gone, the page comes back empty: that's I-10.",
    },
    {
      prompt: "What makes N+1 queries slow, even when each query is fast?",
      options: [
        "One query per row, each paying a round trip and planning",
        "It returns duplicate rows that the client must then filter out",
        "It holds a lock on every row until the loop finishes",
        "Postgres refuses to run more than a hundred queries a second",
      ],
      correct: 0,
      why: "Each query pays a network round trip, parsing and planning, however small it is. The lab ran 2,468 tiny statements in about 500 ms, without any network in between, against one query in about 100. Prisma's docs describe the problem and its fixes: `include`, `in` filters, or one raw query ([query optimization](https://www.prisma.io/docs/orm/prisma-client/queries/query-optimization-performance)).",
    },
    {
      prompt: "`count(*)` over a `LEFT JOIN`: what does it give for a problem nobody has tried?",
      options: [
        "Zero, because count ignores the rows that the join had invented",
        "Null, because nothing at all was ever counted for that problem",
        "One, because the LEFT JOIN adds a row filled with nulls",
        "An error, because count needs at least one real row there",
      ],
      correct: 2,
      why: "`count(*)` counts rows, and a LEFT JOIN keeps an unmatched problem as one row with nulls on the submissions side. `count(s.problem_id)` counts non-null values, so it gives 0 ([aggregate functions](https://www.postgresql.org/docs/current/functions-aggregate.html)). The lab's fast-but-wrong version falls into exactly this.",
    },
  ],
};
