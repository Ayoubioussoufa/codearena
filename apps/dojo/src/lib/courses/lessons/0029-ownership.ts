import type { Lesson } from "../types";

export const lesson0029: Lesson = {
  slug: "0029-ownership",
  number: 29,
  track: "rust",
  title: "Ownership: who frees the memory",
  summary: "Say at every line who owns a value, and fix moves without reaching for clone.",
  minutes: 80,
  status: "ready",
  builds: "Five ownership errors fixed with zero clones, and `split_words`, minishell's lexer in Rust",
  lab: { dir: "0029-ownership", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-language",
  warmup: [
    { lesson: "0028-cargo-and-the-compiler", question: 1 },
    { lesson: "0028-cargo-and-the-compiler", question: 2 },
  ],
  words: ["owner", "move", "Copy", "clone", "drop", "the heap"],
  answers: [
    { id: "minishell", label: "Section 4: the minishell bug that ownership makes impossible" },
    { id: "challenge", label: "Challenge: what std::mem::take does, in your words (optional)" },
  ],
  quiz: [
    {
      prompt: "A `String` goes out of scope at the closing brace. What happens to its heap buffer?",
      options: [
        "A garbage collector frees it at some later point",
        "It leaks, unless you call free on it yourself",
        "It's freed right there, once, by its owner's drop",
        "It's freed only when the whole program finally exits",
      ],
      correct: 2,
      why: "Each value has exactly one owner, and when the owner goes out of scope the value is dropped: Rust inserts the free at that closing brace. No garbage collector, no manual `free`, and since there's one owner, no double free.",
    },
    {
      prompt: "After `let b = a;`, an `i32` named `a` is still usable but a `String` named `a` isn't. Why?",
      options: [
        "A String moves: one heap buffer can have only one owner",
        "The String was dropped early, to save memory on the heap",
        "A String is always immutable, so it can't be bound twice",
        "Integers live in CPU registers, so the compiler can't track them",
      ],
      correct: 0,
      why: "An `i32` is `Copy`: assigning duplicates the bits, and each copy is independent. A `String` is a pointer, a length and a capacity pointing at a heap buffer. Copying those would give one buffer two owners, both freeing it: C's double free. So Rust moves it instead, and the old name becomes unusable.",
    },
    {
      prompt: "`for w in words { … }` compiles, then `words.len()` on the next line doesn't. What's the smallest fix?",
      options: [
        "Clone the whole vector right before the loop starts",
        "Loop over &words, so the loop only borrows it",
        "First save words.len() in a variable of its own",
        "Collect the words into a brand new vector after",
      ],
      correct: 1,
      why: "`for w in words` calls `into_iter()`, which consumes the Vec and moves each String into `w`. `for w in &words` iterates over references: nothing moves, and the Vec is intact afterwards. Saving `len()` first would also compile, but it hides the move instead of removing it.",
    },
    {
      prompt: "A function builds a local `String`, then returns a `&str` slice of it. What does rustc do?",
      options: [
        "It compiles; the slice stays valid until the next call",
        "It compiles, but the program crashes on the first read",
        "It quietly extends the String's life to match the slice",
        "It refuses it: E0515, a reference to a local variable",
      ],
      correct: 3,
      why: "The String is dropped when the function returns, so the slice would point at freed memory: C's \"return a pointer to a stack buffer\". Rust refuses at compile time (E0515). Return the `String` itself, or slice the input you were given, which outlives the call.",
    },
    {
      prompt: "The compiler suggests `.clone()` to fix a move. When is that the right fix?",
      options: [
        "Whenever the borrow checker refuses a line of code",
        "Never, because clone is now deprecated in modern Rust",
        "When you need a second, independent owner of it",
        "Always, since a clone of a String costs nothing",
      ],
      correct: 2,
      why: "`clone()` allocates and copies, so it's right when you really need two independent values, such as a copy kept after the original is sent to another thread. When a function only needs to read, change it to borrow (`&str`, `&[T]`, `&Vec<T>`) instead: same result, no copy. The compiler lists clone because it always works, not because it's best.",
    },
  ],
};
