import type { Lesson } from "../types";

export const lesson0036: Lesson = {
  slug: "0036-processes-in-rust",
  number: 36,
  track: "rust",
  title: "`run`, rewritten in Rust",
  summary: "Start, time and kill a process group with std::process, and see what unsafe really means.",
  minutes: 90,
  status: "ready",
  builds: "`run -t` in Rust, passing lesson 2's own checker: exit, signal, timeout, and no survivors in the group",
  lab: { dir: "0036-processes-in-rust", writes: ["src/main.rs"], check: "bash check.sh" },
  reference: "rust-systems",
  warmup: [
    { lesson: "0002-time-limits", question: 3 },
    { lesson: "0002-time-limits", question: 1 },
  ],
  words: ["std::process::Command", "Child", "ExitStatus", "unsafe block", "FFI", "SAFETY comment"],
  answers: [
    { id: "compare", label: "Section 4: your run.c next to run in Rust, bug by bug" },
    { id: "challenge", label: "Challenge: no polling, with a waiting thread (optional)" },
  ],
  quiz: [
    {
      prompt: "What does `.process_group(0)` do to a `Command`?",
      options: [
        "The child leads a new group, as setpgid(0, 0) does",
        "The child joins the same process group as the parent",
        "The child moves into the group whose ID is 0",
        "The child has all its signals blocked until it execs",
      ],
      correct: 0,
      why: "`CommandExt::process_group` sets the child's process group before it execs; with 0, the group's ID is the child's own PID, exactly `setpgid(0, 0)`. Everything the program starts inherits that group, so one `kill(-pgid, …)` reaches them all.",
    },
    {
      prompt: "Everything else in `run` is safe std code. Why does the kill need an `unsafe` block?",
      options: [
        "SIGKILL is dangerous, so Rust makes every kill unsafe",
        "Child::kill hits one process; a group needs libc's kill",
        "Process groups exist only in C, beyond Rust's reach",
        "A negative PID would overflow inside Rust's own types",
      ],
      correct: 1,
      why: "`Child::kill` sends SIGKILL to the child alone, and the grandchildren survive, as in lesson 2. Signalling a group needs `kill(2)` with a negative PID, which std doesn't wrap, so you call the `libc` crate's binding. Every foreign function is `unsafe` to call: the compiler can't see inside it.",
    },
    {
      prompt: "What does an `unsafe` block switch off?",
      options: [
        "The borrow checker, for every single line inside the block",
        "Bounds checks on every slice and index in the block",
        "Nothing: it allows a few extra operations you vouch for",
        "Type checking, so any value can be cast to anything",
      ],
      correct: 2,
      why: "The Book (§20.1) is explicit: `unsafe` doesn't turn off the borrow checker or any other check. It allows a handful of extra operations (dereference a raw pointer, call an unsafe or foreign function, use a mutable static, implement an unsafe trait, access a union field), and you promise they're sound. A `// SAFETY:` comment says why.",
    },
    {
      prompt: "On Unix, `status.code()` returns `None`. What happened to the program?",
      options: [
        "It's still running, so there's no exit code yet",
        "It returned zero, which Rust always reports as None",
        "It was killed by a signal, named by status.signal()",
        "The exit code was bigger than any i32 holds",
      ],
      correct: 2,
      why: "A process either exits with a code or is killed by a signal. When a signal killed it, there's no exit code, so `code()` is `None` and `ExitStatusExt::signal()` gives the number. A program still running has no `ExitStatus` at all: `try_wait` returns `Ok(None)`.",
    },
    {
      prompt: "In C, a failed `execvp` happens in the child, which exits 127. What does `Command::spawn` do instead?",
      options: [
        "It returns the child, which then exits with code 127",
        "It reports the failed exec to the parent as Err",
        "It panics in the child, with the OS error message",
        "It retries the exec with each directory listed in PATH",
      ],
      correct: 1,
      why: "std reports a failed exec back to the parent, so `spawn` returns `Err` (NotFound, PermissionDenied…) and you never get a `Child` that didn't really start. Your `run` turns that `Err` into `exit 127`, so it still answers like a shell.",
    },
  ],
};
