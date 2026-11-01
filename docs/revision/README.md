# Refresher week · Thu 29 Oct → Sun 1 Nov 2026

This is the CodeArena block of week 1 in `~/bcgx-prep/SPRINT.md`, compressed into four days
because the week starts on Thursday. The goal is to get back everything you built between July and
September, so that by Sunday you can explain any part of CodeArena **without notes**, defend each
decision by naming what you rejected, and **rebuild it from a blank folder**.

Each day has three moves: **re-learn** a part of CodeArena, **fix** its issues, then **build the
same thing again from scratch** in a small practice project, [Upsolve](build-upsolve.md).

Nothing in this folder fixes your code. Where something is broken, you get the symptom, a way to
reproduce it and hints. **The fix is yours.**

## How to use it

1. Open the part **and the code** side by side. Every question names the file its answer lives in.
2. **Answer out loud before you open the fold.** Commit to a guess; a wrong answer you said
   teaches more than a right one you read.
3. Mark each question: ✅ clean · 🟡 slow · ❌ didn't know. Copy the 🟡 and ❌ ones into a
   scratch list; Sunday re-asks them.
4. 🔧 means **do it with your hands**. Predict the result first, then run it.
5. 🐛 means **an issue in your code, yours to fix**: write the failing test first, then the fix,
   then one commit. Open the hints one at a time and only when you're stuck.

## The day, in order

The clock times are a template: shift them if you need to, but keep the order.

| Time | Block | What |
|---|---|---|
| 09:00–09:30 | ① Review | the dojo's `/practice/review` queue and today's rows in `~/cp/misses.md`. **Never cut** |
| 09:30–12:00 | ② CP | the day's block (next table) |
| 12:00–13:00 | lunch | away from the screen |
| 13:00–14:00 | ③ System design | the day's sections of `apps/dojo/content/supplements/system-design-fundamentals.md`, each explained out loud without notes |
| 14:00–15:30 | ④ CodeArena: re-learn | the day's part, every question answered out loud |
| 15:30–16:30 | ④ CodeArena: fix | that part's 🐛 issues |
| 16:30–17:00 | break | |
| 17:00–20:30 | ⑤ Upsolve: build | the same topics again, from scratch, in [Upsolve](build-upsolve.md), with CodeArena closed |

Why this order:

- **CP first.** Timed problem solving needs your freshest hours, and SPRINT protects the review
  and CP over everything else.
- **System design after lunch.** Reading and explaining out loud suits the post-lunch dip better
  than coding does.
- **Re-learn, fix, then build, back to back.** What you re-learn at 14:00 you rebuild blind at
  17:00: still fresh in your head, but no longer on your screen.

## The four days

| Day | ② CP | ③ System design | ④ CodeArena | ⑤ Upsolve |
|---|---|---|---|---|
| **Thu 29 Oct** | Block 02 · Strings | §0 the words · a framework for any design question · back-of-envelope estimation | [Part 1](1-skeleton.md): run it from zero, the monorepo, the skeleton, ports and adapters · I-1 to I-5 · Git Part 1 | from `git init` to green CI |
| **Fri 30 Oct** | Block 03 · Two Pointers | latency numbers · availability in nines · caching and its update patterns | [Part 2](2-auth.md): auth · I-6 to I-9 · Git Part 2 | auth, race-free |
| **Sat 31 Oct** | a Div. 3 virtual contest (2h) + upsolving (1h) | load balancing and stateless services · reverse proxy · DNS | [Part 3](3-data-and-web.md) + [Part 4](4-judge.md), the short path below · I-10 to I-14 · Git Part 3 | ownership, pagination, CI with a database |
| **Sun 1 Nov** | Block 04 · Sliding Window (2h) + Checkpoint 1 (1h) | Design #1, the URL shortener, out loud | [Part 5](5-checkpoint.md): the checkpoint (1h45) | freeze (1h) |

Sunday runs ① ② ③ in the same order, then part 5, then the freeze, and ends with you sending
`start week of 2 Nov`.

**What the late start costs:** one CP block. Sliding Window moves to Sunday, so Checkpoint 1 gets
one hour (do its 🟡/🟠/🔴 redos first, as `checkpoints.md` says), and Sunday's mock coding interview
moves to Sun 8 Nov. The rate-limiter design moves to week 2, whose system-design track covers rate
limiting anyway.

**Saturday's short path:** two parts in 2h30, so do part 3's §1 (Q1–Q5), §2 (the trace, Q10–Q12)
and its 🐛 items, then part 4's §3 (the sandbox by hand) and §4 (ADR-006). The rest moves to Monday
(part 3's TanStack questions, part 4's §1, §2 and §5). Monday starts with `phase-2`
reading anyway.

The days are full. If one collapses, cut in this order: the bottom of that day's Upsolve list (it
has its own cut order) → the 🐛 issues marked *week 2* or *week 3* (they wait anyway) → the
Spot-the-bug snippets in part 2. **Never cut** running CodeArena from zero, I-1, I-6, Upsolve's CI
and race-free rotation, or Sunday's blank page.

## What exists today (checked on 28 Oct, commit `b06c097`)

| Part | State | Evidence |
|---|---|---|
| `apps/api` | Auth chain complete: register, login, refresh rotation with reuse detection, logout, a global guard, roles, rate limits. Problems list and detail with cursor pagination. `/health` | 20 unit tests pass · 18 e2e tests pass **once [I-1](#issues) is fixed** |
| `apps/web` | `/problems`, `/problems/[slug]`, `/login` and `/register` use the real API through TanStack Query. Leaderboard, profile, contests, settings and **Run** are still mocks (`src/lib/api.ts`) | builds |
| `apps/worker` | Scaffold: a Nest application context, the `CodeRunner` port and `FakeCodeRunner`. Prints one fake verdict and exits | boots |
| `packages/shared` | empty (`export {}`) | |
| Postgres | 2 migrations, 333 problems seeded, **no hidden tests** (examples only) | |
| Redis | running, used by nothing yet (BullMQ arrives in week 2) | |
| CI | 3 jobs: build, api-e2e, dojo-content. **It has never run on your September commits**: they were never pushed through a PR | GitHub Actions history |
| `apps/dojo` | frozen: use it, never extend it | |

The direction changed on 29 Oct: CodeArena becomes a **LeetCode + Codeforces hybrid**. Read
[ADR-006](../adr/006-leetcode-codeforces-hybrid.md) on Saturday. It's marked *Proposed*
because the decision is yours to rewrite and accept.

<a name="issues"></a>
## Issues found on 28 Oct: yours to fix

Every one was reproduced against the running code, and every probe was reverted afterwards. The
part column says where the hints are.

| # | Issue | How you'll see it | Part |
|---|---|---|---|
| I-1 | The e2e suites can't load the generated Prisma client, so CI's `api-e2e` job will fail on the first push to `main` | `pnpm --filter api test:e2e` → 3 suites fail: `Cannot find module './internal/class.js'` | 1 |
| I-2 | `start:prod` runs a file the build never writes | `pnpm --filter api build && pnpm --filter api start:prod` → `MODULE_NOT_FOUND` | 1 |
| I-3 | Every validation error reaches the client as `"Bad Request Exception"` | register with a 5-character password, then read the body | 1 |
| I-4 | A fresh clone doesn't know where the API is: `NEXT_PUBLIC_API_URL` is set nowhere, and `apps/web/.gitignore` would ignore an example file | `pnpm dev:web` → `/problems` says "Could not reach the API" | 1 |
| I-5 | Nest's "Hello World" controller, service and their two tests are still wired in | `curl localhost:3001/` → `Hello World!` | 1 |
| I-6 | Two refreshes sent at the same time with the same token **both succeed** | 10 out of 10 trials returned `200/200` | 2 |
| I-7 | Two tabs restoring a session at the same time can log the user out | reasoning, in part 2 | 2 |
| I-8 | Three behaviours that no test protects | the mutation table in part 2 | 2 |
| I-9 | A comment in `app.module.ts` gives the wrong reason for the guard order | move the guard: every test still passes | 2 |
| I-10 | If the cursor's row is deleted, pagination silently stops | `GET /problems?limit=2&cursor=5` → `{"items":[],"nextCursor":null}` though 333 problems have higher ids | 3 |
| I-11 | A full last page costs one extra empty request | reasoning, in part 3 | 3 |
| I-12 | Logout answers `200` with an empty body, and the web client parses it as JSON | `curl -i -X POST localhost:3001/auth/logout` → `Content-Length: 0` | 3 |
| I-13 | `useMe` is a mutation, not a query | `hooks/use-auth.ts` | 3 |
| I-14 | Dead code: `PROBLEMS` in `data.ts`, and all of `dsa-problems.ts` (11,327 lines), which nothing imports | `grep -rn "PROBLEMS\b" apps/web/src` | 3 |
| I-15 | The list endpoint sends 6.5× what the list page shows: 305 KB instead of 47 KB for 333 problems | measure it in the Network tab | 3 → week 3 |
| I-16 | The refresh-token index `(userId, family)` can't serve `revokeFamily`'s `WHERE family = …` | predicted, not measured: prove it with `EXPLAIN` in week 3 | 3 → week 3 |
| I-17 | Killing `docker run` doesn't stop the container | `timeout -s KILL 2 docker run …` → the container was still `Up` afterwards | 4 → week 2 |
| I-18 | The web editor offers JavaScript, but the database's `Language` enum has no `JAVASCRIPT` | compare `apps/web/src/lib/types.ts` and `schema.prisma` | 4 → week 2 |

Two ADRs also say more than is true: ADR-003 (when two-device reuse bites) and ADR-004 (`Secure`
cookies on localhost). ADRs are never edited; when you fix I-7, write a new one that supersedes
them.

## Know it cold vs. name it

Adapted from the roadmap's "depth vs breadth" call, now including the pivot.

| **Know it cold**: explain, defend, name the rejected alternative | **Name it**: one sentence, and where it would fit |
|---|---|
| Refresh rotation, reuse detection, and the race in yours (I-6) | OAuth2 / OIDC flows |
| Where each token lives; XSS vs CSRF; every cookie attribute | CAP beyond the one-liner |
| Argon2id vs bcrypt vs SHA-256; the dummy-hash timing defence | Kafka, RabbitMQ, SQS internals |
| Ports and adapters; Nest DI tokens; module encapsulation | Kubernetes |
| Composite-index column order, `EXPLAIN`, cursor vs offset | GraphQL, gRPC |
| Namespaces vs cgroups; what each `docker run` flag stops; the wall-clock kill | gVisor, Firecracker |
| Queue idempotency and at-least-once delivery (week 2) | Codeforces dynamic scoring, hacks |
| ICPC standings and score packing (ADR-006) | the Glicko-2 equations |
| **Your own system, end to end** | IRT, the recommender, Winnowing |

## Done when

From SPRINT.md's week 1, the CodeArena parts:

- [ ] the whole stack starts from a clean state and **every** test passes (that means I-1 is fixed)
- [ ] without notes, you can explain:
  - refresh rotation and reuse detection;
  - why the refresh token is in an httpOnly cookie and the access token isn't;
  - what the guard does with a missing or expired token;
  - how one page gets its data, from the click to the SQL
- [ ] you ran namespaces and cgroup limits by hand, and can say what each one stops
- [ ] at least five issues fixed, each as a failing test first and then one commit. **I-1 and
  I-6 are mandatory**
- [ ] CodeArena drawn from a blank page and explained for 10 minutes, recorded
- [ ] ADR-006 rewritten in your words and accepted, or rejected with your reasons
- [ ] Upsolve frozen: CI green on its `main`, a README in your words, `COMPARE.md` written, and
  the *peeked* list turned into Monday's first hour

Then send **`start week of 2 Nov`**.

## The shelf

| Resource | For |
|---|---|
| [PortSwigger Web Security Academy](https://portswigger.net/web-security) | web security, with labs |
| [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) | "what should I do?" for any security question |
| [Use The Index, Luke](https://use-the-index-luke.com) | SQL indexing; chapters 1–4 are week 3 |
| [MDN: cookies, CORS, HTTP](https://developer.mozilla.org/) | the browser reference |
| [TkDodo's blog](https://tkdodo.eu/blog/) | React Query, by its maintainer |
| *Designing Data-Intensive Applications*, chapters 3 and 7 | storage engines and transactions |
