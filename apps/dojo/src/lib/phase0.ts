/**
 * Phase 0 / Week 2 build tasks — the "learn → build" checklist for the NestJS
 * & backend-foundations week. Mirrors WEEK-PLAN.md (Mon 27 Jul → Sun 2 Aug):
 * read + TYPE every example, build the mini NestJS app in apps/api alongside
 * the guide, then consolidate. Rendered on /build with per-task checkboxes
 * (state lives in the same localStorage store as the frontend gaps).
 *
 * Guide rule is law: type every example, never copy-paste, do the exercises.
 */

export interface Phase0Task {
  label: string;
  detail?: string;
  /** Guide slug to link to (content/supplements/<slug>.md), optional. */
  guide?: string;
}

export interface Phase0Group {
  id: string;
  title: string;
  /** Calendar span from the week plan. */
  days: string;
  /** One-line framing. */
  focus: string;
  tasks: Phase0Task[];
}

export const PHASE0_GROUPS: Phase0Group[] = [
  {
    id: "a-typescript",
    title: "Part A — TypeScript type-level programming",
    days: "Mon 27 – Tue 28",
    focus: "Generics, conditional & mapped types, narrowing. Exercises Tue.",
    tasks: [
      {
        label: "Read + TYPE every example",
        detail: "generics, conditional types, mapped types, narrowing — no copy-paste",
        guide: "typescript",
      },
      {
        label: "Rebuild the utility types from scratch",
        detail: "your own MyPartial<T>, MyPick<T,K>, MyReadonly<T> — no lib.d.ts peeking",
        guide: "typescript",
      },
      {
        label: "Model a discriminated union + exhaustive switch",
        detail: "a RunResult-style union with a `never` default (compile-time exhaustiveness)",
        guide: "typescript",
      },
      {
        label: "Do Tuesday's type-level exercises",
        detail: "flag any that needed a second look → revisit them Sunday",
      },
    ],
  },
  {
    id: "b-nestjs",
    title: "Part B — NestJS: modules / providers / DI",
    days: "Wed 29 – Thu 30",
    focus: "THE core new concept. Build the mini-app in apps/api alongside the text.",
    tasks: [
      {
        label: "Read + type §1–§3",
        detail: "controller/provider/module, dependency injection, modules",
        guide: "nestjs",
      },
      {
        label: "Build a real feature module in apps/api",
        detail: "replace the hello-world: a `tasks` module + controller + @Injectable service",
        guide: "nestjs",
      },
      {
        label: "Wire DI: inject the service into the controller",
        detail: "constructor injection; register the provider in the module",
        guide: "nestjs",
      },
      {
        label: "Handle the request (§4)",
        detail: "route params, query string, and a POST body end-to-end",
        guide: "nestjs",
      },
      {
        label: "Read + type §5–§9",
        detail: "request lifecycle, pipes, guards, interceptors, exception filters",
        guide: "nestjs",
      },
      {
        label: "Add the cross-cutting layers to the module",
        detail: "a DTO + ValidationPipe, one guard, one interceptor, one exception filter",
        guide: "nestjs",
      },
    ],
  },
  {
    id: "c-architecture",
    title: "Part C — Architecture",
    days: "Fri 31",
    focus: "Hexagonal, repositories, SOLID, DDD. Redraw the diagrams from memory.",
    tasks: [
      {
        label: "Read: hexagonal, repositories, SOLID, DDD",
        guide: "system-design-fundamentals",
      },
      { label: "Redraw the layer / hexagonal diagrams from memory", detail: "no peeking, then diff against the guide" },
      {
        label: "Refactor the mini-app behind a repository port",
        detail: "hide data access behind an interface; inject it (dependency inversion)",
        guide: "nestjs",
      },
    ],
  },
  {
    id: "d-infra",
    title: "Part D — Monorepo, Docker, Compose + full mini-app",
    days: "Sat 1 · 7–8 h",
    focus: "Then the complete mini NestJS app end-to-end, typed out.",
    tasks: [
      { label: "Read + type: monorepo layout, Docker, Compose", guide: "git-workflow" },
      { label: "Write a Dockerfile for apps/api" },
      { label: "Write docker-compose (api + Postgres) and bring it up", detail: "docker compose up → api reachable" },
      {
        label: "Build the complete mini NestJS app end-to-end",
        detail: "the whole worked example, typed out by hand (never copy-paste)",
        guide: "nestjs",
      },
    ],
  },
  {
    id: "e-consolidate",
    title: "Part E — Consolidate",
    days: "Sun 2 · 7–8 h",
    focus: "Self-quiz cold + remaining exercises + mastery checklist.",
    tasks: [
      { label: "Self-quiz COLD", detail: "NestJS §Self-quiz + a TS type-level quiz, no notes", guide: "nestjs" },
      { label: "Finish any remaining exercises" },
      { label: "Fill the NestJS mastery checklist honestly", guide: "nestjs" },
      { label: "List the gaps you found → Monday's first job" },
    ],
  },
  {
    id: "dsa",
    title: "DSA — Two Pointers (1 / day, all week)",
    days: "Mon → Sun",
    focus: "One Two-Pointers problem each day → 7 this week (20 DSA total).",
    tasks: [
      { label: "Mon 27 — Two Pointers #1" },
      { label: "Tue 28 — Two Pointers #2" },
      { label: "Wed 29 — Two Pointers #3" },
      { label: "Thu 30 — Two Pointers #4" },
      { label: "Fri 31 — Two Pointers #5" },
      { label: "Sat 1 — Two Pointers #6" },
      { label: "Sun 2 — Two Pointers #7" },
    ],
  },
];
