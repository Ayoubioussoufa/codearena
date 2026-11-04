# Lab 0016: three slow queries, rewritten

`bash check.sh` seeds lesson 15's 300,000 submissions **with lesson 15's
indexes already built**, then runs your three files and compares each answer,
and each plan, with the slow version below. Each file is one SQL statement,
with psql variables (`:user`, `:'cursor_ts'`, …) where the values go.

## 1. `page.sql`: a user's history, the next 20 after a cursor

The slow version pages with OFFSET (this is page 50):

```sql
SELECT id, problem_id, language, status, created_at FROM submissions
WHERE user_id = 1 ORDER BY created_at DESC, id DESC OFFSET 980 LIMIT 20;
```

Yours gets the last row of the previous page as `:'cursor_ts'` and `:cursor_id`
and returns the next 20, same columns, same order. It must touch at most 21
rows, and **keep working if the cursor's row has been deleted** (that's I-10).

## 2. `solved.sql`: the problems a user has solved

The slow version is what an ORM loop produces, one query per problem (N+1):

```js
const accepted = await db.submissions.findMany({ where: { userId, status: "ACCEPTED" } });
for (const s of accepted) s.problem = await db.problems.findUnique({ where: { id: s.problemId } });
```

Yours: one statement, given `:user`, returning `id` and `title` of each solved
problem, **each once**, ordered by id. No Seq Scan on `submissions`.

## 3. `list.sql`: a page of the problems list, with acceptance counts

The slow version:

```sql
SELECT p.id, p.title, count(s.id) FILTER (WHERE s.status = 'ACCEPTED') AS accepted, count(s.id) AS total
FROM problems p LEFT JOIN submissions s ON s.problem_id = p.id
WHERE p.difficulty = 2 AND p.id > 0
GROUP BY p.id, p.title ORDER BY p.id LIMIT 20;
```

Yours, given `:difficulty` and `:after_id`, returns the same columns and rows
(a problem with no submissions shows 0 and 0) reading **at most 200 buffers**.
Run the slow version's plan first: the checker prints it. Find where the
buffers go before you change anything.
