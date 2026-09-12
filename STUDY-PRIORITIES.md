# Study Priorities — ranked by career value

Every concept this project has actually made you use, ordered by how much it will matter across
your whole career — not by how much you needed it on the day.

**The ranking principle:** how long the knowledge stays true, and how far it transfers. Postgres
indexes will be the same in 2040 and apply in every language. Prisma's schema syntax is worth a lot
to you this month and nothing in five years if you move to Django or Spring.

**Tier 3 is not "unimportant"** — it's what pays your rent right now. It's just *replaceable*.

---

## How to use this

Each entry has five parts:

| | |
|---|---|
| **What** | the concept, in one line |
| **Why here** | the case for its rank — read this when you're deciding what to skip |
| **Where you hit it** | the moment in *your own code* that taught it. Concrete beats abstract |
| **🎤 Can you defend it?** | the questions you'll actually be asked. **This is the point of the file** |
| **Study** | where to go, most useful first |

> **Applications open in Week 7.** From now on, the test for "do I know this?" is not *can I read
> it* — it's **can I explain it out loud, with a rejected alternative, without notes.** That's why
> every Tier 1 and Tier 2 entry carries questions. Answer them into a voice memo. The ones where
> you stall are your real study list.

Jump to **[the self-assessment](#the-self-assessment--20-questions)** to find out where you stand
before reading anything.

---

# Tier 1 — Foundations

*Transfer to every language and framework. Never go stale. Interviewers probe them constantly.
If your free time is limited, all of it goes here.*

## 1. Debugging methodology

**What:** reading an error literally, forming one hypothesis, testing it in isolation, and
verifying by *breaking* the thing on purpose.

**Why #1:** it's the only skill that makes every other skill usable. A senior engineer isn't
someone who knows more — it's someone who converges on the cause faster. It's also the hardest to
learn from a book, because it's only built by debugging.

**Where you hit it:** repeatedly, and expensively.

- `exports is not defined in ES module scope` named neither Prisma nor module format. Getting there
  meant asking *which file, compiled how, loaded by what*.
- A **stale server on port 3001** caused three wrong diagnoses — you were testing dead code.
- `Cannot find name 'describe'` appeared three separate times from a **stale TS server**, while
  `tsc` was clean throughout.
- `revokeFamily` with `revokedAt: null` in the `data` block **un-revoked** the family it existed to
  kill. `tsc` was perfectly happy.

**The four rules this project earned:**

> 1. **When a change appears to have no effect, verify you're running the new code before theorising.**
> 2. **When your editor and the compiler disagree, the compiler is right.**
> 3. **Read the real type, not the tutorial about it.** Opening the generated `PrismaClientOptions`
>    settled in seconds what searching couldn't.
> 4. **A green `tsc` proves shape, never meaning.**

**🎤 Can you defend it?**
- *"Tell me about the hardest bug you've debugged."* — you have four good answers above. Pick the
  `revokedAt: null` one: it's short, it type-checked, and it was a security failure.
- *"How do you approach a bug you have no idea about?"*
- *"How do you know when to stop investigating and ask for help?"* — see `GETTING-UNSTUCK.md`.

**Study:** you can't read this one. Practice: next bug, write the hypothesis *before* testing.
Track how often you're right. That number rising is the whole skill. Keep the log — it **is** the
answer to the first question above.

## 2. Relational database fundamentals

**What:** tables, rows, primary keys, foreign keys, joins, normalisation, transactions.

**Why here:** ~50 years old and unchanged. Every backend job. Every system design interview. The
single most durable technical knowledge in this list.

**Where you hit it:** designed 7 tables; learned that a foreign key is a column holding another
table's id — *that column **is** the relationship*; why many-to-many needs a join table;
`onDelete: Cascade` (which is why deleting a test user in the e2e teardown also clears their
refresh tokens).

**🎤 Can you defend it?**
- *"What's a foreign key, and what does it actually enforce?"*
- *"Walk me through ACID."*
- *"When would you denormalise?"*

**Study:**
- `docs/phase-1` **§A.1** lines 25–59 · **§A.2** lines 60–91
- Dojo → [/practice/sql](http://localhost:3002/practice/sql)
- Book: *SQL Antipatterns* (Karwin) — short, practical, unusually good

## 3. Indexes and query performance

**What:** what an index is, B-trees, sequential scans, composite column order, `EXPLAIN ANALYZE`.

**Why here:** the #1 cause of "the app got slow", and a guaranteed interview topic. Separates people
who can *operate* a database from people who can only call one.

**Where you hit it:** `@@index([userId, family])` on `RefreshToken` — chosen for the rotation
lookup, and the column order is not arbitrary. `tokenHash` is `@unique`, which is both a constraint
and an index, which is why `findUnique` is the right call there.

**🎤 Can you defend it?**
- *"Why is `WHERE b = 1` slow on an index of `(a, b)`?"* — the phone-book question.
- *"What does an index cost you?"* (writes, storage — an index is not free)
- *"How would you find out why a query is slow?"*

**Study:** `docs/phase-1` **§A.3–A.4** lines 260–359. Then `EXPLAIN ANALYZE` your own seeded
tables — 333 problems is enough rows for the plan to change.

## 4. Dependency injection and the dependency rule

**What:** a class declares what it needs; something else decides what to give it. Dependencies
point *inward*, toward the code that changes least.

**Why here:** this is Spring, .NET, Angular and Django too. The names change, the arrows don't.
It's also the single idea that makes testing possible.

**Where you hit it:** `AuthService` names `PasswordHasher`, never `Argon2Hasher`.
`RefreshTokenService` names `RefreshTokenRepository`, never `PrismaRefreshTokenRepository`. The
proof it worked: **20 unit tests in 1.0 seconds**, with no Nest, no database and no argon2.

> **The test that settles where code goes:** *if I swapped Postgres for Mongo, which files change?*
> Only `adapters/`. If anything else would, the rule is broken somewhere.

**🎤 Can you defend it?**
- *"Why not just `new PrismaUsersRepository()` inside the service?"*
- *"What does the interface buy you at runtime?"* — **nothing**; it's erased. It buys you the
  compile-time contract and the swap. Getting this right is a real signal.
- *"Why does your port need a `Symbol` but your service doesn't?"*

**Study:** `docs/phase-0` **§B.2** lines 432–563 and **§C.3** lines 779–870 · dojo
[Backend Architecture](http://localhost:3002/guides/backend-architecture), especially the
four-question procedure for deciding where code goes.

## 5. Applied cryptography for authentication · **NEW**

**What:** the three operations people confuse — **hashing** (one-way), **signing** (tamper-evident,
not secret), **encryption** (reversible, secret) — and knowing which problem each solves.

**Why Tier 1:** it is the difference between "I used a library" and "I understood the threat".
Every backend role touches it, the concepts outlive every library, and getting it wrong is the kind
of mistake that makes the news.

**Where you hit it:** three different primitives in one feature, each for a different reason.

| | Used for | Why that one |
|---|---|---|
| **Argon2id** | passwords | memory-hard, so GPUs can't parallelise cheaply |
| **SHA-256** | refresh tokens | fast is fine — 32 random bytes have no dictionary to guess |
| **HMAC-SHA256** | JWT signatures | proves *we* issued it; the payload stays readable |

You also proved a JWT is **signed, not encrypted** by decoding one with `Buffer.from(..., 'base64url')`
— no secret, no library.

**🎤 Can you defend it?**
- *"Why not SHA-256 for passwords?"* — because it's **fast**, and speed is the attacker's budget.
- *"Why Argon2 rather than bcrypt?"* — bcrypt's work factor scales time only; memory stays at 4 KiB,
  and GPU attacks are memory-cheap. (Your [ADR-002](docs/adr/002-argon2id-for-passwords.md).)
- *"You hash passwords slowly but refresh tokens fast. Isn't that inconsistent?"* — **the best
  question in this file.** No: slowness defeats *guessing*, and a random token has nothing to guess.
- *"Can I read a JWT you issued?"* — yes. That's why nothing private goes in the payload.

**Study:** `docs/phase-1` **§B.1** lines 452–488 · your own ADR-002 and ADR-003 · dojo
[/practice/auth](http://localhost:3002/practice/auth)

## 6. The browser security model · **NEW**

**What:** XSS, CSRF, the same-origin policy, cookie flags (`httpOnly`, `Secure`, `SameSite`,
`Path`), and CORS — including why CORS stops accepting `*` the moment credentials are involved.

**Why Tier 1:** it's the threat model of *every* web application, in any framework, and it's one of
the most reliable interview topics because so many candidates have only cargo-culted it.

**Where you hit it:** Task 4.1, as a decision you had to argue rather than a setting you copied.

> `localStorage` is readable by any JavaScript on the page → one XSS and the token is gone.
> An `httpOnly` cookie isn't readable — but it's sent **automatically**, which opens CSRF.
> **You choose which attack to defend structurally and which to defend with a mechanism.**

Your answer: refresh token in an `httpOnly; SameSite=Lax; Path=/auth` cookie, access token in
memory only. And `secure` tied to `NODE_ENV`, because a `Secure` cookie over `http://localhost` is
**silently dropped** — no error, nothing in DevTools.

**🎤 Can you defend it?**
- *"XSS and CSRF — what's the difference in one sentence each?"*
- *"Where do you store a JWT in a browser?"* — the trap question. "localStorage" is the common
  answer and the weak one.
- *"Why can't `Access-Control-Allow-Origin` be `*` with credentials?"*
- *"What does `SameSite=Lax` allow that `Strict` doesn't, and why is that safe?"*

**Study:** `docs/phase-1` **§B.4** lines 573–628 · your [ADR-004](docs/adr/004-token-storage-cookie-vs-memory.md)
· MDN "Set-Cookie" and "CORS" — read the real docs, not a blog post.

## 7. Layered architecture: ports, adapters, the dependency rule

**Sits with #4** — the same principle applied to whole modules rather than single classes.

`domain/` importing nothing · a **port** naming a need · an **adapter** translating Prisma rows
into your types · a service that never learns what a database is.

**The audit that proves it:**
```bash
grep -rn "prisma\|argon2" apps/api/src/*/domain apps/api/src/*/application
```
Zero hits, or the rule is broken.

**🎤 Can you defend it?**
- *"Why is your `User` entity missing `passwordHash`?"* — because a type that cannot carry a secret
  cannot leak one. `findCredentialsByEmail` is the deliberate, narrow exception.
- *"Isn't this a lot of files for a CRUD app?"* — a fair challenge; have an honest answer about
  where the ceremony stops paying.

**Study:** dojo [Backend Architecture](http://localhost:3002/guides/backend-architecture) ·
`docs/phase-0` **§C.3**

## 8. Git beyond the daily four commands

**What:** the object model, reflog, what a branch actually is, rebase vs merge, recovering work.

**Why here:** you'll use it every working day for your entire career, and the difference between
"scared of git" and "calm about git" is visible to every teammate.

**Where you hit it:** `git reset --hard HEAD~1` twice destroyed 7 staged files — recovered via
`git fsck --lost-found` and proved byte-identical by matching hashes. Later, `git commit -am` on a
throwaway branch swept up real work, and switching branches reverted it.

> **Switching branches rewrites tracked files. Untracked files stay put.**
> **A branch is a 41-byte file holding a commit hash. Deleting it cannot lose a commit.**

**🎤 Can you defend it?**
- *"You committed to the wrong branch. What now?"*
- *"What does `git reset --hard` actually destroy, and what can `reflog` not recover?"*
- *"Rebase or merge — when, and what's the golden rule?"*

**Study:** dojo [Git Workflow](http://localhost:3002/guides/git-workflow) — **Part 13** is the one
that cost you a real hour · [/practice/git](http://localhost:3002/practice/git), 52 drills ·
*Pro Git* ch. 10 (the object model)

## 9. Security fundamentals for web apps

**What:** OWASP Top 10 as a working checklist — injection, broken auth, IDOR, mass assignment, user
enumeration, timing side channels.

**Why here:** the questions are the same in every language, and *thinking* about them is what
separates a junior who ships features from one you'd trust with a login form.

**Where you hit it:** four of these are in your own code, defended deliberately.

| Threat | Your defence |
|---|---|
| Mass assignment | `ValidationPipe({ whitelist: true })` |
| User enumeration | one identical 401 for unknown email **and** wrong password |
| Timing side channel | verify against a dummy hash when the user doesn't exist |
| Brute force | Argon2 **plus** 5/min per IP — neither is sufficient alone |

**🎤 Can you defend it?**
- *"How would you stop someone finding out which emails are registered?"* — the identical message
  is half the answer. **The timing is the other half**, and most candidates miss it.
- *"What's mass assignment, and how does your code prevent it?"*
- *"Rate limiting per IP — what's wrong with it?"* (shared NAT, botnets. Your
  [ADR-005](docs/adr/005-per-ip-rate-limiting.md) says so out loud.)

**Study:** OWASP Top 10 — read it once, then find the ones you already handle · dojo
[/practice/auth](http://localhost:3002/practice/auth)

---

# Tier 2 — High leverage

*Framework-adjacent but conceptually portable. Learn the idea, not the syntax.*

## 10. Session and token architecture · **NEW**

**What:** stateless vs stateful sessions, and the trade-off that follows: **a token you don't store
cannot be revoked.**

**Why Tier 2:** the shape is identical in Spring Security, Django and Rails. It's also a favourite
system-design follow-up because the right answer is a trade-off rather than a fact.

**Where you hit it:** the whole of Wednesday. Two tokens, each used where its weakness doesn't
matter — 100 API calls cost **zero** database lookups; one refresh costs one.

Then rotation and reuse detection, which is the most interview-worthy thing you built:

> A live client always holds the newest token. So a **replayed** token proves the chain leaked.
> You can't tell thief from victim — so revoke the whole family and let the password decide.

**🎤 Can you defend it?**
- *"Why two tokens instead of one?"*
- *"How do you implement 'log out everywhere'?"* — impossible with pure JWTs; one query with your
  design.
- *"What's refresh token rotation, and what attack does it detect?"* — **rehearse this one until
  it's fluent.** It's the strongest thing you can say about this project.
- *"Why does revoking mark a row instead of deleting it?"* — the row is the evidence.

**Study:** `docs/phase-1` **§B.2–B.3** lines 489–572 · your
[ADR-003](docs/adr/003-refresh-token-rotation.md) · `test/auth.e2e-spec.ts`, which is the executable
version of the same argument

## 11. Cross-cutting concerns and the request pipeline · **NEW**

**What:** middleware → guard → interceptor → pipe → handler → filter. Where "is this allowed",
"is this valid" and "how do errors render" belong — and why none of them belongs in a service.

**Why Tier 2:** every serious framework has this pipeline under different names. NestJS guards are
Spring's `HandlerInterceptor`, Express middleware, Django middleware. Learn it once.

**Where you hit it:** `AuthGuard` registered globally with a `@Public()` opt-out, and the
`SetMetadata` + `Reflector` two-step.

> **Default to secure.** Opt-**in** auth means forgetting the decorator leaves an endpoint
> **silently open**. Opt-**out** means forgetting it over-protects a route, which fails loudly in
> five seconds.

Also the ordering that isn't arbitrary: **throttle → authenticate → authorize.** Rate limiting
first means the 6th login is rejected *without* paying 45ms of Argon2 — a limiter that still pays
the cost is a DoS amplifier.

**🎤 Can you defend it?**
- *"Why a guard instead of a check at the top of each controller method?"*
- *"401 or 403 — which, and why?"* — *"I don't know who you are"* vs *"I know exactly who you are,
  and no."* Small, and reviewers always notice when it's backwards.
- *"How does your guard know a route is public?"*

**Study:** `docs/phase-0` **§B.4–B.5** lines 600–673 · dojo
[NestJS](http://localhost:3002/guides/nestjs) Parts 9, 11, 15 · then
[NESTJS-REVISION.md](NESTJS-REVISION.md)

## 12. Concurrency, races and idempotency

**What:** two requests arriving at once; why "check then act" is a bug; why retries must be safe.

**Why Tier 2:** the bugs are rare, non-reproducible and expensive, and the reasoning transfers to
every distributed system question you'll ever be asked.

**Where you hit it:** three times, each a different flavour.

1. **`P2002` on concurrent register** — you demonstrated it live. A pre-check is UX; the database
   constraint is correctness. **Always both.**
2. **Idempotent logout** — "delete if exists", never "error if already gone". A double-click must
   not 401.
3. **Concurrent refresh** — the subtle one. Two parallel 401s would each fire a refresh, rotation
   would read the second as a replay, and **your own reuse detection would log the user out.** The
   fix: every caller awaits one shared in-flight refresh.

> Your security feature and your frontend can fight each other. Race conditions are where.

**🎤 Can you defend it?**
- *"Two users register the same email at the same instant. What happens?"*
- *"What does idempotent mean, and which of your endpoints are?"*
- *"Your token rotation is single-use. What breaks if the client retries?"*

**Study:** `docs/phase-1` **§A.2.1–A.2.2** (isolation levels, the lost update) · dojo
[/practice/distributed](http://localhost:3002/practice/distributed)

## 13. Testing strategy

**What:** unit vs integration vs e2e, test doubles, and what each layer is *for*.

**Where you hit it:** 20 unit tests in **1.0s** against fakes, plus 18 e2e against real HTTP and a
real database.

> **If your unit tests are slow, your architecture leaked.** Speed is a design signal, not a
> convenience.

And the division of labour, learned the hard way: `revokedAt: null` and the revoked-token-in-the-cookie
bug **both type-checked cleanly**. Only an e2e test catches that class.

**🎤 Can you defend it?**
- *"What do you unit test versus end-to-end?"*
- *"Your e2e suite needs a database. How does that work in CI?"*
- *"How do you test something that depends on time or randomness?"*

**Study:** dojo [Testing](http://localhost:3002/guides/testing) ·
[/practice/testing](http://localhost:3002/practice/testing) · read your own `auth.e2e-spec.ts` and
justify every assertion

## 14. Server state is not client state · **NEW**

**What:** data that lives on a server is **shared, stale-able and cached**, which makes it a
fundamentally different problem from a component's own state.

**Why Tier 2:** the insight outlives TanStack Query — it's the same in SWR, RTK Query, Apollo and
Spring's caching abstraction.

**Where you hit it:** `useState` + `useEffect` + a `loading` flag was re-implementing a cache,
badly, once per component. Two components asking for the same data fired two requests and neither
knew the other existed.

**🎤 Can you defend it?**
- *"Why not just useEffect?"*
- *"What's a stale-while-revalidate cache?"*
- *"How do you invalidate after a mutation?"* — the query-key design **is** the answer.

**Study:** `docs/phase-1` **Part D** lines 713–810 · TanStack Query docs → "Important Defaults" ·
watch the Devtools panel while you navigate; that visual beats any explanation

## 15. TypeScript's type system

**What:** generics, conditional types, `infer`, discriminated unions, strictness flags.

**Where you hit it:** `TS7022` circular inference — **twice**, once in the API's cursor loop and
again in `use-problems.ts`. Both times an annotation was the **correct** fix, not a workaround.
Also `strictPropertyInitialization` on your DTOs, and proving TypeScript does *not* flag returning a
wider variable — only object literals. That's why every adapter maps field by field.

> **An annotation TypeScript *verifies* is legitimate. An `as` that *disables* checking is the one
> to be suspicious of.**

**🎤 Can you defend it?**
- *"When is a type assertion acceptable?"* — your `req.cookies` cast is a good answer: narrow, in
  one named place, at a genuine boundary where the compiler cannot know.
- *"What's the difference between `interface` and `type`?"*
- *"Why does `!` on your DTO fields not make the code unsafe?"* — because `ValidationPipe`
  guarantees it at runtime.

**Study:** `docs/phase-0` **§A.1–A.5** · dojo
[/practice/typescript](http://localhost:3002/practice/typescript) · Total TypeScript, 20 min/day

## 16. Validation at boundaries

**"Parse, don't validate."** Untrusted input becomes a typed value **once**, at the edge, and
everything inward can assume it's valid.

**Where you hit it:** Zod for env (a weak `JWT_SECRET` now **refuses to boot**), class-validator
for DTOs, and the deliberate asymmetry — `LoginDto` does **not** restate the password policy,
because a password predating a rule change must still authenticate.

**🎤 Can you defend it?** *"Where do you validate, and why not in the service?"* ·
*"Why doesn't your login DTO have a minimum length?"*

**Study:** `docs/phase-1` **§C.1** lines 654–691

## 17. HTTP API design

Status codes as a contract · cursor vs offset pagination · uniform error shapes · DTOs at the edge.

**Where you hit it:** `@HttpCode(200)` on login, because Nest defaults POST to **201** and login
creates nothing — your Postman test caught that on its first run. And offset pagination doesn't
just get slow, it **duplicates rows** when data shifts; your 4-request cursor loop returning 333
items with **0 duplicates** is the proof.

**🎤 Can you defend it?** *"201 or 200 for login?"* · *"Cursor or offset, and why?"* ·
*"400, 401, 403, 404, 409, 422 — when each?"*

**Study:** `docs/phase-1` **§A.5** lines 360–401

## 18. Schema migrations

Version control for your database. Migrations are **append-only**: fix a bad one by writing the
next one, never by editing history.

**Where you hit it:** adding `acceptanceRate` and `totalSubmissions` — the seed had the data all
along and Prisma **silently dropped it** because no column existed.

**🎤 Can you defend it?** *"How do you add a NOT NULL column to a table with 10M rows?"* (the
three-step dance) · *"How do you roll back a migration in production?"*

**Study:** `docs/phase-1` **§A.7** lines 431–451

## 19. CI as the enforcement gate

> **Hooks are fast feedback. CI is the gate.**

Three structural reasons a hook can never be the boundary: bypassable with `--no-verify`, not
installed on a fresh clone, runs in *your* environment.

**Where you hit it:** your pre-commit hook has caught formatting and type errors repeatedly. CI now
runs unit tests in the main job and e2e in a second job with a Postgres service — because e2e needs
infrastructure the lint job shouldn't pay for.

**🎤 Can you defend it?** *"What belongs in a hook versus CI?"* · *"Why pin CI's Node version?"*

**Study:** GitHub Actions docs → "Understanding GitHub Actions", then read your own `ci.yml` and
explain every line.

---

# Tier 3 — Your current stack

*Pays the rent. Replaceable. **Don't study these separately — you learn them by building.***

## 20. NestJS
Modules, providers, DI tokens, the lifecycle, dynamic modules (`forRoot` vs `forRootAsync`), guards,
custom decorators. The transferable part is Tier 1 #4 and Tier 2 #11; the rest is syntax.
→ dojo [NestJS](http://localhost:3002/guides/nestjs), 21 parts · then [NESTJS-REVISION.md](NESTJS-REVISION.md)

## 21. Prisma
Schema, migrations, generated client, driver adapters. Where it bit you: `P2002` handling,
`moduleFormat = "cjs"` for a CJS app, `updateMany` needing **both** `where` and `data`.
→ the Prisma docs are genuinely good; read them directly.

## 22. Zod
`z.coerce`, `parse` vs `safeParse`, `z.infer`. One schema producing both runtime validation and a
static type is the idea worth keeping.

## 23. TanStack Query
Query keys, staleness, mutations, invalidation. The concept is Tier 2 #14; this is the API.

## 24. Module systems — ESM vs CommonJS
Why `@nestjs/jwt` and `@nestjs/config` broke Jest until `transformIgnorePatterns` let them be
transformed. Painful, unavoidable, and slowly becoming history as the ecosystem finishes migrating.

---

# Tier 4 — Tooling

*Learn on demand. Knowing these exists is most of the value.*

**25. Docker & Compose** — containers, volumes, healthchecks, why your Postgres is on 5433.
**26. Monorepos and pnpm** — workspaces, `--filter`, why the lockfile is at the root, and why
`pnpm approve-builds` exists for native modules like argon2.
**27. Linting, formatting, hooks** — eslint flat config, prettier, husky, lint-staged, commitlint.
Worth knowing you can *disable a rule for a file pattern* when it's a known false positive — as you
did for `unbound-method` in spec files.

---

# The self-assessment — 20 questions

**Answer out loud, from memory, no notes.** Score 1 point for a correct answer, **2 if you also name
a rejected alternative and why.** Maximum 40.

1. Why hash passwords slowly but refresh tokens fast?
2. Why Argon2id over bcrypt?
3. Can someone read a JWT you issued? What follows from that?
4. Why two tokens rather than one long-lived one?
5. What is refresh token rotation, and what attack does it detect?
6. A revoked token is presented. Why revoke the *whole family*?
7. Why does revoking mark a row rather than delete it?
8. Where do you store a JWT in a browser, and why not the obvious place?
9. XSS and CSRF — one sentence each, and which cookie flag stops which?
10. Why can't `Access-Control-Allow-Origin` be `*` with credentials?
11. How do you prevent someone discovering which emails are registered? (**two** mechanisms)
12. Why does rate limiting run before authentication?
13. 401 or 403 — which, when?
14. Why a guard rather than a check in every controller?
15. Global-with-opt-out or per-route opt-in, and what's the failure mode of each?
16. Why does your port need a `Symbol` but your service doesn't?
17. What does an interface give you at *runtime*?
18. What do you unit test versus end-to-end, and why were your unit tests fast?
19. Two users register the same email simultaneously. What happens?
20. Tell me about the hardest bug you've debugged here.

| Score | Where you are |
|---|---|
| **< 20** | Re-read the Tier 1 entries you stalled on. Don't start Week 2 material yet. |
| **20–29** | Solid. Work the alternatives — that's where the second point lives. |
| **30–36** | Interview-ready on auth. Start rehearsing #5 and #20 as stories. |
| **37+** | Move on. Spend the time on Tier 1 #2 and #3 instead — databases are your thinner area. |

---

# If you only get four hours a week

Updated for where you actually are: Week 1 done, Week 2 is the judge and sandbox.

| When | Focus | Why now |
|---|---|---|
| **This weekend** | [NESTJS-REVISION.md](NESTJS-REVISION.md) | Consolidate before the stack changes under you |
| **Week 2–3** | **Indexes** (#3) — `docs/phase-1` §A.3–A.4, then `EXPLAIN ANALYZE` your own tables | Week 3 is SQL week; arrive with the vocabulary |
| **Week 3–4** | **Concurrency** (#12) — isolation levels, the lost update | The judge is a queue; races stop being theoretical |
| **Week 5** | **Security** (#9) — OWASP Top 10, find the ones you already handle | You have real answers now; make them explicit |
| **Week 6** | **Git internals** (#8) — *Pro Git* ch. 10, then the 52 dojo drills | Before the deploy week, when mistakes cost more |
| **Ongoing** | **TypeScript** (#15), 20 min/day · **the self-assessment**, once a fortnight | Compounding |

Everything in Tier 3 you learn by building. Don't schedule it.

---

# The three meta-lessons

**1. Read the real thing, not the tutorial about it.** `datasourceUrl` didn't exist in Prisma 7.
Opening the generated `PrismaClientOptions` settled in seconds what searching couldn't. Most of the
gap between Tier 1 and Tier 3 is this habit.

**2. When something doesn't work, there are always two live hypotheses:** *"I did it wrong"* and
*"the instructions are wrong."* Early on, the second was more often true than you'd expect. Check
the source before assuming you're the problem.

**3. A green build proves shape, never meaning.** `revokedAt: null` un-revoked a family.
`setRefreshCookie(res, presented)` stored a dead token. `Date.now() + 7*24*60*60` expired tokens in
ten minutes. Every one compiled. **The compiler asks "do these fit together?" — never "is this what
you meant?"** That second question is what tests are for, and it's why Task 7.1 exists.

---

## How this list has changed

| Date | Change |
|---|---|
| **29 Aug 2026** | First version — 18 topics from the Week 0 sprint |
| **30 Aug 2026** | Added layered architecture, testing strategy, CI as a gate, API contract design |
| **12 Sep 2026** | Restructured. Merged the dated sections into the tiers. Added **applied cryptography** and **the browser security model** to Tier 1; **session/token architecture**, **the request pipeline** and **server vs client state** to Tier 2. Added 🎤 interview questions throughout, the 20-question self-assessment, and a schedule matched to the real week. |
