/**
 * Coding track: Testing — write the tests. Vitest assertions → React Testing
 * Library (render, role queries, userEvent, async findBy, mocks) → Playwright
 * end-to-end. Graded by STRUCTURE checks (the frameworks can't run in the
 * sandbox worker), so a pass means the test is shaped the way a real one is:
 * the right query, the right matcher, awaited interactions.
 *
 * Drills the Testing supplement guide.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingTrack } from "../coding";

const DOC = { slug: "testing", label: "Dojo guide — Testing" };

/* ── Level 1 — a first Vitest test ── */

const firstTest: Generator = {
  id: "test-first",
  title: "Your first Vitest test",
  generate: () =>
    codeTask({
      genId: "test-first",
      prompt:
        "Context: a Vitest test is a named case containing assertions, each stating what an actual value should be. For primitives (numbers, strings, booleans) you assert strict `===` equality.\n\nTask: write a test named \"adds two numbers\" that asserts `sum(2, 3)` equals `5`.",
      language: "typescript",
      starter:
        'import { test, expect } from "vitest";\nimport { sum } from "./sum";\n\n// write the test here\n',
      solution:
        'import { test, expect } from "vitest";\nimport { sum } from "./sum";\n\ntest("adds two numbers", () => {\n  expect(sum(2, 3)).toBe(5);\n});',
      checks: [
        { re: "test\\s*\\(\\s*['\"]", label: "declares a `test(\"…\", …)` case" },
        { re: "expect\\s*\\(\\s*sum\\s*\\(", label: "calls `expect(sum(…))`" },
        { re: "\\.toBe\\s*\\(\\s*5\\s*\\)", label: "asserts `.toBe(5)`" },
      ],
      hint: "The shape is `test(\"name\", () => { expect(actual).toBe(expected); })`. Put `sum(2, 3)` inside `expect(...)` and `5` inside `.toBe(...)`.",
      explanation:
        "Every test framework is this triple: a named case, an ACTUAL value under `expect`, and a matcher stating the EXPECTED. `toBe` uses `Object.is`/`===`, so it's for numbers, strings, booleans — never objects/arrays (two equal-looking objects aren't `===`). A good test name reads like a spec sentence: “adds two numbers”, not “test1”.",
      docRef: DOC,
    }),
};

const describeGroup: Generator = {
  id: "test-describe",
  title: "Grouping with describe / it",
  generate: () =>
    codeTask({
      genId: "test-describe",
      prompt:
        "Context: `describe` groups related cases; `it` is an alias for `test` that reads as a sentence.\n\nTask: group TWO cases inside a `describe(\"sum\", …)` block — one asserting `sum(2, 3)` is `5`, the other asserting `sum(0, 0)` is `0`.",
      language: "typescript",
      starter:
        'import { describe, it, expect } from "vitest";\nimport { sum } from "./sum";\n\n// group two it() cases under describe("sum", …)\n',
      solution:
        'import { describe, it, expect } from "vitest";\nimport { sum } from "./sum";\n\ndescribe("sum", () => {\n  it("adds two positives", () => {\n    expect(sum(2, 3)).toBe(5);\n  });\n\n  it("returns 0 for two zeros", () => {\n    expect(sum(0, 0)).toBe(0);\n  });\n});',
      checks: [
        { re: "describe\\s*\\(\\s*['\"]", label: "wraps cases in `describe(\"…\", …)`" },
        { re: "(it|test)\\s*\\(\\s*['\"][^'\"]+['\"][\\s\\S]*?(it|test)\\s*\\(\\s*['\"]", label: "has at least two `it(...)` cases" },
        { re: "\\.toBe\\s*\\(\\s*0\\s*\\)", label: "asserts the `sum(0, 0)` → 0 case" },
      ],
      hint: "`describe(\"sum\", () => { it(\"…\", () => {…}); it(\"…\", () => {…}); })`. Each `it` holds one `expect`.",
      explanation:
        "`describe` blocks give you readable output (“sum › returns 0 for two zeros”) and a place to hang shared setup (`beforeEach`). `it` and `test` are identical — pick the one that makes the sentence read naturally. Grouping by the unit under test keeps a growing suite navigable.",
      docRef: DOC,
    }),
};

/* ── Level 2 — matchers that matter ── */

const toEqual: Generator = {
  id: "test-toequal",
  title: "toEqual for objects",
  generate: () =>
    codeTask({
      genId: "test-toequal",
      prompt:
        "Context: strict reference equality FAILS on two distinct objects that merely look identical, because they aren't the same reference — comparing objects needs structural (deep) equality instead.\n\nTask: assert that `makeUser(\"Ada\")` deep-equals `{ name: \"Ada\", role: \"user\" }`, choosing the matcher that compares by structure rather than by reference.",
      language: "typescript",
      starter:
        'import { test, expect } from "vitest";\nimport { makeUser } from "./user";\n\ntest("builds a user object", () => {\n  // assert the returned object deep-equals { name: "Ada", role: "user" }\n});',
      solution:
        'import { test, expect } from "vitest";\nimport { makeUser } from "./user";\n\ntest("builds a user object", () => {\n  expect(makeUser("Ada")).toEqual({ name: "Ada", role: "user" });\n});',
      checks: [
        { re: "\\.toEqual\\s*\\(", label: "uses `.toEqual(...)` for the object" },
        { re: "role\\s*:\\s*['\"]user['\"]", label: "asserts the full shape incl. `role: \"user\"`" },
        { re: "\\.toBe\\s*\\(\\s*\\{", expect: false, label: "does NOT use `.toBe({…})` (would fail on objects)" },
      ],
      hint: "`expect(makeUser(\"Ada\")).toEqual({ name: \"Ada\", role: \"user\" })`. `toEqual` walks the structure; `toBe` only passes when it's literally the same reference.",
      explanation:
        "This is the single most common beginner test bug: `expect(obj).toBe({…})` always fails because the two objects are different references. `toEqual` compares recursively by value. (Its cousin `toStrictEqual` also checks for `undefined` keys and class vs plain-object — reach for it when that distinction matters.)",
      docRef: DOC,
    }),
};

const asyncResolves: Generator = {
  id: "test-async",
  title: "Testing async code",
  generate: () =>
    codeTask({
      genId: "test-async",
      prompt:
        "Context: an async test must AWAIT its assertion, or the case ends before the promise settles and passes falsely.\n\nTask: in an `async` test, assert that `fetchName()` (which returns a Promise) resolves to `\"Ada\"` — awaiting an assertion that unwraps the resolved value.",
      language: "typescript",
      starter:
        'import { test, expect } from "vitest";\nimport { fetchName } from "./api";\n\ntest("resolves to the name", async () => {\n  // await the resolved value assertion\n});',
      solution:
        'import { test, expect } from "vitest";\nimport { fetchName } from "./api";\n\ntest("resolves to the name", async () => {\n  await expect(fetchName()).resolves.toBe("Ada");\n});',
      checks: [
        { re: "async\\s*\\(", label: "the test callback is `async`" },
        { re: "await\\s+expect\\s*\\(", label: "`await`s the assertion" },
        { re: "\\.resolves\\b", label: "uses `.resolves` to unwrap the promise" },
      ],
      hint: "`await expect(fetchName()).resolves.toBe(\"Ada\")`. Forgetting the `await` is the classic false-pass: the test finishes before the promise does.",
      explanation:
        "The `.resolves`/`.rejects` modifiers read cleanly and fail with a useful message if the promise settles the wrong way — but they're inert without `await`. The alternative is `const name = await fetchName(); expect(name).toBe(\"Ada\")`. Either works; both need the `await`. Missing awaits are the #1 source of flaky async tests.",
      docRef: DOC,
    }),
};

/* ── Level 3 — React Testing Library ── */

const renderQuery: Generator = {
  id: "test-render",
  title: "Render & query by role",
  generate: () =>
    codeTask({
      genId: "test-render",
      prompt:
        "Context: React Testing Library tests what the USER sees — you mount the component and find elements the way assistive tech does, by their role and accessible name.\n\nTask: render `<Greeting name=\"Ada\" />` and assert that a `heading` with the accessible name `\"Hello, Ada\"` is present in the document.",
      language: "typescript",
      starter:
        'import { render, screen } from "@testing-library/react";\nimport { Greeting } from "./Greeting";\n\ntest("greets the user by name", () => {\n  // render, then assert the heading is present\n});',
      solution:
        'import { render, screen } from "@testing-library/react";\nimport { Greeting } from "./Greeting";\n\ntest("greets the user by name", () => {\n  render(<Greeting name="Ada" />);\n  expect(\n    screen.getByRole("heading", { name: "Hello, Ada" }),\n  ).toBeInTheDocument();\n});',
      checks: [
        { re: "render\\s*\\(\\s*<Greeting", label: "renders `<Greeting name=\"Ada\" />`" },
        { re: "getByRole\\s*\\(\\s*['\"]heading['\"]", label: "queries `getByRole(\"heading\", …)`" },
        { re: "toBeInTheDocument\\s*\\(", label: "asserts `.toBeInTheDocument()`" },
      ],
      hint: "`render(<Greeting name=\"Ada\" />)`, then `expect(screen.getByRole(\"heading\", { name: \"Hello, Ada\" })).toBeInTheDocument()`. The `name` option matches the element's visible/accessible text.",
      explanation:
        "Querying by ROLE (not by class or a test id) is RTL's core principle: your test then mirrors how a real user — and a screen reader — finds the element, so it survives refactors and catches accessibility regressions. `getBy*` throws if the element is missing (a built-in assertion); `queryBy*` returns null (use it to assert ABSENCE).",
      docRef: DOC,
    }),
};

const userEventClick: Generator = {
  id: "test-userevent",
  title: "Simulating a click",
  generate: () =>
    codeTask({
      genId: "test-userevent",
      prompt:
        "Context: real user interaction (focus, keydown, click) is simulated by RTL's companion `user-event` library, and it's ASYNC — every action returns a promise you must await.\n\nTask: render `<Counter />`, click the button named `/increment/i`, then assert the text `\"1\"` is shown. Remember to set up the interaction session first and await the click.",
      language: "typescript",
      starter:
        'import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\nimport { Counter } from "./Counter";\n\ntest("increments when clicked", async () => {\n  // setup user, render, click the increment button, assert "1" shows\n});',
      solution:
        'import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\nimport { Counter } from "./Counter";\n\ntest("increments when clicked", async () => {\n  const user = userEvent.setup();\n  render(<Counter />);\n  await user.click(screen.getByRole("button", { name: /increment/i }));\n  expect(screen.getByText("1")).toBeInTheDocument();\n});',
      checks: [
        { re: "userEvent\\.setup\\s*\\(", label: "creates a session with `userEvent.setup()`" },
        { re: "await\\s+user\\.click\\s*\\(", label: "`await`s `user.click(...)`" },
        { re: "getByRole\\s*\\(\\s*['\"]button['\"]", label: "targets the button by role" },
      ],
      hint: "`const user = userEvent.setup(); render(<Counter />); await user.click(screen.getByRole(\"button\", { name: /increment/i }));` then assert `getByText(\"1\")`.",
      explanation:
        "`userEvent` beats the older `fireEvent` because it fires the FULL sequence a real click produces, catching bugs `fireEvent.click` misses. The `await` is mandatory — skip it and your assertion runs before React re-renders, so it reads the old DOM. Regex names like `/increment/i` make the query resilient to casing and surrounding text.",
      docRef: DOC,
    }),
};

const queryPriority: Generator = {
  id: "test-query-priority",
  title: "Query priority — role over testid",
  generate: () =>
    codeTask({
      genId: "test-query-priority",
      prompt:
        "Context: RTL has a query PRIORITY — prefer queries a user can perceive (role, label, text) and treat test-id lookups as a last resort, since a test id couples the test to an implementation detail.\n\nTask: find the submit button by its ROLE and accessible name `/submit/i` (NOT by a test id), and assert that it is enabled.",
      language: "typescript",
      starter:
        'import { render, screen } from "@testing-library/react";\nimport { CheckoutForm } from "./CheckoutForm";\n\ntest("submit button is enabled", () => {\n  render(<CheckoutForm />);\n  // find the submit button by ROLE, not by test id, then assert it is enabled\n});',
      solution:
        'import { render, screen } from "@testing-library/react";\nimport { CheckoutForm } from "./CheckoutForm";\n\ntest("submit button is enabled", () => {\n  render(<CheckoutForm />);\n  expect(\n    screen.getByRole("button", { name: /submit/i }),\n  ).toBeEnabled();\n});',
      checks: [
        { re: "getByRole\\s*\\(\\s*['\"]button['\"]", label: "queries the button by role" },
        { re: "toBeEnabled\\s*\\(", label: "asserts `.toBeEnabled()`" },
        { re: "getByTestId", expect: false, label: "avoids `getByTestId` (last-resort only)" },
      ],
      hint: "`screen.getByRole(\"button\", { name: /submit/i })` then `.toBeEnabled()`. Resist reaching for `data-testid` — role + accessible name is more robust and tests accessibility for free.",
      explanation:
        "The priority order is roughly: `getByRole` → `getByLabelText` (forms) → `getByText` → … → `getByTestId` (escape hatch). Querying by test id passes even if the button is invisible to a screen reader, so it can hide real accessibility bugs. Save test ids for elements with no role or text you can target.",
      docRef: DOC,
    }),
};

/* ── Level 4 — async UI & mocking ── */

const findByAsync: Generator = {
  id: "test-findby",
  title: "Awaiting async UI with findBy",
  generate: () =>
    codeTask({
      genId: "test-findby",
      prompt:
        "Context: when content appears AFTER an async effect resolves, a synchronous query runs too early and throws. You need the query variant that retries until the element shows up (or times out).\n\nTask: render `<Profile />`, then assert that the text `\"Ada Lovelace\"` eventually appears — awaiting that retrying async query.",
      language: "typescript",
      starter:
        'import { render, screen } from "@testing-library/react";\nimport { Profile } from "./Profile";\n\ntest("shows the name after loading", async () => {\n  render(<Profile />);\n  // the name arrives after a fetch — await it appearing\n});',
      solution:
        'import { render, screen } from "@testing-library/react";\nimport { Profile } from "./Profile";\n\ntest("shows the name after loading", async () => {\n  render(<Profile />);\n  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();\n});',
      checks: [
        { re: "await\\s+screen\\.findByText\\s*\\(", label: "`await`s `screen.findByText(...)`" },
        { re: "Ada Lovelace", label: "waits for the resolved text" },
        { re: "toBeInTheDocument\\s*\\(", label: "asserts presence once it appears" },
      ],
      hint: "`expect(await screen.findByText(\"Ada Lovelace\")).toBeInTheDocument()`. `findBy*` = `getBy*` + `waitFor`, so it polls until the element exists.",
      explanation:
        "Rule of thumb: `getBy` for what's there synchronously, `findBy` for what appears after an await, `queryBy` for asserting something is NOT there. Reaching for `findBy` is almost always cleaner than a manual `waitFor(() => expect(getBy…))`. Never add a fixed `setTimeout` to 'wait for' UI — that's how tests turn flaky.",
      docRef: DOC,
    }),
};

const spyMock: Generator = {
  id: "test-spy",
  title: "Spying with vi.fn()",
  generate: () =>
    codeTask({
      genId: "test-spy",
      prompt:
        "Context: to test that a component CALLS a callback correctly, pass a SPY that records every call and its arguments, then assert on how it was invoked.\n\nTask: pass a spy as the `onSave` prop of `<Form />`, click the save button (`/save/i`), and assert that `onSave` was called with exactly `{ id: 1 }`.",
      language: "typescript",
      starter:
        'import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\nimport { vi } from "vitest";\nimport { Form } from "./Form";\n\ntest("calls onSave with the record", async () => {\n  const user = userEvent.setup();\n  // create a spy, render Form with it, click save, assert the call\n});',
      solution:
        'import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\nimport { vi } from "vitest";\nimport { Form } from "./Form";\n\ntest("calls onSave with the record", async () => {\n  const user = userEvent.setup();\n  const onSave = vi.fn();\n  render(<Form onSave={onSave} />);\n  await user.click(screen.getByRole("button", { name: /save/i }));\n  expect(onSave).toHaveBeenCalledWith({ id: 1 });\n});',
      checks: [
        { re: "vi\\.fn\\s*\\(", label: "creates a spy with `vi.fn()`" },
        { re: "onSave\\s*=\\s*\\{\\s*onSave\\s*\\}", label: "passes the spy as `onSave`" },
        { re: "toHaveBeenCalledWith\\s*\\(\\s*\\{", label: "asserts `toHaveBeenCalledWith({…})`" },
      ],
      hint: "`const onSave = vi.fn(); render(<Form onSave={onSave} />);` … then after the click, `expect(onSave).toHaveBeenCalledWith({ id: 1 })`.",
      explanation:
        "A `vi.fn()` spy records calls, arguments, and return values so you can assert `toHaveBeenCalled`, `toHaveBeenCalledTimes(n)`, and `toHaveBeenCalledWith(args)`. It lets you test a component's OUTPUT contract (what it invokes) without a real implementation — the boundary you'd otherwise have to stand up. Prefer asserting the exact arguments over just 'was called'.",
      docRef: DOC,
    }),
};

const moduleMock: Generator = {
  id: "test-mock-module",
  title: "Mocking a module",
  generate: () =>
    codeTask({
      genId: "test-mock-module",
      prompt:
        "Context: to keep a unit test off the network, you replace a whole imported module with fakes — a factory returns the fake exports, and an async fake can be made to resolve to a fixed value.\n\nTask: mock the `\"./api\"` module so that its `getUser` export is a spy that resolves to `{ name: \"Ada\" }`.",
      language: "typescript",
      starter:
        'import { vi } from "vitest";\n\n// mock "./api" so getUser resolves to { name: "Ada" }\n',
      solution:
        'import { vi } from "vitest";\n\nvi.mock("./api", () => ({\n  getUser: vi.fn().mockResolvedValue({ name: "Ada" }),\n}));',
      checks: [
        { re: "vi\\.mock\\s*\\(\\s*['\"]\\./api['\"]", label: "mocks the `\"./api\"` module" },
        { re: "getUser\\s*:", label: "provides a fake `getUser` export" },
        { re: "mockResolvedValue\\s*\\(", label: "resolves it with `mockResolvedValue(...)`" },
      ],
      hint: "`vi.mock(\"./api\", () => ({ getUser: vi.fn().mockResolvedValue({ name: \"Ada\" }) }))`. The factory's returned object replaces the module's real exports.",
      explanation:
        "Module mocks isolate the unit from slow or non-deterministic boundaries (network, time, randomness) so the test is fast and repeatable. `vi.mock` is HOISTED to the top of the file, so its factory can't reference outer variables — return the fakes inline. Use `mockResolvedValue`/`mockRejectedValue` for async, `mockReturnValue` for sync, and reset between tests (`vi.clearAllMocks()` in `beforeEach`) so calls don't leak across cases.",
      docRef: DOC,
    }),
};

/* ── Level 5 — end-to-end with Playwright ── */

const e2eFlow: Generator = {
  id: "test-e2e-flow",
  title: "An end-to-end user flow",
  generate: () =>
    codeTask({
      genId: "test-e2e-flow",
      prompt:
        "Context: Playwright drives a real browser through a whole flow — navigating, locating elements (by label or role), acting on them, and asserting.\n\nTask: write a Playwright test that navigates to `/login`, fills the `\"Email\"` field with `\"ada@example.com\"`, clicks the `\"Sign in\"` button, and asserts the browser URL is `\"/dashboard\"`.",
      language: "typescript",
      starter:
        'import { test, expect } from "@playwright/test";\n\ntest("logs in and lands on the dashboard", async ({ page }) => {\n  // goto /login, fill Email, click Sign in, assert URL is /dashboard\n});',
      solution:
        'import { test, expect } from "@playwright/test";\n\ntest("logs in and lands on the dashboard", async ({ page }) => {\n  await page.goto("/login");\n  await page.getByLabel("Email").fill("ada@example.com");\n  await page.getByRole("button", { name: "Sign in" }).click();\n  await expect(page).toHaveURL("/dashboard");\n});',
      checks: [
        { re: "page\\.goto\\s*\\(\\s*['\"]/login['\"]", label: "navigates with `page.goto(\"/login\")`" },
        { re: "\\.fill\\s*\\(\\s*['\"]ada@example\\.com['\"]", label: "fills the email field" },
        { re: "\\.click\\s*\\(", label: "clicks the sign-in button" },
        { re: "toHaveURL\\s*\\(\\s*['\"]/dashboard['\"]", label: "asserts `toHaveURL(\"/dashboard\")`" },
      ],
      hint: "Chain locators off `page`: `await page.getByLabel(\"Email\").fill(\"ada@example.com\")`, `await page.getByRole(\"button\", { name: \"Sign in\" }).click()`, then `await expect(page).toHaveURL(\"/dashboard\")`.",
      explanation:
        "E2E sits at the top of the test pyramid — few, slow, high-confidence: it exercises the real app end to end, catching wiring bugs unit tests can't. Playwright's web-first assertions (`toHaveURL`, `toBeVisible`) AUTO-RETRY until true, which is what kills the flakiness that plagued older Selenium suites — so you rarely need explicit waits. Keep E2E for critical journeys (login, checkout); push everything else down to cheaper unit/component tests.",
      docRef: DOC,
    }),
};

const e2eAutoWait: Generator = {
  id: "test-e2e-autowait",
  title: "Web-first assertions auto-wait",
  generate: () =>
    codeTask({
      genId: "test-e2e-autowait",
      prompt:
        "Context: Playwright's web-first assertions RETRY until the condition holds (or time out), so you assert on eventual UI without hand-written waits or `sleep`.\n\nTask: after the action, assert that a toast with the text `\"Saved\"` becomes visible — using an auto-retrying visibility assertion on the locator, with no manual wait.",
      language: "typescript",
      starter:
        'import { test, expect } from "@playwright/test";\n\ntest("shows a saved toast", async ({ page }) => {\n  await page.goto("/settings");\n  await page.getByRole("button", { name: "Save" }).click();\n  // assert the "Saved" toast becomes visible (let Playwright auto-wait)\n});',
      solution:
        'import { test, expect } from "@playwright/test";\n\ntest("shows a saved toast", async ({ page }) => {\n  await page.goto("/settings");\n  await page.getByRole("button", { name: "Save" }).click();\n  await expect(page.getByText("Saved")).toBeVisible();\n});',
      checks: [
        { re: "await\\s+expect\\s*\\(\\s*page\\.getByText\\s*\\(\\s*['\"]Saved['\"]", label: "awaits an assertion on the `Saved` locator" },
        { re: "toBeVisible\\s*\\(", label: "uses the auto-waiting `toBeVisible()`" },
        { re: "setTimeout|waitForTimeout", expect: false, label: "no hard-coded sleep/`waitForTimeout`" },
      ],
      hint: "`await expect(page.getByText(\"Saved\")).toBeVisible()`. Don't add a `waitForTimeout` — the web-first assertion already polls until the toast appears.",
      explanation:
        "Passing a LOCATOR (not a resolved element) into `expect` is what enables auto-retry: Playwright re-queries and re-checks until the condition holds or the timeout hits. This is the antidote to the number-one E2E anti-pattern — sprinkling `sleep(500)` to 'wait for' the UI, which is both slow and flaky. Assert the end state; let the framework wait.",
      docRef: DOC,
    }),
};

export const testingTrack: CodingTrack = {
  id: "coding-testing",
  title: "Testing (Vitest · RTL · Playwright)",
  icon: "🧪",
  stack: "TypeScript · Vitest · Playwright",
  blurb:
    "Write the tests, not just the code. Vitest matchers → React Testing Library (role queries, userEvent, findBy, mocks) → Playwright end-to-end. Checked for the shape a real test has: right query, right matcher, awaited.",
  exercises: [
    { level: 1, gen: firstTest },
    { level: 1, gen: describeGroup },
    { level: 2, gen: toEqual },
    { level: 2, gen: asyncResolves },
    { level: 3, gen: renderQuery },
    { level: 3, gen: userEventClick },
    { level: 3, gen: queryPriority },
    { level: 4, gen: findByAsync },
    { level: 4, gen: spyMock },
    { level: 4, gen: moduleMock },
    { level: 5, gen: e2eFlow },
    { level: 5, gen: e2eAutoWait },
  ],
};
