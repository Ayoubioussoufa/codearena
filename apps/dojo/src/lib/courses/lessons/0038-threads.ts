import type { Lesson } from "../types";

export const lesson0038: Lesson = {
  slug: "0038-threads",
  number: 38,
  track: "rust",
  title: "Threads without data races",
  summary:
    "Judge test cases in parallel with scoped threads and channels, and know why Send and Sync make it safe.",
  minutes: 85,
  status: "ready",
  builds: "Parallel judging two ways, scoped threads and a channel-fed worker pool, never over the worker limit",
  lab: { dir: "0038-threads", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-systems",
  warmup: [
    { lesson: "0030-borrowing", question: 0 },
    { lesson: "0035-iterators-and-maps", question: 2 },
  ],
  words: ["data race", "scoped thread", "Send", "Sync", "Arc", "Mutex"],
  answers: [
    { id: "worker", label: "Section 4: how many judging threads CodeArena's worker should run, and why" },
    { id: "challenge", label: "Challenge: the deadlock Rust doesn't prevent (optional)" },
  ],
  quiz: [
    {
      prompt: "Two threads both do `total += 1` on the same variable. Why is that a compile error in Rust?",
      options: [
        "Integers can't be written from more than one thread",
        "Each thread needs &mut total, and two can't coexist",
        "Rust forbids sharing a variable between any two threads",
        "The compiler can't prove the additions are in order",
      ],
      correct: 1,
      why: "The borrowing rule from lesson 30, one writer or many readers, holds across threads too. Two closures that both mutate `total` each need `&mut total` at once, which is E0499. That rule is exactly the definition of a data race, so data races can't compile. Return partial sums, or use an atomic or a `Mutex`.",
    },
    {
      prompt: "Why can a thread from `thread::scope` borrow local data, when one from `thread::spawn` can't?",
      options: [
        "The scope joins every thread before it returns",
        "Scoped threads copy the data they're given first",
        "spawn uses another core; scope uses the same",
        "Borrowing works only when there are two threads",
      ],
      correct: 0,
      why: "A `thread::spawn` thread might outlive the function, and even `main`, so its closure must be `'static`: own everything (`move`) or share it through `Arc`. `thread::scope` waits for all its threads before returning, so the compiler knows the borrowed data outlives them (stable since Rust 1.63).",
    },
    {
      prompt: "`Rc::new(config)` moved into `thread::spawn` fails with E0277. Why does `Arc` work?",
      options: [
        "Arc copies the value into each thread that it reaches",
        "Arc locks the value, so only one thread reads it",
        "Rc lives on the stack, and threads can't share stacks",
        "Rc's count isn't atomic, so two threads could corrupt it",
      ],
      correct: 3,
      why: "Both count their owners, and free the value when the count reaches zero. `Rc` updates its count with plain arithmetic, so two threads cloning at once could lose an update and free too early: it isn't `Send`. `Arc` uses atomic instructions, which costs a little more and is safe across threads.",
    },
    {
      prompt: "What do the marker traits `Send` and `Sync` mean?",
      options: [
        "Send: may be sent by channel; Sync: may be locked",
        "Send: can cross threads; Sync: a &T can be shared",
        "Send: lives on the heap; Sync: lives on the stack",
        "Send: the type is Clone; Sync: the type is Copy",
      ],
      correct: 1,
      why: "A `Send` type can be moved to another thread; a `Sync` type can be shared (`&T` is `Send`). The compiler derives both automatically from a type's fields, which is why `Rc`, `RefCell` and raw pointers poison any struct that contains them. `thread::spawn` requires `Send`; sharing through `Arc` requires `Sync`.",
    },
    {
      prompt: "Rust's compiler rules out data races. Does it rule out deadlocks?",
      options: [
        "Yes: a Mutex can't be locked twice by any thread",
        "Yes: the borrow checker tracks the lock order as well",
        "No: threads can still each wait for the other's lock",
        "No, but deadlocks need unsafe code in order to happen",
      ],
      correct: 2,
      why: "Thread A holds lock 1 and waits for lock 2; thread B holds 2 and waits for 1. That's safe code, and it hangs forever. The Book (§16.3) warns that `Mutex` carries this risk. Rust guarantees memory safety, not progress: lock in a fixed order, or prefer channels.",
    },
  ],
};
