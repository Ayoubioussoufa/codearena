# Build from scratch: Upsolve

**3h30 a day, Thu → Sat, then 1h on Sunday.** The build half of the refresher week. First you
re-learn and fix CodeArena (parts 1–5); then, the same day, you build the same things again from
a blank folder, in a project of your own.

## What it is

**Upsolve** is a backend API where you log your competitive-programming attempts: the problem, the
pattern, whether you solved it, how long it took, and **what you missed**. "Upsolving" is solving
the problems you couldn't during a contest, which is what you'll do every Saturday this month.

It's small on purpose: users plus **one** resource, an attempt. The domain should cost you nothing,
so every hour goes to the skills you're revising.

### How you'd use it

Saturday, a Codeforces virtual contest. Problem C beat you: 40 minutes, and you never saw that the
array could be sorted first. You log it:

- `POST /attempts`: platform `CODEFORCES`, the problem's URL, "C. Pair Sums", pattern
  `two pointers`, result `FAILED`, 40 minutes, note "didn't see that sorting keeps the answer".

On Sunday you upsolve it with the editorial's hint:

- `PATCH /attempts/<id>`: result `SOLVED_WITH_HINT`.

A week later you ask it questions:

- `GET /attempts?result=FAILED`: what's still left to upsolve;
- `GET /attempts?pattern=two pointers`: how often this pattern beats you, newest first.

There's no web page yet: you call the API from **Postman**, the way backend teams share and
exercise APIs. Set it up properly, as you would at work:

- **one collection**, one folder per area (auth, attempts, admin), every request documented with
  what it expects;
- **an environment** holding `baseUrl` (`http://localhost:4001`) and `accessToken`, so no URL or
  token is pasted into a request by hand;
- **a post-response script on Login and Refresh** that stores the returned access token in that
  variable, so every protected request just sends `Bearer {{accessToken}}`;
- the **refresh cookie** is handled by Postman's cookie jar, as a browser would. Open the jar after
  login and check its attributes against your contract;
- **export the collection into the repo** (`postman/`) and commit it, so a teammate can run your
  API in two minutes. Never export an environment containing a real token.

Postman is how you explore and demo. The **e2e tests** are what prove the behaviour: a check that
only exists in Postman isn't a test.

**The admin.** You are the admin, and nobody else. There is deliberately **no endpoint that grants
the ADMIN role**: you promote your own account with one SQL statement in `psql`. An endpoint that
grants roles is a privilege-escalation bug waiting to happen. As admin you can list users and ban
one, which instantly kills every session they have.

### What it trains

| You re-learn it in CodeArena… | …and rebuild it here | …plus what CodeArena doesn't have yet |
|---|---|---|
| a pnpm monorepo, strict TypeScript, husky, lint-staged, commitlint, CI | yes, all from `git init` | a workspace package that **really** is consumed (`packages/shared`) |
| the NestJS skeleton, Zod config, the pipe, the filter, `/health` | yes | an exception filter that keeps validation messages (I-3) |
| ports and adapters, Prisma 7, migrations | yes | |
| Argon2id, JWT, global guard, refresh rotation and reuse detection, cookies | yes | rotation that is **race-free from the first commit** (I-6) |
| roles | yes | an admin with a real job: **banning a user**, which forces the stateless-JWT trade-off |
| cursor pagination | yes | pagination on a **non-unique** sort key (newest first), which needs a tiebreaker |
| rate limiting, e2e tests in CI | yes | **per-row ownership**: nobody can touch another user's attempts |

Keep your real misses in `~/cp/misses.md`. Upsolve is practice: if it turns out useful, good, but
don't migrate anything during the sprint.

**Not this week:** a frontend, reminders, statistics, imports from Codeforces, deployment. If you
catch yourself building one of these, stop.

**Later, after the sprint (your roadmap):**

- **Reminders:** a missed problem comes back after a while, with a suggestion to retry it. That's
  spaced repetition, so read `docs/phase-3-rating-mastery-math.md` Part D (FSRS) first. It also
  needs something that runs on a schedule, which is a new piece of architecture.
- **A UI with your success rate per pattern:** an aggregation query (`GROUP BY` pattern), its
  index, and the frontend skills from CodeArena's web app.
- **An LLM feature**, once you've built one in CodeArena first.

Keep v0.1's design ready for them: for example, recording *when* you attempted a problem (already
in the data model) is what reminders will need.

## Where it lives

**A brand-new folder, `~/upsolve`, next to `~/CODEARENA`, with its own Git repository and its own
GitHub repository.** Private or public, your choice; either way, CodeArena stays the project on
your CV.

Not inside CodeArena, for two reasons:

- **Creating the repo is Thursday's exercise.** Inside CodeArena you'd inherit its workspace,
  tsconfig, lockfile, hooks and CI, which is exactly the setup you're supposed to build yourself.
- **Git would treat it as part of CodeArena.** CodeArena's hooks would run on your commits, its CI
  would run on your code, and its history (the one interviewers read) would fill up with practice.

This spec stays here in CodeArena, so open it from `~/CODEARENA/docs/revision/` while you work.

## Will four days be enough?

**Probably not for everything, and that's by design.** Each day's list is in priority order, with
a **minimum** line. Above the line is what the day must produce; below it is what you get to if
the day goes well.

An honest forecast:

- **Thursday is the heaviest**, because the tooling is the part you've never done yourself.
  Expect to reach the minimum (green CI) and Prisma. The rest may spill into Friday's
  fix hour.
- **Friday is the part you know best**: auth was your September. The minimum is likely, and the
  whole list is possible.
- **Saturday**: ownership, pagination and the e2e suite in CI are realistic. Rate limiting, the
  admin and the web page are likely cut.

Finishing **70–80 %** with every minimum met is a good week. Finishing 100 % by skipping the
compare step, or by peeking all day, is not.

---

## The rules

1. **Build blind.** CodeArena stays closed during the build block, and so do the old walkthroughs.
   Allowed: the official docs in each day's *read* table, the official generators (`nest new`,
   `prisma init`), and notes you wrote yourself earlier that day. Not allowed: copying from CodeArena,
   or asking an AI for code.
2. **Stuck for 30 minutes with no new hypothesis to test?** Open CodeArena for **that one thing**,
   then write it on a *peeked* list: what you looked at, and why you couldn't produce it. That list
   is the most honest measure of the week. Its items become Monday's first hour.
3. **Type everything.** Including the config files. Especially the config files.
4. **One branch and one PR per day**, Conventional Commits, and **CI green before you merge**.
   That's your Git and GitHub Actions practice, every day, for real.
5. **When a piece works, compare.** Open the matching CodeArena file and write three lines in
   `COMPARE.md`: what differs, which version is better, and why.
6. **Hard stop on Sunday evening**, wherever you are. Monday is CodeArena's judge week.

When you want a review, push and tell me the PR or the commit. I'll answer with findings and
hints, never fixes.

## Work like a team, even alone

At a big tech company, nobody pushes to `main`, and every change has a written reason. Do the same
here, because these habits are exactly what interviewers ask about ("walk me through how your team
ships a change").

- **An issue before the work.** One GitHub issue per piece of work, with its acceptance criteria
  (copy the day's *done when* list). The PR that finishes it says `Closes #N`.
- **A protected `main`.** In the repository settings: changes only through pull requests, the CI
  check required to pass, no force-push. Alone you can't require an approving review, but you can
  require CI.
- **A PR template** (`.github/pull_request_template.md`) with four headings: *What* · *Why* ·
  *How I tested it* · *Security notes*. Write every PR description for a reviewer who has never
  seen the code.
- **A security pass on every PR**, as the template's last heading. Is all input validated at the
  edge? Is ownership checked on every row this touches? Could an error message leak anything? Is a
  secret anywhere it shouldn't be? It's OWASP's checklist, reduced to one minute.
- **Secrets never in git.** Commit an `.env.example`, never a `.env`. Anything secret that CI
  needs goes in the repository's Actions secrets, not in the workflow file.
- **Commit messages explain why.** The diff already shows *what* changed; the message says why it
  had to change.
- *Beyond the minimum:* Dependabot for dependency updates, and the README's "how to run it" tested
  from a fresh clone.

---

## The contract

Run it on its own ports, so it can live next to CodeArena (which uses 3000, 3001, 5433 and 6379):
**API on 4001, Postgres on 5434.**

| Method and path | Who | Success | Failures |
|---|---|---|---|
| `POST /auth/register` | anyone | 201, the user (never the hash) | 400 **with the field messages** · 409 duplicate |
| `POST /auth/login` | anyone | 200 `{ accessToken }` + the refresh cookie | 401, the same body for every cause · 429 after 5 a minute |
| `POST /auth/refresh` | the cookie | 200 `{ accessToken }` + a rotated cookie | 401 |
| `POST /auth/logout` | the cookie | **204**, idempotent | none |
| `GET /auth/me` | user | 200 `{ id, role }` | 401 |
| `POST /attempts` | user | 201, the attempt | 400 · 401 |
| `GET /attempts?limit&cursor&pattern&result` | user | 200 `{ items, nextCursor }`, **only yours**, newest first | 400 · 401 |
| `GET /attempts/:id` | owner | 200 | **404 if it isn't yours** · 401 |
| `PATCH /attempts/:id` | owner | 200 | 400 · 404 · 401 |
| `DELETE /attempts/:id` | owner | 204 | 404 · 401 |
| `GET /admin/users` | admin | 200, the users | 401 · 403 |
| `POST /admin/users/:id/ban` | admin | 204, and every session of that user is revoked | 401 · 403 · 404 |
| `GET /health` | anyone | 200 `{ status, db }` | |

Why 404 and not 403 for someone else's attempt? Answer it in your first ADR (Saturday).

## The data, in words

You write the Prisma schema. It has to express this:

- **User**: an unguessable id, a unique email, a unique username, the password hash, a role
  (`USER` or `ADMIN`), *when* they were banned (empty if never), and the creation time.
- **RefreshToken**: an id, its user (deleted with the user), the token's **hash** (unique), its
  family, when it was revoked (empty while alive), when it expires, and when it was created. Think
  about the index `revokeFamily` and "ban → revoke everything for a user" need (I-16).
- **Attempt**: an unguessable id, its owner (deleted with the owner), the platform (`CODEFORCES`,
  `LEETCODE` or `OTHER`), the problem's URL, a title, a pattern (a short tag such as
  `two pointers`), the result (`SOLVED`, `SOLVED_WITH_HINT` or `FAILED`), minutes spent (1 to 600),
  a note (what you missed, with a length cap), when you attempted it, and when the row was created
  and last updated. The list's main query is "my attempts, newest first, maybe filtered by pattern
  or result". Design its index for that query.

---

## Thursday: from `git init` to green CI

### Read

**In the re-learn block, before the build** (your own guides, in `~/CODEARENA` and `~/bcgx-prep`):

| Topic | Where |
|---|---|
| pnpm workspaces, Docker | `docs/phase-0-foundations.md` §D.1 and §D.2 |
| Nest's building blocks, modules, providers | `apps/dojo/content/supplements/nestjs.md` Parts 3–5 |
| DTOs, the pipe, exception filters, configuration, the CLI | the same guide, Parts 8, 13, 17 and 21 |
| Branches and pull requests | `~/bcgx-prep/foundations/git.md` Parts 1–2 · `git-workflow.md` Part 12 |

**Open during the build** (official docs):

| Topic | Where |
|---|---|
| Workspaces and `--filter` | [pnpm: Workspaces](https://pnpm.io/workspaces) · [Filtering](https://pnpm.io/filtering) |
| Every tsconfig flag | [TypeScript: tsconfig reference](https://www.typescriptlang.org/tsconfig) |
| A new Nest app | [NestJS: First steps](https://docs.nestjs.com/first-steps) · [CLI](https://docs.nestjs.com/cli/overview) |
| Hooks | [husky](https://typicode.github.io/husky/) · [lint-staged](https://github.com/lint-staged/lint-staged) · [commitlint](https://commitlint.js.org/) · [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) |
| CI | [pnpm: Continuous Integration](https://pnpm.io/continuous-integration) · [GitHub Actions docs](https://docs.github.com/en/actions) ("Building and testing Node.js") |
| Team setup | [GitHub docs](https://docs.github.com/en): search "About protected branches" and "Creating a pull request template for your repository" |
| Postgres in Compose | [Docker Compose](https://docs.docker.com/compose/) · [the postgres image](https://hub.docker.com/_/postgres) |
| Prisma 7 | [Prisma docs](https://www.prisma.io/docs): search "Prisma Config reference", "driver adapters", "prisma-client generator" |
| Config, validation, filters | [NestJS: Configuration](https://docs.nestjs.com/techniques/configuration) · [Validation](https://docs.nestjs.com/techniques/validation) · [Exception filters](https://docs.nestjs.com/exception-filters) · [Zod](https://zod.dev) |

**Only after your version works:** the walkthrough you never typed yourself,
`git show b06c097:REPO-HYGIENE-GUIDE.md | less` (run it in `~/CODEARENA`). Compare, don't copy.

### Build, in priority order

1. `git init`, a `.gitignore` you can justify line by line, and a pnpm workspace with
   `apps/api` and `packages/shared`.
2. A root `package.json`: the `packageManager` and `engines` fields, and the scripts you'll
   actually use. A `tsconfig.base.json` whose every strict flag you can defend (part 1, Q3).
3. `apps/api` with `nest new`, then adapted to the monorepo, with the boilerplate removed (I-5).
4. ESLint, then husky + lint-staged + commitlint, with your own scope list.
5. A GitHub repository and a GitHub Actions workflow: frozen install, lint, typecheck, build,
   unit tests. Then the team setup from *Work like a team*: the protected `main`, the PR template,
   and the issues for Thursday's work.

**── minimum for Thursday ──**

6. A Compose file with Postgres on 5434; Prisma 7 with a `User` model only, the driver adapter, and
   a first migration; `/health` checking the database. Add Prisma generate to CI.
7. Config validated with Zod, a global `ValidationPipe`, and an exception filter that **keeps** the
   validation messages.
8. `packages/shared`: export the attempt enums and response types, and **import them from the
   API**. It must still work after `build`, when plain `node` runs the output.

### Done when

- [ ] `git commit --allow-empty -m "stuff"` is **rejected** by commitlint
- [ ] a commit containing a type error is **rejected** by the pre-commit hook
- [ ] a PR shows the CI check green, and a branch with a lint error shows it red
- [ ] `git push origin main` is **refused** by GitHub: the only way in is a PR with green CI
- [ ] Thursday's PR closes its issue, and its description fills in all four template headings
- [ ] *(beyond the minimum)* from zero (`docker compose down -v`, then up, then `migrate deploy`)
  everything works
- [ ] *(beyond)* `pnpm --filter api build`, then `start:prod`, then
  `curl localhost:4001/health` gives `"db":"up"` (I-2)
- [ ] *(beyond)* a `JWT_SECRET` that's too short makes the API refuse to start, with a readable
  message
- [ ] *(beyond)* an invalid body comes back as a 400 that **names the field** (I-3)

<details><summary>Traps (open only when you're stuck)</summary>

- `nest new` creates its own git repository and picks a package manager: read its flags first.
- Files passed by lint-staged to a string command → `tsc` ignores your `tsconfig` (part 1, Q5).
- husky only installs its hooks when a script runs it after install. Which script, and why does a
  fresh clone need it?
- CI has no generated Prisma client: it has to create one, and `prisma.config.ts` wants a URL.
- pnpm 10 doesn't run dependencies' build scripts. Prisma needs them today, and Argon2 tomorrow.
- Prisma 7 with a CommonJS app: remember your hardest September bug (part 1, Q14).
- `tsc` puts output under the common root of everything it compiles. Know where `main.js` lands
  before you write `start:prod`.
- A workspace package whose `main` points at a `.ts` file works with `tsx` and in Next.js, **not**
  with `node` running a compiled API. Decide whether `shared` gets its own build, and what its
  `main` and `types` point at.

</details>

**Compare** with CodeArena: `.lintstagedrc.mjs`, `commitlint.config.mjs`, `.github/workflows/ci.yml`,
`tsconfig.base.json` and `apps/api/src/main.ts`.

---

## Friday: auth, race-free

### Read

**In the re-learn block** (your own guides):

| Topic | Where |
|---|---|
| Passwords, tokens, rotation, XSS/CSRF, RBAC | `docs/phase-1-auth-data-frontend.md` Part B (§B.1–B.5) and §C.2 |
| Ports and adapters, mechanically | `apps/dojo/content/supplements/backend-architecture.md` Parts 3 and 5 |
| Guards, custom decorators, testing | `nestjs.md` Parts 11, 15 and 18 |
| The decisions | CodeArena's ADRs 002–005 (part 2 starts with them) |
| The API surface of `argon2`, `@nestjs/jwt`, `@nestjs/throttler` | your old week 1 notes, `git show b06c097:WEEK-1-KNOWLEDGE.md \| less`. **Re-learn block only**: close them before the build |

**Open during the build** (official docs):

| Topic | Where |
|---|---|
| JWT in Nest, global guards, `@Public()` | [NestJS: Authentication](https://docs.nestjs.com/security/authentication) |
| Symbol tokens | [NestJS: Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) |
| Cookies | [NestJS: Cookies](https://docs.nestjs.com/techniques/cookies) · [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) |
| Argon2 | [node-argon2](https://github.com/ranisalt/node-argon2) · [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) |
| Unit and e2e tests | [NestJS: Testing](https://docs.nestjs.com/fundamentals/testing) · [Jest configuration](https://jestjs.io/docs/configuration) (`moduleNameMapper`) |
| The atomic consume | [Prisma docs](https://www.prisma.io/docs): the Prisma Client API reference, `updateMany` and what it returns |
| Calling it by hand | [Postman docs](https://learning.postman.com/docs/): environments and variables, post-response scripts, the cookie jar |

### Build, in priority order

1. The users module with a port and a Prisma adapter, a `User` entity that **cannot** carry the
   hash, and the one narrow credentials lookup.
2. The `PasswordHasher` port, the Argon2id adapter and its unit tests: the positive case, the
   **negative** case and salting.
3. Register and login, with the timing defence and one identical 401. A JWT carrying `sub` and
   `role`, configured asynchronously from the validated config.
4. A **global** guard with `@Public()`, a `@CurrentUser()` decorator, and `GET /auth/me`.
5. Refresh tokens: opaque, stored as a hash, a family per login, rotation in the same family,
   reuse detection, and **a consume step that is atomic** (I-6). An httpOnly cookie scoped to
   `/auth`. Logout revokes the family and answers 204.

**── minimum for Friday: 1 to 5, proven by the replay test and the two-refreshes test ──**

6. The rest of the tests below: unit tests for the auth service against fakes, then e2e.

### Done when

Each one is an e2e test unless stated.

- [ ] rotate once, replay the old token → 401, **and the new one is dead too**
- [ ] **two refreshes sent together with one token → exactly one 200**
- [ ] stop Postgres: **the unit suite still passes**
- [ ] register → login → the cookie has `HttpOnly`, `SameSite`, `Path=/auth`, and the body has
  no refresh token
- [ ] an unknown email and a wrong password get byte-identical 401 bodies (timestamp aside)
- [ ] `/auth/me` gives 200 with the token, 401 without it, and 401 with the wrong scheme
- [ ] logout gives 204, a second logout also gives 204, and the refresh fails afterwards
- [ ] decode an access token by hand: it holds `sub`, `role`, `iat` and `exp`, and nothing else

<details><summary>Traps</summary>

- A field initializer that uses a constructor parameter runs too early (part 2, Q4).
- `expiresIn` as a number means seconds; the throttler's `ttl` (tomorrow) means milliseconds.
- Cookies need a parser before the controller can read them.
- The generated Prisma client imports `.js` files that don't exist on disk, and Jest resolves on
  its own (I-1). You fixed it in CodeArena on Thursday, so carry the fix over.
- "Atomic" here means one statement that both checks and revokes, and tells you whether **you**
  won. Look at what `updateMany` returns.

</details>

**Compare** with CodeArena's `auth/` folder: the order of the checks in rotation, the shape of the
ports, and the tests. Where is yours better now?

---

## Saturday: the resource, ownership, CI with a database

### Read

**In the re-learn block** (your own guides): `docs/phase-1-auth-data-frontend.md` §A.3 (indexes), §A.5
(pagination) and §A.7 (migrations); `nestjs.md` Part 11 again, for roles; CodeArena's
`docs/adr/template.md` for the two ADRs.

**Open during the build** (official docs):

| Topic | Where |
|---|---|
| Keyset pagination and its tiebreaker | [Use The Index, Luke: "No offset"](https://use-the-index-luke.com/no-offset) · [Prisma docs](https://www.prisma.io/docs): "Pagination" |
| Ownership | [OWASP: IDOR prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html) |
| Postgres in CI | [GitHub Actions docs](https://docs.github.com/en/actions): "Creating PostgreSQL service containers" |
| Rate limiting, roles | [NestJS: Rate limiting](https://docs.nestjs.com/security/rate-limiting) · [Authorization](https://docs.nestjs.com/security/authorization) |

### Build, in priority order

1. The `Attempt` model and its migration, then the module: port, adapter, service, controller,
   DTOs with real limits.
2. **Ownership**: every read, update and delete is scoped to the caller. Someone else's attempt is
   a 404.
3. The list: newest first, filters by pattern and result, and **keyset pagination with a
   tiebreaker**, free of I-10 and I-11 from the start.
4. The e2e suite **in CI**, against a Postgres service.

**── minimum for Saturday: 1 to 4 ──**

5. Rate limiting: 5 a minute on login and register, in its own test file.
6. Roles, and the admin: list users, ban a user (every family revoked, and login refused from then
   on).
7. Two short ADRs in `docs/adr/`: *404 rather than 403 for other people's attempts*, and *what a
   ban does to an access token that is already out there*.
8. *Cuttable:* a minimal Next.js app (login, your attempts list, the in-memory token and the
   refresh interceptor), consuming `packages/shared`.

### Done when

- [ ] user B gets 404 on user A's attempt, for GET, PATCH **and** DELETE, and A's attempt is unchanged
- [ ] 25 attempts created in the same second, walked 10 at a time: 25 distinct items, no
  duplicates, no gaps
- [ ] deleting the cursor's row between two pages doesn't end the walk (I-10)
- [ ] a last page that is exactly full → `nextCursor` is null, with no extra request (I-11)
- [ ] CI runs the e2e suite against Postgres, and it's green
- [ ] *(beyond)* the 6th login in a minute → 429
- [ ] *(beyond)* after a ban: the user's refresh → 401, their login → refused; a USER on
  `/admin/users` → 403; no token → 401
- [ ] *(beyond)* both ADRs written, each naming the alternative you rejected

<details><summary>Traps</summary>

- Prisma's `update` and `delete` want a **unique** `where`, and `{ id, ownerId }` isn't one. You
  have two ways out. Which one has a race between the check and the write?
- Sorting by a column that isn't unique: two rows created in the same millisecond. What must the
  cursor contain, and what does the `WHERE` look like for "after this row"?
- A Postgres service in GitHub Actions needs a health check before the migrations run.
- The throttler is registered as a global guard: overriding the guard in a test matches nothing
  (part 2, Q25).
- A banned user's **access token** keeps working until it expires. Decide whether that's
  acceptable, and write the reason down: that's your second ADR. Part 2, Q9 is the same trade-off.

</details>

**Compare** with CodeArena's problems module and its pagination. Which of today's ideas should go
back into CodeArena next week?

---

## Sunday: freeze (1 hour)

- [ ] a `README.md` in your own words: what it is, how to run it from zero, a diagram, and two
  decisions with what you rejected
- [ ] the Postman collection exported into `postman/`, with no token in it, and runnable from a
  fresh clone
- [ ] `COMPARE.md` finished: the five biggest differences from CodeArena, and what you'll port back
- [ ] the *peeked* list reviewed: each item gets a line in Monday's plan
- [ ] the last PR merged with CI green, and a `v0.1` tag

Then Upsolve stops. If it's unfinished, it stays unfinished: it was the practice, not the product.

---

## If a day runs out

Cut from the bottom of that day's list, never from above its minimum line. **Never cut** CI, the
ownership checks, or the race-free rotation: they're the point of the exercise.
