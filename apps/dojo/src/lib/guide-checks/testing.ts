/**
 * Checks for the Testing guide (content/supplements/testing.md). Checked on
 * 3 Nov 2026 against testing-library.com (query priority, get/query/find) and
 * Ham Vocke's "The Practical Test Pyramid" (martinfowler.com).
 */
import type { GuideCheckSet } from "./types";

export const testingChecks: GuideCheckSet = {
  name: "Testing guide",
  source: {
    label: "Ham Vocke, “The Practical Test Pyramid” (martinfowler.com)",
    href: "https://martinfowler.com/articles/practical-test-pyramid.html",
    note: "The best long read on what to test at each level, with real code. Pair it with Testing Library's [query priority](https://testing-library.com/docs/queries/about/) page.",
  },
  terms: [
    "Test pyramid",
    "Structural equality",
    "Flaky test",
    "Spy",
    "Stub",
    "Module mock",
    "Branch coverage",
    "Arrange–Act–Assert",
  ],
  checks: [
    {
      id: "pyramid",
      section: "Why test, and the pyramid",
      questions: [
        {
          prompt: "CI takes 40 minutes and about one run in ten fails with no code change. What shape is the suite?",
          options: [
            "A pyramid: many units, a few end-to-end tests",
            "A diamond: mostly integration tests in the middle",
            "An ice-cream cone: mostly E2E, few unit tests",
            "A flat line: one test type for everything",
          ],
          correct: 2,
          why: "Mostly end-to-end tests, few units: slow, and flaky because every run drives a real browser through real timing. The fix is to push logic down, verifying behaviour in fast unit and component tests and keeping E2E for a few critical journeys. Confidence per second is the metric.",
        },
        {
          prompt: "Day to day, what's the main value of a good test suite?",
          options: [
            "A safety net that lets you refactor fearlessly",
            "A score that proves the code is bug-free",
            "A route to pushing line coverage to 100%",
            "A record that the reviewers read before merging",
          ],
          correct: 0,
          why: "Catching today's bugs is the smaller payoff. The big one is changing code tomorrow without fear: green suite, ship. Tests also document the contract (a lying test fails, a lying comment doesn't) and push you toward code that's easier to use.",
        },
      ],
      explain:
        "Explain the test pyramid and the ice-cream cone, and say how you'd fix a 40-minute, flaky CI suite.",
    },
    {
      id: "matchers",
      section: "Vitest, matchers and async",
      questions: [
        {
          prompt: "`expect(makeUser('Ada')).toBe({ name: 'Ada', role: 'user' })` fails, though the fields match. Why?",
          options: [
            "toBe requires a third argument for objects",
            "The two objects list their keys differently",
            "toBe only accepts numbers, strings or booleans",
            "toBe checks identity; toEqual checks the values",
          ],
          correct: 3,
          why: "`toBe` is `Object.is`: two distinct objects are never the same reference, so it always fails. `toEqual` walks the structure recursively; `toStrictEqual` also cares about `undefined` properties and class versus plain object.",
        },
        {
          prompt: "A test writes `expect(fetchName()).resolves.toBe('Ada')` with no `await`. What happens?",
          options: [
            "It fails, because Vitest insists on the await",
            "It can pass even when the promise rejects",
            "It runs twice, once before the promise settles",
            "It throws, as resolves needs a callback first",
          ],
          correct: 1,
          why: "Without `await`, the test function returns before the promise settles, so the runner sees a finished test with no failure. `.resolves` and `.rejects` are inert unless awaited. Missing awaits are the top source of falsely green async tests.",
        },
      ],
      explain:
        "Explain `toBe` versus `toEqual` versus `toStrictEqual`, and why a missing `await` makes an async test pass falsely.",
    },
    {
      id: "rtl",
      section: "React Testing Library",
      questions: [
        {
          prompt: "Which query asserts that an error message is *not* on the screen?",
          options: [
            "getByText, which throws when the text is missing",
            "findByText, which waits for the text to appear",
            "queryByText, which returns null when it is missing",
            "getByTestId, since the text of messages may change",
          ],
          correct: 2,
          why: "`queryBy*` returns `null` instead of throwing, so `expect(screen.queryByText(\"Error\")).not.toBeInTheDocument()` works. `getBy*` throws when the element is missing, so it can't express absence ([Testing Library: queries](https://testing-library.com/docs/queries/about/)).",
        },
        {
          prompt: "Why prefer `getByRole` over `getByTestId`?",
          options: [
            "It also fails when assistive tech can't see it",
            "It runs faster because roles are cached by React",
            "It works without ever rendering the component at all",
            "It matches more elements, so tests break less often",
          ],
          correct: 0,
          why: "A role query finds elements the way a user or a screen reader does, so it survives markup refactors and fails when an element is invisible to assistive technology: a free accessibility check. A test id passes whether or not anyone can perceive the element; it's the last resort.",
        },
        {
          prompt: "A name appears only after a fetch resolves. How do you wait for it?",
          options: [
            "getBy, because it throws a readable error",
            "queryBy, because it returns null while loading",
            "Sleep one second with setTimeout, then getBy",
            "findBy, because it retries until it appears",
          ],
          correct: 3,
          why: "`findBy*` returns a promise that retries until the element appears (or times out): `getBy*` plus `waitFor` in one. A fixed sleep is how tests turn flaky: too short on a slow machine, wasted time on a fast one.",
        },
      ],
      explain:
        "State RTL's guiding principle, then pick the query (get, query or find) for: a button that's there now, an error that must be absent, and a name that appears after a fetch.",
    },
    {
      id: "doubles",
      section: "Doubles, Playwright, flakiness, coverage",
      questions: [
        {
          prompt: "Which sentence matches the three kinds of test double?",
          options: [
            "Spies replace, stubs observe, mocks supply",
            "Spies observe, stubs supply, mocks replace",
            "Spies supply, stubs replace, mocks observe",
            "Spies observe, stubs replace, mocks supply",
          ],
          correct: 1,
          why: "A spy records calls without changing behaviour (`vi.fn()`, `toHaveBeenCalledWith`). A stub supplies a canned answer (`mockResolvedValue`). A module mock replaces a whole import (`vi.mock`, hoisted, so its factory can't use outer variables).",
        },
        {
          prompt: "A test fails only when it runs after a certain other file. Most likely cause?",
          options: [
            "The clock: a date that changes daily",
            "The network: a server that answers slowly",
            "Shared state leaking from an earlier test",
            "Randomness: a random generator with no seed",
          ],
          correct: 2,
          why: "Order-dependent failures mean something survives between tests: a mock never cleared, a module singleton, leftover DOM. Reset in `beforeEach`/`afterEach` (`vi.clearAllMocks()`). Retrying hides flakiness; fixing the source removes it.",
        },
        {
          prompt: "What does 100% line coverage prove?",
          options: [
            "Every line ran, not that results were checked",
            "Every branch went both ways during the run",
            "Every function gives the right output for inputs",
            "Every edge case was exercised by some test",
          ],
          correct: 0,
          why: "Coverage records that lines executed. A test with no `expect` still marks its lines covered. Branch coverage is stronger (both sides of each `if`), but neither can tell whether the assertions mean anything. Use coverage to find untested code, not as a score.",
        },
        {
          prompt: "In Playwright, what replaces `await page.waitForTimeout(500)` before checking for \"Saved\"?",
          options: [
            "A longer waitForTimeout, so slow machines pass too",
            "A retry setting, so flaky runs pass eventually",
            "A screenshot comparison taken after a fixed delay",
            "A web-first assertion that retries until it's true",
          ],
          correct: 3,
          why: "`await expect(page.getByText(\"Saved\")).toBeVisible()` takes a locator, re-queries and re-checks until the condition holds or times out. Fixed sleeps are both slow and flaky: the number-one E2E anti-pattern.",
        },
      ],
      explain:
        "Name the four usual sources of flakiness and the fix for each, then say what 100% coverage does and doesn't prove.",
    },
  ],
};
