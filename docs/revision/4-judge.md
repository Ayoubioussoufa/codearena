# Part 4 · Sat 31 Oct, second half: the judge, and where CodeArena is going

**2 hours 30.** 0:20 the worker scaffold · 0:40 `phase-2` Parts A–C · 0:45 the sandbox by hand ·
0:30 ADR-006, the pivot · 0:15 design week 2 on paper · Git Part 3.

Nothing here gets built. Week 2 builds the judge; today you arrive at Monday already knowing what
each line of it will be for.

---

## 1. The worker you already have (20 min)

Open `apps/worker/src/`: five files.

**Q1.** Why `NestFactory.createApplicationContext` and not `NestFactory.create`?

<details><summary>Answer</summary>

It gives you the dependency-injection container with **no HTTP server and nothing listening**. A
process that runs hostile code shouldn't also be a network service that something can reach.

</details>

**Q2.** Why is the judge a separate process and not an `@Injectable()` inside the API?
(`phase-2` §C.3)

<details><summary>Answer</summary>

The blast radius, the resources and the privileges. Judging is CPU-heavy and slow, so a busy judge
must not slow logins down. A crash or a runaway run must not take the API with it. The worker needs
the Docker socket, and the API must never have it. And workers scale on their own: four workers,
one API.

</details>

**Q3.** Which secrets must the worker **not** hold, and what is the one dangerous thing it does
need?

<details><summary>Answer</summary>

It must not hold `JWT_SECRET`, and it shouldn't have a database role that can read users or
refresh tokens: it needs to read submissions and tests and to write verdicts. The dangerous
thing is the **Docker socket**, which is effectively root on the host: anyone who can talk to it
can start a privileged container that mounts `/`. That's why week 4 puts the whole system on one
VM with nothing else on it.

</details>

**Q4.** `FakeCodeRunner.run()` takes no parameters and isn't `async`. Why is that correct?

<details><summary>Answer</summary>

A function with fewer parameters is assignable to an interface method with more: TypeScript
allows ignoring arguments. And nothing is awaited, so `async` would be a lie that the
`require-await` lint rule rightly catches. The comments in the file say so. Read them as if a
reviewer wrote them.

</details>

---

## 2. `phase-2`, Parts A to C (40 min)

Read `docs/phase-2-execution-sandboxing.md` lines 36–280 with nothing else open. Then close it and
answer.

**Q5.** List six things a hostile submission can try.

<details><summary>Answer</summary>

Burn CPU forever (an infinite loop); exhaust process ids (a fork bomb); exhaust memory; fill the
disk; use the network (exfiltrate data, attack internal services, mine crypto); read secrets (the
environment, mounted files, the Docker socket); escalate privileges or exploit the kernel to
escape; flood stdout with gigabytes.

</details>

**Q6.** Namespaces and cgroups, one sentence each.

<details><summary>Answer</summary>

**Namespaces decide what a process can *see*** (process ids, network interfaces, mounts, hostname,
users). **cgroups decide how *much* it can use** (CPU, memory, process count, I/O).

</details>

**Q7.** Capabilities and seccomp: what's each one for?

<details><summary>Answer</summary>

Capabilities split root's powers into pieces (`CAP_NET_RAW`, `CAP_SYS_ADMIN`…) so you can drop
them all. seccomp filters **system calls**: Docker's default profile blocks dozens of dangerous
ones, such as `mount`, `kexec_load` and `keyctl`. Each layer catches what the others miss: that's
defence in depth.

</details>

**Q8.** "Docker is not a sandbox by default." Why not?

<details><summary>Answer</summary>

A container shares the host's kernel. By default it runs as root inside, has a network, a writable
filesystem, and no memory or process limits. A kernel exploit escapes any container. Stronger
isolation means gVisor (a kernel in user space) or Firecracker (micro-VMs). Name them, but don't
build them.

</details>

---

## 🔧 3. The sandbox, by hand (45 min)

SPRINT says: run namespaces and cgroup limits by hand, and be able to say what each one stops.

### Namespaces

```bash
sudo unshare --pid --fork --mount-proc bash   # then: ps aux    → what's PID 1? how many processes?
exit
sudo unshare --net bash                       # then: ip a      → which interfaces are left?
exit
```

Say what each experiment proved before you go on.

### The hardened `docker run`

Every result below was observed on 28 Oct with `python:3.12-alpine`. **Predict each one first.**

```bash
H="--rm --network none --read-only --tmpfs /tmp:rw,size=16m,noexec \
   --cap-drop ALL --security-opt no-new-privileges --user 65534:65534 \
   --pids-limit 64 --memory 128m --memory-swap 128m --cpus 1"

docker run $H python:3.12-alpine python -c "b = bytearray(1024**3)"; echo "exit=$?"
docker run $H python:3.12-alpine python -c "import urllib.request; urllib.request.urlopen('http://example.com', timeout=3)"
docker run $H python:3.12-alpine python -c "open('/pwned', 'w')"
docker run $H python:3.12-alpine id
docker run $H python:3.12-alpine head -2 /etc/passwd
```

For the fork bomb, write a Python loop that forks children that sleep, count them until `fork`
fails, and print the count and the error.

<details><summary>What happened, and what each flag stops</summary>

| Flag | Stops | Observed |
|---|---|---|
| `--memory 128m --memory-swap 128m` | memory exhaustion (equal values mean no swap to hide in) | `exit=137` = 128 + 9: SIGKILL from the OOM killer |
| `--network none` | exfiltration, attacks on your network | `URLError: [Errno -3] Try again`: only the loopback interface exists, so even DNS fails |
| `--read-only` + a small `noexec` `/tmp` | writing files, dropping binaries to run | `OSError: [Errno 30] Read-only file system: '/pwned'` |
| `--user 65534:65534` | being root inside the container | `uid=65534(nobody)` |
| `--pids-limit 64` | fork bombs | `fork failed after 63 children: [Errno 11] Resource temporarily unavailable` (63 children + the parent = 64) |
| `--cap-drop ALL`, `no-new-privileges` | root powers; setuid escalation | (nothing to print: they remove options) |
| `--cpus 1` | hogging every core | (nothing to print) |
| — | reading `/etc/passwd` | **succeeds**, and that's fine: it's the *image's* file, not the host's. The mount namespace is doing its job. What matters is that nothing from the host is mounted |

</details>

### 🐛 I-17 · the wall-clock limit that doesn't stop anything

```bash
timeout -s KILL 2 docker run --name tle-probe $H python:3.12-alpine python -c "while True: pass"
docker ps --filter name=tle-probe        # ← look at the status
docker rm -f tle-probe                   # clean up
```

On 28 Oct, `timeout` returned after 2,009 ms, and the container was **still `Up`**, still burning a
CPU. Before week 2, explain why. That explanation is the design of your time limit.

<details><summary>Hint 1</summary>

Who is the parent of the container's process: your shell, or something else? What exactly did
`timeout` kill?

</details>

<details><summary>Hint 2: what the design needs</summary>

`docker run` is only a *client* of the Docker daemon; the container belongs to the daemon. So the
worker must stop the **container**, by name or id, through the Docker API. It also needs a reaper
for containers that outlive their deadline, in case the worker itself dies mid-run. And decide
what your `runtimeMs` measures: container start-up takes hundreds of milliseconds, so timing around
`docker run` charges the user for Docker.

</details>

---

## 4. The pivot: ADR-006 (30 min)

Read [ADR-006](../adr/006-leetcode-codeforces-hybrid.md). It's marked **Proposed** on purpose: by
Sunday, rewrite it in your own words and accept it, or reject the parts you disagree with and say
why. You'll defend it in interviews, so it has to be yours.

**Q9.** The difference between a LeetCode judge and a Codeforces judge, in one sentence.

<details><summary>Answer</summary>

LeetCode **calls your function** with arguments and compares the return value. Codeforces **runs
your program** with a test file on stdin and compares what it prints on stdout.

</details>

**Q10.** Why does the judge only understand stdin and stdout? How does a LeetCode-style problem run,
then?

<details><summary>Answer</summary>

So that there's exactly **one** execution path to secure, limit and measure. A `FUNCTION` problem
gets a per-language *harness*: generated code that reads the test from stdin, parses it into typed
arguments, calls the user's function and prints the result in a canonical form. The wrapped
program is then judged like any other `STDIO` program.

</details>

**Q11.** Why compare tokens instead of bytes? Give two outputs that bytes reject and tokens accept.

<details><summary>Answer</summary>

`"1 2 3\n"` against `"1 2 3"` (no final newline), and `"1  2 3 "` (a double and a trailing space).
A judge that rejects those looks broken to every competitive programmer. Floats need a tolerance
on top: `0.333333` against `0.3333333` is the `FLOAT` checker's job.

</details>

**Q12.** A submission fails test 4 of 30 with a wrong answer, and would have timed out on test 9.
What does the user see? Why stop at test 4?

<details><summary>Answer</summary>

"Wrong answer on test 4." Stopping at the first failure is what Codeforces does: it saves CPU, and
the remaining verdicts tell the user nothing they can act on.

</details>

**Q13.** ICPC penalty, worked. The contest starts at 10:00. Ana solves A at 10:12 after one wrong
answer, solves B at 10:47 after two wrong answers and one compile error, and never solves C after
three wrong answers. What are her solved count and penalty?

<details><summary>Answer</summary>

A: 12 + 20 = 32. B: 47 + 2 × 20 = 87 (the compile error is free). C: unsolved, so **no penalty at
all**; only solved problems count. **2 solved, 119 minutes.**

</details>

**Q14.** Pack Ana's result with ADR-006's formula, `solved × 10⁷ + (10⁷ − 1 − penalty)`. Why
subtract the penalty? Why is the number safe in a Redis sorted set?

<details><summary>Answer</summary>

2 × 10⁷ + (10⁷ − 1 − 119) = 20,000,000 + 9,999,880 = **29,999,880**. `ZREVRANGE` ranks high to
low and a *lower* penalty must rank higher, so the penalty is inverted. Scores are doubles, exact
up to 2⁵³ ≈ 9 × 10¹⁵, and even 26 solved problems stay below 3 × 10⁸. Same reasoning as `phase-5`
§E.2.

</details>

**Q15.** Why write our own problems instead of importing Codeforces statements?

<details><summary>Answer</summary>

The statements belong to their authors; the classic ideas don't. And writing a problem means a
reference solution, a test generator and a stress test, which is exactly the skill your CP training
builds anyway.

</details>

**Q16.** What can't the judge promise about time limits?

<details><summary>Answer</summary>

That they mean the same thing on every machine. A limit has to be calibrated against the reference
solution **on the production VM** (say 2–3× its time), measured inside the container, and
re-checked when the VM changes.

</details>

### 🐛 I-18 · the two language lists disagree

`apps/web/src/lib/types.ts` offers `javascript | typescript | python`. The database's `Language`
enum is `TYPESCRIPT | PYTHON | CPP | JAVA`. The first JavaScript submission in week 2 has nowhere
to go. It belongs in Monday's migration (ADR-006 lists what that migration must express).
Decide where the **single** list of languages should live so this can't drift again. Hint:
`packages/shared` is still empty.

---

## 5. Week 2 on paper (15 min)

On a blank page, draw the path of one submission: from the **Submit** button to the verdict
appearing live. Use Postgres, Redis/BullMQ, the worker, the sandbox and a WebSocket. Then mark
where a job can be **delivered twice**, and how your design makes that harmless.

<details><summary>Compare with this</summary>

1. The browser sends `POST /submissions { problemId, language, code }`.
2. The API inserts a `PENDING` submission, enqueues a job carrying **only the submission id**, uses
   that id as the job id, and answers `202 { id }`.
3. The worker takes the job, **claims** the submission with a conditional update (only if it is
   still `PENDING`), loads the tests, and runs each one in a fresh container until the first
   failure.
4. It writes the verdict with the test number, time and memory, then publishes a "verdict" event.
5. The API, subscribed to that event, pushes it over a WebSocket to the user's room.

Delivered twice? BullMQ is *at-least-once*: a worker can die after judging but before
acknowledging. The id used as the job id avoids duplicate jobs, and the conditional claim means a
redelivered job finds nothing to do. That's your idempotency test in week 2. Why only the id in the
job? The database stays the source of truth, Redis never holds 50 KB of code, and a stale payload
can't be judged.

</details>

---

## Before you stop

- [ ] both `unshare` experiments run and explained
- [ ] every `docker run` predicted, then run, with "what it stops" said out loud
- [ ] I-17 explained in your own words (no fix yet: that's week 2)
- [ ] Q1–Q16 marked, misses copied
- [ ] ADR-006 annotated: what you agree with, what you'd change
- [ ] Git Part 3
