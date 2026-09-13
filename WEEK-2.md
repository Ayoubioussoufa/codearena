# Week 2 — The judge, part 1

### Mon 14 → Sun 20 Sep 2026 · mornings revise, afternoons build

---

## The shape of every day

| Block | Time | What |
|---|---|---|
| ① Review | 0:30 | SRS queue. **Never cut this** |
| ② **Morning — revise** | 2:30 | Last week's material, as exercises in the dojo |
| ③ DSA | 1:30 | 3 problems, Arrays & Hashing |
| — | 0:45 | Eat, away from the screen |
| ④ **Afternoon — read** | 0:45 | The day's `docs/phase-2` section |
| ⑤ **Afternoon — build** | 3:00 | Week 2's task |
| ⑥ Write | 0:30 | Commit, and one line in `PROGRESS.md` |

**~9.5 hours.** The morning is revision by *doing*, not reading: **150 exercises** are now embedded
in the guides, and the morning column below says which ones.

> **The mornings are not optional padding.** You built auth in a fortnight and most of it has not
> been touched since. A thing you built once and never revisited is a thing you cannot rebuild.

---

## Why this week matters more than it looks

> **Almost no junior candidate has built a sandbox and can talk about seccomp.**

This is the most technically distinctive thing in your entire project. Auth is table stakes — every
bootcamp graduate has a login form. A hardened execution sandbox with adversarial tests is a
conversation nobody else in the pile can have.

**So slow down.** If the week runs long, cut Friday's WebSocket work, not Saturday's attacks.

---

## The week at a glance

| Day | ② Morning — revise | ⑤ Afternoon — build |
|---|---|---|
| **Mon** | backend-architecture · 20 | Read A+B. Scaffold `apps/worker` |
| **Tue** | nestjs · 14 | Read C. The hardened runner, JS only |
| **Wed** | phase-1 · 13 · then typescript · 12 | Read D. BullMQ + `POST /submissions` |
| **Thu** | git-workflow · 12 · then testing · 8 | The worker consumes, verdicts land |
| **Fri** | react · 12 · then javascript · 8 | Read E. Push the result over a socket |
| **Sat** | DSA only | **Attack your own sandbox** |
| **Sun** | The 20 questions, out loud | ADR-006, retro, checkpoint |

---

# MONDAY 14 SEP

## ② Morning — [backend-architecture](http://localhost:3002/guides/backend-architecture) · 20 exercises

Do them in order. **Reset and retype the ones you had to reveal** — that second pass is where it
sticks.

The three to slow down on, because this week's worker is built out of them:

- **`port-interface`** and **`two-adapters`** — you are about to write a `CodeRunner` port with a
  Docker adapter and a fake. Same shape as `PasswordHasher`.
- **`adapter-maps`** — the worker will return a result object. It must not be whatever Docker
  handed you.

## ④ Read · `docs/phase-2` **Parts A + B** (lines 36–208)

The threat model, namespaces, cgroups, capabilities, seccomp. **Do the two exercises in Part A** —
`hostile-submission` and `docker-run-hardened` — before you write any code. They *are* the design.

> **The sentence the whole week hangs on:**
> **Namespaces decide what a process can *see*. cgroups decide how *much* it can use.**

## ⑤ Build — scaffold the worker

```
apps/worker/
  src/
    domain/        run-result.entity.ts      — Verdict, runtimeMs, stdout, stderr
    ports/         code-runner.port.ts       — run(code, language, limits) + Symbol
    adapters/      docker-code.runner.ts     — the real one, next task
                   fake-code.runner.ts       — returns a canned result, no Docker
    application/   judge.service.ts          — orchestrates; knows nothing of Docker
    main.ts
```

**It is a separate workspace package, not a folder in `apps/api`.** That is the whole point of
C.3 — a sandbox escape must land somewhere holding no database credentials and no JWT secret.

Add it to `pnpm-workspace.yaml` (it already globs `apps/*`), give it its own `package.json`,
`tsconfig.json` extending the base, and a `dev` script.

### ✅ Done when

- `pnpm --filter worker dev` starts and exits cleanly
- `pnpm -r typecheck` passes with the new package included
- `grep -rn "prisma\|@nestjs/jwt" apps/worker/src` → **nothing**. The worker has no credentials.

---

# TUESDAY 15 SEP

## ② Morning — [nestjs](http://localhost:3002/guides/nestjs) · 14 exercises

`custom-provider` and `module-wiring` matter most today — the worker needs the same token-and-binding
pattern for its `CodeRunner`.

## ④ Read · `docs/phase-2` **Part C** (lines 209–280) and **Part G** (562–669)

Part G is a complete toy runner. Read it, then close it.

## ⑤ Build — the hardened Docker runner

Write `DockerCodeRunner implements CodeRunner`. One container per submission, every flag from the
`docker-run-hardened` exercise, plus a **wall-clock kill** in case the CPU limit is not enough.

**JavaScript only today.** One language working properly beats two half-wired.

### 🧠 How to think

**Every flag closes a specific hole**, and you should be able to say which:

| Flag | Without it |
|---|---|
| `--network=none` | the submission POSTs your test cases to its own server |
| `--pids-limit` | a fork bomb takes down the host |
| `--memory` | one allocation evicts everything else on the box |
| `--read-only` + `:ro` mount | the submission rewrites the code you are about to judge |
| `--cap-drop=ALL` | root-in-container is one kernel bug from root-on-host |
| `--user 1000:1000` | you are running hostile code as root |

**The timeout needs two layers.** A CPU limit does not stop a process that sleeps, and
`docker run` with no deadline waits forever. Wall-clock kill *and* CPU cap.

**Capture stdout and stderr separately**, cap both, and never send raw stderr to a client — a stack
trace can carry your paths.

### ✅ Done when

```bash
# a correct solution
echo 'console.log(2+3)' | <your runner>          # → 5, verdict ACCEPTED

# an infinite loop
echo 'while(true){}' | <your runner>             # → TIME_LIMIT, killed within the limit

# a network attempt
echo 'fetch("http://example.com")' | <your runner>   # → RUNTIME_ERROR, no egress
```

And `docker ps -a` shows **no leftover containers** — `--rm`, and clean up on the timeout path too.

---

# WEDNESDAY 16 SEP

## ② Morning — [phase-1](http://localhost:3002/guides/phase-1-auth-data-frontend) · 13, then [typescript](http://localhost:3002/guides/typescript) · 12

The heaviest morning of the week. If you run out of time, finish phase-1 and carry typescript to
Thursday.

## ④ Read · `docs/phase-2` **Part D** (lines 281–441)

Queues and idempotency. **Do `idempotent-worker` and `at-least-once` before you build.**

## ⑤ Build — the queue and the endpoint

```bash
pnpm --filter api add @nestjs/bullmq bullmq
pnpm --filter worker add bullmq
```

- `POST /submissions` — authenticated, validates a DTO, writes a `Submission` with
  `verdict: PENDING`, enqueues the id, returns **202 Accepted** with the submission id
- `GET /submissions/:id` — the caller polls this until the socket exists

### 🧠 How to think

**202, not 201.** The work is accepted, not finished. A 201 would promise a completed resource.

**Enqueue the id, never the code.** A queue is not a database: the payload should be a pointer, so
the worker reads the authoritative row and a 50 KB submission does not live in Redis.

**Write the row before you enqueue.** The other order gives you a job referencing a submission that
does not exist yet, and it fails intermittently under load — the worst kind.

**Rate-limit this endpoint.** Judging is the most expensive thing your system does, so it is the
most attractive thing to spam. You already have `@Throttle`.

### ✅ Done when

- `POST /submissions` → **202** and a row with `verdict: PENDING`
- Without a token → **401**
- `docker exec codearena-redis redis-cli LLEN bull:judge:wait` → the job is queued
- A malformed language → **400**, not 500

---

# THURSDAY 17 SEP

## ② Morning — [git-workflow](http://localhost:3002/guides/git-workflow) · 12, then [testing](http://localhost:3002/guides/testing) · 8

The git set is the one that cost you real hours. `branch-d-rule` and `post-merge-sync` especially.

## ⑤ Build — close the loop

The worker consumes the queue, runs the code, writes the verdict.

- Load the submission, run it against the problem's test cases
- Compare output → `ACCEPTED` / `WRONG_ANSWER` / `TIME_LIMIT` / `RUNTIME_ERROR`
- Write `verdict` and `runtimeMs` back
- **Make it idempotent** — the same job running twice must not double-write

### 🧠 How to think

**The worker needs database access it cannot be trusted with.** Give it a Prisma client with a
*separate, narrower* role than the API's — it needs to read submissions and write verdicts, and
nothing else. That is the trust boundary made concrete rather than described.

**Compare output exactly, then decide about whitespace.** Trailing newlines are the single most
common source of a `WRONG_ANSWER` that should have been accepted. Normalise deliberately and write
down what you chose.

**A crash in the runner is not a `WRONG_ANSWER`.** Distinguish "the submission failed" from "we
failed": the first is a verdict, the second is an error that retries.

### ✅ Done when

- Submit a correct solution → the row becomes `ACCEPTED` within seconds
- Submit a wrong one → `WRONG_ANSWER`
- Submit an infinite loop → `TIME_LIMIT`, and the container is gone
- Run the same job twice by hand → **one** result, no double write
- Kill the worker mid-job and restart → the job completes

---

# FRIDAY 18 SEP

## ② Morning — [react](http://localhost:3002/guides/react-fundamentals) · 12, then [javascript](http://localhost:3002/guides/javascript) · 8

## ④ Read · `docs/phase-2` **Part E** (lines 442–503)

## ⑤ Build — push the result

A WebSocket gateway that pushes the verdict the moment it exists, instead of the client polling.

- Authenticate the socket handshake — **the HTTP guard does not cover it**
- A room per user, named from the **verified** identity on the socket
- The worker publishes; the API gateway emits

### 🧠 How to think

**Never take the room name from the client.** `subscribe({ room: 'user:someone-else' })` is the
whole attack, and it works by default. Derive it server-side from the authenticated socket.

**The worker and the gateway are different processes**, so the worker cannot emit directly. It
publishes to Redis; the gateway subscribes and emits. That indirection is also what lets you run
more than one API instance later.

> **This is the cuttable day.** If Thursday ran over, leave polling in place and go straight to
> Saturday. A working judge with polling beats a half-wired socket.

### ✅ Done when

- Submit in one browser tab → the verdict appears without a refresh
- A second user's tab shows **nothing**
- A socket with no token is rejected at the handshake

---

# SATURDAY 19 SEP — **attack your own sandbox**

**No morning revision today. This is the day that matters.**

## ⑤ Build — `apps/worker/test/adversarial/`

Six tests. Each submits hostile code and asserts it is **contained and reported cleanly** — not
that it crashed, that it was *handled*.

| # | Attack | Must produce |
|---|---|---|
| 1 | `while(true){}` | `TIME_LIMIT`, container killed |
| 2 | `new Array(1e10)` | `RUNTIME_ERROR`, OOM-killed, host unaffected |
| 3 | a fork bomb | contained by `--pids-limit`, host unaffected |
| 4 | `fetch('http://host.docker.internal')` | fails — no egress |
| 5 | `fs.readFileSync('/etc/passwd')` | reads the container's, never the host's |
| 6 | `fs.writeFileSync('/code/main.js', …)` | fails — the mount is read-only |

### 🧠 How to think

**Run the host checks too.** After each test, assert the host is still healthy: `docker ps` shows no
leftovers, memory is reclaimed, the API still answers `/health`. A sandbox test that only checks the
verdict has not tested containment.

**Write the fork bomb carefully** and run the suite in a VM or a container if you can. You are
deliberately attacking your own machine.

> **This file is a portfolio artifact on its own.** It is the thing you link to. Comment each test
> with *which* mechanism contains it — `--pids-limit`, not "the sandbox".

### ✅ Done when

`pnpm --filter worker test:adversarial` → **6 passed**, and the host is untouched after all six.

---

# SUNDAY 20 SEP — consolidate

## Morning — prove you know it

1. **[The 20 questions](STUDY-PRIORITIES.md#the-self-assessment--20-questions), out loud, recorded.**
   Score out of 40. Two points when you name a rejected alternative.
2. **From a blank file**, rebuild `DockerCodeRunner.run()` — every flag, and what each one stops.

## Afternoon — write it down

**ADR-006 — the trust boundary.** *What a hostile submission can and cannot do.* The
Alternatives-considered section is the one that carries it:

- **Run in-process with `vm2`** — rejected: repeated sandbox escapes, and it shares your process
- **A plain Docker container with defaults** — rejected: not a sandbox; root, full capabilities,
  unrestricted network
- **gVisor or Firecracker** — stronger kernel isolation, and the right answer at scale; rejected
  *for now* on operational cost. **Say this one out loud in interviews** — knowing what you did not
  build is as strong a signal as what you did

Then the retro in `PROGRESS.md`, and the checkpoint below.

---

# 🔍 Checkpoint — Sunday night

Binary. No partial credit.

- [ ] `docker compose up` gives register → log in → browse → **submit → sandboxed run → verdict**
- [ ] All **6** adversarial tests pass, host untouched
- [ ] The worker has no database credentials it does not need, and no JWT secret
- [ ] The same job run twice produces **one** result
- [ ] You can explain, from a blank whiteboard and with no notes: **what a namespace is, what a
      cgroup limits, and why `--network=none` matters**
- [ ] CI green · ADR-006 written · `PROGRESS.md` retro
- [ ] All **150** guide exercises attempted at least once
- [ ] DSA: 15+ Arrays & Hashing problems, review queue clear

**If two or more fail**, Week 3 opens by finishing them and SQL week slips. Write down *which* — the
last plan broke by carrying debt forward silently.

---

# DSA — 3/day, still Arrays & Hashing

You are behind, and the roadmap's "Trees" target assumes a week you did not get. **Finish the
pattern you are in** rather than starting a new one badly.

Read the **🔍 Recognise it** block before each problem. The method, unchanged:

1. Brute force out loud first, **with its complexity**
2. Ask what the brute force *repeats* — that repetition is what a hash map removes
3. Only then write code
4. Close it and **re-derive the template from blank**

---

# Java — 45 min/day, capped

`/coding/java` level 3. Non-negotiable, and non-negotiably capped — weeks 9–11 depend on you
arriving with the syntax already in your fingers, not on you learning Spring from scratch.

The [java-spring-boot](http://localhost:3002/guides/java-spring-boot) guide now has 8 exercises.
Two of them cover the **persistence context**, which is the one genuinely new idea in that whole
phase. Do those two now, not in November.

---

# If the week collapses

Cut in this order:

> **Friday's WebSocket → Thursday's polish → the morning revision.**
> **Never Saturday.** **Never ① Review.**

Saturday's adversarial suite is the single most distinctive artifact you will produce this quarter.
A judge that works with polling and six passing attack tests is a far stronger week than a
beautifully realtime judge you never tried to break.
