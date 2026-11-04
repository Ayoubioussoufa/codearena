import type { Lesson } from "../types";

export const lesson0028: Lesson = {
  slug: "0028-cargo-and-the-compiler",
  number: 28,
  track: "rust",
  title: "Cargo, and a compiler that teaches",
  summary:
    "Install Rust, build and test with Cargo, and port lesson 1's wait-status decoder, reading each compiler error as advice.",
  minutes: 70,
  status: "ready",
  builds: "`status`, a Rust library that decodes wait statuses, with seven tests green",
  lab: { dir: "0028-cargo-and-the-compiler", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-language",
  warmup: [
    { lesson: "0001-run-a-program", question: 1 },
    { lesson: "0001-run-a-program", question: 3 },
  ],
  words: ["crate", "Cargo.toml", "immutable by default", "shadowing", "expression vs statement", "panic"],
  answers: [
    { id: "c-vs-rust", label: "Section 5: a bug from your C code that Rust would refuse" },
    { id: "challenge", label: "Challenge: wrapping, checked or saturating? (optional)" },
  ],
  quiz: [
    {
      prompt: "`x` is a `u8` read from input, and it's 255. In a debug build, `x + 1` runs. What happens?",
      options: [
        "The program panics with: attempt to add with overflow",
        "The sum wraps to 0, and the program continues",
        "The sum saturates at 255, and the program continues",
        "It's undefined behaviour, exactly the same as in C",
      ],
      correct: 0,
      why: "Debug builds check integer arithmetic and panic on overflow. Release builds wrap silently instead (255 + 1 becomes 0), and The Book calls relying on that an error. When you mean to wrap, say so with `wrapping_add`; `checked_add` and `saturating_add` cover the other intents. Signed overflow is never undefined behaviour in Rust, unlike C.",
    },
    {
      prompt: "`let x = 5; x = 6;` doesn't compile, but `let x = 5; let x = 6;` does. Why?",
      options: [
        "The second let declares a new variable that shadows x",
        "The second let reuses memory, so it counts as mutation",
        "Assignments only ever work on integers wider than 32 bits",
        "The compiler drops the first x because it's never read",
      ],
      correct: 0,
      why: "Bindings are immutable unless you write `mut` (error E0384, \"cannot assign twice to immutable variable\"). A second `let` doesn't change x: it declares a new x that hides the old one. Shadowing can even change the type (`let n = n.trim().parse::<i32>()?`), which `mut` can't.",
    },
    {
      prompt: "`fn double(n: i32) -> i32 { n * 2; }` fails with \"mismatched types\". What's wrong?",
      options: [
        "i32 can't be multiplied by a literal without a cast",
        "Functions must use return for any value they give back",
        "The semicolon makes a statement, so the body returns ()",
        "Parameter n is immutable, so n * 2 isn't allowed",
      ],
      correct: 2,
      why: "A block's value is its last expression, without a semicolon. `n * 2;` is a statement, so the body evaluates to `()`, the unit type, not an `i32`. The compiler even says \"remove this semicolon to return this value\". Read the help lines: they're often the fix.",
    },
    {
      prompt: "In C, `if (status & 0x7f == 0)` is a classic bug. What does the same condition mean in Rust?",
      options: [
        "It compares first, then masks: the same bug as C",
        "It won't compile, as Rust wants the parentheses in it",
        "A type error: i32 values can't be compared to 0",
        "It masks first, then compares: & binds tighter than ==",
      ],
      correct: 3,
      why: "C gave `==` higher precedence than `&` (a historical accident), so the C line tests `status & 0`, always false. Rust puts the bitwise operators above comparisons, so the line means what you meant. Even if it didn't, `0x7f == 0` is a `bool`, and `i32 & bool` would be a type error, not a silent bug.",
    },
    {
      prompt: "What does `cargo check` do that makes it the command to run while you edit?",
      options: [
        "It runs every test, skipping the slow integration ones",
        "It type-checks the code but skips producing a binary",
        "It formats the code and fixes warnings it finds",
        "It builds the release binary, without any debug symbols",
      ],
      correct: 1,
      why: "`cargo check` runs the compiler's analysis (types, borrows, lints) and stops before code generation, so it's much faster than `cargo build`. Your editor's rust-analyzer does the same continuously. `cargo test` builds and runs tests; `cargo fmt` formats; `cargo build --release` optimizes.",
    },
  ],
};
