/**
 * Coding track: Next.js (App Router) — the hooks and primitives React alone
 * doesn't give you: useRouter/usePathname/useSearchParams, async Server
 * Components, Server Actions, useActionState/useFormStatus, useOptimistic and
 * route handlers. Structure-checked (no runtime), so the checks read like a
 * spec of the App-Router conventions.
 */
import { codeTask, multiFileTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingTrack } from "../coding";

const DOC = { slug: "nextjs", label: "Dojo guide — Next.js App Router" };

/* ── Level 1 — navigation hooks ── */

const routerPush: Generator = {
  id: "next-router-push",
  title: "Navigate with useRouter",
  generate: () =>
    codeTask({
      genId: "next-router-push",
      prompt:
        "Write a Client Component `LoginButton` that navigates to `/dashboard` when clicked, using the App Router's programmatic navigation (the hook lives in `next/navigation`). Don't forget the directive a hook-using component needs.",
      language: "tsx",
      starter: `// your component file\nfunction LoginButton() {\n}`,
      solution: `"use client";\nimport { useRouter } from "next/navigation";\n\nfunction LoginButton() {\n  const router = useRouter();\n  return (\n    <button onClick={() => router.push("/dashboard")}>\n      Log in\n    </button>\n  );\n}`,
      checks: [
        { re: "[\"']use client[\"']", label: "marked `\"use client\"` (hooks need a Client Component)" },
        { re: "from\\s+[\"']next/navigation[\"']", label: "imports from `next/navigation` (App Router), not `next/router`" },
        { re: "useRouter\\(\\)", label: "gets the router with `useRouter()`" },
        { re: "router\\.push\\(\\s*[\"']/dashboard", label: "navigates via `router.push(\"/dashboard\")`" },
      ],
      explanation:
        "In the App Router, navigation hooks live in `next/navigation` (the old `next/router` is Pages-Router only — a classic mix-up). Hooks run on the client, so the file needs `\"use client\"` at the top. `router.push` adds a history entry (use `router.replace` when you don't want a Back button stop). It's client-side navigation: no full reload, shared layouts stay mounted.",
      docRef: DOC,
    }),
};

const activeLink: Generator = {
  id: "next-active-link",
  title: "Highlight the active link",
  generate: () =>
    codeTask({
      genId: "next-active-link",
      prompt:
        "Write a Client Component `NavLink({ href, children })` that renders a Next `<Link>` and adds the class `active` when the current path matches `href`. You'll need the App Router hook that reports the current pathname.",
      language: "tsx",
      starter: `function NavLink({ href, children }) {\n}`,
      solution: `"use client";\nimport Link from "next/link";\nimport { usePathname } from "next/navigation";\n\nfunction NavLink({ href, children }) {\n  const pathname = usePathname();\n  const className = pathname === href ? "active" : "";\n  return <Link href={href} className={className}>{children}</Link>;\n}`,
      checks: [
        { re: "[\"']use client[\"']", label: "is a Client Component" },
        { re: "usePathname\\(\\)", label: "reads the URL with `usePathname()`" },
        { re: "from\\s+[\"']next/link[\"']", label: "imports `Link` from `next/link`" },
        { re: "pathname\\s*===\\s*href|href\\s*===\\s*pathname", label: "compares the path to `href`" },
      ],
      explanation:
        "`usePathname()` returns the current path string and re-renders on navigation, so it's the idiomatic way to compute an active state. Prefer `<Link>` over a raw `<a>`: it does client-side navigation and prefetches the target in the background, so the page is often already loaded before the click lands.",
      docRef: DOC,
    }),
};

/* ── Level 2 — reading the URL ── */

const searchParams: Generator = {
  id: "next-search-params",
  title: "Read a query param",
  generate: () =>
    codeTask({
      genId: "next-search-params",
      prompt:
        "Write a Client Component `Results` that reads the `q` query-string parameter (as in `/search?q=react`) and renders `Searching for: {q}`. Reach for the App Router hook that exposes the URL's search params.",
      language: "tsx",
      starter: `function Results() {\n}`,
      solution: `"use client";\nimport { useSearchParams } from "next/navigation";\n\nfunction Results() {\n  const searchParams = useSearchParams();\n  const q = searchParams.get("q");\n  return <p>Searching for: {q}</p>;\n}`,
      checks: [
        { re: "[\"']use client[\"']", label: "is a Client Component" },
        { re: "useSearchParams\\(\\)", label: "uses `useSearchParams()`" },
        { re: "\\.get\\(\\s*[\"']q[\"']\\s*\\)", label: "reads the `q` param with `.get(\"q\")`" },
      ],
      explanation:
        "`useSearchParams()` returns a read-only `URLSearchParams`, so you pull values with `.get(\"q\")`. It's reactive — change the query string and the component re-renders. (In a Server Component you'd read the `searchParams` prop instead; the hook is the client-side equivalent.)",
      docRef: DOC,
    }),
};

/* ── Level 3 — Server Components ── */

const serverComponentFetch: Generator = {
  id: "next-server-fetch",
  title: "Fetch in a Server Component",
  generate: () =>
    codeTask({
      genId: "next-server-fetch",
      prompt:
        "Write the `async` Server Component `Page` for `app/users/page.tsx`: `await fetch(\"https://api.example.com/users\")`, parse JSON, and render each user's `name` in a `<li>` with a stable `key`. No `\"use client\"`, no `useEffect` — this runs on the server.",
      language: "tsx",
      starter: `export default function Page() {\n}`,
      solution: `export default async function Page() {\n  const res = await fetch("https://api.example.com/users");\n  const users = await res.json();\n  return (\n    <ul>\n      {users.map((user) => (\n        <li key={user.id}>{user.name}</li>\n      ))}\n    </ul>\n  );\n}`,
      checks: [
        { re: "async\\s+function\\s+Page|export\\s+default\\s+async", label: "the component is `async`" },
        { re: "await\\s+fetch\\(", label: "awaits `fetch` directly in the component" },
        { re: "\\.json\\(\\)", label: "parses the response body" },
        { re: "key=\\{", label: "list items have a stable `key`" },
        { re: "useEffect|[\"']use client[\"']", expect: false, label: "no client-side data fetching — it runs on the server" },
      ],
      explanation:
        "Server Components can be `async` and `await` data right in the body — no `useEffect`, no loading state, no client bundle for the fetch. The HTML arrives already populated. Next also dedupes and caches `fetch` for you. Reach for a Client Component only where you need interactivity (state, effects, event handlers); everything else stays on the server, smaller and faster.",
      docRef: DOC,
    }),
};

const generateMetadata: Generator = {
  id: "next-generate-metadata",
  title: "Dynamic <title> with generateMetadata",
  generate: () =>
    codeTask({
      genId: "next-generate-metadata",
      prompt:
        "For `app/blog/[slug]/page.tsx`, export the App Router's `generateMetadata` function so the page gets a dynamic `<title>` equal to the post's slug. It receives the route `params`; make it async and return the title from them.",
      language: "tsx",
      starter: `// export the metadata function`,
      solution: `export async function generateMetadata({ params }) {\n  const { slug } = await params;\n  return { title: slug };\n}`,
      checks: [
        { re: "generateMetadata", label: "exports a `generateMetadata` function" },
        { re: "params", label: "receives `{ params }`" },
        { re: "return\\s*\\{[\\s\\S]*title", label: "returns an object with a `title`" },
      ],
      explanation:
        "The App Router builds `<head>` from exported metadata, not from you rendering a `<title>`. Static pages export a `metadata` object; dynamic ones export `generateMetadata`, which can be `async` and read `params`/`searchParams` to fetch the real title. Next streams it into the document head — no `react-helmet` needed.",
      docRef: DOC,
    }),
};

/* ── Level 4 — Server Actions & forms ── */

const serverAction: Generator = {
  id: "next-server-action",
  title: "Mutate with a Server Action",
  generate: () =>
    codeTask({
      genId: "next-server-action",
      prompt:
        "Write a Server Action `createTodo(formData)` that reads the `text` field from the submitted form, creates the todo (`db.todo.create(...)`), and then makes the `/todos` list re-render with the new item. Mark it as a Server Action, and remember that after a mutation you must invalidate the cached data for that path.",
      language: "tsx",
      starter: `async function createTodo(formData) {\n}`,
      solution: `"use server";\nimport { revalidatePath } from "next/cache";\n\nasync function createTodo(formData) {\n  const text = formData.get("text");\n  await db.todo.create({ data: { text } });\n  revalidatePath("/todos");\n}`,
      checks: [
        { re: "[\"']use server[\"']", label: "marked `\"use server\"` (it's a Server Action)" },
        { re: "async\\s+function\\s+createTodo", label: "the action is `async`" },
        { re: "formData\\.get\\(\\s*[\"']text[\"']", label: "reads the field with `formData.get(\"text\")`" },
        { re: "revalidatePath\\(", label: "revalidates the cache so the UI refreshes" },
      ],
      explanation:
        "A Server Action is a function that runs on the server but is callable from the client — pass it straight to a `<form action={createTodo}>` and Next wires up the POST for you, no API route, no fetch. It receives the native `FormData`. After a mutation you must tell Next the cached data is stale: `revalidatePath` (or `revalidateTag`) triggers a re-fetch so the new todo actually shows up.",
      docRef: DOC,
    }),
};

const formStatus: Generator = {
  id: "next-form-status",
  title: "A pending submit button",
  generate: () =>
    codeTask({
      genId: "next-form-status",
      prompt:
        "Write a Client Component `SubmitButton` that disables itself and shows `Saving…` while its parent `<form>` is submitting. Read the form's pending state with the React DOM hook made for exactly this — note it only works from a child rendered INSIDE the form.",
      language: "tsx",
      starter: `function SubmitButton() {\n}`,
      solution: `"use client";\nimport { useFormStatus } from "react-dom";\n\nfunction SubmitButton() {\n  const { pending } = useFormStatus();\n  return (\n    <button type="submit" disabled={pending}>\n      {pending ? "Saving…" : "Save"}\n    </button>\n  );\n}`,
      checks: [
        { re: "[\"']use client[\"']", label: "is a Client Component" },
        { re: "useFormStatus\\(\\)", label: "reads status with `useFormStatus()`" },
        { re: "disabled=\\{\\s*pending", label: "disables the button while `pending`" },
        { re: "pending\\s*\\?", label: "swaps the label based on `pending`" },
      ],
      explanation:
        "`useFormStatus` reads the submission state of the NEAREST parent `<form>` — which is why it must live in a separate child component *inside* the form, not the one that renders the form. No manual `isSubmitting` state, no wiring: it tracks the in-flight Server Action automatically. Pair it with `useActionState` when you also need the action's return value or validation errors.",
      docRef: DOC,
    }),
};

/* ── Level 5 — optimistic UI & route handlers ── */

const useOptimistic: Generator = {
  id: "next-use-optimistic",
  title: "Optimistic UI with useOptimistic",
  generate: () =>
    codeTask({
      genId: "next-use-optimistic",
      prompt:
        "Inside a Client Component holding `messages`, show a just-sent message INSTANTLY (before the Server Action resolves), so the send feels immediate — and let it revert automatically if the action fails. Reach for React's optimistic-state hook: give it the real `messages` plus an update function that appends the new one, and expose `[optimisticMessages, addOptimistic]`.",
      language: "tsx",
      starter: `const [optimisticMessages, addOptimistic] = /* your hook */;`,
      solution: `const [optimisticMessages, addOptimistic] = useOptimistic(\n  messages,\n  (state, newMessage) => [...state, newMessage],\n);`,
      checks: [
        { re: "useOptimistic\\(", label: "uses `useOptimistic`" },
        { re: "\\.\\.\\.\\s*state", label: "the update reducer returns a new array (spreads state)" },
        { re: "\\[\\s*optimisticMessages\\s*,\\s*addOptimistic\\s*\\]", label: "destructures `[value, addOptimistic]`" },
      ],
      explanation:
        "`useOptimistic(actual, reducer)` gives you a temporary, optimistic view layered on top of the real state. You call `addOptimistic(x)` right before firing the Server Action — the UI updates immediately — and when the action resolves and the real `messages` prop updates, React automatically discards the optimistic layer and snaps to the truth. If the action fails, the optimistic entry simply vanishes. It's the clean way to make mutations feel instant.",
      docRef: DOC,
    }),
};

const routeHandler: Generator = {
  id: "next-route-handler",
  title: "Write a route handler",
  generate: () =>
    codeTask({
      genId: "next-route-handler",
      prompt:
        "In `app/api/health/route.ts`, export a `GET` route handler that returns the JSON `{ status: \"ok\" }`. Send the JSON with the App Router's response helper from `next/server`.",
      language: "tsx",
      starter: `// app/api/health/route.ts`,
      solution: `import { NextResponse } from "next/server";\n\nexport async function GET() {\n  return NextResponse.json({ status: "ok" });\n}`,
      checks: [
        { re: "export\\s+async\\s+function\\s+GET", label: "exports a `GET` handler (the HTTP verb IS the export name)" },
        { re: "NextResponse\\.json\\(", label: "responds with `NextResponse.json(...)`" },
        { re: "from\\s+[\"']next/server[\"']", label: "imports `NextResponse` from `next/server`" },
        { re: "status:\\s*[\"']ok[\"']", label: "returns `{ status: \"ok\" }`" },
      ],
      explanation:
        "In the App Router an API endpoint is a `route.ts` file that exports functions NAMED after HTTP verbs — `GET`, `POST`, `PUT`, `DELETE`. There's no router config: the file's folder path *is* the URL. `NextResponse.json()` sets the `Content-Type` and serialises the body for you. This is the replacement for the Pages Router's `pages/api` handlers.",
      docRef: DOC,
    }),
};

const useParams: Generator = {
  id: "next-use-params",
  title: "Read a dynamic segment (client)",
  generate: () =>
    codeTask({
      genId: "next-use-params",
      prompt:
        "In a Client Component under `app/posts/[slug]/`, read the `slug` dynamic segment (the client-side counterpart to the `params` prop a Server Component page receives) and render `Post: {slug}`.",
      language: "tsx",
      starter: `function PostView() {\n}`,
      solution: `"use client";\nimport { useParams } from "next/navigation";\n\nfunction PostView() {\n  const params = useParams();\n  return <p>Post: {params.slug}</p>;\n}`,
      checks: [
        { re: "[\"']use client[\"']", label: "is a Client Component" },
        { re: "useParams\\(\\)", label: "reads route params with `useParams()`" },
        { re: "params\\.slug", label: "uses `params.slug`" },
      ],
      explanation:
        "`useParams()` returns the current route's dynamic segments as an object (`{ slug }` for `[slug]`, plus `[...all]` catch-alls as arrays). It's the CLIENT-side counterpart to the `params` prop a Server Component page receives. Use it in deeply nested client components that need the id/slug without threading it down as a prop.",
      docRef: DOC,
    }),
};

const serverParallel: Generator = {
  id: "next-server-parallel",
  title: "Parallel data in a Server Component",
  generate: () =>
    codeTask({
      genId: "next-server-parallel",
      prompt:
        "An async Server Component needs BOTH the user and their posts. Fetch them IN PARALLEL, not as a waterfall — kick off both requests before awaiting, so total time is the slower of the two rather than the sum. `getUser()` and `getPosts()` each return a Promise; destructure the pair as `[user, posts]`.",
      language: "tsx",
      starter: `export default async function Page() {\n  // fetch user and posts in parallel\n}`,
      solution: `export default async function Page() {\n  const [user, posts] = await Promise.all([getUser(), getPosts()]);\n  return <Profile user={user} posts={posts} />;\n}`,
      checks: [
        { re: "async\\s+function\\s+Page|export\\s+default\\s+async", label: "the component is `async`" },
        { re: "Promise\\.all\\(\\s*\\[", label: "batches with `Promise.all([...])`" },
        { re: "await\\s+Promise\\.all", label: "awaits the batch" },
      ],
      explanation:
        "Writing `const user = await getUser(); const posts = await getPosts();` is a WATERFALL — the posts request can't start until the user request finishes, doubling the latency. Kicking off both before awaiting (`Promise.all([getUser(), getPosts()])`) runs them concurrently, so total time is the slower of the two. This matters a lot in Server Components, where data fetching is your main cost.",
      docRef: DOC,
    }),
};

const fetchRevalidate: Generator = {
  id: "next-fetch-revalidate",
  title: "Cache & revalidate a fetch",
  generate: () =>
    codeTask({
      genId: "next-fetch-revalidate",
      prompt:
        "In a Server Component, fetch `https://api.example.com/stats`, but tell Next to cache the response and REVALIDATE it at most once every 60 seconds (Incremental Static Regeneration). Configure this through `fetch`'s Next-specific caching option.",
      language: "tsx",
      starter: `const res = await fetch("https://api.example.com/stats"/* add caching */);`,
      solution: `const res = await fetch("https://api.example.com/stats", {\n  next: { revalidate: 60 },\n});`,
      checks: [
        { re: "next\\s*:\\s*\\{", label: "passes the `next` fetch option" },
        { re: "revalidate\\s*:\\s*60", label: "sets `revalidate: 60`" },
      ],
      explanation:
        "Next extends the native `fetch` with a `next` option. `revalidate: 60` serves a cached response and refreshes it in the background at most once a minute — ISR, per request, no config file. The alternatives on the same axis: `cache: 'no-store'` (always fresh, fully dynamic) and the default `force-cache` (cached until you revalidate). Tag responses with `next: { tags: [...] }` to purge them on demand with `revalidateTag`.",
      docRef: DOC,
    }),
};

const redirectServer: Generator = {
  id: "next-redirect",
  title: "Redirect from the server",
  generate: () =>
    codeTask({
      genId: "next-redirect",
      prompt:
        "In an async Server Component, if `getSession()` returns no session, send the user to `/login` using the App Router's server-side redirect (from `next/navigation`); otherwise render the dashboard.",
      language: "tsx",
      starter: `export default async function Dashboard() {\n  const session = await getSession();\n  // redirect to /login if no session\n}`,
      solution: `import { redirect } from "next/navigation";\n\nexport default async function Dashboard() {\n  const session = await getSession();\n  if (!session) {\n    redirect("/login");\n  }\n  return <DashboardView session={session} />;\n}`,
      checks: [
        { re: "from\\s+[\"']next/navigation[\"']", label: "imports `redirect` from `next/navigation`" },
        { re: "redirect\\(\\s*[\"']/login[\"']\\s*\\)", label: "calls `redirect(\"/login\")`" },
        { re: "if\\s*\\(\\s*!\\s*session", label: "redirects only when there's no session" },
      ],
      explanation:
        "`redirect()` works by THROWING a special error that Next catches to issue the redirect, so code after it never runs — no `return` needed (and don't wrap it in a `try/catch` that swallows the throw). It's callable from Server Components, Server Actions and route handlers. This server-side guard is safer than a client redirect: the protected content is never sent to the browser in the first place.",
      docRef: DOC,
    }),
};

/* ── Multi-file capstone — assemble a whole route segment across files ── */

const routeSegment: Generator = {
  id: "next-route-segment",
  title: "Assemble a dashboard route segment",
  generate: () =>
    multiFileTask({
      genId: "next-route-segment",
      prompt:
        "Build a whole `/dashboard` route segment — in the App Router a feature IS its files. `layout.tsx` wraps the segment in shared chrome; `page.tsx` is the route's content, fetching its stats on the server (cached and refreshed periodically); `loading.tsx` is the instant fallback shown while the page's data loads; `app/api/stats/route.ts` is the endpoint that serves those stats as JSON. Write each in its tab, **Debug this file**, then **submit all** — open a file's hints if you're unsure of the App-Router conventions.",
      files: [
        {
          name: "app/dashboard/layout.tsx",
          language: "tsx",
          role: "shared chrome that wraps the segment's pages",
          hint: "A `layout.tsx` default-exports a component taking `{ children }` and renders it inside whatever chrome you want (a `<nav>`, a `<section>`). It stays mounted while pages swap inside `{children}`, so its state survives navigation. The one thing you must not forget is to actually render `{children}` — that's the slot the page fills.",
          starter: `// app/dashboard/layout.tsx — wrap the segment's pages in shared chrome`,
          solution: `export default function DashboardLayout({ children }) {\n  return (\n    <section>\n      <nav>Dashboard</nav>\n      {children}\n    </section>\n  );\n}`,
          checks: [
            { re: "export\\s+default\\s+function\\s+\\w*Layout", label: "default-exports a layout component" },
            { re: "\\{\\s*children\\s*\\}", label: "receives and renders `{children}`" },
          ],
        },
        {
          name: "app/dashboard/page.tsx",
          language: "tsx",
          role: "the route's content — fetches on the server",
          hint: "A Server Component can be `async` and `await` data right in the body — no `useEffect`, no `\"use client\"`. Call `fetch(url, { next: { revalidate: 60 } })` to cache the response and refresh it at most once a minute (ISR), then `await res.json()` and render a field. Keeping it server-side means zero client JS for the fetch.",
          starter: `// app/dashboard/page.tsx — async Server Component that fetches + renders stats`,
          solution: `export default async function DashboardPage() {\n  const res = await fetch("https://api.example.com/stats", {\n    next: { revalidate: 60 },\n  });\n  const stats = await res.json();\n  return <p>Users: {stats.users}</p>;\n}`,
          checks: [
            { re: "export\\s+default\\s+async\\s+function\\s+DashboardPage", label: "an async Server Component `DashboardPage`" },
            { re: "await\\s+fetch\\(", label: "awaits `fetch` on the server" },
            { re: "revalidate\\s*:\\s*60", label: "caches with `revalidate: 60` (ISR)" },
            { re: "\\.json\\(\\)", label: "parses the response body" },
            { re: "useEffect|[\"']use client[\"']", expect: false, label: "no client-side fetching — it runs on the server" },
          ],
        },
        {
          name: "app/dashboard/loading.tsx",
          language: "tsx",
          role: "the instant fallback while the page loads",
          hint: "`loading.tsx` is a convention: default-export a component and Next automatically shows it as the Suspense fallback while the sibling `page.tsx` streams in. It just returns some placeholder UI — no props, no data.",
          starter: `// app/dashboard/loading.tsx — the instant loading UI`,
          solution: `export default function Loading() {\n  return <p>Loading dashboard…</p>;\n}`,
          checks: [
            { re: "export\\s+default\\s+function\\s+Loading", label: "default-exports `Loading` (the App-Router convention)" },
            { re: "return\\s*[\\(<]", label: "returns the fallback UI" },
          ],
        },
        {
          name: "app/api/stats/route.ts",
          language: "tsx",
          role: "the endpoint the page fetches from",
          hint: "An API endpoint is a `route.ts` that exports functions NAMED after HTTP verbs — here `export async function GET()`. Return `NextResponse.json({...})` (imported from `next/server`), which sets the content type and serialises the body. The folder path is the URL; there's no router config.",
          starter: `// app/api/stats/route.ts — GET handler returning JSON stats`,
          solution: `import { NextResponse } from "next/server";\n\nexport async function GET() {\n  return NextResponse.json({ users: 42 });\n}`,
          checks: [
            { re: "export\\s+async\\s+function\\s+GET", label: "exports a `GET` handler (verb IS the export name)" },
            { re: "from\\s+[\"']next/server[\"']", label: "imports `NextResponse` from `next/server`" },
            { re: "NextResponse\\.json\\(", label: "responds with `NextResponse.json(...)`" },
          ],
        },
      ],
      crossChecks: [
        {
          re: "(?=[\\s\\S]*export\\s+default\\s+function\\s+\\w*Layout)(?=[\\s\\S]*\\{\\s*children\\s*\\})(?=[\\s\\S]*export\\s+default\\s+async\\s+function\\s+DashboardPage)",
          label: "the layout renders `{children}` and the page fills the segment",
        },
        {
          re: "(?=[\\s\\S]*await\\s+fetch\\()(?=[\\s\\S]*export\\s+async\\s+function\\s+GET)(?=[\\s\\S]*NextResponse\\.json\\()",
          label: "the page fetches the stats the route handler serves as JSON",
        },
      ],
      explanation:
        "The App Router has no route config — the FILES in a folder are the feature. `layout.tsx` renders once and keeps its state while pages swap inside `{children}`; `page.tsx` is the route's content and, as an async Server Component, awaits data right in the body with zero client JS; `loading.tsx` is automatically the Suspense fallback shown while the page's data resolves; and `route.ts` exports functions named after HTTP verbs to become an endpoint. Spreading a feature across these files is what buys you streaming, per-segment loading states and server-only data fetching for free.",
      docRef: DOC,
    }),
};

export const nextjsTrack: CodingTrack = {
  id: "coding-next",
  title: "Next.js (App Router)",
  icon: "▲",
  stack: "TypeScript · Next.js",
  blurb:
    "The App Router toolkit React alone doesn't have: useRouter & friends, async Server Components, Server Actions, useFormStatus, useOptimistic and route handlers.",
  exercises: [
    { level: 1, gen: routerPush },
    { level: 1, gen: activeLink },
    { level: 2, gen: searchParams },
    { level: 2, gen: useParams },
    { level: 3, gen: serverComponentFetch },
    { level: 3, gen: generateMetadata },
    { level: 3, gen: serverParallel },
    { level: 3, gen: routeSegment },
    { level: 4, gen: serverAction },
    { level: 4, gen: formStatus },
    { level: 4, gen: fetchRevalidate },
    { level: 4, gen: redirectServer },
    { level: 5, gen: useOptimistic },
    { level: 5, gen: routeHandler },
  ],
};
