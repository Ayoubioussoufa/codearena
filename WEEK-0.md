# Week 0 — The Reset Sprint
### Thu 27 → Sun 30 August 2026 · four days

The goal of these four days is **one sentence**:

> By Sunday night, `docker compose up` + `pnpm dev:api` + `pnpm dev:web` gives a real
> Postgres, a real NestJS API, and a browser page listing problems **from the database** —
> with CI green on `main`.

Nothing else. No auth (that's Monday). No sandbox. No queues. No dojo work.

You have already *read* Phase 0. You never *built* it. That's the entire gap this sprint
closes: Phase 0's concepts — DI, modules, ports & adapters, repositories — stop being
things you understand and become code you wrote.

---

## Before anything: two traps in your own repo

### Trap 1 — the Phase 1 guide's Prisma boilerplate is out of date for your scaffold

`docs/phase-1` Part E shows this:

```prisma
generator client { provider = "prisma-client-js" }
datasource db     { provider = "postgresql"; url = env("DATABASE_URL") }
```

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

**Keep your form.** Read Part E for the *modeling* — relations, indexes, the migration
workflow — and ignore its generator/datasource lines. After your first `prisma generate`,
open `apps/api/generated/prisma/` and check the actual export path before writing your
first import; it is **not** `@prisma/client`.

### Trap 2 — `apps/web/src/lib/types.ts` is already your API contract

The frontend is finished and it defines exact shapes. Sunday's endpoint has to satisfy
`Problem` in that file, so read it **before** you design the schema Saturday, not after.
The one that will bite you:

```ts
export interface Problem {
  id: number;                              // ← a NUMBER, not a cuid string
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";  // ← Title Case display strings
  starterCode: Record<Language, string>;   // ← a map, not a table
  description: string[];                   // ← array of paragraphs
  ...
}
```

And `apps/web/src/lib/dsa-problems.ts` — 333 auto-generated problems — already uses
`"id": 1000, 1001, 1002…`. So:

- **`Problem.id` → `Int @id @default(autoincrement())`.** Matches the frontend and your seed data.
- **`User.id`, `Submission.id` → `String @id @default(cuid())`.** Never expose a guessable
  sequential id for a user.

Mixing id strategies inside one schema is a deliberate choice, not an inconsistency — write
down why in ADR-001. That's exactly the kind of question an interviewer follows up on.

---

## The reading map for four days

Targeted re-reads, not a re-study. Line numbers are for the files in `docs/`.

| When | Read | Lines | Time | Why now |
|---|---|---|---|---|
| Thu AM | Phase 0 §B.2 — DI from zero | 432–563 | 45 min | Friday's whole build is DI |
| Thu PM | Phase 0 §B.3–B.4 — modules, request lifecycle | 564–636 | 30 min | You wire the pipeline Friday |
| Thu PM | Phase 0 §B.6 — dynamic modules (`forRoot`) | 674–707 | 15 min | `ConfigModule.forRoot()` Friday |
| Thu eve | Phase 0 §C.3–C.4 — hexagonal, repository | 779–889 | 30 min | Sunday's ports & adapters |
| Fri AM | Phase 0 **Part E** — the coffee-shop app | 1011–1142 | 45 min | Read + trace the 5-step request walk |
| Fri eve | Phase 1 **§A.1–A.4** — tables, ACID, indexes, EXPLAIN | 23–192 | 90 min | Saturday's substrate |
| Sat AM | Phase 1 **§A.5–A.7** — pagination, N+1, migrations | 193–278 | 40 min | Saturday's schema + Sunday's list endpoint |
| Sat AM | Phase 1 **Part E** — the bookstore schema | 654–751 | 30 min | **Type it into a scratch file.** Model for yours |
| Sun eve | Phase 1 §B.1–B.3 — hashing, JWT, rotation | 285–405 | 45 min | **Priming pass only.** Read once, no notes, no exercises |

**On the Sunday priming read:** the plan's rule is *Sunday = consolidation, no new material.*
This sprint is the one exception, and it's deliberate — Monday is a depth day on auth, and
arriving with the vocabulary already once-seen roughly halves the cost of the first pass.
Read it like a novel. Do not take notes. Do not start coding.

---

# DAY 1 · Thursday 27 August
## Ground truth + repo hygiene + CI

**Theme:** make the repo behave like a professional repo, and find out where you actually are.

*Starting after midday? Cut in this order: the evening hexagonal read → the CI polish (a
lint+build-only workflow is fine) → one DSA problem instead of two. Do **not** cut the ground-truth
audit; the whole plan is calibrated on those numbers.*

| Time | Block | What |
|---|---|---|
| 09:00 | ① Review | Dojo `/practice/review`. Restart the habit **today** — it's been dormant |
| 09:30 | **Ground truth** | See below. 45 min, and be honest |
| 10:15 | Read | Phase 0 §B.2 (lines 432–563) — DI from zero |
| 11:00 | **Build** | Repo hygiene |
| 12:30 | — | Lunch |
| 13:30 | **Build** | GitHub Actions CI, until green |
| 15:00 | ② DSA | 2 problems |
| 16:30 | Read | Phase 0 §B.3–B.4 + §B.6 |
| 18:00 | ⑤ Write | Commit, push, write tomorrow's first task on paper |
| 19:00 | *optional* | Phase 0 §C.3–C.4 — hexagonal & repository |

### 09:30 — Ground truth (45 min)

Create `PROGRESS.md` at the repo root and fill it in from the **actual dojo**, not memory:

```markdown
# Progress — ground truth, 27 Aug 2026

## DSA (from /dsa — real numbers, not estimates)
| Category | Solved / Total |
|---|---|
| Arrays & Hashing | ? / 31 |
| Two Pointers | ? / 30 |
| Sliding Window | ? / 16 |
| Stack | ? / 18 |
| Monotonic Stack & Queue | ? / 14 |
| Binary Search | ? / 19 |
| … | |
| **TOTAL** | **? / 341** |

## Spaced review
- Items in the queue: ?
- Overdue: ?

## Practice topics (from /practice — per-topic accuracy)
- Weakest three: ?, ?, ?

## Coding ladders
- /coding/java — level reached: ?
- /coding/spring-boot — level reached: ?
```

**Why this matters:** the 12-week plan assumes ~60 DSA problems through Binary Search from
travel week. If the real number is 25, weeks 1–2 absorb the catch-up and week 2's Saturday
sprint is what gives. You cannot make that call without the number.

Commit `PROGRESS.md`. You'll update it at every checkpoint.

### 11:00 — Repo hygiene (90 min)

You have **one commit**. Fix that today.

1. **Husky + lint-staged** — pre-commit runs lint + typecheck on staged files.
2. **commitlint** with `@commitlint/config-conventional` — `feat:`, `fix:`, `chore:`, `docs:`.
3. **`.gitignore` audit** — confirm `.env`, `.env.local`, `generated/`, `*.tsbuildinfo`,
   `.next/`, `dist/` are all ignored. **Verify `apps/api/.env` is not tracked** —
   `git ls-files | grep -i env` should show only the `.example` files.
4. **Commit in slices, not one blob.** The work already on disk is months of it; break it
   into honest commits — `feat(web): problems page`, `feat(dojo): dsa registry`, etc. Your
   commit history is read during hiring.
5. **`docs/adr/` directory** with a `README.md` explaining what an ADR is.

**Verify:** `git log --oneline | wc -l` ≥ 10. A deliberately bad commit message is rejected
by commitlint.

### 13:30 — CI (90 min)

`.github/workflows/ci.yml` — on push and PR to `main`:

```
setup pnpm + node 24 → pnpm install --frozen-lockfile
→ pnpm lint  →  pnpm -r typecheck  →  pnpm build  →  pnpm test
```

Two things you'll hit: `apps/api` has no `typecheck` script (add
`"typecheck": "tsc --noEmit -p tsconfig.json"` to each workspace), and the dojo's test
scripts (`test:generators`, `test:dsa`, `test:scheduling`) are slow — run them in a separate
job, or on a schedule, so CI stays under ~3 minutes.

**Verify:** push a branch, open a PR, watch it go green. A red CI at the end of today is an
acceptable outcome only if you know exactly why.

### 15:00 — DSA (90 min)

2 problems, whatever category you're mid-way through. **Do not start a new pattern** —
Linked List begins Monday. Pattern section first, template re-derived from a blank editor.

### 18:00 — Write (30 min)

Push everything. On paper, write tomorrow's first command. Starting cold costs 20 minutes
you don't have.

---

# DAY 2 · Friday 28 August
## The API spine

**Theme:** everything a production NestJS app has before it has features. This is Phase 0
Part B becoming code.

| Time | Block | What |
|---|---|---|
| 09:00 | ① Review | 15 min |
| 09:15 | Read | Phase 0 Part E (1011–1142). Read + trace, don't type yet |
| 10:00 | **Build 1** | Config + env validation + `main.ts` |
| 12:30 | — | Lunch |
| 13:30 | **Build 2** | Filter, interceptor, Prisma module, `/health` |
| 15:30 | **Build 3** | `apps/web` renders `/health` — first real byte |
| 16:00 | ② DSA | 2 problems |
| 17:30 | Read | Phase 1 §A.1–A.4 (23–192) — **slow lane** |
| 19:00 | ⑤ Write | Commit, push |

### 09:15 — Read Part E (45 min)

Read the coffee-shop app and **trace the five numbered steps** at the end against the code.
Then answer, out loud, the question the guide poses: *why is that unit test possible because
of constructor injection?* If you can't answer it cleanly, re-read §B.2 before you build.

Don't type it — you're about to write the same shapes for real, which is better practice.

### 10:00 — Build 1: config and bootstrap (2.5h)

```bash
pnpm --filter api add @nestjs/config zod class-validator class-transformer
```

1. **`src/config/env.schema.ts`** — a Zod schema for `PORT`, `DATABASE_URL`, `NODE_ENV`,
   `REDIS_HOST`, `REDIS_PORT`. Parse at boot.
2. **`ConfigModule.forRoot({ isGlobal: true, validate })`** — this is §B.6's dynamic module
   in practice. The app must **refuse to start** on a missing or malformed env var, with a
   readable message. Test it: delete `DATABASE_URL` and confirm the failure is clear.
3. **`main.ts`**: global `ValidationPipe({ whitelist: true, transform: true })`, CORS for
   `http://localhost:3000`, `app.enableShutdownHooks()`, port from config (3001).

> **The rule that matters here:** `whitelist: true` strips properties not on the DTO. Know
> why that's a security control and not a convenience — it's a real interview question.

### 13:30 — Build 2: the cross-cutting layer (2h)

1. **`AllExceptionsFilter`** — every error leaves as the same JSON shape
   (`statusCode`, `message`, `path`, `timestamp`, `requestId`). Never leak a stack trace in
   production.
2. **`LoggingInterceptor`** — method, path, status, duration in ms. Generate a `requestId`
   per request and thread it through.
3. **`PrismaModule` + `PrismaService`** — `PrismaService extends PrismaClient` with
   `onModuleInit` → `$connect()`. Global module. *(Import from your generated output path,
   not `@prisma/client` — Trap 1.)*
4. **`/health`** — returns `{ status, uptime, db }` where `db` is a real
   `SELECT 1` round-trip, not a hardcoded `"ok"`. A health check that can't fail is decoration.

Map each of these onto the request lifecycle you read this morning: middleware → guards →
interceptors → pipes → handler → filters. You've now built three of the six stages.

### 15:30 — First real byte (30 min)

In `apps/web`, render `/health` somewhere visible (footer is fine). Confirm
`NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`, and confirm CORS works from the
browser, not just from `curl`.

**Verify:** three terminals — `pnpm infra:up`, `pnpm dev:api`, `pnpm dev:web` — and
localhost:3000 shows live API status. Stop the API; the page degrades cleanly instead of
crashing.

### 17:30 — Phase 1 Part A.1–A.4 (90 min, slow lane)

Tables, ACID, B-tree indexes, `EXPLAIN ANALYZE`. This is tomorrow's substrate and it is the
foundation of Week 3, your named weak spot. Read it properly.

Take one page of notes answering exactly three questions:
1. What does a B-tree index actually store, and why is `LIKE '%x'` unindexable?
2. In `EXPLAIN ANALYZE` output, what are the three things that indicate a problem?
3. Why does a foreign-key column need its own index?

---

# DAY 3 · Saturday 29 August
## The schema — the biggest day of the sprint

**Theme:** design it deliberately, migrate it, read the SQL it generates, fill it with real data.

| Time | Block | What |
|---|---|---|
| 09:00 | ① Review | 15 min |
| 09:15 | Read | Phase 1 §A.5–A.7 + Part E. **Type the bookstore schema** into a scratch file |
| 10:00 | **Build 1** | The CodeArena schema — all models |
| 13:00 | — | Lunch |
| 14:00 | **Build 2** | Migrate, then **read the generated SQL line by line** |
| 15:00 | **Build 3** | Seed — 333 real problems |
| 17:00 | **Build 4** | Prisma Studio + your first hand-written `psql` `EXPLAIN` |
| 18:00 | ② DSA | 4 problems (Saturday double) |
| 19:30 | ⑤ Write | ADR-001 draft |

### 10:00 — The schema (3h)

Design against the frontend contract. Suggested models — but **decide each one yourself and
write the reasoning down**; that reasoning is the deliverable, not the file:

| Model | Key decisions |
|---|---|
| `User` | `String @id @default(cuid())` · `email` + `username` unique · `passwordHash` (never `password`) · `role` enum · Glicko fields (`rating`, `ratingDeviation`, `volatility`) now, so Week 5 needs no migration |
| `Problem` | **`Int @id @default(autoincrement())`** (frontend contract) · `slug @unique` · `difficulty` enum · `description String[]` · `constraints String[]` · `starterCode Json` |
| `ProblemExample` | A real 1-many table with an `order` column — **not** Json. You want the relation practice |
| `Tag` | `name @unique`, implicit many-to-many with `Problem` |
| `TestCase` | `problemId`, `input`, `expected`, `isSample`, `order`. Week 2's sandbox reads this |
| `Submission` | cuid · `userId` · `problemId` · `language` + `verdict` enums · `code` · `runtimeMs` · `createdAt` |
| `SubmissionResult` | Per-test outcome. Week 2 writes it |
| `RefreshToken` | `tokenHash` (never the token) · `family` · `revokedAt` · `expiresAt`. **Monday needs this** — schema it today so Monday is pure logic |

**Two judgment calls to make explicitly:**

- **`starterCode` as `Json` but `examples` as a table.** Defensible: starter code is a
  value object always read whole and never queried by key; examples are ordered rows you
  might paginate or edit individually. Make the call, then defend it in ADR-001. "It
  depends" with a stated reason is the answer interviewers want.
- **Enum casing.** Your enums will be `EASY | MEDIUM | HARD`; the frontend wants
  `"Easy" | "Medium" | "Hard"`. **Map at the boundary, in the DTO — not in the domain, and
  not by contorting the enum.** That is Phase 0 Part C's dependency rule doing real work on
  day one.

**Indexes — add these now, and justify each in one line:**

```prisma
@@index([difficulty])                          // Problem: list filter
@@index([userId, createdAt(sort: Desc)])       // Submission: profile history, cursor-paginated
@@index([problemId, verdict])                  // Submission: acceptance-rate stats
@@index([userId, family])                      // RefreshToken: rotation lookup
```

Every foreign-key column gets an index (§A.3). You'll formalise *why the column order is
that way* in Week 3 — writing them now means Week 3 has something real to measure.

### 14:00 — Migrate and read the SQL (1h)

```bash
pnpm --filter api exec prisma migrate dev --name init
```

Then **open `apps/api/prisma/migrations/*/migration.sql` and read every line.** This is the
single most valuable 20 minutes of the day. It is just `CREATE TABLE`, `CREATE INDEX`,
`ALTER TABLE … ADD CONSTRAINT`. Prisma is a code generator; today you see what it generates.

Add a comment block at the top of the migration folder's README (or an ADR note) answering:
- Which index did Prisma create that you *didn't* ask for, and why?
- What does the `@unique` on `Tag.name` produce in SQL?

### 15:00 — Seed (2h)

You already have 333 problems in the exact target shape:
`apps/web/src/lib/dsa-problems.ts`.

1. **One-off:** convert that array to `apps/api/prisma/seed-data/problems.json`. Do it as a
   throwaway script; the JSON is what gets committed. *(The API must not import from the web
   app — that's a dependency pointing the wrong way.)*
2. **`prisma/seed.ts`** — upsert by `slug` so re-running is idempotent. Create tags from the
   `tags` arrays, wire the many-to-many, insert examples with their order, plus one dev user
   (`amani_dev`) with a hashed password.
3. Wire `prisma.config.ts` / package script so `pnpm --filter api exec prisma db seed` works.

**Verify:** `SELECT count(*) FROM "Problem";` → 333. Run the seed twice; the count doesn't
change. Idempotent seeding is the same idea as Week 4's idempotent job — notice that.

### 17:00 — psql, by hand (1h)

```bash
docker exec -it codearena-postgres psql -U codearena -d codearena
```

Then, without Prisma in the way:

```sql
\dt                                  -- your tables
\d "Problem"                         -- columns, indexes, constraints
SELECT difficulty, count(*) FROM "Problem" GROUP BY difficulty;
EXPLAIN ANALYZE SELECT * FROM "Problem" WHERE difficulty = 'MEDIUM' ORDER BY id LIMIT 20;
```

Read that plan against what you learned in §A.4. At 333 rows Postgres will almost certainly
choose a **Seq Scan** and be right to — the table fits in one page-read. *Understanding why
the index isn't used here is the point.* Week 3 is when 1M rows makes the answer flip.

### 19:30 — ADR-001 (30 min)

*"Why monorepo + bounded-context modules, and the schema decisions behind it."* Cover:
the id strategy split, Json vs relation for starter code and examples, enum mapping at the
boundary, and each index you added with its query.

---

# DAY 4 · Sunday 30 August
## The first real slice, end to end

**Theme:** Phase 0 Part C — ports, adapters, repositories — as working code. Then close the sprint.

| Time | Block | What |
|---|---|---|
| 09:00 | ① Review | 15 min |
| 09:15 | **Build 1** | Problems module, hexagonal |
| 12:30 | — | Lunch |
| 13:30 | **Build 2** | e2e test against the running container |
| 14:30 | **Build 3** | Wire `apps/web` — delete the mocks |
| 16:00 | **Gate** | Run the checklist below |
| 16:45 | ⑤ Write | Finalise ADR-001, write ADR-000 |
| 17:30 | Retro | Week 1 prep |
| 18:30 | Read | Phase 1 §B.1–B.3 — priming pass, no notes |
| 19:15 | ② DSA | 4 problems |
| 20:15 | **Stop** | |

### 09:15 — The Problems module (3h)

Structure it as the hexagon you read Thursday night:

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
- `GET /problems?cursor=&limit=&difficulty=&tag=&q=` — **cursor-paginated**, because you
  read §A.5 yesterday and this is where it gets used.
- `GET /problems/:slug` — 404 via `NotFoundException`, rendered by Friday's filter.

The provider wiring is the coffee-shop app's `{ provide: PROBLEMS_REPOSITORY, useClass:
PrismaProblemsRepository }`, one-for-one.

**The audit that proves it worked:** grep the domain and application folders for `prisma`.
Zero hits, or the hexagon leaked. That check takes ten seconds and is the whole point of the
architecture.

### 13:30 — e2e test (1h)

`test/problems.e2e-spec.ts` against the real running stack: list returns 20 with a cursor,
the cursor returns the *next* 20 with no overlap, a bad `limit` gets 400 from the
ValidationPipe, an unknown slug gets 404 in your filter's shape.

Then a **unit test** for `ProblemsService` with a fake in-memory repository — no database,
milliseconds. That test existing at all is the payoff for the port; note how it feels
compared to the e2e one.

### 14:30 — Wire the frontend (90 min)

Replace `getProblems()` and `getProblem()` in `apps/web/src/lib/api.ts` with real `fetch`
calls to `NEXT_PUBLIC_API_URL`. **Delete the mock implementations** — don't comment them out.

The rest of `lib/api.ts` (auth, runCode, profile) stays mocked until its week. That's fine;
delete each one the week its endpoint lands.

Check the loading states still work. The mock's fake 700ms delay is gone, so a real fast
response may make skeletons flash — that's a real problem with a real fix, and it's worth
15 minutes.

### 16:00 — The gate

- [ ] `pnpm infra:up && pnpm dev:api && pnpm dev:web` → localhost:3000 lists problems **from Postgres**
- [ ] `GET /problems?cursor=…` paginates correctly, no duplicates across pages
- [ ] Unknown slug → 404 in your exception filter's JSON shape
- [ ] `/health` reports a real database round-trip
- [ ] App refuses to boot on a missing env var, with a readable message
- [ ] `SELECT count(*) FROM "Problem";` → 333; seeding twice changes nothing
- [ ] Zero `prisma` imports in `problems/domain/` or `problems/application/`
- [ ] e2e + unit tests pass; CI green on `main`
- [ ] ≥10 commits, conventional format, husky blocking bad ones
- [ ] `PROGRESS.md`, ADR-000, ADR-001 committed

**If the gate fails:** Monday morning finishes it, and Week 1's Saturday sprint is what
gives. Write down which box failed and why — in `PROGRESS.md`, not in your head. The last
plan died from debt that nothing reacted to.

### 17:30 — Retro + Week 1 prep (60 min)

In `PROGRESS.md`: what took longer than expected, what you skipped, what you'd do differently.
Then set Monday up — `docs/phase-1` open at line 285, the auth section of `apps/web`
identified, `RefreshToken` model confirmed in the schema.

### 18:30 — Priming read (45 min)

Phase 1 §B.1–B.3. **Once, lightly, no notes.** You're buying Monday's first hour, not
studying tonight.

---

## What Monday looks like

**Week 1 · Mon 31 Aug → Sun 6 Sep — Auth, end to end. Depth week, slow lane.**

- Argon2id (not bcrypt — be ready to defend it), register/login/refresh/logout
- Refresh-token rotation **with reuse detection** — replaying a used token kills the family
- httpOnly cookies, `AuthGuard` + `@Roles()`, rate limiting on the auth routes
- Saturday: TanStack Query migration; `lib/api.ts` deleted from the repo
- DSA: Linked List, 12 of 15 · Java: 45 min/day, `/coding/java` levels 1–2

You arrive Monday with the schema, the guard-shaped hole in the pipeline, and the vocabulary
already once-read. That's the entire purpose of this sprint.

---

## Rules for these four days

1. **The dojo is frozen.** You'll be in it daily for review and DSA. You will notice things
   you want to improve. Write them in `IDEAS.md` and close the file.
2. **Type, don't paste** — including from your own guides.
3. **Commit at every block boundary.** Five small commits a day, conventional messages.
4. **Every design decision gets one written line.** If you can't write the line, you haven't
   made the decision, you've made a default.
5. **Scope is locked.** No auth, no sandbox, no queues, no UI redesign, no Docker
   multi-stage optimisation. Those all have weeks assigned.
6. **Stop at the stated time on Sunday.** Monday is a depth day and it starts at full strength.
