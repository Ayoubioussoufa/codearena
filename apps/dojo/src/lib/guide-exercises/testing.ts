/**
 * Exercises for the Testing guide.
 *
 * The theme throughout: a test that passes when the code is broken is worse
 * than no test, because it buys false confidence. Most of these are about
 * assertions that look right and prove nothing.
 */
import type { GuideExercise } from "./types";

export const testingExercises: GuideExercise[] = [
  {
    id: "tobe-vs-toequal",
    title: "Pick the right matcher",
    prompt:
      "One of these assertions always fails and one always passes regardless of the code. Fix both, keeping what each test is trying to prove.",
    language: "typescript",
    given: `makeUser('Ada')  -> { name: 'Ada', role: 'user' }
sum(2, 3)        -> 5`,
    starter: `it('builds a user', () => {
  expect(makeUser('Ada')).toBe({ name: 'Ada', role: 'user' });
});

it('adds two numbers', () => {
  expect(sum(2, 3)).toBeTruthy();
});
`,
    solution: `it('builds a user', () => {
  expect(makeUser('Ada')).toEqual({ name: 'Ada', role: 'user' });
});

it('adds two numbers', () => {
  expect(sum(2, 3)).toBe(5);
});
`,
    hint: "One compares identity where you meant value. The other asserts something so weak that a bug would satisfy it.",
    explanation:
      "`toBe` is `Object.is` — reference equality. Two distinct objects are never `===`, so the first assertion could never pass no matter how correct the code is. The second is the opposite failure and the more dangerous one: `toBeTruthy()` passes for `1`, `'wrong'`, `[]` and `{}`. A test that passes when the answer is wrong is worse than no test, because it buys false confidence. **`toBe` for primitives and identity; `toEqual` for values.**",
    checks: [
      { re: "toEqual\\(\\s*\\{", label: "objects are compared structurally with `toEqual`" },
      { re: "toBe\\(5\\)", label: "the number is compared with `toBe` against the real answer" },
      { re: "toBeTruthy", expect: false, label: "no `toBeTruthy` — it would pass for a wrong answer" },
      { re: "toBe\\(\\s*\\{", expect: false, label: "no `toBe` on an object — that can never pass" },
    ],
  },

  {
    id: "async-await",
    title: "The missing await that fakes a pass",
    prompt:
      "Both of these pass right now, and both are broken. Fix them so a failing implementation actually fails the test.",
    language: "typescript",
    given: `fetchName()  -> Promise<string>
loadUser(id) -> Promise<User>, rejects with NotFound for an unknown id`,
    starter: `it('resolves to the name', () => {
  expect(fetchName()).resolves.toBe('Ada');
});

it('rejects for an unknown user', async () => {
  expect(loadUser('nope')).rejects.toThrow();
});
`,
    solution: `it('resolves to the name', async () => {
  await expect(fetchName()).resolves.toBe('Ada');
});

it('rejects for an unknown user', async () => {
  await expect(loadUser('nope')).rejects.toThrow();
});
`,
    hint: "`.resolves` and `.rejects` hand back a promise. Nothing waits for it, so the test function returns before the assertion has a chance to fail.",
    explanation:
      "Without the `await`, the test body finishes before the promise settles, the runner marks it green, and the assertion result is discarded. Both tests would pass against a completely broken implementation. This is the number-one source of tests that 'work' and catch nothing — and in newer runners the stray promise surfaces later as an unhandled rejection pointing at the runner's internals rather than your test. **`.resolves` and `.rejects` are inert without `await`.**",
    checks: [
      { re: "await expect\\(.*\\)\\.resolves", label: "the resolves assertion is awaited" },
      { re: "await expect\\(.*\\)\\.rejects", label: "the rejects assertion is awaited" },
      { re: "it\\('resolves to the name',\\s*async", label: "the first test is async" },
      { re: "^\\s*expect\\(.*\\)\\.(resolves|rejects)", flags: "m", expect: false, label: "no un-awaited async assertion left" },
    ],
  },

  {
    id: "fake-over-mock",
    title: "Prefer a fake to a mock",
    prompt:
      "This test asserts choreography rather than behaviour — it passes even when `createUser` returns the wrong thing. Rewrite it with a fake repository and assert what actually happened.",
    language: "typescript",
    given: `interface UsersRepository {
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}

// new UsersService(repo) — takes the port, so no container is needed`,
    starter: `it('creates a user', async () => {
  const repo = {
    findByEmail: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
  };
  const service = new UsersService(repo);

  await service.createUser({ email: 'a@b.com', username: 'ada' });

  expect(repo.create).toHaveBeenCalled();
});
`,
    solution: `it('creates a user, and finds it afterwards', async () => {
  const rows = new Map<string, User>();
  const repo: UsersRepository = {
    findByEmail: async (email) =>
      [...rows.values()].find((u) => u.email === email) ?? null,
    create: async (input) => {
      const user = { id: String(rows.size + 1), ...input, role: 'USER' as const };
      rows.set(user.id, user);
      return user;
    },
  };
  const service = new UsersService(repo);

  const created = await service.createUser({ email: 'a@b.com', username: 'ada' });

  expect(created.email).toBe('a@b.com');
  expect(await repo.findByEmail('a@b.com')).not.toBeNull();
});
`,
    hint: "A fake has a working implementation. Once it does, you can assert the OUTCOME — that the user can be found afterwards — instead of asserting that a function was called.",
    explanation:
      "`toHaveBeenCalled()` proves a function ran, not that it did anything right. The original test passes if `create` returns `undefined`, stores nothing, or writes to the wrong record. Worse, it breaks when you refactor the internals even though the behaviour is unchanged — so it fails when it should not, and passes when it should not. A **fake** has a real implementation, so the test reads as behaviour: create a user, then find it. Fakes break only when the port changes, which is exactly when a test should break.",
    checks: [
      { re: "new Map|rows\\s*=|const store", label: "the fake actually stores something" },
      { re: "findByEmail\\s*:\\s*async|findByEmail:\\s*\\(", label: "`findByEmail` has a real implementation" },
      { re: "create\\s*:\\s*async|create:\\s*\\(", label: "`create` has a real implementation" },
      { re: "expect\\(\\s*(created|await repo)", label: "asserts the outcome, not the call" },
      { re: "toHaveBeenCalled\\(\\)\\s*;?\\s*\\}\\)", expect: false, label: "no longer asserts merely that `create` ran" },
    ],
  },

  {
    id: "test-the-negative",
    title: "Add the test that would catch a broken implementation",
    prompt:
      "This suite passes against `verify() { return true; }`. Add the case that would catch it, and one that proves salting works.",
    language: "typescript",
    given: `const hasher = new Argon2Hasher();
// hash(plain): Promise<string>
// verify(hash, plain): Promise<boolean>   — note the argument order`,
    starter: `const PASSWORD = 'correct-horse-battery';

it('verifies a correct password', async () => {
  const hash = await hasher.hash(PASSWORD);
  await expect(hasher.verify(hash, PASSWORD)).resolves.toBe(true);
});
`,
    solution: `const PASSWORD = 'correct-horse-battery';
const WRONG_PASSWORD = 'correct-horse-batteru';

it('verifies a correct password', async () => {
  const hash = await hasher.hash(PASSWORD);
  await expect(hasher.verify(hash, PASSWORD)).resolves.toBe(true);
});

it('rejects an incorrect password', async () => {
  const hash = await hasher.hash(PASSWORD);
  await expect(hasher.verify(hash, WRONG_PASSWORD)).resolves.toBe(false);
});

it('produces a different hash each time', async () => {
  const first = await hasher.hash(PASSWORD);
  const second = await hasher.hash(PASSWORD);
  expect(first).not.toBe(second);
});
`,
    hint: "Ask what the dumbest possible implementation is that passes the suite as it stands. Then write the test that kills it.",
    explanation:
      "**Always assert the negative case.** It is what separates 'this test passes' from 'this test would catch a bug' — and `return true` passing your whole suite is not a hypothetical, it is what a half-finished implementation actually looks like. The salting test matters for a different reason: two hashes of the same password must differ, which proves a random salt is being embedded. Note also `expect(first).not.toBe(second)` rather than `expect(first === second).toBe(false)` — on failure the first prints both hashes, the second prints 'expected false, received true'.",
    checks: [
      { re: "resolves\\.toBe\\(false\\)", label: "asserts a wrong password is rejected" },
      { re: "not\\.toBe\\(second\\)|not\\.toEqual\\(second\\)", label: "asserts two hashes of the same input differ" },
      { re: "WRONG|wrong|incorrect", label: "names the wrong-password case" },
      {
        re: "expect\\(\\s*\\w+\\s*===\\s*\\w+\\s*\\)",
        expect: false,
        label: "compares the values, not a boolean — the failure message is worth more",
      },
    ],
  },

  {
    id: "which-layer",
    title: "Put each test at the right level",
    prompt:
      "For each behaviour write `unit`, `integration` or `e2e`, one per line, as `1. unit` … `5. e2e`.",
    language: "text",
    given: `// 1. "an order's total equals the sum of its lines"
// 2. "replaying a used refresh token kills the whole family"
// 3. "the repository maps a row without leaking passwordHash"
// 4. "login returns 401 for a wrong password"
// 5. "a user can register, log in, and see the problems page"`,
    starter: `1.
2.
3.
4.
5.
`,
    solution: `1. unit — pure domain rule, no I/O, runs in microseconds
2. e2e — needs real HTTP and a real database to prove rotation end to end
3. integration — needs a real database, but not the whole app
4. unit — the service with fakes; no need for HTTP or argon2
5. e2e — the whole stack, driven like a user
`,
    hint: "Ask what each one would need to be *real* for the test to mean anything. That answer names the level.",
    explanation:
      "The rule: **test at the lowest level where the behaviour is actually real.** A domain rule needs nothing, so a unit test is both fastest and most precise. Reuse detection spans HTTP, the service and the database — a unit test with fakes would pass while the real thing was broken, because the fake cannot get the SQL wrong. Item 3 is the interesting one: mocking Prisma and asserting you called `findUnique` with the right arguments tests your mock, not your mapping. Use a real database for that, or don't test it.",
    checks: [
      { re: "1\\.\\s*unit", flags: "mi", label: "1 — unit" },
      { re: "2\\.\\s*e2e|2\\.\\s*end.to.end", flags: "mi", label: "2 — e2e" },
      { re: "3\\.\\s*integration", flags: "mi", label: "3 — integration" },
      { re: "4\\.\\s*unit", flags: "mi", label: "4 — unit" },
      { re: "5\\.\\s*e2e|5\\.\\s*end.to.end", flags: "mi", label: "5 — e2e" },
    ],
  },

  {
    id: "deterministic-time",
    title: "Make a time-dependent test deterministic",
    prompt:
      "This test is flaky and cannot test expiry at all. Fix it so expiry is testable without waiting seven days.",
    language: "typescript",
    given: `// isExpired(token) currently calls Date.now() internally.
// You may change its signature.

type Token = { expiresAt: Date };`,
    starter: `export function isExpired(token: Token): boolean {
  return Date.now() > token.expiresAt.getTime();
}

it('is not expired yet', () => {
  const token = { expiresAt: new Date(Date.now() + 1000) };
  expect(isExpired(token)).toBe(false);
});
`,
    solution: `export function isExpired(token: Token, now: Date): boolean {
  return now.getTime() > token.expiresAt.getTime();
}

it('is not expired before its expiry', () => {
  const token = { expiresAt: new Date('2026-01-01T00:00:00Z') };
  expect(isExpired(token, new Date('2025-12-31T23:59:59Z'))).toBe(false);
});

it('is expired after its expiry', () => {
  const token = { expiresAt: new Date('2026-01-01T00:00:00Z') };
  expect(isExpired(token, new Date('2026-01-01T00:00:01Z'))).toBe(true);
});
`,
    hint: "Time is an outside system: it changes without asking you and you cannot control it. Outside systems get passed in, not reached for.",
    explanation:
      "`Date.now()` inside the function makes the test depend on when it runs, and makes the expired case untestable without waiting or patching globals. Passing the moment in turns the function pure: same inputs, same answer, forever — and now both sides of the boundary are trivial to test. `vi.useFakeTimers()` also works and is the right tool when you cannot change a signature, but injecting is better because it makes the dependency visible rather than hidden. The same argument applies to `Math.random()` and `crypto.randomUUID()`.",
    checks: [
      { re: "isExpired\\([^)]*now|isExpired\\([^)]*clock|isExpired\\([^)]*Date", label: "the current moment is passed in" },
      { re: "Date\\.now\\(\\)\\s*>", expect: false, label: "no longer reaches for `Date.now()` inside" },
      { re: "toBe\\(true\\)", label: "adds a test for the expired case" },
      { re: "toBe\\(false\\)", label: "keeps the not-expired case" },
    ],
  },

  {
    id: "rtl-query",
    title: "Query the way a user would",
    prompt:
      "Rewrite these queries so the test survives a CSS refactor and would catch a missing accessible label.",
    language: "typescript",
    given: `<button class="btn-primary" data-testid="save">Save changes</button>
<input class="field" aria-label="Email address" />`,
    starter: `const button = container.querySelector('.btn-primary');
const input = screen.getByTestId('save');
`,
    solution: `const button = screen.getByRole('button', { name: /save changes/i });
const input = screen.getByLabelText(/email address/i);
`,
    hint: "The priority order is role, then label, then text, then test id. Only reach for a test id when nothing above it can identify the element.",
    explanation:
      "A class selector couples the test to styling, so renaming `.btn-primary` breaks a test about behaviour. A test id couples it to a hook that exists only for tests — it always finds the element, including when the element is invisible to a screen reader. Querying by **role and accessible name** does two jobs at once: it finds the element the way a user does, and it fails when the accessibility is broken. That is a bug you want a failing test for.",
    checks: [
      { re: "getByRole\\(\\s*'button'", label: "finds the button by role" },
      { re: "name\\s*:", label: "narrows by its accessible name" },
      { re: "getByLabelText", label: "finds the input by its label" },
      { re: "querySelector", expect: false, label: "no CSS selector — that couples the test to styling" },
      { re: "getByTestId", expect: false, label: "no test id — it would pass even if the element were inaccessible" },
    ],
  },

  {
    id: "e2e-setup-parity",
    title: "Make the e2e app match production",
    prompt:
      "This e2e suite passes tests that should fail, because the test app is not configured like `main.ts`. Fix the setup.",
    language: "typescript",
    given: `// main.ts does:
//   app.use(cookieParser());
//   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
//   app.useGlobalFilters(new AllExceptionsFilter());`,
    starter: `beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
});
`,
    solution: `beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();
});
`,
    hint: "Everything registered in `bootstrap()` is invisible to `createNestApplication()`. Anything you forget here is untested in its production shape.",
    explanation:
      "Globals registered in `main.ts` do not come along — `createTestingModule` builds the module graph, not your bootstrap. Without `ValidationPipe`, a test asserting a 400 for a short password gets a 201 instead, so the test either fails confusingly or, worse, was written to expect the wrong thing. Without `cookieParser`, `req.cookies` is undefined and every auth test 401s for the wrong reason. **The test app must be configured exactly like the real one**, or you are testing a different application.",
    checks: [
      { re: "useGlobalPipes", label: "registers the validation pipe" },
      { re: "whitelist\\s*:\\s*true", label: "with `whitelist`, as production does" },
      { re: "cookieParser\\(\\)", label: "registers the cookie parser" },
      { re: "useGlobalFilters", label: "registers the exception filter" },
      { re: "app\\.init\\(\\)", label: "still initialises the app last" },
    ],
  },
];
