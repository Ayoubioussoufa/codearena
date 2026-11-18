# Query plans

Six queries from CodeArena, each measured with `EXPLAIN (ANALYZE, BUFFERS)` before and after one change. The decisions are summed up in [ADR-009](../adr/009-six-queries-six-plans.md).

**The data:** `apps/api/prisma/seed-large.sql` on top of the normal seed. That's 50,000 users, 2,000 problems, 1,000,000 submissions and 200,000 refresh tokens. The submissions are skewed: problem 100001 has about 79,000 of them and user 1 about 27,000, and 30 % are accepted. The seed ends with `VACUUM ANALYZE`.

**How each number was taken:** Postgres 16 in Docker, on a laptop. Every query ran three times, and the third run is the one reported, with its pages in memory. A buffer is one 8 KB page, and it's a better comparison than milliseconds, because it doesn't depend on the machine.

| # | Query | Before | After | The change |
|---|---|---|---|---|
| [1](01-problems-list.md) | The problems list | 94 KB, a dead cursor ends the list | 17 KB, a dead cursor is harmless | keyset, `limit + 1`, list fields only |
| [2](02-submission-history.md) | Submission history, page 501 | 18.5 ms, 11,740 buffers | 0.05 ms, 23 buffers | keyset pagination, `id` in the index |
| [3](03-solved-badges.md) | "Solved" badges for a page | 5.5 ms, 1,908 buffers | 0.28 ms, 64 buffers | one query, a partial index |
| [4](04-top-users.md) | The top 100 users | 563 ms, spills to disk | 38 ms, no sort | the same partial index; the real fix is the leaderboard |
| [5](05-accepted-solutions.md) | Latest accepted solutions | 13.1 ms, 11,064 buffers | 0.04 ms, 23 buffers | a partial index, 9 MB instead of 30 MB |
| [6](06-revoke-family.md) | Revoking a token family (I-16) | 15.4 ms, a sequential scan | 0.15 ms, an index scan | an index on `family` |

**Reproduce:** load the seed with `docker exec -i codearena-postgres psql -U codearena -d codearena < apps/api/prisma/seed-large.sql`, then paste any query below into `psql` with `EXPLAIN (ANALYZE, BUFFERS)` in front.
