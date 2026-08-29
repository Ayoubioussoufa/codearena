# Streams — the Java algorithm reference

Streams are Java's `map`/`filter`/`reduce`. They make *transformation* code short and readable. They
are **not** free, and in a hot algorithmic loop a plain `for` is usually faster.

**Use streams for:** setting up input, converting between types, one-line aggregations, grouping.
**Use loops for:** the inner loop of an algorithm, anything with early exit, anything mutating state.

---

## The shape

```java
list.stream()                    // source
    .filter(x -> x > 0)          // intermediate (lazy)
    .map(x -> x * 2)             // intermediate (lazy)
    .toList();                   // terminal — nothing runs until here
```

Intermediate operations build a pipeline; **nothing executes until a terminal operation**. A stream
is single-use — consuming it twice throws `IllegalStateException`.

## Sources

```java
list.stream()                    Arrays.stream(intArray)        // → IntStream
Stream.of(1, 2, 3)               IntStream.range(0, n)          // 0..n-1 (exclusive)
IntStream.rangeClosed(1, n)      s.chars()                      // → IntStream of code units
Stream.iterate(1, x -> x * 2).limit(10)
```

## Intermediate

| Method | Notes |
|---|---|
| `filter(pred)` | keep matches |
| `map(fn)` / `mapToInt(fn)` | transform — `mapToInt` **unboxes**, much faster |
| `flatMap(fn)` | flatten nested streams |
| `distinct()` | uses `equals` |
| `sorted()` / `sorted(cmp)` | |
| `limit(n)` / `skip(n)` | |
| `peek(fn)` | debugging only |

## Terminal

| Method | Returns |
|---|---|
| `toList()` | Java 16+, **immutable**. `collect(Collectors.toList())` for a mutable one |
| `collect(...)` | the general reducer |
| `count()` | `long` |
| `sum()` / `average()` / `max()` / `min()` | **`IntStream` only** — `max()` gives an `OptionalInt` |
| `anyMatch` / `allMatch` / `noneMatch` | short-circuits |
| `findFirst()` / `findAny()` | `Optional` |
| `reduce(id, fn)` | |
| `forEach(fn)` | ⚠️ cannot break |

---

## ⚠️ Primitive vs boxed streams

```java
list.stream().map(x -> x * 2).reduce(0, Integer::sum);   // boxes on EVERY element
list.stream().mapToInt(Integer::intValue).sum();         // ✅ unboxes once, then primitives
```

`Stream<Integer>` allocates an `Integer` per element. `IntStream` doesn't. Measured elsewhere in this
reference, boxed iteration cost **4×** a primitive array. Use `mapToInt` / `mapToLong` as soon as you
can, and `boxed()` only when you must go back.

```java
int[] a = {3, 1, 2};
Arrays.stream(a).sum();                          // 6
Arrays.stream(a).max().getAsInt();               // 3   — OptionalInt
Arrays.stream(a).boxed().toList();               // List<Integer>
IntStream.range(0, n).toArray();                 // [0, 1, …, n-1]
list.stream().mapToInt(Integer::intValue).toArray();
```

---

## `Collectors` — the ones worth knowing

```java
.collect(Collectors.toList())                    // mutable list
.collect(Collectors.toSet())
.collect(Collectors.toMap(k -> k.id(), v -> v))  // ⚠️ throws on duplicate keys!
.collect(Collectors.joining(", ", "[", "]"))
.collect(Collectors.groupingBy(Person::dept))                          // Map<K, List<T>>
.collect(Collectors.groupingBy(Person::dept, Collectors.counting()))   // Map<K, Long>
.collect(Collectors.partitioningBy(x -> x > 0))                        // Map<Boolean, List<T>>
```

`groupingBy` is the one that replaces a `computeIfAbsent` loop:

```java
Map<String, List<String>> anagrams = words.stream()
    .collect(Collectors.groupingBy(w -> {
        char[] c = w.toCharArray(); Arrays.sort(c); return new String(c);
    }));
```

> ⚠️ **`Collectors.toMap` throws `IllegalStateException` on a duplicate key.** Pass a merge function:
> `Collectors.toMap(k, v, (a, b) -> a)`.

---

## Sorting with comparators

```java
list.stream().sorted(Comparator.comparingInt(P::score).reversed()).toList();
list.stream().max(Comparator.comparing(P::name));            // Optional<P>
map.entrySet().stream()
   .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
   .limit(k).toList();                                       // top-k by value
```

---

## When *not* to use a stream

- **Inner loops.** Lambda indirection and boxing cost real time; a `for` over an `int[]` wins.
- **Early exit with side effects.** `forEach` can't `break`; `anyMatch` can short-circuit but can't
  carry state out.
- **Index arithmetic.** Two pointers, sliding windows, in-place swaps — all clearer and faster as loops.
- **Mutating shared state.** `forEach` that writes to an outer variable doesn't compile for locals and
  is a bug waiting to happen for fields.

**In an interview:** use a stream for setup and aggregation, a loop for the algorithm. Being able to
say *why* — "this is the hot path, I don't want the boxing" — reads better than either choice alone.

---

## Cheat sheet

| Goal | Write |
|---|---|
| `int[]` → sum | `Arrays.stream(a).sum()` |
| `int[]` → `List<Integer>` | `Arrays.stream(a).boxed().toList()` |
| `List<Integer>` → `int[]` | `list.stream().mapToInt(Integer::intValue).toArray()` |
| 0..n-1 | `IntStream.range(0, n)` |
| count matches | `list.stream().filter(p).count()` |
| group by | `Collectors.groupingBy(fn)` |
| frequency map | `Collectors.groupingBy(fn, Collectors.counting())` |
| join strings | `Collectors.joining(", ")` |
| top-k | `.sorted(cmp).limit(k).toList()` |
