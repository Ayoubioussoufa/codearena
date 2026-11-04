# Lab 0014: make a second delivery harmless

Write three SQL files. They run with `psql`, which replaces `:id`, `:'worker'`,
`:lease`, `:'verdict'` and `:'hash'` with the values the checker passes.

| File | Must do | Returns |
|---|---|---|
| `claim.sql` | Move submission `:id` to `RUNNING`, owned by `:'worker'`, if it's `PENDING`, **or** if it's `RUNNING` with a claim older than `:lease` seconds. | one row (the id) if this worker won, nothing otherwise |
| `finish.sql` | Store `:'verdict'` and set `DONE`, only if `:'worker'` still owns the `RUNNING` claim. | one row if written, nothing otherwise |
| `rotate.sql` | Use refresh token `:'hash'` once: mark it used if it wasn't. | one row (the user id) the first time, nothing after |

The tables (the checker creates them):

```sql
submissions(id int primary key, status text default 'PENDING', claimed_by text, claimed_at timestamptz, verdict text)
refresh_tokens(token_hash text primary key, user_id int, used_at timestamptz)
```

Each file is **one statement** that checks and writes at once. Run `bash check.sh`.
