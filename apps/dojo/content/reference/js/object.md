# Object methods — the algorithm reference

Objects are for **records with known fields**. For a dictionary in an algorithm, use
[`Map`](/guides/js-map) — this file explains the three ways `{}` will betray you if you don't.

---

## The `Object.*` statics

| Method | Cost | Returns |
|---|---|---|
| `Object.keys(o)` | O(n) | array of **string** keys (own, enumerable) |
| `Object.values(o)` | O(n) | array of values |
| `Object.entries(o)` | O(n) | `[[k, v], …]` |
| `Object.fromEntries(pairs)` | O(n) | object from pairs — the inverse |
| `Object.assign(t, ...src)` | O(n) | 🔴 mutates `t`, shallow merge |
| `Object.freeze(o)` | O(n) | shallow immutability |
| `Object.hasOwn(o, k)` | O(1) | ✅ the modern, safe "does it have this key" |
| `o.hasOwnProperty(k)` | O(1) | ⚠️ breaks on `Object.create(null)` — prefer `Object.hasOwn` |
| `structuredClone(o)` | O(n) | **deep** copy (handles Map, Set, Date, cycles) |

```js
const merged = { ...a, ...b };                  // shallow, b wins on conflicts
const copy   = structuredClone(nested);         // deep — the only built-in that is
```

---

## Trap 1 — integer-like keys get reordered

```js
const o = {}; [10, 1, 5, "b", "a"].forEach(k => o[k] = 1);
Object.keys(o);          // ["1", "5", "10", "b", "a"]
```

The spec says: **integer-like keys first, in ascending numeric order**, then string keys in insertion
order. So any algorithm depending on "first seen" order breaks the moment your keys look like numbers.
`Map` preserves insertion order for every key type.

## Trap 2 — every key becomes a string

```js
const o = {}; o[1] = "num"; o["1"] = "str";
Object.keys(o);   // ["1"]  — one key. The second write clobbered the first.
o[1];             // "str"
```

Keys are coerced with `String()`. So `o[1]` and `o["1"]` are the same slot — and an object key is
`"[object Object]"` for *every* object, meaning all object keys collide into one.

## Trap 3 — inherited keys

```js
const o = {};
o.toString;              // ƒ toString()  ← you never set this
"toString" in o;         // true
Object.hasOwn(o, "toString");   // false  ← the check you actually want
```

`in` walks the prototype chain; `Object.hasOwn` doesn't. If you must use an object as a dictionary,
create it prototype-less:

```js
const dict = Object.create(null);    // no inherited keys at all
```

---

## Copying — shallow vs deep

```js
const shallow = { ...o };                 // nested objects are SHARED
shallow.nested.x = 1;                     // ← also changes o.nested.x

const deep = structuredClone(o);          // fully independent
```

`structuredClone` handles cycles, `Map`, `Set`, `Date`, `TypedArray`. It **cannot** clone functions,
DOM nodes, or class prototypes (you get a plain object back). `JSON.parse(JSON.stringify(o))` is the
old trick and it silently destroys `undefined`, `NaN` → `null`, `Date` → string, and `Map`/`Set`
entirely. Prefer `structuredClone`.

---

## Optional chaining and nullish coalescing

```js
o?.a?.b            // undefined instead of throwing, if any link is null/undefined
o.count ?? 0       // falls back ONLY on null/undefined
o.count || 0       // 🔴 also replaces 0, "", false — usually a bug in counting code
arr?.[i]           // optional chaining into an index
fn?.(x)            // call only if fn exists
```

> **`??` vs `||` is the counting bug.** `(counts[k] || 0) + 1` looks fine until a legitimate stored
> value is `0`. Use `??` by default and `||` only when you genuinely want every falsy value replaced.

---

## Destructuring

```js
const { a, b = 10, ...rest } = obj;       // default + rest
const { a: renamed } = obj;                // rename
const [x, y = 0, ...tail] = arr;           // arrays too
[a, b] = [b, a];                           // swap — no temp variable
```

The swap is the one you'll use constantly in two-pointer and sorting code:

```js
[arr[i], arr[j]] = [arr[j], arr[i]];
```

---

## When an object *is* the right choice

- A record with **known, fixed fields** (`{ row, col, cost }`) — the shape documents itself, and
  TypeScript can check it.
- Something you'll **`JSON.stringify`** — `Map` doesn't serialise (`JSON.stringify(new Map())` is
  `"{}"`).
- A **frequency table with small integer keys**, where the array-like fast path makes it competitive
  with `Map` (measured 26 ms vs 22 ms for 10⁶ ops — but a typed array beat both at 6 ms).
