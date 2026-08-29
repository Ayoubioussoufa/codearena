# List methods — the Java algorithm reference

`List<E>` is the interface; **`ArrayList` is the implementation you want** in ~95% of algorithm code.

```java
List<Integer> a = new ArrayList<>();          // declare the interface, build the class
List<Integer> b = new ArrayList<>(List.of(1, 2, 3));   // seeded, and mutable
```

---

## The API

| Method | Cost | Notes |
|---|---|---|
| `add(e)` | **O(1)** amortised | appends |
| `add(i, e)` | **O(n)** | inserts, shifting everything right |
| `get(i)` / `set(i, e)` | **O(1)** | `ArrayList` only — `LinkedList` is O(n) |
| `remove(int i)` | **O(n)** | ⚠️ by **index** |
| `remove(Object o)` | **O(n)** | ⚠️ by **value** |
| `size()` | **O(1)** | a method — `size()`, not `.length` |
| `contains(o)` | **O(n)** | uses `equals`. In a loop → O(n²), use a `HashSet` |
| `indexOf(o)` | **O(n)** | `-1` if absent |
| `isEmpty()` | **O(1)** | prefer to `size() == 0` |
| `sort(cmp)` | **O(n log n)** | 🔴 in place, stable (TimSort) |
| `subList(a, b)` | **O(1)** | ⚠️ a **view**, not a copy — writes pass through |
| `removeIf(pred)` | **O(n)** | 🔴 the safe way to remove while iterating |
| `forEach(consumer)` | **O(n)** | |
| `toArray(new T[0])` | **O(n)** | |

---

## ⚠️ Trap 1 — `remove(int)` vs `remove(Object)`

The single nastiest overload in the language, and it only bites on `List<Integer>`:

```java
List<Integer> l = new ArrayList<>(List.of(10, 20, 30));
l.remove(1);                      // → [10, 30]   removed INDEX 1
l.remove(Integer.valueOf(20));    // → [10, 30]   removed the VALUE 20
```

Both compile. `remove(1)` picks the `int` overload (index); to remove by value you must hand it an
`Object` — `Integer.valueOf(20)` or a cast. On a `List<String>` there's no ambiguity, which is why
this surprises people exactly when it matters.

## ⚠️ Trap 2 — `Arrays.asList` and `List.of` are not resizable

```java
Integer[] arr = {1, 2, 3};
List<Integer> view = Arrays.asList(arr);
view.set(0, 99);        // ✅ allowed — and arr[0] is now 99: it's a VIEW onto the array
view.add(4);            // 💥 UnsupportedOperationException — fixed size
List.of(1, 2).add(3);   // 💥 UnsupportedOperationException — fully immutable
```

- `Arrays.asList(arr)` — **fixed-size view backed by the array**. `set` writes through; `add`/`remove` throw.
- `List.of(...)` — **fully immutable**, and rejects `null`.
- Want a real mutable list? `new ArrayList<>(Arrays.asList(arr))` or `new ArrayList<>(List.of(...))`.

## ⚠️ Trap 3 — `ConcurrentModificationException`

```java
for (Integer x : list) if (x == 2) list.remove(x);   // 💥 ConcurrentModificationException
list.removeIf(x -> x == 2);                          // ✅ [1, 3, 4]
```

You cannot structurally modify a collection while a for-each loop is iterating it. Use `removeIf`, an
explicit `Iterator` with `it.remove()`, or build a new list.

---

## `ArrayList` vs `LinkedList` — measured

| Operation | ArrayList | LinkedList |
|---|---|---|
| `get(i)` | **O(1)** — 100,000 random gets in **9 ms** | **O(n)** — 2,000 random gets in **140 ms** |
| `add(e)` at end | O(1) amortised | O(1) |
| `add(0, e)` at front | O(n) | O(1) |

**Use `ArrayList`.** Its contiguous memory is cache-friendly, and modern CPUs reward that heavily.
The one case for `LinkedList` — cheap insertion at both ends — is better served by `ArrayDeque`.

---

## Iteration

```java
for (int i = 0; i < list.size(); i++) { ... }     // when you need the index
for (Integer x : list) { ... }                     // clean; no index
list.forEach(x -> { ... });                        // cannot break
Iterator<Integer> it = list.iterator();
while (it.hasNext()) { if (bad(it.next())) it.remove(); }   // safe removal
```

---

## Sorting

```java
list.sort(null);                                     // natural order (Comparable)
list.sort(Comparator.naturalOrder());
list.sort(Comparator.reverseOrder());
list.sort(Comparator.comparingInt(P::score));
list.sort(Comparator.comparingInt(P::score).reversed()
                    .thenComparing(P::name));        // multi-key
Collections.sort(list);                              // older equivalent
```

`List.sort` is **TimSort**: O(n log n), **stable**, so ties keep their original order — that's what
makes `thenComparing` work.

> ⚠️ **Never write `(a, b) -> a - b` for a comparator on large ints** — the subtraction can overflow
> and flip the sign. Use `Integer.compare(a, b)` or `Comparator.comparingInt`.

---

## Cheat sheet

| Goal | Write |
|---|---|
| new mutable list | `new ArrayList<>()` |
| from values, mutable | `new ArrayList<>(List.of(1, 2, 3))` |
| immutable | `List.of(1, 2, 3)` |
| copy | `new ArrayList<>(other)` |
| n zeros | `new ArrayList<>(Collections.nCopies(n, 0))` |
| list → array | `list.toArray(new Integer[0])` |
| `int[]` → `List<Integer>` | `Arrays.stream(a).boxed().toList()` |
| `List<Integer>` → `int[]` | `list.stream().mapToInt(Integer::intValue).toArray()` |
| reverse | `Collections.reverse(list)` 🔴 |
| max / min | `Collections.max(list)` / `Collections.min(list)` |
| 2-D list | `List<List<Integer>> g = new ArrayList<>();` then add rows |
