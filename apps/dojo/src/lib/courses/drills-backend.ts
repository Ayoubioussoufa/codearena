/**
 * Drills for the backend track, lessons 11 to 14.
 */
import type { Rng } from "../engine/rng";
import { choice, numeric } from "../engine/helpers";
import { type Drill, lessonRef, pickFrom } from "./drill-kit";

/* ── Lesson 11: dependency injection ── */

const L11 = lessonRef("0011-di-from-scratch", "Lesson 11: dependency injection");

/** Post-order DFS: what a container builds, in order, to resolve `root`. */
function buildOrder(graph: Record<string, string[]>, root: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const visit = (n: string) => {
    if (seen.has(n)) return;
    seen.add(n);
    for (const d of graph[n] ?? []) visit(d);
    out.push(n);
  };
  visit(root);
  return out;
}

const GRAPHS: Record<string, string[]>[] = [
  { SubmissionsService: ["SubmissionsRepository", "JudgeQueue"], SubmissionsRepository: ["PrismaService"], JudgeQueue: ["Config"], PrismaService: ["Config"], Config: [] },
  { JudgeService: ["CodeRunner", "Checker"], CodeRunner: ["Config"], Checker: [], Config: [] },
  { AuthService: ["UsersService", "PasswordHasher", "TokenService"], UsersService: ["PrismaService"], PasswordHasher: [], TokenService: ["Config"], PrismaService: ["Config"], Config: [] },
];

export const diDrill: Drill = {
  id: "di",
  title: "What does the container build, and how many?",
  blurb: "Build orders from real CodeArena dependency graphs, and instance counts by scope.",
  generators: [
    {
      id: "drill-di-order",
      title: "Build order",
      generate: (rng: Rng) => {
        const graph = rng.pick(GRAPHS);
        const root = Object.keys(graph)[0] as string;
        const order = buildOrder(graph, root);
        const show = (xs: string[]) => xs.join(" → ");
        const wrong = new Set<string>();
        wrong.add(show([...order].reverse()));
        for (let i = 0; wrong.size < 3 && i < 50; i++) {
          const s = show(rng.shuffle(order));
          if (s !== show(order)) wrong.add(s);
        }
        const deps = Object.entries(graph).filter(([, d]) => d.length).map(([k, d]) => `${k} needs ${d.join(" and ")}`).join("; ");
        return choice(rng, {
          genId: "drill-di-order",
          prompt: `${deps}. You resolve ${root}. In what order does a container construct them (dependencies listed left to right, each built once)?`,
          correct: show(order),
          wrong: [...wrong].slice(0, 3),
          explanation: `Depth-first, building on the way back up: a constructor needs its arguments, so every dependency exists before its consumer. Shared ones (like Config) are built once and reused. This is post-order DFS, the graph walk from your DSA practice.`,
          docRef: L11,
        });
      },
    },
    {
      id: "drill-di-count",
      title: "How many instances?",
      generate: (rng: Rng) => {
        const scope = rng.pick(["singleton", "transient"] as const);
        const consumers = rng.int(2, 4);
        const resolves = rng.int(2, 5);
        const answer = scope === "singleton" ? 1 : consumers;
        return numeric({
          genId: "drill-di-count",
          prompt: `${consumers} singleton services each inject PrismaService, whose scope is ${scope}. You resolve each service ${resolves} times. How many PrismaService instances exist?`,
          answer,
          explanation:
            scope === "singleton"
              ? "A singleton is built once and shared by everyone: 1, however many consumers or resolves."
              : `A transient provider gives each consumer its own instance when that consumer is built. The consumers are singletons, built once each, so ${consumers} instances, whatever the number of resolves. See [injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes).`,
          docRef: L11,
        });
      },
    },
  ],
};

/* ── Lesson 12: the request pipeline ── */

const L12 = lessonRef("0012-request-pipeline", "Lesson 12: the request pipeline");
const STAGES = { guard: "a guard", pipe: "a pipe", interceptor: "an interceptor", filter: "a filter", middleware: "a middleware" } as const;

const pipelineDrill: Drill = {
  id: "pipeline",
  title: "Which stage, and in what order?",
  blurb: "Put each CodeArena concern in the right stage of the pipeline, then order the stages.",
  generators: [
    {
      id: "drill-pipe-stage",
      title: "Which stage should do it?",
      generate: (rng: Rng) => {
        const jobs = [
          { j: "reject requests that carry no valid access token", k: "guard", why: "\"May this request go on?\" is a guard's question, and it runs before any work on the body." },
          { j: "allow this route to admins only", k: "guard", why: "Roles are access control: a guard, reading the user the auth guard attached." },
          { j: "turn the JSON body into a validated DTO, or answer 400", k: "pipe", why: "Pipes transform and validate the handler's arguments; Nest's `ValidationPipe` is one." },
          { j: "trim whitespace off the submitted code before the handler sees it", k: "pipe", why: "Reshaping an argument on its way in is a pipe's job." },
          { j: "measure how long each request takes, and log it", k: "interceptor", why: "Only an interceptor wraps the handler on both sides, so it can time it." },
          { j: "wrap every successful response in `{ data: … }`", k: "interceptor", why: "Interceptors see the handler's result on the way out and can map it." },
          { j: "turn a Prisma \"record not found\" error into a 404", k: "filter", why: "Turning an exception into a response is what exception filters are for." },
          { j: "make validation messages reach the client (I-3)", k: "filter", why: "The messages are lost where exceptions become responses: the filter." },
          { j: "parse cookies before anything else looks at the request", k: "middleware", why: "Middleware runs first, before Nest even picks a handler: the place for `cookie-parser`." },
        ] as const;
        const c = rng.pick(jobs);
        const others = rng.sample((Object.keys(STAGES) as (keyof typeof STAGES)[]).filter((k) => k !== c.k), 3);
        return choice(rng, {
          genId: "drill-pipe-stage",
          prompt: `In CodeArena's API, you need to ${c.j}. Which stage of the request pipeline should do it?`,
          correct: STAGES[c.k],
          wrong: others.map((k) => STAGES[k]),
          explanation: `${c.why} See the [request lifecycle](https://docs.nestjs.com/faq/request-lifecycle).`,
          docRef: L12,
        });
      },
    },
    {
      id: "drill-pipe-order",
      title: "Which runs first?",
      generate: (rng: Rng) => {
        const pairs = [
          { a: "the guard", b: "the pipe", first: "a", why: "Guards run before pipes: refuse first, then parse." },
          { a: "the middleware", b: "the guard", first: "a", why: "Middleware runs before any guard: it's the outermost layer." },
          { a: "the global guard", b: "the route guard", first: "a", why: "Inbound, everything goes global first, then controller, then route." },
          { a: "the route interceptor's after-code", b: "the global interceptor's after-code", first: "a", why: "Outbound, interceptors unwind in reverse: route first, global last." },
          { a: "the route filter", b: "the global filter", first: "a", why: "Filters resolve from the lowest level: route first, global last." },
          { a: "the pipe", b: "the handler", first: "a", why: "Pipes prepare the handler's arguments, so they always run before it." },
        ] as const;
        const p = rng.pick(pairs);
        const flip = rng.chance(0.5);
        const [x, y] = flip ? [p.b, p.a] : [p.a, p.b];
        const correctName = p.first === "a" ? p.a : p.b;
        return choice(rng, {
          genId: "drill-pipe-order",
          prompt: `For one request, which runs first: ${x}, or ${y}?`,
          correct: `First: ${correctName}`,
          wrong: [`First: ${correctName === p.a ? p.b : p.a}`],
          explanation: p.why,
          docRef: L12,
        });
      },
    },
  ],
};

/* ── Lesson 13: queues ── */

const L13 = lessonRef("0013-queue-from-scratch", "Lesson 13: a job queue from scratch");
const FATE = {
  lost: "It is lost for good",
  again: "It will run again later",
  done: "It is done, nothing more",
  dead: "It goes to dead letters",
} as const;

const queueDrill: Drill = {
  id: "queue",
  title: "What happens to the job?",
  blurb: "Crashes, acks and retries in a Redis queue: follow one job through each story.",
  generators: [
    {
      id: "drill-queue-fate",
      title: "The job's fate",
      generate: (rng: Rng) => {
        const stories = [
          { s: "The worker takes it with `RPOP`, starts judging, and crashes", k: "lost", why: "`RPOP` removed it from Redis; it only existed in the dead worker's memory." },
          { s: "The worker takes it with `LMOVE` into the processing list, then crashes; the next worker to start runs `recover()`", k: "again", why: "It was still in the processing list, so recovery puts it back: at-least-once." },
          { s: "The worker judges it, writes the verdict, calls `ack`, then crashes", k: "done", why: "`ack` removed it from the processing list: nothing is left to redeliver." },
          { s: "Docker is unreachable; the worker calls `fail(job, { retryable: true })` on the first attempt of 3", k: "again", why: "An infrastructure failure with attempts left goes back to the waiting list." },
          { s: "Docker is unreachable on the third attempt of 3", k: "dead", why: "No attempts left: it goes to the dead-letter list, where someone (or something) can look at it." },
          { s: "The worker calls `fail(job, { retryable: false })` because the problem has no tests", k: "dead", why: "Retrying can't fix bad data, so it goes straight to dead letters." },
        ] as const;
        const c = rng.pick(stories);
        const { correct, wrong } = pickFrom(FATE, c.k);
        return choice(rng, { genId: "drill-queue-fate", prompt: `${c.s}. What happens to the job?`, correct, wrong, explanation: c.why, docRef: L13 });
      },
    },
    {
      id: "drill-queue-guarantee",
      title: "At most, or at least, once?",
      generate: (rng: Rng) => {
        const cases = [
          { s: "acknowledges each job as soon as it takes it, then processes it", k: "most", why: "Acknowledging first means a crash during processing loses the job: it ran at most once, maybe never." },
          { s: "processes each job, then acknowledges it; unacknowledged jobs are redelivered", k: "least", why: "A crash between the work and the ack means the work runs again: at least once." },
        ] as const;
        const c = rng.pick(cases);
        return choice(rng, {
          genId: "drill-queue-guarantee",
          prompt: `A worker ${c.s}. Which delivery guarantee does it give?`,
          correct: c.k === "most" ? "at-most-once" : "at-least-once",
          wrong: [c.k === "most" ? "at-least-once" : "at-most-once"],
          explanation: `${c.why} Exactly-once delivery isn't something a queue can promise across crashes; what you build is at-least-once delivery plus idempotent processing.`,
          docRef: L13,
        });
      },
    },
  ],
};

/* ── Lesson 14: idempotency ── */

const L14 = lessonRef("0014-idempotency", "Lesson 14: idempotency");

const idempotencyDrill: Drill = {
  id: "idempotency",
  title: "Race-safe, and worth a retry?",
  blurb: "Which writes survive concurrent workers, and which failures deserve another attempt.",
  generators: [
    {
      id: "drill-idem-safe",
      title: "Is it race-safe?",
      generate: (rng: Rng) => {
        const cases = [
          { s: "`SELECT status` in the app; if it's PENDING, then `UPDATE … SET status='RUNNING' WHERE id = $1`", safe: false, why: "Two workers can both read PENDING before either writes: check and write are two statements, with a gap between them." },
          { s: "`UPDATE … SET status='RUNNING' WHERE id = $1 AND status = 'PENDING' RETURNING id`, and run only if a row came back", safe: true, why: "One statement checks and writes; a concurrent loser re-evaluates the WHERE after the winner commits and gets no row." },
          { s: "Prisma's `updateMany({ where: { id, status: 'PENDING' }, data: { status: 'RUNNING' } })`, and run only if `count === 1`", safe: true, why: "`updateMany` is one conditional UPDATE, and its count tells you whether you won. It's the Prisma form of the claim." },
          { s: "Prisma's `update({ where: { id }, data: { status: 'RUNNING' } })`, then run", safe: false, why: "There's no condition on the status: every worker's update succeeds, and every worker runs it." },
          { s: "`UPDATE refresh_tokens SET used_at = now() WHERE hash = $1 AND used_at IS NULL RETURNING user_id`", safe: true, why: "The I-6 fix: the token is used once, by whoever gets the row back." },
          { s: "`findUnique` the refresh token, check `usedAt` is null in the app, then `update` it", safe: false, why: "That's I-6 itself: two concurrent refreshes both see an unused token." },
        ] as const;
        const c = rng.pick(cases);
        return choice(rng, {
          genId: "drill-idem-safe",
          prompt: `Twenty workers do this at once: ${c.s}. Does exactly one of them win?`,
          correct: c.safe ? "Yes, exactly one wins" : "No, several can win",
          wrong: [c.safe ? "No, several can win" : "Yes, exactly one wins"],
          explanation: `${c.why} See [Read Committed](https://www.postgresql.org/docs/current/transaction-iso.html).`,
          docRef: L14,
        });
      },
    },
    {
      id: "drill-idem-retry",
      title: "Retry it?",
      generate: (rng: Rng) => {
        const cases = [
          { e: "the Docker daemon doesn't answer", retry: true },
          { e: "Postgres refuses the connection for a moment", retry: true },
          { e: "the submission gets Wrong Answer on test 3", retry: false },
          { e: "the submission times out on test 1", retry: false },
          { e: "the submission's program crashes with SIGSEGV", retry: false },
          { e: "pulling the runner image fails on a network blip", retry: true },
        ] as const;
        const c = rng.pick(cases);
        return choice(rng, {
          genId: "drill-idem-retry",
          prompt: `While judging, ${c.e}. Should the job be retried?`,
          correct: c.retry ? "Yes, retry it with backoff" : "No, it is a verdict",
          wrong: [c.retry ? "No, it is a verdict" : "Yes, retry it with backoff"],
          explanation: c.retry
            ? "Your infrastructure failed, not the submission: retry with exponential backoff, and dead-letter it after the last attempt."
            : "The submission was judged, and that's its verdict. A retry would judge the same code again and get the same answer.",
          docRef: L14,
        });
      },
    },
  ],
};

export const BACKEND_DRILLS: Drill[] = [diDrill, pipelineDrill, queueDrill, idempotencyDrill];
