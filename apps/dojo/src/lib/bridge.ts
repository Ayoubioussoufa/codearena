/**
 * The learn → build bridge (server-only): connects dojo topics to the actual
 * work waiting in the CodeArena repo.
 *
 *  - Frontend: scans apps/web/src for live `TODO(practice - …)` markers, so the
 *    /build page shows the REAL, still-open gaps and shrinks as you complete
 *    them (re-scanned each request in dev).
 *  - Backend: curated "phase" targets for the topics whose payoff is in
 *    apps/api / the roadmap rather than a frontend TODO.
 */
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./repo";
import type { TopicId } from "./engine/types";

const WEB_SRC = path.join(REPO_ROOT, "apps/web/src");

export interface WebTodo {
  /** Path relative to the repo root, e.g. "apps/web/src/app/page.tsx". */
  file: string;
  line: number;
  /** The skill string inside `TODO(practice - <skill>)`. */
  skill: string;
  /** Trimmed text following the marker (the goal), if any. */
  note: string;
  topicId: TopicId;
}

export interface PhaseTarget {
  topicId: TopicId;
  app: "web" | "api";
  title: string;
  detail: string;
  /** Optional repo-relative file the work lives in. */
  file?: string;
}

const TODO_RE = /TODO\(practice\s*-\s*([^)]+)\)\s*:?\s*(.*)$/;

/** Map a TODO's skill phrase (or a topic) to the dojo topic that drills it. */
function classifyTopic(skill: string): TopicId {
  const s = skill.toLowerCase();
  if (s.includes("tailwind") || s.includes("responsive") || s.includes("layout")) {
    return "tailwind";
  }
  // Everything else in apps/web is React-family work: hooks, context,
  // composition, memoization, refs, controlled inputs, calendar→UI, modals.
  return "react";
}

function walk(dir: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) out.push(full);
  }
}

/** Scan apps/web for open practice TODOs (one per marker line). */
export function scanWebTodos(): WebTodo[] {
  const files: string[] = [];
  walk(WEB_SRC, files);
  const todos: WebTodo[] = [];

  for (const file of files.sort()) {
    let lines: string[];
    try {
      lines = fs.readFileSync(file, "utf8").split("\n");
    } catch {
      continue;
    }
    const rel = path.relative(REPO_ROOT, file);
    lines.forEach((text, i) => {
      const match = text.match(TODO_RE);
      if (!match) return;
      const skill = (match[1] ?? "").trim();
      todos.push({
        file: rel,
        line: i + 1,
        skill,
        note: (match[2] ?? "").trim(),
        topicId: classifyTopic(skill),
      });
    });
  }
  return todos;
}

/** Backend / roadmap targets for topics whose payoff isn't a frontend TODO. */
export const PHASE_TARGETS: PhaseTarget[] = [
  {
    topicId: "typescript",
    app: "web",
    title: "The shared type layer",
    detail:
      "Discriminated unions like RunResult, the Problem/Submission/Contest types every page consumes.",
    file: "apps/web/src/lib/types.ts",
  },
  {
    topicId: "sql-data",
    app: "api",
    title: "Phase 1 — Prisma schema & queries",
    detail:
      "users / problems / tags / test_cases models, the composite indexes, cursor pagination, killing N+1s.",
  },
  {
    topicId: "auth-security",
    app: "api",
    title: "Phase 1 — Auth module",
    detail:
      "bcrypt hashing, JWT access tokens + refresh-token rotation, Zod-validated DTOs, RBAC guards.",
  },
  {
    topicId: "sandboxing-queues",
    app: "api",
    title: "Phase 2 — Execution sandbox & queue",
    detail:
      "the hardened Docker code-runner, BullMQ workers with idempotency, WebSocket verdict streaming.",
  },
  {
    topicId: "rating-math",
    app: "api",
    title: "Phase 3 — Rating & mastery service",
    detail:
      "Glicko-2 updates, IRT difficulty estimation, and the FSRS scheduler (which this dojo now runs too).",
  },
  {
    topicId: "distributed-systems",
    app: "api",
    title: "Phase 5–6 — Contests, leaderboard, anti-cheat",
    detail:
      "Redis sorted-set leaderboard, CQRS projections & events, Winnowing plagiarism fingerprints, tracing.",
  },
];

export function phaseTargetsForTopic(topicId: TopicId): PhaseTarget[] {
  return PHASE_TARGETS.filter((t) => t.topicId === topicId);
}

export interface TopicBridge {
  webTodos: WebTodo[];
  phaseTargets: PhaseTarget[];
}

/** Everything a single topic prepares you to build. */
export function bridgeForTopic(topicId: TopicId): TopicBridge {
  return {
    webTodos: scanWebTodos().filter((t) => t.topicId === topicId),
    phaseTargets: phaseTargetsForTopic(topicId),
  };
}
