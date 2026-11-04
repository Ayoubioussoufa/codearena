/**
 * Checks for content/supplements/react-fundamentals.md.
 * Checked 3 Nov 2026 against react.dev (the React 19 release post) and the React commit that removed the useLayoutEffect server warning.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const reactChecks: GuideCheckSet = {
  name: "React guide",
  source: {
    label: "react.dev: Learn React",
    href: "https://react.dev/learn",
    note: "The official course. Read \"Describing the UI\", \"Adding Interactivity\" and \"Managing State\", then \"Escape Hatches\" (refs and effects); the [hooks reference](https://react.dev/reference/react/hooks) covers Part II.",
  },
  terms: [
    "Render",
    "Updater function",
    "Effect",
    "Stale closure",
    "Controlled input",
    "Derived state",
    "Ref",
    "Memoization",
    "Custom hook",
    "Suspense",
  ],
  checks: [
    {
      id: "renders",
      section: "§0–2 · Renders and the updater",
      questions: [
        {
          prompt: "A click handler runs `setCount(count + 1)` twice, with `count` at 0. What is `count` after the re-render?",
          options: [
            "2, because the two updates are applied in order",
            "1, because both calls read the very same snapshot",
            "0, because React batches and then discards both calls",
            "3, because each call re-renders and adds one more",
          ],
          correct: 1,
          why: "Each render is a frozen photo: inside this handler `count` is 0 for both lines, so both say \"set it to 1\". `setCount(c => c + 1)` twice gives 2, because React feeds each updater the latest pending value.",
        },
        {
          prompt: "What does batching decide, compared with the updater function?",
          options: [
            "Which value each update uses, not when React re-renders",
            "Whether later updates in the same click are dropped",
            "How many of the components re-render after one click",
            "When React re-renders, not which value each update uses",
          ],
          correct: 3,
          why: "Batching collects the `setState` calls of one event into a single re-render: it decides *when*. The updater form decides *what value* each update is based on. Two different jobs; confusing them is how the double-`+1` bug survives.",
        },
      ],
      explain: "Explain \"a render is a photo, not a live feed\" with the double `setCount(count + 1)` example, and how the updater function fixes it.",
    },
    {
      id: "effects",
      section: "§3–4 · Effects and stale closures",
      questions: [
        {
          prompt: "`useEffect(() => { const id = setInterval(() => setCount(count + 1), 1000); return () => clearInterval(id); }, [])`. The counter stops at 1. Best fix?",
          options: [
            "Use the updater form instead: setCount(c => c + 1)",
            "Add a second interval that keeps on resetting the count",
            "Remove the cleanup, so the interval can keep the count",
            "Move the interval out of the effect and into render",
          ],
          correct: 0,
          why: "The interval's callback was created once, in the first render, where `count` was 0; it closed over that 0 forever. The updater form asks React for the current value on each tick. Adding `count` to the deps also works but restarts the interval every second.",
        },
        {
          prompt: "You keep a filtered list in its own state, updated by an effect whenever `items` or `query` change. What's wrong?",
          options: [
            "Effects can't call setState, so it never updates",
            "It needs useLayoutEffect, or the list will flicker",
            "It's derived state: compute it during render instead",
            "Nothing: syncing state is exactly what effects do",
          ],
          correct: 2,
          why: "An effect that computes a value adds an extra render and creates two copies of the truth that can drift. Anything computable from existing state belongs in the render body; effects are for synchronizing with the outside world.",
        },
      ],
      explain: "Explain what an effect's dependency array and cleanup do, with the `alive`-flag fetch as your example.",
    },
    {
      id: "lists",
      section: "§5–6 · Keys and controlled inputs",
      questions: [
        {
          prompt: "Rows are rendered with `key={index}`, and the user sorts the list. What goes wrong?",
          options: [
            "React throws an error because the index keys repeat",
            "The list freezes until the page has been reloaded",
            "Row state stays in its slot while data moves",
            "Each row loses its state, but stays in order",
          ],
          correct: 2,
          why: "With index keys, identity is the *position*: after a sort, an open menu or typed text stays glued to slot 0 while different data slides into it. A stable id from the data (`problem.slug`) makes state follow its item.",
        },
        {
          prompt: "An input has `value={query}` but no `onChange`. What happens when the user types?",
          options: [
            "The box freezes: React owns it but never updates",
            "It works, and query updates itself on each keystroke",
            "React switches it to uncontrolled after the first key",
            "The text appears, but query keeps its first value",
          ],
          correct: 0,
          why: "Setting `value` tells React that state owns the text; with no `onChange`, state never changes, so every keystroke is reverted. Set both (controlled), or use `defaultValue` and read the value on submit (uncontrolled).",
        },
      ],
      explain: "Explain controlled versus uncontrolled inputs, and which one React 19's form actions build on.",
    },
    {
      id: "context",
      section: "§7–8 · Context, useMemo and derived state",
      questions: [
        {
          prompt: "A provider passes `value={{ language, setLanguage }}` inline. What's the cost?",
          options: [
            "The value is dropped after the provider's render",
            "Only the components outside the provider will re-render",
            "Consumers read the default value instead of this",
            "Every consumer re-renders each time the parent renders",
          ],
          correct: 3,
          why: "An inline object is new on every render, and context compares by identity, so React thinks the value changed and wakes every consumer. `useMemo(() => ({ language, setLanguage }), [language])` keeps one object until `language` changes.",
        },
        {
          prompt: "When is `useMemo` the right tool?",
          options: [
            "When a value must be shared across distant components",
            "When a calculation is slow and inputs rarely change",
            "When a computed value comes out wrong without memoization",
            "When state needs to persist after the component unmounts",
          ],
          correct: 1,
          why: "`useMemo` is a performance tool: it skips recomputing until a dependency changes identity. Code must already be correct without it, and it's useless if the inputs are rebuilt every render. Sharing values is context's job.",
        },
      ],
      explain: "State the derived-state rule and explain why a second `useState` holding a computed total is a bug waiting to happen.",
    },
    {
      id: "refs",
      section: "§9–10 · Rules of Hooks and useRef",
      questions: [
        {
          prompt: "Why can't you call `useState` inside an `if`?",
          options: [
            "React identifies each hook by its call order",
            "Conditions are only evaluated after the render ends",
            "useState throws when it's called more than once",
            "The compiler removes hooks that sit inside branches",
          ],
          correct: 0,
          why: "React stores a component's hooks in a list, in call order. Skip one in a branch and every hook after it gets the wrong slot: `age` starts reading `name`'s box. Put the condition inside the hook instead. (`use()` is the one exception.)",
        },
        {
          prompt: "You write `renderCount.current += 1` on a `useRef`. What happens?",
          options: [
            "The component re-renders on every single increment",
            "React throws, since refs are read-only values",
            "The value updates, but nothing ever re-renders",
            "The next render discards the incremented value",
          ],
          correct: 2,
          why: "A ref is the same mutable box on every render, and React doesn't watch it. That's the point: timer ids, DOM nodes, \"did I already send it\" flags. Doing the same with `useState` would re-render forever.",
        },
        {
          prompt: "Why do you read `inputRef.current` in an effect, not during render?",
          options: [
            "Effects run before render, so refs are fresh",
            "During render the DOM node doesn't exist yet",
            "Refs are only ever writable inside event handlers",
            "Reading a ref during render deletes its node",
          ],
          correct: 1,
          why: "React attaches the node to `ref.current` after it creates the DOM, so during render it's still `null`. Effects run after the DOM update, which is why focusing or measuring happens there. Reading refs during render also breaks render purity.",
        },
      ],
      explain: "Explain the \"latest ref\" pattern in `useInterval`, and why the interval doesn't restart when the callback changes.",
    },
    {
      id: "memo",
      section: "§11–13 · useCallback, memo, useReducer, custom hooks",
      questions: [
        {
          prompt: "A `React.memo` row gets `onSelect={(id) => select(id)}` from its parent. Does memo skip any re-renders?",
          options: [
            "Yes: memo ignores any function props when it compares",
            "Yes: React quietly caches each of the inline arrows",
            "No: memo only works on components defined as classes",
            "No: a new function each render means props differ",
          ],
          correct: 3,
          why: "`React.memo` compares props with `===`, and an inline arrow is a new function every render, so the props always \"changed\". Stabilize it with `useCallback`, or memo does the comparison for nothing.",
        },
        {
          prompt: "Two components both call `useToggle()`. Do they share the toggle's state?",
          options: [
            "Yes: a custom hook keeps one shared value",
            "No: each call gets its own separate state",
            "Only if the same parent renders them both",
            "Only if the hook's defined in one file",
          ],
          correct: 1,
          why: "A custom hook shares logic, not state: its body runs inside each component, creating that component's own slots. To share a value, use context or an external store.",
        },
        {
          prompt: "Why can you leave `dispatch` out of an effect's dependencies?",
          options: [
            "dispatch is created once, on first render",
            "Effects never compare functions in their deps",
            "The reducer copies dispatch into each state",
            "React guarantees that its identity never changes",
          ],
          correct: 3,
          why: "`dispatch` (like a `setState` function) is stable for the component's whole life, so it can't make an effect re-run or a memoized child re-render. That's one of `useReducer`'s free bonuses.",
        },
      ],
      explain: "When do you move from `useState` to `useReducer`? Give the four signs, and one CodeArena component that fits.",
    },
    {
      id: "concurrent",
      section: "§14–18 · Layout effects, external stores, useId, transitions",
      questions: [
        {
          prompt: "A tooltip is measured and repositioned in `useEffect`, and it visibly jumps. What fixes the flicker?",
          options: [
            "useLayoutEffect, which runs before the browser paints",
            "useMemo, which caches the measurement between renders",
            "useTransition, which marks the update as non-urgent",
            "useDeferredValue, which delays the measurement until later",
          ],
          correct: 0,
          why: "`useEffect` runs after paint, so the user sees the wrong position for a frame. `useLayoutEffect` runs after the DOM update but before paint. It blocks painting, so keep it to measure-then-move.",
        },
        {
          prompt: "`getSnapshot` for `useSyncExternalStore` returns `{ online: navigator.onLine }`. What happens?",
          options: [
            "It works, but only once the first event has fired",
            "React caches each one, so the extra objects cost nothing",
            "An infinite loop: it returns a new object every call",
            "The value is stale until the component is mounted again",
          ],
          correct: 2,
          why: "React compares snapshots with `Object.is`; a fresh object every call always looks changed, so React re-renders forever. Return a primitive (`navigator.onLine`) or a cached object.",
        },
        {
          prompt: "Typing into a search box lags because each keystroke refilters 5,000 rows. What does `useTransition` change?",
          options: [
            "The filtering runs faster on a background thread",
            "The rows are cached, so filtering happens once",
            "The heavy update can be interrupted by keystrokes",
            "The input waits until the filtering is finished",
          ],
          correct: 2,
          why: "A transition marks an update as non-urgent: a new keystroke interrupts the in-flight background render. Nothing gets faster, and there's no extra thread; it only changes what may be interrupted.",
        },
      ],
      explain: "Explain why `useSyncExternalStore` beats `useState` plus `useEffect` for a value that lives outside React (two reasons).",
    },
    {
      id: "react19",
      section: "§19 · React 19's async and form hooks",
      questions: [
        {
          prompt: "What does `useActionState` hand back?",
          options: [
            "The state, a form action, a pending flag",
            "The form data, a submit handler, an error",
            "A promise, a cancel function, and a status",
            "The response, a retry function, and the inputs",
          ],
          correct: 0,
          why: "`const [state, formAction, isPending] = useActionState(action, initial)`. The action receives `(previousState, formData)` and returns the next state, so loading and error need no extra `useState`.",
        },
        {
          prompt: "Which React 19 API may be called inside an `if`?",
          options: [
            "useState, in a branch that never changes",
            "useOptimistic, but only while an action runs",
            "useFormStatus, provided a form sits above it",
            "use, which can read promises and contexts",
          ],
          correct: 3,
          why: "`use` was designed to be callable conditionally and in loops: it reads a promise (suspending until it resolves) or a context. Every other hook still follows the Rules of Hooks.",
        },
      ],
      explain: "Walk through an optimistic \"add todo\": what the user sees immediately, what happens when the save succeeds, and what happens when it fails.",
    },
  ],
};
