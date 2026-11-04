/**
 * "Check yourself" blocks embedded in guides, the same way exercises are:
 *
 *     ```check
 *     modules
 *     ```
 *
 * Each block sits under the section it tests: a few multiple-choice questions
 * (same rules as lesson quizzes: equal word counts, close lengths, the right
 * answer's position varied), then one question to answer in your own words.
 * Everything you answer is saved in this browser, and the panel at the end of
 * the guide copies it all as one message an AI tutor can correct.
 */
import type { QuizQuestion } from "@/lib/courses/types";

export interface GuideCheck {
  /** Unique within its guide; the fence holds it. Also the anchor: #check-<id>. */
  id: string;
  /** The part it tests, as the review message names it: "Part 4 · Modules". */
  section: string;
  questions: QuizQuestion[];
  /** One question to answer in writing, from memory. */
  explain: string;
}

export interface GuideSource {
  label: string;
  href: string;
  /** One line: why this one, and which part to read. */
  note: string;
}

export interface GuideCheckSet {
  /** Short name for spaced-review labels: "NestJS guide". */
  name: string;
  /** The best primary source to read alongside the guide (verified link). */
  source: GuideSource;
  checks: GuideCheck[];
  /** Terms to define in your own words in the end panel. */
  terms: string[];
}
