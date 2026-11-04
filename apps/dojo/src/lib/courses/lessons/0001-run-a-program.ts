import type { Lesson } from "../types";

export const lesson0001: Lesson = {
  slug: "0001-run-a-program",
  number: 1,
  track: "sandbox",
  title: "What happens when you run a program",
  summary:
    "How one program starts another with fork, exec and wait, and how the kernel reports the way it ended.",
  minutes: 60,
  status: "ready",
  builds: "`run`, a tiny program runner in C that tells an exit from a crash",
  lab: { dir: "0001-run-a-program", writes: ["run.c"], check: "bash check.sh" },
  reference: "processes",
  words: ["process", "system call", "fork", "exec", "wait status", "signal", "exit code"],
  answers: [
    { id: "codearena", label: "Section 4: facts and judgement in RunResult" },
    { id: "challenge", label: "Challenge: what $? showed (optional)" },
  ],
  quiz: [
    {
      prompt: "Your shell runs `ls`. Why does it call `fork()` before `execvp()`?",
      options: [
        "exec replaces the caller, so the shell would vanish",
        "fork grants ls the permissions it needs to start",
        "exec can only run inside processes without any parents",
        "fork makes ls faster by sharing the parent's CPU",
      ],
      correct: 0,
      why: "`exec` swaps the program inside the process that calls it. The shell forks a copy, the copy becomes `ls`, and the original shell waits and survives.",
    },
    {
      prompt: "`docker run` returns, and the shell shows `$?` = 137. What do you know for certain?",
      options: [
        "Signal 137 killed it, as the kernel reports directly",
        "Either SIGKILL or exit(137); the number alone can't tell",
        "It ran out of memory: 137 always means OOM-killed",
        "Docker itself crashed, since programs never exit above 128",
      ],
      correct: 1,
      why: "137 = 128 + 9, the shell's way of saying \"killed by signal 9, SIGKILL\". But a program can also call `exit(137)`, and `$?` would look identical. Even SIGKILL alone doesn't say who sent it: the OOM killer and your own `docker kill` both use it. That's why `docker inspect` has an `OOMKilled` field, and why your runner should keep the full facts.",
    },
    {
      prompt: "A Python submission divides by zero. What does your `run` print?",
      options: [
        "signal 8: the processor traps the division",
        "signal 11: the interpreter crashes on it",
        "exit 0: the traceback counts as output",
        "exit 1: CPython catches it, then exits",
      ],
      correct: 3,
      why: "Python checks the divisor before dividing and raises `ZeroDivisionError`. Nothing catches it, so the interpreter prints a traceback on stderr and exits normally, with code 1. `div0.c` had nothing checking, so the CPU faulted and the kernel sent SIGFPE. A judge needs both cases: Runtime Error = a signal or a non-zero exit.",
    },
    {
      prompt: "A child calls `exit(300)`. What does `WEXITSTATUS` give the parent?",
      options: [
        "300: the full value passed to exit",
        "255: values over the maximum get capped",
        "44: only the lowest 8 bits survive",
        "-1: exit codes above 255 are errors",
      ],
      correct: 2,
      why: "The exit code travels in 8 bits of the status. 300 is `0x12c`; the kernel keeps `0x2c`, which is 44. You saw it as `0x2c00` in step 1.",
    },
    {
      prompt: "`execvp` fails in the child, and the child doesn't exit. What happens next?",
      options: [
        "The child keeps running the parent's code too",
        "The kernel kills the child, since exec failed",
        "The parent automatically gets exit 127 from waitpid",
        "Nothing: the child simply waits for the parent",
      ],
      correct: 0,
      why: "A failed `exec` changes nothing: the child is still a copy of `run`, so it carries on with the parent's code. It calls `waitpid`, which fails because it has no children, and prints a line of its own. Now two processes are doing the parent's job. The 127 only exists if your code calls `_exit(127)`.",
    },
  ],
};
