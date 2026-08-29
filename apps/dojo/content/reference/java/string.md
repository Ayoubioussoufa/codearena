# String & StringBuilder — the Java algorithm reference

**Read the first section before you write any Java string code.** It is the single biggest
performance difference between Java and JavaScript, and it is not close.

---

## 🔴 Never build a string with `+=` in a loop

Java `String` is immutable, and there is **no rope optimisation** — every `+=` allocates a new string
and copies everything. That's genuinely O(n²). Measured, 100,000 appends:

| | Time |
|---|---|
| `s += "x"` | **1,343 ms** |
| `StringBuilder.append("x")` | **1 ms** |

**1,343×.** In JavaScript `+=` is fine because V8 builds a rope and flattens lazily — that intuition
does **not** transfer. In Java, the moment a string is built in a loop, use `StringBuilder`:

```java
StringBuilder sb = new StringBuilder();
for (String w : words) sb.append(w).append(' ');
return sb.toString();                                 // one allocation at the end
```

| `StringBuilder` method | Cost |
|---|---|
| `append(x)` | O(1) amortised — takes any type |
| `toString()` | O(n) — the one copy |
| `reverse()` | O(n) 🔴 in place |
| `length()` / `charAt(i)` / `setCharAt(i, c)` | O(1) |
| `deleteCharAt(i)` / `insert(i, x)` | O(n) |
| `setLength(0)` | O(1) — reuse the buffer instead of reallocating |

*(`StringBuffer` is the synchronised version. You don't want it — it's slower and single-threaded
algorithm code gains nothing.)*

---

## ⚠️ `==` vs `.equals()`

```java
String a = "hello", b = "hello", c = new String("hello");
a == b;          // true    both from the string POOL — same object
a == c;          // false   different objects, same contents
a.equals(c);     // true    ✅ always compare strings this way
c.intern() == a; // true    intern() returns the pooled instance
```

`==` compares **references**. Literals are interned into a shared pool so `==` accidentally works —
which is exactly why the bug survives testing and then fails on a string built at runtime. **Always
`.equals()`.** For null-safety: `Objects.equals(a, b)` or `"literal".equals(x)`.

---

## The API

| Method | Cost | Notes |
|---|---|---|
| `length()` | O(1) | a **method** — `length()` for String, `.length` for arrays, `size()` for List |
| `charAt(i)` | O(1) | returns a `char` |
| `substring(a, b)` | **O(n)** | ⚠️ copies since Java 7 — not the O(1) view it once was |
| `indexOf(s)` / `contains(s)` | O(n·m) | not O(1) — in a loop this is your O(n²) |
| `equals` / `equalsIgnoreCase` | O(n) | |
| `compareTo(s)` | O(n) | negative / 0 / positive — the natural sort order |
| `split(regex)` | O(n) | ⚠️ takes a **regex**, see below |
| `toCharArray()` | O(n) | the workhorse for char manipulation |
| `chars()` | O(1) | an `IntStream` of code units |
| `replace(a, b)` | O(n) | 🟢 plain text (unlike `replaceAll`, which is regex) |
| `strip()` / `trim()` | O(n) | `strip()` is Unicode-aware; prefer it |
| `repeat(n)` · `isBlank()` · `lines()` | O(n) | Java 11+ |
| `String.join(sep, parts)` | O(n) | |
| `String.valueOf(x)` | O(n) | null-safe, unlike `x.toString()` |

## ⚠️ `split` takes a regex, and drops trailing empties

```java
"a.b".split(".");        // []           🔴 "." is the regex ANY CHAR
"a.b".split("\\.");      // [a, b]       ✅ escaped
"a,b,,".split(",");      // length 2     🔴 trailing empties DROPPED
"a,b,,".split(",", -1);  // length 4     ✅ limit -1 keeps them
```

Both verified. Any of `. | * + ? ( ) [ ] { } ^ $ \` must be escaped, or use
`Pattern.quote(sep)`. And when a trailing empty field is meaningful (parsing CSV), pass `-1`.

---

## `char` is a number

```java
'c' - 'a';               // 2        char arithmetic promotes to int
(char) ('a' + 2);        // 'c'      cast back
int[] freq = new int[26];
for (char ch : s.toCharArray()) freq[ch - 'a']++;      // the frequency table
Character.isDigit(c); Character.isLetter(c); Character.toLowerCase(c);
Character.getNumericValue(c);      // '7' → 7
```

> ⚠️ `char` is a **UTF-16 code unit**, not a code point. Emoji and some accents take two `char`s, so
> `s.length()` counts units. For full code points use `s.codePoints()`. For ASCII problems it never
> matters — but knowing the distinction is a free interview point.

---

## Common patterns

```java
// reverse
new StringBuilder(s).reverse().toString();

// palindrome, O(1) space
for (int i = 0, j = s.length() - 1; i < j; i++, j--) if (s.charAt(i) != s.charAt(j)) return false;

// anagram key
char[] c = s.toCharArray(); Arrays.sort(c); String key = new String(c);

// words
String[] words = s.trim().split("\\s+");

// binary with padding
String bits = Integer.toBinaryString(5);                       // "101"
"0".repeat(8 - bits.length()) + bits;                          // "00000101"

// build from a list
String.join("-", List.of("a", "b", "c"));                      // "a-b-c"
```

---

## Cheat sheet

| Goal | Write |
|---|---|
| build in a loop | **`StringBuilder`** — never `+=` |
| compare | `a.equals(b)` — never `==` |
| reverse | `new StringBuilder(s).reverse().toString()` |
| sort characters | `toCharArray()` → `Arrays.sort` → `new String(c)` |
| frequency table | `int[26]`, index with `ch - 'a'` |
| split on a literal dot | `split("\\.")` |
| keep trailing empties | `split(sep, -1)` |
| char → digit | `Character.getNumericValue(c)` or `c - '0'` |
| int → binary | `Integer.toBinaryString(n)` |
