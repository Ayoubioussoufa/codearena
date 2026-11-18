# Query 1 · The problems list

**The page:** `/problems`. The web walks every page of `GET /problems?limit=100` and filters in the browser.

**The SQL Prisma sent** (with `cursor: { id }, skip: 1`, simplified):

```sql
SELECT … FROM "Problem"
WHERE difficulty = 'MEDIUM'
  AND id >= (SELECT id FROM "Problem" WHERE id = 100500)
ORDER BY id
LIMIT 21;
```

**Prediction:** fast, through the primary key, since the table holds only 2,336 rows. If there's a problem, it isn't speed.

**Before:** `Index Scan using "Problem_pkey"`, `Rows Removed by Filter: 42`, 7 buffers, **0.055 ms**. Fast, as predicted. An index on `(difficulty, id)` didn't change the plan: on a table this small, the planner prefers to filter the primary key.

So the problems are elsewhere:

- **I-10, correctness.** The subquery looks the cursor's row up. If that row was deleted, it returns `NULL`, `id >= NULL` is never true, and the page comes back empty. The client concludes that the list has ended.
- **I-11, an extra request.** The service set `nextCursor` whenever a page was full, so a last page that happened to be full sent the client back for an empty one.
- **I-15, size.** The list page shows six fields, and the query returned the statement, the constraints, the starter code and every example: **93,995 bytes** for 100 problems.

**The change** (`prisma-problems.repository.ts`, `problems.service.ts`):

1. Keyset: `where: { id: { gt: cursor } }` replaces Prisma's `cursor`. Nothing looks the cursor's row up any more.
2. The service asks the repository for `limit + 1` rows. If the extra one comes back, a next page exists.
3. The repository selects only the list's fields, into a new `ProblemSummary` type.

**After:** `Index Scan using "Problem_pkey"`, `Index Cond: (id > 100500)`, 4 buffers, **0.028 ms**, and **17,207 bytes** for the same 100 problems: 5.5 times smaller.

**The tests:** `test/problems.e2e-spec.ts` deletes the cursor's problem between two pages and expects the next one. It failed before the change, with an empty list. Two unit tests in `problems.service.spec.ts` cover I-11.

**Why:** the query was never slow. It was wrong (I-10), and it returned five times more than the page used (I-15). A plan can look perfect while the query is still the problem.
