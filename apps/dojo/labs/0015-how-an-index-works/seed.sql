-- The lab's data: 300,000 submissions, skewed like real traffic (a few very
-- active users, a few hot problems), and 20,000 problems.
SELECT setseed(0.42);
DROP TABLE IF EXISTS submissions, problems;
CREATE TABLE problems (id int PRIMARY KEY, slug text NOT NULL, title text NOT NULL, difficulty int NOT NULL);
INSERT INTO problems
SELECT i, 'problem-' || i, 'Problem ' || i, 1 + (i % 3) FROM generate_series(1, 20000) AS i;
CREATE TABLE submissions (
  id bigserial PRIMARY KEY,
  user_id int NOT NULL,
  problem_id int NOT NULL,
  language text NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL
);
INSERT INTO submissions (user_id, problem_id, language, status, created_at)
SELECT 1 + floor(power(random(), 3) * 50000)::int,
       1 + floor(power(random(), 2) * 20000)::int,
       (ARRAY['JAVASCRIPT', 'PYTHON', 'CPP'])[1 + floor(random() * 3)::int],
       (ARRAY['ACCEPTED', 'ACCEPTED', 'ACCEPTED', 'WRONG_ANSWER', 'WRONG_ANSWER', 'TIME_LIMIT', 'RUNTIME_ERROR', 'WRONG_ANSWER', 'WRONG_ANSWER', 'COMPILE_ERROR'])[1 + floor(random() * 10)::int],
       timestamptz '2026-11-01' - random() * interval '90 days'
FROM generate_series(1, 300000);
ANALYZE;
