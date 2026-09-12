/**
 * Exercises for the React Fundamentals guide.
 *
 * Almost every React bug is one of three things: reading a stale value from a
 * closure, storing what you could compute, or reaching for an effect where no
 * effect is needed. These are weighted accordingly.
 */
import type { GuideExercise } from "./types";

export const reactExercises: GuideExercise[] = [
  {
    id: "updater-function",
    title: "Fix the counter that only counts once",
    prompt:
      "This increments by one, not three. Fix it without changing what the button is meant to do.",
    language: "typescript",
    given: `const [count, setCount] = useState(0);`,
    starter: `function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
`,
    solution: `function handleClick() {
  setCount((c) => c + 1);
  setCount((c) => c + 1);
  setCount((c) => c + 1);
}
`,
    hint: "`count` is a value captured when this render ran. All three lines read the same number — the one from before any of them.",
    explanation:
      "Each render is a **frozen photograph**: `count` is a `const` holding the value at render time, so all three calls compute `0 + 1`. The updater form asks React for the latest queued value instead of reading the captured one, so they chain. The rule worth keeping: **if the next state depends on the current state, use the updater form.** If it does not — `setName(input)` — the plain form is fine and clearer.",
    checks: [
      { re: "setCount\\(\\s*\\(\\w+\\)\\s*=>", label: "uses the updater form" },
      { re: "setCount\\(count \\+ 1\\)", expect: false, label: "no longer reads the captured value" },
      { re: "setCount[\\s\\S]*setCount[\\s\\S]*setCount", label: "still three increments" },
    ],
  },

  {
    id: "stale-closure",
    title: "Fix the timer that never moves",
    prompt:
      "This logs 0 forever. Fix it without removing the empty dependency array.",
    language: "typescript",
    given: `const [count, setCount] = useState(0);`,
    starter: `useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);
`,
    solution: `useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => c + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);
`,
    hint: "The effect runs once, so the function inside it captured `count` from the first render — and it is still holding that same zero a minute later.",
    explanation:
      "This is the classic **stale closure**. The interval callback closed over `count` when the effect ran, and `[]` means the effect never runs again, so it holds `0` permanently. Two fixes exist: add `count` to the deps — which tears down and recreates the interval every second, wrecking the timing — or use the updater form, which needs no captured value at all. **When a callback outlives the render that created it, do not read state from the closure.**",
    checks: [
      { re: "setCount\\(\\s*\\(\\w+\\)\\s*=>", label: "uses the updater form" },
      { re: "\\}, \\[\\]\\)", label: "keeps the empty deps — the interval is created once" },
      { re: "clearInterval", label: "still cleans up" },
      { re: "setCount\\(count", expect: false, label: "no captured `count`" },
    ],
  },

  {
    id: "derived-state",
    title: "Stop storing what you can compute",
    prompt:
      "There are two sources of truth here and they will disagree. Remove one.",
    language: "typescript",
    given: `const [items, setItems] = useState<Item[]>([]);`,
    starter: `const [total, setTotal] = useState(0);

useEffect(() => {
  setTotal(items.reduce((sum, i) => sum + i.price, 0));
}, [items]);

function addItem(item: Item) {
  setItems([...items, item]);
}
`,
    solution: `const total = items.reduce((sum, i) => sum + i.price, 0);

function addItem(item: Item) {
  setItems((prev) => [...prev, item]);
}
`,
    hint: "`total` is a function of `items`. Anything that is a function of state is not state.",
    explanation:
      "Storing derived state creates a second source of truth that can drift, and an effect to keep them in sync is a render-then-render-again round trip the user can sometimes see. **If you can compute it during render, compute it during render.** Only reach for `useMemo` when the calculation is genuinely expensive and you have measured it — summing a list of items is not. Note the updater form in `addItem` too: the next items depend on the current items.",
    checks: [
      { re: "const total = items\\.reduce|const total =", label: "computes the total during render" },
      { re: "useState\\(0\\)", expect: false, label: "no state for a derived value" },
      { re: "useEffect", expect: false, label: "no effect syncing two pieces of state" },
      { re: "setItems\\(\\s*\\(\\w+\\)\\s*=>", label: "uses the updater form for the append" },
    ],
  },

  {
    id: "effect-not-needed",
    title: "Delete the effect",
    prompt:
      "This uses an effect to react to a prop change. Rewrite it so no effect is involved.",
    language: "typescript",
    given: `function SearchResults({ query, allItems }: { query: string; allItems: Item[] }) { ... }`,
    starter: `const [results, setResults] = useState<Item[]>([]);

useEffect(() => {
  setResults(allItems.filter((i) => i.name.includes(query)));
}, [query, allItems]);

return <List items={results} />;
`,
    solution: `const results = allItems.filter((i) => i.name.includes(query));

return <List items={results} />;
`,
    hint: "Ask what this effect actually does. It reads two values already available during render and produces a third. That is just an expression.",
    explanation:
      "**Effects are for reaching outside React** — network, timers, subscriptions, the DOM. Transforming props into something renderable is not outside React, so an effect adds a wasted render pass and a window where `results` is stale relative to `query`. The question to ask of every effect: *what outside system am I synchronising with?* If the answer is 'none', delete it. This single check removes most effects in a typical codebase.",
    checks: [
      { re: "const results = allItems", label: "filters during render" },
      { re: "useEffect", expect: false, label: "no effect" },
      { re: "useState", expect: false, label: "no state for a computed list" },
    ],
  },

  {
    id: "list-keys",
    title: "Fix the list that loses its input",
    prompt:
      "Typing in a row's input, then deleting the row above it, moves the text to the wrong row. Fix it.",
    language: "typescript",
    given: `todos: { id: string; text: string }[]`,
    starter: `{todos.map((todo, index) => (
  <TodoRow key={index} todo={todo} />
))}
`,
    solution: `{todos.map((todo) => (
  <TodoRow key={todo.id} todo={todo} />
))}
`,
    hint: "A key tells React which component instance is which across renders. An index describes a position, and positions shift.",
    explanation:
      "With `key={index}`, deleting the first row makes every remaining row's key shift down by one — so React believes row 2 *became* row 1 and reuses that instance, along with its internal state and any DOM focus. The text stays put while the data moves under it. **A key must identify the item, not its position.** Index keys are only safe when the list is never reordered, filtered or spliced — which is rarely worth relying on.",
    checks: [
      { re: "key=\\{todo\\.id\\}", label: "keyed by a stable id" },
      { re: "key=\\{index\\}", expect: false, label: "no index key" },
    ],
  },

  {
    id: "controlled-input",
    title: "Make the input controlled",
    prompt:
      "This input is read-only and React logs a warning about it. Fix it, and add a trimmed submit guard.",
    language: "typescript",
    given: `const [name, setName] = useState('');`,
    starter: `<input value={name} />
<button onClick={submit}>Save</button>
`,
    solution: `<input value={name} onChange={(e) => setName(e.target.value)} />
<button onClick={submit} disabled={name.trim() === ''}>
  Save
</button>
`,
    hint: "A controlled input needs both halves: the value React owns, and the handler that lets the user change it.",
    explanation:
      "`value` without `onChange` tells React it owns the text and nothing may change it — so every keystroke is discarded. **Controlled means React holds the truth and the DOM reflects it**, which requires the round trip. The `trim()` guard matters because whitespace is not emptiness: `'   '` is truthy, so a naive `!name` check lets a blank name through and the failure appears in your database rather than in the UI.",
    checks: [
      { re: "onChange=", label: "has an onChange handler" },
      { re: "setName\\(e\\.target\\.value\\)", label: "writes the new value to state" },
      { re: "value=\\{name\\}", label: "stays controlled" },
      { re: "trim\\(\\)", label: "guards against whitespace-only input" },
    ],
  },

  {
    id: "rules-of-hooks",
    title: "Fix the conditional hook",
    prompt:
      "This throws `Rendered fewer hooks than expected` when `userId` is missing. Fix it without fetching for a missing id.",
    language: "typescript",
    given: `// useQuery accepts an "enabled" option that skips the fetch.`,
    starter: `function Profile({ userId }: { userId?: string }) {
  if (!userId) return <Empty />;

  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  return <Card user={data} />;
}
`,
    solution: `function Profile({ userId }: { userId?: string }) {
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: Boolean(userId),
  });

  if (!userId) return <Empty />;

  return <Card user={data} />;
}
`,
    hint: "Hooks first, branches after. The hook can still choose to do nothing.",
    explanation:
      "React tracks hooks **by call order**, not by name — there is no name to track. An early return means the next render calls fewer hooks, React's internal list misaligns, and your state silently belongs to a different hook. Hence: every hook, every render, same order, unconditionally. The fix is not to accept a wasted fetch — `enabled` lets the hook run while the work does not, which is the pattern for every 'I only need this sometimes' case.",
    checks: [
      { re: "useQuery\\([\\s\\S]*enabled", label: "the hook runs unconditionally, guarded by `enabled`" },
      { re: "if\\s*\\(!userId\\)[\\s\\S]*useQuery", expect: false, label: "no early return before a hook" },
      { re: "return <Empty", label: "still renders the empty state" },
    ],
  },

  {
    id: "useref-vs-state",
    title: "Pick ref or state",
    prompt:
      "For each, write `state` or `ref`.",
    language: "text",
    given: `1. the text typed into a controlled input
2. an interval id you need in order to clear it
3. whether a modal is open
4. the previous value of a prop, for a comparison
5. a DOM node you want to call .focus() on`,
    starter: `1.
2.
3.
4.
5.
`,
    solution: `1. state — it is rendered
2. ref — nothing on screen depends on it
3. state — it decides what renders
4. ref — read during the next render, but changing it must not cause one
5. ref — the DOM node itself is not rendered data
`,
    hint: "One question settles all five: does the screen need to change when this changes?",
    explanation:
      "**State is for things the UI renders; refs are for things it does not.** Setting state schedules a render, so putting an interval id there causes a pointless re-render every time you start a timer. Writing a ref does not, which is exactly why it must not hold anything rendered — the screen would silently show a stale value with no way to know. The test is one sentence: *would the user see something different?* Yes is state, no is a ref.",
    checks: [
      { re: "1\\.\\s*state", flags: "mi", label: "1 — state" },
      { re: "2\\.\\s*ref", flags: "mi", label: "2 — ref" },
      { re: "3\\.\\s*state", flags: "mi", label: "3 — state" },
      { re: "4\\.\\s*ref", flags: "mi", label: "4 — ref" },
      { re: "5\\.\\s*ref", flags: "mi", label: "5 — ref" },
    ],
  },

  {
    id: "effect-cleanup",
    title: "Add the cleanup that stops the race",
    prompt:
      "Typing quickly can leave older results on screen, because a slow earlier request lands after a fast later one. Fix it.",
    language: "typescript",
    given: `const [results, setResults] = useState<Item[]>([]);
// search(query) -> Promise<Item[]>`,
    starter: `useEffect(() => {
  search(query).then(setResults);
}, [query]);
`,
    solution: `useEffect(() => {
  let active = true;
  search(query).then((data) => {
    if (active) setResults(data);
  });
  return () => {
    active = false;
  };
}, [query]);
`,
    hint: "The effect for an old query cannot cancel its promise, but it can mark its own result as no longer wanted.",
    explanation:
      "Responses do not arrive in the order they were requested. Type 'ab' then 'abc' and the 'ab' response may land second, overwriting the correct results with stale ones — and it looks random, which makes it miserable to debug. The cleanup runs before the next effect, so the old closure's `active` flips to `false` and its result is discarded. **Any effect that sets state asynchronously needs this**, or an `AbortController` to cancel the request outright.",
    checks: [
      { re: "let (active|alive|cancelled|ignore)", label: "tracks whether this effect is still current" },
      { re: "return\\s*\\(\\)\\s*=>", label: "returns a cleanup" },
      { re: "if\\s*\\((active|alive|!cancelled|!ignore)\\)", label: "only sets state when still current" },
      { re: "\\.then\\(setResults\\)", expect: false, label: "no longer sets state unconditionally" },
    ],
  },

  {
    id: "usecallback-memo",
    title: "Make memoisation actually work",
    prompt:
      "`ExpensiveList` is wrapped in `React.memo` and still re-renders on every parent render. Fix the cause.",
    language: "typescript",
    given: `const ExpensiveList = React.memo(function ExpensiveList({ items, onSelect }) { ... });`,
    starter: `function Parent({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('');

  function handleSelect(id: string) {
    console.log(id);
  }

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ExpensiveList items={items} onSelect={handleSelect} />
    </>
  );
}
`,
    solution: `function Parent({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('');

  const handleSelect = useCallback((id: string) => {
    console.log(id);
  }, []);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ExpensiveList items={items} onSelect={handleSelect} />
    </>
  );
}
`,
    hint: "`React.memo` compares props with `===`. One prop here is a brand-new value on every render, even though the code is identical.",
    explanation:
      "A function declared during render is a **new object every time**, so `prevProps.onSelect === nextProps.onSelect` is always false and `React.memo` can never bail out. `useCallback` preserves the identity across renders, restoring the comparison. The corollary is the important half: **`useCallback` alone does nothing** — it only matters when the consumer compares identities, via `React.memo`, a dependency array, or a `useEffect`. Sprinkling it everywhere adds cost and buys nothing.",
    checks: [
      { re: "useCallback\\(", label: "stabilises the callback's identity" },
      { re: "\\},\\s*\\[\\]\\)", label: "with the right dependencies" },
      { re: "function handleSelect", expect: false, label: "no fresh function per render" },
    ],
  },

  {
    id: "context-split",
    title: "Stop a context re-rendering everything",
    prompt:
      "Every consumer re-renders whenever anything in this provider changes, including consumers that only read `user`. Fix it.",
    language: "typescript",
    given: `// Consumers: a header reading user, and a form calling login.`,
    starter: `export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  function login(credentials: Credentials) { /* ... */ }
  function logout() { /* ... */ }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
`,
    solution: `export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  const actions = useMemo(
    () => ({
      login(credentials: Credentials) { /* ... */ },
      logout() { /* ... */ },
    }),
    [],
  );

  return (
    <AuthStateContext.Provider value={user}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}
`,
    hint: "Two problems. The value object is new on every render, and the things that change often are bundled with the things that never change.",
    explanation:
      "`value={{ ... }}` builds a new object each render, so every consumer re-renders even when `user` is identical. Memoising fixes that. **Splitting state from actions fixes the deeper one**: the actions never change, so a component that only calls `login` should never re-render because someone logged in. Two contexts means each consumer subscribes to exactly what it uses — the standard shape for any provider holding both data and the functions that change it.",
    checks: [
      { re: "useMemo\\(", label: "memoises the actions so their identity is stable" },
      { re: "Provider[\\s\\S]*Provider", label: "splits state and actions into two contexts" },
      { re: "value=\\{\\{\\s*user,\\s*login", expect: false, label: "no fresh object literal as the value" },
    ],
  },

  {
    id: "custom-hook",
    title: "Extract a custom hook",
    prompt:
      "Pull this debounced value into a reusable `useDebounced` hook. It must clean up correctly when the value changes quickly.",
    language: "typescript",
    starter: `// in the component
const [query, setQuery] = useState('');
const [debounced, setDebounced] = useState(query);

useEffect(() => {
  const id = setTimeout(() => setDebounced(query), 300);
  return () => clearTimeout(id);
}, [query]);
`,
    solution: `export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

// in the component
const [query, setQuery] = useState('');
const debounced = useDebounced(query);
`,
    hint: "A custom hook is just a function starting with `use` that calls other hooks. Make it generic so it is not limited to strings.",
    explanation:
      "Custom hooks share **stateful logic**, not state — two components calling `useDebounced` get two independent timers, which is what you want. The generic `<T>` costs nothing and makes it work for any value. The `clearTimeout` cleanup is what makes it debounce at all: each change cancels the pending timer, so only a pause of `delay` with no changes lets one fire. Without it you would get every intermediate value, just late.",
    checks: [
      { re: "export function useDebounced|const useDebounced", label: "is a named `use…` function" },
      { re: "<T>", label: "is generic, not string-only" },
      { re: "clearTimeout", label: "cancels the pending timer on change" },
      { re: "\\[value", label: "re-runs when the value changes" },
      { re: "return debounced", label: "returns the debounced value" },
    ],
  },
];
