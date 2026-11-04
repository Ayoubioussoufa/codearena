import type { Lesson } from "../types";

export const lesson0010: Lesson = {
  slug: "0010-attack-your-sandbox",
  number: 10,
  track: "sandbox",
  title: "Attack your own sandbox",
  summary:
    "Write six attacks that prove each wall holds, then prove your attacks would notice if any one wall went missing.",
  minutes: 100,
  status: "ready",
  builds: "`attacks.mjs`, an adversarial suite that passes against your runner and catches six weakened ones",
  lab: { dir: "0010-attack-your-sandbox", writes: ["attacks.mjs", "docker-runner.mjs", "runner.mjs"], check: "bash check.sh" },
  reference: "sandbox",
  warmup: [
    { lesson: "0009-facts-to-verdicts", question: 2 },
    { lesson: "0007-root-capabilities-seccomp", question: 4 },
  ],
  words: ["adversarial test", "containment", "mutation testing", "a mutant", "an invariant", "blast radius"],
  answers: [
    { id: "codearena", label: "Section 5: the host invariants your CodeArena suite checks after every attack" },
    { id: "challenge", label: "Challenge: two more attacks (optional)" },
  ],
  quiz: [
    {
      prompt: "Your fork-bomb test only checks that the run ended with exit 0. Which missing protection can it never notice?",
      options: [
        "A missing deadline: the bomb always ends in its time",
        "A missing network namespace, which the bomb would then use",
        "A missing pids limit: the bomb exits 0 either way",
        "A writable root, where the bomb would leave its files",
      ],
      correct: 2,
      why: "The bomb's parent ends normally whether it created 60 processes or 500, so \"exit 0\" holds with or without `--pids-limit`. A containment test must observe the wall itself: here, how many processes it managed to create.",
    },
    {
      prompt: "What is mutation testing, applied to a sandbox?",
      options: [
        "Run every test twice, and compare both sets of results",
        "Break one protection on purpose; a good suite must fail",
        "Generate random inputs until one of them crashes the code",
        "Measure how many lines of the code the tests execute",
      ],
      correct: 1,
      why: "A suite that still passes when a protection is removed can't see that protection. Mutation testing makes that measurable: weaken one thing (a \"mutant\"), and check that at least one test fails. Coverage tells you code ran; mutation tells you a test would notice.",
    },
    {
      prompt: "An attack reads `/etc/passwd`, and it works. Why is that fine, as long as you check one more thing?",
      options: [
        "Reading any file at all means the sandbox is broken",
        "The image has no passwd, so any read means escape",
        "It proves the program runs as root, which is expected",
        "Reading it is fine; reading the host's would mean escape",
      ],
      correct: 3,
      why: "Every image has its own `/etc/passwd`, and reading it is harmless. The question is *whose* file: Alpine's first line ends in `/bin/sh`, your Ubuntu host's in `/bin/bash`. Seeing the host's would mean the mount namespace leaked.",
    },
    {
      prompt: "Why does the suite check, after every attack, that no container is left?",
      options: [
        "A leftover container is a leak, and I-17 coming back",
        "Listing containers is the only way to read exit codes",
        "Docker refuses new containers until the old ones are gone",
        "Leftovers are harmless; removing them only tidies up the list",
      ],
      correct: 0,
      why: "Containment includes the end of the run: a container that outlives its deadline keeps using CPU and memory, and a busy judge accumulates them until the host falls over. Checking the host after each attack, not just the verdict, is what turns a test into a containment test.",
    },
    {
      prompt: "Writing to `/etc` as `nobody` fails even without `--read-only`. Which attack really proves the root filesystem is read-only?",
      options: [
        "Write to /etc as nobody: a failure proves it's read-only",
        "Check that the container's exit code was zero after it",
        "Read / in /proc/mounts, and run a script from /tmp",
        "List /code and confirm the submission file is still there",
      ],
      correct: 2,
      why: "`nobody` can't write `/etc` anyway, so that test passes with or without the flag. `/proc/mounts` shows the root mount's options (`ro`), and a script written to `/tmp` must fail to run because of `noexec`. Both change when the protection is removed, which is what makes them real tests.",
    },
  ],
};
