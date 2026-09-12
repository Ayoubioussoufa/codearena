/**
 * Exercises for the System Design guide.
 *
 * System design is answered out loud, so these are mostly reasoning drills:
 * estimate, choose, and justify. The point is not the number — it is being
 * able to reach one and defend the trade-off behind it.
 */
import type { GuideExercise } from "./types";

export const systemDesignExercises: GuideExercise[] = [
  {
    id: "envelope-estimate",
    title: "Estimate before you design",
    prompt:
      "1M daily submissions, each storing 2 KB of code plus a 1 KB result. Peak is 10× the average. Work out writes/second at peak and storage per year.",
    language: "text",
    given: `86,400 seconds in a day  ·  1 KB = 10³ bytes  ·  1 TB = 10¹² bytes`,
    starter: `average writes/sec:
peak writes/sec:
storage per day:
storage per year:
`,
    solution: `average writes/sec: 1,000,000 / 86,400 ≈ 12/s  (round 86,400 to 100,000 → ~10/s)
peak writes/sec:    ~120/s
storage per day:    1M × 3 KB = 3 GB
storage per year:   3 GB × 365 ≈ 1.1 TB
`,
    hint: "Round 86,400 to 100,000. You are looking for the order of magnitude, not the decimal.",
    explanation:
      "The number matters far less than what it rules out. **~120 writes/second is small** — a single Postgres instance handles it, so 'shard the database' is over-engineering and saying so is the strong answer. **~1 TB/year is also small**, so hot storage is fine and an archival tier is a later optimisation. Estimating first stops you designing for a scale you do not have, which is the most common way this interview goes wrong.",
    checks: [
      { re: "1[02]\\s*/?s|1[02]\\s*(writes|per)", flags: "i", label: "average around 10–12/s" },
      { re: "1[02]0\\s*/?s|1[02]0\\s*(writes|per)", flags: "i", label: "peak around 100–120/s" },
      { re: "3\\s*GB", flags: "i", label: "3 GB per day" },
      { re: "1(\\.1)?\\s*TB|1000\\s*GB|1,?100\\s*GB", flags: "i", label: "about 1 TB per year" },
    ],
  },

  {
    id: "latency-ordering",
    title: "Order the latencies",
    prompt:
      "Order these from fastest to slowest, as `1. …` to `6. …`, with a rough number for each.",
    language: "text",
    given: `a disk seek (SSD) · a network round trip within a datacenter ·
reading 1 MB from memory · an L1 cache reference ·
a network round trip California → Netherlands · reading 1 MB from SSD`,
    starter: `1.
2.
3.
4.
5.
6.
`,
    solution: `1. L1 cache reference — ~1 ns
2. reading 1 MB from memory — ~100 µs
3. SSD disk seek — ~100 µs
4. reading 1 MB from SSD — ~1 ms
5. round trip within a datacenter — ~0.5 ms
6. round trip California → Netherlands — ~150 ms
`,
    hint: "The only one that is hundreds of times slower than everything else is the one that crosses an ocean, and it is bounded by the speed of light.",
    explanation:
      "The one to internalise: **a cross-continent round trip is ~150 ms and no amount of money fixes it** — it is physics. That single fact justifies CDNs, regional replicas and doing more per request rather than chatting. The other useful gap is memory versus network: a local memory read is roughly a thousand times faster than a datacenter round trip, which is why an in-process cache beats a Redis lookup, and Redis beats the database.",
    checks: [
      { re: "1\\.[^\\n]*L1", flags: "mi", label: "1 — L1 cache" },
      { re: "(2|3)\\.[^\\n]*memory", flags: "mi", label: "memory read near the top" },
      { re: "6\\.[^\\n]*(California|Netherlands|continent|ocean)", flags: "mi", label: "6 — the cross-continent trip is slowest" },
      { re: "150\\s*ms", flags: "i", label: "knows the ~150 ms figure" },
      { re: "ns|nanosecond", flags: "i", label: "uses nanoseconds for cache" },
    ],
  },

  {
    id: "cache-strategy",
    title: "Pick the cache pattern",
    prompt:
      "For each, name the pattern — `cache-aside`, `write-through`, or `write-behind` — and one clause of why.",
    language: "text",
    given: `1. a problem list read constantly and edited rarely
2. a leaderboard that must never show a stale score after an update
3. a view counter written thousands of times a second, where losing a few is acceptable`,
    starter: `1.
2.
3.
`,
    solution: `1. cache-aside — read from cache, fall back to the database on a miss and populate; simplest, and stale reads are tolerable here
2. write-through — write to cache and database together, so a read after a write is never stale; slower writes are the price
3. write-behind — write to cache and flush to the database in batches; fastest, and a crash loses the most recent window
`,
    hint: "Ask what each one is willing to lose: freshness, write latency, or durability. Each pattern trades away exactly one.",
    explanation:
      "**Cache-aside** is the default because it is simple and the cache never blocks a write — the cost is a window of staleness after an update. **Write-through** removes that window by paying for it on every write. **Write-behind** is the fastest and the only one that can lose data, so it belongs on things you would shrug at losing. The interview answer is never the pattern alone — it is naming what you are giving up.",
    checks: [
      { re: "1\\.[^\\n]*(aside|lazy)", flags: "mi", label: "1 — cache-aside" },
      { re: "2\\.[^\\n]*write.?through", flags: "mi", label: "2 — write-through" },
      { re: "3\\.[^\\n]*write.?behind|3\\.[^\\n]*write.?back", flags: "mi", label: "3 — write-behind" },
    ],
  },

  {
    id: "cap-tradeoff",
    title: "Choose your side of CAP",
    prompt:
      "The network partitions. For each system write `CP` or `AP` and one clause of reasoning.",
    language: "text",
    given: `1. a bank transfer
2. a social media feed
3. a submission judge writing results
4. a DNS lookup`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. CP — refuse the write rather than allow a double-spend
2. AP — a slightly stale feed is fine; an unavailable one is not
3. CP — a result written twice or lost corrupts the record
4. AP — serve a possibly-stale answer; being down means nothing resolves
`,
    hint: "CAP only bites during a partition. The question is always: when you cannot have both, would you rather be wrong or be down?",
    explanation:
      "The common misreading is 'pick two of three'. **Partition tolerance is not optional** — networks fail — so the real choice is between consistency and availability *during* a partition. Anything counting money or recording a verdict chooses CP: refuse rather than risk being wrong. Anything where staleness is cosmetic chooses AP. DNS is the clearest AP system in the world, and the reason the internet works at all.",
    checks: [
      { re: "1\\.[^\\n]*CP", flags: "m", label: "1 — CP" },
      { re: "2\\.[^\\n]*AP", flags: "m", label: "2 — AP" },
      { re: "3\\.[^\\n]*CP", flags: "m", label: "3 — CP" },
      { re: "4\\.[^\\n]*AP", flags: "m", label: "4 — AP" },
    ],
  },

  {
    id: "sql-or-nosql",
    title: "Justify the datastore",
    prompt:
      "For each, write the datastore and one clause of why.",
    language: "text",
    given: `1. users, submissions, problems — with foreign keys and transactions
2. a live leaderboard, top 100 by rating, updated constantly
3. a session store with a TTL
4. full-text search across problem statements`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. Postgres — relational data with real constraints and transactions
2. Redis sorted set — O(log n) rank queries that a SQL ORDER BY cannot match at this rate
3. Redis — key-value with native expiry, and losing it only forces a re-login
4. Elasticsearch or Postgres full-text — an inverted index, which a B-tree cannot do
`,
    hint: "Each one is really asking which ACCESS PATTERN the store is built for, not which technology is newest.",
    explanation:
      "**Choose by access pattern, not fashion.** Postgres is the right default and 'we do not need another datastore yet' is a strong answer. Redis earns its place twice here for different reasons: a sorted set answers *rank* queries in O(log n), which no `ORDER BY … LIMIT` will match at write volume, and native TTL makes sessions self-cleaning. Full-text is the clearest case of a different index structure entirely — a B-tree cannot answer 'which documents contain this word'.",
    checks: [
      { re: "1\\.[^\\n]*(postgres|sql|relational)", flags: "mi", label: "1 — relational" },
      { re: "2\\.[^\\n]*(redis|sorted set|zset)", flags: "mi", label: "2 — Redis sorted set" },
      { re: "3\\.[^\\n]*(redis|key.value|memcach)", flags: "mi", label: "3 — key-value with TTL" },
      { re: "4\\.[^\\n]*(elastic|search|inverted|full.?text)", flags: "mi", label: "4 — a search index" },
    ],
  },

  {
    id: "rate-limit-algorithm",
    title: "Pick the rate-limiting algorithm",
    prompt:
      "A fixed window of 5 requests per minute lets someone send 10 in two seconds. Explain how, and name the algorithm that fixes it.",
    language: "text",
    given: `Window boundaries at 12:00:00 and 12:01:00.`,
    starter: `1. how 10 get through:
2. the fix:
`,
    solution: `1. how 10 get through: 5 at 12:00:59 and 5 at 12:01:01 — different windows, so each batch is within its own limit, but 10 land within two seconds.
2. the fix: a sliding window (or token bucket), which measures the last 60 seconds from now rather than resetting on a fixed boundary.
`,
    hint: "Both batches are legal. The problem is that the counter resets at a wall-clock instant rather than relative to the requests.",
    explanation:
      "The **boundary burst** is the classic weakness of a fixed window, and it means the effective limit is double the configured one for a short spike — which matters most on exactly the endpoint you are protecting, login. A sliding window counts what happened in the trailing 60 seconds, so the boundary disappears. A token bucket is the other standard answer and allows a deliberate burst while capping the sustained rate, which is often what you actually want.",
    checks: [
      { re: "12:0?0:5\\d|boundary|window|reset", flags: "i", label: "explains the boundary burst" },
      { re: "sliding|token bucket|leaky bucket", flags: "i", label: "names a fix" },
    ],
  },

  {
    id: "queue-backpressure",
    title: "Handle a queue that cannot keep up",
    prompt:
      "Submissions arrive faster than workers can judge them and the queue is growing without bound. Give three responses, in the order you would apply them.",
    language: "text",
    given: `// The queue depth has gone from 50 to 40,000 in an hour.`,
    starter: `1.
2.
3.
`,
    solution: `1. Scale the consumers — add workers; this is why the work is in a queue at all.
2. Apply back pressure — cap the queue depth and reject or throttle new submissions with a clear message, so the system degrades visibly instead of silently.
3. Shed load by priority — judge contest submissions first and let practice runs wait, so the important work still completes.
`,
    hint: "Only one of these adds capacity. The other two are about choosing what to fail, rather than letting the system choose for you.",
    explanation:
      "An unbounded queue does not absorb overload, it **hides** it: latency grows until every result is useless and memory eventually runs out. The order matters — scale first because it is the only option that actually does the work, then back pressure, because a rejected submission with an honest message is better than one accepted and returned twenty minutes later. **Degrade deliberately.** A system that chooses what to drop beats one that discovers it under load.",
    checks: [
      { re: "1\\.[^\\n]*(scale|more worker|add worker|consumer)", flags: "mi", label: "1 — scale the consumers" },
      { re: "(back.?pressure|reject|throttle|cap)", flags: "i", label: "applies back pressure" },
      { re: "(priorit|shed|degrade)", flags: "i", label: "sheds load by priority" },
    ],
  },

  {
    id: "idempotency-key",
    title: "Make a retried request safe",
    prompt:
      "A client's network drops after the server charged a card but before the response arrived, so the client retries and charges twice. Describe the fix in three steps.",
    language: "text",
    given: `POST /payments  { amount: 5000, card: "..." }`,
    starter: `1.
2.
3.
`,
    solution: `1. The client generates an idempotency key — a UUID per logical attempt, not per HTTP request — and sends it as a header.
2. The server stores the key with the result, in the same transaction as the charge.
3. A request arriving with a key already stored returns the stored result instead of charging again.
`,
    hint: "The client has to say 'this is the same attempt as before'. The server cannot work that out on its own — two identical bodies might be two genuine purchases.",
    explanation:
      "The server genuinely cannot distinguish a retry from a second purchase of the same thing, so the client must assert it. Two details decide whether it works: **the key is per attempt, not per request**, so a retry reuses it and a new purchase does not; and **storing the key must be in the same transaction as the effect**, or a crash between them leaves you having charged with no record. This is exactly the pattern behind Stripe's API, and it is the same reasoning as making a queue worker idempotent.",
    checks: [
      { re: "key|uuid|token", flags: "i", label: "uses a client-generated key" },
      { re: "client", flags: "i", label: "the client generates it" },
      { re: "stor|persist|save|record", flags: "i", label: "the server stores it with the result" },
      { re: "transaction|atomic|same", flags: "i", label: "stored atomically with the effect" },
      { re: "return|replay|same result", flags: "i", label: "a repeat returns the stored result" },
    ],
  },

  {
    id: "communication-choice",
    title: "Choose the communication style",
    prompt:
      "For each, write `REST`, `WebSocket`, `gRPC`, or `queue`, and one clause of why.",
    language: "text",
    given: `1. a browser fetching a list of problems
2. pushing a judge result to the submitter the moment it exists
3. the API telling the judge worker to start work
4. two internal services exchanging high-volume typed messages`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. REST — a cacheable request/response over HTTP, and every client already speaks it
2. WebSocket — the server needs to speak first, which request/response cannot do
3. queue — fire-and-forget with retries and durability; the API must not wait
4. gRPC — binary, schema-first, fast, and both ends are yours
`,
    hint: "Two questions separate all four: who speaks first, and does the caller need to wait for an answer?",
    explanation:
      "**Who initiates** rules out half the options immediately. Polling for a result is the wrong answer to item 2 — it wastes requests and is still late. Item 3 is the one people get wrong by reaching for an HTTP call to the worker: that couples the API's availability to the worker's, and loses the request if the worker is down. A queue decouples them and survives a restart. gRPC only makes sense when you control both ends, which is why it is internal-only here.",
    checks: [
      { re: "1\\.[^\\n]*REST|1\\.[^\\n]*HTTP", flags: "mi", label: "1 — REST" },
      { re: "2\\.[^\\n]*(websocket|sse|push)", flags: "mi", label: "2 — WebSocket" },
      { re: "3\\.[^\\n]*queue", flags: "mi", label: "3 — a queue" },
      { re: "4\\.[^\\n]*gRPC", flags: "mi", label: "4 — gRPC" },
    ],
  },

  {
    id: "url-shortener",
    title: "Design the URL shortener's key",
    prompt:
      "Answer the three questions the interviewer will actually press on.",
    language: "text",
    given: `100M URLs. Reads vastly outnumber writes.`,
    starter: `1. how long is the short code, and why:
2. how do you generate it without collisions:
3. what does the read path look like:
`,
    solution: `1. 7 characters of base62 — 62^7 ≈ 3.5 × 10^12, far beyond 100M, so collisions stay negligible.
2. Encode an auto-incrementing id in base62: collision-free by construction, no retry loop. (Random + a uniqueness check also works, but costs a read per write.)
3. Cache-aside on Redis in front of a key-value lookup, then a 301/302 redirect. Reads dominate, so the cache carries almost all of them.
`,
    hint: "The counter-encoding answer avoids collisions entirely rather than handling them. Its weakness is that codes become guessable and sequential — say so before they ask.",
    explanation:
      "This is the canonical opener because it has one right shape and several defensible variants. Encoding a counter is collision-free by construction, which beats generating randomly and retrying — but it leaks volume and lets anyone enumerate your links, so mention it and offer a salted or hashed alternative. **The read path is where the marks are**: a 100:1 read ratio means the design is a cache problem, and saying that before being asked is what separates a good answer from a complete one.",
    checks: [
      { re: "7|six|seven|base62|base 62", flags: "i", label: "sizes the code against the key space" },
      { re: "counter|increment|id|hash|random", flags: "i", label: "has a generation strategy" },
      { re: "cach", flags: "i", label: "caches the read path" },
      { re: "30[12]|redirect", flags: "i", label: "names the redirect" },
    ],
  },
];
