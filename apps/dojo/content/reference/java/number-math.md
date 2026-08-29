# Numbers & Math — the Java algorithm reference

Java has **real integer types with real overflow**. Coming from JavaScript, this is the difference
that will silently produce wrong answers.

---

## 🔴 Overflow — the JS habit that breaks here

| Type | Range | Notes |
|---|---|---|
| `int` | ±2³¹ ≈ **±2.15 × 10⁹** | the default for integer literals |
| `long` | ±2⁶³ ≈ ±9.2 × 10¹⁸ | suffix `L`: `1_000_000_000L` |
| `double` | exact to 2⁵³ | what JS numbers are |

Measured:

```java
Integer.MAX_VALUE;            //  2147483647
Integer.MAX_VALUE + 1;        // -2147483648   🔴 wraps SILENTLY, no error
100000 * 100000;              //  1410065408   🔴 wrong — computed as int
(long) 100000 * 100000;       //  10000000000  ✅ cast BEFORE multiplying
```

**The rule: if a sum or product can exceed 2 × 10⁹, cast to `long` before the arithmetic, not after.**
`(long)(a * b)` is too late — the multiplication already overflowed. Write `(long) a * b`.

Common places it bites: prefix sums over 10⁵ elements each up to 10⁹; `mid = (lo + hi) / 2` in binary
search; multiplying before a modulus; area/volume products.

```java
int mid = lo + (hi - lo) / 2;        // ✅ the standard overflow-safe midpoint
int mid = (lo + hi) / 2;             // 🔴 overflows when lo + hi > 2^31
```

*(Note this is the one place Java and JS differ in the fix: in JS you write
`Math.floor((lo + hi) / 2)` because doubles reach 2⁵³; in Java you write `lo + (hi - lo) / 2`.)*

Java 8+ will *throw* instead of wrapping if you ask:

```java
Math.addExact(a, b);  Math.multiplyExact(a, b);   // ArithmeticException on overflow
```

---

## ⚠️ `Integer` caching — `==` breaks above 127

```java
Integer a = 127, b = 127;   a == b;        // true
Integer c = 128, d = 128;   c == d;        // false   🔴
c.equals(d);                                // true    ✅
```

Verified. Java caches boxed `Integer` objects for **−128…127**, so `==` accidentally works on small
values and fails on large ones — a bug that passes every small test. **Always `.equals()` on boxed
types**, or unbox to `int` first. Same for `Long`, `Character`, `Boolean`.

This is why `List<Integer>.contains`, `Map<Integer, …>` keys, and `remove(Object)` all use `equals`
under the hood — and why `list.remove(1)` vs `list.remove(Integer.valueOf(1))` is a real distinction.

---

## Integer division and modulo

```java
7 / 2;                    //  3    integer division TRUNCATES (both ints → int result)
-7 / 2;                   // -3    toward zero
Math.floorDiv(-7, 2);     // -4    toward negative infinity
-7 % 3;                   // -1    🔴 remainder keeps the DIVIDEND's sign
Math.floorMod(-7, 3);     //  2    ✅ true mathematical modulo
7 / 2.0;                  //  3.5  one double operand → double division
```

All verified. `Math.floorMod` is the built-in Java has and JS doesn't — in JS you write
`((a % b) + b) % b`. Use it any time indices can go negative (circular arrays, hashing).

> ⚠️ `int / int` is **always** integer division, even when assigned to a double:
> `double d = 1 / 2;` gives `0.0`, not `0.5`. Write `1 / 2.0`.

---

## `Math.*`

```java
Math.max(a, b)   Math.min(a, b)   Math.abs(x)
Math.pow(b, e)                  // returns DOUBLE — cast for ints, or write a loop
Math.sqrt(x)     Math.cbrt(x)    Math.hypot(a, b)
Math.ceil(x)     Math.floor(x)   Math.round(x)    // round returns long for double
Math.floorDiv(a, b)              Math.floorMod(a, b)
Math.addExact / multiplyExact / subtractExact     // overflow-checked
Integer.MAX_VALUE  Integer.MIN_VALUE  Long.MAX_VALUE
Double.POSITIVE_INFINITY                          // the seed for min-searches
```

```java
int best = Integer.MIN_VALUE;        // ✅ not 0 — the answer may be negative
long cheapest = Long.MAX_VALUE;      // ✅ and use long if you'll add to it
```

> ⚠️ `Math.pow(2, 10)` returns `1024.0` (a `double`). For integer powers write a loop or
> `1L << 10` — and never use `Math.pow` inside an exact-integer computation, because large results
> lose precision.

---

## Parsing and formatting

```java
Integer.parseInt("42")            // int    — throws NumberFormatException on junk
Integer.valueOf("42")             // Integer (boxed, cached)
Long.parseLong("42")   Double.parseDouble("3.14")
Integer.parseInt("ff", 16)        // 255    from a radix
Integer.toBinaryString(5)         // "101"
Integer.toString(255, 16)         // "ff"
String.valueOf(42)                // "42"   null-safe
String.format("%.2f", 3.14159)    // "3.14"
```

## Useful `Integer.*` statics

```java
Integer.compare(a, b)             // ✅ overflow-safe comparator body
Integer.bitCount(n)               // popcount — built in
Integer.highestOneBit(n)          // largest power of 2 ≤ n
Integer.numberOfTrailingZeros(n)
Integer.reverse(n)                // reverse the bits
Integer.MAX_VALUE / MIN_VALUE
```

`Integer.bitCount` is the one to remember — it's a single CPU instruction, and it saves writing the
`n &= n - 1` loop.

---

## Bit operators

Same set as JS, but they operate on **`int` (32-bit)** or **`long` (64-bit)** depending on operand
type — so unlike JS there's no silent truncation to 32 bits when you use `long`.

```java
&   |   ^   ~
<<  >>          // >> is ARITHMETIC (sign-extending)
>>>             // LOGICAL right shift (fills with 0)
1 << 31         // -2147483648   bit 31 is the sign bit
1L << 40        // ✅ needs the L, or you shift an int and get garbage
n & (n - 1)     // clear the lowest set bit
n & -n          // isolate the lowest set bit
```

> ⚠️ **`1 << 40` is not 2⁴⁰.** Shift counts on `int` are taken **mod 32**, so `1 << 40` == `1 << 8`
> == 256. Write `1L << 40`. This is a favourite interview trap.

---

## Cheat sheet

| Goal | Write |
|---|---|
| avoid overflow in a product | `(long) a * b` |
| binary-search midpoint | `lo + (hi - lo) / 2` |
| true modulo | `Math.floorMod(a, b)` |
| integer division toward −∞ | `Math.floorDiv(a, b)` |
| min/max seeds | `Integer.MIN_VALUE` / `Integer.MAX_VALUE` |
| compare boxed values | `.equals()`, never `==` |
| safe comparator | `Integer.compare(a, b)` |
| popcount | `Integer.bitCount(n)` |
| power of two check | `n > 0 && (n & (n - 1)) == 0` |
| 2^k as a long | `1L << k` |
