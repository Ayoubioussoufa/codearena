# ADR-005: Rate-limit the credential endpoints per IP

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

[ADR-002](002-argon2id-for-passwords.md) makes each password guess cost ~45ms of
server CPU. That defends the **offline** attack — an attacker who already has
the database.

It does almost nothing for the **online** attack. Without a cap on attempts,
`POST /auth/login` is a password-guessing oracle that runs as fast as we can
hash, and an attacker with a common-password list will work through it. A slow
hash only matters if the number of guesses is also bounded; the two defences
multiply, and either alone is weak.

## Decision

`@nestjs/throttler`, with a loose app-wide ceiling of 100 requests/minute and a
tight **5 requests per 60 seconds per IP** on `/auth/login` and
`/auth/register`. `/problems` opts out with `@SkipThrottle()`.

The throttler guard is registered **before** the auth guard, so the sixth
attempt is rejected without ever reaching Argon2. Rejecting cheaply is the point:
a rate limiter that still pays the hashing cost is a denial-of-service amplifier.

## Alternatives considered

- **No rate limiting** — rejected. It makes the slow hash close to pointless
  against online guessing.
- **Per-account lockout** (N failures locks that user) — stronger against a
  distributed attacker, but introduces a denial-of-service vector: anyone can
  lock *you* out by guessing wrong at your address. Deferred; it needs an
  unlock path (email, backoff) to be safe.
- **CAPTCHA after N failures** — effective and standard, but it is a
  third-party dependency and a UX cost we are not ready to take on.
- **Global throttling only** — too coarse. A 100/min ceiling does nothing to
  stop 100 password guesses a minute.

## Consequences

- **Good:** online guessing becomes impractical — 5 attempts/minute means a
  1,000-password list takes over three hours from one address.
- **Good:** cheap to add and no user-visible cost for honest traffic.
- **Bad:** per-IP is a blunt instrument. Shared offices, university networks and
  mobile carriers put many users behind one address, so a legitimate user can be
  throttled by a stranger. Conversely, a botnet hands an attacker thousands of
  addresses and defeats it entirely.
- **Bad:** the default in-memory storage does not survive a restart and is not
  shared between instances. The moment we run more than one process, the real
  limit is 5 × the number of instances.
- **Revisit if:** we deploy more than one instance — move the throttler to Redis
  storage first — or if logs show legitimate users hitting 429s, which would
  point at shared-IP false positives.

## Related

This is the other half of [ADR-002](002-argon2id-for-passwords.md). Neither is
sufficient alone.
