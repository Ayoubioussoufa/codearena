import type { Lesson } from "../types";

const NEXT = "https://nextjs.org/docs/app/getting-started/server-and-client-components";

export const lesson0019: Lesson = {
  slug: "0019-nextjs-rendering",
  number: 19,
  track: "web",
  title: "Where does a page render?",
  summary:
    "Server and client components from first principles: you build a renderer that produces HTML, islands and a hydration payload, then split CodeArena's problem page so only the interactive parts ship JavaScript.",
  minutes: 110,
  status: "ready",
  builds: "a React-Server-Components-style renderer in about 70 lines, and the problem page's server/client split, checked for what reaches the browser",
  lab: { dir: "0019-nextjs-rendering", writes: ["render.mjs", "problem-page.mjs"], check: "bash check.sh" },
  reference: "web",
  warmup: [
    { lesson: "0011-di-from-scratch", question: 0 },
    { lesson: "0012-request-pipeline", question: 2 },
  ],
  words: ["server component", "client component", "hydration", "RSC payload", "serializable props", "the client boundary ('use client')"],
  answers: [
    { id: "codearena", label: "Section 6: the problem page, piece by piece: server or client, and why" },
    { id: "challenge", label: "Challenge: hydrate in a real browser (optional)" },
  ],
  quiz: [
    {
      prompt: "In Next's App Router, a component file has no `'use client'` and isn't imported by one. What is it?",
      options: [
        "A client component, because that is still the default in plain React",
        "A shared component that runs in both places at the same time",
        "A server component: it runs on the server and ships no code",
        "A static component, rendered only once, when the whole app is built",
      ],
      correct: 2,
      why: `In the App Router, layouts and pages are server components by default: they run on the server, can be async and read data directly, and their code never reaches the browser ([Next: server and client components](${NEXT})).`,
    },
    {
      prompt: "Where does a client component run?",
      options: [
        "Only in the browser, after the page has loaded its JavaScript",
        "On the server for the first HTML, then in the browser",
        "Only on the server, with each click forwarded over a websocket",
        "Inside a web worker, so that the main thread stays free",
      ],
      correct: 1,
      why: "\"Client\" is about where it can *also* run, not where it only runs. Next prerenders client components to HTML on the server, so the page arrives complete; then the browser downloads their code and hydrates them: it attaches the event handlers to the HTML that's already there. Your renderer does the first half.",
    },
    {
      prompt: "A server component renders `<SubmitButton onSubmit={handleSubmit} />`, where SubmitButton is a client component. Why does React refuse?",
      options: [
        "Client components can only ever receive strings and numbers as props",
        "Event handlers must be declared inside a useEffect hook to work",
        "A function can't be serialized into the payload for the browser",
        "Server components run far too early, before the button even exists",
      ],
      correct: 2,
      why: "Props cross from server to browser inside the RSC payload, so they must be serializable. React carries a lot (Date, Map, Set, promises, JSX), but not ordinary functions or class instances ([React: serializable types](https://react.dev/reference/rsc/use-client#serializable-types)). The handler has to live in the client component itself.",
    },
    {
      prompt: "You want a server-rendered list inside a client-side modal. How?",
      options: [
        "Imported directly, since the bundler moves it back to the server",
        "Wrapped in a useEffect, so it only runs after hydration finishes",
        "Marked with use server, which lets client code import it safely",
        "Passed in as children, rendered on the server before it ships",
      ],
      correct: 3,
      why: "A client component can't import a server component, but a server component can pass one in as `children` (or any prop). It's rendered on the server, and the client component receives the result: client outside, server inside. Your lab's `{ $html }` is the same idea.",
    },
    {
      prompt: "A client component reads `process.env.API_TOKEN`. What does it get in the browser?",
      options: [
        "It works, because Next copies every variable into the bundle",
        "It is undefined: only NEXT_PUBLIC_ variables get to the browser",
        "The build fails, since client code can never read process.env",
        "It's fetched from the server on demand, when first read",
      ],
      correct: 1,
      why: "Next inlines only variables prefixed with `NEXT_PUBLIC_` into the client bundle ([Next: environment variables](https://nextjs.org/docs/app/guides/environment-variables)). That's a safety net, not a design: keep secrets in server components, and use the `server-only` package to make importing a server module from client code a build error.",
    },
  ],
};
