import type { Lesson } from "../types";

const IDX = "https://www.postgresql.org/docs/current/indexes-multicolumn.html";

export const lesson0015: Lesson = {
  slug: "0015-how-an-index-works",
  number: 15,
  track: "data",
  title: "How a database finds a row",
  summary:
    "Pages, heaps and B-trees: why an index makes a lookup cheap, why column order decides everything, and what every index costs.",
  minutes: 80,
  status: "ready",
  builds: "three indexes on 300,000 rows that take four queries from thousands of pages read to a few dozen",
  lab: { dir: "0015-how-an-index-works", writes: ["indexes.sql"], check: "bash check.sh" },
  reference: "data",
  warmup: [
    { lesson: "0014-idempotency", question: 0 },
    { lesson: "0013-queue-from-scratch", question: 3 },
  ],
  words: ["page (block)", "heap", "B-tree index", "leftmost prefix", "index-only scan", "selectivity"],
  answers: [
    { id: "codearena", label: "Section 6: every index in your schema, the query it serves, and I-16" },
    { id: "challenge", label: "Challenge: a partial index (optional)" },
  ],
  quiz: [
    {
      prompt: "A table has no index on `language`. What does `WHERE language = 'PYTHON'` cost?",
      options: [
        "It reads only the pages that hold the rows it is looking for",
        "It reads every page of the table, since no index can narrow it",
        "It reads the index first, then every page that the index points at",
        "It reads the newest pages only, since the rows are stored by date",
      ],
      correct: 1,
      why: "A table is a heap: rows sit in 8 kB pages in no useful order, so without an index the only way to find matches is to read every page (a sequential scan). The lab's before/after numbers show it: about 2,750 pages for every query.",
    },
    {
      prompt: "I-16: why can't the index `(userId, family)` serve `WHERE family = $1`?",
      options: [
        "Postgres uses an index only when all its columns are given",
        "A two-column index only answers queries that sort by both columns",
        "Rows are sorted by userId first, so family values are scattered",
        "The family column holds text, and text columns cannot be indexed",
      ],
      correct: 2,
      why: `A multicolumn B-tree is sorted like a phone book: by the first column, then the second within it. Without the first column there's nowhere to start, so one family's entries are spread across the whole index. Postgres's docs put it as conditions on the leading columns ([multicolumn indexes](${IDX})).`,
    },
    {
      prompt: "A query filters on equality and sorts. In which order should the composite index list its columns?",
      options: [
        "The most selective column goes first, whatever the query does next",
        "The columns in exactly the same order the table declares them",
        "The sorted column goes first, so the rows come out ordered",
        "Equality columns first, then the one you sort or range on",
      ],
      correct: 3,
      why: "Equalities pin down one contiguous slice of the index; inside that slice, the next column is already sorted, so a sort or a range on it is free. Put the sort column first and the equality rows are scattered across the whole index.",
    },
    {
      prompt: "With an index on `(user_id, created_at DESC)`, a user with 10 submissions still gets a `Sort` in their plan. Why?",
      options: [
        "Sorting ten rows costs less than walking the index in order",
        "The index is broken for small users and needs a rebuild",
        "Postgres always sorts when a query has an ORDER BY clause",
        "Bitmap scans are a planner bug that ANALYZE will then fix",
      ],
      correct: 0,
      why: "The planner estimates costs from statistics and picks the cheapest plan. For ten rows, a bitmap scan plus a tiny sort beats an ordered index walk. For your 8,000-submission user it flips. A plan is a choice per query, not a property of the index.",
    },
    {
      prompt: "Why not just index every column?",
      options: [
        "Each index locks the whole table while a query is running",
        "Every insert and update must also write to each of them",
        "Postgres has to rebuild each of them from scratch every night",
        "Postgres can only use one index per table in each query",
      ],
      correct: 1,
      why: "An index is a second copy of some columns, kept sorted. Every insert writes to the table and to every index; the lab's two indexes already weigh 14 MB beside a 22 MB table. The judge inserts a submission for every run, so each index has to earn its place.",
    },
  ],
};
