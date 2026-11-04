// @ts-check
/**
 * Lesson 0019: render a component tree the way React Server Components do.
 *
 *   cp render.start.mjs render.mjs        then write renderPage() below
 *
 * renderPage(node) resolves with { html, clientComponents, payload }:
 *
 *   html              the page's HTML. Rules:
 *     - text and attribute values are escaped: & < > " '  →  &amp; &lt; &gt; &quot; &#39;
 *     - <tag a="v" b>children</tag>; attributes in order; true → just the name;
 *       false, null and undefined → left out; br, hr, img, input, meta have no closing tag
 *     - null, undefined and false render nothing; numbers render as text; arrays concatenate
 *     - each client component renders inside <div data-island="N">…</div>, N = its payload index
 *     - if there are islands, the html ends with
 *       <script type="application/json" id="__islands">JSON of payload</script>
 *       with every "<" in that JSON written as < (so no text can close the script)
 *   clientComponents  the names of client components used, each once, in first-use order,
 *                     including client components rendered by client components: the only
 *                     component code the browser downloads. Only the outermost client
 *                     component of a subtree gets an island (the ones inside are its business).
 *   payload           [{ id, component, props }], one per island: what the browser needs to hydrate
 *
 * And the errors React gives you, with the component's name in the message:
 *   - a function as a prop of an element rendered by a SERVER component (an event handler):
 *     "…event handler… in server component <Name>"
 *   - a client component's prop that isn't serializable (a function, a symbol, a class instance):
 *     "…<Name>… prop <path> is not serializable", e.g. "props.onSave"
 *   - a client component whose render returns a Promise: "…client component <Name> cannot be async"
 *   - a server component rendered by a client component: "…<Server> inside client component <Client>"
 *     (pass it from a server component as a child instead: see the lesson)
 * Inside a client component, functions on elements are fine: they run in the browser, so
 * they're simply left out of the HTML.
 *
 * Children from the server (the "donut"): a client component's prop that is itself a node
 * (an element or a component, usually `children`) is rendered on the server FIRST. In the
 * payload it becomes { "$html": "<the html>" }; the client component receives
 * { type: "raw", html } in its place, and a raw node renders as its html, unescaped.
 */
export async function renderPage(node) {
  void node;
  throw new Error("Not written yet.");
}
