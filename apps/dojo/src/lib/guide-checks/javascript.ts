/**
 * Checks for the JavaScript guide (content/supplements/javascript.md). The
 * behaviour claims were run in Node on 3 Nov 2026 (sort, reduce, ==, default
 * parameters, labels in arrow bodies, setInterval's this), plus MDN.
 */
import type { GuideCheckSet } from "./types";

export const javascriptChecks: GuideCheckSet = {
  name: "JavaScript guide",
  source: {
    label: "MDN's JavaScript Guide",
    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    note: "The reference behind every section here: read Functions, Expressions and operators, Working with objects and Promises, then Closures under Advanced topics.",
  },
  terms: [
    "Reference",
    "Primitive",
    "Falsy value",
    "Temporal dead zone",
    "Closure",
    "Lexical this",
    "Spread vs rest",
    "Event loop",
    "Promise",
  ],
  checks: [
    {
      id: "values",
      section: "§0–2 · Values, references, const and let",
      questions: [
        {
          prompt: "`const user = { name: \"Ada\" }; const alias = user; alias.name = \"Grace\";` What is `user.name` now?",
          options: [
            "\"Ada\": alias holds its own separate copy",
            "undefined: assigning to alias broke the link",
            "\"Grace\": one object, reachable by two names",
            "An error: const objects cannot be modified",
          ],
          correct: 2,
          why: "`alias = user` copies the reference, not the object, so both names point at one object. `const` forbids reassigning the binding, not changing the object. To copy, spread: `{ ...user }` (shallow). This is exactly what React relies on to detect changes.",
        },
        {
          prompt: "`for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0);` What does it print?",
          options: [
            "3, 3, 3: all callbacks share one variable",
            "0, 1, 2: each callback captures a copy",
            "0, 0, 0: timers capture i's first value",
            "3, 2, 1: timers fire in reverse order",
          ],
          correct: 0,
          why: "`var` is function-scoped: there's one `i`, and by the time the callbacks run the loop has finished and `i` is 3. With `let`, each iteration gets a fresh binding, so each closure captures its own and you get 0, 1, 2.",
        },
      ],
      explain:
        "Explain value versus reference with a React state example, and why `let` fixes the `var`-in-a-loop bug.",
    },
    {
      id: "coercion",
      section: "§3 · Coercion, equality, truthiness",
      questions: [
        {
          prompt: "`config.port` is `0`. What does `config.port || 3000` give?",
          options: [
            "0: both operators treat zero the same",
            "3000, because || replaces every falsy value",
            "0, since numbers are never falsy values",
            "undefined, as || returns its left operand",
          ],
          correct: 1,
          why: "`||` falls back on any falsy value, and `0` is falsy, so a real port 0 becomes 3000. `??` falls back only on `null` or `undefined`: `config.port ?? 3000` keeps the 0. Use `??` for \"not provided\", `||` when every falsy value should be replaced.",
        },
        {
          prompt: "Which of these values is truthy?",
          options: ["An empty string: \"\"", "The number zero: 0", "Not a number: NaN", "An empty array: []"],
          correct: 3,
          why: "There are exactly eight falsy values: `false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined`, `NaN`. Everything else is truthy, including `[]`, `{}`, `\"0\"` and `\"false\"`.",
        },
      ],
      explain:
        "List the eight falsy values from memory, then say when you'd use `??`, `||`, `===` and `== null`.",
    },
    {
      id: "functions",
      section: "§4–6 · Functions, closures, this",
      questions: [
        {
          prompt: "What does `[1, 2].map(n => { double: n * 2 })` return?",
          options: [
            "[undefined, undefined]: the braces form a block",
            "[{double: 2}, {double: 4}], the new objects",
            "A SyntaxError: labels can't hold an expression",
            "[2, 4]: the labelled values are returned",
          ],
          correct: 0,
          why: "After `=>`, a `{` starts a function body. Inside it, `double:` is a label and `n * 2` an expression statement; nothing is returned. Wrap the object in parentheses: `n => ({ double: n * 2 })`.",
        },
        {
          prompt: "`makeCounter()` returns a function that increments a local `count`. Why does `count` survive after `makeCounter` has returned?",
          options: [
            "It's a global, so every caller shares count",
            "It's copied into every call, so it resets",
            "The inner function keeps its own scope alive",
            "It's stored on the function as a property",
          ],
          correct: 2,
          why: "A closure keeps access to the variables of the scope where it was defined, even after that scope returned. Each `makeCounter()` call creates a fresh `count`, so two counters are independent, and nothing outside can touch it: private state.",
        },
        {
          prompt: "Inside `setInterval(function () { this.seconds += 1; }, 1000)` in a method of `timer`, why does `timer.seconds` stay 0?",
          options: [
            "It throws, since this is undefined in callbacks",
            "setInterval calls it with a different this value",
            "The arrow function has captured the timer's this",
            "setInterval runs each callback only once per page",
          ],
          correct: 1,
          why: "A regular function's `this` is set by the call. `setInterval` uses `globalThis` (`window`) in a browser and a `Timeout` object in Node, so `NaN` lands on the wrong object, silently ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)). An arrow has no `this` of its own and keeps the method's.",
        },
      ],
      explain:
        "Explain a closure with `makeCounter`, then explain how `this` is decided for a regular function and for an arrow function.",
    },
    {
      id: "data",
      section: "§7–8 · Spread, rest, array methods",
      questions: [
        {
          prompt: "`const merged = { ...patch, ...user }`, and both have a `name`. Whose `name` wins?",
          options: [
            "patch, since spread merges deeply and keeps both",
            "Neither: duplicate keys make spread throw an error",
            "patch, because the first spread always takes priority",
            "user, because a later spread overwrites earlier keys",
          ],
          correct: 3,
          why: "Spread copies fields left to right, and a later key overwrites an earlier one. To apply a patch, write `{ ...user, ...patch }`. Spread is also shallow: nested objects are still shared, so update nested state level by level.",
        },
        {
          prompt: "What does `[10, 2, 1].sort()` return?",
          options: [
            "[1, 10, 2]: by default it compares strings",
            "[1, 2, 10]: numbers sort in numeric order",
            "[10, 2, 1]: no comparator means no sorting",
            "[2, 10, 1]: ordered by the last digit",
          ],
          correct: 0,
          why: "Without a comparator, `sort` converts elements to strings and compares them: \"10\" comes before \"2\". Pass `(a, b) => a - b`. And `sort` mutates the array in place, so sort a copy (`[...nums].sort(…)`) when the original is state.",
        },
      ],
      explain:
        "Explain spread versus rest, why order matters in `{ ...user, ...patch }`, and why you sort a copy rather than the original.",
    },
    {
      id: "async",
      section: "§9–10 · Async and modules",
      questions: [
        {
          prompt: "`for (const id of ids) results.push(await fetchUser(id));` The calls are independent. What's wrong?",
          options: [
            "It fails: await isn't allowed inside a loop",
            "The results come back in a random order",
            "Each call waits for the previous: a waterfall",
            "fetchUser runs only once, reused for each id",
          ],
          correct: 2,
          why: "Each request starts only after the previous one finished: N round trips end to end. `await Promise.all(ids.map((id) => fetchUser(id)))` starts them all at once and keeps the results in order.",
        },
        {
          prompt: "`const u = fetchUser(1);` with no `await`. What is `u`?",
          options: [
            "The user, since await is implied in async",
            "A pending Promise, not the resolved user value",
            "It stays undefined until the request comes back",
            "An error, because the call must be awaited",
          ],
          correct: 1,
          why: "An async function always returns a Promise; without `await` (or `.then`) you hold the promise itself. That's how `[object Promise]` ends up on a page.",
        },
        {
          prompt: "`Promise.all` rejects on the first failure and you lose the other results. What do you use to get every outcome?",
          options: [
            "Promise.all, with catch on every call",
            "Promise.race, which waits for the slowest",
            "Promise.any, which keeps the failures too",
            "Promise.allSettled: one result for each call",
          ],
          correct: 3,
          why: "`Promise.allSettled` waits for every promise and reports each as fulfilled or rejected. `race` settles with the first to finish, and `any` with the first to succeed. When the list is long, also cap concurrency so you don't flood the target.",
        },
      ],
      explain:
        "Explain the event loop in three sentences, then turn a sequential `await` loop into a parallel one and name its two caveats.",
    },
  ],
};
