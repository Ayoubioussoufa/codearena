# Revision weekend — everything so far, in 2 days

### Sat 12 → Sun 13 Sep 2026

---

## The rule

Three layers. Most people read layer 1, skip layer 2, and wonder why nothing sticks.

| Layer | What it gives you | How to use it |
|---|---|---|
| **1 · Our docs** | the **map** — what exists, how it connects, what *your own code* does | skim fast, don't linger |
| **2 · Official docs** | the **truth** — versioned, correct, and what you'll consult at work for the next decade | read properly |
| **3 · One deep source per topic** | the **why** — the part that outlives the framework | slow, one per topic |

> **Never a blog post or a video tutorial for something that has official docs.** Blogs are a
> version behind and optimised for feeling productive. The one exception is a *concept* explainer
> for something you have no vocabulary for yet — 20 minutes, then go to the docs.

**Have the repo open the whole time.** Every section below says which of *your* files to read next
to the theory. That pairing is the entire point — you are not learning auth in the abstract, you are
learning the auth you already built.

---

# DAY 1 — the backend spine

| Time | Block |
|---|---|
| 09:00–09:30 | ① Review · SRS queue |
| 09:30–11:00 | **A. TypeScript** |
| 11:00–13:00 | **B. Architecture, DI, the dependency rule** |
| 13:00–13:45 | break |
| 13:45–15:45 | **C. Databases and indexes** ← your thinnest area |
| 15:45–17:15 | **D. HTTP and API design** |
| 17:15–18:00 | **E. Drill** — dojo, no reading |

---

## A. TypeScript · 1h30

**Read your own code first:** `apps/api/src/users/ports/users.repository.ts` — `Omit`, an
intersection, an optional override. All three type features in nine lines.

| | |
|---|---|
| **1 · Map** | `docs/phase-0-foundations.md` **§A.1–A.5** lines 28–403 · dojo [TypeScript](http://localhost:3002/guides/typescript) |
| **2 · Truth** | **TypeScript Handbook** → *Everyday Types*, *Narrowing*, *Generics*, *Type Manipulation* — https://www.typescriptlang.org/docs/handbook/2/everyday-types.html |
| **3 · Depth** | **Total TypeScript free tutorials** — https://www.totaltypescript.com/tutorials (the *Beginner's TypeScript* and *Type Transformations* sets) |

**Answer before moving on:**
- Why did `TS7022` fire twice in this project, and why is an annotation the *correct* fix?
- What does `!` on a DTO property do, and what makes it honest?
- Why does `@Inject(PASSWORD_HASHER)` need a `Symbol` when `UsersService` doesn't?

**Drill:** [/practice/typescript](http://localhost:3002/practice/typescript)

---

## B. Architecture, DI, the dependency rule · 2h

**Read your own code first:** `src/auth/ports/refresh-token.repository.ts`, then
`src/auth/adapters/prisma-refresh-token.repository.ts`, then
`src/auth/application/refresh-token.service.ts`. Port → adapter → service, in that order. Notice
the service never names Prisma.

Then run the audit:
```bash
grep -rn "prisma\|argon2" apps/api/src/*/domain apps/api/src/*/application
```
Zero hits or the rule is broken.

| | |
|---|---|
| **1 · Map** | dojo [Backend Architecture](http://localhost:3002/guides/backend-architecture) — Parts 1–5 · `docs/phase-0` **§B.2** (432–563), **§C.1–C.3** (710–870) |
| **2 · Truth** | **NestJS docs** → *Providers*, *Modules*, *Custom providers* — https://docs.nestjs.com/providers |
| **3 · Depth** | **Alistair Cockburn, "Hexagonal Architecture"** (the original) — https://alistair.cockburn.us/hexagonal-architecture/ · **Martin Fowler, "Inversion of Control Containers and the Dependency Injection pattern"** — https://martinfowler.com/articles/injection.html |

**Answer:**
- If you swapped Postgres for Mongo, which files change? (If your answer isn't "only `adapters/`",
  find out where the leak is.)
- What does the interface give you at **runtime**?
- Why does `User` not have a `passwordHash` field?

---

## C. Databases and indexes · 2h · **spend the most time here**

This is your thinnest area and Week 3 is SQL week. Arrive with the vocabulary.

**Read your own code first:** `apps/api/prisma/schema.prisma` — every `@unique`, every `@@index`,
and `onDelete: Cascade`. Ask *why* each one is there before reading the answer.

| | |
|---|---|
| **1 · Map** | `docs/phase-1-auth-data-frontend.md` **§A.1–A.7** lines 25–451 |
| **2 · Truth** | **PostgreSQL docs → "Using EXPLAIN"** — https://www.postgresql.org/docs/current/using-explain.html · **"Index Types"** — https://www.postgresql.org/docs/current/indexes-types.html |
| **3 · Depth** | **Use The Index, Luke!** — https://use-the-index-luke.com — free, and the best thing written on this subject. Chapters 1–3 today. |
| **Books** | *SQL Antipatterns* (Karwin) — short and practical · *Designing Data-Intensive Applications* (Kleppmann) **ch. 3** — heavy, but it is the real thing |

**Do this, don't just read it** — you have 333 rows, enough for the plan to change:

```sql
EXPLAIN ANALYZE SELECT * FROM "Problem" WHERE slug = 'two-sum';
EXPLAIN ANALYZE SELECT * FROM "Problem" WHERE difficulty = 'EASY' ORDER BY id LIMIT 20;
EXPLAIN ANALYZE SELECT * FROM "RefreshToken" WHERE family = '<a real family>';
```

Look for **Index Scan** vs **Seq Scan**, and the `rows=` estimate against actual. That is the whole
skill in miniature.

**Answer:**
- Why is `WHERE b = 1` slow on an index of `(a, b)`? (the phone-book question)
- What does an index *cost*?
- Why is offset pagination not just slow but **wrong**?

**Drill:** [/practice/sql](http://localhost:3002/practice/sql)

---

## D. HTTP and API design · 1h30

**Read your own code first:** `src/auth/http/auth.controller.ts` — every status code is a decision.
`@HttpCode(200)` on login, 201 on register, 409 on duplicate, 403 vs 401.

| | |
|---|---|
| **1 · Map** | `docs/phase-1` **§A.5** (pagination, 360–401) · **§C.1** (parse don't validate, 654–691) |
| **2 · Truth** | **MDN HTTP status codes** — https://developer.mozilla.org/en-US/docs/Web/HTTP/Status · **MDN HTTP overview** — https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview |
| **3 · Depth** | **RFC 9110, HTTP Semantics** §15 (status codes) — https://www.rfc-editor.org/rfc/rfc9110#section-15 — a reference, not a read-through. Look up the four you use most. |

**Answer:** 200 or 201 for login? · 401 vs 403 vs 404 for "this isn't yours"? · cursor or offset,
and why? · 409 vs 422?

---

## E. Drill · 45 min

No reading. [/practice/typescript](http://localhost:3002/practice/typescript) and
[/practice/sql](http://localhost:3002/practice/sql). Getting them wrong now is the point.

---

# DAY 2 — security, testing, and the things that catch you

| Time | Block |
|---|---|
| 09:00–09:30 | ① Review · SRS queue |
| 09:30–12:00 | **F. Auth, crypto, browser security** ← the biggest block |
| 12:00–13:00 | **G. Testing** |
| 13:00–13:45 | break |
| 13:45–14:45 | **H. Concurrency and idempotency** |
| 14:45–15:45 | **I. Git** |
| 15:45–16:45 | **J. Frontend: server state** |
| 16:45–18:00 | **K. The self-assessment, out loud** |

---

## F. Auth, crypto, browser security · 2h30 · **the centrepiece**

This is the deepest thing you have built and the most likely to be interviewed on. Give it the time.

**Read your own code first, in this order:**
1. `src/auth/passwordhasher/adapters/argon2-password.hasher.ts`
2. `src/auth/application/auth.service.ts` — the dummy hash, and why both failures throw the same thing
3. `src/auth/application/refresh-token.service.ts` — `rotate()`, every check, and the order
4. `src/auth/http/auth.controller.ts` — the five cookie flags
5. `src/auth/guards/auth.guard.ts`
6. Your four ADRs, `docs/adr/002`–`005`

| | |
|---|---|
| **1 · Map** | `docs/phase-1` **§B.1–B.5** lines 452–653 · `WEEK-1-KNOWLEDGE.md` (a real hash and a real JWT, dissected) |
| **2 · Truth** | **OWASP Cheat Sheets** — the four that matter, all short: <br>· [Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) <br>· [Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) <br>· [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) <br>· [CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) |
| **2 · Truth** | **MDN** → [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) · [SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) · [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) · [Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) |
| **3 · Depth** | **PortSwigger Web Security Academy** — https://portswigger.net/web-security — **free, with interactive labs.** Do the *CSRF* and *CORS* sections. This is the single best security resource on the internet and it costs nothing. |
| **Specs** | **RFC 7519 (JWT)** §4.1 registered claims — https://www.rfc-editor.org/rfc/rfc7519#section-4.1 · **RFC 9106 (Argon2)** §4, parameter choice · **RFC 6265bis** for cookies |
| **Tool** | https://jwt.io — paste a token you issued and read it |

**Do this, don't just read it:**

```bash
# prove a JWT is signed, not encrypted — no secret, no library
node -e 'console.log(JSON.parse(Buffer.from(process.argv[1].split(".")[1],"base64url")))' "$TOKEN"
```

Then open DevTools → Application → Cookies on your own login, and confirm `document.cookie` cannot
see the refresh cookie.

**Answer — these are the interview questions:**
- Why hash passwords slowly but refresh tokens fast? *(the best question in the set)*
- Why Argon2id over bcrypt?
- What is rotation, and what attack does reuse detection catch?
- Why revoke the whole **family**?
- XSS vs CSRF, one sentence each, and which flag stops which?
- Why can't `Access-Control-Allow-Origin` be `*` with credentials?

**Drill:** [/practice/auth](http://localhost:3002/practice/auth)

---

## G. Testing · 1h

**Read your own code first:** `apps/api/test/auth.e2e-spec.ts`. Justify every assertion. Then
`src/auth/application/auth.service.spec.ts` and ask why it needs no database.

| | |
|---|---|
| **1 · Map** | dojo [Testing](http://localhost:3002/guides/testing) |
| **2 · Truth** | **Jest docs** → *Expect*, *Setup and Teardown* — https://jestjs.io/docs/expect · **NestJS docs → Testing** — https://docs.nestjs.com/fundamentals/testing |
| **3 · Depth** | **Martin Fowler, "Test Double"** — https://martinfowler.com/bliki/TestDouble.html (stub vs mock vs fake, precisely) · **Kent C. Dodds, "Write tests. Not too many. Mostly integration."** — https://kentcdodds.com/blog/write-tests |

**Answer:** why were your unit tests 1 second? · what class of bug did `revokedAt: null` belong to,
and which layer catches it? · why did throttling need its own spec file?

---

## H. Concurrency and idempotency · 1h

**Read your own code first:** the `P2002` catch in `prisma-users.repository.ts`, then
`src/lib/http.ts` in the web app — the shared in-flight refresh.

| | |
|---|---|
| **1 · Map** | `docs/phase-1` **§A.2.1–A.2.4** lines 92–240 (isolation levels, the lost update, deadlocks) |
| **2 · Truth** | **PostgreSQL docs → Transaction Isolation** — https://www.postgresql.org/docs/current/transaction-iso.html |
| **3 · Depth** | *Designing Data-Intensive Applications* **ch. 7** (Transactions) — the clearest writing on isolation anomalies anywhere |

**Answer:** two users register the same email at the same instant — what happens, and why do you
need **both** the pre-check and the constraint? · why would two parallel refreshes have logged your
user out?

**Drill:** [/practice/distributed](http://localhost:3002/practice/distributed)

---

## I. Git · 1h

| | |
|---|---|
| **1 · Map** | dojo [Git Workflow](http://localhost:3002/guides/git-workflow) — **Part 13** is the one that cost you a real hour, and Part 6 (undoing) |
| **2 · Truth** | `git help reset`, `git help branch`. The man pages are excellent and nobody reads them. |
| **3 · Depth** | **Pro Git**, free — https://git-scm.com/book/en/v2 — **ch. 10, Git Internals**. Read it once and git stops being magic. · **"Think Like (a) Git"** — https://think-like-a-git.net |

**Answer:** what is a branch, physically? · what can `reflog` **not** recover? · what does
`git branch -d` actually check?

**Drill:** [/practice/git](http://localhost:3002/practice/git) — 52 exercises.

---

## J. Frontend: server state · 1h

**Read your own code first:** `apps/web/src/lib/http.ts` (the interceptor),
`src/hooks/use-problems.ts`, `src/lib/query/keys.ts`.

| | |
|---|---|
| **1 · Map** | `docs/phase-1` **Part D** lines 713–810 |
| **2 · Truth** | **TanStack Query → "Important Defaults"** — https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults — read this one twice; it explains behaviour that otherwise looks like a bug · then *Query Keys* and *Invalidation* |
| **3 · Depth** | **TkDodo's blog, "Practical React Query"** — https://tkdodo.eu/blog/practical-react-query — he maintains the library; this is the rare blog that beats the docs |

**Answer:** why is server state not component state? · what does the key design buy you? · why must
concurrent 401s share one refresh?

**Drill:** [/practice/react](http://localhost:3002/practice/react)

---

## K. The self-assessment · 1h15 · **out loud**

[STUDY-PRIORITIES.md → the 20 questions](STUDY-PRIORITIES.md#the-self-assessment--20-questions).

**Record yourself.** One point for a correct answer, **two if you name a rejected alternative.**
Out of 40.

Then, from a blank file, Part D of [NESTJS-REVISION.md](NESTJS-REVISION.md) — rebuild `rotate()`
and the hasher port from memory. Recognition is not production, and production is what interviews
test.

**Send me both** and I'll score them.

---

# The permanent shelf

Keep this. These are the things worth returning to, not reading once.

## Free and excellent

| Resource | For |
|---|---|
| **[PortSwigger Web Security Academy](https://portswigger.net/web-security)** | Web security, with labs. Nothing else is close. |
| **[Use The Index, Luke!](https://use-the-index-luke.com)** | SQL indexing, from zero |
| **[Pro Git](https://git-scm.com/book/en/v2)** | Git, especially ch. 10 |
| **[OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)** | The "what should I do" answer for any security question |
| **[MDN](https://developer.mozilla.org/)** | HTTP, cookies, CORS, the browser. The reference. |
| **[Total TypeScript tutorials](https://www.totaltypescript.com/tutorials)** | TypeScript, interactive |
| **[TkDodo's blog](https://tkdodo.eu/blog/)** | React Query, by its maintainer |
| **[Martin Fowler's bliki](https://martinfowler.com/bliki/)** | Architecture vocabulary |
| **[type-challenges](https://github.com/type-challenges/type-challenges)** | Type-system drills |

## Official docs — bookmark, don't read cover to cover

NestJS · Prisma · Zod · TanStack Query · PostgreSQL · Jest · Next.js

## Books, in the order they'll pay off

1. **SQL Antipatterns** (Karwin) — short, immediately useful
2. **Designing Data-Intensive Applications** (Kleppmann) — ch. 3 and 7 first. The most valuable
   backend book there is, and you do not have to read it in order
3. **The Pragmatic Programmer** — for how to work, not what to know

## Video — sparingly

Use video only for a *concept* you have no vocabulary for, then go to the docs. **Never** a
build-along: you end up with the author's mental model instead of your own.

- **Hussein Nasser** (YouTube) — backend engineering, HTTP, database internals. Genuinely deep.
- **Computerphile** — for the crypto concepts (hashing, HMAC) when the words aren't landing yet.

---

# The honest answer to "is reading enough?"

**No.** Every block above pairs reading with *your own code* and ends with questions you answer out
loud, because that is the only reliable test.

The measure of this weekend is not pages read. It's whether, on Monday:

- you score **30+** on the 20 questions, and
- you can rebuild `rotate()` from a blank file.

Everything else is preparation for those two.
