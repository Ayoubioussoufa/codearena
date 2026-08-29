/**
 * Sandboxing & queues — code-writing exercises. Imported by sandbox.ts.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";

const DOC = { slug: "phase-2-execution-sandboxing", label: "Phase 2 — Sandboxing, queues & realtime" };

const dockerRun: Generator = {
  id: "sb-code-dockerrun",
  title: "✍️ Write the hardened docker run",
  generate: () =>
    codeTask({
      genId: "sb-code-dockerrun",
      prompt:
        "Write the `docker run` command for the judge container: no network at all, 256m memory cap, max 64 processes, ALL capabilities dropped, read-only root filesystem, and no privilege escalation. (One command; `judge-image` runs the submission.)",
      language: "bash",
      starter: `docker run --rm \\\n  judge-image`,
      solution: `docker run --rm \\\n  --network none \\\n  --memory 256m \\\n  --pids-limit 64 \\\n  --cap-drop ALL \\\n  --read-only --tmpfs /tmp \\\n  --security-opt no-new-privileges \\\n  judge-image`,
      checks: [
        { re: "--network[= ]none", label: "`--network none` — no route out, period" },
        { re: "--memory[= ]", label: "memory cap (OOM-kill = the MLE verdict)" },
        { re: "--pids-limit[= ]", label: "`--pids-limit` — fork bombs fizzle" },
        { re: "--cap-drop[= ]ALL", flags: "i", label: "drops ALL capabilities" },
        { re: "--read-only", label: "immutable root filesystem" },
        { re: "no-new-privileges", label: "`no-new-privileges` — setuid buys nothing" },
        { re: "--privileged\\b", expect: false, label: "definitely not --privileged" },
      ],
      explanation:
        "Each flag maps to one attack class: network none (exfiltration/DoS), memory + pids limits (resource exhaustion — note the OOM kill doubles as your Memory-Limit-Exceeded verdict), cap-drop ALL (kernel-level actions like raw sockets), read-only + tmpfs (no persistent payloads, scratch space evaporates), no-new-privileges (setuid escalation). Defense in depth means every layer assumes the others might fail — untrusted code gets all of them, always.",
      docRef: DOC,
    }),
};

const idempotentWorker: Generator = {
  id: "sb-code-idempotent",
  title: "✍️ Make the grade worker idempotent",
  generate: () =>
    codeTask({
      genId: "sb-code-idempotent",
      prompt:
        "Queues deliver at-least-once, so this handler WILL occasionally run twice for the same submission. Write it so the second delivery is a harmless no-op: check for an existing result by submission id, bail early, otherwise judge and store.",
      language: "typescript",
      starter: `async function handleGradeJob(job) {\n  // job.submissionId\n}`,
      solution: `async function handleGradeJob(job) {\n  const existing = await prisma.gradeResult.findUnique({\n    where: { submissionId: job.submissionId },\n  });\n  if (existing) return;\n\n  const verdict = await judge(job.submissionId);\n  await prisma.gradeResult.create({\n    data: { submissionId: job.submissionId, verdict },\n  });\n}`,
      checks: [
        { re: "findUnique|findFirst|SETNX|ON CONFLICT", label: "checks whether this submission was already processed" },
        { re: "if\\s*\\([\\s\\S]{0,40}?\\)\\s*\\{?\\s*return", label: "early-returns on a duplicate delivery" },
        { re: "submissionId", label: "keys idempotency on the submission id" },
        { re: "create\\(|upsert\\(", label: "stores the result after judging" },
      ],
      explanation:
        "The submission id is the natural **idempotency key**: 'was #831 already graded?' is a question the database can answer. Check-then-act still has a tiny **race window** — two workers could both pass the 'not found' check at the same instant, before either writes — so production closes it by making `submissionId` UNIQUE (the second `create` then fails cleanly) or with an atomic `INSERT … ON CONFLICT DO NOTHING`. Either way the rule holds: write every job handler as if it *will* run twice, because eventually it will.",
      docRef: DOC,
    }),
};

const backoffFn: Generator = {
  id: "sb-code-backoff",
  title: "✍️ Implement backoff math (runs for real)",
  generate: () =>
    codeTask({
      genId: "sb-code-backoff",
      prompt:
        "Implement `backoffMs(attempt, baseMs)` — exponential backoff where attempt 1 waits `baseMs`, and every further attempt doubles it: `baseMs × 2^(attempt−1)`. Your function is executed against real test cases.",
      language: "javascript",
      starter: `function backoffMs(attempt, baseMs) {\n  // your formula\n}`,
      solution: `function backoffMs(attempt, baseMs) {\n  return baseMs * 2 ** (attempt - 1);\n}`,
      fn: {
        name: "backoffMs",
        tests: [
          { args: [1, 1000], expected: 1000 },
          { args: [4, 1000], expected: 8000 },
          { args: [3, 500], expected: 2000 },
          { args: [6, 250], expected: 8000 },
        ],
      },
      explanation:
        "Attempt 1 → base × 2⁰, attempt 4 → base × 2³: each retry **doubles** the wait, so a struggling service gets rapidly more breathing room instead of a fixed-interval hammering. Production adds two garnishes: a cap (`Math.min(delay, 30_000)`) so the wait can't grow forever, and **jitter** (a little randomness on each delay) so a thousand workers don't retry in synchronized waves. BullMQ's `backoff: { type: \"exponential\" }` is this exact formula.",
      docRef: DOC,
    }),
};

export const sandboxCodeGens: Generator[] = [dockerRun, idempotentWorker, backoffFn];
