/**
 * Coding track: TypeScript — from annotating your first function up through
 * generics with constraints, the utility types and conditional/`infer` types.
 * Structure-checked (type annotations aren't runnable JS), so the checks read
 * like the shape of a correct type.
 */
import { codeTask, multiFileTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingTrack } from "../coding";
import { typescriptCodeGens } from "../topics/typescript-code";

const DOC = { slug: "typescript", label: "Dojo guide — TypeScript" };

/* ── Level 1 — annotate ── */

const annotateFn: Generator = {
  id: "ts-annotate-fn",
  title: "Annotate a function",
  generate: () =>
    codeTask({
      genId: "ts-annotate-fn",
      prompt:
        "Add types to `greet`: it takes a `name` string and an OPTIONAL `age` number, and returns a string. Keep the body as-is.",
      language: "typescript",
      starter: `function greet(name, age) {\n  return age ? \`\${name} (\${age})\` : name;\n}`,
      solution: `function greet(name: string, age?: number): string {\n  return age ? \`\${name} (\${age})\` : name;\n}`,
      checks: [
        { re: "name\\s*:\\s*string", label: "`name` is typed `string`" },
        { re: "age\\s*\\?\\s*:\\s*number", label: "`age` is an OPTIONAL `number` (`age?: number`)" },
        { re: "\\)\\s*:\\s*string", label: "return type is `string`" },
        { re: ":\\s*any\\b", expect: false, label: "no `any`" },
      ],
      explanation:
        "The `?` in `age?: number` makes the parameter optional — the caller may omit it, and inside the function its type is `number | undefined`, which is exactly why the `age ? …` check is needed. Annotating the return type (`): string`) isn't just documentation: it makes the compiler verify every branch actually returns a string, catching a forgotten `return` at the definition instead of the call site.",
      docRef: DOC,
    }),
};

const defineInterface: Generator = {
  id: "ts-define-interface",
  title: "Model a domain type",
  generate: () =>
    codeTask({
      genId: "ts-define-interface",
      prompt:
        "Define an `interface Problem` with: `id` (number), `title` (string), `difficulty` that can only be `\"easy\"`, `\"medium\"` or `\"hard\"`, and an optional `tags` array of strings.",
      language: "typescript",
      starter: `interface Problem {\n  // fill in the fields\n}`,
      solution: `interface Problem {\n  id: number;\n  title: string;\n  difficulty: "easy" | "medium" | "hard";\n  tags?: string[];\n}`,
      checks: [
        { re: "id\\s*:\\s*number", label: "`id: number`" },
        { re: "title\\s*:\\s*string", label: "`title: string`" },
        { re: "[\"']easy[\"']\\s*\\|\\s*[\"']medium[\"']\\s*\\|\\s*[\"']hard[\"']", label: "`difficulty` is a union of the three string literals" },
        { re: "tags\\s*\\?\\s*:\\s*string\\[\\]|tags\\s*\\?\\s*:\\s*Array<string>", label: "`tags?` is an optional `string[]`" },
      ],
      explanation:
        "A **string-literal union** (`\"easy\" | \"medium\" | \"hard\"`) is a tiny type that permits only those exact values — assign `\"h4rd\"` and it won't compile. It's the lightweight enum you'll reach for constantly. `tags?` marks the field optional, so an object without it is still a valid `Problem`. Modelling the data precisely here is what makes every function that touches a `Problem` safe downstream.",
      docRef: DOC,
    }),
};

/* ── Level 2 — shape it ── */

const readonlyConfig: Generator = {
  id: "ts-readonly-config",
  title: "readonly & immutability",
  generate: () =>
    codeTask({
      genId: "ts-readonly-config",
      prompt:
        "Define a `Config` type with a `readonly` `apiUrl` string and a mutable `retries` number. Then write `withRetries(config, n)` that returns a NEW config with `retries` changed to `n` — without mutating the input.",
      language: "typescript",
      starter: `type Config = {\n  // apiUrl (readonly) + retries\n};\n\nfunction withRetries(config: Config, n: number): Config {\n  // return a new config\n}`,
      solution: `type Config = {\n  readonly apiUrl: string;\n  retries: number;\n};\n\nfunction withRetries(config: Config, n: number): Config {\n  return { ...config, retries: n };\n}`,
      checks: [
        { re: "readonly\\s+apiUrl\\s*:\\s*string", label: "`apiUrl` is `readonly`" },
        { re: "retries\\s*:\\s*number", label: "`retries: number`" },
        { re: "\\.\\.\\.\\s*config", label: "spreads the old config into a new object" },
        { re: "config\\.\\w+\\s*=", expect: false, label: "never assigns to a field of `config`" },
      ],
      explanation:
        "`readonly` makes the compiler reject `config.apiUrl = …` — the immutability is enforced at compile time, not runtime. The idiomatic 'change' is therefore to build a fresh object: `{ ...config, retries: n }` copies every field, then overrides the one you're updating. Same discipline as a React reducer: derive a new value, never mutate the old one.",
      docRef: DOC,
    }),
};

/* ── Level 3 — generics with constraints & utility types ── */

const getProp: Generator = {
  id: "ts-get-prop",
  title: "Constrained generic: getProp",
  generate: () =>
    codeTask({
      genId: "ts-get-prop",
      prompt:
        "Make `getProp(obj, key)` (it returns `obj[key]`) fully type-safe with generics: the compiler should reject a `key` that isn't a real key of `obj`, and the return type should be exactly that property's type — not `any`.",
      language: "typescript",
      starter: `function getProp(obj, key) {\n  return obj[key];\n}`,
      solution: `function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}`,
      checks: [
        { re: "<\\s*T\\s*,\\s*K\\s+extends\\s+keyof\\s+T\\s*>", label: "declares `<T, K extends keyof T>`" },
        { re: "obj\\s*:\\s*T", label: "`obj: T`" },
        { re: "key\\s*:\\s*K", label: "`key: K`" },
        { re: "\\)\\s*:\\s*T\\[\\s*K\\s*\\]", label: "returns the indexed type `T[K]`" },
      ],
      explanation:
        "`K extends keyof T` is a **generic constraint**: `K` isn't any string, it's restricted to the actual keys of `T` — so `getProp(user, \"emial\")` fails to compile. The return type `T[K]` is an **indexed access type**: ask for the `age` key and you get `number` back, not a vague `unknown`. Together they make a one-line accessor that's more type-safe than hand-written property access.",
      docRef: DOC,
    }),
};

const utilityTypes: Generator = {
  id: "ts-utility-types",
  title: "Compose with utility types",
  generate: () =>
    codeTask({
      genId: "ts-utility-types",
      prompt:
        "Given the `User` interface (`id`, `name`, `email`), derive a `UserUpdate` type: every field except `id`, all optional. Compose the built-in utility types to build it from `User` — don't retype the fields by hand.",
      language: "typescript",
      starter: `interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\n// type UserUpdate = ...`,
      solution: `interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\ntype UserUpdate = Partial<Omit<User, "id">>;`,
      checks: [
        { re: "Omit\\s*<\\s*User\\s*,\\s*[\"']id[\"']\\s*>", label: "drops `id` with `Omit<User, \"id\">`" },
        { re: "Partial\\s*<", label: "makes the rest optional with `Partial<…>`" },
        { re: "interface\\s+UserUpdate|name\\s*\\?\\s*:", expect: false, label: "derives it — doesn't hand-retype the fields" },
      ],
      explanation:
        "Utility types are types that transform other types. `Omit<User, \"id\">` removes a key; `Partial<T>` makes every field optional; nesting them composes both. The payoff is a SINGLE source of truth: add a field to `User` and `UserUpdate` updates automatically. Hand-writing the derived interface means it silently drifts out of sync the day someone edits `User`.",
      docRef: DOC,
    }),
};

/* ── Level 4 — mapped types & Record ── */

const recordType: Generator = {
  id: "ts-record-type",
  title: "Exhaustive map with Record",
  generate: () =>
    codeTask({
      genId: "ts-record-type",
      prompt:
        "With the `Status` union (`\"todo\" | \"doing\" | \"done\"`), declare a `LABELS` constant mapping each status to a display-string label. Type it so the compiler forces you to cover every status — omit one and it must not compile.",
      language: "typescript",
      starter: `type Status = "todo" | "doing" | "done";\n\n// const LABELS: ...`,
      solution: `type Status = "todo" | "doing" | "done";\n\nconst LABELS: Record<Status, string> = {\n  todo: "To do",\n  doing: "In progress",\n  done: "Done",\n};`,
      checks: [
        { re: "Record\\s*<\\s*Status\\s*,\\s*string\\s*>", label: "types the map as `Record<Status, string>`" },
        { re: "todo\\s*:", label: "covers `todo`" },
        { re: "doing\\s*:", label: "covers `doing`" },
        { re: "done\\s*:", label: "covers `done`" },
      ],
      explanation:
        "`Record<Keys, Value>` builds an object type with one entry per key in the union — so `Record<Status, string>` demands a label for *every* status. Add a fourth status to the union later and every `Record<Status, …>` in the codebase lights up red until you handle it. That compile-time exhaustiveness is far safer than a plain object you hope is complete.",
      docRef: DOC,
    }),
};

/* ── Level 5 — conditional & infer ── */

const conditionalInfer: Generator = {
  id: "ts-conditional-infer",
  title: "Conditional type with infer",
  generate: () =>
    codeTask({
      genId: "ts-conditional-infer",
      prompt:
        "Write `type ElementType<T>` that extracts the element type of an array: `ElementType<string[]>` is `string`, `ElementType<number[]>` is `number`, and anything that isn't an array resolves to `never`. Use a conditional type with `infer`.",
      language: "typescript",
      starter: `// type ElementType<T> = ...`,
      solution: `type ElementType<T> = T extends (infer U)[] ? U : never;`,
      checks: [
        { re: "type\\s+ElementType\\s*<\\s*T\\s*>", label: "generic type alias `ElementType<T>`" },
        { re: "T\\s+extends", label: "is a conditional type (`T extends …`)" },
        { re: "infer\\s+\\w+", label: "captures the element type with `infer`" },
        { re: "\\?\\s*\\w+\\s*:\\s*never", label: "resolves to the captured type, else `never`" },
      ],
      explanation:
        "A **conditional type** is a type-level `if`: `T extends X ? A : B`. The magic word `infer U` says 'match this shape and capture the piece here into `U`' — so `T extends (infer U)[]` means 'if `T` is an array, call its element type `U`', which you then return. This is the machinery behind built-ins like `ReturnType` and `Awaited`. `never` (the branch for non-arrays) is the 'impossible' type — it signals 'this case shouldn't happen'.",
      docRef: DOC,
    }),
};

/* ── extra syntax depth ── */

const asConst: Generator = {
  id: "ts-as-const",
  title: "as const & typeof[number]",
  generate: () =>
    codeTask({
      genId: "ts-as-const",
      prompt:
        "Context: by default TypeScript WIDENS literals — `['a','b']` is inferred as `string[]`, losing the exact values. A modifier can freeze a value to its narrowest, readonly form (a tuple of literals), and from that you can derive a string-literal union — keeping the list and its type in ONE place.\n\nTask: declare a `STATUSES` array of `'todo'`, `'doing'`, `'done'` frozen to its literal form, then derive a `Status` type equal to the union of its elements — read straight off the array, so adding an element updates the type automatically.",
      language: "typescript",
      starter: `// const STATUSES = ...\n// type Status = ...`,
      solution: `const STATUSES = ['todo', 'doing', 'done'] as const;\ntype Status = typeof STATUSES[number];`,
      checks: [
        { re: "\\]\\s*as\\s+const", label: "freezes the array with `as const`" },
        { re: "type\\s+Status\\s*=\\s*typeof\\s+STATUSES\\s*\\[\\s*number\\s*\\]", label: "derives the union with `typeof STATUSES[number]`" },
      ],
      explanation:
        "`as const` does three things: makes every element a literal type (`'todo'`, not `string`), marks the array `readonly`, and turns it into a fixed-length tuple. `typeof STATUSES` lifts the runtime value into a type; indexing it with `[number]` means 'the type of any numeric index' — i.e. the union of all elements. The payoff: the array is your single source of truth. Add `'archived'` to the array and `Status` updates automatically — no separate `type` to keep in sync. It's the type-safe replacement for a string enum, and you can still iterate `STATUSES` at runtime.",
      docRef: DOC,
    }),
};

const narrowIn: Generator = {
  id: "ts-narrow-in",
  title: "Narrow with the `in` operator",
  generate: () =>
    codeTask({
      genId: "ts-narrow-in",
      prompt:
        "Context: when a union has no shared 'tag' field to switch on, you can narrow by checking which PROPERTY is present — a runtime check the compiler understands as a type guard.\n\nTask: given a `Shape` that's either `{ radius: number }` or `{ side: number }`, implement `area(shape): number` — the circle's area from its radius, or the square's from its side. Narrow by testing which property exists (no `as` casts) so each branch is correctly typed.",
      language: "typescript",
      starter: `type Shape = { radius: number } | { side: number };\n\nfunction area(shape: Shape): number {\n  // narrow with the \`in\` operator, then compute\n}`,
      solution: `type Shape = { radius: number } | { side: number };\n\nfunction area(shape: Shape): number {\n  if ("radius" in shape) {\n    return Math.PI * shape.radius ** 2;\n  }\n  return shape.side ** 2;\n}`,
      checks: [
        { re: "[\"']radius[\"']\\s+in\\s+shape", label: "narrows with `\"radius\" in shape`" },
        { re: "shape\\.radius", label: "uses `shape.radius` in the circle branch" },
        { re: "shape\\.side", label: "uses `shape.side` in the square branch" },
        { re: "\\sas\\s", expect: false, label: "no `as` casts — the narrowing does the work" },
      ],
      explanation:
        "A discriminated union (a shared `kind`/`status` literal) is the cleanest thing to narrow, but you don't always have one. The `in` operator is the fallback: `\"radius\" in shape` is a runtime check the compiler UNDERSTANDS as a type guard, so inside that block `shape` is the `{ radius: number }` variant and `shape.side` won't even compile. Other narrowing tools in the same family: `typeof x === \"string\"`, `x instanceof Date`, and truthiness checks. All of them let you avoid `as`, which merely silences the compiler instead of proving anything.",
      docRef: DOC,
    }),
};

const keyofTypeof: Generator = {
  id: "ts-keyof-typeof",
  title: "keyof typeof",
  generate: () =>
    codeTask({
      genId: "ts-keyof-typeof",
      prompt:
        "Context: sometimes you want a type of 'the valid keys of THIS object', derived from the object itself so it can't drift out of sync — bridging the runtime VALUE world to the TYPE world.\n\nTask: given `const config = { host: 'localhost', port: 5432 }`, declare a `ConfigKey` type equal to the union of `config`'s keys (`\"host\" | \"port\"`) — derived from the object, not hand-written.",
      language: "typescript",
      starter: `const config = { host: 'localhost', port: 5432 };\n\n// type ConfigKey = ...`,
      solution: `const config = { host: 'localhost', port: 5432 };\n\ntype ConfigKey = keyof typeof config;`,
      checks: [
        { re: "type\\s+ConfigKey\\s*=\\s*keyof\\s+typeof\\s+config", label: "declares `keyof typeof config`" },
      ],
      explanation:
        "Read it inside-out: `typeof config` is the object's type `{ host: string; port: number }`; `keyof` of that is `\"host\" | \"port\"`. This is the bridge from the VALUE world to the TYPE world — instead of hand-writing (and forgetting to update) a `type ConfigKey = \"host\" | \"port\"`, you derive it from the real object. It pairs with the constrained generic `getProp<T, K extends keyof T>`: `keyof typeof config` is exactly the set of keys `getProp(config, key)` will accept.",
      docRef: DOC,
    }),
};

const awaitedReturn: Generator = {
  id: "ts-awaited-return",
  title: "ReturnType & Awaited",
  generate: () =>
    codeTask({
      genId: "ts-awaited-return",
      prompt:
        "Context: you often want the type an async function RESOLVES to, derived from the function itself so it can't drift — which means recovering a function's return type and then unwrapping the Promise inside it. There are built-in utility types for both steps.\n\nTask: given `async function loadUser() { return { id: 1, name: 'A' }; }`, declare a `User` type equal to the resolved value of `loadUser` (the `{ id: number; name: string }` inside the promise), composing the built-in utility types rather than redeclaring the shape.",
      language: "typescript",
      starter: `async function loadUser() {\n  return { id: 1, name: 'A' };\n}\n\n// type User = ...`,
      solution: `async function loadUser() {\n  return { id: 1, name: 'A' };\n}\n\ntype User = Awaited<ReturnType<typeof loadUser>>;`,
      checks: [
        { re: "ReturnType\\s*<\\s*typeof\\s+loadUser\\s*>", label: "grabs the return type with `ReturnType<typeof loadUser>`" },
        { re: "Awaited\\s*<", label: "unwraps the Promise with `Awaited<…>`" },
      ],
      explanation:
        "`typeof loadUser` is the function's type; `ReturnType<…>` of an async function is `Promise<{ id: number; name: string }>`; `Awaited<…>` peels the `Promise<>` off to leave the resolved shape. Deriving `User` this way means the type follows the implementation — change what `loadUser` returns and `User` updates for free, no duplicate interface to drift. `Awaited` also flattens nested promises and works on non-promises (a plain `T` stays `T`), which is why it's safer than writing `T extends Promise<infer U>` by hand.",
      docRef: DOC,
    }),
};

const templateLiteralType: Generator = {
  id: "ts-template-literal-type",
  title: "Template literal types",
  generate: () =>
    codeTask({
      genId: "ts-template-literal-type",
      prompt:
        "Context: template literal TYPES (not values) build new string-literal types by interpolating other types into a backtick pattern — the type-level version of a template string. Over a union, they distribute across every member.\n\nTask: given `type Lang = 'en' | 'fr'`, declare a `GreetingKey` type equal to `\"greeting.en\" | \"greeting.fr\"` — built at the type level by prefixing `greeting.` onto each member of `Lang`.",
      language: "typescript",
      starter: `type Lang = 'en' | 'fr';\n\n// type GreetingKey = ...`,
      solution: "type Lang = 'en' | 'fr';\n\ntype GreetingKey = `greeting.${Lang}`;",
      checks: [
        { re: "type\\s+GreetingKey\\s*=\\s*`greeting\\.\\$\\{\\s*Lang\\s*\\}`", label: "builds `` `greeting.${Lang}` `` as a template literal type" },
      ],
      explanation:
        "Inside a type, a backtick string with `${T}` produces string-literal types. When `T` is a union (`'en' | 'fr'`), the template DISTRIBUTES — you get one literal per member, so `` `greeting.${Lang}` `` expands to `\"greeting.en\" | \"greeting.fr\"`. This powers precise typing of things like event names (`` `on${Capitalize<Event>}` ``), i18n keys, and CSS units. TypeScript even ships helper types — `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` — to transform the interpolated pieces.",
      docRef: DOC,
    }),
};

const functionOverload: Generator = {
  id: "ts-function-overload",
  title: "Function overloads",
  generate: () =>
    codeTask({
      genId: "ts-function-overload",
      prompt:
        "Context: overloads let ONE function advertise several precise call signatures — you list the public signatures above a single, broader implementation signature (which must be compatible with all of them but is NOT itself callable from outside).\n\nTask: type `convert` (its body, already written, converts either way) so that calling it with a string is typed to return a number, and calling it with a number is typed to return a string. Add the two public overload signatures plus the implementation signature.",
      language: "typescript",
      starter: `// two overload signatures, then the implementation\nfunction convert(x: string | number): string | number {\n  return typeof x === 'string' ? Number(x) : String(x);\n}`,
      solution: `function convert(x: string): number;\nfunction convert(x: number): string;\nfunction convert(x: string | number): string | number {\n  return typeof x === 'string' ? Number(x) : String(x);\n}`,
      checks: [
        { re: "function\\s+convert\\s*\\(\\s*x\\s*:\\s*string\\s*\\)\\s*:\\s*number\\s*;", label: "overload `convert(x: string): number;`" },
        { re: "function\\s+convert\\s*\\(\\s*x\\s*:\\s*number\\s*\\)\\s*:\\s*string\\s*;", label: "overload `convert(x: number): string;`" },
        { re: "x\\s*:\\s*string\\s*\\|\\s*number", label: "implementation signature accepts `string | number`" },
      ],
      explanation:
        "The two lines ending in `;` are the OVERLOADS — the only shapes callers see, each tying a specific input to a specific output, so `convert('5')` is typed `number` and `convert(5)` is typed `string`. The third `function convert(x: string | number)` is the IMPLEMENTATION signature: it must be broad enough to satisfy every overload, but it's invisible to callers (you can't call `convert` with the raw union from outside). Overloads shine when the return type genuinely DEPENDS on the argument type in a way a single union signature can't express precisely.",
      docRef: DOC,
    }),
};

const tupleType: Generator = {
  id: "ts-tuple-type",
  title: "Tuple types",
  generate: () =>
    codeTask({
      genId: "ts-tuple-type",
      prompt:
        "Context: a tuple is a fixed-length array where each POSITION has its own type — how you'd type a `[value, setter]` pair or a coordinate.\n\nTask: declare an `Entry` type that's a pair of a name (string) and an age (number), then type the parameter of `label(e)` — which formats them as `\"name: age\"` — as that tuple.",
      language: "typescript",
      starter: `// type Entry = ...\n\nfunction label(e) {\n  return \`\${e[0]}: \${e[1]}\`;\n}`,
      solution: `type Entry = [string, number];\n\nfunction label(e: Entry): string {\n  return \`\${e[0]}: \${e[1]}\`;\n}`,
      checks: [
        { re: "type\\s+Entry\\s*=\\s*\\[\\s*string\\s*,\\s*number\\s*\\]", label: "declares the tuple `[string, number]`" },
        { re: "e\\s*:\\s*Entry", label: "types the parameter as `Entry`" },
      ],
      explanation:
        "A tuple `[string, number]` differs from `(string | number)[]`: the tuple fixes the LENGTH and the type at each index, so `e[0]` is known to be `string` and `e[1]` a `number` — no narrowing needed. This is exactly how `useState` is typed (`[T, Dispatch<T>]`) and why array-destructuring a hook keeps precise types. You can name elements for clarity — `[name: string, age: number]` — and add a rest element for variable tails.",
      docRef: DOC,
    }),
};

const indexSignature: Generator = {
  id: "ts-index-signature",
  title: "Index signatures",
  generate: () =>
    codeTask({
      genId: "ts-index-signature",
      prompt:
        "Context: when an object's keys aren't known ahead of time (a dictionary), an INDEX SIGNATURE types 'any string key maps to this value type'.\n\nTask: declare a `Scores` type mapping any player-name string to a numeric score, then type the parameters of `bump(scores, name)` — which adds 1 to that player's score — accordingly.",
      language: "typescript",
      starter: `// type Scores = ...\n\nfunction bump(scores, name) {\n  scores[name] += 1;\n}`,
      solution: `type Scores = { [name: string]: number };\n\nfunction bump(scores: Scores, name: string): void {\n  scores[name] += 1;\n}`,
      checks: [
        { re: "\\{\\s*\\[\\s*\\w+\\s*:\\s*string\\s*\\]\\s*:\\s*number\\s*\\}", label: "declares the index signature `{ [name: string]: number }`" },
        { re: "scores\\s*:\\s*Scores", label: "types the parameter as `Scores`" },
      ],
      explanation:
        "`{ [key: string]: number }` says any string key yields a `number` — the type for open-ended maps, counters, and config objects. `Record<string, number>` is the equivalent shorthand. The trade-off: TS then assumes EVERY access returns `number`, so under `noUncheckedIndexedAccess` it widens reads to `number | undefined` to remind you a key might be missing. For a FIXED set of keys, prefer `Record<Union, V>` so the compiler enforces exhaustiveness.",
      docRef: DOC,
    }),
};

const constrainedLength: Generator = {
  id: "ts-constrained-length",
  title: "Constrain a generic to a shape",
  generate: () =>
    codeTask({
      genId: "ts-constrained-length",
      prompt:
        "Context: a generic constraint can require a STRUCTURE, not just a key — you can bound a type parameter to 'anything that has a numeric `length`' (strings, arrays, typed arrays) while still returning that exact type.\n\nTask: make `longer(a, b)` a generic function, constrained to arguments that have a numeric `.length`, returning whichever argument is longer — with the specific type preserved (calling it on two strings returns a string, on two arrays an array).",
      language: "typescript",
      starter: `function longer(a, b) {\n  return a.length >= b.length ? a : b;\n}`,
      solution: `function longer<T extends { length: number }>(a: T, b: T): T {\n  return a.length >= b.length ? a : b;\n}`,
      checks: [
        { re: "<\\s*T\\s+extends\\s*\\{\\s*length\\s*:\\s*number\\s*\\}\\s*>", label: "constrains `T extends { length: number }`" },
        { re: "a\\s*:\\s*T", label: "both params are `T`" },
        { re: "\\)\\s*:\\s*T", label: "returns `T`" },
      ],
      explanation:
        "Without the constraint, `T` could be anything and `a.length` wouldn't compile. `T extends { length: number }` is a STRUCTURAL bound — it accepts any type that has a `length: number` member (arrays, strings, `NodeList`…), duck-typing at the type level. Because both params and the return share `T`, calling `longer('ab', 'abc')` returns `string`, and `longer([1], [1,2])` returns `number[]` — the specific type is preserved, not widened to the constraint.",
      docRef: DOC,
    }),
};

const mappedOptional: Generator = {
  id: "ts-mapped-optional",
  title: "Write a mapped type",
  generate: () =>
    codeTask({
      genId: "ts-mapped-optional",
      prompt:
        "Context: a MAPPED TYPE builds a new object type by iterating over the keys of another. Adding the optional modifier to each produced property is literally how the built-in `Partial<T>` is defined.\n\nTask: write your own `Optional<T>` from scratch — a mapped type that takes any object type `T` and makes every property optional (don't just alias `Partial`).",
      language: "typescript",
      starter: `// type Optional<T> = ...`,
      solution: `type Optional<T> = { [K in keyof T]?: T[K] };`,
      checks: [
        { re: "type\\s+Optional\\s*<\\s*T\\s*>", label: "generic over `T`" },
        { re: "\\[\\s*K\\s+in\\s+keyof\\s+T\\s*\\]", label: "iterates keys with `[K in keyof T]`" },
        { re: "\\]\\s*\\?\\s*:\\s*T\\[\\s*K\\s*\\]", label: "makes each property optional (`?: T[K]`)" },
      ],
      explanation:
        "`[K in keyof T]` walks every key of `T`; `T[K]` (indexed access) is that key's value type; the `?` modifier makes it optional. Together they REWRITE `T` with every field optional — exactly `Partial<T>`. Swap the modifier and you get the other built-ins: `-?` removes optionality (`Required<T>`), `readonly` adds immutability, `-readonly` strips it. Mapped types are how the whole utility-type library is built, and how you'd derive form/patch types from a model.",
      docRef: DOC,
    }),
};

const satisfiesOp: Generator = {
  id: "ts-satisfies",
  title: "The satisfies operator",
  generate: () =>
    codeTask({
      genId: "ts-satisfies",
      prompt:
        "Context: there's an operator that checks a value against a type WITHOUT widening it — you get the validation of an annotation but keep the precise inferred type (so you can still read specific keys/literals). It's the modern fix for 'validate the shape but don't lose the literals'.\n\nTask: declare a `routes` object (`home: '/'`, `profile: '/me'`) and validate it against a string→string record using that operator — so `routes.home` still narrows to the literal `'/'` rather than widening to `string`.",
      language: "typescript",
      starter: `// const routes = ... satisfies ...`,
      solution: `const routes = { home: '/', profile: '/me' } satisfies Record<string, string>;`,
      checks: [
        { re: "satisfies\\s+Record\\s*<\\s*string\\s*,\\s*string\\s*>", label: "validates with `satisfies Record<string, string>`" },
        { re: "home\\s*:", label: "includes the `home` route" },
      ],
      explanation:
        "Contrast three approaches. `const routes: Record<string, string> = {...}` validates but WIDENS — `routes.home` becomes `string` and you lose autocomplete on the keys. Plain `const routes = {...}` keeps the precise type but does NO validation. `satisfies` gives you both: it checks the object conforms to `Record<string, string>`, yet the variable keeps its narrow inferred type, so `routes.home` is `'/'` and typos in keys are still caught. Use it for config objects, route maps, and theme tokens.",
      docRef: DOC,
    }),
};

const levelFor: Record<string, 2 | 3 | 4> = {
  "ts-code-guard": 3,
  "ts-code-generic": 3,
  "ts-code-union": 4,
};

/* ── Multi-file capstone — assemble a typed module across files ── */

const userStoreModule: Generator = {
  id: "ts-user-store-module",
  title: "Assemble a typed user store",
  generate: () =>
    multiFileTask({
      genId: "ts-user-store-module",
      prompt:
        "Build a small user feature the way TS projects are laid out — **shapes**, then **implementation**, then one public entry point. `types.ts`: describe a `User` (`id`, `name`, `email`) and a `NewUser` shape for creating one — same as `User` but without the server-assigned `id`, and DERIVE it from `User` rather than retyping the fields. `user-store.ts`: a `UserStore` class that keeps users in memory — `add(input)` assigns the next id and stores the user, `all()` returns them. `index.ts`: expose the public surface so callers import from one place. Write each in its tab, **Debug this file**, then **submit all** — and open the hints if the syntax escapes you.",
      files: [
        {
          name: "types.ts",
          language: "typescript",
          role: "the shapes — no runtime code, just the contract",
          hint: "Two declarations. Give the object shape a name you can reuse everywhere with an `interface`. For `NewUser`, don't copy the fields — DERIVE it: TypeScript's utility type `Omit<T, K>` builds a new type from `T` with property `K` removed, so `Omit<User, \"id\">` means 'every User field except id'. Deriving keeps the two in lockstep when `User` gains a field.",
          starter: `// types.ts — a User interface and a NewUser type (User without its id)`,
          solution: `export interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nexport type NewUser = Omit<User, "id">;`,
          checks: [
            { re: "export\\s+interface\\s+User", label: "exports the `User` interface" },
            { re: "id\\s*:\\s*number", label: "`User` has an `id: number`" },
            { re: "export\\s+type\\s+NewUser\\s*=\\s*Omit<\\s*User\\s*,\\s*[\"']id[\"']\\s*>", label: "`NewUser = Omit<User, \"id\">`" },
          ],
        },
        {
          name: "user-store.ts",
          language: "typescript",
          role: "the in-memory store implementation",
          hint: "Bring in the shapes from `./types`. Since you use them only for typing (never as runtime values), use a type-only import — `import type { User, NewUser }` — so it's erased at build time and can't create an import cycle. Type the private field as an array of `User`, keep a running id counter, and have `add(input: NewUser): User` build a full `User` by assigning the next id and spreading the input's fields.",
          starter: `// user-store.ts — a UserStore class backed by the User / NewUser types`,
          solution: `import type { User, NewUser } from "./types";\n\nexport class UserStore {\n  private users: User[] = [];\n  private nextId = 1;\n\n  add(input: NewUser): User {\n    const user: User = { id: this.nextId++, ...input };\n    this.users.push(user);\n    return user;\n  }\n\n  all(): readonly User[] {\n    return this.users;\n  }\n}`,
          checks: [
            { re: "import\\s+type\\s*\\{[^}]*User", label: "imports the shapes with `import type`" },
            { re: "export\\s+class\\s+UserStore", label: "exports the `UserStore` class" },
            { re: "private\\s+users\\s*:\\s*User\\[\\]", label: "keeps a `private users: User[]`" },
            { re: "add\\s*\\(\\s*\\w+\\s*:\\s*NewUser\\s*\\)\\s*:\\s*User", label: "`add(input: NewUser): User`" },
          ],
        },
        {
          name: "index.ts",
          language: "typescript",
          role: "the barrel — the one path callers import from",
          hint: "A barrel re-exports a folder's public API from a single `index` so callers write `import { UserStore } from \"./user\"` and never reach into individual files. Re-export the class with a normal `export { … } from \"./user-store\"`, and re-export the shapes with a TYPE-only form — `export type { … } from \"./types\"` — so they stay erasable. Then the internal files can be refactored freely as long as this surface holds.",
          starter: `// index.ts — the public barrel: re-export the types and the store`,
          solution: `export type { User, NewUser } from "./types";\nexport { UserStore } from "./user-store";`,
          checks: [
            { re: "export\\s+type\\s*\\{[^}]*User[^}]*\\}\\s*from\\s*[\"']\\./types", label: "re-exports the types with `export type { … }`" },
            { re: "export\\s*\\{[^}]*UserStore[^}]*\\}\\s*from\\s*[\"']\\./user-store", label: "re-exports `UserStore` from `./user-store`" },
          ],
        },
      ],
      crossChecks: [
        {
          re: "(?=[\\s\\S]*export\\s+interface\\s+User)(?=[\\s\\S]*import\\s+type\\s*\\{[^}]*User[^}]*\\}\\s*from\\s*[\"']\\./types)",
          label: "`user-store.ts` imports the `User` type that `types.ts` defines",
        },
        {
          re: "(?=[\\s\\S]*export\\s+class\\s+UserStore)(?=[\\s\\S]*export\\s*\\{[^}]*UserStore[^}]*\\}\\s*from\\s*[\"']\\./user-store)",
          label: "`index.ts` re-exports the `UserStore` that `user-store.ts` defines",
        },
      ],
      explanation:
        "Separating **types** from **implementation** is the TS project convention: shapes live in their own module so many files can share them without importing runtime code, and `import type { User }` tells the compiler this import is erased at build time (no circular-dependency or bundling cost). Deriving `NewUser` with `Omit<User, \"id\">` keeps the two in lockstep — change `User` and `NewUser` updates for free, the whole point of computing types instead of duplicating them. The `index.ts` barrel (`export type` for the shapes, `export` for the class) gives consumers one import path and hides the file layout.",
      docRef: DOC,
    }),
};

export const typescriptTrack: CodingTrack = {
  id: "coding-typescript",
  title: "TypeScript",
  icon: "🟦",
  stack: "TypeScript",
  blurb:
    "From annotating your first function to generics with constraints, the utility types, and conditional `infer` types — the type system, one build at a time.",
  exercises: [
    { level: 1, gen: annotateFn },
    { level: 1, gen: defineInterface },
    { level: 2, gen: readonlyConfig },
    { level: 2, gen: asConst },
    { level: 2, gen: tupleType },
    ...typescriptCodeGens.map((gen) => ({ level: levelFor[gen.id] ?? 3, gen })),
    { level: 3, gen: getProp },
    { level: 3, gen: utilityTypes },
    { level: 3, gen: narrowIn },
    { level: 3, gen: indexSignature },
    { level: 3, gen: constrainedLength },
    { level: 3, gen: userStoreModule },
    { level: 4, gen: recordType },
    { level: 4, gen: keyofTypeof },
    { level: 4, gen: awaitedReturn },
    { level: 4, gen: mappedOptional },
    { level: 5, gen: conditionalInfer },
    { level: 5, gen: templateLiteralType },
    { level: 5, gen: functionOverload },
    { level: 5, gen: satisfiesOp },
  ],
};
