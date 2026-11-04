-- Read, think, write: one +1 on counter 1, the way application code often does it.
-- psql's \gset stores the selected column in a variable (:n). The sleep stands
-- for the time between the read and the write: app code, a network hop.
BEGIN;
SELECT n FROM counters WHERE id = 1 \gset
SELECT pg_sleep(0.05);
UPDATE counters SET n = :n + 1 WHERE id = 1;
COMMIT;
