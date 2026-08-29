# Map methods — the algorithm reference

**`Map` is the default key→value store for algorithms.** Not `{}`. The reasons are in
[`object.md`](/guides/js-object), and they're the kind that produce wrong answers rather than errors.

---

## The whole API

| Method | Cost | Returns |
|---|---|---|
| `new Map(iterable?)` | O(n) | Optional `[[k, v], …]` to seed it |
| `m.set(k, v)` | **O(1)** avg | **the map** — so it chains |
| `m.get(k)` | **O(1)** avg | value, or `undefined` |
| `m.has(k)` | **O(1)** avg | boolean |
| `m.delete(k)` | **O(1)** avg | `true` if it existed |
| `m.size` | **O(1)** | a *property*, not a method — no `()` |
| `m.clear()` | O(n) | — |
| `m.keys()` / `m.values()` / `m.entries()` | O(1) to create | lazy iterators, **insertion order** |
| `m.forEach((v, k) => …)` | O(n) | ⚠️ callback is `(value, key)` — value first |

```js
const m = new Map([["a", 1], ["b", 2]]);
m.set("c", 3).set("d", 4);        // set returns the map → chainable
m.size;                            // 4   ← property, not m.size()
```

---

## Why `Map` and not `{}`

Three differences, each capable of silently breaking an algorithm:

**1. Insertion order is preserved — objects reorder integer-like keys.** Measured:

```js
const o = {}; [10, 1, 5, "b", "a"].forEach(k => o[k] = 1);
Object.keys(o);                    // ["1", "5", "10", "b", "a"]   ← integers sorted ASCENDING

const m = new Map(); [10, 1, 5, "b", "a"].forEach(k => m.set(k, 1));
[...m.keys()];                     // [10, 1, 5, "b", "a"]         ← as inserted
```

If your answer depends on "first seen" order — LRU, first-unique-character, ordered grouping — an
object is simply wrong.

**2. Keys keep their type.** Objects stringify every key:

```js
const o = {}; o[1] = "num"; o["1"] = "str";
Object.keys(o);   // ["1"]  — ONE key; the second write overwrote the first

const m = new Map(); m.set(1, "num"); m.set("1", "str");
m.size;           // 2      — two distinct keys
```

**3. Any value can be a key** — objects, arrays, functions, `NaN`. Objects only take strings and
symbols.

**4. No prototype surprises.** `({}).toString` exists; `m.get("toString")` is `undefined`. A plain
object used as a dictionary inherits keys you never set.

> **Object still wins for one thing:** speed with small integer keys, and JSON serialisation. Measured
> 10⁶ counts with keys `0…999`: object **26 ms**, Map **22 ms**, `Int32Array` **6 ms**. So if your
> keys are bounded integers, skip both and use a typed array.

---

## Key identity — SameValueZero

`Map` and `Set` compare keys with **SameValueZero**: like `===`, except `NaN` equals itself and
`-0` equals `0`.

```js
const m = new Map();
m.set(NaN, "works");   m.get(NaN);   // "works"    ← unlike ===
m.set(-0, "zero");     m.get(0);     // "zero"     ← -0 and 0 are the same key

m.set({a: 1}, "x");    m.get({a: 1}); // undefined  ← different object, different key
```

**Objects as keys are compared by reference, not contents.** To key on a *value* like a coordinate,
build a primitive key:

```js
m.set(`${r},${c}`, v);        // string key — readable
m.set(r * COLS + c, v);       // numeric key — faster, needs a bound on COLS
```

---

## The patterns you'll actually write

```js
// count occurrences
for (const x of arr) m.set(x, (m.get(x) ?? 0) + 1);

// group by a computed key  (?? 0 not || 0 — a count of 0 is falsy!)
for (const w of words) {
  const k = [...w].sort().join("");
  if (!m.has(k)) m.set(k, []);
  m.get(k).push(w);
}

// last-seen index (sliding window)
m.set(char, i);

// iterate sorted by value
[...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, k);
```

> ⚠️ **Use `??`, not `||`, for default counts.** `(m.get(x) || 0) + 1` is correct here by luck, but
> the moment a stored value can legitimately be `0` or `""`, `||` throws it away. `??` only falls back
> on `null`/`undefined`.

---

## Converting

```js
[...m]                       // [[k, v], …]
[...m.keys()]                // array of keys
Object.fromEntries(m)        // → plain object (keys become strings!)
new Map(Object.entries(o))   // ← from an object
```

---

## `WeakMap`

Keys must be objects, held **weakly** — an entry disappears when its key is garbage-collected. Not
iterable, no `size`. You will not use it in an algorithm; it exists for attaching metadata to objects
without leaking. Know the name for interviews, move on.
