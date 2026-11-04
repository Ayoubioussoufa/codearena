-- The checker's tables, recreated before each part.
DROP TABLE IF EXISTS counters, solved, users;
CREATE TABLE counters (id int PRIMARY KEY, n int NOT NULL);
INSERT INTO counters VALUES (1, 0);
CREATE TABLE users (id int PRIMARY KEY, name text NOT NULL, is_admin boolean NOT NULL DEFAULT false, solved int NOT NULL DEFAULT 0);
INSERT INTO users (id, name, is_admin) VALUES (1, 'ada', true), (2, 'linus', true), (3, 'grace', false);
-- One row per (user, problem) the user has solved. No unique constraint: that's yours to decide.
CREATE TABLE solved (user_id int NOT NULL, problem_id int NOT NULL, at timestamptz NOT NULL DEFAULT now());
