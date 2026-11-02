/**
 * Registry of exercises embedded in guides, keyed by "<guide-slug>:<id>".
 *
 * A guide references one with a fence:
 *
 *     ```exercise
 *     port-symbol
 *     ```
 *
 * MarkdownView intercepts it the same way it already intercepts ```mermaid,
 * looks the id up here, and renders the editor in place.
 */
import type { GuideExercise } from "./types";
import { backendArchitectureExercises } from "./backend-architecture";
import { nestjsExercises } from "./nestjs";
import { typescriptExercises } from "./typescript";
import { testingExercises } from "./testing";
import { gitWorkflowExercises } from "./git-workflow";
import { teamWorkflowExercises } from "./team-workflow";
import { phase0Exercises } from "./phase-0";
import { phase1Exercises } from "./phase-1";
import { phase2Exercises } from "./phase-2";
import { reactExercises } from "./react-fundamentals";
import { systemDesignExercises } from "./system-design";
import { javascriptExercises } from "./javascript";
import { nextjsExercises } from "./nextjs";
import { javaSpringExercises } from "./java-spring-boot";
import {
  phase3Exercises,
  phase4Exercises,
  phase5Exercises,
  phase6Exercises,
} from "./phase-3-6";

const BY_GUIDE: Record<string, GuideExercise[]> = {
  "backend-architecture": backendArchitectureExercises,
  nestjs: nestjsExercises,
  typescript: typescriptExercises,
  testing: testingExercises,
  "git-workflow": gitWorkflowExercises,
  "team-workflow": teamWorkflowExercises,
  "phase-0-foundations": phase0Exercises,
  "phase-1-auth-data-frontend": phase1Exercises,
  "phase-2-execution-sandboxing": phase2Exercises,
  "react-fundamentals": reactExercises,
  "system-design-fundamentals": systemDesignExercises,
  javascript: javascriptExercises,
  nextjs: nextjsExercises,
  "java-spring-boot": javaSpringExercises,
  "phase-3-rating-mastery-math": phase3Exercises,
  "phase-4-recommendation-engine": phase4Exercises,
  "phase-5-contests-cqrs-leaderboard": phase5Exercises,
  "phase-6-analytics-anticheat-observability": phase6Exercises,
};

export function getGuideExercise(
  guideSlug: string,
  id: string,
): GuideExercise | undefined {
  return BY_GUIDE[guideSlug]?.find((e) => e.id === id);
}

/** Every exercise in a guide, in definition order. Used by the checker script. */
export function exercisesForGuide(guideSlug: string): GuideExercise[] {
  return BY_GUIDE[guideSlug] ?? [];
}

export function allGuideExercises(): { guide: string; exercise: GuideExercise }[] {
  return Object.entries(BY_GUIDE).flatMap(([guide, list]) =>
    list.map((exercise) => ({ guide, exercise })),
  );
}

export type { GuideExercise };
