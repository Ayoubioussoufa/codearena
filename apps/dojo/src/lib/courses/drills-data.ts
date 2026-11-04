/**
 * Drills for the data track, lessons 15 to 18. Every plan these drills claim was
 * observed on lesson 15's lab data (300,000 submissions, Postgres 16).
 */
import type { Rng } from "../engine/rng";
import { choice, numeric } from "../engine/helpers";
import { type Drill, lessonRef, pickFrom } from "./drill-kit";

/* ── Lesson 15: indexes ── */

const L15 = lessonRef("0015-how-an-index-works", "Lesson 15: how a database finds a row");
const SERVE = {
  full: "Fully: narrows, and no sort",
  sort: "Partly: narrows, then a sort",
  none: "Not at all: can't narrow",
} as const;
const SCAN = {
  seq: "Seq Scan: read every page",
  index: "Index Scan, then each row",
  only: "Index Only Scan: no heap",
  bitmap: "Bitmap Heap Scan: page order",
} as const;

const indexDrill: Drill = {
  id: "indexes",
  title: "Can this index serve it?",
  blurb: "The leftmost-prefix rule, sorts, and the scan the planner picks.",
  generators: [
    {
      id: "drill-index-serve",
      title: "Index meets query",
      generate: (rng: Rng) => {
        const cases = [
          { idx: "(user_id, created_at DESC)", q: "WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20", k: "full", why: "Equality on the first column, then the rows are already in created_at order inside it." },
          { idx: "(user_id, created_at DESC)", q: "WHERE user_id = $1 ORDER BY created_at ASC LIMIT 20", k: "full", why: "A B-tree can be walked backwards, so the opposite direction is free too." },
          { idx: "(user_id, family)", q: "WHERE family = $1", k: "none", why: "That's I-16: entries are sorted by user_id first, so one family's rows are scattered across the whole index." },
          { idx: "(problem_id, status)", q: "WHERE problem_id = $1 AND status = 'ACCEPTED'", k: "full", why: "Both columns are equalities on a prefix of the index: it lands exactly on those entries." },
          { idx: "(problem_id, status)", q: "WHERE status = 'ACCEPTED'", k: "none", why: "status is the second column: without problem_id, there's no place in the index to start." },
          { idx: "(user_id)", q: "WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20", k: "sort", why: "It finds the user's rows, but not in date order: all of them get sorted to keep 20." },
          { idx: "(user_id, created_at)", q: "WHERE user_id = $1 AND created_at > now() - interval '7 days'", k: "full", why: "Equality first, then a range on the next column: one contiguous slice of the index." },
          { idx: "(created_at, user_id)", q: "WHERE user_id = $1", k: "none", why: "user_id is second; the index is ordered by date, so one user's rows are everywhere in it." },
          { idx: "(difficulty)", q: "WHERE difficulty = 'EASY' ORDER BY title", k: "sort", why: "It narrows to the easy problems, which come out in no particular title order." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(SERVE, c.k);
        return choice(rng, {
          genId: "drill-index-serve",
          prompt: `An index on \`submissions ${c.idx}\`, and the query \`${c.q}\`. How much can the index do?`,
          correct, wrong, explanation: c.why, docRef: L15,
        });
      },
    },
    {
      id: "drill-index-scan",
      title: "Which scan?",
      generate: (rng: Rng) => {
        const cases = [
          { q: "SELECT * FROM submissions WHERE id = 42", has: "only the primary key", k: "index", why: "One row by its key: walk the B-tree to the entry, then fetch that one row from the table." },
          { q: "SELECT * FROM submissions WHERE language = 'PYTHON'", has: "no index on language", k: "seq", why: "No index can narrow it, and a third of the table matches anyway: read every page." },
          { q: "SELECT count(*) FROM submissions WHERE problem_id = 17 AND status = 'ACCEPTED'", has: "an index on (problem_id, status), freshly vacuumed", k: "only", why: "Every column the query needs is in the index, so it never visits the table." },
          { q: "SELECT * FROM submissions WHERE status = 'ACCEPTED'", has: "an index on (status); 30% of rows match", k: "bitmap", why: "Too many rows to fetch one by one, too few to read everything blindly: collect the pages from the index, then read each once, in order." },
          { q: "SELECT * FROM submissions WHERE problem_id = 17", has: "an index on (problem_id, status); a popular problem, about 260 rows", k: "bitmap", why: "A few hundred rows spread across the table: a bitmap reads each page once instead of jumping back and forth." },
          { q: "SELECT id, title FROM problems WHERE slug = 'problem-17'", has: "a unique index on (slug)", k: "index", why: "One row by a unique key: an index scan, then one table fetch for the title." },
          { q: "SELECT count(*) FROM submissions WHERE status = 'COMPILE_ERROR'", has: "an index on (status), freshly vacuumed", k: "only", why: "Counting needs nothing but the indexed column, so the table is never touched." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(SCAN, c.k);
        return choice(rng, {
          genId: "drill-index-scan",
          prompt: `On the lab's 300,000 submissions, with ${c.has}: \`${c.q}\`. Which scan does Postgres pick?`,
          correct, wrong,
          explanation: `${c.why} See [Postgres: using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html).`,
          docRef: L15,
        });
      },
    },
  ],
};

/* ── Lesson 16: reading plans ── */

const L16 = lessonRef("0016-reading-plans", "Lesson 16: reading EXPLAIN ANALYZE");
const DIAG = {
  offset: "It reads rows to discard them",
  stats: "Its row estimates are badly wrong",
  heap: "It visits the heap for nothing",
  nplus1: "It sends one query per row",
} as const;

const planDrill: Drill = {
  id: "plans",
  title: "Read the plan",
  blurb: "Rows times loops, and the four symptoms behind most slow queries.",
  generators: [
    {
      id: "drill-plan-loops",
      title: "Rows × loops",
      generate: (rng: Rng) => {
        const outer = rng.int(5, 60);
        const inner = rng.int(2, 400);
        const node = rng.pick(["Index Scan using submissions_problem_status on submissions", "Index Only Scan using submissions_user_created on submissions", "Index Scan using submissions_pkey on submissions"]);
        return numeric({
          genId: "drill-plan-loops",
          prompt: `Under a Nested Loop, the outer side is \`Index Scan using problems_pkey (actual rows=${outer} loops=1)\` and the inner side is \`${node} (actual rows=${inner} loops=${outer})\`. How many rows did the inner node produce in total? (Digits only.)`,
          answer: outer * inner,
          explanation: `\`rows\` is an average per loop: ${inner} × ${outer} loops = ${outer * inner}, which is also what the Nested Loop above it reports. See [using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html).`,
          docRef: L16,
        });
      },
    },
    {
      id: "drill-plan-symptom",
      title: "What's wrong with it?",
      generate: (rng: Rng) => {
        const cases = [
          { s: "A `Limit (rows=20)` sits on an Index Scan with `rows=5000`, for page 250 of a history", k: "offset", why: "That's OFFSET: 4,980 rows produced and thrown away. Keyset pagination starts after the last row instead." },
          { s: "A node estimates `rows=3` and actually returns `rows=48000`; the table was bulk-loaded an hour ago", k: "stats", why: "The planner chose its plan for 3 rows. Run `ANALYZE` so its statistics describe the table as it is now." },
          { s: "A count reads 6,000 buffers in an Index Scan, while every column it needs is in that index", k: "heap", why: "An Index Scan fetches each row from the heap. Counting something the index holds lets it become an Index Only Scan." },
          { s: "The slow-query log shows `SELECT … FROM problems WHERE id = $1` 2,000 times in one request", k: "nplus1", why: "One query per row: N+1. Fetch them all in one query, with a join or `WHERE id = ANY($1)`." },
          { s: "A history page is fast at page 1 and takes 40 ms at page 400, with the same query shape", k: "offset", why: "Cost that grows with the page number is OFFSET's signature." },
          { s: "After seeding a million rows, a query that should use an index does a Seq Scan, expecting 10 rows", k: "stats", why: "The estimates come from statistics taken before the seed. `ANALYZE` after any bulk load." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(DIAG, c.k);
        return choice(rng, { genId: "drill-plan-symptom", prompt: `${c.s}. What's the problem?`, correct, wrong, explanation: c.why, docRef: L16 });
      },
    },
  ],
};

/* ── Lesson 17: isolation ── */

const L17 = lessonRef("0017-transactions-isolation", "Lesson 17: transactions and isolation");
const OUTCOME = {
  right: "Both commit, and it's correct",
  wrong: "Both commit, and it's wrong",
  retry: "One fails, and must retry",
} as const;
const READ = {
  fresh: "The value T2 just committed",
  old: "The value it read before",
  error: "An error it must retry",
} as const;

const isolationDrill: Drill = {
  id: "isolation",
  title: "Two sessions at once",
  blurb: "Which races each isolation level lets through, and which it turns into errors.",
  generators: [
    {
      id: "drill-iso-writes",
      title: "Two writers",
      generate: (rng: Rng) => {
        const scenarios = {
          rmw: "Two sessions each read a counter, add 1 in the app, and write it back",
          atomic: "Two sessions each run `UPDATE counters SET n = n + 1`",
          skew: "Two admins each check there are at least 2 admins, then demote themselves",
          first: "Two deliveries of one Accepted each check `solved` for the pair, then insert and add 1 if it was missing",
          onConflict: "Two deliveries run `INSERT … ON CONFLICT DO NOTHING` on a unique key, adding 1 only if a row was inserted",
        } as const;
        const table = [
          { sc: "rmw", lvl: "READ COMMITTED", k: "wrong", why: "A lost update: the second write is based on a stale read." },
          { sc: "rmw", lvl: "REPEATABLE READ", k: "retry", why: "Updating a row that changed since your snapshot fails: \"could not serialize access due to concurrent update\"." },
          { sc: "rmw", lvl: "SERIALIZABLE", k: "retry", why: "Same as REPEATABLE READ here: a concurrent update to the same row is a serialization failure." },
          { sc: "atomic", lvl: "READ COMMITTED", k: "right", why: "The second waits for the row lock, then re-evaluates `n + 1` on the new value." },
          { sc: "skew", lvl: "READ COMMITTED", k: "wrong", why: "Each saw two admins; they updated different rows, so nothing conflicted. Zero admins left." },
          { sc: "skew", lvl: "REPEATABLE READ", k: "wrong", why: "Write skew: snapshots don't stop it, because the two transactions wrote different rows." },
          { sc: "skew", lvl: "SERIALIZABLE", k: "retry", why: "SERIALIZABLE detects the read/write dependency cycle and cancels one transaction." },
          { sc: "first", lvl: "READ COMMITTED", k: "wrong", why: "Both saw no row before either inserted: counted twice." },
          { sc: "first", lvl: "SERIALIZABLE", k: "retry", why: "Each read what the other wrote: a dependency cycle, so one is cancelled. On retry it sees the row." },
          { sc: "onConflict", lvl: "READ COMMITTED", k: "right", why: "The unique index makes the second insert wait, then do nothing: only the first adds 1." },
        ] as const;
        const c = rng.pick(table);
        const { correct, wrong } = pickFrom(OUTCOME, c.k);
        return choice(rng, {
          genId: "drill-iso-writes",
          prompt: `${scenarios[c.sc]}, at the same moment, at ${c.lvl}. What happens?`,
          correct, wrong,
          explanation: `${c.why} See [transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html).`,
          docRef: L17,
        });
      },
    },
    {
      id: "drill-iso-reads",
      title: "Reading twice",
      generate: (rng: Rng) => {
        const table = [
          { lvl: "READ COMMITTED", k: "fresh", why: "Each statement takes a new snapshot: a non-repeatable read." },
          { lvl: "REPEATABLE READ", k: "old", why: "One snapshot for the whole transaction: reads are repeatable, and read-only transactions never fail." },
          { lvl: "SERIALIZABLE", k: "old", why: "SERIALIZABLE reads from one snapshot too; a read alone doesn't fail." },
        ] as const;
        const c = rng.pick(table);
        const { correct, wrong } = pickFrom(READ, c.k);
        return choice(rng, {
          genId: "drill-iso-reads",
          prompt: `T1, at ${c.lvl}, reads a user's \`solved\` (0). T2 sets it to 5 and commits. T1 reads it again, in the same transaction. What does T1 see?`,
          correct, wrong, explanation: c.why, docRef: L17,
        });
      },
    },
  ],
};

/* ── Lesson 18: the leaderboard ── */

const L18 = lessonRef("0018-leaderboard", "Lesson 18: a leaderboard with Redis sorted sets");
const ZCMD = { top: "ZRANGE", rank: "ZREVRANK", add: "ZINCRBY", score: "ZSCORE", count: "ZCARD" } as const;

const leaderboardDrill: Drill = {
  id: "leaderboard",
  title: "Ranks and ties",
  blurb: "Who ranks higher, and which sorted-set command answers each question.",
  generators: [
    {
      id: "drill-lb-tie",
      title: "Who ranks higher?",
      generate: (rng: Rng) => {
        const [a, b] = rng.shuffle(["amy", "zack", "lin", "omar", "ines", "yuki"]).slice(0, 2) as [string, string];
        const pa = rng.pick([200, 300, 450]);
        const same = rng.int(0, 2) > 0;
        const pb = same ? pa : pa + rng.pick([-50, 50]);
        const ta = rng.int(10, 90), tb = ta + rng.pick([-5, 5, 20, -20]);
        const winner = pa !== pb ? (pa > pb ? a : b) : ta < tb ? a : b;
        const why = pa !== pb
          ? "More points wins; time only breaks ties."
          : `Equal points: whoever reached ${pa} first ranks higher, so the composite score is points × T + (T − 1 − time). Plain Redis would order them by name.`;
        return choice(rng, {
          genId: "drill-lb-tie",
          prompt: `${a} has ${pa} points, reached at minute ${ta}. ${b} has ${pb} points, reached at minute ${tb}. Who ranks higher on CodeArena's board?`,
          correct: winner, wrong: [winner === a ? b : a], explanation: why, docRef: L18,
        });
      },
    },
    {
      id: "drill-lb-command",
      title: "Which command?",
      generate: (rng: Rng) => {
        const cases = [
          { q: "the 10 best users with their scores", k: "top", why: "`ZRANGE board 0 9 REV WITHSCORES`: O(log N + 10). `ZREVRANGE` does the same but is deprecated since Redis 6.2." },
          { q: "one user's rank, counted from the top", k: "rank", why: "`ZREVRANK board user`: O(log N), 0 for the best, so add 1. `nil` if they're not on the board." },
          { q: "add 50 points to a user", k: "add", why: "`ZINCRBY board 50 user`: O(log N), and it creates the member if needed. With a composite score you'd ZADD the recomputed score instead." },
          { q: "one user's score", k: "score", why: "`ZSCORE board user`: O(1), straight from the hash table half of the set." },
          { q: "how many users are on the board", k: "count", why: "`ZCARD board`: O(1)." },
        ] as const;
        const c = rng.pick(cases);
        const { correct, wrong } = pickFrom(ZCMD, c.k);
        return choice(rng, {
          genId: "drill-lb-command",
          prompt: `Which sorted-set command gives you ${c.q}?`,
          correct, wrong: rng.shuffle([...wrong]).slice(0, 3),
          explanation: `${c.why} See [sorted sets](https://redis.io/docs/latest/develop/data-types/sorted-sets/).`,
          docRef: L18,
        });
      },
    },
  ],
};

export const DATA_DRILLS: Drill[] = [indexDrill, planDrill, isolationDrill, leaderboardDrill];
