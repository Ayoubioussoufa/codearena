/**
 * Checks for the Next.js guide (content/supplements/nextjs.md). Claims checked
 * against nextjs.org/docs (Next.js 16, the version CodeArena uses) and
 * react.dev on 3 Nov 2026: server and client components, fetch, revalidateTag,
 * updateTag, useFormStatus.
 */
import type { GuideCheckSet } from "./types";

const BOUNDARY = "https://nextjs.org/docs/app/getting-started/server-and-client-components";

export const nextjsChecks: GuideCheckSet = {
  name: "Next.js guide",
  source: {
    label: "the Next.js App Router docs: Getting Started",
    href: "https://nextjs.org/docs/app/getting-started",
    note: "Read Layouts and Pages, Server and Client Components, Fetching Data, Mutating Data, then Caching. They describe Next.js 16, the version CodeArena runs.",
  },
  terms: [
    "Server Component",
    "Client Component",
    "\"use client\" boundary",
    "Layout",
    "Suspense boundary",
    "Request waterfall",
    "Server Action",
    "Cache invalidation",
  ],
  checks: [
    {
      id: "where",
      section: "§0 · Where does this run?",
      questions: [
        {
          prompt: "A component in `app/` has no directive at the top of its file. Where does it run?",
          options: [
            "In the browser, after the HTML is hydrated",
            "Only on the server, and ships no JavaScript",
            "On both, rendered twice, then the two compared",
            "On the server, then again in the browser",
          ],
          correct: 1,
          why: `Layouts and pages are Server Components by default: rendered on the server into the RSC payload, never shipped as JavaScript ([Next docs](${BOUNDARY})). "On the server, then again in the browser" is what a *Client* Component does: prerendered to HTML, then hydrated.`,
        },
        {
          prompt: "A page starts with `\"use client\"` and imports a chart and a settings panel. What did that one line do?",
          options: [
            "Only the page component itself runs in the browser",
            "Nothing changes until the page calls a React hook",
            "The page and its imports join the client bundle",
            "The imported files are all forced onto the server",
          ],
          correct: 2,
          why: `"use client" declares a boundary: once a file has it, "all of its imports and the components it directly renders are included in the client bundle" ([Next docs](${BOUNDARY})). That's why you put it on the small interactive leaf, not the page.`,
        },
        {
          prompt: "Which of these sends `JUDGE_API_SECRET` to the browser?",
          options: [
            "Reading it while a Server Component is rendering",
            "Using it inside a Server Action's function body",
            "Reading it in a route handler's GET function",
            "Handing it to a Client Component as props",
          ],
          correct: 3,
          why: `Props passed from a Server Component to a Client Component are serialized into the RSC payload, which the browser downloads ([Next docs](${BOUNDARY})). The other three stay on the server. (A variable read *inside* a Client Component is replaced by an empty string unless it starts with \`NEXT_PUBLIC_\`.)`,
        },
      ],
      explain:
        "Explain to an interviewer where a Server Component and a Client Component each run, what `\"use client\"` marks, and why you push it down to the leaves.",
    },
    {
      id: "routing",
      section: "§1 · Routing is the file system",
      questions: [
        {
          prompt: "In the App Router, which file makes `/problems/two-sum` a page?",
          options: ["app/problems/[slug]/page.tsx", "app/problems/[slug]/route.ts", "app/problems/slug/page.tsx", "pages/problems/[slug].tsx"],
          correct: 0,
          why: "Folders are URL segments, `[slug]` is a dynamic segment, and only a `page.tsx` makes a segment routable. A `route.ts` there would be an API endpoint, `slug/` (no brackets) matches only the literal `/problems/slug`, and `pages/` is the old Pages Router.",
        },
        {
          prompt: "A sidebar keeps its scroll position when you move from one problem to the next. Why?",
          options: [
            "The browser restores the scroll after every navigation",
            "Next saves the whole page into localStorage first",
            "It's in a layout, which persists across navigation",
            "Each page re-renders the sidebar identically each time",
          ],
          correct: 2,
          why: "A layout wraps its subtree and persists across navigation within it: its state and scroll survive while the page underneath swaps. Rebuild the shell in every page instead, and the sidebar resets on each click.",
        },
        {
          prompt: "What does a `loading.tsx` file do for its route segment?",
          options: [
            "It preloads the data before the page renders",
            "It wraps the segment in a Suspense boundary",
            "It shows a spinner until the JavaScript loads",
            "It blocks navigation until the page is ready",
          ],
          correct: 1,
          why: "`loading.tsx` is sugar for a React Suspense boundary around the page: Next shows it instantly while the async page streams in. It doesn't fetch anything and doesn't wait for JavaScript; it's what lets navigation feel immediate.",
        },
      ],
      explain:
        "Sketch the `app/` folders for CodeArena's `/problems` list and `/problems/[slug]` page, with a shared layout and a loading state, and say what each file does.",
    },
    {
      id: "data",
      section: "§2 · Fetching data",
      questions: [
        {
          prompt: "`const user = await getUser(); const posts = await getPosts();` The two calls are independent. What's the problem?",
          options: [
            "The second call overwrites the first one's result",
            "Server Components can await only one promise each",
            "Nothing: Next runs awaited calls in parallel anyway",
            "They run in sequence: a waterfall of requests",
          ],
          correct: 3,
          why: "Each `await` waits for its promise before the next line starts, so the page takes the sum of both latencies. Start both, then wait once: `const [user, posts] = await Promise.all([getUser(), getPosts()])` takes the slower of the two.",
        },
        {
          prompt: "What does `cache: \"force-cache\"` add to a `fetch` in a Server Component?",
          options: [
            "It keeps the response in Next's server-side cache",
            "It keeps the response in the browser's cache",
            "It keeps the response for this render only",
            "It keeps the response until the server restarts",
          ],
          correct: 0,
          why: "In Next.js 16 caching is opt-in; `force-cache` stores the response in Next's server-side cache, matched on URL, method, headers and body ([fetch reference](https://nextjs.org/docs/app/api-reference/functions/fetch)). \"This render only\" describes memoization, which happens anyway; the browser's HTTP cache isn't involved on the server.",
        },
        {
          prompt: "Two components on one page call the same `fetch(url)` with GET. How many network requests does that render make?",
          options: [
            "Two: each component makes its own request",
            "One, but only when force-cache is set",
            "One: Next memoizes it within the render",
            "Two, unless both fetches share a tag",
          ],
          correct: 2,
          why: "Identical `GET` fetches (same URL and options) are memoized during one server render: Next executes it once and shares the result. That's separate from caching: memoization lasts one render pass, the cache persists across requests ([fetch reference](https://nextjs.org/docs/app/api-reference/functions/fetch#memoization)).",
        },
      ],
      explain:
        "Explain the difference between memoization, the server-side cache and a `revalidate` window, with one CodeArena example of where you'd use each.",
    },
    {
      id: "mutations",
      section: "§3–4 · Server Actions and route handlers",
      questions: [
        {
          prompt: "A Server Action inserts a row, but the list page still shows the old data. What's missing?",
          options: [
            "Expiring the cache behind the old list page",
            "A fetch from the client after each submit",
            "A second action reading the new row back",
            "A use client directive at the list's top",
          ],
          correct: 0,
          why: "The write happened, but the rendered list is cached and nothing told Next it's stale. Writing the data and invalidating what displayed it are two separate steps, and you own the second: `revalidatePath(\"/things\")`, or `updateTag(\"things\")` for tagged data.",
        },
        {
          prompt: "Inside a Server Action, which call makes the user see their own write on the very next request?",
          options: [
            "revalidateTag with the tag as its only argument",
            "updateTag on the tag the list fetch uses",
            "router.refresh, called in the body of the action",
            "a redirect to the same page, no revalidation",
          ],
          correct: 1,
          why: "`updateTag` works only in Server Actions and expires the tag immediately, so the next request waits for fresh data: read-your-own-writes ([updateTag](https://nextjs.org/docs/app/api-reference/functions/updateTag)). One-argument `revalidateTag` is deprecated in Next.js 16, and `router.refresh` is a client-side hook.",
        },
        {
          prompt: "`useFormStatus()` is called in the same component that renders the `<form>`. What does `pending` do?",
          options: [
            "It turns true while the action runs",
            "It throws, since hooks cannot read forms",
            "It works only after the first submission",
            "It stays false: it reads parent forms",
          ],
          correct: 3,
          why: "`useFormStatus` \"only returns status information for a parent `<form>`\", not one rendered in the same component ([React docs](https://react.dev/reference/react-dom/hooks/useFormStatus)). Move the button into a child component rendered inside the form.",
        },
        {
          prompt: "A payment provider will call your app with a webhook. What do you build?",
          options: [
            "A Server Action, because actions accept any POST",
            "A Server Component that reads the request body",
            "A route handler, because webhooks need public URLs",
            "A layout that listens for the webhook's event",
          ],
          correct: 2,
          why: "A webhook needs a stable URL a third party can POST to: a `route.ts` exporting `POST`. Server Actions are called by your own forms through an id Next generates, not a URL you hand out. And invalidate from there with `revalidateTag(tag, \"max\")`, since `updateTag` is action-only.",
        },
      ],
      explain:
        "Describe a submit-solution form built with a Server Action: what runs where, how the button shows it's pending, and how the submissions list gets fresh data.",
    },
    {
      id: "navigation",
      section: "§5 · Navigation and redirects",
      questions: [
        {
          prompt: "An App Router component imports `useRouter` from `next/router`. What happens?",
          options: [
            "It fails: App Router hooks are in next/navigation",
            "It works, but every navigation reloads the page",
            "It works the same: both modules are aliases",
            "It fails only when the page gets prerendered",
          ],
          correct: 0,
          why: "`next/router` belongs to the Pages Router; in the App Router its router isn't mounted, so it errors at runtime. `useRouter`, `usePathname`, `useSearchParams` and `useParams` come from `next/navigation`, and only work in Client Components.",
        },
        {
          prompt: "A Server Component checks the session and calls `redirect('/login')`. Why is that safer than redirecting in the browser?",
          options: [
            "It is faster, since no client JavaScript runs",
            "Protected content is never sent to the browser",
            "It keeps the protected page out of history",
            "It lets the browser prefetch the login page",
          ],
          correct: 1,
          why: "`redirect()` throws during the server render, so nothing after it runs and the protected content is never rendered or sent. A client-side redirect runs after the page (and its data) has already arrived in the browser.",
        },
        {
          prompt: "Why use `<Link href>` rather than `<a href>` for a link inside the app?",
          options: [
            "It opens every linked page inside a new tab",
            "It validates the URL at build time against routes",
            "It sends the session cookie along with the request",
            "It prefetches the target and avoids a full reload",
          ],
          correct: 3,
          why: "`<Link>` prefetches the target route in the background and navigates client-side, swapping only what changed, so clicks feel instant. A plain `<a>` reloads the whole document and throws away client state.",
        },
      ],
      explain:
        "When do you use `redirect()` and when `router.push()`? Give one CodeArena case for each, and say where each one runs.",
    },
  ],
};
