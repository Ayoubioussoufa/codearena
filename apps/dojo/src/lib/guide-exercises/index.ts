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

const BY_GUIDE: Record<string, GuideExercise[]> = {
  "backend-architecture": backendArchitectureExercises,
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
