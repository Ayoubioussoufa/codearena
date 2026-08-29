# CodeArena Dojo

A self-contained learning app for the concepts behind building CodeArena.
Runs beside the main apps: **http://localhost:3002** via `pnpm dev:dojo` (from the repo root).

## What it does

- **Guides** (`/guides`) — renders the repo's `docs/*.md` phase guides in the browser
  (GFM tables, Mermaid diagrams, heading anchors + table of contents, light/dark), plus the
  Dojo-authored supplements the phase guides don't cover (in `content/supplements/`):
  *React fundamentals*, *Tailwind responsive design*, *System-design fundamentals*,
  *Java & Spring Boot* (the enterprise bridge), *CS fundamentals*, *Aptitude & reasoning*,
  and the *Interview* / *Morocco internship* playbooks — plus *DSA patterns* in `content/dsa/`.
  Markdown added to `docs/` or `content/supplements/` appears automatically.
- **Practice** (`/practice`) — 16 topics, 177 exercise *generators* in three formats:
  - **quiz** (choice / numeric / text) — generated fresh per attempt: new numbers, shuffled options;
  - **✍️ code-writing** (~30) — write real code in a syntax-highlighted editor. Graded like a
    judge: structure checks (uses the functional updater, no mutation, right index column
    order, …) and, for pure functions (Elo, sigmoid, cosine, reducers…), your code is
    **executed in a sandboxed Web Worker against real test cases**. Every miss shows the model
    solution and the why. Covers React hooks, Tailwind class-writing, TypeScript generics/guards,
    SQL + **Prisma** (models, `include`, `$transaction`), Zod, bcrypt, docker hardening, Redis.
  - **System Design** gets two topics — scenario MCQs (caching, load balancing, sharding, CAP,
    queues, rate limiting, CDNs, consistent hashing) plus a drills topic for back-of-envelope
    estimation (QPS, storage).
- **Coding tracks** (`/coding`) — **11 ordered ladders, 206 write-the-code tasks**, each strictly
  ascending through five levels (Warm-up → Core → Applied → Advanced → Expert); clearing every task
  in a level unlocks the next. Unlike Practice (mixed quiz + code, graded like a quiz), a track is a
  single skill climbed a little each day: **Java** (27) · **Spring Boot** (16) · **NestJS** (15) ·
  **TypeScript** (19) · **JavaScript** (26) · **React hooks** (23) · **Next.js** (14) ·
  **Python** (15) · **Tailwind** (13) · **Testing** (12) · **System Design** (12). Progress is
  tracked per track, separately from the quiz topics.
- **DSA** (`/dsa`) — a LeetCode-style problem set: **341 problems across 20 core patterns**
  (Arrays & Hashing, Two Pointers, Sliding Window, Stack, Monotonic Stack & Queue, Binary Search,
  Linked List, Trees, DFS, BFS, Tries, Heap/Priority Queue, Recursion & Backtracking, Graphs,
  Intervals, Greedy, Dynamic Programming, Bit Manipulation, Math & Geometry, Game Theory),
  Easy → Hard, with a
  browsable list, difficulty filter, and solved tracking. Each problem is written in the editor and
  **run against test cases in the sandboxed worker**; solving reveals the approach + reference
  solution. Tree/linked-list problems use a serialization **harness** (`Harness` in `run-js.ts`):
  tests pass level-order / array inputs, the runner builds `TreeNode`/`ListNode` graphs and
  serializes results back. Every reference solution is verified by `pnpm test:dsa`. Backed by the
  in-depth **DSA Patterns** guide (`/guides/dsa-patterns`) — each pattern with Big-O, when-to-use
  signals, template, and pitfalls — whose sections each problem deep-links to.
- **Mixed review** (`/practice/mixed`) — one stream across all topics, weighted toward your
  weakest areas; answers still record against each question's real topic.
- **Spaced review** (`/practice/review`) — the dojo eats its own dog food: an FSRS-lite
  scheduler (interval ladder 1 → 2.2 → 4.8 → … days, capped at 120; a miss resets to due-now)
  resurfaces items right before you'd forget them. The dashboard and practice index surface the
  due count; the review session is an ordered queue, most-overdue first, that drains to a
  completion screen.
- **Bag scheduling** — within a topic/mixed session, each cycle is a weighted shuffle *without
  replacement*: no repeats until you've seen every type in the pool, unseen/struggling types
  drawn earlier. Each topic's start screen shows a per-exercise-type accuracy breakdown.
- **Build map** (`/build`) — the learn → build bridge. Scans `apps/web` live for open
  `TODO(practice)` gaps and maps each to the topic + guide that prepares you for it (the list
  shrinks as you complete them), plus curated backend targets for the api-phase topics. Each
  topic's start screen also shows a compact "what you're practicing this to build" panel.
- **Syntax highlighting everywhere** — guides, exercise snippets, the editor and model
  solutions, with light/dark token themes.
- **Progress** (`localStorage`, no account) — per-topic and per-generator accuracy, mastery
  bars, a daily practice streak, and a "needs work" call-out on the dashboard.
  Reset anytime from `/practice`.

## Topic → guide map

| Topic | Drills | Guide |
|---|---|---|
| React hooks & state | snapshots, batching, effect deps, keys, context, useMemo, controlled inputs | Dojo supplement |
| Tailwind layout | breakpoints, flex axes, spacing scale, grid spans, dark mode, overflow | Dojo supplement |
| TypeScript | narrowing, utility & conditional types, unknown/any, DI, literals | Phase 0 |
| Databases & SQL | composite indexes, EXPLAIN, N+1, pagination, ACID, anomalies | Phase 1 §A |
| Auth & security | bcrypt, JWT guarantees, refresh rotation, XSS/CSRF, validation | Phase 1 §B |
| Sandboxing & queues | namespaces, cgroup math, Docker hardening, idempotency, backoff, WS | Phase 2 |
| Rating math | Elo expected/update, Glicko RD, IRT 2PL, odds, FSRS (computed answers) | Phase 3 |
| Contests & systems | Redis zsets, CQRS, state machines, cosine/UCB1, tracing, anti-cheat | Phases 4–6 |
| System Design | scenario MCQs (caching, LB, sharding, CAP, queues), back-of-envelope | System-design supplement |
| CS Fundamentals | processes/threads, deadlock, TCP/UDP, DNS/HTTP, ACID/isolation, OOP/SOLID | CS-fundamentals supplement |
| Aptitude & Reasoning | percentages, ratios, time/work/speed, P&C, probability, series, syllogisms | Aptitude supplement |

## Structure

```
src/lib/engine/        types, seeded Rng, choice/numeric/text builders
src/lib/engine/topics/ one file per topic — add a Generator, it's live
src/lib/progress.ts    localStorage store + adaptive weighting
src/lib/content.ts     docs/ + supplements loader, TOC extraction
src/components/        MarkdownView (+ Mermaid), PracticeSession, ui
content/supplements/   Dojo-authored guides
```

To add an exercise: write a `Generator` in the right `topics/*.ts` file — quiz kinds via the
`choice`/`numeric`/`text` builders, code-writing via `codeTask` (static `checks`, runnable
`fn` tests, or a Tailwind `classTask`) — and add it to that topic's `generators` array.
Nothing else to wire — it joins its topic and the mixed pool.

Sanity-check all generators (~21k generated exercises; also proves every code exercise's
model solution passes its own grader while empty/starter answers fail), and the
spaced-repetition math (interval ladder, due detection, queue ordering):

```bash
pnpm test:generators   # ~27k generated quiz/code exercises, graders + invariants
pnpm test:dsa           # every DSA reference solution passes its own tests
pnpm test:scheduling    # spaced-repetition interval ladder, due detection, ordering
```

To add a DSA problem: append a `DsaProblem` (statement, starter, verified `solution`, `tests`,
approach) to the right `src/lib/dsa/problems/*.ts`, then run `pnpm test:dsa`. To add a System
Design question: add a `Generator` to `src/lib/engine/topics/system-design.ts`.
