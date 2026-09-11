# Progress — ground truth, 28 Aug 2026

## DSA (from /dsa — real numbers, not estimates)
| Category | Solved / Total |
|---|---|
| Arrays & Hashing | 0 / 31 |
| Two Pointers | 0 / 30 |
| Sliding Window | 0 / 16 |
| Stack | 0 / 18 |
| Monotonic Stack & Queue | 0 / 14 |
| Binary Search | 0 / 19 |
| … | |
| **TOTAL** | **0 / 341** |

## Spaced review
- Items in the queue: 73
- Overdue: 73

## Coding ladders
- /coding/java — level reached: 0
- /coding/spring-boot — level reached: 0



# Progress — ground truth, 27 Aug 2026

## DSA (from /dsa — real numbers, not estimates)
| Category | Solved / Total |
|---|---|
| Arrays & Hashing | ? / 31 |
| Two Pointers | ? / 30 |
| Sliding Window | ? / 16 |
| Stack | ? / 18 |
| Monotonic Stack & Queue | ? / 14 |
| Binary Search | ? / 19 |
| … | |
| **TOTAL** | **? / 341** |

## Spaced review
- Items in the queue: ?
- Overdue: ?

## Coding ladders
- /coding/java — level reached: ?
- /coding/spring-boot — level reached: ?
---

# Week 1 retro — auth, end to end · written 11 Sep 2026

## What shipped

| Task | Status |
|---|---|
| 1.1 Password hashing behind a port | ✅ + 4 unit tests |
| 1.2 Users module (domain/ports/adapters) | ✅ |
| 2.1 `POST /auth/register` | ✅ 201, 409 on duplicate, 400 on short password |
| 2.2 `POST /auth/login` + access tokens | ✅ `exp - iat = 900`, identical 401s, timing closed |
| 3.1 Refresh tokens + rotation | ✅ hashes stored, families shared |
| 3.2 Reuse detection | ✅ replay kills the family, verified in the DB |
| 4.1 httpOnly cookies + logout | ✅ idempotent, CSRF-scoped |
| 5.1 AuthGuard + `@CurrentUser()` + `@Public()` | ✅ global, opt-out |
| 5.2 Roles + rate limiting | ✅ 403 vs 401 correct, 429 on the 6th |
| 7.1 Tests | ✅ 20 unit + 18 e2e, both in CI |
| 7.2 ADRs 002–005 | ✅ |
| 6.1 TanStack Query | ⬜ **carried to Week 2** |

## What took longer than planned

**The week ran 5 days over.** Planned Mon 31 Aug → Sun 6 Sep; finished Fri 11 Sep.
Monday's task finished on Wednesday and it never recovered. Most of the slip was
life, not the plan — but the plan had no slack to absorb it.

**The biggest single time-sink was environment, not code.** In rough order:
a stale server on port 3001 (three wrong diagnoses before checking `ss -ltnp`),
a stale TypeScript server in the editor reporting errors `tsc` did not have,
and work reverted by a branch switch.

> When the editor and the compiler disagree, the compiler is right.

## The bugs worth remembering

These all **type-checked cleanly** and were still wrong. That is the whole
argument for 7.1.

- `revokedAt: null` in an `updateMany` **data** block — `revokeFamily` silently
  un-revoked the family it was meant to kill. `where` filters; `data` writes.
- `Date.now() + 7*24*60*60` — milliseconds vs seconds. Refresh tokens expired in
  **10 minutes**, and the symptom (random logouts) points nowhere near the cause.
- Storing the *presented* refresh token back in the cookie after rotation, so
  the browser kept a revoked token and triggered reuse detection on the next
  refresh. Renaming to `presented`/`rotated` is what stopped it recurring.
- A field initializer reading `this.hasher` — field initializers run **before**
  parameter properties are assigned, so it was `undefined` at construction.
- `verify(password, hash)` with the arguments reversed. Every login failed and
  the error said nothing useful.
- A missing cookie reaching `createHash(undefined)` → **500** where it should
  have been a 401.

## What I'd do differently

1. **Check the boring things first, every time.** `ss -ltnp | grep 3001`,
   `git status`, `tsc --noEmit`. Three of the worst time-sinks were in that list.
2. **Write the e2e test earlier.** The reuse-detection test would have caught
   the cookie bug and the `revokedAt: null` bug immediately. It was scheduled
   for Sunday and should have been written right after 3.1.
3. **Verify with a command, not by reading.** Every task that "looked done" and
   wasn't was one I had read rather than run.
4. **Don't plan a full week with zero slack.** Week 2 keeps one buffer day.

## Carried into Week 2

- **6.1 TanStack Query** — including the **refresh interceptor**. Without it the
  frontend appears to log users out every 15 minutes.
- Prune expired `RefreshToken` rows (a scheduled job, not urgent).
- Log a warning when reuse detection fires — currently invisible to us.
- Move throttler storage to Redis before running more than one instance
  ([ADR-005](docs/adr/005-per-ip-rate-limiting.md)).

## DSA

Behind. The build consumed the DSA block most days. Week 2 target: 3/day on
Arrays & Hashing, using the new **🔍 Recognise it** blocks in the dojo guide
before each problem.
