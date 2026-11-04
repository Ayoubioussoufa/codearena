/**
 * Date logic for the hub: which week is now, what's next, what's today.
 * Pure functions, safe on the server. The client hook is in use-today.ts.
 */
import { LESSONS, WEEKS, getTrack } from "./catalog";
import type { DayPlan, Lesson, Week } from "./types";

/** Local calendar date as yyyy-mm-dd (not UTC: a late-evening session is still "today"). */
export function localISO(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The week containing `today`, else the next one to start, else the last. */
export function currentWeek(today: string): Week | undefined {
  return (
    WEEKS.find((w) => w.start <= today && today <= w.end) ??
    WEEKS.find((w) => w.start > today) ??
    WEEKS[WEEKS.length - 1]
  );
}

export function dayOf(week: Week, today: string): DayPlan | undefined {
  return week.days.find((d) => d.date === today);
}

/** False while the lesson's track hasn't opened yet (see Track.opens). */
export function isOpen(lesson: Lesson, today: string): boolean {
  const opens = getTrack(lesson.track).opens;
  return !opens || today >= opens;
}

/** The first written lesson you haven't completed, in course order, among the tracks open today. */
export function nextLesson(isDone: (slug: string) => boolean, today: string): Lesson | undefined {
  return LESSONS.find((l) => l.status === "ready" && !isDone(l.slug) && isOpen(l, today));
}

export function lessonsOfWeek(week: Week): Lesson[] {
  const slugs = week.days.flatMap((d) => d.lessons);
  return LESSONS.filter((l) => slugs.includes(l.slug));
}
