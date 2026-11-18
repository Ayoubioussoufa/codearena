# Week 3 in two days

**Sat 14 and Sun 15 November, about 12 hours each.** Six lessons and six builds: the queue, idempotency, a million rows, six query plans and the leaderboard. Lesson 17 (isolation) stays cut, to make room for week 5's AI hint.

> **How to use this page.** Each step tells you what to think about, what to build, and a command that proves it works. Under most steps there's an amber **Show walkthrough** button. It holds the full answer: the code, in the order to write it, with why each part is there. **Try the step first.** Open it when you're stuck, or to check your version afterwards. If you copy from it, type it rather than paste it: your fingers learn what your eyes skip. Every walkthrough was built and run against this repo on 14 November, so if yours behaves differently, the difference is the lesson.

**Fast mode for lessons:** read the numbered sections, build the lab, answer the quiz, send `done NNNN`. Skip the drill and the challenge (★).

---

## The reflex: six moves for any feature

Week 2 went wrong because the build started at the keyboard. A professional starts with questions. Use the same six moves, in the same order, on every step of this page, until you do them without thinking.

| Move | The question you ask | What you produce |
|---|---|---|
| 1 · **Say it** | Who calls this, with what, and what do they get back? | One sentence, plus one example request and response |
| 2 · **Break it** | What are the six what-ifs? | A list of failures, each with a decision |
| 3 · **Place it** | Which layer owns this, where does the state live, and in what order are the writes? | A file name and an order of writes |
| 4 · **Test it** | Which test fails today and passes when I'm right? | A red test |
| 5 · **Build it** | What's the smallest code that turns it green? | Code, then typecheck, then test |
| 6 · **Prove it** | Did I see it work for real, and can I explain it in one sentence? | A command's output, a commit, an interview sentence |

### The six what-ifs (move 2)

Ask all six, every time. Most will have a boring answer. The one that doesn't is your bug, found before you wrote it.

| What if… | It means | Week 3's answer |
|---|---|---|
| **Who?** someone else calls it | authorization | `GET /submissions/:id` answers 404 to anyone but the owner |
| **Bad input?** the input is wrong, huge or hostile | validation at the edge | a DTO, and a cap on the code's size |
| **Twice?** it runs twice | idempotency | the job id, then the claim (lesson 14) |
| **Halfway?** it dies in the middle | order of writes, retries | the row before the job; retries and a terminal state |
| **Together?** two run at the same moment | races | one conditional `UPDATE`, never read-then-write |
| **A million?** the table is huge | indexes, pagination | six plans (lessons 15–16), a sorted set (lesson 18) |

Week 3 **is** these six questions. The queue answers *Twice*, *Halfway* and *Together*. The SQL work and the leaderboard answer *A million*.

### Where things go (move 3)

Your modules already follow one layout. When you don't know where a line belongs, use this table.

| Layer | Folder | Knows about | Never knows about |
|---|---|---|---|
| Domain | `domain/` | plain types and rules | Nest, Prisma, HTTP |
| Port | `ports/` | an interface and a token | who implements it |
| Application | `application/` | the use case, through ports | Prisma, BullMQ, Express |
| Adapter | `adapters/` | one technology (Prisma, BullMQ, Redis) | the use case |
| Inbound | `http/` in the API, `queue/` in the worker | DTOs, status codes, jobs | the database |

**Build order inside a feature:** domain → port → service with its unit test (fakes) → adapter → controller with its e2e test. You go from the part with no dependencies to the part with the most.

**Why ports at all, in one example from this weekend:** the submissions service talks to a `JudgeQueue` port. In block A, the port is bound to a class that only logs. In block B, it's bound to BullMQ. In the tests, it's bound to a fake that records ids. The service never changes: that's the whole point.

### The loop inside move 5

```text
write a little → pnpm --filter <app> typecheck → run the one test → run it for real → commit
```

Never write for 30 minutes without running something. An error after 5 lines points at 5 lines.

````walkthrough
title: The commands you'll use all weekend
```bash
# The API
pnpm --filter api typecheck
pnpm --filter api test submissions          # one unit spec, by file name
pnpm --filter api test:e2e submissions      # one e2e spec
pnpm --filter api exec eslint --fix         # Prettier's formatting, fixed for you

# The worker
pnpm --filter worker typecheck
pnpm --filter worker test                   # unit tests only, no Docker
pnpm --filter worker run test:integration   # Docker, Postgres and Redis tests

# One test inside a file, by its name
pnpm --filter api test submissions -t "row before"

# The infrastructure
docker compose up -d postgres redis
docker exec -it codearena-postgres psql -U codearena -d codearena
docker exec -it codearena-redis redis-cli
```

**Reading a failing test:** the first line under `●` is the test's name. `Expected` and `Received` show the difference. The `>` line points at the exact assertion. Read those three things before you change any code.
````

---

## The two days at a glance

| When | Block | Lesson (fast mode) | Build |
|---|---|---|---|
| **Sat** · 0 h 00 | 0 | | Finish Monday: the module compiles |
| 0 h 15 | A | 12 · the request pipeline | `POST /submissions` and `GET /submissions/:id`, with a fake queue |
| 3 h 30 | B | 13 · a queue from scratch | BullMQ: the API enqueues, the worker judges and stores the verdict |
| 8 h 00 | C | 14 · idempotency | The claim, the idempotency test, retries, a terminal state |
| **Sun** · 0 h 00 | D | 15 · how an index works, 16 · reading plans | Seed a million rows |
| 4 h 00 | E | | Six queries, six plans, the ADR |
| 8 h 00 | F | 18 · the leaderboard | A sorted set the worker updates, `GET /leaderboard` |
| 11 h 30 | | | Checkpoint |

Take 10 minutes off after every block. One DSA problem a day if you want it, and nothing else.

**If a block runs over by more than an hour,** stop and tell me where you are. We'll cut scope together. The order of cuts is: the dead-letter handling in C, queries 5–6 in E, `GET /leaderboard/me` in F.

**One branch per block, one PR each:** `feat/api-submissions` (0 and A), `feat/worker-queue` (B), `feat/worker-idempotent-claim` (C), `perf/six-plans` (D and E), `feat/leaderboard-redis` (F). Say "pushed" in the terminal after each, and I open the PR and handle CI.

---

## Block 0 · Finish Monday (15 min)

Your port declares `problemExists`, `create` and `findById`. Your adapter implements them, and the module is registered in `AppModule`. That part is done: commit `082d33b`.

**One thing to fix before block A.** Your adapter declares `create(submissions: Submission)`, but the port says `create(data: NewSubmission)`. TypeScript accepts it, because method parameters are checked loosely (*bivariance*), so the compiler won't catch it. But the service will pass a `NewSubmission`, which has no `runtimeMs` and no `createdAt`, and your adapter reads both. It works today only because Prisma treats `undefined` as "use the default". Make the adapter's signature match the port exactly: an adapter must never ask for more than its port promises.

- **Prove:** `pnpm --filter api typecheck` prints nothing.

---

## Block A · POST /submissions, with a fake queue

**Before:** [lesson 12](/courses/lessons/0012-request-pipeline), fast mode (65 min).

You build the whole API side **without Redis**. The service talks to the `JudgeQueue` port, and the tests bind that port to a fake. BullMQ arrives in block B, as one new adapter, and the service doesn't change. That's what the port is for.

### A1 · Say it (10 min, no code)

Write these in a comment at the top of the service, or on paper.

- `POST /submissions` with `{ problemId, language, code }`, from a logged-in user → **202** with `{ id }`. Why 202 and not 201? Lesson 13, section 1, has the answer: the work is accepted, not done.
- `GET /submissions/:id` → 200 with the submission, for its owner only.

**Why this step matters:** these two sentences are the API's contract. The web client, the e2e test and the interviewer all read the same two lines. If you can't write them, you don't know what you're building yet.

### A2 · Break it (10 min, no code)

Answer the six what-ifs for `POST /submissions` before you read on. Then compare.

- **Who?** No token → 401. Your global `AuthGuard` already does this. The user id comes from `@CurrentUser()`, **never** from the body: a body can say anything.
- **Bad input?** Unknown language, missing field → 400 from the `ValidationPipe`. Code too long → 400. Pick a cap (64 KB is common) and say why a judge needs one: the code is stored, copied into a container, and shown back to the user.
- **Bad input, again:** a `problemId` that doesn't exist → 404, and nothing is queued.
- **Twice?** A double click creates two submissions. That's acceptable: they are two submissions. A job delivered twice is a different problem, for block C.
- **Halfway?** The API dies between "write the row" and "enqueue". Which order leaves the better mess? Decide before A4.
- **A million?** Not yet.

```check
w3-api
```

### A3 · Test it: the service's unit test (30 min)

Create `application/submissions.service.spec.ts`. Read `auth.service.spec.ts` first: it shows how your tests build a service with fakes.

Write two small fakes in the spec file: a fake repository (an array in memory) and a fake queue (it records the ids it was given). Then three tests, all red at first:

1. submitting creates one PENDING submission and enqueues exactly one job, with that submission's id;
2. an unknown problem throws `NotFoundException`, and the queue received nothing;
3. the row exists before the job is enqueued (make the fake queue check the fake repository when `enqueue` is called).

- **Why fakes and not mocks:** a fake is a small working implementation (an array is a database that forgets). It lets the test check *results* ("one row exists") instead of *calls* ("`create` was called with…"). Tests on results survive refactoring; tests on calls break every time you rename something.
- **Hint 1:** a fake is a class that `implements` the port. TypeScript tells you what's missing.
- **Hint 2:** you don't need `Test.createTestingModule` here. `new SubmissionsService(fakeRepo, fakeQueue)` is a unit test with no Nest at all.
- **Prove:** `pnpm --filter api test submissions` shows failing tests that fail for the right reason: `submit is not a function`, not a compile error in your fakes.

````walkthrough
title: A3 · the spec, with its two fakes (6 tests)
Write it in this order: the fakes first (they're the "world" the service lives in), then one `describe` per method, then one `it` per behaviour. Each test has three blocks separated by a blank line: **arrange** (set up), **act** (one call), **assert** (check the world).

```ts
// apps/api/src/submissions/application/submissions.service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import type { Submission } from '../domain/submissions.entity';
import type {
  NewSubmission,
  SubmissionsRepository,
} from '../ports/submissions.repository';
import type { JudgeQueue } from '../ports/judge-queue';

/** A repository in memory. Problem 1 exists; nothing else does. */
class FakeRepo implements SubmissionsRepository {
  readonly rows: Submission[] = [];

  problemExists(problemId: number): Promise<boolean> {
    return Promise.resolve(problemId === 1);
  }

  create(data: NewSubmission): Promise<Submission> {
    const row: Submission = {
      ...data,
      id: `sub-${this.rows.length + 1}`,
      verdict: 'PENDING',
      runtimeMs: null,
      createdAt: new Date(),
    };
    this.rows.push(row);
    return Promise.resolve(row);
  }

  findById(id: string): Promise<Submission | null> {
    return Promise.resolve(this.rows.find((r) => r.id === id) ?? null);
  }
}

/** Records every id it's given, and whether the row existed at that moment. */
class FakeQueue implements JudgeQueue {
  readonly ids: string[] = [];
  readonly rowExistedWhenEnqueued: boolean[] = [];

  constructor(private readonly repo: FakeRepo) {}

  enqueue(submissionId: string): Promise<void> {
    this.ids.push(submissionId);
    this.rowExistedWhenEnqueued.push(
      this.repo.rows.some((r) => r.id === submissionId),
    );
    return Promise.resolve();
  }
}

describe('SubmissionsService', () => {
  const input = {
    problemId: 1,
    language: 'JAVASCRIPT' as const,
    code: 'console.log(1)',
  };

  let repo: FakeRepo;
  let queue: FakeQueue;
  let service: SubmissionsService;

  // Fresh fakes for every test: no test can leak rows into the next one.
  beforeEach(() => {
    repo = new FakeRepo();
    queue = new FakeQueue(repo);
    service = new SubmissionsService(repo, queue);
  });

  describe('submit', () => {
    it('stores one PENDING submission and enqueues exactly its id', async () => {
      const { id } = await service.submit('alice', input);

      expect(repo.rows).toHaveLength(1);
      expect(repo.rows[0]).toMatchObject({
        id,
        userId: 'alice',
        verdict: 'PENDING',
      });
      expect(queue.ids).toEqual([id]);
    });

    it('rejects an unknown problem, and stores and queues nothing', async () => {
      await expect(
        service.submit('alice', { ...input, problemId: 999 }),
      ).rejects.toThrow(NotFoundException);

      expect(repo.rows).toHaveLength(0);
      expect(queue.ids).toHaveLength(0);
    });

    it('writes the row before it enqueues the job', async () => {
      await service.submit('alice', input);

      expect(queue.rowExistedWhenEnqueued).toEqual([true]);
    });
  });

  describe('getForOwner', () => {
    it("returns the owner's submission", async () => {
      const { id } = await service.submit('alice', input);

      await expect(service.getForOwner('alice', id)).resolves.toMatchObject({
        id,
      });
    });

    it("answers 404, not 403, for someone else's submission", async () => {
      const { id } = await service.submit('alice', input);

      await expect(service.getForOwner('bob', id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('answers 404 for an id that does not exist', async () => {
      await expect(service.getForOwner('alice', 'nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

**Three details worth noticing:**

- `'JAVASCRIPT' as const` keeps the literal type. Without it, TypeScript widens it to `string`, which isn't a `Language`.
- `await expect(promise).rejects.toThrow(…)` is how you test an async throw. Forget the `await`, and the test passes before the promise settles: a test that can't fail.
- The fake queue receives the repository in its constructor. That's how test 3 can ask "did the row exist at the moment you were called?" A fake can observe things a mock can't.
````

### A4 · Build it: the service (30 min)

Add a `submit(userId, input)` method and a `getForOwner(userId, id)` method. Delete your old pass-through methods (`create`, `problemExists`, `findById`): a service that only forwards calls to the repository is a layer with nothing in it.

- **Think:** the three lines of `submit` are "check the problem, write the row, enqueue". The order is your answer to *Halfway?*.
- **Hint:** inject the queue the same way as the repository: `@Inject(JUDGE_QUEUE)`.
- **`getForOwner`:** not found and "not yours" give the **same** `NotFoundException`. A 403 would tell an attacker that the id exists.
- **Prove:** all six tests are green.

````walkthrough
title: A4 · the service
```ts
// apps/api/src/submissions/application/submissions.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  SUBMISSIONS_REPOSITORY,
  type NewSubmission,
  type SubmissionsRepository,
} from '../ports/submissions.repository';
import { JUDGE_QUEUE, type JudgeQueue } from '../ports/judge-queue';
import type { Submission } from '../domain/submissions.entity';

/** What the caller supplies. The user id comes from the token, never the body. */
export type SubmitInput = Omit<NewSubmission, 'userId'>;

/**
 * POST /submissions → 202 { id }: the work is accepted, not done.
 * GET /submissions/:id → the submission, for its owner only.
 */
@Injectable()
export class SubmissionsService {
  constructor(
    @Inject(SUBMISSIONS_REPOSITORY)
    private readonly repo: SubmissionsRepository,
    @Inject(JUDGE_QUEUE) private readonly queue: JudgeQueue,
  ) {}

  async submit(userId: string, input: SubmitInput): Promise<{ id: string }> {
    if (!(await this.repo.problemExists(input.problemId))) {
      throw new NotFoundException(`Problem ${input.problemId} not found`);
    }
    // The row first, then the job. If we die in between, the row waits as
    // PENDING, which we can find and re-enqueue. The other order would give
    // the worker a job pointing at a row that doesn't exist yet.
    const submission = await this.repo.create({ userId, ...input });
    await this.queue.enqueue(submission.id);
    return { id: submission.id };
  }

  async getForOwner(userId: string, id: string): Promise<Submission> {
    const submission = await this.repo.findById(id);
    // Same answer for "doesn't exist" and "not yours": a 403 would confirm
    // to a stranger that the id exists.
    if (!submission || submission.userId !== userId) {
      throw new NotFoundException('Submission not found');
    }
    return submission;
  }
}
```

**Why `@Inject(TOKEN)` and not just the type:** `SubmissionsRepository` is an interface, and interfaces vanish when TypeScript compiles to JavaScript. Nest can't inject something that doesn't exist at runtime, so the symbol `SUBMISSIONS_REPOSITORY` stands in for it. That's the "Tokens" section of the NestJS guide.

**Why `Omit<NewSubmission, 'userId'>`:** the type itself says "the caller doesn't choose the user". If someone later passes the body straight in, the compiler stops them.
````

### A5 · Build it: the Prisma adapter (25 min)

Fix the three methods of `prisma-submissions.repository.ts`, so they match the port exactly.

- **Think:** the adapter's job is translation: a Prisma row in, a domain `Submission` out. You wrote that mapping twice. Extract it into one small `toDomain(row)` function and reuse it.
- **Hint for `problemExists`:** you need a yes or a no, not the row. Your `count` works. `findUnique` with `select: { id: true }` also works, and stops at the first match, through the primary key.
- **Prove:** `pnpm --filter api typecheck`.

````walkthrough
title: A5 · the adapter, with one toDomain
```ts
// apps/api/src/submissions/adapters/prisma-submissions.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  NewSubmission,
  SubmissionsRepository,
} from '../ports/submissions.repository';
import type { Submission } from '../domain/submissions.entity';
import type { Submission as SubmissionRow } from '../../../generated/prisma/client';

/** The adapter's one job: a Prisma row in, a domain Submission out. */
function toDomain(row: SubmissionRow): Submission {
  return {
    id: row.id,
    problemId: row.problemId,
    userId: row.userId,
    language: row.language,
    verdict: row.verdict,
    code: row.code,
    runtimeMs: row.runtimeMs,
    createdAt: row.createdAt,
  };
}

@Injectable()
export class PrismaSubmissionsRepository implements SubmissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async problemExists(problemId: number): Promise<boolean> {
    // A yes or a no: fetch the id only, not the whole problem.
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId },
      select: { id: true },
    });
    return problem !== null;
  }

  async create(data: NewSubmission): Promise<Submission> {
    // verdict, runtimeMs and createdAt come from the schema's defaults.
    const row = await this.prisma.submission.create({ data });
    return toDomain(row);
  }

  async findById(id: string): Promise<Submission | null> {
    const row = await this.prisma.submission.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }
}
```

**Why map at all, if the fields are the same today?** Because they won't stay the same. In block C you add `claimedBy` and `claimedAt` columns, which the API's domain must never see. `toDomain` is the one place that decides what crosses the boundary.

**`import type { Submission as SubmissionRow }`:** the Prisma model and your domain type have the same name. Renaming one on import keeps both readable.

`runtimeMs: row.runtimeMs` is enough: `x !== null ? x : null` is the same value.
````

### A6 · Build it: the DTO and the controller (30 min)

- `http/dto/create-submission.dto.ts`: copy the style of `register.dto.ts`. One decorator per rule: an integer `problemId`, a `language` the judge can run, a `code` that's a non-empty string with a maximum length.
- The controller: two handlers, `@Post()` and `@Get(':id')`. `@HttpCode(202)` on the POST. `@CurrentUser()` gives you the payload: check `jwt-payload.ts` for the field that holds the user's id (it's `sub`).
- **For now,** bind `JUDGE_QUEUE` in the module to a tiny adapter that only logs the id (`adapters/logging-judge.queue.ts`). The app must start without Redis today.
- **Trap:** Express's default JSON body limit is 100 KB. A body above it never reaches your DTO. Send a 200 KB body and look at the status. (It's a **500**, which is wrong: the client made the mistake. The second walkthrough below fixes it.)

**Why `language` accepts only `JAVASCRIPT`:** the worker can only run JavaScript. If the API accepted `PYTHON`, it would store a submission the worker can never judge: the user would get an error instead of a verdict. Validation at the edge should reflect what the system can really do.

````walkthrough
title: A6 · the DTO, the controller, the logging queue, the module
```ts
// apps/api/src/submissions/http/dto/create-submission.dto.ts
import {
  IsIn,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * A judge needs a cap: the code is stored, sent to a container, and read by
 * a human on a bad day. 64 K characters is far above any real solution.
 */
export const MAX_CODE_LENGTH = 64 * 1024;

export class CreateSubmissionDto {
  @IsInt()
  @Min(1)
  problemId!: number;

  // Only what the judge can run today. Accepting PYTHON would store a
  // submission that the worker can only fail with an error, not a verdict.
  @IsIn(['JAVASCRIPT'], {
    message: 'language must be JAVASCRIPT, the only language the judge runs',
  })
  language!: 'JAVASCRIPT';

  @IsString()
  @MinLength(1)
  @MaxLength(MAX_CODE_LENGTH)
  code!: string;
}
```

The `!` after each field means "assigned from outside": the `ValidationPipe` fills them in, not a constructor. It must be a **class**, not an interface: decorators need something that exists at runtime.

```ts
// apps/api/src/submissions/http/submissions.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SubmissionsService } from '../application/submissions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-payload';
import { CreateSubmissionDto } from './dto/create-submission.dto';

/** Judging is the most expensive thing we do, so it's the most worth spamming. */
const SUBMIT_RATE_LIMIT = { default: { limit: 10, ttl: 60_000 } };

// No @Public(): the global AuthGuard makes every route here require a token.
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED) // 202: accepted, not done. The verdict comes later.
  @Throttle(SUBMIT_RATE_LIMIT)
  submit(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubmissionDto) {
    return this.submissions.submit(user.sub, dto);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const s = await this.submissions.getForOwner(user.sub, id);
    // The response is a contract: list the fields on purpose.
    return {
      id: s.id,
      problemId: s.problemId,
      language: s.language,
      verdict: s.verdict,
      runtimeMs: s.runtimeMs,
      code: s.code,
      createdAt: s.createdAt,
    };
  }
}
```

Your current file imports `AuthGuard`. Remove it: the guard is already global (`APP_GUARD` in `AppModule`), so importing it here does nothing, and a reader would think it does.

```ts
// apps/api/src/submissions/adapters/logging-judge.queue.ts
import { Injectable, Logger } from '@nestjs/common';
import type { JudgeQueue } from '../ports/judge-queue';

/** A stand-in until BullMQ arrives: the app runs today without Redis. */
@Injectable()
export class LoggingJudgeQueue implements JudgeQueue {
  private readonly logger = new Logger(LoggingJudgeQueue.name);

  enqueue(submissionId: string): Promise<void> {
    this.logger.log(`would enqueue submission ${submissionId}`);
    return Promise.resolve();
  }
}
```

In `submissions.module.ts`, add one provider next to the repository:

```ts
{ provide: JUDGE_QUEUE, useClass: LoggingJudgeQueue },
```
````

````walkthrough
title: A6 · the 500 trap: a body over 100 KB
**What happens:** Express parses the JSON body before Nest's pipeline starts. A body over 100 KB makes the parser throw a `PayloadTooLargeError`. It's not an `HttpException`, so your `AllExceptionsFilter` treats it as a crash and answers **500 Internal server error**. The client sent too much, so the right answer is **413 Payload Too Large**.

Broken JSON doesn't have this problem: Nest turns it into a 400 itself. Only the size limit slips through.

**The fix:** the parser's error carries a `status` field. Read it in the filter, and accept it only for a 4xx.

```ts
// apps/api/src/common/filters/all-exceptions.filter.ts, inside catch()
const isHttp = exception instanceof HttpException;
const parserStatus = bodyParserStatus(exception);
const status = isHttp
  ? exception.getStatus()
  : (parserStatus ?? HttpStatus.INTERNAL_SERVER_ERROR);

// 4xx: tell the client what they did wrong — they can fix it.
// 5xx: a generic message. Details go to the log, never to the client.
const message = isHttp
  ? clientMessage(exception)
  : parserStatus !== null && exception instanceof Error
    ? exception.message
    : 'Internal server error';

if (!isHttp && parserStatus === null) {
  this.logger.error(/* …unchanged… */);
}
```

```ts
// at the bottom of the same file
/**
 * Express's body parser rejects some requests before Nest sees them: a body
 * over the size limit gets a PayloadTooLargeError, which is not an
 * HttpException but carries `status: 413`. Without this, the client gets a
 * 500 for its own mistake.
 */
function bodyParserStatus(exception: unknown): number | null {
  if (
    exception instanceof Error &&
    'status' in exception &&
    typeof exception.status === 'number' &&
    exception.status >= 400 &&
    exception.status < 500
  ) {
    return exception.status;
  }
  return null;
}
```

**Why only 4xx:** a 5xx error object from a library might carry internal details. A 4xx from the parser describes the client's own request, so it's safe to show.

The e2e test in A7 has a case for this: write it first, watch it get 500, then fix the filter.
````

### A7 · Test it and prove it: e2e (40 min)

Create `test/submissions.e2e-spec.ts`, modelled on `auth.e2e-spec.ts`. Use `overrideProvider(JUDGE_QUEUE)` with a fake, so the test needs no Redis.

Six cases: no token → 401 · valid → 202 and a PENDING row in the database · someone else's id → 404 · code over the cap → 400 naming the field · a 200 KB body → 413 · an unknown problem → 404 with nothing queued.

**Why e2e here, on top of the unit tests:** the unit tests prove the service's logic. They can't prove that the guard runs, that the DTO rejects a long code, that the filter turns a parser error into a 413, or that 202 is what really goes out. Those live in the glue between parts, and only a test that sends real HTTP sees the glue.

- **Prove for real:** start the API, log in with Postman, `POST /submissions`, then look at the row: `docker exec -it codearena-postgres psql -U codearena -c 'select id, verdict from "Submission" order by "createdAt" desc limit 1'`. The API's log shows `would enqueue submission …`.
- **Commit:** `feat(api): accept submissions and answer 202`. Push, and say "pushed".
- **Say it (interview):** "The endpoint answers 202 because judging takes seconds. It writes a PENDING row, then enqueues only the id, so the queue never carries user code."

````walkthrough
title: A7 · the e2e spec (6 tests)
Two things are different from `auth.e2e-spec.ts`, and both come from CI:

1. **CI migrates the database but doesn't seed it**, so problem 2001 doesn't exist there. The test creates its own problem, and deletes it at the end.
2. **CI's e2e job has no Redis** (yet). The queue is overridden with a fake that records ids, so the test can also check what was queued.

```ts
// apps/api/test/submissions.e2e-spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { JUDGE_QUEUE } from '../src/submissions/ports/judge-queue';

describe('Submissions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let problemId: number;
  const queued: string[] = [];

  const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const password = 'correct-horse-battery';
  const alice = {
    email: `sub-a-${unique}@test.com`,
    username: `suba${unique}`.slice(0, 20),
  };
  const bob = {
    email: `sub-b-${unique}@test.com`,
    username: `subb${unique}`.slice(0, 20),
  };
  let aliceToken: string;
  let bobToken: string;

  const http = () => request(app.getHttpServer());

  const tokenFor = async (user: { email: string; username: string }) => {
    await http()
      .post('/auth/register')
      .send({ ...user, password })
      .expect(201);
    const res = await http()
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(200);
    return (res.body as { accessToken: string }).accessToken;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      // Same reason as in auth.e2e-spec.ts: the limit is tested elsewhere.
      .overrideProvider(ThrottlerStorage)
      .useValue({
        increment: () =>
          Promise.resolve({
            totalHits: 1,
            timeToExpire: 60,
            isBlocked: false,
            timeToBlockExpire: 0,
          }),
      })
      // This suite is about HTTP. The queue gets its own test; here a fake
      // records the ids, so the suite needs no Redis.
      .overrideProvider(JUDGE_QUEUE)
      .useValue({
        enqueue: (id: string) => {
          queued.push(id);
          return Promise.resolve();
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    // Configured EXACTLY like main.ts.
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    prisma = app.get(PrismaService);

    // CI migrates the database but doesn't seed it: bring our own problem.
    const problem = await prisma.problem.create({
      data: {
        slug: `e2e-problem-${unique}`,
        title: 'E2E problem',
        difficulty: 'EASY',
        description: ['Print 1.'],
        constraints: [],
        starterCode: {},
      },
    });
    problemId = problem.id;

    aliceToken = await tokenFor(alice);
    bobToken = await tokenFor(bob);
  });

  afterAll(async () => {
    // Users cascade to their submissions; then the problem has none left.
    await prisma.user.deleteMany({
      where: { email: { in: [alice.email, bob.email] } },
    });
    await prisma.problem.delete({ where: { id: problemId } });
    await app.close();
  });

  const submit = (token: string, body: object) =>
    http()
      .post('/submissions')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  const valid = () => ({
    problemId,
    language: 'JAVASCRIPT',
    code: 'console.log(1)',
  });

  it('refuses a submission without a token', async () => {
    await http().post('/submissions').send(valid()).expect(401);
  });

  it('accepts a valid submission with 202, stores it PENDING, and queues its id', async () => {
    const res = await submit(aliceToken, valid()).expect(202);
    const { id } = res.body as { id: string };

    const row = await prisma.submission.findUnique({ where: { id } });
    expect(row).toMatchObject({ verdict: 'PENDING', problemId });
    expect(queued).toContain(id);
  });

  it('lets the owner read it, and answers 404 to anyone else', async () => {
    const res = await submit(aliceToken, valid()).expect(202);
    const { id } = res.body as { id: string };

    await http()
      .get(`/submissions/${id}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .expect(200);
    await http()
      .get(`/submissions/${id}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .expect(404);
  });

  it('refuses code over the cap with 400, and names the field', async () => {
    const res = await submit(aliceToken, {
      ...valid(),
      code: 'x'.repeat(70_000),
    }).expect(400);

    const { message } = res.body as { message: string[] };
    expect(message).toEqual(
      expect.arrayContaining([expect.stringContaining('code')]),
    );
  });

  it('answers 413, not 500, for a body over the parser limit', async () => {
    await submit(aliceToken, { ...valid(), code: 'x'.repeat(200_000) }).expect(
      413,
    );
  });

  it('answers 404 for a problem that does not exist, and queues nothing', async () => {
    const before = queued.length;
    await submit(aliceToken, { ...valid(), problemId: 999_999 }).expect(404);
    expect(queued).toHaveLength(before);
  });
});
```

**Why 70,000 characters for the 400 test, and 200,000 for the 413:** the DTO's cap is 65,536 characters, and the parser's is 100 KB. 70,000 characters is over the first and under the second, so it reaches the DTO. 200,000 never gets that far.

**Run it:** `pnpm --filter api test:e2e submissions`. On my run, the whole e2e suite was 24 tests, all green.
````

---

## Block B · The queue: BullMQ, and the worker stores the verdict

**Before:** [lesson 13](/courses/lessons/0013-queue-from-scratch), fast mode (90 min). The lab is the important part: you build a queue on Redis lists and find its hole yourself.

**The picture for this block:**

```text
API ──POST──▶ Postgres: Submission (PENDING)
    └──add({ submissionId }, jobId = submissionId)──▶ Redis: bull:judge:<id>
                                                          │
Worker ◀──────────────── takes the job ───────────────────┘
    ├─ load: code + tests + limits from Postgres
    ├─ judge: DockerCodeRunner, once per test
    └─ save: verdict + runtimeMs to Postgres
```

The API and the worker never talk to each other. They share a queue name, a job's shape (`{ submissionId }`) and a database. That's what lets you restart either one without losing a submission.

### B1 · Decide: how does the worker reach the database? (15 min, no code)

The worker has no Prisma today. Three options:

| Option | For | Against |
|---|---|---|
| The worker gets its own Prisma client, generated from the API's schema | simple, one schema file, typed | two apps can write the same tables |
| A shared `packages/db` that both apps import | one client, one place | a refactor of the API today |
| The worker calls the API over HTTP to read and write | one writer | a new internal endpoint to secure, and a second network hop |

Pick one and write three lines in `docs/adr/` as a *Proposed* ADR. I recommend the first for a two-day budget. Whichever you choose, put it **behind a port in the worker** (`ports/submission-store.port.ts`: load a submission with its problem's tests and limits, save a verdict), so the choice can change later.

**The security angle, for ADR-007:** the worker holds the Docker socket and runs hostile code. Whatever database access it has is what an attacker gets if the sandbox ever leaks. Write down that, today, it can read and write every table, and that a database role limited to `Submission`, `Problem` and `TestCase` is the fix for later.

````walkthrough
title: B1 · option 1, set up: a second generator for the worker
**1. One more generator in the API's schema.** Prisma can generate several clients from one schema. Add this block next to the existing `generator client`, in `apps/api/prisma/schema.prisma`:

```prisma
// The worker's own client, generated from this same schema. One schema means
// a renamed column breaks the worker's build, not its first job in production.
generator worker {
  provider            = "prisma-client"
  output              = "../../worker/src/generated/prisma"
  moduleFormat        = "cjs"
  importFileExtension = ""
  runtime             = "nodejs"
}
```

The `output` path is relative to the schema file, so it lands in `apps/worker/src/generated/prisma`. The repo's `.gitignore` already ignores every `generated/` folder.

**2. Generate both clients:**

```bash
pnpm --filter api exec prisma generate
# ✔ Generated Prisma Client (7.8.0) to ./generated/prisma
# ✔ Generated Prisma Client (7.8.0) to ./../worker/src/generated/prisma
```

From now on, this one command regenerates both. CI's build job already runs it.

**3. The worker's dependencies:**

```bash
pnpm --filter worker add @prisma/client@^7.8.0 @prisma/adapter-pg@^7.10.0
```

Use the same versions as the API: two different Prisma runtimes in one repo is a bug you'd find at 2 a.m.

**4. Tell ESLint to skip generated code**, in `apps/worker/eslint.config.mjs`:

```js
ignores: ['eslint.config.mjs', 'dist/**', 'src/generated/**'],
```

**5. A `.env` for the worker.** Create `apps/worker/.env.example`, and commit it:

```bash
# Copy to .env. Never commit .env.
DATABASE_URL=postgresql://codearena:codearena@localhost:5433/codearena?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379
```

Then `cp apps/worker/.env.example apps/worker/.env`. `ConfigModule` reads `.env` from the folder the app starts in, and `pnpm --filter worker …` starts it in `apps/worker`.

**Prove:** `pnpm --filter worker typecheck` prints nothing. The generated client compiles under the worker's strict settings.
````

### B2 · The API's BullMQ adapter (40 min)

- Install in the API: `pnpm --filter api add @nestjs/bullmq bullmq ioredis`.
- `BullModule.forRootAsync` in `AppModule`, reading `REDIS_HOST` and `REDIS_PORT` from your validated config. `BullModule.registerQueue({ name: 'judge' })` in `SubmissionsModule`. ([NestJS: queues](https://docs.nestjs.com/techniques/queues))
- `adapters/bullmq-judge.queue.ts` implements `JudgeQueue`. It injects the queue with `@InjectQueue('judge')` and calls `add`. Rebind `JUDGE_QUEUE` to it in the module, in place of the logging one.
- **Think (Twice?):** BullMQ ignores a job whose `jobId` already exists in the queue. So what should the job id be? ([BullMQ: job ids](https://docs.bullmq.io/guide/jobs/job-ids))
- **Trap, from the same page:** a custom job id must not contain `:` and must not be only digits. A cuid like `cmwh057jh00027suckq2i9fk9` is fine.
- **Trap:** that protection ends when the first job is removed (for example by `removeOnComplete`). The job id narrows the window; it doesn't close it. Block C closes it.
- **The payload** is `{ submissionId }` and nothing else. Why not the code? Say two reasons out loud.
- **Prove:** start the API, submit once, then `docker exec -it codearena-redis redis-cli keys 'bull:judge:*'` shows the job waiting. Your e2e tests still pass, because they override the port.

````walkthrough
title: B2 · install, the two traps, and the adapter
**Install three packages, not two.** BullMQ 6 made `ioredis` an *optional* dependency, so it isn't installed for you. Without it, the app fails at start-up with *"BullMQ could not load the optional 'ioredis' package"*.

```bash
pnpm --filter api add @nestjs/bullmq bullmq ioredis
```

**Teach Jest about the new package.** `@nestjs/bullmq` 12 is published as ES modules only, and Jest runs CommonJS. Your config already makes an exception for `@nestjs/jwt` and `@nestjs/config`. Add two names to the same pattern, in **both** `apps/api/package.json` (the `jest` key) and `apps/api/test/jest-e2e.json`:

```json
"transformIgnorePatterns": [
  "node_modules/(?!.*@nestjs[+/](jwt|config|bullmq|bull-shared))"
]
```

Without it, the e2e suite fails before any test runs, with `SyntaxError: Unexpected token 'export'`. Read the pattern as: "ignore node_modules when transforming, **except** these packages".

**The contract, in the port.** Add to `ports/judge-queue.ts`:

```ts
/**
 * The contract with the worker: the queue's name and the job's payload. The
 * worker declares the same two things on its side.
 */
export const JUDGE_QUEUE_NAME = 'judge';
export type JudgeJobData = { submissionId: string };
```

**One Redis connection for the whole app**, in `app.module.ts`'s `imports`:

```ts
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

// …inside imports: [ … ]
// One Redis connection for every queue in the app, from the validated env.
BullModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    connection: {
      host: config.getOrThrow<string>('REDIS_HOST'),
      port: config.getOrThrow<number>('REDIS_PORT'),
    },
  }),
}),
```

`forRootAsync` with `useFactory` is the pattern for "configure a module from values that only exist at runtime". It's in the NestJS guide, under "Dynamic modules".

**The adapter:**

```ts
// apps/api/src/submissions/adapters/bullmq-judge.queue.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import {
  JUDGE_QUEUE_NAME,
  type JudgeJobData,
  type JudgeQueue,
} from '../ports/judge-queue';

@Injectable()
export class BullmqJudgeQueue implements JudgeQueue {
  constructor(
    @InjectQueue(JUDGE_QUEUE_NAME)
    private readonly queue: Queue<JudgeJobData>,
  ) {}

  async enqueue(submissionId: string): Promise<void> {
    // The payload is a pointer, never the code: the worker reads the row,
    // which is the truth, and 64 KB of user code never sits in Redis.
    // jobId = submissionId: BullMQ ignores an add whose id already exists,
    // so enqueuing the same submission twice makes one job.
    await this.queue.add(
      'judge',
      { submissionId },
      {
        jobId: submissionId,
        // Keep some history to look at, but don't let Redis fill up.
        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );
  }
}
```

**The module:**

```ts
// apps/api/src/submissions/submissions.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SubmissionsController } from './http/submissions.controller';
import { SubmissionsService } from './application/submissions.service';
import { SUBMISSIONS_REPOSITORY } from './ports/submissions.repository';
import { JUDGE_QUEUE, JUDGE_QUEUE_NAME } from './ports/judge-queue';
import { PrismaSubmissionsRepository } from './adapters/prisma-submissions.repository';
import { BullmqJudgeQueue } from './adapters/bullmq-judge.queue';

@Module({
  imports: [BullModule.registerQueue({ name: JUDGE_QUEUE_NAME })],
  controllers: [SubmissionsController],
  providers: [
    SubmissionsService,
    { provide: SUBMISSIONS_REPOSITORY, useClass: PrismaSubmissionsRepository },
    { provide: JUDGE_QUEUE, useClass: BullmqJudgeQueue },
  ],
})
export class SubmissionsModule {}
```

Keep `logging-judge.queue.ts` or delete it, your choice. Notice that the service and its six unit tests didn't change at all.

**The two reasons not to put the code in the payload:** (1) the row is the truth. If the job carried a copy, the two could disagree. (2) Redis holds everything in memory: a thousand 64 KB jobs is 64 MB of RAM for data that's already in Postgres.
````

### B3 · The worker: a store adapter (45 min)

Implement the port from B1 with the option you chose. Two methods are enough:

- load: the code, the language, the problem's test cases in order, and its limits (`timeLimitMs`, `memoryLimitMb`);
- save the verdict: `verdict` and `runtimeMs`. Your schema has no column for the failing test's number yet. Decide whether to add it now (one more migration) or leave it out, and write the decision down.

Validate the worker's environment with Zod, as the API does in `env.schema.ts`.

**Why one query for the load:** Prisma's nested `select` turns "the submission, its problem's limits, and its tests" into a single round trip. Three separate queries would be three chances for the data to change in between, and three times the latency.

````walkthrough
title: B3 · the env schema, PrismaService, the port, the adapter
```ts
// apps/worker/src/config/env.schema.ts
import { z } from "zod";

/** The worker fails at start-up, not on its first job, if its env is wrong. */
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string().min(1).default("localhost"),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => ` • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `\nInvalid environment variables:\n${details}\n\n` +
        `Check apps/worker/.env against apps/worker/.env.example\n`,
    );
  }
  return result.data;
}
```

```ts
// apps/worker/src/prisma/prisma.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

/** The same shape as the API's PrismaService, on the worker's own client. */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg(config.getOrThrow<string>("DATABASE_URL")),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

```ts
// apps/worker/src/ports/submission-store.port.ts
import type { Language } from "../domain/run-result.entity";
import type { Judgement, TestCase } from "../domain/verdict.entity";

/** Everything the worker needs to judge one submission, read from the database. */
export type JudgeTask = {
  submissionId: string;
  code: string;
  language: Language;
  /** In order: the judge stops at the first failure. */
  tests: TestCase[];
  timeLimitMs: number;
  memoryLimitMb: number;
};

/** Where submissions come from and where verdicts go. The worker never sees Prisma. */
export interface SubmissionStore {
  /** Null if the submission doesn't exist (deleted since it was queued). */
  load(submissionId: string): Promise<JudgeTask | null>;
  saveVerdict(submissionId: string, judgement: Judgement): Promise<void>;
}

export const SUBMISSION_STORE = Symbol("SubmissionStore");
```

```ts
// apps/worker/src/adapters/prisma-submission.store.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type {
  JudgeTask,
  SubmissionStore,
} from "../ports/submission-store.port";
import type { Judgement } from "../domain/verdict.entity";

@Injectable()
export class PrismaSubmissionStore implements SubmissionStore {
  constructor(private readonly prisma: PrismaService) {}

  async load(submissionId: string): Promise<JudgeTask | null> {
    // One query: the submission, its problem's limits, and the tests in order.
    const row = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        code: true,
        language: true,
        problem: {
          select: {
            timeLimitMs: true,
            memoryLimitMb: true,
            testCases: {
              orderBy: { order: "asc" },
              select: { input: true, expected: true },
            },
          },
        },
      },
    });
    if (!row) return null;
    return {
      submissionId,
      code: row.code,
      language: row.language,
      tests: row.problem.testCases,
      timeLimitMs: row.problem.timeLimitMs,
      memoryLimitMb: row.problem.memoryLimitMb,
    };
  }

  async saveVerdict(submissionId: string, judgement: Judgement): Promise<void> {
    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { verdict: judgement.verdict, runtimeMs: judgement.maxTimeMs },
    });
  }
}
```

The worker's `TestCase` type (`{ input, expected }`) and Prisma's `select` produce the same shape, so `row.problem.testCases` goes straight into the task with no mapping. The worker's `Verdict` values are all in the database's enum, so `judgement.verdict` is accepted as-is.

**The failing test's number:** I left it out (no column). It's a one-line migration (`failedTest Int?`) when the web page needs "Wrong answer on test 4". Write that decision in the PR.
````

### B4 · The worker: the processor (60 min)

- Install in the worker: `pnpm --filter worker add @nestjs/bullmq bullmq ioredis`.
- A class with `@Processor('judge')` that `extends WorkerHost` and implements `process(job)`. It must be listed in the module's `providers`, or Nest never finds it.
- `process` does one thing: it calls a use case (`JudgeSubmissionService.handle(id)`) that loads the submission, calls `judge.judge(...)`, and saves the verdict.
- Remove the smoke test from `main.ts`. The worker now stays alive and waits for jobs.

**Why a separate use case and not the logic inside `process`:** the processor is an *inbound adapter*, like a controller. It knows about BullMQ jobs. The use case knows about judging. Split this way, you can unit-test the judging logic by calling `handle('sub-1')`, without starting BullMQ or building fake `Job` objects.

**Test first** (`application/judge-submission.service.spec.ts`, with `FakeCodeRunner` and a fake store):

1. an accepted run saves `ACCEPTED`;
2. a wrong answer saves `WRONG_ANSWER` and **does not throw**;
3. the runner throwing (Docker is down) **does throw**, and nothing is saved.

- **Think:** tests 2 and 3 are the most important rule of the block. For BullMQ, a throw means "this job failed", and with `attempts` set it runs again. A wrong answer is a successful job. ([BullMQ: retrying failing jobs](https://docs.bullmq.io/guide/retrying-failing-jobs))

```check
w3-queue
```

````walkthrough
title: B4 · the unit spec (4 tests)
```ts
// apps/worker/src/application/judge-submission.service.spec.ts
import { JudgeService } from "./judge.service";
import { JudgeSubmissionService } from "./judge-submission.service";
import { FakeCodeRunner } from "../adapters/fake-code.runner";
import type {
  JudgeTask,
  SubmissionStore,
} from "../ports/submission-store.port";
import type { Judgement } from "../domain/verdict.entity";

/** One submission in memory, and every verdict it was given. */
class FakeStore implements SubmissionStore {
  readonly saved: Judgement[] = [];

  constructor(private readonly task: JudgeTask | null) {}

  load(): Promise<JudgeTask | null> {
    return Promise.resolve(this.task);
  }

  saveVerdict(_id: string, judgement: Judgement): Promise<void> {
    this.saved.push(judgement);
    return Promise.resolve();
  }
}

const task: JudgeTask = {
  submissionId: "sub-1",
  code: "console.log(1)",
  language: "JAVASCRIPT",
  tests: [{ input: "", expected: "1" }],
  timeLimitMs: 1000,
  memoryLimitMb: 256,
};

const printed = (stdout: string) => ({
  outcome: "EXIT" as const,
  exitCode: 0,
  stdout,
  stderr: "",
  timeMs: 12,
});

describe("JudgeSubmissionService", () => {
  let runner: FakeCodeRunner;

  beforeEach(() => {
    runner = new FakeCodeRunner();
  });

  // The REAL JudgeService, on a fake runner: we test the whole use case,
  // and only fake what touches the outside world.
  const serviceWith = (store: FakeStore) =>
    new JudgeSubmissionService(store, new JudgeService(runner));

  it("stores ACCEPTED for a right answer", async () => {
    const store = new FakeStore(task);
    runner.willReturn(printed("1\n"));

    await serviceWith(store).handle("sub-1");

    expect(store.saved).toEqual([
      { verdict: "ACCEPTED", failedTest: null, maxTimeMs: 12 },
    ]);
  });

  it("stores WRONG_ANSWER and resolves: a wrong answer is a successful job", async () => {
    const store = new FakeStore(task);
    runner.willReturn(printed("2\n"));

    await expect(serviceWith(store).handle("sub-1")).resolves.toBeUndefined();

    expect(store.saved).toMatchObject([{ verdict: "WRONG_ANSWER" }]);
  });

  it("throws when the runner throws, and stores nothing, so BullMQ retries", async () => {
    const store = new FakeStore(task);
    runner.willReturnInOrder([new Error("Docker is down")]);

    await expect(serviceWith(store).handle("sub-1")).rejects.toThrow(
      "Docker is down",
    );

    expect(store.saved).toEqual([]);
  });

  it("skips a submission that no longer exists, without throwing", async () => {
    const store = new FakeStore(null);

    await expect(serviceWith(store).handle("gone")).resolves.toBeUndefined();

    expect(store.saved).toEqual([]);
    expect(runner.inputs).toEqual([]);
  });
});
```

`FakeCodeRunner` is the one you built in week 2. `willReturnInOrder([new Error(…)])` makes the first run reject, which is exactly "Docker is down".

**Why a missing submission doesn't throw:** a retry won't make a deleted row come back. Throwing would burn every retry on a job that can never succeed. Log it and finish the job.
````

````walkthrough
title: B4 · the use case, the processor, the module, main.ts
```ts
// apps/worker/src/application/judge-submission.service.ts
import { Inject, Injectable, Logger } from "@nestjs/common";
import { JudgeService } from "./judge.service";
import {
  SUBMISSION_STORE,
  type SubmissionStore,
} from "../ports/submission-store.port";
import type { RunLimits } from "../ports/code-runner.port";

/** The sandbox's fixed walls. Time and memory come from the problem. */
const PIDS = 64;
const MAX_OUTPUT_BYTES = 1024 * 1024;

/**
 * One job: load the submission, judge it, store the verdict.
 *
 * A wrong answer is a successful job: it resolves. Only OUR failures throw
 * (Docker down, database down), and a throw tells BullMQ to retry.
 */
@Injectable()
export class JudgeSubmissionService {
  private readonly logger = new Logger(JudgeSubmissionService.name);

  constructor(
    @Inject(SUBMISSION_STORE) private readonly store: SubmissionStore,
    private readonly judge: JudgeService,
  ) {}

  async handle(submissionId: string): Promise<void> {
    const task = await this.store.load(submissionId);
    if (!task) {
      // Deleted since it was queued. Nothing to judge, and retrying won't help.
      this.logger.warn(`Submission ${submissionId} not found, skipped`);
      return;
    }

    const limits: RunLimits = {
      timeoutMs: task.timeLimitMs,
      memoryMb: task.memoryLimitMb,
      pids: PIDS,
      maxOutputBytes: MAX_OUTPUT_BYTES,
    };
    const judgement = await this.judge.judge(
      task.code,
      task.language,
      task.tests,
      limits,
    );
    await this.store.saveVerdict(submissionId, judgement);
    this.logger.log(`Submission ${submissionId}: ${judgement.verdict}`);
  }
}
```

There's no `try/catch` here, on purpose. If the runner throws, the error goes up to BullMQ, which is exactly what should happen.

```ts
// apps/worker/src/queue/judge-job.ts
/**
 * The contract with the API: the queue's name and the job's payload. The API
 * declares the same two things in its judge-queue port.
 */
export const JUDGE_QUEUE_NAME = "judge";
export type JudgeJobData = { submissionId: string };
```

```ts
// apps/worker/src/queue/judge.processor.ts
import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { JudgeSubmissionService } from "../application/judge-submission.service";
import { JUDGE_QUEUE_NAME, type JudgeJobData } from "./judge-job";

/**
 * The worker's inbound adapter: what a controller is to the API. It turns a
 * job into a call to the use case, and knows nothing about judging.
 */
@Processor(JUDGE_QUEUE_NAME)
export class JudgeProcessor extends WorkerHost {
  constructor(private readonly judging: JudgeSubmissionService) {
    super();
  }

  async process(job: Job<JudgeJobData>): Promise<void> {
    await this.judging.handle(job.data.submissionId);
  }
}
```

`super()` is required: `WorkerHost` is a class with its own constructor, and a subclass must call it before using `this`.

```ts
// apps/worker/src/worker.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { validateEnv } from "./config/env.schema";
import { PrismaService } from "./prisma/prisma.service";
import { JudgeService } from "./application/judge.service";
import { JudgeSubmissionService } from "./application/judge-submission.service";
import { CODE_RUNNER } from "./ports/code-runner.port";
import { SUBMISSION_STORE } from "./ports/submission-store.port";
import { DockerCodeRunner } from "./adapters/docker-code.runner";
import { PrismaSubmissionStore } from "./adapters/prisma-submission.store";
import { JudgeProcessor } from "./queue/judge.processor";
import { JUDGE_QUEUE_NAME } from "./queue/judge-job";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow<string>("REDIS_HOST"),
          port: config.getOrThrow<number>("REDIS_PORT"),
        },
      }),
    }),
    BullModule.registerQueue({ name: JUDGE_QUEUE_NAME }),
  ],
  providers: [
    PrismaService,
    JudgeService,
    JudgeSubmissionService,
    // Listed here, or Nest never finds it and no job is ever processed.
    JudgeProcessor,
    { provide: CODE_RUNNER, useClass: DockerCodeRunner },
    { provide: SUBMISSION_STORE, useClass: PrismaSubmissionStore },
  ],
})
export class WorkerModule {}
```

```ts
// apps/worker/src/main.ts
import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module";

async function bootstrap() {
  // createApplicationContext, NOT create: the DI container with no HTTP
  // server. A worker that runs hostile code should not also be a network
  // service.
  const app = await NestFactory.createApplicationContext(WorkerModule);

  // SIGTERM or Ctrl-C → app.close() → the BullMQ worker closes: it takes no
  // new job and lets the active one finish. Without this, a deploy kills a
  // job mid-run, and it comes back later as "stalled".
  app.enableShutdownHooks();

  new Logger("Worker").log("Waiting for jobs on the judge queue");
}

void bootstrap();
```

**Why the process doesn't exit after `bootstrap()` returns:** the BullMQ worker holds an open connection to Redis, and Node stays alive while a socket is open. Before, the smoke test closed the app, so the process ended.
````

### B5 · Shut down cleanly (20 min)

A worker killed in the middle of a job leaves that job to be picked up again later as *stalled*. Closing the worker lets the active job finish first. ([BullMQ: graceful shutdown](https://docs.bullmq.io/guide/workers/graceful-shutdown))

- `app.enableShutdownHooks()` in the worker's `main.ts` (it's in the B4 walkthrough), so SIGTERM closes the Nest app, and the BullMQ worker with it.
- **Prove:** submit an infinite loop (`while(true){}`), press Ctrl-C in the worker's terminal about a second later, and watch: the worker logs the `TIME_LIMIT` verdict, **then** exits. No `codearena-run-` container is left (`docker ps -a`). On my run, the worker exited 1.6 s after Ctrl-C, with the verdict stored.
- **Trap, when you test it from a script:** if you start the worker through a wrapper (a shell, `pnpm`), sending the signal to the wrapper's PID doesn't reach Node. Ctrl-C in the terminal reaches the whole process group, which is why it works there.

### B6 · Prove it, end to end (15 min)

Start Postgres, Redis, the API (`pnpm dev:api`) and the worker (`pnpm --filter worker dev`). Submit a correct solution to problem 2001 with Postman: the reference is `apps/api/prisma/seed-data/original/quiet-stretch/solution.js`. Within a few seconds, `GET /submissions/:id` shows `ACCEPTED`. Submit a wrong one (`console.log(42)`), then an infinite loop.

What I saw: `ACCEPTED` (236 ms), `WRONG_ANSWER` (147 ms), `TIME_LIMIT` (1932 ms).

- **Commit:** `feat(worker): consume the judge queue and store verdicts`. Push, and say "pushed".
- **Say it:** "The API and the worker share nothing but a queue name and a submission id. I can restart either one without losing a submission."

---

## Block C · Twice, together, halfway

**Before:** [lesson 14](/courses/lessons/0014-idempotency), fast mode (75 min). The lab's `claim.sql` is the statement you'll write again in Prisma.

**Why this block exists:** BullMQ promises *at-least-once* delivery. If a worker stalls (a long run, a GC pause, a lost connection), BullMQ gives the job to another worker, while the first one may still be running it. You can't prevent the second delivery. You can only make it harmless. The *claim* is how: before running anything, a worker moves the submission from `PENDING` to `JUDGING` in **one** statement. Only one caller can win that statement.

### C1 · Say it and break it (15 min, no code)

Write your design in lesson 14's section 7 box:

- the claim's condition;
- the lease's duration, and why (it must outlast the slowest legal run: all tests × the time limit, plus container start-up);
- which errors are retried, and how many times;
- what the user sees after the last retry.

````walkthrough
title: C1 · the design I built and tested
- **The claim's condition:** the submission is `PENDING`, **or** it's `JUDGING` and its claim is older than the lease (the worker that holds it is dead).
- **The lease:** 5 minutes. The slowest legal run is about 20 tests × (a 5 s limit + 1 s of grace + start-up), so about 2 minutes. 5 minutes leaves a wide margin. Too short, and a slow but healthy run gets taken over and judged twice. Too long, and a crashed worker's submission waits that long before anyone retries it.
- **Retries:** only our failures (the runner or the database throwing). 3 attempts in total, with exponential backoff: 2 s, then 4 s. A wrong answer never throws, so it's never retried.
- **On failure:** the attempt gives its claim back (`JUDGING → PENDING`) before it throws, so the retry 2 seconds later can claim it at once instead of waiting 5 minutes.
- **After the last retry:** a new verdict, `SYSTEM_ERROR`. The web page says "judging failed on our side, please resubmit". Never `PENDING` forever.
- **The claimant:** `hostname:pid:random` per attempt, so every attempt is distinguishable, and you can read in the database who holds what.
````

### C2 · The schema (20 min)

The claim needs somewhere to live. Your `Verdict` enum has `PENDING` but no "running" state.

- **Decide:** a `JUDGING` value in the enum, or a separate `status` column. Add `claimedBy` and `claimedAt`. One migration.
- **Think:** what will the web page show for each state? That question usually settles the design.
- **Trap:** the API's domain `Verdict` type in `submissions.entity.ts` must gain the same values, or `toDomain` stops compiling. That compile error is good news: it's the type system telling you that two definitions drifted apart.

````walkthrough
title: C2 · the schema change and the migration
In `schema.prisma`:

```prisma
enum Verdict {
  PENDING
  ACCEPTED
  WRONG_ANSWER
  TIME_LIMIT
  RUNTIME_ERROR
  COMPILE_ERROR
  MEMORY_LIMIT
  OUTPUT_LIMIT
  JUDGING // a worker holds the claim (claimedBy, claimedAt)
  SYSTEM_ERROR // our failure, after the last retry: the user should resubmit
}

model Submission {
  // …the existing fields…
  // The claim: which worker is judging it, and since when. A claim older
  // than the lease belongs to a dead worker and can be taken over.
  claimedBy String?
  claimedAt DateTime?
  // …the existing @@index lines…
}
```

Then:

```bash
pnpm --filter api exec prisma migrate dev --create-only --name add_submission_claim
```

Read the SQL before you apply it. It should be exactly this, and nothing else:

```sql
ALTER TYPE "Verdict" ADD VALUE 'JUDGING';
ALTER TYPE "Verdict" ADD VALUE 'SYSTEM_ERROR';
ALTER TABLE "Submission" ADD COLUMN "claimedAt" TIMESTAMP(3),
ADD COLUMN "claimedBy" TEXT;
```

Two nullable columns and two enum values: an *expand-only* migration. No existing row changes, and the old code keeps working while the new code rolls out. Apply it with `pnpm --filter api exec prisma migrate dev`, which also regenerates both clients.

Then add `'JUDGING' | 'SYSTEM_ERROR'` to the API's `Verdict` type in `submissions.entity.ts`.

**Why the enum and not a `status` column:** your `Verdict` already mixes states (`PENDING`) with results (`ACCEPTED`), so one more state fits the existing design, and the web page needs one field to decide what to show. A separate `status` column would be cleaner if results and states ever needed different lifecycles. Either is defensible: write one line on why you chose yours.
````

### C3 · Test it: the idempotency test (40 min)

This is the test you'll describe in interviews. In the worker, with `FakeCodeRunner` (count its calls) and a **real** Postgres, because the guarantee lives in the database:

1. the same job processed twice, one after the other → the runner ran once;
2. the same job processed twice **concurrently** (`Promise.all`) → the runner ran once, one verdict written;
3. a claim whose lease has expired (a dead worker's) can be taken over.

- **Hint:** name it `judge-submission.integration-spec.ts`, so it runs with `test:integration`, apart from the fast unit tests.
- **Prove it can fail:** write the claim wrong first (read, then write), and watch test 2 fail. Then write it right.

````walkthrough
title: C3 · Jest settings, then the integration spec (3 tests)
**First, two Jest settings in the worker**, or the spec fails to load. `@nestjs/config` and `@nestjs/bullmq` are ES modules, the same problem as the API's in B2. In `apps/worker/package.json`, inside the `jest` key:

```json
"transformIgnorePatterns": [
  "node_modules/(?!.*@nestjs[+/](config|bullmq|bull-shared))"
]
```

And in `apps/worker/tsconfig.spec.json`, so ts-jest agrees to transform those JavaScript files:

```json
"allowJs": true
```

**The spec:**

```ts
// apps/worker/src/application/judge-submission.integration-spec.ts
import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { JudgeService } from "./judge.service";
import { JudgeSubmissionService } from "./judge-submission.service";
import { FakeCodeRunner } from "../adapters/fake-code.runner";
import { PrismaSubmissionStore } from "../adapters/prisma-submission.store";
import { PrismaService } from "../prisma/prisma.service";
import { CODE_RUNNER } from "../ports/code-runner.port";
import { SUBMISSION_STORE } from "../ports/submission-store.port";
import { validateEnv } from "../config/env.schema";

/**
 * The idempotency test. The guarantee lives in the database, so this runs
 * against real Postgres. The runner is a fake: what we count is how many
 * times it was called.
 */
describe("Judging a submission delivered twice", () => {
  let prisma: PrismaService;
  let runner: FakeCodeRunner;
  let judging: JudgeSubmissionService;
  let userId: string;
  let problemId: number;

  const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const TESTS = 2;

  beforeAll(async () => {
    runner = new FakeCodeRunner();
    runner.willReturn({
      outcome: "EXIT",
      exitCode: 0,
      stdout: "1\n",
      stderr: "",
      timeMs: 5,
    });

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })],
      providers: [
        PrismaService,
        JudgeService,
        JudgeSubmissionService,
        { provide: CODE_RUNNER, useValue: runner },
        { provide: SUBMISSION_STORE, useClass: PrismaSubmissionStore },
      ],
    }).compile();
    await moduleRef.init();

    prisma = moduleRef.get(PrismaService);
    judging = moduleRef.get(JudgeSubmissionService);

    const user = await prisma.user.create({
      data: {
        email: `idem-${unique}@test.com`,
        username: `idem${unique}`.slice(0, 20),
        passwordHash: "not-a-real-hash",
      },
    });
    userId = user.id;
    const problem = await prisma.problem.create({
      data: {
        slug: `idem-${unique}`,
        title: "Idempotency",
        difficulty: "EASY",
        description: ["Print 1."],
        constraints: [],
        starterCode: {},
        testCases: {
          create: Array.from({ length: TESTS }, (_, order) => ({
            input: "",
            expected: "1",
            order,
          })),
        },
      },
    });
    problemId = problem.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } }); // cascades to submissions
    await prisma.problem.delete({ where: { id: problemId } });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    runner.inputs.length = 0;
  });

  const newSubmission = () =>
    prisma.submission.create({
      data: { userId, problemId, language: "JAVASCRIPT", code: "console.log(1)" },
    });

  it("judges once when the same job arrives twice, one after the other", async () => {
    const { id } = await newSubmission();

    await judging.handle(id);
    await judging.handle(id);

    expect(runner.inputs).toHaveLength(TESTS); // one run per test, not two
    const row = await prisma.submission.findUniqueOrThrow({ where: { id } });
    expect(row.verdict).toBe("ACCEPTED");
  });

  it("judges once when the same job arrives twice at the same moment", async () => {
    const { id } = await newSubmission();

    await Promise.all([judging.handle(id), judging.handle(id)]);

    expect(runner.inputs).toHaveLength(TESTS);
  });

  it("lets a new attempt take over a claim whose lease has expired", async () => {
    const { id } = await newSubmission();
    // A worker claimed it an hour ago, then died.
    await prisma.submission.update({
      where: { id },
      data: {
        verdict: "JUDGING",
        claimedBy: "dead-worker",
        claimedAt: new Date(Date.now() - 60 * 60_000),
      },
    });

    await judging.handle(id);

    const row = await prisma.submission.findUniqueOrThrow({ where: { id } });
    expect(row.verdict).toBe("ACCEPTED");
  });
});
```

**How the count works:** `FakeCodeRunner` pushes every stdin into `runner.inputs`. One judging of a problem with 2 tests runs it twice. So 2 means "judged once", and 4 means "judged twice".

**Run it:** `pnpm --filter worker exec jest --testRegex 'judge-submission\.integration-spec\.ts$' --runInBand`. It reads `DATABASE_URL` from `apps/worker/.env`. In block F, add `{ provide: LEADERBOARD, useValue: { recordSolve: () => Promise.resolve(true) } }` to the providers.

**What I saw when I broke it on purpose:** with a read-then-write claim, the concurrent test failed with `Expected length: 2, Received length: 4`: both callers read `PENDING`, then both wrote. With the one-statement claim, it passed 6 runs out of 6.
````

### C4 · Build it: the claim and the fenced finish (45 min)

- Add `claim(submissionId, claimant, leaseMs)` to the store port. It returns whether you won.
- **Hint:** Prisma's `updateMany` takes the condition in `where` and returns a `count`. One statement, so the database decides the winner. No `findUnique` before it.
- The use case: if the claim is lost, return quietly. That's a successful job: someone else is judging it.
- Saving the verdict is conditional too: only if this attempt still holds the claim (lesson 14, section 2, *fencing*). If it doesn't, its lease expired and someone else took over: drop the verdict.
- **Prove:** C3's tests go green. Then break the claim on purpose (make it read-then-write), watch test 2 fail, and put it back.

**Why `updateMany` and not `update`:** `update` needs a *unique* `where` (an id), and throws if no row matches. `updateMany` accepts any condition and returns `{ count }`: 1 means you won, 0 means someone else did. "No row matched" is the normal answer for a loser, not an error.

**Why one statement is safe:** two `UPDATE`s on the same row can't run at the same moment. Postgres locks the row for the first one. The second waits, then re-checks its `WHERE` against the row as the first one left it. By then the row says `JUDGING`, so the second matches nothing. You don't write any locking code: the database does it.

```check
w3-claim
```

````walkthrough
title: C4 · the port, the adapter's claim, and the use case
```ts
// apps/worker/src/ports/submission-store.port.ts (the interface, now)
export interface SubmissionStore {
  /**
   * Moves the submission to JUDGING for `claimant`, if it's PENDING or its
   * claim is older than `leaseMs`. One statement: the database picks the
   * winner. True if this caller won.
   */
  claim(submissionId: string, claimant: string, leaseMs: number): Promise<boolean>;
  /** Null if the submission doesn't exist (deleted since it was queued). */
  load(submissionId: string): Promise<JudgeTask | null>;
  /** Fenced: writes only if `claimant` still holds the claim. True if written. */
  saveVerdict(
    submissionId: string,
    claimant: string,
    judgement: Judgement,
  ): Promise<boolean>;
  /** Gives the claim back (JUDGING → PENDING), so a retry can take it. */
  release(submissionId: string, claimant: string): Promise<void>;
  /** The end of the line: our failure, after the last retry. */
  markSystemError(submissionId: string): Promise<void>;
}
```

The four new methods in `prisma-submission.store.ts` (`load` doesn't change):

```ts
async claim(
  submissionId: string,
  claimant: string,
  leaseMs: number,
): Promise<boolean> {
  // updateMany, not findUnique-then-update: ONE statement that checks and
  // writes. Two workers racing both send it; Postgres runs them one after
  // the other on the row, and the second one's WHERE no longer matches.
  const { count } = await this.prisma.submission.updateMany({
    where: {
      id: submissionId,
      OR: [
        { verdict: "PENDING" },
        // A claim older than the lease belongs to a dead worker.
        {
          verdict: "JUDGING",
          claimedAt: { lt: new Date(Date.now() - leaseMs) },
        },
      ],
    },
    data: { verdict: "JUDGING", claimedBy: claimant, claimedAt: new Date() },
  });
  return count === 1;
}

async saveVerdict(
  submissionId: string,
  claimant: string,
  judgement: Judgement,
): Promise<boolean> {
  // Fenced: if our claim was taken over (we were too slow, and the lease
  // expired), someone else's verdict wins and ours is dropped.
  const { count } = await this.prisma.submission.updateMany({
    where: { id: submissionId, verdict: "JUDGING", claimedBy: claimant },
    data: { verdict: judgement.verdict, runtimeMs: judgement.maxTimeMs },
  });
  return count === 1;
}

async release(submissionId: string, claimant: string): Promise<void> {
  await this.prisma.submission.updateMany({
    where: { id: submissionId, verdict: "JUDGING", claimedBy: claimant },
    data: { verdict: "PENDING", claimedBy: null, claimedAt: null },
  });
}

async markSystemError(submissionId: string): Promise<void> {
  // Only if no verdict was written: never overwrite a real result.
  await this.prisma.submission.updateMany({
    where: { id: submissionId, verdict: { in: ["PENDING", "JUDGING"] } },
    data: { verdict: "SYSTEM_ERROR", claimedBy: null, claimedAt: null },
  });
}
```

**The use case, now** (it replaces `handle` from B4):

```ts
import { randomUUID } from "node:crypto";
import { hostname } from "node:os";

/**
 * How long a claim protects a submission. It must outlast the slowest legal
 * run: 20 tests × (a 5 s limit + 1 s grace + start-up) is about 2 minutes,
 * so 5 minutes leaves room. Too short, and a slow run gets judged twice.
 */
export const LEASE_MS = 5 * 60_000;

async handle(submissionId: string): Promise<void> {
  // Unique per attempt, readable in the database when you debug.
  const claimant = `${hostname()}:${process.pid}:${randomUUID().slice(0, 8)}`;

  if (!(await this.store.claim(submissionId, claimant, LEASE_MS))) {
    // Already judged, being judged, or deleted. Not an error: a second
    // delivery is supposed to end here.
    this.logger.log(`Submission ${submissionId} not claimable, skipped`);
    return;
  }

  try {
    const task = await this.store.load(submissionId);
    if (!task) return; // deleted between the claim and the load

    const limits: RunLimits = {
      timeoutMs: task.timeLimitMs,
      memoryMb: task.memoryLimitMb,
      pids: PIDS,
      maxOutputBytes: MAX_OUTPUT_BYTES,
    };
    const judgement = await this.judge.judge(
      task.code,
      task.language,
      task.tests,
      limits,
    );

    if (await this.store.saveVerdict(submissionId, claimant, judgement)) {
      this.logger.log(`Submission ${submissionId}: ${judgement.verdict}`);
    } else {
      this.logger.warn(`Submission ${submissionId}: lost the claim, verdict dropped`);
    }
  } catch (error) {
    // Our failure. Give the claim back so the retry can take it now,
    // instead of waiting for the lease to expire.
    await this.store.release(submissionId, claimant);
    throw error;
  }
}

/** After the last retry: the user sees SYSTEM_ERROR, not PENDING forever. */
async giveUp(submissionId: string): Promise<void> {
  await this.store.markSystemError(submissionId);
  this.logger.error(`Submission ${submissionId}: SYSTEM_ERROR after the last retry`);
}
```

**The order is the design:** claim (cheap, and it decides everything), then load, then the expensive run, then the fenced save. The `catch` rethrows after releasing: you clean up, but you still tell BullMQ the attempt failed.

**The unit spec's fake store** needs the new methods. A simple version keeps the claim in a field: `claim` returns `false` if `this.claimant` is already set, `saveVerdict` writes only if the claimant matches, and `release` clears it. Then add two tests: "does not run anything when the claim is lost" (set `store.claimant = "another-worker"` before calling), and "gives the claim back when the runner throws" (check a `released` flag). The fake only proves the *order* of calls; the real race is proven by C3, against Postgres.
````

### C5 · Retries and the end of the line (40 min)

- In the API's adapter, give the job `attempts: 3` and an exponential `backoff`. Without `attempts`, a failed job is **not** retried at all.
- A job that fails after its last attempt must not leave the submission waiting forever. Handle the worker's `failed` event with `@OnWorkerEvent('failed')`: when `job.attemptsMade` has reached `job.opts.attempts`, call `giveUp`, which moves the submission to `SYSTEM_ERROR`.
- **Think (Halfway?):** on a retry, the submission is already claimed by the attempt that failed. That's why the failing attempt releases its claim in C4: otherwise, the retry 2 seconds later would find a fresh claim and skip, and the submission would sit in `JUDGING` until the lease expired.
- **Trap:** BullMQ marks a job as *stalled* when the worker can't renew its lock, and gives it to another worker. Your claim is what makes that harmless. ([BullMQ: stalled jobs](https://docs.bullmq.io/guide/workers/stalled-jobs))
- **Prove:** start the worker with Docker unreachable, submit, and watch three attempts in the worker's log, then `SYSTEM_ERROR` in the database.
- **Commit:** `feat(worker): claim submissions so a redelivered job judges once`.

````walkthrough
title: C5 · attempts, the failed event, and how to prove it
**In the API's adapter**, two more options on `add` (next to `jobId`):

```ts
// Our failures (Docker or the database down) get two more tries,
// 2 s then 4 s later. Without `attempts`, a failed job is never retried.
attempts: 3,
backoff: { type: 'exponential', delay: 2000 },
```

**In the worker's processor:**

```ts
// apps/worker/src/queue/judge.processor.ts
import { Logger } from "@nestjs/common";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { JudgeSubmissionService } from "../application/judge-submission.service";
import { JUDGE_QUEUE_NAME, type JudgeJobData } from "./judge-job";

@Processor(JUDGE_QUEUE_NAME)
export class JudgeProcessor extends WorkerHost {
  private readonly logger = new Logger(JudgeProcessor.name);

  constructor(private readonly judging: JudgeSubmissionService) {
    super();
  }

  async process(job: Job<JudgeJobData>): Promise<void> {
    await this.judging.handle(job.data.submissionId);
  }

  /** Runs after every failed attempt. Only the last one ends the submission. */
  @OnWorkerEvent("failed")
  async onFailed(job: Job<JudgeJobData> | undefined, error: Error) {
    if (!job) return;
    const attempts = job.opts.attempts ?? 1;
    this.logger.warn(
      `Job ${job.id}: attempt ${job.attemptsMade}/${attempts} failed: ${error.message}`,
    );
    if (job.attemptsMade >= attempts) {
      await this.judging.giveUp(job.data.submissionId);
    }
  }
}
```

**The easiest "Docker is down":** start the worker with a `PATH` that has no `docker` binary. `spawn("docker", …)` then fails with `ENOENT`, which is exactly the infrastructure error the runner throws.

```bash
cd apps/worker && pnpm build && PATH=/nonexistent $(command -v node) dist/main.js
```

`$(command -v node)` is resolved by your shell **before** the empty `PATH` applies, so Node itself still starts. Then submit from Postman. What I saw:

```text
WARN [JudgeProcessor] Job cmwh0f4…: attempt 1/3 failed: spawn docker ENOENT
WARN [JudgeProcessor] Job cmwh0f4…: attempt 2/3 failed: spawn docker ENOENT
WARN [JudgeProcessor] Job cmwh0f4…: attempt 3/3 failed: spawn docker ENOENT
ERROR [JudgeSubmissionService] Submission cmwh0f4…: SYSTEM_ERROR after the last retry
```

And `GET /submissions/:id` answers `"verdict": "SYSTEM_ERROR"`. Attempts 2 and 3 could claim the submission at once, because attempt 1 released it: that's C4's `catch` doing its job.

**The gap that's left, for the PR description:** if the database dies exactly between the claim and the release, the claim stays until its lease expires, and no new delivery is coming. The fix is a small sweeper that re-enqueues `PENDING` rows, and `JUDGING` rows older than the lease, every few minutes. Write it down as known, not done.
````

### C6 · If there's time: I-6 (30 min)

Your refresh-token rotation has the same race. Apply the same move: one conditional update, and a test with two concurrent refreshes where exactly one succeeds. It's `docs/revision/2-auth.md`, section 4. If it's past midnight, skip it and sleep.

---

## Block D · A million rows

**Before:** [lesson 15](/courses/lessons/0015-how-an-index-works) (70 min) and [lesson 16](/courses/lessons/0016-reading-plans) (90 min), fast mode. Do both labs: the plans you read there are the ones you'll read in block E.

### D1 · Say it (10 min)

You can't learn plans on 50 rows: Postgres scans a small table whatever the indexes are. Target: 50,000 users, 2,000 problems, 1,000,000 submissions, 200,000 refresh tokens, **skewed** (a few hot problems, most users with few submissions, about 30 % accepted).

- **Think:** why does skew matter? With uniform data, every `WHERE problemId = ?` matches the same number of rows, and the planner never has to choose. Real data is skewed: one problem is "Two Sum", and everyone submits it.

### D2 · Build the seed (60 min)

A SQL file, `apps/api/prisma/seed-large.sql`, run with `psql`. Not Prisma: a million `create` calls would take an hour, while one `INSERT … SELECT` takes about 20 seconds.

- **Hint 1:** `INSERT … SELECT … FROM generate_series(1, 1000000)` creates a million rows in one statement.
- **Hint 2, the skew:** `random()` is uniform. Cubing it pushes values towards 0: `floor(power(random(), 3) * 2000)` gives values where the low ones are very hot.
- **Hint 3:** ids for users and submissions are text. `'seed_u_' || n` is enough, and makes the seeded rows easy to delete.
- **Hint 4:** spread `createdAt` over a year: `now() - random() * interval '365 days'`.
- **Hint 5:** problem ids are integers. Start the seeded ones far above the real ones (100001+), so they never collide.
- Keep it re-runnable: delete the seeded rows first, by their prefix.
- End with `VACUUM ANALYZE`, not just `ANALYZE` (see D3).

````walkthrough
title: D2 · the whole seed file (runs in about 25 s)
```sql
-- apps/api/prisma/seed-large.sql
-- A large, skewed dataset for reading query plans (week 3, block D).
-- Development database only.
--   docker exec -i codearena-postgres psql -U codearena -d codearena < apps/api/prisma/seed-large.sql
-- Re-runnable: every seeded row has a prefix, and the first step deletes them.

\timing on

-- 1. Start clean. Users cascade to their submissions and refresh tokens.
DELETE FROM "Submission" WHERE id LIKE 'seed_s_%';
DELETE FROM "User" WHERE id LIKE 'seed_u_%';
DELETE FROM "Problem" WHERE slug LIKE 'seed-p-%';

-- 2. 50,000 users. updatedAt has no database default (Prisma fills it in
--    the app), so SQL must supply it.
INSERT INTO "User" (id, email, username, "passwordHash", "updatedAt")
SELECT 'seed_u_' || n,
       'seed' || n || '@example.com',
       'seed_u_' || n,
       'not-a-real-hash',
       now()
FROM generate_series(1, 50000) AS n;

-- 2b. 200,000 refresh tokens: 4 per user, in families of 2. Query 6 (I-16)
--     needs a table big enough that a missing index shows.
INSERT INTO "RefreshToken" (id, "userId", "tokenHash", family, "expiresAt")
SELECT 'seed_rt_' || n,
       'seed_u_' || (1 + (n - 1) / 4),
       md5('seed' || n),
       'seed_f_' || (1 + (n - 1) / 2),
       now() + interval '7 days'
FROM generate_series(1, 200000) AS n;

-- 3. 2,000 problems, with ids far above the real ones (100001+), so they
--    never collide with the seeded catalogue.
INSERT INTO "Problem" (id, slug, title, difficulty, description, constraints,
                       "starterCode", "updatedAt")
SELECT 100000 + n,
       'seed-p-' || n,
       'Seeded problem ' || n,
       (ARRAY['EASY', 'MEDIUM', 'HARD'])[1 + n % 3]::"Difficulty",
       ARRAY['Seeded for query plans.'],
       ARRAY[]::text[],
       '{}'::jsonb,
       now()
FROM generate_series(1, 2000) AS n;

-- 4. 1,000,000 submissions, skewed. random() is uniform on [0, 1);
--    power(random(), 3) piles values up near 0. So user 1 and problem
--    100001 are very hot, and most users have only a few submissions.
--    About 30 % are accepted. createdAt is spread over the last year.
INSERT INTO "Submission" (id, "userId", "problemId", language, verdict,
                          code, "runtimeMs", "createdAt")
SELECT 'seed_s_' || n,
       'seed_u_' || (1 + floor(power(random(), 3) * 50000)::int),
       100001 + floor(power(random(), 3) * 2000)::int,
       'JAVASCRIPT',
       (CASE
          WHEN r < 0.30 THEN 'ACCEPTED'
          WHEN r < 0.70 THEN 'WRONG_ANSWER'
          WHEN r < 0.85 THEN 'TIME_LIMIT'
          ELSE 'RUNTIME_ERROR'
        END)::"Verdict",
       'console.log(42)',
       (random() * 2000)::int,
       now() - random() * interval '365 days'
FROM (SELECT n, random() AS r FROM generate_series(1, 1000000) AS n) AS s;

-- 5. VACUUM fills the visibility map, so index-only scans can skip the
--    table. ANALYZE refreshes the statistics, or the planner plans with the
--    old ones and lies. Both, after any bulk load.
VACUUM ANALYZE;
```

**Why `random() AS r` in a subquery for the verdict:** each `random()` call gives a new number. Writing `random() < 0.30 … random() < 0.70` would draw a fresh number in each `WHEN`, and the percentages would come out wrong. Drawing `r` once per row keeps them at 30/40/15/15.

**Why the ugly quotes:** Prisma creates tables and columns with their exact case (`"Submission"`, `"userId"`). In Postgres, an unquoted name is folded to lower case, so `Submission` would look for a table called `submission`, which doesn't exist.

**Your e2e tests share this database.** They still pass with a million extra rows: they create their own users and problems. When week 3 is over, run only the three `DELETE`s at the top to get a small database back.
````

### D3 · Prove it (15 min)

```sql
SELECT count(*) FROM "Submission";
SELECT "problemId", count(*) FROM "Submission" GROUP BY 1 ORDER BY 2 DESC LIMIT 5;
SELECT "userId", count(*) FROM "Submission" GROUP BY 1 ORDER BY 2 DESC LIMIT 5;
SELECT pg_size_pretty(pg_total_relation_size('"Submission"'));
```

On my run: 1,000,000 rows; problem 100001 had 78,851 submissions, 100002 had 20,330; user 1 had 27,273; the table and its indexes took 213 MB.

- **Why `VACUUM` and not only `ANALYZE`:** right after a bulk insert, Postgres doesn't yet know which pages are fully visible to every transaction (the *visibility map* is empty). An *index-only scan* then still has to visit the table to check each row. On my run, the acceptance-rate query in E5 made **215,201 heap fetches** before `VACUUM` and **0** after, and went from 110 ms to 20 ms. ([Postgres: planner statistics](https://www.postgresql.org/docs/current/planner-stats.html), [index-only scans](https://www.postgresql.org/docs/current/indexes-index-only-scans.html))
- **Commit:** `perf(api): add a large skewed seed for query plans`.

---

## Block E · Six queries, six plans

One file per query in `docs/perf/`, all with the same five parts. Query 1 takes 45 minutes. By query 4 it takes 20.

### The loop, for every query

1. **Say it:** the query in SQL, and which page of CodeArena runs it.
2. **Predict:** which index will it use? How many rows will it read? Write the guess down **before** you run it.
3. **Measure:** `EXPLAIN (ANALYZE, BUFFERS)`, three times, keep the last run. Paste the plan.
4. **Fix:** change one thing (an index, the query's shape), and measure again.
5. **Why:** one paragraph. "It was slow because… The fix works because…"

**How to read the plan in 30 seconds** (lesson 16, section 1): start at the most indented node (it runs first), compare estimated `rows` with `actual rows`, and look for `Seq Scan` on a big table, `Rows Removed by Filter`, a `Sort` with no index behind it, `Heap Fetches`, and the `Buffers` count (one buffer is one 8 KB page). ([Postgres: using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html))

**Why measure three times and keep the last:** the first run reads pages from disk into memory (`read=` in `Buffers`), and later runs find them in memory (`hit=`). Production's hot queries run warm, so the warm number is the one to compare.

````walkthrough
title: The tools for block E
**A `psql` session on your dev database:**

```bash
docker exec -it codearena-postgres psql -U codearena -d codearena
```

Inside it, `\timing on` prints how long each statement takes, `\di "Submission"*` lists the table's indexes, and `\x` toggles a wide-row display.

**See the SQL that Prisma sends.** In `apps/api/src/prisma/prisma.service.ts`, temporarily:

```ts
super({
  adapter: new PrismaPg(config.getOrThrow<string>('DATABASE_URL')),
  log: ['query'], // TEMPORARY, for block E. Remove before you commit.
});
```

Every query then appears in the API's log, with `$1`, `$2` placeholders. Paste it into `psql`, replace the placeholders with real values, and put `EXPLAIN (ANALYZE, BUFFERS)` in front.

**The file format for `docs/perf/NN-name.md`:**

```text
# Query N · <what the page does>

**The page:** …
**The SQL:** (a code block)
**Prediction:** I expect … because …

**Before:** (the plan, trimmed to the important nodes) — X ms, Y buffers
**The fix:** one change, and the migration's name
**After:** (the plan) — X ms, Y buffers

**Why:** It was slow because … The fix works because …
```

**An index added for a query goes into `schema.prisma`**, with a migration, never only into `psql`. An index that exists only in your database is gone on the next fresh clone, and nobody can review it.
````

### The six

| # | Query | What you're hunting | Issue |
|---|---|---|---|
| 1 | The problems list: filter by difficulty, page by cursor | the cursor's correctness, and the payload, not the speed | I-10, I-11, I-15 |
| 2 | A user's submission history, page 1 and page 500 | `OFFSET` reading and throwing away rows; keyset pagination | |
| 3 | "Solved" badges for a page of problems | the N+1: one query per problem | |
| 4 | Top 100 users by problems solved, in SQL | a `GROUP BY` over the whole table | (motivates block F) |
| 5 | Latest accepted solutions for one problem, and acceptance rates | a partial index; one `$queryRaw` | |
| 6 | Revoking a refresh-token family | an index that can't serve the query | I-16 |

Fix I-10 with a test that fails first: deleting the cursor's row must not end the pagination.

````walkthrough
title: Query 1 · the problems list (I-10, I-11, I-15)
**The SQL Prisma sends today** (simplified):

```sql
SELECT id, slug, title, difficulty
FROM "Problem"
WHERE difficulty = 'MEDIUM'
  AND id >= (SELECT id FROM "Problem" WHERE id = 100500)
ORDER BY id
LIMIT 21;
```

**What you'll see:** fast. On my run, 0.09 ms: an `Index Scan using "Problem_pkey"` with `Filter: (difficulty = 'MEDIUM')` and `Rows Removed by Filter: 42`. 2,336 problems is a small table, and **an index on `(difficulty, id)` changes nothing here**: I tried it, and the planner ignored it. That's a finding too. Write it down: "not every query needs an index".

So query 1's real problems are correctness and size:

- **I-10.** Look at the subquery: `id >= (SELECT id … WHERE id = cursor)`. That's how Prisma implements `cursor:`. If the cursor's row was deleted, the subquery returns `NULL`, `id >= NULL` is never true, and the page comes back empty. The client thinks the list has ended.
- **I-11.** The service sets `nextCursor` when a page is full. A last page that happens to be full gets a cursor too, so the client asks once more and receives an empty page.
- **I-15.** The list page shows a title, a difficulty, tags and a rate, but the query loads the statement, the constraints, the starter code and every example. I measured it: **93,995 bytes** for 100 problems before, **17,207** after.

**The test first (I-10), in `test/problems.e2e-spec.ts`.** Three problems under a tag nobody else uses, so the list is the test's own:

```ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { PrismaService } from '../src/prisma/prisma.service';

/** I-10: the cursor's row being deleted must not end the list early. */
describe('Problems pagination (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  let ids: number[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    prisma = app.get(PrismaService);

    // Three problems with a tag no other problem has, so the list is ours.
    for (const n of [1, 2, 3]) {
      const p = await prisma.problem.create({
        data: {
          slug: `page-${unique}-${n}`,
          title: `Paging ${n}`,
          difficulty: 'EASY',
          description: ['x'],
          constraints: [],
          starterCode: {},
          tags: {
            connectOrCreate: {
              where: { name: `paging-${unique}` },
              create: { name: `paging-${unique}` },
            },
          },
        },
      });
      ids.push(p.id);
    }
  });

  afterAll(async () => {
    await prisma.problem.deleteMany({ where: { id: { in: ids } } });
    await prisma.tag.deleteMany({ where: { name: `paging-${unique}` } });
    await app.close();
  });

  it("keeps paging after the cursor's row is deleted", async () => {
    const first = await request(app.getHttpServer())
      .get(`/problems?limit=1&tag=paging-${unique}`)
      .expect(200);
    const { nextCursor } = first.body as { nextCursor: number };
    expect(nextCursor).toBe(ids[0]);

    // Someone deletes the problem the client's cursor points at.
    await prisma.problem.delete({ where: { id: nextCursor } });
    ids = ids.slice(1);

    const second = await request(app.getHttpServer())
      .get(`/problems?limit=1&tag=paging-${unique}&cursor=${nextCursor}`)
      .expect(200);
    const { items } = second.body as { items: { id: number }[] };
    expect(items.map((p) => p.id)).toEqual([ids[0]]);
  });
});
```

On the current code it fails: `Expected [<id>]`, `Received []`.

**The fix, in four files.** A type for what the list page shows, in `domain/problem.entity.ts`:

```ts
/** What the list page shows: no statement, no examples, no starter code (I-15). */
export type ProblemSummary = Pick<
  Problem,
  | 'id'
  | 'slug'
  | 'title'
  | 'difficulty'
  | 'acceptanceRate'
  | 'totalSubmissions'
  | 'tags'
>;
```

The port's `findMany` returns it:

```ts
/** Ids above `cursor`, in id order, at most `limit` of them. */
findMany(params: FindManyParams): Promise<ProblemSummary[]>;
```

The service asks for one more than the page (I-11):

```ts
async list(params: FindManyParams) {
  // Ask for one more than the page: if it comes back, a next page exists.
  // A full last page no longer costs the client an empty request (I-11).
  const rows = await this.repo.findMany({
    ...params,
    limit: params.limit + 1,
  });
  const items = rows.slice(0, params.limit);
  const nextCursor =
    rows.length > params.limit ? items[items.length - 1]!.id : null;
  return { items, nextCursor };
}
```

The adapter uses a keyset and selects only the list's fields (I-10, I-15):

```ts
async findMany(params: FindManyParams): Promise<ProblemSummary[]> {
  const rows = await this.prisma.problem.findMany({
    where: {
      // Keyset: "ids after this one". Prisma's `cursor` looks the cursor's
      // row up first, so a deleted row ended the list early (I-10).
      ...(params.cursor !== undefined && { id: { gt: params.cursor } }),
      ...(params.difficulty && { difficulty: params.difficulty }),
      ...(params.tag && { tags: { some: { name: params.tag } } }),
      ...(params.q && {
        title: { contains: params.q, mode: 'insensitive' },
      }),
    },
    orderBy: { id: 'asc' },
    take: params.limit,
    // Only what the list page shows (I-15).
    select: {
      id: true,
      slug: true,
      title: true,
      difficulty: true,
      acceptanceRate: true,
      totalSubmissions: true,
      tags: { select: { name: true } },
    },
  });
  return rows.map((r) => ({ ...r, tags: r.tags.map((t) => t.name) }));
}
```

**Why the `+ 1` lives in the service, not the adapter:** "is there a next page?" is a rule about pages, which is the service's job. The adapter only answers "give me at most N rows after this id".

**Two unit tests for I-11**, at the end of `problems.service.spec.ts`. They use a fake that honours `cursor` and `limit` like the real adapter:

```ts
describe('pages (I-11)', () => {
  // Five problems, ids 1..5. The fake honours cursor and limit like the
  // real adapter: ids above the cursor, in order, at most `limit`.
  const ids = [1, 2, 3, 4, 5];
  const pagedRepo: ProblemsRepository = {
    findMany: ({ cursor, limit }) =>
      Promise.resolve(
        ids
          .filter((id) => cursor === undefined || id > cursor)
          .slice(0, limit)
          .map((id) => ({ ...sample, id })),
      ),
    findBySlug: () => Promise.resolve(null),
  };
  const paged = new ProblemsService(pagedRepo);

  it('returns a cursor when another page exists', async () => {
    const page = await paged.list({ limit: 2 });

    expect(page.items.map((p) => p.id)).toEqual([1, 2]);
    expect(page.nextCursor).toBe(2);
  });

  it('returns no cursor after a full last page, so the client stops', async () => {
    const page = await paged.list({ limit: 5 });

    expect(page.items).toHaveLength(5);
    expect(page.nextCursor).toBeNull();
  });
});
```

**The web:** the list page reads only `id`, `slug`, `title`, `difficulty`, `tags` and `acceptanceRate`, so it keeps working. Change the `items` type in `apps/web/src/hooks/use-problems.ts` from `Problem[]` to a summary type, so the compiler stops pretending the list has descriptions.

On my run, after the fix: 27 unit tests and 25 e2e tests green, including these three.
````

````walkthrough
title: Query 2 · history: OFFSET vs keyset
**Page 500 with `OFFSET`:**

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, verdict, "createdAt" FROM "Submission"
WHERE "userId" = 'seed_u_1'
ORDER BY "createdAt" DESC, id DESC
LIMIT 20 OFFSET 10000;
```

What I saw: `Incremental Sort` over an `Index Scan using "Submission_userId_createdAt_idx"`, **rows=10020**, about 10,000 buffers, **14.8 ms**. `OFFSET 10000` doesn't skip anything: Postgres reads 10,020 rows, sorts them, and throws away 10,000.

**The same page with a keyset** ("the 20 rows after the last one I showed"):

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, verdict, "createdAt" FROM "Submission"
WHERE "userId" = 'seed_u_1'
  AND ("createdAt", id) < ('<last createdAt>', '<last id>')
ORDER BY "createdAt" DESC, id DESC
LIMIT 20;
```

What I saw: 24 buffers, **0.06 ms**. Page 500 costs the same as page 1.

**Why `id` in the order:** two submissions can share a `createdAt`. Without a tie-breaker, the order between them is undefined, and a row can appear on two pages or on none.

**The index that removes the `Incremental Sort`:** your index is `(userId, createdAt DESC)`, so Postgres still sorts by `id` inside each timestamp. Add `id` to it:

```prisma
@@index([userId, createdAt(sort: Desc), id(sort: Desc)])
```

After it: an `Index Scan` with no sort node at all, the row comparison inside `Index Cond`, 23 buffers.

**The trap, in Prisma:** Prisma can't write `(createdAt, id) < (…)`. The usual translation is an `OR`:

```ts
where: {
  userId,
  OR: [
    { createdAt: { lt: cursor.createdAt } },
    { createdAt: cursor.createdAt, id: { lt: cursor.id } },
  ],
},
```

I measured it: Postgres can't start an index range from an `OR`, so it reads the user's rows from the newest and filters. **Rows Removed by Filter: 22,028**, 5 ms: no better than `OFFSET`. Add one redundant bound, and the range starts at the cursor:

```ts
where: {
  userId,
  createdAt: { lte: cursor.createdAt }, // redundant for the logic, vital for the index
  OR: [
    { createdAt: { lt: cursor.createdAt } },
    { createdAt: cursor.createdAt, id: { lt: cursor.id } },
  ],
},
```

After it: 7 buffers, 0.05 ms. **This is the paragraph your ADR needs:** the ORM's natural form was correct and slow, and only the plan showed it.
````

````walkthrough
title: Query 3 · the N+1: "solved" badges for a page
**The N+1 shape:** the problems page shows 20 problems, and for each one asks "has this user solved it?":

```ts
// DON'T: 20 problems → 20 queries, plus the one that loaded the list.
for (const p of problems) {
  p.solved = (await prisma.submission.count({
    where: { userId, problemId: p.id, verdict: 'ACCEPTED' },
  })) > 0;
}
```

Each query is fast (0.36 ms on my run), which is why the N+1 hides in development. The cost is 20 round trips to the database, which matters in production, where the database is a network hop away.

**One query for the whole page:**

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT DISTINCT "problemId" FROM "Submission"
WHERE "userId" = 'seed_u_1'
  AND verdict = 'ACCEPTED'
  AND "problemId" = ANY (ARRAY[100001, 100002, /* …the page's 20 ids… */ 100020]);
```

What I saw: a `BitmapAnd` combining two indexes, 2,000 buffers, **11.7 ms**: one query, but not a good one yet.

**The index that fits it**, partial, because only accepted rows matter:

```prisma
@@index([userId, problemId], where: raw("verdict = 'ACCEPTED'"))
```

After it: an `Index Only Scan`, `Heap Fetches: 0`, 64 buffers, **0.3 ms**.

**In Prisma, use `groupBy`, not `distinct`:**

```ts
const solved = await prisma.submission.groupBy({
  by: ['problemId'],
  where: { userId, verdict: 'ACCEPTED', problemId: { in: ids } },
});
const solvedIds = new Set(solved.map((s) => s.problemId));
```

I checked the SQL in Prisma's log. `groupBy` sends a real `GROUP BY`. `findMany({ distinct: ['problemId'] })` sends **no** `DISTINCT`: it fetches every matching row (1,782 for user 1) and removes the duplicates in Node. Same answer, much more data.

**Partial indexes in Prisma 7** need a preview flag, on the `client` generator in `schema.prisma`:

```prisma
previewFeatures = ["partialIndexes"]
```

I checked that `migrate dev` generates `CREATE INDEX … WHERE (verdict = 'ACCEPTED')`, and that a second `migrate dev` finds no drift.
````

````walkthrough
title: Query 4 · the top 100, in SQL
```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT "userId", count(DISTINCT "problemId") AS solved
FROM "Submission"
WHERE verdict = 'ACCEPTED'
GROUP BY "userId"
ORDER BY solved DESC
LIMIT 100;
```

What I saw: `Seq Scan` on the whole table (`Rows Removed by Filter: 699,302`), a `Sort` of 300,707 rows **spilling to disk** (`temp read=1021 written=1026`), then `GroupAggregate`: **736 ms**.

With query 3's partial index `(userId, problemId) WHERE ACCEPTED`, the same query becomes an `Index Only Scan` with no sort: **44 ms**. Seventeen times faster, from an index you already added for another reason.

**But it's still wrong for a leaderboard:** 44 ms is reading all 300,000 accepted entries, every time anyone opens the page, and it grows with every submission. No index fixes "count everything on every read". The fix is to stop computing it on read: keep the ranking sorted as solves are *written*. That's block F, and this query is the "before" for it.

Keep this SQL: it's also how you **rebuild** the leaderboard from Postgres if Redis loses it (F1).
````

````walkthrough
title: Query 5 · a partial index, and one $queryRaw
**The page:** "the latest accepted solutions for this problem".

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, "userId", "runtimeMs" FROM "Submission"
WHERE "problemId" = 100001 AND verdict = 'ACCEPTED'
ORDER BY "createdAt" DESC
LIMIT 20;
```

What I saw: a `Bitmap Heap Scan` that reads **all 23,700** accepted rows of the hot problem, then a `Sort` to keep 20: about 11,000 buffers, **18.9 ms**.

**The partial index:**

```prisma
@@index([problemId, createdAt(sort: Desc)], where: raw("verdict = 'ACCEPTED'"))
```

After it: an `Index Scan` that stops after 20 rows, no sort, 23 buffers, **0.07 ms**.

**Prove "smaller":** create the full version too, for a moment, and compare:

```sql
SELECT pg_size_pretty(pg_relation_size('<partial index name>')),
       pg_size_pretty(pg_relation_size('<full index name>'));
```

On my run, 9.3 MB for the partial and 30 MB for the full: a third of the size, because only 30 % of the rows are accepted. Smaller means more of it fits in memory.

**The acceptance rate, with `$queryRaw`.** Prisma's `groupBy` can count rows, but not "count the accepted ones and divide" in one pass. SQL's `FILTER` can:

```ts
type Rate = { problemId: number; rate: number };

const rates = await this.prisma.$queryRaw<Rate[]>`
  SELECT "problemId",
         count(*) FILTER (WHERE verdict = 'ACCEPTED')::float / count(*) AS rate
  FROM "Submission"
  WHERE "problemId" = ANY(${ids})
  GROUP BY "problemId"
`;
```

**Only the tagged-template form is safe.** `${ids}` here becomes a bind parameter (`$1`), never text inside the SQL. Building the string yourself, or using `$queryRawUnsafe` with user input, is SQL injection. ([Prisma: raw queries](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries))

It uses your existing `(problemId, verdict)` index as an `Index Only Scan`. On my run, 110 ms with 215,201 heap fetches before `VACUUM`, and 20 ms with 0 after: block D's lesson, measured.
````

````walkthrough
title: Query 6 · I-16: the index that can't serve its query
`revokeFamily` runs when a stolen refresh token is reused: it revokes every token of that family.

```sql
EXPLAIN (ANALYZE, BUFFERS)
UPDATE "RefreshToken" SET "revokedAt" = now()
WHERE family = 'seed_f_77777' AND "revokedAt" IS NULL;
```

What I saw: `Seq Scan on "RefreshToken"`, `Rows Removed by Filter: 200,000`, about 3,000 buffers, **25.6 ms** to change 2 rows.

**Why the existing index doesn't help:** it's `(userId, family)`. A B-tree is sorted by its first column, then by the second inside each first value: like a phone book sorted by surname, then first name. To find a family without knowing the user is like finding everyone called "Ayoub" in a phone book: you read the whole book.

**The fix:**

```prisma
@@index([family]) // revokeFamily: WHERE family = …
```

After it: `Index Scan using … (family)`, 13 buffers, **0.2 ms**.

**Should `(userId, family)` stay?** Check which query uses it (the rotation lookup). If every lookup also filters by `userId`, keep it. If not, it's an index Postgres updates on every insert for nothing. Say which in the ADR.
````

```check
w3-plans
```

### The ADR (40 min)

`docs/adr/`: "Six queries, six plans". For each query: one line before, one line after, the numbers, the reason. Then one paragraph on what you'd watch in production. This is the document you'll open in an interview, so write it for a stranger.

- **What to watch in production:** `pg_stat_statements` (which queries take the most total time), and the size of each index against how often it's used (`pg_stat_user_indexes.idx_scan`). An index that's never scanned is pure cost.
- **Commit:** `perf(api): six measured query plans and their indexes`.

---

## Block F · The leaderboard

**Before:** [lesson 18](/courses/lessons/0018-leaderboard), fast mode (75 min).

### F1 · Say it and break it (15 min, no code)

Query 4 showed the cost of ranking in SQL. A Redis sorted set keeps the ranking sorted as it's written: adding a score and reading a rank are both O(log N), however many users there are. ([Redis: sorted sets](https://redis.io/docs/latest/develop/data-types/sorted-sets/))

Write down:

- **the score:** distinct problems solved is the simplest honest choice;
- **the tie-break:** who reached that score first (lesson 18, section 2, puts the time inside the score);
- **Twice?** the same Accepted delivered twice, or the same problem solved twice, must count once;
- **Halfway?** the verdict is committed, then the worker dies before updating Redis. The leaderboard is *derived data*: say how you'd rebuild it from Postgres.

````walkthrough
title: F1 · the decisions I built and tested
- **Score:** 1 point per distinct problem solved.
- **Tie-break:** on equal points, whoever reached them first ranks higher. One number holds both: `score = points × T + (T − 1 − reachedAt)`, with `reachedAt` in Unix seconds and `T = 1e10`. One point is worth T, so more points always win. On equal points, an earlier time gives a bigger score. Decoding: `points = floor(score / T)`.
- **The limits of that number:** a score is a 64-bit float, exact for integers up to 2^53 ≈ 9 × 10^15. `reachedAt` is about 1.8 × 10^9 today, under T. `points × T` stays exact up to 900,000 points.
- **Twice:** a Redis set of `user:problem` strings. `SADD` answers 1 the first time and 0 after. The set, the points, the time and the board are updated in **one Lua script**, so nothing can run in the middle, and a crash can't leave the set updated but the points not.
- **When:** after the verdict is committed, and only for `ACCEPTED`. Before the commit, a rollback would leave a point nobody earned.
- **Redis down at that moment:** the job still succeeds. The verdict is the truth, and the board is rebuilt from Postgres (query 4's SQL) by a small script. Throwing wouldn't help: the retry would find the submission already judged, and the claim would stop it before it reached the leaderboard.
````

### F2 · The port and its test (40 min)

A `Leaderboard` port in the worker (`recordSolve(userId, problemId, solvedAt)`) and a reader port in the API (`top(n)`, `standingOf(userId)`).

Tests first, against a real Redis (`redis-leaderboard.integration-spec.ts`):

1. the same solve recorded twice moves the score once;
2. two users with the same score are ordered the way you decided;
3. more points beat an earlier time.

- **Hint for *Twice?*:** a Redis set of the problems each user solved. `SADD` returns 1 only the first time. To make "add to the set, then bump the score" atomic, lesson 18's section 3 uses one Lua script.

````walkthrough
title: F2 · the worker's port, the script, and its tests
```ts
// apps/worker/src/ports/leaderboard.port.ts
/** The worker's side of the leaderboard: it only ever records solves. */
export interface Leaderboard {
  /**
   * Counts (user, problem) once, however many times it's called. True the
   * first time, false after.
   */
  recordSolve(userId: string, problemId: number, solvedAt: Date): Promise<boolean>;
}

export const LEADERBOARD = Symbol("Leaderboard");
```

```ts
// apps/worker/src/adapters/redis-leaderboard.ts
import type { Redis } from "ioredis";
import type { Leaderboard } from "../ports/leaderboard.port";

/**
 * score = points × T + (T − 1 − reachedAt), with reachedAt in seconds.
 * More points always wins (one point is worth T). On equal points, whoever
 * reached them first has the larger score. T must exceed any reachedAt
 * (about 1.8e9 today), and points × T must stay under 2^53 (about 9e15),
 * so this allows 900,000 points. The API decodes with the same T.
 */
export const SCORE_T = 1e10;

/**
 * One script, so Redis runs it atomically: nothing can run between "was it
 * new?" and "add the point". As two commands, a crash in between would lose
 * the point for good, because a retry would see the solve already recorded.
 *
 * KEYS: 1 solved set ("user:problem"), 2 points hash, 3 reachedAt hash, 4 board
 * ARGV: 1 userId, 2 problemId, 3 solvedAt in seconds, 4 T
 */
const RECORD_SOLVE = `
if redis.call('SADD', KEYS[1], ARGV[1] .. ':' .. ARGV[2]) == 0 then
  return 0
end
local points = redis.call('HINCRBY', KEYS[2], ARGV[1], 1)
-- Deliveries can arrive out of order: keep the latest counted solve.
local at = tonumber(ARGV[3])
local previous = tonumber(redis.call('HGET', KEYS[3], ARGV[1]) or '0')
if previous > at then at = previous end
redis.call('HSET', KEYS[3], ARGV[1], at)
local t = tonumber(ARGV[4])
redis.call('ZADD', KEYS[4], points * t + (t - 1 - at), ARGV[1])
return 1
`;

export class RedisLeaderboard implements Leaderboard {
  /** `prefix` lets a test use its own keys and leave the real board alone. */
  constructor(
    private readonly redis: Redis,
    private readonly prefix = "lb",
  ) {}

  async recordSolve(
    userId: string,
    problemId: number,
    solvedAt: Date,
  ): Promise<boolean> {
    const p = this.prefix;
    const added = await this.redis.eval(
      RECORD_SOLVE,
      4,
      `${p}:solved`,
      `${p}:points`,
      `${p}:reached`,
      `${p}:board`,
      userId,
      String(problemId),
      String(Math.floor(solvedAt.getTime() / 1000)),
      String(SCORE_T),
    );
    return added === 1;
  }
}
```

**Reading the Lua:** `KEYS` and `ARGV` are the lists you pass after the script (`4` says how many are keys). `..` joins strings. `redis.call` runs a Redis command from inside the script. Keys are passed in, never built inside the script, so Redis knows which keys a script touches.

**The prefix in the constructor** is there for the test: every test run writes under its own `test-lb-<timestamp>:*` keys and deletes them at the end.

```ts
// apps/worker/src/adapters/redis-leaderboard.integration-spec.ts
import { Redis } from "ioredis";
import { RedisLeaderboard, SCORE_T } from "./redis-leaderboard";

/** Against a real Redis: the guarantees are in the script, so test the script. */
describe("RedisLeaderboard", () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
  });
  const prefix = `test-lb-${Date.now()}`;
  const board = new RedisLeaderboard(redis, prefix);
  const at = (iso: string) => new Date(iso);

  afterAll(async () => {
    const keys = await redis.keys(`${prefix}:*`);
    if (keys.length > 0) await redis.del(...keys);
    await redis.quit();
  });

  it("counts the same solve once, however many times it's recorded", async () => {
    expect(await board.recordSolve("ada", 1, at("2026-11-01T10:00:00Z"))).toBe(true);
    expect(await board.recordSolve("ada", 1, at("2026-11-01T10:00:00Z"))).toBe(false);
    expect(await board.recordSolve("ada", 1, at("2026-11-02T10:00:00Z"))).toBe(false);

    const score = Number(await redis.zscore(`${prefix}:board`, "ada"));
    expect(Math.floor(score / SCORE_T)).toBe(1);
  });

  it("ranks the user who reached the same score first higher", async () => {
    await board.recordSolve("bob", 1, at("2026-11-01T12:00:00Z"));
    await board.recordSolve("cat", 1, at("2026-11-01T09:00:00Z"));

    // ada (10:00), bob (12:00), cat (09:00): all on 1 point.
    const ranked = await redis.zrange(`${prefix}:board`, 0, "-1", "REV");
    expect(ranked).toEqual(["cat", "ada", "bob"]);
  });

  it("ranks more points above an earlier time", async () => {
    await board.recordSolve("bob", 2, at("2026-11-03T12:00:00Z"));

    const ranked = await redis.zrange(`${prefix}:board`, 0, "0", "REV");
    expect(ranked).toEqual(["bob"]);
  });
});
```

**The ioredis quirk:** in ioredis 6's types, `zrange`'s `stop` argument is a `string`. Write `"-1"`, not `-1`, or TypeScript reports *"No overload matches this call"*.

**Run it:** `pnpm --filter worker exec jest --testRegex 'redis-leaderboard\.integration-spec\.ts$' --runInBand`. It uses your Redis on 6379.
````

### F3 · Build it (60 min)

- The worker: call `recordSolve` **after** the verdict is saved, and only on `ACCEPTED`.
- **Think:** if Redis is down at that moment, should the job fail? The verdict is already stored. Decide, and write one line in the code saying why.
- The API: `GET /leaderboard` (top N, public) and `GET /leaderboard/me` (your rank), through the reader port.
- **Trap:** `ZREVRANGE` still works but is deprecated. Use `ZRANGE … REV`. ([Redis: ZREVRANGE](https://redis.io/docs/latest/commands/zrevrange/))
- **Trap:** a Redis client the container doesn't close keeps the process alive after Ctrl-C, and makes the API's e2e suite hang after its last test. Give it an `onModuleDestroy` that calls `quit()`.
- **Prove:** submit an accepted solution, then `GET /leaderboard` shows you as soon as the verdict is stored. Submit the same solution again: your score doesn't move.
- **Commit:** `feat: a live leaderboard on a Redis sorted set`. Say "pushed": the API's e2e job in CI needs a Redis service from this point on, and I'll add it to the workflow.

````walkthrough
title: F3 · the worker side: RedisService and the call after the commit
**A Redis client the container can close**, the same shape as `PrismaService`. First `pnpm --filter worker add ioredis` if B4 didn't already add it.

```ts
// apps/worker/src/redis/redis.service.ts
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

/**
 * A Redis client the container can inject and close, the same shape as
 * PrismaService. Without the quit on shutdown, the open socket keeps the
 * worker alive after Ctrl-C.
 */
@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      host: config.getOrThrow<string>("REDIS_HOST"),
      port: config.getOrThrow<number>("REDIS_PORT"),
    });
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
```

**In `worker.module.ts`'s providers:**

```ts
RedisService,
{
  provide: LEADERBOARD,
  inject: [RedisService],
  useFactory: (redis: RedisService) => new RedisLeaderboard(redis),
},
```

`useFactory` because `RedisLeaderboard`'s constructor takes a prefix too, which isn't something Nest can inject. The factory says: "build it with this client, and the default prefix".

**The task needs the user and the problem.** Add `userId: string; problemId: number;` to `JudgeTask`, and select them in `load` (`userId: true, problemId: true`).

**In the use case**, inject the port (`@Inject(LEADERBOARD) private readonly leaderboard: Leaderboard`), and change the end of the `try`:

```ts
if (!(await this.store.saveVerdict(submissionId, claimant, judgement))) {
  this.logger.warn(`Submission ${submissionId}: lost the claim, verdict dropped`);
  return;
}
this.logger.log(`Submission ${submissionId}: ${judgement.verdict}`);

if (judgement.verdict === "ACCEPTED") {
  await this.recordSolve(task.userId, task.problemId);
}
```

```ts
/**
 * After the verdict is committed, never before: a rollback would leave a
 * point nobody earned. If Redis is down, the job still succeeds: the
 * verdict is the truth, and the board is derived data, rebuilt from
 * Postgres. Throwing wouldn't help anyway: the retry finds the submission
 * already judged, so the claim stops it before it reaches this line.
 */
private async recordSolve(userId: string, problemId: number): Promise<void> {
  try {
    await this.leaderboard.recordSolve(userId, problemId, new Date());
  } catch (error) {
    this.logger.error(
      `Leaderboard not updated for ${userId}/${problemId}: rebuild it`,
      error instanceof Error ? error.stack : String(error),
    );
  }
}
```

**Three unit tests to add**, with a `FakeLeaderboard` that records `user:problem` strings or rejects when `down = true`: an `ACCEPTED` records one solve; a wrong answer records nothing; Redis down still resolves, with the verdict stored. The constructor now takes `(store, leaderboard, judge)`, so update `serviceWith`, and give the C3 integration spec a fake leaderboard too.

On my run: 34 unit tests and 6 integration tests in the worker, all green.
````

````walkthrough
title: F3 · the API side: the reader and two endpoints
`pnpm --filter api add ioredis` if B2 didn't already add it. Then `apps/api/src/redis/redis.service.ts`: the same class as the worker's, with single quotes.

```ts
// apps/api/src/leaderboard/ports/leaderboard.reader.ts
export type Standing = {
  rank: number; // 1 for the best
  userId: string;
  username: string;
  solved: number;
};

/** The API only reads the board. The worker writes it. */
export interface LeaderboardReader {
  top(limit: number): Promise<Standing[]>;
  /** Null for a user with no solve yet. */
  standingOf(userId: string): Promise<Standing | null>;
}

export const LEADERBOARD_READER = Symbol('LeaderboardReader');
```

```ts
// apps/api/src/leaderboard/adapters/redis-leaderboard.reader.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import type {
  LeaderboardReader,
  Standing,
} from '../ports/leaderboard.reader';

/**
 * The contract with the worker, which writes the board: the key, and how a
 * score encodes points and time. score = points × T + (T − 1 − reachedAt).
 */
const BOARD_KEY = 'lb:board';
const SCORE_T = 1e10;
const pointsOf = (score: number) => Math.floor(score / SCORE_T);

@Injectable()
export class RedisLeaderboardReader implements LeaderboardReader {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async top(limit: number): Promise<Standing[]> {
    // O(log N + limit), however big the board is. ZREVRANGE is deprecated:
    // ZRANGE … REV. ioredis types `stop` as a string.
    const flat = await this.redis.zrange(
      BOARD_KEY,
      0,
      String(limit - 1),
      'REV',
      'WITHSCORES',
    );
    // [member, score, member, score, …]
    const entries: { userId: string; score: number }[] = [];
    for (let i = 0; i + 1 < flat.length; i += 2) {
      entries.push({ userId: flat[i]!, score: Number(flat[i + 1]) });
    }
    const names = await this.usernames(entries.map((e) => e.userId));
    return entries.map((e, index) => ({
      rank: index + 1,
      userId: e.userId,
      username: names.get(e.userId) ?? 'deleted user',
      solved: pointsOf(e.score),
    }));
  }

  async standingOf(userId: string): Promise<Standing | null> {
    const [rank, score] = await Promise.all([
      this.redis.zrevrank(BOARD_KEY, userId),
      this.redis.zscore(BOARD_KEY, userId),
    ]);
    if (rank === null || score === null) return null;
    const names = await this.usernames([userId]);
    return {
      rank: rank + 1,
      userId,
      username: names.get(userId) ?? 'deleted user',
      solved: pointsOf(Number(score)),
    };
  }

  /** One query for the whole page, never one per row: that's the N+1. */
  private async usernames(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) return new Map();
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, username: true },
    });
    return new Map(users.map((u) => [u.id, u.username]));
  }
}
```

**Why the board stores user ids and not usernames:** a username can change, an id can't. The page's 20 names come from one Postgres query: query 3's lesson, applied.

```ts
// apps/api/src/leaderboard/http/top-query.dto.ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class TopQueryDto {
  @IsOptional()
  @Type(() => Number) // query strings are always strings
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
```

```ts
// apps/api/src/leaderboard/http/leaderboard.controller.ts
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-payload';
import {
  LEADERBOARD_READER,
  type LeaderboardReader,
} from '../ports/leaderboard.reader';
import { TopQueryDto } from './top-query.dto';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    @Inject(LEADERBOARD_READER) private readonly board: LeaderboardReader,
  ) {}

  @Public()
  @Get()
  top(@Query() query: TopQueryDto) {
    return this.board.top(query.limit);
  }

  @Get('me')
  async me(@CurrentUser() user: JwtPayload) {
    // 200 with null, not 404: "not ranked yet" is a normal answer.
    return { standing: await this.board.standingOf(user.sub) };
  }
}
```

```ts
// apps/api/src/leaderboard/leaderboard.module.ts
import { Module } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { LeaderboardController } from './http/leaderboard.controller';
import { LEADERBOARD_READER } from './ports/leaderboard.reader';
import { RedisLeaderboardReader } from './adapters/redis-leaderboard.reader';

@Module({
  controllers: [LeaderboardController],
  providers: [
    RedisService,
    { provide: LEADERBOARD_READER, useClass: RedisLeaderboardReader },
  ],
})
export class LeaderboardModule {}
```

Add `LeaderboardModule` to `AppModule`'s `imports`. There's no service layer here: it would only forward calls. The controller depends on the port, and that's what keeps it testable.

**What I saw, for real:** before any solve, `GET /leaderboard/me` → `{"standing":null}`. After one Accepted → `{"standing":{"rank":1,"username":"…","solved":1}}`, readable as soon as the worker logged the verdict. The same problem solved again → still `"solved":1`. `GET /leaderboard?limit=500` → 400, `"limit must not be greater than 100"`.

**The CI note:** with `RedisService` in the app, the e2e suite still passes without Redis, but Jest doesn't exit afterwards, because ioredis keeps trying to reconnect. CI's e2e job needs a Redis service. That's my part: say "pushed", and I add it.
````

```check
w3-board
```

---

## Checkpoint · Sunday night

Tick honestly. A box you can't tick is tomorrow's first task, not a failure.

- [ ] `POST /submissions` answers 202, and the worker stores the verdict
- [ ] A test proves that the same job delivered twice, also concurrently, judges once
- [ ] An infrastructure error is retried; a wrong answer is not
- [ ] `docs/perf/` has six queries, each with a plan before and after
- [ ] The leaderboard moves as soon as an Accepted is stored, and only once per problem
- [ ] From memory: the six moves, and the six what-ifs
- [ ] Out loud, 90 seconds each: "the idempotent queue" and "the query I made faster"

Then send me: `week 3 done`, with the boxes you couldn't tick.
