# Deque, Queue & PriorityQueue — the Java algorithm reference

**`ArrayDeque` is your stack *and* your queue.** One class, O(1) at both ends, no reason to use
anything else for either job.

```java
Deque<Integer> stack = new ArrayDeque<>();
Deque<Integer> queue = new ArrayDeque<>();
```

> 🔴 **Do not use `java.util.Stack`.** It extends `Vector`, so every method is `synchronized` (slow),
> and — worse — it iterates **bottom-to-top**, the opposite of pop order. It's a 1996 class kept for
> compatibility. Saying "I'd use `ArrayDeque`, `Stack` is legacy" is a free signal in an interview.

---

## As a stack (LIFO) — `push` / `pop` / `peek`

```java
Deque<Integer> st = new ArrayDeque<>();
st.push(1); st.push(2); st.push(3);
st;            // [3, 2, 1]   ← push = addFirst, so toString shows top-first
st.peek();     // 3           look, don't remove
st.pop();      // 3           remove
st.isEmpty();
```

All O(1). Note `push` inserts at the **front**, which is why the printed order looks reversed
relative to insertion — that's correct, and it's what you want.

## As a queue (FIFO) — `offer` / `poll` / `peek`

```java
Deque<Integer> q = new ArrayDeque<>();
q.offer(1); q.offer(2); q.offer(3);
q.poll();      // 1           removes from the FRONT
q.peek();      // 2
```

## ⚠️ Two method families that differ only in failure behaviour

| Job | Returns `null`/`false` | **Throws** |
|---|---|---|
| insert | `offer(e)` | `add(e)` |
| remove | `poll()` | `remove()` |
| inspect | `peek()` | `element()` |

Measured on an empty deque: `poll()` → `null`; `remove()` → `NoSuchElementException`.

**Use `offer`/`poll`/`peek`** in algorithms — a `null` you can test beats an exception you must catch.
And a BFS loop is naturally `while ((cur = q.poll()) != null)`.

> ⚠️ **`ArrayDeque` rejects `null`** (verified: `NullPointerException`), precisely because `null` is
> the "empty" signal from `poll`. If you need nullable elements, use a `LinkedList` as your `Deque`.

## Both ends explicitly

`addFirst` · `addLast` · `pollFirst` · `pollLast` · `peekFirst` · `peekLast` — use these when the
code is a genuine deque (monotonic-deque sliding window) and `push`/`offer` would obscure intent:

```java
// sliding-window maximum: values decreasing, indices in the window
while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();
dq.addLast(i);
if (dq.peekFirst() <= i - k) dq.pollFirst();
result[i - k + 1] = a[dq.peekFirst()];
```

---

## `PriorityQueue` — a real binary heap, built in

**Min-heap by default.** JS has nothing like this; in Java it's one line.

```java
PriorityQueue<Integer> min = new PriorityQueue<>();                        // smallest first
PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder()); // largest first
PriorityQueue<int[]> byCost = new PriorityQueue<>((a, b) -> a[1] - b[1]);   // Dijkstra
PriorityQueue<Node> byF = new PriorityQueue<>(Comparator.comparingInt(n -> n.f));
```

| Method | Cost |
|---|---|
| `offer(e)` / `add(e)` | **O(log n)** |
| `poll()` | **O(log n)** — removes the head |
| `peek()` | **O(1)** |
| `size()` / `isEmpty()` | O(1) |
| `remove(Object)` | **O(n)** — scans, then sifts |
| `new PriorityQueue<>(collection)` | **O(n)** — heapify, cheaper than n inserts |

### ⚠️ The trap: iteration order is not sorted

```java
PriorityQueue<Integer> pq = new PriorityQueue<>(List.of(5, 1, 4, 2, 3));
pq;                       // [1, 2, 4, 5, 3]   ← the raw heap ARRAY, not sorted
while (!pq.isEmpty()) pq.poll();   // 1 2 3 4 5   ← only polling is ordered
```

Verified above. `toString`, `for (x : pq)`, and `stream()` all walk the **backing array**, which is
only heap-ordered (parent ≤ children), not fully sorted. Only `peek`/`poll` respect priority. Printing
a `PriorityQueue` to debug it has misled a lot of people.

### Top-k with a bounded heap

```java
PriorityQueue<Integer> heap = new PriorityQueue<>();   // MIN-heap for the k LARGEST
for (int x : nums) { heap.offer(x); if (heap.size() > k) heap.poll(); }
return heap.peek();                                    // the k-th largest
```

O(n log k) time, O(k) space, works on a stream. The inversion trips people up: the root is whoever
gets **evicted next**, so for the k largest you keep a min-heap and discard the smallest.

> ⚠️ **`(a, b) -> a - b` overflows** on large values and flips the comparison. Use
> `Integer.compare(a, b)` or `Comparator.comparingInt(...)`.

---

## Cheat sheet

| Goal | Write |
|---|---|
| stack | `Deque<T> st = new ArrayDeque<>();` `push`/`pop`/`peek` |
| queue (BFS) | `Deque<T> q = new ArrayDeque<>();` `offer`/`poll` |
| deque (window max) | `addLast`/`pollLast`/`peekFirst` |
| min-heap | `new PriorityQueue<>()` |
| max-heap | `new PriorityQueue<>(Comparator.reverseOrder())` |
| heap of pairs by 2nd | `new PriorityQueue<int[]>(Comparator.comparingInt(x -> x[1]))` |
| k largest | min-heap capped at k |
| delete an arbitrary element in O(log n) | ❌ not a heap — use `TreeSet` |
