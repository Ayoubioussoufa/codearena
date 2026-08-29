/**
 * React — code-writing exercises. Structure-checked (and the reducer runs
 * for real against test cases). Imported by react.ts.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";

const DOC = { slug: "react-fundamentals", label: "Dojo guide — React fundamentals" };

const staleFix: Generator = {
  id: "react-code-stale-fix",
  title: "✍️ Fix the stale interval effect",
  generate: () =>
    codeTask({
      genId: "react-code-stale-fix",
      prompt:
        "This timer sticks at 1 and leaks its interval on unmount. Fix BOTH bugs: make it count correctly, and clean up properly.",
      language: "tsx",
      starter: `const [seconds, setSeconds] = useState(0);\n\nuseEffect(() => {\n  const id = setInterval(() => {\n    setSeconds(seconds + 1);\n  }, 1000);\n}, []);`,
      solution: `const [seconds, setSeconds] = useState(0);\n\nuseEffect(() => {\n  const id = setInterval(() => {\n    setSeconds(s => s + 1);\n  }, 1000);\n  return () => clearInterval(id);\n}, []);`,
      checks: [
        { re: "setSeconds\\(\\s*\\w+\\s*=>", label: "uses the functional updater `setSeconds(s => …)`" },
        { re: "setSeconds\\(\\s*seconds", expect: false, label: "no stale `seconds` read inside the interval callback" },
        { re: "return\\s*\\(\\s*\\)\\s*=>\\s*\\{?\\s*clearInterval", label: "returns a cleanup that clears the interval" },
      ],
      explanation:
        "The `[]` effect runs once, so its callback is frozen in the first render's photo where `seconds = 0` — `seconds + 1` is forever 1. The updater form `setSeconds(s => s + 1)` asks React for the *current* value instead of the captured one. Bug two: every effect that *starts* something (interval, subscription, listener) must return a cleanup that stops it — otherwise unmounting leaks a live timer that keeps calling setState on a component that's gone.",
      docRef: DOC,
    }),
};

const useFetch: Generator = {
  id: "react-code-usefetch",
  title: "✍️ Write a fetching hook",
  generate: () =>
    codeTask({
      genId: "react-code-usefetch",
      prompt:
        "Write a custom hook `useProblems(query)`: fetch with `getProblems(query)` into state (start at `null`), refetch when `query` changes, and make sure a SLOW older response can never overwrite a newer one. Return the data.",
      language: "tsx",
      starter: `function useProblems(query) {\n  // your hook\n}`,
      solution: `function useProblems(query) {\n  const [data, setData] = useState(null);\n\n  useEffect(() => {\n    let alive = true;\n    getProblems(query).then(result => {\n      if (alive) setData(result);\n    });\n    return () => {\n      alive = false;\n    };\n  }, [query]);\n\n  return data;\n}`,
      checks: [
        { re: "useState\\(", label: "holds the result in state" },
        { re: "useEffect\\(", label: "fetches inside an effect" },
        { re: "getProblems\\(", label: "calls `getProblems(query)`" },
        { re: "\\[\\s*query\\s*\\]", label: "effect re-runs when `query` changes (`[query]` deps)" },
        { re: "return\\s*\\(\\s*\\)\\s*=>", label: "cleanup guards against stale responses" },
      ],
      explanation:
        "The `alive` flag is the load-bearing part. When `query` changes (or the component unmounts), the cleanup flips the PREVIOUS effect's flag to `false` before the next effect runs — so when the old, slow response finally arrives it checks `alive`, sees `false`, and quietly drops itself. Without it, two responses can land out of order and the *older* one wins, overwriting fresh data — the classic race your problems-page TODO must handle.",
      docRef: DOC,
    }),
};

const reducer: Generator = {
  id: "react-code-reducer",
  title: "✍️ Write a workspace reducer (runs for real)",
  generate: () =>
    codeTask({
      genId: "react-code-reducer",
      prompt:
        "Write the pure reducer `workspaceReducer(state, action)` for a useReducer editor. Actions: `{ type: \"set-code\", code }`, `{ type: \"set-language\", language }`, `{ type: \"reset\", starter }` (reset replaces `code` with `starter`, keeps the language). Always return a NEW object — your code is executed against real test cases.",
      language: "javascript",
      starter: `function workspaceReducer(state, action) {\n  // state shape: { language, code }\n}`,
      solution: `function workspaceReducer(state, action) {\n  switch (action.type) {\n    case "set-code":\n      return { ...state, code: action.code };\n    case "set-language":\n      return { ...state, language: action.language };\n    case "reset":\n      return { ...state, code: action.starter };\n    default:\n      return state;\n  }\n}`,
      checks: [
        { re: "state\\.\\w+\\s*=", expect: false, label: "never mutates `state` directly" },
        { re: "\\.\\.\\.\\s*state", label: "builds the next state by spreading the old one" },
      ],
      fn: {
        name: "workspaceReducer",
        tests: [
          { args: [{ language: "js", code: "a" }, { type: "set-code", code: "b" }], expected: { language: "js", code: "b" } },
          { args: [{ language: "js", code: "a" }, { type: "set-language", language: "py" }], expected: { language: "py", code: "a" } },
          { args: [{ language: "py", code: "x" }, { type: "reset", starter: "s" }], expected: { language: "py", code: "s" } },
        ],
      },
      explanation:
        "Reducers must be **pure** — a pure function just maps inputs to a result with no side effects and no mutation: same (state, action) in, same brand-new state out. React decides 'did it change?' by comparing object *references*, so if you edit `state` in place the reference stays identical and nothing re-renders (or worse, memoized children skip the update while the data changed under them). So: spread a copy for the slice you're changing, pass everything else through. This exact shape scales from useReducer to Redux to your WorkspaceProvider.",
      docRef: DOC,
    }),
};

const memoRows: Generator = {
  id: "react-code-memo",
  title: "✍️ Memoize a derived table",
  generate: () =>
    codeTask({
      genId: "react-code-memo",
      prompt:
        "Inside a component receiving `entries` and `sortKey` props, write the `rows` derivation: sorted by `sortKey` DESCENDING, memoized so unrelated re-renders don't re-sort, and without ever mutating the `entries` prop.",
      language: "tsx",
      starter: `const rows = /* your derivation */;`,
      solution: `const rows = useMemo(\n  () => [...entries].sort((a, b) => b[sortKey] - a[sortKey]),\n  [entries, sortKey]\n);`,
      checks: [
        { re: "useMemo\\(", label: "wraps the work in `useMemo`" },
        { re: "\\[\\s*entries\\s*,\\s*sortKey\\s*\\]|\\[\\s*sortKey\\s*,\\s*entries\\s*\\]", label: "depends on exactly `[entries, sortKey]`" },
        { re: "\\[\\s*\\.\\.\\.\\s*entries\\s*\\]|entries\\.slice\\(\\)", label: "sorts a COPY (spread or slice)" },
        { re: "(?<![.\\]])\\bentries\\.sort\\(", expect: false, label: "never calls `.sort()` on the prop itself" },
        { re: "\\.sort\\(", label: "actually sorts" },
      ],
      explanation:
        "`.sort()` sorts the array **in place** (it rearranges the original), so sorting the prop directly corrupts the parent's data and breaks every other consumer. The fix is one word: **copy, then sort** — `[...entries].sort(...)`. `useMemo` with `[entries, sortKey]` then caches the result until one of those inputs changes identity — that's what your leaderboard's Force-re-render button checks. If it still re-sorts on every render, the culprit is upstream: a parent handing you a fresh `entries` array each time.",
      docRef: DOC,
    }),
};

const controlled: Generator = {
  id: "react-code-controlled",
  title: "✍️ Controlled input + derived filter",
  generate: () =>
    codeTask({
      genId: "react-code-controlled",
      prompt:
        "Write `ProblemSearch({ problems })`: a CONTROLLED search input plus the list of matching problems (title contains the query, case-insensitive). The filtered list must be derived during render — no effect, no second state. Give list items a stable key.",
      language: "tsx",
      starter: `function ProblemSearch({ problems }) {\n  return (\n    <div>\n      <input placeholder="Search problems…" />\n      <ul>{/* matching problems */}</ul>\n    </div>\n  );\n}`,
      solution: `function ProblemSearch({ problems }) {\n  const [query, setQuery] = useState("");\n  const visible = problems.filter(p =>\n    p.title.toLowerCase().includes(query.toLowerCase())\n  );\n  return (\n    <div>\n      <input\n        value={query}\n        onChange={e => setQuery(e.target.value)}\n        placeholder="Search problems…"\n      />\n      <ul>\n        {visible.map(p => (\n          <li key={p.slug}>{p.title}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}`,
      checks: [
        { re: "useState\\(", label: "query lives in state" },
        { re: "value=\\{", label: "input is controlled (`value={…}`)" },
        { re: "onChange=\\{", label: "keystrokes flow through `onChange`" },
        { re: "\\.target\\.value", label: "reads `e.target.value`" },
        { re: "toLowerCase\\(\\)", label: "matches case-insensitively" },
        { re: "key=\\{", label: "list items have a stable `key`" },
        { re: "useEffect", expect: false, label: "no effect — the list is derived during render" },
      ],
      explanation:
        "One source of truth: the query string in state. The visible list is *computed from* `problems + query`, so you derive it inline during render — copying it into a second `useState` via an effect would cause an extra render and, sooner or later, drift out of sync with the query. Remember the rule: **derive, don't store.** This is the exact skeleton of your problems-page search — add the difficulty filter and sort as *more derivation*, not more state.",
      docRef: DOC,
    }),
};

const useLocalStorage: Generator = {
  id: "react-code-uselocalstorage",
  title: "✍️ Write useLocalStorage",
  generate: () =>
    codeTask({
      genId: "react-code-uselocalstorage",
      prompt:
        "Write `useLocalStorage(key, initial)` returning `[value, update]`: read the stored JSON only ONCE when the hook mounts (not on every render — that rules out reading it in the plain state initializer), fall back to `initial` when nothing's stored, and persist on every update.",
      language: "tsx",
      starter: `function useLocalStorage(key, initial) {\n  // your hook\n}`,
      solution: `function useLocalStorage(key, initial) {\n  const [value, setValue] = useState(() => {\n    const stored = localStorage.getItem(key);\n    return stored !== null ? JSON.parse(stored) : initial;\n  });\n\n  function update(next) {\n    setValue(next);\n    localStorage.setItem(key, JSON.stringify(next));\n  }\n\n  return [value, update];\n}`,
      checks: [
        { re: "useState\\(\\s*\\(\\)\\s*=>", label: "lazy initializer — `useState(() => …)`" },
        { re: "localStorage\\.getItem\\(", label: "reads the stored value" },
        { re: "localStorage\\.setItem\\(", label: "persists on update" },
        { re: "JSON\\.parse\\(", label: "parses the stored JSON" },
        { re: "JSON\\.stringify\\(", label: "serializes before storing" },
      ],
      explanation:
        "Passing a *function* — `useState(() => …)` — makes React run the initializer exactly once, on mount. Passing a value — `useState(expensiveRead())` — would run `expensiveRead()` on *every* render, because JavaScript evaluates the argument before React ever sees it (React can't 'skip' an argument that's already been computed). The `update` wrapper keeps state and storage in sync in one place. (In a real app you'd also guard for server-side rendering where `localStorage` doesn't exist — the dojo's own progress store does exactly this dance with `useSyncExternalStore`.)",
      docRef: DOC,
    }),
};

export const reactCodeGens: Generator[] = [
  staleFix,
  useFetch,
  reducer,
  memoRows,
  controlled,
  useLocalStorage,
];
