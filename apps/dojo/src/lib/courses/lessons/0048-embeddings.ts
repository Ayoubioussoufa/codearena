import type { Lesson } from "../types";

const VB = "https://vickiboykis.com/what_are_embeddings/";
const PGV = "https://github.com/pgvector/pgvector";

export const lesson0048: Lesson = {
  slug: "0048-embeddings",
  number: 48,
  track: "ai",
  title: "Embeddings: meaning as a direction in space",
  summary:
    "An embedding model turns text into a vector so that similar meanings point the same way. Compare them with cosine, search them exactly by hand, then see why pgvector's HNSW index trades a little recall for a lot of speed.",
  minutes: 75,
  status: "ready",
  builds: "`vectors.mjs`: dot, norm, normalize, cosine, L2, and exact top-k search over 10,000 vectors",
  lab: { dir: "0048-embeddings", writes: ["vectors.mjs"], check: "bash check.sh" },
  reference: "ai",
  warmup: [
    { lesson: "0015-how-an-index-works", question: 0 },
    { lesson: "0043-what-a-model-does", question: 0 },
  ],
  words: ["embedding", "cosine similarity", "vector dimension", "exact search", "approximate nearest neighbour (ANN)", "HNSW"],
  answers: [
    { id: "codearena", label: "Section 5: your embedding model, its dimension, your distance, and your index" },
    { id: "challenge", label: "Challenge: three sentences, their real embeddings, and which pairs came out close (optional)" },
  ],
  quiz: [
    {
      prompt: "What property makes embeddings useful for search?",
      options: [
        "Texts with similar meanings get vectors pointing the same way",
        "Each word becomes one number, in the text's own order",
        "The vector stores the original text, so it reads back",
        "Longer texts always give longer vectors, with many more numbers",
      ],
      correct: 0,
      why: `An embedding model is trained so that texts with related meanings land close together in its vector space ([Vicki Boykis: What are embeddings](${VB})). \"Too slow on big inputs\" and \"time limit exceeded\" share no words, yet their vectors are close.`,
    },
    {
      prompt: "Why compare text embeddings with cosine rather than the L2 distance?",
      options: [
        "Cosine is the only distance pgvector is able to index",
        "Cosine ignores how long each vector is, and keeps direction",
        "The L2 distance can't handle the negative numbers in embeddings",
        "Cosine needs fewer dimensions than L2 to give a result",
      ],
      correct: 1,
      why: `Direction carries the meaning; length mostly doesn't. Cosine compares directions only. pgvector indexes L2 (<->), inner product (<#>), cosine (<=>) and more ([pgvector](${PGV})); for normalised vectors, cosine and inner product rank identically.`,
    },
    {
      prompt: "You embed the notes with model A and the queries with model B. What happens?",
      options: [
        "Search gets slower, but the results stay exactly the same",
        "pgvector converts one space into the other on its own",
        "The distances mean nothing: the two spaces don't line up",
        "Results improve, since two models see more than one does",
      ],
      correct: 2,
      why: "Each model invents its own space; coordinate 17 in one has nothing to do with coordinate 17 in the other. If the dimensions happen to match, nothing errors: you just get random neighbours. That's why the lab makes mismatched lengths throw, and why the model name belongs next to every vector.",
    },
    {
      prompt: "What does an HNSW index trade away for speed?",
      options: [
        "Exactness: it may miss a few true nearest neighbours",
        "Disk space: it stores every vector three separate times",
        "Freshness: new rows stay invisible until a nightly rebuild",
        "Precision: it rounds every vector down to whole numbers",
      ],
      correct: 0,
      why: `Exact search reads every vector. HNSW (a graph of layered shortcuts) visits a small part of it and finds most, not all, of the true neighbours: approximate nearest-neighbour search. pgvector: HNSW has a better speed-recall trade-off than IVFFlat, at the cost of slower builds and more memory ([pgvector](${PGV})).`,
    },
    {
      prompt: "pgvector can index a `vector` column of up to how many dimensions?",
      options: [
        "4,096 dimensions",
        "2,000 dimensions",
        "16,000 dimensions",
        "1,024 dimensions",
      ],
      correct: 1,
      why: `The README: indexes support \`vector\` up to 2,000 dimensions, \`halfvec\` up to 4,000 ([pgvector](${PGV})). Most small embedding models produce a few hundred to about a thousand, so check yours before you create the column.`,
    },
  ],
};
