/**
 * Topic: System Design. Conceptual scenarios + back-of-envelope estimation —
 * a natural fit for the quiz engine. Drills the system-design-fundamentals guide.
 */
import { choice, numeric } from "../helpers";
import type { Generator, Topic } from "../types";

const DOC = { slug: "system-design-fundamentals", label: "System Design — fundamentals" };

const caching: Generator = {
  id: "sd-caching",
  title: "Caching strategy",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "sd-caching",
        prompt:
          "A product page is read 10,000× per second but its data changes a few times a day. What's the highest-leverage first move?",
        correct: "Cache the rendered page / query result and serve reads from the cache",
        wrong: [
          "Add read replicas to the database",
          "Shard the database by product id",
          "Rewrite the query with better indexes",
        ],
        explanation:
          "Read-heavy + rarely-changing is the textbook cache case: a cache hit avoids the database entirely, cutting latency and load by orders of magnitude for near-zero staleness cost. Replicas and sharding help too, but they still hit the DB on every read; indexes speed a query you shouldn't be running 10k×/s at all. Reach for the cache first, then scale the origin.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "sd-caching",
        prompt:
          "In a cache-aside (lazy) strategy, what happens on a cache MISS?",
        correct:
          "The app reads from the database, writes the value into the cache, then returns it",
        wrong: [
          "The cache fetches from the database itself and the app waits",
          "The request fails and the client retries",
          "The database pushes the value to every cache node",
        ],
        explanation:
          "Cache-aside puts the application in charge: on a miss it loads from the source of truth, populates the cache, and returns — so only the first request for a key pays the cost. It contrasts with read-through (the cache library does the load) and write-through (writes go through the cache). Cache-aside is the most common because it's simple and the cache never has to know how to load data.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "sd-caching",
      prompt:
        "Thousands of requests ask for a popular key at the exact moment it expires, all missing and hammering the database at once. What is this, and a fix?",
      correct: "Cache stampede / thundering herd — add jitter to TTLs and/or a lock so one request repopulates",
      wrong: [
        "Cache poisoning — sign the cache entries",
        "A hot partition — shard the cache",
        "Cache invalidation — switch to write-through",
      ],
      explanation:
        "When many clients miss simultaneously on the same expired key, they stampede the origin. Mitigations: randomised TTL jitter so keys don't all expire together, a mutex/'single-flight' so just one request recomputes while others wait, or serving slightly-stale data during refresh. It's an *availability* trap, distinct from cache poisoning (bad data) or a hot partition (uneven load). (TTL jitter = giving each key a slightly random expiry so they don't all lapse at once.)",
      docRef: DOC,
    });
  },
};

const loadBalancing: Generator = {
  id: "sd-load-balancing",
  title: "Load balancing",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "sd-load-balancing",
      prompt: variant
        ? "Your app servers are stateless. Which load-balancing choice keeps that an asset rather than a liability?"
        : "Why do sticky sessions (routing a user to the same server) make scaling harder?",
      correct: variant
        ? "Any algorithm works (round-robin/least-connections) — statelessness means any server can handle any request"
        : "State lives on one server, so you can't freely add/remove servers or reroute on failure without losing sessions",
      wrong: variant
        ? [
            "You must use IP-hash so each user always hits one server",
            "You must store sessions on the load balancer",
            "You must pin each user to a server for correctness",
          ]
        : [
            "They violate the CAP theorem",
            "They require a NoSQL database",
            "They make caching impossible",
          ],
      explanation:
        "Stateless servers are the enabler of horizontal scaling: because no request depends on which server handled the last one, the load balancer can spread traffic freely and a dead server costs nothing but capacity. Sticky sessions (pinning each user to one fixed server) put per-server state back, so scaling and failover start losing user data. Push session state to a shared store (Redis) or a signed token, and keep the servers stateless.",
      docRef: DOC,
    });
  },
};

const dbScaling: Generator = {
  id: "sd-db-scaling",
  title: "Scaling the database",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "sd-db-scaling",
        prompt: "Reads are overwhelming your primary database; writes are fine. First move?",
        correct: "Add read replicas and route reads to them",
        wrong: [
          "Shard the database across nodes by key",
          "Switch from SQL to NoSQL",
          "Add more application servers",
        ],
        explanation:
          "Read replicas directly attack a read bottleneck: the primary handles writes and streams changes to replicas that serve reads, multiplying read capacity with minimal app change. Sharding is the answer for a *write/storage* bottleneck and is far more invasive. More app servers don't help if the DB is the wall. Match the scaling tool to which dimension is saturated.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "sd-db-scaling",
        prompt: "Writes and total data volume have outgrown a single machine. What's the appropriate technique?",
        correct: "Sharding (horizontal partitioning) — split data across nodes by a shard key",
        wrong: [
          "Read replicas",
          "A bigger cache",
          "Vertical scaling forever",
        ],
        explanation:
          "When one machine can't hold the data or absorb the write rate, you partition: each shard owns a subset of keys, so writes and storage spread across nodes. Replicas only scale reads; caching doesn't help writes; vertical scaling hits a ceiling (and a price cliff). The hard parts of sharding — choosing a key that avoids hot spots, and cross-shard queries — are the real design work.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "sd-db-scaling",
      prompt: "What's the main risk of a poorly chosen shard key?",
      correct: "A hot shard — skewed traffic concentrates on one node, recreating the bottleneck",
      wrong: [
        "The database can no longer enforce foreign keys anywhere",
        "Reads become impossible without a cache",
        "The data automatically duplicates across all shards",
      ],
      explanation:
        "The shard key decides the data (and traffic) distribution. A key like 'country' or 'celebrity user id' sends a disproportionate share to one shard — a hot shard that's as overloaded as the unsharded DB was. Good keys spread load evenly (high-cardinality, request-aligned), sometimes via hashing. Cross-shard joins and transactions do get harder, but the classic failure is skew.",
      docRef: DOC,
    });
  },
};

const capTheorem: Generator = {
  id: "sd-cap",
  title: "CAP theorem",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "sd-cap",
      prompt: variant
        ? "During a network partition, a banking ledger must never show contradictory balances. Which does it sacrifice?"
        : "The CAP theorem says that during a network partition, a distributed system must choose between…",
      correct: variant
        ? "Availability — it should reject requests it can't safely serve rather than risk inconsistency"
        : "Consistency and Availability — you can't have both while partitioned",
      wrong: variant
        ? [
            "Consistency — show possibly-stale balances to stay up",
            "Partition tolerance — assume the network never fails",
            "Durability — drop writes until the partition heals",
          ]
        : [
            "Consistency and Partition tolerance",
            "Availability and Partition tolerance",
            "Latency and Throughput",
          ],
      explanation:
        "CAP: when the network partitions (which you can't opt out of in a distributed system), you must choose. A bank ledger is CP — it prefers refusing service over returning inconsistent balances. A social feed is typically AP — stay available and reconcile later, tolerating brief staleness. CAP is really 'consistency vs availability *during a partition*'; the rest of the time you can often have both.",
      docRef: DOC,
    });
  },
};

const consistency: Generator = {
  id: "sd-consistency",
  title: "Read-your-writes",
  generate: (rng) => {
    return choice(rng, {
      genId: "sd-consistency",
      prompt:
        "A user updates their profile, but on refresh (served by a read replica) they see the old value. What is this, and the standard fix?",
      correct:
        "Replication lag breaking read-your-writes — route that user's own reads to the primary (or a synced replica) briefly after a write",
      wrong: [
        "A cache bug — disable caching for the whole app",
        "A CAP violation — switch the whole system to strong consistency",
        "A sharding error — re-shard by user id",
      ],
      explanation:
        "Async replicas lag the primary by milliseconds-to-seconds, so a read right after a write can land on a not-yet-updated replica. Users tolerate seeing *others'* changes late, but their *own* action vanishing feels broken — hence read-your-writes consistency: pin the writer's subsequent reads to the primary (or a replica known to be caught up) for a short window. Forcing global strong consistency would throw away the replicas' whole benefit.",
      docRef: DOC,
    });
  },
};

const messageQueue: Generator = {
  id: "sd-queue",
  title: "Async with a queue",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "sd-queue",
      prompt: variant
        ? "Sign-up must send a welcome email, generate a thumbnail, and warm a cache — none needed before responding. Best design?"
        : "What does putting slow work behind a message queue primarily buy you?",
      correct: variant
        ? "Enqueue the side tasks and respond immediately; workers process the queue asynchronously"
        : "Decoupling and load smoothing — the request returns fast and spikes are absorbed by the queue",
      wrong: variant
        ? [
            "Do everything synchronously so the user knows it all succeeded",
            "Run them in parallel threads inside the request handler",
            "Move them to a database trigger",
          ]
        : [
            "Exactly-once delivery for free",
            "Strong consistency across services",
            "Elimination of the need for retries",
          ],
      explanation:
        "Work that doesn't affect the response belongs off the request path: enqueue it and return, letting workers handle it asynchronously. The queue decouples producer from consumer (they scale and fail independently) and smooths bursts (the backlog grows instead of the system falling over). What it does NOT give you is exactly-once — queues are at-least-once, so consumers must be idempotent.",
      docRef: DOC,
    });
  },
};

const rateLimiting: Generator = {
  id: "sd-rate-limit",
  title: "Rate limiting",
  generate: (rng) => {
    return choice(rng, {
      genId: "sd-rate-limit",
      prompt:
        "You want to allow short bursts but cap the sustained request rate per API key. Which algorithm fits best?",
      correct: "Token bucket — tokens refill at a fixed rate; a full bucket permits a burst",
      wrong: [
        "A fixed window counter — reset the count every minute",
        "A single global mutex around the endpoint",
        "Round-robin load balancing",
      ],
      explanation:
        "Token bucket refills tokens at the sustained rate you want to allow and lets a request spend one; a bucket that's had time to fill permits a short burst, while sustained traffic is capped at the refill rate — exactly 'bursts okay, sustained limited'. Fixed windows are simpler but allow 2× bursts at window edges; leaky bucket smooths output but forbids bursts. Rate limiting is a per-key counter problem, not a load-balancing one.",
      docRef: DOC,
    });
  },
};

const cdn: Generator = {
  id: "sd-cdn",
  title: "CDNs & static assets",
  generate: (rng) => {
    return choice(rng, {
      genId: "sd-cdn",
      prompt: "Users worldwide report slow image and JS/CSS loading from your single-region origin. Best fix?",
      correct: "Serve static assets from a CDN that caches them at edge locations near users",
      wrong: [
        "Add more origin servers in the same region",
        "Compress the database",
        "Switch the API to gRPC",
      ],
      explanation:
        "Static, cacheable assets are what CDNs exist for: copies live at 'edge' locations (data centers physically close to users), so latency drops from a cross-planet round trip to a nearby one, and origin load falls. More same-region origin servers don't fix the speed-of-light distance; database and API-protocol changes are unrelated to static delivery. Fingerprint asset filenames so you can cache them ~forever and bust on change.",
      docRef: DOC,
    });
  },
};

const consistentHashing: Generator = {
  id: "sd-consistent-hashing",
  title: "Consistent hashing",
  generate: (rng) => {
    return choice(rng, {
      genId: "sd-consistent-hashing",
      prompt:
        "A cache cluster uses `hash(key) % N` to pick a node. Why is adding one node (N→N+1) a problem, and what solves it?",
      correct:
        "Almost every key remaps to a new node (mass cache miss) — consistent hashing remaps only ~1/N of keys",
      wrong: [
        "Nothing breaks — modulo hashing is stable under resizing",
        "Keys collide more often — use a bigger hash function",
        "The cluster loses durability — add replication",
      ],
      explanation:
        "With `% N`, changing N shifts the modulus for nearly all keys, so almost everything remaps at once — a cache-wide miss storm right when you're scaling. Consistent hashing instead arranges nodes and keys around an imaginary ring, so adding or removing a node only moves the keys between it and its neighbour — about 1/N of the total. Virtual nodes then smooth the distribution. It's the standard technique for sharded caches and distributed stores.",
      docRef: DOC,
    });
  },
};

const sqlVsNosql: Generator = {
  id: "sd-sql-nosql",
  title: "SQL vs NoSQL",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "sd-sql-nosql",
      prompt: variant
        ? "Your data is highly relational with multi-entity transactions (orders, payments, inventory) needing strong guarantees. Which store?"
        : "You need to ingest a massive stream of schema-flexible events with simple key lookups and horizontal scale. Which store?",
      correct: variant
        ? "A relational (SQL) database — ACID transactions and joins across related entities"
        : "A NoSQL store (e.g. key-value or wide-column) tuned for write throughput and horizontal scale",
      wrong: variant
        ? [
            "A key-value store — model the relations in application code",
            "A CDN-backed blob store",
            "A search index as the primary store",
          ]
        : [
            "A single relational database with many joins",
            "A graph database with global transactions",
            "An in-memory cache as the source of truth",
          ],
      explanation:
        "Match the store to the access pattern. Relational shines when data is interconnected and correctness needs ACID transactions and joins — orders/payments/inventory. NoSQL shines for high-volume, schema-flexible, simple-access-pattern workloads that must scale horizontally — event streams, activity logs, sessions. Neither is 'better'; picking by workload (and being honest that most apps start fine on Postgres) is the skill.",
      docRef: DOC,
    });
  },
};

const singlePointOfFailure: Generator = {
  id: "sd-spof",
  title: "Eliminating single points of failure",
  generate: (rng) => {
    return choice(rng, {
      genId: "sd-spof",
      prompt:
        "Every request flows through one load balancer. It's efficient — but what's the concern, and the fix?",
      correct:
        "It's a single point of failure — run redundant load balancers with failover (and health checks)",
      wrong: [
        "It's a bottleneck only — cache in front of it",
        "It violates CAP — pick AP",
        "Nothing — load balancers never fail",
      ],
      explanation:
        "Any component with no redundancy is a single point of failure: if the lone load balancer dies, the whole system is unreachable regardless of how many healthy app servers sit behind it. The fix is redundancy plus automated failover — multiple LBs (active-passive or active-active), health checks, and a floating IP / DNS failover. Hunting SPOFs ('what happens if this one box dies?') is core to availability design.",
      docRef: DOC,
    });
  },
};

const qpsEstimation: Generator = {
  id: "sd-est-qps",
  title: "Estimation: average QPS",
  generate: (rng) => {
    const dauMillions = rng.pick([1, 2, 5, 10] as const);
    const perUser = rng.pick([2, 5, 10, 20] as const);
    const dau = dauMillions * 1_000_000;
    const qps = Math.round((dau * perUser) / 86_400);
    return numeric({
      genId: "sd-est-qps",
      prompt: `A service has ${dauMillions}M daily active users, each making about ${perUser} requests per day, spread evenly. Estimate the average queries per second (86,400 s/day). Round to the nearest 100.`,
      answer: qps,
      tolerance: Math.max(150, qps * 0.06),
      placeholder: "QPS (a number)",
      explanation: `Average QPS = total daily requests ÷ seconds per day = (${dauMillions}M × ${perUser}) ÷ 86,400 ≈ ${qps.toLocaleString("en-US")}. Two caveats interviewers expect you to add: this is the *average* — peak traffic is often 2–5× higher, so you'd provision for the peak — and 86,400 ≈ 100,000 is a fine approximation for a back-of-envelope. Capacity math like this sizes your fleet and flags whether you even have a scale problem.`,
      docRef: DOC,
    });
  },
};

const storageEstimation: Generator = {
  id: "sd-est-storage",
  title: "Estimation: daily storage",
  generate: (rng) => {
    const writesPerDayM = rng.pick([5, 10, 50, 100] as const);
    const bytesPerRow = rng.pick([200, 500, 1000] as const);
    const gb = (writesPerDayM * 1_000_000 * bytesPerRow) / 1_000_000_000;
    return numeric({
      genId: "sd-est-storage",
      prompt: `A system writes ${writesPerDayM}M records per day, each about ${bytesPerRow} bytes. Roughly how many GB of raw storage does one day add? (1 GB = 10^9 bytes.) Round to the nearest whole GB.`,
      answer: gb,
      tolerance: Math.max(1, gb * 0.06),
      placeholder: "GB (a number)",
      explanation: `Daily bytes = ${writesPerDayM}M × ${bytesPerRow} = ${(writesPerDayM * bytesPerRow).toLocaleString("en-US")} million bytes ≈ ${gb} GB/day. Multiply out to a year (×365) and you're sizing the database and its growth; add replication factor and indexes (often 2–4× the raw figure) for the real footprint. This is how you decide between 'one Postgres box for years' and 'we need a partitioning story now'.`,
      docRef: DOC,
    });
  },
};

const idempotentApi: Generator = {
  id: "sd-idempotency",
  title: "Idempotent write APIs",
  generate: (rng) => {
    return choice(rng, {
      genId: "sd-idempotency",
      prompt:
        "A payment client times out and retries POST /charge. How do you prevent a double charge?",
      correct:
        "Require an idempotency key; the server records it and returns the original result for any retry with the same key",
      wrong: [
        "Make the client wait longer before retrying",
        "Use a GET instead of a POST",
        "Add a database index on the charges table",
      ],
      explanation:
        "Networks make 'did my write succeed?' unanswerable to the client, so it retries — and a naive POST charges twice. An idempotency key (a client-generated unique id sent with the request) lets the server detect the duplicate: first time it processes and stores the outcome under that key; retries return the stored outcome without re-charging. It's the same at-least-once → dedupe-at-the-consumer idea as idempotent queue workers, applied at the API edge.",
      docRef: DOC,
    });
  },
};

export const systemDesignTopic: Topic = {
  id: "system-design",
  title: "System Design",
  icon: "🏛️",
  blurb: "Caching, load balancing, DB scaling & sharding, CAP, queues, rate limiting, CDNs, consistent hashing, and capacity estimation.",
  docSlug: "system-design-fundamentals",
  docTitle: "System Design — fundamentals",
  generators: [
    caching,
    loadBalancing,
    dbScaling,
    capTheorem,
    consistency,
    messageQueue,
    rateLimiting,
    cdn,
    consistentHashing,
    sqlVsNosql,
    singlePointOfFailure,
    idempotentApi,
    qpsEstimation,
    storageEstimation,
  ],
};
