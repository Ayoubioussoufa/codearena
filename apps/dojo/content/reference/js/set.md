# Set methods — the algorithm reference

**A `Set` is "have I seen this?" in O(1).** That single question is behind a large share of array and
string problems, so this is the smallest, highest-value structure in the language.

---

## The whole API

| Method | Cost | Returns |
|---|---|---|
| `new Set(iterable?)` | O(n) | Seeds and **dedupes** in one step |
| `s.add(x)` | **O(1)** avg | **the set** — chainable |
| `s.has(x)` | **O(1)** avg | boolean |
| `s.delete(x)` | **O(1)** avg | `true` if it was there |
| `s.size` | **O(1)** | property, not a method |
| `s.clear()` | O(n) | — |
| `s.values()` / `s.keys()` / `s.entries()` | O(1) | insertion order (`keys` is an alias of `values`) |

```js
const seen = new Set();
seen.add(1).add(2).add(1);   // chainable; the duplicate is a no-op
seen.size;                    // 2
```

---

## Why it matters: measured

| | 20,000 membership checks over 20,000 items |
|---|---|
| `arr.includes(x)` — O(n) each | **135 ms** |
| `set.has(x)` — O(1) each | **0.9 ms** |

**150×.** If you find yourself calling `includes` or `indexOf` inside a loop, that's the moment to
build a `Set` — one O(n) pass to construct, then every lookup is free.

---

## Dedupe — the one-liner

```js
[...new Set(arr)]            // preserves FIRST-seen order
```

Uses SameValueZero, so `NaN` dedupes correctly and `-0`/`0` collapse:

```js
new Set([NaN, NaN, -0, 0, {}, {}]).size;   // 4  → one NaN, one 0, two DISTINCT objects
[...new Set([-0, 0])];                      // [0]
```

> 🔴 **Objects and arrays are compared by reference.** `new Set([[1,2], [1,2]]).size` is **2** — two
> different arrays that happen to look alike. To dedupe by *content*, map to a primitive first:
> `new Set(pairs.map(p => p.join(",")))`.

---

## Set algebra (ES2024)

Available in Node 22+ and current browsers. Each returns a **new** Set.

| Method | Meaning |
|---|---|
| `a.union(b)` | in either |
| `a.intersection(b)` | in both |
| `a.difference(b)` | in `a`, not in `b` |
| `a.symmetricDifference(b)` | in exactly one |
| `a.isSubsetOf(b)` / `a.isSupersetOf(b)` | boolean |
| `a.isDisjointFrom(b)` | no overlap |

```js
const a = new Set([1, 2, 3]), b = new Set([2, 3, 4]);
[...a.intersection(b)];   // [2, 3]
[...a.difference(b)];     // [1]
```

> ⚠️ **Check your judge's runtime before relying on these.** They're recent. The portable fallbacks
> are one line each and always work:
> ```js
> const inter = [...a].filter(x => b.has(x));
> const diff  = [...a].filter(x => !b.has(x));
> const union = new Set([...a, ...b]);
> ```

---

## The patterns you'll actually write

```js
// seen-set in one pass
const seen = new Set();
for (const x of nums) { if (seen.has(x)) return true; seen.add(x); }

// visited cells in a grid — encode the coordinate
visited.add(r * COLS + c);

// backtracking constraint check (N-Queens)
if (cols.has(c) || diag.has(r - c) || anti.has(r + c)) continue;

// character set of a string
const chars = new Set(str);
```

---

## When *not* to use a Set

- **You need counts, not presence** → `Map`.
- **You need an index/position** → `Map` of value → index.
- **Keys are bounded small integers** → a boolean array or `Uint8Array` is faster and simpler.
- **You need sorted order** → JS has no sorted set; sort the spread, or use a heap.

## `WeakSet`

Objects only, held weakly, not iterable. Same story as `WeakMap` — know the name, you won't use it in
an algorithm.
