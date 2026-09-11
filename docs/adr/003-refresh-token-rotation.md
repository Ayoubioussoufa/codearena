# ADR-003: Access + refresh tokens, with rotation and reuse detection

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

A JWT is verified by signature alone, with no server-side lookup. That is what
makes it fast and horizontally scalable — and it is also why it **cannot be
revoked**. Once signed, it is valid until `exp`, and nothing we do can stop it.

That leaves one dial and two bad ends:

- **Long-lived token** — a theft is exploitable for as long as it lives, and we
  have no way to end the session. "Log out everywhere" and "ban this account
  now" become impossible features.
- **Short-lived token** — users re-enter their password every few minutes.

We need short exposure *and* revocability.

## Decision

Two tokens with different jobs:

| | Access | Refresh |
|---|---|---|
| Format | JWT, signed | opaque 32 random bytes |
| Lifetime | 15 minutes | 7 days |
| Sent to | every endpoint | only `/auth/refresh` |
| Verified by | signature, no I/O | a database lookup |
| Revocable | no | **yes** |

The refresh token is stored as a **SHA-256 hash**, never in plaintext.

**Rotation:** every use of a refresh token revokes it and issues a replacement
in the same `family`. Each token is single-use.

**Reuse detection:** presenting an already-revoked token revokes the entire
family. An honest client always holds the newest token and has no reason to send
an old one, so a replay is evidence that the chain leaked. We cannot tell the
thief from the victim, so we end the session for both — only the real user can
start a new one, because only they have the password.

Revocation sets `revokedAt`; rows are never deleted. The row is the evidence: if
a spent token were removed, a replay would be indistinguishable from an unknown
token and the theft would go unnoticed.

## Alternatives considered

- **A single long-lived JWT** — rejected. No revocation, so a leak is
  unbounded and "log out everywhere" cannot be built.
- **Server-side sessions for everything** — genuinely revocable, but puts a
  database (or Redis) lookup on *every* request, which is the cost the
  stateless access token exists to avoid. We take the lookup once per 15
  minutes instead of once per request.
- **A JWT as the refresh token** — rejected. It would have to be looked up
  anyway to be revocable, so the signature buys nothing, and it tempts future
  code into trusting the payload without the lookup.
- **Refresh without rotation** — rejected. A stolen token then works silently
  for its full 7 days, and nothing ever reveals the theft. Rotation is what
  makes the collision happen; reuse detection is what reads it.
- **Argon2 for the refresh token hash** — rejected. Argon2's slowness exists to
  make *guessing* expensive, and a 32-byte random token has no dictionary to
  guess against. It would be cost on every refresh with no benefit.

## Consequences

- **Good:** stolen access tokens expire in 15 minutes; stolen refresh tokens are
  revocable and self-reporting.
- **Good:** ~100 API requests cost zero database lookups; one refresh costs one.
- **Good:** "log out everywhere" is `revokeFamily`, and account banning is a
  single query away.
- **Bad:** a client that loses a response mid-rotation holds a dead token and is
  logged out. Rotation trades a small amount of resilience for theft detection.
- **Bad:** the `RefreshToken` table grows and needs periodic pruning of expired
  rows.
- **Bad:** two devices sharing one session will trigger reuse detection. Each
  login starts its own family, so this only bites if a token is copied between
  devices.
- **Revisit if:** false-positive family revocations appear in logs, which would
  point at a client retry bug rather than a real theft.
