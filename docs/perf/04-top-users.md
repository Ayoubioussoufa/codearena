# Query 4 · The top 100 users, in SQL

**The page:** a leaderboard, by distinct problems solved.

```sql
SELECT "userId", count(DISTINCT "problemId") AS solved
FROM "Submission"
WHERE verdict = 'ACCEPTED'
GROUP BY "userId"
ORDER BY solved DESC
LIMIT 100;
```

**Prediction:** a sequential scan of the whole table. No index can answer "count everything per user" without reading everything.

**Before:** `Seq Scan on "Submission"` (`Rows Removed by Filter: 700461`), a sort of 299,539 rows that **spilled to disk** (`temp read=1016 written=1020`), then `GroupAggregate`: **563 ms**.

**After** query 3's partial index: `Index Only Scan using "Submission_solved_idx"`, already in `(userId, problemId)` order, so no sort: 1,229 buffers, **38 ms**.

**Why it's still not the fix:** 38 ms is still reading all 299,539 accepted entries, on every page view, and it grows with every accepted submission. An index makes the scan cheaper, but it can't make "count everything on every read" stop being a full scan. The leaderboard (a Redis sorted set the worker updates on every Accepted) moves the work from read time to write time. This query stays useful, though: it's how the leaderboard is rebuilt from Postgres if Redis loses it.
