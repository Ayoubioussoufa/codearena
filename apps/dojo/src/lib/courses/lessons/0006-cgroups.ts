import type { Lesson } from "../types";

const V2 = "https://docs.kernel.org/admin-guide/cgroup-v2.html";

export const lesson0006: Lesson = {
  slug: "0006-cgroups",
  number: 6,
  track: "sandbox",
  title: "cgroups: limits the kernel enforces",
  summary:
    "Cap memory, processes and CPU by writing to files, watch a fork bomb hit the wall, and kill everything left behind in one write.",
  minutes: 85,
  status: "ready",
  builds: "`cage`, which runs a program under memory, process and CPU limits, then wipes out its leftovers",
  lab: { dir: "0006-cgroups", writes: ["cage.c"], check: "bash check.sh" },
  reference: "sandbox",
  warmup: [
    { lesson: "0005-namespaces", question: 2 },
    { lesson: "0003-input-output", question: 3 },
  ],
  words: ["cgroup", "controller", "memory.max and the OOM killer", "pids.max", "cpu.max (quota and period)", "delegation"],
  answers: [
    { id: "codearena", label: "Section 6: telling MLE from TLE when Docker says 137" },
    { id: "challenge", label: "Challenge: box inside cage (optional)" },
  ],
  quiz: [
    {
      prompt: "A submission touches 4 GB of memory under `memory.max` = 256 MB, with swap off. What does your runner see?",
      options: [
        "SIGKILL from the OOM killer, and oom_kill goes up",
        "malloc returns NULL, so the program exits by itself",
        "The cgroup grows its limit to fit the request",
        "The whole machine swaps until the deadline kills it",
      ],
      correct: 0,
      why: `When a cgroup can't reclaim enough memory under \`memory.max\`, the kernel's OOM killer kills a process in it, and \`memory.events\` counts it as \`oom_kill\` ([cgroup v2](${V2})). \`malloc\` usually succeeds anyway: Linux hands out memory lazily, and the kill comes when the pages are touched.`,
    },
    {
      prompt: "`pids.max` is 16 and the cgroup already holds 16 processes. A fork bomb calls `fork()` again. What happens?",
      options: [
        "The OOM killer kills the oldest process",
        "It succeeds, and the parent gets SIGKILL",
        "It fails with EAGAIN; nothing gets killed",
        "It waits until another process has exited",
      ],
      correct: 2,
      why: `The pids controller refuses the new process: \`fork\` returns -1 with EAGAIN, and \`pids.events\` counts the refusal under \`max\` ([cgroup v2](${V2}), "PID"). Nothing dies; the bomb just stops growing. That's why your runner still has to kill what's left.`,
    },
    {
      prompt: "`cpu.max` reads `25000 100000`. A program spins for 2 seconds of wall-clock time. About how much CPU time does it get?",
      options: [
        "About 2 seconds of CPU",
        "About 0.25 seconds of CPU",
        "About 0.5 seconds of CPU",
        "None: it's killed at once",
      ],
      correct: 2,
      why: `\`cpu.max\` is "quota period": at most 25,000 µs of CPU in every 100,000 µs, which is 25%. Over 2 seconds, that's about 0.5 s, and the program is throttled, not killed ([cgroup v2](${V2}), "CPU"). This lesson's own test measured 0.52 s.`,
    },
    {
      prompt: "Your cage enables controllers for its children, but writing `cgroup.subtree_control` fails with EBUSY. Why?",
      options: [
        "Only real root may write any file under /sys/fs/cgroup",
        "The memory controller is busy freeing the last box",
        "systemd locks every cgroup it creates against any changes",
        "Processes still sit in it, and controllers need leaves",
      ],
      correct: 3,
      why: `cgroup v2's "no internal process" rule: a non-root cgroup can't both hold processes and hand controllers down to its children ([cgroup v2](${V2}), "No Internal Process Constraint"). So your cage first moves itself into a leaf (\`supervisor\`), then enables the controllers.`,
    },
    {
      prompt: "Docker reports exit 137 for a submission. How does your runner tell Memory Limit from Time Limit?",
      options: [
        "Exit code 137 always means memory: report MLE",
        "Read State.OOMKilled from docker inspect for the run",
        "Compare the stdout sizes: memory hogs print more",
        "Rerun it alone, then remember which limit tripped",
      ],
      correct: 1,
      why: "137 is SIGKILL, from the OOM killer or from your own deadline (lesson 1). Docker learns about OOM kills from the container's cgroup and records them in `docker inspect` as `State.OOMKilled`, so that's the fact your runner reads. Your cage reads the same fact straight from `memory.events`.",
    },
  ],
};
