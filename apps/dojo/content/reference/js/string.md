# String methods — the algorithm reference

**Strings are immutable.** Every "modification" allocates a new string. That one fact drives most of
what follows.

---

## Access and inspection

| Method | Cost | Notes |
|---|---|---|
| `s[i]` / `s.charAt(i)` | O(1) | `s[i]` gives `undefined` out of range, `charAt` gives `""` |
| `s.at(i)` | O(1) | supports negatives — `s.at(-1)` is the last char |
| `s.length` | O(1) | **code units**, not characters — see the Unicode note |
| `s.charCodeAt(i)` | O(1) | UTF-16 code unit; `'a'` → 97 |
| `s.codePointAt(i)` | O(1) | full code point (handles emoji) |
| `String.fromCharCode(n)` | O(1) | 97 → `'a'` |

```js
s.charCodeAt(i) - 97          // 'a'..'z' → 0..25, the classic alphabet index
String.fromCharCode(97 + k)   // back again
```

---

## Search

| Method | Cost | Returns |
|---|---|---|
| `includes(t)` | O(n·m) worst | boolean |
| `indexOf(t)` / `lastIndexOf(t)` | O(n·m) worst | index or `-1` |
| `startsWith(t)` / `endsWith(t)` | O(m) | boolean |
| `match(re)` / `matchAll(re)` | varies | regex matches |

> These are *not* O(1). Inside a loop over a long text they're the hidden O(n²). If you need repeated
> substring search, that's what KMP is for — see the DSA Patterns guide.

---

## Transform — all return new strings

| Method | Notes |
|---|---|
| `slice(s, e)` | ✅ the one to use — supports negatives |
| `substring(s, e)` | ⚠️ swaps arguments if `s > e`, no negatives. Avoid |
| `split(sep)` | `split("")` → chars (⚠️ breaks emoji), `split(" ")` → words |
| `trim()` / `trimStart()` / `trimEnd()` | whitespace |
| `toUpperCase()` / `toLowerCase()` | normalising before comparison |
| `replace(a, b)` / `replaceAll(a, b)` | `replace` with a *string* pattern only replaces the first |
| `padStart(n, c)` / `padEnd(n, c)` | fixed-width formatting, binary display |
| `repeat(n)` | `"ab".repeat(3)` |

```js
"hello".split("").reverse().join("");   // reverse a string — no built-in reverse
(5).toString(2).padStart(8, "0");       // "00000101"
```

---

## Building strings — measured, and the folklore is wrong

The received wisdom is "never use `+=` in a loop, always `push` + `join`". **Measured on Node 24, it
depends — and often `+=` wins:**

| Case | `+=` | `push` + `join` |
|---|---|---|
| 10⁶ single chars, result read | **55 ms** | **32 ms** ← join wins |
| 2×10⁵ *varying* strings, result read | **2.7 ms** | **7.9 ms** ← `+=` wins |

V8 represents `a + b` as a **rope** (a lazy tree of pieces) and only flattens when the string is
actually read, so `+=` is **not** the O(n²) catastrophe it is in Java or C. The difference either way
is small and situational.

> **The honest rule:** use whichever reads better. `join` for assembling a list, `+=` for appending as
> you go. If a string build is genuinely your bottleneck, *measure* — don't cargo-cult. And note both
> tests above had to **read** the result: benchmarks that never read the string measure nothing,
> because the rope is never flattened.

---

## Comparison

```js
"a" < "b"                       // true — lexicographic, by code unit
["b","a","C"].sort()            // ["C","a","b"]  ← uppercase sorts BEFORE lowercase
"ä".localeCompare("z", "de")    // locale-aware, correct for human-facing sort
```

For algorithms, code-unit order (`<`, `sort()`) is what you want and is deterministic.
`localeCompare` is for display.

---

## Unicode — the trap in "reverse a string"

```js
"é".length          // can be 2 — 'e' + combining accent
"👍".length         // 2 — one code point, two UTF-16 code units
[..."👍"].length    // 1 — spread iterates CODE POINTS
"👍".split("").reverse().join("")   // 🔴 corrupted — split the surrogate pair
[..."👍"].reverse().join("")        // ✅ safe
```

`s[i]` and `s.length` work in **code units**; `[...s]` and `for...of` work in **code points**. For
ASCII problems (most of them) it doesn't matter — but say the distinction out loud in an interview
and you've shown depth for free.

---

## The patterns you'll actually write

```js
[...s].sort().join("")                     // anagram key
s.split(/\s+/).filter(Boolean)             // words, no empties
new Set(s)                                  // distinct characters
const cnt = new Array(26).fill(0);          // lowercase frequency table
for (const c of s) cnt[c.charCodeAt(0) - 97]++;
s === [...s].reverse().join("")            // palindrome (O(n) space; two pointers is O(1))
```
