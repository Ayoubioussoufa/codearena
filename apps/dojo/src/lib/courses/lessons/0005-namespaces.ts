import type { Lesson } from "../types";

export const lesson0005: Lesson = {
  slug: "0005-namespaces",
  number: 5,
  track: "sandbox",
  title: "Namespaces: your own container",
  summary:
    "Build a container by hand, without root: its own process IDs, hostname, user IDs, files and network.",
  minutes: 90,
  status: "ready",
  builds: "`box`, a container runtime in about 100 lines of C, running Alpine without sudo",
  lab: { dir: "0005-namespaces", writes: ["box.c"], check: "bash check.sh" },
  reference: "sandbox",
  warmup: [
    { lesson: "0002-time-limits", question: 4 },
    { lesson: "0004-runner-in-node", question: 2 },
  ],
  words: ["namespace", "user namespace (uid_map)", "PID 1 of a namespace", "mount namespace", "chroot", "network namespace"],
  answers: [
    { id: "codearena", label: "Section 6: which walls Docker gives you, and which it doesn't" },
    { id: "challenge", label: "Challenge: pivot_root and a read-only root (optional)" },
  ],
  quiz: [
    {
      prompt: "Inside your box, `echo $$` prints `1`. On the host, `ps` shows the same process as 31337. Which is true?",
      options: [
        "It has two PIDs, one per namespace level",
        "The box rewrites ps output to hide numbers",
        "Only the host number exists; 1 is fake",
        "PID 1 is shared by every running container",
      ],
      correct: 0,
      why: "A process in a child PID namespace has a PID in each namespace it's visible from: 1 inside, 31337 in the host's. Both are real, and the kernel keeps them all ([pid_namespaces(7)](https://man7.org/linux/man-pages/man7/pid_namespaces.7.html)).",
    },
    {
      prompt: "Without the chroot, a process in your box runs as uid 0 and tries to edit the host's `/etc/shadow`. What happens?",
      options: [
        "It succeeds, because uid 0 is root everywhere on Linux",
        "It's denied: inside root is just your own uid outside",
        "The kernel kills the box for touching a host file",
        "It succeeds, but the change disappears when the box exits",
      ],
      correct: 1,
      why: "Your `uid_map` says \"0 inside is 1000 outside\". The kernel checks file permissions with the outside identity, and the host's root-owned files stay out of reach. Root in a user namespace only has power over that namespace's own resources ([user_namespaces(7)](https://man7.org/linux/man-pages/man7/user_namespaces.7.html)).",
    },
    {
      prompt: "In the box, a shell is PID 1 and installed no signal handlers. The host runs `kill -TERM` on it. What happens?",
      options: [
        "It exits, like every other process",
        "Nothing: PID 1 ignores unhandled signals",
        "The kernel upgrades it into SIGKILL",
        "Every host process receives that signal",
      ],
      correct: 1,
      why: "The init process of a PID namespace only receives signals it has a handler for; only SIGKILL and SIGSTOP from an ancestor namespace are forced through. That's I-17's \"SIGTERM hangs forever\": `docker run` forwards SIGTERM to a PID 1 that ignores it.",
    },
    {
      prompt: "Why does the child wait on a pipe before it calls `chroot` and `exec`?",
      options: [
        "Pipes are the only way to pass the rootfs directory",
        "chroot fails unless the parent holds the new root open",
        "The parent writes its uid map before the child continues",
        "The kernel requires a pipe for every new PID namespace",
      ],
      correct: 2,
      why: "A new user namespace starts with no mapping: until someone outside writes `/proc/<pid>/uid_map`, the child is \"nobody\". Only the parent, still in the old world, can write it. The pipe makes the child wait until the map exists.",
    },
    {
      prompt: "Inside your box, `ip link` shows only `lo`, and it's down. Which flag gave you that?",
      options: [
        "CLONE_NEWUTS, a fresh hostname namespace",
        "CLONE_NEWPID, a fresh process namespace",
        "CLONE_NEWNS, a fresh mount namespace",
        "CLONE_NEWNET, a fresh network namespace",
      ],
      correct: 3,
      why: "A new network namespace starts with a loopback interface and nothing else: no route out, no DNS. It's what `docker run --network none` gives a container, and why a submission can't send your hidden tests anywhere.",
    },
  ],
};
