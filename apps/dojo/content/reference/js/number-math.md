# Numbers & Math — the algorithm reference

Every JS number is a **64-bit float**. There is no integer type. Almost everything below follows
from that.

---

## Where numbers break

| Boundary | Value | What happens |
|---|---|---|
| `Number.MAX_SAFE_INTEGER` | 2⁵³ − 1 = 9,007,199,254,740,991 | Beyond this, integers lose precision |
| Bitwise operators | 2³¹ | **All bit ops coerce to signed 32-bit** |
| `Number.EPSILON` | ~2.2e-16 | Float comparison tolerance |

```js
2**53 === 2**53 + 1;            // true   🔴 precision is gone
0.1 + 0.2 === 0.3;              // false
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON;   // true — how to compare floats
```

> **The JS danger point is 2⁵³, not 2³¹.** C/Java-style `int` overflow won't bite you, but silent
> precision loss will — especially multiplying two large values before taking a modulus. When a
> product can exceed 2⁵³, use `BigInt`.

---

## Integer division and rounding

```js
Math.trunc(7 / 2)    //  3     toward zero      ← integer division
Math.trunc(-7 / 2)   // -3
Math.floor(-7 / 2)   // -4     toward -Infinity  ← DIFFERENT for negatives
(7 / 2) | 0          //  3     fast but 32-bit only
7 % 2                //  1
-7 % 3               // -1     🔴 remainder keeps the DIVIDEND's sign
((-7 % 3) + 3) % 3   //  2     ✅ true mathematical modulo
```

**`Math.floor` vs `Math.trunc` only differ on negatives** — and that's exactly where the bug hides.
For integer division use `Math.trunc`; for "which bucket does this fall in" use `Math.floor`.

**Never use `|0` or `>>` for a midpoint.** They truncate to 32 bits, so
`(2e9 + 3e9) >> 1` returns a *negative* number. Use `Math.floor((lo + hi) / 2)`.

| Method | Behaviour |
|---|---|
| `Math.round(x)` | nearest; **`.5` always goes up** — `Math.round(-2.5)` is `-2` |
| `Math.ceil(x)` | up |
| `Math.floor(x)` | down |
| `Math.trunc(x)` | toward zero |

---

## The Math you'll use

```js
Math.max(a, b)   Math.min(a, b)      // O(1)
Math.abs(x)      Math.sign(x)
Math.pow(b, e)   b ** e              // ** is the modern form
Math.sqrt(x)     Math.cbrt(x)
Math.hypot(a, b)                     // √(a²+b²) without overflow
Math.log2(n)     Math.log10(n)       // log2 for "how many halvings"
Infinity  -Infinity                  // ✅ the right initial value for min/max searches
```

```js
let best = -Infinity;                 // not 0 — the answer might be negative
let cheapest = Infinity;
```

> 🔴 **`Math.max(...arr)` blows the call stack past ~10⁵ elements** — spread passes every element as
> an argument. Use a loop or `arr.reduce((m, x) => x > m ? x : m, -Infinity)`.

---

## Parsing and formatting

| Expression | Result | Notes |
|---|---|---|
| `Number("42")` | `42` | strict — `Number("42a")` is `NaN` |
| `parseInt("42a")` | `42` | lenient, stops at junk. **Always pass the radix**: `parseInt(s, 10)` |
| `parseFloat("3.14x")` | `3.14` | lenient |
| `+"42"` | `42` | terse `Number()` |
| `(255).toString(2)` | `"11111111"` | radix 2–36 — binary/hex output |
| `parseInt("ff", 16)` | `255` | parse from a radix |
| `n.toFixed(2)` | `"3.14"` | ⚠️ returns a **string** |

```js
[1, 2, 3].map(parseInt);   // 🔴 [1, NaN, NaN] — map passes (value, INDEX) and index becomes the radix
[1, 2, 3].map(Number);     // ✅ [1, 2, 3]
```

---

## Checking

```js
Number.isInteger(x)          // ✅ safe
Number.isFinite(x)           // ✅ no coercion — the global isFinite() coerces, avoid it
Number.isNaN(x)              // ✅ vs the global isNaN("abc") === true (coerces!)
NaN === NaN                  // false — the only value not equal to itself
Number.isSafeInteger(x)      // within ±2⁵³
```

**Detecting `NaN`:** `x !== x` is the classic trick, `Number.isNaN(x)` is the readable one. Note
`[NaN].includes(NaN)` is `true` (SameValueZero) but `[NaN].indexOf(NaN)` is `-1` (`===`).

---

## Bit operators — 32-bit, signed

| Op | Meaning |
|---|---|
| `&` `\|` `^` `~` | and, or, xor, not |
| `<<` `>>` | shift left / **arithmetic** right (keeps sign) |
| `>>>` | **logical** right shift (fills with 0) — the only unsigned one |

```js
1 << 31              // -2147483648   🔴 negative! bit 31 is the sign bit
(1 << 31) >>> 0      //  2147483648   ✅ read it back as unsigned
~~3.7                //  3            truncation trick — 32-bit only
n & (n - 1)          // clear the lowest set bit
n & -n               // isolate the lowest set bit
```

For the full bit-idiom set and submask enumeration, see **DSA Patterns → Bit Manipulation**.

---

## `BigInt`

Arbitrary precision integers. Use when a value or an intermediate product exceeds 2⁵³.

```js
const big = 123n;  BigInt(456);
(2n ** 64n) % 1000000007n;        // exact
```

- **Cannot mix** with Number: `1n + 1` throws. Convert explicitly.
- `Number(big)` may lose precision going back.
- Noticeably slower — use it for modular arithmetic, not for hot loops.

```js
// modular exponentiation — the standard place you need BigInt
let res = 1n, b = BigInt(base) % m, e = BigInt(exp);
while (e > 0n) { if (e & 1n) res = res * b % m; b = b * b % m; e >>= 1n; }
```

---

## Cheat sheet

| Goal | Write |
|---|---|
| integer division | `Math.trunc(a / b)` |
| true modulo (negatives safe) | `((a % b) + b) % b` |
| binary-search midpoint | `Math.floor((lo + hi) / 2)` — **never `>>`** |
| min/max seed values | `Infinity` / `-Infinity` |
| max of a big array | `arr.reduce((m, x) => x > m ? x : m, -Infinity)` |
| digits of n | `String(n)` or `while (n > 0) { d = n % 10; n = Math.trunc(n / 10); }` |
| n is a power of two | `n > 0 && (n & (n - 1)) === 0` |
| compare floats | `Math.abs(a - b) < Number.EPSILON` |
