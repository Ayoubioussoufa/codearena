/**
 * A lesson: header from the catalog, body from content/courses/lessons/,
 * the warm-up and quiz rendered as components, then the finish line.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LESSONS,
  getLesson,
  getTrack,
  lessonNeighbours,
  lessonPath,
  questionId,
  weekOfLesson,
} from "@/lib/courses/catalog";
import { getLessonBody } from "@/lib/courses/content";
import { LessonBody } from "@/components/courses/LessonBody";
import { LessonQuiz, type QuizItem } from "@/components/courses/LessonQuiz";
import { LessonFinish } from "@/components/courses/LessonFinish";
import { LessonDrill } from "@/components/courses/LessonDrill";
import { OwnWords } from "@/components/courses/OwnWords";
import { BuildTaskCard } from "@/components/courses/BuildTaskCard";
import { taskFor } from "@/lib/courses/tasks";
import { Inline } from "@/components/courses/Inline";

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: LessonPageProps) {
  const lesson = getLesson((await params).slug);
  return { title: lesson ? `Lesson ${lesson.number}: ${lesson.title}` : "Lesson not found" };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const lesson = getLesson((await params).slug);
  if (!lesson) notFound();

  const track = getTrack(lesson.track);
  const week = weekOfLesson(lesson.slug);
  const { prev, next } = lessonNeighbours(lesson.slug);
  const body = lesson.status === "ready" ? getLessonBody(lesson.slug) : null;
  const day = week?.days.find((d) => d.lessons.includes(lesson.slug));
  const task = day ? taskFor(day.date) : undefined;

  const quizItems: QuizItem[] = lesson.quiz.map((question, index) => ({
    id: questionId(lesson.slug, index),
    lessonSlug: lesson.slug,
    index,
    question,
  }));
  const warmupItems: QuizItem[] = (lesson.warmup ?? []).flatMap((ref) => {
    const from = getLesson(ref.lesson);
    const question = from?.quiz[ref.question];
    if (!from || !question) return [];
    return [
      {
        id: questionId(from.slug, ref.question),
        lessonSlug: from.slug,
        index: ref.question,
        from: `From lesson ${from.number}`,
        question,
      },
    ];
  });

  return (
    <main className="course-main">
      <nav className="crumbs">
        <Link href="/courses">Courses</Link>
        <span>›</span>
        {week ? <Link href={`/courses/weeks/${week.number}`}>Week {week.number}</Link> : <span>{track.title}</span>}
        <span>›</span>
        <span>Lesson {lesson.number}</span>
        <span style={{ marginLeft: "auto" }} />
        {lesson.reference && <Link href={`/courses/reference/${lesson.reference}`}>Cheat sheet</Link>}
        <Link href="/courses/glossary">Glossary</Link>
      </nav>

      <p className="kicker">
        Lesson {lesson.number} · {track.title}
      </p>
      <h1>{lesson.title}</h1>
      <p className="meta">
        About {lesson.minutes} minutes
        {lesson.builds ? (
          <>
            {" "}
            · You build <Inline text={lesson.builds} />
          </>
        ) : null}
        {lesson.lab ? (
          <>
            {" "}
            · Lab: <code>apps/dojo/labs/{lesson.lab.dir}/</code>
          </>
        ) : null}
      </p>

      {body ? (
        <>
          {body.toc.length > 2 && (
            <nav className="toc" aria-label="In this lesson">
              <span className="label">In this lesson</span>
              <ol>
                {warmupItems.length > 0 && (
                  <li>
                    <a href="#warm-up">Warm-up, from memory</a>
                  </li>
                )}
                {body.toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`}>{t.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {body.segments.map((segment, i) => {
            switch (segment.kind) {
              case "html":
                return <LessonBody key={i} slug={lesson.slug} html={segment.html} />;
              case "warmup":
                return warmupItems.length > 0 ? (
                  <section key={i}>
                    <h2 id="warm-up">Warm-up, from memory</h2>
                    <p>
                      Before anything new: two questions from earlier lessons. Pulling an answer out
                      of memory is what makes it stay there.
                    </p>
                    <LessonQuiz items={warmupItems} kind="warmup" />
                  </section>
                ) : null;
              case "drill":
                return <LessonDrill key={i} id={segment.id} />;
              case "quiz":
                return quizItems.length > 0 ? <LessonQuiz key={i} items={quizItems} kind="quiz" /> : null;
              case "words":
                return (
                  <OwnWords
                    key={i}
                    slug={lesson.slug}
                    number={lesson.number}
                    terms={lesson.words ?? []}
                    answers={lesson.answers ?? []}
                    quiz={lesson.quiz}
                  />
                );
            }
          })}
          {task && day && (
            <section>
              <h2 id="then-in-codearena">Then, in CodeArena</h2>
              <p>
                The lesson gave you the idea and a lab. Now put it in your project: this is {day.label}&apos;s
                build. Directions only: you write every line.
              </p>
              <BuildTaskCard task={task} date={day.label} />
            </section>
          )}
          <LessonFinish
            slug={lesson.slug}
            number={lesson.number}
            totalSteps={body.steps}
            totalQuestions={quizItems.length}
          />
        </>
      ) : (
        <>
          <p className="lede">{lesson.summary}</p>
          <div className="callout">
            <span className="label">Being written</span>
            <p>
              This lesson is on the map but not written yet. Lessons are written a few days ahead of
              you, so each one starts from what you&apos;ve actually learned so far.
              {week ? (
                <>
                  {" "}
                  It&apos;s planned for <Link href={`/courses/weeks/${week.number}`}>week {week.number}</Link>.
                </>
              ) : null}
            </p>
          </div>
        </>
      )}

      <nav className="pager">
        {prev ? (
          <Link href={lessonPath(prev.slug)}>
            <small>← Lesson {prev.number}</small>
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link className="next" href={lessonPath(next.slug)}>
            <small>Lesson {next.number} →</small>
            {next.title}
          </Link>
        )}
      </nav>
    </main>
  );
}
