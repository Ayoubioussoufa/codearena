/**
 * The glossary: the course's canonical words, each in the learner's own
 * one-sentence definition.
 */
import Link from "next/link";
import { GLOSSARY } from "@/lib/courses/glossary";
import { LESSONS, getLesson, lessonPath } from "@/lib/courses/catalog";
import { GlossaryDrafts } from "@/components/courses/OwnWords";

export const metadata = { title: "Glossary" };

export default function GlossaryPage() {
  return (
    <main className="course-main">
      <nav className="crumbs">
        <Link href="/courses">Courses</Link>
        <span>›</span>
        <span>Glossary</span>
      </nav>
      <p className="kicker">Reference · glossary</p>
      <h1>Glossary</h1>
      <p className="lede">
        The words this course uses for how CodeArena works, from the kernel up to the browser. Every
        lesson sticks to them.
      </p>
      <p className="aside">
        A term joins this page only when you can define it yourself. Each lesson ends by asking for
        your definitions; the right ones land here, in your words. Building the glossary is part of
        learning, not a dictionary to read.
      </p>

      {GLOSSARY.map((group) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          {group.terms.length === 0 ? (
            <p className="empty">Empty for now: send your definitions from the lessons, and they appear here.</p>
          ) : (
            <dl className="terms">
              {group.terms.map((t) => {
                const lesson = getLesson(t.lesson);
                return (
                  <div key={t.term}>
                    <dt>{t.term}</dt>
                    <dd>
                      {t.definition}
                      {lesson && (
                        <>
                          {" "}
                          <Link href={lessonPath(lesson.slug)} className="sans" style={{ fontSize: "0.8rem" }}>
                            (lesson {lesson.number})
                          </Link>
                        </>
                      )}
                    </dd>
                    {t.avoid && t.avoid.length > 0 && <dd className="avoid">Avoid: {t.avoid.join(", ")}</dd>}
                  </div>
                );
              })}
            </dl>
          )}
        </section>
      ))}

      <GlossaryDrafts
        lessons={LESSONS.filter((l) => l.status === "ready" && l.words).map((l) => ({
          slug: l.slug,
          number: l.number,
          words: l.words ?? [],
        }))}
      />
    </main>
  );
}
