import type { Lesson } from "../types";

const RAG = "https://arxiv.org/abs/2005.11401";
const CR = "https://www.anthropic.com/news/contextual-retrieval";
const LIM = "https://arxiv.org/abs/2307.03172";

export const lesson0049: Lesson = {
  slug: "0049-rag",
  number: 49,
  track: "ai",
  title: "RAG, end to end: retrieve, augment, generate, measure",
  summary:
    "Retrieval-augmented generation puts the right part of your knowledge into the prompt at question time. Build the plain-code half (chunking, idempotent ingestion, recall@k, MRR, the context block) and learn to measure retrieval before blaming the model.",
  minutes: 90,
  status: "ready",
  builds: "`rag.mjs`: heading-aware chunks, a SHA-256 ingestion plan that re-embeds nothing twice, recall@k and MRR, and a context block that's never cut",
  lab: { dir: "0049-rag", writes: ["rag.mjs"], check: "bash check.sh" },
  reference: "ai",
  warmup: [
    { lesson: "0048-embeddings", question: 2 },
    { lesson: "0014-idempotency", question: 0 },
  ],
  words: ["retrieval-augmented generation (RAG)", "chunk", "ingestion", "recall@k", "mean reciprocal rank (MRR)", "grounding"],
  answers: [
    { id: "codearena", label: "Section 5: what you'll index, how you'll chunk it, and your 15 labelled queries" },
    { id: "challenge", label: "Challenge: recall@4 on your real notes, before and after one chunking change (optional)" },
  ],
  quiz: [
    {
      prompt: "What problem does RAG solve that a bigger model doesn't?",
      options: [
        "The model writes too slowly to answer any user in time",
        "Your own notes and new problems were never in its training",
        "Its answers come out in the wrong language for the user",
        "It runs out of memory on prompts over a hundred words",
      ],
      correct: 1,
      why: `A model knows its training data, frozen at a date, and nothing about your notes or yesterday's problems. RAG retrieves relevant passages at question time and puts them in the prompt, combining the model's own knowledge with an external store ([Lewis et al., 2020](${RAG})).`,
    },
    {
      prompt: "Why repeat a section's heading at the top of each of its chunks?",
      options: [
        "So that every chunk is long enough for the embedding model",
        "Because pgvector will reject any chunk that has no title line",
        "So a chunk keeps its context when retrieved on its own",
        "So the model can sort the chunks back into reading order",
      ],
      correct: 2,
      why: `A chunk like \"Using <= compares an element with itself\" means little alone; with \"## Two pointers > Off by one\" above it, both the embedding and the model know what it's about. Anthropic's contextual retrieval pushes the same idea further, prepending 50–100 tokens of context per chunk ([contextual retrieval](${CR})).`,
    },
    {
      prompt: "Why hash each chunk's text before embedding it?",
      options: [
        "So a re-run embeds only the chunks whose text changed",
        "Because embedding models accept a hash, never the raw text",
        "So two users can never see each other's private notes",
        "Because hashing the text first makes the vectors more accurate",
      ],
      correct: 0,
      why: "Ingestion must be idempotent (lesson 14 again): running it twice should re-embed nothing. Compare each chunk's hash with the stored one: insert the new ones, update the changed ones, remove the deleted ones, leave the rest.",
    },
    {
      prompt: "recall@4 is 0.95, yet hints still ignore the right note. Where's the bug?",
      options: [
        "In retrieval: the right chunk is missing from the top 4",
        "In the embedding model, which needs swapping for a larger one",
        "In the chunking, which cuts each note in the wrong places",
        "In generation: the prompt or the model isn't using the context",
      ],
      correct: 3,
      why: `Retrieval found the chunk 95% of the time, so it reached the prompt. Look at where it sits and what the rules say: models use the start and end of a long context better than the middle ([Lost in the middle](${LIM})). Measure the R before blaming the G, and vice versa.`,
    },
    {
      prompt: "Your whole notes folder is 30,000 tokens. Do you need RAG?",
      options: [
        "Yes: models never read more than a page at one time",
        "Not yet: under about 200k tokens, the whole set can fit",
        "Yes: without embeddings, a model can't read any of your notes",
        "No: RAG only pays off for data kept in SQL databases",
      ],
      correct: 1,
      why: `Anthropic's own guidance: if the knowledge base is under about 200,000 tokens, you can put all of it in the prompt (with prompt caching to keep it cheap) ([contextual retrieval](${CR})). On a small local model with a small context, retrieval is still how you fit; know both answers.`,
    },
  ],
};
