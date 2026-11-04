/**
 * The course glossary. A term joins only once the learner can define it:
 * their one-sentence definition goes in, corrected if needed. Lessons stick
 * to these words.
 */
export interface GlossaryTerm {
  term: string;
  definition: string;
  /** Words to avoid for the same idea. */
  avoid?: string[];
  /** Lesson slug where it was learned. */
  lesson: string;
}

export interface GlossaryGroup {
  title: string;
  terms: GlossaryTerm[];
}

export const GLOSSARY: GlossaryGroup[] = [
  { title: "Processes and the kernel", terms: [] },
];
