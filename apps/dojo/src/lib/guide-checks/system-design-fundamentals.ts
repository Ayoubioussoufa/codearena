/**
 * Checks for the System Design Fundamentals guide
 * (content/supplements/system-design-fundamentals.md), which follows the
 * System Design Primer's structure. Checked on 3 Nov 2026: the nines table and
 * latency ladder (arithmetic), ZREVRANGE's deprecation (redis.io), the
 * primer's sections.
 */
import type { GuideCheckSet } from "./types";

export const systemDesignChecks: GuideCheckSet = {
  name: "System Design guide",
  source: {
    label: "The System Design Primer",
    href: "https://github.com/donnemartin/system-design-primer",
    note: "Free, and the backbone this guide follows: read its topic sections (performance vs scalability through asynchronism and communication), then try its worked interview questions.",
  },
  terms: [
    "Latency",
    "Stateless service",
    "Single point of failure",
    "Cache-aside",
    "Replication lag",
    "Sharding",
    "CAP theorem",
    "Back pressure",
    "Consistent hashing",
    "Idempotency key",
  ],
  checks: [
    {
      id: "framework",
      section: "§0 to estimation · The method",
      questions: [
        {
          prompt: "10 million daily users make 10 requests each. Roughly what is the average QPS?",
          options: ["About 100 requests per second", "About 1,000 requests per second", "About 10,000 requests per second", "About 100,000 requests per second"],
          correct: 1,
          why: "100 million requests a day, and a day is about 100,000 seconds (86,400 rounded), so about 1,000 QPS on average. Plan for the peak, 2 to 5 times that: roughly 3,000 to 5,000 QPS.",
        },
        {
          prompt: "You've sketched the happy path (client → load balancer → app → database). What does the framework say to do next?",
          options: [
            "Add a cache, replicas and shards all at once",
            "Rewrite the happy path as a set of microservices",
            "Name the bottleneck, apply one tool, and then repeat",
            "Pick the database first, then fit the rest around",
          ],
          correct: 2,
          why: "Each tool relieves one specific pressure: reads too high → cache, then replicas; writes or storage too high → shard; far-away users → CDN. Name the pressure, apply one tool, ask \"what breaks next?\". Bolting on five at once shows you don't know which pressure each one fixes.",
        },
      ],
      explain:
        "Run the five-step framework on \"design CodeArena's judge\", two sentences per step, and end with the trade-off you'd name.",
    },
    {
      id: "latency",
      section: "Latency numbers and nines",
      questions: [
        {
          prompt: "From memory: how much faster is a read from RAM than a hard-disk seek?",
          options: ["Five orders of magnitude", "Two orders of magnitude", "Three orders of magnitude", "Seven orders of magnitude"],
          correct: 0,
          why: "RAM is about 100 ns, a disk seek about 10 ms: 100,000 times, five orders of magnitude. That gap is the entire reason caches exist. Memory is nanoseconds, SSD microseconds, disk and cross-continent network milliseconds.",
        },
        {
          prompt: "A request must pass through two components in series, each 99.9% available. What's the overall availability?",
          options: [
            "99.9%: both still meet their targets",
            "99.95%: halfway between the two figures",
            "99.9999%: both would need to fail",
            "99.8%: in series, the uptimes multiply",
          ],
          correct: 3,
          why: "In series the request needs both to be up: 0.999 × 0.999 ≈ 99.8%. Every extra synchronous hop subtracts reliability, which is the argument against long chains of service calls.",
        },
        {
          prompt: "Two 99.9% servers run in parallel, and either one can serve alone. What's the overall availability?",
          options: [
            "99.8%: in series, the uptimes multiply",
            "99.9999%: only both failing breaks it",
            "99.9%: the weakest component sets it",
            "99.95%: redundancy adds half a nine",
          ],
          correct: 1,
          why: "In parallel it fails only if both fail: the failure chances multiply, 1 − (0.001 × 0.001) = 99.9999%. Two three-nines boxes give six nines. That's the whole point of running two of everything.",
        },
      ],
      explain:
        "Explain why redundancy in parallel buys nines while components in series lose them, with the numbers for two 99.9% components.",
    },
    {
      id: "caching",
      section: "Caching and cache update patterns",
      questions: [
        {
          prompt: "Which cache update pattern can lose data if the cache node dies?",
          options: [
            "Write-through, since each write waits for the DB",
            "Cache-aside, since the app fills it on misses",
            "Write-behind, since writes reach the DB only later",
            "Refresh-ahead, as it reloads keys before they expire",
          ],
          correct: 2,
          why: "Write-behind acknowledges the write once it's in the cache and flushes to the database asynchronously, so a cache crash before the flush loses it. Write-through pays for safety with slower writes; cache-aside only ever caches copies of what's already in the database.",
        },
        {
          prompt: "A hot key expires and thousands of requests miss at once, all hitting the database. What is it, and one fix?",
          options: [
            "A stampede: let a single request refill it",
            "A partition: route the traffic to a replica",
            "A hot shard: split the key across nodes",
            "A cold start: preload every key at deploy",
          ],
          correct: 0,
          why: "A cache stampede. Fixes: a single-flight lock (one request refills, the others wait), jitter on expiry times so hot keys don't expire together, or serve the stale value while one request refreshes it in the background.",
        },
      ],
      explain:
        "Explain cache-aside, the invalidation problem and the stampede, with one fix for the stampede, using CodeArena's problem pages as the example.",
    },
    {
      id: "scaling",
      section: "Load balancing and scaling the database",
      questions: [
        {
          prompt: "Your app servers are stateless. Where does \"who's logged in\" live?",
          options: [
            "In the memory of the server they logged into",
            "In a cookie the load balancer reads and rewrites",
            "In the database, which is queried on every request",
            "In a shared store, or a token clients carry",
          ],
          correct: 3,
          why: "Stateless means no request depends on which server handled the last one, so session state lives in a shared store (Redis) or a signed token the client sends each time. Then you can add, remove or lose servers freely: the enabler of horizontal scaling.",
        },
        {
          prompt: "A user saves an edit, reloads at once, and sees the old value. Most likely cause?",
          options: [
            "The cache returned an outdated copy of it",
            "A read replica was behind: that's replication lag",
            "The write failed, and the client never noticed",
            "The browser restored the form from its history",
          ],
          correct: 1,
          why: "The write went to the primary, the reload was served by a replica a moment behind. The fix is read-your-writes: route that user's reads to the primary for a short while after they write.",
        },
        {
          prompt: "Writes and storage have outgrown one database, and a bigger machine is no longer enough. Which tool?",
          options: [
            "Shard on a key that spreads load evenly",
            "Add read replicas until the writes keep up",
            "Buy a bigger machine each time writes double",
            "Cache every write in Redis before the database",
          ],
          correct: 0,
          why: "Replicas for reads, shards for writes: replicas copy every write, so they don't reduce write load. Sharding splits the data so each database takes a slice. The shard key decides everything: a bad one creates a hot shard, and cross-shard joins get hard.",
        },
      ],
      explain:
        "Replicas or shards? For each, say which pressure it relieves, its main catch, and a CodeArena situation that would call for it.",
    },
    {
      id: "consistency",
      section: "CAP, consistency and availability patterns",
      questions: [
        {
          prompt: "A bank ledger, during a network partition. Which choice, and why?",
          options: [
            "AP: stay available, and reconcile the balances later",
            "Both: a ledger can be consistent and available",
            "CP: refuse service rather than show two balances",
            "Neither: pause every write until the partition ends",
          ],
          correct: 2,
          why: "During a partition you choose consistency or availability; you can't have both, and partitions will happen. For money, refusing service for a moment beats showing two different balances. A social feed makes the opposite choice.",
        },
        {
          prompt: "DNS and email are classic examples of which consistency level?",
          options: [
            "Strong, because the data is replicated synchronously",
            "Weak, because missed updates are simply skipped",
            "Causal, because related writes arrive in order",
            "Eventual, since changes reach each copy asynchronously",
          ],
          correct: 3,
          why: "Eventual: after a write, reads will see it soon, once replication finishes asynchronously. Weak is best-effort (live video, games: a missed frame is skipped); strong replicates synchronously before the write returns (databases, money). Weak = maybe, eventual = soon, strong = now.",
        },
        {
          prompt: "Active-passive failover: the active server accepts a write, then dies before replicating it. What's lost?",
          options: [
            "Nothing: the standby replays it from the client",
            "That one write, accepted but not yet replicated",
            "Every write made since the last nightly backup",
            "The connection, but the write survives on disk",
          ],
          correct: 1,
          why: "That's the data-loss window of failover: the standby only has what was replicated before the crash. Naming this window, and how synchronous replication closes it at the cost of write latency, is a senior-level point.",
        },
      ],
      explain:
        "State the CAP theorem precisely (what you choose, and when), then place CodeArena's submission records and its leaderboard on it.",
    },
    {
      id: "queues",
      section: "Queues and back pressure",
      questions: [
        {
          prompt: "Why must queue workers be idempotent?",
          options: [
            "Delivery is at-least-once, so a job can run twice",
            "Workers run in parallel and need to share locks",
            "Queues reorder jobs, so each one must be atomic",
            "Retries are forbidden, so each run must always succeed",
          ],
          correct: 0,
          why: "To survive crashes, a queue redelivers a job that wasn't acknowledged, so occasionally a job runs twice. Idempotent workers make the second run a no-op: key each job by an id and skip one you've already handled.",
        },
        {
          prompt: "Work arrives faster than the workers can drain it. What does back pressure do?",
          options: [
            "It adds more workers until the backlog is gone",
            "It stores the overflow on disk to run later",
            "It caps the queue, rejecting new work with 503",
            "It slows every producer down by the same amount",
          ],
          correct: 2,
          why: "An unbounded queue is a slow-motion outage: it outgrows memory and drags everything down. Back pressure bounds it: once full, new requests are rejected fast (503, \"try later\") so queued work keeps flowing, and clients retry with exponential backoff.",
        },
      ],
      explain:
        "Explain at-least-once delivery, why it forces idempotent workers, and how back pressure stops a queue from becoming an outage.",
    },
    {
      id: "apis",
      section: "Rate limiting, communication, CDNs, hashing",
      questions: [
        {
          prompt: "Why is the token bucket the favourite rate-limiting answer over a fixed window?",
          options: [
            "It's simpler, since it needs one counter per key",
            "It never allows any client to make a burst",
            "It needs no shared state across all the servers",
            "It caps the sustained rate but allows short bursts",
          ],
          correct: 3,
          why: "Tokens refill at a steady rate, so the sustained rate is capped, while a full bucket allows a short burst, which matches real usage. A fixed window is simpler but allows about 2× at the boundary (100 at 11:59:59 plus 100 at 12:00:01).",
        },
        {
          prompt: "A client times out on `POST /charge` and retries. What makes the retry safe?",
          options: [
            "Backing off exponentially before each new retry",
            "An idempotency key the server deduplicates on",
            "Switching the request's method to GET instead",
            "A longer timeout, letting the call finish",
          ],
          correct: 1,
          why: "POST isn't idempotent: sending it twice may charge twice. The client sends a unique key with the request; the server records it and returns the first result for any repeat. Backoff only spaces the retries out; it doesn't make them safe.",
        },
        {
          prompt: "Keys are spread with `hash(key) % N`, and you add one cache server. What happens?",
          options: [
            "Only the new server's share of keys moves",
            "Nothing moves, since the hash stays the same",
            "Nearly every key remaps: a cache miss storm",
            "Roughly half the keys move, picked at random",
          ],
          correct: 2,
          why: "N changed, so almost every key maps to a different server, and the whole cache misses at once. Consistent hashing places servers and keys on a ring, so adding a server moves only about 1/N of the keys (its neighbours'); virtual nodes keep the spread even.",
        },
      ],
      explain:
        "Explain consistent hashing to an interviewer: the problem with `hash(key) % N`, the ring, and why virtual nodes exist.",
    },
    {
      id: "designs",
      section: "The worked designs",
      questions: [
        {
          prompt: "In the judge design, why does the API save the submission row before enqueueing the job?",
          options: [
            "So work is never lost: the row is the truth",
            "So the worker can read the code from the queue",
            "So the API can return the final verdict right away",
            "So the queue can delete each job once it finishes",
          ],
          correct: 0,
          why: "The database row is the source of truth and the queue is just a delivery belt. Enqueue first and crash before the insert, and a worker chases a submission that doesn't exist; insert first, and a lost job can be found and re-enqueued.",
        },
        {
          prompt: "News feed: a celebrity with 50 million followers posts. What's the standard design answer?",
          options: [
            "Push to every follower, then drop the slow ones",
            "Pull for everyone, caching each feed for a day",
            "Give each celebrity their own shard of the database",
            "Push for most accounts; pull celebrities at read time",
          ],
          correct: 3,
          why: "Fan-out on write gives O(1) reads but means 50 million writes for one post; fan-out on read is cheap to write but expensive to read. The hybrid pushes for normal accounts and merges celebrities' posts in at read time.",
        },
        {
          prompt: "Your rate limiter keeps its counters in Redis, and Redis goes down. For a payments endpoint, what do you choose?",
          options: [
            "Fail open: allow all traffic and send an alert",
            "Fail open: switch to an in-memory counter per server",
            "Fail closed: reject the traffic rather than risk abuse",
            "Fail closed: queue every request until Redis comes back",
          ],
          correct: 2,
          why: "Fail open favours availability (a public API, with an alert); fail closed favours protection (payments). There's no universal answer, only a named trade-off. Per-server counters silently multiply the limit by the number of servers.",
        },
      ],
      explain:
        "Run the judge design's follow-up gauntlet out loud: a worker dies mid-job, the queue backs up during a contest, and someone submits a fork bomb.",
    },
  ],
};
