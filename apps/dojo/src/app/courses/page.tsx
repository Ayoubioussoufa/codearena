/**
 * The course hub: where you are, this week's plan, every track, references.
 */
import Link from "next/link";
import { LESSONS, TRACKS, WEEKS } from "@/lib/courses/catalog";
import { getReferencePages } from "@/lib/courses/content";
import { CourseToday, LessonList, WeekCards } from "@/components/courses/HubWidgets";

export const metadata = { title: "Courses" };

export default function CoursesHub() {
  const references = getReferencePages();
  const written = LESSONS.filter((l) => l.status === "ready").length;

  return (
    <main className="course-main">
      <p className="kicker">Courses</p>
      <h1>Build CodeArena from first principles</h1>
      <p className="lede">
        Every lesson starts from zero, explains one idea down to the machine, then makes you build
        it with your own hands, with a checker that tells you when it works. Then you use it in
        CodeArena.
      </p>
      <p className="meta">
        {LESSONS.length} lessons on the map · {written} written · weeks 2 to 5 of the sprint
      </p>

      <CourseToday />

      <h2>How a lesson works</h2>
      <ol>
        <li>
          <strong>Why it matters:</strong> what CodeArena needs, and the question the lesson answers.
        </li>
        <li>
          <strong>The idea, from scratch:</strong> short sections, one idea at a time, linked to
          the primary source.
        </li>
        <li>
          <strong>Practise it in the browser:</strong> a drill with new numbers and scenarios every
          round and instant feedback, so the idea is solid around the lab.
        </li>
        <li>
          <strong>You build it:</strong> a lab in <code>apps/dojo/labs/</code>, step by step, with
          hints folded away and a checker you run in the terminal.
        </li>
        <li>
          <strong>Back to CodeArena:</strong> what it means for the judge, and a question about your
          own code (you change it yourself).
        </li>
        <li>
          <strong>Check yourself:</strong> a quiz, and the drill&apos;s questions, go into the
          dojo&apos;s <Link href="/practice/review">spaced review</Link>. Then you write your own
          definitions, saved as you type, and one button turns them into the <code>done</code>{" "}
          message for your teacher. The right ones go into the{" "}
          <Link href="/courses/glossary">glossary</Link>.
        </li>
      </ol>
      <p className="aside">
        Lessons are written a few days ahead of you, adapted to what you&apos;ve shown you know. When
        you finish one, send <code>done NNNN</code> in the terminal: that&apos;s how the next ones get
        tuned.
      </p>

      <h2>The weeks</h2>
      <WeekCards weeks={WEEKS} />

      <h2>The tracks</h2>
      {TRACKS.map((track) => {
        const slugs = LESSONS.filter((l) => l.track === track.id).map((l) => l.slug);
        if (slugs.length === 0) return null;
        return (
          <section key={track.id}>
            <h3>{track.title}</h3>
            <p className="muted" style={{ fontSize: "1rem" }}>
              {track.blurb}
            </p>
            <LessonList slugs={slugs} />
          </section>
        );
      })}

      <h2>Reference</h2>
      <ul>
        {references.map((r) => (
          <li key={r.slug}>
            <Link href={`/courses/reference/${r.slug}`}>{r.title}</Link>
          </li>
        ))}
        <li>
          <Link href="/courses/glossary">Glossary</Link>: your own definitions, added as you learn
        </li>
        <li>
          <Link href="/guides">The dojo&apos;s guides</Link>: the phase docs, system design, CS
          fundamentals
        </li>
      </ul>
    </main>
  );
}
