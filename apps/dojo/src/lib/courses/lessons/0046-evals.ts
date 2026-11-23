import type { Lesson } from "../types";

const HAMEL = "https://hamel.dev/blog/posts/evals/";
const ANT = "https://docs.claude.com/en/docs/test-and-evaluate/develop-tests";

export const lesson0046: Lesson = {
  slug: "0046-evals",
  number: 46,
  track: "ai",
  title: "Evals: a number for \"is the hint good?\"",
  summary:
    "Why an AI feature without evals is a demo, how to build a small test set with rules written in code, why each case runs several times, and how CI turns the score into a gate.",
  minutes: 80,
  status: "ready",
  builds: "`graders.mjs`: five hard rules, a per-case grade, a summary with per-rule rates and flaky cases, and the gate CI calls",
  lab: { dir: "0046-evals", writes: ["graders.mjs"], check: "bash check.sh" },
  reference: "ai",
  warmup: [
    { lesson: "0045-prompts-and-injection", question: 2 },
    { lesson: "0043-what-a-model-does", question: 1 },
  ],
  words: ["eval", "test set", "code-based grader", "pass rate", "flaky case", "regression gate"],
  answers: [
    { id: "codearena", label: "Section 5: your first 20 cases, your rules, and your threshold" },
    { id: "challenge", label: "Challenge: your baseline score on a real model (optional)" },
  ],
  quiz: [
    {
      prompt: "What makes evals more than a set of unit tests?",
      options: [
        "They run only on the GPU, never in continuous integration",
        "They need no expected results, since a model grades itself",
        "They test code paths that a type checker cannot reach",
        "Output varies, so they measure a rate, not one result",
      ],
      correct: 3,
      why: `A unit test checks one deterministic answer. A model's answer varies between runs and between versions, so an eval runs many cases, several times, and reports how often each rule holds ([Hamel Husain: your AI product needs evals](${HAMEL})).`,
    },
    {
      prompt: "Which rule is best checked with code, not with a judge model?",
      options: [
        "Whether the hint would help a beginner find the bug",
        "Whether the hint copies a line of the reference code",
        "Whether the tone of the hint is kind and encouraging",
        "Whether the hint explains the idea at the right level",
      ],
      correct: 1,
      why: `Use code wherever the question has an exact answer: it's fast, free and never wrong. Comparing lines (whitespace removed) answers \"did it leak?\" exactly. Keep judge models for questions without one ([Anthropic: develop tests](${ANT})).`,
    },
    {
      prompt: "20 cases each run 3 times; 51 runs pass every rule. What's the score?",
      options: ["51%", "85%", "60%", "75%"],
      correct: 1,
      why: "Count runs, not cases: 51 / (20 × 3) = 0.85. Running each case several times turns \"it passed once\" into a rate, and shows which cases flip between pass and fail.",
    },
    {
      prompt: "A case passes in some runs and fails in others. What does it tell you?",
      options: [
        "The case is broken and should be deleted from the set",
        "The grader has a bug, since code always gives one answer",
        "The prompt is near an edge: look at the failing runs",
        "The model is overloaded, so the CI job needs a retry",
      ],
      correct: 2,
      why: "A flaky case is the most useful line in the report: the model gets it right sometimes, so a clearer rule, a better example or more context may tip it. Read the failing outputs before changing anything.",
    },
    {
      prompt: "Your eval set is 20 cases you wrote. What's the main trap later on?",
      options: [
        "Tuning the prompt until it passes those 20, nothing more",
        "Running the eval too often, which wears out the model",
        "Writing all the cases before you had written the prompt",
        "Keeping the cases in the same repository as the code",
      ],
      correct: 0,
      why: `Twenty cases are a start, not the truth. Keep adding real failures from production (lesson 44's logs, users' reports) so the set reflects what really goes wrong, and look at outputs, not only at the score ([Hamel Husain](${HAMEL})).`,
    },
  ],
};
