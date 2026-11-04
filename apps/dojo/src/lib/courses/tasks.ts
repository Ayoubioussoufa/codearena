/**
 * Today in CodeArena: what to build in the real project each day, right after
 * that day's lessons. Directions, never code: you write every line, test
 * first. Keyed by ISO date; the week plan and the lesson pages show them.
 */
import type { BuildTask } from "./types";

const L = (slug: string) => `/courses/lessons/${slug}`;

export const TASKS: Record<string, BuildTask> = {
  /* ───────────── Week 2 · the judge ───────────── */
  "2026-11-02": {
    title: "Read your worker with new eyes",
    goal: "Before changing the worker, know exactly what it does today: where the port is, what the fake returns, and which of its fields are facts and which is a judgement.",
    steps: [
      "Run the worker's smoke test (`pnpm --filter worker dev`) and find the line it logs.",
      "Open `apps/worker/src/ports/code-runner.port.ts`, `domain/run-result.entity.ts` and `adapters/fake-code.runner.ts`. Draw the dependency arrows on paper: who imports whom?",
      "Answer lesson 1's question in writing: which `RunResult` fields are facts, which is a judgement, which facts are missing?",
    ],
    testsFirst: [],
    doneWhen: [
      "You can say, without looking, why `JudgeService` depends on `CODE_RUNNER` and not on `FakeCodeRunner`",
      "Your facts-vs-judgement answer is in your `done 0001` message",
    ],
    traps: ["Don't change the type yet: lesson 4 gives you the shape, lesson 8 the adapter."],
  },
  "2026-11-03": {
    title: "Give the worker its tests, and accept ADR-006",
    goal: "The worker has no test runner yet. Set one up now, so every later step is test-first, and settle the language decision the migration depends on.",
    steps: [
      "Add Jest to the worker (config + a `test` script). CI already runs `pnpm --filter worker run --if-present test`, so it starts running the moment the script exists.",
      "Write the first unit test: `JudgeService` with the fake bound to `CODE_RUNNER` through a Nest testing module. It's small, but it proves the wiring you read yesterday.",
      "Rewrite `docs/adr/006-leetcode-codeforces-hybrid.md` in your own words and mark it Accepted, or change what you disagree with. Say which language you'd keep if you could keep only one, and why.",
    ],
    testsFirst: ["`JudgeService.run` returns what the bound `CodeRunner` returns (fake runner, no Docker)"],
    doneWhen: [
      "`pnpm --filter worker test` is green locally and in CI",
      "ADR-006 is Accepted, in your words",
    ],
    traps: ["Jest + TypeScript + Nest decorators need `reflect-metadata` imported in the test setup, as in `main.ts`."],
    branch: "test/worker-jest · docs/adr-006-accepted",
  },
  "2026-11-04": {
    title: "Facts, not verdicts: reshape the port, and fix I-18",
    goal: "Make the runner's contract say what lessons 1–4 taught: a runner reports facts (exit code, signal, timeout, output-limit, stdout, stderr, time), and the judge decides the verdict later.",
    steps: [
      "Turn your `RunResult` type from lesson 4 into the worker's domain type: a discriminated union on `outcome`, no `verdict` field.",
      "Update the `CodeRunner` port to take the input (stdin) and limits, and to return those facts.",
      "Update `FakeCodeRunner` so a test can script it: \"return these facts for this call\".",
      "I-18: the web offers JavaScript, but the database's `Language` enum has no `JAVASCRIPT`. Write the migration (expand only: an added enum value), and read the generated SQL before applying it.",
    ],
    testsFirst: [
      "The fake can be scripted to return a timeout, and `JudgeService` passes it through untouched",
      "The type system refuses to read `exitCode` on a timeout (a `// @ts-expect-error` line proves it)",
    ],
    doneWhen: [
      "No `verdict` anywhere in the worker's port or adapter",
      "The migration's SQL is a single `ALTER TYPE … ADD VALUE`",
    ],
    traps: ["`ADD VALUE` on a Postgres enum can't run inside a transaction block in older versions: read what Prisma generated."],
    branch: "refactor/worker-run-facts · fix/i-18-javascript-language",
  },
  "2026-11-05": {
    title: "Test data: three original problems",
    goal: "A judge needs problems with hidden tests. Nothing has any yet. Today you write three original stdin/stdout problems, so tomorrow's runner and Saturday's judge loop have something real to judge.",
    steps: [
      "Write three original problems: statement, input/output format, a reference solution in JavaScript, and about 10 tests each.",
      "Tests include the examples, the edge cases (smallest and largest sizes), and at least one test big enough that a quadratic solution times out.",
      "Calibrate each time limit on your reference solution: measure it, then set the limit at a few times that.",
      "Seed them, with their tests, through the Prisma seed script.",
    ],
    testsFirst: ["A seed test (or script check) asserting each problem has ≥ 10 tests and a time limit"],
    doneWhen: [
      "`pnpm prisma db seed` creates three problems with their tests",
      "For each problem you can name the test that kills an O(n²) solution",
    ],
    traps: ["Windows line endings (`\\r\\n`) in test files: decide now whether `\\r` is part of a token (ADR-006 says how you compare)."],
    branch: "feat/seed-original-problems",
  },
  "2026-11-06": {
    title: "DockerCodeRunner replaces the fake",
    goal: "One fresh, hardened container per run, with every limit from lessons 2–7, running JavaScript, reporting facts. Lesson 8 is your guide.",
    before: [{ label: "Lesson 8", href: L("0008-docker-hardened") }],
    steps: [
      "Decide how the worker talks to Docker (the `docker` CLI through your lesson 4 runner, or the Engine API) and how the code gets in (stdin or a read-only mount, never an argument). Write both decisions down.",
      "Build the adapter on your lesson 4 runner: `spawn(\"docker\", [...flags, image, ...command])`, every hardening flag from lesson 8, the image pinned to an exact tag, a unique container name per run.",
      "The I-17 fix: at the deadline, kill the container through the daemon by its name, then remove it, whatever happened (a `finally`).",
      "Bind `CODE_RUNNER` to the Docker adapter in `WorkerModule`; keep the fake for unit tests.",
    ],
    testsFirst: [
      "Integration (needs Docker, so in its own test file): `console.log(2 + 3)` → exit 0, stdout `5`",
      "An infinite loop → timeout at the limit, and afterwards no container with that run's name exists (the I-17 test)",
      "A program printing forever → output-limit, and the worker is still healthy",
    ],
    doneWhen: [
      "The three integration tests pass",
      "`docker ps -a` shows no leftovers after the whole suite",
    ],
    traps: [
      "Exit 137 means SIGKILL from the OOM killer or from your own timeout: `docker inspect` tells them apart (OOMKilled).",
      "The first run pulls the image: pull it before the tests, or the first one times out.",
      "Jest's default timeout is 5 s; container tests need more.",
    ],
    branch: "feat/worker-docker-runner",
  },
  "2026-11-07": {
    title: "The judge loop, then attack your sandbox",
    goal: "Turn facts into verdicts (lesson 9), then prove containment with six attacks (lesson 10). The adversarial suite is a portfolio artefact on its own.",
    before: [
      { label: "Lesson 9", href: L("0009-facts-to-verdicts") },
      { label: "Lesson 10", href: L("0010-attack-your-sandbox") },
    ],
    steps: [
      "Morning: the token checker as a pure function in the domain, and the judge loop in the application layer (run tests in order, stop at the first failure, record the failing test's number and the slowest time).",
      "Afternoon: `apps/worker/test/adversarial/`: fork bomb, infinite loop, 4 GB allocation, network call, filesystem escape, reading `/etc/passwd`. Each test asserts the verdict *and* that the host is untouched.",
      "Comment each attack with the mechanism that contains it (`--pids-limit`, not \"the sandbox\").",
    ],
    testsFirst: [
      "The checker: a trailing newline, double spaces, `\\r\\n`, empty output, an extra token, each with its expected result",
      "The judge loop against the scripted fake: one test per verdict (AC, WA, TLE, MLE, RE) and stop-at-first-failure with the right test number",
    ],
    doneWhen: [
      "All verdict tests and all six attacks pass",
      "After the suite, `docker ps -a` is empty and the API still answers",
    ],
    traps: ["A user's failure is a verdict; your failure (Docker unreachable) is an error that gets retried. Don't turn one into the other."],
    branch: "feat/worker-judge-loop · test/worker-adversarial",
  },
  "2026-11-08": {
    title: "Checkpoint, and ADR-007: the trust boundary",
    goal: "No new material. Tick the week's checkpoint honestly, and write down what runs untrusted code, what it may touch, and what you rejected.",
    steps: [
      "Go through the week's checkpoint below, box by box. A box is ticked only if it's fully true.",
      "Write ADR-007, the trust boundary: what the worker runs, what a submission can touch, what the Docker socket means, and what you rejected (an in-process VM; plain Docker with defaults; gVisor or Firecracker, stronger and right at scale, rejected for now).",
      "From a blank page, ten minutes, recorded: CodeArena's judge, box by box.",
    ],
    testsFirst: [],
    doneWhen: ["ADR-007 merged", "The checkpoint's boxes are ticked or have a plan"],
    branch: "docs/adr-007-trust-boundary",
  },

  /* ───────────── Week 3 · queue, data, leaderboard ───────────── */
  "2026-11-09": {
    title: "Clean the pipeline's entry: I-3, I-5, and the submissions module",
    goal: "Tomorrow a whole new module goes in. Today, fix the two issues it would trip on, and lay out the module with its four layers, no queue yet.",
    before: [{ label: "Lesson 11", href: L("0011-di-from-scratch") }],
    steps: [
      "I-3: validation errors arrive as \"Bad Request Exception\". Make the exception filter pass the real messages through, with a test that failed first.",
      "I-5: remove the Hello World boilerplate still wired into the app module.",
      "Create `apps/api/src/submissions/` with domain, application, ports and http folders, like problems and auth. Define the ports you'll need: a repository, and \"enqueue a judging job\".",
    ],
    testsFirst: ["e2e: an invalid body to any endpoint returns 400 with a readable message (I-3)"],
    doneWhen: ["I-3 and I-5 closed", "The submissions module compiles with its ports and an empty service"],
    branch: "fix/i-3-validation-messages · chore/i-5-remove-hello-world",
  },
  "2026-11-10": {
    title: "POST /submissions → BullMQ → worker → verdict stored",
    goal: "The full pipeline: the API accepts code and answers 202 at once, a queue carries the job, the worker judges it and writes the verdict.",
    before: [
      { label: "Lesson 12", href: L("0012-request-pipeline") },
      { label: "Lesson 13", href: L("0013-queue-from-scratch") },
    ],
    steps: [
      "Decide how the worker reads submissions and writes verdicts (a shared database package, a client generated from the same schema, or the API doing every write) and write it down.",
      "`POST /submissions`: logged-in user, code size capped, a PENDING row written first, then a job carrying only the submission's id (also used as the job id), then 202 with the id.",
      "`GET /submissions/:id` for the owner only; anyone else gets 404, not 403.",
      "In the worker, the smoke test becomes a queue consumer, with its environment validated by Zod and a clean shutdown on SIGTERM.",
    ],
    testsFirst: [
      "Unit: one job per submission, job id = submission id; an unknown problem is rejected before anything is queued (fake repository, fake queue)",
      "e2e: no token → 401 · valid → 202 · someone else's → 404 · oversized body → 400",
    ],
    doneWhen: ["Submit with Postman, and the verdict appears in the database within a few seconds"],
    traps: [
      "Write the row before you enqueue: the other order fails only under load.",
      "A wrong answer must not throw inside the job, or BullMQ retries it.",
    ],
    branch: "feat/api-submissions-queue",
  },
  "2026-11-11": {
    title: "I-6, then idempotency, retries and the dead-letter queue",
    goal: "Delivering the same job twice must judge once. The technique is the same one that fixes your refresh-token race (I-6): one statement that checks and writes at once.",
    before: [{ label: "Lesson 14", href: L("0014-idempotency") }],
    steps: [
      "I-6: reproduce the race in refresh rotation with two concurrent requests, then fix it with a conditional update that tells you whether you won.",
      "The claim: a conditional update moves the submission out of PENDING, and only the winner runs it. Give the claim an expiry, so a dead worker's claim can be taken over.",
      "Retries with backoff for infrastructure errors only (Docker unreachable, database down), never for a wrong answer.",
      "After the last retry, the submission leaves PENDING for a state you decide and document.",
    ],
    testsFirst: [
      "I-6: two concurrent refreshes with the same token → exactly one succeeds",
      "The same job delivered twice, also concurrently → the runner is called once, one verdict is written",
    ],
    doneWhen: ["Both race tests pass", "An infrastructure error is retried; a wrong answer is not"],
    traps: ["A long run can look stalled to BullMQ: read about the lock duration before your judge gets judged twice."],
    branch: "fix/i-6-rotation-race · feat/worker-idempotent-claim",
  },
  "2026-11-12": {
    title: "A million rows, and the first queries",
    goal: "You can't learn query plans on 50 rows. Seed a realistic database, then measure your first queries.",
    before: [
      { label: "Lesson 15", href: L("0015-how-an-index-works") },
      { label: "Lesson 16", href: L("0016-reading-plans") },
    ],
    steps: [
      "A large seed script: 1M submissions, 50k users, 2k problems, skewed (a few hot problems, most users with few submissions). Use `generate_series`/`COPY`, not a million inserts. Then `ANALYZE`.",
      "Queries 1–3 into `docs/perf/`, each with `EXPLAIN (ANALYZE, BUFFERS)` before and after: problems list (filter + sort), submission history with cursor pagination, the N+1 Prisma generates for \"solved by user\".",
      "I-16: prove the index that can't serve its query, then fix it.",
    ],
    testsFirst: [],
    doneWhen: ["Three before/after plans in `docs/perf/` with measured times and why the fix works"],
    traps: ["Run `ANALYZE` after seeding, or the planner works from stale statistics and your plans lie."],
    branch: "perf/seed-and-first-plans",
  },
  "2026-11-13": {
    title: "The rest of the queries, and the write path's isolation level",
    goal: "Finish the six plans, then choose, with evidence, the isolation level the submission write path needs.",
    before: [{ label: "Lesson 17", href: L("0017-transactions-isolation") }],
    steps: [
      "Queries 4–6: the leaderboard's composite index, a partial index on accepted submissions (proven smaller and faster), and one `$queryRaw` justified in writing.",
      "I-10, I-11, I-15: the pagination and over-fetching issues, now with real data.",
      "Implement the submission write path at the level you chose in lesson 17's lab, with the reason in a comment and the ADR.",
    ],
    testsFirst: ["I-10: deleting the cursor row doesn't end pagination early"],
    doneWhen: ["Six plans in `docs/perf/`", "ADR: six queries, six plans"],
    branch: "perf/six-plans · fix/i-10-i-11-pagination",
  },
  "2026-11-14": {
    title: "The leaderboard, live",
    goal: "A Redis sorted set the worker updates on every Accepted, read in O(log N).",
    before: [{ label: "Lesson 18", href: L("0018-leaderboard") }],
    steps: [
      "Decide the score (problems solved? rating?) and the tie-break, and write them down.",
      "The worker updates the sorted set after the verdict is committed, idempotently (a redelivered job must not count twice).",
      "`GET /leaderboard` (top N) and `GET /leaderboard/me` (rank), behind a port.",
    ],
    testsFirst: [
      "The same Accepted delivered twice moves the score once",
      "Ties break the way you decided",
    ],
    doneWhen: ["The leaderboard reflects a new Accepted within a second", "Checkpoint week 3 ticked"],
    branch: "feat/leaderboard-redis",
  },
  "2026-11-15": {
    title: "Day off",
    goal: "No CodeArena today. Rest is part of the plan.",
    steps: ["Close the laptop."],
    testsFirst: [],
    doneWhen: ["You did nothing, on purpose"],
  },

  /* ───────────── Week 4 · ship it ───────────── */
  "2026-11-16": {
    title: "The problem page and the submit form",
    goal: "The web app's first real judge screen: a problem's statement and a form that submits code to `POST /submissions`.",
    before: [{ label: "Lesson 19", href: L("0019-nextjs-rendering") }],
    steps: [
      "Decide which parts of the problem page are server components (the statement, the examples) and which are client components (the editor, the submit button), and why.",
      "The submit form: a TanStack Query mutation to `POST /submissions`, then navigate to the submission's page.",
      "I-4: `/problems` says \"Could not reach the API\": fix it while you're in these files.",
    ],
    testsFirst: ["The form shows the API's validation message when the code is too long"],
    doneWhen: ["From the browser, a submission is created and you land on its page"],
    branch: "feat/web-submit",
  },
  "2026-11-17": {
    title: "The verdict, live",
    goal: "The submission page shows PENDING, then the verdict, without a reload.",
    before: [{ label: "Lesson 20", href: L("0020-verdict-live") }],
    steps: [
      "Polling first: `GET /submissions/:id` every second until the status leaves PENDING, then stop.",
      "Then, if you choose: push over WebSocket or server-sent events, published after the database write commits.",
      "I-12, I-13, I-14: logout's empty 200, `useMe` as a mutation, and the dead code nobody imports.",
    ],
    testsFirst: ["Polling stops once a verdict arrives (no request after it)"],
    doneWhen: ["Submit in the browser, watch the verdict appear"],
    branch: "feat/web-live-verdict · fix/i-12-i-13-i-14",
  },
  "2026-11-18": {
    title: "A server, and the production Compose file",
    goal: "One small cloud VM running Docker Compose and nothing else: if the sandbox leaks, the VM is all an attacker gets.",
    before: [
      { label: "Lesson 21", href: L("0021-server-from-zero") },
      { label: "Lesson 22", href: L("0022-compose-in-production") },
    ],
    steps: [
      "Create the VM: SSH keys only, a non-root user, a firewall allowing 22, 80 and 443.",
      "Write `docker-compose.prod.yml`: pinned images, secrets from an env file that isn't in git, health checks, restart policies, no ports open but the proxy's.",
      "Bring it up on the VM; run `prisma migrate deploy`.",
    ],
    testsFirst: [],
    doneWhen: ["`curl http://<vm-ip>/health` answers from the VM"],
    traps: ["The worker needs the Docker socket; nothing else does. Mount it into the worker only."],
    branch: "ops/prod-compose",
  },
  "2026-11-19": {
    title: "A domain, and HTTPS",
    goal: "CodeArena at a real name, over HTTPS, with certificates that renew themselves.",
    before: [{ label: "Lesson 23", href: L("0023-https") }],
    steps: [
      "Point a domain (or a free subdomain) at the VM.",
      "Put Caddy in front: it gets and renews the certificate on its own.",
      "Seed the real problems; test the whole flow from your phone.",
    ],
    testsFirst: [],
    doneWhen: ["`https://<your-domain>` works from your phone, with a valid certificate"],
    branch: "ops/caddy-https",
  },
  "2026-11-20": {
    title: "Deploy on merge, and see production",
    goal: "Merging to main deploys by itself, a rollback is one command, and you can see what production is doing.",
    before: [
      { label: "Lesson 24", href: L("0024-ci-cd") },
      { label: "Lesson 25", href: L("0025-observability") },
    ],
    steps: [
      "CI builds images on merge, tags them with the commit, pushes them to GHCR, and deploys over SSH.",
      "Roll back once, on purpose, to the previous tag.",
      "Structured logs, `/health`, Sentry, and a nightly `pg_dump` you've restored once.",
    ],
    testsFirst: [],
    doneWhen: ["A merge reaches production with no manual step", "You restored a backup into a scratch database"],
    branch: "ci/deploy-on-merge · ops/observability",
  },
  "2026-11-21": {
    title: "Real users in",
    goal: "10–20 classmates sign up, submit code, and break things. You fix what they break.",
    steps: [
      "Send the link to your 42 peers with one sentence on what to try.",
      "Watch the logs and Sentry while they use it; write each bug as an issue with steps to reproduce.",
      "Fix the worst two today.",
    ],
    testsFirst: ["Each fix starts with a test that reproduces the bug"],
    doneWhen: ["At least 5 real users have submitted code"],
    branch: "fix/<the bug>",
  },
  "2026-11-22": {
    title: "Checkpoint, and ADR: one VM, the sandbox's blast radius",
    goal: "No new work. Tick the checkpoint, and write the ADR on why one isolated VM.",
    steps: ["Go through the checkpoint below.", "Write the ADR: what an escape would reach, and what you'd change at scale."],
    testsFirst: [],
    doneWhen: ["The ADR is merged"],
    branch: "docs/adr-blast-radius",
  },

  /* ───────────── Week 5 · sharpen ───────────── */
  "2026-11-23": {
    title: "Fixes from users, and STAR stories 1–3",
    goal: "The product gets better from real use; your stories get written from real events.",
    before: [{ label: "Lesson 26", href: L("0026-star-stories") }],
    steps: ["Fix the next bugs from your users' issues.", "Write STAR stories 1–3: the sandbox, the faster query, the idempotent queue."],
    testsFirst: ["A failing test first, for every fix"],
    doneWhen: ["Three stories written, each fits in 90 seconds out loud"],
  },
  "2026-11-24": {
    title: "Polish what an interviewer will click, and STAR stories 4–6",
    goal: "The README, the live demo and the first screen are what an interviewer sees first.",
    steps: ["README: architecture diagram, live link, the three stories in one line each.", "Write STAR stories 4–6: a production bug, a team conflict, a failure."],
    testsFirst: [],
    doneWhen: ["A stranger can understand CodeArena from the README in two minutes"],
  },
  "2026-11-25": {
    title: "Your system, out loud",
    goal: "CodeArena from a blank page in ten minutes, then redesigned for 100× the traffic.",
    before: [{ label: "Lesson 27", href: L("0027-your-system-out-loud") }],
    steps: ["Record yourself, watch it back, note the three weakest moments.", "Polish only what an interviewer would click."],
    testsFirst: [],
    doneWhen: ["A recording you'd show someone"],
  },
  "2026-11-26": {
    title: "Polish",
    goal: "Small, visible improvements only.",
    steps: ["Fix the weakest moment from yesterday's recording, in the product or in the story."],
    testsFirst: [],
    doneWhen: ["One thing visibly better"],
  },
  "2026-11-27": {
    title: "Feature freeze",
    goal: "No new features from today. Only fixes.",
    steps: ["Tag a release.", "Make sure `main` deploys cleanly from scratch."],
    testsFirst: [],
    doneWhen: ["A tagged release in production"],
  },
  "2026-11-28": {
    title: "Stories out loud, timed",
    goal: "Six stories, each 90 seconds, each boring because you've said it so often.",
    steps: ["Time each story; cut until it fits."],
    testsFirst: [],
    doneWhen: ["All six under 90 seconds"],
  },
  "2026-11-29": {
    title: "Sprint retro",
    goal: "What worked, what didn't, what's next.",
    steps: ["Write the retro.", "Plan the next month."],
    testsFirst: [],
    doneWhen: ["A written retro"],
  },
};

export function taskFor(date: string): BuildTask | undefined {
  return TASKS[date];
}
