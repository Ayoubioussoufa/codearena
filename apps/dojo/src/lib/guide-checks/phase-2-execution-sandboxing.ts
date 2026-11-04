/**
 * Checks for ../../docs/phase-2-execution-sandboxing.md.
 * Checked 3 Nov 2026 against docs.docker.com (engine security, seccomp), the isolate README, and lessons 1–14.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const phase2Checks: GuideCheckSet = {
  name: "Phase 2 guide",
  source: {
    label: "Docker Engine security",
    href: "https://docs.docker.com/engine/security/",
    note: "Docker's own explanation of namespaces, control groups and capabilities, then its [seccomp page](https://docs.docker.com/engine/security/seccomp/). The course lessons 5–10 build each layer by hand.",
  },
  terms: [
    "Threat model",
    "Trust boundary",
    "Namespace",
    "cgroup",
    "Capability",
    "seccomp",
    "Defense in depth",
    "At-least-once delivery",
    "Dead-letter queue",
    "WebSocket room",
  ],
  checks: [
    {
      id: "trust",
      section: "Part A · The trust problem",
      questions: [
        {
          prompt: "A submission prints gigabytes to stdout. Without a defense, what falls over?",
          options: [
            "The database, which stores every line of the output",
            "Your own worker, which buffers the output in memory",
            "The browser, which renders the output as it arrives",
            "The queue, which copies the output into every job",
          ],
          correct: 1,
          why: "The output flood attacks *your* side of the boundary: a worker that buffers stdout grows until it's OOM-killed. The defence is an output cap enforced while reading (count bytes, kill past the limit), never buffering first and checking after.",
        },
        {
          prompt: "How does the trusted worker treat the sandbox it starts?",
          options: [
            "It trusts the exit code the sandbox reports back",
            "It lets the sandbox time itself and report overruns",
            "It shares all its own environment variables with it",
            "It enforces limits from outside and checks the output",
          ],
          correct: 3,
          why: "\"Trust the boundary, not the thing inside it.\" The worker holds the stopwatch (a wall clock the sandbox can't touch), relies on kernel-enforced caps, and validates everything that crosses back. Passing your environment in would hand the attacker your secrets.",
        },
      ],
      explain: "Pick four attacks from the threat table and, for each, say what it does to an unprotected server and which control stops it.",
    },
    {
      id: "primitives",
      section: "Part B · Linux isolation primitives",
      questions: [
        {
          prompt: "What's the difference between namespaces and cgroups?",
          options: [
            "Namespaces limit what it sees; cgroups, how much it uses",
            "Namespaces cap its memory, and cgroups hide the other processes",
            "Namespaces run as root; cgroups run as an unprivileged user",
            "Namespaces need Docker, while cgroups work only on bare processes",
          ],
          correct: 0,
          why: "A namespace gives a process a private view of one resource (its own PID tree, filesystem, network stack). A cgroup is a kernel-enforced budget (memory, CPU, process count). Visibility versus consumption: you need both.",
        },
        {
          prompt: "What stops a fork bomb inside the sandbox?",
          options: [
            "A memory limit: the bomb runs out of memory first",
            "A network namespace, so processes can't talk to each other",
            "A pids limit: the kernel refuses processes past the cap",
            "A seccomp filter: it blocks fork for every process inside",
          ],
          correct: 2,
          why: "`--pids-limit=64` is a cgroup cap on the number of processes: past it, `fork` fails with \"Resource temporarily unavailable\" and the bomb fizzles in its cage. Memory limits and the wall-clock kill are backups, not the primary stop.",
        },
        {
          prompt: "The submission runs as root inside the container. Why does `--cap-drop ALL` still make it much safer?",
          options: [
            "It switches the process to a non-root user automatically",
            "It blocks every system call that needs root privileges",
            "Root with no capabilities can do almost nothing harmful",
            "It moves the container into a separate virtual machine",
          ],
          correct: 2,
          why: "Capabilities split root's power into about 40 switches (`CAP_NET_ADMIN`, `CAP_SYS_ADMIN`…). Drop them all and \"root\" loses its teeth. Add `no-new-privileges` so setuid binaries can't hand powers back, and `--user` so it isn't root at all.",
        },
        {
          prompt: "`while (true) {}` must not run forever. What stops it reliably?",
          options: [
            "A wall-clock kill, enforced by the worker from outside",
            "The submission's own timer, set by the language runtime",
            "A seccomp rule blocking loops longer than a second",
            "The pids limit, capping how long each process lives",
          ],
          correct: 0,
          why: "You never trust the code to time itself: the worker starts a stopwatch and kills the run past the deadline. CPU quotas throttle it meanwhile, and CPU-time limits exist inside, but the outer wall-clock kill is the backstop that always works.",
        },
      ],
      explain: "Explain defense in depth with the seven layers of Part B, saying for each one what it stops and why one layer alone isn't enough.",
    },
    {
      id: "docker",
      section: "Part C · Docker as a sandbox",
      questions: [
        {
          prompt: "Why can you afford a fresh container for every submission?",
          options: [
            "Docker keeps a pool of virtual machines warmed up",
            "Each container reuses one process from the previous run",
            "The image is copied into memory once, then frozen",
            "A container is a process sharing the host kernel",
          ],
          correct: 3,
          why: "A container is a normal Linux process wrapped in namespaces and cgroups: no VM, no second kernel, so it starts in milliseconds. That shared kernel is also the ceiling: a kernel exploit escapes any container, which is when gVisor or Firecracker come in.",
        },
        {
          prompt: "You forget `--network none`. What can the submission reach?",
          options: [
            "Nothing: Docker blocks every network by default",
            "Your Postgres and Redis, by container name",
            "Only the public internet, never your services",
            "Only containers started from the same image",
          ],
          correct: 1,
          why: "Without it, the container joins Docker's default network: it can reach the internet and, on a shared network, your database and Redis by name (SSRF). A compute sandbox needs zero network, so give it zero.",
        },
        {
          prompt: "Why does judging run in a separate worker process instead of inside the API?",
          options: [
            "Its crashes and CPU spikes can't reach the API",
            "A NestJS service is never allowed to spawn processes",
            "The API isn't allowed to read from the database",
            "Workers use a faster language than the API does",
          ],
          correct: 0,
          why: "Blast radius (a hang hits the worker, not the users being served), independent scaling (CPU-heavy and bursty versus I/O-light), no event-loop starvation, and deployment isolation (only the worker needs the Docker socket).",
        },
      ],
      explain: "Explain why \"Docker is not a sandbox by default\", then name five hardening flags and the attack each one closes.",
    },
    {
      id: "queues",
      section: "Part D · Queues and idempotency",
      questions: [
        {
          prompt: "Why can the same judging job be delivered twice?",
          options: [
            "BullMQ hands each job to two separate workers",
            "Redis loses jobs, so BullMQ enqueues them twice",
            "A worker may finish, then die before acknowledging",
            "The API retries the enqueue after every timeout",
          ],
          correct: 2,
          why: "The queue only knows a job is done when the worker says so. Crash after writing the verdict but before acknowledging, and the queue assumes the job died and redelivers it. Exactly-once is effectively impossible across crashes, so handlers must be idempotent.",
        },
        {
          prompt: "The claim uses Prisma's `updateMany` with `status: \"queued\"` in the `where`. Why not `update`?",
          options: [
            "updateMany locks the whole table, so only one worker wins",
            "update throws P2025 on no match, so losers retry forever",
            "update cannot filter on any field other than the id",
            "updateMany is quicker, as it never needs to open transactions",
          ],
          correct: 1,
          why: "On a duplicate delivery the losing worker's `where` matches nothing. `update()` throws `P2025`, BullMQ sees a failed job and retries it, and the guard turns into a retry loop that ends in the DLQ. `updateMany()` returns `{ count: 0 }`, a value you branch on.",
        },
        {
          prompt: "The job is added with `jobId: submissionId`. Is the handler now safe from duplicates?",
          options: [
            "Yes: BullMQ refuses a repeat delivery outright",
            "Yes: Redis deduplicates every job id automatically",
            "No: jobId only works for single-worker queues",
            "No: it blocks repeat enqueues, not redeliveries",
          ],
          correct: 3,
          why: "BullMQ ignores adding a job whose id already exists, which removes duplicate *enqueues*. It does nothing about *redelivery* after a crash, so the handler still needs the early exit and the conditional write.",
        },
      ],
      explain: "Walk through a duplicate delivery of one submission with two workers: the early exit, the conditional write, and why side effects come after `count`.",
    },
    {
      id: "realtime",
      section: "Part E · Realtime with WebSockets",
      questions: [
        {
          prompt: "How do you authenticate a WebSocket connection?",
          options: [
            "On every single message, with a Bearer token attached",
            "Once, at the handshake, before it joins any room",
            "After the first verdict arrives, using the user's cookie",
            "Never: rooms are private, so no check is needed",
          ],
          correct: 1,
          why: "After the upgrade there are no per-message headers. Verify the token once in the gateway's connection handler, and reject unauthenticated sockets before they can subscribe; an open subscription is a data leak and a DoS vector.",
        },
        {
          prompt: "A slow phone can't receive verdict updates as fast as the server sends them. Which policy is wrong?",
          options: [
            "Dropping the intermediate updates, keeping the latest one",
            "Queueing a few updates, then dropping the oldest",
            "Disconnecting the client once it falls far behind",
            "Buffering everything for that client, without a limit",
          ],
          correct: 3,
          why: "An unbounded send buffer lets one bad connection grow the server's memory without limit. Drop (fine when only the latest matters), cap the queue, or disconnect: all three are defensible; unbounded isn't.",
        },
      ],
      explain: "Compare polling, SSE and WebSockets for streaming per-test-case verdicts, and say how rooms keep one user's verdicts away from everyone else.",
    },
    {
      id: "failure",
      section: "Parts F–G · Failure engineering and the runner",
      questions: [
        {
          prompt: "Why add jitter to exponential backoff?",
          options: [
            "So failed jobs don't retry at the same instant",
            "So the first retry happens sooner than one second",
            "So a job never retries more than three times",
            "So the worker can skip jobs that keep failing",
          ],
          correct: 0,
          why: "Without jitter, every job that failed in the same outage retries in lockstep (1 s, 2 s, 4 s…) and the herd hits the recovering dependency together. A small random offset spreads them out.",
        },
        {
          prompt: "A malformed job fails on every attempt. What happens after N tries?",
          options: [
            "It's retried forever, with longer and longer waits",
            "It's silently deleted, so live jobs keep flowing",
            "It moves to a dead-letter queue for inspection",
            "It blocks the queue until somebody fixes it",
          ],
          correct: 2,
          why: "A dead-letter queue keeps poison jobs out of the live flow while keeping them visible and recoverable: an alert fires and a human looks. Retrying forever wastes capacity; dropping silently hides failures.",
        },
        {
          prompt: "The runner has no `child.on('error')` listener, and the Docker daemon is down. What happens?",
          options: [
            "spawn returns null, and the runner reports a timeout",
            "The promise rejects, and the job's try/catch handles it",
            "The unhandled error event crashes the whole worker process",
            "Node retries the spawn until the daemon comes back",
          ],
          correct: 2,
          why: "`spawn` reports \"never started\" as an `'error'` event, and an unhandled `'error'` event is re-thrown, taking down the whole process. It never becomes a rejection, so `try/catch` around `await` can't catch it. One listener turns it into a retryable `SPAWN_FAILED`.",
        },
      ],
      explain: "Trace a worker crash mid-judge: what the user sees, what the queue does, and why the final verdict write must be one atomic update.",
    },
  ],
};
