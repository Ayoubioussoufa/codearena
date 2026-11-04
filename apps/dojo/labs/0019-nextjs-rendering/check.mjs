// Lesson 0019 checker: your renderer, then your problem page.
import { existsSync } from "node:fs";
import { h, server, client, use } from "./kit.mjs";
import { API_TOKEN } from "./components.mjs";
const { renderPage } = await import("./render.mjs");
const tty = process.stdout.isTTY;
const c = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c(32), red = c(31), dim = c(2), bold = c(1);
let passed = 0, failed = 0;
const pad = (s) => s.padEnd(54);
async function check(label, fn) {
  try { const note = await fn(); passed++; console.log(`  ${green("✓")} ${pad(label)} ${dim(note ?? "")}`); }
  catch (e) { failed++; console.log(`  ${red("✗")} ${pad(label)} ${e.message}`); }
}
const eq = (got, want, what) => { if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${what}:\n      expected ${JSON.stringify(want)}\n      got      ${JSON.stringify(got)}`); };
const throwsLike = async (fn, patterns, what) => {
  try { await fn(); } catch (e) { for (const p of patterns) if (!p.test(e.message)) throw new Error(`${what}: the error "${e.message}" should match ${p}`); return; }
  throw new Error(`${what}: no error was thrown`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SCRIPT = (payload) => `<script type="application/json" id="__islands">${JSON.stringify(payload).replace(/</g, "\\u003c")}</script>`;

console.log(`\n${bold("1. HTML")}`);
await check("elements, text, attributes", async () => {
  const { html } = await renderPage(h("p", { class: "a", hidden: true, title: null, lang: undefined, translate: false }, "x < y ", 3, null, false, ["a", "b"]));
  eq(html, `<p class="a" hidden>x &lt; y 3ab</p>`, "html");
});
await check("escaping in attributes and text", async () => {
  const { html } = await renderPage(h("a", { href: `/x?a=1&b="2"` }, "it's <b>"));
  eq(html, `<a href="/x?a=1&amp;b=&quot;2&quot;">it&#39;s &lt;b&gt;</a>`, "html");
});
await check("void elements", async () => { eq((await renderPage(h("p", {}, h("input", { name: "q", value: "" }), h("br")))).html, `<p><input name="q" value=""><br></p>`, "html"); });

console.log(`\n${bold("2. Server components")}`);
const Hello = server("Hello", async ({ who }) => { await sleep(5); return h("p", {}, "hi ", who); });
await check("an async server component, awaited on the server", async () => {
  const r = await renderPage(use(Hello, { who: "ada" }));
  eq(r, { html: "<p>hi ada</p>", clientComponents: [], payload: [] }, "result");
  return "no JavaScript for the browser";
});
await check("server components inside server components", async () => {
  const Page = server("Page", async () => h("main", {}, use(Hello, { who: "a" }), use(Hello, { who: "b" })));
  eq((await renderPage(use(Page))).html, "<main><p>hi a</p><p>hi b</p></main>", "html");
});
await check("an event handler in a server component is refused", async () => {
  const Bad = server("BadButton", () => h("button", { onClick: () => {} }, "x"));
  await throwsLike(() => renderPage(use(Bad)), [/event handler/i, /BadButton/], "error");
});

console.log(`\n${bold("3. Client components: islands")}`);
const Counter = client("Counter", ({ start }) => h("button", { type: "button", onClick: () => {} }, String(start)));
await check("rendered on the server, inside an island", async () => {
  const r = await renderPage(h("main", {}, use(Counter, { start: 0 })));
  const payload = [{ id: 0, component: "Counter", props: { start: 0 } }];
  eq(r, { html: `<main><div data-island="0"><button type="button">0</button></div></main>${SCRIPT(payload)}`, clientComponents: ["Counter"], payload }, "result");
  return "handlers left out of the HTML";
});
await check("the same client component twice: its code once", async () => {
  const r = await renderPage(h("div", {}, use(Counter, { start: 1 }), use(Counter, { start: 2 })));
  eq(r.clientComponents, ["Counter"], "clientComponents"); eq(r.payload.map((p) => p.id), [0, 1], "payload ids");
});
await check("a client component inside a client component: one island", async () => {
  const Toolbar = client("Toolbar", () => h("nav", {}, use(Counter, { start: 5 })));
  const r = await renderPage(use(Toolbar));
  eq(r.payload.length, 1, "islands"); eq(r.clientComponents, ["Toolbar", "Counter"], "clientComponents");
  return "both ship: the browser renders Counter itself";
});
await check("a function prop for a client component is refused", async () => {
  const Form = client("Form", () => h("form", {}));
  await throwsLike(() => renderPage(use(Form, { onSave: () => {} })), [/Form/, /props\.onSave/, /serializ/i], "error");
  await throwsLike(() => renderPage(use(Form, { config: { retry: { cb: () => {} } } })), [/props\.config\.retry\.cb/], "nested error");
  await throwsLike(() => renderPage(use(Form, { when: new (class Clock {})() })), [/props\.when/], "class instance error");
});
await check("an async client component is refused", async () => {
  const Slow = client("SlowWidget", async () => h("p", {}, "x"));
  await throwsLike(() => renderPage(use(Slow)), [/SlowWidget/, /async/i], "error");
});
await check("a server component inside a client component is refused", async () => {
  const Secretive = server("Secretive", async () => h("p", {}, API_TOKEN));
  const Shell = client("Shell", () => h("div", {}, use(Secretive)));
  await throwsLike(() => renderPage(use(Shell)), [/Secretive/, /Shell/], "error");
});
await check("…but passed in as children, it renders on the server", async () => {
  const Panel = client("Panel", ({ children, open }) => h("details", { open }, h("summary", {}, "More"), children));
  const r = await renderPage(use(Panel, { open: true, children: use(Hello, { who: "ada" }) }));
  const payload = [{ id: 0, component: "Panel", props: { open: true, children: { $html: "<p>hi ada</p>" } } }];
  eq(r.html, `<div data-island="0"><details open><summary>More</summary><p>hi ada</p></details></div>${SCRIPT(payload)}`, "html");
  eq(r.payload, payload, "payload");
  return "the donut: client outside, server inside";
});
await check("props can't break out of the payload script", async () => {
  const Title = client("Title", ({ text }) => h("h1", {}, text));
  const evil = "</script><script>alert(1)</script>";
  const r = await renderPage(use(Title, { text: evil }));
  if (r.html.includes("</script><script>alert")) throw new Error("the payload closes its own <script>: an XSS");
  const json = /<script type="application\/json" id="__islands">(.*)<\/script>$/s.exec(r.html)?.[1];
  if (!json) throw new Error("no payload script at the end of the html");
  eq(JSON.parse(json)[0].props.text, evil, "the payload, parsed back");
});

console.log(`\n${bold("4. Your problem page")}`);
if (!existsSync(new URL("./problem-page.mjs", import.meta.url))) {
  console.log(dim("  · no problem-page.mjs yet: cp problem-page.start.mjs problem-page.mjs"));
  failed++;
} else {
  const { ProblemPage } = await import("./problem-page.mjs");
  let page;
  await check("it renders: statement, examples, starter code", async () => {
    page = await renderPage(use(ProblemPage, { slug: "two-sum" }));
    for (const t of ["Given an array of integers", "2 7 11 15", "def solve(nums, target):", "Submit"]) if (!page.html.includes(t)) throw new Error(`the html lacks "${t}"`);
  });
  if (page) {
    await check("the title is escaped", async () => { if (!page.html.includes("Two Sum &lt;b&gt;easy&lt;/b&gt;")) throw new Error("the title's <b> should arrive as text, escaped"); });
    await check("only the interactive parts ship JavaScript", async () => {
      eq([...page.clientComponents].sort(), ["Editor", "SubmitButton"], "clientComponents");
      return `the browser downloads ${page.clientComponents.length} components`;
    });
    await check("the statement is in the HTML, not shipped twice", async () => {
      const json = JSON.stringify(page.payload);
      if (json.includes("Given an array of integers")) throw new Error("the statement is in the payload: it's a client prop, so it ships twice");
      return `payload: ${json.length} bytes`;
    });
    await check("the API token never reaches the browser", async () => { if (page.html.includes(API_TOKEN) || JSON.stringify(page.payload).includes(API_TOKEN)) throw new Error("the token is in the page"); });
  }
}

console.log();
if (failed === 0) console.log(`${green(bold(`All ${passed} cases pass.`))} Tell your teacher: done 0019.`);
else console.log(`${bold(`${passed} passed, ${red(`${failed} failed`)}.`)}`);
process.exit(failed === 0 ? 0 : 1);
