import type { Lesson } from "../types";

export const lesson0040: Lesson = {
  slug: "0040-bpe-tokenizer",
  number: 40,
  track: "rust",
  title: "A BPE tokenizer: the first step of every LLM",
  summary: "Train and run byte-pair encoding in Rust, the algorithm under GPT-style tokenizers.",
  minutes: 90,
  status: "ready",
  builds: "A byte-level BPE tokenizer in Rust: training, encoding and decoding, reproducing the textbook example",
  lab: { dir: "0040-bpe-tokenizer", writes: ["src/lib.rs"], check: "bash check.sh" },
  reference: "rust-python",
  warmup: [
    { lesson: "0035-iterators-and-maps", question: 1 },
    { lesson: "0034-lifetimes", question: 1 },
  ],
  words: ["token", "vocabulary", "merge rule", "byte-level BPE", "compression ratio", "subword"],
  answers: [
    { id: "count", label: "Section 4: count your own name's tokens, and explain the number" },
    { id: "challenge", label: "Challenge: a faster trainer that doesn't recount everything (optional)" },
  ],
  quiz: [
    {
      prompt: "Why do language models read subword tokens rather than whole words or single characters?",
      options: [
        "Words would need a vocabulary that never ends",
        "Characters can't be turned into numbers at all",
        "Subwords keep sequences short, yet cover any text",
        "Subwords are what training data stores on disk",
      ],
      correct: 2,
      why: "A word vocabulary can't cover every name, typo and new word; characters cover everything but make sequences long. Subword tokens sit between: common words become one token, rare ones split into pieces, and with byte-level BPE nothing is ever out of vocabulary.",
    },
    {
      prompt: "During BPE training, which pair becomes the next merge?",
      options: [
        "The most frequent adjacent pair in the current tokens",
        "The pair whose two tokens are the longest strings",
        "The leftmost pair in the text that's still unmerged",
        "The pair whose bytes come first in ASCII order",
      ],
      correct: 0,
      why: "Count every adjacent pair of the current tokens, merge the most frequent into a new token, and repeat. Each merge shortens the sequence the most it can at that step. Ties need a rule, and the lab uses the smallest pair, so training is deterministic.",
    },
    {
      prompt: "GPT-2 runs BPE on bytes, not characters. What does that buy?",
      options: [
        "It makes every single token exactly one byte long",
        "256 base tokens cover all text: nothing is unknown",
        "It makes training independent of the corpus it reads",
        "It removes the need to decode tokens later on",
      ],
      correct: 1,
      why: "Any text, in any language, emoji included, is a sequence of bytes, and the 256 byte values are the base vocabulary. So encoding never fails and there's no \"unknown\" token; merges then build common byte sequences up into longer tokens (Radford et al., 2019).",
    },
    {
      prompt: "How does `encode` apply the merges to new text?",
      options: [
        "The longest token first, matched greedily left to right",
        "In any random order, since the result never changes",
        "The new text's most frequent pair first, like training",
        "In the order they were learned, earliest merge first",
      ],
      correct: 3,
      why: "The merges are rules with a rank: the order training learned them. Encoding repeatedly finds the lowest-ranked pair present and merges it, which reproduces how the training text was built. Counting frequencies in the new text would give different tokens for the same word.",
    },
    {
      prompt: "Why is a tokenizer a good part of an AI stack to write in Rust?",
      options: [
        "Models can only read tokens produced by Rust code",
        "It runs over every input, as byte-level CPU work",
        "Python can't hold integers that are larger than 255",
        "GPUs need Rust code to load tokens into memory",
      ],
      correct: 1,
      why: "Every training document and every request goes through the tokenizer, and the work is tight loops over bytes and pairs: what interpreted Python is slowest at and compiled Rust is good at. That's why Hugging Face's tokenizers library is a Rust core with Python bindings. The model itself runs on GPUs either way.",
    },
  ],
};
