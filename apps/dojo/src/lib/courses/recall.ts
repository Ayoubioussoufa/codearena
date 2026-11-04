/**
 * Lesson quizzes as a spaced-review topic. Each question becomes a generator
 * (options reshuffled per attempt), and so does every in-lesson drill
 * generator. The topic is NOT in the practice topic
 * list or the mixed pool: a question only enters review once you've answered
 * it inside its lesson, which is what schedules it.
 */
import type { Generator, Topic } from "../engine/types";
import { choice } from "../engine/helpers";
import { LESSONS, lessonPath, questionId } from "./catalog";
import { DRILL_GENERATORS } from "./drills";
import { allGuideCheckSets, guideQuestionId } from "../guide-checks";

export const COURSE_RECALL_ID = "course-recall" as const;

export const courseRecallTopic: Topic = {
  id: COURSE_RECALL_ID,
  title: "Course recall",
  icon: "🎓",
  blurb: "Questions from the lessons you've taken, brought back right before you'd forget them.",
  docSlug: "",
  docTitle: "Courses",
  generators: [
    ...DRILL_GENERATORS,
    ...LESSONS.filter((l) => l.status === "ready").flatMap((lesson) =>
      lesson.quiz.map((q, index): Generator => ({
      id: questionId(lesson.slug, index),
      title: `Lesson ${lesson.number}, question ${index + 1}`,
      generate: (rng) =>
        choice(rng, {
          genId: questionId(lesson.slug, index),
          prompt: q.prompt,
          correct: q.options[q.correct] as string,
          wrong: q.options.filter((_, i) => i !== q.correct),
          explanation: q.why,
          docRef: {
            slug: "",
            label: `Lesson ${lesson.number}: ${lesson.title}`,
            href: lessonPath(lesson.slug),
          },
        }),
    })),
    ),
    // Guide checks: same treatment, linking back to the check in its guide.
    ...allGuideCheckSets().flatMap(([slug, set]) =>
      set.checks.flatMap((check) =>
        check.questions.map((q, n): Generator => ({
          id: guideQuestionId(slug, check.id, n),
          title: `${set.name} · ${check.section}, question ${n + 1}`,
          generate: (rng) =>
            choice(rng, {
              genId: guideQuestionId(slug, check.id, n),
              prompt: q.prompt,
              correct: q.options[q.correct] as string,
              wrong: q.options.filter((_, i) => i !== q.correct),
              explanation: q.why,
              docRef: {
                slug: "",
                label: `${set.name} · ${check.section}`,
                href: `/guides/${slug}#check-${check.id}`,
              },
            }),
        })),
      ),
    ),
  ],
};
