/**
 * Checks for ../../docs/phase-0-foundations.md.
 * Checked 3 Nov 2026: Dockerfile comment rule and build best practices (docs.docker.com); the TypeScript and NestJS claims match the guides checked earlier.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const phase0Checks: GuideCheckSet = {
  name: "Phase 0 guide",
  source: {
    label: "Docker docs: Building best practices",
    href: "https://docs.docker.com/build/building/best-practices/",
    note: "The part of this guide no other guide covers: layer caching, multi-stage builds, .dockerignore. For Parts A–C, the TypeScript, NestJS and Backend Architecture guides carry their own sources.",
  },
  terms: [
    "strictNullChecks",
    "Dependency injection",
    "IoC container",
    "Injection token",
    "Dynamic module",
    "Repository",
    "Bounded context",
    "CQRS",
    "Image layer",
    "Multi-stage build",
  ],
  checks: [
    {
      id: "typescript",
      section: "Part A · TypeScript, strictly",
      questions: [
        {
          prompt: "With `noUncheckedIndexedAccess` on, what is the type of `scores[0]` when `scores` is `number[]`?",
          options: [
            "number, since arrays always have a first element",
            "number | undefined, so you must check it",
            "undefined, since an index never holds a value",
            "unknown, so you must cast it before reading",
          ],
          correct: 1,
          why: "The element may not exist, and the flag makes the type say so: `scores[0]` is `number | undefined`, and the compiler forces a check before `.toFixed()`. Without it, the type claims `number` and the crash happens at runtime.",
        },
        {
          prompt: "Why turn on all the strict flags on day one rather than later?",
          options: [
            "Strict mode makes the JavaScript it emits run faster",
            "The flags are only settable when the project starts",
            "Loose settings stop the editor from showing any errors",
            "Each loose line written now becomes an error later",
          ],
          correct: 3,
          why: "Each line written under loose settings becomes a compile error when strictness finally arrives: a week of misery on 10,000 lines, free on line 1. The flags change checking only; they don't touch the emitted JavaScript.",
        },
      ],
      explain: "Explain what `strictNullChecks`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` each catch, with one bug per flag.",
    },
    {
      id: "di",
      section: "B.1–B.3 · DI, containers, modules",
      questions: [
        {
          prompt: "`SignupService` does `new SmtpMailer(...)` itself. What's the root problem?",
          options: [
            "It builds its mailer instead of receiving one",
            "It sends email synchronously, so requests are blocked",
            "It holds the SMTP credentials in memory forever",
            "It creates a new mailer on every registration",
          ],
          correct: 0,
          why: "Tight coupling: the class decides which mailer exists and how it's built, credentials included. So tests send real email, switching providers means editing it, and dev can't log instead. Asking for a `Mailer` in the constructor fixes all three.",
        },
        {
          prompt: "By default, how many instances of an `@Injectable()` service does Nest create?",
          options: [
            "One for each class injecting it",
            "One for each incoming HTTP request",
            "One, shared across the whole app",
            "One per module importing its module",
          ],
          correct: 2,
          why: "The container resolves the constructor's parameters recursively, builds the instance and caches it as a singleton. Request and transient scopes exist, but they're opt-in and have a cost.",
        },
      ],
      explain: "Explain dependency injection to a junior developer in 60 seconds, without mentioning any framework.",
    },
    {
      id: "pipeline",
      section: "B.4–B.6 · Lifecycle, decorators, dynamic modules",
      questions: [
        {
          prompt: "A guard rejects a request, then on another request a pipe rejects it. Which status codes fit?",
          options: [
            "The guard's a 400, and the pipe's a 403",
            "Both of them reject the request with a 401",
            "The guard's a 403, and the pipe's a 400",
            "Both of them reject the request with a 500",
          ],
          correct: 2,
          why: "A guard decides whether the request may reach the handler at all (authorization, 403-flavoured). A pipe checks that the arguments are valid and converts them (400-flavoured). Guards run early; pipes run last before the handler.",
        },
        {
          prompt: "In a dynamic module's `forRoot(options)`, where do the options end up?",
          options: [
            "Registered as a provider anyone in it can inject",
            "Stored on the module class as a static property",
            "Passed as arguments to the constructor of the controller",
            "Written into process.env when the module is first loaded",
          ],
          correct: 0,
          why: "`{ provide: \"STORAGE_OPTIONS\", useValue: options }`: the configuration becomes a provider, so anything in the module can inject it. `forRootAsync` does the same with a `useFactory`. After writing one, `ConfigModule.forRoot` stops looking like magic.",
        },
      ],
      explain: "Describe the two-step dance behind `@Roles()`: what `SetMetadata` writes, and how a guard reads it back.",
    },
    {
      id: "architecture",
      section: "Part C · Architecture",
      questions: [
        {
          prompt: "What separates a real repository from an \"ORM wrapper\"?",
          options: [
            "It caches every query result to save trips",
            "It exposes the raw SQL for complex queries",
            "It creates one table for every entity class",
            "It returns domain objects, never ORM row types",
          ],
          correct: 3,
          why: "A repository gives the domain the illusion of a collection of its entities: it speaks `Loan`, never a Prisma row, and the mapping happens inside it. Sniff test: if deleting the ORM forces edits in domain files, you have wrappers.",
        },
        {
          prompt: "Catalog, Warehouse and Billing all have a \"Product\", with different fields. What does DDD recommend?",
          options: [
            "One shared Product class that holds every field",
            "Three contexts, each with its own small model",
            "One Product table, with nullable columns for each",
            "A base Product class that the three extend",
          ],
          correct: 1,
          why: "A bounded context is a boundary inside which a word has one meaning. One giant `Product` couples everyone to everyone; three honest models, with translation where contexts meet, keep each one small. In Nest, one context is usually one module.",
        },
        {
          prompt: "In CQRS, what does the read side usually look like?",
          options: [
            "Denormalized read copies, kept fresh by events",
            "The same normalized tables the commands use",
            "A cache cleared after every single write",
            "A database copy, rebuilt every single night",
          ],
          correct: 0,
          why: "Commands want validation and invariants (normalized, transactional); queries want speed and convenient shapes. CQRS keeps read-optimized copies derived from one authoritative write model, slightly behind it (eventual consistency).",
        },
      ],
      explain: "Explain entities versus value objects, and why a value object is \"a superb home for validation\".",
    },
    {
      id: "tools",
      section: "Part D · Monorepo and Docker",
      questions: [
        {
          prompt: "In a Dockerfile, why copy `package.json` and install before copying the source?",
          options: [
            "The install fails if source is copied first",
            "It keeps node_modules out of the final image",
            "Source edits then reuse the cached install layer",
            "It makes the container start faster at runtime",
          ],
          correct: 2,
          why: "Docker reuses a layer only if that instruction and everything before it are unchanged. Copy the manifest, install, then the source: a one-line edit rebuilds only the last layer. Copy everything first and every edit re-runs the slow install.",
        },
        {
          prompt: "Why must `.env` be in `.dockerignore`?",
          options: [
            "Docker refuses to copy any file starting with dots",
            "Layers are readable by anyone who pulls the image",
            "Containers load their environment from it on every start",
            "The build stops if it meets an unknown extension",
          ],
          correct: 1,
          why: "`COPY . .` copies everything, secrets included, and image layers aren't private: anyone with the image can read them, and a file deleted in a later layer still sits in the earlier one.",
        },
        {
          prompt: "Your database \"keeps resetting\" in development. Which mix-up is the usual cause?",
          options: [
            "A healthcheck that restarts the database once a minute",
            "A port mapping that points at the wrong database",
            "A multi-stage build that drops the database data folder",
            "A bind mount used where a named volume belonged",
          ],
          correct: 3,
          why: "A bind mount maps a host folder in (source code, for live edits); a named volume is storage Docker manages for data that must outlive the container. Same YAML key, different jobs. And `docker compose down -v` deletes volumes on purpose.",
        },
      ],
      explain: "When does a multi-stage build pay off, and when is it ceremony? Use the guide's measurements (TypeScript app versus plain JavaScript).",
    },
  ],
};
