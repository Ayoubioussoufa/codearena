/**
 * Checks for ../../docs/phase-6-analytics-anticheat-observability.md.
 * Checked 3 Nov 2026: REFRESH MATERIALIZED VIEW CONCURRENTLY's unique-index requirement (postgresql.org); the SRE book's monitoring chapter, as verified for lesson 25.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const phase6Checks: GuideCheckSet = {
  name: "Phase 6 guide",
  source: {
    label: "Google SRE book: Monitoring Distributed Systems",
    href: "https://sre.google/sre-book/monitoring-distributed-systems/",
    note: "Symptoms versus causes, the four golden signals, and why alerts must be actionable: the thinking behind Parts C–E. Lesson 25 builds the logs, health checks and metrics in a lab.",
  },
  terms: [
    "Materialized view",
    "Tokenization",
    "k-gram",
    "Winnowing",
    "Jaccard similarity",
    "Observability",
    "Span",
    "Trace context",
    "Label cardinality",
    "Alert fatigue",
  ],
  checks: [
    {
      id: "analytics",
      section: "Part A · Materialized views",
      questions: [
        {
          prompt: "What's the difference between a view and a materialized view?",
          options: [
            "A view stores the result; a materialized one reruns its query",
            "A view reruns its query; a materialized one stores the result",
            "A view is read-only, but a materialized one accepts any writes",
            "A view lives in memory; a materialized one lives in Redis",
          ],
          correct: 1,
          why: "A view is a stored question, run fresh on every read. A materialized view is a stored answer: a real table, instant to read, as fresh as its last refresh. Fine for analytics; wrong for a live leaderboard.",
        },
        {
          prompt: "`REFRESH MATERIALIZED VIEW CONCURRENTLY` fails with an error. What's the usual cause?",
          options: [
            "The view was refreshed less than an hour ago",
            "A concurrent refresh can only run as a superuser",
            "The query behind it uses a GROUP BY clause",
            "The view has no unique index on plain columns",
          ],
          correct: 3,
          why: "Postgres needs a unique index (plain columns, no `WHERE`, covering all rows) to match old rows with new ones while readers keep reading. Create it once: `CREATE UNIQUE INDEX … ON submission_daily_counts (day)`.",
        },
      ],
      explain: "When do you use a materialized view, and when a continuously updated projection? Give one CodeArena example of each.",
    },
    {
      id: "winnowing",
      section: "Part B · Plagiarism detection",
      questions: [
        {
          prompt: "Why tokenize code with identifiers anonymized before comparing it?",
          options: [
            "Renamed variables then make no difference at all",
            "The code becomes shorter, and quicker to store",
            "Comments become easier to compare line by line",
            "The compiler can then confirm that it runs",
          ],
          correct: 0,
          why: "A copier renames variables and reformats. With every identifier turned into `VAR` and every number into `NUM` (ideally from the AST), both versions produce the same token stream, so cosmetic edits buy nothing.",
        },
        {
          prompt: "In winnowing, which hash is kept from each window?",
          options: [
            "The maximum, with ties going to the leftmost",
            "Every n-th hash, counting from the window start",
            "The minimum, with ties going to the rightmost",
            "The first hash, whatever its value might be",
          ],
          correct: 2,
          why: "The minimum depends on content, not position, so an insertion elsewhere doesn't change what a shared passage selects. A fixed tie-break keeps identical passages identical, and a selection is recorded only when its position changes.",
        },
        {
          prompt: "Two students from the same class get a Jaccard similarity of 0.9. What do you do?",
          options: [
            "Ban both accounts from the next contest",
            "Ignore it: classmates tend to write alike",
            "Queue the pair for human review, first",
            "Cut both their ratings by ten percent",
          ],
          correct: 2,
          why: "Never auto-punish on a flag: short solutions, shared coursework and boilerplate produce real false positives. A high score is evidence for a human reviewer, shown with the matching regions, not proof.",
        },
      ],
      explain: "Walk through the four steps of the plagiarism pipeline (tokens, k-grams, winnowing, Jaccard) and say what each one survives.",
    },
    {
      id: "observability",
      section: "Parts C–D · Logs, traces, propagation",
      questions: [
        {
          prompt: "Judge p95 latency jumps from 200 ms to 2 s. In what order do you use the three pillars?",
          options: [
            "Metric to detect, trace to locate, log to explain",
            "Log to detect, metric to locate, trace to explain",
            "Trace to detect, log to locate, metric to explain",
            "Metric to detect, log to locate, trace to explain",
          ],
          correct: 0,
          why: "The metric raises the alarm but can't say why; a trace of one slow submission shows which span ballooned; that worker's logs at that time give the reason. One pillar per question.",
        },
        {
          prompt: "Traces end at the queue: every worker span starts its own trace. What's missing?",
          options: [
            "A longer timeout on the tracing exporter",
            "A trace id inside the submission's row",
            "A sampling rate of one hundred percent",
            "Injecting the trace context into each job",
          ],
          correct: 3,
          why: "HTTP carries the trace context in headers automatically; a queue doesn't. Inject `traceparent` into the job's metadata on enqueue and extract it in the worker, or the picture breaks in two at the queue.",
        },
      ],
      explain: "Explain why `requestId` is \"the load-bearing field\" in structured logs, and how you carry it without passing it through every function.",
    },
    {
      id: "metrics",
      section: "Part E · Metrics and alerting",
      questions: [
        {
          prompt: "Why must `user_id` never be a Prometheus label?",
          options: [
            "Labels in Prometheus must contain only short words",
            "Each value creates a series, so memory explodes",
            "User ids are secret, and labels are public",
            "Sorting large labels makes every query too slow",
          ],
          correct: 1,
          why: "Every unique combination of label values is a separate stored time series. A handful of languages is fine; millions of users is a cardinality explosion. Put high-cardinality detail in logs and traces.",
        },
        {
          prompt: "Box A reports p95 = 100 ms and box B reports p95 = 300 ms. What's the fleet's p95?",
          options: [
            "You can't tell; you need the full histograms",
            "200 ms, the average of the two percentiles",
            "300 ms, since the worst box always decides",
            "400 ms, the sum of the two percentiles",
          ],
          correct: 0,
          why: "A percentile is a position in a distribution, and two summary numbers can't rebuild the combined distribution. Histogram bucket counts do add up across instances; `histogram_quantile(0.95, …)` computes the real p95 at query time.",
        },
        {
          prompt: "Why alert on user-visible latency rather than \"CPU above 80%\"?",
          options: [
            "CPU metrics are too expensive to collect every second",
            "Latency alerts can be fixed automatically by a restart",
            "High CPU may not matter, but latency always does",
            "Users can see CPU usage on their own dashboards",
          ],
          correct: 2,
          why: "High CPU can be a busy box doing useful work, and CPU can be low during a real outage. Alert on symptoms users feel; alerting on causes produces false alarms and alert fatigue, until the real alert is ignored too.",
        },
      ],
      explain: "Apply RED and USE to the judge: name the five numbers you'd track and the metric type (counter, gauge, histogram) of each.",
    },
  ],
};
