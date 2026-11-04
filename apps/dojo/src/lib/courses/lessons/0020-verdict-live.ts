import type { Lesson } from "../types";

const SSE = "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events";

export const lesson0020: Lesson = {
  slug: "0020-verdict-live",
  number: 20,
  track: "web",
  title: "The verdict, live in the browser",
  summary:
    "Watch PENDING become a verdict without a reload: build the polling loop TanStack Query runs for you, then a server-sent-events channel that never loses a verdict, and know when each is the right call.",
  minutes: 100,
  status: "ready",
  builds: "`poll.mjs` (no overlap, abort, timeout, retries) and `sse.mjs` (current state first, heartbeats, no leaks, no lost verdict)",
  lab: { dir: "0020-verdict-live", writes: ["poll.mjs", "sse.mjs"], check: "bash check.sh" },
  reference: "web",
  warmup: [
    { lesson: "0019-nextjs-rendering", question: 1 },
    { lesson: "0013-queue-from-scratch", question: 0 },
  ],
  words: ["polling", "server-sent events", "WebSocket", "heartbeat", "pub/sub (at-most-once)", "subscribe-then-read"],
  answers: [
    { id: "codearena", label: "Section 5: polling or push for the submission page, and why" },
    { id: "challenge", label: "Challenge: resume with Last-Event-ID (optional)" },
  ],
  quiz: [
    {
      prompt: "Why schedule the next poll with `setTimeout` after each answer, instead of `setInterval`?",
      options: [
        "Browsers limit how many intervals a single page may create",
        "A slow answer piles up requests that overlap each other",
        "setTimeout runs on the server, which keeps the browser idle",
        "setInterval is deprecated and will soon be removed from browsers",
      ],
      correct: 1,
      why: "`setInterval` fires on the clock, whether the last request answered or not: a slow API gets a pile of concurrent requests, exactly when it's struggling. Chaining a `setTimeout` after each answer keeps one request in flight. The lab measured 12 at once with `setInterval`.",
    },
    {
      prompt: "1,000 users are each waiting on a verdict, polling every second. What does the API see?",
      options: [
        "About one request a second, since the browsers batch all identical calls",
        "About sixty requests a minute, shared between all of the waiting users",
        "About a thousand requests a second, and most of them answer PENDING",
        "Nothing at all, since repeated GET requests are served from the cache",
      ],
      correct: 2,
      why: "Each browser polls on its own: 1,000 requests a second, nearly all answering \"still PENDING\". That's polling's cost, and it grows with users × frequency. It's fine at CodeArena's scale, and the reason push exists at larger ones.",
    },
    {
      prompt: "An SSE handler must read the submission's current state and subscribe to updates. Why subscribe first?",
      options: [
        "Or the browser receives one verdict twice in a row",
        "Or a verdict published in between is lost for good",
        "Or the stream ends before the headers have been written",
        "Or Redis refuses a new subscription from a busy connection",
      ],
      correct: 1,
      why: "Read first, and a verdict published after the read but before the subscription reaches nobody: the page waits forever. Subscribe first, buffer, then read: the worst case is seeing a state twice, which you filter. The lab reproduces exactly this race.",
    },
    {
      prompt: "The worker publishes a verdict on a Redis channel while no API instance is subscribed. What happens to the message?",
      options: [
        "It is lost: Pub/Sub delivers at most once, to current subscribers",
        "Redis keeps it until the next instance subscribes to the channel",
        "The worker retries the publish until an API instance acknowledges it",
        "BullMQ records it on the completed job, which the API polls",
      ],
      correct: 0,
      why: "Redis Pub/Sub is fire-and-forget: at-most-once delivery to whoever is subscribed right now ([Redis: Pub/Sub](https://redis.io/docs/latest/develop/pubsub/)). That's fine here because the database stays the truth: a client that missed the push still gets the verdict from its first read, or from a fallback poll.",
    },
    {
      prompt: "Why are server-sent events a better fit than WebSockets for the verdict?",
      options: [
        "WebSockets cannot carry JSON, only binary frames of fixed size",
        "SSE connections are always encrypted, while WebSockets never can be",
        "Browsers block WebSockets on any page that uses server components",
        "Data flows one way, on plain HTTP, reconnecting by itself",
      ],
      correct: 3,
      why: `The verdict only travels server → browser. SSE is a plain HTTP response that stays open, and \`EventSource\` reconnects on its own ([MDN: using server-sent events](${SSE})). WebSockets earn their extra machinery when the browser also talks back, like a live contest chat.`,
    },
  ],
};
