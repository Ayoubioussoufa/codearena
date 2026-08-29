/**
 * Topic: CS Fundamentals — the rapid-fire technical round at Deloitte,
 * Capgemini, Accenture, TCS, etc.: OS, networking, DBMS, OOP, and complexity.
 * Interview bar per answer: definition + one concrete example + one trade-off.
 */
import { choice } from "../helpers";
import type { Generator, Topic } from "../types";

const DOC = { slug: "cs-fundamentals", label: "CS Fundamentals — the rapid-fire layer" };

const processThread: Generator = {
  id: "cs-process-thread",
  title: "Processes vs threads",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "cs-process-thread",
        prompt: "What is the core difference between a process and a thread?",
        correct:
          "A process has its own isolated memory space; threads within a process share that memory",
        wrong: [
          "Threads have their own memory space; processes share memory",
          "A process is just a thread with higher CPU priority",
          "Threads run only on separate CPU cores; processes time-share one core",
        ],
        explanation:
          "The OS gives each PROCESS an isolated virtual address space — one crashing or corrupting memory can't scribble over another. THREADS live inside a process and share its heap and globals (each keeps its own stack and registers), which makes them cheap to create and fast to communicate — and also why race conditions exist. Interview follow-up to expect: 'so when would you pick processes over threads?' — isolation and fault containment vs. cheap shared-memory concurrency.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "cs-process-thread",
        prompt: "Two threads of the same process — what do they share, and what stays private?",
        correct: "Shared: heap, global variables, open files. Private: stack and registers",
        wrong: [
          "Shared: stack and registers. Private: heap and globals",
          "They share everything, including the stack",
          "They share nothing unless shared memory is explicitly configured",
        ],
        explanation:
          "Each thread needs its own execution state — a call stack and CPU registers — or two threads couldn't run different functions at once. Everything else in the process (heap allocations, globals, file descriptors) is common property. That shared heap is both the feature (zero-copy communication) and the hazard: two threads mutating one structure without synchronization is the definition of a data race. This 'what's shared' list is a verbatim services-firm interview question.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "cs-process-thread",
      prompt: "Why are context switches between processes more expensive than between threads of one process?",
      correct:
        "Switching processes changes the memory mappings (and flushes cached translations); threads keep the same address space",
      wrong: [
        "Processes always run on different CPU cores, so data must cross cores",
        "The OS must write the whole process's memory to disk on each switch",
        "Thread switches skip saving CPU registers entirely",
      ],
      explanation:
        "Every switch saves and restores registers — that part is equal. The extra process cost is the ADDRESS SPACE change: new page-table mappings, and the TLB (the cache of virtual→physical translations) losing its useful entries, so the next instructions eat cache misses. Same-process threads keep the mappings, so the switch is lighter. Nobody writes memory to disk on a switch — that confusion with swapping is the planted trap.",
      docRef: DOC,
    });
  },
};

const deadlock: Generator = {
  id: "cs-deadlock",
  title: "Deadlock",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "cs-deadlock",
        prompt: "Which four conditions must ALL hold for a deadlock to occur?",
        correct: "Mutual exclusion, hold-and-wait, no preemption, circular wait",
        wrong: [
          "Starvation, livelock, priority inversion, race condition",
          "Mutual exclusion, preemption, aging, circular wait",
          "Hold-and-wait, busy waiting, thrashing, mutual exclusion",
        ],
        explanation:
          "The four Coffman conditions: resources are exclusive (mutual exclusion), a holder can request more while keeping what it has (hold-and-wait), resources can't be forcibly taken (no preemption), and the waiters form a cycle (circular wait). Break ANY one and deadlock is impossible — which is exactly how prevention works. The wrong options mix in related-but-different pathologies (starvation, livelock, thrashing) that interviewers love to see you distinguish.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "cs-deadlock",
        prompt:
          "Transaction A locks row 1 then wants row 2; transaction B locks row 2 then wants row 1. Simplest prevention?",
        correct: "Impose a global lock ORDER — everyone acquires row 1 before row 2",
        wrong: [
          "Give both transactions higher priority",
          "Add more database connections to the pool",
          "Retry each lock in a tight loop until it succeeds",
        ],
        explanation:
          "A fixed global ordering on lock acquisition makes a circular wait impossible — cycles need someone locking 'backwards'. This is the standard practical answer in both OS and database contexts (and in your own code when taking two mutexes). Priorities don't remove the cycle, extra connections add more potential waiters, and retry loops on held locks are how you convert deadlock into livelock plus a hot CPU.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "cs-deadlock",
      prompt: "What's the difference between deadlock and starvation?",
      correct:
        "Deadlock: a cycle of waiters where nobody CAN proceed. Starvation: a task COULD proceed but keeps losing scheduling/resources to others",
      wrong: [
        "They are two names for the same situation",
        "Starvation is a deadlock involving more than two threads",
        "Deadlock affects only threads; starvation only affects processes",
      ],
      explanation:
        "In deadlock, progress is impossible without outside intervention — the waiting graph has a cycle. In starvation, the system as a whole is fine, but an unlucky task is perpetually postponed (e.g. a low-priority thread under strict priority scheduling, or a writer starved by a stream of readers). Fixes differ too: deadlock needs prevention/detection; starvation needs fairness — aging, FIFO queues. Crisp one-line contrasts like this are what fundamentals rounds grade.",
      docRef: DOC,
    });
  },
};

const memoryPaging: Generator = {
  id: "cs-memory-paging",
  title: "Virtual memory & paging",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "cs-memory-paging",
        prompt: "What does virtual memory actually give each process?",
        correct:
          "Its own private address space, mapped page-by-page to physical RAM (or disk) by the OS and hardware",
        wrong: [
          "Extra physical RAM chips allocated on demand",
          "A guarantee that the process never touches disk",
          "Direct access to physical addresses, but with bounds checking",
        ],
        explanation:
          "Virtual memory is an indirection layer: every process sees a clean private address range, and the MMU (the memory-management hardware) translates its pages to wherever they really live — scattered RAM frames, or swapped out on disk. That indirection buys isolation (processes can't address each other), overcommit (address space larger than RAM), and simple program loading. It manufactures no new RAM; it manages the illusion. This definition-plus-what-it-buys is the expected interview shape.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "cs-memory-paging",
        prompt: "What happens on a page fault?",
        correct:
          "The accessed page isn't in RAM; the OS pauses the process, loads the page (possibly evicting another), then resumes",
        wrong: [
          "The process is killed for an illegal memory access",
          "The CPU cache is flushed and the instruction retried",
          "The OS permanently moves the process to swap",
        ],
        explanation:
          "A page fault is routine, not fatal: the translation says 'not present', the OS fetches the page from disk into a frame (evicting an old page — usually the least-recently-used — if RAM is full), updates the page table, and re-runs the faulting instruction. Only an access to memory you were never given (a SEGFAULT) kills the process — distinguishing 'page fault' from 'segmentation fault' is precisely the trap this question sets in interviews.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "cs-memory-paging",
      prompt: "A server's CPU usage looks low but the disk is screaming and every request crawls. Memory is oversubscribed. This is likely…",
      correct: "Thrashing — the system spends its time swapping pages in and out instead of doing work",
      wrong: [
        "A deadlock between I/O-bound threads",
        "CPU cache poisoning from context switches",
        "A memory leak in the kernel",
      ],
      explanation:
        "When the working sets of the running processes exceed physical RAM, each process's next touch evicts pages another process needs imminently: constant page faults, disk saturated, CPU idle-waiting. That signature — low CPU + frantic disk + collapsing throughput — is thrashing. Remedies: add RAM, reduce concurrency (admit fewer processes), or shrink working sets. Recognizing a pathology from symptoms, not just defining it, is the senior version of this question.",
      docRef: DOC,
    });
  },
};

const tcpUdp: Generator = {
  id: "cs-tcp-udp",
  title: "TCP vs UDP",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "cs-tcp-udp",
        prompt: "Which guarantees does TCP add over UDP?",
        correct: "Reliable delivery, in-order bytes, and congestion/flow control over an established connection",
        wrong: [
          "Encryption and authentication of every packet",
          "Lower latency and smaller headers",
          "Guaranteed identical routing for every packet",
        ],
        explanation:
          "TCP turns the lossy, unordered IP layer into a reliable ordered byte stream: sequence numbers + acknowledgements + retransmission give delivery and order; flow/congestion control keeps senders from drowning receivers and networks. It costs a handshake and buffering latency. Encryption is TLS's job on top, not TCP's — that conflation is the classic wrong answer. UDP keeps the raw datagram model: no promises, minimal overhead.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "cs-tcp-udp",
        prompt: "Live video calls and online-game state updates typically ride on UDP. Why?",
        correct:
          "A late retransmitted packet is worthless — better to drop and move on than stall the stream waiting for it",
        wrong: [
          "UDP packets are encrypted by default, which calls require",
          "UDP guarantees lower packet loss than TCP",
          "Firewalls block TCP for media traffic",
        ],
        explanation:
          "TCP's reliability is head-of-line blocking in disguise: one lost packet stalls everything behind it until retransmission arrives — and by then, that video frame is history. Real-time media prefers UDP and handles loss at the application layer (skip the frame, interpolate the game state). Same logic drives DNS's single-packet queries. The rule: when FRESHNESS beats COMPLETENESS, UDP; when every byte must arrive in order (files, web pages, your judge results), TCP.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "cs-tcp-udp",
      prompt: "Order the TCP three-way handshake correctly:",
      correct: "Client sends SYN → server replies SYN-ACK → client replies ACK",
      wrong: [
        "Client sends ACK → server replies SYN → client replies SYN-ACK",
        "Client sends SYN → server replies ACK → server sends SYN",
        "Both sides send FIN simultaneously, then exchange ACKs",
      ],
      explanation:
        "SYN, SYN-ACK, ACK: each side proposes a starting sequence number and hears it acknowledged — after three segments both know the other can send AND receive. It's the minimum for two parties to agree over an unreliable channel. FIN packets belong to teardown, not setup (that's the decoy). Follow-ups interviewers reach for: why not two-way (server's sequence number would go unacknowledged) and what a SYN flood abuses (half-open connections).",
      docRef: DOC,
    });
  },
};

const urlJourney: Generator = {
  id: "cs-url-journey",
  title: "What happens when you type a URL",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "cs-url-journey",
        prompt: "You hit Enter on https://example.com. What is the correct order of the main steps?",
        correct: "DNS lookup → TCP handshake → TLS handshake → HTTP request → response rendered",
        wrong: [
          "TCP handshake → DNS lookup → HTTP request → TLS handshake → response rendered",
          "TLS handshake → DNS lookup → TCP handshake → HTTP request → response rendered",
          "HTTP request → DNS lookup → TCP handshake → response rendered → TLS handshake",
        ],
        explanation:
          "You can't connect before you know the address (DNS first), can't encrypt before you have a connection (TCP before TLS), and can't request before the encrypted channel exists (TLS before HTTP). Each layer stands on the previous one — that dependency chain IS the answer, so derive it rather than memorize it. This is the single most-asked networking question at services firms; being able to expand any step on demand (caching layers, certificate validation) is what earns the follow-up points.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "cs-url-journey",
        prompt: "What does DNS actually do, and where might the answer come from before any DNS server is asked?",
        correct:
          "Resolves a hostname to an IP address — often answered from browser/OS caches before any query leaves the machine",
        wrong: [
          "Encrypts the hostname so ISPs can't see it — answered by the certificate authority",
          "Routes packets to the server — answered by the nearest router",
          "Verifies the site's TLS certificate — answered by the browser vendor",
        ],
        explanation:
          "DNS is the internet's phone book: example.com → 93.184.216.34. Resolution walks a cache hierarchy — browser cache, OS cache, resolver cache — before ever hitting the recursive resolver and, rarely, the root/TLD/authoritative chain. Caching (with TTLs) is why the system scales and why 'DNS propagation' takes time. Routing is IP's job and certificates are TLS's — keeping the layers' responsibilities separate is exactly what this question probes.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "cs-url-journey",
      prompt: "HTTPS is best described as…",
      correct: "HTTP running over a TLS-encrypted channel, adding confidentiality, integrity, and server authentication",
      wrong: [
        "A faster binary version of HTTP",
        "HTTP with password protection on every page",
        "A different transport protocol replacing TCP",
      ],
      explanation:
        "HTTPS isn't a new protocol — it's plain HTTP tunneled through TLS. TLS contributes three things: encryption (eavesdroppers see noise), integrity (tampering is detected), and authentication (the certificate proves you're talking to the real example.com). The 'faster binary' decoy describes HTTP/2, which is orthogonal to TLS. Being able to name the three TLS properties separately is the difference between a pass and an impress in this rapid-fire round.",
      docRef: DOC,
    });
  },
};

const dbmsKeys: Generator = {
  id: "cs-dbms-keys",
  title: "Keys & normalization",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "cs-dbms-keys",
        prompt: "Primary key vs foreign key — which statement is correct?",
        correct:
          "A primary key uniquely identifies rows in its own table; a foreign key references a primary key in another table to link them",
        wrong: [
          "A foreign key uniquely identifies rows; a primary key links tables",
          "A table may have many primary keys but only one foreign key",
          "Foreign keys automatically create an index and a primary key on the referenced table",
        ],
        explanation:
          "Primary key = identity within the table: unique, non-null, one per table (possibly composite). Foreign key = relationship across tables: its values must exist in the referenced primary key (referential integrity), and one table can hold many of them. Worth volunteering in interviews: most databases auto-index primary keys but NOT foreign keys — forgetting the FK index is a classic real-world join-performance bug (and a great segue to your Prisma schema).",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "cs-dbms-keys",
        prompt: "What problem does database normalization primarily solve?",
        correct:
          "Redundant data and the update/insert/delete anomalies that redundancy causes",
        wrong: [
          "Slow queries, by adding indexes automatically",
          "Large databases, by compressing repeated values",
          "Concurrent access conflicts between transactions",
        ],
        explanation:
          "Normalization decomposes tables so each fact lives in exactly one place. With a customer's address copied onto every order row, changing it means updating N rows (update anomaly), you can't store a customer with no orders (insert anomaly), and deleting the last order deletes the customer (delete anomaly). Splitting into customers + orders kills all three. It's a data-INTEGRITY tool, not a performance tool — queries may even need more joins afterwards, which sets up the denormalization question.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "cs-dbms-keys",
      prompt: "When is deliberately DENORMALIZING (duplicating data) the right call?",
      correct:
        "Read-heavy paths where join cost hurts and slightly-stale or duplicated data is acceptable — e.g. a cached leaderboard or a materialized report",
      wrong: [
        "Whenever a table exceeds a million rows",
        "Always — normalization is only for exams",
        "When you need stronger consistency guarantees",
      ],
      explanation:
        "Denormalization trades integrity risk for read speed: precomputed aggregates, duplicated names on order rows, materialized views. It's justified when reads dominate, joins are the measured bottleneck, and the duplication has an owner keeping it in sync (triggers, event handlers, rebuild jobs). It WEAKENS consistency, never strengthens it — that inverted option is the trap. Your CodeArena leaderboard projection is a textbook example to cite: normalized submissions, denormalized read model.",
      docRef: DOC,
    });
  },
};

const sqlNosql: Generator = {
  id: "cs-sql-nosql",
  title: "SQL vs NoSQL",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    if (variant) {
      return choice(rng, {
        genId: "cs-sql-nosql",
        prompt: "Which workload most clearly favours a relational (SQL) database?",
        correct:
          "Orders, payments and inventory with multi-row invariants that must hold under concurrent writes",
        wrong: [
          "Session cache with expiring keys and no relationships",
          "Append-only click logs queried once a day in bulk",
          "A social feed duplicated per follower for fast reads",
        ],
        explanation:
          "Money and stock movements need ACID transactions spanning several rows (debit + credit + inventory decrement, all-or-nothing) and enforced relationships — the relational sweet spot. The other three are canonical non-relational fits: TTL'd key-value cache (Redis), bulk log analytics (columnar/object storage), and fan-out-on-write feeds (document/wide-column). The interview answer is never 'X is better' — it's matching guarantees to invariants.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "cs-sql-nosql",
      prompt: "A document database (like MongoDB) typically trades away what, in exchange for what?",
      correct:
        "Trades multi-document joins/transactions and schema enforcement for flexible schemas and easy horizontal scaling",
      wrong: [
        "Trades read speed for stronger consistency than SQL",
        "Trades durability for encryption",
        "Trades indexing support for smaller storage size",
      ],
      explanation:
        "Document stores co-locate a whole aggregate (order + its items) in one document: reads and writes of that aggregate are fast and shard cleanly across nodes. The cost appears when data is RELATIONAL after all — cross-document consistency, ad-hoc joins, schema drift across old documents. Modern stores blur edges (Mongo has transactions, Postgres has JSONB — often the pragmatic middle), but the trade-off framing is what interviewers listen for.",
      docRef: DOC,
    });
  },
};

const oopPillars: Generator = {
  id: "cs-oop-pillars",
  title: "OOP pillars",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "cs-oop-pillars",
        prompt: "Calling shape.area() and getting circle or rectangle math depending on the actual object is…",
        correct: "Polymorphism — one interface, many implementations chosen at runtime",
        wrong: [
          "Encapsulation — hiding the math inside the class",
          "Inheritance — circles inheriting from rectangles",
          "Abstraction — ignoring the shape's dimensions",
        ],
        explanation:
          "Polymorphism lets callers program against the INTERFACE (area()) while dispatch picks the right implementation from the runtime type — new shapes plug in without touching callers, which is the open/closed principle in action. Encapsulation (hiding internals) and abstraction (exposing only essentials) are involved in good design here, but the phenomenon named by 'same call, different behaviour by type' is polymorphism. Precise pillar-to-symptom matching is exactly what fundamentals rounds test.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "cs-oop-pillars",
        prompt: "Encapsulation, precisely, is…",
        correct:
          "Bundling data with the methods that operate on it, and restricting direct access to the internal state",
        wrong: [
          "Splitting a program into as many small files as possible",
          "Reusing a parent class's code in a child class",
          "Making every field public but documenting it well",
        ],
        explanation:
          "Encapsulation draws a boundary: state is private, and every mutation flows through methods that can enforce invariants (a `Rating` object that refuses negative values, an account that can't be overdrawn by direct field assignment). It's what makes refactoring internals safe — callers never depended on them. The 'reusing parent code' distractor is inheritance; the public-fields one is the opposite of the concept. One-line definition + one invariant example is the winning answer format.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "cs-oop-pillars",
      prompt: "Interface vs abstract class — the practical difference?",
      correct:
        "An interface declares a contract with no state; an abstract class can also carry fields and shared method implementations — and a class can implement many interfaces but extend one class",
      wrong: [
        "They are identical since interfaces got default methods",
        "Abstract classes can't have any implemented methods",
        "Interfaces are faster because they skip virtual dispatch",
      ],
      explanation:
        "Reach for an interface to say WHAT something does (Comparable, Repository) — pure contract, multiple implementable. Reach for an abstract class to share HOW — common fields and template methods for a family of subclasses, single inheritance. Default methods narrowed the gap but interfaces still hold no instance state. Bonus point in interviews: 'prefer composition over inheritance' — inject collaborators implementing interfaces rather than building deep class trees; it's how your NestJS services are wired.",
      docRef: DOC,
    });
  },
};

const solidQuick: Generator = {
  id: "cs-solid-quick",
  title: "SOLID in scenarios",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "cs-solid-quick",
        prompt:
          "A ReportService formats PDFs, sends emails, AND writes audit logs. Every unrelated change touches it. Which principle does it violate?",
        correct: "Single Responsibility — the class has three reasons to change",
        wrong: [
          "Liskov Substitution — subclasses can't replace it",
          "Dependency Inversion — it depends on abstractions",
          "Interface Segregation — its interface is too small",
        ],
        explanation:
          "SRP says one class, one reason to change. Formatting rules, mail-provider swaps, and audit requirements are three independent axes of change colliding in one file — the symptom is merge conflicts and fear-driven edits. The cure: split into PdfFormatter, EmailSender, AuditLogger and compose them. Diagnosing the principle FROM the symptom (rather than reciting definitions) is how SOLID questions are actually asked.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "cs-solid-quick",
        prompt:
          "Business logic constructs `new PostgresUserRepo()` directly, making it impossible to test without a database. Which principle is violated, and the fix?",
        correct: "Dependency Inversion — depend on a UserRepo interface and inject the Postgres implementation",
        wrong: [
          "Open/Closed — mark the class final so it can't change",
          "Single Responsibility — move the SQL into the controller",
          "Liskov Substitution — subclass PostgresUserRepo for tests",
        ],
        explanation:
          "DIP: high-level policy should depend on abstractions, with concrete details injected from outside. Program against a UserRepo port, hand the domain a Postgres adapter in production and an in-memory fake in tests — this is literally hexagonal architecture and what NestJS's DI container exists for, so cite your own codebase when answering. The subclass-for-tests option 'works' but couples tests to a concrete class — the interviewer is checking you know why injection is cleaner.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "cs-solid-quick",
      prompt:
        "A function takes Rectangle; passing the Square subclass (which forces width === height) breaks its resizing logic. Which principle is violated?",
      correct: "Liskov Substitution — a subtype must be usable wherever the base type is expected",
      wrong: [
        "Interface Segregation — Square implements too many methods",
        "Open/Closed — Rectangle should have been final",
        "Single Responsibility — resizing belongs elsewhere",
      ],
      explanation:
        "LSP is about behavioural substitutability: code holding a Rectangle may set width and height independently, and a Square that silently couples them breaks that expectation — inheritance modeled the WORDS ('a square is a rectangle') instead of the BEHAVIOUR. The classic fix is composition or separate types. This square/rectangle example is the most-asked LSP question in existence; know it cold, and know that the deeper lesson is 'inherit behaviour contracts, not vocabulary'.",
      docRef: DOC,
    });
  },
};

const complexitySpotting: Generator = {
  id: "cs-complexity-spotting",
  title: "Spot the complexity",
  generate: (rng) => {
    const variant = rng.int(0, 3);
    if (variant === 0) {
      return choice(rng, {
        genId: "cs-complexity-spotting",
        prompt: "What is the time complexity of this function?",
        code: "function f(arr) {\n  let sum = 0;\n  for (const x of arr) {\n    sum += x;\n  }\n  return sum;\n}",
        codeLang: "javascript",
        correct: "O(n)",
        wrong: ["O(1)", "O(n²)", "O(log n)"],
        explanation:
          "One loop touching each of the n elements exactly once, constant work per element: O(n) time, O(1) extra space. The habit to build: count how many times the INNER work runs as a function of input size, ignoring constants. Single pass = linear, and no cleverness can sum unsorted numbers faster — you must at least read them all, which makes O(n) a lower bound here too.",
        docRef: DOC,
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "cs-complexity-spotting",
        prompt: "What is the time complexity of this function?",
        code: "function f(arr) {\n  let count = 0;\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[i] === arr[j]) count++;\n    }\n  }\n  return count;\n}",
        codeLang: "javascript",
        correct: "O(n²)",
        wrong: ["O(n)", "O(n log n)", "O(2ⁿ)"],
        explanation:
          "The inner loop runs n−1, n−2, … 1 times: about n²/2 comparisons, and constants drop — O(n²). The `j = i + 1` start fools people into halving the class, but O(n²/2) IS O(n²). Interview follow-up you should pre-empt: 'can you do better?' — yes, a hash map of counts finds duplicates in O(n), which is the Arrays & Hashing pattern verbatim.",
        docRef: DOC,
      });
    }
    if (variant === 2) {
      return choice(rng, {
        genId: "cs-complexity-spotting",
        prompt: "What is the time complexity of this loop?",
        code: "function f(n) {\n  let i = n;\n  let steps = 0;\n  while (i > 1) {\n    i = Math.floor(i / 2);\n    steps++;\n  }\n  return steps;\n}",
        codeLang: "javascript",
        correct: "O(log n)",
        wrong: ["O(n)", "O(n/2)", "O(√n)"],
        explanation:
          "i halves every iteration, so the loop runs until n/2^k reaches 1 — that's k = log₂n iterations. 'Divide the problem by a constant each step' is THE logarithm signature: binary search, balanced-tree height, heap sift. Note O(n/2) isn't even a valid distinct class (constants drop, it's O(n)) — listing it as bait checks whether you understand what Big-O notation actually ignores.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "cs-complexity-spotting",
      prompt: "What is the time complexity of this function?",
      code: "function f(arr) {\n  const sorted = [...arr].sort((a, b) => a - b);\n  for (const x of sorted) {\n    console.log(x);\n  }\n  return sorted;\n}",
      codeLang: "javascript",
      correct: "O(n log n)",
      wrong: ["O(n)", "O(n²)", "O(n² log n)"],
      explanation:
        "Sequential phases ADD: the comparison sort costs O(n log n), the print loop O(n), and the sum is dominated by the larger term — O(n log n). Phases only MULTIPLY when nested inside each other. 'Sort first, then linear work' is one of the most common real algorithm shapes (intervals, greedy), so its total cost should be reflexive: the sort pays for itself whenever it replaces an O(n²) pairwise comparison.",
      docRef: DOC,
    });
  },
};

export const csFundamentalsTopic: Topic = {
  id: "cs-fundamentals",
  title: "CS Fundamentals",
  icon: "📚",
  blurb:
    "The rapid-fire technical round: OS, networking, DBMS, OOP & SOLID, complexity — definition, example, trade-off.",
  docSlug: "cs-fundamentals",
  docTitle: "CS Fundamentals — the rapid-fire interview layer",
  generators: [
    processThread,
    deadlock,
    memoryPaging,
    tcpUdp,
    urlJourney,
    dbmsKeys,
    sqlNosql,
    oopPillars,
    solidQuick,
    complexitySpotting,
  ],
};
