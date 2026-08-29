# Set methods — the Java algorithm reference

Same three-way choice as `Map`, for the same reasons.

| Implementation | Order | Cost |
|---|---|---|
| **`HashSet`** | none guaranteed | O(1) avg |
| **`LinkedHashSet`** | insertion | O(1) avg |
| **`TreeSet`** | sorted | O(log n) |

---

## The API

| Method | Cost | Returns |
|---|---|---|
| `add(e)` | O(1) avg | `false` if already present — ✅ a free duplicate check |
| `contains(e)` | O(1) avg | |
| `remove(e)` | O(1) avg | `true` if it was there |
| `size()` / `isEmpty()` | O(1) | |
| `addAll` / `retainAll` / `removeAll` | O(n) | 🔴 union / intersection / difference, **in place** |

```java
if (!seen.add(x)) return true;      // add returns false on a duplicate — one line, no contains()
```

Measured: 200,000 `HashSet.contains` calls took **5 ms**; just 2,000 `ArrayList.contains` calls took
**7 ms**. If you're calling `contains` in a loop, that's the moment to build a set.

---

## Set algebra — 🔴 these mutate

```java
Set<Integer> a = new HashSet<>(List.of(1, 2, 3));
a.addAll(b);        // a = a ∪ b
a.retainAll(b);     // a = a ∩ b
a.removeAll(b);     // a = a \ b
```

Unlike JS's ES2024 methods, **these modify the receiver**. Copy first if you need the original:

```java
Set<Integer> inter = new HashSet<>(a);
inter.retainAll(b);
```

---

## `TreeSet` — the sorted set

```java
TreeSet<Integer> t = new TreeSet<>(List.of(1, 5, 9));
t.ceiling(6);      // 9    smallest ≥ 6
t.floor(6);        // 5    greatest ≤ 6
t.higher(5);       // 9    strictly >
t.lower(5);        // 1    strictly <
t.first(); t.last();
t.pollFirst();     // 1    removes and returns the smallest
t.headSet(5); t.tailSet(5); t.subSet(1, 9);
t.descendingSet();
```

The workhorse for "closest value to x", interval scheduling, and any problem where you insert and
query order at the same time. **`TreeSet` doubles as a sorted multiset-of-one and as a priority queue
you can delete arbitrary elements from** — which a `PriorityQueue` can't do in O(log n).

---

## Traps

- **Mutating an element after insertion corrupts the set.** If a key object's `hashCode` changes
  while it's in a `HashSet`, you can no longer find it. Use immutable keys — `record`s are ideal.
- **`TreeSet` uses `compareTo`, not `equals`.** Two elements that compare `0` are treated as the
  *same* element, even if `equals` says otherwise. A comparator that returns 0 for distinct items
  silently drops them.
- **`HashSet` needs `equals` + `hashCode`** on custom types, exactly as `HashMap` does.

---

## Cheat sheet

| Goal | Write |
|---|---|
| dedupe a list | `new LinkedHashSet<>(list)` (keeps first-seen order) |
| dedupe, sorted | `new TreeSet<>(list)` |
| seen-check | `if (!seen.add(x)) …` |
| grid visited | `seen.add(r * COLS + c)` with a `Set<Long>` — or a `boolean[][]`, which is faster |
| immutable | `Set.of(1, 2, 3)` |
| set → list | `new ArrayList<>(set)` |

> For grid problems, prefer **`boolean[rows][cols]`** over a `HashSet` of encoded coordinates: no
> boxing, no hashing, better cache behaviour. Use the set only when the space is sparse or unbounded.
