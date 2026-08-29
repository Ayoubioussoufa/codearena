/**
 * Topic: Testing — the concepts behind the tests you write in the coding track,
 * as spaced-repetition quiz cards. The test pyramid, query priority, matcher
 * choice, test doubles, async waiting, and the flakiness/coverage traps
 * interviewers actually probe. Drills the Testing supplement guide.
 */
import { choice } from "../helpers";
import type { Generator, Topic } from "../types";

const DOC = { slug: "testing", label: "Dojo guide — Testing" };

const pyramid: Generator = {
  id: "testing-pyramid",
  title: "The test pyramid",
  generate: (rng) => {
    const variant = rng.int(0, 1);
    if (variant === 0) {
      return choice(rng, {
        genId: "testing-pyramid",
        prompt:
          "The 'test pyramid' says a healthy suite is shaped how, and why?",
        correct:
          "Many fast unit tests at the base, fewer integration tests, very few slow end-to-end tests at the top",
        wrong: [
          "Mostly end-to-end tests, since they give the highest confidence",
          "Equal numbers of unit, integration, and E2E tests",
          "Only integration tests — they balance speed and confidence perfectly",
        ],
        explanation:
          "Unit tests are fast, deterministic, and pinpoint failures, so you can afford thousands — they form the base. E2E tests are slow and flakier but exercise the whole system, so you keep a few for critical journeys (login, checkout). Integration sits between. An 'ice-cream cone' (mostly E2E) is the anti-pattern: slow suites and vague failures.",
        docRef: DOC,
      });
    }
    return choice(rng, {
      genId: "testing-pyramid",
      prompt:
        "A team's CI takes 40 minutes and E2E tests fail randomly ~10% of runs. Which shift most likely helps?",
      correct:
        "Push logic down into fast unit/component tests and keep only a few critical E2E paths",
      wrong: [
        "Add more E2E tests to cover the flaky areas",
        "Delete all unit tests and rely on E2E for real confidence",
        "Run the E2E suite twice and take the better result",
      ],
      explanation:
        "Slow + flaky CI is the classic top-heavy suite. Most behaviour can be verified far faster and more reliably one layer down (a component test instead of a full browser run), reserving E2E for a handful of end-to-end journeys. Retrying until green hides real races rather than fixing them.",
      docRef: DOC,
    });
  },
};

const getVsQueryVsFind: Generator = {
  id: "testing-query-variants",
  title: "getBy vs queryBy vs findBy",
  generate: (rng) => {
    const cases = [
      {
        need: "assert an error message is NOT rendered",
        answer: "queryBy* — it returns null instead of throwing, so you can assert absence",
        why: "`getBy*` throws when nothing matches, which would crash the test before your assertion. `queryBy*` returns `null`, so `expect(queryByText(...)).not.toBeInTheDocument()` is the way to assert something is absent.",
      },
      {
        need: "wait for content that appears after a fetch resolves",
        answer: "findBy* — it returns a promise that retries until the element appears",
        why: "`findBy*` = `getBy*` + `waitFor`. It polls until the element shows up (or times out), which is exactly what async-rendered content needs. `getBy*` would run too early and throw.",
      },
      {
        need: "grab an element you know is already in the DOM",
        answer: "getBy* — it returns the element and throws a helpful error if missing",
        why: "For synchronous content, `getBy*` is the default: it doubles as an assertion (throws with a readable message if absent) and returns the node so you can act on or assert against it.",
      },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "testing-query-variants",
      prompt: `In React Testing Library, which query do you reach for to ${c.need}?`,
      correct: c.answer,
      wrong: [
        c.answer.startsWith("getBy")
          ? "queryBy* — always safer because it never throws"
          : "getBy* — it works for everything, sync or async",
        c.answer.startsWith("findBy")
          ? "queryBy* — return null and check it in a loop yourself"
          : "findBy* — always use it so timing is never an issue",
        "getAllBy* — it's the only one that handles this case",
      ],
      explanation:
        c.why +
        " Rule of thumb: getBy for what's there now, findBy for what appears after an await, queryBy for asserting absence.",
      docRef: DOC,
    });
  },
};

const toBeVsToEqual: Generator = {
  id: "testing-tobe-toequal",
  title: "toBe vs toEqual",
  generate: (rng) =>
    choice(rng, {
      genId: "testing-tobe-toequal",
      prompt:
        "Why does `expect(makeUser()).toBe({ name: 'Ada' })` fail even when the returned object looks identical?",
      correct:
        "toBe is reference equality (===); two distinct objects are never ===. Use toEqual for structural equality.",
      wrong: [
        "toBe doesn't support objects at all and throws a type error",
        "The object needs to be frozen first for toBe to compare it",
        "toBe compares JSON strings, and key order differs",
      ],
      explanation:
        "`toBe` uses `Object.is`/`===`, so it only passes when both sides are the SAME reference — perfect for numbers, strings, booleans, and identity checks, wrong for value comparison of objects/arrays. `toEqual` walks the structure recursively. `toStrictEqual` goes further (checks `undefined` properties and class vs plain object).",
      docRef: DOC,
    }),
};

const doubles: Generator = {
  id: "testing-doubles",
  title: "Test doubles: mock / spy / stub",
  generate: (rng) => {
    const cases = [
      {
        q: "record that a callback was invoked, and with which arguments",
        answer: "A spy — it wraps a function and records every call/argument without changing behaviour",
        why: "A spy (`vi.fn()`, or `vi.spyOn(obj, 'method')`) observes calls so you can assert `toHaveBeenCalledWith(...)`. It can pass through to the real implementation or not.",
      },
      {
        q: "make a dependency return a canned value so the unit under test is isolated",
        answer: "A stub — it replaces a function with a fixed, canned response",
        why: "A stub supplies preprogrammed answers (`mockReturnValue`/`mockResolvedValue`) so the test controls the boundary and stays deterministic, without asserting on how it was called.",
      },
      {
        q: "replace an entire imported module with fakes",
        answer: "A module mock — vi.mock swaps the module's exports with test doubles",
        why: "`vi.mock('./api', factory)` replaces the whole module (hoisted to the top of the file), so no real network/db call happens. The factory returns fake exports, usually `vi.fn()`s.",
      },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "testing-doubles",
      prompt: `Which test double do you want to ${c.q}?`,
      correct: c.answer,
      wrong: [
        "A snapshot — it serializes output and compares to a saved file",
        "A fixture — static sample data loaded before the test",
        "Coverage instrumentation — it tracks which lines ran",
      ],
      explanation:
        c.why +
        " The terms overlap in practice (Vitest's `vi.fn()` is a spy you can also stub), but the intent differs: spies OBSERVE, stubs SUPPLY, mocks REPLACE.",
      docRef: DOC,
    });
  },
};

const queryByRole: Generator = {
  id: "testing-role-priority",
  title: "Why query by role, not test id",
  generate: (rng) =>
    choice(rng, {
      genId: "testing-role-priority",
      prompt:
        "RTL's query priority puts `getByRole` near the top and `getByTestId` last. What's the main reason?",
      correct:
        "Role/label/text queries mirror how a user (and a screen reader) finds elements, so tests stay meaningful and catch accessibility gaps; test ids couple tests to implementation details",
      wrong: [
        "getByRole is significantly faster to execute than getByTestId",
        "Test ids are removed in production builds, so those tests can't run",
        "getByRole can select multiple elements while getByTestId cannot",
      ],
      explanation:
        "Testing by accessible role/name makes the test resemble real usage: it survives markup refactors, and an element with no role (invisible to assistive tech) fails the test — surfacing an a11y bug. A `data-testid` passes regardless of whether the element is perceivable, so it can mask those bugs. Reserve test ids for elements with no usable role or text.",
      docRef: DOC,
    }),
};

const userEventVsFire: Generator = {
  id: "testing-userevent",
  title: "userEvent vs fireEvent",
  generate: (rng) =>
    choice(rng, {
      genId: "testing-userevent",
      prompt:
        "Why is `await userEvent.click(el)` generally preferred over `fireEvent.click(el)`?",
      correct:
        "userEvent simulates the full sequence a real interaction fires (hover, focus, keydown/up, click), catching bugs a single synthetic event misses",
      wrong: [
        "fireEvent is deprecated and no longer works in modern React",
        "userEvent is synchronous, so it's simpler and faster",
        "fireEvent can't target elements found by getByRole",
      ],
      explanation:
        "A real click isn't one event — `userEvent` dispatches the whole realistic sequence and respects things like disabled elements, so it exercises handlers `fireEvent.click` would skip. The trade-off is that `userEvent` is async (each action returns a promise), so you must `await` it or your assertion runs against the pre-update DOM.",
      docRef: DOC,
    }),
};

const flaky: Generator = {
  id: "testing-flaky",
  title: "Sources of flaky tests",
  generate: (rng) => {
    const cases = [
      {
        symptom: "a test passes locally but fails ~1 in 10 CI runs, usually on an element that loads after a fetch",
        answer: "A missing await on async UI — the assertion runs before the element renders",
        why: "The classic race: `getBy*` (or an un-awaited action) runs before the async render completes. Fix with `findBy*` / `await user.…`, never a fixed `setTimeout`.",
      },
      {
        symptom: "tests pass alone but fail when run together, in a different order each time",
        answer: "Shared state leaking between tests — reset mocks/DOM/data in beforeEach",
        why: "Order-dependent failures mean state bleeds across cases (a mock not cleared, a module singleton, leftover DOM). Isolate with `beforeEach`/`afterEach` cleanup (`vi.clearAllMocks()`, RTL auto-cleanup).",
      },
      {
        symptom: "a test that checks 'created 2 seconds ago' fails intermittently around midnight or in CI's timezone",
        answer: "Real time/date dependence — freeze the clock with fake timers",
        why: "Tests that read `Date.now()`/`new Date()` are non-deterministic. Freeze time (`vi.useFakeTimers()` / `vi.setSystemTime(...)`) so the result is stable regardless of when or where it runs.",
      },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "testing-flaky",
      prompt: `Most likely cause of this flaky test: ${c.symptom}?`,
      correct: c.answer,
      wrong: [
        "The test framework itself is unreliable — switch runners",
        "Not enough retries configured — bump the retry count",
        "The assertion library has a bug in its matcher",
      ],
      explanation:
        c.why +
        " Flakiness almost always traces to a real non-determinism (timing, shared state, clock, randomness), not the tooling. Retrying hides it; fixing the source removes it.",
      docRef: DOC,
    });
  },
};

const coverage: Generator = {
  id: "testing-coverage",
  title: "What coverage does and doesn't tell you",
  generate: (rng) =>
    choice(rng, {
      genId: "testing-coverage",
      prompt:
        "Your suite reports 100% line coverage. What does that guarantee?",
      correct:
        "Only that every line executed during tests — not that outputs were asserted or edge cases handled",
      wrong: [
        "That the code is free of bugs",
        "That every input/branch combination was tested",
        "That the tests assert the correct behaviour",
      ],
      explanation:
        "Coverage measures which code RAN, not whether you checked its result. A test with no `expect` still counts lines as covered. High coverage with weak assertions is false comfort; branch coverage is stronger than line coverage but still can't tell you the assertions are meaningful. Treat coverage as a spotlight on UNtested code, not a quality score.",
      docRef: DOC,
    }),
};

const testBehavior: Generator = {
  id: "testing-behavior",
  title: "Test behaviour, not implementation",
  generate: (rng) =>
    choice(rng, {
      genId: "testing-behavior",
      prompt:
        "Which test is least likely to break during a harmless refactor while still catching real bugs?",
      correct:
        "Render the component and assert the user-visible output for a given input (behaviour)",
      wrong: [
        "Assert that a specific internal useState hook holds a specific value",
        "Assert the component called a private helper function a certain number of times",
        "Snapshot the entire rendered HTML and fail on any diff",
      ],
      explanation:
        "Tests coupled to internals (private state, helper calls, giant snapshots) break every time you refactor even when behaviour is unchanged — and they don't verify what the user experiences. Asserting the observable output for an input tests the CONTRACT, so it survives refactors and still fails when the behaviour is actually wrong.",
      docRef: DOC,
    }),
};

const arrange: Generator = {
  id: "testing-aaa",
  title: "Arrange–Act–Assert",
  generate: (rng) =>
    choice(rng, {
      genId: "testing-aaa",
      prompt:
        "The Arrange–Act–Assert (AAA) structure recommends how many primary actions and assertions per test?",
      correct:
        "One clear action, then assertions focused on that single behaviour — keep each test about one thing",
      wrong: [
        "As many actions and assertions as possible to maximise coverage per test",
        "Exactly one assertion — never more than one expect per test, no exceptions",
        "No structure needed; order of setup and assertions doesn't matter",
      ],
      explanation:
        "AAA keeps a test readable and diagnosable: Arrange the inputs/mocks, perform ONE Act, then Assert on its outcome. The spirit is 'one behaviour per test', not a dogmatic single `expect` — several assertions about the same action are fine. A test that acts three times and asserts ten things fails ambiguously and reads like a script, not a spec.",
      docRef: DOC,
    }),
};

export const testingTopic: Topic = {
  id: "testing",
  title: "Testing",
  icon: "🧪",
  blurb:
    "The concepts behind good tests: the pyramid, RTL query priority, matcher choice, spies vs stubs vs mocks, async waiting, and the flakiness & coverage traps interviewers probe.",
  docSlug: "testing",
  docTitle: "Testing — fundamentals",
  generators: [
    pyramid,
    getVsQueryVsFind,
    toBeVsToEqual,
    doubles,
    queryByRole,
    userEventVsFire,
    flaky,
    coverage,
    testBehavior,
    arrange,
  ],
};
