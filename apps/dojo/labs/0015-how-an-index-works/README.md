# Lab 0015: make four queries stop reading the whole table

`bash check.sh` starts a throwaway Postgres, loads `seed.sql` (300,000
submissions, 20,000 problems), runs **your `indexes.sql`**, then reads the plan
of each query below with `EXPLAIN (ANALYZE, BUFFERS)`.

1. Your most active user's latest submissions (they have about 8,000):
   `SELECT * FROM submissions WHERE user_id = 1 ORDER BY created_at DESC LIMIT 20`
   …and the same for a light user (about 10): `WHERE user_id = 4242`
2. How many accepted solutions a problem has:
   `SELECT count(*) FROM submissions WHERE problem_id = 17 AND status = 'ACCEPTED'`
3. Has this user tried this problem?
   `SELECT id FROM submissions WHERE user_id = 4242 AND problem_id = 17`
4. A problem by its URL:
   `SELECT id, title FROM problems WHERE slug = 'problem-17'`

Rules: no query may use a `Seq Scan`, or read more than 60 buffers (8 kB pages);
query 1 may not sort (for the light user, sorting 10 rows is fine); and
you get **at most three** new indexes on `submissions` (every index costs every
insert). Write `indexes.sql`, then `bash check.sh`.
