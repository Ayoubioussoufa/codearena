import type { Lesson } from "../types";

export const lesson0003: Lesson = {
  slug: "0003-input-output",
  number: 3,
  track: "sandbox",
  title: "Input and output: files, pipes and a deadlock",
  summary:
    "Feed a test's input, save the output, cap it with the kernel, and see the pipe deadlock that turns a correct answer into a TLE.",
  minutes: 85,
  status: "ready",
  builds: "`run -i -o -m`, a runner that feeds input, saves output and enforces an output limit",
  lab: { dir: "0003-input-output", writes: ["run.c"], check: "bash check.sh" },
  reference: "processes",
  warmup: [
    { lesson: "0002-time-limits", question: 2 },
    { lesson: "0001-run-a-program", question: 2 },
  ],
  words: ["file descriptor", "dup2", "pipe", "end of file", "a full pipe (back-pressure)", "resource limit"],
  answers: [
    { id: "codearena", label: "Section 6: a pipe or a mounted file" },
    { id: "challenge", label: "Challenge: how the naive pipe version failed (optional)" },
  ],
  quiz: [
    {
      prompt: "Your runner forgets to redirect stdin, and a submission calls `input()`. What happens?",
      options: [
        "It receives an empty line, because the runner owns stdin",
        "It reads from your terminal and waits, until the deadline",
        "The kernel blocks the call, since judges have no terminal",
        "It crashes at once with SIGPIPE, as nothing is attached",
      ],
      correct: 1,
      why: "File descriptors are inherited across `fork` and `exec`, so fd 0 is still your terminal. `input()` waits for someone to type, and the judge reports a TLE for a program that was only waiting. A judge always gives the child its own stdin: the test's input, or `/dev/null`.",
    },
    {
      prompt: "A runner calls `waitpid` first, then reads the child's output pipe. The program prints 300 KB. What happens?",
      options: [
        "The kernel grows the pipe, so everything works, just slower",
        "The extra output is dropped, and the verdict becomes WA",
        "The child blocks on a full pipe; both wait forever",
        "waitpid returns at once, because the child is still writing",
      ],
      correct: 2,
      why: "A pipe holds 64 KiB. Once it's full, the child's next `write` blocks until someone reads. But the parent is blocked in `waitpid`, waiting for the child to end. Each waits for the other, and the deadline turns a correct program into a TLE. Read while it runs, or use files.",
    },
    {
      prompt: "Why does the reader of a pipe need every write end closed?",
      options: [
        "read reports end of file only when no writer remains",
        "An open write end halves the pipe's capacity for reads",
        "The kernel refuses to schedule a reader while writers exist",
        "Closed write ends let the kernel free the buffered data",
      ],
      correct: 0,
      why: "`read` on an empty pipe blocks while any write end is open anywhere, because more data could still come. It returns 0 (end of file) only once every write end is closed, including copies inherited by children. A forgotten copy means a reader that waits forever.",
    },
    {
      prompt: "Your runner sets the file-size limit to the cap plus one byte. Why the extra byte?",
      options: [
        "Files always need one spare byte for the end-of-file marker",
        "The kernel rounds every limit down, so one byte compensates",
        "Without it, SIGXFSZ would also kill the runner process itself",
        "So exactly the cap passes, while one more byte shows",
      ],
      correct: 3,
      why: "With the limit at exactly the cap, a program that writes exactly the cap and one that tries to write more both leave a file of the same size, and you can't tell them apart. With cap + 1, an honest program stays at or under the cap, and anything that tried to write more leaves cap + 1 bytes behind.",
    },
    {
      prompt: "A Python program writes past the file-size limit, and your runner sees `exit 120`, not `signal 25`. Why?",
      options: [
        "Python buffers output, so the limit never applies to it",
        "Python ignores SIGXFSZ, so the write fails with an error",
        "Signal 25 is converted to exit 120 by the shell",
        "The kernel only sends SIGXFSZ to programs written in C",
      ],
      correct: 1,
      why: "CPython ignores SIGXFSZ at startup, so the kernel refuses the oversized write with the error EFBIG instead of a signal. Python raises `OSError: File too large`; here that happens when it flushes its buffer at shutdown, so it exits with 120. The limit held all the same, which is why your runner decides `output-limit` from the file's size, not from how the program died.",
    },
  ],
};
