/**
 * Exercises for the Next.js guide.
 *
 * Every one of these turns on the same question the guide opens with:
 * where does this code run? Almost every App Router mistake is an answer
 * given without asking it.
 */
import type { GuideExercise } from "./types";

export const nextjsExercises: GuideExercise[] = [
  {
    id: "where-does-it-run",
    title: "Say where each one runs",
    prompt: "Write `server`, `client`, or `both` for each.",
    language: "text",
    given: `1. a component with no 'use client'
2. a component with 'use client'
3. a Server Action
4. a component imported BY a 'use client' component
5. a route handler in app/api/`,
    starter: `1.
2.
3.
4.
5.
`,
    solution: `1. server — server components are the default in the App Router
2. both — it renders on the server for the initial HTML, then hydrates and runs on the client
3. server — always, no exceptions
4. client — 'use client' marks a boundary; everything below it in the import tree is a client component
5. server — it is an HTTP endpoint
`,
    hint: "Item 2 is the one people get wrong. 'use client' does not mean 'client only'.",
    explanation:
      "**`'use client'` marks a boundary, not a location.** Such a component still renders on the server for the initial HTML — which is why `window` in a component body crashes the build even with the directive, and why browser-only code belongs in an effect. Item 4 is the other trap: the directive is *inherited down the import tree*, so a component with no directive becomes a client component simply by being imported from one, and its dependencies join the bundle with it.",
    checks: [
      { re: "1\\.\\s*server", flags: "mi", label: "1 — server by default" },
      { re: "2\\.\\s*both", flags: "mi", label: "2 — both: it still prerenders on the server" },
      { re: "3\\.\\s*server", flags: "mi", label: "3 — server, always" },
      { re: "4\\.\\s*client", flags: "mi", label: "4 — client, by inheritance" },
      { re: "5\\.\\s*server", flags: "mi", label: "5 — server" },
    ],
  },

  {
    id: "server-component-fetch",
    title: "Delete the client-side fetch",
    prompt:
      "This is a client component fetching on mount, so the user sees a spinner before any content. Rewrite it as a server component.",
    language: "typescript",
    given: `// getProblem(slug) is an async function that hits the API.`,
    starter: `'use client';

export default function ProblemPage({ params }: { params: { slug: string } }) {
  const [problem, setProblem] = useState<Problem>();

  useEffect(() => {
    getProblem(params.slug).then(setProblem);
  }, [params.slug]);

  if (!problem) return <Spinner />;
  return <Article problem={problem} />;
}
`,
    solution: `export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = await getProblem(slug);
  if (!problem) notFound();

  return <Article problem={problem} />;
}
`,
    hint: "A server component can be `async` and `await` directly. And in recent Next versions `params` is itself a promise.",
    explanation:
      "The client version costs a round trip the user watches: HTML arrives, JavaScript loads, hydration finishes, *then* the fetch starts. A server component awaits during render, so the HTML already contains the article and there is no spinner and no loading state to write. It also keeps the fetch — and any secret it needs — on the server. `notFound()` replaces the `if (!problem)` branch with the framework's 404, which renders your `not-found.tsx` and sets the right status.",
    checks: [
      { re: "export default async function", label: "is an async server component" },
      { re: "await getProblem", label: "awaits the data during render" },
      { re: "await params", label: "awaits `params`, which is a promise" },
      { re: "'use client'", expect: false, label: "no longer a client component" },
      { re: "useEffect|useState", expect: false, label: "no effect, no loading state" },
      { re: "notFound\\(\\)", label: "uses the framework's 404" },
    ],
  },

  {
    id: "client-boundary",
    title: "Push the boundary down",
    prompt:
      "One interactive button has forced the whole page into the client bundle. Restructure it so only the button ships.",
    language: "typescript",
    given: `// <LikeButton> needs onClick. Everything else is static.`,
    starter: `'use client';

export default function ProblemPage({ problem }: { problem: Problem }) {
  const [liked, setLiked] = useState(false);

  return (
    <article>
      <h1>{problem.title}</h1>
      <ProblemDescription problem={problem} />
      <TestCaseTable cases={problem.cases} />
      <button onClick={() => setLiked(!liked)}>{liked ? '♥' : '♡'}</button>
    </article>
  );
}
`,
    solution: `// LikeButton.tsx
'use client';

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>{liked ? '♥' : '♡'}</button>;
}

// ProblemPage.tsx — stays a server component
export default function ProblemPage({ problem }: { problem: Problem }) {
  return (
    <article>
      <h1>{problem.title}</h1>
      <ProblemDescription problem={problem} />
      <TestCaseTable cases={problem.cases} />
      <LikeButton />
    </article>
  );
}
`,
    hint: "The directive is inherited downward, so put it on the smallest thing that genuinely needs it.",
    explanation:
      "`'use client'` at the top of a page drags everything it imports into the bundle — the description renderer, the table, and their dependencies — even though none of them is interactive. **Push the boundary as far down the tree as it will go.** The page stays a server component and ships no JavaScript for the static parts; only the button hydrates. This is the single highest-leverage habit in the App Router, and the reason a page can be interactive while shipping almost nothing.",
    checks: [
      { re: "'use client'[\\s\\S]*LikeButton", label: "the directive sits on the button" },
      { re: "export default function ProblemPage[\\s\\S]*<LikeButton", label: "the page composes it" },
      { re: "^'use client';\\s*\\n\\s*export default function ProblemPage", flags: "m", expect: false, label: "the page is no longer a client component" },
    ],
  },

  {
    id: "server-action",
    title: "Write a Server Action",
    prompt:
      "Replace this route handler plus fetch with a Server Action that revalidates the list afterwards.",
    language: "typescript",
    given: `import { revalidatePath } from 'next/cache';
// db.problem.create({ data })`,
    starter: `// app/api/problems/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  await db.problem.create({ data: body });
  return Response.json({ ok: true });
}

// the form
<form onSubmit={async (e) => {
  e.preventDefault();
  await fetch('/api/problems', { method: 'POST', body: JSON.stringify(data) });
}}>
`,
    solution: `// actions.ts
'use server';

export async function createProblem(formData: FormData) {
  const title = formData.get('title') as string;
  await db.problem.create({ data: { title } });
  revalidatePath('/problems');
}

// the form — no onSubmit, no fetch, no client component
<form action={createProblem}>
  <input name="title" />
  <button type="submit">Create</button>
</form>
`,
    hint: "`'use server'` on the function, and the form takes `action` rather than `onSubmit`. No endpoint, no client-side fetch.",
    explanation:
      "A Server Action removes three things at once: the route handler, the client-side fetch, and the need for the form to be a client component at all — so it **works before JavaScript loads**, which a plain `onSubmit` does not. `revalidatePath` is what makes the list update: without it the cached page still shows the old data and it looks like the write silently failed. Route handlers still have their place — for webhooks, or clients that are not your own pages.",
    checks: [
      { re: "'use server'", label: "marks it as a Server Action" },
      { re: "formData|FormData", label: "takes the form data" },
      { re: "action=\\{", label: "the form uses `action`, not `onSubmit`" },
      { re: "revalidatePath|revalidateTag", label: "revalidates the cache afterwards" },
      { re: "fetch\\('/api", expect: false, label: "no client-side fetch" },
    ],
  },

  {
    id: "loading-error-boundaries",
    title: "Name the file for each job",
    prompt: "Write the filename the App Router expects for each.",
    language: "text",
    given: `1. shown while an async segment is loading
2. shown when a segment throws
3. shown when notFound() is called
4. wraps every page in a segment
5. a route with a dynamic segment, e.g. /problems/two-sum`,
    starter: `1.
2.
3.
4.
5.
`,
    solution: `1. loading.tsx
2. error.tsx  (must be a client component)
3. not-found.tsx
4. layout.tsx
5. app/problems/[slug]/page.tsx
`,
    hint: "All of them are conventions — the file name IS the API. One of them has a requirement the others do not.",
    explanation:
      "These are conventions, not configuration, which is why there is no router file anywhere. `loading.tsx` is sugar for a Suspense boundary around the segment, so the shell renders instantly while the data resolves. **`error.tsx` must carry `'use client'`** — it needs state and an event handler for its reset button, and it has to run in the browser to catch errors that happen there. A layout persists across navigations within its segment, which is why state in a layout survives when a page changes.",
    checks: [
      { re: "1\\.\\s*loading\\.tsx", flags: "mi", label: "1 — loading.tsx" },
      { re: "2\\.\\s*error\\.tsx", flags: "mi", label: "2 — error.tsx" },
      { re: "2\\.[^\\n]*client", flags: "mi", label: "2 — and it must be a client component" },
      { re: "3\\.\\s*not-found\\.tsx", flags: "mi", label: "3 — not-found.tsx" },
      { re: "4\\.\\s*layout\\.tsx", flags: "mi", label: "4 — layout.tsx" },
      { re: "5\\.[^\\n]*\\[slug\\]", flags: "mi", label: "5 — a [slug] folder" },
    ],
  },

  {
    id: "secret-leak",
    title: "Find the leaked secret",
    prompt:
      "One of these ships an API key to the browser. Say which, why, and how to fix it.",
    language: "text",
    given: `// .env.local
API_SECRET=sk_live_abc
NEXT_PUBLIC_API_URL=https://api.example.com

// A — server component
const res = await fetch(url, { headers: { Authorization: process.env.API_SECRET } });

// B — client component
const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/problems');

// C — client component
const res = await fetch(url, { headers: { Authorization: process.env.API_SECRET } });`,
    starter: `1. which:
2. why:
3. the fix:
`,
    solution: `1. which: C
2. why: a client component's code is bundled and sent to the browser. process.env.API_SECRET is inlined at build time, so the key ends up as a literal in the JavaScript anyone can read. (It would also be undefined at runtime without the NEXT_PUBLIC_ prefix — but the build-time inlining is the real danger.)
3. the fix: move the call to a server component, a Server Action, or a route handler, so the secret never crosses the boundary.
`,
    hint: "Two of these run on the server. Only one runs in a browser AND reaches for a secret.",
    explanation:
      "The `NEXT_PUBLIC_` prefix is the whole mechanism: variables with it are **deliberately inlined into the client bundle**, and everything else is meant to stay server-side. B is correct — the API URL is public by nature. C is the failure, and it is quiet: it may appear to work in development where the same process serves both sides. **The rule: a secret may only be read where the code cannot reach a browser** — server components, Server Actions, route handlers.",
    checks: [
      { re: "^1\\.[^\\n]*\\bC\\b", flags: "m", label: "1 — C is the leak" },
      { re: "bundle|browser|client|inlin", flags: "i", label: "explains it is bundled to the browser" },
      { re: "server (component|action)|route handler", flags: "i", label: "moves the call server-side" },
    ],
  },
];
