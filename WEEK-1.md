# Week 1 — Auth, end to end
### Mon 31 Aug → Sun 6 Sep 2026 · depth week, slow lane

**The one sentence:**

> By Sunday night a user can register, log in, stay logged in across a browser restart, be
> rejected when their token is replayed, and see a page only admins can reach — with the
> frontend fetching through TanStack Query and `lib/api.ts` deleted.

**No hand-holding this week.** Each task states its prerequisites, what to build, how to think
about it, and how you'll know it's done. It does **not** give you the code. That's deliberate —
you built the Problems module by typing what you were given, and the goal now is to derive it.

**When you get stuck,** see [`GETTING-UNSTUCK.md`](./GETTING-UNSTUCK.md) — time-boxes by kind of
problem, the hypothesis log, and how to ask so you keep most of the learning. The short version:
*never* ask a "why doesn't this work" question inside the first 30 minutes; ask "what does this
error mean" whenever you like.

Companion: [`WEEK-1-KNOWLEDGE.md`](./WEEK-1-KNOWLEDGE.md) — every concept, where to read it, and
what to watch.

---

## How to read a task

Every task below has four parts:

| Part | Means |
|---|---|
| **⚙️ Prerequisites** | Must be true *before you start*. Verify each one — don't assume |
| **🎯 Build** | What must exist when you're done |
| **🧠 How to think** | The approach and the decisions, not the code |
| **✅ Done when** | A command or observation that proves it |

If a prerequisite fails, **stop and fix it first.** Half this weekend's pain came from starting a
block on a broken foundation.

---

## The week at a glance

| Day | ③ Deep material (3:30) | ④ Build (3:30) |
|---|---|---|
| **Mon** | Phase 1 §B.1 · hashing, salts, Argon2 | Password hashing port + Users module |
| **Tue** | Phase 1 §B.2 · sessions, tokens, JWT anatomy | Register + login, access tokens |
| **Wed** | Phase 1 §B.3 · rotation, reuse detection | Refresh tokens + family revocation |
| **Thu** | Phase 1 §B.4 · XSS, CSRF, cookie flags | httpOnly cookies, logout |
| **Fri** | Phase 1 §B.5 + §C.2 · RBAC, the pieces assembled | Guards, roles, rate limiting |
| **Sat** | *(no ③ — build is the day)* | TanStack Query, delete `lib/api.ts` |
| **Sun** | **No new material.** Consolidation only | Tests, ADRs, retro |

Each day's ③ reading is that section of `docs/phase-1` **plus** the matching section of
[`WEEK-1-KNOWLEDGE.md`](./WEEK-1-KNOWLEDGE.md). Together that's your 3½ hours.

---

# The daily shape

Your roadmap defines five numbered blocks totalling **10 hours**, plus the Java drip. This is the
whole day — the build task is one block of five, not the day itself.

| Block | Time | What | Cut order |
|---|---|---|---|
| **① Review** | 0:30 | Dojo `/practice/review` SRS queue | **NEVER** |
| **② DSA** | 2:00 | Arrays & Hashing — 2–3 problems | cut 3rd |
| **③ Deep material** | 3:30 | The day's reading. Slow lane, type everything | cut 2nd |
| **④ Build** | 3:30 | The day's task from below | **cut 1st** |
| **⑤ Write** | 0:30 | Commits, ADR notes, tomorrow's first command | keep |
| Java | 0:45 | `/coding/java` levels 1–2 | cut with ② |

**③ comes before ④, same day, deliberately.** You read the concept in the morning and build it in
the afternoon. That's the entire reason the week works — the reading sticks because you immediately
spend it.

## A worked clock

Adjust the start time; keep the **order** and the **ratios**.

| Time | Block | Notes |
|---|---|---|
| 08:30 | **① Review** | First thing. Before email, before the editor |
| 09:00 | **③ Deep material** | Phase 1 section + this day's `WEEK-1-KNOWLEDGE.md` section |
| 10:45 | *break 15 min* | Away from the screen. Actually stand up |
| 11:00 | ③ continued | Type the examples. Don't just read |
| 12:30 | **lunch, 45 min** | Not at the desk |
| 13:15 | **④ Build** | The task. Prerequisites checked *before* you start |
| 15:00 | *break 15 min* | |
| 15:15 | ④ continued | |
| 16:45 | *break 15 min* | |
| 17:00 | **② DSA** | Arrays & Hashing |
| 19:00 | **dinner, 45 min** | |
| 19:45 | **Java** | 45 min, hard stop |
| 20:30 | **⑤ Write** | Commit, ADR line, tomorrow's first command on paper |
| 21:00 | **Stop** | Screens off. Sleep is part of the plan |

**~10.75h of work across ~12.5h.** That's what your roadmap budgets. If you consistently hit 8, you
are still ahead of most people who claim 12 — log the real number in `PROGRESS.md` and let Week 2
adjust to the truth.

---

## Before the build block — the 10-minute ritual

Do this **every day**. Skipping it is what cost you hours during the sprint.

1. **Read the task's ⚙️ Prerequisites and verify each one.** Run the `grep`, run the `curl`. Don't
   assume — you *know* what you built yesterday, you don't know it still works.
2. **Start the stack and confirm it's healthy:**
   ```bash
   pnpm infra:up && docker ps          # both containers "healthy"
   pnpm dev:api                         # in its own terminal
   curl localhost:3001/health           # "db":"up"
   ```
3. **Confirm you're running new code.** If anything behaves oddly later, this is the first thing to
   re-check:
   ```bash
   ss -ltnp | grep 3001                 # exactly ONE pid
   ```
4. **`git status`** — start from a known state. Commit or stash anything stray.
5. **Write the day's build goal on paper, in one sentence.** If you can't, re-read the task.

## After the build block — the 10-minute close

1. **Run the ✅ Done-when checks.** All of them. A task isn't done because the code exists.
2. **Run the gates:**
   ```bash
   pnpm --filter api exec tsc --noEmit
   pnpm --filter api exec eslint src --fix
   pnpm --filter api test
   ```
3. **Commit.** One commit per coherent piece — not "today's work". Your hook will reject a bad
   message, which is the point.
4. **Write one line of decision-reasoning** in a scratch note. That line becomes the ADR on Sunday.
   *If you can't write it, you didn't make a decision — you accepted a default.*
5. **Write down what broke and how you found it.** This is the debugging log that turns pain into
   skill. One line each.

## The ⑤ Write block — what actually goes in it

Not busywork. Thirty minutes, four things:

| | |
|---|---|
| **Commit** anything uncommitted, properly sliced | |
| **Update the gate checklist** in this file — tick what's genuinely done | |
| **Tomorrow's first command**, written on paper | Starting cold costs 20 minutes you don't have |
| **One line in `PROGRESS.md`** — hours actually worked, DSA count, what slipped | |

---

## Saturday and Sunday are different

**Saturday (~9h):** one uninterrupted build deliverable — the TanStack migration — plus **4 DSA**.
No ③ block; the build *is* the day. Same ① at the start and ⑤ at the end.

**Sunday (~5h, half-day):** consolidation only. **No new material.**

| Time | What |
|---|---|
| 09:00 | ① Review |
| 09:30 | Cold self-quiz on the week's guide — closed book, then check |
| 10:30 | Tests + CI green |
| 12:00 | lunch |
| 13:00 | ADRs 002/003/004 |
| 14:00 | Retro in `PROGRESS.md` + read next week's plan |
| 15:00 | 4 DSA |
| 17:00 | **Stop** |

> **Every second Sunday is a full day off.** Not optional. Your roadmap says so and it's right —
> 12 weeks is a marathon and week 6 is where people break.

## When the day collapses

It will, once or twice. Cut in this exact order:

> **④ Build → ③ Deep material → ② DSA.** **Never ① Review.**

The SRS queue is a compounding asset you've fed since July. Skipping it is the only **irreversible**
loss in the plan — everything else you can catch up.

If you cut ④ two days running, the week's scope was wrong. Write that in the retro rather than
quietly falling behind.

---

# MONDAY 31 AUG — Passwords and the Users module

## Task 1.1 — Password hashing behind a port

### ⚙️ Prerequisites

Verify **all** of these before you start:

1. `pnpm dev:api` starts and `curl localhost:3001/health` returns `"db":"up"`
2. Your `User` model exists in `apps/api/prisma/schema.prisma` with `email`, `username`,
   `passwordHash`, `role` — check with `grep -A12 "model User" apps/api/prisma/schema.prisma`
3. You can explain, out loud, why `passwordHash` is not called `password`
4. You have read `docs/phase-1-auth-data-frontend.md` **§B.1, lines 452–488** — hashing, salting,
   why not plain hashing
5. You understand what a **port** is from the Problems module. If not, re-read
   `apps/api/src/problems/ports/problems.repository.ts` and the
   [Backend Architecture guide](http://localhost:3002/guides/backend-architecture) Part 4

### 🎯 Build

- A `PasswordHasher` **port** in the auth module: two methods, `hash(plain)` and
  `verify(plain, hash)`
- An **Argon2id adapter** implementing it
- A unit test proving that hashing the same password twice produces **different** strings, and
  that both verify correctly

```bash
pnpm --filter api add argon2
```

### 🧠 How to think

**Why a port for something as simple as hashing?** Because hashing algorithms get deprecated.
bcrypt was the answer for 15 years; Argon2id is the answer now; something else will be next. When
that day comes you want to change one adapter, not every call site. Also: your unit tests can
inject a fake hasher and run in microseconds instead of the ~100ms Argon2 deliberately costs.

**Why Argon2id and not bcrypt?** Be able to defend this in an interview. The short version: bcrypt
is CPU-hard only; Argon2id is **memory**-hard, which makes GPU and ASIC attacks far more expensive.
Argon2id is the hybrid variant that resists both side-channel and GPU attacks, and it won the
Password Hashing Competition. bcrypt is still acceptable; Argon2id is better.

**The counter-intuitive property:** a *good* password hash is **slow on purpose**. If your login
takes 100ms in hashing, that's correct. An attacker with your database has to spend that 100ms per
guess, per password.

**You do not need to store a salt column.** Argon2 embeds the salt in the output string. Look at a
hash you produce and identify the parameters, the salt, and the digest in it — that's a real
interview question.

### ✅ Done when

- `hash("hunter2")` called twice returns two different strings
- `verify("hunter2", <either hash>)` returns `true`
- `verify("wrong", hash)` returns `false`
- Nothing in `auth/domain/` or `auth/application/` imports `argon2`

---

## Task 1.2 — The Users module

### ⚙️ Prerequisites

1. Task 1.1 complete
2. You can name the five folders of the Problems module and what each holds, without looking
3. `apps/api/src/problems/` open in a second tab as a reference shape

### 🎯 Build

A `users/` module mirroring the Problems structure:

- `domain/user.entity.ts` — **never contains `passwordHash`**
- `ports/users.repository.ts` — `findByEmail`, `findByUsername`, `findById`, `create`
- `adapters/prisma-users.repository.ts`
- `application/users.service.ts`
- `users.module.ts` exporting the service

No controller yet. Auth will drive it.

### 🧠 How to think

**The most important decision here:** your `User` *domain entity* must not carry `passwordHash`.
The hash exists in the database and inside the repository, and it must never leave. If the entity
carries it, one careless `return user` in a controller leaks every password hash in your system.

So the repository needs **two** shapes: one that returns a `User` (safe, for everything), and one
that returns the credentials (used only by login). Make that split explicit — it's a security
boundary, not a style choice.

**Uniqueness:** `email` and `username` are both `@unique` in the schema, so Postgres will reject
duplicates. But you want a friendly 409, not a raw constraint error. Where does that check belong —
the service, or the adapter? Decide, and write down why. (Hint: consider what happens when two
requests register the same email at the same millisecond.)

### ✅ Done when

- `grep -ri "passwordHash" apps/api/src/users/domain/` returns nothing
- A unit test with a fake repository proves `usersService.findByEmail` returns a user without a hash
- `pnpm --filter api exec tsc --noEmit` clean

---

# TUESDAY 1 SEP — Register and login

## Task 2.1 — POST /auth/register

### ⚙️ Prerequisites

1. Monday complete, both tasks
2. Read `docs/phase-1` **§B.2, lines 489–524** — sessions vs tokens, and the JWT anatomy block
3. You can state what the three dot-separated parts of a JWT are, and which one is **not** encrypted
4. `class-validator` is installed (it is — you used it in `ListProblemsDto`)

### 🎯 Build

- `auth/` module with a controller exposing `POST /auth/register`
- A `RegisterDto` with real validation: email format, username length and charset, password
  minimum length
- Returns `201` with the created user — **never** the hash
- Returns `409` when the email or username is taken

### 🧠 How to think

**Password rules:** NIST's current guidance is *length over complexity*. Require 12+ characters and
do **not** require symbols, do **not** force periodic rotation. Both of those make users pick worse
passwords. Being able to say this — and cite that it's NIST 800-63B — is a genuine signal in an
interview.

**Where does "email already taken" get decided?** You have two options and both are defensible: a
lookup before insert (readable, but has a race), or catching Prisma's unique-constraint error
(atomic, but couples you to a Prisma error code). Pick one, write the ADR line.

**What to return.** Registering does *not* log you in — that's Wednesday. Return the user, status
201. Resist the urge to also issue tokens; keep one endpoint doing one thing.

### ✅ Done when

```bash
curl -X POST localhost:3001/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"a@b.com","username":"ayoub","password":"correct-horse-battery"}'
```

- returns 201 and a body with **no** `passwordHash`
- the same call again returns 409
- a 6-character password returns 400 from your DTO
- `SELECT "passwordHash" FROM "User";` shows an Argon2 string starting `$argon2id$`

---

## Task 2.2 — POST /auth/login and access tokens

### ⚙️ Prerequisites

1. Task 2.1 complete
2. You can explain why a JWT payload is **readable by anyone** who has the token
3. `JWT_SECRET` added to `env.schema.ts` **and** `.env` **and** `.env.example` — with a real random
   value, generated by `openssl rand -base64 32`

```bash
pnpm --filter api add @nestjs/jwt
```

### 🎯 Build

- `POST /auth/login` taking email + password
- Returns a signed **access token** with a short expiry (15 minutes)
- Returns `401` for both a wrong password **and** an unknown email — with the *same* message

### 🧠 How to think

**The identical-error rule.** If "unknown email" and "wrong password" return different messages,
you've built a **user enumeration** oracle: an attacker can discover which emails are registered.
Return one message for both. This is a real finding in real pentests.

**What goes in the token.** The `sub` (user id) and `role`, nothing more. The payload is
**base64-encoded, not encrypted** — anyone with the token can read it. Never put an email, a name,
or anything private in there. Verify this yourself: paste a token you generate into jwt.io and read
it.

**Why 15 minutes?** A JWT cannot be revoked — that's the trade-off for being stateless. Once
signed it's valid until it expires. So you keep the window small, and Wednesday's refresh token is
what makes a short window usable.

**A timing detail worth knowing:** if the email doesn't exist, don't skip the hash verification.
Returning instantly for unknown emails and slowly for known ones is a **timing attack** that leaks
which emails are registered. Hash a dummy value so both paths cost the same.

### ✅ Done when

- Correct credentials → 200 and a token that decodes on jwt.io to `{ sub, role, iat, exp }`
- Wrong password → 401
- Unknown email → 401, **byte-identical** response body
- `exp - iat` is 900 seconds

---

# WEDNESDAY 2 SEP — Refresh tokens and rotation

## Task 3.1 — Refresh token issue and rotation

### ⚙️ Prerequisites

1. Tuesday complete
2. Read `docs/phase-1` **§B.3, lines 525–572** — this is the hardest section of the week. Read it
   twice.
3. Your `RefreshToken` model exists with `tokenHash`, `family`, `revokedAt`, `expiresAt` —
   `grep -A10 "model RefreshToken" apps/api/prisma/schema.prisma`
4. You can explain why the column is `tokenHash` and not `token`

### 🎯 Build

- Login now returns **two** tokens: a 15-minute access token and a 7-day refresh token
- `POST /auth/refresh` — accepts a refresh token, returns a new pair
- The old refresh token is **invalidated** the moment it's used (rotation)
- Refresh tokens are stored **hashed**, never in plaintext

### 🧠 How to think

**Why two tokens at all?** The access token is short-lived because it can't be revoked. The refresh
token is long-lived but *is* revocable, because you store it. You get the performance of stateless
auth on every request, and the control of stateful auth where it matters.

**Why hash the refresh token?** Same reason as passwords. If your database leaks and you stored raw
refresh tokens, the attacker has working sessions for every user. Hashed, they have nothing usable.
(You can use a fast hash here — SHA-256 — because a refresh token is already high-entropy random,
unlike a human password.)

**What "family" means.** Every login starts a token *family*. Each refresh issues a new token in the
same family. This is the machinery Thursday's reuse detection needs — build the column now and
understand what it's for.

### ✅ Done when

- Login returns both tokens
- `POST /auth/refresh` with a valid token returns a **new** pair
- Using the *same* refresh token twice — the second call fails
- `SELECT "tokenHash" FROM "RefreshToken";` shows hashes, not tokens you could paste

---

## Task 3.2 — Reuse detection

### ⚙️ Prerequisites

1. Task 3.1 complete and verified
2. You can explain, out loud, why a **rotated** refresh token being presented again means something
   has gone wrong

### 🎯 Build

When an **already-used** refresh token is presented, revoke the **entire family** — every token
descended from that login — and force a fresh login.

### 🧠 How to think

**Work through the scenario on paper before coding.**

An attacker steals refresh token `R1`. Now either:
- The attacker uses `R1` first → they get `R2`, and when the real user presents `R1` it's already
  used
- The real user uses `R1` first → they get `R2`, and when the attacker presents `R1` it's already
  used

**Either way, a used token gets presented twice.** You can't tell which party is the attacker — but
you don't have to. Killing the whole family logs both out, and only the real user can log back in
with their password. **The theft becomes self-detecting.**

This is the single most interview-worthy thing you'll build this week. Make sure you can explain it
without notes.

### ✅ Done when

- Use `R1` → get `R2` (fine)
- Present `R1` **again** → 401, **and** `R2` is now revoked too
- `SELECT * FROM "RefreshToken" WHERE family = '<that family>';` — every row has a `revokedAt`

---

# THURSDAY 3 SEP — Cookies, logout, CSRF

## Task 4.1 — Move tokens into httpOnly cookies

### ⚙️ Prerequisites

1. Wednesday complete
2. Read `docs/phase-1` **§B.4, lines 573–628** — where the client stores tokens, XSS vs CSRF
3. You can state, in one sentence each, what XSS is and what CSRF is
4. `pnpm --filter api add cookie-parser` and `pnpm --filter api add -D @types/cookie-parser`

### 🎯 Build

- Login and refresh set the refresh token as an **httpOnly, Secure, SameSite=Lax** cookie
- The access token stays in the response body (the frontend keeps it in memory)
- `POST /auth/logout` clears the cookie and revokes the family
- CORS updated to `credentials: true`, and the frontend sends `credentials: 'include'`

### 🧠 How to think

**The trade-off, precisely.** `localStorage` is readable by any JavaScript on your page — so one
XSS and your tokens are gone. An httpOnly cookie is *not* readable by JavaScript, so XSS can't
steal it — but cookies are sent automatically on every request to your domain, which opens CSRF.

You are choosing which attack to defend structurally and which to defend with a mechanism.
**httpOnly + SameSite** is the current consensus: it removes the XSS theft vector entirely, and
`SameSite=Lax` blocks the ordinary CSRF case.

**Why the access token stays in memory and not a cookie:** memory dies on tab close, it's not
readable across tabs, and it's never sent automatically — so it can't be CSRF'd. Losing it on
refresh is fine; that's what the refresh cookie is for.

**You will hit a CORS error here.** `credentials: true` on the server AND `credentials: 'include'`
on the client are both required, and the server can no longer use `origin: '*'`. That's not a bug —
it's the browser refusing to send cookies to a wildcard origin.

### ✅ Done when

- DevTools → Application → Cookies shows the refresh token with **HttpOnly ✓**
- `document.cookie` in the console does **not** show it
- Logout clears it and a subsequent refresh returns 401
- Killing the API and restarting, the user is still logged in after a page refresh

---

# FRIDAY 4 SEP — Guards, roles, rate limiting

## Task 5.1 — AuthGuard and @CurrentUser()

### ⚙️ Prerequisites

1. Thursday complete
2. Read `docs/phase-0-foundations.md` **§B.4, lines 600–636** — the request lifecycle. You need to
   know *where* a guard runs.
3. Read `docs/phase-0-foundations.md` **§B.5, lines 637–673** — custom decorators
4. You can name the six pipeline stages in order

### 🎯 Build

- An `AuthGuard` that reads the access token, verifies it, and attaches the user to the request
- A `@CurrentUser()` param decorator so controllers get the user without touching `request`
- A `@Public()` decorator to opt individual routes out
- Guard applied globally

### 🧠 How to think

**Why a guard and not a check inside each controller?** Because "is this request allowed" is a
cross-cutting concern — it belongs in the pipeline, not scattered through your business logic. Your
service should never contain `if (!user) throw`.

**Global with an opt-out, not per-route opt-in.** If auth is opt-in, the day someone forgets the
decorator you have an open endpoint. If it's opt-out, forgetting means a route is *too* protected —
which fails loudly and safely. **Default to secure.**

**Where does `@Public()` live in the lifecycle?** The guard reads it via `Reflector`. Understand
that mechanism — it's the same metadata system `@Controller` uses.

### ✅ Done when

- `GET /problems` still works without a token (it's `@Public()`)
- A new `GET /auth/me` returns the current user, 401 without a token
- No controller method reads `request.user` directly

---

## Task 5.2 — Roles and rate limiting

### ⚙️ Prerequisites

1. Task 5.1 complete
2. Read `docs/phase-1` **§B.5, lines 629–651** — RBAC
3. `pnpm --filter api add @nestjs/throttler`

### 🎯 Build

- `@Roles('ADMIN')` decorator + a `RolesGuard`
- One admin-only endpoint to prove it
- Rate limiting on `/auth/login` and `/auth/register` — 5 attempts per minute per IP

### 🧠 How to think

**Authentication vs authorization.** "Who are you" vs "may you do this". Two different guards, and
they run in order. Being sloppy about the distinction is a common interview stumble.

**Why rate-limit auth specifically?** Without it, your login endpoint is a password-guessing oracle
that runs as fast as your server can hash. Rate limiting is what makes a slow hash *matter* — the
two work together.

**Which limit, and why per-IP?** Per-IP is imperfect (shared NAT, proxies) but it's the standard
first line. Note the limitation in your ADR; per-account lockout is a Week 5+ refinement with its
own denial-of-service trade-off.

### ✅ Done when

- A `USER` hitting the admin endpoint gets 403 (not 401 — know the difference)
- Six rapid login attempts → the sixth returns 429
- The rate limit does **not** apply to `/problems`

---

# SATURDAY 5 SEP — TanStack Query

## Task 6.1 — Migrate the frontend to TanStack Query

### ⚙️ Prerequisites

1. The whole API week working — you can register, log in, refresh, and hit a protected route
2. Read `docs/phase-1` **Part D, lines 713–810** — server state, the mental model, mutations,
   optimistic updates. This is a substantial read; budget 60 minutes.
3. You can explain why "server state" is not the same as "client state"
4. `pnpm --filter web add @tanstack/react-query @tanstack/react-query-devtools`

### 🎯 Build

- A `QueryClientProvider` at the app root, with Devtools in development
- `useProblems()` and `useProblem(slug)` hooks replacing the direct `getProblems` calls
- `useLogin()` / `useRegister()` / `useLogout()` mutations
- **`apps/web/src/lib/api.ts` deleted from the repository**

### 🧠 How to think

**The core idea:** your `useState` + `useEffect` + `loading` + `error` dance is re-implementing a
cache, badly, in every component. Server state is *not* your state — it lives on the server, it can
be stale, and two components asking for the same thing should share one request. TanStack Query is
that cache.

**Query keys are the whole API.** `['problems']` and `['problem', slug]`. Get the key design right
and invalidation is trivial; get it wrong and you'll fight it all day. Read the key section twice.

**Watch the Devtools while you work.** Open the panel and observe fetches, cache hits, and stale
transitions as you navigate. That visual is worth more than any explanation — it's the single
fastest way to build the mental model.

**Delete `lib/api.ts`, don't comment it.** Its remaining mocked functions (`runCode`, `getContests`,
`getLeaderboard`) move into the hooks that need them, still mocked, each deleted the week its
endpoint lands.

### ✅ Done when

- Navigating away and back to `/problems` does **not** refetch (cache hit — watch Devtools)
- Logging in updates the header without a page reload
- `git ls-files apps/web/src/lib/api.ts` returns nothing
- Loading and error states still render correctly

---

# SUNDAY 6 SEP — Consolidation

**No new material.** This is the day the week becomes durable.

## Task 7.1 — Tests

### ⚙️ Prerequisites
1. Everything above working
2. `apps/api/src/problems/application/problems.service.spec.ts` as your unit-test reference

### 🎯 Build
- Unit tests for `AuthService` with a **fake** `UsersRepository` and a **fake** `PasswordHasher` —
  no database, no Argon2
- One e2e test for the full flow: register → login → refresh → reuse the old token → 401
- Add `pnpm --filter api test` to the CI workflow

### 🧠 How to think
The unit tests should run in **milliseconds**. If they don't, you're hitting something real that
should be behind a port — and that's the test telling you your architecture leaked.

The e2e test is the one that proves reuse detection actually works end to end. Write that one
first.

### ✅ Done when
`pnpm --filter api test` green, CI green on `main`.

## Task 7.2 — ADRs

### ⚙️ Prerequisites
`docs/adr/template.md` exists (it does)

### 🎯 Build
Three records, one page each:
- **ADR-002** — Argon2id over bcrypt
- **ADR-003** — access + refresh with rotation and reuse detection
- **ADR-004** — httpOnly cookie for refresh, memory for access

Each needs a real **Alternatives considered** section. That's the part interviewers read.

## Task 7.3 — Retro

In `PROGRESS.md`: what took longer than planned, what you skipped, what you'd do differently, and
your updated DSA counts. **Write it down** — the last plan died from debt nothing reacted to.

---

# DSA — Arrays & Hashing

Starting from the first pattern, not Linked List.

**⚙️ Prerequisites before problem 1:**
1. Read the Arrays & Hashing **pattern section** in the dojo before any problem
2. You can write, from a blank editor, a frequency map in TypeScript — `Map` vs plain object, and
   why `Map` for anything non-string

| Day | Problems | Target |
|---|---|---|
| Mon–Sat | 3/day | 18 by Saturday |
| Sun | review misses only | — |

**How to work a problem:**
1. Brute force out loud first, with its complexity. Always.
2. Ask what the brute force *repeats* — that repetition is what a hash map removes
3. Only then write code
4. After solving, **close it and re-derive the template from blank**

Arrays & Hashing has 31 problems. You'll finish it in Week 2.

---

# Java — 45 min/day

`/coding/java` levels 1–2. Non-negotiable, non-negotiably capped at 45 minutes.

---

## The Sunday gate

- [ ] Register, login, refresh, logout all work from the browser
- [ ] Replaying a used refresh token kills the family
- [ ] Refresh token is httpOnly; `document.cookie` can't see it
- [ ] `@Roles('ADMIN')` returns 403 for a normal user
- [ ] Six rapid logins → 429
- [ ] Frontend uses TanStack Query; `lib/api.ts` is gone
- [ ] `pnpm --filter api test` green; CI green
- [ ] ADR-002, 003, 004 committed
- [ ] 18 Arrays & Hashing problems
- [ ] `PROGRESS.md` retro written

**If the gate fails,** write down *which box* and why. Week 2 opens by finishing it, and Week 2's
Saturday is what gives.

---

## Rules

1. **Read the prerequisites and verify them.** Every one. Half of last weekend's pain was starting
   on a broken foundation.
2. **30 minutes stuck before asking.** Doc → library docs → error search → ask.
3. **Commit at every task boundary.** Conventional messages; your hook enforces it.
4. **Every security decision gets a written line.** If you can't write it, you haven't decided.
5. **Stop at the stated time.** A depth week works because it's sustainable.
