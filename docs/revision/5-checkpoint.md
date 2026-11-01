# Part 5 · Sun 1 Nov: the checkpoint

**About 1 hour 45** of CodeArena, inside SPRINT's Sunday (the mock interview and the CP checkpoint
are separate). No new material, and no notes open until each step is over.

The test is binary: you can do it cold, or you can't **yet**. A "yet" goes on Monday's first hour.

---

## 1. CodeArena from a blank page (40 min)

Blank paper, phone recording. Draw the whole system and explain **every box and arrow** for
10 minutes, as if to an interviewer who has never seen it. Then stop the recording, open the repo
and score yourself against the list below. Score only what you *said*, not what you meant.

### It must contain

**The pieces, with their ports**
- [ ] the browser and Next.js on :3000; server components call `server-api.ts`, client components
  go through TanStack Query and `http.ts`
- [ ] the NestJS API on :3001, and its guard chain in order: throttler → auth → roles
- [ ] Postgres on :5433, and the seven tables: User, Problem, Tag, ProblemExample, TestCase,
  Submission, RefreshToken
- [ ] Redis on :6379, **used by nothing yet** (an honest answer scores the point)
- [ ] the worker: a separate process, with no HTTP server, a `CodeRunner` port and a fake adapter

**The flows**
- [ ] login: where each token goes and why (memory vs httpOnly cookie)
- [ ] the 15-minute expiry: the interceptor, rotation, the same family
- [ ] a replay: reuse detection burns the family
- [ ] one list page: from the click to 3 SQL statements per page, with cursor pagination

**The decisions, each with what you rejected**
- [ ] Argon2id (vs SHA-256 and bcrypt) · SHA-256 for refresh tokens (vs Argon2)
- [ ] the global guard with `@Public()` (vs per-route guards) · 401 vs 403
- [ ] ports and adapters: what they cost, and where they pay
- [ ] the judge as a separate process (vs inside the API)

**Where it's going (ADR-006)**
- [ ] the stdin/stdout contract, and `FUNCTION` problems as a harness over it
- [ ] contests with ICPC standings in a sorted set
- [ ] at least one known weakness, named before anyone asks: I-6, the race (fixed, with its test,
  if you got to it)

**Pass:** 18 of 20 boxes ticked, and under 10 minutes without a long pause. Anything you missed
goes on Monday's list.

---

## 2. Rapid fire (20 min)

Thirty seconds each, out loud, no folds: the answers are in parts 1 to 4. Mark the misses.

1. Why does a service need `@Inject(TOKEN)` for an interface but not for a class?
2. What does `whitelist: true` do to an unknown property?
3. Why is `dummyHash` there?
4. Why is the refresh token not a JWT?
5. The order of `rotate()`'s checks, and why reuse comes before expiry.
6. Why is revoking an update, never a delete?
7. What attack does `HttpOnly` stop, and what attack does `SameSite` stop?
8. 401 or 403 for a USER on an admin route?
9. Three ways per-IP rate limiting fails.
10. What happens when two tabs refresh at the same time?
11. Which index does Postgres not create for a foreign key?
12. Why a cursor rather than an offset?
13. `migrate dev` vs `migrate deploy`.
14. How to add a NOT NULL column to 10 million rows.
15. `staleTime` vs `gcTime`.
16. Why is the `QueryClient` inside `useState`?
17. Namespaces vs cgroups, one sentence each.
18. Why `--memory-swap` equal to `--memory`?
19. Why doesn't killing `docker run` stop the container?
20. Ana: 2 solved, 119 minutes of penalty. Her packed score?

---

## 3. The two-minute pitch (15 min)

Write it, then say it until it takes two minutes and sounds like you. Cover what it is, what's
hard about it, one decision you'd defend, and where it's going.

<details><summary>One way to say it (don't memorise it, write your own)</summary>

"CodeArena is a competitive-programming platform that mixes LeetCode-style interview practice with
Codeforces-style rounds. It's a TypeScript monorepo: a NestJS API on Postgres, a Next.js front end,
and a separate judge worker.

The part I'd most like to talk about is auth, because I built it to production standards: Argon2id
passwords, short-lived access tokens kept in memory, and refresh tokens in httpOnly cookies with
rotation and reuse detection. A replayed token burns the whole session. While revising, I found a
race in my own rotation: two simultaneous refreshes both succeeded. I reproduced it in a test and
fixed it with an atomic conditional update.

I'm building the judge now: every submission will run in a locked-down container with no network,
a read-only filesystem, and memory, process and time limits, and I'm writing tests that attack my
own sandbox. Problems can be Codeforces-style programs or LeetCode-style functions, and both go
through one stdin/stdout path, so there's only one thing to secure."

</details>

---

## 4. Your story bank (10 min)

SPRINT's week 5 needs six STAR stories. This week already produced candidates. Write two lines for
each one you'd tell:

- the `revokedAt: null` bug that type-checked and un-revoked a family (September)
- the race in rotation you found and fixed (I-6)
- the e2e suite that couldn't load anywhere, while CI had never run it (I-1)
- the wall-clock limit that didn't stop the container (I-17), told as "how I designed the time
  limit"

---

## 5. Retro, then next week (20 min)

Answer in writing:

1. Which of the 18 issues did you fix? Which ones are left, and do they go to week 2 or to the cut
   list?
2. Which questions were ❌ twice?
3. What took longer than planned, and why?
4. Is ADR-006 accepted, rewritten or rejected? If accepted, flip its status and update the index in
   `docs/adr/README.md`.
5. Is your work committed in small commits whose messages explain *why*? Is CI green on `main`?

Then send **`start week of 2 Nov`**, and the judge week begins.
