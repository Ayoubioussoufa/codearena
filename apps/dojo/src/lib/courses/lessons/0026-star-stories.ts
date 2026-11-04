import type { Lesson } from "../types";

const AMAZON = "https://www.amazon.jobs/en/landing_pages/in-person-interview";

export const lesson0026: Lesson = {
  slug: "0026-star-stories",
  number: 26,
  track: "story",
  title: "Telling the story",
  summary:
    "Six STAR stories about what you built, each 90 seconds out loud: the structure interviewers listen for, why the Action carries the weight, and how to practise until a story is boring to you.",
  minutes: 90,
  status: "ready",
  builds: "`stories.md`: six stories that pass an interviewer's rubric, timed for 90 seconds each",
  lab: { dir: "0026-star-stories", writes: ["stories.md"], check: "bash check.sh" },
  reference: "story",
  warmup: [
    { lesson: "0014-idempotency", question: 0 },
    { lesson: "0016-reading-plans", question: 1 },
  ],
  words: ["STAR", "behavioural interview", "ownership (\"I\", not \"we\")", "a measurable result", "a follow-up question", "the trade-off behind a decision"],
  answers: [
    { id: "codearena", label: "Section 5: your six stories in one line each" },
    { id: "challenge", label: "Challenge: the follow-ups (optional)" },
  ],
  quiz: [
    {
      prompt: "In a 90-second STAR answer, which part should take the most time?",
      options: [
        "The Situation: the more context you give, the better they follow",
        "The Result: the numbers are what the interviewer writes down first",
        "All four parts equally, so the answer sounds balanced and calm",
        "The Action: exactly what you did, step by step, and why",
      ],
      correct: 3,
      why: `The Action is the evidence of how you work. Amazon's interview guide describes it as \"what did you specifically do to move things forward?\" ([Amazon: interview loop](${AMAZON})). Set the scene in a few sentences; spend the time on your decisions.`,
    },
    {
      prompt: "Why say \"I\" rather than \"we\" in the Action?",
      options: [
        "We sounds arrogant to them, while I sounds more modest",
        "They're hiring you, so they need to know your part",
        "Interviewers count your pronouns and give each one a score",
        "Team projects never count in any technical interview at all",
      ],
      correct: 1,
      why: "\"We migrated the database\" leaves the interviewer guessing whether you led it or watched it. Credit the team where it's due, then say precisely what *you* did. A follow-up will ask anyway.",
    },
    {
      prompt: "What makes a Result convincing?",
      options: [
        "A number, and what changed for the people because of it",
        "A long list of every technology the project ended up using",
        "Praise from a teacher or a manager, quoted word for word",
        "A promise to improve the project further, once there is time",
      ],
      correct: 0,
      why: "\"From 8 seconds to 300 milliseconds, and the complaints stopped\" is checkable and memorable. CodeArena gives you real numbers: buffers before and after, 26 lost increments down to 0, six attacks contained.",
    },
    {
      prompt: "Why end each story with what you learned?",
      options: [
        "It fills the time whenever the story turned out too short",
        "It lets you admit fault before the interviewer finds it out",
        "It shows that you would do it better the second time",
        "It proves that the story is true, since nobody invents lessons",
      ],
      correct: 2,
      why: "Interviewers are hiring for the next problem, not the last one. A lesson that changed how you work (\"now I measure before I optimise\") shows you improve from experience, especially in the failure story.",
    },
    {
      prompt: "The interviewer asks: \"Why BullMQ, and not Kafka?\" What prepares you best for questions like that?",
      options: [
        "Memorise every sentence, so that nothing can surprise you",
        "Know the trade-off behind each decision in the story",
        "Keep each story vague, so details can't be questioned",
        "Prepare twenty stories, so you can switch to another",
      ],
      correct: 1,
      why: "Follow-ups dig into decisions: why this, what else you considered, what you'd change. Your ADRs are exactly that preparation. A memorised story breaks at the first question; one you understand bends.",
    },
  ],
};
