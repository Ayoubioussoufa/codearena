import type { Lesson } from "../types";

export const lesson0004: Lesson = {
  slug: "0004-runner-in-node",
  number: 4,
  track: "sandbox",
  title: "The runner, in Node",
  summary:
    "Rebuild your runner with child_process.spawn: the same system calls behind events and streams, and the Node defaults a judge must never trust.",
  minutes: 90,
  status: "ready",
  builds: "`runner.mjs`, a Node runner that returns facts and never crashes the worker",
  lab: { dir: "0004-runner-in-node", writes: ["runner.mjs"], check: "bash check.sh" },
  reference: "processes",
  warmup: [
    { lesson: "0003-input-output", question: 1 },
    { lesson: "0002-time-limits", question: 3 },
  ],
  words: ["event loop", "stream", "'exit' vs 'close'", "EPIPE", "a detached child", "shell injection"],
  answers: [
    { id: "codearena", label: "Section 6: your RunResult type" },
    { id: "challenge", label: "Challenge: the discriminated union (optional)" },
  ],
  quiz: [
    {
      prompt: "`spawn('./no-such-program')`: how does Node tell you the program never started?",
      options: [
        "An 'exit' event with code 127, just like a shell",
        "spawn throws synchronously, so you need a try and catch",
        "An 'error' event with code ENOENT, and maybe no exit",
        "A 'close' event whose signal is SIGKILL from the kernel",
      ],
      correct: 2,
      why: "Node runs `exec` inside libuv; when it fails, there's no child left to exit with 127. Node reports it as an `'error'` event carrying the errno, here `ENOENT`, and `'exit'` may never fire. A runner that only listens for `'exit'` waits forever for a program that never existed.",
    },
    {
      prompt: "Your runner reads stdout but never touches stderr. A program writes 200 KB to stderr. What happens?",
      options: [
        "Node discards stderr it isn't asked for, so nothing changes",
        "It stalls on the full stderr pipe until the deadline",
        "Node merges stderr into stdout once stderr's buffer is full",
        "The kernel drops extra bytes and sends the child SIGPIPE",
      ],
      correct: 1,
      why: "An unread stream stops being drained once Node's internal buffer is full. Then the pipe fills (64 KiB), and the child blocks in `write`: lesson 3's deadlock, through the side door. A judge reads both streams, always, even if it throws stderr away afterwards.",
    },
    {
      prompt: "Why isn't spawn's own `timeout` option enough for a judge?",
      options: [
        "It measures CPU time, so sleeping programs never trip it",
        "It only works with exec, not with spawn and streams",
        "It rounds the limit up to whole seconds, too coarse",
        "It sends SIGTERM to the child only, not its group",
      ],
      correct: 3,
      why: "By default it sends `killSignal`, SIGTERM, which a program can ignore, and only to the direct child, so a shell's children are orphaned and keep the pipes open. That's both of lesson 2's traps at once. Write the deadline yourself: SIGKILL to the whole group.",
    },
    {
      prompt: "A submission exits at once without reading its 1 MB input. What must your runner handle?",
      options: [
        "An EPIPE error on child.stdin, or the worker itself crashes",
        "A second 'exit' event, fired when the input is dropped",
        "Nothing at all, because Node waits until the child reads",
        "A timeout, since the unread input keeps the child alive",
      ],
      correct: 0,
      why: "Writing to a pipe whose reader is gone fails with EPIPE. On a Node stream that becomes an `'error'` event, and an `'error'` event with no listener is thrown as an uncaught exception: your whole worker dies because of one submission. One empty listener on `child.stdin` turns it back into a non-event.",
    },
    {
      prompt: "Which clock should a Node judge use to time a run?",
      options: [
        "`Date.now()`, which counts real milliseconds since the epoch",
        "`performance.now()`, a monotonic clock that never jumps back",
        "`new Date()`, which follows the machine's local time",
        "`process.uptime()`, which restarts from zero for every child",
      ],
      correct: 1,
      why: "`Date.now()` reads the time of day, which NTP or WSL can move backwards or forwards mid-run (the −371 ms of lesson 2). `performance.now()` is measured on a monotonic clock, Node's version of `CLOCK_MONOTONIC`.",
    },
  ],
};
