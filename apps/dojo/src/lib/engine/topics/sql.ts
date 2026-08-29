/**
 * Topic: Relational data (drills docs/phase-1-auth-data-frontend.md §A).
 */
import { choice, numeric } from "../helpers";
import type { Generator, Topic } from "../types";
import { sqlCodeGens } from "./sql-code";

const DOC = { slug: "phase-1-auth-data-frontend", label: "Phase 1 §A — Databases, indexes & queries" };

const indexChoice: Generator = {
  id: "sql-index",
  title: "Choosing a composite index",
  generate: (rng) => {
    const eq = rng.pick(["user_id", "problem_id", "contest_id"]);
    const ord = rng.pick(["created_at", "score", "rating"]);
    return choice(rng, {
      genId: "sql-index",
      prompt: "Which index serves this query best?",
      code: `SELECT * FROM submissions\nWHERE ${eq} = $1\nORDER BY ${ord} DESC\nLIMIT 20;`,
      codeLang: "sql",
      correct: `A composite index on (${eq}, ${ord})`,
      wrong: [
        `A composite index on (${ord}, ${eq})`,
        `Two separate single-column indexes on ${eq} and ${ord}`,
        `An index on (${eq}) only — ORDER BY can't use indexes`,
      ],
      explanation: `An **index** is a pre-sorted lookup structure (a "B-tree"). A *composite* index on (${eq}, ${ord}) sorts by ${eq} first, then by ${ord} *within* each ${eq} group — like a phone book by last name, then first name. So the database jumps straight to the ${eq} group and finds those rows already in ${ord} order: it reads exactly 20 entries, with no separate sort step. Reversed order scatters your ${eq} values all over the tree; two single-column indexes force the database to combine them and *then* sort. Rule of thumb: **equality column(s) first, then the column you order/range on.**`,
      docRef: DOC,
    });
  },
};

const nPlusOne: Generator = {
  id: "sql-nplus1",
  title: "Counting N+1 queries",
  generate: (rng) => {
    const n = rng.int(15, 60);
    return numeric({
      genId: "sql-nplus1",
      prompt: `A page loads ${n} problems, then the code below runs. How many SQL queries hit the database in total?`,
      code: `const problems = await prisma.problem.findMany(); // ${n} rows\nfor (const p of problems) {\n  p.tags = await prisma.tag.findMany({ where: { problemId: p.id } });\n}`,
      codeLang: "ts",
      answer: n + 1,
      tolerance: 0,
      placeholder: "total queries",
      explanation: `This is the famous **N+1 problem**: 1 query for the list, plus 1 more *per row* inside the loop = ${n} + 1 = ${n + 1}. It feels fine at 5 rows in dev and melts at ${n}+ in production, because the delay multiplies per row, not per page. Two fixes: \`include: { tags: true }\` (fetch everything in one join), or a single batch query \`WHERE problemId IN (…)\`. Rule of thumb: **a database query inside a loop should set off an alarm** every time.`,
      docRef: DOC,
    });
  },
};

const pagination: Generator = {
  id: "sql-pagination",
  title: "Offset vs cursor pagination",
  generate: (rng) => {
    const page = rng.int(200, 900);
    const perPage = rng.pick([20, 25, 50] as const);
    const offset = page * perPage;
    const variant = rng.chance(0.5);
    if (variant) {
      return numeric({
        genId: "sql-pagination",
        prompt: `\`LIMIT ${perPage} OFFSET ${offset}\` — how many rows must the database walk through (scan and discard + return) to answer this?`,
        answer: offset + perPage,
        tolerance: 0,
        placeholder: "rows walked",
        explanation: `\`OFFSET\` can't teleport: to skip ${offset} rows the database has to actually *walk past* all ${offset} of them and throw them away, then return ${perPage} — ${offset + perPage} rows touched, getting linearly slower the deeper you page. **Cursor** pagination (\`WHERE (created_at, id) < ($cursor) ORDER BY … LIMIT ${perPage}\`) instead uses the index to *jump straight* to where you left off, reading only ~${perPage} rows whether it's page 1 or page 10,000. That's why every infinite-scroll feed is cursor-based.`,
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "sql-pagination",
      prompt: "Besides speed, what correctness problem does OFFSET pagination have that cursors avoid?",
      correct: "Rows inserted or deleted between page requests shift the offsets, so users see duplicates or miss rows",
      wrong: [
        "OFFSET returns rows in random order unless you add DISTINCT",
        "OFFSET locks the table between requests",
        "Cursors are wrong too — both have the same behaviour",
      ],
      explanation:
        "An offset points at a *position in the list*, not at a specific row. If 3 new submissions arrive while the user reads page 1, then page 2 (which starts at 'row 20') now begins 3 rows earlier than before — so they see some items twice (or miss some, when rows are deleted). A **cursor** points at a *value* ('everything after this exact created_at + id'), which stays correct no matter what got inserted above it. Position-based vs value-based is the whole distinction.",
      docRef: DOC,
    });
  },
};

const acid: Generator = {
  id: "sql-acid",
  title: "ACID in failure scenarios",
  generate: (rng) => {
    const scenarios = [
      { story: "A rating update writes the winner's new rating, crashes, and the loser's old rating stays — half the change persisted.", answer: "Atomicity", why: "Atomicity says a transaction is all-or-nothing; a crash mid-way must roll back the winner's write too. Half-applied changes are the textbook atomicity violation — consistency is about *rules* holding, not about partial application." },
      { story: "Two admins renaming a tag at the same instant both read the old row and one overwrites the other's change silently.", answer: "Isolation", why: "Isolation governs what concurrent transactions can see and interleave. A lost update — both read, both write, last writer wins — is an isolation anomaly; the data is still atomic and durable, it's the *concurrency* that lied." },
      { story: "The server acknowledges a submission as saved, then a power cut loses it — after restart the row is gone.", answer: "Durability", why: "Durability promises that once COMMIT is acknowledged, the data survives crashes (via write-ahead logging and fsync). Losing acknowledged writes is a durability failure — nothing about concurrency or partial application is involved." },
      { story: "A transfer completes, but the sum of both wallets afterwards no longer matches the sum before.", answer: "Consistency", why: "Consistency means every transaction moves the database from one valid state to another (invariants like conservation of money hold). The write was atomic, isolated and durable — but it broke an invariant, which is precisely the C." },
    ] as const;
    const s = rng.pick(scenarios);
    return choice(rng, {
      genId: "sql-acid",
      prompt: `Which ACID property does this scenario violate?\n\n"${s.story}"`,
      correct: s.answer,
      wrong: (["Atomicity", "Consistency", "Isolation", "Durability"] as const).filter((x) => x !== s.answer),
      explanation: s.why,
      docRef: DOC,
    });
  },
};

const explainPlan: Generator = {
  id: "sql-explain",
  title: "Reading EXPLAIN output",
  generate: (rng) => {
    const rows = rng.pick([120_000, 480_000, 950_000] as const);
    const ms = rng.pick([850, 1400, 2600] as const);
    return choice(rng, {
      genId: "sql-explain",
      prompt: "What is this plan telling you, and what's the fix?",
      code: `EXPLAIN ANALYZE SELECT * FROM submissions WHERE user_id = 42;\n\nSeq Scan on submissions  (cost=0.00..18334.00 rows=97)\n  Filter: (user_id = 42)\n  Rows Removed by Filter: ${rows.toLocaleString("en-US")}\nExecution Time: ${ms} ms`,
      codeLang: "sql",
      correct: `It read the whole table and discarded ${rows.toLocaleString("en-US")} rows to keep ~97 — add an index on user_id`,
      wrong: [
        "The query is fine — Seq Scan is always the fastest plan for SELECT *",
        "The table is corrupted; run VACUUM FULL to repair it",
        "The filter is wrong; user_id = 42 should be quoted as a string",
      ],
      explanation:
        `\`EXPLAIN ANALYZE\` shows the database's *plan*. "Seq Scan" (read every row) plus a huge "Rows Removed by Filter" is the classic **missing-index** signature: with no index, the engine had no way to jump to user 42's rows, so it read all ~${(rows + 97).toLocaleString("en-US")} and threw most away (${ms} ms). \`CREATE INDEX ON submissions (user_id)\` turns it into an "Index Scan" that touches ~97 rows in well under a millisecond. Seq scans aren't always bad — for tiny tables or reading most of a table they win — but *this* shape (want few rows, discard a ton) is exactly the one to hunt down with EXPLAIN.`,
      docRef: DOC,
    });
  },
};

const isolationAnomaly: Generator = {
  id: "sql-anomaly",
  title: "Naming isolation anomalies",
  generate: (rng) => {
    const cases = [
      { story: "Transaction A reads a rating of 1500. B updates it to 1520 and commits. A re-reads and now sees 1520 — two different values inside one transaction.", answer: "Non-repeatable read", wrong: ["Dirty read", "Phantom read", "Lost update"], why: "The row A read changed *between two reads in the same transaction* after another transaction committed. That's the definition of a non-repeatable read; READ COMMITTED allows it, REPEATABLE READ prevents it. A dirty read would require seeing *uncommitted* data." },
      { story: "Transaction A runs `SELECT count(*) FROM submissions WHERE contest_id = 7` twice; B inserts a new matching submission and commits in between, so A gets two different counts.", answer: "Phantom read", wrong: ["Dirty read", "Non-repeatable read", "Write skew"], why: "No existing row changed — a *new row* appeared that matches A's predicate. That's a phantom: it's about the result *set*, not an individual row's value, which is what distinguishes it from a non-repeatable read." },
      { story: "Transaction A reads B's updated balance before B commits; B then rolls back, so A acted on data that never officially existed.", answer: "Dirty read", wrong: ["Phantom read", "Non-repeatable read", "Serialization failure"], why: "Reading *uncommitted* data is a dirty read — the risk is exactly what happened: the writer rolls back and the reader has consumed fiction. PostgreSQL never permits this at any isolation level, but the vocabulary matters for reasoning about other systems." },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "sql-anomaly",
      prompt: `Name this isolation anomaly:\n\n"${c.story}"`,
      correct: c.answer,
      wrong: [...c.wrong],
      explanation: c.why,
      docRef: DOC,
    });
  },
};

export const sqlTopic: Topic = {
  id: "sql-data",
  title: "Databases & SQL",
  icon: "🗄️",
  blurb: "Indexes, EXPLAIN, N+1, pagination strategies, ACID and isolation anomalies — Phase 1's data layer.",
  docSlug: "phase-1-auth-data-frontend",
  docTitle: "Phase 1 — Auth, Data & Frontend",
  generators: [
    indexChoice,
    nPlusOne,
    pagination,
    acid,
    explainPlan,
    isolationAnomaly,
    ...sqlCodeGens,
  ],
};
