import type { Lesson } from "../types";

const JUDGE = "https://hamel.dev/blog/posts/llm-judge/";
const MTB = "https://arxiv.org/abs/2306.05685";
const KAPPA = "https://en.wikipedia.org/wiki/Cohen%27s_kappa";

export const lesson0047: Lesson = {
  slug: "0047-judges-and-choices",
  number: 47,
  track: "ai",
  title: "A judge model you can trust, and choosing yours on data",
  summary:
    "Code can't grade \"helpful\", so a bigger model does, but only once it agrees with you. Measure that with the right numbers, know the judge's biases, then pick the hint model on score and latency together.",
  minutes: 80,
  status: "ready",
  builds: "`judge-stats.mjs`: agreement, the confusion matrix, TPR and TNR, Cohen's kappa, nearest-rank percentiles, and the model choice",
  lab: { dir: "0047-judges-and-choices", writes: ["judge-stats.mjs"], check: "bash check.sh" },
  reference: "ai",
  warmup: [
    { lesson: "0046-evals", question: 1 },
    { lesson: "0044-your-own-model", question: 0 },
  ],
  words: ["LLM-as-a-judge", "rubric", "true negative rate", "Cohen's kappa", "position bias", "p95 latency"],
  answers: [
    { id: "codearena", label: "Section 5: your rubric, how you'll calibrate the judge, and your model table" },
    { id: "challenge", label: "Challenge: your judge's TPR, TNR and kappa on ten hand-graded hints (optional)" },
  ],
  quiz: [
    {
      prompt: "Why grade the judge's verdicts as pass or fail, not on a 1-to-5 scale?",
      options: [
        "Binary labels are the only output judge models can produce",
        "A scale costs more tokens, so evals get too expensive",
        "Binary forces a decision, and agreement gets easy to measure",
        "A 1-to-5 score can't fit inside the judge's JSON reply",
      ],
      correct: 2,
      why: `People read the middle of a scale differently, so scores drift and disagreements hide. A yes/no question forces the decision that matters, and makes agreement with a human easy to measure ([Hamel Husain: creating an LLM-as-a-judge](${JUDGE})).`,
    },
    {
      prompt: "5% of hints are bad; a judge passes everything. What's its agreement?",
      options: [
        "95 percent",
        "5 percent",
        "50 percent",
        "0 percent",
      ],
      correct: 0,
      why: "It agrees on every good hint: 95%. It catches none of the bad ones: a true negative rate of 0, and a kappa of 0. Agreement alone rewards a lazy judge, which is why you look at TNR and kappa.",
    },
    {
      prompt: "What does Cohen's kappa add to plain agreement?",
      options: [
        "It weights each disagreement by how far apart scores are",
        "It removes the agreement you would expect from chance alone",
        "It averages the agreement of several judge models at once",
        "It turns agreement into a percentage between 0 and 100",
      ],
      correct: 1,
      why: `κ = (po − pe) / (1 − pe): observed agreement minus the agreement chance would give, scaled. With imbalanced labels, chance agreement is high, so a high raw agreement can mean very little ([Cohen's kappa](${KAPPA})).`,
    },
    {
      prompt: "Shown two hints, the judge prefers the first one. What do you do?",
      options: [
        "Grade both orders and keep only the verdicts that agree",
        "Always show the hint you prefer in the first position",
        "Raise the judge's temperature so that it chooses more randomly",
        "Drop the judge, since a biased model is never usable",
      ],
      correct: 0,
      why: `That's position bias, one of the biases measured in the MT-Bench study, with verbosity and self-enhancement ([Zheng et al., 2023](${MTB})). Swapping the order and keeping only consistent verdicts cancels it.`,
    },
    {
      prompt: "Model A scores 0.86 at a p95 of 30 s; B scores 0.85 at 6 s. Which do you ship?",
      options: [
        "A, because the higher score always wins, whatever it may cost",
        "B, because a fast answer matters more than a correct one",
        "A, because p95 doesn't matter in a background job at all",
        "B, since the scores are within noise and it's 5× faster",
      ],
      correct: 3,
      why: "With 20 cases, one point is inside the noise. Within a tolerance you set in advance, the faster model wins: its p95 decides how long users wait and how many hints a CPU can serve. Write the rule down before you run the comparison.",
    },
  ],
};
