# Testing — Fundamentals

Testing is the skill that separates "it works on my machine" from "it works, and it keeps working while I change it." It's also the single thing interviewers probe most on a real codebase question — because tests are how you prove you understand your own code's contract. This guide takes you from a first `expect` to a full end-to-end browser flow, and pairs with two dojo tracks: the **Testing coding track** (write real Vitest / React Testing Library / Playwright tests, checked for shape) and the **Testing quiz topic** (the concepts, spaced-repeated).

The through-line: **test behaviour, not implementation.** A good test says "given this input, the user sees this output" — and survives every refactor that doesn't change that promise.


---

## ⌨️ This guide is interactive

**Eight exercises are embedded below.** The theme runs through all of them:

> **A test that passes when the code is broken is worse than no test**, because it buys false
> confidence.

Most are repairs of assertions that look right and prove nothing — a `toBeTruthy` that a wrong
answer satisfies, a `.resolves` with no `await`, a `toHaveBeenCalled` that passes when the function
returns nothing.
## Why test at all

Three payoffs, in order of how much they matter day to day:

1. **A safety net for change.** The real value isn't catching bugs today; it's letting you refactor fearlessly tomorrow. Green suite → ship. Red suite → you just learned something before your users did.
2. **Executable documentation.** A well-named test (`it("returns 0 for an empty cart")`) tells the next reader what the code is *supposed* to do, and it can't rot silently the way a comment can — if it lies, it fails.
3. **Design pressure.** Code that's hard to test is usually hard to use: too many dependencies, hidden state, side effects tangled with logic. Writing the test first often reveals a better shape.

## The test pyramid

Not all tests cost the same. The **pyramid** is a shape for a healthy suite:

- **Unit tests (the wide base).** A single function/component in isolation. Milliseconds each, deterministic, pinpoint failures. Write thousands.
- **Integration tests (the middle).** A few pieces together — a component with its store, a route with its handler. Slower, broader.
- **End-to-end tests (the narrow top).** The real app in a real browser, driven like a user. Seconds to minutes each, occasionally flaky, but the highest confidence. Keep a *few*, for critical journeys (login, checkout, submit).

The anti-pattern is the **ice-cream cone**: mostly E2E, few units. Symptoms are a 40-minute CI run and tests that fail ~10% of the time for no code reason. The fix is almost always to **push logic down** — verify a behaviour with a fast component test instead of a full browser run, and reserve E2E for end-to-end wiring. Confidence per second is the metric.
```exercise
which-layer
```

## Vitest: the anatomy of a test

Every test in every framework is the same triple — a **named case**, an **actual** value, and a **matcher** stating the **expected**:

```ts
import { test, expect } from "vitest";
import { sum } from "./sum";

test("adds two numbers", () => {
  expect(sum(2, 3)).toBe(5);
});
```

`describe` groups related cases and gives readable output (`sum › returns 0 for empty`); `it` is an alias for `test` that reads as a sentence. Group by the unit under test:

```ts
describe("sum", () => {
  it("adds two positives", () => expect(sum(2, 3)).toBe(5));
  it("returns 0 for two zeros", () => expect(sum(0, 0)).toBe(0));
});
```

Setup/teardown hooks run around cases: `beforeEach` (fresh state per test — the workhorse), `afterEach` (cleanup), and the `*All` variants (once per file).

## Matchers: toBe vs toEqual (the #1 beginner bug)

- **`toBe`** is `Object.is`/`===` — **reference** equality. Right for numbers, strings, booleans, and identity. `expect(obj).toBe({…})` **always fails**, because two distinct objects are never `===`.
- **`toEqual`** compares **structurally**, walking the object/array recursively. This is what you want for values:

```ts
expect(makeUser("Ada")).toEqual({ name: "Ada", role: "user" });
```

- **`toStrictEqual`** goes further: it also cares about `undefined` properties and class-vs-plain-object. Reach for it when that distinction matters.

Other everyday matchers: `toContain`, `toHaveLength`, `toBeTruthy`/`toBeNull`, `toThrow`, and `.not` to invert any of them.
```exercise
tobe-vs-toequal
```


## Testing async code

An async test must **await** its assertion, or the case ends before the promise settles — and passes falsely. Missing awaits are the number-one source of flaky async tests.

```ts
test("resolves to the name", async () => {
  await expect(fetchName()).resolves.toBe("Ada");
  // or: const name = await fetchName(); expect(name).toBe("Ada");
});
```

`.resolves` / `.rejects` unwrap a promise and fail with a useful message if it settles the wrong way — but they're inert without the `await`.
```exercise
async-await
```

```exercise
test-the-negative
```

## React Testing Library: test what the user sees

RTL's guiding principle: **the more your tests resemble how the software is used, the more confidence they give.** So you render the component and interact with it the way a person (or a screen reader) would — not by poking at internal state.

```ts
import { render, screen } from "@testing-library/react";
import { Greeting } from "./Greeting";

test("greets the user by name", () => {
  render(<Greeting name="Ada" />);
  expect(screen.getByRole("heading", { name: "Hello, Ada" })).toBeInTheDocument();
});
```

### Query priority — role over test id

RTL ranks queries by how closely they mirror real perception. Prefer, roughly in this order:

1. **`getByRole`** (with an accessible `name`) — buttons, headings, textboxes. The default.
2. **`getByLabelText`** — form fields.
3. **`getByText`** — non-interactive content.
4. …down to **`getByTestId`** — the **last resort**, for elements with no usable role or text.

Why role beats a `data-testid`: a role query survives markup refactors, and it **fails when an element is invisible to assistive tech**, surfacing an accessibility bug for free. A test id passes regardless of whether the element is perceivable, so it can *hide* those bugs.

### get vs query vs find

The same three query verbs, for three situations:

- **`getBy*`** — element is there **now**. Throws (with a readable message) if missing, so it doubles as an assertion.
- **`queryBy*`** — returns **`null`** instead of throwing. The only way to assert **absence**: `expect(screen.queryByText("Error")).not.toBeInTheDocument()`.
- **`findBy*`** — returns a **promise** that retries until the element appears. For content rendered **after** an async effect. It's `getBy*` + `waitFor` in one.

```ts
test("shows the name after loading", async () => {
  render(<Profile />);
  expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
});
```

Never reach for a fixed `setTimeout` to "wait for" UI — that's how tests turn flaky. Use `findBy*` (or `waitFor`).

### userEvent, not fireEvent

`@testing-library/user-event` simulates the **full** sequence a real interaction fires (hover, focus, keydown/up, click) and respects disabled elements — catching bugs a single synthetic `fireEvent.click` misses. It's **async**, so every action is awaited:

```ts
const user = userEvent.setup();
render(<Counter />);
await user.click(screen.getByRole("button", { name: /increment/i }));
expect(screen.getByText("1")).toBeInTheDocument();
```

Skip the `await` and your assertion runs against the pre-render DOM. Use regex names (`/increment/i`) to stay resilient to casing and surrounding text.
```exercise
rtl-query
```

## Test doubles: spy, stub, mock

To isolate the unit under test from slow or non-deterministic boundaries (network, time, randomness), you swap in a **double**. The terms overlap, but the intent differs — **spies observe, stubs supply, mocks replace**:

- **Spy** — records calls/arguments without changing behaviour. `vi.fn()`, or `vi.spyOn(obj, "method")`. Assert with `toHaveBeenCalledWith(...)`:

  ```ts
  const onSave = vi.fn();
  render(<Form onSave={onSave} />);
  await user.click(screen.getByRole("button", { name: /save/i }));
  expect(onSave).toHaveBeenCalledWith({ id: 1 });
  ```

- **Stub** — supplies a canned response so the test controls the boundary: `vi.fn().mockResolvedValue(...)`, `mockReturnValue(...)`.
- **Module mock** — replaces an entire imported module. `vi.mock` is **hoisted** to the top of the file, so its factory can't reference outer variables — return the fakes inline:

  ```ts
  vi.mock("./api", () => ({
    getUser: vi.fn().mockResolvedValue({ name: "Ada" }),
  }));
  ```

Reset doubles between tests (`vi.clearAllMocks()` in `beforeEach`) so recorded calls don't leak across cases. For time-dependent code, freeze the clock: `vi.useFakeTimers()` + `vi.setSystemTime(...)`.
```exercise
fake-over-mock
```

```exercise
deterministic-time
```


## Playwright: end-to-end in a real browser

E2E drives the actual app, so it catches wiring bugs unit tests can't. Playwright's **locators** find elements (prefer role/label, same priority as RTL), and its **web-first assertions auto-retry** until true:

```ts
import { test, expect } from "@playwright/test";

test("logs in and lands on the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/dashboard");
});
```

The auto-wait is the key advantage: passing a **locator** (not a resolved element) into `expect` lets Playwright re-query and re-check until the condition holds or times out. That's the antidote to the number-one E2E anti-pattern — sprinkling `waitForTimeout(500)` to "wait for" the UI, which is both slow and flaky:

```ts
await expect(page.getByText("Saved")).toBeVisible(); // auto-waits — no sleep
```

Keep E2E for critical journeys and let the framework wait; push everything else down to cheaper unit/component tests.
```exercise
e2e-setup-parity
```


## Flakiness: the four usual suspects

A test that passes and fails without a code change is **flaky**, and flakiness almost always traces to a real non-determinism — not the tooling. Retrying hides it; fixing the source removes it.

- **Missing await on async UI** → the assertion runs before the element renders. Fix: `findBy*` / `await user.…`.
- **Shared state leaking between tests** (fails only in certain orders) → a mock not cleared, a module singleton, leftover DOM. Fix: reset in `beforeEach`/`afterEach`.
- **Real clock/date dependence** → `Date.now()` makes results depend on when/where they run. Fix: fake timers.
- **Real network/randomness** → non-deterministic responses. Fix: mock the boundary; seed randomness.

## Coverage: a spotlight, not a score

100% line coverage guarantees only that **every line executed** — not that outputs were asserted or edge cases handled. A test with no `expect` still marks its lines covered. **Branch** coverage is stronger than **line** coverage (it checks both sides of each `if`), but neither can tell you the assertions are meaningful. Use coverage to find code you *forgot* to test, not as a quality metric to chase to 100%.

## What to actually test

Bias toward **behaviour** (observable output for a given input) over **implementation** (private state, which helpers got called, giant HTML snapshots). Behaviour tests survive refactors and still fail when the code is genuinely wrong; implementation tests break on every harmless change and don't verify what the user experiences.

Concretely, spend your tests on: the **happy path**, the **edge cases** (empty, zero, boundary, max), and the **error paths** (what happens when the fetch rejects, the input is invalid). One clear **Act** per test, with assertions focused on that single behaviour (Arrange–Act–Assert) — not a script that acts five times and asserts ten things and fails ambiguously.
## Mastery checklist — you can…

- Explain the pyramid and diagnose a top-heavy suite.
- Pick `toBe` vs `toEqual` correctly, and know why `toBe({})` fails.
- Await async assertions and know why a missing `await` passes falsely.
- Choose `getBy` / `queryBy` / `findBy` for present / absent / async.
- Query by role over test id, and say why (a11y + refactor resilience).
- Use `userEvent` (awaited) over `fireEvent`, and say why.
- Spy with `vi.fn()`, stub with `mockResolvedValue`, mock a module with `vi.mock`.
- Write a Playwright flow with auto-waiting assertions and no `sleep`.
- Name the four flakiness sources and their fixes.
- Say what coverage does and doesn't prove.
