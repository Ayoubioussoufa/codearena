/** CodeArena's own judge, and seven ways to hurt it. Checked against the code. */
import type { Situation } from "./quiz";

export type JudgeNode = "browser" | "api" | "postgres" | "queue" | "worker" | "sandbox" | "board";
export interface JudgeStep {
  from: JudgeNode;
  to: JudgeNode;
  label: string;
}
export const JUDGE_STEPS: readonly JudgeStep[] = [
  { from: "browser", to: "api", label: "POST /submissions" },
  { from: "api", to: "postgres", label: "insert the row: PENDING" },
  { from: "api", to: "queue", label: "add the job, jobId = submissionId" },
  { from: "api", to: "browser", label: "202 { id }" },
  { from: "queue", to: "worker", label: "deliver the job" },
  { from: "worker", to: "postgres", label: "claim it: JUDGING, with a lease" },
  { from: "worker", to: "sandbox", label: "run the code, test by test" },
  { from: "worker", to: "postgres", label: "save the verdict, if the claim is still mine" },
  { from: "worker", to: "board", label: "ACCEPTED: one Lua script" },
];

export interface Disaster extends Situation {
  /** The step (index into JUDGE_STEPS) where it strikes. */
  step: number;
}

export const DISASTERS: readonly Disaster[] = [
  {
    id: "double-add", step: 2, title: "The job is added twice",
    story: "The API retries after a network blip, so the same submission goes to the queue two times, seconds apart.",
    moves: [
      { text: "The worker judges it twice, and the later verdict wins", outcome: "It would cost a second sandbox run, but it never gets that far." },
      { text: "The jobId is the submission's id, so the second add is ignored", outcome: "Yes. BullMQ ignores an add whose id already exists, as long as the first job is still there." },
      { text: "Postgres rejects the second job with a unique index", outcome: "The queue lives in Redis: Postgres never sees the add." },
      { text: "The rate limiter stops the second request", outcome: "The limiter guards the HTTP route. This retry is inside the API." },
    ],
    best: 1, lesson: "Give the job an id that means the work, and the queue removes duplicates for you while it remembers the first one.",
  },
  {
    id: "double-delivery", step: 4, title: "Two workers get the same job",
    story: "Delivery is at-least-once. Workers 1 and 2 both receive submission s42 and both start.",
    moves: [
      { text: "Each takes a Redis lock before reading the row", outcome: "Plausible, but there is no such lock here. The database decides." },
      { text: "The first to finish deletes the job", outcome: "By then both have run the code." },
      { text: "They compare clocks, and the later one stops", outcome: "Two machines' clocks never agree well enough for that." },
      { text: "The claim is one conditional UPDATE: only one changes a row", outcome: "Yes. Postgres runs them one after the other, and the second WHERE no longer matches." },
    ],
    best: 3, lesson: "Check and write in one statement. Read-then-write leaves a gap that two workers can both walk through.",
  },
  {
    id: "docker-down", step: 6, title: "Docker is down on that machine",
    story: "The worker holds the claim, then the sandbox fails to start: our fault, not the user's code.",
    moves: [
      { text: "It releases the claim and throws, so the queue retries in 2 s", outcome: "Yes: back to PENDING, three attempts with growing delays, then SYSTEM_ERROR so nobody waits forever." },
      { text: "It saves RUNTIME_ERROR", outcome: "That blames the user for our outage." },
      { text: "It keeps the claim until the lease runs out", outcome: "Five minutes of waiting, and the retries would all be turned away meanwhile." },
      { text: "It marks the job done, and the user resubmits", outcome: "The submission would be lost silently: the one thing the requirements forbid." },
    ],
    best: 0, lesson: "Tell our failures from theirs: ours are retried and never become a verdict about the user's code.",
  },
  {
    id: "slow-worker", step: 7, title: "A frozen worker wakes up",
    story: "Worker 1's machine freezes for 6 minutes mid-run. Its 5-minute lease expires, worker 2 claims the row and saves ACCEPTED. Worker 1 wakes, holding a TIME_LIMIT.",
    moves: [
      { text: "Last write wins: TIME_LIMIT replaces ACCEPTED", outcome: "That's exactly the bug the next line of code prevents." },
      { text: "Redis still holds worker 1's lock, so it may write", outcome: "The claim is in Postgres, and it isn't worker 1's any more." },
      { text: "Its save says \"where claimedBy = me\", matches nothing, and is dropped", outcome: "Yes: that's fencing. A write from a past owner must fail, however late it arrives." },
      { text: "The verdict column is unique, so the insert fails", outcome: "It's an update, and verdicts repeat all day long." },
    ],
    best: 2, lesson: "A lease can expire while its owner is asleep, so the final write must check ownership again.",
  },
  {
    id: "redis-after", step: 8, title: "Redis dies after the verdict",
    story: "ACCEPTED is committed in Postgres. The leaderboard update that follows throws.",
    moves: [
      { text: "The job fails and is retried until the board is updated", outcome: "The retry finds the submission already judged, so the claim stops it before that line." },
      { text: "The verdict stands, the error is logged, the board is rebuilt later", outcome: "Yes. The board is derived data: Postgres still holds every solve." },
      { text: "The verdict is rolled back to keep both in step", outcome: "It's committed, and it's true. Never undo a fact to please a cache." },
      { text: "The user sees SYSTEM_ERROR", outcome: "Their code was judged correctly. A missing point isn't a missing verdict." },
    ],
    best: 1, lesson: "Know which store is the truth and which is a view you can rebuild.",
  },
  {
    id: "api-dies", step: 2, title: "The API dies between the row and the job",
    story: "The row is inserted as PENDING. The process is killed before the job is added. Nothing is in the queue.",
    moves: [
      { text: "Postgres notices and adds the job", outcome: "Postgres and Redis don't know about each other." },
      { text: "The browser's polling adds it again", outcome: "Polling only reads: it would show PENDING forever." },
      { text: "BullMQ's attempts: 3 retries it", outcome: "Retries need a job, and there never was one." },
      { text: "Today, nothing: it needs a sweeper that re-enqueues old PENDING rows", outcome: "Right. The row isn't lost, which is why it's written first, but nobody goes looking for it yet." },
    ],
    best: 3, lesson: "Two systems, no shared transaction: write the truth first, then something must look for work that was never queued.",
  },
  {
    id: "worker-dies", step: 6, title: "The worker is killed mid-run",
    story: "kill -9 during the sandbox run. About a minute later BullMQ sees the job stalled and delivers it again. The claim's lease still has four minutes to go.",
    moves: [
      { text: "The new worker waits inside the job for the lease to end", outcome: "It doesn't wait. Look at what happens when the claim returns false." },
      { text: "The claim is refused, the job ends as done, and the row stays JUDGING", outcome: "Yes, and that's a real hole: no later delivery is left to take over once the lease does expire." },
      { text: "The lease is stored in Redis and dies with the worker", outcome: "It's a timestamp in Postgres, and it outlives the process." },
      { text: "The dead worker's release() hands the claim back", outcome: "kill -9 runs no code. release() is for failures you survive." },
    ],
    best: 1, lesson: "A lease only says when a takeover is allowed. Something must still come back and try: compare your timers before you trust them.",
  },
];
