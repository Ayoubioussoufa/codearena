/**
 * Shared pieces for drill files: the Drill shape and a docRef helper that
 * points an exercise back at its lesson (or one of its sections).
 */
import type { DocRef, Generator } from "../engine/types";

export interface Drill {
  id: string;
  title: string;
  /** One line under the title: what you practise. */
  blurb: string;
  generators: Generator[];
}

export const lessonRef = (lesson: string, label: string, anchor = ""): DocRef => ({
  slug: "",
  label,
  href: `/courses/lessons/${lesson}${anchor ? `#${anchor}` : ""}`,
});

/** Builds the 4-option record and returns [correct, wrong[]] for choice(). */
export function pickFrom<T extends Record<string, string>>(options: T, key: keyof T): { correct: string; wrong: string[] } {
  const correct = options[key] as string;
  return { correct, wrong: Object.values(options).filter((o) => o !== correct) };
}
