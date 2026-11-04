import type { Lesson } from "../types";

export const lesson0042: Lesson = {
  slug: "0042-parallel-and-shipped",
  number: 42,
  track: "rust",
  title: "Parallel, measured, shipped",
  summary: "Encode batches in parallel with rayon, pass clippy and fmt, and tell the Rust story in an interview.",
  minutes: 80,
  status: "ready",
  builds: "`fasttok` 0.2: parallel batch encoding with the GIL released, formatted, lint-free, and a two-minute story",
  lab: { dir: "0042-parallel-and-shipped", writes: ["src/lib.rs", "src/bpe.rs"], check: "bash check.sh" },
  reference: "rust-python",
  warmup: [
    { lesson: "0041-pyo3-extension", question: 4 },
    { lesson: "0039-async-tokio", question: 4 },
  ],
  words: ["data parallelism", "rayon", "work stealing", "clippy", "rustfmt", "release profile"],
  answers: [
    { id: "story", label: "Section 4: your two-minute Rust story, in STAR shape" },
    { id: "challenge", label: "Challenge: the GitHub Actions workflow for this crate (optional)" },
  ],
  quiz: [
    {
      prompt: "What does changing `iter()` to rayon's `par_iter()` do?",
      options: [
        "It runs the chain on a pool of threads, one per core",
        "It starts one new OS thread for each element of the input",
        "It makes the iterator lazy, so it runs only when it's needed",
        "It moves the computation over to the GPU when one is available",
      ],
      correct: 0,
      why: "rayon splits the work across a global thread pool, sized by default to the number of logical CPUs (`RAYON_NUM_THREADS` overrides it), and idle threads steal work from busy ones. The chain reads like the sequential one, and `collect` keeps the original order.",
    },
    {
      prompt: "The batch ran 5.5 times faster on 12 cores, not 12 times. Why?",
      options: [
        "rayon only ever uses half the cores it finds",
        "The GIL still serialized half of every batch run",
        "Uneven pieces and shared memory both cost real time",
        "Python measured the time with a very coarse clock",
      ],
      correct: 2,
      why: "Speedup is rarely linear: texts of different lengths finish at different times, threads share memory bandwidth and caches, and splitting and collecting the results costs something. Amdahl's law adds that any sequential part caps the total. Measure, don't multiply.",
    },
    {
      prompt: "Why does CI run `cargo clippy -- -D warnings` rather than plain `cargo clippy`?",
      options: [
        "Plain clippy only checks the files that have changed",
        "-D warnings makes every lint warning fail the build",
        "-D warnings downloads the newest set of lint rules",
        "Plain clippy can't run unless a terminal is attached",
      ],
      correct: 1,
      why: "`-D warnings` denies warnings: each lint becomes an error, so a warning can't be merged and ignored forever. With `cargo fmt --check` and `cargo test`, it's the standard trio a Rust CI runs on every pull request.",
    },
    {
      prompt: "Encoding a batch parallelizes easily. Why is BPE training much harder to parallelize?",
      options: [
        "Training uses memory that two threads can't both share",
        "Each merge depends on counts the last one left",
        "Training reads one file, and files can't be split",
        "rayon refuses any closure that changes a shared HashMap",
      ],
      correct: 1,
      why: "Encoding many texts is independent work. Training is a chain: merge n is chosen from the pair counts after merge n − 1, so the steps can't run side by side. Real trainers parallelize inside a step (the counting) and update counts incrementally instead of recounting.",
    },
    {
      prompt: "An interviewer asks: why did you use Rust there? Which answer is strongest?",
      options: [
        "Rust is AI's future language, so it was obvious",
        "Rust is always faster than Python, whatever the work",
        "The hot path, the measured gain, the cost paid",
        "Rust catches every bug at compile time, by design",
      ],
      correct: 2,
      why: "Name the hot path (tokenizing every request), the evidence (about 25 times faster than pure Python, 5.5× more in parallel), and the trade-off (a build step, a second language for the team, unsafe-free but harder to change quickly). Slogans invite the follow-up question you can't answer.",
    },
  ],
};
