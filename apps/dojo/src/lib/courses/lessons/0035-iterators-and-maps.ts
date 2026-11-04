import type { Lesson } from "../types";

export const lesson0035: Lesson = {
  slug: "0035-iterators-and-maps",
  number: 35,
  track: "rust",
  title: "Iterators, closures and HashMap: the standings",
  summary: "Compute contest standings with iterator chains, the entry API and multi-key sorts.",
  minutes: 75,
  status: "ready",
  builds: "ICPC standings from raw submissions: penalties, first blood and acceptance rates, in iterator chains",
  lab: { dir: "0035-iterators-and-maps", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-language",
  warmup: [
    { lesson: "0018-leaderboard", question: 0 },
    { lesson: "0034-lifetimes", question: 4 },
  ],
  words: ["iterator adaptor", "lazy evaluation", "consumer", "closure", "entry API", "BTreeMap"],
  answers: [
    { id: "redis", label: "Section 4: lesson 18's sorted set versus this sort, for a live contest" },
    { id: "challenge", label: "Challenge: frozen standings for the last hour (optional)" },
  ],
  quiz: [
    {
      prompt: "`let it = subs.iter().filter(|s| s.accepted).map(|s| s.minute);` What has run after this line?",
      options: [
        "Nothing yet, as adaptors wait for a consumer to pull",
        "The filter has run; the map runs when it's used",
        "Both have run, with the results in a hidden Vec",
        "Both have run, but only on the first ten elements",
      ],
      correct: 0,
      why: "Iterator adaptors are lazy: `filter` and `map` only build a description of the work. A consumer such as `sum`, `count`, `collect` or a `for` loop pulls values through the whole chain, one at a time, with no intermediate collections. The compiler even warns if you build a chain and never consume it.",
    },
    {
      prompt: "What does `teams.entry(name).or_default()` do?",
      options: [
        "It replaces the value for that name with a default",
        "It returns a copy of the value, or a default",
        "It panics if the name isn't in the map already",
        "It finds or inserts the value for name, returning it",
      ],
      correct: 3,
      why: "The entry API does \"find, or insert then find\" with one hash lookup, and returns a `&mut` to the value, so you can update it in place: `*counts.entry(word).or_insert(0) += 1`. It replaces the get-then-insert dance that would hash the key twice.",
    },
    {
      prompt: "A function takes a closure that increments a captured counter each call. Which bound must it use?",
      options: [
        "F: Fn(), since the closure is called many times",
        "F: FnMut(), since the closure changes what it captured",
        "F: FnOnce(), since the counter belongs to the closure",
        "No bound: closures can be called without a trait",
      ],
      correct: 1,
      why: "A closure that mutates what it captured implements `FnMut` (not `Fn`), so the function must accept `FnMut` and hold it as `mut`. `Fn` is for closures that only read; `FnOnce` for ones that consume a capture and can run only once. Each is a subset of the next: every `Fn` is also `FnMut` and `FnOnce`.",
    },
    {
      prompt: "You print standings by iterating over a `HashMap<&str, Row>`. Why do teams appear in a different order on each run?",
      options: [
        "HashMap sorts by hash, and hashes change on each insert",
        "The order is unspecified, and the hasher is seeded randomly",
        "The order follows the memory addresses, which shift between runs",
        "HashMap stores keys in insertion order, reversed on each read",
      ],
      correct: 1,
      why: "Rust's `HashMap` uses a randomly seeded hasher (`RandomState`) to resist hash-flooding attacks, so its iteration order is arbitrary and changes between runs. For output people read, sort explicitly, as the lab does, or use a `BTreeMap`, which keeps keys sorted.",
    },
    {
      prompt: "Is `v.iter().filter(…).map(…).sum()` slower than the same `for` loop written by hand?",
      options: [
        "Yes: each adaptor allocates a buffer for its results",
        "Yes: every closure call goes through a function pointer",
        "No: iterators skip bounds checks, so they're always faster",
        "No: it compiles to the same tight machine-code loop",
      ],
      correct: 3,
      why: "Iterators are a zero-cost abstraction: each adaptor is a generic struct, closures are inlined, and the optimizer turns the chain into a plain loop. The Book's benchmark (§13.4) measured 19.23 ms for the iterator version and 19.62 ms for the loop: \"similar performance\". \"Always faster\" overclaims: it's the same machine code, give or take.",
    },
  ],
};
