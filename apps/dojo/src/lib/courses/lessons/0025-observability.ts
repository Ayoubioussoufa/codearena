import type { Lesson } from "../types";

const PROM = "https://prometheus.io/docs/practices/naming/";

export const lesson0025: Lesson = {
  slug: "0025-observability",
  number: 25,
  track: "ship",
  title: "Seeing production",
  summary:
    "Structured logs you can search, health checks that mean something, metrics Prometheus can scrape, and a nightly backup you've restored at least once.",
  minutes: 110,
  status: "ready",
  builds: "`observe.mjs` (JSON logs, request ids, /health, /ready, /metrics) and `backup.sh` + `restore-check.sh`, tested by a simulated disaster",
  lab: { dir: "0025-observability", writes: ["observe.mjs", "backup.sh", "restore-check.sh"], check: "bash check.sh" },
  reference: "ship",
  warmup: [
    { lesson: "0024-ci-cd", question: 4 },
    { lesson: "0012-request-pipeline", question: 4 },
  ],
  words: ["structured logging", "request id (correlation id)", "liveness and readiness", "metric cardinality", "histogram", "restore test"],
  answers: [
    { id: "codearena", label: "Section 6: what you'll log, count and alert on, and your backup plan" },
    { id: "challenge", label: "Challenge: off-site and encrypted (optional)" },
  ],
  quiz: [
    {
      prompt: "Why log one JSON object per line instead of readable text?",
      options: [
        "JSON lines are smaller on disk than the same plain text",
        "Docker refuses to rotate log files unless every line is JSON",
        "Plain text logs cannot hold any timestamp down to the millisecond",
        "Tools can filter and count by field, with no fragile parsing",
      ],
      correct: 3,
      why: "\"Every 500 for /submissions in the last hour, with their request ids\" is one query when each line has `status`, `path` and `requestId` fields. With free text, it's a regex that breaks the day someone rewords a message. Nest's ecosystem has `nestjs-pino` for exactly this.",
    },
    {
      prompt: "The database is down. What should `/health` and `/ready` say?",
      options: [
        "Alive but not ready: a restart won't fix the database",
        "Neither alive nor ready, so the container should be restarted",
        "Ready but not alive, since requests could still be answered",
        "Both still pass, as health checks never look at dependencies",
      ],
      correct: 0,
      why: "Liveness answers \"should this process be restarted?\"; readiness answers \"should it get traffic?\" ([Kubernetes: probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)). Failing liveness because of the database restarts every API container at once, which fixes nothing and makes recovery slower.",
    },
    {
      prompt: "Why label request metrics with the route template, `/submissions/:id`, not the raw path?",
      options: [
        "Prometheus is unable to store slashes or digits inside a label",
        "Each label value makes a series, and raw paths are unbounded",
        "Templates are shorter, so the metrics page loads a bit faster",
        "Raw paths would reveal which problems the users are looking at",
      ],
      correct: 1,
      why: `Every distinct combination of label values is a separate time series, held in memory. Prometheus's own guidance: never use labels for unbounded values like user ids ([naming and labels](${PROM})). One series per submission id, or per random path a scanner tries, takes the monitoring down first.`,
    },
    {
      prompt: "Why must a request log never contain the query string or the Authorization header?",
      options: [
        "Query strings are too long, and make every line wrap twice",
        "They carry tokens, and logs reach more people than the database",
        "Headers are compressed, so logging them would corrupt the JSON output",
        "Node removes them from the request object before the handler runs",
      ],
      correct: 1,
      why: "Logs get shipped to services, shared in tickets and kept for months; they're read by far more people than your database. OWASP's logging guidance lists access tokens and session identifiers among what must not be logged ([Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)).",
    },
    {
      prompt: "You run `pg_dump` every night. Why also run a restore check?",
      options: [
        "pg_dump refuses to write another dump until the last is restored",
        "Restoring compacts the database, so that the next dump runs faster",
        "Only a restore proves a backup works, before you need it",
        "The restore check keeps the live database warm in its memory",
      ],
      correct: 2,
      why: "A dump can be empty, truncated, in a format you can't restore, or missing the table you need, and you only find out when restoring. Restore into a scratch database, count something you know, and do it on a schedule, never against production.",
    },
  ],
};
