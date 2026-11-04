import type { Lesson } from "../types";

export const lesson0034: Lesson = {
  slug: "0034-lifetimes",
  number: 34,
  track: "rust",
  title: "Lifetimes: a scanner that copies nothing",
  summary: "Read lifetime annotations as promises, and build a zero-copy token iterator for contest input.",
  minutes: 85,
  status: "ready",
  builds: "A contest input scanner whose tokens are slices of the input: a million characters, zero allocations",
  lab: { dir: "0034-lifetimes", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-language",
  warmup: [
    { lesson: "0030-borrowing", question: 3 },
    { lesson: "0029-ownership", question: 3 },
  ],
  words: ["lifetime", "lifetime annotation", "lifetime elision", "'static", "zero-copy", "borrow checker"],
  answers: [
    { id: "contest", label: "Section 4: why contest input in Rust is usually read in one go" },
    { id: "challenge", label: "Challenge: a scanner over stdin, with the input read once (optional)" },
  ],
  quiz: [
    {
      prompt: "What does `'a` promise in `fn longest<'a>(a: &'a str, b: &'a str) -> &'a str`?",
      options: [
        "Both strings are copied into one memory region, a",
        "The result lives on for the program's whole run",
        "The result can't outlive either one of the inputs",
        "The call finishes before either of the strings drops",
      ],
      correct: 2,
      why: "A lifetime annotation names a relationship: the returned reference is valid only while both `a` and `b` are, so the compiler treats it as living as long as the shorter of the two. Callers are then checked against that promise: using the result after either input is dropped is E0597.",
    },
    {
      prompt: "Do lifetime annotations change how long a value lives?",
      options: [
        "Yes: 'a keeps both values alive until the result dies",
        "No: they name relations the compiler then checks for you",
        "Yes: annotated values move to the heap and last longer",
        "Only for 'static, which turns the value into a global",
      ],
      correct: 1,
      why: "Values live exactly as long as their owner's scope, annotations or not. Lifetimes only let the compiler check that no reference outlives what it points to, and let a signature say which input a result borrows from. They're erased before code generation and cost nothing at runtime.",
    },
    {
      prompt: "`fn word(&mut self) -> Option<&str>` makes `let a = sc.word(); let b = sc.word();` fail. Why?",
      options: [
        "word moves the scanner, so it can't be called twice",
        "The Option has to be unwrapped before the second call",
        "Two words can't come from the same string at once",
        "Elision ties each word to &mut self, keeping sc borrowed",
      ],
      correct: 3,
      why: "Elision rule 3: in a method with `&self` or `&mut self`, elided output lifetimes are `self`'s. So `a` borrows `sc` mutably for as long as `a` lives, and the second `word()` is a second mutable borrow: E0499. The truth is that the word borrows the input, so say it: `-> Option<&'a str>`.",
    },
    {
      prompt: "What is a `&'static str`?",
      options: [
        "A string that's stored in a static mutable global variable",
        "A reference valid for the whole program, like a literal",
        "A string that can never be compared to another String",
        "A reference that's copied each time it gets passed along",
      ],
      correct: 1,
      why: "`'static` means the data lives until the program ends. String literals are `&'static str`: their bytes are in the binary itself. It's also what `fn name() -> &'static str` promises, and why returning a slice of a local `String` there is refused.",
    },
    {
      prompt: "What does the `'a` in `struct Tokens<'a> { rest: &'a str }` mean?",
      options: [
        "A Tokens can't outlive the text that it points into",
        "A Tokens value owns its own copy of the text",
        "The text is freed at the moment the Tokens is",
        "Only one Tokens can exist for each piece of text",
      ],
      correct: 0,
      why: "A struct that holds a reference must say so, and its lifetime parameter ties every value of the struct to the data it borrows. The compiler then refuses any `Tokens` that would outlive its input. Nothing is copied: that's the zero-copy part.",
    },
  ],
};
