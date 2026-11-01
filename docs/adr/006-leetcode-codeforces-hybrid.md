# ADR-006: A LeetCode–Codeforces hybrid, judged through stdin/stdout

- **Status:** Proposed. A draft from your mentor: challenge it, rewrite it in your own words,
  then mark it Accepted.
- **Date:** 2026-10-29

## Context

Until now CodeArena has been a LeetCode clone: 333 interview problems labelled
Easy/Medium/Hard, each with function starter code in JavaScript, TypeScript and
Python. The judge does not exist yet. `apps/worker` is a scaffold with a fake
runner, and **no problem has hidden test cases**: the seed only carries the
examples shown in the statement.

We now want CodeArena to be a mix of two products:

| | LeetCode | Codeforces |
|---|---|---|
| The user writes | a function (`twoSum(nums, target)`) | a whole program |
| Input arrives as | arguments | **stdin** |
| Output leaves as | a return value | **stdout** |
| Difficulty | Easy / Medium / Hard | a rating, 800–3500 |
| Limits | rarely shown | per problem, e.g. 2 s and 256 MB |
| Verdict | pass / fail | "Wrong answer **on test 4**" |
| Social layer | practice, weekly contests | timed rounds, live standings, a user rating |

This has to be decided **now**, before week 2 builds the judge: the input/output
model is the judge's contract, and everything else (the sandbox, the queue,
verdicts, limits) is shaped by it.

Three things make the hybrid worth it:

- **Contests give users a reason to be online at the same time.** That turns
  "classmates tried it" into real concurrent load on the queue and the
  leaderboard, which is a much better production story.
- **The maintainer trains on Codeforces every Saturday** (virtual contests, as
  part of the CP programme), so the product gets used by the person building it.
- **A plain LeetCode clone is the most common portfolio project there is.** A
  judge with contest standings and ratings is not.

## Decision

**1. The judge only knows stdin and stdout.** A run is
`(program, language, stdin, limits) → (stdout, exit status, time, memory)`.
The worker, the sandbox and the verdict logic never learn which kind of problem
they are judging.

**2. Every problem has a `judgeMode`.**
- `STDIO`: Codeforces-style. The submission is the whole program.
- `FUNCTION`: LeetCode-style. Before running, the worker wraps the user's
  function in a **per-language harness** that reads the test input from stdin,
  calls the function and prints the result in a canonical form. A `FUNCTION`
  problem is therefore a `STDIO` problem with generated boilerplate, and there is
  still exactly one execution path to secure.

**3. Output is compared by a checker, never byte-for-byte.** The default
`TOKENS` checker splits both outputs on whitespace and compares the tokens,
which is what Codeforces does for most problems. `FLOAT` compares numbers with
an absolute-or-relative tolerance of 1e-6. Custom checkers (problems with
several correct answers) come later.

**4. Problems carry the Codeforces metadata.** Each problem gets a nullable
`rating` on the Codeforces scale next to the existing `difficulty` label, plus
`timeLimitMs` (default 2000) and `memoryLimitMb` (default 256). The label stays
required: new problems take it from their rating band (Easy below 1200,
Medium 1200–1799, Hard from 1800).

**5. Verdicts get precise.** Tests run in order and the judge **stops at the
first failure**, as Codeforces does. The submission records which test failed
and how much memory it used. `MEMORY_LIMIT` joins the verdicts.

**6. Contests use ICPC rules first.** Rank by problems solved (descending), then
by penalty (ascending). Penalty is the minutes from the contest start to each
accepted submission, plus 20 minutes for every rejected attempt before it.
Compile errors cost nothing. Codeforces' Div. 3 and Educational rounds rank the
same way, with a smaller penalty per attempt. Standings live in a Redis sorted set, with both criteria
packed into one score as in `phase-5` §E.2:
`score = solved × 10⁷ + (10⁷ − 1 − penaltyMinutes)`.
The contest lifecycle is the `phase-5` Part A state machine.

**7. User rating comes after the contest.** When a rated contest ends, a batch
job updates each participant's rating using the Glicko-2 fields the `User` table
already has (`rating`, `ratingDeviation`, `volatility`, see `phase-3` §B.3).

**8. We write our own problems.** Codeforces statements belong to their authors.
A classic task (prefix sums, two pointers, shortest path) is an idea, not a
text, so we write the statement ourselves, with a reference solution and a test
generator.

### What the schema must express (you write the migration, Mon 2 Nov)

Points 1 to 5 above, turned into requirements for `schema.prisma`:

- a problem's **judge mode** (`STDIO` or `FUNCTION`) and its **checker** (`TOKENS` or `FLOAT`);
- an optional **rating**, filterable by range ("problems rated 1200–1400" is the
  CP list page's main query, so think about its index);
- a **time limit** and a **memory limit** per problem, with sensible defaults;
- a **memory-limit verdict**, plus, per submission, the **memory used** and the
  **number of the first failing test**;
- **every language the editor offers.** Today the web editor offers
  `javascript | typescript | python` and the database enum has no `JAVASCRIPT`,
  so `POST /submissions` would fail on day one.

The constraint: 333 rows already exist. Every new column needs a default or must
be nullable, so the migration stays a plain `ADD COLUMN` with no backfill. Read
the generated SQL before you apply it, and check that it says so. The contest
tables (contests, their problems indexed `A`, `B`, `C`…, registrations, and a
link from a submission to its contest) come in week 3 with the standings.

## Alternatives considered

- **Stay LeetCode-only.** Rejected. It keeps the least distinctive version of
  the product, and the per-language harness, the hardest part of a LeetCode
  judge, still has to be built.
- **Codeforces-only.** Rejected. It throws away the 333 interview problems and
  the classmates preparing for interviews, who are the first users.
- **Two judges, one per mode.** Rejected. It means two sandboxes, two sets of
  limits and two attack surfaces. The harness reduces `FUNCTION` to `STDIO`
  for the price of some generated boilerplate.
- **Exact byte comparison.** Rejected. A trailing space or a missing final
  newline turns a correct answer into Wrong Answer, and users rightly read that
  as a broken judge.
- **Codeforces' dynamic scoring** (problem values decay during the round, and a
  rejected attempt costs points). Deferred. It is harder to implement, harder to
  explain, and ICPC rules are a real format in their own right.
- **Hacks** (users submit inputs that break other users' solutions). Rejected
  for now. A hack is untrusted input run against untrusted code, which doubles
  the sandbox problem.
- **An external judge such as Judge0.** Rejected. The sandbox is the most
  technically distinctive part of the project, so outsourcing it removes the
  best interview material.

## Consequences

- **Good:** one execution path. Adding a language means adding an image and a
  run command (plus a compile command), not a new judge.
- **Good:** "Wrong answer on test 4", time and memory per submission are what
  competitive programmers expect, and they make the judge's behaviour testable.
- **Good:** contests create bursts of concurrent submissions, a realistic load
  for the queue, the worker pool and the standings.
- **Bad:** problems now come in two authoring formats, and `FUNCTION` needs a
  harness per language that parses typed arguments out of text.
- **Bad:** the 333 interview problems have no hidden tests, so they cannot be
  judged until tests are written. During the sprint they stay practice-only, and
  judging starts with the new `STDIO` problems.
- **Bad:** time limits depend on the machine. They have to be calibrated against
  the reference solution on the production VM (week 4), not on a laptop.
- **Bad:** contests make the clock part of correctness. Only server time counts,
  and the client countdown is display only (`phase-5`, clock skew).
- **Revisit if:** `FUNCTION` harnesses turn out to cost more than the problems
  they unlock, in which case convert interview problems to `STDIO`; or users
  ask for Codeforces-style scoring once ICPC rounds have run.

## What this changes in the sprint (`~/bcgx-prep/SPRINT.md`)

| Week | Was | Now |
|---|---|---|
| 2 · the judge | JS runner first, Python cuttable | **Python first** (the CP track's language), then JavaScript. Stdin/stdout with the `TOKENS` checker, "verdict on test N", `MEMORY_LIMIT`. 5–10 original `STDIO` problems with generated tests. *Cuttable:* the `FUNCTION` harness. C++ waits until after the sprint |
| 3 · SQL + leaderboard | a Redis sorted-set leaderboard | **Contest standings** in a Redis sorted set with ICPC packing, plus a global rating board. One of the six queries is the same standings computed in SQL (window functions), measured against the Redis projection |
| 4 · ship it | 10–20 classmates submit code | **A live 2-hour contest** for classmates: real concurrency, a real standings page |
| 5 · sharpen | unchanged | the rating update job, *if* weeks 2–4 closed on time |

## Related

[ADR-002](002-argon2id-for-passwords.md) to [ADR-005](005-per-ip-rate-limiting.md)
cover auth and are unaffected. The sandbox ADR ("the trust boundary") is due in
week 2 and applies to both judge modes unchanged, because both run as a plain
program reading stdin.
