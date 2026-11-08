# Week 2 — The judge

### Mon 2 → Sun 8 Nov 2026 · revise, build, system design, then DSA

> **Status: missed.** The sandbox, the judge loop and the attacks were built in a rush on 8 Nov,
> mostly not by you. Each part is explained in the dojo, ready to rebuild:
> **Guides → Missed knowledge → Week 2, the judge** (`/guides/missed-week-2-the-judge`). The queue,
> the idempotency test, the failure modes and the ADRs are still owed.

**The build:** code goes into a hardened container, through a queue, and comes back as a stored
verdict. **The DSA:** a new concept every 2 days, so each one gets a full course, all three days of
problems, and the boss. **System design:** one section a day, explained out loud.

As always, this guide gives you the steps, the reasons, the tests to write first and the traps.
**It gives you no code.** You type every line.

---

## The shape of every day

| Block | Time | What |
|---|---|---|
| ① Review | 09:00–09:30 | the dojo's `/practice/review` queue, plus today's rows in `~/cp/misses.md`. **Never cut** |
| ④a Revise | 09:30–10:30 | the part of your existing code that today's build stands on, plus its issues |
| ④b Learn | 10:30–11:30 | the day's `docs/phase-2` section, read with the code open |
| ⑤ Build | 11:30–16:00 | the day's task (lunch 12:30–13:30, away from the screen) |
| ⑥ Write | 16:00–16:30 | commit, PR, one line in your notes |
| ③ System design | 17:00–18:00 | one section, then explain it out loud with the page closed |
| ② DSA | 18:00–20:30 | half a block: a new concept every 2 days |

**GitHub is handled.** Every build gets a branch and a PR, and you merge when CI is green. The repo
does the rest by itself: the hooks, commitlint, six CI checks, the PR template. You don't need to
think about it.

---

## Why this week matters more than it looks

> **Almost no junior candidate has built a sandbox and can talk about seccomp.**

Auth is table stakes: every bootcamp graduate has a login form. A hardened runner for untrusted
code, a queue that never judges twice, and a test suite that attacks your own sandbox: that's a
conversation nobody else in the pile can have.

**So slow down where it matters.** If the week runs long, cut the WebSocket push, never Saturday's
attacks.

---

## The week at a glance

Monday lost its morning to the GitHub setup, so the build runs one day later than SPRINT's
calendar. The browser view of the verdict moves to week 3, where the web work is.

| Day | ④a Revise | ⑤ Build | ③ System design | ② DSA |
|---|---|---|---|---|
| **Mon 2** | the worker, the sandbox by hand, I-17 | decisions 1–3, on paper | Asynchronous work & message queues | **Block 03 · Two Pointers** · course, Days 1–2 |
| **Tue 3** | ADR-006, accepted | `DockerCodeRunner`, JavaScript | Task queues & back pressure | Block 03 · Day 3, boss, the classics |
| **Wed 4** | the schema · I-18 | verdicts against test cases, seccomp | TCP/UDP · RPC/REST · HTTP verbs and idempotency | **Block 04 · Sliding Window** · course, Days 1–2 |
| **Thu 5** | ports and adapters · I-3, I-5 | `POST /submissions` → BullMQ → worker → verdict | Rate limiting · availability patterns | Block 04 · Day 3, timed |
| **Fri 6** | the auth race · **I-6** | retries, DLQ, **the idempotency test** | Scaling the database | **Block 05 · Prefix Sums** · course, Days 1–2 |
| **Sat 7** | — | **attack your own sandbox** · failure modes | Design #2, the judge, out loud | Block 05 · Day 3, boss |
| **Sun 8** | the blank page | checkpoint · ADR-007 · ADR-008 | your system, out loud | a Div. 3 contest · R02 |

---

# MONDAY 2 NOV · from 15:30

## ④a Revise · [Monday course](week-2-monday-course.md), Parts E–G (1 h 25)

- **E:** the worker you already have (Q1–Q4), each with its lab;
- **F:** the sandbox by hand: namespaces, the hardened `docker run`, the four new experiments;
- **G:** I-17. The lab proves that killing `docker run` doesn't stop the container, and that a
  plain SIGTERM makes it hang forever.

Write the I-17 note (G.5) in your notes file: 8 to 12 lines, plain words.

## ⑤ Build · three decisions, on paper (15 min, right after Part G)

Tomorrow's runner depends on these three. Write one paragraph each:

1. **How does the worker talk to Docker:** spawning the `docker` CLI, or the Engine API
   (`dockerode`)? The CLI uses the exact flags you ran by hand; the API gives structured errors and
   no shell.
2. **How does the code get into the container?** Not as a command-line argument: it would show up
   in `ps`, and long code would hit the argument-length limit.
3. **What does the runner return?** Facts, or a verdict?

## ③ System design · [Asynchronous work & message queues](../../apps/dojo/content/supplements/system-design-fundamentals.md#asynchronous-work--message-queues)

Read the section, close it, then answer out loud:

- Why does `POST /submissions` answer before the code has run?
- What does a queue buy you that a direct call doesn't, and what does it cost?
- Producer, consumer, broker: which is which in CodeArena?

## ② DSA · **Block 03, Two Pointers** · day 1 of 2

**New concept.** [Course 03](../../../bcgx-prep/cp-program/course-03-two-pointers.md) first
(30 min). Then the block's **Day 1** and **Day 2** tables:

- **Day 1:** Backspace String Compare (844) · Sort Array By Parity II (922) · Minimum Length After
  Deleting Similar Ends (1750);
- **Day 2:** Valid Triangle Number (611) · Move Pieces to Obtain a String (2337) · BerSU Ball
  (489B) · Three Parts of the Array (1006C).

The block file is in `~/bcgx-prep/cp-program/block-03-two-pointers.md`, and the empty solution
files are already in `~/cp/blocks/03-two-pointers/`. Before coding, write the pattern and the
target complexity in each file's header. Commit in `~/cp` when done.

---

# TUESDAY 3 NOV

## ④a Revise · [Part 4](../revision/4-judge.md) §4 (Q9–Q16), then accept ADR-006

Rewrite `docs/adr/006-leetcode-codeforces-hybrid.md` in your words, and mark it **Accepted**, or
change what you disagree with. Tomorrow's migration is built from it. It puts Python before
JavaScript; this week you build JavaScript only. Say in the ADR which one you'd keep if you could
keep only one, and why.

## ④b Learn · `docs/phase-2` **Part C** (Docker as a sandbox) and **Part G** (the toy runner)

Read Part G, then close it: it's a shape to compare against, not something to copy.

> 📚 [docker container run reference](https://docs.docker.com/reference/cli/docker/container/run/)
> · [Node.js child_process](https://nodejs.org/api/child_process.html): `spawn` with an array of
> arguments, never `exec` with one string · [dockerode](https://github.com/apocas/dockerode), if
> you chose the API · [Jest: Getting started](https://jestjs.io/docs/getting-started).

## ⑤ Build · `DockerCodeRunner` replaces the fake

**The goal:** one fresh, hardened container per run, with limits, running JavaScript.

### 🎯 Build

1. **Give the worker its tests.** A Jest setup and a `test` script. CI already runs
   `pnpm --filter worker run --if-present test`, so your tests run in CI the moment the script
   exists, and lint-staged already covers the worker.
2. **Reshape the port** around decisions 2 and 3. Keep `FakeCodeRunner` working: it's your
   unit-test double.
3. **The adapter:**
   - every hardening flag from Part 4 §3;
   - the image **pinned to an exact tag**;
   - a **unique container name per run**;
   - a wall-clock timer that kills **the container**, not the client (I-17);
   - an output cap, so a program printing forever can't fill your memory;
   - cleanup in a `finally`, which removes the container and the temporary folder whatever
     happened.
4. **Bind** `CODE_RUNNER` to the Docker adapter in `WorkerModule`.

### 🧠 How to think

**Every flag closes a specific hole**, and you should be able to say which one:

| Flag | Without it |
|---|---|
| `--network none` | the submission sends your hidden tests to its author |
| `--pids-limit` | a fork bomb takes the host down |
| `--memory` = `--memory-swap` | one allocation pushes everything else off the machine |
| `--read-only` + a `noexec` `/tmp` | the submission writes and runs its own binaries |
| `--cap-drop ALL` | root inside the container keeps root's special powers |
| `--user 65534:65534` | hostile code runs as root, and that's root on the host too (Part F.3) |

**The adapter reports facts; it doesn't judge.** Exit code, stdout, stderr, duration, killed for
time, killed for memory. "Wrong Answer" is a judgement, and it belongs to the application layer
(tomorrow). That's the dependency rule from Part 1, Q15, applied to new code.

**Two clocks.** A CPU limit doesn't stop a program that sleeps, so you need a wall-clock deadline
as well. At the deadline, stop the container **through the daemon**: that's your I-17 note, turned
into code.

### ✅ Done when

Three integration tests pass. They need Docker, so name them so they can run apart from the unit
tests:

- `console.log(2 + 3)` → stdout `5`, exit code 0
- an infinite loop → killed at the limit, and afterwards **no container with that run's name
  exists**. That's the I-17 test
- a program printing without end → stopped at the output cap, and the worker is still healthy

And `docker ps -a` shows no leftovers after the whole suite.

### ⚠️ Traps

- Exit code 137 means SIGKILL, from the OOM killer **or** from your own timeout. `docker inspect`
  tells them apart (Part F.3, experiment 4).
- `--rm` and your kill can race. Cleanup must work whether the container still exists or not.
- The first run pulls the image, which takes seconds. Pull it before the tests, or the first one
  times out.
- Timing around `docker run` includes the container's start-up, hundreds of milliseconds. Decide
  what `runtimeMs` means before users ever see it.
- Jest's default timeout is 5 seconds. A container test can need more.

## ③ System design · [Task queues & back pressure](../../apps/dojo/content/supplements/system-design-fundamentals.md#task-queues--back-pressure)

Out loud: what happens to CodeArena when submissions arrive faster than the workers can judge?
What's back pressure, and where would you apply it: the API, the queue, or the workers?

## ② DSA · Block 03, Two Pointers · day 2 of 2

The block's **Day 3**: Number of Subsequences That Satisfy the Given Sum Condition (1498) · Dora and
Search (1793C) · CSES Sum of Three Values · 🔴 **Maximum Score of a Good Subarray (1793)**, which is
mandatory: 30 minutes, then the hint. Then **the classics**, 10 minutes, said out loud: Valid
Palindrome, Two Sum II, Container With Most Water, 3Sum, Trapping Rain Water. Then the block's
self-check, and send `review block 03`.

---

# WEDNESDAY 4 NOV

## ④a Revise · [Part 3](../revision/3-data-and-web.md) §1 (Q1–Q9: the schema and migrations) · I-18

**I-18:** the web offers JavaScript, but the database's `Language` enum has no `JAVASCRIPT`. Today's
migration fixes it.

## ④b Learn · seccomp

> 📚 [Seccomp security profiles for Docker](https://docs.docker.com/engine/security/seccomp/) ·
> [testlib](https://github.com/MikeMirzayanov/testlib), Codeforces' own checker library: its
> `wcmp` checker *is* your token checker · [Prisma docs](https://www.prisma.io/docs): "Prisma
> Migrate" and "Seeding".

## ⑤ Build · verdicts against test cases

### 🎯 Build

1. **The migration** (ADR-006's requirements): the missing language, `MEMORY_LIMIT`, per-problem
   limits, the failing test's number. Expand only: defaults or nullable columns. Read the
   generated SQL before you apply it.
2. **Test data.** Nothing has hidden tests yet. Write **three original stdin/stdout problems**,
   each with a statement, a reference solution, and about 10 tests: the examples, the edge cases
   (smallest and largest sizes), and at least one test big enough that a quadratic solution times
   out. Seed them.
3. **The token checker**, a pure function in the domain.
4. **The judge loop** in the application layer: run the tests in order, turn each run's facts into
   a result, **stop at the first failure**, and record the failing test's number and the slowest
   time.
5. **seccomp:** prove that Docker's default profile is applied to your containers (`docker info`,
   then `docker inspect`), and name three system calls it blocks.

### 🧠 How to think

**Compare tokens, not bytes.** The most common Wrong Answer that should have been Accepted is a
trailing newline. Split both outputs on whitespace and compare the tokens: that's what Codeforces
does, and it's what ADR-006 says.

**A user's failure is a result; your failure is an error.** A wrong answer, a timeout, a crash in
the user's program: those are verdicts. Docker being unreachable is not: it's an error, and it
gets retried (Friday).

**Calibrate the limits on your own solution.** Run your reference solution, measure it, and set
the time limit at a few times that. A limit you guessed is a limit you can't defend.

### ✅ Done when

- the checker passes a table of cases: a trailing newline, double spaces, `\r\n`, an empty output,
  an extra token, each with its expected result
- the judge service, against the **fake** runner scripted with facts: one test per verdict (AC,
  WA, TLE, MLE, RE), plus stop-at-the-first-failure with the right test number
- integration: the reference solution → AC; a deliberately wrong one → "WA on test N"; the
  quadratic one → TLE; a memory hog → MLE; a thrown error → RE
- the migration's SQL is a plain `ADD COLUMN` / `ADD VALUE`

### ⚠️ Traps

- A test file written on Windows ends its lines with `\r\n`. Decide whether `\r` is part of a
  token.
- A runtime error writes a stack trace to stderr. Cap stderr like stdout, and never show one user
  another user's stderr.
- *Cuttable:* the Python runner, and a custom seccomp profile stricter than the default.

## ③ System design · [TCP vs UDP](../../apps/dojo/content/supplements/system-design-fundamentals.md#tcp-vs-udp-the-transport-choice) · [RPC vs REST](../../apps/dojo/content/supplements/system-design-fundamentals.md#rpc-vs-rest-how-services-call-each-other) · [HTTP verbs and idempotency](../../apps/dojo/content/supplements/system-design-fundamentals.md#http-verbs--and-why-idempotency-decides-retries)

Out loud: is `POST /submissions` idempotent? If a client retries it after a timeout, what happens
in CodeArena today, and what *should* happen?

## ② DSA · **Block 04, Sliding Window** · day 1 of 2

**New concept.** [Course 04](../../../bcgx-prep/cp-program/course-04-sliding-window.md) first
(30 min), then:

- **Day 1:** Maximum Average Subarray I (643) · Best Time to Buy and Sell Stock (121) · Contains
  Duplicate II (219) · Maximum Number of Vowels in a Substring (1456);
- **Day 2:** Longest Substring Without Repeating Characters (3) · Minimum Size Subarray Sum (209) ·
  CSES Playlist.

Create `~/cp/blocks/04-sliding-window/` first, one file per problem, named as in the block file.

---

# THURSDAY 5 NOV

## ④a Revise · [Part 1](../revision/1-skeleton.md) §3–4 (Q9–Q21: the skeleton, ports and adapters) · I-3 · I-5

You're about to write a whole new module with that shape.

- **I-3:** your new DTO's errors must reach the client as real messages, so fix the filter first.
- **I-5:** remove the Hello World boilerplate.

## ④b Learn · `docs/phase-2` **D.1, D.2, D.4**

Why you can't judge inside the request, BullMQ, and why not Kafka. That last one is half of
Sunday's ADR-008.

> 📚 [BullMQ docs](https://docs.bullmq.io/): Queues, Workers, Jobs and **Job Ids**, and the page
> on connections (read about `maxRetriesPerRequest` before your worker crashes on start-up) ·
> [NestJS: Queues](https://docs.nestjs.com/techniques/queues) ·
> [MDN: 202 Accepted](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202).

## ⑤ Build · `POST /submissions` → BullMQ → worker → verdict stored

### 🎯 Build

1. **Two decisions first:**
   - How does the worker read submissions and tests, and write verdicts? It needs the database,
     but the API owns the Prisma schema. Options: a shared database package, a client generated
     for the worker from the same schema, or the API doing every write.
   - `@nestjs/bullmq`, or plain `bullmq` behind your own port? Either way, the API's application
     layer depends on a **port** ("enqueue a judging job"), never on BullMQ.
2. **A `submissions` module in the API**, with the four layers. `POST /submissions` takes the
   problem, the language and the code. It requires a logged-in user, caps the code's size, creates
   a `PENDING` submission, enqueues a job carrying **only the submission's id** (used as the job id
   too), and answers **202** with the id.
3. **`GET /submissions/:id`**, for the owner only. Anyone else gets a **404**, not a 403: a 403
   would confirm that the submission exists.
4. **In the worker,** the smoke test in `main.ts` becomes a queue consumer: load the submission and
   its tests, judge, write the verdict. Validate the worker's environment with Zod, as the API does.
   Shut down cleanly on SIGTERM.

### 🧠 How to think

**202, not 201.** The work is accepted, not finished. A 201 would promise a resource that's
complete.

**Enqueue the id, never the code.** A queue isn't a database. The payload is a pointer, so the
worker reads the authoritative row, and 50 KB of code never sits in Redis.

**Write the row before you enqueue.** The other order gives you a job pointing to a submission
that doesn't exist yet. It fails only under load: the worst kind of bug.

**Rate-limit this endpoint.** Judging is the most expensive thing your system does, so it's the
most attractive thing to spam. You already have `@Throttle`.

**The worker holds the Docker socket.** Whatever database access you give it is what an attacker
gets if the sandbox ever leaks. Give it the least it needs, and write the question down for
Sunday's ADR-007.

### ✅ Done when

- unit: the submissions service, with a fake repository and a **fake queue**: one job per
  submission, job id = submission id; an unknown problem is rejected before anything is queued
- e2e: no token → 401 · a valid submission → 202 · someone else's submission → 404 · an oversized
  body → 400 with a readable message (I-3 pays off here)
- integration, locally: submit with Postman, and the verdict appears in the database within a few
  seconds

### ⚠️ Traps

- The job id deduplicates *enqueues*. It doesn't make the worker idempotent: that's tomorrow.
- The worker needs Redis settings from its environment, and it validates nothing yet.
- A wrong answer must not throw inside the job. If it does, BullMQ retries it, and you judge the
  same code again and again.

## ③ System design · [Rate limiting](../../apps/dojo/content/supplements/system-design-fundamentals.md#rate-limiting) · [Availability patterns](../../apps/dojo/content/supplements/system-design-fundamentals.md#availability-patterns-how-you-actually-stay-up)

Then, carried over from week 1: **Worked design #3, the rate limiter**, out loud, 20 minutes.

## ② DSA · Block 04, Sliding Window · day 2 of 2

The block's **Day 3, ⏱ timed: 60 minutes, no hints during the timer.** Permutation in String (567)
· Longest Repeating Character Replacement (424) · Books (279B). Then 🔴 **Minimum Window Substring
(76)**, after the timer. Self-check, then send `review block 04`.

---

# FRIDAY 6 NOV

## ④a Revise · [Part 2](../revision/2-auth.md) §4 · **I-6**

**Reproduce I-6, then fix it**, with a test that failed first. The fix is one statement that checks
and writes at once, and tells you whether *you* won. Then, if time remains: I-9 (the guard-order
comment's real reason), and one I-8 test.

## ④b Learn · `docs/phase-2` **D.3** (idempotency) and **F.1–F.2** (retries, the DLQ)

Read D.3 right after fixing I-6: you'll see your own fix in it.

> 📚 [BullMQ docs](https://docs.bullmq.io/): "Retrying failing jobs", "Stalled jobs" · Stripe,
> [*Designing robust and predictable APIs with idempotency*](https://stripe.com/blog/idempotency),
> the classic.

## ⑤ Build · retries, the DLQ, the idempotency test

### 🎯 Build

1. **The claim.** Decide when the worker claims a job (see below), and build it.
2. **Retries with backoff**, for infrastructure failures only (Docker unreachable, database down),
   never for the user's wrong answer.
3. **The DLQ.** After the last retry, the submission must not stay `PENDING` forever. Decide what
   the user sees, and write it down.
4. *Stretch:* the WebSocket push. Otherwise the client polls `GET /submissions/:id`, which is
   honest and fine for this week.

### 🧠 How to think

**Claim before running, or after?** `phase-2` D.3 claims *after*: a duplicate delivery runs the
code twice but writes once. SPRINT's test says **"delivering the same job twice judges once"**,
which means claiming *before*: a conditional update moves the submission out of `PENDING`, and only
the winner runs it. But then a worker that dies mid-run keeps its claim forever. What does a claim
need, so that a stale one can be taken over? That's this morning's I-6 technique again: one
statement that checks and writes at once.

**At-least-once is the only honest promise.** BullMQ can deliver a job twice: after a crash, after a
stalled lock. You can't prevent the second delivery; you make it harmless.

### ✅ Done when

- **the idempotency test:** the same job delivered twice, also concurrently → the runner is called
  **once**, and one verdict is written. Use the fake runner, and count its calls
- an infrastructure error is retried; a wrong answer is not
- after the last retry, the submission shows the state you decided, not `PENDING`

### ⚠️ Traps

- BullMQ redelivers a job whose worker stopped renewing its lock (a *stalled* job), and a long run
  can look stalled. Read about the lock duration.
- If you build the push: publish **after** the database write commits, otherwise the browser can
  fetch the submission before the verdict exists.

## ③ System design · [Scaling the database](../../apps/dojo/content/supplements/system-design-fundamentals.md#scaling-the-database)

Out loud: CodeArena gets 100 times more users. Which table hurts first, and what do you do: an
index, a read replica, a cache, or sharding? Why that one first?

## ② DSA · **Block 05, Prefix Sums & Counting** · day 1 of 2

**New concept.** [Course 05](../../../bcgx-prep/cp-program/course-05-prefix-sums.md) first
(30 min), then:

- **Day 1:** Find Pivot Index (724) · CSES Static Range Sum Queries · Range Sum Query - Immutable
  (303) · Range Sum Query 2D (304);
- **Day 2:** Subarray Sum Equals K (560) · CSES Subarray Sums II · Contiguous Array (525).

The files are already in `~/cp/blocks/05-prefix-sums/`.

---

# SATURDAY 7 NOV · **attack your own sandbox**

**No revision this morning: today is the day that matters.** Order: review → build (5 h) → the
design out loud → DSA.

## ④b Learn · `docs/phase-2` **F.3**, the failure scenarios (30 min)

## ⑤ Build · `apps/worker/test/adversarial/`, and the failure modes

### 🎯 Build

Six attacks. Each test asserts **two things**: the verdict is reported cleanly, **and** the host is
untouched (no surviving container, no file written outside the run's folder).

| # | Attack | Must produce |
|---|---|---|
| 1 | a fork bomb | contained by `--pids-limit`, the host unaffected |
| 2 | an infinite loop | TLE, and the container is gone |
| 3 | a 4 GB allocation | MLE (`OOMKilled`), the host unaffected |
| 4 | a network call | it fails: no network |
| 5 | a filesystem escape: writing outside the allowed folder, following a path out of the mount | it fails: read-only |
| 6 | reading `/etc/passwd` | it **succeeds**, and the test proves it's the image's file, not the host's |

Then three failures, written up in `docs/perf/failure-modes.md` as *what I did → what broke →
what recovered → what I changed*:

- kill the worker mid-job → after a restart, the job completes, judged once (Friday's claim)
- stop Redis → what does `POST /submissions` answer: a clean 503, or a 500 with a stack trace? And
  what happens when Redis comes back?
- 500 submissions at once → does the queue drain? What happens to memory, and to the time until
  the last verdict?

### 🧠 How to think

**Test the host, not just the verdict.** After each attack, check that `docker ps -a` has no
leftovers and the API still answers. A sandbox test that only checks the verdict hasn't tested
containment.

**Name the mechanism.** Comment each test with what contains it: `--pids-limit`, not "the sandbox".
This file is a portfolio artefact on its own: it's the thing you link to.

### ✅ Done when

The six attacks pass, the host is untouched after all of them, and `failure-modes.md` has three
honest entries.

## ③ System design · [Worked design #2, the code-submission judge](../../apps/dojo/content/supplements/system-design-fundamentals.md#worked-design-2--a-code-submission-judge-your-codearena-story), out loud, 40 min

It's your own system now. An interviewer will love that you built it.

## ② DSA · Block 05, Prefix Sums · day 2 of 2

The block's **Day 3**: Subarray Sums Divisible by K (974) · Karen and Coffee (816B). Then 🔴
**Good Subarrays (1398C)**, mandatory. Self-check, then send `review block 05`.

---

# SUNDAY 8 NOV · checkpoint

No new material.

- [ ] **The week's checkpoint**, below: every box, honestly (1 h)
- [ ] **[Part 5](../revision/5-checkpoint.md)**: the blank page again, now with the judge in it,
  10 minutes, recorded
- [ ] **ADR-007, the trust boundary:** what runs untrusted code, what it may touch, what the Docker
  socket means, and what you rejected (`vm2` in-process; plain Docker with defaults; gVisor or
  Firecracker, which are stronger and the right answer at scale, rejected *for now*. Say that one
  out loud in interviews)
- [ ] **ADR-008, why BullMQ and not Kafka:** start from `phase-2` D.4, write it in your words, and
  name the condition that would make you switch
- [ ] **DSA:** a Codeforces **Div. 3 virtual contest** (2 h, PyPy), then **R02**, the strings
  remedial set that Block 02 triggered (`~/bcgx-prep/cp-program/checkpoints.md`)
- [ ] **Your system, out loud** (45 min)
- [ ] A retro, then send **`start week of 9 Nov`**

---

# 🔍 Checkpoint · Sunday night

Binary. No partial credit.

**The judge:**

- [ ] submitted code runs in a hardened container: no network, a read-only filesystem, process,
  memory and CPU limits, non-root, every capability dropped, a wall-clock kill
- [ ] a submission made with Postman becomes a stored verdict, readable with
  `GET /submissions/:id` by its owner only
- [ ] a test proves that delivering the same job twice judges once
- [ ] `test/adversarial/`: six attacks, all contained, all reported cleanly
- [ ] `docs/perf/failure-modes.md`: what broke and what recovered when the worker or Redis died
- [ ] from a blank page, without notes: what a namespace hides, what a cgroup limits, and why
  `--network none` matters
- [ ] ADR-006 accepted, ADR-007 and ADR-008 written

**The revision:** I-3, I-5, **I-6**, I-17 and I-18 fixed, each with a test or a check that failed
first.

**DSA:** Blocks 03, 04 and 05 reviewed, each boss attempted, R02 done.

**If two or more boxes fail,** week 3 starts by finishing them. Write down *which*: the last plan
broke by carrying debt forward silently.

---

# The DSA month, at a new concept every 2 days

From `~/bcgx-prep/cp-program`, in its order. Each concept gets its course and its three days of
problems in two evenings. DP keeps 4 days.

| Days | Block |
|---|---|
| Mon 2 – Tue 3 | 03 · Two Pointers |
| Wed 4 – Thu 5 | 04 · Sliding Window |
| Fri 6 – Sat 7 | 05 · Prefix Sums & Counting |
| Sun 8 | Div. 3 contest + R02 |
| Mon 9 – Tue 10 | 06 · Stacks |
| Wed 11 – Thu 12 | 07 · Binary Search |
| Fri 13 – Sat 14 | 08 · Sorting & Greedy (+ checkpoint 3 on Sat 14) |
| Sun 15 | **day off** |
| Mon 16 – Tue 17 | 09 · Linked Lists & Recursion |
| Wed 18 – Thu 19 | 10 · Trees |
| Fri 20 – Sat 21 | 11 · Graphs |
| Sun 22 | contest + checkpoint 4 |
| Mon 23 – Tue 24 | 12 · Heaps & Intervals |
| Wed 25 – Sat 28 | 13 · Dynamic Programming (4 days) |
| Sun 29 | final review |

**The price of the slower pace:** Blocks 14–16 (the two blind mixes and the mocks) no longer fit
on weekdays. The Sunday contests stand in for them: a contest *is* a blind mix, with no labels.

---

# Moved to week 3

- **The verdict, live in the browser:** the real `POST /submissions` mutation, the states a user
  sees, and polling or the socket. It goes with the other web work.
- **I-4, I-12, I-13, I-14:** the web issues. They touch the same files.
- **I-10, I-11, I-15, I-16:** the SQL issues, with week 3's SQL work, as planned.

---

# If the week collapses

Cut in this order:

> **Friday's stretch (the socket) → Thursday's polish → ④b Learn.**
> **Never Saturday.** **Never ① Review.** **Never ④a Revise.**

A judge that works with polling, plus six passing attacks, is a far stronger week than a
beautifully realtime judge you never tried to break.
