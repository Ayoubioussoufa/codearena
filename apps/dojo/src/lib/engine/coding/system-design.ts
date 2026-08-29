/**
 * Coding track: System Design primitives — the pieces of a design question that
 * are actually CODE, not boxes on a whiteboard. Rate limiters (token bucket,
 * leaky bucket, sliding window), an LRU cache, a consistent-hash ring, a
 * circuit breaker, a bloom filter, top-K, base-62 codes, backoff.
 *
 * Every task RUNS for real against test cases (plain JS), so a pass means the
 * algorithm behaves — the same primitives the System Design guide describes in
 * the abstract, here implemented and verified. Reference the guide for WHERE
 * each one lives in a system; this track is the HOW.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingTrack } from "../coding";

const DOC = { slug: "system-design-fundamentals", label: "System Design — fundamentals" };

/* ── Level 1 — the small deterministic building blocks ── */

const base62: Generator = {
  id: "sd-base62",
  title: "Base-62 short codes",
  generate: () =>
    codeTask({
      genId: "sd-base62",
      prompt:
        "Context: a URL shortener mints codes by keeping a COUNTER and encoding it in base-62 (digits `0-9`, then `a-z`, then `A-Z` = 62 symbols) — no collisions, ever, unlike hashing.\n\nTask: write `base62Encode(n)` for a non-negative integer `n`. Return the base-62 string (most-significant symbol first). `base62Encode(0)` is `\"0\"`.",
      language: "javascript",
      starter: "function base62Encode(n) {\n  // repeatedly take n % 62, then n = floor(n / 62)\n}",
      solution:
        'function base62Encode(n) {\n  const A = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";\n  if (n === 0) return "0";\n  let s = "";\n  while (n > 0) {\n    s = A[n % 62] + s;\n    n = Math.floor(n / 62);\n  }\n  return s;\n}',
      fn: {
        name: "base62Encode",
        tests: [
          { args: [0], expected: "0" },
          { args: [61], expected: "Z" },
          { args: [62], expected: "10" },
          { args: [12345], expected: "3d7" },
        ],
      },
      hint: "Build the string right-to-left: the last symbol is `n % 62`, then integer-divide `n` by 62 and repeat until it's 0. Prepend each new symbol so the most-significant ends up first.",
      explanation:
        "Base-62 turns an ever-increasing counter into a compact, collision-free code: 62⁷ ≈ 3.5 trillion codes fit in 7 characters. The counter is the source of no-collisions — hashing a URL and keeping 7 chars risks two URLs landing on the same code. The scaling catch (covered in the guide): a single global counter is a coordination bottleneck, so you hand each app server a RANGE of the counter to encode independently.",
      docRef: DOC,
    }),
};

const backoff: Generator = {
  id: "sd-backoff",
  title: "Exponential backoff",
  generate: () =>
    codeTask({
      genId: "sd-backoff",
      prompt:
        "Context: when a call to a flaky dependency fails, you retry — but retrying immediately, in lockstep with every other client, is how you turn a blip into an outage (a thundering herd). Exponential backoff spaces retries out and caps the wait so it never grows unbounded.\n\nTask: write `backoff(attempt, baseMs, capMs)` returning the delay before retry number `attempt` (starting at 0): begin at `baseMs` and DOUBLE it with each attempt, but never let it exceed `capMs`.",
      language: "javascript",
      starter: "function backoff(attempt, baseMs, capMs) {\n  // min(capMs, baseMs * 2 ** attempt)\n}",
      solution:
        "function backoff(attempt, baseMs, capMs) {\n  return Math.min(capMs, baseMs * 2 ** attempt);\n}",
      fn: {
        name: "backoff",
        tests: [
          { args: [0, 100, 10000], expected: 100 },
          { args: [1, 100, 10000], expected: 200 },
          { args: [3, 100, 10000], expected: 800 },
          { args: [10, 100, 10000], expected: 10000, show: "backoff(10,100,10000) → 10000 (capped)" },
        ],
      },
      hint: "`2 ** attempt` doubles the delay each try; `Math.min` with `capMs` stops it exploding after ~10 attempts.",
      explanation:
        "Doubling spreads retries so a recovering service isn't re-flooded, and the cap stops the delay growing to minutes. The piece this leaves out (deliberately, so the test stays deterministic) is JITTER: in production you'd randomise within the window — e.g. `random(0, backoff)` — so a fleet of clients doesn't retry in synchronised waves. Backoff + jitter + a dead-letter queue after N tries is the full retry story from the notification-system design.",
      docRef: DOC,
    }),
};

/* ── Level 2 — refill math & a first rate limiter ── */

const refill: Generator = {
  id: "sd-refill",
  title: "Token-bucket refill",
  generate: () =>
    codeTask({
      genId: "sd-refill",
      prompt:
        "Context: a token bucket refills continuously — every second it gains `ratePerSec` tokens, but never past `capacity`. This is the one line of math a token-bucket limiter is built on.\n\nTask: write `refill(tokens, capacity, ratePerSec, elapsedSec)` returning the new token count after `elapsedSec` seconds, clamped to `capacity`.",
      language: "javascript",
      starter: "function refill(tokens, capacity, ratePerSec, elapsedSec) {\n  // add rate*elapsed, but cap at capacity\n}",
      solution:
        "function refill(tokens, capacity, ratePerSec, elapsedSec) {\n  return Math.min(capacity, tokens + ratePerSec * elapsedSec);\n}",
      fn: {
        name: "refill",
        tests: [
          { args: [0, 10, 1, 5], expected: 5 },
          { args: [8, 10, 1, 5], expected: 10, show: "refill(8,10,1,5) → 10 (clamped)" },
          { args: [10, 10, 1, 0], expected: 10 },
          { args: [2.5, 10, 2, 3], expected: 8.5 },
        ],
      },
      hint: "New tokens = elapsed × rate. Add them to the current count, then `Math.min(capacity, …)` so the bucket never overflows.",
      explanation:
        "Refilling by ELAPSED TIME (rather than on a timer/cron) is the trick that makes a token bucket cheap: you store only `{tokens, lastRefillAt}` and lazily compute the refill on each request. That tiny state is exactly what you centralise in Redis so the limit holds across many servers — and the refill+deduct must run atomically (a Lua script) or two servers race on the same counter.",
      docRef: DOC,
    }),
};

const slidingWindowAllow: Generator = {
  id: "sd-sliding-log",
  title: "Sliding-window log limiter",
  generate: () =>
    codeTask({
      genId: "sd-sliding-log",
      prompt:
        "Context: the sliding-window LOG limiter keeps the timestamps of recent requests and, on each new one, counts how many fall inside the trailing window. Unlike a fixed window it has no boundary-burst flaw — the window moves with you.\n\nTask: write `allow(timestamps, now, windowMs, limit)` → `true` if the number of `timestamps` strictly newer than `now - windowMs` is `< limit`, else `false`.",
      language: "javascript",
      starter: "function allow(timestamps, now, windowMs, limit) {\n  // count timestamps within (now - windowMs, now], compare to limit\n}",
      solution:
        "function allow(timestamps, now, windowMs, limit) {\n  const cutoff = now - windowMs;\n  const count = timestamps.filter((t) => t > cutoff).length;\n  return count < limit;\n}",
      fn: {
        name: "allow",
        tests: [
          { args: [[1000, 2000, 3000], 3500, 2000, 3], expected: true, show: "2 in window, limit 3 → true" },
          { args: [[1000, 2000, 3000], 3500, 2000, 2], expected: false, show: "2 in window, limit 2 → false" },
          { args: [[], 3500, 2000, 1], expected: true },
          { args: [[3400, 3450], 3500, 2000, 2], expected: false },
        ],
      },
      hint: "Everything older than `now - windowMs` has slid out of the window — filter it away, then the request is allowed only if the survivors number fewer than `limit`.",
      explanation:
        "Precision costs memory: the log stores one timestamp per request, so a hot key can hold a lot. That's why production often uses the sliding-window COUNTER approximation (a later task) instead — it keeps just two integers and weights them. But the log is the mental model that makes 'no boundary burst' obvious: there's no fixed edge for requests to pile up against.",
      docRef: DOC,
    }),
};

/* ── Level 3 — the classic pieces wired together ── */

const tokenBucket: Generator = {
  id: "sd-token-bucket",
  title: "Token-bucket limiter (full)",
  generate: () =>
    codeTask({
      genId: "sd-token-bucket",
      prompt:
        "Context: now the whole thing. The bucket starts FULL. Each request arrives at time `t` (seconds) needing `cost` tokens; you refill by the time since the last request, then allow it only if enough tokens remain.\n\nTask: write `tokenBucket(capacity, refillPerSec, requests)` where `requests` is an array of `[t, cost]` in non-decreasing `t`. Return an array of booleans — was each request allowed? (Start with `tokens = capacity` and `lastT = 0`.)",
      language: "javascript",
      starter:
        "function tokenBucket(capacity, refillPerSec, requests) {\n  let tokens = capacity;\n  let lastT = 0;\n  // for each [t, cost]: refill by (t - lastT), then allow if tokens >= cost\n}",
      solution:
        "function tokenBucket(capacity, refillPerSec, requests) {\n  let tokens = capacity;\n  let lastT = 0;\n  const out = [];\n  for (const [t, cost] of requests) {\n    tokens = Math.min(capacity, tokens + (t - lastT) * refillPerSec);\n    lastT = t;\n    if (tokens >= cost) {\n      tokens -= cost;\n      out.push(true);\n    } else {\n      out.push(false);\n    }\n  }\n  return out;\n}",
      fn: {
        name: "tokenBucket",
        tests: [
          {
            args: [2, 1, [[0, 1], [0, 1], [0, 1], [2, 1]]],
            expected: [true, true, false, true],
            show: "cap 2: burst of 2 allowed, 3rd denied, refilled by t=2",
          },
          { args: [3, 1, [[0, 3]]], expected: [true], show: "one request can spend the whole bucket" },
          { args: [1, 1, [[0, 1], [0, 1]]], expected: [true, false] },
        ],
      },
      hint: "Track `tokens` and `lastT` across the loop. Each request: `tokens = min(capacity, tokens + (t - lastT) * refillPerSec)`, set `lastT = t`, then if `tokens >= cost` deduct and allow, else deny.",
      explanation:
        "Token bucket is the interview default because it captures BOTH knobs cleanly: sustained rate (the refill) and burst tolerance (the capacity). A full bucket lets a quiet client spend a burst immediately, then throttles to the refill rate — which is usually what you actually want from an API limit. Two integers of state per key, centralised in Redis with an atomic refill+deduct.",
      docRef: DOC,
    }),
};

const lruCache: Generator = {
  id: "sd-lru",
  title: "LRU cache",
  generate: () =>
    codeTask({
      genId: "sd-lru",
      prompt:
        "Context: a cache with a fixed size must EVICT something when full; least-recently-used is the standard policy. A `get` or `put` counts as a use.\n\nTask: write `lru(capacity, ops)` where `ops` is a list of `[\"put\", key, val]` and `[\"get\", key]`. Return an array with one entry per `get`: the stored value, or `-1` if absent. On a `put` that exceeds `capacity`, evict the least-recently-used key.",
      language: "javascript",
      starter:
        'function lru(capacity, ops) {\n  const map = new Map();\n  const out = [];\n  // Map keeps insertion order — delete+set a key to mark it most-recently-used;\n  // evict map.keys().next().value (the oldest) when size exceeds capacity\n}',
      solution:
        'function lru(capacity, ops) {\n  const map = new Map();\n  const out = [];\n  for (const op of ops) {\n    if (op[0] === "get") {\n      const key = op[1];\n      if (map.has(key)) {\n        const val = map.get(key);\n        map.delete(key);\n        map.set(key, val);\n        out.push(val);\n      } else {\n        out.push(-1);\n      }\n    } else {\n      const [, key, val] = op;\n      if (map.has(key)) map.delete(key);\n      map.set(key, val);\n      if (map.size > capacity) {\n        map.delete(map.keys().next().value);\n      }\n    }\n  }\n  return out;\n}',
      fn: {
        name: "lru",
        tests: [
          {
            args: [2, [["put", 1, 1], ["put", 2, 2], ["get", 1], ["put", 3, 3], ["get", 2], ["get", 3]]],
            expected: [1, -1, 3],
            show: "get(1) refreshes 1 → 2 is evicted by put(3)",
          },
          {
            args: [1, [["put", 1, 10], ["put", 2, 20], ["get", 1], ["get", 2]]],
            expected: [-1, 20],
            show: "capacity 1: put(2) evicts 1",
          },
        ],
      },
      hint: "A JS `Map` iterates in INSERTION order, so the first key is the oldest. On any access, `delete` then `set` the key to move it to the newest position. After a `put`, if `size > capacity`, delete `map.keys().next().value`.",
      explanation:
        "Using `Map`'s insertion order gives you O(1) get/put and O(1) eviction without hand-rolling a doubly-linked-list + hash map (the textbook structure, which is what `Map` is under the hood). LRU is the eviction policy behind most caches (Redis offers it as `allkeys-lru`); the design-level point is that a cache is a bounded window over your hot data, and the policy decides what 'hot' means.",
      docRef: DOC,
    }),
};

const consistentHash: Generator = {
  id: "sd-consistent-hash",
  title: "Consistent-hash ring lookup",
  generate: () =>
    codeTask({
      genId: "sd-consistent-hash",
      prompt:
        "Context: consistent hashing places nodes at points on a ring (0..M); a key hashes to a point and is owned by the FIRST node clockwise from it, wrapping past the top back to the smallest. Adding/removing a node only remaps the keys between it and its neighbour — not everything.\n\nTask: write `ringNode(ring, keyPos)` where `ring` is an array of `[position, node]` sorted ascending by position. Return the `node` owning `keyPos`: the first entry with `position >= keyPos`, wrapping to `ring[0]` if none.",
      language: "javascript",
      starter:
        "function ringNode(ring, keyPos) {\n  // first entry with position >= keyPos, else wrap to ring[0]\n}",
      solution:
        "function ringNode(ring, keyPos) {\n  for (const [pos, node] of ring) {\n    if (pos >= keyPos) return node;\n  }\n  return ring[0][1];\n}",
      fn: {
        name: "ringNode",
        tests: [
          { args: [[[10, "A"], [20, "B"], [30, "C"]], 15], expected: "B" },
          { args: [[[10, "A"], [20, "B"], [30, "C"]], 25], expected: "C" },
          { args: [[[10, "A"], [20, "B"], [30, "C"]], 35], expected: "A", show: "past the top → wraps to A" },
          { args: [[[10, "A"], [20, "B"], [30, "C"]], 10], expected: "A", show: "exactly on a node → that node" },
        ],
      },
      hint: "Walk the sorted ring and return the first node whose position is `>= keyPos`. If you fall off the end (keyPos is above every node), the ring wraps — return the very first node.",
      explanation:
        "The clockwise-with-wrap rule is the whole point: because a key only ever moves to its immediate neighbour when a node joins or leaves, consistent hashing remaps ~1/N of keys instead of nearly all of them (which plain `hash % N` does when N changes). Real rings add VIRTUAL NODES — each physical node placed at many ring points — so load spreads evenly and a departing node's keys scatter across all survivors rather than dumping onto one.",
      docRef: DOC,
    }),
};

/* ── Level 4 — correctness under failure ── */

const circuitBreaker: Generator = {
  id: "sd-circuit-breaker",
  title: "Circuit-breaker state machine",
  generate: () =>
    codeTask({
      genId: "sd-circuit-breaker",
      prompt:
        'Context: a circuit breaker stops hammering a failing dependency. CLOSED = calls flow; consecutive failures reaching `threshold` trip it to OPEN (calls fail fast). A `\"timeout\"` event moves OPEN → HALF (one trial allowed). In HALF, a success closes it; a failure re-opens it.\n\nTask: write `breaker(state, failures, event, threshold)` returning `[nextState, nextFailures]`. States: `\"closed\" | \"open\" | \"half\"`. Events: `\"success" | "failure" | "timeout\"`.',
      language: "javascript",
      starter:
        'function breaker(state, failures, event, threshold) {\n  // closed: success → [closed,0]; failure → +1, trip to [open,0] at threshold\n  // open: timeout → [half,0]; else stay [open, failures]\n  // half: success → [closed,0]; failure → [open,0]\n}',
      solution:
        'function breaker(state, failures, event, threshold) {\n  if (state === "closed") {\n    if (event === "failure") {\n      const f = failures + 1;\n      return f >= threshold ? ["open", 0] : ["closed", f];\n    }\n    return ["closed", 0];\n  }\n  if (state === "open") {\n    return event === "timeout" ? ["half", 0] : ["open", failures];\n  }\n  // half\n  if (event === "success") return ["closed", 0];\n  if (event === "failure") return ["open", 0];\n  return ["half", failures];\n}',
      fn: {
        name: "breaker",
        tests: [
          { args: ["closed", 0, "failure", 3], expected: ["closed", 1] },
          { args: ["closed", 2, "failure", 3], expected: ["open", 0], show: "3rd straight failure trips it" },
          { args: ["closed", 2, "success", 3], expected: ["closed", 0], show: "success resets the counter" },
          { args: ["open", 0, "timeout", 3], expected: ["half", 0] },
          { args: ["open", 0, "failure", 3], expected: ["open", 0], show: "open ignores calls until timeout" },
          { args: ["half", 0, "success", 3], expected: ["closed", 0] },
          { args: ["half", 0, "failure", 3], expected: ["open", 0], show: "trial fails → straight back to open" },
        ],
      },
      hint: "Handle one state at a time. CLOSED counts consecutive failures and trips at the threshold (and any success resets to 0). OPEN only reacts to `timeout` (→ half). HALF is a single trial: success closes, failure re-opens.",
      explanation:
        "The breaker converts slow cascading failure into fast, contained failure: once OPEN, calls fail instantly instead of piling up threads waiting on a dead dependency. HALF-open is the careful probe — let exactly one request through to test recovery rather than flooding a service that just came back. It pairs with backoff and a fallback (cached/default response) so an outage downstream degrades gracefully instead of taking you down too.",
      docRef: DOC,
    }),
};

const idempotent: Generator = {
  id: "sd-idempotent",
  title: "Idempotent event de-dupe",
  generate: () =>
    codeTask({
      genId: "sd-idempotent",
      prompt:
        "Context: queues deliver AT LEAST once, so a worker can see the same event twice. Idempotency means processing a duplicate is a harmless no-op — you dedupe on a unique id.\n\nTask: write `applyOnce(events)` where `events` is a list of `[id, amount]`. Sum the amounts, but count each `id` only ONCE (a repeat delivery of the same id is ignored). Return the total.",
      language: "javascript",
      starter:
        "function applyOnce(events) {\n  const seen = new Set();\n  // add amount only the first time you see an id\n}",
      solution:
        "function applyOnce(events) {\n  const seen = new Set();\n  let total = 0;\n  for (const [id, amount] of events) {\n    if (seen.has(id)) continue;\n    seen.add(id);\n    total += amount;\n  }\n  return total;\n}",
      fn: {
        name: "applyOnce",
        tests: [
          { args: [[[1, 10], [2, 5], [1, 10], [3, 7]]], expected: 22, show: "id 1 delivered twice, counted once" },
          { args: [[[1, 10], [1, 10], [1, 10]]], expected: 10 },
          { args: [[]], expected: 0 },
        ],
      },
      hint: "Keep a `Set` of ids you've already applied. For each event, `continue` if its id is in the set; otherwise record it and add the amount.",
      explanation:
        "Deduping at the consumer is how you get exactly-once EFFECTS on top of at-least-once delivery — the pattern behind idempotent queue workers and the API idempotency-key trick that stops a retried `POST /charge` from double-charging. The id is the whole game: a submission id, a payment key, an event id. Store it durably (a table/Redis set), and the second delivery becomes a no-op.",
      docRef: DOC,
    }),
};

/* ── Level 5 — the sharp ones ── */

const topK: Generator = {
  id: "sd-top-k",
  title: "Top-K (leaderboard slice)",
  generate: () =>
    codeTask({
      genId: "sd-top-k",
      prompt:
        "Context: a leaderboard's core query is 'the top K scores'. Return them highest-first.\n\nTask: write `topK(scores, k)` returning the `k` largest numbers in `scores`, in descending order. If `k` exceeds the length, return them all (still sorted descending).",
      language: "javascript",
      starter: "function topK(scores, k) {\n  // the k largest, descending\n}",
      solution:
        "function topK(scores, k) {\n  return [...scores].sort((a, b) => b - a).slice(0, k);\n}",
      fn: {
        name: "topK",
        tests: [
          { args: [[3, 1, 4, 1, 5, 9, 2, 6], 3], expected: [9, 6, 5] },
          { args: [[10, 20], 5], expected: [20, 10], show: "k > length → all, sorted" },
          { args: [[7], 1], expected: [7] },
        ],
      },
      hint: "Copy the array (don't mutate the input), sort descending with `(a, b) => b - a`, then `slice(0, k)`.",
      explanation:
        "Sorting is fine for a one-off, but the reason top-K is a named problem is SCALE: sorting a live stream of millions on every request is O(n log n) you can't afford — so you keep a bounded min-heap of size K (O(n log k), O(k) memory), or, for a leaderboard, let a Redis SORTED SET maintain the order incrementally so `ZREVRANGE 0 K-1` is O(log n + k). The database stays the source of truth; the sorted set is the serving layer.",
      docRef: DOC,
    }),
};

const bloom: Generator = {
  id: "sd-bloom",
  title: "Bloom filter",
  generate: () =>
    codeTask({
      genId: "sd-bloom",
      prompt:
        "Context: a bloom filter answers 'have I seen this?' in tiny memory — 'definitely no' or 'probably yes' (false positives possible, false negatives never). It sets bits from two hashes on add, and checks both on query. Use exactly these two hashes for a key `x` over `size` bits: `h1 = x % size`, `h2 = (x*7 + 3) % size`.\n\nTask: write `bloom(size, ops)` where `ops` is a list of `[\"add\", x]` and `[\"has\", x]`. Return an array with one boolean per `has`: `true` only if BOTH bits are set.",
      language: "javascript",
      starter:
        "function bloom(size, ops) {\n  const bits = new Array(size).fill(false);\n  const out = [];\n  // h1 = x % size, h2 = (x*7 + 3) % size\n}",
      solution:
        'function bloom(size, ops) {\n  const bits = new Array(size).fill(false);\n  const out = [];\n  const h1 = (x) => x % size;\n  const h2 = (x) => (x * 7 + 3) % size;\n  for (const [kind, x] of ops) {\n    if (kind === "add") {\n      bits[h1(x)] = true;\n      bits[h2(x)] = true;\n    } else {\n      out.push(bits[h1(x)] && bits[h2(x)]);\n    }\n  }\n  return out;\n}',
      fn: {
        name: "bloom",
        tests: [
          {
            args: [10, [["add", 5], ["has", 5], ["has", 15], ["has", 6]]],
            expected: [true, true, false],
            show: "has(15) is a FALSE POSITIVE — it shares both bits with 5",
          },
          { args: [16, [["has", 1], ["add", 1], ["has", 1]]], expected: [false, true] },
        ],
      },
      hint: "Keep a boolean array of `size` bits. `add` sets `bits[h1(x)]` and `bits[h2(x)]` true; `has` returns whether BOTH are true. Never clear a bit — that's why deletion isn't supported.",
      explanation:
        "The `has(15) → true` in the test is the whole lesson: 15 was never added, but it hashed to the same two bits as 5, so the filter says 'probably yes'. That false positive is acceptable because the caller treats a hit as 'maybe — go check the real store', and the payoff is enormous: billions of seen-URLs in megabytes instead of a giant hash set. It's why a web crawler dedupes its frontier with a bloom filter — a rare false positive just skips one page.",
      docRef: DOC,
    }),
};

const slidingCounter: Generator = {
  id: "sd-sliding-counter",
  title: "Sliding-window counter",
  generate: () =>
    codeTask({
      genId: "sd-sliding-counter",
      prompt:
        "Context: the sliding-window COUNTER approximates the log with just two integers — the previous window's count and the current window's — weighting the previous one by how much of the current window has elapsed. Cheap AND smooths the fixed-window boundary burst.\n\nTask: write `allow(prevCount, currCount, elapsedFraction, limit)`. Estimate the load as the current window's full count PLUS the previous window's count weighted DOWN by how much of the current window has already elapsed; allow the request (`true`) only if that estimate is below `limit`.",
      language: "javascript",
      starter:
        "function allow(prevCount, currCount, elapsedFraction, limit) {\n  // estimate = prevCount * (1 - elapsedFraction) + currCount\n}",
      solution:
        "function allow(prevCount, currCount, elapsedFraction, limit) {\n  const estimate = prevCount * (1 - elapsedFraction) + currCount;\n  return estimate < limit;\n}",
      fn: {
        name: "allow",
        tests: [
          { args: [100, 40, 0.3, 100], expected: false, show: "100*0.7 + 40 = 110 ≥ 100 → denied" },
          { args: [100, 40, 0.7, 100], expected: true, show: "100*0.3 + 40 = 70 < 100 → allowed" },
          { args: [0, 99, 0.5, 100], expected: true },
          { args: [0, 100, 0.5, 100], expected: false },
        ],
      },
      hint: "Weight the previous window by the fraction of the current window still 'covered' — that's `(1 - elapsedFraction)`. Add the current count, compare to `limit`.",
      explanation:
        "This is the algorithm most production limiters (e.g. Cloudflare's) actually use: it needs only two counters per key yet has no hard boundary for requests to burst against — as the current window fills, the previous window's weight fades linearly. It slightly over- or under-counts versus a true log, but the memory savings (two ints vs one-timestamp-per-request) win at scale. Same Redis-atomic-increment placement as the other limiters.",
      docRef: DOC,
    }),
};

export const systemDesignCodingTrack: CodingTrack = {
  id: "coding-system-design",
  title: "System Design Primitives",
  icon: "🧱",
  stack: "JavaScript · algorithms",
  blurb:
    "The parts of a design question that are actually code: rate limiters, an LRU cache, a consistent-hash ring, a circuit breaker, a bloom filter, top-K. Each one runs against tests, so a pass means it behaves.",
  exercises: [
    { level: 1, gen: base62 },
    { level: 1, gen: backoff },
    { level: 2, gen: refill },
    { level: 2, gen: slidingWindowAllow },
    { level: 3, gen: tokenBucket },
    { level: 3, gen: lruCache },
    { level: 3, gen: consistentHash },
    { level: 4, gen: circuitBreaker },
    { level: 4, gen: idempotent },
    { level: 5, gen: topK },
    { level: 5, gen: bloom },
    { level: 5, gen: slidingCounter },
  ],
};
