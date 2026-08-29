/**
 * Coding track: JavaScript syntax & semantics — the everyday constructs that
 * are easy to *think* you know and still get subtly wrong: const/let, template
 * literals, default params, arrow-return-object, ?? vs ||, ?., destructuring,
 * spread/rest, reduce/map immutability, closures, `this`, async/await.
 *
 * Most tasks RUN for real against test cases (plain JS), so a passing grade
 * means the code actually works — the fastest way to burn the syntax in. A few
 * (`this`, async) are structure-checked because their behaviour can't be
 * captured by a single return value.
 */
import { codeTask, multiFileTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingTrack } from "../coding";

const DOC = { slug: "javascript", label: "Dojo guide — JavaScript syntax & semantics" };

/* ── Level 1 — declarations, strings, functions ── */

const constLet: Generator = {
  id: "js-const-let",
  title: "const vs let",
  generate: () =>
    codeTask({
      genId: "js-const-let",
      prompt:
        "Write `circleArea(r)` returning a circle's area (π · r²). Declare π (3.14159) as a constant binding that can never be reassigned, and don't fall back to the legacy function-scoped declaration keyword.",
      language: "javascript",
      starter: `function circleArea(r) {\n  // declare PI as a constant, then return the area\n}`,
      solution: `function circleArea(r) {\n  const PI = 3.14159;\n  return PI * r * r;\n}`,
      checks: [
        { re: "const\\s+PI\\s*=\\s*3\\.14159", label: "declares `const PI = 3.14159`" },
        { re: "\\bvar\\b", expect: false, label: "no `var` (block-scoped `const`/`let` only)" },
      ],
      fn: {
        name: "circleArea",
        tests: [
          { args: [1], expected: 3.14159, approx: 1e-9 },
          { args: [2], expected: 12.56636, approx: 1e-9 },
          { args: [0], expected: 0, approx: 1e-9 },
        ],
      },
      explanation:
        "`const` doesn't mean the *value* is deeply frozen — it means the BINDING can't be reassigned (`PI = 4` would throw). For an object, `const user = {}` still lets you do `user.name = 'x'`; it just stops `user = somethingElse`. Rule of thumb: `const` everywhere, downgrade to `let` only when you must reassign. Avoid `var` entirely — it's function-scoped (leaks out of `if`/`for` blocks) and hoisted as `undefined`, two footguns `const`/`let` removed by being block-scoped and living in a 'temporal dead zone' until their line runs.",
      docRef: DOC,
    }),
};

const templateLiteral: Generator = {
  id: "js-template-literal",
  title: "Template literals",
  generate: () =>
    codeTask({
      genId: "js-template-literal",
      prompt:
        "Write `banner(name, unread)` returning exactly:\n`Hi <name>, you have <unread> unread messages.`\nInterpolate the two values into a single template string — no `+` concatenation.",
      language: "javascript",
      starter: "function banner(name, unread) {\n  // return a template literal\n}",
      solution:
        "function banner(name, unread) {\n  return `Hi ${name}, you have ${unread} unread messages.`;\n}",
      checks: [
        { re: "`", label: "uses a backtick template literal" },
        { re: "\\$\\{\\s*name\\s*\\}", label: "interpolates `${name}`" },
        { re: "\\$\\{\\s*unread\\s*\\}", label: "interpolates `${unread}`" },
        { re: "\\+", expect: false, label: "no `+` concatenation" },
      ],
      fn: {
        name: "banner",
        tests: [
          { args: ["Ada", 3], expected: "Hi Ada, you have 3 unread messages." },
          { args: ["Sam", 0], expected: "Hi Sam, you have 0 unread messages." },
        ],
      },
      explanation:
        "Inside a backtick string, `${ }` evaluates ANY expression — `${a + b}`, `${user.name.toUpperCase()}`, even a ternary — and drops the result in. It's more readable than `'Hi ' + name + ', you have ' + unread + ' unread…'` and can't accidentally coerce the wrong way. Backticks also span multiple lines literally, which is why they're the go-to for HTML snippets and SQL. Watch the quote character: `\"` and `'` do NOT interpolate — only `` ` `` does.",
      docRef: DOC,
    }),
};

const defaultParams: Generator = {
  id: "js-default-params",
  title: "Default parameters",
  generate: () =>
    codeTask({
      genId: "js-default-params",
      prompt:
        "Write `multiply(a, b)` returning `a * b`, giving `b` a default of 2 so `multiply(3)` is 6. Mind the trap the tests check: a default fills in only a truly MISSING argument, so `multiply(5, null)` is `5 * null` = 0, not 10.",
      language: "javascript",
      starter: `function multiply(a, b) {\n  // give b a default of 2\n}`,
      solution: `function multiply(a, b = 2) {\n  return a * b;\n}`,
      checks: [{ re: "b\\s*=\\s*2", label: "declares the default `b = 2`" }],
      fn: {
        name: "multiply",
        tests: [
          { args: [3], expected: 6, show: "multiply(3) → 6 (default b=2)" },
          { args: [3, 4], expected: 12 },
          { args: [5, undefined], expected: 10, show: "multiply(5, undefined) → 10 (default applies)" },
          { args: [5, null], expected: 0, show: "multiply(5, null) → 0 (null ≠ undefined, no default!)" },
        ],
      },
      explanation:
        "The single most common surprise: defaults trigger ONLY on `undefined`. `multiply(5)` and `multiply(5, undefined)` both use `b = 2`, but `multiply(5, null)` keeps `null` (→ 0) and `multiply(5, 0)` keeps 0. Defaults are also evaluated at call time and left-to-right, so `function f(a, b = a * 2)` is legal — `b` can reference an earlier parameter. If you want 'use the fallback for null too', that's the job of `??` (next levels), not a default parameter.",
      docRef: DOC,
    }),
};

const arrowReturnObject: Generator = {
  id: "js-arrow-object",
  title: "Arrow returning an object",
  generate: () =>
    codeTask({
      genId: "js-arrow-object",
      prompt:
        "Write `toPoint` as a ONE-LINE arrow function taking `x` and `y` and returning the object `{ x, y }` (use object shorthand). Mind the gotcha: an arrow whose body opens with `{` is parsed as a statement block, so returning an object literal concisely needs a small syntactic nudge.",
      language: "javascript",
      starter: `const toPoint = /* one-line arrow returning { x, y } */;`,
      solution: `const toPoint = (x, y) => ({ x, y });`,
      checks: [
        { re: "=>\\s*\\(\\s*\\{", label: "wraps the object in parens — `=> ({ … })`" },
        { re: "\\{\\s*x\\s*,\\s*y\\s*\\}", label: "uses object shorthand `{ x, y }`" },
      ],
      fn: {
        name: "toPoint",
        tests: [
          { args: [1, 2], expected: { x: 1, y: 2 } },
          { args: [0, -5], expected: { x: 0, y: -5 } },
        ],
      },
      explanation:
        "Two ideas collide here. First, `{ x, y }` is **object shorthand** — when the key and variable share a name, `{ x: x, y: y }` shortens to `{ x, y }`. Second, an arrow's `{` is ambiguous: JS assumes a statement block, so `() => { foo: bar }` is parsed as a body containing a `foo:` label, returning `undefined`. Wrapping in `()` forces the expression reading: `() => ({ foo: bar })`. You'll hit this constantly in `.map(u => ({ ...u, active: true }))`.",
      docRef: DOC,
    }),
};

/* ── Level 2 — operators, truthiness, nullish ── */

const nullish: Generator = {
  id: "js-nullish",
  title: "Nullish coalescing (?? vs ||)",
  generate: () =>
    codeTask({
      genId: "js-nullish",
      prompt:
        "Write `portOf(config)` returning `config.port` when it's provided, otherwise 3000. The tests enforce the catch: a real port of `0` must stay `0`, not fall through to 3000 — so reach for the default operator that triggers only on null/undefined, not on any falsy value.",
      language: "javascript",
      starter: `function portOf(config) {\n  // return config.port, defaulting to 3000 — but keep a real 0\n}`,
      solution: `function portOf(config) {\n  return config.port ?? 3000;\n}`,
      checks: [
        { re: "\\?\\?", label: "uses `??`" },
        { re: "\\|\\|", expect: false, label: "does NOT use `||` (it would clobber a 0)" },
      ],
      fn: {
        name: "portOf",
        tests: [
          { args: [{ port: 8080 }], expected: 8080 },
          { args: [{ port: 0 }], expected: 0, show: "portOf({port:0}) → 0 (?? keeps it; || would give 3000)" },
          { args: [{}], expected: 3000, show: "portOf({}) → 3000 (undefined → default)" },
          { args: [{ port: null }], expected: 3000 },
        ],
      },
      explanation:
        "This is THE bug `??` was invented to kill. With `config.port || 3000`, a legitimate `0` is falsy, so `||` skips it and hands back 3000 — your server silently ignores the configured port. `??` only falls through on `null`/`undefined`, treating `0` and `\"\"` as the real values they are. Use `||` when you genuinely want 'any falsy → default' (e.g. `name || 'Anonymous'` where empty *should* become Anonymous); use `??` when only 'not provided' should default. You can't mix `??` with `&&`/`||` without parentheses — that's a deliberate syntax error to stop ambiguity.",
      docRef: DOC,
    }),
};

const optionalChaining: Generator = {
  id: "js-optional-chaining",
  title: "Optional chaining (?.)",
  generate: () =>
    codeTask({
      genId: "js-optional-chaining",
      prompt:
        "Write `cityOf(user)` returning `user.address.city` when the whole path exists, and `\"Unknown\"` when any link is missing — with NO crash on a null user or a missing address. Walk the nested path safely, then supply the fallback.",
      language: "javascript",
      starter: `function cityOf(user) {\n  // safely read user.address.city, fallback "Unknown"\n}`,
      solution: `function cityOf(user) {\n  return user?.address?.city ?? "Unknown";\n}`,
      checks: [
        { re: "\\?\\.", label: "uses optional chaining `?.`" },
        { re: "\\?\\?", label: "falls back with `??`" },
      ],
      fn: {
        name: "cityOf",
        tests: [
          { args: [{ address: { city: "Rabat" } }], expected: "Rabat" },
          { args: [{ address: {} }], expected: "Unknown", show: "missing city → Unknown" },
          { args: [{}], expected: "Unknown", show: "missing address → Unknown (no crash)" },
          { args: [null], expected: "Unknown", show: "null user → Unknown (no crash)" },
        ],
      },
      explanation:
        "Without `?.` you'd write `user && user.address && user.address.city` just to avoid a crash on missing data — `?.` collapses that into `user?.address?.city`. The moment any link is null/undefined, the chain stops and yields `undefined`, which `?? \"Unknown\"` then turns into your fallback. `?.` also guards method calls (`obj.fn?.()` — call only if it exists) and dynamic access (`arr?.[i]`). Reach for it whenever you touch data whose shape you don't fully control — API responses, optional config, deeply nested props.",
      docRef: DOC,
    }),
};

const truthyBlank: Generator = {
  id: "js-truthy-blank",
  title: "Truthiness & == null",
  generate: () =>
    codeTask({
      genId: "js-truthy-blank",
      prompt:
        "Write `isBlank(str)` returning `true` when `str` is null, undefined, or only whitespace (including `\"\"`), else `false`. Guard the null/undefined case FIRST (so a string method never runs on null) using the one idiomatic loose-equality null check, then test for whitespace-only with strict equality.",
      language: "javascript",
      starter: `function isBlank(str) {\n  // true for null, undefined, "", "   "\n}`,
      solution: `function isBlank(str) {\n  return str == null || str.trim() === "";\n}`,
      checks: [
        { re: "==\\s*null", label: "guards null/undefined with `str == null`" },
        { re: "\\.trim\\(\\)", label: "checks whitespace with `.trim()`" },
        { re: "===", label: "uses strict `===` for the string compare" },
      ],
      fn: {
        name: "isBlank",
        tests: [
          { args: [""], expected: true },
          { args: ["   "], expected: true, show: "isBlank('   ') → true (whitespace only)" },
          { args: ["hi"], expected: false },
          { args: ["  x "], expected: false },
          { args: [null], expected: true },
          { args: [undefined], expected: true, show: "isBlank(undefined) → true (== null catches it)" },
        ],
      },
      explanation:
        "Order matters: `str == null` must come FIRST, so short-circuiting stops before `str.trim()` runs on a null (which would throw). `== null` is the one place loose equality earns its keep — it matches both `null` and `undefined` and nothing else, saving you `str === null || str === undefined`. Everywhere else use `===`: loose `==` does type coercion with genuinely bizarre results (`0 == \"\"` is true, `[] == false` is true), so strict equality is the default and `== null` is the memorised exception.",
      docRef: DOC,
    }),
};

const shortCircuit: Generator = {
  id: "js-short-circuit",
  title: "Short-circuit with ||",
  generate: () =>
    codeTask({
      genId: "js-short-circuit",
      prompt:
        "Write `displayName(user)` returning `user.name` when it's a non-empty string, otherwise `\"Anonymous\"`. Here an EMPTY name should also become `\"Anonymous\"`, so choose the fallback operator that treats any falsy value (including `\"\"`) as 'missing'.",
      language: "javascript",
      starter: `function displayName(user) {\n  // user.name, or "Anonymous" when it's empty/missing\n}`,
      solution: `function displayName(user) {\n  return user.name || "Anonymous";\n}`,
      checks: [{ re: "\\|\\|", label: "uses `||` for the falsy fallback" }],
      fn: {
        name: "displayName",
        tests: [
          { args: [{ name: "Yara" }], expected: "Yara" },
          { args: [{ name: "" }], expected: "Anonymous", show: "empty name → Anonymous (|| treats '' as falsy)" },
          { args: [{}], expected: "Anonymous" },
        ],
      },
      explanation:
        "`||` and `&&` don't return `true`/`false` — they return one of the operands. `||` yields the first truthy value: `\"\" || \"Anonymous\"` is `\"Anonymous\"`, `\"Yara\" || \"Anonymous\"` is `\"Yara\"`. Its mirror `&&` returns the first falsy value (or the last if all truthy), which is why React uses `show && <Thing/>` — falsy short-circuits to render nothing. The `??` vs `||` decision is entirely about whether empty-but-real values (`0`, `\"\"`) should count: here an empty name is 'no name', so `||` is correct; for a port number, `??` is correct.",
      docRef: DOC,
    }),
};

/* ── Level 3 — destructuring, spread, rest ── */

const destructureParams: Generator = {
  id: "js-destructure-params",
  title: "Destructuring parameters",
  generate: () =>
    codeTask({
      genId: "js-destructure-params",
      prompt:
        "Write `formatUser(options)` that takes a single object and returns `\"<name> (<role>)\"`. Destructure `name` and `role` straight from the parameter (rather than reading `options.name`, `options.role`), defaulting `role` to `\"member\"` when it's absent.",
      language: "javascript",
      starter: `function formatUser(options) {\n  // destructure name and role (default "member") in the params\n}`,
      solution: `function formatUser({ name, role = "member" }) {\n  return \`\${name} (\${role})\`;\n}`,
      checks: [
        { re: "function\\s+formatUser\\s*\\(\\s*\\{", label: "destructures in the parameter list" },
        { re: "role\\s*=\\s*[\"']member[\"']", label: "defaults `role` to `\"member\"`" },
      ],
      fn: {
        name: "formatUser",
        tests: [
          { args: [{ name: "Ines", role: "admin" }], expected: "Ines (admin)" },
          { args: [{ name: "Omar" }], expected: "Omar (member)", show: "missing role → default 'member'" },
        ],
      },
      explanation:
        "`function f({ name, role = 'member' })` pulls named fields out of the argument object and lets each carry a default that fires on `undefined`. You can also rename while destructuring — `{ name: displayName }` binds the local variable `displayName` — and nest — `{ address: { city } }`. Destructuring named options beats positional args (`f(name, role, active)`) because callers pass `{ role, active }` in any order and skip what they don't need, and the call site documents itself.",
      docRef: DOC,
    }),
};

const spreadMerge: Generator = {
  id: "js-spread-merge",
  title: "Immutable update with spread",
  generate: () =>
    codeTask({
      genId: "js-spread-merge",
      prompt:
        "Write `withPatch(user, patch)` returning a NEW object with `user`'s fields overridden by `patch`'s, without mutating `user` — the immutable-update pattern behind React state. Order matters: the patch must win on overlapping keys.",
      language: "javascript",
      starter: `function withPatch(user, patch) {\n  // return a NEW merged object; don't mutate user\n}`,
      solution: `function withPatch(user, patch) {\n  return { ...user, ...patch };\n}`,
      checks: [
        { re: "\\.\\.\\.\\s*user", label: "spreads the original `...user`" },
        { re: "\\.\\.\\.\\s*patch", label: "spreads the `...patch` after it (so it overrides)" },
        { re: "user\\.\\w+\\s*=", expect: false, label: "never assigns into `user`" },
      ],
      fn: {
        name: "withPatch",
        tests: [
          { args: [{ name: "A", role: "member" }, { role: "admin" }], expected: { name: "A", role: "admin" } },
          { args: [{ id: 1, done: false }, { done: true }], expected: { id: 1, done: true } },
          { args: [{ x: 1 }, { y: 2 }], expected: { x: 1, y: 2 } },
        ],
      },
      explanation:
        "Spread order is everything: `{ ...user, ...patch }` lets `patch` win, while `{ ...patch, ...user }` would let the ORIGINAL win and ignore your update — a real bug. This copy is SHALLOW: nested objects are shared by reference, so to update `user.address.city` you spread at each level (`{ ...user, address: { ...user.address, city } }`). Spreading instead of mutating is what lets React detect a change by comparing references — mutate `user` in place and the reference is unchanged, so nothing re-renders.",
      docRef: DOC,
    }),
};

const restParams: Generator = {
  id: "js-rest-params",
  title: "Rest parameters",
  generate: () =>
    codeTask({
      genId: "js-rest-params",
      prompt:
        "Write `sum` so it accepts ANY number of numeric arguments and returns their total, with `sum()` returning 0. Gather the arguments into a rest parameter named `nums`, then fold them into the total — seed the fold so the empty call is 0.",
      language: "javascript",
      starter: `function sum(/* collect all args */) {\n  // return the total\n}`,
      solution: `function sum(...nums) {\n  return nums.reduce((total, n) => total + n, 0);\n}`,
      checks: [
        { re: "function\\s+sum\\s*\\(\\s*\\.\\.\\.\\s*nums\\s*\\)", label: "collects args with `...nums`" },
        { re: "\\.reduce\\(", label: "totals with `.reduce`" },
        { re: ",\\s*0\\s*\\)", label: "seeds the reduce with `0` (so `sum()` is 0)" },
      ],
      fn: {
        name: "sum",
        tests: [
          { args: [1, 2, 3], expected: 6 },
          { args: [10], expected: 10 },
          { args: [], expected: 0, show: "sum() → 0 (empty reduce uses the seed)" },
          { args: [5, -2, 7, 1], expected: 11 },
        ],
      },
      explanation:
        "Rest (`...nums` in a signature) gathers; spread (`...arr` in a call/literal) scatters — same three dots, opposite jobs. `sum(...[1,2,3])` uses spread to expand the array back into three arguments. The `0` seed in `reduce` matters twice: it makes `sum()` return 0 instead of crashing on an empty array, and it fixes the accumulator's starting type. Rest must be the LAST parameter (`f(a, b, ...rest)`), since it soaks up everything remaining.",
      docRef: DOC,
    }),
};

const arrayDestructure: Generator = {
  id: "js-array-destructure",
  title: "Array destructuring & rest",
  generate: () =>
    codeTask({
      genId: "js-array-destructure",
      prompt:
        "Write `headTail(arr)` returning `{ head, tail }`, where `head` is the first element and `tail` is an array of everything after it. For an empty array, `head` is `undefined` and `tail` is `[]`. Split it in one step with array destructuring plus a rest element.",
      language: "javascript",
      starter: `function headTail(arr) {\n  // destructure into head + tail, return { head, tail }\n}`,
      solution: `function headTail(arr) {\n  const [head, ...tail] = arr;\n  return { head, tail };\n}`,
      checks: [
        { re: "\\[\\s*head\\s*,\\s*\\.\\.\\.\\s*tail\\s*\\]", label: "splits with `[head, ...tail]`" },
        { re: "\\{\\s*head\\s*,\\s*tail\\s*\\}", label: "returns `{ head, tail }` (shorthand)" },
      ],
      fn: {
        name: "headTail",
        tests: [
          { args: [[1, 2, 3]], expected: { head: 1, tail: [2, 3] } },
          { args: [[9]], expected: { head: 9, tail: [] } },
          { args: [["a", "b"]], expected: { head: "a", tail: ["b"] } },
        ],
      },
      explanation:
        "`const [head, ...tail] = arr` reads position 0 into `head` and bundles the remainder into a fresh `tail` array (empty when there's no remainder — never null). You can skip positions with holes (`const [, second] = arr`) and supply defaults (`const [x = 0] = arr`). The classic party trick is the templess swap `[a, b] = [b, a]`, which builds a throwaway array and destructures it back. On an empty array, `head` is genuinely `undefined` and `tail` is `[]` (rest never yields null) — no crash.",
      docRef: DOC,
    }),
};

/* ── Level 4 — array methods, closures ── */

const reduceTotal: Generator = {
  id: "js-reduce-total",
  title: "reduce to a single value",
  generate: () =>
    codeTask({
      genId: "js-reduce-total",
      prompt:
        "Write `cartTotal(items)` (each item `{ price, qty }`) returning the sum of `price * qty` across all items. Fold the list into a single total with `reduce`, seeding it so an empty cart returns 0.",
      language: "javascript",
      starter: `function cartTotal(items) {\n  // reduce to the grand total\n}`,
      solution: `function cartTotal(items) {\n  return items.reduce((total, item) => total + item.price * item.qty, 0);\n}`,
      checks: [
        { re: "\\.reduce\\(", label: "uses `.reduce`" },
        { re: ",\\s*0\\s*\\)", label: "seeds with `0`" },
        { re: "\\.price\\s*\\*\\s*\\w+\\.qty|\\.qty\\s*\\*\\s*\\w+\\.price", label: "accumulates `price * qty`" },
      ],
      fn: {
        name: "cartTotal",
        tests: [
          { args: [[{ price: 10, qty: 2 }, { price: 5, qty: 3 }]], expected: 35 },
          { args: [[{ price: 100, qty: 1 }]], expected: 100 },
          { args: [[]], expected: 0, show: "empty cart → 0 (the seed)" },
        ],
      },
      explanation:
        "`reduce((acc, item) => …, seed)` is the general-purpose fold — `sum`, `max`, `count`, even `groupBy` are all reduces. The seed does double duty: it's the result for an empty array (so no crash), and it fixes the accumulator's type from the start. A frequent bug is omitting the seed: `[].reduce(fn)` with no seed throws, and `[x].reduce(fn)` skips the callback entirely and just returns `x`. When you're mapping or filtering, use `.map`/`.filter`; reach for `reduce` specifically when many items collapse into one.",
      docRef: DOC,
    }),
};

const groupBy: Generator = {
  id: "js-group-by",
  title: "Group with reduce",
  generate: () =>
    codeTask({
      genId: "js-group-by",
      prompt:
        "Write `groupByRole(users)` (each user `{ name, role }`) returning an object mapping each role to an array of the NAMES with that role, preserving input order. Build it in one pass with `reduce` over an object accumulator: create each role's bucket the first time you see it, then add the name.",
      language: "javascript",
      starter: `function groupByRole(users) {\n  // build { role: [name, ...] }\n}`,
      solution: `function groupByRole(users) {\n  return users.reduce((groups, user) => {\n    (groups[user.role] ??= []).push(user.name);\n    return groups;\n  }, {});\n}`,
      checks: [
        { re: "\\.reduce\\(", label: "uses `.reduce`" },
        { re: "\\.push\\(", label: "pushes names into the bucket" },
        { re: ",\\s*\\{\\s*\\}\\s*\\)", label: "seeds with `{}`" },
      ],
      fn: {
        name: "groupByRole",
        tests: [
          {
            args: [[{ name: "A", role: "admin" }, { name: "B", role: "member" }, { name: "C", role: "admin" }]],
            expected: { admin: ["A", "C"], member: ["B"] },
          },
          { args: [[]], expected: {} },
        ],
      },
      explanation:
        "The pattern is 'ensure the bucket, then add to it'. `groups[role] ??= []` is the modern one-liner: if the bucket is null/undefined, assign a new array, then either way `.push` the name. (Longhand: `if (!groups[role]) groups[role] = []`.) The key trap is remembering to `return groups` each iteration — the callback must hand the accumulator forward, or the next step gets `undefined`. This exact reduce is what `Object.groupBy` and libraries like lodash's `groupBy` do for you.",
      docRef: DOC,
    }),
};

const immutableToggle: Generator = {
  id: "js-immutable-toggle",
  title: "map without mutating",
  generate: () =>
    codeTask({
      genId: "js-immutable-toggle",
      prompt:
        "Write `toggleDone(todos, id)` (each todo `{ id, done }`) returning a NEW array where the todo whose `id` matches has its `done` flipped and every other todo is passed through unchanged (same reference). Don't mutate the input — build the new list with `map`, copying only the item you change.",
      language: "javascript",
      starter: `function toggleDone(todos, id) {\n  // return a new array with the matching todo's done flipped\n}`,
      solution: `function toggleDone(todos, id) {\n  return todos.map((todo) =>\n    todo.id === id ? { ...todo, done: !todo.done } : todo\n  );\n}`,
      checks: [
        { re: "\\.map\\(", label: "builds a new array with `.map`" },
        { re: "\\{\\s*\\.\\.\\.\\s*todo", label: "copies the matched item with spread" },
        { re: "!\\s*\\w+\\.done", label: "flips `done` with `!`" },
        { re: "\\btodos\\[\\w+\\]\\.\\w+\\s*=|\\.done\\s*=", expect: false, label: "never mutates a todo in place" },
      ],
      fn: {
        name: "toggleDone",
        tests: [
          { args: [[{ id: 1, done: false }, { id: 2, done: false }], 1], expected: [{ id: 1, done: true }, { id: 2, done: false }] },
          { args: [[{ id: 1, done: true }], 1], expected: [{ id: 1, done: false }] },
          { args: [[{ id: 1, done: false }], 99], expected: [{ id: 1, done: false }], show: "no match → unchanged" },
        ],
      },
      explanation:
        "This is the canonical React/Redux list update. `map` gives you a new array; the ternary decides per item — the match gets a fresh object `{ ...todo, done: !todo.done }`, everyone else is returned by the same reference (cheap, and lets memoised rows skip re-rendering). Mutating instead — `todo.done = !todo.done` inside a `forEach` — changes the original array/objects in place, so React sees the same references and skips the update, or worse, corrupts state you'll read elsewhere. Copy the one you touch; share the rest.",
      docRef: DOC,
    }),
};

const closures: Generator = {
  id: "js-closures",
  title: "Closures (private state)",
  generate: () =>
    codeTask({
      genId: "js-closures",
      prompt:
        "Write `makeCounter()` that returns a function. Each call to that returned function increments a PRIVATE count (starting at 0) and returns the new value — first call gives 1, next 2, and so on. The `count` must be unreachable from outside (no object property, no global) — lean on a closure to keep it private.",
      language: "javascript",
      starter: `function makeCounter() {\n  // return a function that increments a private count\n}`,
      solution: `function makeCounter() {\n  let count = 0;\n  return function () {\n    count += 1;\n    return count;\n  };\n}`,
      checks: [
        { re: "let\\s+count\\s*=\\s*0", label: "declares a private `let count = 0`" },
        { re: "return\\s+function|return\\s*\\(\\s*\\)\\s*=>", label: "returns the inner function" },
        { re: "count\\s*\\+=\\s*1|count\\+\\+|count\\s*=\\s*count\\s*\\+\\s*1", label: "increments `count`" },
      ],
      explanation:
        "When `makeCounter` returns, its local `count` would normally vanish — but the returned function still references it, so the variable survives, captured in a closure. Each call to `makeCounter()` makes a FRESH `count`, so two counters are fully independent. Because `count` is a local variable, not a property, there's no way to read or reset it from outside — genuine encapsulation with no class needed. Closures power hooks (`useState` holds state in one), event handlers, memoisation, and the module pattern. (Fun fact: the `var`-in-a-loop bug from Level 1 is a closure bug — every callback closed over the SAME shared `var`.)",
      docRef: DOC,
    }),
};

/* ── Level 5 — this, async ── */

const thisBinding: Generator = {
  id: "js-this-binding",
  title: "`this` & arrow callbacks",
  generate: () =>
    codeTask({
      genId: "js-this-binding",
      prompt:
        "This `timer` is broken: inside `setInterval` the callback is a regular function, so its `this` isn't the timer and `this.seconds` is undefined. Fix `start` so the callback still sees the timer's `this.seconds`. Keep `start` a normal method (it needs its own `this` = the object), but choose a callback form that inherits `this` lexically from where it's written rather than getting its own.",
      language: "javascript",
      starter: `const timer = {\n  seconds: 0,\n  start() {\n    setInterval(function () {\n      this.seconds += 1;\n    }, 1000);\n  },\n};`,
      solution: `const timer = {\n  seconds: 0,\n  start() {\n    setInterval(() => {\n      this.seconds += 1;\n    }, 1000);\n  },\n};`,
      checks: [
        { re: "start\\s*\\(\\s*\\)\\s*\\{", label: "`start` stays a regular method (own `this` = timer)" },
        { re: "setInterval\\(\\s*\\(\\s*\\)\\s*=>", label: "the setInterval callback is an ARROW function" },
        { re: "setInterval\\(\\s*function", expect: false, label: "no regular `function` callback (it would lose `this`)" },
        { re: "this\\.seconds", label: "still uses `this.seconds`" },
      ],
      explanation:
        "`this` in a regular function is bound at CALL time: `timer.start()` sets `this` to `timer` inside `start`, but when `setInterval` later invokes the inner `function(){}` it calls it plainly, so that callback's `this` is undefined (or the global). An arrow function doesn't rebind `this` at all — it captures whatever `this` was in the enclosing scope (`start`, where `this` is `timer`). Hence the rule: methods that need their own `this` stay regular functions; callbacks that should keep the outer `this` are arrows. (Pre-arrow, people fixed this with `const self = this` or `.bind(this)`.)",
      docRef: DOC,
    }),
};

const asyncAwait: Generator = {
  id: "js-async-await",
  title: "async / await + try-catch",
  generate: () =>
    codeTask({
      genId: "js-async-await",
      prompt:
        "Rewrite `loadUser(id)` to be asynchronous: it should wait for `fetchUser(id)` (which returns a Promise) and return the resolved user. Handle a rejected fetch by returning `null` instead of throwing — use the straight-line async style with ordinary error handling around the wait.",
      language: "javascript",
      starter: `function loadUser(id) {\n  // make it async: await fetchUser(id), return null on error\n}`,
      solution: `async function loadUser(id) {\n  try {\n    const user = await fetchUser(id);\n    return user;\n  } catch (err) {\n    return null;\n  }\n}`,
      checks: [
        { re: "async\\s+function\\s+loadUser", label: "declares an `async function`" },
        { re: "await\\s+fetchUser\\(", label: "awaits `fetchUser(id)`" },
        { re: "try\\s*\\{", label: "wraps the await in `try`" },
        { re: "catch\\s*\\(", label: "handles rejection with `catch`" },
        { re: "return\\s+null", label: "returns `null` on error" },
      ],
      explanation:
        "`await` only works inside an `async` function, and it unwraps the Promise: `const user = await fetchUser(id)` gives you the value, not a pending Promise. A rejected Promise throws at the `await`, so `try/catch` handles async errors with the same syntax as sync ones — far cleaner than `.then(...).catch(...)`. Remember the whole function still returns a Promise, so callers must `await loadUser(1)` (or `.then`) to get the result. A classic mistake is forgetting `await` — then you're working with the Promise object itself instead of its value.",
      docRef: DOC,
    }),
};

const promiseAll: Generator = {
  id: "js-promise-all",
  title: "Parallel with Promise.all",
  generate: () =>
    codeTask({
      genId: "js-promise-all",
      prompt:
        "Write async `loadAll(ids)` that fetches every id with `fetchUser` in PARALLEL (not one-after-another in a loop) and returns the array of users in the same order. Kick off all the requests at once, then await the whole batch together.",
      language: "javascript",
      starter: `function loadAll(ids) {\n  // fetch all ids in parallel, return the array of users\n}`,
      solution: `async function loadAll(ids) {\n  return Promise.all(ids.map((id) => fetchUser(id)));\n}`,
      checks: [
        { re: "async\\s+function\\s+loadAll", label: "declares an `async function`" },
        { re: "Promise\\.all\\(", label: "batches with `Promise.all`" },
        { re: "\\.map\\(", label: "maps ids to promises with `.map`" },
        { re: "fetchUser\\(", label: "calls `fetchUser` per id" },
      ],
      explanation:
        "The trap: `for (const id of ids) { await fetchUser(id) }` awaits each request before starting the next, so ten 100ms calls take a second. `ids.map(id => fetchUser(id))` starts them all immediately (map doesn't await), producing an array of pending Promises; `Promise.all` then waits for the whole batch and returns results in input order — total time ≈ the slowest single call. Note `Promise.all` is all-or-nothing: one rejection rejects the whole thing. Use `Promise.allSettled` when you want every result regardless of individual failures.",
      docRef: DOC,
    }),
};

/* ── more array/immutability drills ── */

const spreadArrayAdd: Generator = {
  id: "js-spread-array-add",
  title: "Add to an array immutably",
  generate: () =>
    codeTask({
      genId: "js-spread-array-add",
      prompt:
        "Write `addItem(arr, item)` returning a NEW array with `item` appended, leaving `arr` untouched (the immutable append React state needs). Don't reach for the mutating array method that pushes in place.",
      language: "javascript",
      starter: `function addItem(arr, item) {\n  // return a NEW array with item appended\n}`,
      solution: `function addItem(arr, item) {\n  return [...arr, item];\n}`,
      checks: [
        { re: "\\[\\s*\\.\\.\\.\\s*arr\\s*,", label: "spreads into a new array `[...arr, item]`" },
        { re: "\\.push\\(", expect: false, label: "does not mutate with `.push`" },
      ],
      fn: {
        name: "addItem",
        tests: [
          { args: [[1, 2], 3], expected: [1, 2, 3] },
          { args: [[], "a"], expected: ["a"] },
        ],
      },
      explanation:
        "`[...arr, item]` copies every element then adds the new one — the original `arr` is never touched, so React can detect the change by reference. Prepend with `[item, ...arr]`, remove immutably with `arr.filter(x => x !== item)`, replace with `map`. The mutating trio to avoid in state is `push`/`splice`/`sort` (they change in place and return the wrong thing or the length).",
      docRef: DOC,
    }),
};

const setDedup: Generator = {
  id: "js-set-dedup",
  title: "Deduplicate with Set",
  generate: () =>
    codeTask({
      genId: "js-set-dedup",
      prompt:
        "Write `dedupe(arr)` returning a new array with duplicates removed, first-seen order preserved. There's a built-in collection that holds each value only once — round-trip the array through it.",
      language: "javascript",
      starter: `function dedupe(arr) {\n  // remove duplicates, keep order\n}`,
      solution: `function dedupe(arr) {\n  return [...new Set(arr)];\n}`,
      checks: [
        { re: "new\\s+Set\\(", label: "builds a `Set` from the array" },
        { re: "\\[\\s*\\.\\.\\.", label: "spreads it back to an array" },
      ],
      fn: {
        name: "dedupe",
        tests: [
          { args: [[1, 1, 2, 3, 3, 3]], expected: [1, 2, 3] },
          { args: [["a", "b", "a"]], expected: ["a", "b"] },
          { args: [[]], expected: [] },
        ],
      },
      explanation:
        "`new Set(arr)` builds a set (dedup happens on insert, using SameValueZero equality), and `[...set]` or `Array.from(set)` turns it back into an array — preserving first-seen order. It's the shortest dedupe in JS. Caveat: it dedupes by identity, so two DIFFERENT objects with equal contents both survive (`[{},{}]` stays length 2). For that you'd key on a property.",
      docRef: DOC,
    }),
};

const chainFilterMap: Generator = {
  id: "js-chain-filter-map",
  title: "Chain filter → map",
  generate: () =>
    codeTask({
      genId: "js-chain-filter-map",
      prompt:
        "Write `activeNames(users)` (each user `{ name, active }`) returning an array of the NAMES of the active users only. Build it as a pipeline: narrow to the active users first, then transform what's left into their names.",
      language: "javascript",
      starter: `function activeNames(users) {\n  // names of active users\n}`,
      solution: `function activeNames(users) {\n  return users.filter((u) => u.active).map((u) => u.name);\n}`,
      checks: [
        { re: "\\.filter\\(", label: "filters to active users" },
        { re: "\\.map\\(", label: "maps to names" },
      ],
      fn: {
        name: "activeNames",
        tests: [
          { args: [[{ name: "A", active: true }, { name: "B", active: false }, { name: "C", active: true }]], expected: ["A", "C"] },
          { args: [[]], expected: [] },
        ],
      },
      explanation:
        "`filter(predicate)` keeps elements where the predicate is truthy; `map(fn)` transforms each survivor. Chaining reads top-to-bottom as a pipeline: 'active users, then their names'. Both are pure — they return NEW arrays and never touch the input. Putting `filter` before `map` also means `map`'s callback only runs on the elements you're keeping.",
      docRef: DOC,
    }),
};

const findDefault: Generator = {
  id: "js-find-default",
  title: "find with a fallback",
  generate: () =>
    codeTask({
      genId: "js-find-default",
      prompt:
        "Write `firstEven(nums)` returning the FIRST even number, or `-1` when there are none. Watch the falsy trap the tests enforce: `0` is even but falsy, so choose a default operator that only kicks in on 'not found', never on a real `0`.",
      language: "javascript",
      starter: `function firstEven(nums) {\n  // first even number, or -1\n}`,
      solution: `function firstEven(nums) {\n  return nums.find((n) => n % 2 === 0) ?? -1;\n}`,
      checks: [
        { re: "\\.find\\(", label: "uses `.find`" },
        { re: "%\\s*2\\s*===\\s*0", label: "tests evenness with `% 2 === 0`" },
        { re: "\\?\\?\\s*-1", label: "defaults to `-1` with `??`" },
      ],
      fn: {
        name: "firstEven",
        tests: [
          { args: [[1, 3, 4, 5, 6]], expected: 4, show: "first even → 4" },
          { args: [[1, 3, 5]], expected: -1, show: "none even → -1" },
          { args: [[0, 1]], expected: 0, show: "0 is even; ?? keeps it (|| would return -1!)" },
        ],
      },
      explanation:
        "`.find` stops at the first match (short-circuits) and returns the ELEMENT, not an array — use it when you want one item, `.filter` when you want all. Here `??` is essential, not `||`: the first even number could be `0`, which is falsy, so `find(...) || -1` would wrongly return `-1`. `??` only defaults on `undefined` (the 'not found' signal), preserving a legitimate `0`.",
      docRef: DOC,
    }),
};

const everyCheck: Generator = {
  id: "js-every-some",
  title: "every / some",
  generate: () =>
    codeTask({
      genId: "js-every-some",
      prompt:
        "Write `allPositive(nums)` returning `true` only when EVERY number is greater than 0 (and `true` for an empty array). Reach for the array method that tests a predicate against all elements and short-circuits on the first failure.",
      language: "javascript",
      starter: `function allPositive(nums) {\n  // true if every number > 0\n}`,
      solution: `function allPositive(nums) {\n  return nums.every((n) => n > 0);\n}`,
      checks: [{ re: "\\.every\\(", label: "uses `.every`" }],
      fn: {
        name: "allPositive",
        tests: [
          { args: [[1, 2, 3]], expected: true },
          { args: [[1, -2, 3]], expected: false, show: "one negative → false" },
          { args: [[]], expected: true, show: "empty → true (vacuously)" },
        ],
      },
      explanation:
        "`every` returns `false` as soon as one element fails (short-circuit); `some` returns `true` as soon as one passes. They're the readable, intention-revealing alternatives to a manual loop with a flag. The empty-array edge is worth memorising: `[].every(...)` is `true` (no counterexample exists) and `[].some(...)` is `false` (no witness exists).",
      docRef: DOC,
    }),
};

const sortImmutable: Generator = {
  id: "js-sort-immutable",
  title: "Sort without mutating",
  generate: () =>
    codeTask({
      genId: "js-sort-immutable",
      prompt:
        "Write `sortedDesc(nums)` returning a NEW array sorted largest-first, WITHOUT mutating `nums`. Two traps the tests enforce: sorting happens in place (so sort a COPY, not the original), and with no comparator numbers sort lexicographically — `[10, 2, 1]` would become `[1, 10, 2]` — so pass a numeric comparator.",
      language: "javascript",
      starter: `function sortedDesc(nums) {\n  // new array, sorted descending, original untouched\n}`,
      solution: `function sortedDesc(nums) {\n  return [...nums].sort((a, b) => b - a);\n}`,
      checks: [
        { re: "\\[\\s*\\.\\.\\.\\s*nums\\s*\\]|nums\\.slice\\(\\)", label: "sorts a COPY (spread or slice)" },
        { re: "\\.sort\\(", label: "sorts" },
        { re: "b\\s*-\\s*a", label: "descending comparator `(a, b) => b - a`" },
        { re: "(?<![.\\]])\\bnums\\.sort\\(", expect: false, label: "never sorts `nums` itself" },
      ],
      fn: {
        name: "sortedDesc",
        tests: [
          { args: [[3, 1, 2]], expected: [3, 2, 1] },
          { args: [[10, 2, 1]], expected: [10, 2, 1], show: "numeric comparator: 10 > 2 (not lexicographic!)" },
          { args: [[5]], expected: [5] },
        ],
      },
      explanation:
        "Two traps in one. First, default `sort` coerces to strings, so `10` sorts before `2` — always pass a numeric comparator: `(a, b) => a - b` ascending, `b - a` descending. Second, `sort` mutates and RETURNS the same array, so `nums.sort()` would reorder your input; spreading first (`[...nums]`) sorts a throwaway copy. (ES2023 adds the non-mutating `toSorted()`, but the copy-then-sort idiom works everywhere.)",
      docRef: DOC,
    }),
};

/* ── Multi-file capstone — assemble an ES-module feature across files ── */

const cartModule: Generator = {
  id: "js-cart-module",
  title: "Assemble a shopping-cart module",
  generate: () =>
    multiFileTask({
      genId: "js-cart-module",
      prompt:
        "Context: real JavaScript ships as ES MODULES — each file `export`s its API and `import`s what it needs, and one entry file re-exports the public surface. This is the organisation the runnable single-file drills don't show.\n\nTask: split a cart feature across three files. `money.js` exposes a `formatMoney(cents)` helper; `cart.js` uses it and exposes `cartTotal(items)` (sum of `price * qty`) and `receipt(items)` (the total, formatted); `index.js` is the single public entry point. Write each in its tab, **Debug this file**, then **submit all** — open a file's hints if you get stuck on the module syntax.",
      files: [
        {
          name: "money.js",
          language: "javascript",
          role: "the leaf helper module — no imports",
          hint: "Define one function and make it public with a NAMED export: `export function formatMoney(cents) { … }`. Convert cents to a dollar string — divide by 100 and use `.toFixed(2)` for exactly two decimals. Named exports (not one big `default`) keep a module tree-shakeable and greppable.",
          starter: `// money.js — export a formatMoney(cents) helper`,
          solution: `export function formatMoney(cents) {\n  return "$" + (cents / 100).toFixed(2);\n}`,
          checks: [
            { re: "export\\s+function\\s+formatMoney\\s*\\(", label: "named-exports `formatMoney`" },
            { re: "toFixed\\(\\s*2\\s*\\)", label: "formats to 2 decimal places" },
          ],
        },
        {
          name: "cart.js",
          language: "javascript",
          role: "the cart logic — imports the helper",
          hint: "Pull in the helper with a named import from its relative path: `import { formatMoney } from \"./money.js\"`. Export `cartTotal(items)` that sums `price * qty` with `reduce`, and `receipt(items)` that formats that total through the imported helper. A file imports exactly what it needs and exports its own surface — nothing else leaks.",
          starter: `// cart.js — import formatMoney; export cartTotal(items) and receipt(items)`,
          solution: `import { formatMoney } from "./money.js";\n\nexport function cartTotal(items) {\n  return items.reduce((sum, item) => sum + item.price * item.qty, 0);\n}\n\nexport function receipt(items) {\n  return formatMoney(cartTotal(items));\n}`,
          checks: [
            { re: "import\\s*\\{\\s*formatMoney\\s*\\}\\s*from\\s*[\"']\\./money", label: "imports `formatMoney` from `./money.js`" },
            { re: "export\\s+function\\s+cartTotal\\s*\\(", label: "exports `cartTotal`" },
            { re: "\\.reduce\\(", label: "totals with `reduce`" },
            { re: "export\\s+function\\s+receipt\\s*\\(", label: "exports `receipt`" },
            { re: "formatMoney\\(", label: "`receipt` uses the imported helper" },
          ],
        },
        {
          name: "index.js",
          language: "javascript",
          role: "the barrel consumers import from",
          hint: "A barrel re-exports the pieces you want public from one entry file, so the rest of the app writes `import { receipt } from \"./cart\"` against a stable path. Use the re-export form — `export { cartTotal, receipt } from \"./cart.js\"` — for the API you're exposing. Then the internal files can be refactored freely as long as the barrel's shape holds.",
          starter: `// index.js — the public entry: re-export the cart module's API`,
          solution: `export { cartTotal, receipt } from "./cart.js";\nexport { formatMoney } from "./money.js";`,
          checks: [
            { re: "export\\s*\\{[^}]*cartTotal[^}]*\\}\\s*from\\s*[\"']\\./cart", label: "re-exports the cart API from `./cart.js`" },
            { re: "export\\s*\\{[^}]*formatMoney[^}]*\\}\\s*from\\s*[\"']\\./money", label: "re-exports `formatMoney` from `./money.js`" },
          ],
        },
      ],
      crossChecks: [
        {
          re: "(?=[\\s\\S]*export\\s+function\\s+formatMoney)(?=[\\s\\S]*import\\s*\\{\\s*formatMoney\\s*\\}\\s*from\\s*[\"']\\./money)",
          label: "`cart.js` imports the `formatMoney` that `money.js` exports",
        },
        {
          re: "(?=[\\s\\S]*export\\s+function\\s+cartTotal)(?=[\\s\\S]*export\\s*\\{[^}]*cartTotal[^}]*\\}\\s*from\\s*[\"']\\./cart)",
          label: "`index.js` re-exports the `cartTotal` that `cart.js` defines",
        },
      ],
      explanation:
        "ES modules make each file's boundary explicit: `export` names the public surface, `import` pulls in exactly what a file needs (`formatMoney` into `cart.js`), and everything else stays private to its file. The `index.js` BARREL re-exports the pieces you want callers to see, so the rest of the app writes `import { receipt } from \"./cart\"` against one stable entry point — you can refactor `money.js` and `cart.js` freely as long as the barrel's shape holds. Named exports (not one big `default`) are what make this tree-shakeable and greppable.",
      docRef: DOC,
    }),
};

export const javascriptTrack: CodingTrack = {
  id: "coding-javascript",
  title: "JavaScript",
  icon: "🟨",
  stack: "JavaScript",
  blurb:
    "The syntax that's easy to get subtly wrong — const/let, template literals, ?? vs ||, ?., destructuring, spread/rest, reduce, closures, `this`, async/await. Most tasks RUN for real.",
  exercises: [
    { level: 1, gen: constLet },
    { level: 1, gen: templateLiteral },
    { level: 1, gen: defaultParams },
    { level: 1, gen: arrowReturnObject },
    { level: 2, gen: nullish },
    { level: 2, gen: optionalChaining },
    { level: 2, gen: truthyBlank },
    { level: 2, gen: shortCircuit },
    { level: 3, gen: destructureParams },
    { level: 3, gen: spreadMerge },
    { level: 3, gen: restParams },
    { level: 3, gen: arrayDestructure },
    { level: 2, gen: spreadArrayAdd },
    { level: 3, gen: setDedup },
    { level: 3, gen: chainFilterMap },
    { level: 3, gen: cartModule },
    { level: 4, gen: reduceTotal },
    { level: 4, gen: groupBy },
    { level: 4, gen: immutableToggle },
    { level: 4, gen: closures },
    { level: 4, gen: findDefault },
    { level: 4, gen: everyCheck },
    { level: 5, gen: thisBinding },
    { level: 5, gen: asyncAwait },
    { level: 5, gen: promiseAll },
    { level: 5, gen: sortImmutable },
  ],
};
