import type { Lesson } from "../types";

export const lesson0031: Lesson = {
  slug: "0031-enums-and-match",
  number: 31,
  track: "rust",
  title: "Enums and match: a verdict the compiler checks",
  summary: "Model verdicts as an enum that carries data, and let exhaustive match catch the case you forgot.",
  minutes: 75,
  status: "ready",
  builds: "Lesson 9's judge as Rust types: `judge_test`, `judge`, and verdicts that describe themselves",
  lab: { dir: "0031-enums-and-match", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-language",
  warmup: [
    { lesson: "0009-facts-to-verdicts", question: 1 },
    { lesson: "0030-borrowing", question: 3 },
  ],
  words: ["enum", "variant", "pattern", "exhaustive match", "Option", "match guard"],
  answers: [
    { id: "union", label: "Section 3: a TypeScript union you'd write as a Rust enum" },
    { id: "challenge", label: "Challenge: the types that make Failed { Passed } impossible (optional)" },
  ],
  quiz: [
    {
      prompt: "What can a Rust `enum` do that a C `enum` can't?",
      options: [
        "Each variant carries its own data, read back with match",
        "Its variants are strings, so they print without any effort",
        "Its values can be any integer the program picks later",
        "It's a class underneath, so each variant has its methods",
      ],
      correct: 0,
      why: "A C enum is a named integer. A Rust enum is a tagged union: `WrongAnswer { token: usize }` and `RuntimeError(Ending)` hold different data, and `match` is the only way in, so you can't read a token from a TLE. TypeScript's discriminated unions are the closest cousin.",
    },
    {
      prompt: "You add a `CompileError` variant to `TestVerdict`. What happens to each `match` on it without a `_` arm?",
      options: [
        "It keeps compiling, and CompileError falls to the last arm",
        "It panics at runtime the first time CompileError shows up",
        "It stops compiling, with E0004, until it handles the variant",
        "It compiles with a warning, treating the variant as Passed",
      ],
      correct: 2,
      why: "Matches must be exhaustive, so every `match` that doesn't cover the new variant is an E0004 error, listed one by one. The compiler hands you the to-do list. A `_` arm opts out of that, which is why it deserves suspicion on enums you own.",
    },
    {
      prompt: "A `match` has several arms, some with guards (`_ if facts.oom_killed`). Which arm runs?",
      options: [
        "The most specific arm that fits, wherever it sits",
        "The last arm that fits, overriding the earlier ones",
        "Every arm that fits, run one after the other",
        "The first arm whose pattern and guard both fit",
      ],
      correct: 3,
      why: "Arms are tried top to bottom, and the first one whose pattern matches and whose guard is true wins. So the order of arms is lesson 9's order of checks: TimedOut first, then the OOM guard, then the cap, then the ending.",
    },
    {
      prompt: "What does `Option<T>` replace?",
      options: [
        "Exceptions: an Option carries a message for each failed call",
        "null: absence is a variant the compiler makes you handle",
        "Defaults: Option fills in zero when a value is missing",
        "Pointers: Option is how Rust stores data on the heap",
      ],
      correct: 1,
      why: "Rust has no null. A value that may be missing is an `Option<T>`: `Some(value)` or `None`, and you can't use the value without handling `None` (with `match`, `if let`, `?`, or an explicit `unwrap` that says \"crash if absent\"). Errors with a reason are `Result`, next lesson.",
    },
    {
      prompt: "The lab's types allow `Verdict::Failed { test: 2, why: TestVerdict::Passed }`. What's the best fix?",
      options: [
        "Add a check inside describe that panics on it",
        "Write a comment saying that case can never happen",
        "Give Failed its own enum, which has no Passed",
        "Make describe return an Option, None for that case",
      ],
      correct: 2,
      why: "\"Make illegal states unrepresentable\" (Yaron Minsky): if the type can't hold the nonsense, no code has to check for it, and no `match` needs an arm for it. A failure reason without `Passed`, and a runtime error that can't be `TimedOut`, delete two impossible arms from your solution. That's the challenge.",
    },
  ],
};
