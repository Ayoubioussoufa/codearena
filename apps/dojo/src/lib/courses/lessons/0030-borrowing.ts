import type { Lesson } from "../types";

export const lesson0030: Lesson = {
  slug: "0030-borrowing",
  number: 30,
  track: "rust",
  title: "Borrowing: many readers or one writer",
  summary:
    "Lend data with & and &mut, return slices into it, and port the judge's output comparator with zero copies.",
  minutes: 80,
  status: "ready",
  builds: "Lesson 9's token comparator in Rust: every token a slice of the program's output, nothing copied",
  lab: { dir: "0030-borrowing", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-language",
  warmup: [
    { lesson: "0029-ownership", question: 1 },
    { lesson: "0029-ownership", question: 3 },
  ],
  words: ["shared reference", "mutable reference", "slice", "dangling reference", "reallocation"],
  answers: [
    { id: "aliasing", label: "Section 3: a C bug the one-writer rule prevents" },
    { id: "challenge", label: "Challenge: why split_whitespace allocates nothing (optional)" },
  ],
  quiz: [
    {
      prompt: "Which borrows of one value can be alive at the same time?",
      options: [
        "One & and one &mut, inside the same function",
        "Two &mut borrows, if each of them is short-lived",
        "Any number of & borrows, or exactly one &mut",
        "Any borrows at all, as long as nothing moves",
      ],
      correct: 2,
      why: "The Book's rule (§4.2): at any time, either one mutable reference or any number of immutable ones. Many readers or one writer, never both. A reader can't see data change under it, and a writer can't be surprised by a second writer.",
    },
    {
      prompt: "`let first = &v[0]; v.push(4); println!(\"{first}\");` is refused. What's the danger it prevents?",
      options: [
        "push can move the buffer, so first may then dangle",
        "push could change v[0] to 4 before it gets printed",
        "first would print the length of v instead of v[0]",
        "Two threads might push to v at the same moment",
      ],
      correct: 0,
      why: "A Vec that's full reallocates on `push`: new buffer, elements copied, old buffer freed. `first` would point into freed memory. In C++ the same code compiles and corrupts memory (iterator invalidation); Rust refuses it with E0502 because `first` is used after the push.",
    },
    {
      prompt: "A function only reads a string. Which parameter type serves every caller best?",
      options: [
        "`String`, so the function owns what it reads",
        "`&String`, since the caller usually has a String",
        "`&mut String`, in case it changes it later",
        "`&str`, as it takes Strings, literals and slices",
      ],
      correct: 3,
      why: "`&str` borrows any text: `&my_string`, a literal, or a slice of a bigger output. `&String` accepts strictly less and does no more (clippy flags it). Taking `String` forces callers to give up or copy their data for a read.",
    },
    {
      prompt: "`fn token(s: &str, n: usize) -> Option<&str>` returns a slice. Where do its bytes live?",
      options: [
        "In a new String, allocated when the token is found",
        "Inside s itself, so it stays valid while s does",
        "On token's stack, for as long as the function runs",
        "In a static buffer that's reused by every later call",
      ],
      correct: 1,
      why: "A slice is a pointer and a length into memory someone else owns. With one reference parameter, the compiler ties the result to it (lifetime elision, lesson 34): the slice can't outlive `s`, and nothing is copied.",
    },
    {
      prompt: "`let r = &mut x; *r += 1; println!(\"{x}\");` compiles, though `r` is still in scope. Why?",
      options: [
        "println! takes its own copy, so x isn't borrowed",
        "Borrows end at their last use, not the brace",
        "The compiler copies x into r, so they're unrelated",
        "Integers can be borrowed mutably and shared at once",
      ],
      correct: 1,
      why: "Since Rust 2018, borrows are \"non-lexical\": a borrow lasts until its last use. `r` is last used at `*r += 1`, so reading `x` afterwards doesn't overlap. Swap the last two lines and it fails with E0502.",
    },
  ],
};
