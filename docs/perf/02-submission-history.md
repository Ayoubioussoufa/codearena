# Query 2 · A user's submission history

**The page:** a profile's submission history, newest first, 20 per page. The user is `seed_u_1`, who has 27,159 submissions; page 501 starts after 10,000 rows.

**The SQL with `OFFSET`:**

```sql
SELECT id, verdict, "createdAt" FROM "Submission"
WHERE "userId" = 'seed_u_1'
ORDER BY "createdAt" DESC, id DESC
LIMIT 20 OFFSET 10000;
```

**Prediction:** the index `(userId, createdAt DESC)` finds the user's rows in order, but `OFFSET` still has to read and discard 10,000 of them.

**Before:** `Bitmap Index Scan` then `Bitmap Heap Scan` over all **27,159** of the user's rows, then a sort: 11,740 buffers, **18.5 ms**. Page 1 is fast, and every later page gets slower.

**The change:** keyset pagination. The client sends the last row it saw, `(createdAt, id)`, and the query asks for the rows after it:

```sql
SELECT id, verdict, "createdAt" FROM "Submission"
WHERE "userId" = 'seed_u_1'
  AND ("createdAt", id) < ('<last createdAt>', '<last id>')
ORDER BY "createdAt" DESC, id DESC
LIMIT 20;
```

With the old index, this was already 0.053 ms, but the plan had an `Incremental Sort`: the index orders by `createdAt`, not by `id` within equal timestamps. The migration `query_plan_indexes` replaces the index with `(userId, createdAt DESC, id DESC)`.

**After:** one `Index Scan using "Submission_userId_createdAt_id_idx"`, with no sort node: 23 buffers, **0.046 ms**. Page 501 costs the same as page 1.

**The Prisma trap.** Prisma can't write a row comparison, so the natural translation is an `OR`:

```ts
where: {
  userId,
  OR: [
    { createdAt: { lt: cursor.createdAt } },
    { createdAt: cursor.createdAt, id: { lt: cursor.id } },
  ],
}
```

Postgres can't start an index range from an `OR`, so it reads the user's rows from the newest and filters: `Rows Removed by Filter: 10000`, 0.65 ms. That's `OFFSET`'s cost again, under another name. One redundant condition, `createdAt: { lte: cursor.createdAt }`, gives the index a starting point: 24 buffers, **0.028 ms**.

**Why:** `OFFSET` reads every row it skips, so its cost grows with the page number. A keyset seeks straight to the cursor in the index. `id` is in the order, and in the index, because two submissions can share a timestamp: without a tie-breaker, a row can appear on two pages, or on none.
