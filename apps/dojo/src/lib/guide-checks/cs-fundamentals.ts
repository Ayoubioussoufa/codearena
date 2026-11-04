/**
 * Checks for content/supplements/cs-fundamentals.md.
 * Checked 3 Nov 2026: Postgres isolation table (postgresql.org), OSTEP's chapters.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const csFundamentalsChecks: GuideCheckSet = {
  name: "CS Fundamentals guide",
  source: {
    label: "Operating Systems: Three Easy Pieces (free)",
    href: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
    note: "The standard free OS textbook: read chapters 26–28 (threads, locks) and 32 (concurrency bugs) for §1, the virtualization chapters for §2. For §4, Postgres's [isolation page](https://www.postgresql.org/docs/current/transaction-iso.html).",
  },
  terms: [
    "Process",
    "Thread",
    "Race condition",
    "Deadlock",
    "Page fault",
    "Thrashing",
    "Three-way handshake",
    "Normalization",
    "Isolation level",
    "Big-O",
  ],
  checks: [
    {
      id: "concurrency",
      section: "§1 · Processes and threads",
      questions: [
        {
          prompt: "Two threads each run `count++` once, starting at 0, and the result is 1. Why?",
          options: [
            "One thread never ran: the other monopolised the CPU",
            "count++ is read, add, write, and the steps interleaved",
            "The compiler merged the two increments into one write",
            "Threads copy count, so the second copy was discarded",
          ],
          correct: 1,
          why: "`count++` is three steps. Both threads read 0 before either wrote, so both wrote 1: a lost update. Fixes: a lock around the critical section, an atomic increment, or not sharing the data at all (a queue).",
        },
        {
          prompt: "Thread A holds account 1 and wants 2; thread B holds 2 and wants 1. What's the standard fix?",
          options: [
            "Give one of the threads a higher priority",
            "Add a short sleep before taking each lock",
            "Run both threads on one shared CPU core",
            "Always take the locks in one fixed order",
          ],
          correct: 3,
          why: "Deadlock needs all four Coffman conditions; breaking circular wait is the practical fix: every thread locks the lower-numbered account first, so no cycle can form. `tryLock` with a timeout (breaking hold-and-wait) is the other option.",
        },
        {
          prompt: "Node.js runs your code on one thread. Is it concurrent, parallel, or both?",
          options: [
            "Concurrent, not parallel: one thread juggles the tasks",
            "Parallel, not concurrent: it runs everything at once",
            "Both: the event loop spreads across every core",
            "Neither, since a single thread does one thing",
          ],
          correct: 0,
          why: "Concurrency is structuring work so many tasks progress by taking turns; parallelism is doing things at the same instant on several cores. Node's event loop juggles thousands of waiting requests on one thread: concurrent, not parallel.",
        },
      ],
      explain: "Tell the lost-increment story step by step, then give the three fixes in the order you'd offer them, with CodeArena's queue as the third.",
    },
    {
      id: "memory",
      section: "§2 · Memory and scheduling",
      questions: [
        {
          prompt: "A recursive function crashes on deep inputs while the loop version works. Which error, and why?",
          options: [
            "Out of memory: each call copies the heap",
            "A page fault: recursion skips the page table",
            "A stack overflow: each call adds a frame",
            "A deadlock: each call waits for the last",
          ],
          correct: 2,
          why: "Every call pushes a stack frame, and the stack is small (around 1 MB for a Java thread). Recurse 100,000 deep and it overflows; a loop reuses one frame. Out of memory means the heap, where objects you create live, filled up.",
        },
        {
          prompt: "CPU usage is low, the disk is saturated and throughput has collapsed. What's the diagnosis?",
          options: [
            "A CPU-bound loop starving all the other work",
            "A deadlock between the database and the disk",
            "Thrashing: pages keep being swapped in and out",
            "A memory leak that nobody has noticed yet",
          ],
          correct: 2,
          why: "Thrashing: the programs want more pages than RAM holds, so every fetch evicts a page someone needs next, and the machine spends its time shuttling pages. The CPU waits, the disk screams. Fixes: more RAM, fewer processes, less memory per process.",
        },
      ],
      explain: "Explain virtual memory with the desk-and-warehouse picture: what a page fault is, why it's normal, and when it turns into thrashing.",
    },
    {
      id: "networking",
      section: "§3 · Networking",
      questions: [
        {
          prompt: "Why does TCP's handshake take three messages, not two?",
          options: [
            "The server must learn the client can receive too",
            "The third message carries the first byte of data",
            "Two messages would let a SYN flood go undetected",
            "The third message picks the port for the session",
          ],
          correct: 0,
          why: "After SYN and SYN-ACK, the client knows both directions work, but the server doesn't yet know its own message was heard. The final ACK closes that gap: three is the minimum for both sides to know the other can send and receive.",
        },
        {
          prompt: "You type a URL. In what order do these happen?",
          options: [
            "TCP, then DNS, then TLS, then HTTP",
            "DNS, then TLS, then TCP, then HTTP",
            "TLS, then DNS, then TCP, then HTTP",
            "DNS, then TCP, then TLS, then HTTP",
          ],
          correct: 3,
          why: "Each step needs the one before: you can't connect without an IP (DNS), can't secure without a connection (TCP), and can't send the request without the secure channel (TLS). Derive the order instead of memorizing it.",
        },
        {
          prompt: "A live video call drops a packet. Which transport fits, and why?",
          options: [
            "TCP, because every frame must arrive in order",
            "UDP, because a late frame is worthless anyway",
            "TCP, because UDP cannot carry any video data",
            "UDP, because it encrypts the stream by default",
          ],
          correct: 1,
          why: "When freshness beats completeness, use UDP: resending a stale frame only adds delay. When every byte must arrive in order (pages, files, your judge's results), use TCP. UDP encrypts nothing by itself.",
        },
      ],
      explain: "Explain why a client can safely retry a timed-out PUT but not a POST, and how an idempotency key fixes the POST.",
    },
    {
      id: "databases",
      section: "§4 · Databases",
      questions: [
        {
          prompt: "Every order row copies the customer's address. The customer moves. What's the problem called?",
          options: [
            "An update anomaly: many rows must change together",
            "A dirty read: another transaction sees old data",
            "A phantom: new rows appear in range queries",
            "A deadlock: two updates wait on each other",
          ],
          correct: 0,
          why: "Duplicated facts drift: miss one of 500 rows and the data disagrees with itself. Normalization stores the address once in `customers`, with orders pointing at it. Denormalizing on purpose for read speed is a trade-off you name.",
        },
        {
          prompt: "An index exists on `(a, b)`. Which query can't use it efficiently?",
          options: [
            "Filtering on a alone, with no b",
            "Filtering on both a and b together",
            "Filtering on b alone, with no a",
            "Filtering on a, then sorting by b",
          ],
          correct: 2,
          why: "The index is sorted by `a`, then by `b` within each `a`, like a phone book by last name then first name. Fixing `a` (alone or with `b`) uses it; searching by `b` alone means scattered entries. That's the leftmost-prefix rule.",
        },
        {
          prompt: "In Postgres, what can still go wrong at the repeatable read level?",
          options: [
            "A dirty read of uncommitted data from elsewhere",
            "A serialization anomaly, such as a write skew",
            "A phantom row appearing in a repeated query",
            "A non-repeatable read of the very same row",
          ],
          correct: 1,
          why: "Postgres's repeatable read prevents dirty reads, non-repeatable reads and (unlike the SQL standard's minimum) phantoms. What it still allows is a serialization anomaly like write skew; only serializable stops those ([Postgres docs](https://www.postgresql.org/docs/current/transaction-iso.html)).",
        },
      ],
      explain: "Explain ACID in four sentences, then show a non-repeatable read with a two-transaction timeline.",
    },
    {
      id: "design",
      section: "§5 · OOP and design",
      questions: [
        {
          prompt: "\"I can't unit-test this service without a real database.\" Which SOLID letter is broken?",
          options: [
            "S: the service has several reasons to change",
            "L: a subclass breaks the contract it inherits",
            "I: its interface has far too many methods",
            "D: it builds its own dependency right inside",
          ],
          correct: 3,
          why: "Dependency inversion: business logic that does `new PostgresUserRepo()` is welded to Postgres. Depend on a `UserRepo` interface and inject the real one from outside; that's why NestJS and Spring have DI containers.",
        },
        {
          prompt: "A `switch (language)` gains a new case every time you add a runner. What's the fix?",
          options: [
            "A bigger switch with a default case added",
            "A new class implementing Runner for each language",
            "A base class that each runner must inherit",
            "A config file that lists every supported language",
          ],
          correct: 1,
          why: "That's the open/closed principle: open to extension, closed to modification. Each language becomes a class implementing `Runner`, and polymorphism picks the right one, so adding Go never touches existing code.",
        },
      ],
      explain: "Explain \"prefer composition over inheritance\" with the `Contest` and `TimingPolicy` example.",
    },
    {
      id: "bigo",
      section: "§6 · Complexity",
      questions: [
        {
          prompt: "A loop inside a loop, where the inner one starts at `i + 1`. What's the complexity?",
          options: [
            "O(n log n), because the inner loop shrinks",
            "O(n), since each pair is visited only once",
            "O(log n), since the work halves each round",
            "O(n²), since Big-O drops the constant of ½",
          ],
          correct: 3,
          why: "The inner loop runs n−1, n−2, … times: about n²/2 steps in total, and Big-O drops the constant ½. Halving the problem each step is what gives O(log n); shrinking by one each step doesn't.",
        },
        {
          prompt: "A hash map lookup is O(1) on average. When does it degrade to O(n)?",
          options: [
            "When every key collides into the same bucket",
            "When the map holds over a million entries",
            "When the keys are strings rather than numbers",
            "When two threads read the same map together",
          ],
          correct: 0,
          why: "All keys in one bucket turn a lookup into a scan of that bucket. Ask \"could an adversary force the worst case?\". Java 8+ turns huge buckets into trees, so that case becomes O(log n).",
        },
      ],
      explain: "Derive the complexity of \"sort the list, then scan it once\" and explain the rule for steps in sequence versus steps nested inside each other.",
    },
  ],
};
