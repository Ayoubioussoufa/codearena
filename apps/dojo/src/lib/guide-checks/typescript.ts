/**
 * Checks for the TypeScript guide (content/supplements/typescript.md). The
 * type claims were run through tsc on 3 Nov 2026 (satisfies keeps keys but
 * widens values against a `string` constraint; excess-property checks apply
 * to inline literals only), and the handbook's Narrowing page was read.
 */
import type { GuideCheckSet } from "./types";

export const typescriptChecks: GuideCheckSet = {
  name: "TypeScript guide",
  source: {
    label: "the TypeScript Handbook",
    href: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
    note: "Read Everyday Types, then [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), then the Type Manipulation chapters (Generics through Template Literal Types).",
  },
  terms: [
    "Type inference",
    "Structural typing",
    "Narrowing",
    "Discriminated union",
    "Generic constraint",
    "Utility type",
    "Conditional type",
    "satisfies",
  ],
  checks: [
    {
      id: "inference",
      section: "§0–2 · Inference and structural typing",
      questions: [
        {
          prompt: "Where should you write type annotations, and where can you let inference work?",
          options: [
            "On every variable, so nothing is ever inferred",
            "At the boundaries: parameters, returns and API data",
            "Only on classes, since functions infer their types",
            "Nowhere: annotations slow the compiler down a lot",
          ],
          correct: 1,
          why: "Inference handles locals (`const x = 5` needs nothing). Boundaries are contracts: parameters, data crossing an API, and return types when you want every branch verified. An annotated return type makes the compiler prove each path returns it.",
        },
        {
          prompt: "`dist(p: Point)` takes `{ x: number; y: number }`. You call `dist(thing)` where `const thing = { x: 1, y: 2, label: \"A\" }`. What happens?",
          options: [
            "It fails: the variable carries an extra label field",
            "It fails: thing was not declared as a Point",
            "It compiles, but the label is removed at runtime",
            "It compiles: its shape has both fields Point needs",
          ],
          correct: 3,
          why: "TypeScript compares shapes, not names: `thing` has `x` and `y`, so it fits, extra field and all. Only an object literal written inline at the call gets the stricter excess-property check, to catch typos. Nothing is removed at runtime: types are erased.",
        },
        {
          prompt: "You don't know a value's type yet. Why prefer `unknown` over `any`?",
          options: [
            "unknown makes you narrow before you use it",
            "unknown is faster for the compiler to check",
            "unknown also allows null, while any does not",
            "unknown is erased at runtime, unlike any types",
          ],
          correct: 0,
          why: "`any` switches the checker off for that value and spreads to everything it touches. `unknown` accepts anything too, but you can't use it until you've narrowed it (`typeof`, a type predicate, a schema), so the check moves to where it belongs.",
        },
      ],
      explain:
        "Explain structural typing with an example, and why passing an object literal directly is checked more strictly than passing the same object through a variable.",
    },
    {
      id: "narrowing",
      section: "§3 · Unions and narrowing",
      questions: [
        {
          prompt: "`type Result = { status: \"ok\"; value: number } | { status: \"error\"; message: string }`. What's the cleanest way to read the right field?",
          options: [
            "Cast it with as, then read whichever field",
            "Check each field with in, starting with value",
            "Switch on the status tag both variants share",
            "Use instanceof against each of the two shapes",
          ],
          correct: 2,
          why: "A discriminated union: a shared literal tag. Inside `if (r.status === \"ok\")` TypeScript knows `r` is the ok variant, so `r.value` compiles and `r.message` doesn't. `instanceof` needs classes; these are plain object shapes ([Handbook: narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)).",
        },
        {
          prompt: "Why is `as User` a poor way to \"fix\" a union?",
          options: [
            "It's slower, since casts are checked at runtime",
            "It silences the compiler, checking nothing at all",
            "It only works on classes, not plain objects",
            "It makes the value readonly for the scope",
          ],
          correct: 1,
          why: "`as` is an unchecked assertion: it changes what the compiler believes without inspecting the value, so a wrong cast fails later, somewhere else. A type predicate (`x is User`) or a runtime schema actually looks at the value: `as` asserts, a predicate proves.",
        },
      ],
      explain:
        "Name four ways to narrow a union without `as`, with a one-line example of each.",
    },
    {
      id: "literals",
      section: "§4–5 · Literal types and generics",
      questions: [
        {
          prompt: "`const STATUSES = [\"todo\", \"doing\", \"done\"] as const; type Status = typeof STATUSES[number];` What is `Status`?",
          options: [
            "string, since arrays widen all of their elements",
            "string[], the type of the whole STATUSES array",
            "never, because as const freezes the array completely",
            "\"todo\" | \"doing\" | \"done\": the three literals",
          ],
          correct: 3,
          why: "`as const` keeps the narrowest type: a readonly tuple of literals. `typeof` lifts the value into a type, and indexing with `[number]` gives the union of its elements. Add a status to the array and the type follows: one source of truth.",
        },
        {
          prompt: "`function getProp<T, K extends keyof T>(obj: T, key: K): T[K]`. What does `getProp(user, \"emial\")` give?",
          options: [
            "A compile error: emial isn't a key of User",
            "undefined at runtime, with no compile error at all",
            "A string, since every key returns a string value",
            "A throw at runtime, raised by the keyof check",
          ],
          correct: 0,
          why: "`K extends keyof T` constrains the key to real keys of `T`, so the typo is caught at compile time. And `T[K]` returns that property's exact type, so `getProp(user, \"id\")` is a `number`, not `any`. Types exist only at compile time: nothing is checked at runtime.",
        },
      ],
      explain:
        "Explain what a generic is, why `any` and copy-paste are both worse, and what `K extends keyof T` and `T[K]` buy you.",
    },
    {
      id: "toolbox",
      section: "§6–8 · The type-level toolbox",
      questions: [
        {
          prompt: "With `interface User { id: number; name: string; email: string }`, what does `Partial<Omit<User, \"id\">>` describe?",
          options: [
            "Every field of User, each required and readonly",
            "Only the id field, made optional for updates",
            "Every field except id, and each one optional",
            "Every field including id, with id made optional",
          ],
          correct: 2,
          why: "`Omit<User, \"id\">` drops `id`; `Partial` makes the rest optional: the shape of an update body. Deriving it means it can't drift from `User`, unlike a hand-copied interface.",
        },
        {
          prompt: "`loadUser` is `async`. What is `ReturnType<typeof loadUser>`?",
          options: [
            "User, since ReturnType unwraps the promise for you",
            "Promise<User>: wrap it in Awaited to unwrap it",
            "any, because async functions lose all their types",
            "void, since async functions never return a value",
          ],
          correct: 1,
          why: "An async function's declared return type really is a `Promise`, so `ReturnType` gives `Promise<User>`. `Awaited<ReturnType<typeof loadUser>>` unwraps it (recursively, so nested promises too).",
        },
        {
          prompt: "Why type a label map as `Record<Status, string>` instead of a plain object?",
          options: [
            "Lookups are faster than on a plain object",
            "It makes every label optional for new statuses",
            "It freezes the map into a readonly object",
            "Adding a status flags every map missing it",
          ],
          correct: 3,
          why: "`Record<Status, string>` demands one entry per member of the union. Add `\"archived\"` to `Status` and every incomplete map lights up red: the compiler finds every place you forgot.",
        },
      ],
      explain:
        "Read `type ElementType<T> = T extends (infer U)[] ? U : never` aloud, then say which built-in utility types are built the same way.",
    },
    {
      id: "satisfies",
      section: "§9 · satisfies and overloads",
      questions: [
        {
          prompt: "`const routes = { home: \"/\", profile: \"/me\" } satisfies Record<string, string>;` What do you get for `routes.homee`?",
          options: [
            "A compile error: satisfies kept the exact keys",
            "string: every key of a Record is allowed",
            "undefined, since the key isn't in the object",
            "\"/\": the literal value of home is reused",
          ],
          correct: 0,
          why: "`satisfies` checks the object against the type without replacing its inferred type, so TypeScript still knows exactly which keys exist. With the annotation `const routes: Record<string, string>`, any string key type-checks and `routes.homee` is `undefined` at runtime.",
        },
        {
          prompt: "`const t = { a: 1 } satisfies Record<string, number>;` What is the type of `t.a`?",
          options: [
            "1, because satisfies always keeps literal types",
            "1, since numeric literals never get widened",
            "number, because the constraint's number widens it",
            "unknown, because Record values are never inferred",
          ],
          correct: 2,
          why: "The constraint acts as a contextual type: against `number`, the literal `1` widens as usual. Against `1 | 2` it would stay `1`. `satisfies` alone doesn't freeze literals; write `as const satisfies …` when you want the check and the literals.",
        },
      ],
      explain:
        "When do you use an annotation, `satisfies`, or `as const satisfies`? Give a CodeArena config object for each case.",
    },
  ],
};
