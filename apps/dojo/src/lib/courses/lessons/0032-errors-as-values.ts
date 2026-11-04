import type { Lesson } from "../types";

export const lesson0032: Lesson = {
  slug: "0032-errors-as-values",
  number: 32,
  track: "rust",
  title: "Errors as values: Result and ?",
  summary:
    "Parse a limits file into a typed struct, with errors that name the line and the reason, and no exceptions.",
  minutes: 75,
  status: "ready",
  builds: "A limits-file parser whose every failure is a typed value with a message, and zero unwraps",
  lab: { dir: "0032-errors-as-values", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-language",
  warmup: [
    { lesson: "0031-enums-and-match", question: 3 },
    { lesson: "0029-ownership", question: 4 },
  ],
  words: ["Result", "the ? operator", "panic", "From", "Display", "unwrap"],
  answers: [
    { id: "typescript", label: "Section 4: how CodeArena's TypeScript reports a bad config today" },
    { id: "challenge", label: "Challenge: the same errors with thiserror (optional)" },
  ],
  quiz: [
    {
      prompt: "How does a Rust function report a failure the caller can recover from, like a missing file?",
      options: [
        "It throws an exception that the caller may then catch",
        "It returns -1 and sets a global errno for details",
        "It returns a Result: Ok with the value, or Err",
        "It returns null, and it logs the reason to stderr",
      ],
      correct: 2,
      why: "`Result<T, E>` is an enum: `Ok(T)` or `Err(E)`. The failure is in the return type, so the caller can't ignore it by accident (`Result` is `#[must_use]`), and there's no hidden control flow. `panic!` exists too, for bugs, not for failures you expect.",
    },
    {
      prompt: "In `fn load(…) -> Result<Limits, LoadError>`, the line `let text = fs::read_to_string(p)?;` fails. What does `?` do?",
      options: [
        "It returns the Err, converted with From, from load",
        "It panics with the I/O error's message, then exits",
        "It retries the read, then panics if it fails",
        "It sets text to an empty String, carrying on",
      ],
      correct: 0,
      why: "On `Ok(v)`, `?` unwraps to `v`. On `Err(e)`, it returns `Err(From::from(e))` from the enclosing function, so an `io::Error` becomes a `LoadError` through your `From` impl. It's the early `return` you'd write by hand, in one character.",
    },
    {
      prompt: "`\" 7\".parse::<u8>()` returns an `Err`. Why?",
      options: [
        "u8 can't hold 7, since it only stores characters",
        "parse needs a radix argument for any number type",
        "parse doesn't trim: the space is an invalid digit",
        "Leading spaces mean octal, and 7 isn't valid there",
      ],
      correct: 2,
      why: "`parse` takes the string exactly as it is. A space, or the newline at the end of a line you just read, is an invalid digit. Trim first: `s.trim().parse::<u8>()`. The lab's lines go through `trim()` for that reason.",
    },
    {
      prompt: "When is `unwrap()` an acceptable choice?",
      options: [
        "Whenever the error is unlikely to occur in production",
        "In tests, or where failing can only mean bugs",
        "Always, since it runs faster than matching on Result",
        "Never: the 2024 edition has removed it from Result",
      ],
      correct: 1,
      why: "`unwrap` turns an `Err` into a panic. In a test, a panic is a failed test, which is what you want. In production code it's right only when failure would mean a bug, and then `expect(\"why this can't fail\")` documents the reasoning. Input from users, files or networks always fails eventually: return the error.",
    },
    {
      prompt: "Why does `load` return its own `LoadError` instead of just `ConfigError`?",
      options: [
        "Two kinds of failure need one type that holds both",
        "A ConfigError can't be returned by a public function, ever",
        "Rust needs a brand new error type for each function",
        "A LoadError is faster to build than a plain ConfigError",
      ],
      correct: 0,
      why: "Reading can fail (an `io::Error`) and parsing can fail (a `ConfigError`), but a function has one error type. An enum with a variant per cause holds both, and a `From` impl per variant lets `?` convert each one. Callers can still match on which it was.",
    },
  ],
};
