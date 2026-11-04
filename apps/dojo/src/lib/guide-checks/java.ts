/**
 * Checks for content/reference/java/README.md.
 * Each trap re-run on JDK 25 (eclipse-temurin:25-jdk-alpine) on 3 Nov 2026: Integer cache, remove(int), Arrays.asList, comparator overflow, ArrayDeque null, PriorityQueue order, binarySearch.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const javaReferenceChecks: GuideCheckSet = {
  name: "Java methods reference",
  source: {
    label: "Java SE 25 API: package java.util",
    href: "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/package-summary.html",
    note: "The official contracts for every collection on these sheets: ArrayList, HashMap, TreeMap, ArrayDeque, PriorityQueue, Arrays, Collections. When a sheet says \"unspecified\", this is where the word comes from.",
  },
  terms: [
    "Autoboxing",
    "Integer cache",
    "Unmodifiable view",
    "Comparator overflow",
    "Insertion point",
    "Binary heap",
    "StringBuilder",
  ],
  checks: [
    {
      id: "traps",
      section: "The sheets' traps: lists, maps, heaps, numbers, strings",
      questions: [
        {
          prompt: "`Integer a = 128, b = 128;` What does `a == b` print?",
          options: [
            "true: both boxes hold the same value",
            "false: only -128 to 127 are cached",
            "true: the compiler unboxes both of them",
            "false: two Integers can never be equal",
          ],
          correct: 1,
          why: "`==` compares references, and autoboxing reuses cached objects only from -128 to 127. At 127 the same test prints true, so the bug hides in small tests. Compare boxed numbers with `.equals()` or unbox them.",
        },
        {
          prompt: "`list` is `[10, 20, 30]` as a `List<Integer>`. What is it after `list.remove(1)`?",
          options: [
            "[20, 30]: it removes the first value, the 10",
            "[10, 20, 30]: no item holds the value 1",
            "[10, 20]: it removes the element at the end",
            "[10, 30]: it removes the item at index 1",
          ],
          correct: 3,
          why: "An `int` argument picks the `remove(int index)` overload. To remove by value, pass an object: `list.remove(Integer.valueOf(10))` gives `[20, 30]`.",
        },
        {
          prompt: "Why is `(a, b) -> a - b` a risky comparator?",
          options: [
            "Subtraction can overflow and flip the sign",
            "Lambdas can't be passed as a comparator",
            "It sorts in descending order, not ascending",
            "It's slower than writing an anonymous class",
          ],
          correct: 0,
          why: "`Integer.MIN_VALUE - 1` wraps to `2147483647`, so a tiny value compares as huge. Use `Integer.compare(a, b)` or `Comparator.comparingInt(...)`, which never overflow.",
        },
        {
          prompt: "You print a `PriorityQueue` built from `5, 1, 4, 2, 3`. What do you see?",
          options: [
            "[1, 2, 3, 4, 5]: it's always kept sorted",
            "[5, 1, 4, 2, 3]: the order they're added",
            "[1, 2, 4, 5, 3]: heap order, not sorted",
            "[5, 4, 3, 2, 1]: largest first, by default",
          ],
          correct: 2,
          why: "A `PriorityQueue` is a binary heap: only the head is guaranteed smallest, and iteration or `toString` shows the array as stored. To get sorted output, `poll()` until it's empty.",
        },
      ],
      explain: "Explain why `s += x` in a loop is quadratic in Java but not in V8, and what you'd use in Java instead.",
    },
  ],
};
