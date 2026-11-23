import type { Lesson } from "../types";

const HF_GEN = "https://huggingface.co/blog/how-to-generate";

export const lesson0043: Lesson = {
  slug: "0043-what-a-model-does",
  number: 43,
  track: "ai",
  title: "What a language model actually does",
  summary:
    "A model scores every possible next token; softmax turns the scores into probabilities, and a decoding rule picks one. Everything else, including RAG, is about what you put in front of that loop.",
  minutes: 75,
  status: "ready",
  builds: "`sampler.mjs`: softmax with a temperature, greedy, top-k, top-p and sampling, the loop Ollama runs between two words",
  lab: { dir: "0043-what-a-model-does", writes: ["sampler.mjs"], check: "bash check.sh" },
  reference: "ai",
  warmup: [
    { lesson: "0013-queue-from-scratch", question: 0 },
    { lesson: "0018-leaderboard", question: 4 },
  ],
  words: ["token", "logit", "softmax", "temperature", "top-p (nucleus) sampling", "context window"],
  answers: [
    { id: "codearena", label: "Section 5: the temperature for CodeArena's hints, and why the same prompt can still give two hints" },
    { id: "challenge", label: "Challenge: what you saw at temperature 0 and at 1.5 (optional)" },
  ],
  quiz: [
    {
      prompt: "What does a language model compute at each step of generation?",
      options: [
        "A full sentence, which a tokenizer then cuts into pieces",
        "A score for each vocabulary token, for the next position",
        "The one likeliest next word, picked inside the network itself",
        "A search through its training data for the closest sentence",
      ],
      correct: 1,
      why: `One forward pass gives one score (a logit) per token of the vocabulary. Turning those into one chosen token is the decoding step, outside the network, which is why you can change it with options like temperature ([Hugging Face: how to generate](${HF_GEN})).`,
    },
    {
      prompt: "You lower the temperature from 1 to 0.2. What happens to the distribution?",
      options: [
        "Sharper: the likeliest tokens take an even larger share",
        "Flatter: every token moves closer to the same odds",
        "Unchanged: temperature only changes how long the answer is",
        "Reversed: the least likely tokens become the likeliest ones",
      ],
      correct: 0,
      why: `Dividing the logits by a small number widens the gaps between them before softmax, so the favourite's share grows. As temperature goes to 0, sampling becomes greedy decoding ([Hugging Face](${HF_GEN})).`,
    },
    {
      prompt: "What does top-p = 0.9 keep at each step?",
      options: [
        "The top 90 tokens, whatever their own probabilities are",
        "Every token whose own probability is at least 0.9",
        "The smallest set of likeliest tokens summing to 0.9",
        "The first 90% of the vocabulary, in alphabetical order",
      ],
      correct: 2,
      why: `Nucleus sampling keeps the smallest set of tokens whose cumulative probability reaches p, so the set is small when the model is confident and large when it isn't ([Hugging Face](${HF_GEN})). Top-k keeps a fixed number instead.`,
    },
    {
      prompt: "Why must CodeArena send the problem and the code with every hint request?",
      options: [
        "The model caches the last request, but only an hour",
        "Each request is independent: it sees only what you send",
        "Ollama refuses any prompt that is shorter than a page",
        "Otherwise it would answer about a problem it saw before",
      ],
      correct: 1,
      why: "A model call has no memory between requests: everything it can use is in the context you send, up to its context window. Chat apps resend the whole conversation each turn. That's also why RAG works: you put the knowledge in the prompt.",
    },
    {
      prompt: "Your softmax returns NaN for logits like [1000, 998]. What's the fix?",
      options: [
        "Divide every logit by 1000, then exponentiate each one",
        "Round the logits to whole numbers before calling exp",
        "Apply top-k first, so only small logits reach exp",
        "Subtract the largest logit from all of them first",
      ],
      correct: 3,
      why: "e^1000 overflows to Infinity, and Infinity / Infinity is NaN. Subtracting the maximum first gives the same probabilities (the factor cancels out) with exponents at most 0. Dividing by 1000 would change the distribution: that's a temperature.",
    },
  ],
};
