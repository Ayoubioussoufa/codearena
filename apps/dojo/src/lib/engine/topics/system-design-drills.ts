/**
 * Topic: System Design — Design Drills. Open-ended, self-graded whiteboard
 * prompts: a scenario + a timer, then the worked reference to score yourself
 * against. This is the rep the concept quiz can't give — *producing* a design
 * under a clock, not recognising the right multiple-choice answer.
 *
 * Each prompt mirrors a worked design in the system-design guide, so the guide
 * IS the answer key. The rubric reuses the guide's 6-point framework
 * (scope → estimate → happy path → pressure/tool/what-breaks → kill the SPOF →
 * end in a trade-off) plus one or two design-specific dimensions.
 */
import { designPrompt } from "../helpers";
import type { DesignRubricItem, Generator, Topic } from "../types";

const DOC = { slug: "system-design-fundamentals", label: "System Design — the worked designs" };

/** The guide's universal 6-point framework — the spine of every design's rubric. */
const FRAMEWORK: DesignRubricItem[] = [
  {
    point: "Scope it first",
    detail:
      "Pinned down who/how-many and which path is latency-sensitive BEFORE drawing — separated functional from non-functional requirements out loud.",
  },
  {
    point: "Estimate, then conclude",
    detail:
      "Produced a QPS and/or storage number and finished with the punch line: “…so the pressure is X” (usually reads, rarely storage).",
  },
  {
    point: "Draw the happy path first",
    detail:
      "Client → load balancer → stateless app → DB, drawn simply — THEN evolved it. Didn't bolt on five components at once.",
  },
  {
    point: "Kill the single point of failure",
    detail:
      "Found the box with no twin (single DB, one cache, a lone counter) and gave it redundancy or removed the coordination.",
  },
  {
    point: "End every answer in a trade-off",
    detail:
      "Closed with “I'd do X, which trades A for B.” Named where consistency/latency/cost was relaxed and why. The trade-off IS the score.",
  },
];

/** A design-specific dimension appended to the framework. */
function specific(point: string, detail: string): DesignRubricItem {
  return { point, detail };
}

const urlShortener: Generator = {
  id: "sdd-url-shortener",
  title: "Design a URL shortener",
  generate: () =>
    designPrompt({
      genId: "sdd-url-shortener",
      minutes: 20,
      prompt:
        "Design a URL shortener (like bit.ly): turn a long URL into a short code, and redirect from the short code back to the long URL. Assume 100M new URLs/month and a 10:1 read:write ratio. State your assumptions out loud and run the whole framework.",
      constraints: [
        "Functional: shorten a long URL → short code; visiting the code redirects; optional custom alias + expiry.",
        "Non-functional: redirects must be FAST (a user is waiting) and highly available; creating a link can be slower.",
        "Scale: 100M new URLs/month, links read ~10× more than created.",
      ],
      rubric: [
        ...FRAMEWORK,
        specific(
          "Short-code generation",
          "Chose a base-62 counter over hashing (no collisions ever), and handed each app server a RANGE so they mint codes without a global-counter bottleneck.",
        ),
        specific(
          "Cache the read path",
          "Put cache-aside Redis in front of Postgres for the hot code→URL lookup, and raised 301-vs-302 (permanent lets browsers skip you — kills analytics; temporary sees every click).",
        ),
      ],
      solution:
        "1) REQUIREMENTS. Functional: create short code, redirect, optional alias/expiry. Non-functional: fast+HA redirects; create can lag. Assume 100M/mo, 10:1 read:write.\n\n" +
        "2) ESTIMATION. Writes ≈ 100M / 2.6M s ≈ 40/s (peak ~150). Reads ≈ 400/s (peak ~1,500). Storage ≈ 100M × 500B ≈ 50GB/mo → ~3TB / 5yr — one Postgres box. Punch line: *reads*, not storage, are the thing to engineer.\n\n" +
        "3) API + DATA. `POST /api/urls {longUrl, alias?, expiresAt?} → {shortCode}`; `GET /{code} → 301/302`. Table `urls(short_code PK, long_url, owner_id, created_at, expires_at)`. Code = base-62 of a counter (62⁷ ≈ 3.5T codes). Hand each server a counter RANGE (A owns 1–100k, B owns 100k–200k) so no global coordination.\n\n" +
        "4) ARCHITECTURE. Client → LB → stateless app servers → cache-aside `Redis (code→url)` → Postgres. A redirect is one key lookup; hot links live in Redis at ~1ms. Click counting goes on a queue + worker, off the fast path. Raise 301 (browser caches redirect, fewer hits, no repeat analytics) vs 302 (every click reaches you).\n\n" +
        "5) FAILURE + FOLLOW-UPS. Cache down → Postgres still serves reads via the PK index (slower, not down). Alias taken → unique constraint → 409. Expired → filter at read + nightly cleanup. Abuse → rate-limit POST per key. Multi-region → read replicas; codes never change so replication lag only delays brand-new links.",
      explanation:
        "Self-grade honestly: tick a dimension only if you said it OUT LOUD, not just thought it. The single highest-signal move here is the estimation punch line — “the numbers say reads, not storage” — because it's what forces the cache-in-front-of-Postgres design. If you drew the cache without justifying it from a number, only half-tick “Estimate”. Sub-3/6 means re-drill tomorrow.",
      docRef: { ...DOC, label: "System Design — Worked design #1 (URL shortener)" },
    }),
};

const judge: Generator = {
  id: "sdd-judge",
  title: "Design a code-submission judge",
  generate: () =>
    designPrompt({
      genId: "sdd-judge",
      minutes: 20,
      prompt:
        "Design a platform where users submit code, it runs against hidden tests inside a safe sandbox, and they get a verdict — for 10,000 daily users, with bursty contests. (This is CodeArena — the design you can tell better than anyone because you built it.)",
      constraints: [
        "Functional: submit code, run vs hidden tests in a sandbox, return verdict + runtime; problems CRUD; per-user history; contest leaderboard.",
        "Non-functional: submissions NEVER lost (durability); untrusted code fully ISOLATED; p95 verdict < ~30s; reads stay fast during a contest rush.",
        "Scale: 10k users × ~10 submissions/day ≈ 100k/day (~1–2/s avg), but contests peak ~20–50/s.",
      ],
      rubric: [
        ...FRAMEWORK,
        specific(
          "Async queue + workers",
          "Justified from the estimate that a 1–10s run CAN'T live in the web request → save submission to DB FIRST, then enqueue (work is never lost; the row is the source of truth).",
        ),
        specific(
          "Sandbox depth",
          "Named the container isolation — no network namespace, read-only FS, CPU/mem/time limits, fresh container per run — bonus for namespaces / cgroups / seccomp.",
        ),
        specific(
          "CQRS leaderboard + idempotency",
          "Split read model (Redis sorted set from events) from writes, and made worker re-runs idempotent (keyed by submission id, the verdict UPDATE is a harmless no-op).",
        ),
      ],
      solution:
        "1) REQUIREMENTS. Functional: submit → sandboxed run vs hidden tests → verdict+runtime; problems; history; leaderboard. Non-functional: durable submissions, isolated execution, p95 < 30s, fast reads under contest load.\n\n" +
        "2) ESTIMATION. ~100k/day ≈ 1–2/s avg, but contests burst to 20–50/s; each run is 1–10s of CPU. Conclusion: you CANNOT run code in the request → async queue + many workers.\n\n" +
        "3) API + DATA. `POST /submissions → 202 {id}` (returns immediately); `GET /submissions/{id} → {status, verdict?}`; `GET /contests/{id}/leaderboard`. Tables: users, problems, test_cases, submissions(status walks queued→running→{accepted,wrong_answer,runtime_error,timeout}). Index (user_id, created_at) and (problem_id, status).\n\n" +
        "4) ARCHITECTURE. API inserts the row THEN enqueues (Redis/BullMQ) — never lose work. Workers pull jobs, run code in a Docker sandbox (no network ns, read-only FS, CPU/mem/time + process caps, fresh container/run). Verdict UPDATEs the row. Client polls or gets a WebSocket push. Leaderboard = CQRS: submission events feed a Redis sorted set (ZINCRBY/ZREVRANGE), so contest re-ranking never hits the write DB.\n\n" +
        "5) FAILURE + TRADE-OFFS. Worker dies → at-least-once redelivery → executions idempotent by submission id. Queue backs up → that's the design working; autoscale workers on queue depth. Malicious code → fork bomb (proc limit), infinite loop (time limit), network (no ns), peeking (fresh container). Leaderboard is eventually consistent BY DESIGN; the submission row stays strongly consistent. 10× users → API/workers scale horizontally, Postgres read replicas, test cases → object storage + CDN, queue partitions by language.",
      explanation:
        "The differentiator here is naming EXACTLY where you relaxed consistency (the leaderboard) and why the submission record itself stays strong — that's the trade-off muscle interviewers grade. Half-tick the sandbox point if you said “isolated” without concrete limits; full-tick only if you named at least three (network/FS/CPU/time/process). Since you built this, also grade whether you walked YOUR real choices, not a generic answer.",
      docRef: { ...DOC, label: "System Design — Worked design #2 (code-submission judge)" },
    }),
};

const rateLimiter: Generator = {
  id: "sdd-rate-limiter",
  title: "Design an API rate limiter",
  generate: () =>
    designPrompt({
      genId: "sdd-rate-limiter",
      minutes: 15,
      prompt:
        "Design a rate limiter: limit each API key to 100 requests/minute, across a fleet of many stateless servers. Pick an algorithm and defend it, then place the state.",
      constraints: [
        "Functional: allow ≤100 req/min per key; reject the rest with a clear signal.",
        "Non-functional: correct ACROSS many servers (not per-box); ~1ms overhead; decide what happens if the limiter's own store is down.",
      ],
      rubric: [
        specific(
          "Algorithm + why",
          "Chose token bucket (sustained rate capped, short bursts allowed, two numbers to tune) over fixed-window, and named the fixed-window ~2× boundary-burst flaw.",
        ),
        specific(
          "Centralise the state",
          "Saw that per-server memory fails instantly with 2+ boxes (100 each → 200 total) → state in Redis, key state is tiny `{tokens, lastRefillAt}`.",
        ),
        specific(
          "Make the check atomic",
          "Spotted the read-modify-write race across servers → refill+deduct as one atomic Redis Lua script (~1ms, indivisible).",
        ),
        specific(
          "Reject correctly",
          "Returns 429 Too Many Requests with a `Retry-After` header telling the client when to retry.",
        ),
        specific(
          "Fail-open vs fail-closed (the trade-off)",
          "If Redis is down: fail open (availability, risk overload) vs fail closed (protection, risk outage). Public API → fail open + alert; payments → fail closed. Named it as a trade-off with no universal answer.",
        ),
      ],
      solution:
        "ALGORITHM. Fixed window (per-key per-minute counter) is simplest but allows a ~2× boundary burst (100 at 11:59:59 + 100 at 12:00:01). Token bucket wins: a bucket of 100 tokens refilling at 100/min — sustained rate capped, short bursts allowed, only two knobs. State per key is tiny: `{tokens, lastRefillAt}`.\n\n" +
        "WHERE IT LIVES. In one server's memory it breaks the moment you have two boxes (each allows 100 → 200 total). Centralise in Redis. Many servers hitting the same counter is a read-modify-write race → run refill+deduct as a single atomic Lua script inside Redis (~1ms, indivisible).\n\n" +
        "REJECTION. Return 429 with `Retry-After`.\n\n" +
        "THE TRADE-OFF THEY'RE FISHING FOR. Redis itself down? Fail open (allow all — availability over enforcement, risk overload) or fail closed (reject all — protection over availability)? Public API → fail open with an alert; payments endpoint → fail closed. There is no universally right answer — there's a NAMED trade-off, which is the whole game.",
      explanation:
        "This is a short, sharp question — the entire signal is (1) token bucket with a reason, (2) the cross-server race fixed atomically, and (3) the fail-open/fail-closed trade-off. If you drew a counter in Redis but didn't mention the race, don't tick “atomic”. Ending on the fail-open trade-off is what turns a functional answer into a strong one.",
      docRef: { ...DOC, label: "System Design — Worked design #3 (rate limiter)" },
    }),
};

const newsFeed: Generator = {
  id: "sdd-news-feed",
  title: "Design a news feed / timeline",
  generate: () =>
    designPrompt({
      genId: "sdd-news-feed",
      minutes: 20,
      prompt:
        "Design a home feed: users follow others and see recent posts, newest-ish first. 100M DAU opening the feed ~10×/day (~10k+ read QPS) against far fewer writes.",
      constraints: [
        "Functional: post; see a feed of posts from people you follow; paginate.",
        "Non-functional: read-heavy (feed opens ≫ posts), fast feed loads, handle celebrities with tens of millions of followers.",
      ],
      rubric: [
        ...FRAMEWORK.filter((r) => r.point !== "Kill the single point of failure"),
        specific(
          "Fan-out on write vs read",
          "Framed the WHOLE question on this axis: push (write to each follower's list — O(1) reads, but 50M writes for a celebrity post = the hot-key problem) vs pull (store once, merge at read — cheap writes, costly reads).",
        ),
        specific(
          "The hybrid answer",
          "Push for normal accounts (fast reads for the 99%); pull for the handful of celebrities and merge their posts in at read time — O(1) reads for almost everyone without the fan-out explosion.",
        ),
        specific(
          "What breaks next",
          "Raised ranking (chronological → ML scoring service), cursor pagination (never OFFSET at scale), and bounding the precomputed lists (~latest 1000).",
        ),
      ],
      solution:
        "SCOPE. Read-heavy: 100M DAU × ~10 opens ≈ 10k+ read QPS, writes far lower. The whole design turns on ONE decision: fan-out on write vs fan-out on read.\n\n" +
        "FAN-OUT ON WRITE (push). On post, append the post id into each follower's precomputed feed list (per-user list in Redis). Reads are O(1) — read your list. Killer: a celebrity with 50M followers = 50M writes for one post (hot-key / celebrity problem).\n\n" +
        "FAN-OUT ON READ (pull). Store each post once; at read time gather recent posts from everyone you follow and merge. Cheap writes, expensive reads.\n\n" +
        "HYBRID (the interview answer). Push for normal accounts; pull for the few celebrities and merge at read time. O(1) reads for the 99% without the fan-out explosion.\n\n" +
        "WHAT BREAKS NEXT. Ranking (chronological is easy; ML-ranked needs a scoring service). Feed caching + cursor pagination — never `OFFSET` at this scale. Keep precomputed lists bounded (latest ~1000).",
      explanation:
        "If you didn't frame the answer as fan-out-on-write vs fan-out-on-read, you missed the entire point of this question — do NOT tick the fan-out dimension, and re-drill. The hybrid isn't a compromise you settle for; it's the correct answer, and saying WHY (celebrities break push, everyone else breaks pull) is the trade-off that scores.",
      docRef: { ...DOC, label: "System Design — Worked design #4 (news feed)" },
    }),
};

const chat: Generator = {
  id: "sdd-chat",
  title: "Design a chat / messaging system",
  generate: () =>
    designPrompt({
      genId: "sdd-chat",
      minutes: 20,
      prompt:
        "Design 1:1 and group messaging with reliable delivery and correct ordering. The new ingredient versus a normal web app is the persistent connection.",
      constraints: [
        "Functional: send/receive 1:1 and group messages; delivery even when the recipient is offline; presence (online/offline).",
        "Non-functional: low-latency push (server must reach the client), messages not lost, messages ordered within a conversation.",
      ],
      rubric: [
        specific(
          "Persistent connections",
          "Used WebSockets through a gateway tier (HTTP can't push), with a Redis registry mapping userId → which gateway holds their socket, so a message routes to the right box.",
        ),
        specific(
          "Persist-then-route delivery",
          "Message service writes the message durably FIRST, then delivers to the socket if online, else stores + fires a push. Delivery is at-least-once → client dedupes by message id.",
        ),
        specific(
          "Ordering",
          "Per-CONVERSATION sequence number, not a global clock (global ordering is unnecessary and unscalable). Shard storage by conversation id so a chat's messages live together.",
        ),
        specific(
          "Presence",
          "Heartbeats: client pings every N seconds writing a Redis key with a TTL; no heartbeat → key expires → offline.",
        ),
        specific(
          "What breaks next + trade-off",
          "Raised group fan-out, read receipts, and the reconnect storm on gateway restart (jittered backoff) — and ended on a durability/latency trade-off.",
        ),
      ],
      solution:
        "CONNECTIONS. HTTP request/response can't push → WebSockets through a gateway tier. A connection registry in Redis maps `userId → gateway server holding their socket`, so a message routes to the right box.\n\n" +
        "DELIVERY. The message service persists first, then routes: write the message (durable), deliver to the recipient's socket if online, else store it and fire a push notification. Delivery is at-least-once → the client dedupes by message id.\n\n" +
        "ORDERING. Per-conversation sequence number, not a global clock — global ordering across all chats is unnecessary and unscalable. Shard storage by conversation id so a chat's messages live together.\n\n" +
        "PRESENCE. Heartbeats: clients ping every N seconds, writing a Redis key with a TTL; no heartbeat → key expires → offline.\n\n" +
        "WHAT BREAKS NEXT. Group fan-out, read receipts, and the reconnect storm when a gateway restarts (jittered backoff).",
      explanation:
        "The three load-bearing ideas are: WebSocket gateway + a connection registry, persist-BEFORE-route (so nothing is lost), and per-conversation ordering. If you reached for a global message ordering, that's the classic over-engineering trap — don't tick “Ordering”. Presence-via-TTL-heartbeat is the small detail that shows you've actually thought about liveness.",
      docRef: { ...DOC, label: "System Design — Worked design #5 (chat)" },
    }),
};

const notifications: Generator = {
  id: "sdd-notifications",
  title: "Design a notification system",
  generate: () =>
    designPrompt({
      genId: "sdd-notifications",
      minutes: 15,
      prompt:
        "Design a system that sends push / email / SMS notifications on events, at high volume. This is fundamentally a fan-out + queue problem.",
      constraints: [
        "Functional: on an event, notify the right users across push (APNs/FCM), email (SES), SMS (Twilio); respect user preferences.",
        "Non-functional: absorb bursts, tolerate slow/failing third-party providers, don't double-notify, don't lose messages.",
      ],
      rubric: [
        specific(
          "Queue-backed pipeline",
          "`event → queue → workers → per-channel providers`. Named WHY the queue is load-bearing: absorbs bursts, decouples from slow providers, gives retries for free.",
        ),
        specific(
          "Idempotency",
          "Dedupe on a key per (user, event) so an at-least-once re-delivered event doesn't double-notify.",
        ),
        specific(
          "Preferences + rate limit",
          "Before sending, check opt-outs and a per-user cap (token bucket) so you don't spam a user.",
        ),
        specific(
          "Failure handling",
          "Providers fail → retry with exponential backoff; after N tries move to a dead-letter queue for inspection instead of losing it or looping forever.",
        ),
        specific(
          "What breaks next + trade-off",
          "Raised fanning one event to millions (batch + shard) and priority (a 2FA code must jump the marketing queue) — ended on a delivery-guarantee trade-off.",
        ),
      ],
      solution:
        "PIPELINE. `event → queue → workers → per-channel providers` (APNs/FCM push, SES email, Twilio SMS). The queue is load-bearing: it absorbs bursts, decouples producers from slow third-party providers, and gives retries for free.\n\n" +
        "IDEMPOTENCY. Dedupe on a key per (user, event) so a re-delivered event (queues are at-least-once) doesn't double-notify.\n\n" +
        "PREFERENCES + RATE LIMITS. Before sending, check the user's opt-outs and a per-user cap (token bucket) so you don't spam them.\n\n" +
        "FAILURE HANDLING. Providers fail → retry with exponential backoff; after N tries move the message to a dead-letter queue for inspection instead of losing it or looping forever.\n\n" +
        "WHAT BREAKS NEXT. Fanning a single event to millions (batch + shard the work), and priority (a 2FA code must jump the marketing queue).",
      explanation:
        "Everything hangs off the queue: if you didn't name why it's there (burst absorption + decoupling from slow providers + free retries), don't tick “Queue-backed pipeline”. The two details that separate a strong answer are the dead-letter queue (vs. losing messages or infinite retries) and priority lanes (2FA before marketing).",
      docRef: { ...DOC, label: "System Design — Worked design #6 (notification system)" },
    }),
};

const autocomplete: Generator = {
  id: "sdd-autocomplete",
  title: "Design search autocomplete",
  generate: () =>
    designPrompt({
      genId: "sdd-autocomplete",
      minutes: 15,
      prompt:
        "Design search autocomplete (typeahead): suggest the top completions as the user types, in under 100ms. Reads dominate massively and the data barely changes minute to minute.",
      constraints: [
        "Functional: given a prefix, return the top-k most popular completions.",
        "Non-functional: p99 < 100ms, enormous read volume, ranking can be minutes-stale.",
      ],
      rubric: [
        specific(
          "Trie with cached top-k",
          "A trie (prefix tree) where each node caches its own precomputed top-k. A lookup is one short traversal to the prefix node + a read of its cached list — no scan, no sort at request time.",
        ),
        specific(
          "Serve from memory",
          "Hold the trie in memory (sharded by first letters), fronted by a cache — that's how you hit sub-100ms.",
        ),
        specific(
          "Offline ranking",
          "Ranking is by query frequency, refreshed OFFLINE in batch from query logs. Real-time popularity is unnecessary and turns a simple read system into a hard streaming one.",
        ),
        specific(
          "What breaks next + trade-off",
          "Raised typo tolerance, personalization, and the separate write pipeline that aggregates query counts — ended on the freshness-vs-simplicity trade-off.",
        ),
      ],
      solution:
        "DATA STRUCTURE. A trie (prefix tree) where each node CACHES its own top-k completions, precomputed. A lookup is then a single short traversal to the prefix node and a read of its cached list — no scan, no sort at request time. Hold the trie in memory (sharded by first letters), fronted by a cache.\n\n" +
        "RANKING. By popularity (query frequency). Crucially, that ranking is refreshed OFFLINE in batch from query logs — real-time popularity is unnecessary and turns a simple read system into a hard streaming one.\n\n" +
        "WHAT BREAKS NEXT. Typo tolerance, personalization, and the separate write pipeline that aggregates query counts.",
      explanation:
        "The trap this question sets is real-time ranking. The strong move is to REFUSE it: rank offline in batch, because the data barely changes and streaming would 10× the complexity for no user-visible gain. If you proposed live popularity updates, don't tick “Offline ranking” — that's the freshness/simplicity trade-off decided the wrong way.",
      docRef: { ...DOC, label: "System Design — Worked design #7 (autocomplete)" },
    }),
};

const leaderboard: Generator = {
  id: "sdd-leaderboard",
  title: "Design a real-time leaderboard",
  generate: () =>
    designPrompt({
      genId: "sdd-leaderboard",
      minutes: 15,
      prompt:
        "Design a real-time leaderboard: rank users by rating, show the top 100, and show any individual user's own rank. It sounds like `ORDER BY rating` — which is O(n log n) per query and dies under load. (Another CodeArena piece — walk your real choices.)",
      constraints: [
        "Functional: top-100, and a single user's exact rank on demand, updated in ~real time.",
        "Non-functional: fast under contest write bursts; the ranking store can be rebuilt if lost.",
      ],
      rubric: [
        specific(
          "Redis sorted set (ZSET)",
          "Each member (userId) has a score (rating); the ZSET keeps them ordered. `ZADD` update O(log n), top-k `ZREVRANGE 0 99` O(log n + k), a user's rank `ZREVRANK` O(log n). One structure answers every query fast.",
        ),
        specific(
          "DB is the source of truth",
          "Postgres stays authoritative; the ZSET is the SERVING layer, rebuilt from the DB if lost — not the system of record.",
        ),
        specific(
          "Scale + write bursts",
          "One ZSET handles millions of members; shard by league/region if needed. During a live contest, queue rating updates and batch them.",
        ),
        specific(
          "What breaks next + trade-off",
          "Raised ties (pack a timestamp into the score as a tie-breaker) and exact rank for a user at position 4,000,000 (an approximate percentile is often enough) — ended on a consistency/cost trade-off.",
        ),
      ],
      solution:
        "DATA STRUCTURE. A Redis sorted set (ZSET). Each member (userId) has a score (rating); the ZSET keeps them ordered. Updates are `ZADD` (O(log n)), top-k is `ZREVRANGE 0 99` (O(log n + k)), a user's rank is `ZREVRANK` (O(log n)). One structure answers every query fast. The database stays the source of truth; the ZSET is the serving layer, rebuilt from it if lost.\n\n" +
        "SCALE. One ZSET handles millions of members; shard by league/region if you must.\n\n" +
        "WHAT BREAKS NEXT. Ties (pack a timestamp into the score as a tie-breaker), write bursts during a live contest (queue rating updates and batch them), and exact rank for a user buried at position 4,000,000 (an approximate percentile is often enough).",
      explanation:
        "The whole question is “don't `ORDER BY` — use the right data structure.” If you reached for a SQL query with an index, that's the naive answer this prompt is built to catch. The strong version names the three ZSET operations and their O(log n) costs, AND keeps the DB as source of truth with the ZSET as a rebuildable serving layer. Since you built this, grade whether you told YOUR real story.",
      docRef: { ...DOC, label: "System Design — Worked design #9 (leaderboard)" },
    }),
};

export const systemDesignDrillsTopic: Topic = {
  id: "system-design-drills",
  title: "System Design — Design Drills",
  icon: "✏️",
  blurb:
    "Whiteboard the real thing: a scenario + a timer, then reveal the worked design and self-grade against the 6-point rubric. The rep the quiz can't give — producing a design under a clock, not recognising one.",
  docSlug: "system-design-fundamentals",
  docTitle: "System Design — fundamentals",
  generators: [
    urlShortener,
    judge,
    rateLimiter,
    newsFeed,
    chat,
    notifications,
    autocomplete,
    leaderboard,
  ],
};
