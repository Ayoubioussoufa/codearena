# Lab 0017: races, then the levels that stop them

`bash shell.sh` opens psql on a Postgres with the lab's tables. Run it in **two
terminals** for the experiments in the lesson. `bash check.sh` runs the checks
below on a fresh, throwaway Postgres, firing many sessions at once.

The tables (`schema.sql`): `counters(id, n)`, `users(id, name, is_admin, solved)`,
`solved(user_id, problem_id, at)`, with **no unique constraint** on `solved`.

| File | Must do | Checked with |
|---|---|---|
| `increment.sql` | add 1 to counter 1 | 30 sessions at once: n = 30 |
| `first-solve.sql` | record an Accepted for `:user`, `:problem`; count it in `users.solved` only the first time. **READ COMMITTED** (the default): no SERIALIZABLE here | 20 deliveries of the same pair at once: solved = 1; 10 problems × 2 deliveries: solved = 10 |
| `serializable.sql` | the starter's check-then-act logic, unchanged, at **SERIALIZABLE** | 20 at once, retried on serialization failures: solved = 1 |
| `migration.sql` (optional) | schema changes for `first-solve.sql`, e.g. a constraint | runs once, before `first-solve.sql`'s part |

Start from the starters: `cp increment.start.sql increment.sql`, and the same
for `first-solve.sql` and `serializable.sql`. Run them first as they are: the
checker shows you the race before you fix it.

Like a real worker, the checker **retries** a session that fails with a
serialization failure (SQLSTATE 40001), up to 10 times, and tells you how many
retries it took.
