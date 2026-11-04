import type { Lesson } from "../types";

const LITTLE = "https://en.wikipedia.org/wiki/Little%27s_law";

export const lesson0027: Lesson = {
  slug: "0027-your-system-out-loud",
  number: 27,
  track: "story",
  title: "Your system, out loud",
  summary:
    "CodeArena from a blank page in ten minutes, then redesigned for 100× the traffic: requirements, back-of-the-envelope numbers, the design, the judge in depth, the bottlenecks and the trade-offs.",
  minutes: 100,
  status: "ready",
  builds: "`outline.md`: the notes for a system-design interview on your own system, with its numbers recomputed by the checker",
  lab: { dir: "0027-your-system-out-loud", writes: ["outline.md"], check: "bash check.sh" },
  reference: "story",
  warmup: [
    { lesson: "0026-star-stories", question: 4 },
    { lesson: "0018-leaderboard", question: 0 },
  ],
  words: ["functional and non-functional requirements", "back-of-the-envelope estimate", "Little's law", "bottleneck", "horizontal scaling", "trade-off"],
  answers: [
    { id: "codearena", label: "Section 5: your three weakest moments, from the recording" },
    { id: "challenge", label: "Challenge: the interviewer's curveball (optional)" },
  ],
  quiz: [
    {
      prompt: "\"Design an online judge.\" What do the first minutes go to?",
      options: [
        "Draw every box you know, then remove the ones they dislike",
        "Pick the database first, since every other choice depends on it",
        "Ask about the users, the scale and the limits before drawing",
        "Write code for the hardest part, to prove you can build",
      ],
      correct: 2,
      why: "Requirements decide the design: 200 users and 20,000 call for different systems. Agree on what it must do, how fast, for how many, and what it must never do (run code outside the sandbox), then estimate. Interviewers grade the questions you ask before the boxes you draw.",
    },
    {
      prompt: "23 submissions arrive per second, and each holds a runner slot for 6 seconds. How many slots must be busy at once?",
      options: [
        "About 23: one slot for each new submission arriving per second",
        "About 140: the arrival rate times how long each one runs",
        "About 6: one slot per second, since every run lasts six",
        "About 200,000: one slot for each submission made during the day",
      ],
      correct: 1,
      why: `Little's law: the average number in a system equals the arrival rate times the time each item spends in it ([Little's law](${LITTLE})). 23 per second × 6 seconds ≈ 139 slots. It sizes thread pools, connection pools and worker fleets alike.`,
    },
    {
      prompt: "At 100×, why move the runners onto their own hosts?",
      options: [
        "So runners can use a newer Linux kernel than the API",
        "So an escape or a CPU spike can't reach the database",
        "So the queue can be removed, since hosts receive jobs directly",
        "So Docker can run more containers than one machine would allow",
      ],
      correct: 1,
      why: "Two reasons, both from your own ADRs: blast radius (a sandbox escape lands on a host holding nothing but runners) and resource isolation (a burst of submissions can't starve the API and Postgres of CPU). They also scale on their own, with the queue's depth as the signal.",
    },
    {
      prompt: "Why say your trade-offs out loud, unprompted?",
      options: [
        "It fills the remaining time, so the interview ends on schedule",
        "It proves that you have used every technology that you mention",
        "It stops the interviewer from asking you any more follow-up questions",
        "It shows you weighed alternatives, which is what they are grading",
      ],
      correct: 3,
      why: "There's rarely one right design; there are choices with costs. \"BullMQ instead of Kafka, because the judge needs per-job retries, not a replayable log\" shows judgement, and invites the follow-up you've prepared.",
    },
    {
      prompt: "\"What if a runner host dies in the middle of judging?\"",
      options: [
        "Its lease expires, and another worker claims and runs the job",
        "The verdict is lost; the user must submit the code again",
        "BullMQ restarts the dead host, then resumes the run in place",
        "The database then rolls back every submission judged in that hour",
      ],
      correct: 0,
      why: "Lessons 13 and 14 answer it: the job stays unacknowledged, the claim's lease expires, another worker takes it over, and fencing stops the dead worker's late write. The user waits a little longer; nothing is lost or judged twice.",
    },
  ],
};
