/**
 * Checks for the Backend Architecture guide
 * (content/supplements/backend-architecture.md). Mostly design judgement;
 * the factual claims were checked on 3 Nov 2026: TypeScript's excess-property
 * check (run through tsc: an inline literal is flagged, a variable or a spread
 * is not), Prisma 7's constructor change (prisma.io upgrade guide).
 */
import type { GuideCheckSet } from "./types";

export const backendArchitectureChecks: GuideCheckSet = {
  name: "Backend Architecture guide",
  source: {
    label: "Alistair Cockburn, “Hexagonal Architecture” (2005)",
    href: "https://alistair.cockburn.us/hexagonal-architecture/",
    note: "The original ports-and-adapters article: short, and less dogmatic than what came after. Read it after Parts 2–5.",
  },
  terms: [
    "Coupling",
    "Cohesion",
    "Dependency inversion",
    "Port",
    "Adapter",
    "Value object",
    "Aggregate root",
    "Unit of Work",
    "Outbox pattern",
    "Bounded context",
  ],
  checks: [
    {
      id: "why",
      section: "Parts 0–1 · Why structure at all",
      questions: [
        {
          prompt: "The unstructured login handler knows HTTP, Prisma, bcrypt, JWT, env vars, email and the lockout rule. What's the real damage?",
          options: [
            "It runs slower, since every call goes through it",
            "Its one real rule can't be tested in isolation",
            "It breaks Nest, which requires a separate service class",
            "It leaks the password hash in each login response",
          ],
          correct: 1,
          why: "Seven reasons for one file to change, and the only interesting logic, \"five failed attempts locks the account\", can't be tested without a database, a mail server and an HTTP request. The disease isn't ugliness; it's untestability and unchangeability.",
        },
        {
          prompt: "By the coupling rule, which pair belongs in the same place?",
          options: [
            "Login logic and the chosen ORM library",
            "The JWT library and the database driver",
            "Login logic and the account lockout rule",
            "The lockout rule and the mail provider",
          ],
          correct: 2,
          why: "Couple the things that change together; separate the things that change for different reasons. Login and lockout are both \"how authentication works\". The ORM, the JWT library and the mail provider each change for their own unrelated reasons.",
        },
      ],
      explain:
        "Explain coupling and cohesion to an interviewer using the login handler from Part 1, and say which two things in it should live together.",
    },
    {
      id: "rule",
      section: "Part 2 · The one rule",
      questions: [
        {
          prompt: "Between `PrismaProblemsRepository` and the `ProblemsRepository` port, which way does the dependency point?",
          options: [
            "From the port to Prisma, which it wraps",
            "Both ways, since each one imports the other",
            "Neither way: the module wires them at runtime",
            "From the adapter to the port it implements",
          ],
          correct: 3,
          why: "The adapter imports and implements your interface; the interface knows nothing about Prisma. Volatile code depends on stable code, never the reverse. That reversal is dependency inversion, the D in SOLID.",
        },
        {
          prompt: "What's the real, daily benefit of keeping Prisma out of your business rules?",
          options: [
            "Your rules never pick up the vendor's vocabulary",
            "Swapping Postgres for Mongo becomes a quick job",
            "Queries run faster without the ORM in between",
            "The compiler can then skip the domain folder",
          ],
          correct: 0,
          why: "Database swaps rarely happen, so they're a weak argument for the pattern. The benefit you collect every day is that your service never learns what a `WhereUniqueInput` or a `P2002` is: your business logic stays in your own words.",
        },
      ],
      explain:
        "State the dependency rule in one sentence. Then explain why the adapter's arrow points at the port, and what that buys you day to day.",
    },
    {
      id: "layers",
      section: "Part 3 · The five layers",
      questions: [
        {
          prompt: "Where does mapping `EASY` to the display string `\"Easy\"` belong?",
          options: [
            "In domain/, next to the Difficulty type itself",
            "In http/, as presentation for a single consumer",
            "In the database schema, as one more column",
            "In application/, inside the service that loads it",
          ],
          correct: 1,
          why: "It's presentation: only this consumer cares how a difficulty is displayed. Business logic must not know display strings, and putting it in the schema would bend your data model around one screen. The edge (the controller) is its home.",
        },
        {
          prompt: "An adapter ends with `return { ...row }`. Why is that a bug, even though it compiles?",
          options: [
            "A spread dodges the excess-property check: columns leak",
            "Spreads copy Prisma's prototype, breaking the JSON output",
            "TypeScript silently turns spread rows into any types",
            "The spread makes Prisma re-execute the original query",
          ],
          correct: 0,
          why: "TypeScript flags unknown properties only in object literals written inline. A returned variable or a spread skips the check, so `createdAt`, internal flags and `passwordHash` sail through your return type and out of your API. Name the fields one by one.",
        },
        {
          prompt: "Why does a service read the time from an injected `Clock` rather than `Date.now()`?",
          options: [
            "Date.now() is far too imprecise for token expiry",
            "Date.now() is not allowed inside any NestJS service",
            "Tests can set any moment, without waiting days",
            "The Clock port caches each request's current time",
          ],
          correct: 2,
          why: "Time is an outside system: it changes without asking and you can't control it in a test. To test \"expires after 7 days\" with `Date.now()` you'd wait 7 days; with a `Clock` port the test hands in any moment it likes. Same for `Math.random()` and UUIDs.",
        },
      ],
      explain:
        "For each of the five folders, say what it holds and what it may import, with one CodeArena example each.",
    },
    {
      id: "domain",
      section: "Part 4 · Domain modelling",
      questions: [
        {
          prompt: "Two `Money(10, 'EUR')` objects hold equal values. Are they the same thing?",
          options: [
            "No: each one has its own identity",
            "Only if both share one database id",
            "Only if they were both created together",
            "Yes: a value object is its values",
          ],
          correct: 3,
          why: "A value object *is* its values: there's no meaningful \"which ten euros\". An entity (a `User`, a `Submission`) has an id, so two with identical fields are still two. Value objects are replaced, never mutated, and they're a natural home for validation.",
        },
        {
          prompt: "Why may an `OrderLine` change only through its `Order`?",
          options: [
            "So the database can lock fewer rows per update",
            "So the total always equals the sum of lines",
            "So OrderLine needs no database table of its own",
            "So the API returns lines in a stable order",
          ],
          correct: 1,
          why: "An invariant (\"total equals the sum of lines\") can only be guaranteed if every change goes through one place. That's the aggregate root: the single door. An invariant enforced in one code path fails the day someone adds a second path.",
        },
        {
          prompt: "Which of these is an invariant?",
          options: [
            "The submissions table is indexed on its problem id",
            "Each submission request takes under 200 ms to run",
            "A submission can't be accepted with zero passing tests",
            "Submissions are listed newest first on the profile pages",
          ],
          correct: 2,
          why: "An invariant is a business rule that must hold at all times, not just at creation. An index is storage, a latency target is a performance goal, and list order is presentation. \"Accepted with zero passing tests\" must never be true, whichever code path writes it.",
        },
      ],
      explain:
        "Explain entity versus value object, and what an aggregate root protects, using CodeArena's `Problem` and its examples.",
    },
    {
      id: "ports",
      section: "Parts 5–6 · Ports, adapters, and where code goes",
      questions: [
        {
          prompt: "Which class injects `PROBLEMS_REPOSITORY`?",
          options: [
            "ProblemsService, because it consumes the port it needs",
            "The Prisma adapter, which implements the port itself",
            "Both classes, letting the module link them together",
            "Neither: only the Nest module ever reads tokens",
          ],
          correct: 0,
          why: "You inject a port to *use* it and implement a port to *provide* it, never both. An adapter injecting the port it implements asks DI for itself: infinite recursion, and the most common first mistake with this pattern.",
        },
        {
          prompt: "A port buys substitution, a checked contract and a vocabulary boundary. Which one pays every day?",
          options: [
            "Substitution, because you swap adapters all the time",
            "The checked contract, since implements catches every typo",
            "The vocabulary boundary between your core and vendors",
            "None, until a second real adapter finally exists",
          ],
          correct: 2,
          why: "You'll substitute an adapter maybe twice in a career, and `implements` is a nice check. But not coupling your business rules to a vendor's data shapes is a benefit you collect on every single change.",
        },
        {
          prompt: "\"Retry Stripe three times on a 503.\" Where does that code go?",
          options: [
            "domain/, because it's a rule about payments",
            "application/, inside the checkout use case itself",
            "http/, in the controller starting the checkout",
            "adapters/, since it's a Stripe transport detail",
          ],
          correct: 3,
          why: "Run the procedure: does it name an outside technology? Stripe, yes, so it's an adapter. A vendor's flakiness is a vendor detail; the use case just asks the `PaymentGateway` port to charge, and never learns that retries happen.",
        },
      ],
      explain:
        "Walk a new piece of code, \"retry the judge call twice on timeout\", through the four-question procedure out loud, and say where it lands.",
    },
    {
      id: "errors",
      section: "Part 7 · Errors deserve their own architecture",
      questions: [
        {
          prompt: "Prisma throws `P2002` (a unique-constraint violation). Where is it translated into your own error?",
          options: [
            "In the adapter that called Prisma directly",
            "In the service, which knows the rules",
            "In the exception filter, at the edge",
            "In the controller, just before it returns",
          ],
          correct: 0,
          why: "Translate at each boundary: the adapter catches the vendor's code and throws *your* error; the service lets it pass or adds context; the filter turns it into a 409. A `P2002` string must never appear in `application/`.",
        },
        {
          prompt: "A bug throws `undefined is not a function`. What should happen?",
          options: [
            "Catch it and return a friendly 400 response",
            "Let it propagate: log it loudly, return 500",
            "Retry the request, since it may be transient",
            "Swallow it and return the last cached result",
          ],
          correct: 1,
          why: "A programmer error isn't a case to handle: it's a case to log loudly and answer 500. Catching it and returning something friendly hides the bug and makes it permanent.",
        },
        {
          prompt: "`catch (e) { if (isP2002(e)) throw new ConflictException(); }` What's missing?",
          options: [
            "A log line, or the conflict goes unrecorded",
            "A finally block, or the connection stays open",
            "A final throw e, or other errors vanish",
            "An await, or the conflict fires too early",
          ],
          correct: 2,
          why: "When you catch selectively, rethrow the rest. Without `throw e`, every other error (a database outage, a bug) is silently swallowed and the function carries on as if it had succeeded.",
        },
      ],
      explain:
        "Trace a duplicate-email registration from Prisma's `P2002` to the client's 409: what each layer catches, throws, or lets pass.",
    },
    {
      id: "boundaries",
      section: "Parts 8–9 · Transactions, and where concerns plug in",
      questions: [
        {
          prompt: "Why not call Stripe inside the database transaction?",
          options: [
            "Stripe refuses requests made from inside a transaction",
            "Transactions can't contain any asynchronous calls at all",
            "Prisma cancels any transaction after just one second",
            "Locks stay held, and a charge survives rollbacks",
          ],
          correct: 3,
          why: "The network call holds database locks for seconds, throttling everyone else. And if the charge succeeds and the commit fails, you've taken money with no record of it: the dual-write problem. Database work inside the transaction, network calls outside; the outbox pattern does the rest.",
        },
        {
          prompt: "You add Redis caching to `ProblemsRepository`. How many existing files change?",
          options: [
            "Each service that reads problems through the port",
            "One: the module line that picks the adapter",
            "The controller and service, to check the cache",
            "None, because Redis caches Prisma queries by itself",
          ],
          correct: 1,
          why: "A `CachedProblemsRepository` wraps the Prisma one and implements the same port (the Decorator pattern), so nothing else changes: one line in the module chooses which adapter is provided.",
        },
        {
          prompt: "Where does the logic of a background job live?",
          options: [
            "In the same use case the controller calls",
            "In the job handler, which owns the payload",
            "In a cron script outside the Nest app",
            "In the adapter that talks to the queue",
          ],
          correct: 0,
          why: "A job is just another entry point: it parses its payload and calls the same use case the controller calls. Put the logic in the handler and it exists twice, once for HTTP and once for the queue, and the two copies drift.",
        },
      ],
      explain:
        "Explain the dual-write problem with a payment example, and how the outbox pattern solves it.",
    },
    {
      id: "judgement",
      section: "Parts 10–13 · Sizing, and when not to",
      questions: [
        {
          prompt: "You ask the three questions before adding a port, and get zero yeses. What do you do?",
          options: [
            "Add the port anyway, to keep modules uniform",
            "Write the port, but skip the in-memory adapter",
            "Call the library directly; extract a port later",
            "Wrap the library in a global module instead",
          ],
          correct: 2,
          why: "No second implementation (not even a test fake), no boundary you don't control, no vendor shapes worth containing: then the port is pure overhead. Extracting one later is a mechanical refactor; carrying one you never needed costs years.",
        },
        {
          prompt: "Which structure does the guide say most professional codebases should stop at?",
          options: [
            "One file, kept small through careful naming",
            "Folders by feature, like orders, users, problems",
            "Folders by role: controllers, services and models",
            "Separate deployables for the API and workers",
          ],
          correct: 1,
          why: "Stage 3, by feature, is a huge improvement and enough for most apps. Layers inside features (stage 4) are triggered by vendor changes rippling through business logic, and separate deployables (stage 5) by different scaling needs, not fashion.",
        },
        {
          prompt: "When does the Rule of Three say to build the abstraction?",
          options: [
            "The first time, before the copies start spreading",
            "When three developers ask for the same helper",
            "When a file grows past three hundred lines",
            "The third time, once you know what varies",
          ],
          correct: 3,
          why: "Two data points define infinite lines; three constrain the shape. Abstract on the first or second occurrence and you guess what varies; on the third you know, and the abstraction fits.",
        },
      ],
      explain:
        "Describe the five evolution stages and the trigger for each. Which stage is CodeArena at, and why is that right for it?",
    },
    {
      id: "testing",
      section: "Parts 14–15 · Testing, and the anti-patterns",
      questions: [
        {
          prompt: "Why is unit-testing an adapter against a mocked Prisma client a bad idea?",
          options: [
            "It tests the mock: wrong queries still pass",
            "Mocking Prisma makes the test suite too slow",
            "Prisma's generated types can't be mocked at all",
            "Jest refuses to mock any database client library",
          ],
          correct: 0,
          why: "Asserting you called `findUnique` with certain arguments tests your mock: it passes when the query is wrong, and breaks when you refactor without changing behaviour. Adapters get integration tests against a real database.",
        },
        {
          prompt: "What separates a fake from a mock?",
          options: [
            "A fake is generated by Jest; a mock is handwritten",
            "A fake talks to a test database; a mock doesn't",
            "A fake is slower, but a mock is less precise",
            "A fake works simply; a mock checks how it's called",
          ],
          correct: 3,
          why: "A fake is a working, simple implementation (an in-memory array behind the port). A mock asserts it was called a certain way, which couples the test to implementation details. You almost always want the fake.",
        },
        {
          prompt: "A port declares `findBySlug(): Promise<Prisma.ProblemGetPayload<…>>`. Which anti-pattern is it?",
          options: [
            "A god service doing several jobs",
            "A leaky port exposing vendor types",
            "A utils drawer of unrelated helpers",
            "A repository that mirrors one table",
          ],
          correct: 1,
          why: "The vendor's type escaped through the boundary, so every consumer depends on Prisma's shapes and the port protects nothing: Prisma with extra steps. Ports return *your* types, always.",
        },
      ],
      explain:
        "Say what you test at each layer (domain, application, adapters, http) and with which kind of test, for CodeArena's submissions.",
    },
  ],
};
