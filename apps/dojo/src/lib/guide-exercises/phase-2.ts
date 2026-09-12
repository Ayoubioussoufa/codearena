/**
 * Exercises for Phase 2 — sandboxing, queues and realtime.
 *
 * Everything here is adversarial or concurrent, which means the failures are
 * the ones a passing test will not show you: a container that looks isolated
 * and is not, a job that runs twice, a retry that charges a user twice.
 */
import type { GuideExercise } from "./types";

export const phase2Exercises: GuideExercise[] = [
  {
    id: "hostile-submission",
    title: "Name the defence for each attack",
    prompt:
      "For each thing a hostile submission could do, name the mechanism that stops it. One per line.",
    language: "text",
    given: `1. while (true) {}
2. allocating 8 GB
3. fork bombing
4. reading /etc/passwd on the host
5. POSTing the flag to their own server
6. writing 50 GB to disk`,
    starter: `1.
2.
3.
4.
5.
6.
`,
    solution: `1. a CPU time limit (cgroups cpu, plus a wall-clock kill)
2. a memory limit (cgroups memory.max) — the process is OOM-killed
3. a process limit (cgroups pids.max)
4. mount/PID namespaces — a read-only rootfs with nothing of the host in it
5. no network at all (--network=none)
6. a disk quota, or a read-only filesystem with a small tmpfs
`,
    hint: "Two families do all the work. Namespaces decide what a process can SEE; cgroups decide how MUCH it can use.",
    explanation:
      "**Namespaces are visibility; cgroups are quantity.** Getting that split straight makes the whole design obvious: anything of the form 'it can see something it shouldn't' is a namespace, and anything of the form 'it used too much' is a cgroup. Item 5 is the one to be strict about — `--network=none` is the only real answer, because an egress filter is an arms race and a submission that can reach the network can exfiltrate test cases, mine, or attack your other services. Item 3 is the one people forget, and a fork bomb takes the host down without it.",
    checks: [
      { re: "1\\.[^\\n]*(cpu|time)", flags: "mi", label: "1 — CPU/time limit" },
      { re: "2\\.[^\\n]*(memor|cgroup|oom)", flags: "mi", label: "2 — memory limit" },
      { re: "3\\.[^\\n]*(pid|process)", flags: "mi", label: "3 — process limit" },
      { re: "4\\.[^\\n]*(namespace|mount|rootfs|chroot)", flags: "mi", label: "4 — namespaces" },
      { re: "5\\.[^\\n]*(network|net=none|none)", flags: "mi", label: "5 — no network" },
      { re: "6\\.[^\\n]*(disk|quota|read.only|tmpfs)", flags: "mi", label: "6 — disk limit" },
    ],
  },

  {
    id: "docker-run-hardened",
    title: "Harden the run command",
    prompt:
      "This runs a submission with Docker's defaults, which are not a sandbox. Add the flags that make it one.",
    language: "bash",
    given: `# Available: --network, --memory, --cpus, --pids-limit,
#            --read-only, --cap-drop, --security-opt, --user, --tmpfs`,
    starter: `docker run --rm \\
  -v /tmp/submission:/code \\
  judge-runner:node20 \\
  node /code/main.js
`,
    solution: `docker run --rm \\
  --network=none \\
  --memory=256m \\
  --cpus=1 \\
  --pids-limit=64 \\
  --read-only \\
  --tmpfs /tmp:size=16m \\
  --cap-drop=ALL \\
  --security-opt=no-new-privileges \\
  --user 1000:1000 \\
  -v /tmp/submission:/code:ro \\
  judge-runner:node20 \\
  node /code/main.js
`,
    hint: "Nine flags. The mount also needs one more character — right now the submission can rewrite its own source, and anything else in that directory.",
    explanation:
      "**Docker is not a sandbox by default**: a container shares the host kernel, starts as root inside, keeps a large capability set, and has unrestricted network and memory. Each flag closes one of those. `--cap-drop=ALL` matters more than it looks — root-in-container with default capabilities is a short hop from root-on-host via a kernel bug. `no-new-privileges` stops a setuid binary regaining what you dropped. And `:ro` on the mount is the one-character fix: without it a submission can modify the files you are about to judge.",
    checks: [
      { re: "--network[= ]none", label: "no network" },
      { re: "--memory[= ]", label: "memory capped" },
      { re: "--cpus[= ]|--cpu-quota", label: "CPU capped" },
      { re: "--pids-limit[= ]", label: "process count capped — stops a fork bomb" },
      { re: "--read-only", label: "read-only root filesystem" },
      { re: "--cap-drop[= ]ALL", label: "all capabilities dropped" },
      { re: "no-new-privileges", label: "cannot regain privileges" },
      { re: "--user\\s", label: "runs as a non-root user" },
      { re: "/code:ro", label: "the code mount is read-only" },
    ],
  },

  {
    id: "why-a-worker",
    title: "Say why judging cannot happen in the request",
    prompt:
      "Give three independent reasons the judge runs in a separate worker rather than inside the HTTP handler.",
    language: "text",
    given: `// The naive version: POST /submissions runs the code and returns the result.`,
    starter: `1.
2.
3.
`,
    solution: `1. Time — judging takes seconds; an HTTP request that blocks that long ties up a connection and will hit a proxy or client timeout.
2. Load — a burst of submissions would consume every API process, so a contest spike takes down login and browsing too.
3. Isolation — the judge needs privileged, risky execution; keeping it out of the API means a sandbox escape lands somewhere that holds no secrets and no database credentials.
`,
    hint: "One reason is about latency, one is about capacity, and one is about blast radius. The third is the one interviewers push on.",
    explanation:
      "The first two are performance arguments and the third is a security one, which is why the split is not negotiable. The API process holds your database credentials and your JWT secret — a submission escaping a sandbox that runs inside it gets all of that. A worker on separate infrastructure with no credentials gets a machine you can rebuild. **Design for the escape happening, not just for preventing it**, and the failure becomes survivable rather than fatal.",
    checks: [
      { re: "time|timeout|second|block", flags: "i", label: "names the latency problem" },
      { re: "load|capacity|burst|spike|throughput", flags: "i", label: "names the capacity problem" },
      { re: "isolat|escape|secret|credential|blast", flags: "i", label: "names the blast radius" },
    ],
  },

  {
    id: "idempotent-worker",
    title: "Make the job safe to run twice",
    prompt:
      "BullMQ guarantees at-least-once delivery, so this handler will eventually run twice for the same submission. Make that harmless.",
    language: "typescript",
    given: `// Submission has a unique id. A result row has submissionId @unique.
// prisma.result.create throws P2002 on a duplicate.`,
    starter: `async process(job: Job<{ submissionId: string }>) {
  const submission = await this.repo.findById(job.data.submissionId);
  const result = await this.runner.run(submission.code, submission.language);

  await this.prisma.result.create({
    data: { submissionId: submission.id, ...result },
  });
  await this.rating.applyFor(submission.userId, result);
}
`,
    solution: `async process(job: Job<{ submissionId: string }>) {
  const existing = await this.prisma.result.findUnique({
    where: { submissionId: job.data.submissionId },
  });
  if (existing) return existing; // already judged — nothing to do

  const submission = await this.repo.findById(job.data.submissionId);
  const result = await this.runner.run(submission.code, submission.language);

  return this.prisma.$transaction(async (tx) => {
    const saved = await tx.result.upsert({
      where: { submissionId: submission.id },
      create: { submissionId: submission.id, ...result },
      update: {},
    });
    await this.rating.applyFor(submission.userId, result, tx);
    return saved;
  });
}
`,
    hint: "A check at the top is not enough on its own — two workers can pass it at the same moment. The unique constraint has to be the thing that actually decides.",
    explanation:
      "**At-least-once means exactly this job body will run twice, so it must be safe to.** The early return handles the common case cheaply. The `upsert` handles the race the early return cannot: two workers both see no result, both judge, and only the unique constraint stops the second write. And the rating update must be in the same transaction — otherwise a retry that fails partway leaves a rating applied for a result that was never saved, which is the kind of corruption nobody notices for weeks.",
    checks: [
      { re: "findUnique|findFirst", label: "checks whether it is already done" },
      { re: "return\\s+existing|if\\s*\\(existing\\)", label: "returns early when it is" },
      { re: "upsert|catch", label: "handles the race the check cannot" },
      { re: "\\$transaction", label: "the result and the rating move together" },
      { re: "tx\\.", label: "the writes use the transaction handle" },
    ],
  },

  {
    id: "retry-backoff",
    title: "Configure retries that do not make it worse",
    prompt:
      "Configure the queue: five attempts, exponential backoff starting at one second, keep failed jobs for inspection, and drop completed ones after a hundred.",
    language: "typescript",
    given: `new Queue('judge', { connection, defaultJobOptions: { ... } })`,
    starter: `defaultJobOptions: {
  // TODO
}
`,
    solution: `defaultJobOptions: {
  attempts: 5,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: 100,
  removeOnFail: false,
}
`,
    hint: "Failed jobs are evidence. Completed ones are just memory.",
    explanation:
      "Fixed-delay retries are how a struggling dependency gets finished off: every failed job retries at the same instant, the thundering herd arrives together, and the outage extends itself. Exponential backoff spreads them out (1s, 2s, 4s, 8s…) and gives the dependency room to recover. `removeOnFail: false` matters for a different reason — **a failed job is the only record of what went wrong**, and deleting it means debugging from logs alone. Completed jobs have no such value, so cap them before Redis fills.",
    checks: [
      { re: "attempts\\s*:\\s*5", label: "five attempts" },
      { re: "type\\s*:\\s*'exponential'", label: "exponential backoff" },
      { re: "delay\\s*:\\s*1000", label: "starting at one second" },
      { re: "removeOnComplete\\s*:\\s*100", label: "caps completed jobs" },
      { re: "removeOnFail\\s*:\\s*false", label: "keeps failures for inspection" },
    ],
  },

  {
    id: "websocket-rooms",
    title: "Scope who hears the result",
    prompt:
      "This broadcasts every submission result to every connected client. Fix it so only the submitter receives theirs.",
    language: "typescript",
    given: `// socket.join(room) / server.to(room).emit(event, payload)
// The client's JWT has been verified and socket.data.userId is set.`,
    starter: `@SubscribeMessage('subscribe')
handleSubscribe(client: Socket) {
  // nothing
}

notifyResult(submission: Submission, result: Result) {
  this.server.emit('result', { submissionId: submission.id, result });
}
`,
    solution: `@SubscribeMessage('subscribe')
handleSubscribe(client: Socket) {
  const userId = client.data.userId as string;
  void client.join(\`user:\${userId}\`);
}

notifyResult(submission: Submission, result: Result) {
  this.server
    .to(\`user:\${submission.userId}\`)
    .emit('result', { submissionId: submission.id, result });
}
`,
    hint: "A room is just a string. Name it after the thing it scopes, and derive the name on the server from verified data — never from what the client asks for.",
    explanation:
      "`server.emit` is a broadcast to everyone connected — so every user watches every other user's results, including whether their solution failed. Rooms scope it. The security detail is where the room name comes from: taking it from the client's message lets anyone send `subscribe: { room: 'user:someone-else' }` and listen in. **Derive it from the authenticated identity on the socket**, which is why the connection has to be authenticated before any of this — a WebSocket handshake needs its own auth, and the HTTP guard does not cover it.",
    checks: [
      { re: "client\\.join\\(", label: "joins a room" },
      { re: "client\\.data|socket\\.data", label: "takes the identity from the verified socket" },
      { re: "\\.to\\(", label: "emits to the room, not everyone" },
      { re: "this\\.server\\.emit\\(", expect: false, label: "no global broadcast left" },
    ],
  },

  {
    id: "at-least-once",
    title: "Explain the delivery guarantee",
    prompt:
      "In two lines: why does BullMQ deliver at-least-once rather than exactly-once, and what does that force you to do?",
    language: "text",
    given: `// A worker picks up a job, runs it for 8 seconds, then the process is killed
// before it can acknowledge completion.`,
    starter: `1. why not exactly-once:
2. what it forces:
`,
    solution: `1. why not exactly-once: the queue cannot tell "the worker died before finishing" from "the worker finished but died before acknowledging", so it must re-deliver — and exactly-once across two systems is impossible without distributed transactions nobody wants.
2. what it forces: every handler must be idempotent, so running twice produces the same result as running once.
`,
    hint: "Put yourself in the queue's position. The worker went silent. What actually happened, and can you tell?",
    explanation:
      "The queue sees silence and cannot distinguish the two cases, so the only safe choice is to re-deliver. Any system claiming exactly-once is really doing at-least-once plus deduplication somewhere — which is the same work, moved. **So idempotency is not an optimisation, it is the price of using a queue at all.** In practice that means a unique key per unit of work and a database constraint that makes the second attempt a no-op rather than a duplicate.",
    checks: [
      { re: "cannot tell|can't tell|indistinguish|unable to|no way to know", flags: "i", label: "explains the queue cannot distinguish the cases" },
      { re: "idempoten", flags: "i", label: "names idempotency as the consequence" },
      { re: "twice|again|re-?deliver|retry", flags: "i", label: "connects it to re-delivery" },
    ],
  },

  {
    id: "dlq",
    title: "Decide what to retry",
    prompt:
      "For each failure write `retry` or `dead-letter`, with one clause of reasoning.",
    language: "text",
    given: `1. Redis connection refused
2. the submission's language is not supported
3. the sandbox timed out after 10 seconds
4. the submission row no longer exists`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. retry — transient infrastructure; it will come back
2. dead-letter — deterministic; it will fail identically every time
3. retry once, then dead-letter — could be a slow host, but is probably an infinite loop in the submission
4. dead-letter — the work is meaningless now; retrying cannot help
`,
    hint: "Ask of each: would running this again, unchanged, plausibly succeed? If not, retrying is just burning the queue.",
    explanation:
      "**Retry what is transient; dead-letter what is deterministic.** Retrying a deterministic failure five times with backoff wastes twenty seconds of worker time to reach the same answer, and at volume that is a self-inflicted outage. Case 3 is the judgement call and the interesting one: a timeout is ambiguous, so one retry distinguishes a slow host from a genuine infinite loop — and if it times out twice, the submission is the problem and the result is a legitimate verdict rather than a failure.",
    checks: [
      { re: "1\\.[^\\n]*retry", flags: "mi", label: "1 — retry, it is transient" },
      { re: "2\\.[^\\n]*dead", flags: "mi", label: "2 — dead-letter, it is deterministic" },
      { re: "3\\.[^\\n]*retry", flags: "mi", label: "3 — retry at least once" },
      { re: "4\\.[^\\n]*dead", flags: "mi", label: "4 — dead-letter" },
    ],
  },
];
