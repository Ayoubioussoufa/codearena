/**
 * Topic: React fundamentals (drills the Dojo supplement guide — the concepts
 * behind every TODO(practice) in apps/web).
 */
import { choice, numeric } from "../helpers";
import type { Generator, Topic } from "../types";
import { reactCodeGens } from "./react-code";

const DOC = { slug: "react-fundamentals", label: "Dojo guide — React fundamentals" };

const refsVsState: Generator = {
  id: "react-refs",
  title: "Refs vs state",
  generate: (rng) => {
    const cases = [
      { thing: "the interval id you'll need to clear later", answer: "A ref — mutable storage that survives renders without causing them", why: "Changing an interval id must not re-render anything; it's bookkeeping, not UI. A ref is exactly that: a mutable box whose `.current` you can write freely, persisted across renders, invisible to rendering." },
      { thing: "the seconds counter displayed in the timer", answer: "State — the UI must re-render when it changes", why: "Anything the user SEES must live in state: setState is what schedules the re-render that repaints the number. Put it in a ref and the value updates silently while the screen shows stale data forever." },
      { thing: "focusing the search input when the page loads", answer: "A ref — you need the actual DOM node to call .focus()", why: "Imperative DOM APIs (focus, scrollIntoView, media playback) need the element itself, and `ref={inputRef}` is React's sanctioned way to reach it. State can't help — there's nothing to render, just a method to call once." },
      { thing: "the previous value of a prop, for comparison next render", answer: "A ref — carry a value across renders without triggering one", why: "Writing this render's value into a ref (usually in an effect) leaves it readable NEXT render — a time capsule. Using state would cause an extra render per update just to remember something that never appears in the UI." },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "react-refs",
      prompt: `Where should this live: ${c.thing}?`,
      correct: c.answer,
      wrong: [
        c.answer.startsWith("State")
          ? "A ref — refs are faster than state"
          : "State — everything reactive belongs in useState",
        "A module-level variable outside the component",
        "A prop passed down from the parent",
      ],
      explanation: `${c.why} The line to memorise: **state drives what you SEE; a ref carries everything else across renders** — timers, DOM nodes, a previous value. A module-level variable (outside the component) is worse than either: it's shared by *every* copy of the component and survives unmounts, so two instances on screen would silently clobber each other's value.`,
      docRef: DOC,
    });
  },
};

const staleClosure: Generator = {
  id: "react-stale-closure",
  title: "Stale closures in effects",
  generate: (rng) => {
    const ticks = rng.int(3, 6);
    const functional = rng.chance(0.5);
    const answer = functional ? ticks : 1;
    return numeric({
      genId: "react-stale-closure",
      prompt: `This effect runs once on mount. After ${ticks} interval ticks, what does \`count\` display?`,
      code: `const [count, setCount] = useState(0);\n\nuseEffect(() => {\n  const id = setInterval(() => {\n    ${functional ? "setCount(c => c + 1);" : "setCount(count + 1);"}\n  }, 1000);\n  return () => clearInterval(id);\n}, []);`,
      codeLang: "tsx",
      answer,
      tolerance: 0,
      placeholder: "displayed count",
      explanation: functional
        ? `The updater form \`setCount(c => c + 1)\` asks React "whatever the count is *right now*, add one" on every tick, so after ${ticks} ticks it's ${ticks}. It can't suffer a stale closure because it never reads \`count\` from the surrounding scope at all — nothing to go out of date.`
        : `The effect ran once (\`[]\` deps), so the interval callback is frozen in the **first render's photo**, where \`count\` was \`0\`. It "closed over" that 0 (kept a hold of it) and never sees a newer value, so every tick computes \`0 + 1\` and the display sticks at 1 forever. The fix is the updater form \`setCount(c => c + 1)\`, which asks for the current value instead of trusting the captured one. This exact bug is why your CodeArena workspace TODO warns about stale runs.`,
      docRef: DOC,
    });
  },
};

const batching: Generator = {
  id: "react-batching",
  title: "State updates are batched snapshots",
  generate: (rng) => {
    const calls = rng.int(2, 4);
    const functional = rng.chance(0.4);
    const answer = functional ? calls : 1;
    const line = functional ? "setN(n => n + 1);" : "setN(n + 1);";
    return numeric({
      genId: "react-batching",
      prompt: `Starting from \`n = 0\`, one click runs the handler below. What is \`n\` after the re-render?`,
      code: `const [n, setN] = useState(0);\n\nfunction handleClick() {\n${Array.from({ length: calls }, () => `  ${line}`).join("\n")}\n}`,
      codeLang: "tsx",
      answer,
      tolerance: 0,
      placeholder: "value of n",
      explanation: functional
        ? `Each updater function is handed the result of the one before it, so ${calls} calls really do stack up → ${calls}. (React still bundles them into a single re-render — remember the split: **batching** decides *when* rendering happens, the **updater** decides *what value* each update is based on.)`
        : `Remember "a render is a photo": all ${calls} calls read the same frozen \`n = 0\` from this render, so each just queues "set to 1" and the result is 1, not ${calls}. State isn't a live variable — it only gets a new value on the *next* render. To make the updates stack, base each on the previous: \`setN(n => n + 1)\` ${calls} times really gives ${calls}.`,
      docRef: DOC,
    });
  },
};

const effectDeps: Generator = {
  id: "react-effect-deps",
  title: "Effect dependency arrays",
  generate: (rng) => {
    const renders = rng.int(3, 5);
    const changes = rng.int(1, renders - 1);
    const mode = rng.pick(["empty", "dep", "none"] as const);
    const answer = mode === "empty" ? 1 : mode === "none" ? renders : 1 + changes;
    const depsText = mode === "empty" ? "[]" : mode === "dep" ? "[query]" : "no array at all";
    return numeric({
      genId: "react-effect-deps",
      prompt: `A component renders ${renders} times; \`query\` changes on ${changes} of those re-renders. With the dependency array ${depsText}, how many times does the effect body run in total?`,
      code: `useEffect(() => {\n  fetchResults(query);\n}${mode === "none" ? "" : mode === "empty" ? ", []" : ", [query]"});`,
      codeLang: "tsx",
      answer,
      tolerance: 0,
      placeholder: "times the effect runs",
      explanation:
        mode === "empty"
          ? `\`[]\` means "no dependencies, so never re-run" — the effect fires exactly once, right after the first render. That's the shape for one-time setup. Just beware: it freezes that first render's values forever, which is how stale closures are born.`
          : mode === "none"
            ? `With **no** dependency array at all, the effect runs after *every* render — all ${renders} times, even the renders where nothing it uses changed. That's almost never right for fetching: it re-fetches on every unrelated state change.`
            : `\`[query]\` re-runs the effect only when \`query\` actually changed since last render (React compares with \`Object.is\`, basically \`===\`). One run after mount + ${changes} for the changes = ${answer}. This is exactly the fetching pattern your problems-page TODO needs: run on mount and on every filter change, nothing more.`,
      docRef: DOC,
    });
  },
};

const listKeys: Generator = {
  id: "react-keys",
  title: "List keys & reconciliation",
  generate: (rng) => {
    const variant = rng.chance(0.5);
    return choice(rng, {
      genId: "react-keys",
      prompt: variant
        ? "A sortable list of problem rows uses `key={index}`. The user sorts the list. What can go wrong?"
        : "Why does React need `key` on list items at all?",
      correct: variant
        ? "Row state (like an open menu or input text) sticks to positions instead of following the items"
        : "Keys let React match old and new children by identity, so it moves DOM nodes instead of rebuilding or cross-wiring them",
      wrong: variant
        ? [
            "Nothing — index keys are only a performance warning",
            "The list throws a duplicate-key error at runtime",
            "Sorting becomes O(n²) because of the keys",
          ]
        : [
            "Keys are only needed to silence the console warning",
            "Keys make list rendering faster by caching HTML strings",
            "Keys are required for CSS to apply to list items",
          ],
      explanation:
        "React matches old and new list items by their `key` to decide what to keep vs rebuild. With `key={index}`, the identity is the *slot*: 'position 0' is treated as the same row before and after a sort — so any state inside a row (an open menu, typed-in text, an animation) stays glued to slot 0 while the *data* slides away to another slot. A stable id key (the problem's id or slug) makes the state travel *with* its item. It's a correctness rule, not just a lint warning.",
      docRef: DOC,
    });
  },
};

const contextRerender: Generator = {
  id: "react-context",
  title: "Context: who re-renders",
  generate: (rng) => {
    const consumer = rng.pick(["Toolbar", "OutputPanel", "EditorFooter"]);
    const bystander = rng.pick(["Sidebar", "Breadcrumbs", "HelpButton"]);
    return choice(rng, {
      genId: "react-context",
      prompt: `\`<Provider>\` wraps both \`<${consumer}>\` (calls \`useContext\`) and \`<${bystander}>\` (does not). The provider's value changes. Who re-renders because of context?`,
      correct: `Only ${consumer} — components re-render on context change only if they consume it`,
      wrong: [
        `Both — everything under a provider re-renders when its value changes`,
        `Neither — context changes only matter on the next parent re-render`,
        `Only ${bystander} — non-consumers must refresh to stay in sync`,
      ],
      explanation: `Only *subscribers* react to a context change: every component that called \`useContext\` for it re-renders, and nothing else does (unless its parent re-renders for ordinary reasons). The hidden trap: if the provider's \`value\` is a fresh object literal every render (\`value={{ code, run }}\`), that counts as "changed" every single time and needlessly wakes *all* consumers — which is why providers wrap the value in \`useMemo\`. Your WorkspaceProvider TODO is exactly this shape.`,
      docRef: DOC,
    });
  },
};

const memoDeps: Generator = {
  id: "react-usememo",
  title: "useMemo recomputation rules",
  generate: (rng) => {
    const rerenders = rng.int(4, 7);
    const depChanges = rng.int(1, 3);
    return numeric({
      genId: "react-usememo",
      prompt: `A table re-renders ${rerenders} times. \`entries\` is referentially stable the whole time; \`sortKey\` changes ${depChanges} times. How many times does this useMemo callback execute (count the initial render too)?`,
      code: `const rows = useMemo(\n  () => rank(sort(entries, sortKey)),\n  [entries, sortKey]\n);`,
      codeLang: "tsx",
      answer: 1 + depChanges,
      tolerance: 0,
      placeholder: "executions",
      explanation: `useMemo re-runs its function only when a dependency changed *identity* (React checks with \`Object.is\`, basically \`===\`): once on the first render, then once per \`sortKey\` change = ${1 + depChanges}. The other ${rerenders - 1 - depChanges} re-renders reuse the cached array. Two things quietly break it: an \`entries\` prop that's a *brand-new array each render* (defeats the cache), or leaving a dependency out (stale results). This is exactly what your leaderboard "Force re-render" button checks.`,
      docRef: DOC,
    });
  },
};

const controlledInputs: Generator = {
  id: "react-controlled",
  title: "Controlled vs uncontrolled inputs",
  generate: (rng) => {
    const field = rng.pick(["email", "search", "username"]);
    return choice(rng, {
      genId: "react-controlled",
      prompt: `What makes an \`<input>\` "controlled" in React?`,
      correct: "Its value comes from state and every keystroke goes through onChange → setState",
      wrong: [
        `Giving it a \`name="${field}"\` attribute so the form can find it`,
        "Wrapping it in a <form> with an onSubmit handler",
        "Using defaultValue so React sets the initial text",
      ],
      explanation: `"Controlled" means React state owns the text: \`value={${field}}\` shows the state, and every keystroke fires \`onChange={e => set${field[0]?.toUpperCase()}${field.slice(1)}(e.target.value)}\` to update it. The browser's DOM no longer owns the value — which is what lets you validate on every keystroke, transform input, or clear the field from code. \`defaultValue\` is the *uncontrolled* pattern instead (the DOM owns it; you read it at the end via FormData or a ref) — the idiom your settings forms use, while your AuthForm TODO practises the controlled one. Both are valid; the skill is choosing the owner on purpose. (⚠️ setting \`value\` with no \`onChange\` freezes the box — the #1 "why won't it type" bug.)`,
      docRef: DOC,
    });
  },
};

export const reactTopic: Topic = {
  id: "react",
  title: "React hooks & state",
  icon: "⚛️",
  blurb: "Snapshots, batching, effect deps, keys, context and memoization — the exact concepts your apps/web TODOs exercise.",
  docSlug: "react-fundamentals",
  docTitle: "React fundamentals (Dojo guide)",
  generators: [
    staleClosure,
    batching,
    effectDeps,
    listKeys,
    contextRerender,
    memoDeps,
    controlledInputs,
    refsVsState,
    ...reactCodeGens,
  ],
};
