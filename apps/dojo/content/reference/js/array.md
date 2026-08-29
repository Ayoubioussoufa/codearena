# Array methods — the algorithm reference

The workhorse. Most of your time is here, and most accidental O(n²) is here too.

---

## Access

| Method | Cost | Notes |
|---|---|---|
| `a[i]` | **O(1)** | No bounds check — out of range gives `undefined`, not an error |
| `a.at(i)` | **O(1)** | Accepts negatives: `a.at(-1)` is the last element. The clean way to peek at a stack top |
| `a.length` | **O(1)** | It's a *settable* property: `a.length = 0` empties the array in place |

```js
const stack = [1, 2, 3];
stack.at(-1);        // 3   — better than a[a.length - 1]
a.length = 0;        // empties IN PLACE (all references see it), unlike a = []
```

---

## Add / remove — where the O(n) traps live

| Method | Cost | Mutates | Use for |
|---|---|---|---|
| `push(x)` / `pop()` | **O(1)** amortised | 🔴 | Stack. Always cheap |
| `unshift(x)` / `shift()` | **O(n)** | 🔴 | **Avoid in loops** — every element shifts |
| `splice(i, del, ...add)` | **O(n)** | 🔴 | Insert/remove in the middle. Returns the removed items |
| `slice(start, end)` | **O(k)** | 🟢 | Copy a range. `end` exclusive. Negatives allowed |
| `concat(b)` | **O(n+m)** | 🟢 | Join arrays. In a loop this is O(n²) — use `push(...b)` |
| `fill(v, s, e)` | **O(n)** | 🔴 | Initialise. **See the shared-reference trap below** |

> 🔴 **`shift()` in a BFS queue is the single most common accidental O(n²) in JS.** Measured: draining
> 10⁵ items took **452 ms** with `shift()` and **3.6 ms** with a head index — **125×**.
>
> ```js
> let head = 0;
> while (head < q.length) { const node = q[head++]; /* … */ }   // O(1) per dequeue
> ```
> Or swap frontiers per level (see the BFS template), which is cleaner still.

> 🔴 **`arr = [...arr, x]` in a loop is O(n²).** Measured: 20,000 appends took **1,752 ms** that way
> versus **0.4 ms** with `push` — **4,000×**. Spread copies the whole array every iteration. Use
> `push`, always.

### `delete` vs `splice` — never use `delete` on an array

```js
const a = [1, 2, 3, 4];
delete a[1];        // a is now [1, <hole>, 3, 4], a.length === 4, (1 in a) === false
a.splice(1, 1);     // a is now [1, 3, 4],       a.length === 3   ← what you meant
```

`delete` leaves a **hole**: the length is unchanged and the slot is *missing*, not `undefined`. Holes
then behave inconsistently — `map` and `forEach` **skip** them, `includes` **sees** them:

```js
[1, , 3].map(x => x * 2);        // [2, <hole>, 6]   — callback never ran for the hole
[1, , 3].forEach(fn);            // fn runs TWICE, not three times
[1, , 3].includes(undefined);    // true    ← sees the hole
[1, , 3].indexOf(undefined);     // -1      ← doesn't
```

**Never create holes.** Use `splice` to remove, `fill`/`Array.from` to create.

---

## Creating arrays — and the 2-D grid bug

| Expression | Result | Verdict |
|---|---|---|
| `new Array(3)` | 3 holes | ⚠️ `.map()` on it does **nothing** |
| `new Array(3).fill(0)` | `[0,0,0]` | ✅ fine for primitives |
| `Array.from({length: 3}, (_, i) => i)` | `[0,1,2]` | ✅ the general tool |
| `new Array(2).fill([])` | **two references to ONE array** | 🔴 **the bug** |

```js
const bad  = new Array(2).fill([]);          bad[0].push("x");   // [["x"], ["x"]]  ← both!
const good = Array.from({length: 2}, () => []); good[0].push("x"); // [["x"], []]    ← correct
```

`fill` stores **the same reference** in every slot. For a 2-D grid always use the factory form:

```js
const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
```

---

## Search

| Method | Cost | Returns |
|---|---|---|
| `includes(x)` | **O(n)** | boolean. Uses SameValueZero → **finds `NaN`** |
| `indexOf(x)` | **O(n)** | index or `-1`. Uses `===` → **never finds `NaN`** |
| `find(fn)` / `findIndex(fn)` | **O(n)** | first match / its index |
| `findLast(fn)` / `findLastIndex(fn)` | **O(n)** | searching from the end |
| `some(fn)` / `every(fn)` | **O(n)** | boolean, short-circuits |

```js
[NaN].includes(NaN);   // true
[NaN].indexOf(NaN);    // -1     ← the difference is SameValueZero vs ===
```

> 🔴 **`includes` inside a loop is O(n²).** Measured: 20k membership checks took **135 ms** against an
> array and **0.9 ms** against a `Set` — **150×**. Build a `Set` once, then `.has()`.

---

## Transform

| Method | Cost | Mutates | Notes |
|---|---|---|---|
| `map(fn)` | **O(n)** | 🟢 | Same length, new values |
| `filter(fn)` | **O(n)** | 🟢 | Keeps where truthy |
| `reduce(fn, init)` | **O(n)** | 🟢 | **Always pass `init`** — on `[]` without it, it throws |
| `flat(d)` / `flatMap(fn)` | **O(n)** | 🟢 | `flatMap` = map then flatten one level |
| `join(sep)` | **O(n)** | 🟢 | `[1,[2,3]].join()` → `"1,2,3"` (nested arrays stringify) |
| `reverse()` | **O(n)** | 🔴 | `toReversed()` is the copying version |

```js
[].reduce((a, b) => a + b);        // ❌ TypeError: Reduce of empty array with no initial value
[].reduce((a, b) => a + b, 0);     // ✅ 0
```

> **Chaining costs a pass each.** `a.filter(f).map(g)` is two full traversals and one intermediate
> array. Fine for clarity at small `n`; in a hot path write one loop, or use `reduce`.

---

## Sort — read this twice

| Method | Cost | Mutates |
|---|---|---|
| `sort(cmp)` | **O(n log n)** | 🔴 sorts in place **and** returns the same array |
| `toSorted(cmp)` | **O(n log n)** | 🟢 ES2023 — copies |

```js
[10, 9, 1].sort();                 // [1, 10, 9]   🔴 DEFAULT IS LEXICOGRAPHIC
[10, 9, 1].sort((a, b) => a - b);  // [1, 9, 10]   ✅ always pass a comparator
```

**The default comparator converts everything to strings.** This silently wrecks more submissions than
any other single line in JavaScript. There is no case in an algorithm where you want the default.

The comparator contract: return **negative** if `a` comes first, **positive** if `b` does, `0` if
tied. `sort` is **stable** in modern JS, so ties keep their original order — that's what makes
multi-key sorting work:

```js
rows.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));  // score desc, then name asc
```

> 🔴 **`sort()` mutates.** `const sorted = arr.sort(...)` leaves `arr` sorted too, and `sorted === arr`.
> If the caller needed the original order you have silently broken them. Use `toSorted`, or
> `[...arr].sort(...)`.

---

## Iteration

| Form | Gives you | Notes |
|---|---|---|
| `for (let i = 0; i < a.length; i++)` | index | Fastest; the only one you can `break` out of cheaply and mutate `i` in |
| `for (const x of a)` | values | Clean; supports `break`/`continue` |
| `for (const [i, x] of a.entries())` | index + value | When you need both |
| `a.forEach(fn)` | value, index | **Cannot `break`**, skips holes — avoid in algorithms |
| `for (const k in a)` | **string** keys | 🔴 Never use on arrays — indices come back as strings and inherited keys appear |

---

## ES2023+ copying counterparts

`toSorted` · `toReversed` · `toSpliced` · `with(i, v)` — non-mutating versions of `sort`, `reverse`,
`splice`, and index assignment. Reach for them by default outside hot loops; they cost one copy and
remove a whole class of bug.

```js
const next = board.with(3, "X");   // copy with index 3 replaced — original untouched
```

---

## Cheat sheet — "I want to…"

| Goal | Reach for |
|---|---|
| stack | `push` / `pop` |
| queue | `push` + **head index** (never `shift`) |
| deque | array + two indices, or a real linked list |
| dedupe | `[...new Set(a)]` |
| membership in a loop | build a `Set`, use `has` |
| count occurrences | `Map` + `m.set(x, (m.get(x) ?? 0) + 1)` |
| sum | `a.reduce((s, x) => s + x, 0)` |
| max | `Math.max(...a)` — ⚠️ blows the stack past ~10⁵ elements; use a loop or `reduce` |
| copy | `[...a]` or `a.slice()` (both shallow) |
| deep copy | `structuredClone(a)` |
| fixed-size zeros | `new Array(n).fill(0)` |
| 2-D grid | `Array.from({length: r}, () => new Array(c).fill(0))` |
| range 0…n-1 | `Array.from({length: n}, (_, i) => i)` |
