# Week 1 Knowledge — auth, from zero

Everything you need to complete [`WEEK-1.md`](./WEEK-1.md) without being handed the answers.

**What's here:** the concepts, the **real output** of the tools (I ran everything below), the
**API surface** of every library you'll touch, diagrams of each flow, and the traps.

**What's not here:** your `AuthService`. The signatures are shown so you know what's available;
assembling them is the week.

**Read each section the morning of its day**, not all at once.

---

## Contents

| Day | Section |
|---|---|
| **Mon** | [Password hashing](#monday--password-hashing) |
| **Tue** | [Sessions, tokens, JWTs](#tuesday--sessions-tokens-and-jwts) |
| **Wed** | [Refresh rotation & reuse detection](#wednesday--refresh-tokens-rotation-reuse-detection) |
| **Thu** | [XSS, CSRF, cookies](#thursday--xss-csrf-and-cookies) |
| **Fri** | [Guards, RBAC, rate limiting](#friday--guards-rbac-rate-limiting) |
| **Sat** | [Server state & TanStack Query](#saturday--server-state-and-tanstack-query) |
| **Sun** | [Testing strategy](#sunday--testing-strategy) |
| — | [Reference shelf](#the-reference-shelf) |

---

# Monday — password hashing

## The idea in one line

You never store a password. You store a **deliberately slow, salted, one-way transformation** of
it, so you can check a guess but never recover the original.

## Why not SHA-256

SHA-256 is built to be *fast* — billions of hashes per second on a GPU. That's the opposite of what
you want. A password hash must be slow **on purpose**, so each guess costs the attacker real time.

| | SHA-256 | bcrypt | Argon2id |
|---|---|---|---|
| Designed for | speed | passwords | passwords |
| Hard on | nothing | CPU | **CPU + memory** |
| GPU/ASIC attack | trivial | expensive | very expensive |
| Salt | you manage it | built in | built in |

**Argon2id is memory-hard.** It forces the attacker to allocate real RAM per guess — and GPUs have
thousands of cores but limited memory per core, which is exactly where the attack economy lives.
It won the 2015 Password Hashing Competition. bcrypt is still acceptable; Argon2id is the better
default.

## 🔬 A real hash, dissected

I ran `argon2.hash('hunter2')` — this is the actual output:

```
$argon2id$v=19$m=65536,p=4,t=3$E1bCBRy1RCQof/xa2e5Vdw$PPrQ0j0SbgQL/6aMgVKIhljZzN6UYSpDUOrIO0AOLiQ
└───┬───┘└─┬─┘└───────┬───────┘└──────────┬─────────┘└───────────────┬──────────────────────────┘
 variant  ver     parameters              salt                      digest
```

| Part | Value | Means |
|---|---|---|
| variant | `argon2id` | the hybrid mode — resists side-channel *and* GPU attacks |
| version | `v=19` | Argon2 version 1.3 |
| `m=65536` | 64 MiB | **memory cost** — RAM per hash |
| `p=4` | 4 | **parallelism** — threads |
| `t=3` | 3 | **time cost** — iterations |
| salt | `E1bCBRy1...` | random, generated per hash |
| digest | `PPrQ0j0S...` | the actual output |

**Everything needed to verify is inside the string.** That's why there's no `salt` column in your
schema — the salt travels with the hash.

I hashed `hunter2` twice and got **different strings** — different salts. Both verify correctly.
That's the property to check on Monday.

## 🧰 API surface — `argon2`

```ts
argon2.hash(plain: string, options?): Promise<string>
argon2.verify(hash: string, plain: string): Promise<boolean>
```

| Option | Default | Note |
|---|---|---|
| `memoryCost` | 65536 (64 MiB) | raise for more security, watch your server RAM |
| `timeCost` | 3 | iterations |
| `parallelism` | 4 | threads |
| `type` | `argon2.argon2id` | keep it |

### ⚠️ The trap that will cost you 20 minutes

**`verify` takes the hash FIRST, then the plain password.** Reversed, it throws a message that
tells you nothing about the real cause:

```
argon2.verify(hash,  plain) → true       ✅
argon2.verify(plain, hash)  → THROWS: "pchstr must contain a $ as first char"
```

I hit this deliberately so you don't have to hit it accidentally.

## 📐 Where it sits

```mermaid
flowchart LR
    S["auth/application<br/>AuthService"] --> P["ports/<br/>PasswordHasher"]
    A["adapters/<br/>Argon2Hasher"] -.implements.-> P
    A --> L["argon2 library"]
    T["test<br/>FakePasswordHasher"] -.implements.-> P
```

The port exists so algorithms can change, and so tests can inject a fake that returns instantly
instead of paying Argon2's deliberate ~200ms.

## 📖 Read

- `docs/phase-1-auth-data-frontend.md` **§B.1, lines 452–488**
- **OWASP Password Storage Cheat Sheet** — cheatsheetseries.owasp.org. Current parameter guidance
- **NIST SP 800-63B §5.1.1** — the source for *length over complexity*. Being able to cite it is
  worth real points

## 🎥 Watch

- Computerphile, *"How NOT to Store Passwords"* — 10 min, the clearest hash→salt progression anywhere

## 🎤 Interview questions

- Why is Argon2 preferable to SHA-256 for passwords?
- What's a salt and what attack does it prevent?
- Why would you *want* login to be slow?

---

# Tuesday — sessions, tokens, and JWTs

## The stateless problem

HTTP has no memory. Every request arrives anonymous. So either **the server remembers** (sessions)
or **the client carries proof** (tokens).

```mermaid
flowchart TD
    subgraph sess["Session"]
        A1["client sends<br/>session id"] --> A2["server looks it up<br/>in a store"] --> A3["knows the user"]
    end
    subgraph tok["Token"]
        B1["client sends<br/>signed token"] --> B2["server verifies<br/>the signature"] --> B3["knows the user"]
    end
```

| | Session | JWT |
|---|---|---|
| Server stores | one record per login | **nothing** |
| Revoke instantly | ✅ delete the record | ❌ valid until `exp` |
| Horizontal scaling | needs shared storage | trivial |
| Per-request cost | a lookup | a signature check |

**JWTs are not automatically better.** They trade revocability for statelessness. Knowing *why*
you'd pick each is the signal.

## 🔬 A real JWT, dissected

I generated this one — it's a genuine HS256 token:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHg3YWJjMTIzIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3ODgxMTI0OTUsImV4cCI6MTc4ODExMzM5NX0.Z1czIijpHQb8fxltEZwGUhoLN0GZEZDOvs_kysger6Y
└──────────────── header ─────────────┘ └──────────────────────── payload ─────────────────────────────────────┘ └─────────── signature ────────────┘
```

Decoded:

| Part | Contents |
|---|---|
| header | `{"alg":"HS256","typ":"JWT"}` |
| payload | `{"sub":"clx7abc123","role":"USER","iat":1788112495,"exp":1788113395}` |
| signature | not decodable — an HMAC over `header.payload` with your secret |

`exp - iat` = **900 seconds** = 15 minutes.

### ⚠️ The payload is base64, NOT encrypted

I decoded that payload with nothing but `Buffer.from(part, 'base64url')`. **Anyone holding the
token can read it.**

The signature proves the token wasn't *modified*. It does not make it *secret*.

> Put `sub` and `role` in there. Never an email, a name, or anything private.

**Verify this yourself Tuesday:** paste a token you generate into **jwt.io** and read your own
payload back.

## 🧰 API surface — `@nestjs/jwt`

```ts
// module registration
JwtModule.registerAsync({ ... })   // when the secret comes from ConfigService

// the injectable service
jwtService.signAsync(payload: object, options?): Promise<string>
jwtService.verifyAsync<T>(token: string, options?): Promise<T>   // throws if invalid/expired
jwtService.decode(token: string): object                          // NO verification — never trust this
```

| Option | Example |
|---|---|
| `secret` | from `ConfigService` — never hardcoded |
| `expiresIn` | `'15m'`, `'7d'` |

⚠️ **`decode` does not verify.** It just base64-decodes. Using it to authenticate would let anyone
forge any token. Use `verifyAsync`.

## ⚠️ Two attacks this day is about

**User enumeration.** If "unknown email" and "wrong password" give different responses, you've built
a tool for discovering which emails have accounts. Identical message, identical status.

**Timing attack.** If unknown emails return instantly and known emails take 200ms (because you
hashed), the *response time* leaks which emails exist. Hash a dummy value on the not-found path so
both cost the same.

## 📖 Read

- `docs/phase-1` **§B.2, lines 489–524** — including the JWT anatomy block
- **jwt.io** — paste your own tokens in
- **NestJS docs → Security → Authentication** — the `@nestjs/jwt` wiring for your exact stack

## 🎥 Watch

- Fireship, *"JWT in 100 seconds"* — the shape
- Hussein Nasser on sessions vs JWT — the counterweight to every "JWT is better" tutorial

## 🎤 Interview questions

- Can you revoke a JWT? What do you do about that?
- Is a JWT encrypted?
- When would you choose sessions instead?

---

# Wednesday — refresh tokens, rotation, reuse detection

**The hardest and most interview-worthy day of the week.**

## Why two tokens

You want short-lived credentials (bounded damage) **and** long sessions (users hate re-logging in).
One token can't do both.

| | Access token | Refresh token |
|---|---|---|
| Lifetime | 15 min | 7 days |
| Sent on | every request | only `/auth/refresh` |
| Stored server-side | ❌ no | ✅ yes, **hashed** |
| Revocable | no | yes |

**Why store only the refresh token?** Storing access tokens would mean a database lookup per
request — you'd have thrown away the reason to use JWTs. The refresh token is used rarely, so
storing it costs nothing and buys revocability.

**Why hash it?** Same logic as passwords: if the table leaks, hashes are useless. You can use a
**fast** hash (SHA-256) here — the token is already high-entropy random, unlike a human password,
so there's nothing to brute-force.

```ts
// SHA-256 is enough for a random token — no salt, no slowness needed
crypto.createHash('sha256').update(token).digest('hex')
```

## 📐 Rotation

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant D as DB
    C->>A: POST /auth/login
    A->>D: store hash(R1), family=F
    A-->>C: access(15m) + R1
    Note over C,A: 15 minutes later...
    C->>A: POST /auth/refresh (R1)
    A->>D: find hash(R1) — valid?
    A->>D: revoke R1, store hash(R2) in family F
    A-->>C: new access + R2
```

Every refresh issues a **new** token and invalidates the old one. A stolen token has a short useful
life — and using it leaves a trace.

## 📐 Reuse detection — the insight

Work this on paper before you write anything.

An attacker steals `R1`. There are only two orderings:

```mermaid
flowchart TD
    S["Attacker steals R1"] --> Q{"Who refreshes first?"}
    Q -->|Attacker| A1["Attacker gets R2"] --> A2["User later presents R1<br/>→ already used"]
    Q -->|User| B1["User gets R2"] --> B2["Attacker later presents R1<br/>→ already used"]
    A2 --> D["A USED token was presented twice"]
    B2 --> D
    D --> E["Revoke the WHOLE family<br/>both parties logged out"]
    E --> F["Only the real user can log<br/>back in — they know the password"]
```

**Either way a used token gets presented a second time**, and that never happens in normal
operation. You can't tell which party is the attacker — and you don't need to. Revoking the family
logs both out, and only the legitimate user can return.

> **The theft becomes self-detecting.** That sentence is the whole day. Be able to say it without notes.

**What "family" means:** a login starts a family; each rotation issues a new token in the same
family. The family is the unit you revoke.

## 📖 Read

- `docs/phase-1` **§B.3, lines 525–572** — read it twice, it's dense
- **OAuth 2.0 Security Best Current Practice** (search "oauth 2.0 security bcp refresh token
  rotation") — where this is specified. Reading a real RFC section is a habit worth starting
- **Auth0's blog on refresh token rotation** — the clearest family diagram

## 🎤 Interview questions

- Why do you need a refresh token at all?
- What happens if one is stolen — and how would you detect it?

---

# Thursday — XSS, CSRF, and cookies

## The two attacks, precisely

**XSS** — an attacker gets *their* JavaScript running on *your* page. That script has full access
to the page, including `localStorage`.

**CSRF** — a *different* site causes the user's browser to send a request to *your* site. Cookies
go automatically, so it arrives authenticated even though the user never intended it.

```mermaid
flowchart TD
    subgraph x["XSS"]
        X1["attacker's JS runs<br/>on YOUR page"] --> X2["reads localStorage"] --> X3["steals the token"]
    end
    subgraph c["CSRF"]
        C1["user visits evil.com"] --> C2["it POSTs to your-api.com"] --> C3["browser attaches cookies<br/>automatically"] --> C4["request looks legitimate"]
    end
```

## The storage trade-off — this table is the whole day

| Storage | XSS can steal? | Sent automatically? | CSRF risk |
|---|---|---|---|
| `localStorage` | **Yes** | No | No |
| Regular cookie | Yes | Yes | **Yes** |
| **httpOnly cookie** | **No** | Yes | Yes → blocked by `SameSite` |
| JS memory | only while the tab lives | No | No |

**The consensus:** refresh token in an **httpOnly cookie**, access token **in memory**. XSS can't
read the cookie; `SameSite` blocks ordinary CSRF; the in-memory access token is never sent
automatically so it can't be CSRF'd at all.

## 🔬 The Set-Cookie header you're aiming for

```
Set-Cookie: refresh_token=eyJhbG...; HttpOnly; Secure; SameSite=Lax; Path=/auth/refresh; Max-Age=604800
```

| Flag | Blocks |
|---|---|
| `HttpOnly` | JavaScript reading it → **XSS theft** |
| `Secure` | Sending over plain HTTP → network sniffing |
| `SameSite=Lax` | Being sent on most cross-site requests → **CSRF** |
| `Path=/auth/refresh` | Being sent where it isn't needed → reduces exposure |
| `Max-Age` | Living forever |

**Verify Thursday:** DevTools → Application → Cookies. `HttpOnly` must be ✓, and
`document.cookie` in the console must **not** show it.

## 🧰 API surface

```ts
// Nest response — you need @Res({ passthrough: true }) to reach it
res.cookie(name: string, value: string, options: CookieOptions)
res.clearCookie(name: string, options?)

// CookieOptions
{ httpOnly: true, secure: true, sameSite: 'lax', path: '/auth/refresh', maxAge: 604800000 }
```

⚠️ `maxAge` in Express is **milliseconds**. The `Max-Age` header is **seconds**. Express converts.

## ⚠️ You will hit a CORS error

Sending cookies cross-origin requires **all three**:

```ts
app.enableCors({ origin: 'http://localhost:3000', credentials: true })   // server
fetch(url, { credentials: 'include' })                                   // client
// and origin can no longer be '*'
```

The browser refuses to send credentials to a wildcard origin. That's deliberate, not a bug.

## 📖 Read

- `docs/phase-1` **§B.4, lines 573–628**
- **MDN → Using HTTP cookies** — the authority on the flags
- **OWASP CSRF Prevention Cheat Sheet**

## 🎥 Watch

- **PwnFunction**, *"Cross-Site Scripting (XSS)"* — shows real exploitation. Understanding the
  attack makes the defence obvious

## 🎤 Interview questions

- Where do you store a JWT in a browser, and why?
- XSS vs CSRF — the difference?
- What does `SameSite=Lax` actually do?

---

# Friday — guards, RBAC, rate limiting

## Where a guard runs

```mermaid
flowchart LR
    R["Request"] --> M["Middleware"] --> G["**Guards**<br/>may this proceed?"] --> I["Interceptors"]
    I --> P["Pipes<br/>validate"] --> H["Handler"]
    H -.throws.-> F["Filters"]
```

**Authentication** (who are you) and **authorization** (may you) are two guards, in that order.
Conflating them is a common interview stumble.

**Why a guard, not an `if` in the controller?** Cross-cutting concerns belong in the pipeline. Your
service should never contain `if (!user) throw`.

**Global with opt-out, not per-route opt-in.** If auth is opt-in, forgetting the decorator leaves an
endpoint **open**. If it's opt-out, forgetting means a route is *over*-protected — which fails
loudly and safely. **Default to secure.**

## 401 vs 403

| Code | Means |
|---|---|
| **401** Unauthorized | "I don't know who you are" — missing or invalid token |
| **403** Forbidden | "I know who you are, and you may not" — valid token, wrong role |

Getting this backwards is small, and reviewers always notice.

## 🧰 API surface — what you implement

```ts
// A guard implements ONE method
interface CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}

// Reading the request inside a guard
const request = context.switchToHttp().getRequest();

// Reading metadata set by your own decorator (e.g. @Public(), @Roles())
reflector.getAllAndOverride<T>(KEY, [context.getHandler(), context.getClass()])

// Making a decorator that ATTACHES metadata
export const Public = () => SetMetadata('isPublic', true);

// Making a decorator that READS from the request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
```

`getAllAndOverride` checks the **method first, then the class** — so a route-level decorator beats
a controller-level one. That ordering is why it's `getAllAndOverride` and not `get`.

## 🧰 API surface — `@nestjs/throttler`

```ts
ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])   // ttl in MILLISECONDS

@Throttle({ default: { limit: 5, ttl: 60_000 } })        // tighter, on one route
@SkipThrottle()                                           // opt a route out
```

**Why rate-limit auth specifically?** Without it, login is a password-guessing oracle running as
fast as your server can hash. Rate limiting is what makes your slow hash *matter* — the two
defences multiply.

**Per-IP is imperfect** — shared NAT puts many users on one IP; a botnet gives an attacker many.
It's the standard first line, not a complete answer. Per-account lockout is stronger but introduces
a denial-of-service vector (I lock you out by guessing wrong). Note the trade-off; don't pretend it
away.

## 📖 Read

- `docs/phase-1` **§B.5, lines 629–651** — RBAC
- `docs/phase-1` **§C.2, lines 692–710** — the pieces assembled
- `docs/phase-0-foundations.md` **§B.4, lines 600–636** — the lifecycle
- `docs/phase-0-foundations.md` **§B.5, lines 637–673** — custom decorators
- **NestJS docs → Guards**, then **→ Custom decorators**

## 🎤 Interview questions

- 401 vs 403?
- Why rate-limit login even with strong hashing?
- Where in the lifecycle does authorization belong?

---

# Saturday — server state and TanStack Query

## The core distinction

**Client state** is yours — a modal being open, form input. Always correct, you own it.

**Server state** is a *copy* of something living elsewhere. It can be stale, someone else can change
it, and two components asking for it should share **one** request.

**What you're doing instead:** `useState` + `useEffect` + `loading` + `error` in every component is
a hand-rolled cache with no deduplication, no invalidation, no background refresh, and a race if
the component unmounts mid-fetch. *(Your `problems/page.tsx` has an unmount guard for exactly this —
that comment exists because the problem is real.)*

## 📐 The cache lifecycle

```mermaid
stateDiagram-v2
    [*] --> fetching: first mount
    fetching --> fresh: data arrives
    fresh --> stale: staleTime elapses
    stale --> fetching: refetch on mount/focus/reconnect
    stale --> [*]: gcTime elapses, evicted
    fresh --> fresh: another component asks — cache hit, NO request
```

| Setting | Means |
|---|---|
| `staleTime` | how long data counts as **fresh** (default `0` — instantly stale) |
| `gcTime` | how long **unused** data stays cached before eviction (default 5 min) |

**That `staleTime: 0` default is why it refetches more than you expect.** Read *Important Defaults*
first — it's the #1 source of "why is it doing that".

## 🧰 API surface — TanStack Query v5

```ts
const { data, isPending, isError, error, refetch } = useQuery({
  queryKey: ['problems'],              // identity — the cache key
  queryFn: () => fetch(...).then(r => r.json()),
  staleTime: 60_000,
});

const { mutate, isPending } = useMutation({
  mutationFn: (creds) => fetch('/auth/login', { method: 'POST', ... }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
});
```

### ⚠️ v4 → v5 renames — most tutorials show v4

I checked your version (**5.102.8**):

| v4 | v5 |
|---|---|
| `isLoading` (no data yet) | **`isPending`** |
| `cacheTime` | **`gcTime`** |
| positional args `useQuery(key, fn)` | **single object** `useQuery({ queryKey, queryFn })` |

`isLoading` still exists in v5 but means something different (`isPending && isFetching`). Following
a v4 tutorial will give you confusing results.

## Query keys are the API

```ts
['problems']              // the list
['problem', slug]         // one item
['problems', { tag }]     // a filtered list
```

The key identifies the cache entry, and invalidation is expressed in keys:
`invalidateQueries({ queryKey: ['problems'] })` invalidates the list **and** everything under it.
Design keys well and the rest is easy.

## Do this while building

**Keep the Devtools panel open.** Watch entries move fresh → stale → fetching as you navigate. That
visual builds the model faster than any article.

## 📖 Read

- `docs/phase-1` **Part D, lines 713–810** — budget 60 minutes
- **TanStack Query docs → Guides → Important Defaults** — read this *first*
- then **→ Query Keys**, **→ Mutations**

## 🎥 Read instead of watch

- **TkDodo's blog** (the library's maintainer) — *Practical React Query* is the best writing on this
  by a distance

## 🎤 Interview questions

- Why not just `useEffect` + `fetch`?
- Server state vs client state?
- How do you keep the UI consistent after a mutation?

---

# Sunday — testing strategy

| | Unit | e2e |
|---|---|---|
| Scope | one class alone | whole stack over HTTP |
| Dependencies | fakes | real database |
| Speed | **milliseconds** | seconds |
| Catches | wrong logic | wrong wiring |

You need both — a unit test can't catch a wrong route path; an e2e test can't cheaply cover twelve
edge cases.

## 🔬 Why your architecture makes unit tests possible

```ts
// no Nest, no database, no Argon2 — a plain constructor call
const service = new AuthService(fakeUsersRepo, fakeHasher, fakeJwt);
```

That only works because `AuthService` **declares** its dependencies instead of constructing them.

> **If your unit tests are slow, something real leaked in** — and the test is telling you the
> layering broke. Speed is a design signal, not just convenience.

**Test doubles:** a *stub* returns canned answers; a *mock* also asserts it was called correctly.
You almost always want a stub.

**What to test:** not coverage percentage — **behaviour at the boundaries**. For this week: reuse
detection revokes the family · wrong password and unknown email are indistinguishable · an expired
token is rejected.

## 📖 Read

- `apps/dojo/content/supplements/testing.md` — your own guide
- Dojo → [/practice/testing](http://localhost:3002/practice/testing)

---

# The reference shelf

## Docs to read directly, not through tutorials

| Topic | Where |
|---|---|
| NestJS | docs.nestjs.com — Overview and Security are real tutorials |
| Prisma | prisma.io/docs — Client API reference |
| TanStack Query | tanstack.com/query — Guides then Reference |
| TypeScript | typescriptlang.org/docs/handbook |
| Browser anything | developer.mozilla.org |
| PostgreSQL | postgresql.org/docs |

## Security

- **OWASP Cheat Sheet Series** — cheatsheetseries.owasp.org. Bookmark it. Password Storage,
  Authentication, Session Management, CSRF, XSS
- **OWASP Top 10** — once a year, forever

## People worth following

| Who | For |
|---|---|
| **TkDodo** | React Query, React patterns |
| **Matt Pocock** (Total TypeScript) | best free TS explanations |
| **Hussein Nasser** | backend fundamentals, protocols, databases |
| **PwnFunction** | web security, visual and precise |

## Books, for depth

| Book | For |
|---|---|
| *Designing Data-Intensive Applications* — Kleppmann | the best backend book. A chapter a month |
| *SQL Antipatterns* — Karwin | short, practical, immediately useful |
| *The Pragmatic Programmer* | craft and judgement |

## The habit that matters most

**When your editor and the compiler disagree, the compiler is right.** When a tutorial and the
official docs disagree, the docs are right. When the docs and the actual behaviour disagree,
**test it and believe the test.**

You proved that four times this weekend: Prisma 7's driver adapters, the `datasourceUrl` that no
longer exists, the stale server on port 3001, and a `Cannot find name 'describe'` error that only
your editor could see.
