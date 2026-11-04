/**
 * The progress-aware pieces of the course pages. Everything here reads
 * localStorage, so it renders a neutral state on the server and fills in on
 * the client.
 */
"use client";

import Link from "next/link";
import { LESSONS, getLesson, lessonPath } from "@/lib/courses/catalog";
import type { DayPlan, Lesson, Week } from "@/lib/courses/types";
import { isCompleted, lessonProgress, setStep, useCourseProgress } from "@/lib/courses/progress";
import { currentWeek, dayOf, lessonsOfWeek, nextLesson } from "@/lib/courses/schedule";
import { useToday } from "@/lib/courses/use-today";
import { dueList, today as utcToday, useProgress } from "@/lib/progress";
import { Inline } from "./Inline";
import { BuildTaskCard } from "./BuildTaskCard";
import { taskFor } from "@/lib/courses/tasks";

function useCompletion() {
  const progress = useCourseProgress();
  return (slug: string) => isCompleted(progress, slug);
}

/** The "where am I" card at the top of the hub. */
export function CourseToday() {
  const today = useToday();
  const courseProgress = useCourseProgress();
  const done = (slug: string) => isCompleted(courseProgress, slug);
  const drill = useProgress();
  const dueCourse = dueList(drill, utcToday()).filter((d) => d.topicId === "course-recall").length;
  const dueAll = dueList(drill, utcToday()).length;

  if (today === null) return <div className="today" style={{ minHeight: "9rem" }} />;

  const week = currentWeek(today);
  const next = nextLesson(done);
  const plan = week ? dayOf(week, today) : undefined;
  const todaysLessons = (plan?.lessons ?? []).map(getLesson).filter((l): l is Lesson => !!l);

  return (
    <div className="today">
      <p className="kicker">
        {week ? `Week ${week.number} · ${week.title}` : "Courses"}
        {plan ? ` · ${plan.label}` : ""}
      </p>
      {next ? (
        <>
          <h2>
            Next: Lesson {next.number}, {next.title}
          </h2>
          <p className="muted" style={{ fontSize: "1rem" }}>
            {next.summary} About {next.minutes} minutes.
          </p>
        </>
      ) : (
        <h2>Every written lesson is done. The next ones are being written for you.</h2>
      )}
      {todaysLessons.length > 0 && (
        <p className="sans" style={{ fontSize: "0.9rem" }}>
          Planned for today:{" "}
          {todaysLessons.map((l, i) => (
            <span key={l.slug}>
              {i > 0 && " · "}
              <Link href={lessonPath(l.slug)}>
                {l.number}. {l.title}
              </Link>
              {done(l.slug) ? " ✓" : ""}
            </span>
          ))}
        </p>
      )}
      <div className="actions">
        {next && (
          <Link className="btn primary" href={lessonPath(next.slug)}>
            {started(lessonProgress(courseProgress, next.slug)) ? "Continue" : "Start"} lesson {next.number} →
          </Link>
        )}
        <Link className="btn" href="/courses/today">
          Today&apos;s plan
        </Link>
        {week && (
          <Link className="btn" href={`/courses/weeks/${week.number}`}>
            Week {week.number}, day by day
          </Link>
        )}
        {dueAll > 0 && (
          <Link className="btn" href="/practice/review">
            🧠 {dueAll} due for review{dueCourse > 0 ? ` (${dueCourse} from lessons)` : ""}
          </Link>
        )}
      </div>
    </div>
  );
}

function started(lesson: { steps: Record<string, boolean>; quiz: Record<string, boolean> }): boolean {
  return Object.values(lesson.steps).some(Boolean) || Object.keys(lesson.quiz).length > 0;
}

export function LessonBadge({ lesson }: { lesson: Lesson }) {
  const done = useCompletion();
  const next = nextLesson(done);
  if (lesson.status === "planned") return <span className="badge">being written</span>;
  if (done(lesson.slug)) return <span className="badge done">done</span>;
  if (next?.slug === lesson.slug) return <span className="badge now">next</span>;
  return <span className="badge ready">ready</span>;
}

/** Lesson rows: number, title (linked when written), badge, summary. */
export function LessonList({ slugs }: { slugs: string[] }) {
  const lessons = slugs.map(getLesson).filter((l): l is Lesson => !!l);
  return (
    <ul className="lessons">
      {lessons.map((l) => (
        <li key={l.slug} className={l.status}>
          <span className="num">{l.number}</span>
          <span className="t">
            <Link href={lessonPath(l.slug)} className={l.status === "ready" ? "" : "plain"}>
              {l.title}
            </Link>
          </span>
          <LessonBadge lesson={l} />
          <span className="s">
            {l.summary} <span className="sans" style={{ fontSize: "0.8rem" }}>· {l.minutes} min</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function WeekMeter({ week }: { week: Week }) {
  const done = useCompletion();
  const lessons = lessonsOfWeek(week);
  const finished = lessons.filter((l) => done(l.slug)).length;
  const pct = lessons.length === 0 ? 0 : Math.round((finished / lessons.length) * 100);
  return (
    <>
      <div className="meter" aria-hidden>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="sans muted" style={{ fontSize: "0.8rem" }}>
        {finished} of {lessons.length} lessons done
      </p>
    </>
  );
}

export function WeekCards({ weeks }: { weeks: Week[] }) {
  const today = useToday();
  const current = today ? currentWeek(today) : undefined;
  return (
    <div className="weeks">
      {weeks.map((w) => (
        <Link
          key={w.number}
          href={`/courses/weeks/${w.number}`}
          className={`week-card ${current?.number === w.number ? "current" : ""}`}
        >
          <p className="kicker">
            Week {w.number} · {formatRange(w.start, w.end)}
            {current?.number === w.number ? " · this week" : ""}
          </p>
          <h3>{w.title}</h3>
          <p>{w.goal}</p>
          <WeekMeter week={w} />
        </Link>
      ))}
    </div>
  );
}

/** The day-by-day plan of a week, with today highlighted. */
export function WeekDays({ week }: { week: Week }) {
  const today = useToday();
  return (
    <div className="days">
      {week.days.map((d) => (
        <Day key={d.date} day={d} isToday={d.date === today} />
      ))}
    </div>
  );
}

function Day({ day, isToday }: { day: DayPlan; isToday: boolean }) {
  return (
    <section className={`day ${isToday ? "today-day" : ""}`} id={day.date}>
      <div className="day-head">
        <h3>{day.label}</h3>
        {isToday && <span className="badge now">today</span>}
      </div>
      <dl>
        {day.lessons.length > 0 && (
          <>
            <dt>Lessons</dt>
            <dd>
              <ul className="bare" style={{ margin: 0 }}>
                {day.lessons.map((slug) => {
                  const l = getLesson(slug);
                  if (!l) return null;
                  return (
                    <li key={slug} style={{ display: "flex", gap: "0.5rem", alignItems: "baseline", flexWrap: "wrap" }}>
                      <Link href={lessonPath(slug)} className={l.status === "ready" ? "" : "plain"}>
                        {l.number}. {l.title}
                      </Link>
                      <LessonBadge lesson={l} />
                    </li>
                  );
                })}
              </ul>
            </dd>
          </>
        )}
        {(taskFor(day.date) || day.build) && (
          <>
            <dt>CodeArena</dt>
            <dd>
              <Inline text={taskFor(day.date)?.title ?? day.build ?? ""} />
            </dd>
          </>
        )}
        {day.systemDesign && day.systemDesign.length > 0 && (
          <>
            <dt>System design</dt>
            <dd>
              {day.systemDesign.map((s, i) => (
                <span key={s.href + i}>
                  {i > 0 && " · "}
                  <Link href={s.href}>{s.label}</Link>
                </span>
              ))}
            </dd>
          </>
        )}
        {day.dsa && (
          <>
            <dt>DSA</dt>
            <dd>
              <Inline text={day.dsa} />
            </dd>
          </>
        )}
        {day.note && (
          <>
            <dt>Note</dt>
            <dd>
              <Inline text={day.note} />
            </dd>
          </>
        )}
      </dl>
      {taskFor(day.date) && <BuildTaskCard task={taskFor(day.date)!} open={isToday} />}
    </section>
  );
}

/** The week's binary checkpoint, ticked and remembered. */
export function DoneWhen({ week }: { week: Week }) {
  const key = `week-${week.number}`;
  const ticks = lessonProgress(useCourseProgress(), key).steps;
  return (
    <ul className="checklist">
      {week.doneWhen.map((item, i) => (
        <li key={i}>
          <input
            type="checkbox"
            id={`${key}-${i}`}
            checked={ticks[String(i)] === true}
            onChange={(e) => setStep(key, String(i), e.target.checked)}
          />
          <label htmlFor={`${key}-${i}`}>
            <Inline text={item} />
          </label>
        </li>
      ))}
    </ul>
  );
}

/** Dojo dashboard banner (Tailwind, to match the dashboard). */
export function CoursesBanner() {
  const today = useToday();
  const done = useCompletion();
  if (today === null) return null;
  const week = currentWeek(today);
  const next = nextLesson(done);
  const total = LESSONS.filter((l) => l.status === "ready").length;
  const finished = LESSONS.filter((l) => l.status === "ready" && done(l.slug)).length;
  return (
    <Link
      href={next ? lessonPath(next.slug) : "/courses"}
      className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-cyan-300 bg-cyan-50/60 p-4 transition-colors hover:border-cyan-400 dark:border-cyan-500/40 dark:bg-cyan-500/5"
    >
      <span className="text-2xl">📚</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-400">
          Courses{week ? ` · Week ${week.number}: ${week.title}` : ""} · {finished}/{total} lessons done
        </p>
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {next ? `Next: Lesson ${next.number}, ${next.title}` : "All written lessons done: the next ones are on their way"}
        </p>
      </div>
      <span className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500">
        {next ? "Continue →" : "Open courses →"}
      </span>
    </Link>
  );
}

function formatRange(start: string, end: string): string {
  const fmt = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

/** The /courses/today page: everything for one day, in the order to do it. */
export function TodayPlan() {
  const today = useToday();
  if (today === null) return <div style={{ minHeight: "20rem" }} />;
  const week = currentWeek(today);
  const plan = week ? (dayOf(week, today) ?? week.days[0]) : undefined;
  if (!week || !plan) return <p>No plan for today.</p>;
  const task = taskFor(plan.date);
  const isToday = plan.date === today;
  return (
    <>
      <p className="kicker">
        Week {week.number} · {week.title}
      </p>
      <h1>{isToday ? `Today, ${plan.label}` : `Next up: ${plan.label}`}</h1>
      <p className="meta">
        The order that works: review first, then the lessons, then CodeArena, then system design, DSA last.
      </p>

      <h2>① Review (30 min)</h2>
      <p>
        <Link href="/practice/review">The spaced-review queue</Link>: lesson questions, drills and
        everything else that&apos;s due. Never skip it.
      </p>

      {plan.lessons.length > 0 && (
        <>
          <h2>② Lessons</h2>
          <LessonList slugs={plan.lessons} />
        </>
      )}

      {task && (
        <>
          <h2>③ CodeArena</h2>
          <BuildTaskCard task={task} />
        </>
      )}

      {plan.systemDesign && plan.systemDesign.length > 0 && (
        <>
          <h2>④ System design (1 h)</h2>
          <p>
            {plan.systemDesign.map((s, i) => (
              <span key={s.href + i}>
                {i > 0 && " · "}
                <Link href={s.href}>{s.label}</Link>
              </span>
            ))}
          </p>
          <p className="muted" style={{ fontSize: "1rem" }}>
            Read the section, close it, then explain it out loud. If you can&apos;t, read it again.
          </p>
        </>
      )}

      {plan.dsa && (
        <>
          <h2>⑤ DSA</h2>
          <p>
            <Inline text={plan.dsa} />
          </p>
          <p className="muted" style={{ fontSize: "1rem" }}>
            Blocks are in <code>~/bcgx-prep/cp-program/</code>, your solutions in <code>~/cp</code>.
          </p>
        </>
      )}
      {plan.note && (
        <div className="callout">
          <Inline text={plan.note} />
        </div>
      )}
    </>
  );
}
