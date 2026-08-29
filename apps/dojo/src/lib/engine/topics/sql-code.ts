/**
 * SQL & Prisma — code-writing exercises (structure-checked). Imported by sql.ts.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";

const DOC = { slug: "phase-1-auth-data-frontend", label: "Phase 1 §A — Databases, indexes & queries" };

const writeIndex: Generator = {
  id: "sql-code-index",
  title: "✍️ Write the composite index",
  generate: (rng) => {
    const v = rng.pick([
      { table: "submissions", eq: "user_id", ord: "created_at" },
      { table: "submissions", eq: "problem_id", ord: "score" },
      { table: "solves", eq: "contest_id", ord: "solved_at" },
    ] as const);
    return codeTask({
      genId: "sql-code-index",
      prompt: `Write the CREATE INDEX statement that best serves:\n\`SELECT * FROM ${v.table} WHERE ${v.eq} = $1 ORDER BY ${v.ord} DESC LIMIT 20;\``,
      language: "sql",
      starter: `-- your index`,
      solution: `CREATE INDEX idx_${v.table}_${v.eq}_${v.ord}\n  ON ${v.table} (${v.eq}, ${v.ord} DESC);`,
      checks: [
        { re: "CREATE\\s+INDEX", flags: "im", label: "is a CREATE INDEX statement" },
        { re: `ON\\s+${v.table}`, flags: "im", label: `targets the ${v.table} table` },
        { re: `\\(\\s*${v.eq}\\s*,\\s*${v.ord}`, flags: "im", label: `columns in the right order: (${v.eq}, ${v.ord})` },
        { re: `\\(\\s*${v.ord}\\b`, flags: "im", expect: false, label: `NOT (${v.ord}, ${v.eq}) — equality column must lead` },
      ],
      explanation: `An index (a "B-tree") sorts by its first column, then by the second *within* each group — like a phone book by last name, then first. Leading with the equality column (\`${v.eq}\`) lets the database jump straight to the matching group and read rows already ordered by \`${v.ord}\` — 20 index entries, no separate sort. Reversed, your target rows are scattered across the whole tree. Rule: **equality column first, then the range/ORDER BY column.**`,
      docRef: DOC,
    });
  },
};

const cursorQuery: Generator = {
  id: "sql-code-cursor",
  title: "✍️ Write keyset pagination",
  generate: () =>
    codeTask({
      genId: "sql-code-cursor",
      prompt:
        "Write the next-page query for a newest-first submissions feed using KEYSET (cursor) pagination. `$1` is the `created_at` of the last row the user saw; page size 20. No OFFSET.",
      language: "sql",
      starter: `SELECT * FROM submissions\n-- finish the query`,
      solution: `SELECT * FROM submissions\nWHERE created_at < $1\nORDER BY created_at DESC\nLIMIT 20;`,
      checks: [
        { re: "WHERE\\s+created_at\\s*<", flags: "im", label: "seeks past the cursor: `WHERE created_at < $1`" },
        { re: "ORDER\\s+BY\\s+created_at\\s+DESC", flags: "im", label: "orders newest-first" },
        { re: "LIMIT\\s+20", flags: "im", label: "caps the page at 20" },
        { re: "OFFSET", flags: "im", expect: false, label: "no OFFSET anywhere" },
      ],
      explanation:
        "'Keyset' (cursor) pagination means the WHERE clause points at a VALUE — 'strictly older than the last row I saw' — so with an index on `created_at` the database jumps to exactly where the previous page ended: page 1 and page 10,000 both cost ~20 index reads. `OFFSET` points at a POSITION instead: it walks past and discards every skipped row (slower the deeper you go) and shifts under concurrent inserts, causing duplicate or missed rows. Production tie-breaker: order by `(created_at, id)` and compare the pair, so rows with equal timestamps can't straddle a page boundary.",
      docRef: DOC,
    }),
};

const prismaModel: Generator = {
  id: "sql-code-prisma-model",
  title: "✍️ Write a Prisma model",
  generate: () =>
    codeTask({
      genId: "sql-code-prisma-model",
      prompt:
        "Write the Prisma model `Submission`: autoincrement Int `id` (primary key), String `verdict`, Int `userId`, a `user` relation to `User` via `userId`, and an index on `userId` for fast per-user queries.",
      language: "prisma",
      starter: `model Submission {\n  // fields, relation, index\n}`,
      solution: `model Submission {\n  id      Int    @id @default(autoincrement())\n  verdict String\n  userId  Int\n  user    User   @relation(fields: [userId], references: [id])\n\n  @@index([userId])\n}`,
      checks: [
        { re: "model\\s+Submission", label: "declares `model Submission`" },
        { re: "@id", label: "has a primary key (`@id`)" },
        { re: "@default\\(autoincrement\\(\\)\\)", label: "id autoincrements" },
        { re: "@relation\\(", label: "declares the relation" },
        { re: "fields:\\s*\\[userId\\]", label: "relation joins on `fields: [userId]`" },
        { re: "references:\\s*\\[id\\]", label: "…referencing `User.id`" },
        { re: "@@index\\(\\[userId\\]\\)", label: "adds `@@index([userId])`" },
      ],
      explanation:
        "A **foreign key** (a column pointing at another table's row) is TWO declarations in Prisma: the actual database column (`userId Int`), and the convenience relation field (`user User @relation(…)`) that only exists in the client API. `fields`/`references` wires them together. The `@@index([userId])` line is the part people forget: Prisma auto-indexes primary keys and `@unique` columns, but a plain foreign key gets **no index by default** — so every `WHERE userId = ?` (your profile page) reads the whole table until you add it.",
      docRef: DOC,
    }),
};

const prismaInclude: Generator = {
  id: "sql-code-prisma-nplus1",
  title: "✍️ Kill an N+1 with include",
  generate: () =>
    codeTask({
      genId: "sql-code-prisma-nplus1",
      prompt:
        "This code fires 1 + N queries. Rewrite it as a SINGLE Prisma call that loads every problem WITH its tags — no loop.\n\n```\nconst problems = await prisma.problem.findMany();\nfor (const p of problems) {\n  p.tags = await prisma.tag.findMany({ where: { problemId: p.id } });\n}\n```",
      language: "typescript",
      starter: `const problems = await prisma.problem.findMany(\n  // load tags in the same call\n);`,
      solution: `const problems = await prisma.problem.findMany({\n  include: { tags: true },\n});`,
      checks: [
        { re: "findMany\\(", label: "one `findMany` call" },
        { re: "include\\s*:", label: "uses `include`" },
        { re: "tags\\s*:\\s*true", label: "pulls the `tags` relation" },
        { re: "for\\s*\\(|forEach|\\.map\\(\\s*async", expect: false, label: "no per-row loop of queries" },
      ],
      explanation:
        "`include` pulls the relation into the same fetch: Prisma runs the parent query plus ONE batched query for all the tags (`WHERE problemId IN (…)`) and stitches them together — 2 round-trips total instead of 1 + N (the **N+1 problem**). The loop version feels fine on 5 dev rows and melts at 50 real ones, because the delay multiplies per row. Habit to build: **a `prisma.*` call inside a loop is a warning sign every single time** — reach for `include`, a relation `select`, or one `IN` query.",
      docRef: DOC,
    }),
};

const prismaTx: Generator = {
  id: "sql-code-prisma-tx",
  title: "✍️ Atomic rating swap in a transaction",
  generate: () =>
    codeTask({
      genId: "sql-code-prisma-tx",
      prompt:
        "After a ranked duel, the winner gains 16 rating and the loser drops 16 — and a crash between the two writes must be impossible to observe. Wrap the two updates so they commit atomically (all-or-nothing) using Prisma's transaction API.",
      language: "typescript",
      starter: `// winnerId, loserId are in scope\n`,
      solution: `await prisma.$transaction([\n  prisma.user.update({\n    where: { id: winnerId },\n    data: { rating: { increment: 16 } },\n  }),\n  prisma.user.update({\n    where: { id: loserId },\n    data: { rating: { decrement: 16 } },\n  }),\n]);`,
      checks: [
        { re: "\\$transaction", label: "wraps both writes in `$transaction`" },
        { re: "update\\([\\s\\S]*update\\(", label: "contains BOTH updates" },
        { re: "increment|decrement", label: "uses atomic increment/decrement" },
      ],
      explanation:
        "`$transaction` gives you the **A in ACID (Atomicity)**: both updates commit together or neither does — a crash in between rolls the first one back, so rating points can never leak. The `{ increment: 16 }` form matters too: it becomes `SET rating = rating + 16` *inside* the database, which dodges the read-modify-write race where two duels finishing at once both read 1500 and both overwrite with their own total (a lost update). Reading-then-writing in JS would need row locking to be safe; the atomic increment sidesteps the whole problem.",
      docRef: DOC,
    }),
};

export const sqlCodeGens: Generator[] = [writeIndex, cursorQuery, prismaModel, prismaInclude, prismaTx];
