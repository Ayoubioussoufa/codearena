/**
 * Exercises for Phase 1 — databases, auth, and server state.
 *
 * The SQL half is weighted toward the things that are slow or wrong in ways a
 * passing test will not show you: index column order, offset pagination
 * duplicating rows, N+1. The auth half is the security reasoning behind code
 * already in this repo.
 */
import type { GuideExercise } from "./types";

export const phase1Exercises: GuideExercise[] = [
  /* ── A: databases ─────────────────────────────────────────────────── */
  {
    id: "schema-constraints",
    title: "Let the database enforce it",
    prompt:
      "Add the constraints this schema is missing. Two emails must never collide, a token row must die with its user, and the rotation lookup must not scan the table.",
    language: "text",
    given: `model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  tokenHash String
  family    String
  revokedAt DateTime?
  expiresAt DateTime
}

// Lookups: findUnique by tokenHash, and revokeFamily by (userId, family).`,
    starter: `model User {
  id       String @id @default(cuid())
  email    String
  username String
}

model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  tokenHash String
  family    String
  revokedAt DateTime?
  expiresAt DateTime
}
`,
    solution: `model User {
  id       String @id @default(cuid())
  email    String @unique
  username String @unique
}

model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique
  family    String
  revokedAt DateTime?
  expiresAt DateTime

  @@index([userId, family])
}
`,
    hint: "A unique constraint is also an index, so `tokenHash` needs only one of the two. The composite index is for the query that filters on both columns.",
    explanation:
      "**A pre-check in application code is UX; the database constraint is correctness.** Two concurrent registrations can both pass a `findByEmail` check and then both insert — only `@unique` stops the second, which is why you catch `P2002` rather than trusting the check. `onDelete: Cascade` means deleting a user takes their tokens with it, so a test teardown is one delete and an orphaned row is impossible. And `@@index([userId, family])` matches the `revokeFamily` filter; column order matters, because an index on `(a, b)` cannot answer a query that filters only on `b`.",
    checks: [
      { re: "email\\s+String\\s+@unique", label: "`email` is unique" },
      { re: "username\\s+String\\s+@unique", label: "`username` is unique" },
      { re: "tokenHash\\s+String\\s+@unique", label: "`tokenHash` is unique" },
      { re: "onDelete\\s*:\\s*Cascade", label: "tokens die with their user" },
      { re: "@@index\\(\\[userId,\\s*family\\]\\)", label: "composite index matches the rotation lookup" },
    ],
  },

  {
    id: "index-column-order",
    title: "Say which queries the index can answer",
    prompt:
      "Given `@@index([userId, family])`, write `yes` or `no` for each query, one per line.",
    language: "text",
    given: `1. WHERE userId = 'u1' AND family = 'f1'
2. WHERE userId = 'u1'
3. WHERE family = 'f1'
4. WHERE family = 'f1' AND userId = 'u1'`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. yes — both columns, in order
2. yes — a leading prefix of the index
3. no — skips the leading column, so the index cannot be walked
4. yes — the planner reorders predicates; only the INDEX's order matters
`,
    hint: "Think of a phone book sorted by surname then first name. Which of these can you look up without reading every page?",
    explanation:
      "A composite index is sorted by the first column, then the second within it — exactly a phone book. You can find everyone named Smith, and Smith-John, but not everyone called John, because the Johns are scattered across every surname. **Only a leading prefix is usable.** Case 4 catches people out: the order you write the `WHERE` clauses in is irrelevant, because the planner is free to reorder predicates — it is the index's column order that constrains it. This is the single most common reason a query that 'has an index' is still slow.",
    checks: [
      { re: "1\\.\\s*yes", flags: "mi", label: "1 — yes" },
      { re: "2\\.\\s*yes", flags: "mi", label: "2 — yes, a leading prefix" },
      { re: "3\\.\\s*no", flags: "mi", label: "3 — no, skips the leading column" },
      { re: "4\\.\\s*yes", flags: "mi", label: "4 — yes, predicate order does not matter" },
    ],
  },

  {
    id: "cursor-pagination",
    title: "Fix pagination that duplicates rows",
    prompt:
      "This page-2 query can return rows already shown on page 1 when a row is inserted between requests. Rewrite it as cursor pagination.",
    language: "typescript",
    given: `// Problem has an auto-incrementing numeric id.
// The client sends back whatever cursor you return.`,
    starter: `async list(page: number, limit: number) {
  const items = await this.prisma.problem.findMany({
    skip: page * limit,
    take: limit,
    orderBy: { id: 'asc' },
  });
  return { items };
}
`,
    solution: `async list(cursor: number | undefined, limit: number) {
  const items = await this.prisma.problem.findMany({
    ...(cursor !== undefined && { cursor: { id: cursor }, skip: 1 }),
    take: limit,
    orderBy: { id: 'asc' },
  });
  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
}
`,
    hint: "Page through by remembering WHERE you stopped, not HOW MANY you skipped. `skip: 1` steps past the cursor row itself, which you already returned.",
    explanation:
      "Offset pagination has two diseases. It gets **slow** — `OFFSET 100000` makes the database walk and discard a hundred thousand rows. And it is **wrong**: insert a row while the user is reading page 1 and everything shifts down, so page 2 repeats a row and another is never seen. A cursor is a position in a stable ordering, so inserts elsewhere cannot shift it. `skip: 1` is the detail people miss — without it the cursor row is returned again as the first item of every page.",
    checks: [
      { re: "cursor", label: "pages by cursor" },
      { re: "skip\\s*:\\s*1", label: "`skip: 1` steps past the cursor row" },
      { re: "nextCursor", label: "returns the next cursor" },
      { re: "orderBy", label: "keeps a stable ordering — a cursor is meaningless without one" },
      { re: "skip\\s*:\\s*page", expect: false, label: "no offset arithmetic left" },
    ],
  },

  {
    id: "n-plus-one",
    title: "Kill an N+1",
    prompt:
      "This issues one query for the list and one more per row. Rewrite it as a single query.",
    language: "typescript",
    given: `model Problem { id Int @id  title String  tags Tag[] }
// Prisma supports: include: { tags: true }`,
    starter: `const problems = await this.prisma.problem.findMany({ take: 50 });

for (const problem of problems) {
  problem.tags = await this.prisma.tag.findMany({
    where: { problemId: problem.id },
  });
}
`,
    solution: `const problems = await this.prisma.problem.findMany({
  take: 50,
  include: { tags: true },
});
`,
    hint: "The ORM can fetch the relation with the parent. The loop exists only because nobody told it to.",
    explanation:
      "51 round trips become 1. Each one is cheap on a laptop with the database on localhost, which is exactly why N+1 survives code review and then falls over in production where every round trip crosses a network. **The tell is a query inside a loop** — or an ORM lazy-loading a relation, which hides the loop entirely. Spotting it in a code sample is a routine interview question, and the fix is always the same: ask for what you need in one request.",
    checks: [
      { re: "include\\s*:\\s*\\{\\s*tags", label: "fetches the relation in the same query" },
      { re: "for\\s*\\(|forEach|map\\(async", expect: false, label: "no query inside a loop" },
      { re: "findMany", label: "still one findMany" },
    ],
  },

  {
    id: "transaction-atomicity",
    title: "Make two writes atomic",
    prompt:
      "Rotation must revoke the old token and create the new one together — never one without the other. Wrap them.",
    language: "typescript",
    given: `// this.prisma.$transaction(async (tx) => { ... })
// tx has the same model methods as prisma.`,
    starter: `await this.prisma.refreshToken.update({
  where: { id: row.id },
  data: { revokedAt: new Date() },
});

await this.prisma.refreshToken.create({
  data: { userId, tokenHash, family: row.family, expiresAt },
});
`,
    solution: `await this.prisma.$transaction(async (tx) => {
  await tx.refreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });

  await tx.refreshToken.create({
    data: { userId, tokenHash, family: row.family, expiresAt },
  });
});
`,
    hint: "Both writes must go through the transaction handle, not the original client. One that doesn't is outside the transaction and will not roll back.",
    explanation:
      "Crash between the two statements and the user's token is revoked with no replacement — they are logged out and cannot refresh. A transaction makes both happen or neither. The trap is using `tx` for one and `this.prisma` for the other: the second runs on a different connection, outside the transaction, and silently survives a rollback. That bug is invisible until the day something actually fails midway.",
    checks: [
      { re: "\\$transaction", label: "wraps both writes in a transaction" },
      { re: "tx\\.refreshToken\\.update", label: "the update uses the transaction handle" },
      { re: "tx\\.refreshToken\\.create", label: "the create uses it too" },
      {
        re: "this\\.prisma\\.refreshToken",
        expect: false,
        label: "nothing bypasses the transaction",
      },
    ],
  },

  /* ── B: auth ──────────────────────────────────────────────────────── */
  {
    id: "timing-attack",
    title: "Close the timing side channel",
    prompt:
      "Both branches already return the same message, and this still leaks which emails are registered. Fix it.",
    language: "typescript",
    given: `// this.dummyHash — a promise of a real argon2 hash of a random string,
// computed once in the constructor.
// hasher.verify(hash, plain) takes ~45ms.`,
    starter: `async login(dto: LoginDto) {
  const user = await this.users.getCredentialsByEmail(dto.email);
  if (!user) throw new UnauthorizedException('Invalid email or password');

  const ok = await this.hasher.verify(user.passwordHash, dto.password);
  if (!ok) throw new UnauthorizedException('Invalid email or password');

  return this.tokens.issueForLogin(user.id, user.role);
}
`,
    solution: `async login(dto: LoginDto) {
  const user = await this.users.getCredentialsByEmail(dto.email);

  const hash = user?.passwordHash ?? (await this.dummyHash);
  const ok = await this.hasher.verify(hash, dto.password);

  if (!user || !ok) throw new UnauthorizedException('Invalid email or password');

  return this.tokens.issueForLogin(user.id, user.role);
}
`,
    hint: "Time the two paths. An unknown email returns in ~5ms; a known one spends ~45ms in Argon2. An attacker with a stopwatch does not need your error message.",
    explanation:
      "Identical messages are only half the defence. **The response time is the other half**, and most candidates stop at the message. Verifying against a dummy hash makes both paths cost the same, so the timing carries no information. Shape matters: one `verify` call, one throw, one message — an early return for the missing user reintroduces exactly the gap you closed. Measure it with `curl -w '%{time_total}'` rather than assuming.",
    checks: [
      { re: "dummyHash", label: "verifies against a dummy hash when the user is missing" },
      { re: "\\?\\?|\\|\\|", label: "falls back rather than returning early" },
      { re: "if\\s*\\(!user\\s*\\|\\|\\s*!ok|if\\s*\\(!ok\\s*\\|\\|\\s*!user", label: "one throw for both failures" },
      {
        re: "if\\s*\\(!user\\)\\s*throw",
        expect: false,
        label: "no early return before the hash — that is the leak",
      },
    ],
  },

  {
    id: "jwt-payload",
    title: "Decide what goes in the token",
    prompt:
      "For each field write `yes` or `no` — should it be in the JWT payload?",
    language: "text",
    given: `1. the user's id
2. the user's role
3. the user's email
4. the user's password hash
5. an expiry`,
    starter: `1.
2.
3.
4.
5.
`,
    solution: `1. yes — as sub, the registered claim for who the token is about
2. yes — so RolesGuard answers without a database query
3. no — a JWT is signed, not encrypted; anyone holding it can read this
4. no — never, anywhere, for any reason
5. yes — as exp; a token that cannot be revoked must expire
`,
    hint: "Decode one with `Buffer.from(token.split('.')[1], 'base64url')`. No secret, no library. That is the whole answer to what belongs in there.",
    explanation:
      "**Signed, not encrypted.** The signature proves *you* issued it; it does nothing to hide the contents, and anyone with the token reads the payload in one line. So the payload carries only what you would accept being public. `role` earns its place because it lets authorisation be answered with zero I/O — that is the payoff for putting it there. `exp` is not optional: a JWT cannot be revoked, so a short expiry is the only limit on a stolen one, and refresh tokens exist to make a short expiry liveable.",
    checks: [
      { re: "1\\.\\s*yes", flags: "mi", label: "1 — yes, the id" },
      { re: "2\\.\\s*yes", flags: "mi", label: "2 — yes, the role" },
      { re: "3\\.\\s*no", flags: "mi", label: "3 — no, the payload is readable" },
      { re: "4\\.\\s*no", flags: "mi", label: "4 — never" },
      { re: "5\\.\\s*yes", flags: "mi", label: "5 — yes, it must expire" },
    ],
  },

  {
    id: "rotation-order",
    title: "Order the checks in rotation",
    prompt:
      "Write the checks `rotate()` performs, in order, one per line, with what each does when it fails.",
    language: "text",
    given: `Available: the row is missing · the row is already revoked ·
the row has expired · the user no longer exists`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. row missing → 401
2. row already revoked → revokeFamily(row.family), then 401   ← reuse detected
3. row expired → 401
4. user gone → 401
`,
    hint: "One of these is not just a rejection — it is evidence. Put it where an expired token cannot hide it.",
    explanation:
      "The revoked check must come **before** the expiry check. An expired-and-replayed token is still a replay, and checking expiry first would return 401 without burning the family — so a patient attacker could wait out the expiry and the theft would go unrecorded. Every branch returns the same bare 401, because telling the caller which check failed is an oracle: 'expired' versus 'unknown' tells an attacker their stolen token was at least real.",
    checks: [
      { re: "1\\.[^\\n]*(missing|not found|!row)", flags: "mi", label: "1 — missing row" },
      { re: "2\\.[^\\n]*revok", flags: "mi", label: "2 — already revoked" },
      { re: "2\\.[^\\n]*[Ff]amily", flags: "mi", label: "2 — burns the family" },
      { re: "3\\.[^\\n]*expir", flags: "mi", label: "3 — expired, AFTER the revoked check" },
      { re: "4\\.[^\\n]*user", flags: "mi", label: "4 — user gone" },
    ],
  },

  {
    id: "cookie-flags",
    title: "Set the cookie so neither attack works",
    prompt:
      "Write the options for the refresh cookie. It must be unreadable by JavaScript, not sent cross-site, scoped to the auth routes, last seven days — and still work on http://localhost.",
    language: "typescript",
    given: `res.cookie(name, value, options)
// Development is http://localhost:3000. Production is HTTPS.`,
    starter: `res.cookie('refresh', token, {
  // TODO
});
`,
    solution: `res.cookie('refresh', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
`,
    hint: "One of these, hardcoded to `true`, makes the browser silently drop the cookie in development — no error, nothing in DevTools.",
    explanation:
      "`httpOnly` removes the XSS theft vector entirely: `document.cookie` cannot see it, so a script injected into your page has nothing to steal. That opens CSRF, because cookies are sent automatically — which `sameSite: 'lax'` closes by refusing to attach it to cross-site requests. `path` keeps it off every request that is not an auth request. And `secure` is tied to `NODE_ENV` because a `Secure` cookie over `http://localhost` is **silently discarded**, which is an hour of debugging a cookie that 'never gets set'. `maxAge` is in milliseconds.",
    checks: [
      { re: "httpOnly\\s*:\\s*true", label: "`httpOnly` — JavaScript cannot read it" },
      { re: "sameSite\\s*:\\s*'lax'", label: "`sameSite: 'lax'` — blocks the CSRF this opens" },
      { re: "path\\s*:\\s*'/auth'", label: "scoped to the auth routes" },
      { re: "maxAge\\s*:\\s*7\\s*\\*\\s*24\\s*\\*\\s*60\\s*\\*\\s*60\\s*\\*\\s*1000", label: "seven days, in MILLISECONDS" },
      { re: "NODE_ENV", label: "`secure` follows the environment" },
      { re: "secure\\s*:\\s*true\\s*,", expect: false, label: "not hardcoded — that breaks localhost silently" },
    ],
  },

  {
    id: "xss-vs-csrf",
    title: "Match the attack to the defence",
    prompt:
      "For each, name the attack it enables or prevents. One line each.",
    language: "text",
    given: `1. storing a token in localStorage
2. httpOnly on a cookie
3. cookies being attached automatically by the browser
4. SameSite=Lax`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. enables XSS theft — any script on the page can read localStorage
2. prevents XSS theft — document.cookie cannot see an httpOnly cookie
3. enables CSRF — a foreign page can make your browser send an authenticated request
4. prevents CSRF — the browser will not attach it to a cross-site request
`,
    hint: "Two of these are the problem and two are the answer, and they alternate.",
    explanation:
      "The trade is the whole decision. **Anything JavaScript can read is stolen the moment you have any XSS** — and you will eventually, via a dependency if not your own code. Moving the token into an httpOnly cookie removes that vector structurally, then opens CSRF, because the browser now sends it for you. `SameSite` closes that. The verdict you should be able to defend: refresh token in an httpOnly cookie, access token in memory only — short-lived, never persisted, never sent automatically, so it cannot be CSRF'd either.",
    checks: [
      { re: "1\\.[^\\n]*XSS", flags: "mi", label: "1 — enables XSS theft" },
      { re: "2\\.[^\\n]*XSS", flags: "mi", label: "2 — prevents XSS theft" },
      { re: "3\\.[^\\n]*CSRF", flags: "mi", label: "3 — enables CSRF" },
      { re: "4\\.[^\\n]*CSRF", flags: "mi", label: "4 — prevents CSRF" },
    ],
  },

  {
    id: "env-validation",
    title: "Make a bad secret refuse to boot",
    prompt:
      "Write the Zod schema for these variables. A short JWT secret must stop the process at startup, not produce weak tokens silently.",
    language: "typescript",
    given: `import { z } from 'zod';

// PORT and the TTL arrive as strings, because every env var is a string.
// Required: NODE_ENV, PORT, DATABASE_URL, JWT_SECRET, JWT_ACCESS_TTL`,
    starter: `export const envSchema = z.object({
  // TODO
});
`,
    solution: `export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_TTL: z.coerce.number().int().positive().default(900),
});
`,
    hint: "`z.coerce` turns the string a shell gives you into the type you want. Without it, every numeric variable fails validation.",
    explanation:
      "**Fail fast at the boundary.** Every environment variable is a string, so `z.coerce` is not optional for numbers — without it `PORT=3001` fails `z.number()` and the error blames the value rather than the missing conversion. The `min(32)` is the point of the whole file: a weak secret becomes a **boot failure** with a message naming the variable, instead of an application that runs happily signing forgeable tokens. This is also why `JwtModule.registerAsync` must read through `ConfigService` — reading `process.env` directly walks around all of it.",
    checks: [
      { re: "z\\.coerce\\.number", label: "coerces the numeric variables" },
      { re: "JWT_SECRET[\\s\\S]*min\\(32", label: "rejects a secret under 32 characters" },
      { re: "DATABASE_URL[\\s\\S]*url\\(\\)", label: "validates the database URL" },
      { re: "z\\.enum", label: "constrains `NODE_ENV` to known values" },
      { re: "default\\(", label: "gives sensible defaults where there is one" },
    ],
  },

  /* ── D: server state ──────────────────────────────────────────────── */
  {
    id: "server-state",
    title: "Replace the cache you wrote by accident",
    prompt:
      "This re-implements a cache, badly, in every component that uses it. Rewrite it with TanStack Query.",
    language: "typescript",
    given: `import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/http';

// queryKeys.problemsList() -> ['problems', 'list']`,
    starter: `export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>();

  useEffect(() => {
    let alive = true;
    api<Problem[]>('/problems').then((data) => {
      if (alive) setProblems(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  return problems;
}
`,
    solution: `export function useProblems() {
  return useQuery({
    queryKey: queryKeys.problemsList(),
    queryFn: () => api<Problem[]>('/problems'),
  });
}
`,
    hint: "The unmount guard, the loading flag and the deduplication are all things the cache already does. What's left is the key and the fetcher.",
    explanation:
      "Two components calling this fire two requests and neither knows the other exists — that is the cost of treating server state as component state. **Server state is not your state**: it lives on a server, it can be stale, and it should be shared. The unmount guard becomes unnecessary because the cache owns the request lifecycle, so a late response updates the cache rather than a dead component. The query key is the API: get it right and invalidation is one line.",
    checks: [
      { re: "useQuery", label: "uses `useQuery`" },
      { re: "queryKey", label: "declares a query key" },
      { re: "queryFn", label: "declares the fetcher" },
      { re: "useEffect", expect: false, label: "no manual effect" },
      { re: "useState", expect: false, label: "no hand-rolled state" },
      { re: "alive", expect: false, label: "no unmount guard — the cache handles it" },
    ],
  },

  {
    id: "refresh-interceptor",
    title: "Stop users being logged out every 15 minutes",
    prompt:
      "The access token expires after 15 minutes and this wrapper gives up with a 401. Add the recovery — and make sure two simultaneous 401s do not each fire their own refresh.",
    language: "typescript",
    given: `// POST /auth/refresh — the httpOnly cookie rides along with credentials: 'include'.
// It returns { accessToken } and ROTATES the refresh cookie: the old one dies.
// setAccessToken(token) stores it in memory.`,
    starter: `let refreshing: Promise<boolean> | null = null;

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await send(path, init);
  if (!res.ok) throw new HttpError(res.status, 'failed');
  return (await res.json()) as T;
}
`,
    solution: `let refreshing: Promise<boolean> | null = null;

async function refreshOnce(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' });
      if (!res.ok) return false;
      const { accessToken } = (await res.json()) as { accessToken: string };
      setAccessToken(accessToken);
      return true;
    } finally {
      setTimeout(() => { refreshing = null; }, 0);
    }
  })();
  return refreshing;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await send(path, init);

  if (res.status === 401 && !path.startsWith('/auth/refresh')) {
    if (await refreshOnce()) res = await send(path, init);
    else setAccessToken(null);
  }

  if (!res.ok) throw new HttpError(res.status, 'failed');
  return (await res.json()) as T;
}
`,
    hint: "Two things to guard. Never refresh the refresh call itself, and make every concurrent caller await the SAME in-flight attempt.",
    explanation:
      "Without this, a user who leaves a tab open comes back to a 401 and appears randomly logged out — the single most common rookie auth bug. The concurrency guard is the subtle half: **rotation makes each refresh token single-use**, so two parallel refreshes present the same token twice, the second is read as a replay, and your own reuse detection burns the family and logs the user out. Your security feature would be fighting your frontend. And excluding `/auth/refresh` from the retry avoids an infinite loop when the session really is over.",
    checks: [
      { re: "status === 401|status\\s*===\\s*401", label: "reacts to a 401" },
      { re: "refreshing", label: "shares one in-flight refresh" },
      { re: "\\?\\?=|if\\s*\\(!refreshing\\)", label: "concurrent callers reuse it rather than each refreshing" },
      { re: "credentials\\s*:\\s*'include'", label: "sends the httpOnly cookie" },
      { re: "startsWith\\('/auth/refresh'\\)|!== '/auth/refresh'", label: "never refreshes the refresh call itself" },
      { re: "send\\(path, init\\)[\\s\\S]*send\\(path, init\\)", label: "retries the original request" },
    ],
  },
];
