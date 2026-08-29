/**
 * Coding track: React hooks — every core hook, drilled in several different
 * situations, from a first `useState` counter up to `useImperativeHandle` and
 * `useSyncExternalStore`. Component-shaped tasks are structure-checked; pure
 * reducers actually run against test cases.
 */
import { codeTask, multiFileTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingExercise, CodingTrack } from "../coding";
import { reactCodeGens } from "../topics/react-code";

const DOC = { slug: "react-fundamentals", label: "Dojo guide — React fundamentals" };

/* ── Level 1 — the first working shape ── */

const counter: Generator = {
  id: "hooks-counter",
  title: "A safe counter",
  generate: () =>
    codeTask({
      genId: "hooks-counter",
      prompt:
        "Write a `Counter` component: it shows a `count` starting at 0 and a button that adds 1. Use the FUNCTIONAL updater so two quick clicks can never collapse into one.",
      language: "tsx",
      starter: `function Counter() {\n  // your component\n}`,
      solution: `function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      {count}\n    </button>\n  );\n}`,
      checks: [
        { re: "useState\\(\\s*0\\s*\\)", label: "count starts at 0 via `useState(0)`" },
        { re: "onClick=\\{", label: "the button has an `onClick`" },
        { re: "setCount\\(\\s*\\w+\\s*=>", label: "uses the functional updater `setCount(c => …)`" },
        { re: "setCount\\(\\s*count\\b", expect: false, label: "does not read `count` directly (that's the stale trap)" },
      ],
      explanation:
        "`setCount(c => c + 1)` asks React 'whatever count is right now, add one', so batched clicks each apply. `setCount(count + 1)` bakes in the value React showed you *this* render — click twice before a re-render and both compute the same number, losing an increment. Rule of thumb: **when the next value depends on the previous one, use the updater form.**",
      docRef: DOC,
    }),
};

const useToggle: Generator = {
  id: "hooks-usetoggle",
  title: "Write useToggle",
  generate: () =>
    codeTask({
      genId: "hooks-usetoggle",
      prompt:
        "Write a custom hook `useToggle(initial = false)` returning `[on, toggle]`, where calling `toggle()` flips the boolean. Flip it with the functional updater.",
      language: "tsx",
      starter: `function useToggle(initial = false) {\n  // your hook\n}`,
      solution: `function useToggle(initial = false) {\n  const [on, setOn] = useState(initial);\n  const toggle = () => setOn(v => !v);\n  return [on, toggle];\n}`,
      checks: [
        { re: "useState\\(", label: "holds the flag in state" },
        { re: "=>\\s*!\\w+|=>\\s*\\(?\\s*!", label: "flips with the updater `setOn(v => !v)`" },
        { re: "return\\s*\\[", label: "returns a `[value, toggle]` tuple" },
      ],
      explanation:
        "A custom hook is just a function that *calls other hooks* — nothing more magical than that. Returning a tuple (like `useState` itself) lets the caller name both parts: `const [open, toggleOpen] = useToggle()`. The `v => !v` updater means the toggle is correct even if two events land in the same tick.",
      docRef: DOC,
    }),
};

const focusOnMount: Generator = {
  id: "hooks-focus",
  title: "Focus an input on mount",
  generate: () =>
    codeTask({
      genId: "hooks-focus",
      prompt:
        "Write a `SearchBox` component that auto-focuses its `<input>` when it first mounts. Reach the DOM node with a ref; do the focusing in an effect that runs once.",
      language: "tsx",
      starter: `function SearchBox() {\n  return <input placeholder="Search…" />;\n}`,
      solution: `function SearchBox() {\n  const inputRef = useRef(null);\n  useEffect(() => {\n    inputRef.current.focus();\n  }, []);\n  return <input ref={inputRef} placeholder="Search…" />;\n}`,
      checks: [
        { re: "useRef\\(", label: "creates a ref with `useRef`" },
        { re: "ref=\\{", label: "attaches it to the input (`ref={…}`)" },
        { re: "useEffect\\(", label: "focuses inside an effect" },
        { re: "\\.current\\.focus\\(\\)", label: "calls `.current.focus()`" },
        { re: "\\[\\s*\\]", label: "effect runs once (`[]` deps)" },
      ],
      explanation:
        "Imperative DOM calls — focus, scrollIntoView, media playback — need the real element, and a ref is React's sanctioned handle to it. The effect runs *after* paint, so the node exists by the time you call `.focus()`. Empty deps `[]` means 'once, on mount' — with no deps it would refocus on every render and steal the cursor.",
      docRef: DOC,
    }),
};

/* ── Level 3 — hooks wired to state that changes over time ── */

const usePrevious: Generator = {
  id: "hooks-useprevious",
  title: "Write usePrevious",
  generate: () =>
    codeTask({
      genId: "hooks-useprevious",
      prompt:
        "Write `usePrevious(value)` returning the value from the PREVIOUS render (`undefined` on the first). The trick is timing: hold a value that survives across renders, and arrange for the read to reflect last render's value rather than this one's.",
      language: "tsx",
      starter: `function usePrevious(value) {\n  // your hook\n}`,
      solution: `function usePrevious(value) {\n  const ref = useRef(undefined);\n  useEffect(() => {\n    ref.current = value;\n  }, [value]);\n  return ref.current;\n}`,
      checks: [
        { re: "useRef\\(", label: "keeps the carry-over value in a ref" },
        { re: "useEffect\\(", label: "writes the ref inside an effect" },
        { re: "\\.current\\s*=", label: "assigns `ref.current = value`" },
        { re: "return\\s+\\w+\\.current", label: "returns `ref.current` (this render's = last render's value)" },
        { re: "\\[\\s*value\\s*\\]", label: "effect depends on `[value]`" },
      ],
      explanation:
        "The trick is ORDER: render returns `ref.current` (still holding the old value), and only *after* paint does the effect overwrite it with the current one. So next render's read sees this render's value — a one-render time capsule. Writing the ref during render instead would clobber it before you read it. This is the canonical 'a ref carries a value across renders without causing one' pattern.",
      docRef: DOC,
    }),
};

const useCallbackChild: Generator = {
  id: "hooks-usecallback",
  title: "Stabilise a callback prop",
  generate: () =>
    codeTask({
      genId: "hooks-usecallback",
      prompt:
        "Inside `List({ items })`, write an `onSelect` handler passed to a memoized `<Row>`. It must call `console.log(id)` and keep the SAME function identity across re-renders (so `React.memo` on `Row` actually skips). It has no reactive dependencies.",
      language: "tsx",
      starter: `const onSelect = /* your handler */;`,
      solution: `const onSelect = useCallback((id) => {\n  console.log(id);\n}, []);`,
      checks: [
        { re: "useCallback\\(", label: "wraps the handler in `useCallback`" },
        { re: "\\[\\s*\\]", label: "empty deps — identity is stable forever" },
        { re: "console\\.log\\(", label: "logs the id" },
      ],
      explanation:
        "Every render creates brand-new function objects, so an inline `onSelect` is a *different* prop each time — `React.memo(Row)` sees a changed prop and re-renders anyway, defeating the memo. `useCallback(fn, deps)` hands back the same function until a dependency changes. Empty `[]` = never changes. (Only reach for it when a memoized child or an effect actually depends on the identity — otherwise it's noise.)",
      docRef: DOC,
    }),
};

const useContextTheme: Generator = {
  id: "hooks-usecontext",
  title: "Read context without prop-drilling",
  generate: () =>
    codeTask({
      genId: "hooks-usecontext",
      prompt:
        "A `ThemeContext` already exists. Write `ThemedButton` that reads the current theme straight from that context (no props, no drilling) and uses it as the button's `className`.",
      language: "tsx",
      starter: `const ThemeContext = createContext("light");\n\nfunction ThemedButton() {\n  // read the theme and use it as className\n}`,
      solution: `const ThemeContext = createContext("light");\n\nfunction ThemedButton() {\n  const theme = useContext(ThemeContext);\n  return <button className={theme}>Click</button>;\n}`,
      checks: [
        { re: "useContext\\(\\s*ThemeContext\\s*\\)", label: "reads via `useContext(ThemeContext)`" },
        { re: "className=\\{", label: "drives `className` from the theme value" },
      ],
      explanation:
        "`useContext` subscribes the component to the nearest matching `<Provider>` above it and hands back its `value`. Any descendant can read it directly — no passing props through layers that don't care. The flip side: every consumer re-renders when the provider's value changes, so keep context values stable (memoize the object) and scoped to what genuinely needs sharing.",
      docRef: DOC,
    }),
};

/* ── Level 4 — correctness and timing ── */

const todosReducer: Generator = {
  id: "hooks-todos-reducer",
  title: "A todos reducer (runs for real)",
  generate: () =>
    codeTask({
      genId: "hooks-todos-reducer",
      prompt:
        "Write the pure `todosReducer(state, action)` for a `useReducer` todo list. `state` is an array of `{ id, text, done }`. Actions: `{ type: \"add\", id, text }` appends `{ id, text, done: false }`; `{ type: \"toggle\", id }` flips `done` on the matching item; `{ type: \"remove\", id }` drops it. Never mutate `state` — your code runs against test cases.",
      language: "javascript",
      starter: `function todosReducer(state, action) {\n  // return the next array\n}`,
      solution: `function todosReducer(state, action) {\n  switch (action.type) {\n    case "add":\n      return [...state, { id: action.id, text: action.text, done: false }];\n    case "toggle":\n      return state.map(t =>\n        t.id === action.id ? { ...t, done: !t.done } : t\n      );\n    case "remove":\n      return state.filter(t => t.id !== action.id);\n    default:\n      return state;\n  }\n}`,
      checks: [
        { re: "\\.push\\(|\\.splice\\(", expect: false, label: "no in-place mutation (`push`/`splice`)" },
        { re: "state\\.map\\(|\\.\\.\\.\\s*state", label: "builds a new array (map / spread)" },
      ],
      fn: {
        name: "todosReducer",
        tests: [
          { args: [[], { type: "add", id: 1, text: "a" }], expected: [{ id: 1, text: "a", done: false }] },
          { args: [[{ id: 1, text: "a", done: false }], { type: "toggle", id: 1 }], expected: [{ id: 1, text: "a", done: true }] },
          { args: [[{ id: 1, text: "a", done: false }, { id: 2, text: "b", done: false }], { type: "remove", id: 1 }], expected: [{ id: 2, text: "b", done: false }] },
          { args: [[{ id: 1, text: "a", done: true }], { type: "noop" }], expected: [{ id: 1, text: "a", done: true }] },
        ],
      },
      explanation:
        "Reducers must be pure: same (state, action) in → a brand-new state out, no mutation. React (and Redux) decide 'did it change?' by comparing references, so `map`/`filter`/spread — which return fresh arrays and objects — are how updates get noticed. `toggle` copies only the one item it changes and passes the rest through by reference; that's the minimal, correct immutable update.",
      docRef: DOC,
    }),
};

const useDebouncedValue: Generator = {
  id: "hooks-usedebounce",
  title: "Write useDebouncedValue",
  generate: () =>
    codeTask({
      genId: "hooks-usedebounce",
      prompt:
        "Write `useDebouncedValue(value, delay)` returning `value`, but only after it has stopped changing for `delay` ms — the debounce behind a search box that waits for a pause in typing. Rapid changes must RESET the clock, so any pending update has to be cancelled whenever `value` changes again.",
      language: "tsx",
      starter: `function useDebouncedValue(value, delay) {\n  // your hook\n}`,
      solution: `function useDebouncedValue(value, delay) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(id);\n  }, [value, delay]);\n  return debounced;\n}`,
      checks: [
        { re: "useState\\(", label: "holds the debounced value in state" },
        { re: "setTimeout\\(", label: "schedules the update with `setTimeout`" },
        { re: "return\\s*\\(\\s*\\)\\s*=>\\s*\\{?\\s*clearTimeout", label: "cleanup clears the pending timer" },
        { re: "\\[\\s*value\\s*,\\s*delay\\s*\\]", label: "effect depends on `[value, delay]`" },
      ],
      explanation:
        "Each keystroke re-runs the effect: React first runs the PREVIOUS effect's cleanup (`clearTimeout`), cancelling the in-flight timer, then arms a fresh one. So the state only updates once typing pauses for `delay` ms. Forget the cleanup and every keystroke leaves a live timer, firing a burst of stale updates — the exact bug behind laggy search boxes.",
      docRef: DOC,
    }),
};

/* ── Level 5 — the hooks most people never reach for ── */

const imperativeHandle: Generator = {
  id: "hooks-imperative-handle",
  title: "Expose a method with useImperativeHandle",
  generate: () =>
    codeTask({
      genId: "hooks-imperative-handle",
      prompt:
        "Write a `FancyInput` that wraps an `<input>` and exposes ONLY a `focus()` method to its parent — not the raw DOM node. Use `forwardRef` + `useImperativeHandle`, backed by an internal ref to the real input.",
      language: "tsx",
      starter: `const FancyInput = /* forwardRef component */;`,
      solution: `const FancyInput = forwardRef((props, ref) => {\n  const inputRef = useRef(null);\n  useImperativeHandle(ref, () => ({\n    focus: () => inputRef.current.focus(),\n  }));\n  return <input ref={inputRef} {...props} />;\n});`,
      checks: [
        { re: "forwardRef\\(", label: "wraps the component in `forwardRef`" },
        { re: "useImperativeHandle\\(\\s*ref", label: "attaches a handle to the forwarded `ref`" },
        { re: "focus:\\s*", label: "the handle exposes a `focus` method" },
        { re: "useRef\\(", label: "keeps an internal ref to the real input" },
      ],
      explanation:
        "`forwardRef` lets a parent's ref reach *into* your component; `useImperativeHandle` then decides what that ref actually points at — here a tiny `{ focus }` object instead of the DOM node. That's encapsulation: the parent can focus the field but can't poke at its styles or value. Use it sparingly — it's the escape hatch for the rare imperative API (focus, scroll, play), not a substitute for props.",
      docRef: DOC,
    }),
};

const syncExternalStore: Generator = {
  id: "hooks-sync-external-store",
  title: "Subscribe with useSyncExternalStore",
  generate: () =>
    codeTask({
      genId: "hooks-sync-external-store",
      prompt:
        "Write `useOnlineStatus()` returning the browser's online state and re-rendering when it flips. This value lives OUTSIDE React (`navigator.onLine`, with `online`/`offline` events on `window`), so reach for the hook built to subscribe to an external store: wire up the events with a cleanup, and read the current value.",
      language: "tsx",
      starter: `function useOnlineStatus() {\n  // your hook\n}`,
      solution: `function useOnlineStatus() {\n  return useSyncExternalStore(\n    (callback) => {\n      window.addEventListener("online", callback);\n      window.addEventListener("offline", callback);\n      return () => {\n        window.removeEventListener("online", callback);\n        window.removeEventListener("offline", callback);\n      };\n    },\n    () => navigator.onLine,\n  );\n}`,
      checks: [
        { re: "useSyncExternalStore\\(", label: "uses `useSyncExternalStore`" },
        { re: "addEventListener\\(\\s*[\"']online", label: "subscribes to the `online` event" },
        { re: "removeEventListener\\(", label: "subscribe returns a cleanup that unsubscribes" },
        { re: "navigator\\.onLine", label: "snapshot reads `navigator.onLine`" },
      ],
      explanation:
        "`useSyncExternalStore` is the sanctioned way to read a value that lives OUTSIDE React — a browser API, a global store, localStorage. `subscribe(cb)` tells React how to be notified of changes (and returns a cleanup); `getSnapshot()` reads the current value. React re-renders when a notification arrives and the snapshot differs. It also renders correctly during concurrent/streamed SSR, which a naive `useEffect` + `useState` version can tear on. The dojo's own progress store is built on exactly this hook.",
      docRef: DOC,
    }),
};

/* ── Level 1 — more useState situations ── */

const objectState: Generator = {
  id: "hooks-object-state",
  title: "Update one field of object state",
  generate: () =>
    codeTask({
      genId: "hooks-object-state",
      prompt:
        "State that holds an object must be updated IMMUTABLY. Given `const [user, setUser] = useState({ name: '', email: '' })`, write `onChangeName(e)` that updates ONLY `name` from `e.target.value`, leaving `email` untouched — with the functional updater and a spread.",
      language: "tsx",
      starter: `const [user, setUser] = useState({ name: "", email: "" });\n\nconst onChangeName = /* your handler */;`,
      solution: `const [user, setUser] = useState({ name: "", email: "" });\n\nconst onChangeName = (e) =>\n  setUser((u) => ({ ...u, name: e.target.value }));`,
      checks: [
        { re: "setUser\\(\\s*\\(?\\s*\\w+\\s*\\)?\\s*=>", label: "uses the functional updater `setUser(u => …)`" },
        { re: "\\{\\s*\\.\\.\\.\\s*\\w+", label: "spreads the previous object" },
        { re: "user\\.\\w+\\s*=", expect: false, label: "never mutates `user` in place" },
      ],
      explanation:
        "React replaces object state wholesale — it does not merge like class `setState` did. So `setUser({ name })` would DROP `email`. Spread the old object then override the one field: `{ ...u, name: value }`. The updater form `u => …` reads the latest state (safe under batching), and never mutating means React sees a new reference and re-renders. This is the exact shape of every controlled form.",
      docRef: DOC,
    }),
};

const lazyInit: Generator = {
  id: "hooks-lazy-init",
  title: "Lazy state initializer",
  generate: () =>
    codeTask({
      genId: "hooks-lazy-init",
      prompt:
        "`computeInitial()` is expensive. Initialize state with it so it runs ONCE on mount, not on every render. Use the lazy initializer form of `useState`.",
      language: "tsx",
      starter: `const [value, setValue] = useState(computeInitial());`,
      solution: `const [value, setValue] = useState(() => computeInitial());`,
      checks: [
        { re: "useState\\(\\s*\\(\\)\\s*=>\\s*computeInitial", label: "passes a function: `useState(() => computeInitial())`" },
      ],
      explanation:
        "`useState(computeInitial())` CALLS `computeInitial()` on every render — JavaScript evaluates the argument before React sees it — even though React ignores the result after mount. Passing a FUNCTION, `useState(() => computeInitial())`, lets React invoke it only on the first render. Reach for the lazy form whenever the initial value comes from parsing, `localStorage`, or any non-trivial work.",
      docRef: DOC,
    }),
};

const renderCount: Generator = {
  id: "hooks-render-count",
  title: "Count renders with a ref",
  generate: () =>
    codeTask({
      genId: "hooks-render-count",
      prompt:
        "Show how many times a component has rendered WITHOUT causing any extra renders. You need mutable storage that survives every render but never triggers one (putting the count in state would loop forever) — increment it each render and display the running total.",
      language: "tsx",
      starter: `function RenderCounter() {\n  // count renders without triggering more\n  return <p>Rendered ? times</p>;\n}`,
      solution: `function RenderCounter() {\n  const renders = useRef(0);\n  renders.current += 1;\n  return <p>Rendered {renders.current} times</p>;\n}`,
      checks: [
        { re: "useRef\\(\\s*0\\s*\\)", label: "starts the ref at 0 (`useRef(0)`)" },
        { re: "\\.current\\s*\\+=\\s*1|\\.current\\s*=\\s*\\w+\\.current\\s*\\+\\s*1|\\.current\\+\\+", label: "increments `ref.current` each render" },
        { re: "\\{\\s*\\w+\\.current\\s*\\}", label: "renders `ref.current`" },
      ],
      explanation:
        "A ref is mutable storage that survives renders but never triggers one — perfect for a render counter, which must not itself cause a render (that would loop forever). Writing `renders.current += 1` during render is fine here because it's diagnostic, not UI state. If you put the count in `useState` instead, each increment would schedule another render — an infinite loop.",
      docRef: DOC,
    }),
};

/* ── Level 2 — more useEffect situations ── */

const documentTitle: Generator = {
  id: "hooks-document-title",
  title: "Sync the document title",
  generate: () =>
    codeTask({
      genId: "hooks-document-title",
      prompt:
        "Keep the browser tab title in sync with a `count` prop: whenever `count` changes, set `document.title` to `Count: <count>`. This is a side effect, so it belongs in an effect with the right dependency.",
      language: "tsx",
      starter: `function Counter({ count }) {\n  // sync document.title with count\n  return <span>{count}</span>;\n}`,
      solution: `function Counter({ count }) {\n  useEffect(() => {\n    document.title = \`Count: \${count}\`;\n  }, [count]);\n  return <span>{count}</span>;\n}`,
      checks: [
        { re: "useEffect\\(", label: "runs the effect" },
        { re: "document\\.title\\s*=", label: "sets `document.title`" },
        { re: "\\[\\s*count\\s*\\]", label: "depends on `[count]`" },
      ],
      explanation:
        "Anything that reaches OUTSIDE React's render — the DOM title, timers, subscriptions, network — is a side effect and goes in `useEffect`. The dependency array `[count]` re-runs it exactly when `count` changes: empty `[]` would set the title once and never update; omitting the array would run it every render (usually wasteful, sometimes a loop).",
      docRef: DOC,
    }),
};

const windowResize: Generator = {
  id: "hooks-window-resize",
  title: "Track window width",
  generate: () =>
    codeTask({
      genId: "hooks-window-resize",
      prompt:
        "Write `useWindowWidth()`: return the current `window.innerWidth`, updating on every resize. Subscribe with a `resize` listener in an effect and REMOVE it in the cleanup so you don't leak listeners.",
      language: "tsx",
      starter: `function useWindowWidth() {\n  // your hook\n}`,
      solution: `function useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);\n  useEffect(() => {\n    const onResize = () => setWidth(window.innerWidth);\n    window.addEventListener("resize", onResize);\n    return () => window.removeEventListener("resize", onResize);\n  }, []);\n  return width;\n}`,
      checks: [
        { re: "addEventListener\\(\\s*[\"']resize[\"']", label: "subscribes to `resize`" },
        { re: "removeEventListener\\(\\s*[\"']resize[\"']", label: "cleanup removes the SAME listener" },
        { re: "return\\s*\\(\\s*\\)\\s*=>", label: "effect returns a cleanup" },
        { re: "\\[\\s*\\]", label: "subscribes once (`[]` deps)" },
      ],
      explanation:
        "Every subscription needs a matching teardown. Note the listener is a NAMED function so `removeEventListener` can pass the exact same reference — an inline arrow in both spots would be two different functions and the removal would silently do nothing. Empty deps mean 'subscribe once on mount, unsubscribe on unmount'.",
      docRef: DOC,
    }),
};

const memoFilter: Generator = {
  id: "hooks-memo-filter",
  title: "Memoize a filtered list",
  generate: () =>
    codeTask({
      genId: "hooks-memo-filter",
      prompt:
        "A component receives `users` and re-renders often. Derive `activeUsers` (only those with `user.active`) but memoize it so the filter re-runs only when `users` changes, not on every unrelated render.",
      language: "tsx",
      starter: `const activeUsers = /* memoized derivation */;`,
      solution: `const activeUsers = useMemo(\n  () => users.filter((u) => u.active),\n  [users]\n);`,
      checks: [
        { re: "useMemo\\(", label: "wraps the work in `useMemo`" },
        { re: "\\.filter\\(", label: "filters the list" },
        { re: "\\[\\s*users\\s*\\]", label: "depends on exactly `[users]`" },
      ],
      explanation:
        "`useMemo(fn, [users])` caches the filtered array until `users` changes identity. Without it, a new array is built every render — cheap here, but it also breaks referential equality for anything downstream that depends on `activeUsers` (a `useEffect`, a `React.memo` child). Memoize derived data when it's expensive OR when its identity feeds another hook.",
      docRef: DOC,
    }),
};

/* ── Level 3 — more custom hooks & reducers ── */

const useInterval: Generator = {
  id: "hooks-use-interval",
  title: "Write useInterval (latest-ref)",
  generate: () =>
    codeTask({
      genId: "hooks-use-interval",
      prompt:
        "Write `useInterval(callback, delay)` that runs `callback` every `delay` ms. The catch: it must always invoke the LATEST `callback` (props/state may change between ticks) WITHOUT tearing down and recreating the timer on every render. Find a way to keep the running timer stable while still reaching today's callback.",
      language: "tsx",
      starter: `function useInterval(callback, delay) {\n  // your hook\n}`,
      solution: `function useInterval(callback, delay) {\n  const savedCallback = useRef(callback);\n\n  useEffect(() => {\n    savedCallback.current = callback;\n  }, [callback]);\n\n  useEffect(() => {\n    const id = setInterval(() => savedCallback.current(), delay);\n    return () => clearInterval(id);\n  }, [delay]);\n}`,
      checks: [
        { re: "useRef\\(\\s*callback\\s*\\)", label: "stores the callback in a ref" },
        { re: "savedCallback\\.current\\s*=\\s*callback", label: "keeps the ref updated to the latest callback" },
        { re: "setInterval\\(", label: "sets the interval" },
        { re: "clearInterval\\(", label: "cleanup clears it" },
        { re: "\\[\\s*delay\\s*\\]", label: "interval effect depends only on `[delay]`" },
      ],
      explanation:
        "This is Dan Abramov's classic pattern. If you put `callback` in the interval effect's deps, the timer resets on every render. Instead, the interval reads `savedCallback.current` — a live ref that a separate effect keeps pointing at the newest callback. So the timer is stable (keyed only on `delay`) but never fires a stale closure. It's the template behind `useDebouncedValue`, polling hooks, and animations.",
      docRef: DOC,
    }),
};

const useClickOutside: Generator = {
  id: "hooks-click-outside",
  title: "Write useOnClickOutside",
  generate: () =>
    codeTask({
      genId: "hooks-click-outside",
      prompt:
        "Write `useOnClickOutside(ref, handler)` that calls `handler` when a `mousedown` lands OUTSIDE the element `ref` points to. Listen on the `document` and remove the listener on cleanup; you'll need a way to test whether the click's target sits inside the referenced element.",
      language: "tsx",
      starter: `function useOnClickOutside(ref, handler) {\n  // your hook\n}`,
      solution: `function useOnClickOutside(ref, handler) {\n  useEffect(() => {\n    const listener = (e) => {\n      if (!ref.current || ref.current.contains(e.target)) return;\n      handler(e);\n    };\n    document.addEventListener("mousedown", listener);\n    return () => document.removeEventListener("mousedown", listener);\n  }, [ref, handler]);\n}`,
      checks: [
        { re: "addEventListener\\(\\s*[\"']mousedown[\"']", label: "listens for `mousedown` on document" },
        { re: "\\.contains\\(\\s*\\w+\\.target\\s*\\)", label: "tests `ref.current.contains(e.target)`" },
        { re: "removeEventListener\\(", label: "cleanup removes the listener" },
      ],
      explanation:
        "The core check is `ref.current.contains(e.target)`: if the click's target is inside the element, ignore it; otherwise it's an outside click, so fire `handler` (close the dropdown/modal). Guarding `!ref.current` avoids crashing before mount. `mousedown` (not `click`) is deliberate — it fires before focus shifts, which feels snappier and avoids some edge cases. Cleanup prevents duplicate listeners stacking up.",
      docRef: DOC,
    }),
};

const formReducer: Generator = {
  id: "hooks-form-reducer",
  title: "A form reducer (runs for real)",
  generate: () =>
    codeTask({
      genId: "hooks-form-reducer",
      prompt:
        "Write the pure `formReducer(state, action)` for a `useReducer` form. `state` is a flat object of fields. Actions: `{ type: \"set-field\", field, value }` sets ONE field (computed key), `{ type: \"reset\", initial }` returns `initial`. Never mutate — your code runs against tests.",
      language: "javascript",
      starter: `function formReducer(state, action) {\n  // return the next state\n}`,
      solution: `function formReducer(state, action) {\n  switch (action.type) {\n    case "set-field":\n      return { ...state, [action.field]: action.value };\n    case "reset":\n      return action.initial;\n    default:\n      return state;\n  }\n}`,
      checks: [
        { re: "\\.\\.\\.\\s*state", label: "spreads the old state for `set-field`" },
        { re: "\\[\\s*action\\.field\\s*\\]", label: "uses a computed key `[action.field]`" },
        { re: "state\\.\\w+\\s*=", expect: false, label: "never mutates `state`" },
      ],
      fn: {
        name: "formReducer",
        tests: [
          { args: [{ name: "", email: "" }, { type: "set-field", field: "name", value: "Ada" }], expected: { name: "Ada", email: "" } },
          { args: [{ name: "x" }, { type: "set-field", field: "email", value: "a@b.co" }], expected: { name: "x", email: "a@b.co" } },
          { args: [{ name: "x" }, { type: "reset", initial: { name: "" } }], expected: { name: "" } },
          { args: [{ a: 1 }, { type: "noop" }], expected: { a: 1 } },
        ],
      },
      explanation:
        "`{ [action.field]: action.value }` is a COMPUTED PROPERTY KEY — the brackets mean 'use the value of `action.field` as the key', so one reducer case handles every field. Spreading `...state` first preserves the other fields (immutability); `reset` just returns the fresh `initial` object. This one reducer scales a 20-field form without 20 `useState` calls.",
      docRef: DOC,
    }),
};

/* ── Level 4 — correctness under async & responsive ── */

const abortFetch: Generator = {
  id: "hooks-abort-fetch",
  title: "Cancel a fetch on cleanup",
  generate: () =>
    codeTask({
      genId: "hooks-abort-fetch",
      prompt:
        "Inside a component with a `url` prop, write the effect that fetches `url` into `setData`. When `url` changes or the component unmounts, ABORT the in-flight request with an `AbortController` so a stale response can't land. Swallow the abort error.",
      language: "tsx",
      starter: `useEffect(() => {\n  // fetch url into setData, abortable\n}, [url]);`,
      solution: `useEffect(() => {\n  const controller = new AbortController();\n  fetch(url, { signal: controller.signal })\n    .then((r) => r.json())\n    .then(setData)\n    .catch(() => {});\n  return () => controller.abort();\n}, [url]);`,
      checks: [
        { re: "new\\s+AbortController\\(\\)", label: "creates an `AbortController`" },
        { re: "signal\\s*:\\s*\\w+\\.signal", label: "passes `signal` to `fetch`" },
        { re: "\\.abort\\(\\)", label: "cleanup aborts the request" },
        { re: "\\[\\s*url\\s*\\]", label: "re-fetches when `url` changes" },
      ],
      explanation:
        "`AbortController` is the modern race-condition fix: passing `controller.signal` to `fetch` lets the cleanup `controller.abort()` cancel the previous request before the next one starts. An aborted fetch rejects with an `AbortError`, hence the empty `.catch`. This actually cancels the network work (better than the `alive` boolean flag, which only ignores the late result). Essential for search-as-you-type.",
      docRef: DOC,
    }),
};

const useMediaQuery: Generator = {
  id: "hooks-media-query",
  title: "Write useMediaQuery",
  generate: () =>
    codeTask({
      genId: "hooks-media-query",
      prompt:
        "Write `useMediaQuery(query)` returning a boolean for whether the CSS media `query` (e.g. `\"(min-width: 768px)\"`) currently matches, updating when it flips. There's a browser API that both reports the current match and notifies you when it changes — seed state from it, subscribe to its change notification, and clean up.",
      language: "tsx",
      starter: `function useMediaQuery(query) {\n  // your hook\n}`,
      solution: `function useMediaQuery(query) {\n  const [matches, setMatches] = useState(false);\n  useEffect(() => {\n    const mql = window.matchMedia(query);\n    const onChange = () => setMatches(mql.matches);\n    onChange();\n    mql.addEventListener("change", onChange);\n    return () => mql.removeEventListener("change", onChange);\n  }, [query]);\n  return matches;\n}`,
      checks: [
        { re: "matchMedia\\(\\s*query\\s*\\)", label: "creates the query with `matchMedia(query)`" },
        { re: "addEventListener\\(\\s*[\"']change[\"']", label: "subscribes to its `change` event" },
        { re: "removeEventListener\\(", label: "cleanup unsubscribes" },
        { re: "\\[\\s*query\\s*\\]", label: "re-subscribes when `query` changes" },
      ],
      explanation:
        "`window.matchMedia(query)` returns a `MediaQueryList` whose `.matches` is the current answer and which fires `change` when it flips. Calling `onChange()` once immediately seeds the correct value (state started at a guess of `false`). Re-keying on `query` handles a changing query string. This is how you branch behaviour on breakpoints in JS rather than CSS.",
      docRef: DOC,
    }),
};

/* ── Level 5 — context patterns ── */

const contextGuard: Generator = {
  id: "hooks-context-guard",
  title: "A guarded context hook",
  generate: () =>
    codeTask({
      genId: "hooks-context-guard",
      prompt:
        "The idiomatic way to expose context is a custom hook that FAILS LOUDLY when used outside its provider. `ThemeContext` defaults to `null`. Write `useTheme()`: read the context and, if it's `null`, throw `\"useTheme must be used within a ThemeProvider\"`; otherwise return it.",
      language: "tsx",
      starter: `const ThemeContext = createContext(null);\n\nfunction useTheme() {\n  // read + guard\n}`,
      solution: `const ThemeContext = createContext(null);\n\nfunction useTheme() {\n  const ctx = useContext(ThemeContext);\n  if (ctx === null) {\n    throw new Error("useTheme must be used within a ThemeProvider");\n  }\n  return ctx;\n}`,
      checks: [
        { re: "useContext\\(\\s*ThemeContext\\s*\\)", label: "reads the context" },
        { re: "===\\s*null|==\\s*null|!\\s*ctx", label: "checks for the missing-provider case" },
        { re: "throw\\s+new\\s+Error\\(", label: "throws a helpful error" },
        { re: "return\\s+ctx", label: "returns the context when present" },
      ],
      explanation:
        "Exporting `useTheme()` instead of the raw `ThemeContext` gives you two wins: the null-check means a missing `<ThemeProvider>` throws a clear message at the exact component, instead of a mysterious crash three layers down when someone reads `theme.color` off `null`; and consumers get a fully-typed value with no `| null` to handle. This wrapper-hook pattern is standard for every non-trivial context.",
      docRef: DOC,
    }),
};

/* ── Multi-file capstone — assemble a whole feature across files ── */

const themeFeature: Generator = {
  id: "hooks-theme-feature",
  title: "Assemble a theme context feature",
  generate: () =>
    multiFileTask({
      genId: "hooks-theme-feature",
      prompt:
        "Wire up a theme feature the idiomatic React way — the **provider / custom-hook / consumer** split across files. `theme-context.tsx` holds the theme state and provides a `{ theme, toggle }` value; `use-theme.ts` is a guarded hook that reads that value and fails loudly if used with no provider above it; `ThemeToggle.tsx` consumes the hook and renders a button that flips the theme. Write each in its tab, **Debug this file**, then **submit all** — open a file's hints if a piece won't come.",
      files: [
        {
          name: "theme-context.tsx",
          language: "tsx",
          role: "creates the context and the provider that owns the state",
          hint: "Create the shared context with `createContext(null)` and export it. The provider is a component that holds the theme in `useState`, defines a `toggle` that flips it with the functional updater (`setTheme(t => …)`), and renders `<ThemeContext.Provider value={{ theme, toggle }}>{children}</…>`. Passing that object as `value` is what descendants read.",
          starter: `// create ThemeContext and a ThemeProvider that supplies { theme, toggle }`,
          solution: `export const ThemeContext = createContext(null);\n\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState("light");\n  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));\n  return (\n    <ThemeContext.Provider value={{ theme, toggle }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}`,
          checks: [
            { re: "createContext\\(", label: "creates the context with `createContext`" },
            { re: "useState\\(", label: "holds the theme in state" },
            { re: "setTheme\\(\\s*\\(?\\s*\\w+\\s*\\)?\\s*=>", label: "flips with the functional updater" },
            { re: "ThemeContext\\.Provider", label: "provides via `<ThemeContext.Provider>`" },
            { re: "value=\\{\\s*\\{", label: "passes `{ theme, toggle }` as the value" },
          ],
        },
        {
          name: "use-theme.ts",
          language: "tsx",
          role: "the guarded custom hook consumers import",
          hint: "A custom hook is just a function that calls other hooks. Read the value with `useContext(ThemeContext)`; if it's `null` (no provider above), `throw new Error(...)` with a clear message so misuse fails at the exact component instead of crashing later on `null`. Otherwise return it. Exporting this hook — not the raw context — is the idiom.",
          starter: `// a guarded hook: read ThemeContext, throw if used outside a ThemeProvider\nexport function useTheme() {\n}`,
          solution: `import { useContext } from "react";\nimport { ThemeContext } from "./theme-context";\n\nexport function useTheme() {\n  const ctx = useContext(ThemeContext);\n  if (ctx === null) {\n    throw new Error("useTheme must be used within a ThemeProvider");\n  }\n  return ctx;\n}`,
          checks: [
            { re: "useContext\\(\\s*ThemeContext\\s*\\)", label: "reads via `useContext(ThemeContext)`" },
            { re: "throw\\s+new\\s+Error\\(", label: "throws when used outside a provider" },
            { re: "return\\s+ctx", label: "returns the context when present" },
          ],
        },
        {
          name: "ThemeToggle.tsx",
          language: "tsx",
          role: "the consumer — talks to the hook, never the raw context",
          hint: "Call `useTheme()`, destructure `{ theme, toggle }` from it, and render a `<button onClick={toggle}>` whose label reflects the current `theme`. The component never imports `ThemeContext` directly — going through the hook is the whole point.",
          starter: `// consume useTheme() and render a button that calls toggle()\nexport function ThemeToggle() {\n}`,
          solution: `import { useTheme } from "./use-theme";\n\nexport function ThemeToggle() {\n  const { theme, toggle } = useTheme();\n  return (\n    <button onClick={toggle}>\n      {theme === "light" ? "🌙 Dark" : "☀️ Light"}\n    </button>\n  );\n}`,
          checks: [
            { re: "useTheme\\(\\)", label: "reads the theme via the `useTheme()` hook" },
            { re: "\\{\\s*theme\\s*,\\s*toggle\\s*\\}", label: "destructures `{ theme, toggle }`" },
            { re: "onClick=\\{\\s*toggle\\s*\\}", label: "the button calls `toggle`" },
          ],
        },
      ],
      crossChecks: [
        {
          re: "(?=[\\s\\S]*ThemeContext\\.Provider)(?=[\\s\\S]*useContext\\(\\s*ThemeContext\\s*\\))(?=[\\s\\S]*useTheme\\(\\))",
          label: "the provider supplies the context, the hook reads it, and the button consumes the hook",
        },
        {
          re: "(?=[\\s\\S]*const\\s+toggle\\s*=)(?=[\\s\\S]*onClick=\\{\\s*toggle\\s*\\})",
          label: "the `toggle` the provider defines is what the button calls",
        },
      ],
      explanation:
        "This is the canonical way to share state without prop-drilling: a **provider** owns the `useState` and exposes a stable `{ theme, toggle }` value; a **custom hook** (`useTheme`) wraps `useContext` and throws a clear error when there's no provider above — so a misuse fails at the exact component instead of crashing three layers down on `null`; and **consumers** only ever import the hook, never the raw context. Splitting them across files is what lets any component deep in the tree flip the theme by importing one hook, and keeps the context object in one place to memoize.",
      docRef: DOC,
    }),
};

/* Reuse the battle-tested react-code gens as mid-ladder rungs, then layer the
   new hooks on top. Keyed by genId so levels attach without duplicating them. */
const reused: Record<string, CodingExercise["level"]> = {
  "react-code-controlled": 2,
  "react-code-memo": 2,
  "react-code-stale-fix": 2,
  "react-code-usefetch": 3,
  "react-code-uselocalstorage": 3,
  "react-code-reducer": 3,
};
const reusedExercises: CodingExercise[] = reactCodeGens
  .filter((g) => g.id in reused)
  .map((g) => ({ level: reused[g.id]!, gen: g }));

export const reactHooksTrack: CodingTrack = {
  id: "coding-react",
  title: "React Hooks",
  icon: "⚛️",
  stack: "TypeScript · React",
  blurb:
    "Every core hook, each in several situations — from your first useState counter to useImperativeHandle. Understand them by building them.",
  exercises: [
    { level: 1, gen: counter },
    { level: 1, gen: useToggle },
    { level: 1, gen: focusOnMount },
    { level: 1, gen: objectState },
    { level: 1, gen: lazyInit },
    ...reusedExercises,
    { level: 2, gen: renderCount },
    { level: 2, gen: documentTitle },
    { level: 2, gen: windowResize },
    { level: 2, gen: memoFilter },
    { level: 3, gen: usePrevious },
    { level: 3, gen: useCallbackChild },
    { level: 3, gen: useContextTheme },
    { level: 3, gen: useInterval },
    { level: 3, gen: useClickOutside },
    { level: 3, gen: formReducer },
    { level: 3, gen: themeFeature },
    { level: 4, gen: todosReducer },
    { level: 4, gen: useDebouncedValue },
    { level: 4, gen: abortFetch },
    { level: 4, gen: useMediaQuery },
    { level: 5, gen: imperativeHandle },
    { level: 5, gen: syncExternalStore },
    { level: 5, gen: contextGuard },
  ],
};
