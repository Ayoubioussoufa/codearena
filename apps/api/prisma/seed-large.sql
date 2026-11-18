-- apps/api/prisma/seed-large.sql
-- A large, skewed dataset for reading query plans (week 3, block D).
-- Development database only.
--   docker exec -i codearena-postgres psql -U codearena -d codearena < apps/api/prisma/seed-large.sql
-- Re-runnable: every seeded row has a prefix, and the first step deletes them.

\timing on

-- 1. Start clean. Users cascade to their submissions and refresh tokens.
DELETE FROM "Submission" WHERE id LIKE 'seed_s_%';
DELETE FROM "User" WHERE id LIKE 'seed_u_%';
DELETE FROM "Problem" WHERE slug LIKE 'seed-p-%';

-- 2. 50,000 users. updatedAt has no database default (Prisma fills it in
--    the app), so SQL must supply it.
INSERT INTO "User" (id, email, username, "passwordHash", "updatedAt")
SELECT 'seed_u_' || n,
       'seed' || n || '@example.com',
       'seed_u_' || n,
       'not-a-real-hash',
       now()
FROM generate_series(1, 50000) AS n;

-- 2b. 200,000 refresh tokens: 4 per user, in families of 2. Query 6 (I-16)
--     needs a table big enough that a missing index shows.
INSERT INTO "RefreshToken" (id, "userId", "tokenHash", family, "expiresAt")
SELECT 'seed_rt_' || n,
       'seed_u_' || (1 + (n - 1) / 4),
       md5('seed' || n),
       'seed_f_' || (1 + (n - 1) / 2),
       now() + interval '7 days'
FROM generate_series(1, 200000) AS n;

-- 3. 2,000 problems, with ids far above the real ones (100001+), so they
--    never collide with the seeded catalogue.
INSERT INTO "Problem" (id, slug, title, difficulty, description, constraints,
                       "starterCode", "updatedAt")
SELECT 100000 + n,
       'seed-p-' || n,
       'Seeded problem ' || n,
       (ARRAY['EASY', 'MEDIUM', 'HARD'])[1 + n % 3]::"Difficulty",
       ARRAY['Seeded for query plans.'],
       ARRAY[]::text[],
       '{}'::jsonb,
       now()
FROM generate_series(1, 2000) AS n;

-- 4. 1,000,000 submissions, skewed. random() is uniform on [0, 1);
--    power(random(), 3) piles values up near 0. So user 1 and problem
--    100001 are very hot, and most users have only a few submissions.
--    About 30 % are accepted. createdAt is spread over the last year.
INSERT INTO "Submission" (id, "userId", "problemId", language, verdict,
                          code, "runtimeMs", "createdAt")
SELECT 'seed_s_' || n,
       'seed_u_' || (1 + floor(power(random(), 3) * 50000)::int),
       100001 + floor(power(random(), 3) * 2000)::int,
       'JAVASCRIPT',
       (CASE
          WHEN r < 0.30 THEN 'ACCEPTED'
          WHEN r < 0.70 THEN 'WRONG_ANSWER'
          WHEN r < 0.85 THEN 'TIME_LIMIT'
          ELSE 'RUNTIME_ERROR'
        END)::"Verdict",
       'console.log(42)',
       (random() * 2000)::int,
       now() - random() * interval '365 days'
FROM (SELECT n, random() AS r FROM generate_series(1, 1000000) AS n) AS s;

-- 5. VACUUM fills the visibility map, so index-only scans can skip the
--    table. ANALYZE refreshes the statistics, or the planner plans with the
--    old ones and lies. Both, after any bulk load.
VACUUM ANALYZE;
