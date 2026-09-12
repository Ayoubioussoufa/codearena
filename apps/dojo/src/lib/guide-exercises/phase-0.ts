/**
 * Exercises for Phase 0 — the type system, DI, architecture and tooling.
 *
 * These are the load-bearing ideas: everything in later phases assumes them.
 * Weighted toward the moves that change how you write code rather than trivia
 * that impresses in a quiz.
 */
import type { GuideExercise } from "./types";

export const phase0Exercises: GuideExercise[] = [
  {
    id: "strict-null",
    title: "Let the compiler find the crash",
    prompt:
      "With `strictNullChecks`, this fails: `'user' is possibly 'null'`. Fix it in the way that makes the missing case a real answer rather than a silenced warning.",
    language: "typescript",
    given: `findById(id: string): Promise<User | null>`,
    starter: `async function greet(id: string) {
  const user = await repo.findById(id);
  return \`Hello \${user.username}\`;
}
`,
    solution: `async function greet(id: string) {
  const user = await repo.findById(id);
  if (!user) throw new NotFoundException(\`No user \${id}\`);
  return \`Hello \${user.username}\`;
}
`,
    hint: "`user!.username` and `user?.username` both compile. One hides a crash, the other hides a `Hello undefined`. Neither answers the question the type asked.",
    explanation:
      "The `| null` in the signature is the repository telling you a user might not exist. `!` asserts it away and you get a runtime `TypeError` instead of a compile error — you have traded a good error for a bad one. `?.` silently produces `\"Hello undefined\"`, which is worse, because nothing fails at all. **A nullable type is a question, and the fix is to answer it**: throw, return a default, or narrow. `strictNullChecks` is the single highest-value flag in TypeScript precisely because it forces the question at every point.",
    checks: [
      { re: "if\\s*\\(!user\\)|user\\s*===\\s*null|if\\s*\\(user\\s*==\\s*null\\)", label: "narrows the null case explicitly" },
      { re: "throw|return ", label: "answers it with a real outcome" },
      { re: "user!\\.", expect: false, label: "no `!` — that only moves the failure to runtime" },
      { re: "user\\?\\.", expect: false, label: "no `?.` — that would render `Hello undefined`" },
    ],
  },

  {
    id: "di-constructor",
    title: "Take the dependency instead of building it",
    prompt:
      "Rewrite this so it can be tested without a database, and say nothing about Prisma.",
    language: "typescript",
    given: `import { Inject, Injectable } from '@nestjs/common';
import { PROBLEMS_REPOSITORY, type ProblemsRepository } from '../ports/problems.repository';`,
    starter: `@Injectable()
export class ProblemsService {
  private readonly repo = new PrismaProblemsRepository(new PrismaClient());

  findBySlug(slug: string) {
    return this.repo.findBySlug(slug);
  }
}
`,
    solution: `@Injectable()
export class ProblemsService {
  constructor(
    @Inject(PROBLEMS_REPOSITORY) private readonly repo: ProblemsRepository,
  ) {}

  findBySlug(slug: string) {
    return this.repo.findBySlug(slug);
  }
}
`,
    hint: "A class that constructs its own dependency has decided for every caller, including the test. Move the decision outward.",
    explanation:
      "`new` inside a class is a commitment nobody can undo from outside. Once the dependency arrives through the constructor, a test writes `new ProblemsService(fakeRepo)` — no container, no database, milliseconds. **That speed is a design signal, not a convenience**: if a unit test needs infrastructure, something is reaching past its layer. The `@Inject` token is needed because TypeScript interfaces are erased at runtime, so there is no `ProblemsRepository` value for the container to key on.",
    checks: [
      { re: "constructor\\(", label: "takes the dependency through the constructor" },
      { re: "@Inject\\(", label: "injects by token" },
      { re: ":\\s*ProblemsRepository", label: "typed as the interface, not the implementation" },
      { re: "new Prisma", expect: false, label: "constructs nothing itself" },
    ],
  },

  {
    id: "layer-placement",
    title: "Place six pieces of code",
    prompt:
      "Write the folder for each — domain, ports, application, adapters or http. One per line.",
    language: "text",
    given: `1. "a submission is accepted when every test passed"
2. the interface saying "I need to run code somewhere"
3. the class that talks to Docker
4. "load the problem, run the code, save the result"
5. turning EASY into "Easy" for display
6. the DTO that validates the request body`,
    starter: `1.
2.
3.
4.
5.
6.
`,
    solution: `1. domain — a rule, true on paper, no I/O
2. ports — a stated need with no implementation
3. adapters — it names an outside technology
4. application — it sequences steps to fulfil one user action
5. http — presentation, and only this transport cares
6. http — request shape is an HTTP concern
`,
    hint: "Four questions, in order, stop at the first yes: does it name an outside technology? is it true on paper? does it sequence steps? is it a stated need?",
    explanation:
      "Items 5 and 6 are the ones people put in the wrong place. A display string belongs at the edge, because business logic must not know about presentation and the schema must not be contorted to suit one consumer. The DTO is the same argument from the other side — the request *shape* is HTTP's business, even though the *rule* it enforces (a password must be 12 characters) is domain. The procedure settles all six, and the audit that proves it is one command: `grep -r \"prisma\" domain/ application/` returning nothing.",
    checks: [
      { re: "1\\.\\s*domain", flags: "mi", label: "1 — domain" },
      { re: "2\\.\\s*ports", flags: "mi", label: "2 — ports" },
      { re: "3\\.\\s*adapters", flags: "mi", label: "3 — adapters" },
      { re: "4\\.\\s*application", flags: "mi", label: "4 — application" },
      { re: "5\\.\\s*http", flags: "mi", label: "5 — http" },
      { re: "6\\.\\s*http", flags: "mi", label: "6 — http" },
    ],
  },

  {
    id: "solid-dip",
    title: "Invert the dependency",
    prompt:
      "`OrderService` is welded to SendGrid. Apply the dependency inversion principle: write the port and the new constructor.",
    language: "typescript",
    given: `// Today: import { SendGrid } from 'sendgrid';
// Tomorrow: SES, Postmark, or a fake that records what was sent.`,
    starter: `export class OrderService {
  private readonly mailer = new SendGrid(process.env.SENDGRID_KEY);

  async place(order: Order) {
    await this.repo.save(order);
    await this.mailer.send(order.email, 'Order placed');
  }
}
`,
    solution: `export interface Notifier {
  orderPlaced(email: string): Promise<void>;
}

export const NOTIFIER = Symbol('Notifier');

export class OrderService {
  constructor(private readonly notifier: Notifier) {}

  async place(order: Order) {
    await this.repo.save(order);
    await this.notifier.orderPlaced(order.email);
  }
}
`,
    hint: "Name the port for what the APPLICATION needs, not for what SendGrid offers. `send(to, subject)` is SendGrid's vocabulary leaking through.",
    explanation:
      "Dependency inversion is not just 'use an interface' — it is that **the interface is owned by the caller, in the caller's language**. A port called `sendEmail(to, subject, body)` still leaks: it has decided the notification is an email, so a Slack adapter would have to fake a subject line. `orderPlaced(email)` states the event and lets the adapter decide the medium. That is also what makes the fake trivial: it records that an order was announced, which is the thing the test cares about.",
    checks: [
      { re: "interface\\s+\\w*(Notifier|Mailer|Notification)", label: "declares a port" },
      { re: "constructor\\(", label: "takes it through the constructor" },
      { re: "Symbol\\(", label: "exports a DI token" },
      { re: "new SendGrid|sendgrid", expect: false, label: "no longer names SendGrid" },
      { re: "SENDGRID_KEY", expect: false, label: "no vendor config in the service" },
    ],
  },

  {
    id: "coupling-smell",
    title: "Name the coupling",
    prompt:
      "For each, write `tight` or `loose`, and one clause on what breaks it.",
    language: "text",
    given: `1. a service importing PrismaUsersRepository directly
2. a service injecting USERS_REPOSITORY
3. a controller reading request.user
4. a controller taking @CurrentUser()`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. tight — swapping the database means editing the service
2. loose — only the module binding changes
3. tight — the controller cannot be tested without faking an Express request
4. loose — the handler takes a plain argument and does not know about HTTP
`,
    hint: "Ask of each: what would I have to change if the thing underneath changed? The size of that answer is the coupling.",
    explanation:
      "Coupling is measurable: **count what else must change when one thing changes.** Cases 1 and 3 are the same mistake at different layers — a class naming a concrete thing it did not need to name. The fix in both is the same shape too: take it as a parameter instead of reaching for it. And the payoff is the same: the test stops needing infrastructure, which is why 'my unit tests are slow' is an architecture report rather than a tooling complaint.",
    checks: [
      { re: "1\\.\\s*tight", flags: "mi", label: "1 — tight" },
      { re: "2\\.\\s*loose", flags: "mi", label: "2 — loose" },
      { re: "3\\.\\s*tight", flags: "mi", label: "3 — tight" },
      { re: "4\\.\\s*loose", flags: "mi", label: "4 — loose" },
    ],
  },

  {
    id: "docker-compose",
    title: "Write the compose service",
    prompt:
      "Write the Postgres service: pinned image, credentials, a named volume so data survives a restart, port 5433 on the host, and a healthcheck so dependants wait for it to be ready.",
    language: "yaml",
    given: `# The API connects on 5433 because 5432 is already taken locally.
# pg_isready is the standard readiness probe.`,
    starter: `services:
  postgres:
    # TODO

volumes:
  # TODO
`,
    solution: `services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: codearena
      POSTGRES_PASSWORD: codearena
      POSTGRES_DB: codearena
    ports:
      - '5433:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U codearena']
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
`,
    hint: "The port mapping is `host:container`. The container always listens on 5432 — only the left side moves.",
    explanation:
      "Three things people leave out and regret. **A pinned tag**: `postgres:latest` means a colleague's machine silently runs a different major version. **A named volume**: without it `docker compose down` destroys your data, which is fine until it is your seed run. **A healthcheck**: 'the container started' is not 'the database accepts connections', and the gap is where flaky CI lives — a dependant with `condition: service_healthy` waits for the probe rather than racing it.",
    checks: [
      { re: "image\\s*:\\s*postgres:\\d", label: "pins a major version rather than `latest`" },
      { re: "'5433:5432'|\"5433:5432\"|5433:5432", label: "maps host 5433 to container 5432" },
      { re: "volumes\\s*:[\\s\\S]*pgdata", label: "uses a named volume so data survives" },
      { re: "healthcheck", label: "declares a healthcheck" },
      { re: "pg_isready", label: "probes readiness, not just liveness" },
      { re: "POSTGRES_USER", label: "sets the credentials" },
    ],
  },

  {
    id: "monorepo-filter",
    title: "Run one workspace's script",
    prompt:
      "Write the commands, one per line: add a runtime dep to the API, add a dev-only types package to it, run only the API's tests, and typecheck every workspace.",
    language: "bash",
    given: `# pnpm workspace, packages at apps/api, apps/web, apps/dojo`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. pnpm --filter api add cookie-parser
2. pnpm --filter api add -D @types/cookie-parser
3. pnpm --filter api test
4. pnpm -r typecheck
`,
    hint: "`-D` applies to the whole command, so a runtime dep and a dev dep cannot be added in one call.",
    explanation:
      "`--filter` scopes a command to one workspace; `-r` runs it across all of them. The two-command split for dependencies is not pedantry — types are erased at build, so shipping `@types/*` as a runtime dependency bloats the production install and misstates what the package actually needs. And the lockfile stays at the repo root no matter which workspace you install into, which is what makes one `pnpm install --frozen-lockfile` reproduce the whole tree in CI.",
    checks: [
      { re: "1\\.[^\\n]*--filter api add cookie-parser", flags: "mi", label: "1 — scoped runtime dependency" },
      { re: "2\\.[^\\n]*--filter api add -D", flags: "mi", label: "2 — dev dependency, separate command" },
      { re: "3\\.[^\\n]*--filter api test", flags: "mi", label: "3 — one workspace's tests" },
      { re: "4\\.[^\\n]*pnpm -r|--recursive", flags: "mi", label: "4 — recursive across all workspaces" },
    ],
  },

  {
    id: "decorator-metadata",
    title: "Explain why it compiles and fails at boot",
    prompt:
      "A provider class has a constructor dependency, compiles fine, and fails at startup with `Nest can't resolve dependencies`. It is missing one thing. Name it and say why the compiler did not care.",
    language: "text",
    given: `export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}
}`,
    starter: `1. what is missing:
2. why the compiler said nothing:
`,
    solution: `1. what is missing: @Injectable() on the class
2. why the compiler said nothing: emitDecoratorMetadata only emits design:paramtypes for a class that has at least one decorator. With none, there is no runtime type information for Nest to read, and the code is perfectly valid TypeScript either way.
`,
    hint: "Nest matches constructor dependencies by runtime type. Where does that runtime type information come from, given that types are erased?",
    explanation:
      "Types are erased — so how does Nest know the constructor wants a `PrismaService`? `emitDecoratorMetadata` writes a hidden `design:paramtypes` array onto the class, and it only does so when the class carries at least one decorator. No decorator, no metadata, nothing to resolve. This is the sneakiest error in the framework: valid TypeScript, clean build, failure at boot, and a message that says nothing about decorators.",
    checks: [
      { re: "@?Injectable", flags: "i", label: "names `@Injectable()`" },
      { re: "metadata", flags: "i", label: "explains it in terms of emitted metadata" },
      { re: "paramtypes|design:", flags: "i", label: "names the metadata key" },
      { re: "eras|runtime", flags: "i", label: "connects it to type erasure" },
    ],
  },
];
