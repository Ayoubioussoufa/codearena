# CodeArena — The 12-Week Hiring Sprint
### Thu 27 Aug 2026 → Sun 22 Nov 2026

Supersedes `WEEK-PLAN.md` (Jul 19 → mid-Aug). That plan's pacing philosophy survives
intact; its schedule does not, because the build fell ~3 weeks behind and the phase
order it inherited optimises for *interesting* rather than for *hireable*.

---

## 0. The audit this plan is built on

Read on 27 Aug 2026 from the repo itself, not from the plan documents.

| Area | State |
|---|---|
| `apps/dojo` | **Complete and over-delivered.** 341 DSA problems / 20 patterns · ~96 generators · 11 coding ladders (java + spring-boot already authored) · FSRS-lite spaced review · AI teacher with `system-design` / `coding-interview` / `amazon-behavioral` modes · 8,322 lines of supplements |
| `apps/web` | **Complete but fake.** All 14 `TODO(practice)` gaps closed (verified: zero markers left in `src`). `lib/api.ts` is a `setTimeout` mock. Nothing calls a server |
| `apps/api` | **Bare `nest new` scaffold.** 5 files, returns "Hello World!" |
| `apps/api/prisma/schema.prisma` | **Zero models** |
| `packages/shared` | `export {}` |
| Git | 1 commit (Aug 9). No CI, no husky, no conventional commits |
| Last real edit | **Aug 2** — 25 days ago |

**The conclusion.** The learning apparatus is finished. The product is not started.
Every hour from here goes into the product, into raw SQL, into DSA retrieval, and
into Java — and *zero* hours go into building more dojo. The dojo is now a thing you
**consume**, never a thing you **extend**. Adding a generator feels like progress and
is not; it is the most seductive form of procrastination available to you, because it
is real engineering pointed at the wrong target.

---

## 1. Seven deviations from the current plan

**1. Freeze the dojo. Completely.**
No new generators, no new DSA problems, no new supplements, no UI polish. If you find
a bug that blocks study, fix it in under 30 minutes or work around it. This is the
highest-value line in this document.

**2. `apps/api` is now the critical path, and everything else waits behind it.**
Weeks 1–2 are a schema-and-slice sprint with a hard stop. Until CodeArena has a real
Postgres schema and a real authenticated endpoint that `apps/web` calls, nothing else
counts as progress.

**3. Phases 3–6 get cut, not deferred.**
The roadmap's back half (recommendation engine, IRT, CQRS contests, Winnowing
plagiarism detection) is the intellectually interesting part and the hiring-irrelevant
part. Glicko-2 and FSRS survive because they're pure functions, cheap to build, and
already fully explained in `docs/phase-3`. Everything else moves to a written "here's
how I'd build it" section in `DESIGN.md` — which is worth ~90% of the interview value
at ~5% of the cost.

**4. Raw SQL needs a real database with real cardinality.**
Seven quiz generators and a phase guide teach you the *vocabulary* of `EXPLAIN`. They
cannot teach you to read a plan, because there's no plan to read. Week 3 seeds
CodeArena's Postgres with ~1M submissions and you spend the week optimising queries
against actual row counts. Prisma-first will never produce this fluency; you have to
drop to `psql`.

**5. Java as a 30-min daily habit will not make you hireable in Java.**
It makes you *conversational*. The route to hireable is one real service. Weeks 9–11
port a bounded context of CodeArena to Spring Boot — same domain, same API contract,
JPA instead of Prisma, JUnit + Testcontainers instead of Jest — plus a written
comparison. That artifact is a top-1% interview story for a junior backend role, and
it is the reason Java is scheduled *late* rather than *parallel*.

**6. Start applying in Week 7, not after Week 12.**
Pipelines take 4–8 weeks to convert. Early rejections are free calibration. Applying
from a position of "product deployed, still shipping" beats applying from "finished
studying" — and the first five interviews will teach you more about your gaps than
another 200 DSA problems.

**7. Design for ~10h/day over 6.5 days, not 12 over 7.**
12 focused hours daily for 12 straight weeks is not a plan, it's a way to lose weeks
6 and 7 to burnout. This plan budgets ~62h/week with a hard consolidation half-day and
one full day off per fortnight. If you consistently hit 55, you are ahead of most
people who claim 12.

---

## 2. Why this sequence (the dependency argument)

The three tracks are ordered so each one becomes the *substrate* of the next rather
than competing with it.

```
SQL / Postgres  ──────►  Distributed mechanics  ──────►  System design vocabulary
   (weeks 1–4)              (weeks 5–8)                     (weeks 6–10)
        │                        │                                │
        └────────────────────────┴────────────────────────────────┘
                    all three are learned BY BUILDING CodeArena
                                       │
DSA ────────────────────────────────────────────────────────────────► (constant, weeks 1–12)
Java ── daily drip (w1–8) ──────────────────► Spring Boot sprint (w9–11)
```

- **SQL before system design.** You cannot reason honestly about read replicas,
  caching, or when to shard if you don't know what a sequential scan costs. Every
  system-design answer about databases is bluffing until you've read a query plan.
- **Build the distributed pieces before naming them.** Weeks 5–8 you build a queue, a
  sandbox, a WebSocket fan-out, a Redis leaderboard. Weeks 6–10 you learn the formal
  vocabulary — *idempotency, at-least-once, backpressure, cache stampede, eventual
  consistency* — and retro-fit it onto things you already have running. Learning that
  vocabulary abstractly first is 3× slower and produces answers that collapse under
  one follow-up question.
- **DSA is constant because it's the only track governed by forgetting curves.** It
  cannot be crammed. Everything else can be sequenced; this one has to drip.
- **Java is late because two half-built stacks beat nothing but lose to one finished
  one.** The TS product is the gate.

---

## 3. The retention model

The rule this plan enforces: **no more than 4 hours of genuinely new material per day.**
The other 6 are application, retrieval, and writing — which is where retention actually
happens.

Every new concept must clear four gates before it counts as learned:

1. **Typed, never pasted.** (Your existing rule. It's correct.)
2. **Used in CodeArena within 72 hours.** Unapplied theory evaporates.
3. **Written up in your own words** in `docs/adr/` — one ADR minimum per week.
4. **Fed to the dojo review queue** so FSRS resurfaces it before you forget it.

### Weekday template — ~10h

| Block | Time | What |
|---|---|---|
| ① Review | 0:30 | Dojo `/practice/review` SRS queue (15 min) + 1 system-design drill (15 min, from W6). **Never cut.** |
| ② DSA | 2:00 | 2 problems, pattern section first, template re-derived from a blank editor. From W3: one of them re-solved in Java |
| ③ Deep new material | 3:30 | The week's primary domain. Slow lane. Type everything |
| ④ Build | 3:30 | CodeArena — applying block ③. This is where ③ actually sticks |
| ⑤ Write | 0:30 | ADR note / commit messages / update the week's checklist |

**Saturday (~9h):** the week's single biggest build deliverable, uninterrupted + 4 DSA.
**Sunday (~5h, half-day):** consolidation only — **no new material.** Cold self-quiz on
the week's guide, one AI-teacher mock interview, retro, next week's plan, 4 DSA. Then stop.
**Every second Sunday:** full day off. Not optional.

### When a day collapses
Cut in this order: ④ build → ③ new material → ② DSA. **Never** ① review. The SRS queue
you've fed since July is a compounding asset; skipping it is the only irreversible loss
in the whole plan.

---

## 4. The twelve weeks

### Week 0 — Thu 27 → Sun 30 Aug · RESET (4 days)

Not a study week. A "stop the bleeding" sprint. The goal is to end August with a real
backend heartbeat so Week 1 starts from momentum instead of guilt.

- **Thu 27** — Ground truth. Open `/dsa` and `/practice`, write down your **real** solved
  count per category and your review-queue size into `PROGRESS.md`. Then: `git init`
  hygiene — husky pre-commit (lint + typecheck), conventional commits, GitHub Actions CI
  (lint · typecheck · build · test). Push. *You have one commit; fix that today.*
- **Fri 28** — `apps/api` bootstrap for real: `ConfigModule` with Zod-validated env, global
  `ValidationPipe`, exception filter, logging interceptor, `/health` endpoint. Docker
  Compose service wired. `apps/web` calls `/health` and renders it. **First real
  end-to-end byte.**
- **Sat 29** — The Prisma schema, all of it, in one sitting: `User`, `Problem`, `Tag`,
  `TestCase`, `Submission`, `SubmissionResult`, `RefreshToken`. Migration generated,
  **the generated `.sql` read line by line** (`docs/phase-1` Part E is the reference).
  Seed script with ~50 problems pulled from the dojo registry.
- **Sun 30** — Problems module end-to-end: controller → service → repository port →
  Prisma adapter. List + detail. DTO validation. One e2e test hitting the container.
  Point `apps/web`'s problems page at the real API — **delete those mock functions.**
  Retro + write ADR-001 *"Why monorepo + bounded-context modules"*.

> **DSA this sprint:** 2/day, whatever pattern you're mid-way through. Don't start a new one.

**✅ Gate:** `docker compose up` → real Postgres → real API → `apps/web` renders problems
from the database. CI green on `main`. If this isn't true Sunday night, Week 1 opens by
finishing it, and Week 1's Saturday sprint is sacrificed.

---

### Week 1 — Mon 31 Aug → Sun 6 Sep · AUTH, END TO END
**Depth week. Slow lane.**

- **New material (3.5h/day):** `docs/phase-1` Parts B + C — password hashing, sessions vs
  tokens, JWT anatomy, access/refresh rotation, XSS vs CSRF, RBAC, "parse don't validate".
  Cross-read: OWASP Authentication Cheat Sheet.
- **Build (3.5h/day):** the whole auth story. Argon2id (not bcrypt — be ready to defend
  the choice), register/login/refresh/logout, refresh-token rotation **with reuse
  detection**, httpOnly cookies, `AuthGuard` + `@Roles()`, rate limiting on the auth
  routes. Wire `apps/web` login/register to the real thing; delete `authenticate()` from
  the mock.
- **Saturday:** TanStack Query migration — every page in `apps/web` off mocks and onto the
  real API. `lib/api.ts` mock file **deleted from the repo** by Saturday night.
- **DSA:** Linked List — 12 of 15. (Pointer manipulation; the dojo's `Harness` serialization
  makes these painless.)
- **Java:** 45 min/day on `/coding/java` levels 1–2.
- **ADR-002:** *"Refresh token rotation and what happens on reuse."*

> **Slow down here.** Auth is the single most-interrogated backend topic at junior level,
> and "we used JWTs" without knowing *why the refresh token rotates* is a visible tell.
> Budget the extra day if you need it.

---

### Week 2 — Mon 7 → Sun 13 Sep · THE JUDGE, PART 1 (sandbox)
**Deepest week of the quarter. Genuinely new, genuinely hard.**

- **New material (4h/day):** `docs/phase-2` Parts A–C — threat model, namespaces, cgroups v2,
  capabilities, seccomp, why Docker is not a sandbox by default, why the runner is a separate
  process. Cross-read: the gVisor "Why Containers Don't Contain" post; Judge0's isolate docs.
- **Build (3h/day):** the execution worker as a separate service. Hardened container per
  submission: `--network=none`, read-only rootfs, `--pids-limit`, memory + CPU cgroup caps,
  dropped capabilities, non-root user, seccomp profile, wall-clock kill. Language runners for
  JS + Python first.
- **Saturday:** **attack your own sandbox.** Write `test/adversarial/` — fork bomb, infinite
  loop, 4GB allocation, `fetch()` to the host, filesystem escape attempt, `/etc/passwd` read.
  Each must be contained and reported cleanly. This test file is a portfolio artifact on its own.
- **DSA:** Trees — 16 of 21.
- **Java:** 45 min/day, `/coding/java` level 3.
- **ADR-003:** *"The trust boundary: what a hostile submission can and cannot do."*

> **Slow down hard.** This is the most technically distinctive thing in your entire project.
> Almost no junior candidate has built a sandbox and can talk about seccomp. Spend the time;
> the story pays for itself in every interview.

---

### 🔍 CHECKPOINT A — Sun 13 Sep

Binary, self-assessable. No partial credit.

- [ ] `docker compose up` gives a working product: register → log in → browse problems → submit code → **sandboxed execution** → result stored and displayed
- [ ] Zero mock data anywhere in `apps/web`
- [ ] Refresh rotation demonstrated: replaying a used refresh token revokes the family
- [ ] All 6 adversarial sandbox tests pass
- [ ] You can explain, from a blank whiteboard: what a namespace is, what a cgroup limits, and why `--network=none` matters — without notes
- [ ] CI green, ≥25 commits, 3 ADRs written
- [ ] DSA: Linked List + Trees done; review queue clear

**If ≥2 fail:** Week 3 becomes a catch-up week and you push everything back one. Do not
carry debt forward silently — that's how the last plan broke.

---

### Week 3 — Mon 14 → Sun 20 Sep · SQL FOR REAL
**The week you specifically asked for. Highest leverage on this list.**

The premise: you will never learn `EXPLAIN` against 50 seeded rows. So first, make the
database big.

- **Monday (build):** write `prisma/seed-large.ts` — **1M submissions**, 50k users, 2k
  problems, realistic skew (a few hot problems, most users with few submissions). Use
  `COPY` / `generate_series`, not 1M Prisma inserts. Then `ANALYZE`.
- **New material (3.5h/day):**
  - **Use The Index, Luke** (use-the-index-luke.com) — free, the indexing bible. Chapters
    1–4 are non-negotiable: B-tree structure, the *leading-column rule*, why
    `WHERE a=? AND b>?` orders your composite index, index-only scans, `LIKE 'x%'` vs `'%x'`.
  - **Postgres docs — "Using EXPLAIN"** + **explain.dalibo.com** to visualise your own plans.
  - **Haki Benita's blog** (hakibenita.com) for practical Postgres performance patterns.
- **Practice (1.5h/day):** **pgexercises.com** — all 81 exercises. Free, superbly designed,
  joins → aggregates → **window functions** → recursive CTEs. This is your raw-SQL gym.
  Then **DataLemur** free tier for interview-shaped SQL.
- **Build (2h/day) — CodeArena as the lab.** For each, capture `EXPLAIN (ANALYZE, BUFFERS)`
  before and after into `docs/perf/`:
  1. Problems list with tag filter + difficulty + sort — kill the seq scan
  2. User submission history — cursor pagination, not `OFFSET 50000`
  3. Leaderboard top-100 — where the composite index goes and why
  4. "Solved by user" — find and fix the N+1 Prisma generates
  5. A partial index (`WHERE status='ACCEPTED'`) and prove it's smaller and faster
  6. One query where you **drop out of Prisma** into `$queryRaw` and justify it in writing
- **Saturday:** transactions day. Isolation levels against your real DB: open two `psql`
  sessions and *reproduce* a dirty read attempt, a non-repeatable read, a phantom, and a
  serialization failure. Then implement the submission-write path with the right isolation
  level and a documented reason.
- **DSA:** DFS (13) + BFS start — 20 total.
- **Java:** 45 min/day, `/coding/java` levels 3–4 (Collections contracts, `equals`/`hashCode`).
- **ADR-004:** *"Six queries, six plans"* — a before/after write-up. **This becomes a blog post
  and it is the single best interview artifact in this entire plan.** A junior candidate who
  can say "here's a query I made 40× faster and here's the plan proving it" is in a different
  bucket than one who says "I know about indexes."

> **Slow down.** This is your named weakness and it's a permanent skill. If Week 3 runs
> long, take the extra days from Week 4.

---

### Week 4 — Mon 21 → Sun 27 Sep · QUEUES, REALTIME & THE JUDGE, PART 2

- **New material (3h/day):** `docs/phase-2` Parts D–F — BullMQ, idempotency, at-least-once
  vs at-most-once, retries with exponential backoff, DLQ, backpressure, WebSocket rooms.
  Cross-read: BullMQ docs on job lifecycle + stalled jobs.
- **Build (4h/day):** submission pipeline end to end — API enqueues, worker consumes, results
  stream to the browser over WebSocket. **Idempotency key per submission** (re-delivery must
  not double-judge — prove it with a test). Retry policy, DLQ, a `/admin/queue` view.
- **Saturday:** failure engineering. Kill the worker mid-job; kill Redis; submit 500 jobs at
  once. Document what breaks and what recovers in `docs/perf/failure-modes.md`.
- **DSA:** BFS finish + Tries (6 of 12) + Heap start — 17 total.
- **Java:** 45 min/day, Streams + `Collectors` (`/coding/java` level 4).
- **ADR-005:** *"Why BullMQ and not Kafka"* — a real trade-off answer, not a preference.

> **Breadth is enough** on Kafka/RabbitMQ/SQS. Know the one-line difference and when you'd
> reach for each. Do not go build a Kafka cluster.

---

### Week 5 — Mon 28 Sep → Sun 4 Oct · RATING, REVIEW & THE REDIS LEADERBOARD

The last "features" week. Everything here is cheap and high-signal.

- **New material (2.5h/day):** `docs/phase-3` — Elo → Glicko → Glicko-2, and FSRS. **Skip Item
  Response Theory entirely** (cut). Plus `docs/phase-5` §Redis sorted sets only.
- **Build (4.5h/day):**
  - Glicko-2 as a **pure function** in `packages/shared`, with **property-based tests**
    (fast-check): rating is monotonic in outcome, RD never exceeds its cap, a win against a
    higher-rated opponent gains more than against a lower one. Property tests here are a
    genuine differentiator — almost no junior brings them up.
  - FSRS scheduling for the review feature — **use `ts-fsrs` as a dependency**, don't
    reimplement. This is deliberate: it gives you the domain context for the OSS contribution.
  - Redis sorted-set leaderboard (`ZADD`/`ZREVRANGE`/`ZRANK`), O(log N), with the write path
    documented.
- **Open source starts (Fridays, 3h, hard time-box):** `ts-fsrs` — you're now a real user of
  it. File one good issue or one small PR (a test case, a doc clarification, a genuine bug).
- **DSA:** Recursion & Backtracking — 12 of 15.
- **Java:** 45 min/day → switch to `/coding/spring-boot` levels 1–2.
- **ADR-006:** *"Glicko-2 over Elo, and why the rating job is idempotent."*

> **Breadth is enough** on the rating math. You need to explain *why* RD exists and what
> happens to an inactive player. You do not need to derive the Glicko-2 volatility iteration.

---

### 🔍 CHECKPOINT B — Sun 4 Oct

- [ ] **CodeArena is feature-complete for the MVP story**: auth, problems, sandboxed judge, queue, realtime results, rating, leaderboard, spaced review
- [ ] `docs/perf/` contains ≥6 before/after query plans with measured improvements
- [ ] You can answer, out loud, in under 2 minutes each: *why is that index composite in that order?* · *what does `EXPLAIN` show when it's wrong?* · *what happens if the worker dies mid-job?* · *why does the refresh token rotate?*
- [ ] 81/81 pgexercises done
- [ ] DSA: ~135 problems, 13 patterns
- [ ] 6 ADRs · one OSS issue or PR filed
- [ ] Java: `/coding/java` levels 1–4 cleared

---

### Week 6 — Mon 5 → Sun 11 Oct · DEPLOY + SYSTEM DESIGN (formal)

The pivot week: from building to being *seen*.

- **Build (4h/day, first half of week):** ship it. Containers → a cloud host (Railway or
  Fly.io — pick the one that gets you to a URL fastest; this is not the week to learn
  Kubernetes). Managed Postgres + Redis, CI/CD on merge to `main`, a real domain, HTTPS,
  Sentry, structured logging, `/health` + `/metrics`. **A deployed URL beats two more features.**
- **New material (3h/day, second half):** your own `system-design-fundamentals.md` (1,001
  lines, 9 worked designs). Read it properly now — it will land completely differently
  because you've *built* the caching, the queue, and the leaderboard it describes. Pay
  special attention to **worked design #2 (code-submission judge)** and **#9 (leaderboard)**:
  those are literally your project, and they are your interview opener.
  - Cross-read: `system-design-primer` (GitHub) for breadth · **DDIA chapters 1–5 only**
    (ch. 5 replication and ch. 7 transactions are the two that pay; skip the rest for now).
- **CV + portfolio pass (Saturday):** README with architecture diagram and the deployed link,
  a 90-second demo video, CV rewritten around *shipped artifacts* not *technologies listed*.
- **DSA:** Graphs — 14 of 17.
- **Java:** `/coding/spring-boot` level 3.
- **OSS Friday:** MCP TypeScript SDK — farm `good first issue`. Target one PR.

> **Breadth is enough** for: CAP, consistent hashing, CDNs, NoSQL flavours, microservices.
> Recognise-and-discuss level. You are targeting junior/mid — nobody will ask you to shard
> a global write path.

---

### Week 7 — Mon 12 → Sun 18 Oct · APPLICATIONS OPEN + DSA RAMP

- **Applications (2h/day, every day):** 10 quality applications/day. Backend-first, but take
  full-stack roles — your `apps/web` is real. Track in a sheet: company, role, date, source,
  status. Referrals > cold applies; ask on every LinkedIn connection you have.
- **New material (2h/day):** system design continued — daily self-drill from the supplement's
  §"Daily self-drill". One design/morning, 25 minutes, whiteboard, no notes.
- **Build (2h/day):** whatever the deploy shook loose. Real users find real bugs; fix them.
- **DSA ramps to 4/day (3h):** Intervals (9) + Greedy (9) — 18 total.
- **Mocks:** 3× this week using the dojo teacher (`system-design`, `coding-interview`,
  `amazon-behavioral`). Record yourself. Watching it back is unpleasant and works.
- **Java:** `/coding/spring-boot` levels 4–5 + `java-spring-boot.md` §§1–9.

---

### Week 8 — Mon 19 → Sun 25 Oct · DP + INTERVIEW CONVERSION

- **DSA (4h/day):** Dynamic Programming, part 1 — 10 problems. 1D first (climbing stairs →
  house robber → coin change), then the grid family.
  > **Slow down.** DP is where rusty candidates lose offers. Do fewer problems, more slowly,
  > and re-derive the recurrence from scratch each time. 10 owned beats 25 skimmed.
- **New material (2h/day):** `cs-fundamentals.md` (600 lines) — processes vs threads, deadlock,
  TCP/UDP, DNS/HTTP, isolation levels, OOP/SOLID. This is the "second-round fundamentals"
  screen and your supplement covers it well.
- **Applications (2h/day):** 10/day continues. Follow up on week-7 sends.
- **Build (1.5h/day):** maintenance + `interview-playbook.md` — write out your **STAR stories**:
  the sandbox, the 40× query, the idempotent queue, a real production bug. Six stories, written.
- **Java:** finish `java-spring-boot.md` §§10–12 (the worked feature slice, every file typed).

---

### 🔍 CHECKPOINT C — Sun 25 Oct

- [ ] **Deployed and reachable at a real URL**, with monitoring
- [ ] CV + README + demo video done · ≥80 applications sent
- [ ] ≥6 mock interviews completed, ≥3 recorded and reviewed
- [ ] Six STAR stories written out
- [ ] You can whiteboard **your own system** in 25 minutes, cold, including the trade-off you'd revisit at 100× traffic
- [ ] DSA ~175, 17 patterns · DP started
- [ ] 1–2 OSS PRs open or merged
- [ ] Java/Spring supplement finished, both coding ladders cleared

---

### Weeks 9–11 — Mon 26 Oct → Sun 15 Nov · THE SPRING BOOT PORT

Three weeks. The goal is not "know Java" — it's **one real Spring Boot service you can
defend**, which is what makes the second stack credible.

**What to port:** the Submissions bounded context (or Users + Problems if you want an easier
on-ramp). Same OpenAPI contract as the Nest version. New repo or `services/judge-java/`.

- **Week 9** — Project setup (Spring Initializr, Maven, layered structure), REST controllers,
  DTOs as records + Bean Validation, `@Service`/constructor injection, global
  `@RestControllerAdvice`. JPA entities mirroring the Prisma schema.
  **DSA:** DP part 2 — 13 problems, finish the pattern.
- **Week 10** — The hard parts, slowly: **the persistence context** (why an entity is dirty-checked,
  what `flush` does), **`@Transactional` proxy semantics** (why it does nothing on a private or
  self-invoked method — a classic interview trap), **JPA's N+1** and `JOIN FETCH` / `@EntityGraph`
  as the fix. Spring Security with JWT. Then **Testcontainers** — real Postgres in your test suite,
  which is a level above what most juniors show.
  **DSA:** Bit (6) + Math (7) + Game theory (3) — 16 total, **breadth only, do not linger**.
- **Week 11** — Finish, test (JUnit 5 + Mockito + Testcontainers, all three layers), and write
  **`COMPARISON.md`**: NestJS vs Spring Boot on DI, transactions, ORM philosophy, testing,
  startup time, ecosystem. Where each is better. *This document is the artifact.* An
  interviewer asking "you know both — which would you pick?" gets a real answer with receipts.
  **DSA:** mixed timed sets — 20 problems, 35-minute timer, random pattern.

Throughout weeks 9–11: **applications 2h/day, interviews take priority over everything.**
Reading: *Effective Java* items 1–20 and 42–48 only · Baeldung targeted (search, don't browse) ·
Spring official guides. **OSS Fridays end at week 11** — if nothing has merged, stop and write
about your sandbox instead; that's worth more anyway.

---

### 🔍 CHECKPOINT D — Sun 15 Nov

- [ ] Spring Boot service **running**, same contract as the Nest version, tested with Testcontainers
- [ ] `COMPARISON.md` written
- [ ] You can explain: the persistence context · why `@Transactional` fails on self-invocation · how you fixed JPA's N+1
- [ ] DSA ~210 problems, all 20 patterns touched
- [ ] ≥150 applications · interviews in flight

---

### Week 12 — Mon 16 → Sun 22 Nov · SHARPEN

No new material. At all.

- **DSA (4h/day):** timed mocks only — 15 problems, 40-min timer, mixed. Plus the dojo review
  queue, which is now a large, well-tuned deck.
- **System design (2h/day):** one full 45-min design/day from the supplement's 9 worked
  designs, out loud, recorded.
- **Behavioural (1h/day):** the six STAR stories, out loud, until they're 90 seconds and boring.
- **Build (1h/day):** polish the deployed app. Fix anything an interviewer would click on.
- **Applications:** whatever the pipeline needs.
- **Sunday 22:** retro on the whole quarter. Write the next 12 weeks.

---

## 5. Depth vs. breadth — the explicit call

| **SLOW DOWN — depth pays** | **BREADTH IS ENOUGH — recognise & discuss** |
|---|---|
| Postgres indexing, composite index column order, `EXPLAIN ANALYZE` | NoSQL flavours; when you'd pick each |
| Transaction isolation levels + the anomalies they prevent | CAP theorem beyond the one-liner |
| Auth: rotation, reuse detection, where tokens live | OAuth2 / OIDC flows (know the names) |
| The sandbox threat model: namespaces, cgroups, seccomp | Kubernetes (**skip entirely**) |
| Queue idempotency, at-least-once, DLQ | Kafka / RabbitMQ / SQS internals |
| NestJS DI, module boundaries, provider scopes | GraphQL, gRPC (name-level) |
| Trees, Graphs, DFS/BFS, **DP** | Bit manipulation, math/geometry, game theory |
| Spring: persistence context, `@Transactional` proxies, JPA N+1 | Spring Cloud, microservice patterns |
| Your own system's design + its trade-offs | Consistent hashing, CDNs, sharding |
| Property-based testing on pure functions | MLOps, the Python AI service |

---

## 6. The cut list (and what replaces each)

| Cut | Why | Replaced by |
|---|---|---|
| Phase 4 — recommendation engine | High effort, near-zero junior hiring signal | 1-day read + one ADR: *"how I'd build it"* |
| Item Response Theory / 2PL | Pure math, never asked | Nothing |
| Phase 5 — CQRS contests | Weeks of work for a feature nobody will click | Keep only the Redis leaderboard (2 days) |
| Phase 6 — Winnowing plagiarism detection | Genuinely fun, genuinely irrelevant to the hire | ADR describing the approach |
| Any new dojo development | Feels like progress, isn't | Consume the dojo, extend nothing |
| Python AI service / MLOps / AI-security layer | Out of a 12-week horizon | — |
| `aptitude-reasoning.md` (753 lines) | Only relevant if you target ESN/service-company pipelines that screen with aptitude tests | 3h in week 11 **if** those are on your list |
| Judge0 feature contribution | Ruby + C, slow review cycle, weeks of ramp | Issue with a repro + docs PR, max |

---

## 7. Resources, named

**SQL / Postgres** — use-the-index-luke.com (free, ch. 1–4 mandatory) · pgexercises.com (81
exercises) · Postgres docs "Using EXPLAIN" · explain.dalibo.com · hakibenita.com ·
modern-sql.com (window functions, CTEs) · DataLemur free tier

**DSA** — your dojo (341 problems, 20 patterns) · `dsa-patterns.md` (837 lines) · NeetCode 150
as a cross-check list. *Skip Cracking the Coding Interview — it's dated.*

**System design** — your `system-design-fundamentals.md` (1,001 lines, 9 worked designs — this
is better than most paid courses) · github.com/donnemartin/system-design-primer ·
**DDIA ch. 1–5** only · ByteByteGo vol. 1 if you want a second voice

**NestJS** — official docs (Fundamentals + Techniques + Testing) · `docs/phase-0` (1,237 lines) ·
`nestjs.md` supplement · `/coding/nest` ladder

**Java / Spring** — `java-spring-boot.md` (589 lines, with a fully annotated feature slice) ·
`/coding/java` + `/coding/spring-boot` ladders · Spring official guides · Baeldung (search,
never browse) · *Effective Java* items 1–20, 42–48 · Testcontainers docs

**Sandboxing** — `docs/phase-2` · gVisor's "Why Containers Don't Contain" · Judge0's isolate docs ·
Docker security docs

---

## 8. Open source — realistic framing

Time-boxed to **Friday afternoons, 3h, weeks 5–11** (~21h total). Not more. One merged PR is a
nice CV line; nobody is hired on OSS drive-bys, and your own sandbox is more impressive than a
typo fix in someone else's repo.

| Target | Realistic goal | Why this order |
|---|---|---|
| **ts-fsrs** — `open-spaced-repetition/ts-fsrs` | 1 PR: a test case, doc fix, or a real bug you hit | Small, active, TS, and you'll be a genuine *user* from week 5. Highest merge probability |
| **MCP TypeScript SDK** — `modelcontextprotocol/typescript-sdk` | 1–2 PRs from `good first issue` | Fast-moving, welcoming, and MCP is a current, conversation-starting topic |
| **Judge0** — `judge0/judge0` | One issue with a clean reproduction; docs PR at most | Ruby + C, slow review cycle. **Do not plan a feature PR.** Your own sandbox work is the better story here |

**Stop rule:** nothing merged by week 11 → stop, and write a technical blog post about your
sandbox instead. Same signal, fully under your control.

---

## 9. Risks, named

1. **Dojo relapse.** The highest-probability failure. You will get an idea for a great generator.
   Write it in `IDEAS.md` and do not open the file. *Mitigation: the freeze is absolute.*
2. **Week 6–7 burnout.** Weeks 2 and 3 are brutal, and the crash lands two weeks later.
   *Mitigation: the fortnightly full day off is load-bearing, not a nicety.*
3. **Perfectionism on the sandbox.** It can absorb infinite time. *Mitigation: week 2 ends
   Sunday regardless of how elegant it is.*
4. **Java sprawl.** Three weeks buys one good service, not a second full platform.
   *Mitigation: port one bounded context. One.*
5. **Applying too late.** *Mitigation: week 7 is a hard start date, ready or not.*
6. **Silent debt.** Last plan's failure mode: a missed milestone that nothing reacted to.
   *Mitigation: checkpoints are binary and have a stated consequence.*

---

## 10. What "genuinely hireable" looks like on Nov 22

Not a topic list — a set of things you can put in front of someone:

- A **deployed URL** where a stranger can sign up, submit code, and watch it judged in a sandbox
- `docs/perf/` — six query plans with measured before/after, and the reasoning
- `test/adversarial/` — six attacks on your own sandbox, all contained
- Two implementations of the same service, **TypeScript and Java**, with a written comparison
- ~210 DSA problems with a live spaced-repetition deck behind them
- Ten ADRs — decisions with defended trade-offs
- 1–2 merged OSS PRs
- Six STAR stories that are 90 seconds and boring

Anyone can list NestJS and Spring on a CV. Almost nobody at your level can hand over
that list.
