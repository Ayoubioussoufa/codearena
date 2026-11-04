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
      day("Sun 15 Nov", "2026-11-15", [], { note: "A full day off. The middle of a sprint is where people crash." }),
    ],
  },
  {
    number: 4,
    title: "Ship it",
    start: "2026-11-16",
    end: "2026-11-22",
    goal: "A stranger signs up at your domain over HTTPS, submits code, and watches it judged live.",
    doneWhen: [
      "The verdict appears live in the browser",
      "CodeArena runs on its own VM, over HTTPS, at a real domain",
      "Merging to main deploys; you rolled back once on purpose",
      "Logs, /health, Sentry and a nightly backup work",
      "At least 5 real users have submitted code",
    ],
    days: [
      day("Mon 16 Nov", "2026-11-16", ["0019-nextjs-rendering"], {
        build: "The problem page and the submit form",
        systemDesign: [sd("Worked design #4: news feed", "worked-design-4--a-news-feed--timeline-the-classic-hard-one")],
        dsa: "Block 09 · Linked Lists & Recursion: course, then Days 1–2",
      }),
      day("Tue 17 Nov", "2026-11-17", ["0020-verdict-live"], {
        build: "Submit → the verdict appears live",
        systemDesign: [sd("Worked design #5: chat", "worked-design-5--a-chat--messaging-system")],
        dsa: "Block 09 · Day 3",
      }),
      day("Wed 18 Nov", "2026-11-18", ["0021-server-from-zero", "0022-compose-in-production"], {
        build: "A VM, a firewall, Docker, the production Compose file",
        systemDesign: [sd("Worked design #6: notifications", "worked-design-6--a-notification-system")],
        dsa: "Block 10 · Trees: course, then Days 1–2",
      }),
      day("Thu 19 Nov", "2026-11-19", ["0023-https"], {
        build: "Domain and HTTPS with Caddy, migrations deployed, real problems seeded",
        systemDesign: [sd("Worked design #7: typeahead", "worked-design-7--search-autocomplete-typeahead")],
        dsa: "Block 10 · Day 3",
      }),
      day("Fri 20 Nov", "2026-11-20", ["0024-ci-cd", "0025-observability"], {
        build: "Deploy on merge, logs, /health, Sentry, nightly backup",
        systemDesign: [sd("Worked design #8: web crawler", "worked-design-8--a-web-crawler")],
        dsa: "Block 11 · Graphs: course, then Days 1–2",
      }),
      day("Sat 21 Nov", "2026-11-21", [], {
        build: "Real users in: 10–20 classmates, fix what they break · CV · first applications",
        systemDesign: [sd("Your system at 100× traffic", "worked-design-2--a-code-submission-judge-your-codearena-story")],
        dsa: "Block 11 · Day 3",
      }),
      day("Sun 22 Nov", "2026-11-22", [], {
        build: "Checkpoint · ADR: one VM, the sandbox's blast radius",
        dsa: "A contest, then CP checkpoint 4",
      }),
    ],
  },
  {
    number: 5,
    title: "Sharpen",
    start: "2026-11-23",
    end: "2026-11-29",
    goal: "No new material: you can tell every part of CodeArena as a story, run a design out loud, and pass a mock.",
    doneWhen: [
      "Six STAR stories, each 90 seconds out loud",
      "CodeArena from a blank page in ten minutes, without notes",
      "A full 45-minute mock design",
    ],
    days: [
      day("Mon 23 Nov", "2026-11-23", ["0026-star-stories"], {
        build: "Fixes from users · STAR stories 1–3",
        systemDesign: [{ label: "CS: processes, threads, deadlock", href: `${CS}#1-processes-and-threads` }],
        dsa: "Block 12 · Heaps & Intervals: course, then Days 1–2",
      }),
      day("Tue 24 Nov", "2026-11-24", [], {
        build: "Polish what an interviewer will click · STAR stories 4–6",
        systemDesign: [{ label: "CS: networking", href: `${CS}#3-networking` }],
        dsa: "Block 12 · Day 3",
      }),
      day("Wed 25 Nov", "2026-11-25", ["0027-your-system-out-loud"], {
        build: "Polish",
        systemDesign: [{ label: "Your weakest design, cold", href: SD }],
        dsa: "Block 13 · Dynamic Programming, day 1 of 4",
      }),
      day("Thu 26 Nov", "2026-11-26", [], {
        build: "Polish",
        systemDesign: [sd("Design #1 again, cold, 40-minute timer", "worked-design-1--a-url-shortener-the-canonical-opener")],
        dsa: "Block 13 · DP, day 2 of 4",
      }),
      day("Fri 27 Nov", "2026-11-27", [], {
        build: "Feature freeze",
        systemDesign: [sd("Mastery checklist + self-quiz", "mastery-checklist--you-can")],
        dsa: "Block 13 · DP, day 3 of 4",
      }),
      day("Sat 28 Nov", "2026-11-28", [], {
        build: "Stories out loud, timed",
        systemDesign: [sd("A full 45-minute mock design", "how-to-run-the-40-minute-interview")],
        dsa: "Block 13 · DP, day 4 of 4 (set R13)",
      }),
      day("Sun 29 Nov", "2026-11-29", [], { build: "Sprint retro: what's next", dsa: "Final review" }),
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
