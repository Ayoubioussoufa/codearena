# Arrays — the Java algorithm reference

Java has **two different things** called arrays: the primitive `int[]` (fixed size, no boxing,
fastest) and `List<Integer>` (resizable, boxed). Know which you're holding.

```java
int[] a = new int[10];              // fixed size, zero-filled
int[] b = {3, 1, 2};                // literal
int[][] g = new int[rows][cols];    // 2-D, all zeros
a.length;                            // a FIELD — no parentheses, unlike String.length()
```

**Default values:** `int/long` → `0`, `double` → `0.0`, `boolean` → `false`, `char` → `'\0'`,
objects → `null`. You never need to fill with zeros.

---

## `Arrays.*` — the utility class

| Method | Cost | Notes |
|---|---|---|
| `Arrays.sort(a)` | O(n log n) | 🔴 in place. **See the warning below** |
| `Arrays.sort(a, from, to)` | O(k log k) | 🔴 a range |
| `Arrays.sort(T[], cmp)` | O(n log n) | 🔴 objects only — comparators need object types |
| `Arrays.binarySearch(a, key)` | O(log n) | ⚠️ **must be sorted**; see the negative return |
| `Arrays.fill(a, v)` | O(n) | 🔴 |
| `Arrays.copyOf(a, len)` | O(n) | 🟢 pads or truncates |
| `Arrays.copyOfRange(a, f, t)` | O(k) | 🟢 |
| `Arrays.equals(a, b)` | O(n) | ⚠️ `a == b` compares references |
| `Arrays.deepEquals` / `deepToString` | O(n) | for 2-D |
| `Arrays.toString(a)` | O(n) | ⚠️ printing an array directly gives `[I@1b6d3586` |
| `Arrays.stream(a)` | O(1) | → `IntStream` |
| `Arrays.asList(a)` | O(1) | ⚠️ fixed-size **view** — see `list.md` |
| `System.arraycopy(s, si, d, di, n)` | O(n) | the fastest bulk copy |

## ⚠️ `Arrays.sort` has two very different implementations

| Input | Algorithm | Worst case | Stable? |
|---|---|---|---|
| **primitives** (`int[]`, `long[]`…) | dual-pivot quicksort | **O(n²)** on adversarial input | n/a |
| **objects** (`Integer[]`, `String[]`…) | TimSort | O(n log n) | **yes** |

Two consequences that actually matter:

1. **`int[]` sorting can be quadratic** on inputs crafted to hit the pivot pattern. Competitive-
   programming judges have exploited this. The defence is one line — shuffle first, or box:
   ```java
   Arrays.sort(Arrays.stream(a).boxed().toArray(Integer[]::new));   // TimSort, guaranteed n log n
   ```
2. **You cannot pass a comparator to a primitive array.** `Arrays.sort(int[], cmp)` doesn't exist —
   there's no way to compare unboxed ints with a lambda. To sort `int[]` descending you must box, or
   sort ascending and reverse.

```java
int[][] pairs = {{3, 1}, {1, 9}};
Arrays.sort(pairs, (x, y) -> Integer.compare(x[0], y[0]));   // ✅ int[][] IS an object array
```

That last one is the everyday case — intervals, edges, points — and it works because `int[][]` is an
array *of objects*.

## ⚠️ `binarySearch` returns a negative on a miss

```java
int[] s = {10, 20, 30, 40};
Arrays.binarySearch(s, 30);    //  2    found at index 2
Arrays.binarySearch(s, 25);    // -3    NOT found
-(-3) - 1;                     //  2    ← the INSERTION POINT
```

Verified. On a miss it returns `-(insertion point) - 1`, so the recovery is `-(r) - 1`. The encoding
exists so that "not found" and "found at 0" are distinguishable. The array **must already be sorted**
or the result is meaningless — no error is raised.

---

## Copying — and the 2-D trap

```java
int[] copy = a.clone();                       // ✅ 1-D, full copy
int[] copy2 = Arrays.copyOf(a, a.length);     // ✅ same

int[][] g2 = g.clone();                       // 🔴 SHALLOW — rows are shared!
g2[0][0] = 99;                                // also changes g[0][0]

int[][] deep = new int[g.length][];           // ✅ deep copy
for (int i = 0; i < g.length; i++) deep[i] = g[i].clone();
```

A 2-D array is an array **of references to rows**, so `clone()` copies the references, not the rows.
Same shape as the JavaScript `fill([])` bug.

### Jagged arrays

```java
int[][] tri = new int[n][];
for (int i = 0; i < n; i++) tri[i] = new int[i + 1];   // row i has i+1 cells
```

Rows need not be the same length — useful for triangular DP, and it saves memory.

---

## Converting

```java
int[] → List<Integer>    Arrays.stream(a).boxed().toList();
List<Integer> → int[]    list.stream().mapToInt(Integer::intValue).toArray();
int[] → Integer[]        Arrays.stream(a).boxed().toArray(Integer[]::new);
String → char[]          s.toCharArray();
char[] → String          new String(c);           // ⚠️ NOT c.toString()
```

> ⚠️ `String.valueOf(charArray)` and `new String(charArray)` give the text.
> `charArray.toString()` gives `[C@1b6d3586` — the identity hash. Easy to do by accident inside a
> `System.out.println`.

---

## Performance: `int[]` vs `List<Integer>`

Measured summing 1,000,000 elements: **`int[]` 5 ms**, **`List<Integer>` 20 ms** — 4×. Every element
of a `List<Integer>` is a heap-allocated object with a pointer chase; an `int[]` is a contiguous block.
In a hot inner loop, use primitives.

---

## Cheat sheet

| Goal | Write |
|---|---|
| n zeros | `new int[n]` |
| fill with a value | `Arrays.fill(a, -1)` |
| 2-D zeros | `new int[r][c]` |
| 2-D filled | `for (int[] row : g) Arrays.fill(row, -1);` |
| sort ascending | `Arrays.sort(a)` |
| sort `int[]` descending | box, sort with `reverseOrder()`, or sort + reverse |
| sort intervals by start | `Arrays.sort(iv, (x, y) -> Integer.compare(x[0], y[0]))` |
| print | `Arrays.toString(a)` · `Arrays.deepToString(g)` |
| compare contents | `Arrays.equals(a, b)` |
| copy | `a.clone()` (1-D) · row-by-row (2-D) |
| max | `Arrays.stream(a).max().getAsInt()` |
| sum | `Arrays.stream(a).sum()` |
