/**
 * Checks for ../../docs/phase-4-recommendation-engine.md.
 * Checked 3 Nov 2026: the 85% rule (Wilson et al., 2019, PMC6831579); cosine and DCG numbers re-derived.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const phase4Checks: GuideCheckSet = {
  name: "Phase 4 guide",
  source: {
    label: "Wilson et al., \"The Eighty Five Percent Rule for optimal learning\" (2019)",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6831579",
    note: "The research behind the difficulty-fit feature, open access: read the abstract and discussion, including the authors' own caveats about humans. It's the \"why\" under Part C.",
  },
  terms: [
    "Candidate generation",
    "Feature",
    "Pointwise ranker",
    "MMR",
    "Cosine similarity",
    "Cold start",
    "Multi-armed bandit",
    "UCB1",
    "Cache stampede",
    "NDCG",
  ],
  checks: [
    {
      id: "objective",
      section: "Parts A–B · The objective and the funnel",
      questions: [
        {
          prompt: "Why can't CodeArena's recommender simply maximize clicks?",
          options: [
            "Clicks arrive too slowly to count for every user",
            "Clicks reward easy problems, not the ones that teach",
            "Clicking a problem doesn't prove it was ever opened",
            "The database can't store one click event per user",
          ],
          correct: 1,
          why: "Optimize for the right outcome. Clicks reward easy dopamine problems you already know; learning needs problems at the edge of your ability. Every design choice has to serve \"did it help them learn\".",
        },
        {
          prompt: "Why does a recommender use a funnel instead of scoring every item?",
          options: [
            "Scoring every item would give the very same order",
            "The database can never return more than 200 rows",
            "Users only ever scroll through the first ten items",
            "Cheap filters first, so costly scoring runs on few",
          ],
          correct: 3,
          why: "Candidate generation (an indexed query: unsolved, active, plausible difficulty) turns 100,000 items into about 200; features and scoring run on those; re-ranking picks the top K. It's the difference between 20 ms and 5 s.",
        },
      ],
      explain: "Describe the three stages of the recommendation funnel for CodeArena, and what each one keeps or drops.",
    },
    {
      id: "features",
      section: "Part C · Features and the score",
      questions: [
        {
          prompt: "What shape does the difficulty-fit feature have?",
          options: [
            "A bump that peaks at a target P(solve)",
            "A line that rises as the difficulty grows",
            "A line that falls as problems get harder",
            "A flat value that ignores the user's skill",
          ],
          correct: 0,
          why: "Too easy teaches nothing; too hard bounces you off. A Gaussian bump centred on the target `P(solve)` scores highest at the right difficulty and low at both extremes. The guide starts at 0.7; one study suggests about 85%, so keep the peak tunable.",
        },
        {
          prompt: "Why start with a pointwise weighted sum rather than a learned ranker?",
          options: [
            "It's more accurate than any learned model there is",
            "It ranks items in pairs, handling ties much better",
            "It's readable and debuggable, and it needs no labels",
            "It runs on GPUs, scoring every item much faster",
          ],
          correct: 2,
          why: "You can read off why each item ranked where it did, debug a bad recommendation, and tune it without labelled data. Pairwise and listwise models (RankNet, LambdaMART) win accuracy only once you have lots of interaction data.",
        },
      ],
      explain: "Write the score as a weighted sum of five features, and explain how the \"Why this?\" line falls out of it.",
    },
    {
      id: "diversity",
      section: "Parts D–E · Diversity and collaborative filtering",
      questions: [
        {
          prompt: "In MMR, what happens as λ moves toward 0?",
          options: [
            "Relevance dominates, and diversity fades away",
            "The list repeats its highest-scoring item",
            "Diversity dominates, and relevance fades away",
            "The ranking becomes random per request",
          ],
          correct: 2,
          why: "`MMR = λ × relevance − (1 − λ) × maxSimilarity`. λ = 1 is pure relevance; λ = 0 ignores quality and only spreads out. Around 0.7 is mostly on target with enough variety; too low feels random.",
        },
        {
          prompt: "Why compare users with cosine similarity instead of plain distance?",
          options: [
            "It compares direction, so raw skill level is ignored",
            "It's faster to compute on very large user vectors",
            "It handles users with no data better than others",
            "It weights the strongest tags more than the rest",
          ],
          correct: 0,
          why: "Cosine measures the angle between mastery vectors: strong and weak in the same places. A beginner and an expert with the same relative strengths count as similar even though the expert's numbers are bigger.",
        },
      ],
      explain: "Explain user cold start and item cold start, and the fallback the guide gives for each.",
    },
    {
      id: "bandits",
      section: "Part F · Explore versus exploit",
      questions: [
        {
          prompt: "What goes wrong with a recommender that only ever exploits?",
          options: [
            "Every user gets a completely different set of problems",
            "The recommendations change at random on each page load",
            "Problems are shown in alphabetical order instead of rank",
            "A few popular problems dominate; new ones never surface",
          ],
          correct: 3,
          why: "It suggests what it already rates highly; those get solved and look even better; a self-fulfilling loop. A new problem with no data would never be shown, so you must spend some slots exploring.",
        },
        {
          prompt: "In UCB1, when is an item's exploration bonus largest?",
          options: [
            "When it has the highest estimated value yet",
            "When it has been shown very few times",
            "When it was the most recently added item",
            "When the user has just solved a problem",
          ],
          correct: 1,
          why: "The bonus is `C × sqrt(ln(total) / plays(item))`: rarely shown items get the benefit of the doubt. If one turns out mediocre, its estimate falls and the bonus fades; if it's good, it earns its place.",
        },
      ],
      explain: "Explain \"optimism under uncertainty\" with UCB1, and when you'd consider Thompson sampling instead.",
    },
    {
      id: "measuring",
      section: "Parts G–H · Caching and measuring",
      questions: [
        {
          prompt: "Recommendations are cached for 60 seconds. A user submits a solution and asks again 30 seconds later. What should happen?",
          options: [
            "The new submission deletes their cached list right away",
            "They see the cached list until it finally expires",
            "The TTL doubles, because the user is currently active",
            "The cache serves every user's lists all at once",
          ],
          correct: 0,
          why: "The submission may have changed their mastery, so the cached list is stale now. Delete `recs:{userId}` on submission rather than waiting out the TTL; TTL alone guarantees staleness inside its window.",
        },
        {
          prompt: "NDCG@5 is 0.60 this week and 0.65 last week. What do you conclude?",
          options: [
            "The ranker regressed, so roll it back today",
            "The ranker improved, since lower NDCG is better",
            "Nothing yet: on few users, it's probably noise",
            "The test set changed, so the metric's meaningless",
          ],
          correct: 2,
          why: "A 0.05 move on a small sample tells you nothing without error bars, the same lesson as Phase 3. NDCG rewards relevant items near the top (each gain divided by log₂ of rank + 1); 1.0 is a perfect order.",
        },
      ],
      explain: "Explain offline evaluation: how you replay history to compare two rankers with NDCG@5 before any user sees them.",
    },
  ],
};
