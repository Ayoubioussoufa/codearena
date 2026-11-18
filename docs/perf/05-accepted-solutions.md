# Query 5 · A problem's latest accepted solutions, and acceptance rates

**The page:** a problem's "recent accepted solutions" panel, and the acceptance rate on the problems list.

**5a, the latest accepted:**

```sql
SELECT id, "userId", "runtimeMs" FROM "Submission"
WHERE "problemId" = 100001 AND verdict = 'ACCEPTED'
ORDER BY "createdAt" DESC
LIMIT 20;
```

**Prediction:** `(problemId, verdict)` finds the rows, but not in `createdAt` order, so Postgres will read all of them and sort, for 20 rows.

**Before:** `Bitmap Heap Scan` over all **23,817** accepted rows of the hot problem, then a top-N sort: 11,064 buffers, **13.1 ms**.

**The change:** a partial index on `(problemId, createdAt DESC) WHERE verdict = 'ACCEPTED'`.

**After:** `Index Scan using "Submission_accepted_recent_idx"`, which stops after 20 rows, with no sort: 23 buffers, **0.036 ms**.

**Smaller, measured:** the partial index is **9.0 MB**. The same index without the `WHERE` is **30 MB**. Only 30 % of the rows are accepted, so the partial index is about a third of the size, and more of it fits in memory.

**5b, acceptance rates, with `$queryRaw`.** Prisma's `groupBy` can count rows, but not "count the accepted ones and divide" in one pass. SQL's `FILTER` can:

```ts
const rates = await prisma.$queryRaw<{ problemId: number; rate: number }[]>`
  SELECT "problemId",
         count(*) FILTER (WHERE verdict = 'ACCEPTED')::float / count(*) AS rate
  FROM "Submission"
  WHERE "problemId" = ANY(${ids})
  GROUP BY "problemId"
`;
```

Only the tagged-template form is safe: `${ids}` becomes a bind parameter, never text in the SQL.

It's an `Index Only Scan` on the existing `(problemId, verdict)` index, `Heap Fetches: 0`, **18 ms** for 20 problems, before and after: there was no index to add. It reads 215,024 entries, because the hot problems are huge. If that ever matters, the answer is the same as query 4: keep a counter, updated when a verdict is written.

**Why:** a partial index stores only the rows a query can ask about. Here that makes it a third of the size and turns "read 23,817 rows and sort" into "read 20".

**One note on the `VACUUM`:** before the seed ended with `VACUUM ANALYZE`, 5b's index-only scan made 215,201 heap fetches and took 110 ms, because the visibility map was empty after the bulk insert.
