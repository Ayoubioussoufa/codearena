# Java Methods — the algorithm reference

Every collection and built-in you reach for while solving problems, with **complexity**, **whether it
mutates**, **when to use it**, and **the trap it sets**. Every number and behaviour on these pages was
executed on **Java 21** — where received wisdom is wrong, the measurement wins.

Pick a topic below, or start with the [JS → Java translation table](#coming-from-javascript--the-translation-table)
if you're arriving from the [JS/TS reference](/guides/js).

**Files**

| File | Covers |
|---|---|
| [`list.md`](/guides/java-list) | `ArrayList`, `LinkedList`, `List.of`, and the `remove(int)` trap |
| [`map.md`](/guides/java-map) | `HashMap` / `TreeMap` / `LinkedHashMap`, `merge`, `computeIfAbsent`, the `equals`/`hashCode` contract |
| [`set.md`](/guides/java-set) | `HashSet` / `TreeSet` / `LinkedHashSet` and navigation methods |
| [`deque-heap.md`](/guides/java-deque-heap) | `ArrayDeque` for stack **and** queue, `PriorityQueue` |
| [`array.md`](/guides/java-array) | Raw arrays and the `Arrays.*` utilities |
| [`string.md`](/guides/java-string) | `String`, `StringBuilder`, `char`, and the 1343× mistake |
| [`number-math.md`](/guides/java-number-math) | `int` vs `long` overflow, `Math.*`, Integer caching, bit ops |
| [`streams.md`](/guides/java-streams) | Streams — when they help and when they cost you |

---

## Coming from JavaScript — the translation table

| JavaScript | Java | Watch out |
|---|---|---|
| `[]` | `new ArrayList<>()` | Fixed arrays are `int[]`, a *different* type |
| `{}` as a dictionary | `new HashMap<>()` | `HashMap` iteration order is **unspecified** |
| `Map` (insertion order) | `LinkedHashMap` | Plain `HashMap` does *not* preserve order |
| `Set` | `HashSet` | |
| *(none)* | `TreeMap` / `TreeSet` | **Sorted**, with `floor`/`ceiling` — Java has this and JS doesn't |
| array as a stack | `ArrayDeque` (`push`/`pop`) | The old `Stack` class is legacy — don't |
| array + head index as a queue | `ArrayDeque` (`offer`/`poll`) | |
| *(none)* | `PriorityQueue` | A real heap, built in |
| `arr.length` | `arr.length` (array) · `list.size()` (List) · `s.length()` (String) | Three different spellings |
| `s += x` in a loop | **`StringBuilder`** | In Java `+=` is genuinely O(n²) — measured **1343×** slower |
| `a === b` | `a.equals(b)` | `==` compares **references** for objects |
| `2**53` precision limit | `int` overflows at **2³¹**, `long` at 2⁶³ | Silent wraparound, no error |

---

## Which structure do I pick?

| The question | Use | Cost |
|---|---|---|
| "Have I seen this?" | **`HashSet`** | `contains` O(1) — measured **5 ms** for 200k vs **7 ms** for 2k `ArrayList.contains` |
| "What's mapped to this key?" | **`HashMap`** | O(1) |
| Need the keys **sorted**, or "nearest key ≤ x" | **`TreeMap` / `TreeSet`** | O(log n), and `floorKey`/`ceilingKey` |
| Need **insertion order** preserved | **`LinkedHashMap` / `LinkedHashSet`** | O(1) |
| Indexed list, append at the end | **`ArrayList`** | `get` O(1), `add` O(1) amortised |
| Stack (LIFO) | **`ArrayDeque`** `push`/`pop` | O(1) |
| Queue (FIFO) | **`ArrayDeque`** `offer`/`poll` | O(1) |
| Always need the smallest/largest | **`PriorityQueue`** | `offer`/`poll` O(log n), `peek` O(1) |
| Fixed size, primitives, max speed | **`int[]`** | No boxing — measured **4× faster** than `List<Integer>` |

> **`LinkedList` is almost never the answer.** `get(i)` walks the list: measured **2,000** random gets
> took **140 ms**, while **100,000** `ArrayList` gets took **9 ms**. Use it only when you genuinely
> need O(1) insertion at both ends — and then `ArrayDeque` is usually better anyway.

---

## How to read the entries

- **O(1)** / **O(n)** / **O(log n)** — cost of one call. An O(n) method inside a loop is the
  accidental O(n²) that causes most TLEs.
- 🔴 **mutates** · 🟢 **returns new**
- ⚠️ **trap** — behaviour that compiles fine and gives wrong answers.
