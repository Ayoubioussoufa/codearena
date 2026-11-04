import type { Lesson } from "../types";

export const lesson0033: Lesson = {
  slug: "0033-traits-and-generics",
  number: 33,
  track: "rust",
  title: "Traits: one judge, many checkers",
  summary: "Define a Checker trait, implement three checkers, and choose between generics and dyn on purpose.",
  minutes: 80,
  status: "ready",
  builds: "A `Checker` trait with exact, token and float checkers, a generic wrapper, and a runtime factory",
  lab: { dir: "0033-traits-and-generics", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-language",
  warmup: [
    { lesson: "0011-di-from-scratch", question: 0 },
    { lesson: "0032-errors-as-values", question: 1 },
  ],
  words: ["trait", "trait bound", "monomorphization", "trait object", "default method", "vtable"],
  answers: [
    { id: "port", label: "Section 4: CodeArena's CODE_RUNNER port, written as a Rust trait" },
    { id: "challenge", label: "Challenge: checker_for as an enum, and the trade-off (optional)" },
  ],
  quiz: [
    {
      prompt: "What is a trait?",
      options: [
        "A base class whose fields other types inherit",
        "A set of methods any implementing type provides",
        "A macro that copies methods into every struct",
        "A runtime tag that records each value's type",
      ],
      correct: 1,
      why: "A trait declares behaviour, methods with signatures and optional default bodies, and any type can implement it, including types from other crates. There's no inheritance of fields: Rust composes data with structs and shares behaviour with traits. It's TypeScript's `interface`, checked nominally like Java's.",
    },
    {
      prompt: "`count_passed<C: Checker>` is called with `Tokens` and with `Float`. What does the compiler build?",
      options: [
        "One copy, which looks up check in a table",
        "One copy that turns each checker into a Box",
        "One copy that matches on the checker's type name",
        "Two copies of the function, one for each type",
      ],
      correct: 3,
      why: "Generics are monomorphized: the compiler writes `count_passed::<Tokens>` and `count_passed::<Float>`, each calling its checker directly, so the optimizer can inline `check`. That's static dispatch: zero runtime cost, at the price of a bigger binary.",
    },
    {
      prompt: "Why does `checker_for(name)` return `Box<dyn Checker>` and not `impl Checker`?",
      options: [
        "impl Checker is slower, since it allocates on the heap",
        "Its arms return different types, and impl means one type",
        "dyn is required whenever any function returns a trait type",
        "impl Checker can't be used with structs that are empty",
      ],
      correct: 1,
      why: "`impl Trait` in return position means \"one concrete type, which I won't name\": every return path must produce the same type. `checker_for` returns `Exact` on one path and `Float` on another, chosen at runtime, so it needs a trait object: a pointer to the value plus a pointer to its type's method table (vtable).",
    },
    {
      prompt: "What does a default method in a trait give you?",
      options: [
        "A body every impl inherits, unless it writes its own",
        "A method the compiler calls when a value is created",
        "A fallback that runs when another method in it panics",
        "A method that's only visible inside the very same file",
      ],
      correct: 0,
      why: "`failures` has a body in the trait, written in terms of `check`. Every checker gets it for free, and any one of them can override it. Many standard traits work this way: implement `Iterator::next`, and you inherit `map`, `filter`, `sum` and dozens more.",
    },
    {
      prompt: "`fn show<T>(x: T) { println!(\"{x}\"); }` fails with E0277. Why?",
      options: [
        "T must first be a reference before it's printed",
        "println! only takes literals, not variables such as x",
        "Generic code may only use what T's bounds promise",
        "Every generic function needs a where clause after it",
      ],
      correct: 2,
      why: "Inside a generic function, the compiler checks the body once, against the bounds, not against each caller's type. `T` has no bounds, so nothing says it can be displayed. `fn show<T: Display>(x: T)` makes the promise, and every caller must keep it.",
    },
  ],
};
