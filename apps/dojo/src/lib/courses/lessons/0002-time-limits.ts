import type { Lesson } from "../types";

export const lesson0002: Lesson = {
  slug: "0002-time-limits",
  number: 2,
  track: "sandbox",
  title: "Time limits: stopping a program that won't stop",
  summary:
    "Give run a wall-clock deadline, stop what ignores you, and kill everything the program started.",
  minutes: 80,
  status: "ready",
  builds: "`run -t`, a deadline that stops loops, sleepers, signal-ignorers and their children",
  lab: { dir: "0002-time-limits", writes: ["run.c"], check: "bash check.sh" },
  reference: "processes",
  warmup: [
    { lesson: "0001-run-a-program", question: 1 },
    { lesson: "0001-run-a-program", question: 4 },
  ],
  words: ["wall-clock time", "CPU time", "signal disposition", "SIGTERM vs SIGKILL", "orphan", "process group"],
  answers: [
    { id: "codearena", label: "Section 7: RunLimits, and what to kill" },
    { id: "escape", label: "Step 4: why the grandchild survived" },
    { id: "challenge", label: "Challenge: polling vs pidfd (optional)" },
  ],
  quiz: [
    {
      prompt: "A submission calls `sleep(60)`. Why can't a CPU-time limit alone stop it?",
      options: [
        "sleep holds back every signal until it returns to you",
        "CPU limits only apply to programs that run as root",
        "Sleeping burns no CPU, so its CPU clock barely moves",
        "The kernel counts sleep as CPU time only after returning",
      ],
      correct: 2,
      why: "A CPU limit counts the time the program actually runs on a core. A sleeping (or blocked) program runs for almost none, so it could hold your worker for hours without ever reaching the limit. That's why a judge needs a wall-clock deadline too.",
    },
    {
      prompt: "At the deadline, your judge sends SIGTERM and the program keeps running. Why?",
      options: [
        "SIGTERM only reaches processes running on a CPU core",
        "The kernel delays SIGTERM until the program calls exit",
        "SIGTERM needs root, and the judge runs as nobody",
        "SIGTERM can be caught or ignored; SIGKILL never can",
      ],
      correct: 3,
      why: "A program can install a handler for SIGTERM, or ignore it (`ignore_term.c` does). SIGKILL and SIGSTOP are the two signals the kernel never lets a program catch, block or ignore. A judge owes a hostile program no politeness: SIGKILL, at once.",
    },
    {
      prompt: "The judge kills `sh -c 'sleep 100; echo done'` with `kill(pid, SIGKILL)`. What survives?",
      options: [
        "Nothing: killing a parent always kills all its children",
        "The sleep process, orphaned and adopted by another parent",
        "The shell, because SIGKILL only reaches the newest process",
        "Both, because sh blocks SIGKILL while a child runs",
      ],
      correct: 1,
      why: "Killing a parent doesn't touch its children. `sleep` is orphaned, re-parented to init (or the nearest subreaper), and keeps running. In a judge, every leftover process eats memory and CPU until someone notices.",
    },
    {
      prompt: "How does `kill(-pgid, SIGKILL)` differ from `kill(pid, SIGKILL)`?",
      options: [
        "It signals every process in the group, not just one",
        "It sends the signal with lower priority, so it's gentler",
        "It signals the parent instead of the child process itself",
        "It retries until the process exits, then reports the status",
      ],
      correct: 0,
      why: "A negative number means \"process group\": the kernel delivers the signal to every member. Your child becomes a group leader with `setpgid(0, 0)`, its descendants inherit the group, and one `kill(-pid, SIGKILL)` reaches them all.",
    },
    {
      prompt: "Before your deadline, a hostile program starts a grandchild that calls `setsid()`. What happens at the kill?",
      options: [
        "setsid fails inside a judge, so nothing changes at all",
        "The kernel kills the whole session along with the group",
        "The grandchild left your group, so it survives the kill",
        "The grandchild becomes the leader, so it kills your judge",
      ],
      correct: 2,
      why: "`setsid()` creates a new session and a new process group, so `kill(-pgid)` no longer reaches it. Process groups are a convenience for shells, not a security wall. Real sandboxes use a PID namespace (kill its PID 1 and the kernel kills everything inside) or a cgroup (`cgroup.kill`): lessons 5 and 6.",
    },
  ],
};
