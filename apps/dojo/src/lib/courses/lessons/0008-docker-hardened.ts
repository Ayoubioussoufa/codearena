import type { Lesson } from "../types";

export const lesson0008: Lesson = {
  slug: "0008-docker-hardened",
  number: 8,
  track: "sandbox",
  title: "Docker is all of this: the hardened run",
  summary:
    "Map every flag of the hardened docker run to the layer you built by hand, then build the runner CodeArena's worker needs.",
  minutes: 120,
  status: "ready",
  builds: "`docker-runner.mjs`, a hardened Docker runner that proves every flag from inside the container",
  lab: { dir: "0008-docker-hardened", writes: ["docker-runner.mjs", "runner.mjs"], check: "bash check.sh" },
  reference: "sandbox",
  warmup: [
    { lesson: "0007-root-capabilities-seccomp", question: 0 },
    { lesson: "0006-cgroups", question: 4 },
  ],
  words: ["container", "image tag (pinned)", "the Docker daemon", "a bind mount, read-only", "OOMKilled", "defence in depth"],
  answers: [
    { id: "codearena", label: "Section 6: your two decisions for the DockerCodeRunner" },
    { id: "challenge", label: "Challenge: JavaScript, and measuring startup (optional)" },
  ],
  quiz: [
    {
      prompt: "Your runner passes the submission's code as an argument: `python3 -c \"<code>\"`. What's wrong with that?",
      options: [
        "Python only runs code that comes from a file",
        "Docker drops any argument that is over one hundred",
        "It's visible in ps, and long code hits limits",
        "Arguments are visible only to root, which is fine",
      ],
      correct: 2,
      why: "Every process's arguments are readable by every user on the host (`ps`, `/proc/<pid>/cmdline`), and the kernel caps their total size (`ARG_MAX`). Code belongs in a file mounted read-only, or on stdin: data, never part of a command.",
    },
    {
      prompt: "At the deadline, your runner kills the `docker` process it spawned. What happens to the container?",
      options: [
        "It keeps running: the client was only a messenger",
        "It stops, since Docker forwards the SIGKILL to it",
        "It pauses until another client attaches to it again",
        "It exits with 137, and Docker then removes it",
      ],
      correct: 0,
      why: "The container's processes are children of the Docker daemon's helpers, not of your `docker` client (lesson 2), and nobody can forward a SIGKILL. That's I-17. Kill it through the daemon, by name: `docker kill <name>`, or `docker rm -f <name>` in your cleanup.",
    },
    {
      prompt: "Why pin the image to an exact tag, like `python:3.12-alpine`, instead of `latest`?",
      options: [
        "Docker won't start any image tagged latest in production",
        "Pinned images run faster, since their layers are smaller",
        "Docker updates the latest tag only about once yearly",
        "Same environment every run, and limits calibrated on it",
      ],
      correct: 3,
      why: "`latest` moves whenever someone pushes. A new interpreter version can change speed or behaviour, and your time limits were calibrated on the old one (lesson 9). It can also trigger a surprise download mid-run. A pinned tag (or, stricter, a digest) is the same image every time.",
    },
    {
      prompt: "A run ends with exit code 137, and `docker inspect` says `State.OOMKilled` is false. What happened?",
      options: [
        "The program used too much memory; Docker hid it",
        "A SIGKILL that was not memory: probably your deadline",
        "The container crashed, so the verdict is Runtime Error",
        "Docker itself crashed, so the run should be retried",
      ],
      correct: 1,
      why: "137 is 128 + 9: a SIGKILL. The OOM killer would have set `OOMKilled`, so the kill came from somewhere else, almost always your own deadline (`docker kill`). Your runner knows that already: it records `timeout` the moment it decides to kill.",
    },
    {
      prompt: "Each container takes about 400 ms to start, and your timing includes it. Why does that matter for verdicts?",
      options: [
        "Startup time is free: the kernel never counts it",
        "It only matters for compiled languages such as Java",
        "Every run pays it, so measure inside or calibrate",
        "Docker subtracts it before reporting, so it never shows",
      ],
      correct: 2,
      why: "Wall time measured around `docker run` includes starting the container, so a 1-second limit leaves a solution about 0.6 s. Either measure the program's own time inside the container (its cgroup's `cpu.stat`, lesson 6), or calibrate each limit with startup included, and say which in your ADR.",
    },
  ],
};
