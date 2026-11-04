import type { Lesson } from "../types";

export const lesson0009: Lesson = {
  slug: "0009-facts-to-verdicts",
  number: 9,
  track: "sandbox",
  title: "From facts to verdicts: the judge loop",
  summary:
    "Turn a runner's facts into AC, WA, TLE, MLE, OLE or RE: a token checker, a judge loop that stops at the first failure, and errors that aren't verdicts.",
  minutes: 75,
  status: "ready",
  builds: "`judge.mjs`: the token checker and the judge loop, test-first against a scripted fake runner",
  lab: { dir: "0009-facts-to-verdicts", writes: ["judge.mjs"], check: "bash check.sh" },
  reference: "judge",
  warmup: [
    { lesson: "0008-docker-hardened", question: 3 },
    { lesson: "0003-input-output", question: 4 },
  ],
  words: ["verdict", "token checker", "test case", "fake (test double)", "internal error vs verdict", "time limit calibration"],
  answers: [
    { id: "codearena", label: "Section 5: where the checker and the judge loop live in the worker" },
    { id: "challenge", label: "Challenge: a float checker (optional)" },
  ],
  quiz: [
    {
      prompt: "The expected output is `5\\n`. The program prints `5`, with no newline. What should your judge say?",
      options: [
        "Wrong Answer: bytes differ by one trailing newline",
        "Accepted: only the tokens count, not the whitespace",
        "Presentation Error: a softer kind of wrong answer",
        "Runtime Error: the program never ended its line",
      ],
      correct: 1,
      why: "ADR-006 compares tokens, as Codeforces' standard `wcmp` checker does ([testlib](https://github.com/MikeMirzayanov/testlib)): split both outputs on whitespace, compare the sequences. The most common \"Wrong Answer\" that should have been Accepted is a missing or extra newline.",
    },
    {
      prompt: "A program prints exactly the right answer, then crashes with SIGSEGV. What's the verdict for that test?",
      options: [
        "Accepted: the output was right, and that is what counts",
        "Wrong Answer: a crash means the output cannot be trusted",
        "Time Limit: a crashed program never finished in its time",
        "Runtime Error: a crash fails the test, whatever it printed",
      ],
      correct: 3,
      why: "The output is only compared when the program ended normally with exit code 0. A crash (a signal, or a non-zero exit) is a Runtime Error whatever it printed first, so the judge checks how it ended before it ever reads the output.",
    },
    {
      prompt: "While judging test 2, the runner fails because Docker is unreachable. What should the judge do?",
      options: [
        "Report Runtime Error on test 2, then simply move on",
        "Report Accepted, since the test before it had passed fine",
        "Throw, so the job gets retried: it is your failure",
        "Skip the second test, and judge the rest as usual",
      ],
      correct: 2,
      why: "A user's failure is a verdict; your failure is an error. If Docker is down, nobody learned anything about the submission, so turning it into RE would punish the user for your outage. Throw, let the queue retry it (lesson 14), and only give up into a dead-letter state after the last retry.",
    },
    {
      prompt: "Why does the judge stop at the first failing test instead of running them all?",
      options: [
        "The verdict is decided; more runs only cost time",
        "Later tests depend on the output of earlier ones",
        "Docker can only start one container per each submission",
        "Running every test would leak all the expected outputs",
      ],
      correct: 0,
      why: "Once a test fails, the verdict and the failing test's number are known; every further run is a container start and seconds of CPU for nothing. Codeforces and LeetCode both report the first failing test. A judge that also wants a score per test (IOI-style partial credit) runs them all, by choice.",
    },
    {
      prompt: "Your reference solution takes 120 ms on the slowest test. Where should the time limit go?",
      options: [
        "Exactly 120 ms, so only the best solutions pass",
        "A few times your measured time, never a guess",
        "One second, which is the limit Codeforces always uses",
        "Ten seconds, so that no correct solution ever fails",
      ],
      correct: 1,
      why: "Measure, then leave headroom for a slower language and a busy machine: a few times the reference's time, with the container's startup counted the same way you'll count it in production (lesson 8). A limit you guessed is a limit you can't defend.",
    },
  ],
};
