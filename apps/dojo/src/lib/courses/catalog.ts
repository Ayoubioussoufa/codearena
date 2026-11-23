/**
 * The course map: every lesson (written or planned), the tracks, and the
 * weeks of the sprint with a day-by-day plan. Lesson prose lives in
 * content/courses/lessons/<slug>.html and is loaded server-side.
 */
import type { DayPlan, Lesson, SdLink, Track, TrackId, Week } from "./types";
import { lesson0001 } from "./lessons/0001-run-a-program";
import { lesson0002 } from "./lessons/0002-time-limits";
import { lesson0003 } from "./lessons/0003-input-output";
import { lesson0004 } from "./lessons/0004-runner-in-node";
import { lesson0005 } from "./lessons/0005-namespaces";
import { lesson0006 } from "./lessons/0006-cgroups";
import { lesson0007 } from "./lessons/0007-root-capabilities-seccomp";
import { lesson0008 } from "./lessons/0008-docker-hardened";
import { lesson0009 } from "./lessons/0009-facts-to-verdicts";
import { lesson0010 } from "./lessons/0010-attack-your-sandbox";
import { lesson0011 } from "./lessons/0011-di-from-scratch";
import { lesson0012 } from "./lessons/0012-request-pipeline";
import { lesson0013 } from "./lessons/0013-queue-from-scratch";
import { lesson0014 } from "./lessons/0014-idempotency";
import { lesson0015 } from "./lessons/0015-how-an-index-works";
import { lesson0016 } from "./lessons/0016-reading-plans";
import { lesson0017 } from "./lessons/0017-transactions-isolation";
import { lesson0018 } from "./lessons/0018-leaderboard";
import { lesson0019 } from "./lessons/0019-nextjs-rendering";
import { lesson0020 } from "./lessons/0020-verdict-live";
import { lesson0021 } from "./lessons/0021-server-from-zero";
import { lesson0022 } from "./lessons/0022-compose-in-production";
import { lesson0023 } from "./lessons/0023-https";
import { lesson0024 } from "./lessons/0024-ci-cd";
import { lesson0025 } from "./lessons/0025-observability";
import { lesson0026 } from "./lessons/0026-star-stories";
import { lesson0027 } from "./lessons/0027-your-system-out-loud";
import { lesson0028 } from "./lessons/0028-cargo-and-the-compiler";
import { lesson0029 } from "./lessons/0029-ownership";
import { lesson0030 } from "./lessons/0030-borrowing";
import { lesson0031 } from "./lessons/0031-enums-and-match";
import { lesson0032 } from "./lessons/0032-errors-as-values";
import { lesson0033 } from "./lessons/0033-traits-and-generics";
import { lesson0034 } from "./lessons/0034-lifetimes";
import { lesson0035 } from "./lessons/0035-iterators-and-maps";
import { lesson0036 } from "./lessons/0036-processes-in-rust";
import { lesson0037 } from "./lessons/0037-files-and-io";
import { lesson0038 } from "./lessons/0038-threads";
import { lesson0039 } from "./lessons/0039-async-tokio";
import { lesson0040 } from "./lessons/0040-bpe-tokenizer";
import { lesson0041 } from "./lessons/0041-pyo3-extension";
import { lesson0042 } from "./lessons/0042-parallel-and-shipped";

export const TRACKS: Track[] = [
  {
    id: "sandbox",
    title: "The sandbox",
    blurb: "From fork and exec to a hardened container: how a judge runs a stranger's code safely.",
  },
  {
    id: "backend",
    title: "The backend",
    blurb: "NestJS rebuilt from its ideas: dependency injection, the request pipeline, queues, idempotency.",
  },
  {
    id: "data",
    title: "Data",
    blurb: "How Postgres finds a row, reads a plan and isolates transactions; Redis for the leaderboard.",
  },
  {
    id: "web",
    title: "The web",
    blurb: "Next.js from first principles: where a page renders, where its data comes from, and live updates.",
  },
  {
    id: "ship",
    title: "Shipping",
    blurb: "One server, HTTPS, CI/CD and observability: CodeArena live at a real URL.",
  },
  {
    id: "story",
    title: "The story",
    blurb: "Turning what you built into interview answers.",
  },
  {
    id: "rust",
    title: "Rust, after the sprint",
    blurb: "The language that ends the memory bugs you fought in C, then the judge rebuilt in it, then the reason Python's AI tools are written in it.",
    opens: "2026-12-07",
  },
];

export const LESSONS: Lesson[] = [
  // ── The sandbox ──
  lesson0001,
  lesson0002,
  lesson0003,
  lesson0004,
  lesson0005,
  lesson0006,
  lesson0007,
  lesson0008,
  lesson0009,
  lesson0010,
  // ── The backend ──
  lesson0011,
  lesson0012,
  lesson0013,
  lesson0014,
  // ── Data ──
  lesson0015,
  lesson0016,
  lesson0017,
  lesson0018,
  // ── The web ──
  lesson0019,
  lesson0020,
  // ── Shipping ──
  lesson0021,
  lesson0022,
  lesson0023,
  lesson0024,
  lesson0025,
  // ── The story ──
  lesson0026,
  lesson0027,
  // ── Rust, after the sprint (opens 7 Dec) ──
  lesson0028,
  lesson0029,
  lesson0030,
  lesson0031,
  lesson0032,
  lesson0033,
  lesson0034,
  lesson0035,
  lesson0036,
  lesson0037,
  lesson0038,
  lesson0039,
  lesson0040,
  lesson0041,
  lesson0042,
];

const SD = "/guides/system-design-fundamentals";
const sd = (label: string, anchor: string): SdLink => ({ label, href: `${SD}#${anchor}` });
const CS = "/guides/cs-fundamentals";

function day(
  label: string,
  date: string,
  lessons: string[],
  rest: Omit<DayPlan, "label" | "date" | "lessons"> = {},
): DayPlan {
  return { label, date, lessons, ...rest };
}

export const WEEKS: Week[] = [
  {
    number: 2,
    title: "The judge",
    start: "2026-11-02",
    end: "2026-11-08",
    goal: "A stranger's code runs in a sandbox you built and can explain layer by layer, down to the kernel.",
    note: "This week starts from first principles, so the queue (POST /submissions → BullMQ) and idempotency moved to the start of week 3, as lessons 13 and 14. At Sunday's checkpoint, decide whether week 3's SQL work shrinks or slides.",
    doneWhen: [
      "`run` (C) and the Node runner pass their checkers: exit, signal, timeout, output cap",
      "You built a container by hand and contained a fork bomb with a cgroup",
      "CodeArena's worker runs JavaScript in a hardened container, with a wall-clock kill and no leftover containers",
      "The judge turns facts into AC / WA / TLE / MLE / RE, with tests written first",
      "`test/adversarial/`: six attacks, all contained, all reported cleanly",
      "From a blank page: what a namespace hides, what a cgroup limits, what seccomp filters, and why `--network none` matters",
      "ADR-007, the trust boundary, written",
    ],
    days: [
      day("Mon 2 Nov", "2026-11-02", ["0001-run-a-program"], {
        systemDesign: [sd("Asynchronous work & message queues", "asynchronous-work--message-queues")],
        dsa: "Block 03 · Two Pointers: course, then Days 1–2",
      }),
      day("Tue 3 Nov", "2026-11-03", ["0002-time-limits", "0003-input-output"], {
        systemDesign: [sd("Task queues & back pressure", "task-queues--back-pressure")],
        dsa: "Block 03 · Day 3, the boss, the classics",
      }),
      day("Wed 4 Nov", "2026-11-04", ["0004-runner-in-node", "0005-namespaces"], {
        systemDesign: [
          sd("TCP vs UDP", "tcp-vs-udp-the-transport-choice"),
          sd("RPC vs REST", "rpc-vs-rest-how-services-call-each-other"),
          sd("HTTP verbs and idempotency", "http-verbs--and-why-idempotency-decides-retries"),
        ],
        dsa: "Block 04 · Sliding Window: course, then Days 1–2",
      }),
      day("Thu 5 Nov", "2026-11-05", ["0006-cgroups", "0007-root-capabilities-seccomp"], {
        systemDesign: [
          sd("Rate limiting", "rate-limiting"),
          sd("Availability patterns", "availability-patterns-how-you-actually-stay-up"),
        ],
        dsa: "Block 04 · Day 3, timed",
      }),
      day("Fri 6 Nov", "2026-11-06", ["0008-docker-hardened"], {
        build: "DockerCodeRunner replaces the fake runner (JavaScript), with the I-17 fix",
        systemDesign: [sd("Scaling the database", "scaling-the-database")],
        dsa: "Block 05 · Prefix Sums: course, then Days 1–2",
      }),
      day("Sat 7 Nov", "2026-11-07", ["0009-facts-to-verdicts", "0010-attack-your-sandbox"], {
        build: "The judge loop and checker, then test/adversarial/",
        systemDesign: [sd("Worked design #2: the judge, out loud", "worked-design-2--a-code-submission-judge-your-codearena-story")],
        dsa: "Block 05 · Day 3 and the boss",
      }),
      day("Sun 8 Nov", "2026-11-08", [], {
        build: "Checkpoint: every box below, honestly. ADR-007, the trust boundary",
        systemDesign: [sd("Your own system, out loud", "worked-design-2--a-code-submission-judge-your-codearena-story")],
        dsa: "A Div. 3 virtual contest, then set R02",
        note: "No new material. Retro, then send `start week of 9 Nov`.",
      }),
    ],
  },
  {
    number: 3,
    title: "The queue, the data and the leaderboard",
    start: "2026-11-09",
    end: "2026-11-15",
    goal: "A submission goes through a queue exactly as reliably as you can prove, six queries are measurably faster, and the leaderboard is live.",
    doneWhen: [
      "`POST /submissions` answers 202, and the verdict is stored by the worker",
      "A test proves that delivering the same job twice judges once",
      "`docs/perf/`: six queries with plans and timings, before and after",
      "You reproduced a non-repeatable read, a phantom and a serialization failure",
      "The leaderboard is a sorted set the judge updates on every Accepted",
    ],
    days: [
      day("Mon 9 Nov", "2026-11-09", ["0011-di-from-scratch"], {
        systemDesign: [sd("Database replication", "database-replication-master-slave-vs-master-master")],
        dsa: "Block 06 · Stacks: course, then Days 1–2",
      }),
      day("Tue 10 Nov", "2026-11-10", ["0012-request-pipeline", "0013-queue-from-scratch"], {
        build: "POST /submissions → BullMQ → worker → verdict stored",
        systemDesign: [sd("Federation, denormalization, SQL tuning", "federation-denormalization-and-sql-tuning")],
        dsa: "Block 06 · Day 3 and the boss",
      }),
      day("Wed 11 Nov", "2026-11-11", ["0014-idempotency"], {
        build: "Retries, the dead-letter queue, the idempotency test",
        systemDesign: [sd("NoSQL: the four flavours", "nosql-the-four-flavors-and-when-to-pick-each")],
        dsa: "Block 07 · Binary Search: course, then Days 1–2",
      }),
      day("Thu 12 Nov", "2026-11-12", ["0015-how-an-index-works", "0016-reading-plans"], {
        build: "Seed 1M submissions, then the six queries",
        systemDesign: [
          sd("Consistency & CAP", "consistency--the-cap-theorem"),
          sd("Consistency patterns", "consistency-patterns-weak--eventual--strong"),
        ],
        dsa: "Block 07 · Day 3 and the boss",
      }),
      day("Fri 13 Nov", "2026-11-13", ["0017-transactions-isolation"], {
        build: "The submission write path at the right isolation level",
        systemDesign: [sd("CDNs & consistent hashing", "cdns--consistent-hashing")],
        dsa: "Block 08 · Sorting & Greedy: course, then Days 1–2",
      }),
      day("Sat 14 Nov", "2026-11-14", ["0018-leaderboard"], {
        build: "The leaderboard, live · checkpoint · ADR: six queries, six plans",
        systemDesign: [sd("Worked design #9: the leaderboard", "worked-design-9--a-leaderboard-your-codearena-story")],
        dsa: "Block 08 · Day 3, then CP checkpoint 3",
      }),
      day("Sun 15 Nov", "2026-11-15", [], { build: "Week 3 in two days, day 2: a million rows, six plans, the leaderboard", note: "Replanned on 14 Nov: the week runs on Sat and Sun, from the guide \"Week 3 in two days\". Take Monday evening off instead." }),
    ],
  },
  {
    number: 4,
    title: "Ship it, and tell it",
    start: "2026-11-23",
    end: "2026-11-29",
    goal: "A stranger signs up at your domain over HTTPS and watches their code judged live, and you can tell how every part of it works in ten minutes, without notes.",
    note: "Replanned on 23 Nov: the old week 4 (ship it) and week 5 (sharpen) are one week now, so each day ships one piece and practises telling one. 16–22 Nov went to catching up on week 3 and making the repo public. The AI week follows, and Rust starts a week later, on 7 Dec.",
    doneWhen: [
      "The verdict appears live in the browser",
      "CodeArena runs on its own VM, over HTTPS, at a real domain",
      "Merging to main deploys; you rolled back once on purpose",
      "Logs, /health, Sentry, and a nightly backup you've restored once",
      "At least 5 real users have submitted code",
      "Six STAR stories, each 90 seconds out loud",
      "CodeArena from a blank page in ten minutes, without notes",
    ],
    days: [
      day("Mon 23 Nov", "2026-11-23", ["0019-nextjs-rendering", "0020-verdict-live"], {
        build: "Submit from the browser, and the verdict appears live",
        systemDesign: [sd("Worked design #4: news feed", "worked-design-4--a-news-feed--timeline-the-classic-hard-one")],
        dsa: "Block 09 · Linked Lists & Recursion: course, then Days 1–2",
      }),
      day("Tue 24 Nov", "2026-11-24", ["0021-server-from-zero", "0022-compose-in-production"], {
        build: "I-2, the Dockerfiles, a VM with a firewall, the production Compose file",
        systemDesign: [sd("Worked design #6: notifications", "worked-design-6--a-notification-system")],
        dsa: "Block 09 · Day 3",
      }),
      day("Wed 25 Nov", "2026-11-25", ["0023-https", "0026-star-stories"], {
        build: "A domain and HTTPS with Caddy, real problems seeded · STAR stories 1–3",
        systemDesign: [sd("Worked design #7: typeahead", "worked-design-7--search-autocomplete-typeahead")],
        dsa: "Block 10 · Trees: course, then Days 1–2",
      }),
      day("Thu 26 Nov", "2026-11-26", ["0024-ci-cd"], {
        build: "Deploy on merge, one rollback on purpose · STAR stories 4–6",
        systemDesign: [sd("Worked design #8: web crawler", "worked-design-8--a-web-crawler")],
        dsa: "Block 10 · Day 3",
      }),
      day("Fri 27 Nov", "2026-11-27", ["0025-observability"], {
        build: "Logs, /health, Sentry, a nightly backup · the README gets its live link",
        systemDesign: [{ label: "CS: networking", href: `${CS}#3-networking` }],
        dsa: "Block 11 · Graphs: course, then Days 1–2",
      }),
      day("Sat 28 Nov", "2026-11-28", ["0027-your-system-out-loud"], {
        build: "Real users in, and fix what they break · your system out loud, recorded",
        systemDesign: [sd("Your system at 100× traffic", "worked-design-2--a-code-submission-judge-your-codearena-story")],
        dsa: "Block 11 · Day 3",
      }),
      day("Sun 29 Nov", "2026-11-29", [], {
        build: "Checkpoint · ADR: one VM, the sandbox's blast radius · six stories, timed",
        dsa: "A contest, then CP checkpoint 4",
        note: "No new material. Retro on the sprint so far, then send `start week of 30 Nov`.",
      }),
    ],
  },
  {
    number: 5,
    title: "The AI hint",
    start: "2026-11-30",
    end: "2026-12-06",
    goal: "A failed submission gets a hint from a model you host yourself, grounded in your own notes, and evals prove how good the hints are and what retrieval added.",
    note: "No lessons are written for this week yet: each day links to the primary docs instead. The model runs on Ollama, on your laptop's GPU and on the VM's CPU, so a hint takes seconds to tens of seconds. That's why it goes through the queue, like judging.",
    doneWhen: [
      "`POST /submissions/:id/hint` answers 202; the worker stores a hint; `GET` returns it",
      "The model's output is JSON checked by zod, and a daily cap stops abuse",
      "20 eval cases with hard rules run in CI and fail the build below your threshold",
      "Two or three models compared on score and speed, and the choice written down",
      "Your notes chunked, embedded and searched in pgvector, with recall@4 measured",
      "The hint eval with and without retrieval: the difference, in numbers",
      "ADR: a self-hosted model behind the queue",
    ],
    days: [
      day("Mon 30 Nov", "2026-11-30", [], {
        build: "Ollama running, the HintGenerator port, the hint job through the queue",
        systemDesign: [sd("Task queues & back pressure", "task-queues--back-pressure")],
        dsa: "Block 12 · Heaps & Intervals: course, then Days 1–2",
      }),
      day("Tue 1 Dec", "2026-12-01", [], {
        build: "The prompt, JSON checked by zod, the Hint table, a daily cap",
        systemDesign: [sd("Rate limiting", "rate-limiting")],
        dsa: "Block 12 · Day 3",
      }),
      day("Wed 2 Dec", "2026-12-02", [], {
        build: "Evals I: 20 cases, hard rules, a baseline score, the CI job",
        systemDesign: [sd("Back-of-envelope estimation", "back-of-envelope-estimation")],
        dsa: "Block 13 · Dynamic Programming, day 1 of 4",
      }),
      day("Thu 3 Dec", "2026-12-03", [], {
        build: "Evals II: a judge model on your GPU, two or three models compared",
        systemDesign: [sd("Latency numbers every programmer should know", "latency-numbers-every-programmer-should-know")],
        dsa: "Block 13 · DP, day 2 of 4",
      }),
      day("Fri 4 Dec", "2026-12-04", [], {
        build: "RAG I: pgvector, the ingestion script, the retrieval eval",
        systemDesign: [sd("Worked design #7: typeahead, a search system", "worked-design-7--search-autocomplete-typeahead")],
        dsa: "Block 13 · DP, day 3 of 4",
      }),
      day("Sat 5 Dec", "2026-12-05", [], {
        build: "RAG II: retrieval in the hint job, the eval with and without it",
        systemDesign: [sd("Caching: a stored hint is a cache", "caching")],
        dsa: "Block 13 · DP, day 4 of 4 (set R13)",
      }),
      day("Sun 6 Dec", "2026-12-06", [], {
        build: "Checkpoint · ADR: a self-hosted model behind the queue · the README's AI section",
        systemDesign: [sd("A full 45-minute mock design", "how-to-run-the-40-minute-interview")],
        dsa: "Final review",
        note: "No new material. Retro on the whole sprint: what worked, what didn't, what's next.",
      }),
    ],
  },
  // ── Rust, after the sprint: three lessons a week, lighter than the sprint, so applications and interviews come first ──
  {
    number: 6,
    title: "Rust: ownership",
    start: "2026-12-07",
    end: "2026-12-13",
    goal: "You can say who owns every value in a function, and fix a borrow error by reading it rather than by adding clone().",
    note: "After the sprint. Applications and interviews come first: on an interview day, slide the lesson to the next free one.",
    doneWhen: [
      "Rust installed; `cargo test` runs; lesson 1's wait-status decoder ported and green",
      "Five ownership errors fixed without a single clone()",
      "The judge's output comparator, in Rust, returning slices instead of copies",
    ],
    days: [
      day("Mon 7 Dec", "2026-12-07", ["0028-cargo-and-the-compiler"]),
      day("Wed 9 Dec", "2026-12-09", ["0029-ownership"]),
      day("Fri 11 Dec", "2026-12-11", ["0030-borrowing"]),
      day("Sun 13 Dec", "2026-12-13", [], { note: "Review: clear what's due in spaced review, then read The Book's chapter 4 again, start to end." }),
    ],
  },
  {
    number: 7,
    title: "Rust: types that carry meaning",
    start: "2026-12-14",
    end: "2026-12-20",
    goal: "Verdicts, errors and checkers are types the compiler checks, so the case you forget is a compile error, not a bug report.",
    doneWhen: [
      "Lesson 9's facts-to-verdict logic as an enum and one exhaustive match",
      "A limits parser whose errors name the line, with ? and no unwrap()",
      "A Checker trait with three implementations, used both through generics and through dyn",
    ],
    days: [
      day("Mon 14 Dec", "2026-12-14", ["0031-enums-and-match"]),
      day("Wed 16 Dec", "2026-12-16", ["0032-errors-as-values"]),
      day("Fri 18 Dec", "2026-12-18", ["0033-traits-and-generics"]),
      day("Sun 20 Dec", "2026-12-20", [], { note: "Review, then one Codeforces Div. 3 virtual contest in Rust if you want to feel the language under time pressure." }),
    ],
  },
  {
    number: 8,
    title: "Rust: zero copies, then processes",
    start: "2026-12-21",
    end: "2026-12-27",
    goal: "You read lifetimes as promises, write iterator chains fluently, and `run` exists in Rust with lesson 2's behaviour.",
    doneWhen: [
      "A token scanner that borrows from its input and allocates nothing",
      "Contest standings from raw submissions with iterators and the entry API",
      "`run -t` in Rust: exit, signal and timeout, with the whole process group killed",
    ],
    days: [
      day("Mon 21 Dec", "2026-12-21", ["0034-lifetimes"]),
      day("Wed 23 Dec", "2026-12-23", ["0035-iterators-and-maps"]),
      day("Fri 25 Dec", "2026-12-25", ["0036-processes-in-rust"]),
      day("Sun 27 Dec", "2026-12-27", [], { note: "Review. Compare your run.c and your Rust run side by side: which bugs could each one still have?" }),
    ],
  },
  {
    number: 9,
    title: "Rust: systems",
    start: "2026-12-28",
    end: "2027-01-03",
    goal: "A judge in one binary that walks a tests folder, runs cases in parallel, and an async runner that holds hundreds of jobs on a few threads.",
    doneWhen: [
      "`minijudge` prints a verdict per test, with output capped",
      "Parallel judging with scoped threads: same results as sequential, in a fraction of the time",
      "An async runner with a concurrency limit and per-job timeouts, tested on a paused clock",
    ],
    days: [
      day("Mon 28 Dec", "2026-12-28", ["0037-files-and-io"]),
      day("Wed 30 Dec", "2026-12-30", ["0038-threads"]),
      day("Fri 1 Jan", "2027-01-01", ["0039-async-tokio"]),
      day("Sun 3 Jan", "2027-01-03", [], { note: "Review, and rest." }),
    ],
  },
  {
    number: 10,
    title: "Rust for AI infrastructure",
    start: "2027-01-04",
    end: "2027-01-10",
    goal: "A BPE tokenizer written in Rust, imported from Python, measured against pure Python, and explained in two minutes.",
    doneWhen: [
      "BPE training and encoding in Rust, matching the kit's expected merges",
      "`import fasttok` works in a virtualenv, with the GIL released during encoding",
      "Batch encoding in parallel with rayon; clippy and fmt clean; your Rust story told out loud",
    ],
    days: [
      day("Mon 4 Jan", "2027-01-04", ["0040-bpe-tokenizer"]),
      day("Wed 6 Jan", "2027-01-06", ["0041-pyo3-extension"]),
      day("Sat 9 Jan", "2027-01-09", ["0042-parallel-and-shipped"]),
      day("Sun 10 Jan", "2027-01-10", [], { note: "Retro: what Rust changed in how you write C, TypeScript and Python." }),
    ],
  },
];

/* ── lookups ── */

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getTrack(id: TrackId): Track {
  return TRACKS.find((t) => t.id === id) as Track;
}

export function getWeek(number: number): Week | undefined {
  return WEEKS.find((w) => w.number === number);
}

/** The week a lesson is scheduled in, if any. */
export function weekOfLesson(slug: string): Week | undefined {
  return WEEKS.find((w) => w.days.some((d) => d.lessons.includes(slug)));
}

export function lessonNeighbours(slug: string): { prev?: Lesson; next?: Lesson } {
  const i = LESSONS.findIndex((l) => l.slug === slug);
  const out: { prev?: Lesson; next?: Lesson } = {};
  const prev = i > 0 ? LESSONS[i - 1] : undefined;
  const next = i >= 0 ? LESSONS[i + 1] : undefined;
  if (prev) out.prev = prev;
  if (next) out.next = next;
  return out;
}

/** Spaced-review id of a lesson's quiz question. */
export function questionId(slug: string, index: number): string {
  return `course-${slug}-q${index + 1}`;
}

/** The URL of a lesson page. */
export function lessonPath(slug: string): string {
  return `/courses/lessons/${slug}`;
}
