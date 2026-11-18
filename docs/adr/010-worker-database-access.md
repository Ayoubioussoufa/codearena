# ADR-010: The worker reads and writes Postgres with its own Prisma client

- **Status:** Proposed. A draft from your mentor: rewrite it in your own words, and settle the trust question in ADR-007.
- **Date:** 2026-11-18

## Context
The worker takes a submission id from the queue. It needs to read the code, the problem's tests and limits, and to write the verdict and the claim. Until now, only the API used the database, through the Prisma schema in `apps/api/prisma`.

## Decision
The schema gets a second generator, `worker`, which writes a client into `apps/worker/src/generated/prisma`. One `prisma generate` builds both clients. The worker uses it only behind its `SubmissionStore` port, so the choice can change without touching the use case.

## Alternatives considered
- **A shared `packages/db`:** cleaner in the long run, but it means moving the API's Prisma setup now. That's worth it when a third app needs the database.
- **The worker calls the API over HTTP:** one writer, but a new internal endpoint to secure, and a second hop on every judgement.

## Consequences
- **Good:** one schema, so a renamed column breaks the worker's build instead of its first job. The client is typed, and the worker's code stays small.
- **Bad:** two apps write the `Submission` table, so the rules for who writes which columns live in code, not in the database. Today the worker's database user can read and write **every** table, while the worker also holds the Docker socket and runs hostile code. If the sandbox ever leaked, that's what an attacker would reach.
- **Revisit if:** before production, give the worker its own Postgres role, limited to `Submission`, `Problem` and `TestCase` (ADR-007, the trust boundary). Also revisit when a third app needs the database, with `packages/db`.
