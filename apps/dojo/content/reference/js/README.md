# JS/TS Methods — the algorithm reference

Every built-in you actually reach for while solving problems, with **its complexity**, **whether it
mutates**, **when to use it**, and **the trap it sets**. Not an MDN copy — MDN tells you what a method
does; this tells you *whether to use it in a loop that runs a million times*.

**Files**

| File | Covers |
|---|---|
| [`array.md`](/guides/js-array) | The big one. Access, add/remove, search, transform, sort, and the O(n) methods that look O(1) |
| [`map.md`](/guides/js-map) | `Map` — the default key→value store for algorithms, and why it beats `{}` |
| [`set.md`](/guides/js-set) | `Set` — membership in O(1), dedupe, and the new set-algebra methods |
| [`object.md`](/guides/js-object) | Plain objects, `Object.*` statics, and the three ways they betray you |
| [`string.md`](/guides/js-string) | Immutability, the char/code-unit distinction, and building strings fast |
| [`number-math.md`](/guides/js-number-math) | Integer division, rounding, safe ranges, `BigInt`, bit operators |

Every number below was measured on Node 22/24. Where received wisdom is wrong, the measurement wins
and the entry says so.

> **Writing Java?** The same reference exists for it: [Java Methods](/guides/java) — with a
> JS→Java translation table, and the traps that only exist on that side (`int` overflow,
> `Integer` caching, and `+=` on strings being genuinely 1,343× slower).

---

## Which structure do I pick?

Answer these in order and stop at the first yes.

| The question you're answering | Use | Why |
|---|---|---|
| "Have I seen this value?" | **`Set`** | `has` is O(1). `Array.includes` is O(n) — measured **135 ms vs 0.9 ms** for 20k lookups |
| "What's associated with this key?" | **`Map`** | O(1), keys of any type, **insertion order preserved** |
| "Count / group by a key" | **`Map`** | `m.set(k, (m.get(k) ?? 0) + 1)` |
| Keys are bounded small integers (`0…n`) | **`Int32Array` / plain array** | Measured **6 ms vs 22 ms** vs `Map` for 10⁶ counts |
| Ordered list, index access, push/pop at the end | **`Array`** | O(1) at the end |
| Queue (FIFO) | **`Array` + head index** | `shift()` is O(n): **452 ms vs 3.6 ms** for 10⁵ items |
| Always need the smallest/largest next | **Heap** | JS has none built in — see the DSA Patterns guide |
| A fixed record with known fields | **object / interface** | Shape is documentation |

> **The one rule that matters most:** in algorithms, reach for **`Map`**, not `{}`. A plain object
> **reorders integer-like keys** and **stringifies every key**. Both are silent, and both produce
> wrong answers rather than errors. See [`object.md`](/guides/js-object) for the proof.

---

## How to read the entries

Each method is tagged like this:

- **O(1)** / **O(n)** / **O(n log n)** — cost of one call. Watch for O(n) methods used *inside* a
  loop; that's the accidental O(n²) that causes most TLEs.
- 🔴 **mutates** — changes the thing you called it on, in place. Surprising callers is a real bug.
- 🟢 **returns new** — leaves the original alone.

When a method has both forms, prefer the mutating one in a hot loop (no allocation) and the copying
one everywhere else (no surprises).
