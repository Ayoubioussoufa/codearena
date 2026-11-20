# CodeArena — Learning Guides

In-depth, self-contained study guides for each build phase. They teach the **concepts** behind the
roadmap from zero — enough to understand and write the code for that phase on your own — using
standalone examples (never project code), diagrams, and worked math.

> **How to use them.** Read the guide for a phase *before* you start building that phase. Each is
> written to be understandable even if you'd never seen the topic before, with vocabulary defined
> gradually. Every guide ends with a **self-quiz (answered)** and **hands-on exercises** — do the
> exercises; reading alone won't put the skills in your hands.
>
> Diagrams use [Mermaid](https://mermaid.js.org/) and render automatically on GitHub and in VS Code
> (install the "Markdown Preview Mermaid Support" extension, then open Preview with `Ctrl+Shift+V`).

Each guide follows the same shape: concepts built from zero → standalone worked examples → **one
complete end-to-end buildable walkthrough** → a **mastery checklist** ("you're ready when you
can…") → an answered self-quiz → hands-on exercises → the original reading list it draws from.

| Guide | Covers | Maps to roadmap |
|---|---|---|
| [Phase 0 — Foundations](./phase-0-foundations.md) | TypeScript advanced types (generics, conditional, mapped, narrowing); NestJS modules/providers/DI; hexagonal architecture; repository pattern; SOLID; DDD bounded contexts; monorepos & Docker. Worked example: a complete mini NestJS app | Phase 0 |
| [Phase 1 — Auth, Data & Frontend](./phase-1-auth-data-frontend.md) | Relational DBs, transactions/ACID, indexes & EXPLAIN, cursor pagination, N+1; password hashing, JWT, refresh-token rotation, XSS/CSRF; Zod validation; TanStack Query server-state. Worked example: a complete Prisma schema | Phase 1 |
| [Phase 2 — Sandboxing, Queues & Realtime](./phase-2-execution-sandboxing.md) | Threat modeling; Linux namespaces/cgroups/capabilities/seccomp; hardening Docker for untrusted code; BullMQ, idempotency, at-least-once; WebSockets & streaming; retries/DLQ/backpressure. Worked example: an untrusted-code runner | Phase 2 |
| [Phase 3 — Rating, Mastery & Math](./phase-3-rating-mastery-math.md) | Probability, sigmoid, log-odds, uncertainty, gradient ascent; Elo → Glicko → Glicko-2; Item Response Theory (2PL); FSRS spaced repetition; pure functions & property-based testing. Worked examples: Elo/Glicko-2/IRT in code | Phase 3 |
| [Phase 4 — Recommendation Engine](./phase-4-recommendation-engine.md) | Ranker pipeline (candidate gen → score → re-rank); difficulty-fit, tag-need, FSRS features; linear weighted sum; MMR diversity; collaborative filtering & cosine similarity; multi-armed bandits & UCB1; cache stampede/invalidation; NDCG & offline eval. Worked example: a complete ranker | Phase 4 |
| [Phase 5 — Contests, CQRS & Leaderboard](./phase-5-contests-cqrs-leaderboard.md) | State machines; the read/write tension & CQRS; events & projections; eventual consistency; Redis sorted sets (O(log N)); delta protocol; WebSocket fan-out; frozen scoreboard; batch rating updates; clock skew. Worked example: a leaderboard projector | Phase 5 |
| [Phase 6 — Analytics, Anti-Cheat & Observability](./phase-6-analytics-anticheat-observability.md) | Materialized views; plagiarism detection (AST tokens → k-grams → Winnowing → Jaccard); the three observability pillars; distributed tracing & OpenTelemetry; trace-context propagation; Prometheus cardinality; RED/USE; alerting. Worked example: a Winnowing fingerprinter | Phase 6 |

Next to these guides:

- [`revision/`](./revision/README.md): the refresher material. Questions about the code you
  actually built, with the answers folded underneath, and the issues found in it.
- [`weeks/`](./weeks/week-2-the-judge.md): each sprint week's guide (steps, decisions, the tests to
  write first, traps), with that week's revision folded in.
- [`adr/`](./adr/README.md): the decisions and what they rejected.
  [ADR-006](./adr/006-leetcode-codeforces-hybrid.md) turns CodeArena into a LeetCode–Codeforces
  hybrid, which brings Phase 3 (rating) and Phase 5 (contests, standings) back into scope.

## Can I complete a phase just by reading its guide?

Honestly: **no — reading is necessary but not sufficient.** These guides give you the mental model,
the vocabulary, and worked code so you're never coding on faith. But the skill of *building* only
forms when you: (1) **type out** the standalone examples (don't copy-paste), (2) **do the
exercises**, and (3) **build the actual phase** and get stuck and unstuck. Read the guide → do its
exercises → check the mastery checklist → then build the phase. That loop is what turns understanding
into ability.

Phase 7 (AI features + evals) is a stretch phase; its guide can be written the same way when you
reach it.
