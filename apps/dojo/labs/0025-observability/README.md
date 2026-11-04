# Lab 0025: seeing production

## Part 1: `observe.mjs`

Logs, health and metrics for a node:http server. The full contract is at the top
of `observe.start.mjs`: `cp observe.start.mjs observe.mjs`, then write it.

## Part 2: backups you've actually restored

Two scripts, run on the server (here: against a throwaway Postgres in Docker).
The container's name is in `$PG_CONTAINER`; the database is `lab`, user `lab`.

| Script | Must do |
|---|---|
| `backup.sh` | dump the database with `pg_dump --format=custom` into `backups/codearena-<YYYY-MM-DD>.dump` (today's date in UTC: `date -u +%F`), then keep only the **7 newest** dumps in `backups/` |
| `restore-check.sh <dump>` | restore that dump into a **fresh** database named `restore_check` (drop it first if it exists), then print just the number of rows in its `submissions` table |

`pg_dump`, `pg_restore`, `createdb` and `dropdb` run inside the container:
`docker exec -i "$PG_CONTAINER" pg_dump -U lab --format=custom lab > file`.

Then `bash check.sh`: it checks part 1 with plain Node, then starts Postgres,
seeds it, runs your backup, simulates a disaster, and restores.
