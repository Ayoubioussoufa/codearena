# Part 3 · Sat 31 Oct, first half: data and web

**2 hours 30.** 0:40 the schema and migrations · 0:50 one request, from the click to the SQL ·
0:40 TanStack Query · 0:20 the web issues.

Have `psql` open next to the code:

```bash
pnpm infra:up
docker exec -it codearena-postgres psql -U codearena -d codearena
\dt
\d "Problem"
\di
```

---

## 1. The schema and the migrations (40 min)

Open `apps/api/prisma/schema.prisma` and **both** files under `prisma/migrations/`. The SQL is the
truth; the schema is how you asked for it.

**Q1.** Why is `Problem.id` an autoincrementing `Int` while `User.id` and `Submission.id` are
cuids?

<details><summary>Answer</summary>

Problem ids are public and meant to be seen (`#1042` in the list), and the frontend contract is a
number. User data shouldn't have guessable, countable ids: a cuid hides how many submissions
exist and stops trivial enumeration. That's defence in depth, **never** a replacement for checking
that the caller owns the row (IDOR).

</details>

**Q2.** What does a foreign key enforce? Which index does Postgres **not** create for you, and
where did your schema compensate?

<details><summary>Answer</summary>

Referential integrity: no submission can point at a missing user, and `ON DELETE` says what
happens to the children. Postgres indexes primary keys and unique constraints automatically, **but
not the referencing column of a foreign key**. Hence `@@index([problemId])` on `ProblemExample` and
`TestCase` ("FK — always indexed"): joins need it, and so does `ON DELETE CASCADE`, which must find
the children.

</details>

**Q3.** `Submission.user` cascades on delete, but `Submission.problem` doesn't (read the migration:
`ON DELETE RESTRICT`). Why the difference?

<details><summary>Answer</summary>

Deleting an account must take its data with it (that's also the GDPR answer). Deleting a problem
that people have submitted to should **fail loudly**, because ratings and contest history depend on
it. Retire a problem; don't delete it.

</details>

**Q4.** For each index, name the query it serves:
`Problem(difficulty)` · `Submission(userId, createdAt DESC)` · `Submission(problemId, verdict)` ·
`RefreshToken(tokenHash)` unique · `RefreshToken(userId, family)`.

<details><summary>Answer</summary>

Filtering the list by difficulty · a user's history, newest first, paginated by cursor · acceptance
statistics per problem · `findByHash` on every refresh · intended for rotation lookups. Two of them
deserve suspicion; see Q5 and I-16.

</details>

**Q5.** 🔧 Is the difficulty index ever used? Run
`EXPLAIN ANALYZE SELECT id FROM "Problem" WHERE difficulty = 'EASY';` and read the plan.

<details><summary>Answer</summary>

Expect a sequential scan. Three distinct values over 333 rows: reading the whole small table is
cheaper than going through the index. A B-tree on a low-cardinality column rarely pays off unless
one value is rare and you query exactly that value (a *partial* index). Week 3 checks this at
2,000 problems with a skewed distribution.

</details>

### 🐛 I-16 · an index that can't serve its query (predict now, prove in week 3)

`revokeFamily` filters `WHERE family = … AND "revokedAt" IS NULL`. The only index mentioning
`family` is `(userId, family)`.

<details><summary>Why it can't help</summary>

It's the phone-book problem: a book sorted by (last name, first name) can't find every "Ahmed"
without reading the whole book. The leading column is `userId`, and this query doesn't constrain
it. Postgres 16 (the version you run) has no B-tree skip scan, so it reads the table. With a
handful of rows nobody notices; with millions of refresh tokens every replay detection gets
slower. **Don't fix it yet.** In week 3, seed enough rows, capture the `EXPLAIN (ANALYZE, BUFFERS)`,
then fix it and capture the plan again. That's one of your six "before and after" query plans.

</details>

**Q6.** Why are `acceptanceRate` and `totalSubmissions` stored as columns instead of computed?

<details><summary>Answer</summary>

The seed carries them and there are no submissions yet. Later, computing them per request means
aggregating millions of `Submission` rows on every visit to the list page, which is read-heavy.
Storing them is **denormalisation**: fast reads, at the cost of drift. They must be updated in the
same transaction as the verdict, or recomputed periodically. You'll choose which in week 2.

</details>

**Q7.** `migrate dev` vs `migrate deploy`: which runs where, and why must CI never run `dev`?

<details><summary>Answer</summary>

`dev` diffs your schema against the database, **writes a new migration**, applies it and
regenerates the client, and it may offer to reset the database when it detects drift. `deploy`
applies the committed migrations that are pending, in order: it never writes one and never resets.
CI and production run `deploy` only.

</details>

**Q8.** How do you add a `NOT NULL` column to a table with 10 million rows without taking the site
down? Which kind of column does ADR-006 ask for, and why?

<details><summary>Answer</summary>

Expand, then contract: add the column as nullable (or with a constant default, which is a
metadata-only change since Postgres 11), backfill it in batches, deploy code that writes it, then
add the constraint (a `CHECK … NOT VALID`, then `VALIDATE`, then `SET NOT NULL`). ADR-006 asks for
columns that are nullable or have defaults, so its migration is a plain `ADD COLUMN`: instant,
with no backfill.

</details>

**Q9.** Is `prisma/seed.ts` idempotent? Change one example in `problems.json`, run the seed twice,
and look at the database.

<details><summary>Answer</summary>

It's re-runnable, because it upserts by `slug` and never duplicates a problem. But the `update`
branch only touches the scalar fields. Tags and examples are written only on `create`, so your
edited example never reaches the database. Re-runnable is not the same as convergent.

</details>

---

## 🔧 2. One request, from the click to the SQL (50 min)

SPRINT asks you to trace one page. Use `/problems`. Say each stop out loud, with the file open.

1. `apps/web/src/app/problems/page.tsx` calls `useProblems()`
2. `hooks/use-problems.ts`: `useQuery`, its key, and `fetchAllProblems`'s loop
3. `lib/http.ts`, `api()`: the URL, `credentials`, and the `Authorization` header (is there one?)
4. In the API, the three guards in order: what does each decide for this route?
5. `ValidationPipe` and `ListProblemsDto`: what does `limit=100` become?
6. `ProblemsController.list` → `ProblemsService.list`: how is `nextCursor` computed?
7. `PrismaProblemsRepository.findMany`: which SQL comes out?
8. Back up again: where does `EASY` turn into `"Easy"`, and why there?

**Q10.** How many HTTP requests and how many SQL statements does opening `/problems` cost? Is the
`include` an N+1?

<details><summary>Answer</summary>

333 problems at 100 per page means **4 requests** (100, 100, 100, then 33, where `nextCursor`
becomes `null`). Each request runs **3 statements**, captured on 28 Oct with Prisma's query log:
one for the problems, one for their tags through `_ProblemToTag` using `WHERE "A" IN (…)`, and one
for the examples using `WHERE "problemId" IN (…)`. That's **12 in all**, and not an N+1: relations
are fetched once per page, not once per problem. 🔧 See it yourself: pass `log: ['query']` to the
client in a scratch script, or in `PrismaService` for one run (then take it out).

</details>

**Q11.** Why a cursor and not an offset?

<details><summary>Answer</summary>

`OFFSET 10000` makes the database read and throw away 10,000 rows, so deep pages get slower, and
rows shift when others are inserted or deleted (duplicates and gaps). A cursor *seeks* through the
index (`WHERE id > last`) at constant cost, and stays stable while the data changes.

</details>

**Q12.** Why does the controller map `EASY` to `"Easy"` instead of the domain or the database?

<details><summary>Answer</summary>

It's presentation. The web's contract wants `"Easy"`, while the domain keeps the enum the database
and the DTO understand. If the mapping lived in the domain, every other consumer (the worker, a
future admin tool) would inherit a UI detail.

</details>

### 🐛 I-10 · a deleted cursor row silently ends pagination

```bash
curl -s "localhost:3001/problems?limit=2&cursor=5"
# {"items":[],"nextCursor":null}      ← 333 problems have an id above 5
```

<details><summary>Hint 1: read the SQL</summary>

Prisma's query log shows how it implements `cursor`:
`WHERE id >= (SELECT id FROM "Problem" WHERE id = $cursor) … OFFSET 1`.
What does that subquery return when no row has that id, and what is `id >= NULL`?

</details>

<details><summary>Hint 2</summary>

Prisma's `cursor` needs the cursor row to *exist*. A plain `where` on the id doesn't. Write the
test first: a cursor between two real ids must return the next page.

</details>

### 🐛 I-11 · a full last page costs one extra request

`nextCursor` is set whenever a page comes back full. With exactly 300 problems, what does the
fourth request return?

<details><summary>Hint</summary>

The service can't know whether another page exists unless it looks. Ask the database for one row
*more* than the client asked for.

</details>

### 🐛 I-15 · the list sends 6.5× what it shows (measure today, fix in week 3)

The list page shows the id, title, tags, acceptance and difficulty. The API sends every field,
including description, constraints, starter code in three languages and the examples. Measured on
the seed: **305 KB** for the full objects against **47 KB** for the list fields.

<details><summary>What to think about</summary>

`select` instead of `include`, and a `ProblemListItem` shape in the domain, distinct from
`Problem`. How many of the three SQL statements survive? Measure the payload before and after in
the Network tab. Another before/after for week 3.

</details>

---

## 3. TanStack Query (40 min)

**Q13.** Server state vs client state: what did `useQuery` replace, and why was the old way
wrong?

<details><summary>Answer</summary>

Server state lives on the server, is shared, can go stale and arrives asynchronously. The old
`useState` + `useEffect` + loading flag re-implemented a cache in every component, badly: two
components fired two requests, nothing was de-duplicated, a response could arrive after unmount,
and there were no retries and no notion of staleness.

</details>

**Q14.** `staleTime` is 60 s. You leave `/problems` and come back after 30 seconds, then after
2 minutes. What happens each time?

<details><summary>Answer</summary>

After 30 s: a cache hit, and no request at all. After 2 minutes: the cached list renders
**immediately**, and a background refetch replaces it when it arrives. That's
stale-while-revalidate. A query nobody uses is garbage-collected after `gcTime` (5 minutes by
default).

</details>

**Q15.** Why does the retry policy refuse to retry anything below 500?

<details><summary>Answer</summary>

A 4xx answer won't change on retry: retrying a 404 or a 403 wastes requests and delays the error.
A 401 has already been through the refresh interceptor. Only a 5xx or a network failure might be
transient.

</details>

**Q16.** What does `invalidateQueries({ queryKey: ['problems'] })` clear? Why is the key built as
`problems → list` and `problems → detail → slug`?

<details><summary>Answer</summary>

Everything under that prefix: the list and every detail. Keys run from general to specific, so a
prefix invalidates a whole subtree in one line. Get the key shape right and invalidation is easy;
get it wrong and you fight it all day.

</details>

**Q17.** Why is the `QueryClient` created inside `useState` rather than at module level?

<details><summary>Answer</summary>

On the server, module scope is shared across requests, so one user's cached data could appear in
another user's render. `useState` gives one client per app instance in the browser and one per
render on the server.

</details>

**Q18.** `useLogin` invalidates everything on success. `useLogout` clears the cache in
`onSettled`, not `onSuccess`. Why each?

<details><summary>Answer</summary>

After login, anything cached for an anonymous viewer is wrong. Logout must end the **local**
session even if the request failed, because the server side is idempotent anyway and a user must
never keep a token because of a network blip.

</details>

**Q19.** Why does the refresh interceptor share one `refreshing` promise between callers?

<details><summary>Answer</summary>

Three requests that 401 together would otherwise send three refreshes. The second would present an
already-rotated token, reuse detection would fire, and the family would burn. All callers await
the same promise. Its limit is the tab boundary: that's I-7 (part 2).

</details>

**Q20.** The detail page is a server component that uses `server-api.ts`, not `http.ts`. Why not
reuse `http.ts`?

<details><summary>Answer</summary>

`http.ts` holds an access token in a module-level variable and refreshes through the browser's
cookie jar. Both are per-tab concepts. On the server there is no tab, and a module variable is
shared by every request, so one user's identity would leak into another's render.

</details>

**Q21.** 🔧 `generateMetadata` and the page both call `getProblem(slug)`. How many times does the
API serve that problem per page view? Predict, then count: add a temporary log line in
`ProblemsController.detail`.

<details><summary>What to look for</summary>

React memoises identical `GET` `fetch` calls within a single server render, so you should see
**one**. If you see two, find out why: that's the answer worth remembering.

</details>

**Q22.** What's still mocked in the web app, and which week replaces each piece?

<details><summary>Answer</summary>

`src/lib/api.ts`: `runCode` (week 2, `POST /submissions` and a live verdict), `getLeaderboard` and
`getContests` (week 3, standings per ADR-006), and `getCurrentUser`, `updateProfile`,
`changePassword` and `deleteAccount` (no week yet: cuttable, honestly).

</details>

### 🐛 I-12 · logout answers 200 with an empty body

```bash
curl -s -i -X POST localhost:3001/auth/logout | head -3
# HTTP/1.1 200 OK … Content-Length: 0
```

Read `api()` in `http.ts` and follow what happens to that response.

<details><summary>Hint 1</summary>

`api()` skips parsing only for **204**. What does `res.json()` do with an empty body?

</details>

<details><summary>Hint 2</summary>

The logout still "works" (`onSettled` clears the token), but the mutation ends in an error state.
Decide which side is wrong. What is the honest status code for "done, nothing to send back"? Pin
your choice with an e2e assertion.

</details>

### 🐛 I-13 · `useMe` is a mutation

<details><summary>Hint</summary>

"Who am I?" is read on render, shared and cacheable: which hook is that? `queryKeys.me` already
exists and nothing uses it. Think about what `retry` should be for this one query, given the
interceptor.

</details>

### 🐛 I-14 · 11,327 lines nobody imports

`PROBLEMS` in `apps/web/src/lib/data.ts`, and all of `src/lib/dsa-problems.ts`. Problems come from
the API now. Prove they're dead (who imports what?), then delete them and keep `pnpm --filter web
build` green. The seed in `apps/api/prisma/seed-data/problems.json` is the catalog's source now.

---

## Before you stop

- [ ] the trace from click to SQL, out loud, with the 12 statements counted yourself
- [ ] Q1–Q22 marked, misses copied
- [ ] at least two of I-10 to I-14 fixed, each with a test or a build that failed first
- [ ] I-15 and I-16 measured or predicted and noted for week 3
