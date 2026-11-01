# Week 2 · Mon 2 → Sun 8 Nov 2026: the judge

**The build is SPRINT's week 2, unchanged:** code submitted in the browser runs in a hardened
container, goes through a queue, and the verdict appears live. **What's added is revision, one step
a day:** each morning you re-learn the part of your existing code that the day's build stands on,
and fix its issues, before writing anything new.

As always: this guide gives you the steps, the reasons, the tests to write first and the traps.
**It gives you no code.** You type every line.

---

## The day

CodeArena comes right after the review, while your head is fresh. CP comes last because you enjoy
it even when tired.

| Time | Block | What |
|---|---|---|
| 09:00–09:30 | ① Review | the dojo's `/practice/review` queue and today's rows in `~/cp/misses.md`. **Never cut** |
| 09:30–10:30 | ④a **Revise and fix** | the day's part of `docs/revision/`, answered out loud, plus its issues |
| 10:30–11:30 | ④b Learn | the day's new material, with the code open |
| 11:30–12:30 | ⑤ Build | first hour |
| 12:30–13:30 | lunch | away from the screen |
| 13:30–16:00 | ⑤ Build | the rest |
| 16:00–16:30 | ⑥ Write | the PR description, notes, today's boxes ticked |
| 16:30–17:00 | break | |
| 17:00–18:00 | ③ System design | the day's section, then explained out loud without notes |
| 18:00–20:30 | ② CP | the day's block |

**When a day collapses**, cut in this order: ⑤ build → ④b learn → ③ → ②. **Never** ① or ④a: the
revision is the week's new promise to yourself.

**Every piece of build work** follows the team routine from Monday: an issue with acceptance
criteria, a branch, small commits that say *why*, a PR with the template filled in, and CI green
before merging.

## The week at a glance

| Day | ④a Revise and fix | ④b Learn | ⑤ Build (SPRINT) | ③ System design | ② CP |
|---|---|---|---|---|---|
| **Mon 2** | git and team setup · Part 4 §1 and §3 · **I-1**, I-4, I-17 | `phase-2` A–B | `DockerCodeRunner`: one hardened container per run, limits, JS runner | Asynchronous work & message queues | 05 · Prefix Sums |
| **Tue 3** | Part 4 §4 (accept ADR-006) · Part 3 §1 · I-18 | `phase-2` C + G | Python runner, verdicts against test cases (AC/WA/TLE/MLE/RE), seccomp | Task queues & back pressure | 06 · Stacks |
| **Wed 4** | Part 1 §3–4 · I-3, I-5 | `phase-2` D.1, D.2, D.4 | `POST /submissions` → BullMQ → worker → verdict stored | Communication: how the pieces talk | 07 · Binary Search |
| **Thu 5** | Part 2 §4 · **I-6**, then I-8, I-9 | `phase-2` D.3, E, F.1–F.2 | retries, DLQ, **the idempotency test**, WebSocket push | Rate limiting · Availability patterns | 08 · Sorting & Greedy |
| **Fri 6** | Part 3 §2–3 · I-12, I-13, I-14 | the TanStack docs below | web: submit → the verdict appears live | Scaling the database | 09 · Linked Lists & Recursion |
| **Sat 7** | Part 1 §2 (tooling) | `phase-2` F.3 | **attack your sandbox** (6 tests) · failure modes | Worked design #2, the code-submission judge, out loud | Div. 3 virtual contest + upsolve |
| **Sun 8** | Part 5, the blank page with the judge in it | | checkpoint · ADR-007 and ADR-008 | (mock coding interview) | Checkpoint 2 |

The pieces connect. The queue topics in your system-design hour on Monday and Tuesday are what you
build on Wednesday and Thursday. Thursday morning's I-6 fix (one atomic conditional update) is the
same technique as Thursday afternoon's idempotency. Your Saturday design out loud is your own
judge.

**Carried over from week 1**, if not done: CP Block 04 goes into Saturday's upsolving hour. Worked
design #3 (rate limiter) goes into Thursday's system-design hour, which is about rate limiting
anyway.

### Where every issue goes

| Issue | When |
|---|---|
| I-1, I-4, I-17 | Monday |
| I-18 | Tuesday (the migration) |
| I-3, I-5 | Wednesday |
| I-6 (mandatory), I-7 (discussion), I-8, I-9 | Thursday |
| I-12, I-13, I-14 | Friday |
| I-2 | week 4, with the Dockerfile |
| I-10, I-11, I-15, I-16 | week 3, with the SQL work |

---

## Monday 2 Nov: the Docker runner

### ④a Revise and fix (1h, it runs over today, and that's expected)

**Step 0: get Git straight (about 30 minutes).** Your September work still isn't on `main`, and
this week's PRs need it there.

Where you start (checked on 1 Nov): the refresher work is committed on `docs/revision-week`
(three commits, pushed), but `main` on GitHub is still the old August history.

1. Commit this guide (`docs/weeks/` and the two README updates) on `docs/revision-week`, and push.
2. Run SPRINT's three commands (`~/bcgx-prep/SPRINT.md`, week 1). They publish your September work
   as `main`. Run `git switch main` **before** the third one: `reset --keep` moves whatever branch
   you're on.
3. **Expect CI to go red on `main`.** That's I-1, and your first PR fixes it.
4. Now protect `main` (Settings → Branches: PRs only, CI required, no force-push). Do it **after**
   step 2, because protection would block SPRINT's force-push.
5. Add `.github/pull_request_template.md` (*What · Why · How I tested it · Security notes*), and
   open this week's issues: one per build day, with SPRINT's *done when* lines as acceptance
   criteria.
6. Merge order: the I-1 PR first (its branch starts from `main`). Then open the PR for
   `docs/revision-week`, bring it up to date with `main` (merge or rebase: `git-workflow.md`
   Part 4 says when to use which) so its CI goes green, then merge it.

**Then the revision:**

- [Part 4](../revision/4-judge.md) §1 (Q1–Q4, the worker you already have) and §3 (the sandbox by
  hand: every `docker run` predicted, then run).
- **I-17:** explain, in writing, why killing `docker run` doesn't stop the container. Today's
  build depends on that answer.
- **I-4** if there's time: a fresh clone must know where the API lives.

### ④b Learn (1h)

`docs/phase-2-execution-sandboxing.md` Parts **A and B**: the threat model, namespaces, cgroups,
capabilities and seccomp. Do the two exercises in Part A before writing any code. They *are* the
design.

> 📚 **Docs for today:** [docker container run reference](https://docs.docker.com/reference/cli/docker/container/run/)
> · [Docker Engine security](https://docs.docker.com/engine/security/) ·
> [Node.js child_process](https://nodejs.org/api/child_process.html) (`spawn`, never `exec` with a
> string) · [dockerode](https://github.com/apocas/dockerode), if you choose the API route ·
> [Jest: Getting started](https://jestjs.io/docs/getting-started).
> 🎥 Optional and excellent: *"Containers From Scratch"* by Liz Rice (GOTO 2018), where she builds
> a container with namespaces live, in about 40 minutes.

### ⑤ Build: `DockerCodeRunner` replaces the fake runner

**The goal:** one fresh, hardened container per run, with limits, running JavaScript.

**Decisions to make first** (write each one down in your PR):

1. **How does the worker talk to Docker:** spawning the `docker` CLI, or the Engine API
   (`dockerode`)? The CLI uses the exact flags you ran by hand; the API gives structured errors
   and no shell. Either way, arguments go as an **array**, never as one string a shell will parse.
2. **How does the code get in?** Not as a command-line argument: it would show up in `ps`, and
   long code would hit argument-length limits. A file in a temporary folder mounted **read-only**
   is the usual answer. The test input goes in through stdin.
3. **What does the runner return?** Today `RunResult` contains a `verdict`. But "Wrong Answer" is
   a judgement, and the adapter's job is to report **facts**: exit code, stdout, stderr, duration,
   killed for time, killed for memory. The application layer turns facts into a verdict
   (tomorrow). That's the dependency rule from part 1, Q15, applied to new code.

**Steps:**

1. The issue, then a branch.
2. **Tooling for the worker first** (your build-from-scratch practice). The worker has no tests,
   lint-staged doesn't watch it, and CI doesn't run its tests. Give it a Jest setup, a `test`
   script, a lint-staged entry and a CI step.
3. Reshape the port around your answers to decisions 2 and 3. Keep `FakeCodeRunner` working: it's
   your unit-test double.
4. The adapter: every hardening flag from part 4 §3, the image **pinned to an exact tag**, a
   **unique container name per run**, a wall-clock timer that kills **the container** (I-17), an
   output cap (a program printing forever must not fill your memory), and cleanup in a `finally`
   that removes the container and the temporary folder whatever happened.
5. Bind `CODE_RUNNER` to the Docker adapter in `WorkerModule`.

**Tests first** (integration tests: they need Docker, so name them so you can run them apart):

- [ ] `console.log(2 + 3)` → stdout `5`, exit code 0
- [ ] an infinite loop → killed at the limit, and afterwards **no container with that run's name
  exists** (that's the I-17 test)
- [ ] a program printing without end → stopped at the output cap, and the worker is still healthy

<details><summary>Traps</summary>

- An exit code of 137 means SIGKILL. That can be the OOM killer **or your own timeout**. You
  need a second fact to tell them apart.
- `--rm` and your kill can race. Cleanup has to work whether or not the container still exists.
- The first run pulls the image, and that takes seconds. Pre-pull it, or your first test times out.
- Timing around `docker run` includes the container's start-up (hundreds of milliseconds). Decide
  what `runtimeMs` should mean before users see it.
- Jest's default timeout is 5 seconds, and a container-based test can need more.

</details>

**Done when:** the three tests pass locally, the worker's unit tests run in CI, and the PR explains
decisions 1–3.

### ⑥ Write (30 min)

The PR description. One line in the issue for each decision.

---

## Tuesday 3 Nov: Python, and real verdicts

### ④a Revise and fix (1h)

- [Part 4](../revision/4-judge.md) §4 (Q9–Q16), then **ADR-006: rewrite it in your words and mark
  it Accepted** (or change what you disagree with). Today's migration depends on it. It suggests
  Python before JavaScript; SPRINT has JS first and makes Python the cuttable item. Decide which
  one you'd keep if the week runs short, and say why in the ADR.
- [Part 3](../revision/3-data-and-web.md) §1 (Q1–Q9: the schema and migrations).
- **I-18** is fixed by today's migration.

### ④b Learn (1h)

`phase-2` **Part C** (Docker as a sandbox, why a separate worker) and **Part G** (the toy runner,
as a shape to compare against yours).

> 📚 [Seccomp security profiles for Docker](https://docs.docker.com/engine/security/seccomp/) ·
> [testlib](https://github.com/MikeMirzayanov/testlib), Codeforces' own checker library: its
> `wcmp` checker *is* your token checker · [Prisma docs](https://www.prisma.io/docs): "Prisma
> Migrate" and "Seeding".

### ⑤ Build: Python runner, verdicts against test cases, seccomp

**Steps:**

1. **The migration** (ADR-006's requirements): the missing language, `MEMORY_LIMIT`, per-problem
   limits, the failing test's number. Expand only: defaults or nullable. Read the generated SQL
   before applying it.
2. **Test data.** Nothing has hidden tests yet. Write **three original stdin/stdout problems**,
   each with a statement, a reference solution in Python, and about 10 tests: the examples, the
   edge cases (minimum and maximum sizes), and at least one test big enough that a quadratic
   solution times out. Seed them. Remember Part 3 Q9: does your seed update tests that change?
3. **The token checker**, as a pure function in the domain.
4. **The judge loop** in the application layer: run the tests in order, turn each run's facts into
   a result, **stop at the first failure**, and record the failing test's number and the slowest
   time.
5. **Python** as a second language in the adapter.
6. **seccomp:** prove that Docker's default profile is applied to your containers (`docker info`,
   then `docker inspect`), and be able to name what it blocks. A custom, stricter profile is
   *cuttable*.

**Tests first:**

- [ ] the checker, as a table of cases: a trailing newline, double spaces, `\r\n` from a file written
  on Windows, an empty output, an extra token → each with the expected result
- [ ] the judge service against the **fake** runner, scripted with facts: one test per verdict
  (AC, WA, TLE, MLE, RE), plus stop-at-first-failure with the right test number
- [ ] integration: the reference solution → AC; a deliberately wrong one → "WA on test N"; the
  quadratic one → TLE; a memory hog → MLE; `raise` → RE

<details><summary>Traps</summary>

- A test file written on Windows ends lines with `\r\n`. Your checker sees `\r` as part of a token
  unless you decide otherwise.
- Python starts slower than Node and runs slower. Calibrate each time limit against **your
  reference solution's** time, not against a guess.
- A runtime error writes a traceback to stderr. Cap stderr like stdout, and never show another
  user's stderr.
- The web's display mapping (`EASY` → `"Easy"`) lives in the controller. New enum values need the
  same treatment.

</details>

**Done when:** all three test groups are green, and the migration's SQL is a plain `ADD COLUMN` /
`ADD VALUE`.

---

## Wednesday 4 Nov: submissions through the queue

### ④a Revise and fix (1h)

- [Part 1](../revision/1-skeleton.md) §3–4 (Q9–Q21: the skeleton, ports and adapters). You're about
  to write a whole new module with that shape.
- **I-3:** your new DTO's errors must reach the client as real messages, so fix the filter first.
- **I-5:** remove the Hello World boilerplate.

### ④b Learn (1h)

`phase-2` **D.1** (why you can't judge inside the request), **D.2** (BullMQ), **D.4** (why not
Kafka). That last one is half of Sunday's ADR-008.

> 📚 [BullMQ docs](https://docs.bullmq.io/): Queues, Workers, Jobs and **Job Ids**, and the page
> on connections (read about `maxRetriesPerRequest` before your worker crashes on start-up) ·
> [NestJS: Queues](https://docs.nestjs.com/techniques/queues) ·
> [MDN: 202 Accepted](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202).

### ⑤ Build: `POST /submissions` → BullMQ → worker → verdict stored

**Decisions first:**

1. **How does the worker read submissions and tests, and write verdicts?** It needs the database,
   but the API owns the Prisma schema, and the worker's `tsconfig` has `rootDir: ./src`. Options:
   a shared database package, a client generated for the worker from the same schema, or the API
   doing every write. Pick one, and record the trust question for **Sunday's ADR-007**: what
   should a process that holds the Docker socket be allowed to touch?
2. **`@nestjs/bullmq` or plain `bullmq` behind your own port?** Whichever you choose, the API's
   application layer depends on a *port* ("enqueue a judging job"), never on BullMQ.

**Steps:**

1. A `submissions` module in the API with the four layers. `POST /submissions` takes the problem,
   the language and the code. The code gets a **size cap**, because the body is a DoS vector. The
   route requires a logged-in user. It creates a `PENDING` submission, enqueues a job carrying
   **only the submission's id** (used as the job id too), and answers **202** with the id.
2. `GET /submissions/:id`: **the owner only**. Anyone else gets a 404, not a 403: a 403 would
   confirm that the submission exists. This is per-row ownership, and CodeArena checks it nowhere
   yet.
3. In the worker, the smoke test in `main.ts` becomes a queue consumer: load the submission and
   its tests, judge, write the verdict. Validate the worker's environment with Zod, as the API
   does. Shut down cleanly on SIGTERM.

**Tests first:**

- [ ] unit: the submissions service with a fake repository and a **fake queue**: one job per
  submission, with job id = submission id; an unknown problem is rejected before anything is
  queued
- [ ] e2e: no token → 401 · a valid submission → 202 · someone else's submission → 404 · an
  oversized body → 400 with a readable message (I-3 pays off here)
- [ ] integration (local, with Redis, Postgres and Docker running): submit, then the verdict shows
  up in the database within a few seconds

<details><summary>Traps</summary>

- 202, not 201: the work isn't done when you answer.
- The job id deduplicates enqueues. It does **not** make the worker idempotent (that's Thursday).
- The worker needs Redis settings from the environment. The API already validates `REDIS_HOST`
  and `REDIS_PORT`; the worker validates nothing yet.
- A failing user program is **a result, not an error**. If a wrong answer throws inside the job,
  BullMQ will retry it, and you'll judge the same code again and again.

</details>

**Done when:** a submission made with Postman becomes a stored verdict, and all three test groups
are green.

---

## Thursday 5 Nov: retries, the DLQ, idempotency, live push

### ④a Revise and fix (1h)

- [Part 2](../revision/2-auth.md) §4: **reproduce I-6, then fix it** with a test that failed first.
  The fix is one statement that checks and writes at once, and tells you whether *you* won.
- If time remains: I-9 (rewrite the guard-order comment with the true reason), then one I-8 test.
  I-7 is a discussion: write your options in the issue.

### ④b Learn (1h)

`phase-2` **D.3** (idempotency: read it right after fixing I-6, and you'll see your own fix in it),
**E** (WebSockets, rooms, the two beginner mistakes) and **F.1–F.2** (retries, the DLQ).

> 📚 [BullMQ docs](https://docs.bullmq.io/): "Retrying failing jobs", "Stalled jobs" ·
> [NestJS: Gateways](https://docs.nestjs.com/websockets/gateways) ·
> [Socket.IO docs](https://socket.io/docs/v4/): rooms, and authentication in middleware ·
> Stripe, [*Designing robust and predictable APIs with idempotency*](https://stripe.com/blog/idempotency),
> the classic.

### ⑤ Build: retries, DLQ, the idempotency test, WebSocket push

**The decision of the day: when does the worker claim a job?** `phase-2` D.3 claims *after*
running: a duplicate delivery runs the code twice but writes once. SPRINT's test says **"delivering
the same job twice judges once"**, which means claiming *before* running: a conditional update
moves the submission out of `PENDING`, and only the winner runs it. But then a worker that dies
mid-run leaves its claim forever. What does a claim need so that a stale one can be taken over?
Decide, and if it needs a new column or state, that's a small migration.

**Steps:**

1. The claim, as decided.
2. **Retries with backoff for infrastructure failures only** (Docker unreachable, database down),
   never for the user's wrong answer.
3. **The DLQ:** after the last retry, the submission must not stay `PENDING` forever. Decide what
   the user sees (a new verdict? a separate status?) and record it.
4. **The push:** after the verdict is **committed**, the worker publishes an event; an API gateway
   pushes it over a WebSocket to **that user only**. The socket handshake is authenticated with the
   access token, and a user can't join another user's submission room.

**Tests first:**

- [ ] **the idempotency test:** the same job delivered twice (also concurrently) → the runner is
  called **once** and one verdict is written. Use the fake runner and count its calls
- [ ] an infrastructure error → retried; a wrong answer → not retried
- [ ] after the last retry → the submission shows the state you decided, not `PENDING`
- [ ] a socket without a valid token → refused; a user asking for someone else's submission room
  → refused

<details><summary>Traps</summary>

- BullMQ redelivers a job whose worker stopped renewing its lock (a *stalled* job). A long run can
  look stalled. Read about the lock duration.
- Publish **after** the database write commits. Otherwise the browser can fetch the submission
  before the verdict exists.
- Socket.IO and CORS with credentials: the same lesson as part 2, Q20.
- The access token expires after 15 minutes, and a socket authenticated with it stays open. What
  should happen then? (A sentence in the PR is enough this week.)

</details>

**Done when:** the four test groups are green, and the claim decision is written in the PR.

---

## Friday 6 Nov: the verdict, live in the browser

### ④a Revise and fix (1h)

- [Part 3](../revision/3-data-and-web.md) §2 (the trace from click to SQL) and §3 (TanStack,
  Q13–Q20). You're about to write a mutation and live updates.
- **I-12** (logout's empty 200), **I-13** (`useMe` as a query), **I-14** (11,327 dead lines).
  Fixing I-12 and I-13 touches the exact files you'll extend this afternoon.

### ④b Learn (1h)

> 📚 [TanStack Query: Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
> and the `refetchInterval` option (it can be a **function** that stops polling once the verdict
> arrives) · [Socket.IO client API](https://socket.io/docs/v4/client-api/) · Next.js, from
> `apps/web/node_modules/next/dist/docs/`: whatever you touch, read your version's page.

### ⑤ Build: submit → the verdict appears live

**Steps:**

1. Replace the mocked `runCode` in `src/lib/api.ts` with a real mutation (`POST /submissions`).
   One more mock deleted, and the file shrinks toward empty.
2. Show the verdict **live**: through the socket from Thursday, **or** by polling the submission
   until it's no longer pending. Polling is the cuttable fallback, and it's honest: say which one
   you shipped, and why.
3. The states a user can see: submitting, judging, the verdict with "on test N" and the time, and
   errors (400 with the server's message, 401 through the interceptor, 429).
4. The language selector offers exactly what the database accepts (I-18).

**Tests:** the web app has no test setup, and this week doesn't add one. Your PR's *How I tested
it* lists the manual checks: each verdict seen once in the browser, a refresh mid-judging, an
expired token mid-judging.

**Done when:** you type code in the browser, press Submit, and the verdict appears without a
reload.

---

## Saturday 7 Nov: attack your own sandbox

Saturday's order is different: review → CodeArena (5h) → the design out loud → the contest in the
evening.

### ④a Revise (30 min)

[Part 1](../revision/1-skeleton.md) §2 (Q1–Q8, the tooling). Today you add a test suite that needs
Docker: it gets its own script, and you decide whether CI runs it.

### ④b Learn (30 min)

`phase-2` **F.3**: the failure scenarios to design for.

### ⑤ Build (4h): six attacks, three failures

**`test/adversarial/`**, one test per attack, each asserting **two things**: the verdict is
reported cleanly, **and** the host is untouched (no surviving container, no file written outside
the run's folder).

- [ ] a fork bomb
- [ ] an infinite loop
- [ ] a 4 GB allocation
- [ ] a network call
- [ ] a filesystem escape: writing outside the allowed folder, and following a path out of the
  mount
- [ ] reading `/etc/passwd`: it succeeds, and the test proves it's **the image's** file, not the host's

**Failure modes**, written up in `docs/perf/failure-modes.md` as *what I did → what broke → what
recovered → what I changed*:

- [ ] kill the worker mid-job → after a restart, the job completes, judged once (Thursday's claim)
- [ ] stop Redis → what does `POST /submissions` answer? A clean 503 or a 500 with a stack trace?
  And what happens when Redis comes back?
- [ ] 500 submissions at once → does the queue drain? What happens to memory, and to the time
  until the last verdict?

> 📚 GitHub's `ubuntu-latest` runners have Docker, so the adversarial suite *can* run in CI.
> Whether it *should* run on every PR is your decision: weigh the minutes it adds.

### ③ System design (1h)

**Worked design #2, the code-submission judge, out loud, 40 minutes.** It's your own system now,
and an interviewer will love that you built it.

### ② CP

A Div. 3 virtual contest (2h), then upsolve (1h). Block 04, if it's still owed from week 1.

---

## Sunday 8 Nov: checkpoint

- [ ] **The week's checkpoint**: every box below, honestly
- [ ] **[Part 5](../revision/5-checkpoint.md)**: the blank page again, now with the judge in it,
  10 minutes, recorded
- [ ] **ADR-007, the trust boundary**: what runs untrusted code, what it may touch, what the
  Docker socket means, and what you rejected
- [ ] **ADR-008, why BullMQ and not Kafka**: `phase-2` D.4 is your starting point. Write it in
  your words, with the condition that would make you switch
- [ ] a mock coding interview with me (45 min), moved from last Sunday
- [ ] CP Checkpoint 2
- [ ] a retro, then send **`start week of 9 Nov`**

---

## Done when (SPRINT's week 2, plus the revision)

**The judge:**

- [ ] code submitted in the browser runs in a hardened container (no network, a read-only
  filesystem, process, memory and CPU limits, non-root, every capability dropped, a wall-clock
  kill), and the verdict appears live
- [ ] `test/adversarial/`: six attacks, all contained, all reported cleanly
- [ ] a test proves that delivering the same job twice judges once
- [ ] `docs/perf/failure-modes.md`: what broke and what recovered when the worker or Redis died
- [ ] from a blank page, without notes: what a namespace hides, what a cgroup limits, and why
  `--network=none` matters
- [ ] ADR-007 (the trust boundary) and ADR-008 (BullMQ, not Kafka)

**The revision:**

- [ ] parts 1–5 answered out loud, with the misses re-asked on Sunday
- [ ] I-1, I-3, I-4, I-5, **I-6**, I-12, I-13, I-14, I-17 and I-18 fixed, each through a PR with a
  test or a check that failed first
- [ ] `main` protected, a PR template in use, and every PR this week linked to an issue

*Cuttable (SPRINT):* the Python runner (JS only), and the admin queue view. *Also cuttable:* the
custom seccomp profile, and the WebSocket push (polling instead).
