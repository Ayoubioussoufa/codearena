# ADR-004: Refresh token in an httpOnly cookie, access token in memory

- **Status:** Accepted
- **Date:** 2026-09-11

## Context

Where the browser keeps a token decides which attack can steal it. Two classes
matter, and they pull in opposite directions.

**XSS** — an attacker gets *their* JavaScript running on our page: an unescaped
comment, a compromised npm package, an injected ad. That script can do anything
our own code can, including reading `localStorage` and shipping the contents
away.

> Anything JavaScript can read is stolen the moment we have any XSS.

**CSRF** — the browser attaches cookies to requests **automatically**, including
requests started by a malicious page. The attacker reads nothing; they don't
need to.

| | `localStorage` | httpOnly cookie | memory (a JS variable) |
|---|---|---|---|
| Readable by JS | yes — **XSS steals it** | no | yes, but dies on tab close |
| Sent automatically | no | yes — **CSRF risk** | no |
| Survives a page refresh | yes | yes | no |

## Decision

**Refresh token → `httpOnly; SameSite=Lax; Path=/auth` cookie**, with `Secure`
in production. It is long-lived, so XSS-proof storage matters most; `SameSite`
handles the CSRF that cookies open up, and `Path` keeps it off every request
that isn't an auth request.

**Access token → in memory only** (a JavaScript variable). Short-lived, never
persisted anywhere stealable, and never attached automatically — so it cannot be
CSRF'd. Losing it on page refresh is fine; that is what the refresh cookie is
for.

`Secure` is tied to `NODE_ENV` rather than hardcoded `true`, because a `Secure`
cookie over `http://localhost` is **silently dropped** by the browser — no error,
no warning, the cookie simply never appears.

## Alternatives considered

- **Both tokens in `localStorage`** — the common tutorial answer, rejected. One
  XSS and both are gone, including the long-lived one.
- **Both in cookies** — the access token would then ride along on every request
  automatically, making it CSRF-able for no gain. Keeping it in memory removes
  that surface entirely.
- **`SameSite=Strict`** — strictly safer, but a legitimate link into the app
  from an email arrives without the cookie and the user appears logged out.
  `Lax` allows exactly that case (top-level GET navigation), which is safe
  because GETs must never mutate state.
- **CSRF tokens as well** — a per-session value that must also arrive in a
  header. Correct belt-and-braces for `SameSite=None` or old browsers; not
  needed while we are same-site with `Lax`.

## Consequences

- **Good:** XSS cannot exfiltrate the refresh token, and CSRF cannot use the
  access token. Each half is defended structurally rather than by vigilance.
- **Good:** logout can genuinely clear the credential, because the server
  controls the cookie.
- **Bad:** CORS must name an exact origin and set `credentials: true` —
  wildcards stop working, which is a real (and confusing) development cost.
- **Bad:** the client needs a **refresh interceptor**: catch a 401, call
  `/auth/refresh` once, retry the original request. Without it users appear to
  be "randomly logged out" every 15 minutes.
- **Bad:** memory storage means a page refresh always costs one round trip to
  `/auth/refresh` before the app can call anything.
- **Revisit if:** we ever need cross-site requests (a separate API domain), at
  which point `SameSite=None; Secure` plus real CSRF tokens becomes necessary.
