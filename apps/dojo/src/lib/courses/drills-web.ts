/**
 * Drills for the web track, lessons 19 and 20.
 */
import type { Rng } from "../engine/rng";
import { choice } from "../engine/helpers";
import { type Drill, lessonRef } from "./drill-kit";

/* ── Lesson 19: server and client components ── */

const L19 = lessonRef("0019-nextjs-rendering", "Lesson 19: where does a page render?");
const SERVER = "A server component";
const CLIENT = "A client component";

const rscDrill: Drill = {
  id: "rsc",
  title: "Server or client?",
  blurb: "Which side of the boundary each piece belongs on, and what can cross it.",
  generators: [
    {
      id: "drill-rsc-side",
      title: "Server or client?",
      generate: (rng: Rng) => {
        const cases = [
          { s: "renders a problem's statement, loaded with Prisma", server: true, why: "Data access and static markup: it runs on the server and ships no code." },
          { s: "holds the code the user is typing, with `useState`", server: false, why: "State and hooks only exist where the component re-renders: the browser." },
          { s: "has a button with an `onClick`", server: false, why: "Event handlers run in the browser, so the component must be hydrated there." },
          { s: "calls the API with a secret token", server: true, why: "Anything in a client component reaches the browser. Secrets stay on the server." },
          { s: "reads `localStorage` to remember the chosen language", server: false, why: "`localStorage` is a browser API; it doesn't exist on the server." },
          { s: "runs a TanStack Query `useQuery` that polls a submission", server: false, why: "Hooks, and a polling loop in the browser: client." },
          { s: "renders the site's footer, with links and no interaction", server: true, why: "No state, no handlers: there's nothing to hydrate, so there's no reason to ship code." },
          { s: "is an async function that awaits the problems list", server: true, why: "Only server components can be async; client components can't." },
        ] as const;
        const c = rng.pick(cases);
        return choice(rng, {
          genId: "drill-rsc-side",
          prompt: `A component ${c.s}. What should it be?`,
          correct: c.server ? SERVER : CLIENT,
          wrong: [c.server ? CLIENT : SERVER],
          explanation: `${c.why} See [Next: server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components).`,
          docRef: L19,
        });
      },
    },
    {
      id: "drill-rsc-serialize",
      title: "Can it cross?",
      generate: (rng: Rng) => {
        const cases = [
          { v: "a plain object `{ id: 1, title: \"Two Sum\" }`", ok: true },
          { v: "a `Date`", ok: true },
          { v: "a `Map` of language → starter code", ok: true },
          { v: "an arrow function `() => save()`", ok: false },
          { v: "an instance of a `Problem` class", ok: false },
          { v: "`Symbol(\"draft\")`", ok: false },
          { v: "`Symbol.for(\"draft\")`", ok: true },
          { v: "a JSX element rendered by a server component", ok: true },
          { v: "a promise of the submission list", ok: true },
        ] as const;
        const c = rng.pick(cases);
        return choice(rng, {
          genId: "drill-rsc-serialize",
          prompt: `A server component passes ${c.v} as a prop to a client component. Does React allow it?`,
          correct: c.ok ? "Yes, React serializes it" : "No, React refuses it",
          wrong: [c.ok ? "No, React refuses it" : "Yes, React serializes it"],
          explanation: `React's list: primitives, globally registered symbols, plain objects, arrays, Map, Set, typed arrays, Date, JSX, promises and Server Functions. Not ordinary functions, class instances, or unregistered symbols. See [React: serializable types](https://react.dev/reference/rsc/use-client#serializable-types).`,
          docRef: L19,
        });
      },
    },
  ],
};

/* ── Lesson 20: live verdicts ── */

const L20 = lessonRef("0020-verdict-live", "Lesson 20: the verdict, live");
const LIVE = {
  poll: "Poll it every few seconds",
  sse: "Push it with server-sent events",
  ws: "Open a two-way WebSocket connection",
} as const;

const liveDrill: Drill = {
  id: "live",
  title: "Poll or push?",
  blurb: "Which channel fits each live feature, and what each one costs.",
  generators: [
    {
      id: "drill-live-channel",
      title: "Which channel?",
      generate: (rng: Rng) => {
        const cases = [
          { s: "One user waits a few seconds for their own verdict, on a small site", k: "poll", why: "A handful of short-lived waits: polling is the simplest thing that works, and TanStack Query does it with one option." },
          { s: "Thousands of users watch a contest scoreboard that changes every few seconds", k: "sse", why: "Server → browser only, many watchers: one open response each beats thousands of polls returning \"no change\"." },
          { s: "Contestants chat with each other during a live contest", k: "ws", why: "Messages go both ways, continuously: that's what WebSockets are for." },
          { s: "The submission page shows PENDING, then RUNNING per test, then the verdict, for a popular judge", k: "sse", why: "A stream of one-way updates per submission: SSE, with the current state first." },
          { s: "An admin page shows the queue length, refreshed when the admin looks at it", k: "poll", why: "Occasional, one viewer, no urgency: poll." },
          { s: "A pair-programming editor sends every keystroke to the partner and back", k: "ws", why: "Bidirectional, frequent, low latency: a WebSocket." },
        ] as const;
        const c = rng.pick(cases);
        const correct = LIVE[c.k];
        return choice(rng, { genId: "drill-live-channel", prompt: `${c.s}. Which channel fits?`, correct, wrong: Object.values(LIVE).filter((o) => o !== correct), explanation: c.why, docRef: L20 });
      },
    },
    {
      id: "drill-live-sse",
      title: "Reading an SSE stream",
      generate: (rng: Rng) => {
        const cases = [
          { line: "`: ping`", a: "A comment, ignored: a heartbeat ping", why: "A line starting with a colon is a comment. Servers send them to keep proxies from closing a silent connection ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events))." },
          { line: "`event: status`", a: "The event's type, for a listener", why: "`EventSource` dispatches it to `addEventListener(\"status\", …)` instead of `onmessage`." },
          { line: "`data: {\"status\":\"DONE\"}`", a: "The payload, a line of text", why: "Everything after `data:` is the message; several data lines are joined with newlines. A blank line ends the event." },
          { line: "`retry: 5000`", a: "How long to wait to reconnect", why: "The browser reconnects by itself after a drop; `retry` sets the delay in milliseconds." },
        ] as const;
        const c = rng.pick(cases);
        return choice(rng, {
          genId: "drill-live-sse",
          prompt: `In a \`text/event-stream\` response, what is the line ${c.line}?`,
          correct: c.a,
          wrong: cases.filter((x) => x.a !== c.a).map((x) => x.a),
          explanation: c.why, docRef: L20,
        });
      },
    },
  ],
};

export const WEB_DRILLS: Drill[] = [rscDrill, liveDrill];
