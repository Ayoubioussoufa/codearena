/**
 * Topic: Sandboxing, queues & realtime (drills docs/phase-2-execution-sandboxing.md).
 */
import { choice, numeric } from "../helpers";
import type { Generator, Topic } from "../types";
import { sandboxCodeGens } from "./sandbox-code";

const DOC = { slug: "phase-2-execution-sandboxing", label: "Phase 2 — Sandboxing, queues & realtime" };

const namespaces: Generator = {
  id: "sb-namespaces",
  title: "Linux namespaces: which isolates what",
  generate: (rng) => {
    const cases = [
      { goal: "the process can't see or signal any host processes", answer: "PID namespace", wrong: ["Network namespace", "Mount namespace", "UTS namespace"], why: "A PID namespace gives the sandbox its own process tree — inside it, the submitted code is PID 1 and the host's processes simply don't exist to enumerate or kill. Network isolation hides interfaces, and mount hides filesystems; neither hides processes." },
      { goal: "the submitted code can't open sockets or reach the internet", answer: "Network namespace", wrong: ["PID namespace", "IPC namespace", "User namespace"], why: "A fresh network namespace starts with only a loopback interface (down, if you like) — there is literally no route out. That's stronger than firewall rules: the syscalls succeed but there's no network to speak to. PID/IPC/user namespaces don't touch connectivity." },
      { goal: "the code sees an empty filesystem instead of the host's", answer: "Mount namespace", wrong: ["PID namespace", "Network namespace", "Cgroup namespace"], why: "Mount namespaces give the process its own mount table; combined with pivot_root onto a minimal image, the host's disk isn't just forbidden — it's unaddressable. The others isolate processes, network and resource visibility, not the filesystem tree." },
      { goal: "root inside the container maps to an unprivileged uid on the host", answer: "User namespace", wrong: ["PID namespace", "Mount namespace", "UTS namespace"], why: "User namespaces remap uid ranges: uid 0 inside can be uid 100000 outside, so 'root' in the sandbox has no host privileges even if it escapes a layer. This is the namespace that defuses whole classes of container-breakout impact." },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "sb-namespaces",
      prompt: `You're sandboxing untrusted submissions. Which namespace ensures ${c.goal}?`,
      correct: c.answer,
      wrong: [...c.wrong],
      explanation: c.why,
      docRef: DOC,
    });
  },
};

const cgroupMath: Generator = {
  id: "sb-cgroups",
  title: "cgroup limits math",
  generate: (rng) => {
    if (rng.chance(0.5)) {
      const quota = rng.pick([25_000, 50_000, 150_000, 200_000] as const);
      const period = 100_000;
      return numeric({
        genId: "sb-cgroups",
        prompt: `cgroup v2 sets \`cpu.max = "${quota} ${period}"\`. How many CPU cores can the sandboxed process use at most? (decimal ok)`,
        answer: quota / period,
        tolerance: 0.001,
        placeholder: "cores",
        explanation: `A **cgroup** ("control group") is a Linux feature that caps how much CPU or memory a group of processes may use. \`cpu.max\` is written as quota/period: this group may use ${quota} microseconds of CPU per ${period} µs window = ${quota / period} core(s). Go over and the process isn't killed — it's **throttled** (paused until the next window). That's exactly right for a judge: a submission stuck in an infinite loop just burns its own time budget, not your whole machine. (Memory behaves differently — see the other variant.)`,
        docRef: DOC,
      });
    }
    const mb = rng.pick([64, 128, 256, 512] as const);
    return numeric({
      genId: "sb-cgroups",
      prompt: `You want to cap a submission at ${mb} MiB of memory. What value (in bytes) goes into \`memory.max\`?`,
      answer: mb * 1024 * 1024,
      tolerance: 0,
      placeholder: "bytes",
      explanation: `${mb} MiB = ${mb} × 1024 × 1024 = ${(mb * 1024 * 1024).toLocaleString("en-US")} bytes (a MiB is 1024×1024, not a round million). Unlike CPU (which just throttles), going over \`memory.max\` triggers the **OOM killer** ("out of memory" — the kernel's process-terminator), but *inside the cgroup* only: the submission dies, the host never feels it. For a judge, that termination literally *is* the "Memory Limit Exceeded" verdict — the safety limit doubles as the grading signal.`,
      docRef: DOC,
    });
  },
};

const dockerHardening: Generator = {
  id: "sb-docker",
  title: "Hardening Docker for untrusted code",
  generate: (rng) => {
    const cases = [
      { goal: "prevent the process from gaining new privileges (e.g. via setuid binaries)", answer: "--security-opt no-new-privileges", wrong: ["--read-only", "--network none", "--pids-limit 64"], why: "no-new-privileges sets a kernel flag that makes execve ignore setuid/setgid escalation — even if a setuid binary exists in the image, running it grants nothing. Read-only filesystems and network none are valuable but address different vectors." },
      { goal: "make the container's root filesystem immutable", answer: "--read-only (with a tmpfs for scratch space)", wrong: ["--cap-drop ALL", "--memory 256m", "--security-opt no-new-privileges"], why: "--read-only mounts the rootfs immutable, so submitted code can't drop persistent payloads or tamper with the runtime; a small tmpfs gives it legitimate scratch space that vanishes afterwards. Capability drops limit *actions*, not filesystem writes." },
      { goal: "remove every kernel capability, then add back only what's needed", answer: "--cap-drop ALL --cap-add <only-what's-needed>", wrong: ["--privileged false", "--user root", "--isolation strict"], why: "Default containers keep a surprising set of capabilities (raw sockets, mknod…). Drop-all-then-add-back inverts the model to allowlisting — the judge container typically needs *none*. `--privileged false` is just the default, `--user root` is the opposite of hardening, and `--isolation strict` isn't a Linux flag." },
      { goal: "stop a fork bomb from exhausting the host's process table", answer: "--pids-limit 64", wrong: ["--memory 256m", "--cpus 0.5", "--restart no"], why: "A fork bomb attacks the process table, not memory or CPU first — `--pids-limit` caps how many processes the container's pids cgroup may hold, so the bomb fizzles at 64. Memory/CPU caps alone famously fail to stop it in time." },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "sb-docker",
      prompt: `Judge hardening: which flag/setting is the right tool to ${c.goal}?`,
      correct: c.answer,
      wrong: [...c.wrong],
      explanation: c.why,
      docRef: DOC,
    });
  },
};

const idempotency: Generator = {
  id: "sb-idempotency",
  title: "At-least-once delivery & idempotency",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "sb-idempotency",
      prompt: variant
        ? "BullMQ delivers a 'grade submission #831' job, the worker finishes, but crashes before acking. The job is redelivered. Without extra care, what happens — and what's the fix?"
        : "Why do queue systems promise at-least-once rather than exactly-once delivery?",
      correct: variant
        ? "The submission is graded twice (double rating update) — make the handler idempotent, e.g. keyed on submission id with an atomic 'already processed' check"
        : "Exactly-once requires the ack and the side effect to commit atomically across systems, which a crash between them makes impossible — so queues redeliver and push deduplication to the consumer",
      wrong: variant
        ? [
            "Nothing — BullMQ automatically deduplicates by payload hash",
            "The second run fails because the job id was consumed",
            "Redis prevents the same job from running twice",
          ]
        : [
            "At-least-once is faster to implement in Redis specifically",
            "Exactly-once exists but costs a license fee in most brokers",
            "Networks guarantee ordered delivery, so duplicates never really occur",
          ],
      explanation:
        "An **'ack'** is the worker telling the queue 'done — you can forget this job.' There's an unavoidable gap between *doing the work* and *sending the ack*: if the worker crashes in that gap, the queue can't tell 'died before working' from 'died after working', so it re-sends the job — that's **at-least-once** delivery. So the *consumer* has to handle duplicates: give each job an **idempotency key** (the submission id) plus an atomic check-and-set ('INSERT … ON CONFLICT DO NOTHING', or Redis `SETNX`) so a repeat run does nothing. **Idempotent** just means 'safe to run twice' — design every handler that way and redelivery becomes boring instead of catastrophic.",
      docRef: DOC,
    });
  },
};

const backoff: Generator = {
  id: "sb-backoff",
  title: "Exponential backoff math",
  generate: (rng) => {
    const base = rng.pick([1, 2, 5] as const);
    const attempt = rng.int(3, 6);
    const answer = base * Math.pow(2, attempt - 1);
    return numeric({
      genId: "sb-backoff",
      prompt: `Retries use exponential backoff: delay = ${base}s × 2^(attempt−1). How many seconds before attempt ${attempt}?`,
      answer,
      tolerance: 0,
      placeholder: "seconds",
      explanation: `${base} × 2^${attempt - 1} = ${answer}s. **Exponential backoff** means each retry waits *double* the previous one. It matters because retry storms are a self-inflicted attack: if a service hiccups and every worker retries at a fixed 1s, that synchronized flood ('thundering herd') just keeps it down. Doubling the gap spreads the load out fast, and real systems also add **jitter** (a little randomness on each delay) so thousands of workers don't all retry on the exact same beat. A **dead-letter queue** (DLQ) is where jobs land after using up all their retries, so a human can look at them.`,
      docRef: DOC,
    });
  },
};

const websockets: Generator = {
  id: "sb-websockets",
  title: "WebSockets vs HTTP for live verdicts",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "sb-websockets",
      prompt: variant
        ? "Why stream judge verdicts over a WebSocket instead of having the client poll GET /submissions/:id every second?"
        : "A user's socket disconnects for 10 s during grading and reconnects. What must the server design account for?",
      correct: variant
        ? "The server can push each state change instantly with no per-poll request overhead or added latency"
        : "Missed events — on reconnect the client must resync current state (or replay from a sequence number), not just resume the stream",
      wrong: variant
        ? [
            "WebSockets are encrypted while HTTP polling is not",
            "Polling can't return JSON payloads",
            "WebSockets bypass the need for authentication",
          ]
        : [
            "Nothing — TCP retransmits whatever was missed during the gap",
            "The browser replays lost WebSocket frames automatically",
            "The server should block grading until the socket returns",
          ],
      explanation:
        "**Polling** (asking 'done yet?' on a timer) trades latency for load: 1-second polls mean up to 1s of staleness *and* N clients × 60 requests/min of mostly-empty answers. A **WebSocket** (a connection kept open both ways) flips it — nothing at rest, an instant push the moment something changes. But that connection isn't a database: any message sent while a client is briefly disconnected is simply *gone* (TCP only guarantees delivery on a *live* connection). So every realtime design needs a **resync** path — 'on reconnect, fetch the current state, then resume applying pushes' — the very pattern your contest leaderboard will use.",
      docRef: DOC,
    });
  },
};

export const sandboxTopic: Topic = {
  id: "sandboxing-queues",
  title: "Sandboxing & queues",
  icon: "📦",
  blurb: "Namespaces, cgroups, Docker hardening, idempotent workers, backoff and realtime delivery — the judge's guts.",
  docSlug: "phase-2-execution-sandboxing",
  docTitle: "Phase 2 — Sandboxing, queues & realtime",
  generators: [
    namespaces,
    cgroupMath,
    dockerHardening,
    idempotency,
    backoff,
    websockets,
    ...sandboxCodeGens,
  ],
};
