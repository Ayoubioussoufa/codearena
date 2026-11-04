/**
 * Course progress (localStorage), kept apart from the drill progress store:
 * which build steps are ticked, how each quiz question went, and which
 * lessons you marked complete. Quiz answers ALSO go to the drill store
 * (recordAnswer), which is what schedules them for spaced review.
 */
"use client";

import { useSyncExternalStore } from "react";

const KEY = "dojo-courses-v1";
const EVENT = "dojo-courses-changed";

export interface LessonProgress {
  /** Step checkbox key → ticked. */
  steps: Record<string, boolean>;
  /** Quiz question index → answered right the first time. */
  quiz: Record<string, boolean>;
  /** ISO date the lesson was marked complete. */
  completedAt?: string;
  /** Your own words: "term:<term>" definitions and "answer:<id>" answers. */
  notes?: Record<string, string>;
  /** Quiz question key → the option you picked most recently (for the review message). */
  picks?: Record<string, number>;
}

export interface CourseProgress {
  lessons: Record<string, LessonProgress>;
}

const EMPTY: CourseProgress = { lessons: {} };
const EMPTY_LESSON: LessonProgress = { steps: {}, quiz: {} };

let cacheRaw: string | null = null;
let cacheValue: CourseProgress = EMPTY;

function read(): CourseProgress {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cacheValue = raw === null ? EMPTY : (JSON.parse(raw) as CourseProgress);
    } catch {
      cacheValue = EMPTY;
    }
  }
  return cacheValue;
}

function write(next: CourseProgress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: progress just isn't remembered.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Live course progress; empty during SSR and first paint. */
export function useCourseProgress(): CourseProgress {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function lessonProgress(progress: CourseProgress, slug: string): LessonProgress {
  return progress.lessons[slug] ?? EMPTY_LESSON;
}

function update(slug: string, change: (lesson: LessonProgress) => LessonProgress) {
  const prev = read();
  write({ lessons: { ...prev.lessons, [slug]: change(lessonProgress(prev, slug)) } });
}

export function setStep(slug: string, key: string, ticked: boolean) {
  update(slug, (l) => ({ ...l, steps: { ...l.steps, [key]: ticked } }));
}

/**
 * Records whether the FIRST answer to a question was right (retries don't
 * overwrite it), and the option picked LAST, which is what the review message
 * sends for correction. Lessons key questions by index; guides by "<check>:<n>".
 */
export function recordLessonAnswer(slug: string, key: string | number, correct: boolean, option?: number) {
  const k = String(key);
  update(slug, (l) => {
    const next = k in l.quiz ? l : { ...l, quiz: { ...l.quiz, [k]: correct } };
    return option === undefined ? next : { ...next, picks: { ...next.picks, [k]: option } };
  });
}

export function setCompleted(slug: string, done: boolean) {
  update(slug, (l) => {
    const next: LessonProgress = { steps: l.steps, quiz: l.quiz };
    if (l.notes) next.notes = l.notes;
    if (l.picks) next.picks = l.picks;
    if (done) next.completedAt = new Date().toISOString().slice(0, 10);
    return next;
  });
}

export function setNote(slug: string, key: string, value: string) {
  update(slug, (l) => ({ ...l, notes: { ...l.notes, [key]: value } }));
}

export function isCompleted(progress: CourseProgress, slug: string): boolean {
  return progress.lessons[slug]?.completedAt !== undefined;
}
