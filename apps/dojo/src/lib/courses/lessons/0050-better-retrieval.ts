import type { Lesson } from "../types";

const BM25 = "https://en.wikipedia.org/wiki/Okapi_BM25";
const RRF = "https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf";
const CR = "https://www.anthropic.com/news/contextual-retrieval";

export const lesson0050: Lesson = {
  slug: "0050-better-retrieval",
  number: 50,
  track: "ai",
  title: "Better retrieval: keywords, fusion, reranking",
  summary:
    "Vectors blur exact words like `10^5` or an error string; keywords miss synonyms. Score with BM25, fuse both rankings with Reciprocal Rank Fusion, and know what reranking and contextual retrieval add on top.",
  minutes: 80,
  status: "ready",
  builds: "`fuse.mjs`: a tokenizer, Okapi BM25 from the formula, Reciprocal Rank Fusion, and hybrid search over both",
  lab: { dir: "0050-better-retrieval", writes: ["fuse.mjs"], check: "bash check.sh" },
  reference: "ai",
  warmup: [
    { lesson: "0049-rag", question: 3 },
    { lesson: "0048-embeddings", question: 1 },
  ],
  words: ["BM25", "inverse document frequency (IDF)", "hybrid search", "Reciprocal Rank Fusion (RRF)", "reranker", "contextual retrieval"],
  answers: [
    { id: "codearena", label: "Section 5: the queries where keywords win, and your hybrid plan" },
    { id: "challenge", label: "Challenge: recall@4 with vectors, BM25 and hybrid on your notes (optional)" },
  ],
  quiz: [
    {
      prompt: "Why does BM25 give a rare word more weight than a common one?",
      options: [
        "Rare words are longer, so they carry more characters",
        "Rare words are typed less, so they're less noisy",
        "A rare word tells documents apart; \"the\" tells nothing",
        "Common words are removed before BM25 ever sees them",
      ],
      correct: 2,
      why: `That's the IDF term: ln((N − n + 0.5) / (n + 0.5) + 1), large when few documents contain the word. A match on \"memoization\" says far more than a match on \"loop\" ([Okapi BM25](${BM25})).`,
    },
    {
      prompt: "What do BM25's k1 and b control?",
      options: [
        "How fast repeats stop counting, and how length counts",
        "The number of results, and the minimum score returned",
        "The tokenizer's language, and the list of ignored words",
        "The number of documents read, and in which order",
      ],
      correct: 0,
      why: `k1 (often 1.2) makes repeated occurrences add less and less; b (often 0.75) scales a document's score by its length relative to the average, so long documents don't win by being long ([Okapi BM25](${BM25})).`,
    },
    {
      prompt: "Why fuse with ranks (RRF) rather than adding the two scores together?",
      options: [
        "Ranks are smaller numbers, so the sums can never overflow",
        "BM25 scores and cosines live on scales you can't compare",
        "Adding the scores is too slow when lists get long",
        "pgvector can only fuse lists with RRF, never with sums",
      ],
      correct: 1,
      why: `A BM25 score of 7 and a cosine of 0.82 aren't on the same scale, and calibrating them is fragile. RRF keeps only ranks: each document scores Σ 1/(k + rank), with k = 60 in the original paper ([Cormack et al., 2009](${RRF})).`,
    },
    {
      prompt: "What does a reranker do in a retrieval pipeline?",
      options: [
        "It rewrites the user's query into several shorter ones",
        "It stores each chunk again under a second model",
        "It splits long chunks into smaller pieces before search",
        "It rescores the top candidates, reading query and chunk",
      ],
      correct: 3,
      why: `Fast retrieval returns, say, the top 50; a reranker (a model that reads the query and each candidate together) rescores them, and you keep the best few. In Anthropic's tests, adding reranking took the drop in failed retrievals from 49% to 67% ([contextual retrieval](${CR})).`,
    },
    {
      prompt: "The query is the exact string `RangeError: Maximum call stack`. Which retriever wins?",
      options: [
        "Vector search, since it knows what the error means",
        "Neither, since error messages can't be indexed at all",
        "BM25, since it matches the exact rare tokens typed",
        "Neither alone, since only a reranker can find it",
      ],
      correct: 2,
      why: "Exact, rare tokens are where keyword search shines and embeddings blur: the vector for that error sits near every other error. That's why hybrid search is the usual default: each method covers the other's blind spot.",
    },
  ],
};
