# ADR-002: Hash passwords with Argon2id

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

CodeArena stores user credentials. A database leak must not hand an attacker
working passwords — and because people reuse passwords, it must not hand them
working credentials for the victims' other accounts either.

The threat is **offline guessing**: once an attacker has the table, they are no
longer rate-limited by us. They guess as fast as their hardware allows. Modern
GPUs compute billions of general-purpose hashes per second, and rented GPU time
is cheap.

## Decision

We hash with **Argon2id** at the `argon2` library's defaults (64 MiB memory,
3 iterations, parallelism 1), behind a `PasswordHasher` port.

Argon2id is **memory-hard**: it deliberately requires a large working set, so an
attacker cannot trade memory for parallelism. A GPU has thousands of cores but
comparatively little memory per core, which is exactly the resource Argon2
exhausts. The salt is generated per-hash and embedded in the output string, so
there is no separate salt column to manage or forget.

## Alternatives considered

- **SHA-256 (or any fast general-purpose hash)** — rejected. It is designed to
  be *fast*, which is the opposite of what password storage needs. Speed is the
  attacker's budget.
- **bcrypt** — a reasonable choice and still widely deployed, but its work
  factor scales **time only**. Memory stays at 4 KiB regardless of cost factor,
  so GPU and ASIC attacks parallelise cheaply. Argon2 was designed specifically
  to close that gap, and won the 2015 Password Hashing Competition.
- **scrypt** — memory-hard and sound, but Argon2id is the current
  recommendation (OWASP, RFC 9106) and has better tuning guidance.
- **Argon2i / Argon2d** — Argon2id is the hybrid, resistant to both side-channel
  attacks (i) and GPU cracking (d). No reason to pick a specialised variant.

## Consequences

- **Good:** an attacker with the database gets ~45ms per guess per core instead
  of nanoseconds, and cannot cheaply parallelise on GPUs.
- **Good:** the port means the algorithm can be replaced without touching
  `AuthService`, and unit tests run against a fake with no argon2 at all.
- **Bad:** each login costs ~45ms of real CPU. At scale this is a capacity line
  item, not a rounding error.
- **Bad:** it is a native module, so CI and deployment need a matching build.
- **Revisit if:** login latency becomes a bottleneck (tune memory/iterations
  before switching algorithms), or Argon2's parameters fall behind OWASP's
  current guidance.

## Related

The cost per guess only matters alongside a cap on the number of guesses — see
[ADR-005](005-per-ip-rate-limiting.md).
