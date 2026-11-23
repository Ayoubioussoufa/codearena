/**
 * Course types. A course is a sequence of lessons, grouped into weeks and
 * tracks. Lesson prose lives in content/courses/lessons/<slug>.html; the
 * structured parts (quiz, lab, schedule) live here, so they can be checked,
 * scheduled for spaced review, and listed on the hub.
 */

export type TrackId = "sandbox" | "backend" | "data" | "web" | "ship" | "story" | "ai" | "rust";

export interface Track {
  id: TrackId;
  title: string;
  blurb: string;
  /**
   * ISO date. Before it, the track's lessons stay off the "next lesson" path
   * and out of the progress count (they can still be opened from the map).
   */
  opens?: string;
}

/**
 * One multiple-choice question. Options keep the order written here (the
 * lesson varies where the right answer sits); spaced review reshuffles them.
 * Backticks in any string render as inline code.
 */
export interface QuizQuestion {
  prompt: string;
  options: readonly string[];
  /** 0-based index into `options`. */
  correct: number;
  /** Why the right answer is right, and why the tempting ones aren't. */
  why: string;
}

export interface LessonLab {
  /** Folder under apps/dojo/labs/. */
  dir: string;
  /** Files the learner writes (git-ignored inside the lab). */
  writes: string[];
  /** The command that grades the lab, run from inside the lab folder. */
  check: string;
}

/** A question from an earlier lesson, asked again at the start of this one. */
export interface WarmupRef {
  lesson: string;
  /** 0-based question index in that lesson's quiz. */
  question: number;
}

export interface Lesson {
  slug: string;
  number: number;
  track: TrackId;
  title: string;
  /** One sentence: what you'll be able to do afterwards. */
  summary: string;
  minutes: number;
  /** "ready" lessons have a body; "planned" ones are on the map, not written yet. */
  status: "ready" | "planned";
  /** The tangible win: what you'll have built. */
  builds?: string;
  lab?: LessonLab;
  /** Slug of the cheat sheet in content/courses/reference/ this lesson feeds. */
  reference?: string;
  quiz: QuizQuestion[];
  warmup?: WarmupRef[];
  /** Terms you define in your own words at the end (they feed the glossary). */
  words?: string[];
  /** Questions you answer in writing, e.g. the CodeArena one. */
  answers?: { id: string; label: string }[];
}

export interface SdLink {
  label: string;
  href: string;
}

/** What to build in CodeArena on a given day: directions, never code. */
export interface BuildTask {
  title: string;
  /** What you'll have at the end of the day, and why it matters. */
  goal: string;
  /** Lessons or pages to have done first. */
  before?: { label: string; href: string }[];
  /** What to do, in order. */
  steps: string[];
  /** The tests to write before the code (they must fail first). */
  testsFirst: string[];
  doneWhen: string[];
  traps?: string[];
  /** Suggested branch name(s). */
  branch?: string;
}

export interface DayPlan {
  /** e.g. "Mon 2 Nov". */
  label: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  /** Lesson slugs, in order. */
  lessons: string[];
  /** What goes into CodeArena that day, if anything. */
  build?: string;
  systemDesign?: SdLink[];
  dsa?: string;
  note?: string;
}

export interface Week {
  number: number;
  title: string;
  /** ISO dates, inclusive. */
  start: string;
  end: string;
  /** What you can do by Sunday. */
  goal: string;
  doneWhen: string[];
  days: DayPlan[];
  /** Shown above the day plan: schedule changes, warnings. */
  note?: string;
}
