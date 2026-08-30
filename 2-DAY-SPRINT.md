# 2-Day Sprint — The Reset Weekend
### Sat 29 → Sun 30 August 2026 · two days

The goal is unchanged, and it is **one sentence**:

> By Sunday night, `docker compose up` + `pnpm dev:api` + `pnpm dev:web` gives a real
> Postgres, a real NestJS API, and a browser page listing problems **from the database** —
> with CI green on `main`.

No auth. No sandbox. No queues. No dojo work.

You have already *read* Phase 0. You never *built* it. That's the entire gap this weekend
closes.

> **Stuck on the *how* of a block?** [`2-DAY-SPRINT-PRIMER.md`](./2-DAY-SPRINT-PRIMER.md)
> explains the concepts behind every block — DI, indexes, cursor pagination, ports and
> adapters — with no copy-paste code. Read a block's section just before you start it.

---

## Read this first: the plan was 4 days, this is 2

The original sprint was ~36 hours across Thu–Sun. Two days is ~19 working hours. **Half the
work had to go.** Here is exactly where it went — no silent trimming.

### Already done (2.5h saved, for free)

| Block | Status |
|---|---|
| Repo hygiene — husky, lint-staged, commitlint, `docs/adr/` | ✅ done, 18 commits |
| Ground truth — `PROGRESS.md` | ✅ committed |
| `tsconfig.base.json` inherited by all apps | ✅ done (was Phase 0 debt) |

### Cut, and where it went

| Cut | Was | Now |
|---|---|---|
| **DSA blocks** | ~7h across 4 days | **Weekday evenings.** Not sprint deliverables |
| **Deep reads** (Phase 0 §B.2/B.3/B.6/C.3, Phase 1 §A.1–A.4) | ~5h | You've read these. Kept as **reference while building**, not as blocks |
| **Phase 1 §B priming read** (auth) | 45 min | Monday morning, at full strength |
| **LoggingInterceptor + requestId** | 45 min | Week 1. The exception filter stays — the gate needs its 404 shape |
| **`psql` by hand + EXPLAIN** | 1h | **Stretch goal Saturday night.** Do it if you're ahead |
| **Retro** | 60 min | 20 min |

### The honest risk

This weekend has **no slack**. The 4-day version had reading blocks that could absorb
overrun; this one doesn't. That's why Sunday ends with a **named 1-hour buffer** — it is not
free time, it's the overrun you should expect. If you reach 17:30 without needing it, do the
`psql` stretch goal.

---

## Two traps in your own repo

Both cost an hour each if you hit them cold. Five minutes now.

### Trap 1 — the Phase 1 guide's Prisma boilerplate is out of date

`docs/phase-1` Part E shows `provider = "prisma-client-js"` and a `url` on the datasource.
**Your repo is Prisma 7 and does it differently** (`apps/api/prisma/schema.prisma`):

```prisma
generator client {
  provider = "prisma-client"          // ← new generator, not -js
  output   = "../generated/prisma"    // ← client is emitted here
}
datasource db {
  provider = "postgresql"             // ← no url; it comes from prisma.config.ts
}
```

**Keep your form.** Read Part E for the *modeling* and ignore its generator lines. After your
first `prisma generate`, open `apps/api/generated/prisma/` and check the real export path
before writing your first import — it is **not** `@prisma/client`.

### Trap 2 — `apps/web/src/lib/types.ts` is already your API contract

The frontend is finished and defines exact shapes. Sunday's endpoint must satisfy `Problem`
in that file, so read it **before** you design the schema, not after:

```ts
export interface Problem {
  id: number;                              // ← a NUMBER, not a cuid string
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";  // ← Title Case display strings
  starterCode: Record<Language, string>;   // ← a map, not a table
  description: string[];                   // ← array of paragraphs
}
```

- **`Problem.id` → `Int @id @default(autoincrement())`.** Matches the frontend and your 333 seed rows.
- **`User.id`, `Submission.id` → `String @id @default(cuid())`.** Never expose a guessable id for a user.

Mixing id strategies is a deliberate choice, not an inconsistency — write down why in
ADR-001. Interviewers follow up on exactly this.

---

## The reading map — 40 minutes total

Everything else is reference-while-building. Open, skim, move.

| When | Read | Lines | Time |
|---|---|---|---|
| Sat 09:20 | Phase 1 §A.5–A.7 — pagination, N+1, migrations | 193–278 | 25 min |
| Sat 09:45 | Phase 1 Part E — the bookstore schema | 654–751 | 15 min |

**Don't type the bookstore schema.** The 4-day plan had you type it as practice; you don't
have the hour. Skim it as a shape reference and write your own directly.

---

# SATURDAY — the data layer

**Theme:** a configured, connected API and a database full of real rows.

| Time | Block | What |
|---|---|---|
| 09:00 | Orientation | Traps above, `pnpm infra:up`, confirm Postgres accepts a connection |
| 09:20 | Read | Phase 1 §A.5–A.7 + Part E (40 min, skim) |
| 10:00 | **Build 1** | Config + env validation + `main.ts` (2h) |
| 12:00 | — | Lunch |
| 12:45 | **Build 2** | Prisma module, exception filter, `/health` (1h15) |
| 14:00 | **Build 3** | The schema (2h30) |
| 16:30 | **Build 4** | Migrate + read the generated SQL (45 min) |
| 17:15 | **Build 5** | Seed 333 problems (1h30) |
| 18:45 | Close | Verify, commit, draft ADR-001 (30 min) |
| 19:15 | *stretch* | `psql` by hand — only if you're ahead |

### 10:00 — Build 1: config and bootstrap (2h)

```bash
pnpm --filter api add @nestjs/config zod class-validator class-transformer
```

1. **`src/config/env.schema.ts`** — a Zod schema for `PORT`, `DATABASE_URL`, `NODE_ENV`,
   `REDIS_HOST`, `REDIS_PORT`. Parse at boot.
2. **`ConfigModule.forRoot({ isGlobal: true, validate })`** — Phase 0 §B.6's dynamic module,
   for real. The app must **refuse to start** on a missing env var, with a readable message.
   Test it: delete `DATABASE_URL` and confirm the failure is clear.
3. **`main.ts`** — global `ValidationPipe({ whitelist: true, transform: true })`, CORS for
   `http://localhost:3000`, `app.enableShutdownHooks()`, port from config (3001).

> **The one to understand:** `whitelist: true` strips properties not on the DTO. Know why
> that's a *security control* and not a convenience — it's a real interview question.

### 12:45 — Build 2: Prisma, filter, health (1h15)

1. **`PrismaModule` + `PrismaService`** — `extends PrismaClient`, `onModuleInit` → `$connect()`,
   global module. *(Import from your generated output path — Trap 1.)*
2. **`AllExceptionsFilter`** — every error leaves as the same JSON shape (`statusCode`,
   `message`, `path`, `timestamp`). Never leak a stack trace in production.
3. **`/health`** — returns `{ status, uptime, db }` where `db` is a real `SELECT 1`
   round-trip, not a hardcoded `"ok"`. A health check that can't fail is decoration.

*Cut from the 4-day version: the LoggingInterceptor and requestId threading. Week 1.*

### 14:00 — Build 3: the schema (2h30)

Design against the frontend contract. **Decide each model yourself and write one line of
reasoning** — that reasoning is the deliverable, not the file.

| Model | Key decisions |
|---|---|
| `User` | cuid · `email` + `username` unique · `passwordHash` (never `password`) · `role` enum · Glicko fields (`rating`, `ratingDeviation`, `volatility`) now, so Week 5 needs no migration |
| `Problem` | **`Int @id @default(autoincrement())`** (frontend contract) · `slug @unique` · `difficulty` enum · `description String[]` · `constraints String[]` · `starterCode Json` |
| `ProblemExample` | A real 1-many table with an `order` column — **not** Json. You want the relation practice |
| `Tag` | `name @unique`, implicit many-to-many with `Problem` |
| `TestCase` | `problemId`, `input`, `expected`, `isSample`, `order`. Week 2's sandbox reads this |
| `Submission` | cuid · `userId` · `problemId` · `language` + `verdict` enums · `code` · `runtimeMs` · `createdAt` |
| `RefreshToken` | `tokenHash` (never the token) · `family` · `revokedAt` · `expiresAt`. **Monday needs this** — schema it today so Monday is pure logic |

*`SubmissionResult` is deferred to Week 2, when something actually writes it.*

**Two judgment calls to make explicitly:**

- **`starterCode` as `Json` but `examples` as a table.** Defensible: starter code is a value
  object always read whole and never queried by key; examples are ordered rows you might
  paginate or edit individually. Make the call, defend it in ADR-001.
- **Enum casing.** Your enums are `EASY | MEDIUM | HARD`; the frontend wants `"Easy"`.
  **Map at the boundary, in the DTO** — not in the domain, not by contorting the enum. That's
  Phase 0 Part C's dependency rule doing real work.

**Indexes — add these now, one line of justification each:**

```prisma
@@index([difficulty])                          // Problem: list filter
@@index([userId, createdAt(sort: Desc)])       // Submission: profile history, cursor-paginated
@@index([problemId, verdict])                  // Submission: acceptance-rate stats
@@index([userId, family])                      // RefreshToken: rotation lookup
```

### 16:30 — Build 4: migrate and read the SQL (45 min)

```bash
pnpm --filter api exec prisma migrate dev --name init
```

Then **open `apps/api/prisma/migrations/*/migration.sql` and read every line.** This is the
highest-value 20 minutes of the weekend. It's just `CREATE TABLE`, `CREATE INDEX`,
`ALTER TABLE … ADD CONSTRAINT`. Prisma is a code generator; today you see what it generates.

Answer two questions in your ADR notes:
- Which index did Prisma create that you *didn't* ask for, and why?
- What does the `@unique` on `Tag.name` produce in SQL?

### 17:15 — Build 5: seed (1h30)

You already have 333 problems in the exact target shape: `apps/web/src/lib/dsa-problems.ts`.

1. **One-off:** convert that array to `apps/api/prisma/seed-data/problems.json` with a
   throwaway script; the JSON is what gets committed. *(The API must not import from the web
   app — that dependency points the wrong way.)*
2. **`prisma/seed.ts`** — upsert by `slug` so re-running is idempotent. Create tags, wire the
   many-to-many, insert examples with their order, plus one dev user with a hashed password.
3. Wire `prisma.config.ts` / package script so `pnpm --filter api exec prisma db seed` works.

**Verify:** `SELECT count(*) FROM "Problem";` → 333. Run it twice; the count doesn't change.
Idempotent seeding is the same idea as Week 4's idempotent job.

### 19:15 — Stretch: `psql` by hand

Only if you're ahead. This was a full hour in the 4-day plan and it's genuinely valuable —
but it's learning, not a deliverable.

```bash
docker exec -it codearena-postgres psql -U codearena -d codearena
```

```sql
\dt
\d "Problem"
EXPLAIN ANALYZE SELECT * FROM "Problem" WHERE difficulty = 'MEDIUM' ORDER BY id LIMIT 20;
```

At 333 rows Postgres will choose a **Seq Scan** and be right to — the table fits in one
page-read. *Understanding why the index isn't used here is the point.* Week 3 is when 1M rows
flips the answer.

---

# SUNDAY — the slice, end to end

**Theme:** Phase 0 Part C — ports, adapters, repositories — as working code. Then close it.

| Time | Block | What |
|---|---|---|
| 09:00 | **Build 1** | Problems module, hexagonal (3h) |
| 12:00 | — | Lunch |
| 12:45 | **Build 2** | Wire `apps/web`, delete the mocks (1h15) |
| 14:00 | **Build 3** | GitHub Actions CI, until green (1h15) |
| 15:15 | **Build 4** | One e2e + one unit test (1h) |
| 16:15 | **Gate** | The checklist (45 min) |
| 17:00 | Close | ADR-001 final, ADR-000, 20-min retro (30 min) |
| 17:30 | **Buffer** | Expect to need it (1h) |
| 18:30 | **Stop** | Monday is a depth day |

### 09:00 — Build 1: the Problems module (3h)

Structure it as the hexagon:

```
src/problems/
  domain/          problem.entity.ts          ← plain TS. Imports NOTHING.
  ports/           problems.repository.ts     ← the interface + a Symbol token
  adapters/        prisma-problems.repository.ts
  application/     problems.service.ts        ← business logic, depends on the PORT
  http/            problems.controller.ts, dto/
  problems.module.ts
```

Endpoints:
- `GET /problems?cursor=&limit=&difficulty=&tag=&q=` — **cursor-paginated**, because you read
  §A.5 yesterday and this is where it gets used.
- `GET /problems/:slug` — 404 via `NotFoundException`, rendered by Saturday's filter.

Wiring is `{ provide: PROBLEMS_REPOSITORY, useClass: PrismaProblemsRepository }`.

**The audit that proves it worked:** grep `domain/` and `application/` for `prisma`. Zero
hits, or the hexagon leaked. Ten seconds, and it's the whole point of the architecture.

### 12:45 — Build 2: wire the frontend (1h15)

Replace `getProblems()` and `getProblem()` in `apps/web/src/lib/api.ts` with real `fetch`
calls to `NEXT_PUBLIC_API_URL`. **Delete the mocks — don't comment them out.**

The rest of `lib/api.ts` (auth, runCode, profile) stays mocked until its week.

The mock's fake 700ms delay is gone, so a real fast response may make skeletons flash. That's
a real problem with a real fix — but **only if you have time**. Note it in `PROGRESS.md`
otherwise.

### 14:00 — Build 3: CI (1h15)

`.github/workflows/ci.yml` — on push and PR to `main`:

```
setup pnpm + node 24 → pnpm install --frozen-lockfile
→ pnpm lint  →  pnpm -r typecheck  →  pnpm build
```

Two things you'll hit:
- `apps/api` has no `typecheck` script — add `"typecheck": "tsc --noEmit"` (the other three
  already have it).
- The dojo's test scripts (`test:generators`, `test:dsa`, `test:diagrams`) are slow. **Put
  them in a separate job**, so the main pipeline stays under ~3 minutes.

**Verify:** push a branch, open a PR, watch it go green.

### 15:15 — Build 4: tests (1h)

**One e2e** — `test/problems.e2e-spec.ts` against the real running stack: list returns 20 with
a cursor, the cursor returns the *next* 20 with no overlap, an unknown slug gets 404 in your
filter's shape.

**One unit test** for `ProblemsService` with a fake in-memory repository — no database,
milliseconds. That test existing at all is the payoff for the port. Notice how it feels
compared to the e2e one.

*The 4-day plan wanted a fuller suite. Two tests that demonstrate the two shapes is the
version that fits.*

### 16:15 — The gate

**Must pass — this is the sprint:**

- [ ] `pnpm infra:up && pnpm dev:api && pnpm dev:web` → localhost:3000 lists problems **from Postgres**
- [ ] `GET /problems?cursor=…` paginates, no duplicates across pages
- [ ] Unknown slug → 404 in your exception filter's JSON shape
- [ ] `/health` reports a real database round-trip
- [ ] App refuses to boot on a missing env var, with a readable message
- [ ] `SELECT count(*) FROM "Problem";` → 333; seeding twice changes nothing
- [ ] Zero `prisma` imports in `problems/domain/` or `problems/application/`
- [ ] CI green on `main`

**Should pass — chase only if the above are green:**

- [ ] e2e + unit tests both pass
- [ ] ADR-000 and ADR-001 committed
- [ ] `PROGRESS.md` updated with the retro

**If the gate fails:** Monday morning finishes it, and Week 1's Saturday sprint is what gives.
Write down *which box* failed and why — in `PROGRESS.md`, not in your head. The last plan died
from debt that nothing reacted to.

### 17:00 — Close (30 min)

- **ADR-001** — *"The schema decisions."* The id strategy split, Json vs relation, enum mapping
  at the boundary, each index with its query.
- **ADR-000** — *"Why a pnpm monorepo with bounded-context modules."*
- **Retro, 20 min, in `PROGRESS.md`** — what took longer, what you skipped, what you'd change.

Then set Monday up: `docs/phase-1` open at line 285, `RefreshToken` confirmed in the schema.

---

## What Monday looks like

**Week 1 · Mon 31 Aug → Sun 6 Sep — Auth, end to end. Depth week, slow lane.**

- Argon2id (not bcrypt — be ready to defend it), register/login/refresh/logout
- Refresh-token rotation **with reuse detection** — replaying a used token kills the family
- httpOnly cookies, `AuthGuard` + `@Roles()`, rate limiting on auth routes
- Saturday: TanStack Query migration; `lib/api.ts` deleted from the repo
- DSA: Linked List, 12 of 15 · Java: 45 min/day

You arrive Monday with the schema and the guard-shaped hole in the pipeline. That's the point
of this weekend.

**You skipped the Phase 1 §B priming read** that the 4-day plan had on Sunday evening. Monday's
first hour is now a cold read instead of a second pass. Budget for that.

---

## Rules for these two days

1. **The dojo is frozen.** You'll notice things you want to improve. Write them in `IDEAS.md`
   and close the file.
2. **Type, don't paste** — including from your own guides.
3. **Commit at every block boundary.** Your hooks are live; conventional messages or they're
   rejected.
4. **Every design decision gets one written line.** If you can't write the line, you haven't
   made a decision — you've accepted a default.
5. **Scope is locked.** No auth, no sandbox, no queues, no UI redesign.
6. **When a block's time is up, commit what works and move on.** Two days has no slack. A
   half-finished block you moved past is recoverable; a perfect Build 1 that ate Build 3 is not.
7. **Stop at 18:30 Sunday**, buffer used or not. Monday starts at full strength.
