-- An Accepted verdict for (:user, :problem). Count it in users.solved only if
-- it's the user's first Accepted on that problem. Check, then act.
BEGIN;
SELECT count(*) = 0 AS first FROM solved WHERE user_id = :user AND problem_id = :problem \gset
SELECT pg_sleep(0.05);
\if :first
  INSERT INTO solved (user_id, problem_id) VALUES (:user, :problem);
  UPDATE users SET solved = solved + 1 WHERE id = :user;
\endif
COMMIT;
