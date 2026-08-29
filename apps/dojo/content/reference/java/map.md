# Map methods — the Java algorithm reference

Three implementations, and **picking the wrong one is a correctness bug, not a performance one.**

| Implementation | Order | Cost | Use when |
|---|---|---|---|
| **`HashMap`** | **none guaranteed** | O(1) avg | The default. You don't care about order |
| **`LinkedHashMap`** | **insertion** | O(1) avg | Order matters — first-seen, LRU |
| **`TreeMap`** | **sorted by key** | O(log n) | You need sorted keys or nearest-key queries |

Measured on the same four insertions `pear, apple, fig, banana`:

```
HashMap        [banana, apple, pear, fig]   ← neither insertion nor sorted
LinkedHashMap  [pear, apple, fig, banana]   ← as inserted
TreeMap        [apple, banana, fig, pear]   ← sorted
```

> ⚠️ **`HashMap` order is unspecified and must never be relied on.** It isn't random — it's a
> function of hash codes and capacity — which is worse, because it looks stable in your tests and
> changes when the map resizes. If order matters, say so with the type.

---

## The API

| Method | Cost | Notes |
|---|---|---|
| `put(k, v)` | O(1) avg | returns the **previous** value or `null` |
| `get(k)` | O(1) avg | `null` if absent |
| `getOrDefault(k, d)` | O(1) avg | ✅ prefer to a null check |
| `containsKey(k)` | O(1) avg | |
| `containsValue(v)` | **O(n)** | ⚠️ scans everything |
| `remove(k)` | O(1) avg | returns the removed value |
| `size()` / `isEmpty()` | O(1) | |
| `keySet()` / `values()` / `entrySet()` | O(1) to obtain | **views** — removing from `keySet` removes from the map |
| `putIfAbsent(k, v)` | O(1) avg | only if missing |
| `computeIfAbsent(k, fn)` | O(1) avg | ✅ the grouping idiom |
| `merge(k, v, fn)` | O(1) avg | ✅ the counting idiom |
| `forEach((k, v) -> …)` | O(n) | key first, unlike JS |

---

## The three idioms worth memorising

```java
// COUNT — merge is the cleanest thing in the Java collections API
Map<String, Integer> count = new HashMap<>();
for (String w : words) count.merge(w, 1, Integer::sum);        // {a=2, b=1}

// GROUP — computeIfAbsent creates the bucket only when needed
Map<String, List<String>> groups = new HashMap<>();
for (String w : words) {
    char[] c = w.toCharArray(); Arrays.sort(c);
    groups.computeIfAbsent(new String(c), k -> new ArrayList<>()).add(w);
}                                                              // {aet=[eat, tea], ant=[tan]}

// READ WITH A DEFAULT
int n = count.getOrDefault(key, 0);
```

`merge(k, v, fn)` means: absent → store `v`; present → store `fn(old, v)`. `computeIfAbsent(k, fn)`
means: absent → compute and store; present → return what's there. Between them they replace almost
every `if (map.containsKey(k))` you'd otherwise write.

---

## `TreeMap` — the sorted map JS doesn't have

This is a genuine Java advantage in interviews. `TreeMap` (a red-black tree) keeps keys sorted and
answers **nearest-key** questions in O(log n):

```java
TreeMap<Integer, String> tm = new TreeMap<>(Map.of(10, "a", 20, "b", 30, "c"));
tm.floorKey(25);      // 20   greatest key ≤ 25
tm.ceilingKey(25);    // 30   smallest key ≥ 25
tm.lowerKey(20);      // 10   strictly <
tm.higherKey(20);     // 30   strictly >
tm.firstKey();        // 10
tm.lastKey();         // 30
tm.headMap(20);       // {10=a}          keys < 20  (exclusive)
tm.tailMap(20);       // {20=b, 30=c}    keys ≥ 20  (inclusive)
tm.pollFirstEntry();  // removes and returns the smallest
```

Reach for it on: "the closest booking to this time", calendar/interval overlap, "the largest value
below x", and any sliding-window-with-order problem. In JS you'd have to hand-roll a balanced tree.

> **Asymmetry to memorise:** `headMap` is **exclusive**, `tailMap` is **inclusive**. Both have
> two-argument forms if you want to say otherwise.

---

## `LinkedHashMap` — insertion order, and a free LRU cache

```java
new LinkedHashMap<>(16, 0.75f, true)   // the `true` = ACCESS order, not insertion order
```

With access-order plus one overridden method you get an LRU cache in five lines:

```java
class LRU<K, V> extends LinkedHashMap<K, V> {
    private final int cap;
    LRU(int cap) { super(16, 0.75f, true); this.cap = cap; }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> eldest) { return size() > cap; }
}
```

That's the standard answer to "implement an LRU cache" when you're allowed library help — and knowing
the hand-rolled `HashMap` + doubly-linked-list version is what they usually want instead. Know both.

---

## ⚠️ The `equals`/`hashCode` contract

**Any object used as a key must implement both, consistently.** Measured:

```java
record Pt(int x, int y) {}
Map<Pt, String> m = new HashMap<>();
m.put(new Pt(1, 2), "v");
m.get(new Pt(1, 2));            // "v"   ✅ records generate equals + hashCode

class NoHash { int x; NoHash(int x) { this.x = x; } }
Map<NoHash, String> n = new HashMap<>();
n.put(new NoHash(1), "v");
n.get(new NoHash(1));           // null  🔴 default hashCode is identity
```

The contract: **equal objects must have equal hash codes.** Break it and the map looks up the wrong
bucket and silently misses. Use a `record` for value-like keys and you get both for free — say that
in an interview.

> For coordinates specifically, a `long` or `String` key is often faster than a record:
> `map.put(r * 1000L + c, v)`.

---

## Cheat sheet

| Goal | Write |
|---|---|
| count | `map.merge(k, 1, Integer::sum)` |
| group | `map.computeIfAbsent(k, x -> new ArrayList<>()).add(v)` |
| read with default | `map.getOrDefault(k, 0)` |
| iterate pairs | `for (var e : map.entrySet()) { e.getKey(); e.getValue(); }` |
| sorted by key | `new TreeMap<>(map)` |
| sort by value | `map.entrySet().stream().sorted(Map.Entry.comparingByValue())` |
| immutable | `Map.of(k1, v1, k2, v2)` (≤10 pairs) · `Map.copyOf(m)` |
| nearest key ≤ x | `treeMap.floorKey(x)` |
