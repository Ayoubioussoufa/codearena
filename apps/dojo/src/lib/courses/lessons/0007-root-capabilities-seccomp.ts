import type { Lesson } from "../types";

const CAPS = "https://man7.org/linux/man-pages/man7/capabilities.7.html";
const SECCOMP = "https://man7.org/linux/man-pages/man2/seccomp.2.html";

export const lesson0007: Lesson = {
  slug: "0007-root-capabilities-seccomp",
  number: 7,
  track: "sandbox",
  title: "Root, capabilities and seccomp",
  summary:
    "Take root's powers away for good, then forbid system calls with a filter you write in BPF, by hand.",
  minutes: 90,
  status: "ready",
  builds: "`guard`, which makes a program root without powers and runs it under your own system-call filter",
  lab: { dir: "0007-root-capabilities-seccomp", writes: ["guard.c"], check: "bash check.sh" },
  reference: "sandbox",
  warmup: [
    { lesson: "0006-cgroups", question: 1 },
    { lesson: "0005-namespaces", question: 1 },
  ],
  words: ["capability", "the bounding set", "no_new_privs", "seccomp filter", "allowlist vs denylist", "SIGSYS"],
  answers: [
    { id: "codearena", label: "Section 6: the hardening flags, and what each one stops" },
    { id: "challenge", label: "Challenge: an allowlist filter (optional)" },
  ],
  quiz: [
    {
      prompt: "Your guard zeroes every capability with `capset`, but leaves the bounding set alone. After `exec`, `CapEff` is full again. Why?",
      options: [
        "capset only lasts until the next system call has returned",
        "The user namespace resets them whenever a file is read",
        "exec refills root's powers, capped only by the bounding set",
        "grep runs as another user, holding its own fresh capabilities",
      ],
      correct: 2,
      why: `When a uid-0 process calls \`execve\`, the kernel recomputes its capabilities, and the bounding set is the ceiling ([capabilities(7)](${CAPS}), "Transformation of capabilities during execve()"). Zeroing the effective set only lasts until the next exec. Clearing the bounding set is permanent: that's what \`--cap-drop ALL\` does.`,
    },
    {
      prompt: "Root in your guard, with every capability dropped, runs `unshare -m true`. Why does it fail?",
      options: [
        "Making a mount namespace needs CAP_SYS_ADMIN, which is gone",
        "The seccomp filter kills unshare in every guarded process",
        "Only one mount namespace may exist per user namespace",
        "unshare needs network access, and the guard has none",
      ],
      correct: 0,
      why: `Creating a mount namespace needs \`CAP_SYS_ADMIN\` in the current user namespace. Without it, a submission can't build its own namespaces to escape or remount anything. No filter is involved here: this is capabilities alone ([capabilities(7)](${CAPS})).`,
    },
    {
      prompt: "Why does your guard set `no_new_privs` before installing the filter?",
      options: [
        "no_new_privs loads the BPF program into kernel memory",
        "Seccomp filters only bind processes that cannot fork",
        "It's convention: the kernel accepts either order equally",
        "Filters need no_new_privs or CAP_SYS_ADMIN, by kernel rule",
      ],
      correct: 3,
      why: `A process may install a seccomp filter only if it has \`CAP_SYS_ADMIN\` or has set \`no_new_privs\` ([seccomp(2)](${SECCOMP})). The flag guarantees \`execve\` can never grant new privileges, for example through a setuid program, so a filtered process can't run something more powerful than itself.`,
    },
    {
      prompt: "Your filter returns `SECCOMP_RET_ERRNO | EPERM` for `socket`. A Python submission calls `socket.socket()`. What does it see?",
      options: [
        "SIGSYS, and your runner reports signal thirty-one",
        "PermissionError, then exit 1 from the interpreter",
        "A socket that silently discards every packet",
        "Nothing at all: Python bypasses seccomp filters",
      ],
      correct: 1,
      why: "`SECCOMP_RET_ERRNO` makes the call fail with the error you chose, as if the kernel had refused it normally, so Python raises `PermissionError` and exits with 1. `SECCOMP_RET_KILL_PROCESS` is the other choice: SIGSYS, signal 31, no chance to react.",
    },
    {
      prompt: "Docker's default seccomp profile is an allowlist. What does that mean?",
      options: [
        "Allowed by default; only listed system calls are denied",
        "Only containers on an allowlist may run any syscall",
        "Denied by default; only listed system calls are allowed",
        "Root inside is allowed every syscall; others are filtered",
      ],
      correct: 2,
      why: "Its `defaultAction` refuses every system call, then it allows the ones it lists; in effect it \"disables around 44 system calls out of 300+\" ([Docker docs](https://docs.docker.com/engine/security/seccomp/)). An allowlist fails safe: a system call added to a future kernel is blocked until someone decides it's harmless. Your lab's denylist is easier to write, and fails open.",
    },
  ],
};
