# CodeArena — Setup Log

Date: 2026-07-16
Scope: **installations and project setup only — no feature code.** This follows Phase 0 of the master roadmap.

---

## 1. The merged roadmap document

Three source documents were merged into one master roadmap:

| Source (Desktop) | Content |
|---|---|
| `CodeArena_AI_Systems_Engineering_Roadmap.docx` | 12-month strategy: vision, architecture, AI/MLOps/security layers, portfolio strategy, scope control |
| `codearena-roadmap.docx` | 12-week detailed build guide (7 phases, day-by-day, readings, quizzes, pitfalls) |
| `codearena-roadmap-8w.docx` | 8-week sprint version at 10 h/day with phase budgets and calendar |

**Output: `C:\Users\ULTRAPC\Desktop\CodeArena_Master_Roadmap.docx`**

Structure of the merged document:
- **Part I — Strategy & Vision**: executive summary, product vision, MVP, unified stack table, architecture (initial + AI-enabled), four pillars, challenge categories.
- **Part II — The Build (Phases 0–7)**: dual-pace calendar (8 w sprint / 12 w steady), and for each phase: goals, day-by-day table, learn, decisions to defend, read & watch, self-quiz, pitfalls.
- **Part III — Beyond the Sprint (Months 3–12)**: data & cloud, the Python AI service, MLOps, defensive AI security, portfolio & employability, interview-readiness checklist.
- **Part IV — Discipline & Scope Control**: scope rules, DESIGN.md discipline, daily templates for both paces, risk & pacing, sustainability check.
- **Appendix**: the unified reading library (books, papers, blogs, talks, sites).

The two 12-week/8-week docs overlapped ~80%; they were deduplicated, keeping the 12-week version's fuller explanations and the 8-week version's day-by-day tables and budgets. The 12-month doc contributed everything beyond the sprint plus vision/scope/portfolio strategy.

---

## 2. Environment (verified)

| Tool | Version |
|---|---|
| Node.js | v24.11.1 |
| pnpm | 10.25.0 |
| Docker | 29.3.1 |
| Docker Compose | v5.1.1 |
| OS | WSL2 (Linux 6.6.87.2-microsoft-standard) |

---

## 3. Monorepo structure created

```
codeArena/
├── apps/
│   ├── api/                  # NestJS 11 backend (TypeScript strict)
│   │   ├── prisma/
│   │   │   └── schema.prisma # PostgreSQL datasource, no models yet
│   │   ├── prisma.config.ts  # Prisma 7 config (reads DATABASE_URL from .env)
│   │   ├── .env              # local secrets (gitignored)
│   │   └── .env.example      # template — copy to .env
│   └── web/                  # Next.js 16 frontend (App Router, Tailwind v4, TS strict)
│       ├── .env.local        # local config (gitignored)
│       └── .env.local.example
├── packages/
│   └── shared/               # @codearena/shared — shared TS types (empty for now)
├── docker-compose.yml        # postgres:16, redis:7, pgadmin (optional profile)
├── pnpm-workspace.yaml       # workspaces: apps/*, packages/*
├── tsconfig.base.json        # shared strict TS config
├── package.json              # root scripts (dev:api, dev:web, infra:up, …)
└── .gitignore
```

## 4. What was done, step by step

### 4.1 Workspace
- Created `pnpm-workspace.yaml` covering `apps/*` and `packages/*`.
- Root `package.json` with convenience scripts and `engines.node >= 20`.
- `tsconfig.base.json` with the roadmap's non-negotiable strict flags:
  `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.

### 4.2 Backend — `apps/api`
- Generated with `pnpm dlx @nestjs/cli new api --strict --skip-git --skip-install --package-manager pnpm`.
- Upgraded its `tsconfig.json` from the partial strict flags the CLI emits to full
  `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` (roadmap Phase 0 rule: "turn them ALL on, Day 1").
- Removed the deprecated `baseUrl` compiler option (TS 7 deprecation warning; unused since no `paths` are configured).
- Installed **Prisma**: `@prisma/client` (dependency), `prisma` + `dotenv` (dev dependencies).
- Ran `prisma init --datasource-provider postgresql` → created `prisma/schema.prisma` and `prisma.config.ts`.
- Fixed the generated `prisma.config.ts` to compile under `exactOptionalPropertyTypes`
  (guard: throw a clear error if `DATABASE_URL` is missing instead of passing `undefined`).
- Excluded `prisma.config.ts` from `tsconfig.build.json` (it is tooling config, not app source).

### 4.3 Frontend — `apps/web`
- Generated with `pnpm dlx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --skip-install --disable-git`.
- App Router + Tailwind + ESLint + strict TypeScript out of the box.
- `NEXT_PUBLIC_API_URL=http://localhost:3001` set in `.env.local`.
- shadcn/ui is **not** initialized yet — it's the first thing on the Phase 0 Day 2 list when you start building UI.

### 4.4 Shared package — `packages/shared`
- `@codearena/shared` with a single empty `src/index.ts`. Populated starting Phase 1 (DTOs, domain event types).

### 4.5 Local infrastructure — Docker Compose
- `postgres:16-alpine` — user/password/db all `codearena`, volume-backed, healthcheck.
- `redis:7-alpine` — AOF persistence on, volume-backed, healthcheck (needed for BullMQ in Phase 2).
- `pgadmin` — optional, behind the `tools` profile (`docker compose --profile tools up -d`, then http://localhost:5050, admin@codearena.local / admin).
- Jaeger/Grafana/Prometheus are deliberately **not** added yet — the roadmap brings them in with OpenTelemetry in Phase 2/6.

### 4.6 Dependencies install
- Single `pnpm install` at the root (unified lockfile `pnpm-lock.yaml`).
- Approved native build scripts via `pnpm.onlyBuiltDependencies` (sharp, prisma engines, @nestjs/core, unrs-resolver).

## 5. Deviations / decisions worth knowing

1. **Postgres is on host port 5433, not 5432.** This machine already runs a native
   PostgreSQL service (WSL `postgresql.service`) on 127.0.0.1:5432, and older project
   containers (1337code, chat-app) also use it. The CodeArena container maps
   `5433 → 5432` to avoid touching anything existing.
   `DATABASE_URL` in `apps/api/.env` already points at 5433.
2. **API port is 3001** (via `PORT` in `apps/api/.env`) so the Next.js dev server can keep 3000.
3. **Git is not initialized** — the scaffolds were generated with `--skip-git`/`--disable-git`
   so you can `git init` and make the first commit yourself (roadmap Phase 0 Day 4:
   GitHub repo + conventional commits + husky + CI).

## 6. Verification performed

| Check | Result |
|---|---|
| `docker compose ps` | `codearena-postgres` **healthy** (5433), `codearena-redis` **healthy** (6379) |
| Prisma → Postgres connectivity | `prisma db execute` `SELECT 1;` → success |
| `pnpm --filter api build` (nest build, full strict) | success |
| API smoke test | `node dist/main.js` on 3001 → `GET /` → **HTTP 200** "Hello World!", then stopped |
| `pnpm --filter web build` (next build) | success, static routes generated |

## 7. How to run

```bash
# infrastructure (Postgres 5433, Redis 6379)
pnpm infra:up          # = docker compose up -d
pnpm infra:down        # stop it

# backend — http://localhost:3001
pnpm dev:api           # = pnpm --filter api start:dev

# frontend — http://localhost:3000
pnpm dev:web           # = pnpm --filter web dev

# everything else
pnpm build             # build all workspace packages
pnpm lint              # lint all
pnpm test              # test all
```

First time on a fresh clone: `cp apps/api/.env.example apps/api/.env` and
`cp apps/web/.env.local.example apps/web/.env.local`, then `pnpm install`.

## 8. Learning guides

In-depth study guides for the first four phases live in [`docs/`](./docs/README.md). Each teaches
the concepts behind that phase from zero, with standalone examples, diagrams, worked math, an
answered self-quiz, and hands-on exercises:

- `docs/phase-0-foundations.md` — TypeScript advanced types, NestJS DI, hexagonal architecture, DDD
- `docs/phase-1-auth-data-frontend.md` — Postgres/indexes/EXPLAIN, auth & token rotation, TanStack Query
- `docs/phase-2-execution-sandboxing.md` — Linux isolation, hardened Docker, BullMQ/idempotency, WebSockets
- `docs/phase-3-rating-mastery-math.md` — Glicko-2, Item Response Theory, FSRS, property-based testing

Read the relevant guide before building each phase.

## 9. What's next (per the master roadmap — Phase 0, Days 2–4)

1. `git init`, first commit, GitHub repo, conventional commits, husky pre-commit (lint + typecheck).
2. GitHub Actions CI: lint + typecheck + build.
3. Bootstrap the API properly: `ConfigModule` with Zod-validated env, global validation pipe, exception filter, logger interceptor, `/health` endpoint.
4. Initialize shadcn/ui in `apps/web`; render a page that fetches `/health` from the API.
5. Write your first two DESIGN.md notes: *"Why monorepo + bounded-context modules"* and *"Local infra choices"* (the 5433 remap above is already material for the second one).
6. Then Phase 1: Prisma schema for users/problems/tags/test_cases, auth module, problems CRUD.
