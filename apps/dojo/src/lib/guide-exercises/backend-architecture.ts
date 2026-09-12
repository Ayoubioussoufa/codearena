/**
 * Exercises for the Backend Architecture guide.
 *
 * Each one sits under the paragraph that teaches it, so the explanation is
 * still on screen while you write. Checks are deliberately structural rather
 * than exact-match: there are many correct ways to write a port, and only a
 * few ways to break the dependency rule.
 *
 * Every solution is verified against its own checks by
 * `pnpm --filter dojo test:guide-exercises`. A check that fails its own model
 * answer is a broken check.
 */
import type { GuideExercise } from "./types";

export const backendArchitectureExercises: GuideExercise[] = [
  /* ── Part 3: the layers ────────────────────────────────────────────── */
  {
    id: "domain-entity",
    title: "Write a domain entity that cannot leak a secret",
    prompt:
      "Define the `User` type your application layer passes around. It needs id, email, username and role — and it must be structurally impossible for it to carry the password hash. Import nothing.",
    language: "typescript",
    starter: `// domain/user.entity.ts
// No imports. This layer knows nothing about anything.

export type Role = // TODO

export type User = {
  // TODO
};
`,
    solution: `// domain/user.entity.ts
// No imports. This layer knows nothing about anything.

export type Role = 'USER' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  username: string;
  role: Role;
};
`,
    hint: "The omission is the design. Ask what happens if someone writes `return user` from a repository — what can the type system stop, and what can only the shape stop?",
    explanation:
      "A type that cannot hold a secret cannot leak one. This is not a convention you have to remember at every call site — it is enforced by the compiler at every one. When login genuinely needs the hash, that is a separate, narrow method (`findCredentialsByEmail`) returning a separate, narrow type. The exception is visible and searchable instead of being everywhere by default.",
    checks: [
      { re: "export\\s+type\\s+User", label: "exports a `User` type" },
      { re: "\\bid\\s*:", label: "has `id`" },
      { re: "\\bemail\\s*:", label: "has `email`" },
      { re: "\\busername\\s*:", label: "has `username`" },
      { re: "\\brole\\s*:", label: "has `role`" },
      {
        re: "passwordHash|password\\s*:",
        expect: false,
        label: "does NOT carry the password or its hash",
      },
      {
        re: "^\\s*import\\s",
        flags: "m",
        expect: false,
        label: "imports nothing — `domain/` depends on no one",
      },
    ],
  },

  {
    id: "value-object",
    title: "Make an invalid value unrepresentable",
    prompt:
      "Write an `Email` value object. It has no id — two emails with the same text ARE the same email. Construction must fail for anything without an `@`, and the stored value must be lowercased. Use a factory function, not a bare type alias.",
    language: "typescript",
    given: `// Nothing is in scope. domain/ imports nothing, by design.`,
    starter: `// domain/email.value.ts

export class Email {
  // TODO: keep the value private, expose it read-only

  // TODO: a private constructor, so the ONLY way in is through the factory

  static create(raw: string): Email {
    // TODO: validate, normalise, construct
  }
}
`,
    solution: `// domain/email.value.ts

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const normalised = raw.trim().toLowerCase();
    if (!normalised.includes('@')) {
      throw new Error('Email must contain @');
    }
    return new Email(normalised);
  }
}
`,
    hint: "Make the constructor `private`. Then `new Email('garbage')` is a compile error everywhere, and the factory is the only door in — which means the validation cannot be skipped.",
    explanation:
      "A value object is defined by its value, not an identity: two `Email`s holding the same string are interchangeable, which is why there is no id. The private constructor is the whole trick — it turns 'remember to validate' into 'cannot construct an invalid one'. Once it exists, every function taking an `Email` gets that guarantee for free, instead of re-checking a `string`.",
    checks: [
      { re: "class\\s+Email", label: "declares an `Email` class" },
      {
        re: "private\\s+constructor",
        label: "constructor is private — the factory is the only way in",
      },
      { re: "static\\s+create", label: "has a `create` factory" },
      { re: "toLowerCase", label: "normalises the value" },
      { re: "throw", label: "rejects an invalid value by throwing" },
      { re: "readonly", label: "the value is read-only once built" },
    ],
  },

  {
    id: "port-interface",
    title: "Write a port",
    prompt:
      "Define the port your application layer uses to reach users: an interface with `findById` and `create`, plus the injection token. Nothing here may mention Prisma, SQL or any database.",
    language: "typescript",
    given: `import type { User } from '../domain/user.entity';
// User = { id, email, username, role }`,
    starter: `// ports/users.repository.ts

export interface UsersRepository {
  // TODO: findById — returns the user, or null when absent
  // TODO: create — takes what a caller must supply, returns the created user
}

// TODO: the DI token
`,
    solution: `// ports/users.repository.ts

export type CreateUserInput = Omit<User, 'id' | 'role'> & {
  passwordHash: string;
  role?: User['role'];
};

export interface UsersRepository {
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}

export const USERS_REPOSITORY = Symbol('UsersRepository');
`,
    hint: "The interface disappears at compile time, so it cannot be a runtime lookup key. Something that survives to runtime has to stand in for it.",
    explanation:
      "The port is written from the CALLER's point of view — it names what the application needs, not what the database offers. That is why it lives with the application and not with the adapter. `null` rather than a throw for a missing row is also a choice: 'not found' is an ordinary outcome for a lookup, not an exceptional one. The `Symbol` exists because TypeScript interfaces are erased — there is no `UsersRepository` value at runtime for the container to key on.",
    checks: [
      {
        re: "export\\s+interface\\s+UsersRepository",
        label: "exports the `UsersRepository` interface",
      },
      { re: "findById", label: "declares `findById`" },
      { re: "create\\s*\\(", label: "declares `create`" },
      { re: "Promise<", label: "methods are async — the caller must not care why" },
      { re: "\\|\\s*null|null\\s*\\|", label: "`findById` can return null" },
      { re: "Symbol\\(", label: "exports a `Symbol` as the DI token" },
      {
        re: "prisma|Prisma|sql|SQL|@prisma",
        expect: false,
        label: "mentions no database technology",
      },
    ],
  },

  {
    id: "adapter-maps",
    title: "Stop the adapter leaking the row",
    prompt:
      "This adapter compiles and is wrong. Fix `findById` so the database row can never escape into the rest of the app — and so adding a column to the table cannot silently widen your API.",
    language: "typescript",
    given: `import { Injectable } from '@nestjs/common';
import type { User } from '../domain/user.entity';
import type { UsersRepository } from '../ports/users.repository';

// the row Prisma hands back has EVERY column:
// { id, email, username, role, passwordHash, createdAt, updatedAt, ... }`,
    starter: `// adapters/prisma-users.repository.ts

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return row; // ← the bug
  }
}
`,
    solution: `// adapters/prisma-users.repository.ts

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      role: row.role,
    };
  }
}
`,
    hint: "Spreading (`{ ...row }`) does not help — it copies every field including the ones you have never heard of. Name each field you want.",
    explanation:
      "TypeScript does NOT flag `return row` here: excess-property checking only applies to object *literals*, so returning a wider variable is allowed. The row has `passwordHash`, `createdAt` and whatever a migration adds next month — all of which would ship straight to your client. Mapping field by field makes the boundary explicit and makes adding a column a deliberate act. The same reasoning rules out `{ ...row }`.",
    checks: [
      {
        re: "return\\s+row\\s*;",
        expect: false,
        label: "does not `return row`",
      },
      {
        re: "\\.\\.\\.row",
        expect: false,
        label: "does not spread the row either",
      },
      { re: "row\\.id", label: "maps `id` explicitly" },
      { re: "row\\.email", label: "maps `email` explicitly" },
      { re: "row\\.username", label: "maps `username` explicitly" },
      { re: "row\\.role", label: "maps `role` explicitly" },
      {
        re: "row\\.passwordHash",
        expect: false,
        label: "never copies the password hash",
      },
    ],
  },

  {
    id: "service-depends-on-port",
    title: "Point the dependency the right way",
    prompt:
      "This service reaches for Prisma directly. Rewrite it so it depends on the port instead — and so a unit test can hand it a plain object with no database anywhere.",
    language: "typescript",
    starter: `// application/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaUsersRepository } from '../adapters/prisma-users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: PrismaUsersRepository) {}

  getById(id: string) {
    return this.users.findById(id);
  }
}
`,
    solution: `// application/users.service.ts
import { Inject, Injectable } from '@nestjs/common';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../ports/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {}

  getById(id: string) {
    return this.users.findById(id);
  }
}
`,
    hint: "The type comes from `ports/`. The token has to be named explicitly, because an interface is not a value the container can look up.",
    explanation:
      "The arrow now points inward: the adapter depends on the port, and so does the service — neither depends on the other. This is what makes the service testable with `new UsersService(fakeRepo)`: no container, no database, no milliseconds. That speed is a design signal, not a convenience. If your unit tests are slow, something is reaching past its layer.",
    checks: [
      {
        re: "adapters/|PrismaUsersRepository",
        expect: false,
        label: "no longer names the Prisma adapter",
      },
      { re: "ports/", label: "imports from `ports/`" },
      { re: "@Inject\\(", label: "injects by token" },
      { re: "USERS_REPOSITORY", label: "uses the port's `Symbol`" },
      { re: ":\\s*UsersRepository", label: "the field is typed as the interface" },
    ],
  },

  {
    id: "fake-repository",
    title: "Write the fake that makes tests fast",
    prompt:
      "Write an in-memory `UsersRepository` for tests. Same port, no database. It should store users in a `Map` and behave correctly for a missing id.",
    language: "typescript",
    given: `import type { User } from '../domain/user.entity';
import type { UsersRepository } from '../ports/users.repository';

// interface UsersRepository {
//   findById(id: string): Promise<User | null>;
//   create(input: CreateUserInput): Promise<User>;
// }`,
    starter: `// test support

export class InMemoryUsersRepository implements UsersRepository {
  // TODO
}
`,
    solution: `// test support

export class InMemoryUsersRepository implements UsersRepository {
  private readonly rows = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.rows.get(id) ?? null;
  }

  async create(input: { email: string; username: string; passwordHash: string }): Promise<User> {
    const user: User = {
      id: String(this.rows.size + 1),
      email: input.email,
      username: input.username,
      role: 'USER',
    };
    this.rows.set(user.id, user);
    return user;
  }
}
`,
    hint: "`implements` is the only word doing real work here — it makes the compiler check that your fake still satisfies the port when the port changes.",
    explanation:
      "This is a FAKE, not a mock: it has a working implementation, so tests read as behaviour ('create a user, then find it') rather than as choreography ('expect create to have been called once'). Mocks break when you refactor the internals; fakes only break when the port changes, which is exactly when a test should break. And because it `implements` the port, widening the interface fails the build here instead of failing at runtime later.",
    checks: [
      {
        re: "implements\\s+UsersRepository",
        label: "implements the port, so the compiler keeps it honest",
      },
      { re: "new Map", label: "stores rows in memory" },
      { re: "findById", label: "implements `findById`" },
      { re: "create", label: "implements `create`" },
      { re: "\\?\\?\\s*null|:\\s*null|\\|\\|\\s*null", label: "returns null for a missing id" },
      {
        re: "prisma|Prisma|jest\\.fn|sinon",
        expect: false,
        label: "no database and no mocking library",
      },
    ],
  },

  /* ── Part 4: domain modelling ──────────────────────────────────────── */
  {
    id: "invariant",
    title: "Enforce an invariant where it cannot be skipped",
    prompt:
      "An `Order` must never have zero lines, and its total must always equal the sum of its lines. Write the factory so neither can be violated — including by a caller who forgets.",
    language: "typescript",
    given: `interface Line {
  sku: string;
  price: number;
  quantity: number;
}`,
    starter: `// domain/order.entity.ts

export class Order {
  private constructor(
    public readonly id: string,
    public readonly lines: readonly Line[],
    public readonly total: number,
  ) {}

  static create(id: string, lines: Line[]): Order {
    // TODO: enforce both invariants
  }
}
`,
    solution: `// domain/order.entity.ts

export class Order {
  private constructor(
    public readonly id: string,
    public readonly lines: readonly Line[],
    public readonly total: number,
  ) {}

  static create(id: string, lines: Line[]): Order {
    if (lines.length === 0) {
      throw new Error('An order must have at least one line');
    }
    const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    return new Order(id, lines, total);
  }
}
`,
    hint: "The second invariant is not enforced by checking it — it is enforced by never letting the caller supply the total at all.",
    explanation:
      "Two different techniques for two different invariants. The empty-order rule needs a guard, because only a check can catch it. The total rule needs no check at all: by DERIVING the total instead of accepting it, you make disagreement impossible. Prefer the second whenever you can — a rule you cannot break beats a rule you remember to verify. `readonly` then stops anyone editing the lines afterwards and leaving the total stale.",
    checks: [
      { re: "static\\s+create", label: "construction goes through the factory" },
      { re: "lines\\.length\\s*===?\\s*0|!lines\\.length|length\\s*<\\s*1", label: "rejects an empty order" },
      { re: "throw", label: "throws rather than returning something invalid" },
      { re: "reduce|for\\s*\\(|forEach", label: "derives the total from the lines" },
      { re: "price\\s*\\*\\s*(l|line)\\.quantity|quantity\\s*\\*\\s*(l|line)\\.price", label: "total accounts for quantity" },
    ],
  },

  /* ── Part 7: errors ───────────────────────────────────────────────── */
  {
    id: "domain-error",
    title: "An error the domain is allowed to throw",
    prompt:
      "Write the error your domain throws when someone tries to withdraw more than their balance. It must carry enough for a caller to act on, and it must not know that HTTP exists.",
    language: "typescript",
    starter: `// domain/errors.ts

export class InsufficientFunds extends Error {
  // TODO
}
`,
    solution: `// domain/errors.ts

export class InsufficientFunds extends Error {
  constructor(
    readonly requested: number,
    readonly available: number,
  ) {
    super(\`Requested \${requested} but only \${available} available\`);
    this.name = 'InsufficientFunds';
  }
}
`,
    hint: "A caller that catches this should be able to build its own message without re-querying anything. What does it need?",
    explanation:
      "The class name IS the contract — a caller catches `InsufficientFunds`, not a string match on a message. Carrying the numbers means the HTTP layer can build a good 409 and a CLI can build a good stderr line, from the same error. The moment this file imports `HttpException`, the domain is welded to a web framework and you cannot reuse it in a worker, a cron job or a test. Translation to a status code belongs at the boundary, in a filter.",
    checks: [
      { re: "extends\\s+Error", label: "extends `Error`" },
      { re: "class\\s+InsufficientFunds", label: "the class name is the contract" },
      { re: "super\\(", label: "calls `super()` with a message" },
      { re: "requested", label: "carries the requested amount" },
      { re: "available|balance", label: "carries what was available" },
      {
        re: "HttpException|@nestjs|status|401|403|409",
        expect: false,
        label: "knows nothing about HTTP",
      },
    ],
  },

  {
    id: "translate-at-boundary",
    title: "Translate the driver's error at the boundary",
    prompt:
      "Prisma throws `P2002` for a unique-constraint violation. Catch it in the adapter and translate it into something the application layer understands — without letting a Prisma type escape.",
    language: "typescript",
    given: `import { Prisma } from '@prisma/client';
import { EmailAlreadyTaken } from '../domain/errors';

// Prisma.PrismaClientKnownRequestError  — has a \`.code\` string
// 'P2002'                               — unique constraint violated
// new EmailAlreadyTaken(email)          — your domain error`,
    starter: `async create(input: CreateUserInput): Promise<User> {
  const row = await this.prisma.user.create({ data: input });
  return { id: row.id, email: row.email, username: row.username, role: row.role };
}
`,
    solution: `async create(input: CreateUserInput): Promise<User> {
  try {
    const row = await this.prisma.user.create({ data: input });
    return { id: row.id, email: row.email, username: row.username, role: row.role };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new EmailAlreadyTaken(input.email);
    }
    throw error;
  }
}
`,
    hint: "Translate only what you recognise. Anything else must keep travelling — swallowing it hides the bug you most want to see.",
    explanation:
      "Every boundary translates: the driver speaks `P2002`, the domain speaks `EmailAlreadyTaken`, HTTP speaks `409`. Each layer only understands its neighbour's vocabulary, which is why a Prisma error type must not reach the service. The `throw error` at the end matters as much as the catch — a bare `catch {}` that swallows everything turns a connection failure into a mysterious 'email taken'. Catch what you can handle; rethrow the rest.",
    checks: [
      { re: "try\\s*{", label: "wraps the call in a try" },
      { re: "catch", label: "catches the driver error" },
      { re: "P2002", label: "matches the specific error code" },
      { re: "throw\\s+new\\s+\\w*(Taken|Exists|Conflict|Duplicate)", label: "throws a domain error instead" },
      { re: "throw\\s+error|throw\\s+e\\b|throw\\s+err\\b", label: "rethrows anything it does not recognise" },
    ],
  },

  /* ── Part 8: transactions ─────────────────────────────────────────── */
  {
    id: "unit-of-work",
    title: "Put a transaction behind a port",
    prompt:
      "Your service needs two writes to succeed or fail together, but it must not import Prisma to get a transaction. Define the port that gives it atomicity without naming a database.",
    language: "typescript",
    given: `// The adapter will implement this with prisma.$transaction(...).
// This file must not know that.`,
    starter: `// ports/unit-of-work.ts

export interface UnitOfWork {
  // TODO: run a piece of work atomically
}

// TODO: token
`,
    solution: `// ports/unit-of-work.ts

export interface UnitOfWork {
  run<T>(work: () => Promise<T>): Promise<T>;
}

export const UNIT_OF_WORK = Symbol('UnitOfWork');
`,
    hint: "The service should say 'do all of this together' and nothing more. What is the smallest signature that expresses that?",
    explanation:
      "The service says WHAT must be atomic; the adapter decides HOW — `prisma.$transaction`, `BEGIN/COMMIT`, or nothing at all in an in-memory fake. The generic `<T>` matters: without it the work's return value is lost and callers start reaching for outer-scope variables. This is the same move as every other port, applied to a capability rather than a data store — and it is why 'I need a transaction' does not have to mean 'I need to import Prisma here'.",
    checks: [
      { re: "interface\\s+UnitOfWork", label: "declares the port" },
      { re: "<T>", label: "is generic, so the work's result survives" },
      { re: "=>\\s*Promise<T>|\\(\\)\\s*=>", label: "takes the work as a callback" },
      { re: "Promise<T>", label: "returns the work's result" },
      { re: "Symbol\\(", label: "exports a DI token" },
      { re: "prisma|Prisma|\\$transaction", expect: false, label: "names no database" },
    ],
  },

  /* ── Part 15: anti-patterns ───────────────────────────────────────── */
  {
    id: "anaemic-domain",
    title: "Move the rule to where the data is",
    prompt:
      "This is an anaemic domain model: the entity is a bag of fields and the service does all the thinking. Move the rule into the entity so it cannot be bypassed or duplicated.",
    language: "typescript",
    starter: `// domain/account.entity.ts
export class Account {
  constructor(public id: string, public balance: number) {}
}

// application/account.service.ts
export class AccountService {
  withdraw(account: Account, amount: number) {
    if (amount > account.balance) throw new Error('Insufficient funds');
    account.balance = account.balance - amount;
  }
}
`,
    solution: `// domain/account.entity.ts
export class Account {
  constructor(
    public readonly id: string,
    private _balance: number,
  ) {}

  get balance(): number {
    return this._balance;
  }

  withdraw(amount: number): void {
    if (amount <= 0) throw new Error('Amount must be positive');
    if (amount > this._balance) throw new Error('Insufficient funds');
    this._balance -= amount;
  }
}

// application/account.service.ts
export class AccountService {
  withdraw(account: Account, amount: number) {
    account.withdraw(amount);
  }
}
`,
    hint: "Make the balance impossible to assign from outside. Then the only way to change it is the method that enforces the rule.",
    explanation:
      "With a public `balance`, the rule lives in one service today and gets copy-pasted into the next three that touch accounts — and the fourth forgets. Making the field private means there is exactly one way to change it, and it is the way that checks. The service becomes thin, which is correct: its job is orchestration (load, call, save), not business rules. A service full of `if` statements about someone else's fields is the smell.",
    checks: [
      { re: "withdraw\\s*\\(", label: "`withdraw` exists on the entity" },
      { re: "private\\s+_?balance|#balance", label: "the balance cannot be assigned from outside" },
      { re: "class\\s+Account[\\s\\S]*Insufficient", label: "the rule now lives in the entity" },
      { re: "get\\s+balance|balance\\(\\)", label: "exposes the balance read-only" },
      {
        re: "account\\.balance\\s*=",
        expect: false,
        label: "nothing assigns to the balance from outside",
      },
    ],
  },

  {
    id: "leaky-port",
    title: "Fix the leaky port",
    prompt:
      "This port compiles but has failed at its only job. Rewrite it so the application layer learns nothing about the database.",
    language: "typescript",
    starter: `// ports/problems.repository.ts
import type { Prisma, Problem as PrismaProblem } from '@prisma/client';

export interface ProblemsRepository {
  findMany(args: Prisma.ProblemFindManyArgs): Promise<PrismaProblem[]>;
}
`,
    solution: `// ports/problems.repository.ts
import type { Problem } from '../domain/problem.entity';

export interface ListProblemsQuery {
  cursor?: number;
  limit: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface ProblemsRepository {
  list(query: ListProblemsQuery): Promise<{ items: Problem[]; nextCursor: number | null }>;
}
`,
    hint: "Ask what the caller actually wants to say. It wants a page of problems, maybe filtered — not a Prisma query object.",
    explanation:
      "A port typed in the driver's vocabulary is worse than no port: it has the file layout of hexagonal architecture and none of the benefit, because swapping the database now means changing every caller. The test is mechanical — if the port's signature mentions a type you cannot define without the driver installed, it leaks. Express the QUESTION the application is asking, in your own types, and let the adapter translate.",
    checks: [
      {
        re: "@prisma/client|Prisma\\.",
        expect: false,
        label: "imports nothing from Prisma",
      },
      { re: "interface\\s+ProblemsRepository", label: "still declares the port" },
      { re: "limit|take|pageSize", label: "expresses paging in its own terms" },
      { re: "Promise<", label: "stays async" },
      {
        re: "findMany\\s*\\(\\s*args",
        expect: false,
        label: "no longer forwards a raw driver query",
      },
    ],
  },

  {
    id: "silent-catch",
    title: "Stop the silent catch",
    prompt:
      "This `catch` turns every failure into 'user not found', including a database being down. Fix it so only the case you can actually handle is handled.",
    language: "typescript",
    given: `// this.prisma.user.findUnique(...)  — returns the row, or null
// this.toDomain(row)                — maps a row to your User type`,
    starter: `async findByEmail(email: string): Promise<User | null> {
  try {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? this.toDomain(row) : null;
  } catch {
    return null;
  }
}
`,
    solution: `async findByEmail(email: string): Promise<User | null> {
  const row = await this.prisma.user.findUnique({ where: { email } });
  return row ? this.toDomain(row) : null;
}
`,
    hint: "What is this catch protecting against? `findUnique` already returns null for a missing row. Anything it throws is something you genuinely cannot handle here.",
    explanation:
      "The best fix is deleting the catch. `findUnique` already signals absence with `null`, so the only errors reaching this catch are real failures — a dropped connection, a schema mismatch — and turning those into 'no such user' produces a login screen that rejects correct passwords while your logs stay empty. Catch only what you can act on. An error you cannot handle is more useful travelling upward to the one place that logs it.",
    checks: [
      {
        re: "catch\\s*(\\([^)]*\\))?\\s*{\\s*return\\s+null",
        expect: false,
        label: "no longer swallows every error as `null`",
      },
      { re: "findUnique", label: "still performs the lookup" },
      { re: "null", label: "still returns null for a genuinely missing row" },
      { re: "toDomain|return\\s*{", label: "still maps the row out of the driver's shape" },
    ],
  },

  {
    id: "god-service",
    title: "Split the God Service",
    prompt:
      "Sketch the class headers this service should become. Keep only orchestration in `SubmissionsService`; give each other responsibility its own home behind a port.",
    language: "typescript",
    starter: `// Currently one class does all of this:
//   - validates the submitted code
//   - runs it in a sandbox
//   - scores the result
//   - updates the user's rating
//   - sends a notification email
//   - writes an audit log
//
// TODO: write the class/interface headers you would split this into.
//       No bodies needed — just names, and which layer each lives in.
`,
    solution: `// application/
export class SubmissionsService {
  // orchestration only: call each collaborator in order, persist the result
}

// ports/
export interface CodeRunner {
  run(code: string, language: string): Promise<RunResult>;
}

export interface Notifier {
  submissionScored(userId: string, score: number): Promise<void>;
}

export interface AuditLog {
  record(event: string, payload: unknown): Promise<void>;
}

// domain/
export class Score {
  // scoring rules — pure, no I/O
}

export class Rating {
  // rating maths — pure, no I/O
}
`,
    hint: "Two of these are pure calculation with no I/O, so they belong in the domain. Three of them talk to something outside the process, so each needs a port.",
    explanation:
      "The split follows one question per responsibility: does it talk to the outside world? Sandboxes, email and audit sinks do, so each gets a port and an adapter. Scoring and rating are pure functions of their inputs, so they belong in the domain where they can be tested with no setup at all. What remains in the service is the sequence — and a service whose body reads like a list of steps is the right size. The test for 'too big' is not line count, it is how many reasons it has to change.",
    checks: [
      { re: "class\\s+SubmissionsService", label: "keeps a service for orchestration" },
      { re: "interface\\s+\\w*(Runner|Sandbox|Executor)", label: "the sandbox is behind a port" },
      { re: "interface\\s+\\w*(Notifier|Mailer|Email)", label: "notification is behind a port" },
      { re: "interface\\s+\\w*(Audit|Log)", label: "the audit sink is behind a port" },
      { re: "Score|Scoring", label: "scoring gets its own home" },
      { re: "Rating", label: "rating gets its own home" },
    ],
  },

  {
    id: "http-thin",
    title: "Make the controller thin",
    prompt:
      "This controller has business logic in it. Move everything that is not HTTP out, leaving only: take the request, call one thing, shape the response.",
    language: "typescript",
    given: `import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';

// this.orders — an OrdersService, already injected
//   placeOrder(dto: CreateOrderDto): Promise<Order>
//   ...which enforces the rules and does the writing`,
    starter: `@Post()
async create(@Body() dto: CreateOrderDto) {
  if (dto.lines.length === 0) {
    throw new BadRequestException('Order must have lines');
  }
  let total = 0;
  for (const line of dto.lines) {
    total += line.price * line.quantity;
  }
  if (total > 10_000) {
    throw new BadRequestException('Order too large');
  }
  const order = await this.prisma.order.create({
    data: { total, lines: { create: dto.lines } },
  });
  return order;
}
`,
    solution: `@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() dto: CreateOrderDto) {
  const order = await this.orders.placeOrder(dto);
  return { id: order.id, total: order.total };
}
`,
    hint: "Everything between the first line and the last is a rule about orders, not a rule about HTTP. Rules about orders belong to orders.",
    explanation:
      "A controller's job is translation: HTTP in, HTTP out. The moment it contains a business rule, that rule is unreachable from a CLI, a queue consumer or a test — and it will be duplicated the first time one of those needs it. Note the response is mapped rather than returned whole, for the same reason the adapter maps rows: returning the entity directly means tomorrow's new field ships to clients without anyone deciding it should.",
    checks: [
      { re: "this\\.\\w+\\.(place|create|submit)\\w*\\(", label: "delegates to a service" },
      { re: "prisma", expect: false, label: "no database call in the controller" },
      { re: "for\\s*\\(|reduce|\\+=", expect: false, label: "no calculation in the controller" },
      {
        re: "if\\s*\\(\\s*dto\\.|10_000|10000",
        expect: false,
        label: "no business rules in the controller",
      },
      { re: "return\\s*{", label: "shapes the response explicitly" },
    ],
  },

  {
    id: "where-does-it-go",
    title: "Place four pieces of code",
    prompt:
      "For each item, write the folder it belongs in — domain, ports, application, adapters or http. One line each, in the format `// 1. folder — why`.",
    language: "typescript",
    starter: `// 1. "a password must be at least 12 characters" (the RULE itself)
// 2. sending a welcome email
// 3. converting a database row into a User
// 4. deciding that a duplicate email is a 409

// TODO: one line each
`,
    solution: `// 1. domain — it is a rule about passwords, true regardless of transport or storage
// 2. ports — the application needs "notify"; an adapter decides it is SMTP
// 3. adapters — translation between a driver's shape and ours is exactly an adapter's job
// 4. http — the status code is a fact about HTTP; the domain only knows "already taken"
`,
    hint: "Ask of each one: would this still be true if there were no web server, and no database? If yes, it is domain. If it talks to the outside world, it needs a port.",
    explanation:
      "Item 1 catches people out: validating the request is an HTTP concern (a DTO), but the RULE — what makes a password acceptable — is domain, and the DTO should express it rather than own it. Item 4 is the mirror: the domain knows 'this email is taken' and nothing about 409, because status codes are a fact about one transport. The procedure that settles all four is a single question — does this survive if I delete the web server and the database?",
    checks: [
      { re: "1\\.\\s*domain", flags: "mi", label: "1 — the password rule is domain" },
      { re: "2\\.\\s*ports", flags: "mi", label: "2 — sending email goes behind a port" },
      { re: "3\\.\\s*adapters", flags: "mi", label: "3 — row translation is an adapter" },
      { re: "4\\.\\s*http", flags: "mi", label: "4 — the status code is HTTP's business" },
      { re: "—|--|:", label: "gives a reason for each, not just a label" },
    ],
  },

  {
    id: "audit-command",
    title: "Write the audit that proves the rule",
    prompt:
      "Write the one shell command that proves your inner layers never mention the database or the hashing library. It should print nothing when the architecture is intact.",
    language: "bash",
    starter: `# Search the inner layers for any mention of an outside technology.
# Should print NOTHING.

`,
    solution: `grep -rn "prisma\\|argon2" apps/api/src/*/domain apps/api/src/*/application
`,
    hint: "`grep -r` over just the two folders that are supposed to be ignorant. The point is that silence is the pass condition.",
    explanation:
      "This is the whole architecture as one executable assertion, and it takes two seconds. Run it before every commit that touches structure — architecture decays by one import at a time, and each one looks reasonable on its own. A rule you can check mechanically is a rule that survives; a rule that lives only in a document is a rule that erodes. This is also a strong thing to show in an interview: it demonstrates you treat design as something to verify rather than something to intend.",
    checks: [
      { re: "grep", label: "uses grep" },
      { re: "-r|--recursive", label: "searches recursively" },
      { re: "prisma", label: "looks for the database driver" },
      { re: "domain", label: "checks `domain/`" },
      { re: "application", label: "checks `application/`" },
    ],
  },

  {
    id: "two-adapters",
    title: "Prove the port earns its keep",
    prompt:
      "You have an `argon2` adapter for the `PasswordHasher` port. Write a second adapter — a fast, obviously-insecure one for tests — implementing the same port.",
    language: "typescript",
    given: `import type { PasswordHasher } from '../ports/password-hasher.port';

// export interface PasswordHasher {
//   hash(plain: string): Promise<string>;
//   verify(hash: string, plain: string): Promise<boolean>;
// }`,
    starter: `// adapters/fake-password.hasher.ts — TEST ONLY

export class FakePasswordHasher {
  // TODO
}
`,
    solution: `// adapters/fake-password.hasher.ts — TEST ONLY

export class FakePasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return \`fake:\${plain}\`;
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return hash === \`fake:\${plain}\`;
  }
}
`,
    hint: "Mind the argument order — the port says `verify(hash, plain)`. Getting it backwards is a real bug that makes every login fail with an unhelpful error.",
    explanation:
      "Two implementations is when a port stops being ceremony and starts paying: real Argon2 in production at ~45ms, a fake in tests at ~0ms, and the service cannot tell the difference. That is the same mechanism as swapping a database, on a smaller scale. Note the adapter has NO constructor — argon2 is a plain import, not a provider — and that `implements` is what forces this fake to keep up when the port changes.",
    checks: [
      { re: "implements\\s+PasswordHasher", label: "implements the port" },
      { re: "async\\s+hash|hash\\s*\\(", label: "implements `hash`" },
      { re: "verify\\s*\\(\\s*hash", label: "`verify` takes the hash FIRST, as the port declares" },
      { re: "Promise<boolean>|:\\s*boolean", label: "`verify` answers with a boolean" },
      { re: "argon2|bcrypt", expect: false, label: "no real hashing library — this one is for tests" },
    ],
  },

  {
    id: "di-binding",
    title: "Bind the token to an implementation",
    prompt:
      "Write the module that tells the container which implementation stands behind `USERS_REPOSITORY`, and makes `UsersService` — but not the repository — available to other modules.",
    language: "typescript",
    given: `import { Module } from '@nestjs/common';
import { USERS_REPOSITORY } from './ports/users.repository';
import { PrismaUsersRepository } from './adapters/prisma-users.repository';
import { UsersService } from './application/users.service';`,
    starter: `@Module({
  // TODO
})
export class UsersModule {}
`,
    solution: `@Module({
  providers: [
    UsersService,
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
`,
    hint: "Two providers, one of them a custom binding. And `exports` decides what the outside world may reach — leaving the repository out of it is the point.",
    explanation:
      "This single object is where the abstraction meets reality: the interface says WHAT, this says WHICH, and at runtime there is only the instance. Swapping to a different database is one line here and nothing anywhere else. The `exports` list is a second, separate boundary — by exporting only `UsersService`, other modules can ask questions about users but cannot reach the database directly, so 'talk to users through their service' is enforced rather than requested.",
    checks: [
      { re: "providers\\s*:", label: "declares providers" },
      { re: "provide\\s*:\\s*USERS_REPOSITORY", label: "binds the port's token" },
      { re: "useClass\\s*:\\s*Prisma", label: "points it at the Prisma adapter" },
      { re: "exports\\s*:", label: "declares exports" },
      {
        re: "exports\\s*:\\s*\\[[^\\]]*USERS_REPOSITORY",
        expect: false,
        label: "does NOT export the repository — the service is the only door",
      },
    ],
  },

  {
    id: "bounded-context",
    title: "Split one word into two",
    prompt:
      "`User` now means: credentials to auth, a rating and solve history to the arena, and a billing address to payments. Write the three types you would split it into, each named for its own context.",
    language: "typescript",
    starter: `// One shared User type has grown to 20 fields and every module imports it.
// TODO: three types, each owned by one context, each named for that context.
`,
    solution: `// auth/domain/account.entity.ts
export type Account = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

// arena/domain/competitor.entity.ts
export type Competitor = {
  id: string;          // same id — the contexts agree on identity, not shape
  username: string;
  rating: number;
};

// billing/domain/customer.entity.ts
export type Customer = {
  id: string;
  billingEmail: string;
  country: string;
};
`,
    hint: "Keep the id identical across all three. The contexts must agree on WHO someone is; they do not have to agree on what is worth knowing about them.",
    explanation:
      "One shared `User` becomes a magnet: every context adds its fields, nobody dares remove any, and a change for billing forces a redeploy of auth. Splitting by context means each owns a small type it can change freely. The shared id is what keeps them joinable — identity is shared, shape is not. The signal that it is time: when you find yourself writing `if (user.rating !== undefined)` because half the fields are only meaningful to half the callers.",
    checks: [
      { re: "Account|Credentials|Identity", label: "auth gets its own type" },
      { re: "Competitor|Player|Profile", label: "the arena gets its own type" },
      { re: "Customer|Billing", label: "billing gets its own type" },
      { re: "id\\s*:[\\s\\S]*id\\s*:[\\s\\S]*id\\s*:", label: "all three share the same identity field" },
      {
        // The auth type's own braces must not contain an arena or billing field.
        re: "(Account|Credentials|Identity)\\s*=\\s*{[^}]*(rating|billing)",
        flags: "is",
        expect: false,
        label: "the auth type carries no arena or billing fields",
      },
    ],
  },
];
