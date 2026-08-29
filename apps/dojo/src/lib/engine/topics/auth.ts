/**
 * Topic: Auth & security (drills docs/phase-1-auth-data-frontend.md §B).
 */
import { choice } from "../helpers";
import type { Generator, Topic } from "../types";
import { authCodeGens } from "./auth-code";

const DOC = { slug: "phase-1-auth-data-frontend", label: "Phase 1 §B — Passwords, tokens & web attacks" };

const hashing: Generator = {
  id: "auth-hashing",
  title: "Password hashing done right",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "auth-hashing",
        prompt: "Why is bcrypt (or argon2) preferred over SHA-256 for password storage?",
        correct: "It's deliberately slow and tunable, making offline brute-force of a leaked table expensive",
        wrong: [
          "SHA-256 is reversible while bcrypt is not",
          "bcrypt produces shorter hashes that save database space",
          "SHA-256 can't accept a salt",
        ],
        explanation:
          "Both are **one-way** — you can turn a password into a hash but never the hash back into the password. The real difference is *speed*. SHA-256 was built to be fast, so an attacker who steals the hash table can try *billions* of guesses per second on GPUs. bcrypt has a tunable **cost factor** that makes each single guess take ~100 ms of deliberate work — turning billions per second into dozens — and you can raise it as hardware improves. Salting matters too (both can salt), but this deliberate slowness is the property that actually kills offline cracking.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "auth-hashing",
        prompt: "Two users pick the same password. With per-user salts, what do their stored hashes look like?",
        correct: "Completely different — the salt is mixed in before hashing, so equal passwords produce unequal hashes",
        wrong: [
          "Identical, revealing that the passwords match",
          "Identical hash but with a different salt appended for display",
          "The database refuses the duplicate password",
        ],
        explanation:
          "A **salt** is a random string, unique per user, mixed in *before* hashing — so even identical passwords come out as totally different hashes. That kills two attacks at once: **rainbow tables** (attackers' giant precomputed hash→password lookup tables become useless, because every user is effectively a different hash function), and 'equality leaks' (you can no longer spot users who share a password just by seeing matching rows). The salt sits in plain text right beside the hash — it isn't a secret, it's just a uniquifier.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "auth-hashing",
      prompt: "A login endpoint compares the stored hash with `hash === computeHash(input)` using string equality. What subtle attack does the guide warn this enables?",
      correct: "A timing attack — early-exit comparison leaks how many leading characters matched",
      wrong: [
        "SQL injection through the hash string",
        "Rainbow-table reversal of the hash",
        "Session fixation via the equality operator",
      ],
      explanation:
        "A normal string comparison bails out at the *first* mismatching character, so a longer matching prefix takes very slightly longer to reject — and a patient attacker can measure that tiny timing difference to recover a secret one character at a time. A **constant-time** comparison (`crypto.timingSafeEqual`) always does the same amount of work no matter where the mismatch is, leaking nothing. For bcrypt you use its own `compare`, which already handles this. The habit: any secret-vs-secret comparison must be constant-time.",
      docRef: DOC,
    });
  },
};

const jwtClaims: Generator = {
  id: "auth-jwt",
  title: "What a JWT signature guarantees",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "auth-jwt",
      prompt: variant
        ? "A JWT's payload contains `{ sub: 42, role: \"user\" }`. What stops the client from editing role to \"admin\"?"
        : "Which statement about JWTs is TRUE?",
      correct: variant
        ? "Nothing stops the edit — but the signature no longer verifies, so the server rejects the tampered token"
        : "The payload is base64url-encoded, not encrypted — anyone holding the token can read it",
      wrong: variant
        ? [
            "The payload is encrypted, so the client can't read or change it",
            "The browser blocks modification of JWTs",
            "Editing is possible and the server can't detect it",
          ]
        : [
            "The signature encrypts the payload so only the server can read it",
            "JWTs are stored server-side and looked up by ID on each request",
            "A JWT can be invalidated instantly by deleting it from the database",
          ],
      explanation:
        "A JWT is **integrity-protected, not secret**: the header and payload are only base64url-*encoded* (a reversible text format, not encryption — paste any token into a decoder and read it), and the signature is a cryptographic **seal** over those bytes made with a key only the server holds. Change one character and the seal no longer matches, so the server rejects it — that's the whole guarantee. Two consequences: never put secrets in the payload (anyone can read it), and a signed token stays valid until it *expires* — there's no session row on the server to delete, which is exactly why you pair short-lived access tokens with revocable refresh tokens.",
      docRef: DOC,
    });
  },
};

const refreshRotation: Generator = {
  id: "auth-rotation",
  title: "Refresh-token rotation",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "auth-rotation",
      prompt: variant
        ? "With rotation, a stolen refresh token is used by the thief first. When the legitimate user's client later presents the (now old) token, what should the server do?"
        : "Why rotate refresh tokens (issue a new one on every refresh) at all?",
      correct: variant
        ? "Detect reuse of a consumed token and revoke the whole token family, forcing re-login on both sides"
        : "So each refresh token is single-use — a stolen one either gets caught at reuse or dies at first legitimate refresh",
      wrong: variant
        ? [
            "Accept it — it was valid when issued",
            "Just issue another access token and log a warning",
            "Only block the request if the IP address changed",
          ]
        : [
            "Rotation makes tokens smaller over time",
            "It removes the need for token expiry entirely",
            "It lets access tokens live for months safely",
          ],
      explanation:
        "Rotation turns every refresh token into a one-shot: using it consumes it and issues a successor. If a thief uses a stolen token, the *legitimate* client eventually presents the consumed one — and that reuse is the theft alarm. The correct response is nuclear: revoke the entire family (all descendants), because you can't tell which branch is the attacker's. Answering 'accept it' silently hands the attacker a permanent session; per-IP checks are trivially defeated.",
      docRef: DOC,
    });
  },
};

const xssCsrf: Generator = {
  id: "auth-xss-csrf",
  title: "Token storage: XSS vs CSRF",
  generate: (rng) => {
    const useLocalStorage = rng.chance(0.5);
    return choice(rng, {
      genId: "auth-xss-csrf",
      prompt: useLocalStorage
        ? "Tokens are kept in localStorage and sent via an Authorization header. Which attack class can steal them directly?"
        : "Tokens are kept in an httpOnly cookie. Which attack class remains a concern, and why?",
      correct: useLocalStorage
        ? "XSS — any injected script can read localStorage and exfiltrate the token"
        : "CSRF — the browser attaches the cookie automatically, so another site can trigger authenticated requests",
      wrong: useLocalStorage
        ? [
            "CSRF — other sites can read localStorage cross-origin",
            "SQL injection — localStorage is synced to the database",
            "None — localStorage is sandboxed from scripts",
          ]
        : [
            "XSS — scripts can read httpOnly cookies via document.cookie",
            "None — httpOnly cookies close every attack vector",
            "Clickjacking — cookies leak through iframes automatically",
          ],
      explanation:
        "The two storage options just trade one attack surface for another. **localStorage** can't be read by other sites (no CSRF) but is wide open to any script running on *your own* page — one **XSS** hole (attacker-injected JavaScript) and the token walks out. An **httpOnly cookie** can't be read by JavaScript at all (so XSS can't *steal* it), but the browser auto-attaches it to every request to your domain — so a hostile page can silently *trigger* authenticated requests, which is **CSRF**; you block that with the cookie's `SameSite` setting plus anti-CSRF tokens. Knowing which defence pairs with which storage is the real skill.",
      docRef: DOC,
    });
  },
};

const tokenExpiry: Generator = {
  id: "auth-expiry",
  title: "Access-token lifetime math",
  generate: (rng) => {
    const ttl = rng.pick([10, 15, 30] as const);
    const elapsed = rng.int(ttl + 5, ttl * 3);
    const refreshDays = rng.pick([7, 14, 30] as const);
    return choice(rng, {
      genId: "auth-expiry",
      prompt: `Access tokens live ${ttl} min; refresh tokens ${refreshDays} days. A request arrives ${elapsed} min after sign-in with the original access token. What happens?`,
      correct: `401 from the API — the client should call the refresh endpoint, get a new access token, and retry`,
      wrong: [
        "The request succeeds — the refresh token keeps the access token alive automatically",
        "The user must sign in again with their password",
        `The access token auto-extends because the user was active within ${refreshDays} days`,
      ],
      explanation: `The access token expired ${elapsed - ttl} minutes ago, and signed tokens don't extend — the API statelessly rejects it (401). But the session isn't over: the refresh token (${refreshDays}-day lifetime, stored more safely, revocable) buys a fresh access token without the password. This split is the whole design: short access tokens bound the damage of theft, long refresh tokens preserve UX, and the refresh endpoint is the single choke point where rotation and revocation can happen.`,
      docRef: DOC,
    });
  },
};

const validation: Generator = {
  id: "auth-validation",
  title: "Parse, don't validate",
  generate: (rng) => {
    const n = rng.int(0, 1);
    return choice(rng, {
      genId: "auth-validation",
      prompt: n === 0
        ? "What does the guide mean by \"parse, don't validate\" at API boundaries?"
        : "Where should a Zod schema for a request body run, and what should the handler receive?",
      correct: n === 0
        ? "Transform untrusted input into a typed value once at the edge — after that, the type system proves it's valid everywhere"
        : "At the edge (pipe/middleware) — the handler receives the schema's inferred output type, never the raw body",
      wrong: n === 0
        ? [
            "Check inputs with if-statements in every function that touches them",
            "Trust the TypeScript types on the request object at runtime",
            "Sanitize strings by removing dangerous characters everywhere",
          ]
        : [
            "Inside every service method, re-validating defensively each time",
            "Only on the frontend — the API can trust its own client",
            "In the database via CHECK constraints exclusively",
          ],
      explanation:
        "*Validating* just returns true/false and leaves you holding the same untyped data, so every layer keeps re-checking defensively. *Parsing* instead returns a brand-new, *typed* value (`schema.parse(body)` gives you a typed object) or throws — so past that one boundary, an `Email` type genuinely *means* a valid email and nothing downstream has to wonder. And it must run on the **server**: TypeScript types vanish at runtime (they're compile-time only), and the frontend is an untrusted client like any other. That's why your AuthForm validates in the browser for nice UX, but the API re-parses everything regardless.",
      docRef: DOC,
    });
  },
};

export const authTopic: Topic = {
  id: "auth-security",
  title: "Auth & security",
  icon: "🔐",
  blurb: "bcrypt, JWT guarantees, refresh rotation, XSS-vs-CSRF trade-offs and edge validation.",
  docSlug: "phase-1-auth-data-frontend",
  docTitle: "Phase 1 — Auth, Data & Frontend",
  generators: [
    hashing,
    jwtClaims,
    refreshRotation,
    xssCsrf,
    tokenExpiry,
    validation,
    ...authCodeGens,
  ],
};
