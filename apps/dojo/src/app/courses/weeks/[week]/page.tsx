/**
 * One week of the course: the goal, the day-by-day plan, the checkpoint.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { WEEKS, getWeek } from "@/lib/courses/catalog";
import { lessonsOfWeek } from "@/lib/courses/schedule";
import { DoneWhen, LessonList, WeekDays, WeekMeter } from "@/components/courses/HubWidgets";
import { Inline } from "@/components/courses/Inline";

interface WeekPageProps {
  params: Promise<{ week: string }>;
}

export function generateStaticParams() {
  return WEEKS.map((w) => ({ week: String(w.number) }));
}

export async function generateMetadata({ params }: WeekPageProps) {
  const week = getWeek(Number((await params).week));
  return { title: week ? `Week ${week.number}: ${week.title}` : "Week not found" };
}

export default async function WeekPage({ params }: WeekPageProps) {
  const week = getWeek(Number((await params).week));
  if (!week) notFound();
  const i = WEEKS.indexOf(week);
  const prev = WEEKS[i - 1];
  const next = WEEKS[i + 1];

  return (
    <main className="course-main wide">
      <nav className="crumbs">
        <Link href="/courses">Courses</Link>
        <span>›</span>
        <span>Week {week.number}</span>
      </nav>

      <p className="kicker">
        Week {week.number} · {formatDay(week.start)} – {formatDay(week.end)}
      </p>
      <h1>{week.title}</h1>
      <p className="lede">{week.goal}</p>
      <WeekMeter week={week} />

      {week.note && (
        <div className="callout">
          <span className="label">Schedule</span>
          <p>
            <Inline text={week.note} />
          </p>
        </div>
      )}

      <h2>Day by day</h2>
      <p className="muted" style={{ fontSize: "1rem" }}>
        Dates are targets, not deadlines. If a lesson takes longer, the next one waits: depth beats
        pace. The DSA blocks live in <code>~/bcgx-prep/cp-program/</code>, your solutions in{" "}
        <code>~/cp</code>.
      </p>
      <WeekDays week={week} />

      <h2>This week&apos;s lessons</h2>
      <LessonList slugs={lessonsOfWeek(week).map((l) => l.slug)} />

      <h2>Checkpoint · Sunday</h2>
      <p className="muted" style={{ fontSize: "1rem" }}>
        Binary: a box is ticked only if it&apos;s fully true. If two or more fail, next week starts by
        finishing them.
      </p>
      <DoneWhen week={week} />

      <nav className="pager">
        {prev ? (
          <Link href={`/courses/weeks/${prev.number}`}>
            <small>← Previous</small>Week {prev.number}: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link className="next" href={`/courses/weeks/${next.number}`}>
            <small>Next →</small>Week {next.number}: {next.title}
          </Link>
        )}
      </nav>
    </main>
  );
}

function formatDay(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
