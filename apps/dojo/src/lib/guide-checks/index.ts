/**
 * Registry of guide checks, keyed by guide slug. See ./types.ts for the format.
 * Every question also becomes a spaced-review generator (topic course-recall),
 * so a question you answered in a guide comes back right before you'd forget it.
 */
import type { GuideCheck, GuideCheckSet } from "./types";
import { nestjsChecks } from "./nestjs";
import { nextjsChecks } from "./nextjs";
import { backendArchitectureChecks } from "./backend-architecture";
import { systemDesignChecks } from "./system-design-fundamentals";
import { testingChecks } from "./testing";
import { typescriptChecks } from "./typescript";
import { javascriptChecks } from "./javascript";
import { phase2Checks } from "./phase-2-execution-sandboxing";
import { reactChecks } from "./react-fundamentals";
import { csFundamentalsChecks } from "./cs-fundamentals";
import { phase0Checks } from "./phase-0-foundations";
import { phase1Checks } from "./phase-1-auth-data-frontend";
import { pythonChecks } from "./python";
import { interviewPlaybookChecks } from "./interview-playbook";
import { phase3Checks } from "./phase-3-rating-mastery-math";
import { phase4Checks } from "./phase-4-recommendation-engine";
import { phase5Checks } from "./phase-5-contests-cqrs-leaderboard";
import { phase6Checks } from "./phase-6-analytics-anticheat-observability";
import { dsaRoadmapChecks } from "./dsa-roadmap";
import { dsaPatternsChecks } from "./dsa-patterns";
import { gitWorkflowChecks } from "./git-workflow";
import { teamWorkflowChecks } from "./team-workflow";
import { javaSpringChecks } from "./java-spring-boot";
import { tailwindChecks } from "./tailwind-responsive-design";
import { aptitudeChecks } from "./aptitude-reasoning";
import { moroccoChecks } from "./morocco-internship-playbook";
import { jsReferenceChecks } from "./js";
import { javaReferenceChecks } from "./java";
import { missedWeek2Checks } from "./missed-week-2-the-judge";
import { week3TwoDaysChecks } from "./week-3-in-two-days";

const BY_GUIDE: Record<string, GuideCheckSet> = {
  nestjs: nestjsChecks,
  nextjs: nextjsChecks,
  "backend-architecture": backendArchitectureChecks,
  "system-design-fundamentals": systemDesignChecks,
  testing: testingChecks,
  typescript: typescriptChecks,
  javascript: javascriptChecks,
  "phase-2-execution-sandboxing": phase2Checks,
  "react-fundamentals": reactChecks,
  "cs-fundamentals": csFundamentalsChecks,
  "phase-0-foundations": phase0Checks,
  "phase-1-auth-data-frontend": phase1Checks,
  python: pythonChecks,
  "interview-playbook": interviewPlaybookChecks,
  "phase-3-rating-mastery-math": phase3Checks,
  "phase-4-recommendation-engine": phase4Checks,
  "phase-5-contests-cqrs-leaderboard": phase5Checks,
  "phase-6-analytics-anticheat-observability": phase6Checks,
  "dsa-roadmap": dsaRoadmapChecks,
  "dsa-patterns": dsaPatternsChecks,
  "git-workflow": gitWorkflowChecks,
  "team-workflow": teamWorkflowChecks,
  "java-spring-boot": javaSpringChecks,
  "tailwind-responsive-design": tailwindChecks,
  "aptitude-reasoning": aptitudeChecks,
  "morocco-internship-playbook": moroccoChecks,
  js: jsReferenceChecks,
  java: javaReferenceChecks,
  "missed-week-2-the-judge": missedWeek2Checks,
  "week-3-in-two-days": week3TwoDaysChecks,
};

export function guideCheckSet(slug: string): GuideCheckSet | undefined {
  return BY_GUIDE[slug];
}

export function getGuideCheck(slug: string, id: string): GuideCheck | undefined {
  return BY_GUIDE[slug]?.checks.find((c) => c.id === id);
}

export function allGuideCheckSets(): Array<[string, GuideCheckSet]> {
  return Object.entries(BY_GUIDE);
}

/** Progress-store slug for a guide (shares the course store, apart from lessons). */
export function guideProgressSlug(slug: string): string {
  return `guide:${slug}`;
}

/** Spaced-review id of question n (0-based) of a check. */
export function guideQuestionId(slug: string, checkId: string, n: number): string {
  return `guide-${slug}-${checkId}-q${n + 1}`;
}

/** Progress-store key of question n (0-based) of a check. */
export function guideQuestionKey(checkId: string, n: number): string {
  return `${checkId}:${n}`;
}
