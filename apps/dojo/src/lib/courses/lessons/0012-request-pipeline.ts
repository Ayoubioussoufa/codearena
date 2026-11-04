import type { Lesson } from "../types";

const LIFE = "https://docs.nestjs.com/faq/request-lifecycle";

export const lesson0012: Lesson = {
  slug: "0012-request-pipeline",
  number: 12,
  track: "backend",
  title: "The NestJS request pipeline",
  summary:
    "Middleware, guards, interceptors, pipes and filters: build the pipeline yourself, in Nest's exact order, then place every CodeArena concern in it.",
  minutes: 75,
  status: "ready",
  builds: "`pipeline.mjs`, a mini framework that runs every stage of a Nest request in order, and fails safely",
  lab: { dir: "0012-request-pipeline", writes: ["pipeline.mjs"], check: "bash check.sh" },
  reference: "nest",
  warmup: [
    { lesson: "0011-di-from-scratch", question: 0 },
    { lesson: "0009-facts-to-verdicts", question: 1 },
  ],
  words: ["middleware", "guard", "interceptor", "pipe", "exception filter", "the request lifecycle"],
  answers: [
    { id: "codearena", label: "Section 5: where each concern of POST /submissions lives" },
    { id: "challenge", label: "Challenge: route parameters (optional)" },
  ],
  quiz: [
    {
      prompt: "In Nest's lifecycle, guards run before pipes. What's the point of that order?",
      options: [
        "Pipes need the user id, which only guards can compute",
        "So strangers are refused before any work on their bodies",
        "Guards are simpler to write, so Nest runs them first",
        "The order is random; Nest only guarantees that both run",
      ],
      correct: 1,
      why: `A request that isn't allowed shouldn't cost you parsing, validation or a database lookup. Guards decide "may this request go on?", pipes then shape what it carries ([request lifecycle](${LIFE})). It's also safer: validation errors don't leak your DTO's shape to unauthenticated callers.`,
    },
    {
      prompt: "A guard returns `false`. What does Nest send back, by default?",
      options: [
        "A 401, telling the client to authenticate",
        "A 500, because the guard itself failed",
        "A 403, with the message Forbidden resource",
        "A 200, carrying an empty response body",
      ],
      correct: 2,
      why: "Returning `false` means \"not allowed\", and Nest answers `403 Forbidden resource`. For \"who are you?\" (no token, expired token), throw an `UnauthorizedException` yourself to get a 401. Your global auth guard does exactly that.",
    },
    {
      prompt: "Interceptors run global-then-route before the handler, but route-then-global after it. Why?",
      options: [
        "Nest sorts them by name once the handler has returned",
        "The global one runs twice, so it must come last",
        "They go in a queue, and a queue reverses order",
        "Each wraps the next, so the last in leaves first",
      ],
      correct: 3,
      why: `Each interceptor wraps everything inside it, like layers of an onion: the outermost (global) starts first and finishes last. Nest's docs call it "first-in, last-out" ([request lifecycle](${LIFE})). That's what lets a timing interceptor measure everything inside it.`,
    },
    {
      prompt: "A route-level filter and a global filter both match an exception. What happens?",
      options: [
        "The route filter handles it; the global filter never sees it",
        "Both run, the global filter last, and its own response wins",
        "Only the global filter runs, since it was the first registered",
        "Nest picks whichever filter is the most specific for that type",
      ],
      correct: 0,
      why: `Filters are the one stage that resolves from the lowest level up: route, then controller, then global, and an exception caught by a route filter isn't passed on ([request lifecycle](${LIFE})).`,
    },
    {
      prompt: "I-3: validation errors reach the client as \"Bad Request Exception\" instead of the real messages. Where is the bug?",
      options: [
        "The ValidationPipe, which never sends its messages to the clients",
        "The exception filter, which swaps the messages for generic text",
        "The controller, which should catch the error and rethrow it",
        "The guard, which runs first and hides the validation error",
      ],
      correct: 1,
      why: "The `ValidationPipe` throws a `BadRequestException` whose response carries the messages; your all-exceptions filter builds its own body from the exception's generic message and drops them. Fix it in the filter: when the exception has a response object, pass its messages through.",
    },
  ],
};
