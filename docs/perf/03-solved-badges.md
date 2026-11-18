# Query 3 · "Solved" badges for a page of problems

**The page:** the problems list marks each problem the user has solved. A page shows 20 problems.

**The N+1 version:** one query per problem.

```ts
for (const p of problems) {
  p.solved = (await prisma.submission.count({
    where: { userId, problemId: p.id, verdict: 'ACCEPTED' },
  })) > 0;
}
```

Each of those queries is fast, 0.02 ms with the index below. The cost is 20 round trips to the database instead of 1, and in production each round trip is a network hop.

**One query for the page:**

```sql
SELECT "problemId" FROM "Submission"
WHERE "userId" = 'seed_u_1'
  AND verdict = 'ACCEPTED'
  AND "problemId" IN (100001, …, 100020)
GROUP BY "problemId";
```

**Prediction:** two indexes each cover half of the condition, `(userId, createdAt)` and `(problemId, verdict)`, so the planner will combine them.

**Before:** a `BitmapAnd` of both indexes, then a `Bitmap Heap Scan` that visits 1,743 rows: 1,908 buffers, **5.5 ms**.

**The change:** a partial index on `(userId, problemId) WHERE verdict = 'ACCEPTED'`. It holds only accepted rows, about 30 % of the table, and it has every column the query needs.

**After:** `Index Only Scan using "Submission_solved_idx"`, `Heap Fetches: 0`: 64 buffers, **0.28 ms**.

**In Prisma, `groupBy`, not `distinct`.** I read the SQL in Prisma's query log: `groupBy({ by: ['problemId'] })` sends a real `GROUP BY`, while `findMany({ distinct: ['problemId'] })` sends no `DISTINCT` at all. It fetches every matching row and removes duplicates in Node.

**Why:** the N+1 multiplies round trips, so the first fix is one query for the page. That query then needed an index matching its whole condition. Making it partial keeps it at 9.6 MB, because the badges only ever ask about accepted submissions.
