/**
 * Exercises for the JavaScript guide.
 *
 * The language's sharp edges, in the order they cut: reference semantics,
 * coercion, `this`, and the event loop.
 */
import type { GuideExercise } from "./types";

export const javascriptExercises: GuideExercise[] = [
  {
    id: "reference-semantics",
    title: "Stop the shared reference",
    prompt:
      "`addTag` mutates the original object, so every caller sees the change. Fix it so the input is never modified.",
    language: "javascript",
    given: `const problem = { title: 'Two Sum', tags: ['array'] };`,
    starter: `function addTag(p, tag) {
  p.tags.push(tag);
  return p;
}
`,
    solution: `function addTag(p, tag) {
  return { ...p, tags: [...p.tags, tag] };
}
`,
    hint: "A spread copies one level. The nested array is still the same array unless you copy that too.",
    explanation:
      "Objects and arrays are **passed by reference**, so `p` is the caller's object and `push` edits it in place. Returning it as well makes the mutation invisible at the call site — the caller gets what looks like a new value. The subtlety is that `{ ...p }` is a **shallow** copy: it makes a new outer object whose `tags` points at the *same* array, so `push` would still mutate the original. Both levels need copying, which is exactly why React state updates look the way they do.",
    checks: [
      { re: "\\.\\.\\.p", label: "copies the object" },
      { re: "\\[\\s*\\.\\.\\.p\\.tags", label: "copies the nested array too" },
      { re: "\\.push\\(", expect: false, label: "no mutation of the input" },
    ],
  },

  {
    id: "coercion-predict",
    title: "Predict the coercion",
    prompt:
      "Write the result of each, one per line.",
    language: "text",
    given: `1. '5' + 3
2. '5' - 3
3. 0 == '0'
4. 0 === '0'
5. [] == false
6. Boolean('false')`,
    starter: `1.
2.
3.
4.
5.
6.
`,
    solution: `1. '53'    — + with a string concatenates
2. 2       — - has no string meaning, so both become numbers
3. true    — == coerces, both become 0
4. false   — === compares types first
5. true    — [] becomes '', then 0; false becomes 0
6. true    — any non-empty string is truthy
`,
    hint: "`+` is the only arithmetic operator that also means something for strings. Every other one forces numbers.",
    explanation:
      "The rule that removes most of the confusion: **`+` is overloaded and everything else is not.** Line 6 is the one that bites in real code — `Boolean('false')` is `true`, so `if (process.env.DEBUG)` is true for the string `'false'`, which is how a debug flag ends up permanently on in production. The practical rule is `===` always, and explicit conversion for anything from an environment variable or a query string.",
    checks: [
      { re: "1\\.\\s*'?53'?", flags: "mi", label: "1 — '53'" },
      { re: "2\\.\\s*2", flags: "mi", label: "2 — 2" },
      { re: "3\\.\\s*true", flags: "mi", label: "3 — true" },
      { re: "4\\.\\s*false", flags: "mi", label: "4 — false" },
      { re: "5\\.\\s*true", flags: "mi", label: "5 — true" },
      { re: "6\\.\\s*true", flags: "mi", label: "6 — true" },
    ],
  },

  {
    id: "this-binding",
    title: "Fix the lost `this`",
    prompt:
      "This logs `undefined`. Fix it without changing how `greet` is called.",
    language: "javascript",
    starter: `const counter = {
  count: 0,
  increment() {
    setTimeout(function () {
      this.count += 1;
      console.log(this.count);
    }, 100);
  },
};
`,
    solution: `const counter = {
  count: 0,
  increment() {
    setTimeout(() => {
      this.count += 1;
      console.log(this.count);
    }, 100);
  },
};
`,
    hint: "A regular function gets its `this` from how it is CALLED. An arrow function takes it from where it was WRITTEN.",
    explanation:
      "`setTimeout` calls the callback as a plain function, so `this` is `undefined` in strict mode or the global object otherwise — either way not `counter`. **An arrow function has no `this` of its own**; it closes over the surrounding scope's, which here is `increment`'s. That is why arrows are the default for callbacks, and equally why a *method* should not be an arrow: it would capture the module scope instead of the object.",
    checks: [
      { re: "setTimeout\\(\\s*\\(\\)\\s*=>", label: "uses an arrow so `this` is inherited" },
      { re: "function\\s*\\(\\)\\s*\\{[\\s\\S]*this\\.count", expect: false, label: "no plain function callback" },
      { re: "this\\.count", label: "still reads `this.count`" },
    ],
  },

  {
    id: "event-loop-order",
    title: "Order the event loop",
    prompt:
      "Write the order these log, one per line.",
    language: "text",
    given: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. A
2. D
3. C
4. B
`,
    hint: "Synchronous code runs to completion first. Then promises. Then timers — even a zero-millisecond one.",
    explanation:
      "Three tiers. **Synchronous** code runs to the end of the current script — A then D. Then the **microtask queue** drains completely — C. Only then does the event loop take one **macrotask** — B. `setTimeout(fn, 0)` does not mean 'now', it means 'after the current work and every pending promise'. This ordering is why an infinite chain of promises can starve a timer entirely, and why a long synchronous loop freezes a browser no matter how many callbacks are waiting.",
    checks: [
      { re: "1\\.\\s*A", flags: "mi", label: "1 — A" },
      { re: "2\\.\\s*D", flags: "mi", label: "2 — D" },
      { re: "3\\.\\s*C", flags: "mi", label: "3 — C, the microtask" },
      { re: "4\\.\\s*B", flags: "mi", label: "4 — B, the timer, last" },
    ],
  },

  {
    id: "await-in-loop",
    title: "Stop awaiting in a loop",
    prompt:
      "This fetches ten users one after another, taking ten times as long as it needs to. Fix it — and keep it so one failure does not lose the other nine results.",
    language: "javascript",
    given: `// fetchUser(id) -> Promise<User>, can reject`,
    starter: `async function loadAll(ids) {
  const users = [];
  for (const id of ids) {
    users.push(await fetchUser(id));
  }
  return users;
}
`,
    solution: `async function loadAll(ids) {
  const results = await Promise.allSettled(ids.map((id) => fetchUser(id)));
  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
}
`,
    hint: "Start them all, then wait once. And `Promise.all` rejects on the first failure, discarding work that already succeeded.",
    explanation:
      "`await` inside a loop serialises independent work: ten 200 ms requests become two seconds instead of 200 ms. Mapping first starts them all, then one `await` waits for the batch. The choice between `all` and `allSettled` is the real decision — **`Promise.all` rejects as soon as any one does**, throwing away nine successful results, which is right when you need all or nothing and wrong when partial data is useful. Sequential `await` is still correct when each iteration *depends* on the previous one.",
    checks: [
      { re: "Promise\\.(all|allSettled)", label: "runs them concurrently" },
      { re: "\\.map\\(", label: "starts every request before awaiting" },
      { re: "allSettled", label: "one failure does not discard the rest" },
      { re: "for\\s*\\(.*await|await fetchUser\\(id\\)\\)", expect: false, label: "no await inside a loop" },
    ],
  },

  {
    id: "optional-chaining",
    title: "Handle the missing value precisely",
    prompt:
      "`config.retries` may legitimately be `0`, and this turns it into 3. Fix both lines.",
    language: "javascript",
    given: `// config may be undefined. config.retries may be 0.`,
    starter: `const timeout = config.timeout;
const retries = config.retries || 3;
`,
    solution: `const timeout = config?.timeout;
const retries = config?.retries ?? 3;
`,
    hint: "`||` falls back for every falsy value. Two of those — `0` and `''` — are usually real answers, not missing ones.",
    explanation:
      "`||` cannot tell 'absent' from 'zero', so `retries: 0` silently becomes 3 and a configuration option does the opposite of what it says. **`??` falls back only for `null` and `undefined`**, which is what 'no value' actually means. `?.` is the same distinction on the access side: it short-circuits to `undefined` instead of throwing. Both were added to the language because the old idioms were subtly wrong in exactly this way.",
    checks: [
      { re: "config\\?\\.", label: "uses optional chaining" },
      { re: "\\?\\?", label: "uses nullish coalescing" },
      { re: "\\|\\|\\s*3", expect: false, label: "no `||` fallback — that swallows 0" },
    ],
  },

  {
    id: "array-toolbox",
    title: "Reach for the right array method",
    prompt:
      "Rewrite each loop as one array method call.",
    language: "javascript",
    given: `problems: { id: number; difficulty: string; solved: boolean }[]`,
    starter: `// 1. all the easy ones
const easy = [];
for (const p of problems) if (p.difficulty === 'EASY') easy.push(p);

// 2. just their ids
const ids = [];
for (const p of problems) ids.push(p.id);

// 3. how many are solved
let solved = 0;
for (const p of problems) if (p.solved) solved++;

// 4. is there at least one hard one
let hasHard = false;
for (const p of problems) if (p.difficulty === 'HARD') hasHard = true;
`,
    solution: `// 1. all the easy ones
const easy = problems.filter((p) => p.difficulty === 'EASY');

// 2. just their ids
const ids = problems.map((p) => p.id);

// 3. how many are solved
const solved = problems.filter((p) => p.solved).length;

// 4. is there at least one hard one
const hasHard = problems.some((p) => p.difficulty === 'HARD');
`,
    hint: "Four different methods. The last one can stop at the first match, which the loop cannot.",
    explanation:
      "Each method **names the intent**, so a reader knows the shape of the result before reading the body: `filter` returns a subset, `map` returns the same length, `some` returns a boolean. That is the real gain — not brevity. `some` also short-circuits, so it stops at the first match while the loop always runs to the end. The one to be careful with is `reduce`: powerful, and usually less readable than the specific method when a specific method exists.",
    checks: [
      { re: "\\.filter\\(", label: "`filter` for the subset" },
      { re: "\\.map\\(", label: "`map` for the ids" },
      { re: "\\.length", label: "counts with `.length`" },
      { re: "\\.some\\(", label: "`some` for the existence check" },
      { re: "for\\s*\\(", expect: false, label: "no loops left" },
    ],
  },

  {
    id: "closure-counter",
    title: "Write a closure",
    prompt:
      "Write `makeCounter`: it returns an object with `increment` and `value`, and the count must be unreachable from outside.",
    language: "javascript",
    starter: `function makeCounter() {
  // TODO
}

const a = makeCounter();
const b = makeCounter();
a.increment();
// a.value() === 1, b.value() === 0
`,
    solution: `function makeCounter() {
  let count = 0;
  return {
    increment() {
      count += 1;
    },
    value() {
      return count;
    },
  };
}

const a = makeCounter();
const b = makeCounter();
a.increment();
// a.value() === 1, b.value() === 0
`,
    hint: "The variable lives in the function's scope. Returning functions that reference it keeps the scope alive after the function has returned.",
    explanation:
      "A **closure** is a function plus the scope it was created in. `count` is a local variable, so nothing outside can reach it — genuine privacy, with no `#` or convention required. And each call to `makeCounter` creates a *new* scope, which is why `a` and `b` do not share a count. This is the same mechanism behind the stale-closure bug in React: a function captures the variables that existed when it was created, and keeps them.",
    checks: [
      { re: "let count|var count", label: "the count is a local variable" },
      { re: "return\\s*\\{", label: "returns an object of functions" },
      { re: "increment", label: "has `increment`" },
      { re: "value", label: "has `value`" },
      { re: "count\\s*:", expect: false, label: "the count is not exposed as a property" },
      { re: "this\\.count", expect: false, label: "no `this` — the closure IS the privacy" },
    ],
  },
];
