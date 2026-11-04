/**
 * Checks for ../../docs/phase-1-auth-data-frontend.md.
 * Checked 3 Nov 2026: OWASP Password Storage Cheat Sheet, MDN Set-Cookie (SameSite default), Postgres isolation table; React 18 dropped the unmounted-setState warning.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const phase1Checks: GuideCheckSet = {
  name: "Phase 1 guide",
  source: {
    label: "OWASP Cheat Sheet Series",
    href: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html",
    note: "Part B is security advice, so read the primary source: the Password Storage cheat sheet, then the [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) one. For Part A, lessons 15–17 of the course build the same ideas in a lab.",
  },
  terms: [
    "Lost update",
    "Cursor pagination",
    "N+1 query",
    "Migration",
    "Salt",
    "JWT",
    "Refresh token rotation",
    "httpOnly cookie",
    "CSRF",
    "Server state",
  ],
  checks: [
    {
      id: "transactions",
      section: "A.1–A.2 · Transactions and isolation",
      questions: [
        {
          prompt: "Two requests add 20 and 10 to a balance of 100 by reading, adding, then writing. The result is 110. What's the simplest fix?",
          options: [
            "A longer timeout on each of the requests",
            "An atomic UPDATE that adds in one statement",
            "Reading the balance twice before writing it back",
            "Running both requests on the same app server",
          ],
          correct: 1,
          why: "Read-then-write lets both read 100 and overwrite each other: a lost update. `UPDATE acct SET bal = bal + 10` reads and writes in one statement under the row lock, so nothing is lost. When you must read, think, then write, use `SELECT … FOR UPDATE`.",
        },
        {
          prompt: "Your code runs a transaction at SERIALIZABLE. What must it also contain?",
          options: [
            "Locks on every table the transaction touches",
            "A second commit, confirming the first one",
            "Indexes on every column the query filters",
            "A retry loop for each serialization failure",
          ],
          correct: 3,
          why: "Serializable makes transactions behave as if one ran after another, and it enforces that by aborting one with SQLSTATE `40001`. Without a loop that retries the whole transaction, users see random errors. Deadlocks (`40P01`) deserve the same retry.",
        },
      ],
      explain: "Show a non-repeatable read with a two-transaction timeline at READ COMMITTED, then say what REPEATABLE READ changes in Postgres.",
    },
    {
      id: "queries",
      section: "A.3–A.7 · Indexes, plans, pagination, N+1, migrations",
      questions: [
        {
          prompt: "Why does `LIMIT 20 OFFSET 100000` get slow on deep pages?",
          options: [
            "The database reads and then discards every skipped row",
            "The index is rebuilt each time the offset grows",
            "Postgres caps the offset and then rescans the table",
            "The client has to download every skipped row first",
          ],
          correct: 0,
          why: "OFFSET doesn't jump: the database produces 100,000 rows and throws them away, so cost grows with depth. A cursor (`WHERE (created_at, id) < (…)`) seeks straight into the index: page 5001 costs the same as page 1, and inserts don't shift pages.",
        },
        {
          prompt: "A page shows 50 posts and runs one query per post to fetch its author. What's the fix?",
          options: [
            "Add an index on the posts' author column",
            "Cache each author in memory for an hour",
            "Fetch all the authors in one bulk query",
            "Run all 50 author queries in parallel instead",
          ],
          correct: 2,
          why: "That's N+1: one query for the list, plus one per row, each paying a round trip. Fetch related rows in bulk: `include: { author: true }`, or one `WHERE id IN (…)` query. Two queries total, whatever N is.",
        },
        {
          prompt: "Why must schema changes go through migrations, never hand edits?",
          options: [
            "So Prisma is able to generate faster plans",
            "So the schema file stays shorter over time",
            "So every database is rebuilt from one history",
            "So hand edits are rolled back every night",
          ],
          correct: 2,
          why: "A migration is a versioned script in git, applied in order and recorded so it runs once per database. Hand edits make your laptop, a teammate's and production three silently different databases.",
        },
      ],
      explain: "Explain cursor pagination: the query, why `id` is in the cursor as a tie-breaker, and which index it needs.",
    },
    {
      id: "passwords",
      section: "B.1 · Passwords",
      questions: [
        {
          prompt: "What does a per-user salt defeat?",
          options: [
            "Precomputed tables of the hashes of common passwords",
            "Attackers who guess one password many times online",
            "Leaks of the database backup to the internet",
            "Users reusing the same password on other sites",
          ],
          correct: 0,
          why: "With a unique random salt mixed in, identical passwords hash differently, so a rainbow table built in advance is useless: each user needs a fresh brute force. The salt isn't secret; it's stored next to the hash.",
        },
        {
          prompt: "Which password hashing algorithm does OWASP recommend first today?",
          options: [
            "SHA-256, salted, because it's fast to compute twice",
            "bcrypt, since its format stores your salt automatically",
            "MD5, salted, then repeated many thousand times over",
            "Argon2id, with its memory, iterations and parallelism set",
          ],
          correct: 3,
          why: "OWASP ranks Argon2id first (at least 19 MiB, 2 iterations, parallelism 1), then scrypt, and keeps bcrypt for legacy systems, with passwords capped at 72 bytes ([cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)). Fast hashes like SHA-256 let GPUs try billions per second.",
        },
      ],
      explain: "Explain why a password hash must be slow on purpose, and how a cost factor turns billions of guesses per second into dozens.",
    },
    {
      id: "tokens",
      section: "B.2–B.3 · Sessions, JWTs and refresh tokens",
      questions: [
        {
          prompt: "What does a JWT's signature guarantee?",
          options: [
            "Nobody without the key can read the payload",
            "No one can alter the payload without detection",
            "The token gets revoked when users log out",
            "The token works in just one single browser",
          ],
          correct: 1,
          why: "A JWT is base64url, not encryption: anyone can decode the payload, so never put secrets in it. The signature guarantees integrity: changing `\"role\":\"editor\"` to `\"admin\"` breaks it. And a JWT can't be un-issued: it's valid until `exp`.",
        },
        {
          prompt: "With refresh token rotation, the real user presents a refresh token that was already used. What does the server conclude?",
          options: [
            "The token was stolen, so the whole family is revoked",
            "The client retried, so it simply returns the same tokens",
            "The clock is skewed, so it extends the token's lifetime",
            "The database lagged, so it accepts the token this once",
          ],
          correct: 0,
          why: "Each refresh token is single-use. A used token coming back means two parties hold it: proof of theft. Revoking the whole family logs the attacker out too. Without rotation, a stolen refresh token works silently for weeks.",
        },
        {
          prompt: "Why store refresh tokens hashed in the database?",
          options: [
            "Hashing helps the refresh endpoint respond a bit faster",
            "The tokens are too long for plain text columns",
            "A database leak must not hand out working tokens",
            "Hashing lets the server read the user id inside",
          ],
          correct: 2,
          why: "They're long-lived credentials, so treat them like passwords. A fast SHA-256 is fine here: they're 256-bit random strings, not guessable words, so there's nothing to brute-force.",
        },
      ],
      explain: "Why use a short-lived access JWT plus a server-side refresh token, instead of one long-lived JWT? Name the feature a pure-JWT design can't offer.",
    },
    {
      id: "storage",
      section: "B.4–B.5 · Token storage, XSS and CSRF",
      questions: [
        {
          prompt: "Why keep the refresh token in an `httpOnly` cookie rather than `localStorage`?",
          options: [
            "Cookies are encrypted by the browser on the disk",
            "JavaScript can't read it, so XSS can't steal it",
            "localStorage is cleared every single time the tab closes",
            "httpOnly cookies are only sent to the same page",
          ],
          correct: 1,
          why: "Anything JavaScript can read is stolen the moment an attacker runs a script on your page. An `httpOnly` cookie is attached by the browser and invisible to `document.cookie`. That moves the risk to CSRF, which `SameSite` handles.",
        },
        {
          prompt: "A page on another site auto-submits a form to your app, and the user's cookie rides along. What stops it?",
          options: [
            "An httpOnly flag, so scripts can't read it",
            "HTTPS, since that way the request is encrypted",
            "A short expiry on the in-memory access token",
            "SameSite=Strict on the cookie, or a CSRF token",
          ],
          correct: 3,
          why: "That's CSRF: the attacker never reads anything; the browser attaches the cookie by itself. `SameSite=Strict` (or Lax for top-level GETs) stops the browser sending it cross-site; a CSRF token proves the request came from your own page. `httpOnly` stops XSS theft, not this.",
        },
      ],
      explain: "Defend the setup \"refresh token in an httpOnly, Secure, SameSite cookie; access token in memory only\", and describe the refresh interceptor it requires.",
    },
    {
      id: "validation",
      section: "Part C · Validation and the auth pipeline",
      questions: [
        {
          prompt: "What does \"parse, don't validate\" mean at the API edge?",
          options: [
            "Recheck the type of each field in every function",
            "Turn raw input into typed values once, at entry",
            "Let the database reject any malformed rows it receives",
            "Validate on the frontend and trust the API's inputs",
          ],
          correct: 1,
          why: "Parse untrusted input once, at the boundary, into a typed value; from then on the type system guarantees it everywhere. Zod both validates at runtime and derives the static type, so the two can't drift.",
        },
        {
          prompt: "Why parse `process.env` through a schema at boot?",
          options: [
            "The values load faster once they have been parsed",
            "It hides the secret values from the application's logs",
            "It lets the app reload variables while it runs",
            "A bad variable halts startup, with its name shown",
          ],
          correct: 3,
          why: "Fail fast: a typo'd `DATABASE_URL` crashes the boot with a named error, instead of a server that looks healthy and fails at 3 a.m. with a mystery.",
        },
      ],
      explain: "Trace `POST /articles` through `JwtAuthGuard`, `RolesGuard` and `ZodValidationPipe` to the handler: what each one checks and attaches.",
    },
    {
      id: "serverstate",
      section: "Part D · Server state with TanStack Query",
      questions: [
        {
          prompt: "Two components call `useQuery` with the same `queryKey`. How many requests go out?",
          options: [
            "One: they share a single cache entry",
            "Two: each component fetches its own copy",
            "One per second, until both have rendered",
            "None, until a mutation invalidates the key",
          ],
          correct: 0,
          why: "The query key is the cache address, compared structurally: same key, same entry, one in-flight request. Put every variable the fetch depends on into the key, like a dependency array.",
        },
        {
          prompt: "After a mutation adds a product, how do the product lists on screen update?",
          options: [
            "The mutation response simply replaces every cached list",
            "Each list re-polls the backend every few seconds",
            "invalidateQueries marks them stale, and then they refetch",
            "Only reloading the whole page clears cached data",
          ],
          correct: 2,
          why: "The cycle is read via keys → write via mutation → invalidate keys. `invalidateQueries({ queryKey: [\"products\"] })` prefix-matches every products query, marks them stale, and refetches the ones on screen.",
        },
      ],
      explain: "Walk through an optimistic \"like\": the snapshot, the guess, the rollback on error, and why `onSettled` invalidates anyway.",
    },
  ],
};
