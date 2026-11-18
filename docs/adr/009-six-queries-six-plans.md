# ADR-009: Index for the queries we measured, and paginate with keysets

- **Status:** Proposed. A draft from your mentor: read `docs/perf/`, then rewrite this in your own words and mark it Accepted.
- **Date:** 2026-11-18

## Context
Six queries were measured on a million skewed submissions (`docs/perf/`). The Prisma defaults behaved well on small tables and badly at scale:

- `OFFSET` pagination got slower with every page.
- Prisma's `cursor` looks the cursor's row up first, so a deleted row ended the list (I-10).
- The list endpoint returned five times the data its page used (I-15).
- One index couldn't serve the query it was written for (I-16).

## Decision
1. **Keyset pagination everywhere**, on `(sortKey, id)`, with the matching index. No `OFFSET` on any list that can grow.
2. **Four indexes, each justified by a measured plan** (migration `query_plan_indexes`):
   - `Submission(userId, createdAt DESC, id DESC)`, which replaces `(userId, createdAt DESC)`. History: 18.5 ms → 0.05 ms at page 501.
   - `Submission(userId, problemId) WHERE verdict = 'ACCEPTED'`, partial. "Solved" badges: 5.5 ms → 0.28 ms. The top users: 563 ms → 38 ms.
   - `Submission(problemId, createdAt DESC) WHERE verdict = 'ACCEPTED'`, partial. Latest accepted: 13.1 ms → 0.04 ms, at 9 MB instead of 30 MB.
   - `RefreshToken(family)`. `revokeFamily`: 15.4 ms → 0.15 ms (I-16).
3. **List endpoints select only what their page shows.** `GET /problems` returns a `ProblemSummary`: 94 KB → 17 KB (I-15).
4. **One query per page, never one per row.** In Prisma, `groupBy` rather than `distinct`, which deduplicates in Node.
5. **`$queryRaw` only for what Prisma can't express** (`count(*) FILTER (…)`), and only in its tagged-template form.

## Alternatives considered
- **An index on every filtered column:** rejected. Each index slows every insert and takes memory. `(difficulty, id)` was tried for query 1, and the planner ignored it.
- **`OFFSET` with a page cap:** rejected. It still reads every skipped row, and a cap hides the cost instead of removing it.
- **Ranking users in SQL:** rejected. Even index-only, it reads every accepted row on each view. That's why the leaderboard moved to a Redis sorted set.

## Consequences
- **Good:**
  - pages cost the same at any depth;
  - the hot paths read tens of pages instead of thousands;
  - every index can be traced to a plan in `docs/perf/`.
- **Bad:**
  - a keyset can't jump to "page 37";
  - partial indexes use a Prisma preview feature (`partialIndexes`);
  - `CREATE INDEX` without `CONCURRENTLY` locks writes while it builds, which is fine today and not on a busy table.
- **Revisit if:**
  - `pg_stat_statements` shows a new top query;
  - `pg_stat_user_indexes.idx_scan` shows an index nobody uses;
  - the tables grow enough that index builds need `CONCURRENTLY` in a hand-written migration.
