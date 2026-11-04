import type { Lesson } from "../types";

export const lesson0037: Lesson = {
  slug: "0037-files-and-io",
  number: 37,
  track: "rust",
  title: "Files and I/O: a judge in one binary",
  summary: "Walk a tests folder, feed each input, cap the output and print a verdict per test.",
  minutes: 85,
  status: "ready",
  builds: "`minijudge`, a command-line judge for a folder of tests: numeric order, output cap, no hangs",
  lab: { dir: "0037-files-and-io", writes: ["src/main.rs"], check: "bash check.sh" },
  reference: "rust-systems",
  warmup: [
    { lesson: "0003-input-output", question: 1 },
    { lesson: "0036-processes-in-rust", question: 3 },
  ],
  words: ["Path and PathBuf", "BufReader", "BufWriter", "Stdio::piped", "end of file (EOF)", "SIGPIPE"],
  answers: [
    { id: "tool", label: "Section 4: when you'd use minijudge on your own contest problems" },
    { id: "challenge", label: "Challenge: a time limit per test, from lesson 36 (optional)" },
  ],
  quiz: [
    {
      prompt: "Why does `minijudge` parse `N` from each file name and sort numbers, instead of sorting the names?",
      options: [
        "Parsing is faster than comparing two strings",
        "read_dir already sorts the names, but backwards",
        "As plain strings, \"10.in\" sorts before \"2.in\"",
        "Names can't be compared when they're paths",
      ],
      correct: 2,
      why: "Strings compare character by character, and `'1' < '2'`, so test 10 would run before test 2. Also, `read_dir` returns entries in an order that depends on the filesystem, so there's no order to rely on at all. Parse, then sort numbers.",
    },
    {
      prompt: "A program floods stdout. You read 64 KiB from its pipe, then call `child.wait()` while still holding the pipe open. What happens?",
      options: [
        "wait returns at once, since the cap was reached",
        "Both block forever: it's stuck on a full pipe",
        "The kernel silently discards the extra output for you",
        "wait kills the program after a short built-in timeout",
      ],
      correct: 1,
      why: "A Linux pipe holds 64 KiB by default (`pipe(7)`). Once it's full, the writer blocks until someone reads, and you're blocked in `wait`: lesson 3's deadlock. Kill the program over the cap before waiting. (Dropping the pipe also works, but only when it next writes: SIGPIPE ends it then.)",
    },
    {
      prompt: "Why wrap stdout in a `BufWriter` when printing many lines?",
      options: [
        "stdout is line-buffered, so each line is a syscall",
        "println! drops some lines when it's called too often",
        "A BufWriter compresses its output before writing it out",
        "stdout can only be written to from a BufWriter",
      ],
      correct: 0,
      why: "Rust's stdout is line-buffered, even into a pipe, and `println!` locks it on every call. Measured: 1,000 `println!`s into a pipe made 1,000 `write` system calls; through `BufWriter::new(io::stdout().lock())` they made 2. It's the standard fast-output trick in competitive Rust.",
    },
    {
      prompt: "You `writeln!` results into a `BufWriter`, then call `std::process::exit(0)` without flushing. What gets printed?",
      options: [
        "Everything: exit flushes every open buffer first",
        "Everything except the final line, which vanishes",
        "Maybe nothing: exit skips all the destructors",
        "An error message about the unflushed buffer",
      ],
      correct: 2,
      why: "`process::exit` ends the process at once, and its docs say no destructors run, so the `BufWriter`'s drop, which would flush, never happens. Flush explicitly, or return from `main` normally so destructors run first.",
    },
    {
      prompt: "`.stdin(Stdio::from(File::open(\"3.in\")?))`: what does the child see?",
      options: [
        "The path \"3.in\" as its very first command-line argument",
        "The file's bytes on its stdin, followed by end-of-file",
        "An empty stdin, until your process writes to it",
        "The file's bytes, but only after it calls open",
      ],
      correct: 1,
      why: "The child's stdin is the file itself: it reads the bytes directly, without your process copying anything, and gets end-of-file when they run out. That EOF is what ends a `while (scanf(…) == 1)` loop in the test programs.",
    },
  ],
};
