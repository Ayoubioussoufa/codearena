# Part 2 · Fri 30 Oct: auth, re-learned

**2 hours 30**, then Upsolve's Friday build. 0:15 ADRs 002–005, then close them · 0:35 the
trace · 0:40 questions · 0:30 break it on purpose · 0:30 I-6, the race (you rebuild it race-free
in Upsolve later today) · Git Part 2.

The strongest thing you can say about CodeArena is still **refresh rotation with reuse detection**,
and today you'll find out it has a hole (I-6). Finding and fixing a hole in your own security code
is a better interview story than code with no hole.

---

## 🔧 1. The trace (40 min)

Follow one user through every file, with the code open. At each stop, say in **one sentence** what
happens, then check yourself against the fold.

1. `POST /auth/register` → `RegisterDto` → `AuthService.register` → `UsersService.createUser` →
   `PrismaUsersRepository.create`
2. `POST /auth/login` → the three global guards (`app.module.ts`) → `LoginDto` → `AuthService.login`
   → `RefreshTokenService.issueForLogin` → `issue()` → `AuthController.login` sets the cookie
3. The browser: `apps/web/src/lib/access-token.ts`, plus the cookie jar
4. `GET /auth/me` → `http.ts` adds `Authorization: Bearer …` → `AuthGuard` → `@CurrentUser()`
5. Fifteen minutes later: a 401 → `refreshOnce()` in `http.ts` → `POST /auth/refresh` →
   `RefreshTokenService.rotate`
6. Someone replays an old refresh token → `rotate`'s reuse branch → `revokeFamily`
7. `GET /auth/admin/ping` as a `USER` → `RolesGuard`
8. `POST /auth/logout` → `revokeSession` → `clearCookie`

<details><summary>Check yourself</summary>

1. Validated (email, 3–20 character username, 12–128 character password) → hashed with Argon2id →
   a fast-path duplicate check returns 409 → insert; a unique-constraint race also becomes 409 in
   the adapter → returns a `User`, which has no hash field.
2. Throttler (5 per minute per IP) → AuthGuard sees `@Public()` and passes → RolesGuard sees no
   `@Roles()` and passes → credentials looked up → `verify(storedHash ?? dummyHash, password)` →
   the same 401 for every failure → a **new family** → 32 random bytes; their SHA-256 is stored;
   a JWT `{ sub, role }` is signed → the refresh token goes into an httpOnly cookie, and the body
   carries only `{ accessToken }`.
3. The access token lives in a module-level variable (memory). The refresh token lives in the
   browser's cookie jar, where JavaScript can't read it, and it's sent only to `/auth/*`.
4. The guard splits `Bearer <token>`, `verifyAsync` checks the signature and `exp`, the payload
   goes on `request.user`, and the decorator hands it to the handler.
5. On a 401, `http.ts` starts a refresh (one in flight per tab), and the cookie rides along.
   `rotate` looks the token up by hash → revoked? reuse → expired? → user gone? → revoke this row →
   issue a new pair **in the same family** → new cookie → the original request is retried.
6. The row is already revoked, so the whole family is revoked (the thief's token and the victim's)
   → 401.
7. AuthGuard succeeds, RolesGuard sees `role: USER` where `ADMIN` is required → **403**.
8. The family is revoked (if there was a token), the cookie is cleared, and the response is 200
   either way.

</details>

---

## 2. Questions (50 min)

### Passwords

**Q1.** Why not SHA-256 for passwords? Why Argon2id rather than bcrypt?

<details><summary>Answer</summary>

The threat is **offline** guessing once the table leaks. SHA-256 is designed to be fast, and speed
is the attacker's budget: billions of guesses a second on a GPU. bcrypt's cost factor scales
**time only**, and its memory stays around 4 KiB, so GPUs still parallelise it cheaply. Argon2id is
**memory-hard** (64 MiB by default), and memory per core is exactly what a GPU lacks. The "id"
variant is the hybrid: resistant to side channels (i) and to GPU cracking (d). See ADR-002.

</details>

**Q2.** Where is the salt stored? Which two tests prove it?

<details><summary>Answer</summary>

Inside the hash string itself: `$argon2id$v=19$m=65536,t=3,p=1$<salt>$<hash>`, and `verify` parses
it back out, so there's no salt column to forget. `produces a different hash each time` proves a
salt exists; `produces a hash that verifies regardless of which salt was used` proves it's
embedded.

</details>

**Q3.** What is `dummyHash` for? What would an attacker measure without it?

<details><summary>Answer</summary>

Time. An unknown email would return in about a millisecond, a known one in about 45 ms (Argon2).
The identical error message is half of the user-enumeration defence, and **equal timing is the
other half**, which most candidates miss. `dummyHash` is the hash of random bytes, computed once,
and verified against when the user doesn't exist.

</details>

**Q4.** Why is `dummyHash` assigned in the constructor and not as a field initializer,
`private readonly dummyHash = this.hasher.hash(…)`?

<details><summary>Answer</summary>

With `target: ES2022` (class fields use define semantics), field initializers run **before** the
constructor assigns its parameter properties, so `this.hasher` is still `undefined` and the
constructor throws. TypeScript flags it (TS2729: "used before its initialization").

</details>

**Q5.** Why does `RegisterDto` cap the password at 128 characters, require 12, and have no
complexity rules? Why does `LoginDto` have no length rule at all?

<details><summary>Answer</summary>

NIST SP 800-63B: length beats complexity, and complexity rules push people toward `Password1!`.
The maximum is a denial-of-service control, because Argon2 on a multi-megabyte "password" burns
real CPU. Login has no rules because a user whose password predates a policy change must still be
able to log in, and echoing the policy would tell an attacker the shape of what they're guessing.

</details>

### Tokens

**Q6.** Can a user read the JWT you issued? What's inside it?

<details><summary>Answer</summary>

Yes. It's `header.payload.signature`, base64url-encoded: **signed, not encrypted**. The payload is
`sub` (the user id), `role`, `iat` and `exp`. So nothing secret goes in it. 🔧 Prove it: copy an
access token and run `cut -d. -f2 <<< "$TOKEN" | base64 -d`. You may need to add `=` padding.

</details>

**Q7.** What does `verifyAsync` check, and what does the guard do when each check fails?

<details><summary>Answer</summary>

The signature against `JWT_SECRET`, that `exp` is in the future, and that the format is well
formed. Any failure throws, the guard catches it and answers one 401: the caller never learns which
check failed. A missing header or a non-`Bearer` scheme is rejected before verification even
starts.

</details>

**Q8.** Where are the 15 minutes configured, and in what unit? What unit does the throttler use?

<details><summary>Answer</summary>

`JWT_ACCESS_TTL` (default `900` in `env.schema.ts`) goes to `signOptions.expiresIn` as a number,
which means **seconds**. The throttler's `ttl: 60_000` is **milliseconds**. Two libraries, two
units, side by side in your code: a classic place for a bug.

</details>

**Q9.** `RolesGuard` reads the role from the token with zero database queries. What's the price?

<details><summary>Answer</summary>

A demoted or banned user keeps their old role for up to 15 minutes, until the access token expires.
That's the stateless trade-off. If a route needs instant revocation, check the database or Redis
on that route, or keep access tokens very short and revoke the family. A strong "what would you
change at scale?" answer.

</details>

**Q10.** Why two tokens? Why is the refresh token **not** a JWT? Why SHA-256 for it and not Argon2?

<details><summary>Answer</summary>

A JWT can't be revoked, so it's kept short. The refresh token is long-lived but revocable, because
every use is a database lookup. Since it's looked up anyway, a signature would add nothing, and it
would tempt code into trusting the payload without the lookup. SHA-256 is enough: 32 random bytes
leave nothing to guess, so Argon2's slowness would cost 45 ms per refresh for no defence. See
ADR-003.

</details>

**Q11.** Explain rotation and reuse detection in 60 seconds. Record it, and listen back.

<details><summary>A model answer</summary>

"Every refresh token is single-use. Using one revokes it and issues a replacement in the same
*family*, the chain of tokens from one login. An honest client always holds the newest token, so
if a revoked token ever comes back, someone copied the chain. I can't tell the thief from the
victim, so I revoke the whole family: both are logged out, and only the person with the password
can start again. Revoked rows are never deleted, because the row is the evidence that turns a
replay into a detection instead of an 'unknown token'."

</details>

**Q12.** Recite `rotate()`'s checks in order. Why does the reuse check come **before** the expiry
check?

<details><summary>Answer</summary>

Not found → 401 · revoked → revoke the family → 401 · expired → 401 · user deleted → 401 · revoke
this row · issue in the **same** family. Reuse before expiry because an expired token that gets
replayed is still evidence of theft: you want the family burned, not a quiet 401.

</details>

**Q13.** Why is `revoke` an `update` and not a `delete`? Why does rotation pass `row.family` and
not a new UUID?

<details><summary>Answer</summary>

If the row were deleted, a replay would look exactly like an unknown token and the theft would go
unnoticed. With a new family on each rotation, the chain is orphaned: a replay would burn only the
old family, and the thief's new tokens would live on.

</details>

**Q14.** What does logout revoke? Why must it succeed without a token?

<details><summary>Answer</summary>

The whole family, then it clears the cookie. Logout is idempotent: a double click, a retried
request or a second tab must all end in "no session", and "no session" is already true.

</details>

**Q15.** What is the longest a session can last?

<details><summary>Answer</summary>

There's no maximum while the user stays active. Every rotation issues a fresh 7-day token (a
sliding expiry), and only seven idle days end the session. An absolute cap needs the family's
start time (for example "refuse after 30 days"). Worth knowing, not worth building this week.

</details>

### The browser

**Q16.** XSS and CSRF, one sentence each. Then fill in ADR-004's table from memory: `localStorage`
vs httpOnly cookie vs memory.

<details><summary>Answer</summary>

**XSS:** the attacker's JavaScript runs inside your page with your page's powers. **CSRF:** another
site makes the victim's browser send a request to you, and the browser attaches your cookies
automatically. `localStorage` can be read by JS (XSS steals it) and isn't sent automatically. An
httpOnly cookie can't be read by JS but is sent automatically (CSRF risk). Memory can be read by
JS, isn't sent automatically and dies on reload. So: the refresh token goes in the cookie (XSS
can't read it; `SameSite` and `Path` handle CSRF), and the access token goes in memory (never sent
automatically, so it can't be CSRF'd).

</details>

**Q17.** The live API sends this. Explain every attribute.
`Set-Cookie: refresh=…; Max-Age=604800; Path=/auth; Expires=…; HttpOnly; SameSite=Lax`

<details><summary>Answer</summary>

`Max-Age=604800`: 7 days, matching the database expiry. `Path=/auth`: sent only to auth routes,
never with `/problems`. `HttpOnly`: JavaScript can't read it. `SameSite=Lax`: not sent on
cross-site POSTs, fetches or iframes. `Secure` is missing because `NODE_ENV` isn't `production`.

</details>

**Q18.** ADR-004 says a `Secure` cookie over `http://localhost` is "silently dropped". Is that true?

<details><summary>Answer</summary>

It depends on the browser. Chromium and Firefox treat `localhost` as a secure context and keep
`Secure` cookies on plain http; others haven't always. 🔧 Test it in your own browser by forcing
`secure: true` locally for one login. Tying `Secure` to the environment is still right, because it
removes the dependence on browser behaviour. The ADR just overstates the reason. Note it for the
superseding ADR.

</details>

**Q19.** Here the refresh cookie is only ever sent by your own JavaScript calling
`POST /auth/refresh`. Would `SameSite=Strict` break anything?

<details><summary>Answer</summary>

Probably not. Strict breaks *top-level navigations* from another site that expect to arrive
logged in. Your session restore is a POST your own page makes after it loads, and
`localhost:3000` → `localhost:3001` is the **same site** (a site ignores the port). So Strict looks
like a free upgrade. 🔧 Verify it: switch to Strict, then arrive from a link on another site and
watch whether the session restores. A good question to *ask back* in an interview.

</details>

**Q20.** Why must CORS name one exact origin when credentials are involved? What in `main.ts`
breaks in week 4?

<details><summary>Answer</summary>

The spec forbids `Access-Control-Allow-Origin: *` with credentials; otherwise any website could
make credentialed reads of your API. `main.ts` hard-codes `http://localhost:3000`, so in
production it has to come from configuration.

</details>

### Guards and rate limits

**Q21.** Why a global guard with a `@Public()` opt-out, rather than `@UseGuards()` on each route?

<details><summary>Answer</summary>

Default deny. Forget the decorator on a global guard and the route is *closed*: you notice
immediately with a 401 in development. Forget it per route and the route is *open*: a silent
hole nobody notices.

</details>

**Q22.** How does the guard know a route is public? Why `getAllAndOverride` with `[handler, class]`?

<details><summary>Answer</summary>

`@Public()` is `SetMetadata('isPublic', true)` on a method or a class. `Reflector.getAllAndOverride`
looks at the handler first and then the class, and the first value it finds wins, so a method's
setting overrides its controller's.

</details>

**Q23.** 401 vs 403, and which test pins each?

<details><summary>Answer</summary>

401: "I don't know who you are" (no token, or an invalid one). 403: "I know who you are, and no."
Pinned by `returns 403 (not 401) when a USER hits an ADMIN route` and
`returns 401 when an ADMIN route is hit with no token at all`.

</details>

**Q24.** Name three ways per-IP rate limiting fails, one of them arriving in week 4.

<details><summary>Answer</summary>

Shared addresses (a campus, an office, a mobile carrier's NAT) throttle innocent users; a botnet
has thousands of IPs; the default storage is in memory per process, so N instances give 5 × N
attempts. Week 4: behind Caddy, **every request comes from the proxy's IP**, so all users share one
bucket of 5 per minute, unless Express's `trust proxy` is configured, and configuring it carelessly
lets clients forge `X-Forwarded-For`.

</details>

**Q25.** Why is throttling switched off in `auth.e2e-spec.ts`, and why does it override the
**storage** rather than the guard?

<details><summary>Answer</summary>

That suite logs in far more than 5 times a minute, and 429s would fail assertions about unrelated
things. Rate limiting gets its own file. The guard is registered under the `APP_GUARD` token, so
`overrideGuard(ThrottlerGuard)` matches nothing; replacing the storage with one that always reports
a single hit does.

</details>

### 🐛 I-9 · the comment that gives the wrong reason

`app.module.ts` says: *"Throttle first: reject the 6th login WITHOUT spending 45ms in Argon2."*
🔧 Move the `ThrottlerGuard` line below `AuthGuard` and run both suites. **Everything still
passes.** Then put it back.

<details><summary>Hint 1</summary>

Where does Argon2 run: in a guard, or in the handler? When does the handler run relative to
*every* guard?

</details>

<details><summary>Hint 2: what the order really protects</summary>

Two things. (a) `RolesGuard` reads `request.user`, so it must come after `AuthGuard`; swap those
two and the "no token on an admin route" test fails with 403 instead of 401 (verified). (b) If
`AuthGuard` came before the throttler, a request with a bad token would be rejected **before being
counted**, so guessing tokens on protected routes would be unthrottled. Rewrite the comment to say
the true reason, and consider a test that would pin (b).

</details>

---

## 🔧 3. Break it on purpose (40 min)

For each change: **predict** which test fails, make the change, run
`pnpm --filter api test && pnpm --filter api test:e2e`, then `git checkout -- <file>`.
Every row below was run on 28 Oct (with I-1 fixed so the e2e suite loads).

| # | Change | Your prediction |
|---|---|---|
| M1 | `rotate()`: pass `randomUUID()` to `issue()` instead of `row.family` | |
| M2 | `rotate()`: comment out `await this.tokens.revoke(row.id)` | |
| M3 | `rotate()`'s reuse branch: comment out `revokeFamily` | |
| M4 | `hash()` returns the token unchanged | |
| M5 | move the expiry check **above** the reuse check | |
| M6 | `revokeFamily`: `where: { family }` without `revokedAt: null` | |
| M7 | `login()`: skip `verify` when the user doesn't exist | |
| M8 | register `ThrottlerGuard` after `AuthGuard` | |
| M9 | register `RolesGuard` before `AuthGuard` | |
| M10 | the cookie's `path: '/'` | |
| M11 | the cookie's `httpOnly: false` | |
| M12 | `RolesGuard` throws `UnauthorizedException` | |
| M13 | the users adapter rethrows Prisma's `P2002` instead of a 409 | |
| M14 | `RegisterDto`: `@MinLength(1)` | |

<details><summary>What actually failed</summary>

| # | Caught by |
|---|---|
| M1, M2, M3 | e2e `REPLAYING a used refresh token kills the whole family` and `stores hashes, never tokens, and revokes the family` |
| M4 | e2e `stores hashes, never tokens…` only |
| **M5** | **nothing** |
| **M6** | **nothing** (it overwrites the original revocation times, which are your evidence of *when* each token died) |
| M7 | unit `still calls verify when the user does NOT exist` |
| **M8** | **nothing** (see I-9) |
| M9 | e2e `returns 401 when an ADMIN route is hit with no token at all` |
| M10, M11 | e2e `returns an access token in the body and the refresh token ONLY in a cookie` |
| M12 | e2e `returns 403 (not 401) when a USER hits an ADMIN route` |
| **M13** | **nothing**: the service's fast-path check answers first, so only a *concurrent* duplicate ever reaches the adapter |
| M14 | e2e `rejects a short password with 400` |

</details>

### 🐛 I-8 · three behaviours no test protects

Write one test for each **bold** row: M5, M6 and M13. Each one must fail when you reapply the
mutation, and pass when you revert it. That's how you know a test tests something.

<details><summary>Hint for M5</summary>

You need a token that is both revoked *and* expired. Log in, rotate once (now r1 is revoked and r2
is alive), push r1's `expiresAt` into the past directly through Prisma, then replay r1. What must
be true of **r2** afterwards?

</details>

<details><summary>Hint for M13</summary>

To get past the fast-path check, two registrations of the same email have to be in flight at the
same moment. What do you send together, and what status codes do you expect from the pair?

</details>

---

## 🐛 4. I-6: the race in your rotation (30 min, mandatory)

**The claim:** two `POST /auth/refresh` requests carrying the **same** token, sent at the same time,
both get 200. That means two live tokens in one family, and "single-use" isn't single-use.
Reproduced on 28 Oct: **10 out of 10 trials returned `200/200`.**

**Step 1: reproduce it yourself.** Write a temporary e2e test: log in, read the refresh cookie,
then fire two refreshes with it through `Promise.all` and print both statuses. Run it a few times.

**Step 2: explain it.** Before any fix, explain *why* both pass, using the words "read" and "write".

<details><summary>Hint 1</summary>

Re-read `docs/phase-1-auth-data-frontend.md` §A.2.2, *the lost update*. Now look at `rotate()`:
between `findByHash` (the read) and `revoke` (the write), what stops the second request from
reading the same row?

</details>

<details><summary>Hint 2: the shape of a fix, in words</summary>

Turn "check that it isn't revoked, then revoke it" into **one** statement that only succeeds if the
row is still unrevoked, and that tells you whether *you* were the one who revoked it. Prisma's
`updateMany` returns a `count`. What does `count === 0` mean, and which branch of `rotate()` should
handle it? The port's `revoke` signature will need to change, so ask what it should return.

</details>

**Step 3: write the test that fails first.** Two concurrent refreshes, exactly one 200. Then fix it.

**Step 4: think about I-7 before you celebrate.** After your fix, the request that loses the race
looks like a thief. Who else sends two refreshes at once?

### 🐛 I-7 · two tabs, one session

You have two tabs open, the access token has expired (or you reload both), and both tabs make an
authenticated call at the same moment.

<details><summary>What happens</summary>

Each tab has its own JavaScript memory, so each has its own `refreshing` promise: `http.ts`
de-duplicates refreshes **within** a tab, not across tabs. Both send the same cookie. Today you hit
I-6 and both succeed. After your I-6 fix, the second one looks like a replay, the family burns,
and the honest user is logged out in both tabs. ADR-003 says this "only bites if a token is copied
between devices"; in fact two tabs are enough.

</details>

<details><summary>The options to weigh (no code this week)</summary>

- **Cross-tab single flight on the client**: one tab refreshes and the others wait (look up the
  Web Locks API and `BroadcastChannel`). No security cost.
- **A short grace window on the server**: a token rotated seconds ago gets a plain 401 instead of
  burning the family. Simpler for clients, but it opens a small replay window for a thief.

Pick one, and when you build it, record it in a new ADR that supersedes ADR-003's claim.

</details>

---

## Spot the bug: ten snippets, all from your September code

Each one appeared in your code at some point. Some lines may be fine as written.

**B1.** `const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60);`

<details><summary>Answer</summary>

`Date.now()` is in **milliseconds**, so this adds 604,800 ms, about ten minutes. It needs `* 1000`.

</details>

**B2.** `revokeFamily`: `updateMany({ where: { family }, data: { revokedAt: null } })`

<details><summary>Answer</summary>

It **un-revokes** the family the kill switch exists to kill, and it type-checks perfectly. That was
your real September bug, and it's the one to tell when an interviewer asks for the hardest bug
you've found: short, silent, and a security failure.

</details>

**B3.**
```ts
const user = await this.users.getCredentialsByEmail(dto.email);
if (!user) throw new UnauthorizedException('No account with that email');
const ok = await this.hasher.verify(user.passwordHash, dto.password);
if (!ok) throw new UnauthorizedException('Incorrect password');
return { accessToken: await this.jwt.signAsync({ sub: user.id }) };
```

<details><summary>Answer (three problems)</summary>

Two different messages reveal which emails are registered. The early return for an unknown email
is fast, so timing reveals it too. And the token has no `role`, so `RolesGuard` can never
authorize anyone.

</details>

**B4.** `findByEmail` returns `this.prisma.user.findUnique({ where: { email } })` directly, typed
`Promise<User | null>`.

<details><summary>Answer</summary>

It type-checks because the Prisma row is a structural *superset* of `User`, but the object still
carries `passwordHash`, and any endpoint that returns it leaks the hash. Map the fields
explicitly. TypeScript only checks the shape, not the extra keys you carry at runtime.

</details>

**B5.** `@Module({ controllers: [AuthController], providers: [AuthService], imports: [UsersService] })`

<details><summary>Answer</summary>

`imports` takes **modules**, not providers. Import `UsersModule`, and have `UsersModule` export
`UsersService`. Nest fails at boot.

</details>

**B6.** A `rotate()` that checks `expiresAt` before `revokedAt` and calls `issue(row.userId, row.family)`.

<details><summary>Answer</summary>

An expired replay never burns the family (M5), and the new access token has no role.

</details>

**B7.**
```ts
const presented = req.cookies['refresh'];
const { accessToken } = await this.service.refresh(presented);
this.setRefreshCookie(res, presented);
```

<details><summary>Answer</summary>

It puts the **old**, now-revoked token back in the cookie. The next refresh is a replay, the family
burns, and the user is logged out after 15 minutes, every time. Set the new `refreshToken`.

</details>

**B8.** `secure: true` in `setRefreshCookie`, running with `NODE_ENV=development` on
`http://localhost:3000`.

<details><summary>Answer</summary>

Whether it works depends on the browser (Q18). Tie it to the environment so you don't depend on
that.

</details>

**B9.** `logout`: `if (!token) throw new UnauthorizedException();`

<details><summary>Answer</summary>

It isn't idempotent: the second click or the second tab gets an error for a state that's already
reached. Return quietly.

</details>

**B10.** `AuthService` declares `private readonly dummyHash = this.hasher.hash(…)` as a field.

<details><summary>Answer</summary>

See Q4: `this.hasher` is `undefined` when field initializers run.

</details>

---

## Before you stop

- [ ] the trace done, from memory, out loud
- [ ] Q1–Q25 marked, misses copied
- [ ] all 14 mutations predicted, then run
- [ ] **I-6 fixed with a test that failed first**
- [ ] at least one I-8 test written
- [ ] the 60-second rotation answer recorded and listened to
- [ ] Git Part 2
