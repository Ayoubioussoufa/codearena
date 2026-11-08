# Missed · Week 2, the judge

**Status: missed.** Week 2's judge was built in a rush on Sunday 8 November, with Claude writing most of the code, so it works, but you haven't built it yourself yet. This page explains every part that was added (what it is, why it exists, how it works, and the traps), so that you can rebuild each part on your own later, from the commit just before it.

> **The rule for this page:** reading it isn't the goal. A part counts as learned when you've rebuilt it from its starting commit without looking at the answer, and your tests pass.

---

## The week at a glance

**Built, but not by you.** Each part has its own section below.

| Part | What it gave CodeArena | PR |
|---|---|---|
| 1 | Jest in the worker | #8 |
| 2 | Run facts instead of verdicts, and `JAVASCRIPT` in the database (I-18) | #9 |
| 3 | Per-problem limits, and three original problems with hidden tests | #10 |
| 4 | `DockerCodeRunner`: the hardened sandbox (I-17) | #11 |
| 5 | The token checker | #12 |
| 6 | The judge loop: facts → verdict | #12 |
| 7 | Six attacks on the sandbox | #13 |
| 8 | Mutation testing: proving the attacks can fail | (done by hand) |
| 9 | CI runs the Docker tests | #13 |

**Not built at all yet.** This is still owed from week 2's plan:

- the seccomp proof (Wednesday): show that Docker's default profile is applied, and name three system calls it blocks
- `POST /submissions` → BullMQ → worker → stored verdict, and `GET /submissions/:id` for the owner only (Thursday)
- the claim, retries with backoff, the DLQ, and **the idempotency test** (Friday)
- `docs/perf/failure-modes.md`: kill the worker, stop Redis, send 500 submissions (Saturday)
- ADR-006 accepted in your own words, and ADR-007 and ADR-008 written (Sunday)
- the database's `Verdict` enum has no `MEMORY_LIMIT` or `OUTPUT_LIMIT` yet, and `Submission` has no failing-test number

---

## How to rebuild a part

Every part below has a **Rebuild it** drill. It starts from the commit just *before* the part, so the repo is exactly as it was when the part didn't exist:

```bash
git switch -c rebuild/<part> <the starting commit>
pnpm install
# build it, with this page closed
git diff <the real commit> -- <the folder>   # compare with what was merged
git switch main && git branch -D rebuild/<part>
```

The `git diff` at the end is how you check yourself. Differences aren't automatically mistakes: if yours is different and your tests pass, be ready to say why yours is better or worse.

**The commits on `main`:**

| Part | Start from | Compare with |
|---|---|---|
| 1 · Jest | `6b42e44` | `8b1b36b` |
| 2a · `JAVASCRIPT` in the enum | `8b1b36b` | `5739188` |
| 2b · Run facts | `5739188` | `bb0db67` |
| 3 · Problems and limits | `bb0db67` | `dc253e6` |
| 4 · `DockerCodeRunner` | `dc253e6` | `15d9640` |
| 5–6 · Checker and judge loop | `15d9640` | the commit of PR #12, once merged |
| 7–9 · Attacks and CI | PR #12's commit | the commits of PR #13, once merged |

---

## The big picture

This is the path a submission will take once the queue exists. Parts 1–9 built everything inside the worker. The queue and the database writes are what's still owed.

```text
user ──POST /submissions──▶ API ──job id──▶ BullMQ ──▶ worker            (not built yet)
                                                         │
                                         JudgeService.judge(code, tests)   (part 6)
                                                         │ once per test
                                              CODE_RUNNER port
                                                 │              │
                                       FakeCodeRunner    DockerCodeRunner  (parts 1, 4)
                                       (unit tests)      (real containers)
                                                         │
                                        RunResult = facts (part 2)
                                                         │
                                  failureOf + compareTokens → Verdict      (parts 5, 6)
```

**The one idea that holds it together: ports and adapters.** `JudgeService` depends on the `CODE_RUNNER` *port* (an interface and a token), never on Docker. In the unit tests, the port is bound to `FakeCodeRunner`. In production, it's bound to `DockerCodeRunner`. The judge can't tell the difference, and that's why its 25 unit tests run in about a second with no Docker at all.

---

## Part 1 · Jest in the worker

### What

A test runner for `apps/worker`: a `test` script, its config, and a first `JudgeService` test that runs against the fake runner.

### Why

CI already ran `pnpm --filter worker run --if-present test`. As soon as the script existed, the worker's tests ran on every PR, so no CI change was needed. Without tests, every later part (the judge, the runner) would have been checked only by hand.

**Why Jest and not Mocha:** NestJS generates Jest by default, and `@nestjs/testing` examples use it. Jest also bundles the runner, the assertions (`expect`) and the mocks in one package. Mocha needs Chai and Sinon to do the same.

### How

- **`package.json`:** the `jest` key holds `rootDir: "src"`, `testRegex: ".*\\.spec\\.ts$"`, `testEnvironment: "node"`, and a ts-jest transform.
- **`tsconfig.spec.json`:** extends `tsconfig.json` and switches to `commonjs` with `node` module resolution, because Jest runs CommonJS.
- **`tsconfig.build.json`:** excludes `**/*.spec.ts`, so tests never ship in `dist`.
- **`"types": ["node", "jest"]` in `tsconfig.json`:** TypeScript 6 (the version VS Code uses) defaults `types` to an empty list. Without this, the editor shows "Cannot find name 'describe'".
- **`Test.createTestingModule`:** builds a small Nest container for the test, binding `CODE_RUNNER` with `useValue: runner`. The test keeps a handle on the fake, so it can script it.

### The traps we hit

- Jest exits with code 1 when it finds **no tests**. So the script and the first test must land in the same commit, or CI goes red.
- The ts-jest `tsconfig` path was copied from the API, so it pointed to a file that didn't exist. The fix was `<rootDir>/../tsconfig.spec.json`, because `rootDir` is `src`.
- `extends: "./tsconfig.base.json"` failed with TS5083: that file doesn't exist in the worker.
- `expect(x).toBe(a).toEqual(b)` doesn't compile. `toBe` returns nothing, so assertions can't be chained. Write one assertion per line, or one `toEqual` on the whole object.

### Rebuild it

From `6b42e44`:

1. Add `jest`, `ts-jest`, `@types/jest` and `@nestjs/testing` as dev dependencies of the worker only (`pnpm --filter worker add -D …`).
2. Write the config, then one failing test. Watch it fail, then make it pass.
3. Prove that `find apps/worker/dist -name '*spec*'` prints nothing after `pnpm --filter worker build`.

```check
jest
```

---

## Part 2 · Facts, not verdicts

### What

The runner now returns **facts** (how the program ended, what it printed, how long it took) instead of a verdict. `RunResult` is a *discriminated union* on `outcome`:

```ts
type RunOutput = { stdout: string; stderr: string; timeMs: number };
export type RunResult =
  | (RunOutput & { outcome: "EXIT"; exitCode: number })
  | (RunOutput & { outcome: "SIGNAL"; signal: string })
  | (RunOutput & { outcome: "TIMEOUT" })
  | (RunOutput & { outcome: "OUTPUT_LIMIT" })
  | (RunOutput & { outcome: "MEMORY_LIMIT" }); // added in part 4
```

### Why

**"Wrong Answer" is a judgement, not a fact.** The runner can see that the program exited with 0 and printed `5`. It can't know that `5` is wrong, because only the judge knows the expected output. Keeping judgement out of the adapter is the dependency rule: the outer layer (Docker) reports, and the inner layer (the application) decides.

**Why a union and not one object with optional fields:** with `exitCode?: number`, a timeout could carry an exit code by mistake, and every reader would have to guess which fields are filled. With a union, a `TIMEOUT` *has no* `exitCode` field, so TypeScript refuses `result.exitCode` until you've checked `result.outcome === "EXIT"`. That's called *narrowing*.

**Proving it with `@ts-expect-error`:** one test reads `exitCode` on a timeout under a `// @ts-expect-error` comment. If someone ever adds `exitCode` to every variant, that line starts compiling, and the comment itself becomes an error. That makes it a test of the *type*, not of the value.

### Part 2a · `JAVASCRIPT` in the `Language` enum (I-18)

**I-18:** the web offered JavaScript, but the database's `Language` enum had no `JAVASCRIPT`, so a JavaScript submission couldn't be stored.

- **How:** `pnpm --filter api exec prisma migrate dev --create-only --name add_javascript_to_language`, then read the SQL before applying it. It's a single `ALTER TYPE "Language" ADD VALUE 'JAVASCRIPT'`.
- **Why `--create-only`:** you read the SQL before it touches the database. A migration is code that runs on production data.
- **Expand only:** adding a value breaks no existing row or reader. Removing or renaming one would.
- **The trap:** `npx prisma` from the repo root downloaded a Prisma 8 release candidate, not the project's Prisma 7. Always run the API's own copy: `pnpm --filter api exec prisma …`.

### Rebuild it

- **2a,** from `8b1b36b`: write the migration with `--create-only`, read it, apply it, and check it in `psql` with `\dT+ "Language"`.
- **2b,** from `5739188`: replace the old verdict type with the union, update the fake and the judge's test, and add the `@ts-expect-error` test. Then try deleting the `if` that narrows the result, and watch the type error appear.

```check
facts
```

---

## Part 3 · Per-problem limits, and three original problems

### What

- **Two new columns on `Problem`:** `timeLimitMs Int @default(2000)` and `memoryLimitMb Int @default(256)`, from the migration `add_problem_limits`.
- **Three original problems** (IDs 2001–2003), each with a statement, a reference solution, a brute force, and 10 tests:

| Problem | Idea | Fast solution | Brute force |
|---|---|---|---|
| Quiet Stretch | longest run of minutes whose sum ≤ k | sliding window, O(n) | every start, O(n²) |
| Shelf Totals | sum of shelves l to r, for q queries | prefix sums, O(n + q) | add up each range, O(n·q) |
| Pair Budget | pairs i < j with price sum ≤ b | sort + two pointers, O(n log n) | every pair, O(n²) |

- **A check script** (`apps/api/prisma/check-original-problems.ts`) that proves the tests are right before they're seeded.
- **The seed:** `seedOriginalProblem`, in a single `$transaction`.

### Why

The judge needs hidden tests, and nothing had any. **Original** problems, because copying a Codeforces or LeetCode problem and its tests into a public repo isn't yours to publish.

**Why the limits are columns:** each problem decides its own limits, and a 1000 ms limit only means something next to the reference solution's real time. `@default` makes the migration expand-only: the existing rows get a value, and nothing breaks.

### How

- **Where the expected outputs come from:** the seed never stores a hand-written expected output for a generated test. It runs `solution.js` on each input, and the output becomes `expected`. The reference solution is the single source of truth.
- **Who checks the reference solution:** the check script, in three ways:
  1. **The examples:** the solution must print the outputs worked out by hand. This caught a real bug: Pair Budget's example said 5, but the right answer is 4.
  2. **Stress testing:** the solution and the brute force must agree on every test except the last one. Two different algorithms rarely share a bug.
  3. **The killer test:** the last test is the largest (n = 200,000). The solution must take less than half the limit, and the brute force must *not* fit in it. That proves the limit separates O(n log n) from O(n²).
- **`rng.ts` (mulberry32):** a *seeded* random generator. The same seed gives the same tests every time, so a failing test can be reproduced. `Math.random()` can't promise that.
- **The seed in a `$transaction`:** upsert the problem, delete its old tests and examples, then insert the new ones. Either all of it happens or none of it does, so a crash never leaves a problem with half its tests. Re-running the seed is safe: it's idempotent.

### The traps we hit

- The guide's code blocks didn't end files with a newline, and Prettier rejected them. Run `pnpm --filter api exec eslint --fix` after pasting.
- A test that the brute force passes in time proves nothing about efficiency. That's why the check measures the brute force too.

### Do you need all this for every future problem?

The folder (`problem.ts`, `solution.js`, `brute.js`) is the pattern for **original** problems that you write. Imported problems with official tests don't need a brute force. The check (examples + stress + killer) is what makes hidden tests trustworthy, so keep it for anything you write yourself.

### Rebuild it

From `bb0db67`: write **one** problem of your own (not one of these three), with its solution, brute force, generator and check. Seed it, then count its rows: `SELECT count(*) FROM "TestCase" WHERE "problemId" = …`.

```check
problems
```

---

## Part 4 · `DockerCodeRunner`, the sandbox

### What

The real adapter behind the `CODE_RUNNER` port, in `apps/worker/src/adapters/docker-code.runner.ts`. It runs one submission against one input in a fresh, hardened container, and returns facts. For now it supports JavaScript only, and throws for any other language.

### Why

Submitted code is hostile until proven otherwise. A container gives it its own view of the processes, the network and the filesystem (namespaces), plus limits on memory, processes and CPU (cgroups). Every flag closes one specific hole.

### How: the life of one run

1. **Write the code** to a fresh temporary folder (`mkdtemp`). The folder gets mode `0755` and the file `0644`, because the program runs as `nobody` and must be able to read it.
2. **Give the container a unique name:** `codearena-run-<uuid>`. That's how the worker can kill, inspect and remove *this* container, and no other.
3. **Start it with `spawn("docker", args)`.** It takes an array of arguments, never one string through a shell, so nothing in the code or the name can inject a command.
4. **Mount the code read-only** at `/code`, and **send the test input through stdin** (`-i`). The two channels stay separate: stdin carries only the test's input, so the program reads its input exactly as on Codeforces.
5. **Start a deadline:** `timeoutMs + 1000 ms` of start-up grace. At the deadline, run `docker kill <name>` **through the daemon**.
6. **Collect the output with a cap.** Past `maxOutputBytes`, stop collecting, and kill the container as `OUTPUT_LIMIT`.
7. **When it ends, `docker inspect`** reads `OOMKilled`, the exit code, `StartedAt` and `FinishedAt`.
8. **Turn that into facts** (`toFacts`), in this order: a stop reason, then OOM, then time, then signal (exit code > 128), then a normal exit.
9. **In a `finally`:** `docker rm -f <name>`, then delete the folder, whatever happened.

### Every flag, and the hole it closes

| Flag | Without it |
|---|---|
| `--network none` | the program sends your hidden tests to its author |
| `--read-only` | the program rewrites files in the image |
| `--tmpfs /tmp:rw,noexec,nosuid,size=16m` | no scratch space, or a scratch space where dropped programs can run |
| `--memory` = `--memory-swap` | one allocation swaps everything else off the machine |
| `--pids-limit` | a fork bomb takes the host down |
| `--cpus 1` | one submission takes every core |
| `--cap-drop ALL` | root in the container keeps root's special powers |
| `--security-opt no-new-privileges` | a setuid binary gives the program root again |
| `--user 65534:65534` | the program runs as root |
| `--log-driver none` | Docker stores all of the output on the host's disk, so a flood fills it |
| the image pinned to an exact tag | a new upstream image silently changes what runs |
| `node --max-old-space-size=<memoryMb>` | Node's heap limit doesn't know about the container's limit |

### Why each decision

- **I-17: kill the container, not the client.** `child.kill()` kills the `docker` *client* process, but the container keeps running inside the daemon. Only `docker kill <name>` stops the program itself. One integration test proves it: after an infinite loop, no container with that run's name is left.
- **No `--rm`:** with `--rm`, the container disappears as soon as it exits, and then `docker inspect` can't read `OOMKilled` or the timestamps. So the runner inspects first and removes it itself, in the `finally`.
- **Exit code 137 is ambiguous:** it means SIGKILL, from the OOM killer *or* from our own `docker kill`. `docker inspect`'s `OOMKilled` tells them apart, and the runner's own `stopReason` records why *it* killed the container.
- **Time is measured by Docker**, from `StartedAt` to `FinishedAt`, so the container's start-up (a few hundred milliseconds) never counts against the user. The deadline adds the same grace, for the same reason.
- **Docker failing is your failure, not the user's.** If `spawn` fails, or `docker inspect` can't find the container, the runner *throws*. It never invents a verdict.

### Tests

The integration tests (`*.integration-spec.ts`) run real containers, through `pnpm --filter worker run test:integration`, one at a time (`--runInBand`), with a 30-second timeout. There are 8: output, stdin, a large stdin the program never reads, a non-zero exit, an infinite loop (I-17), a print-forever flood, the OOM killer, and the time without start-up. They're kept apart from the unit tests by name, and excluded from the build.

### The traps we hit

- The first guidance suggested sending the code through stdin. Wrong: stdin belongs to the test input. The code goes through a read-only mount.
- The first run pulls the image, which takes seconds, so pull it before the tests.
- `main.ts` still asked for `"TYPESCRIPT"`, and the runner rightly refused it. And `node dist/main` runs the *old* build until you rebuild.

### Rebuild it

From `dc253e6`. This is the most important rebuild of the week. Do it in this order:

1. Write the 8 integration tests first, from the list above.
2. Get the first one green with the smallest `docker run` that works.
3. Add one flag at a time. Name the hole it closes out loud before you add it.
4. Add the deadline and `docker kill`, then prove I-17 with `docker ps -a`.
5. Add `inspect`, then OOM, then the output cap, and finally the `finally`.

```check
sandbox
```

---

## Part 5 · The token checker

### What

`compareTokens(expected, actual)` in `apps/worker/src/domain/token-checker.ts`. It returns `true` when both outputs hold the same tokens in the same order.

```ts
const tokens = (text: string) => text.split(/\s+/).filter(Boolean);
```

### Why

The most common "Wrong Answer that should have been Accepted" is whitespace: a missing trailing newline, two spaces, or `\r\n` from a file written on Windows. Codeforces' default checker (`wcmp` in testlib) compares tokens, and so does ADR-006.

### How

- `/\s+/` matches any whitespace, including `\r` and tabs, so all of them separate tokens.
- `.filter(Boolean)` removes the empty strings that splitting creates: `"5\n".split(/\s+/)` gives `["5", ""]`.
- Then compare the lengths, and every token in order. **Case still matters:** `YES` isn't `yes`.
- It's a pure function in `domain`: it has no I/O and no Nest, and it doesn't know Docker exists. That's why its 12 table cases (`it.each`) run instantly.

### Rebuild it

From `15d9640`: write the 12-row table first (identical output, a missing newline, double spaces, `\r\n`, tabs, both empty, a different token, an extra token, a missing token, the wrong order, empty output, case). Then write the function in four lines.

---

## Part 6 · The judge loop

### What

`JudgeService.judge(code, language, tests, limits)` returns `{ verdict, failedTest, maxTimeMs }`.

### Why: the three rules

1. **Order:** check limits first, then how the program ended, and only then what it printed. A program that prints the right answer and then crashes gets `RUNTIME_ERROR`, not `ACCEPTED`.
2. **Stop at the first failure.** There's no point running test 7 once test 3 has failed, and the user sees "Wrong answer on test 3".
3. **A user's failure is a verdict, and our failure is an error.** If Docker is down, `judge()` throws, and the queue retries later. Turning that into `RUNTIME_ERROR` would blame the user for our outage.

### How

```text
for each test, in order:
  facts  = run(code, test.input)
  maxTimeMs = max(maxTimeMs, facts.timeMs)
  failure = failureOf(facts, test.expected)
  if failure: return { verdict: failure, failedTest: index + 1, maxTimeMs }
return { verdict: ACCEPTED, failedTest: null, maxTimeMs }
```

| Facts | Verdict |
|---|---|
| `TIMEOUT` | `TIME_LIMIT` |
| `MEMORY_LIMIT` | `MEMORY_LIMIT` |
| `OUTPUT_LIMIT` | `OUTPUT_LIMIT` |
| `SIGNAL`, or `EXIT` with a non-zero code | `RUNTIME_ERROR` |
| `EXIT` 0, with different tokens | `WRONG_ANSWER` |
| `EXIT` 0, with the same tokens on every test | `ACCEPTED` |

- **`failureOf` is a `switch` on `outcome`,** with no `default`. Inside `case "EXIT"`, TypeScript knows `exitCode` exists. If someone adds a sixth outcome and forgets it, the function's return type is no longer satisfied, and the code doesn't compile.
- **There's no `try/catch` in `judge()`,** on purpose: an infrastructure error passes straight through.
- **`failedTest` is 1-based,** because users read "test 4", not "test 3".
- **An empty test list throws.** Otherwise the loop never runs, and a problem with no tests accepts anything.
- **The fake grew two features:** `willReturnInOrder([...])` scripts one result per call (an `Error` in the list makes that call throw, which simulates Docker going down), and `inputs` records every stdin, so a test can prove the order and the stop.

### Rebuild it

From PR #12's parent (`15d9640`), with parts 5 and 6 together:

1. Extend the fake first.
2. Write these tests: AC with the slowest time, the inputs in order, one test per failure kind on test 2 (each must stop after 2 runs), a crash after the right output, an infrastructure error, and no tests.
3. Then write `judge` and `failureOf`. The target is 25 unit tests passing.

```check
judge
```

---

## Part 7 · Attacking the sandbox

### What

`apps/worker/test/adversarial/sandbox.attack-spec.ts`: six hostile programs, each run through the real `JudgeService` and `DockerCodeRunner`. Run them with `pnpm --filter worker run test:adversarial`.

| Attack | Expected verdict | The wall that stops it |
|---|---|---|
| Fork bomb | `ACCEPTED` | `--pids-limit` |
| Infinite loop | `TIME_LIMIT` | the deadline and `docker kill` |
| 4 GB allocation | `MEMORY_LIMIT` | `--memory` = `--memory-swap` |
| Network call | `ACCEPTED` | `--network none` |
| Filesystem escape | `ACCEPTED` | `--read-only`, a read-only `/code`, `noexec` on `/tmp` |
| Reading `/etc/passwd` | `ACCEPTED` | mount namespace, `--user`, `--cap-drop ALL` |

### Why: the "contained" trick

**A verdict alone proves nothing.** A fork bomb's parent exits normally whether `--pids-limit` is there or not, so "it didn't crash" passes either way. Instead, each program **checks what it managed to do**, and prints `contained` only if the wall held. The test's one expected output is `contained`, so `ACCEPTED` means the attack failed, and a `BREACHED …` message lands in the output if it succeeds.

Some examples:

- **The fork bomb** tries to start 200 `sleep` processes, and counts how many really started (`child.pid !== undefined`).
- **The filesystem escape** reads `/proc/mounts` to check that `/` is mounted `ro`, tries to overwrite its own code, then drops a script in `/tmp` and tries to run it.
- **`/etc/passwd`** is *meant* to be readable. What matters is whose file it is: Alpine's root line ends in `/bin/sh`, while an Ubuntu host's ends in `/bin/bash`. The program also checks its uid (65534) and that its capability bounding set is 0.
- **The 4 GB allocation** uses `Buffer.alloc(64 MB, 1)`. The fill touches every page, so the memory is really used, and isn't only virtual.

### How

- **`afterEach` checks the host:** the Docker daemon still answers, and no `codearena-run-*` container is left. A sandbox test that only checks the verdict hasn't tested containment.
- **Its own folder and config:** the tests sit outside `src`, with their own `test/tsconfig.json` and `test/adversarial/jest.config.json`. Typecheck becomes `tsc --noEmit && tsc --noEmit -p test`.
- **`maxWorkers: 1`:** one attack at a time, so the "no container left" check can't see another attack's container.
- **No Nest container:** `new JudgeService(new DockerCodeRunner())`. Plain constructors are enough when nothing needs swapping.

### Rebuild it

From PR #12's commit: write the fork bomb first, with **only** a verdict check, and remove `--pids-limit`. It still passes, and that's the lesson. Then add the `contained` check, and watch it fail as it should. Then write the other five.

```check
attacks
```

---

## Part 8 · Mutation testing: proving the tests can fail

### What

Remove one protection at a time, run the attacks, and check that the matching attack fails. Then restore the file.

| Protection removed | Attack that fails |
|---|---|
| `--network none` | network call |
| `--read-only` | filesystem escape |
| `noexec` changed to `exec` | filesystem escape |
| `--pids-limit` | fork bomb |
| `--memory` and `--memory-swap` | 4 GB allocation |
| `--cap-drop ALL` | reading `/etc/passwd` |
| `--user` | reading `/etc/passwd` |

### Why

**A test that can't fail proves nothing.** This is mutation testing, applied to infrastructure: each flag is a *mutant*, and the suite has to *kill* it.

**What it taught us:** simply deleting `noexec` left every test green. That's because Docker adds `noexec` to `--tmpfs` by default. The mutant survived, and the reason was a fact about Docker, not a weak test. To test the flag, you have to write `exec`.

### Rebuild it

Do it for real, one flag at a time, and write the table yourself. Then restore the file with `git restore apps/worker/src/adapters/docker-code.runner.ts`. The memory mutant really allocates up to 4 GB, so close heavy apps first.

---

## Part 9 · The Docker tests in CI

### What

A `worker-sandbox` job in `.github/workflows/ci.yml`:

1. It installs the dependencies.
2. It pulls the sandbox image, reading its tag from `docker-code.runner.ts` with `grep`.
3. It runs `test:integration` and `test:adversarial`.
4. It fails if any `codearena-run-` container is left.

### Why

Until then, the sandbox was tested only on your laptop. GitHub's Ubuntu runners have a Docker daemon, so the attacks can run on every PR.

- **Pull first,** so the download time never counts against a test's limit.
- **Read the tag from the code,** so CI can't drift from what the worker really runs.

---

## Git and GitHub, learned this week

- **The routine after a merged PR:** `git switch main && git pull`, then `git branch -D <branch>`, then `git fetch --prune`.
- **Why `-D` and not `-d`:** squash and rebase merges both create *new* commits on `main`, so Git can't see that your branch was merged, and `-d` refuses.
- **GitHub deletes the remote branch** after any merge (this repo's setting). Your laptop's copy stays until you delete it.
- **`fetch --prune`** removes the `origin/…` references to branches that GitHub has deleted.
- **Squash vs rebase merge:** squash by default (one PR = one commit on `main`, easy to revert). Rebase only when every commit is clean and makes sense alone.
- **Stacked PRs:** PR #13 needed #12's code. It was opened on top of it, then rebased onto `main` once #12 merged.

More in the [Git workflow guide](/guides/git-workflow).

---

## Your interview stories

- **The sandbox:** "Submitted code runs in a fresh container with no network, a read-only filesystem, limits on memory, processes and CPU, no capabilities, and a non-root user. A wall-clock deadline kills the *container*, through the daemon, because killing the client leaves it running. I found that bug and wrote a test for it."
- **Facts vs verdicts:** "The runner reports facts, and the judge decides. And our failures aren't the user's: if Docker is down, the job errors and gets retried. It never becomes a Runtime Error."
- **Attacks and mutation testing:** "I wrote six attacks. Each program checks what it managed to do, because a verdict alone proves nothing. Then I removed each protection one at a time to prove the matching attack fails. It even showed me that Docker adds `noexec` to `--tmpfs` by default."
- **Test data:** "Expected outputs come from a reference solution, checked against a brute force on random tests. The largest test proves the time limit separates O(n log n) from O(n²)."

---

## The rebuild plan

Do the rebuilds in this order. The times assume you've read the part first.

| # | Rebuild | Time |
|---|---|---|
| 1 | Part 1 · Jest | 30 min |
| 2 | Part 2 · facts and the enum migration | 45 min |
| 3 | Parts 5–6 · the checker and the judge loop | 1 h 30 |
| 4 | Part 4 · `DockerCodeRunner` | 3 h |
| 5 | Parts 7–8 · the attacks and the mutations | 2 h |
| 6 | Part 3 · one original problem of your own | 1 h 30 |

Then mark this page **rebuilt** at the top, with the date.
