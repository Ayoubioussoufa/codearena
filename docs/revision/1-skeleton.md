# Part 1 · Thu 29 Oct: run it from zero, and the skeleton

**2 hours 30**, then Upsolve's Thursday build. 0:40 run it from zero, and I-1 · 0:30 monorepo
and tooling (today's Upsolve build teaches the rest of it) · 1:05 NestJS and ports/adapters ·
0:15 Git Part 1 (`~/bcgx-prep/foundations/git.md`).

### How to use the 📚 Study boxes

Each section opens with one. Use them in this order, and only the parts named:

1. **Your guide** (in this repo): the map, written for your own code. Also in the dojo at
   `http://localhost:3002/guides` (`pnpm dev:dojo`), with its exercises.
2. **The official docs**: the truth, and what you'll use at work for years. Read the named page,
   not the whole site.
3. **A video**, optional, and only when a word or idea won't click. Videos are for vocabulary,
   never for building along. Fifteen minutes of video a day at most. The titles below are real
   videos to search on YouTube by name.

Then close everything and answer the questions out loud. Reading isn't the exercise; answering is.

---

## 🔧 1. Run it from zero (40 min)

> **📚 Study**, only when a command surprises you:
> - **Docker Compose:** [Compose docs](https://docs.docker.com/compose/). What does `down -v`
>   delete that `down` keeps? What does a `healthcheck` decide?
> - **Prisma migrations and seeding:** [Prisma docs](https://www.prisma.io/docs), search
>   "Prisma Migrate" (`migrate deploy` vs `migrate dev`) and "Seeding".
> - **For I-4:** Next.js's own docs for *your* version, on disk:
>   `apps/web/node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`
>   (online: [Next.js: Environment variables](https://nextjs.org/docs/app/guides/environment-variables)).
>   Read the part about `NEXT_PUBLIC_` and build time.
> - **For I-1:** [TypeScript: Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
>   (why a `.ts` file imports `./x.js` under `nodenext`), then
>   [Jest: Configuration](https://jestjs.io/docs/configuration), the `moduleNameMapper` option.

The point isn't to get it running. It's to know **why** each step exists. Before each command, say
what it does and what would break without it.

```bash
cd ~/CODEARENA
git log --oneline -1            # expect: feat(worker): scaffold the judge as a separate process
docker compose down -v          # ⚠ deletes your local Postgres and Redis data. A clean state is the point
pnpm install
pnpm infra:up                   # Postgres on 5433, Redis on 6379
cat apps/api/.env               # compare it with apps/api/.env.example, key by key
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma db seed
```

Then three terminals:

```bash
pnpm dev:api                    # → ✅ API listening on http://localhost:3001
pnpm dev:web                    # → open http://localhost:3000/problems
pnpm --filter worker dev        # → verdict=ACCEPTED runtimeMs=1ms
```

And the tests:

```bash
pnpm --filter api test          # unit
pnpm --filter api test:e2e      # needs Postgres up
pnpm -r typecheck
curl -s localhost:3001/health   # {"status":"ok","uptime":…,"db":"up"}
```

**Two things will break here. That's deliberate: don't read ahead, work out why.**

### 🐛 I-4 · `/problems` says "Could not reach the API"

Start from `apps/web/src/lib/http.ts`, line 1 of the request path. Where does `BASE` come from on
your machine?

<details><summary>Hint 1</summary>

Open the browser's Network tab and look at the URL the page actually requested. What does
`` `${undefined}/problems` `` evaluate to in JavaScript?

</details>

<details><summary>Hint 2</summary>

Next.js reads env files per app (`apps/web/.env.local`), and a `NEXT_PUBLIC_` variable is inlined
into the bundle **at build time**. Fixing it for you isn't enough: a fresh clone needs to be told.
`apps/api` solves this with `.env.example`. Now check whether `apps/web/.gitignore` would even let
you commit one: `git check-ignore -v apps/web/.env.example`.

</details>

### 🐛 I-1 · every e2e suite fails before running a single test

```
Cannot find module './internal/class.js' from '../generated/prisma/client.ts'
```

The unit tests pass. Why do only the e2e suites fail? Answer that before you look for a fix.

<details><summary>Hint 1: why only e2e?</summary>

Which test files import `AppModule`, and through it `PrismaService` and the generated client?
Which ones construct services with fakes instead? Your architecture is the reason the unit tests
don't care.

</details>

<details><summary>Hint 2: why the error?</summary>

Open `apps/api/generated/prisma/client.ts` and read its imports. The file is TypeScript, yet it
imports `./internal/class.js`, and on disk there is only `class.ts`. `tsc` with `nodenext`
resolution understands that `.js` means "the `.ts` file that will compile to it". **Jest has its
own resolver**, which doesn't. Look in the Jest docs for the option that rewrites module paths
before resolving them.

</details>

<details><summary>Hint 3: why nobody noticed</summary>

When did the e2e suite last pass? Look at when `generated/` was last regenerated, and at GitHub
Actions: the September branch never went through a PR, so the `api-e2e` job has **never run on
it**. The moment the history is pushed to `main`, CI goes red. Fix it before that push.

</details>

**Interview angle:** this is a good "a bug I found" story. It type-checked, passed locally once,
and only an untested path (CI never ran) hid it.

---

## 2. The monorepo and its tooling (30 min)

> **📚 Study**
> - **Your guides:** [phase-0 §D.1, Monorepo + pnpm workspaces](../phase-0-foundations.md) and,
>   in the same file, §A.1's "The strict flags, turn them ALL on, day 1".
> - **pnpm:** [Workspaces](https://pnpm.io/workspaces) · [Filtering](https://pnpm.io/filtering) ·
>   [package.json](https://pnpm.io/package_json) (the `pnpm.onlyBuiltDependencies` section).
> - **TypeScript:** the [tsconfig reference](https://www.typescriptlang.org/tsconfig), entries
>   `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
> - **Hooks:** [husky: Get started](https://typicode.github.io/husky/) ·
>   [lint-staged README](https://github.com/lint-staged/lint-staged) (find what happens to a task
>   written as a *function*) · [commitlint](https://commitlint.js.org/) ·
>   [Conventional Commits 1.0](https://www.conventionalcommits.org/en/v1.0.0/).
> - **CI:** [pnpm: Continuous Integration](https://pnpm.io/continuous-integration) ·
>   [GitHub Actions docs](https://docs.github.com/en/actions), pages "Workflow syntax for GitHub
>   Actions" and "About service containers".
> - **Videos (optional):** Fireship, *"Monorepos - How the Pros Scale Huge Software Projects"* ·
>   TechWorld with Nana, *"GitHub Actions Tutorial - Basic Concepts and CI/CD Pipeline with Docker"*.

**Q1.** What does `pnpm-workspace.yaml` do, and what does `pnpm --filter api test` mean?

<details><summary>Answer</summary>

It declares `apps/*` and `packages/*` as workspace packages: one install, one lockfile, one store,
with dependencies hard-linked from a global content-addressed store. `--filter api` runs the
script in the package named `api` only. The root scripts (`dev:api`, `infra:up`…) are shortcuts
for exactly that.

</details>

**Q2.** Why does the root `package.json` list `pnpm.onlyBuiltDependencies`?

<details><summary>Answer</summary>

pnpm 10 doesn't run dependencies' install scripts by default, as a supply-chain defence (an
install script can execute anything). You allow-list the packages that genuinely need them:
`argon2` builds a native binary, Prisma downloads its engines, and `esbuild` and `sharp` fetch
platform binaries.

</details>

**Q3.** `tsconfig.base.json` turns on `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
Point to a line in your code that each one forced.

<details><summary>Answer</summary>

- `noUncheckedIndexedAccess`: indexing an array or record gives `T | undefined`. See
  `items[items.length - 1]!.id` in `problems.service.ts` and `toDifficulty[p.difficulty]!` in
  `seed.ts`. Each `!` is a claim you must be able to defend: the length check right before it
  guarantees the element exists.
- `exactOptionalPropertyTypes`: `prop?: string` no longer accepts an explicit `undefined`. That's
  why `problem.entity.ts` says `explanation?: string | undefined`, and why the repositories build
  objects with conditional spreads (`...(params.cursor !== undefined && { cursor: … })`,
  `...(role && { role })`) instead of passing `undefined`.

</details>

**Q4.** What runs when you `git commit`, in what order, and what happens if one step fails?

<details><summary>Answer</summary>

1. `.husky/pre-commit` runs `pnpm lint-staged`. For each staged file matching a glob in
   `.lintstagedrc.mjs`: `eslint --fix` on that file, then the package's whole typecheck.
2. `.husky/commit-msg` runs `commitlint`: Conventional Commits, plus the `scope-enum` in
   `commitlint.config.mjs` (`api`, `worker`, `web`…).

Any non-zero exit aborts the commit. `git commit --no-verify` skips both, which is exactly why
hooks are not the gate (Q6).

</details>

**Q5.** In `.lintstagedrc.mjs`, the typecheck is written `() => 'pnpm --filter api run typecheck'`,
a **function**, not a string. Why?

<details><summary>Answer</summary>

lint-staged appends the staged file paths to string commands. `tsc --noEmit a.ts b.ts` ignores
`tsconfig.json` and checks those files in isolation with default options: wrong flags, missing
context. A function returning a string receives no file list, so the typecheck runs on the whole
project with its real config.

</details>

**Q6.** What belongs in a hook, and what belongs in CI?

<details><summary>Answer</summary>

Hooks are fast, local and skippable: lint, format, typecheck, the seconds-long checks that save
you a round trip. CI is the gate nobody can skip, running in a clean machine: install from the
lockfile, build, unit tests, **e2e against a real Postgres**, and the dojo content checks. A
`--no-verify` commit still has to get through CI.

</details>

**Q7.** Walk through the three CI jobs. Why does the `build` job run `prisma generate` with a
fake `DATABASE_URL`?

<details><summary>Answer</summary>

`build` runs lint, typecheck, build and the unit tests. `api-e2e` starts a Postgres service, runs
`migrate deploy`, then the e2e suites. `dojo-content` checks generators, diagrams and guide
exercises. `generated/` is gitignored, so CI has no Prisma client until it generates one.
`generate` reads the schema and never connects, but `prisma.config.ts` throws when `DATABASE_URL`
is unset, so any syntactically valid URL satisfies it.

</details>

**Q8.** Why does `test:e2e` pass `--runInBand`? And why does `docker-compose.yml` map Postgres to
5433?

<details><summary>Answer</summary>

The suites share one database, and Jest's default parallel workers would race on the same rows.
`--runInBand` runs them serially in one process. 5433 because a native PostgreSQL (WSL systemd)
already holds 5432 on your machine. CI uses 5432 because its runner is empty.

</details>

---

## 3. The NestJS skeleton (35 min)

> **📚 Study**
> - **Your guides:** [the dojo's NestJS guide](../../apps/dojo/content/supplements/nestjs.md),
>   Parts 3 (the four building blocks), 4 (modules, including global and `forRoot`), 8 (DTOs and
>   validation), 9 (the request lifecycle), 13 (exception filters), 16 (lifecycle hooks) and
>   17 (configuration). Then [phase-0 §B.4, the request lifecycle](../phase-0-foundations.md).
> - **NestJS:** [First steps](https://docs.nestjs.com/first-steps) ·
>   [Pipes](https://docs.nestjs.com/pipes) · [Validation](https://docs.nestjs.com/techniques/validation)
>   (`whitelist`, `transform`) · [Exception filters](https://docs.nestjs.com/exception-filters) ·
>   [Configuration](https://docs.nestjs.com/techniques/configuration) (the custom `validate`
>   function) · [Lifecycle events](https://docs.nestjs.com/fundamentals/lifecycle-events)
>   (`enableShutdownHooks`).
> - **Validation libraries:** [Zod](https://zod.dev) (coercion) ·
>   [class-validator](https://github.com/typestack/class-validator).
> - **Prisma 7:** [Prisma docs](https://www.prisma.io/docs), search "Prisma Config reference",
>   "driver adapters" and "upgrade to Prisma ORM 7": that's where `prisma.config.ts` and the
>   missing `url` come from.
> - **Video (optional):** Fireship, *"NestJS in 100 Seconds"*.

Open `apps/api/src/main.ts` and `app.module.ts`.

**Q9.** Go through `bootstrap()` line by line. Which of those lines does an e2e test **have to**
repeat, and what goes wrong if it doesn't?

<details><summary>Answer</summary>

It creates the app from `AppModule`, adds `cookieParser` middleware, a global `ValidationPipe`
(whitelist + transform), the global `AllExceptionsFilter`, CORS with one exact origin and
credentials, and shutdown hooks; then it reads `PORT` from `ConfigService` and listens. The e2e
tests repeat cookieParser, the pipe and the filter (look at `beforeAll` in `auth.e2e-spec.ts`).
Anything configured in `main.ts` but not in the test is **untested in its production shape**:
without the pipe, a test that should get a 400 would silently pass. (CORS isn't needed: supertest
sends no `Origin`.)

</details>

**Q10.** `ConfigModule.forRoot({ validate: validateEnv })`: what happens if `JWT_SECRET` is 10
characters long? Why `z.coerce.number()` for `PORT`?

<details><summary>Answer</summary>

The app refuses to start and prints every failing Zod issue. Fail fast at boot instead of a
confusing failure at the first login. Environment variables are always strings, so `coerce` turns
`"3001"` into `3001` before validating the range.

</details>

**Q11.** `ValidationPipe({ whitelist: true, transform: true })`: what does each flag do? Give an
example from your own API.

<details><summary>Answer</summary>

- `whitelist`: properties without a decorator in the DTO are **silently stripped**. Rejecting
  them with a 400 would need `forbidNonWhitelisted`. Checked on 28 Oct: `GET /problems?evil=1` →
  200, and `role: "ADMIN"` in a register body creates a plain `USER`.
- `transform`: the handler receives a real `ListProblemsDto` instance with converted types. `?limit=5`
  arrives as the string `"5"`; `@Type(() => Number)` plus transform make it `5`, and the
  `limit = 20` default applies when it's absent.

</details>

**Q12.** Why does `AllExceptionsFilter` send a real message for a 4xx but a generic one for a 5xx?

<details><summary>Answer</summary>

A 4xx is the client's mistake, and the message tells them what to fix. A 5xx is your mistake, and
its details (stack traces, SQL, file paths) help an attacker map your internals. So the details go
to the log (`this.logger.error`), and the client gets "Internal server error".

</details>

### 🐛 I-3 · validation errors arrive as "Bad Request Exception"

```bash
curl -s -X POST localhost:3001/auth/register -H 'content-type: application/json' \
  -d '{"email":"x@y.com","username":"ab","password":"short"}'
# {"statusCode":400,"message":"Bad Request Exception",…}
```

The DTO knows exactly what's wrong (username too short, password too short), and the user sees
none of it. `AuthForm` shows this message as-is.

<details><summary>Hint 1</summary>

Throw a `ValidationPipe` error in a test and log both `exception.message` and
`exception.getResponse()`. Which one carries the field messages?

</details>

<details><summary>Hint 2</summary>

Write the e2e assertion first: a short password → 400, **and** the body's `message` mentions
`password`. Then change the filter so that, for an `HttpException`, the client sees what
`getResponse()` holds. Mind its type: it can be a string or an object whose `message` is a string
or a string array.

</details>

**Q13.** Why is `PrismaModule` marked `@Global()`, and what does that cost?

<details><summary>Answer</summary>

Every module needs `PrismaService`; global saves importing it everywhere. The cost is a hidden
dependency: a module's `imports` no longer tell you it touches the database. Acceptable for one
piece of infrastructure, never for a domain module.

</details>

**Q14.** Prisma 7: where does the connection string come from for the **CLI**, and where for the
**running app**? Why does `schema.prisma` say `moduleFormat = "cjs"`?

<details><summary>Answer</summary>

The CLI (`migrate`, `generate`, `seed`) reads `prisma.config.ts`, which loads `.env` through
`dotenv`. The app builds its own driver adapter in `PrismaService`:
`new PrismaPg(config.getOrThrow('DATABASE_URL'))`. Prisma 7 has no built-in connection and no `url`
in the schema. `cjs` because the API is CommonJS (no `"type": "module"`). Without it Prisma emits
ESM and Node dies with `exports is not defined in ES module scope`: your hardest September bug.

</details>

### 🐛 I-2 · `start:prod` runs a file that doesn't exist

```bash
pnpm --filter api build && pnpm --filter api start:prod   # Error: Cannot find module '…/dist/main'
ls apps/api/dist                                          # generated  prisma  src  …
```

You won't run `start:prod` until week 4's Dockerfile. Fix it now anyway, while the reason is
fresh.

<details><summary>Hint</summary>

`tsc` puts the output under the **common root of every compiled file**. `src/` is no longer the
only input: what else did the build compile, and where does it sit relative to `src/`? Then decide
whether to change the script or the build. Each has a consequence for the Dockerfile.

</details>

---

## 4. Ports and adapters (30 min)

> **📚 Study**
> - **Your guides:** [backend-architecture](../../apps/dojo/content/supplements/backend-architecture.md)
>   Parts 2 (the one rule), 3 (the five layers) and 5 (ports and adapters, mechanically) ·
>   the NestJS guide's Part 5 (providers and tokens) ·
>   [phase-0 §B.2 (DI, the *why*), §C.3 (hexagonal) and §C.4 (the repository pattern)](../phase-0-foundations.md).
> - **NestJS:** [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers)
>   (`useClass`, non-class tokens).
> - **The originals:** Alistair Cockburn, [*Hexagonal Architecture*](https://alistair.cockburn.us/hexagonal-architecture/)
>   (the 2005 article that named "ports and adapters") · Martin Fowler,
>   [*Inversion of Control Containers and the Dependency Injection pattern*](https://martinfowler.com/articles/injection.html).
>   Both are short, and quoting them in an interview shows you went to the source.

Open `apps/api/src/problems/` and draw its four folders and every import arrow **before** reading
on.

**Q15.** Where do the arrows point, and where are the two sides wired together?

<details><summary>Answer</summary>

`http` (controller, DTO) → `application` (service) → `ports` (an interface and a Symbol) ←
`adapters` (the Prisma repository implements the port). `domain` (the entity) is imported by
everyone and imports nothing. `application` never imports Prisma or an adapter. The wiring is one
line in `problems.module.ts`: `{ provide: PROBLEMS_REPOSITORY, useClass: PrismaProblemsRepository }`.

</details>

**Q16.** `ProblemsService` needs `@Inject(PROBLEMS_REPOSITORY)`, yet the controller receives
`ProblemsService` with no decorator at all. Why the difference?

<details><summary>Answer</summary>

Nest reads constructor parameter types from the metadata TypeScript emits (`emitDecoratorMetadata`).
A class exists at runtime, so it can serve as its own token. An interface is erased at compile
time, so the metadata just says `Object` and Nest can't know what to inject. You supply an
explicit token: the Symbol.

</details>

**Q17.** What does the `ProblemsRepository` interface buy you **at runtime**? Why a Symbol and
not the string `'ProblemsRepository'`?

<details><summary>Answer</summary>

At runtime, nothing: it's erased. It buys a compile-time contract (the adapter must implement
every method) and the swap (a fake in tests, Prisma in production). A Symbol is unique: two
modules can't collide on it by accident, and a typo is a compile error because you import it
instead of retyping a string.

</details>

**Q18.** `AuthModule` imports `UsersModule`. Can `AuthService` inject `USERS_REPOSITORY`?

<details><summary>Answer</summary>

No. Providers are private to their module unless exported, and `UsersModule` exports only
`UsersService`. Auth has to go through the service, and the container enforces that encapsulation
for you.

</details>

**Q19.** Why does the `User` entity have no `passwordHash`? What is `findCredentialsByEmail`?

<details><summary>Answer</summary>

A type that cannot carry a secret cannot leak one: `register` returns a `User`, it becomes JSON,
and there's no hash to send (the e2e test asserts it). `findCredentialsByEmail` is the deliberate,
narrow exception: it returns `{ id, passwordHash, role }`, and only login calls it.

</details>

**Q20.** An interviewer says: "That's a lot of files for a CRUD app." Answer honestly.

<details><summary>Answer</summary>

For listing problems alone, yes. The pattern pays where there's a real second implementation or a
need for fast tests: the password hasher (Argon2 vs a fake), the refresh-token store, and next
week the worker's `CodeRunner` (fake today, Docker next). The unit suite runs in about 1.4 s with
no database. Where it stops paying: `prisma-users.repository.ts` repeats the same row-to-`User`
mapping four times. Knowing where the ceremony stops paying is the senior part of the answer.

</details>

**Q21.** `problems.service.spec.ts` calls `new ProblemsService(fakeRepo)` with no Nest at all. Why
is that possible, and what would it mean if it weren't?

<details><summary>Answer</summary>

The service depends only on the port, and the fake is a plain object with the right methods.
If a service's unit test needed a database, the service would be reaching past its layer: the slow
test is the architecture telling on itself.

</details>

### 🐛 I-5 · the Hello World boilerplate is still wired

`curl localhost:3001/` → `Hello World!`. Four files (`app.controller.ts`, `app.service.ts`,
`app.controller.spec.ts`, `test/app.e2e-spec.ts`) exist only because `nest new` generated them,
and `/health` already answers "is it alive?". Remove them, keep `pnpm -r typecheck` and both test
suites green, and write a commit message that explains *why* they went.

---

## Before you stop

- [ ] stack started from zero; unit tests green; I-1 fixed, so the e2e suites are green too
- [ ] I-4 fixed so a fresh clone works
- [ ] Q1–Q21 marked ✅ / 🟡 / ❌, with the misses copied to your list
- [ ] Git Part 1: `~/bcgx-prep/foundations/git.md` Part 1, with
  [the dojo's Git guide](../../apps/dojo/content/supplements/git-workflow.md) Parts 1–3 and
  [Pro Git, chapter 2](https://git-scm.com/book/en/v2) as references
