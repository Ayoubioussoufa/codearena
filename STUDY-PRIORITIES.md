# Study Priorities — everything we used, ranked by career value

Every concept that came up on **Sat 29 Aug 2026**, ordered by how much it will matter across your
whole career — not by how much you needed it today.

**The ranking principle:** how long the knowledge stays true, and how far it transfers. Postgres
indexes will be the same in 2040 and apply in every language. Prisma's schema syntax is worth a lot
to you this month and nothing in five years if you move to Django.

**Tier 3 is not "unimportant"** — it's what pays your rent right now. It's just *replaceable*.

Each entry has: what it is · why it ranks there · **where you hit it today** · where to study it.

---

# Tier 1 — Foundations

*Transfer to every language and framework. Never go stale. Interviewers probe them constantly.
If your free time is limited, all of it goes here.*

## 1. Debugging methodology

**What:** reading an error message literally, forming one hypothesis, testing it in isolation,
and verifying by *breaking* the thing on purpose.

**Why #1:** it's the only skill that makes every other skill usable. A senior engineer isn't
someone who knows more — it's someone who converges on the cause faster. It's also the hardest to
learn from a book, because it's only built by debugging.

**Today:** `exports is not defined in ES module scope` named neither Prisma nor module format. We
got there by asking *which file, compiled how, loaded by what*. Then the stale-server trap — three
wrong diagnoses because port 3001 was held by an old process and we kept testing dead code. The
lesson that cost the most: **when a change appears to have no effect, verify you're running the new
code before theorising.**

**Study:** you can't read this one. Practice: next bug, write down your hypothesis *before* testing.
Track how often you're right. That number rising is the whole skill.

## 2. Relational database fundamentals

**What:** tables, rows, primary keys, foreign keys, joins, normalisation, transactions.

**Why here:** ~50 years old and unchanged. Every backend job. Every system design interview. The
single most durable technical knowledge in this list.

**Today:** designed 7 tables, learned what a foreign key *is* (a column holding another table's id —
that column **is** the relationship), why many-to-many needs a join table, `onDelete: Cascade`.

**Study:**
- `docs/phase-1` **§A.1** lines 25–59 — tables and why relational won
- `docs/phase-1` **§A.2** lines 60–91 — transactions and ACID
- Dojo → [/practice/sql-data](http://localhost:3002/practice/sql-data)
- Book: *SQL Antipatterns* (Karwin) — short, practical, unusually good

## 3. Indexes and query performance

**What:** what an index is, B-trees, sequential scans, composite column order, `EXPLAIN`.

**Why here:** the #1 cause of "the app got slow", and a guaranteed interview topic. Separates people
who can operate a database from people who can only call one.

**Today:** added four indexes with a justification each. Learned FKs need indexes explicitly
(Postgres makes them for PKs and `@unique`, not FKs), and that composite order is a phone book —
equality columns first, range/sort second.

**Study:**
- `docs/phase-1` **§A.3** lines 260–315 — the phone book insight, B-trees
- `docs/phase-1` **§A.4** lines 316–359 — reading `EXPLAIN ANALYZE`
- Do the S4 stretch: `EXPLAIN ANALYZE` on your seeded table and understand why 333 rows gets a
  **Seq Scan** and that's correct
- *Use The Index, Luke* (use-the-index-luke.com) — free, the best resource on this anywhere

## 4. Dependency injection and the dependency rule

**What:** classes declare dependencies instead of building them; dependencies point inward toward
stable code.

**Why here:** the idea behind Spring, .NET, Angular, and every testable codebase. Framework-agnostic.
It's what "clean architecture" actually means underneath the branding.

**Today:** every `constructor(private readonly x: Y)` you typed. Tomorrow's U1 makes it visible —
the Symbol token exists *because* TypeScript interfaces are erased at runtime.

**Study:**
- `docs/phase-0` **§B.2** lines 432–563 — DI from zero, in four steps
- `docs/phase-0` **§C.3** lines 779–870 — hexagonal architecture
- `docs/phase-0` **§C.4** lines 871–889 — the repository pattern
- **Build U1 first, then read these.** They'll land far harder with the code in front of you.

## 5. Git beyond the daily four commands

**What:** the object model, reflog, recovering destroyed work, history rewriting, `--force-with-lease`.

**Why here:** used every day of your career, and the recovery skills convert a catastrophe into ten
minutes. Most developers never learn them.

**Today:** you `reset --hard` one commit too far and destroyed seven staged files. We recovered all
of it — the commit from `origin/main` and reflog, the files from **dangling blobs** via `git fsck`.
The lesson: **`git add` is itself a backup.** Staged content is written to the object store and
survives for ~2 weeks. Work never staged has no blob and is genuinely gone.

**Study:**
- `apps/dojo/content/supplements/git-workflow.md` — your own merged guide, with diagrams
- Dojo → [/practice/git](http://localhost:3002/practice/git) — 48 drills
- *Pro Git* ch. 10 "Git Internals" (free at git-scm.com) — makes everything else obvious

## 6. Security fundamentals for web apps

**What:** mass assignment, insecure direct object references, secret handling, error leakage,
password storage.

**Why here:** career-limiting in the wrong direction if absent. One leaked secret or one missing
authorization check is a company-level incident. Always asked in interviews.

**Today, four of them:**
- **Mass assignment** — `whitelist: true` strips undeclared properties. Without it, `role: "ADMIN"` in a body can reach a database write
- **IDOR** — why `User.id` is a cuid and `Problem.id` is sequential. Guessable user ids let anyone enumerate your users
- **Error leakage** — the filter returns a generic message for 5xx; stack traces expose file paths and library versions
- **Secrets** — `.env` gitignored, `passwordHash` never `password`, `tokenHash` never the token. A committed secret is unrecoverable: **rotate first**, scrub second

**Study:**
- OWASP Top 10 (owasp.org) — read it once a year, forever
- `docs/phase-1` **§B.1** lines 452–488 — hashing, salting, why bcrypt/argon2
- Dojo → [/practice/auth-security](http://localhost:3002/practice/auth-security)

---

# Tier 2 — High leverage

*Very valuable, slightly more ecosystem-bound. Study after Tier 1 is comfortable.*

## 7. TypeScript's type system

**What:** generics, `infer`, `extends` vs `implements`, strictness flags, type-vs-value syntax.

**Why here:** TypeScript is the default for new JS work and the type system is where the value is.
The concepts transfer to any statically-typed language.

**Today:** `z.infer<typeof schema>` (deriving a type from a value) · `extends PrismaClient` vs
`implements OnModuleInit` **on the same class** · `exactOptionalPropertyTypes` and why `?` and
`| undefined` mean different things · the `;` vs `,` bug — semicolons in a *type*, commas in an
*object*.

**Study:**
- `docs/phase-0` **§A.1** lines 28–113 — strict flags, all of them
- `docs/phase-0` **§A.2** lines 114–210 — generics
- `docs/phase-0` **§A.3** lines 211–264 — conditional types and `infer`
- **Total TypeScript** (Matt Pocock) — free tier, best explanations anywhere
- Dojo → [/practice/typescript](http://localhost:3002/practice/typescript)

## 8. Validation at boundaries

**What:** "parse, don't validate" — convert untrusted input into a typed value once, at the edge.

**Why here:** the pattern outlives any library. Applies to HTTP bodies, env vars, config files,
message queues, third-party API responses.

**Today:** the whole of S1. The app now **refuses to start** on a bad env var instead of dying on
the first request at 3am.

**Study:**
- `docs/phase-1` **§C.1** lines 654–692
- zod.dev — short and example-first
- Search the essay "Parse, don't validate" (Alexis King) — the origin of the phrase

## 9. Schema migrations

**What:** versioned, ordered, append-only changes to a database structure.

**Why here:** every production system needs them, and the discipline (never edit an applied
migration) prevents real disasters.

**Today:** generated `init` and read the SQL — `CREATE TABLE`, `CREATE UNIQUE INDEX`,
`ALTER TABLE ADD CONSTRAINT FOREIGN KEY`, and `_ProblemToTag`, the join table Prisma made for you.

**Study:** `docs/phase-1` **§A.7** lines 431–445. Then: what would a migration that *renames a
column with zero downtime* look like? That's the real-world version.

## 10. Idempotency

**What:** an operation that has the same effect run once or many times.

**Why here:** the property that makes retries safe. Underpins job queues, webhooks, payments,
distributed systems. Small idea, enormous reach.

**Today:** `upsert` keyed on `slug`. We ran the seed three times: 333 problems, 20 tags, 713
examples — unchanged every time.

**Study:** `docs/phase-1` **§A.6** lines 402–430 for the N+1 neighbour. Then read about idempotency
keys in Stripe's API docs — the canonical real-world example.

## 11. HTTP API design

**What:** status codes, pagination, error shapes, DTOs, the request lifecycle.

**Why here:** you'll design or consume APIs daily for your entire career.

**Today:** a uniform error shape · a health check that can genuinely fail · **cursor vs offset
pagination** — offset gets slower with depth *and* duplicates rows when data shifts under you.

**Study:** `docs/phase-1` **§A.5** lines 360–401 · `docs/phase-0` **§B.4** lines 600–636 for the
lifecycle.

---

# Tier 3 — Your current stack

*Real value now, replaceable later. Learn by building, not by studying.*

## 12. NestJS

Decorators, modules, providers, DI container, lifecycle hooks, pipes, filters, guards, `@Global()`.

**Today:** all of it except guards. The `@Module` decorator, `forRoot()` as a dynamic module,
`onModuleInit`, `ValidationPipe`, `useGlobalFilters`.

**Study:** **docs.nestjs.com → Overview**, in order (First steps → Controllers → Providers →
Modules). It's a real tutorial, not reference. Then `docs/phase-0` **Part E** lines 1122–1253 — a
complete worked app.

## 13. Prisma

Schema DSL, relations, the generated client, `upsert`, `connectOrCreate`, nested writes, and
Prisma 7's **driver adapters**.

**Today:** the schema, the migration, the seed, and two Prisma-7-specific traps —
`moduleFormat = "cjs"` and `datasourceUrl` no longer existing.

**Study:** Prisma docs → Getting Started → Quickstart, then the Prisma Client API reference. Note
how much of it is Tier-1 database knowledge wearing a TypeScript coat — that's the part worth
internalising.

## 14. Zod

Schemas, `coerce`, `parse` vs `safeParse`, `infer`, refinements.

**Today:** the whole env schema. `z.coerce.number()` because **every environment variable is a
string**.

**Study:** zod.dev, top to bottom. It's an hour and you'll have the whole library.

## 15. Module systems — ESM vs CommonJS

`import`/`export` vs `require`/`module.exports`, `"type": "module"`, why they don't mix.

**Today:** the error that blocked you for an hour. Prisma generated ESM into a CommonJS app; Node
detected the ESM syntax, switched parsers, and died on `exports`.

**Why Tier 3 despite the pain:** it's a decade-long JavaScript migration that will eventually end.
Painful now, historical later. Learn enough to diagnose it.

**Study:** Node docs → "Modules: Packages" — specifically how `"type"` and file extensions decide.

---

# Tier 4 — Tooling

*Learn on demand. Reading ahead is mostly wasted.*

## 16. Docker & Docker Compose

Images vs containers, volumes, port mapping, health checks.

**Today:** `pnpm infra:up`, and **why Postgres is on host port 5433** — a native Postgres already
owns 5432, so Compose maps `5433:5432`.

**Study:** `docs/phase-0` **§D.2** lines 987–1007.

## 17. Monorepos and pnpm

Workspaces, `--filter`, `-r`, the content-addressed store, why dependency direction matters.

**Today:** every `pnpm --filter api` command, and the rule that **`apps/api` must not import from
`apps/web`** — which is why the seed data became committed JSON rather than an import.

**Study:** `docs/phase-0` **§D.1** lines 970–986 · the monorepo section of
`2-DAY-SPRINT-PRIMER.md`.

## 18. Linting, formatting, git hooks, CI

ESLint, Prettier, husky, lint-staged, commitlint, GitHub Actions.

**Today:** your pre-commit hook caught 20 formatting errors and one unsafe `any` before they
reached a commit.

**Study:** `REPO-HYGIENE-GUIDE.md`. The idea worth keeping: **hooks are fast feedback, CI is the
gate.**

---

# Day 2 additions — what Sunday 30 Aug taught

Sunday added five topics and deepened three you already had. Slotting them into the same tiers.

## New — Tier 1

### Layered architecture: ports, adapters, the dependency rule

**Sits with #4 (dependency injection)** — it's the same principle, applied to whole modules.

You built it: `domain/` importing nothing, a port naming a need, an adapter translating Prisma rows
into your types, a service that never learns what a database is. The `grep -r "prisma" domain/
application/` returning zero hits is the audit that proves it.

**Why Tier 1:** this is Spring, .NET and Django too. The names change, the arrows don't.

**Study:** the dojo guide
[Backend Architecture](http://localhost:3002/guides/backend-architecture) — especially Part 5, the
four-question procedure for deciding where code goes. Then `docs/phase-0` **§C.3** lines 779–870.

## New — Tier 2

### Testing strategy: unit vs e2e, and why the port makes it possible

`new ProblemsService(fakeRepo)` — ten lines, no database, milliseconds. That only works because the
service takes its dependency rather than constructing one.

**The lesson:** if your unit tests are slow, your architecture leaked. Speed is a design signal, not
just convenience.

**Study:** `apps/dojo/content/supplements/testing.md` · Dojo →
[/practice/testing](http://localhost:3002/practice/testing)

### CI as the enforcement gate

**Promoted from Tier 4.** You built it, and the distinction is now concrete:

> Hooks are fast feedback. CI is the gate.

Bypassable with `--no-verify`, not installed on a fresh clone, runs in *your* environment — three
structural reasons a hook can never be the boundary. Also learned: pin CI to your `engines` floor
(Node 20), not your laptop's version.

**Study:** GitHub Actions docs → "Understanding GitHub Actions". Then read your own `ci.yml` and
explain each line.

### API contract design

Cursor vs offset pagination · DTOs as the validation boundary · uniform error shapes · mapping
domain enums to display strings *at the HTTP edge*.

**The sharpest lesson:** offset pagination doesn't just get slow — it **duplicates rows** when data
shifts under you. Your 4-request loop returning 333 items with **0 duplicates** is the proof that
`skip: 1` works.

**Study:** `docs/phase-1` **§A.5** lines 360–401.

## Deepened

### Debugging (#1) — three new lessons, all earned painfully

1. **When your editor and `tsc` disagree, `tsc` is right.** The `Cannot find name 'describe'` error
   didn't exist for the compiler — a stale TS server. The suggested fix would have had you install
   a package you already had.
2. **Verify you're running the new code before theorising.** A stale server held port 3001 and
   caused three wrong diagnoses.
3. **Read the real type, not the tutorial.** `datasourceUrl` didn't exist in Prisma 7. Opening the
   generated `PrismaClientOptions` settled in seconds what searching couldn't.

### Git (#5) — branch switching and what it touches

> Switching branches rewrites **tracked** files. **Untracked** files stay put.

That asymmetry cost you three files: `git commit -am` on a throwaway branch swept up real work,
and switching back reverted it. Recovered with `git checkout <hash> -- <files>` because the commit
was still in the object store.

**Two rules from it:** never `-a` when unrelated work is in flight, and always `git diff --staged`
before committing.

### TypeScript (#7) — inference cycles

`TS7022: implicitly has type 'any' because it is referenced directly or indirectly in its own
initializer` — a genuine circular inference, where an annotation is the **correct** fix, not a
workaround.

**The distinction worth keeping:** an annotation TypeScript *verifies* is legitimate. An `as` that
*disables* checking is the one to be suspicious of.

Also: `exactOptionalPropertyTypes` makes `?: string` and `?: string | undefined` different types.

---

# If you only get four hours a week

| Week | Focus |
|---|---|
| 1–2 | **Indexes** (#3) — `docs/phase-1` §A.3–A.4, then `EXPLAIN ANALYZE` your own seeded tables |
| 3–4 | **DI + dependency rule** (#4) — `docs/phase-0` §B.2 and §C.3, *after* building U1 |
| 5 | **Security** (#6) — OWASP Top 10, then find the four you already handled in your own code |
| 6 | **Git internals** (#5) — *Pro Git* ch. 10, then the dojo's 48 git drills |
| ongoing | **TypeScript** (#7) — Total TypeScript, 20 min a day |

Everything in Tier 3 you'll learn by building tomorrow and next week. Don't study it separately.

---

## The one meta-lesson from today

Four of the five S1 bugs, and three of the four S2 bugs, were **gaps in the instructions**, not
failures of understanding. When something doesn't work, the two live hypotheses are always *"I did
it wrong"* and *"the instructions are wrong"* — and today the second was more often true.

Checking the actual source (`PrismaClientOptions`, the Zod version, the generated client) settled
in minutes what guessing couldn't. **Read the real thing, not the tutorial about it.** That habit
is most of the gap between Tier 1 and Tier 3.
