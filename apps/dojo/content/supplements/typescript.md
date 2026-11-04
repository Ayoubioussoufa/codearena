# TypeScript — types as a tool, not a tax

A Dojo supplement guide. TypeScript is JavaScript plus a *compile-time* checker: it never changes what runs (the
types are erased before execution), but it catches a whole category of bugs — typos, wrong shapes, forgotten
cases — at your desk instead of in production. The trick is to treat the type system as a *modelling* tool: the
more precisely you describe your data, the more the compiler works for you. This guide builds that skill from
inference up to conditional types.

> **How to read this.** Keep a TypeScript playground or an editor with red squiggles open and *break* every
> example on purpose — remove an annotation, pass the wrong type — to see what the compiler says. The error
> messages are the lesson. Each section ends with **the bug it prevents**. This is the reading behind the
> **TypeScript** coding track.

---


---

## ⌨️ This guide is interactive

**Twelve exercises are embedded below**, each under the section that teaches it. You write the code;
the guide names what you got and what you missed. Imports and context are given — you never guess.

Four of them are the errors that look like the compiler being difficult when it is being correct:
`TS7022` circular inference, `strictPropertyInitialization` on a DTO, `exactOptionalPropertyTypes`,
and the excess-property rule that lets `return row` leak a password hash.
## 0. Five words the rest of this guide stands on

- **Type** — a description of the *shape* of a value (`string`, `number[]`, `{ id: number }`).
- **Inference** — the compiler figuring out a type without you writing it.
- **Narrowing** — going from a broad type (a union) to a specific one inside a check.
- **Generic** — a type left blank for the *caller* to fill in (`Array<T>`).
- **Structural typing** — TS compares types by their *shape*, not their name.

---

## 1. Let inference do the work; annotate the boundaries

TypeScript infers most types for you:

```ts
let count = 0;          // inferred number
const name = "Ada";     // inferred "Ada" (a literal — see §4)
const nums = [1, 2, 3]; // inferred number[]
```

You don't annotate `const x = 5`. You *do* annotate the **boundaries** — function parameters, return types when
you want them verified, and data crossing an API — because those are the contracts:

```ts
function greet(name: string, age?: number): string {
  return age ? `${name} (${age})` : name;
}
```

The `?` makes `age` optional (its type is `number | undefined`, which is why the check is needed). Annotating the
return type isn't decoration: it makes the compiler prove *every* branch returns a string.

Avoid `any` — it switches the checker OFF for that value and infects everything it touches. When you truly don't
know a type, use `unknown` (which forces you to narrow before use).

**The bug it prevents.** A function that quietly returns `undefined` on some path, discovered three calls away
instead of at the definition.
```exercise
annotate-boundaries
```


---

## 2. Structural typing — shape, not name

TS doesn't care what you *named* a type; it cares what's *in* it. If the shape matches, it fits ("duck typing"):

```ts
interface Point { x: number; y: number; }
function dist(p: Point) { … }

const thing = { x: 1, y: 2, label: "A" };
dist(thing); // OK — thing has x and y (extra fields are fine)
```

This is why two differently-named interfaces with identical fields are interchangeable, and why you can pass an
object literal with *extra* properties to a function (through a variable — direct literals get an excess-property
check that's stricter, to catch typos).

**The bug it prevents.** Over-engineering with classes and `instanceof` when a plain shape would do — and
fighting the compiler about "types that are the same but named differently."
```exercise
structural-typing
```


```check
inference
```

---

## 3. Unions and narrowing

A **union** (`A | B`) means "one of these". You can't use a branch-specific field until you've **narrowed** to
that branch. TypeScript understands ordinary runtime checks as type guards:

```ts
function len(x: string | string[]): number {
  if (typeof x === "string") return x.length;   // here x is string
  return x.length;                              // here x is string[]
}
```

The narrowing tools, from most to least common:

- **`typeof`** — for primitives: `typeof x === "string"`.
- **Discriminated union** — a shared literal "tag" field you switch on (the cleanest):

  ```ts
  type Result =
    | { status: "ok"; value: number }
    | { status: "error"; message: string };

  function show(r: Result) {
    if (r.status === "ok") return r.value;   // r is the ok variant
    return r.message;                        // r is the error variant
  }
  ```

- **`in`** — when there's no tag, check which property exists: `if ("radius" in shape)`.
- **`instanceof`** — for class instances: `if (err instanceof Error)`.
- **Type predicate** — a custom guard whose return type is `x is T`:

  ```ts
  function isUser(x: unknown): x is User {
    return typeof x === "object" && x !== null && "id" in x;
  }
  ```

Never reach for `as` to "fix" a union — a cast *silences* the compiler instead of *convincing* it, and lies
about runtime reality.

**The bug it prevents.** Reading `r.message` on a success result (won't compile with a discriminated union),
and `Cannot read properties of undefined` from an unchecked variant.
```exercise
discriminated-union
```

```exercise
type-guard
```

```exercise
unknown-not-any
```


```check
narrowing
```

---

## 4. Literal types and `as const`

By default TS **widens** literals: `const arr = ["a", "b"]` is `string[]`, losing the exact values. `as const`
freezes a value to its narrowest, `readonly` form:

```ts
const STATUSES = ["todo", "doing", "done"] as const;
// type: readonly ["todo", "doing", "done"]

type Status = typeof STATUSES[number]; // "todo" | "doing" | "done"
```

`typeof STATUSES` lifts the *value* into a *type*; indexing with `[number]` gives the union of its elements. Now
the array is your single source of truth — add an element and `Status` updates automatically. This is the
type-safe replacement for a string enum, and you can still iterate `STATUSES` at runtime.

**The bug it prevents.** A hand-written `type Status = "todo" | "doing"` that silently drifts out of sync the day
someone edits the array.
```exercise
as-const
```


---

## 5. Generics — types with a hole

A generic is a type parameter the *caller* fills in, linking inputs to outputs:

```ts
function firstOr<T>(items: T[], fallback: T): T {
  return items.length > 0 ? items[0] : fallback;
}
firstOr([1, 2], 0);       // T = number → returns number
firstOr(["a"], "");       // T = string → returns string
```

One implementation, full type safety, no `any`. The two non-generic alternatives are both bad: `any` throws
safety away, and copy-pasting per type duplicates forever.

**Constraints** restrict what `T` can be with `extends`:

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

`K extends keyof T` says "K must be a real key of T", so `getProp(user, "emial")` won't compile; `T[K]` (indexed
access) returns that property's exact type. Constraints can also require a *shape*: `T extends { length: number }`
accepts anything with a numeric `length` (strings, arrays…) while preserving the specific type.

**The bug it prevents.** Losing type information through a helper (`any` in, `any` out), and passing a key that
doesn't exist.
```exercise
generic-function
```


```check
literals
```

---

## 6. The type-level toolbox: `keyof`, `typeof`, indexed access

These three operators build types *from other types/values* so you never hand-maintain a derived type:

```ts
const config = { host: "localhost", port: 5432 };

type Config = typeof config;          // { host: string; port: number }
type ConfigKey = keyof typeof config; // "host" | "port"
type Port = Config["port"];           // number  (indexed access)
```

`typeof value` (in a type position) is the bridge from the value world to the type world; `keyof T` is the union
of a type's keys; `T["key"]` reads a property's type. Chain them and your types follow your values automatically.

**The bug it prevents.** A `type Keys = "host" | "port"` that goes stale the moment the object gains a field.

---

## 7. Utility types — transformations you get for free

TypeScript ships types that transform other types. The everyday five:

```ts
Partial<T>       // all fields optional
Required<T>      // all fields required
Readonly<T>      // all fields readonly
Pick<T, K>       // keep only keys K
Omit<T, K>       // drop keys K
Record<K, V>     // an object type with keys K, all valued V
```

Compose them for real gains:

```ts
interface User { id: number; name: string; email: string; }
type UserUpdate = Partial<Omit<User, "id">>; // every field but id, all optional
```

`Record` is especially useful for *exhaustive* maps: `Record<Status, string>` demands one entry per status, so
adding a status to the union lights up every incomplete map in red.

**The bug it prevents.** Re-declaring a slightly-different copy of an interface that drifts from the original —
derive it instead, and it can't drift.
```exercise
utility-types
```


---

## 8. Mapped and conditional types (the deep end)

**Mapped types** build a new object type by iterating another's keys — this is how the utilities above are
defined:

```ts
type Optional<T> = { [K in keyof T]?: T[K] };  // this IS Partial<T>
```

`[K in keyof T]` walks each key, `T[K]` is its value type, `?` makes it optional. Swap the modifier for
`-?` (remove optional), `readonly`, or `-readonly`.

**Conditional types** are a type-level `if`, with `infer` to *capture* a piece:

```ts
type ElementType<T> = T extends (infer U)[] ? U : never;
type A = ElementType<string[]>; // string
```

`T extends (infer U)[]` means "if T is an array, name its element type U and return it, else `never`". This is the
machinery behind `ReturnType` and `Awaited`:

```ts
type User = Awaited<ReturnType<typeof loadUser>>; // resolved shape of an async fn
```

**Template literal types** build string-literal types and distribute over unions:

```ts
type Lang = "en" | "fr";
type Key = `greeting.${Lang}`; // "greeting.en" | "greeting.fr"
```

**The bug it prevents.** Hand-writing and re-writing derived types every time a source type changes — mapped and
conditional types recompute them for you.

```check
toolbox
```

---

## 9. `satisfies` and function overloads

**`satisfies`** validates a value against a type *without replacing* its inferred type, so you keep its exact
shape:

```ts
const routes = { home: "/", profile: "/me" } satisfies Record<string, string>;
// validated as string→string, and the keys are kept: routes.home works, routes.homee is a compile error
```

Contrast: a plain annotation (`const routes: Record<string, string> = …`) validates but *widens* the object to
"any string key", so TypeScript forgets which keys exist and `routes.homee` type-checks (then is `undefined` at
runtime); no annotation keeps the keys but skips validation. `satisfies` gives you both.

One thing it does **not** do by itself: keep literal *values*. Here `routes.home` is `string`, not `"/"`, because
the constraint's `string` is what the property is checked against (self-quiz 5 shows why, and when it differs).
For literal values too, write `as const satisfies Record<string, string>`.

**Overloads** let one function advertise several precise signatures over a broader implementation:

```ts
function convert(x: string): number;
function convert(x: number): string;
function convert(x: string | number): string | number {
  return typeof x === "string" ? Number(x) : String(x);
}
```

Callers see only the two `;`-terminated signatures (so `convert("5")` is typed `number`); the third is the hidden
implementation. Use overloads when the return type genuinely depends on the argument type.

**The bug it prevents.** A config object that loses its literal keys to widening (no autocomplete, typos slip
through), and a function whose return type is a vague union when it could be exact.
```exercise
satisfies
```

```exercise
ts7022
```

```exercise
definite-assignment
```

```exercise
exact-optional
```


```check
satisfies
```

---

## Mastery checklist — you can…

- [ ] say what gets erased at runtime and what's checked at compile time
- [ ] narrow a union four ways (`typeof`, discriminant, `in`, type predicate) without a single `as`
- [ ] derive a union from an array with `as const` + `typeof STATUSES[number]`
- [ ] write a constrained generic (`<T, K extends keyof T>`) and explain `T[K]`
- [ ] compose `Partial`/`Pick`/`Omit`/`Record` instead of re-typing a shape
- [ ] read a mapped type and a conditional type with `infer`, and name the utility each builds
- [ ] choose between an annotation and `satisfies`, and say what widening you avoid

## Self-quiz

Answer each aloud before reading the answer under it.

1. **Why is `as` dangerous, and what should you use instead to convince the compiler a value is a `User`?**
   *Answer:* `as` is an **unchecked assertion** — it silences the compiler without inspecting the
   value, so a wrong assertion doesn't fail at the cast, it fails later and somewhere else. Use a
   **type predicate** that actually looks at the value
   (`function isUser(x: unknown): x is User { return typeof x === "object" && x !== null && "id" in x; }`),
   or parse with a schema (Zod) that validates at runtime *and* infers the type. The rule: `as`
   asserts, a predicate *proves*.

2. **What's the difference in the inferred type of `["a","b"]` vs `["a","b"] as const`?**
   *Answer:* `["a","b"]` infers **`string[]`** — a mutable array whose elements are widened to
   `string`. `["a","b"] as const` infers **`readonly ["a", "b"]`** — a readonly *tuple*, fixed
   length, with literal element types. That second form is what makes
   `typeof STATUSES[number]` produce a useful union instead of just `string`.

3. **Write `type Values<T> = …` that gives the union of an object type's value types.**
   *Answer:* `type Values<T> = T[keyof T];` — an indexed access with a union key distributes, so
   `Values<{a: string; b: number}>` is `string | number`. (`keyof T` gives the union of *keys*;
   indexing by that union gives the union of *values*.)

4. **What does `ReturnType<typeof f>` give when `f` is `async`, and how do you unwrap the Promise?**
   *Answer:* It gives **`Promise<X>`**, not `X` — because that genuinely *is* the declared return
   type of an async function. Unwrap it with the built-in `Awaited`:
   `type Result = Awaited<ReturnType<typeof f>>`. (`Awaited` recurses, so it also handles a
   `Promise<Promise<X>>`.)

5. **What are the types of `t.a` and `u.a` below, and why do they differ?**
   ```ts
   const t = { a: 1 } satisfies Record<string, number>;
   const u = { a: 1 } satisfies Record<string, 1 | 2>;
   ```
   *Answer:* `t.a` is **`number`**; `u.a` is **`1`**. `satisfies` checks the literal against the
   constraint while still letting the constraint act as a *contextual type*. In `t` the contextual
   type for the property is `number` — not a literal type — so `1` widens to `number` as usual. In
   `u` the contextual type is the literal union `1 | 2`, which keeps literal types alive, so the
   property stays `1`. The lesson: `satisfies` doesn't freeze literals by itself — the *constraint*
   decides. Reach for `as const satisfies …` when you want both the check and guaranteed literals.

> **Tip.** When an error message is long, read it *bottom-up*: the last line is usually the real mismatch, and
> the lines above are the trail that led there. Learning to read TS errors fluently is half of getting fast.
