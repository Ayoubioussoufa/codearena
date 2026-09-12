/**
 * Exercises for the TypeScript guide.
 *
 * Weighted toward the parts that change how you write code rather than the
 * parts that impress in a quiz: narrowing, `as const`, the utility types you
 * reach for weekly, and the two errors that look like the compiler being
 * difficult when it is being correct.
 */
import type { GuideExercise } from "./types";

export const typescriptExercises: GuideExercise[] = [
  {
    id: "annotate-boundaries",
    title: "Annotate the boundary, infer the rest",
    prompt:
      "Remove every annotation that earns nothing, and add the one that does. Exactly one thing here should be annotated.",
    language: "typescript",
    given: `// getProblems(): Promise<Problem[]>  — an exported function`,
    starter: `const count: number = 0;
const names: string[] = ['a', 'b'];
const doubled: number[] = names.map((n: string): number => n.length * 2);

export async function getProblems() {
  return fetch('/problems').then((r) => r.json());
}
`,
    solution: `const count = 0;
const names = ['a', 'b'];
const doubled = names.map((n) => n.length * 2);

export async function getProblems(): Promise<Problem[]> {
  return fetch('/problems').then((r) => r.json());
}
`,
    hint: "`r.json()` returns `any`. Without a return type, that `any` escapes into every caller silently — and an exported signature is a contract you should state, not discover.",
    explanation:
      "The rule: **let inference do the work inside, annotate at the boundaries.** Annotating `const count: number = 0` is noise the compiler already knew. But an exported function's return type is different — it is the contract, it stops an `any` leaking out of `r.json()`, and it makes a change to the body that breaks callers fail *here* rather than three files away. Boundaries are exported signatures, function parameters and anything crossing a network.",
    checks: [
      { re: "const count = 0", label: "`count` is inferred" },
      { re: "const names = \\[", label: "`names` is inferred" },
      { re: "\\.map\\(\\(n\\)\\s*=>", label: "the callback parameter is inferred" },
      { re: "getProblems\\(\\)\\s*:\\s*Promise<", label: "the exported return type IS annotated" },
      { re: "const\\s+\\w+\\s*:\\s*(number|string\\[\\]|number\\[\\])", expect: false, label: "no redundant annotations left" },
    ],
  },

  {
    id: "discriminated-union",
    title: "Model 'one of several shapes'",
    prompt:
      "A code run is either still queued, finished with a score, or failed with a message. Model it so that reading `.score` on a failed run is a compile error, and write the function that handles every case.",
    language: "typescript",
    given: `// The three states:
//   queued   — nothing else known yet
//   done     — has a numeric score
//   failed   — has an error message`,
    starter: `type RunResult = // TODO

export function describe(result: RunResult): string {
  // TODO: handle every case
}
`,
    solution: `type RunResult =
  | { status: 'queued' }
  | { status: 'done'; score: number }
  | { status: 'failed'; message: string };

export function describe(result: RunResult): string {
  switch (result.status) {
    case 'queued':
      return 'Waiting…';
    case 'done':
      return \`Scored \${result.score}\`;
    case 'failed':
      return \`Failed: \${result.message}\`;
  }
}
`,
    hint: "Give every member the same field name holding a different literal type. That shared field is what the compiler narrows on.",
    explanation:
      "The alternative — one type with `score?: number` and `message?: string` — makes four impossible states representable and forces `if (result.score !== undefined)` everywhere. A discriminated union makes the invalid combinations **unrepresentable**, and narrowing on `status` gives you the right fields automatically in each branch. The payoff compounds: add a fourth state and every `switch` that forgot it becomes a compile error, which is exactly when you want to hear about it.",
    checks: [
      { re: "status\\s*:\\s*'queued'", label: "`queued` is its own shape" },
      { re: "status\\s*:\\s*'done'[^}]*score", label: "`done` carries the score" },
      { re: "status\\s*:\\s*'failed'[^}]*message", label: "`failed` carries the message" },
      { re: "\\|", label: "is a union" },
      { re: "switch\\s*\\(\\s*\\w+\\.status|if\\s*\\(\\s*\\w+\\.status", label: "narrows on the discriminant" },
      { re: "score\\?:|message\\?:", expect: false, label: "no optional fields — the states are separate, not blurred" },
    ],
  },

  {
    id: "as-const",
    title: "Stop the widening",
    prompt:
      "`DIFFICULTIES` should be a readonly tuple of literal types, and `Difficulty` should be the union of its members — derived, not typed out twice.",
    language: "typescript",
    given: `// Right now TypeScript infers string[], so DIFFICULTIES[0] is just a plain string.`,
    starter: `const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

type Difficulty = // TODO — derived from the array, not retyped
`,
    solution: `const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;

type Difficulty = (typeof DIFFICULTIES)[number];
`,
    hint: "Two operators. One freezes the literals at the value level; the other reads the value's type back out and indexes it.",
    explanation:
      "`as const` freezes the array into `readonly ['EASY', 'MEDIUM', 'HARD']`, so each element keeps its literal type instead of widening to `string`. `(typeof X)[number]` then reads the type back out and indexes it by number, giving the union of element types. The point is **one source of truth**: add `'EXPERT'` to the array and the union updates itself. Writing the type out separately means the day someone adds a value to only one of them, they disagree silently.",
    checks: [
      { re: "as const", label: "freezes the literals with `as const`" },
      { re: "typeof DIFFICULTIES", label: "derives the type from the value" },
      { re: "\\[number\\]", label: "indexes the tuple to get the union" },
      { re: "type Difficulty\\s*=\\s*'EASY'", expect: false, label: "does NOT retype the values by hand" },
    ],
  },

  {
    id: "generic-function",
    title: "A generic that actually relates its types",
    prompt:
      "Write `pluck`: take an array of objects and a key, return an array of that key's values — with the return type following from the key you passed.",
    language: "typescript",
    given: `// pluck(users, 'id')    should be string[]
// pluck(users, 'age')   should be number[]
// pluck(users, 'nope')  should NOT compile`,
    starter: `export function pluck(items, key) {
  return items.map((item) => item[key]);
}
`,
    solution: `export function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
`,
    hint: "Two type parameters. The second has to be constrained to the keys of the first, or nothing stops someone passing a key that doesn't exist.",
    explanation:
      "A generic is only worth having when it **relates** its types. Without `K extends keyof T` you could pass any string and the return type would be useless. With it, the compiler rejects unknown keys at the call site and computes the element type via the indexed access `T[K]`. The test for a good generic: could you replace it with `any` and lose nothing? If yes, it is decoration. Here, `any` would lose the key check and the return type both.",
    checks: [
      { re: "<T[,\\s]", label: "is generic over the item type" },
      { re: "K extends keyof T", label: "constrains the key to the object's own keys" },
      { re: "items\\s*:\\s*T\\[\\]", label: "takes an array of T" },
      { re: "key\\s*:\\s*K", label: "takes the key as K" },
      { re: "T\\[K\\]\\[\\]", label: "returns an array of the indexed type" },
      { re: ":\\s*any", expect: false, label: "no `any` anywhere" },
    ],
  },

  {
    id: "utility-types",
    title: "Build a type from another type",
    prompt:
      "Given `User`, derive three types without retyping any field: what a repository needs to create one, a safe public shape, and a patch where every field is optional.",
    language: "typescript",
    given: `type User = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
};`,
    starter: `// everything except the id, plus nothing else
type CreateUserInput = // TODO

// safe to send to a client — no hash
type PublicUser = // TODO

// a partial update
type UserPatch = // TODO
`,
    solution: `// everything except the id, plus nothing else
type CreateUserInput = Omit<User, 'id'>;

// safe to send to a client — no hash
type PublicUser = Omit<User, 'passwordHash'>;

// a partial update
type UserPatch = Partial<Omit<User, 'id'>>;
`,
    hint: "`Omit` and `Partial` compose. `Pick` is the same idea from the other direction — either is fine, but one of them keeps working when a field is added.",
    explanation:
      "Deriving beats retyping because the derived type **tracks the source**. Add `createdAt` to `User` and all three update themselves. That is also the argument for `Omit` over `Pick` for `PublicUser`: with `Omit`, a new field is public by default and you must think to exclude it; with `Pick` it is private by default. Neither is universally right — but for a type whose whole job is 'safe to send', `Pick` is the safer failure mode and worth considering.",
    checks: [
      { re: "Omit<User,\\s*'id'>", label: "`CreateUserInput` omits the id" },
      { re: "Omit<User,\\s*'passwordHash'>|Pick<User,", label: "`PublicUser` excludes the hash" },
      { re: "Partial<", label: "`UserPatch` uses `Partial`" },
      { re: "email\\s*:\\s*string", expect: false, label: "no field is retyped by hand" },
    ],
  },

  {
    id: "ts7022",
    title: "Break a circular inference",
    prompt:
      "This fails with `TS7022: 'query' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer`. Fix it with the smallest correct change.",
    language: "typescript",
    given: `type Page = { items: Problem[]; nextCursor: number | null };
// api<Page>(url) -> Promise<Page>`,
    starter: `async function fetchAll(): Promise<Problem[]> {
  const all: Problem[] = [];
  let cursor = null;

  do {
    const query = cursor === null ? '' : \`&cursor=\${cursor}\`;
    const page = await api<Page>(\`/problems?limit=100\${query}\`);
    all.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor !== null);

  return all;
}
`,
    solution: `async function fetchAll(): Promise<Problem[]> {
  const all: Problem[] = [];
  let cursor: number | null = null;

  do {
    const query: string = cursor === null ? '' : \`&cursor=\${cursor}\`;
    const page: Page = await api<Page>(\`/problems?limit=100\${query}\`);
    all.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor !== null);

  return all;
}
`,
    hint: "Follow the loop: cursor → query → page → nextCursor → cursor. The compiler has to know one of them before it can work out the rest.",
    explanation:
      "This is a genuine cycle, not the compiler being difficult: each type depends on the next and the last depends on the first, so inference has nowhere to start. **An annotation is the correct fix here, not a workaround** — and the distinction worth keeping is that an annotation TypeScript *verifies* is legitimate, while an `as` that *disables* checking is the one to be suspicious of. Annotating `cursor` alone is enough to break the cycle; the others make the intent readable.",
    checks: [
      { re: "cursor\\s*:\\s*number\\s*\\|\\s*null", label: "annotates `cursor` to break the cycle" },
      { re: "as any|as unknown", expect: false, label: "does not reach for `as` — the fix is a real type" },
      { re: "let cursor", label: "still a loop variable" },
      { re: "while\\s*\\(cursor", label: "the loop still terminates on the cursor" },
    ],
  },

  {
    id: "satisfies",
    title: "Check a value without widening it",
    prompt:
      "`ROUTES` must be checked against `Record<string, string>`, but `ROUTES.login` should still be the literal `'/auth/login'`, not `string`. Write it.",
    language: "typescript",
    given: `// With  : Record<string, string>   ROUTES.login widens to string — the literal is lost.
// With  as const                      it stays literal, but nothing checks the shape.`,
    starter: `const ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
};
`,
    solution: `const ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
} satisfies Record<string, string>;
`,
    hint: "One keyword, after the value. It validates against the type without replacing the inferred one.",
    explanation:
      "`: T` and `satisfies T` are not the same move. An annotation **replaces** the inferred type, so you get the check and lose the literals. `satisfies` **validates against** the type and keeps what was inferred, so you get both — a typo'd value is still caught, and `ROUTES.login` is still the literal. This is the right tool whenever a config object needs to be constrained but its exact shape is still useful to callers.",
    checks: [
      { re: "satisfies\\s+Record<string,\\s*string>", label: "uses `satisfies`" },
      { re: ":\\s*Record<string,\\s*string>\\s*=", expect: false, label: "does not annotate — that would widen the literals" },
      { re: "login\\s*:\\s*'/auth/login'", label: "keeps the values" },
    ],
  },

  {
    id: "exact-optional",
    title: "Absent is not the same as undefined",
    prompt:
      "With `exactOptionalPropertyTypes` on, this fails: `Type 'undefined' is not assignable to type 'string'`. Fix the call site without changing the type.",
    language: "typescript",
    given: `type Options = { retries?: number; label?: string };
// tsconfig has "exactOptionalPropertyTypes": true

declare function run(options: Options): void;
declare const maybeLabel: string | undefined;`,
    starter: `run({ label: maybeLabel });
`,
    solution: `run(maybeLabel === undefined ? {} : { label: maybeLabel });
`,
    hint: "The type says the key may be MISSING. It does not say the key may be present holding `undefined`. Those are different, and the flag makes the compiler say so.",
    explanation:
      "Without the flag, `label?: string` quietly means `string | undefined`, so `{ label: undefined }` is allowed and the two cases blur. With it, an optional property may be **absent** or a `string` — never present-and-undefined. That distinction is real at runtime: `'label' in options` and `Object.keys` behave differently, and a `{ ...defaults, ...options }` spread will happily overwrite a default with an explicit `undefined`. The fix is to omit the key rather than set it to nothing.",
    checks: [
      { re: "=== undefined|!== undefined|\\?\\?", label: "handles the undefined case explicitly" },
      { re: "\\{\\s*\\}", label: "omits the key entirely when there is no value" },
      {
        // the naive form: the object handed straight to run() with no guard
        re: "run\\(\\s*\\{\\s*label\\s*:\\s*maybeLabel\\s*\\}\\s*\\)",
        expect: false,
        label: "no longer passes `undefined` as a present key",
      },
    ],
  },

  {
    id: "unknown-not-any",
    title: "`unknown` at the edge, never `any`",
    prompt:
      "This parses untrusted JSON and trusts it. Rewrite it so the compiler forces you to check the shape before using it.",
    language: "typescript",
    given: `type Config = { port: number; host: string };`,
    starter: `export function parseConfig(raw: string): Config {
  const data: any = JSON.parse(raw);
  return { port: data.port, host: data.host };
}
`,
    solution: `export function parseConfig(raw: string): Config {
  const data: unknown = JSON.parse(raw);

  if (
    typeof data !== 'object' ||
    data === null ||
    typeof (data as Record<string, unknown>).port !== 'number' ||
    typeof (data as Record<string, unknown>).host !== 'string'
  ) {
    throw new Error('Invalid config');
  }

  return data as Config;
}
`,
    hint: "`unknown` accepts anything going in and permits nothing coming out until you narrow it. That asymmetry is the whole feature.",
    explanation:
      "`any` switches the compiler off and propagates: one `any` at the edge becomes `any` in every caller, silently. `unknown` is the opposite — assignable *from* anything, assignable *to* nothing until you prove the shape. It turns 'I hope this JSON is right' into a compile error you must answer. In practice you would reach for Zod here and get the narrowing and the error message together, but the reason Zod is worth it is exactly this: parse at the boundary, then the inside can assume.",
    checks: [
      { re: ":\\s*unknown", label: "parses into `unknown`, not `any`" },
      { re: ":\\s*any\\b", expect: false, label: "no `any` left" },
      { re: "typeof", label: "narrows by checking the shape" },
      { re: "throw|return null|Error", label: "rejects a bad shape instead of trusting it" },
    ],
  },

  {
    id: "definite-assignment",
    title: "Why `!` on a DTO is honest",
    prompt:
      "With `strict` on, this fails: `Property 'email' has no initializer and is not definitely assigned in the constructor`. Fix it — and pick the fix that does not lie to every consumer.",
    language: "typescript",
    given: `import { IsEmail, IsString, MinLength } from 'class-validator';

// main.ts: app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
// class-transformer constructs the instance and copies the request body onto it.`,
    starter: `export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
`,
    solution: `export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
`,
    hint: "Three fixes compile. Only one keeps the type honest for everyone who reads `dto.email` later.",
    explanation:
      "`email?: string` compiles but makes the type `string | undefined`, so every consumer has to narrow a value that is never actually missing — the lie spreads inward. `email: string = ''` compiles but an empty string is a real value that can flow onward if validation is ever misconfigured. `!` is the honest one: it asserts the property is assigned before anyone reads it, which is **true** because `ValidationPipe` rejects a body missing `email` with a 400 before the handler runs. The assertion is backed by a runtime guarantee, which is what separates it from wishful thinking.",
    checks: [
      { re: "email!\\s*:\\s*string", label: "`email` uses the definite assignment assertion" },
      { re: "password!\\s*:\\s*string", label: "`password` too" },
      { re: "email\\?\\s*:", expect: false, label: "does not make it optional — it is never actually absent" },
      { re: "=\\s*''|=\\s*\"\"", expect: false, label: "does not default to an empty string" },
    ],
  },

  {
    id: "structural-typing",
    title: "Predict what structural typing allows",
    prompt:
      "For each line write `ok` or `error`, one per line, as `1. ok` … `4. error`.",
    language: "text",
    given: `type Point = { x: number; y: number };
type Named = { x: number; y: number; name: string };

declare function draw(p: Point): void;
declare const named: Named;

// 1. draw(named)
// 2. draw({ x: 1, y: 2, name: 'a' })
// 3. const p: Point = named
// 4. const n: Named = { x: 1, y: 2 }`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. ok — Named has everything Point needs; extra properties are fine on a variable
2. error — excess property check fires on an object LITERAL passed directly
3. ok — same as 1, assignment from a variable
4. error — Named requires a name field, and it is missing
`,
    hint: "Two of these are the same rule from opposite directions, and one of them is the famous inconsistency.",
    explanation:
      "TypeScript is **structural**: a type is compatible if it has the required shape, regardless of its name. So `Named` is usable wherever `Point` is. Line 2 is the exception people find maddening — **excess-property checking only fires on object literals written inline**, as a typo-catcher. A literal gets checked; the same object through a variable does not. That exact asymmetry is why `return row` from a repository silently leaks `passwordHash` while `return { ...literal }` would be flagged: you have to map field by field to get a real boundary.",
    checks: [
      { re: "1\\.\\s*ok", flags: "mi", label: "1 — ok" },
      { re: "2\\.\\s*error", flags: "mi", label: "2 — error (excess property check)" },
      { re: "3\\.\\s*ok", flags: "mi", label: "3 — ok" },
      { re: "4\\.\\s*error", flags: "mi", label: "4 — error (missing `name`)" },
    ],
  },

  {
    id: "type-guard",
    title: "Write a reusable type guard",
    prompt:
      "Write `isHttpError`, so that after `if (isHttpError(e))` the compiler knows `e.status` is a number. It should work on a `catch (e: unknown)`.",
    language: "typescript",
    given: `class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}`,
    starter: `export function isHttpError(e: unknown) {
  // TODO
}

try {
  // ...
} catch (e) {
  if (isHttpError(e)) {
    console.log(e.status);
  }
}
`,
    solution: `export function isHttpError(e: unknown): e is HttpError {
  return e instanceof HttpError;
}

try {
  // ...
} catch (e) {
  if (isHttpError(e)) {
    console.log(e.status);
  }
}
`,
    hint: "The return type is not `boolean`. It is a claim about the argument, written with a keyword you only ever see in this position.",
    explanation:
      "`e is HttpError` is a **type predicate**: it tells the compiler that a `true` return means the argument has that type, so narrowing survives across the function call. Plain `boolean` would type-check and narrow nothing — `e.status` would still be an error inside the `if`. The cost is that TypeScript trusts you: a predicate whose body does not actually establish the claim is an unchecked assertion in disguise. Keep the body a real check, as here.",
    checks: [
      { re: "e is HttpError|:\\s*\\w+ is ", label: "returns a type predicate, not a boolean" },
      { re: "instanceof|typeof|in ", label: "actually checks something" },
      { re: "e\\.status", label: "uses the narrowed property" },
      { re: "as HttpError", expect: false, label: "no cast needed once the predicate narrows" },
    ],
  },
];
