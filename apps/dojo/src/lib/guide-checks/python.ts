/**
 * Checks for content/supplements/python.md.
 * Behaviour checked in Python 3.14.4 on 3 Nov 2026 (int caching, `is` with literals); free-threading status from docs.python.org What's New in 3.14.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const pythonChecks: GuideCheckSet = {
  name: "Python guide",
  source: {
    label: "The Python Tutorial (docs.python.org)",
    href: "https://docs.python.org/3/tutorial/",
    note: "The official tutorial: chapters 3–5 (data structures), 8 (errors), 9 (classes, iterators, generators). Short, exact, and written by the people who build the language.",
  },
  terms: [
    "Dynamic typing",
    "Hashable",
    "Comprehension",
    "Generator",
    "EAFP",
    "Context manager",
    "Decorator",
    "GIL",
    "Late binding",
    "Shallow copy",
  ],
  checks: [
    {
      id: "basics",
      section: "Types, collections, slicing",
      questions: [
        {
          prompt: "What happens when Python runs `\"3\" + 5`?",
          options: [
            "\"35\", since the number becomes a string",
            "A TypeError, as Python is strongly typed",
            "8, since the string becomes a number",
            "None, since the bad expression is skipped",
          ],
          correct: 1,
          why: "Python is dynamically typed (types live on values, checked at runtime) but strongly typed: it won't silently coerce a str and an int. JavaScript would give \"35\"; Python refuses, and you convert explicitly with `int()` or `str()`.",
        },
        {
          prompt: "Why can a tuple be a dict key when a list can't?",
          options: [
            "A tuple is ordered, while lists are not",
            "A tuple takes less memory than a list",
            "A tuple can store only numbers and strings",
            "A tuple is immutable, and so it's hashable",
          ],
          correct: 3,
          why: "A dict key's hash must never change, so keys must be immutable. Lists are mutable, so unhashable; tuples are immutable, so `(x, y)` works as a key or set member. Both are ordered.",
        },
        {
          prompt: "What does `a[::-1]` give for `a = [0, 1, 2, 3]`?",
          options: [
            "A new list, in reversed order",
            "The final element on its own",
            "The same list, reversed in place",
            "An error: steps can't be negative",
          ],
          correct: 0,
          why: "`start:stop:step` with a step of -1 walks backwards over the whole sequence, and every slice returns a new copy; the original is untouched. It works on strings too: `\"hello\"[::-1]` is `\"olleh\"`.",
        },
      ],
      explain: "Pick list, tuple, set or dict for four needs (an ordered queue, a fixed (x, y) point, fast membership, a key-to-value lookup), and say which are mutable and which hashable.",
    },
    {
      id: "functions",
      section: "Comprehensions, truthiness, control flow, functions",
      questions: [
        {
          prompt: "`def add(item, bucket=[])` is called twice, with no bucket. What does the second call return?",
          options: [
            "Only the new item, because calls start fresh",
            "An error, because defaults can't be mutable lists",
            "Both items, because the default list is shared",
            "None: the default is reset after each call",
          ],
          correct: 2,
          why: "Defaults are evaluated once, when the function is defined, so every call without `bucket` shares one list that keeps growing. Use `bucket=None`, then `if bucket is None: bucket = []` inside.",
        },
        {
          prompt: "You need each item's index while looping. What's the Pythonic way?",
          options: [
            "for i in range(0, len(items))",
            "for i, item in items.index()",
            "for i, item in enumerate(items)",
            "for i, item in items.items()",
          ],
          correct: 2,
          why: "`enumerate` yields `(index, value)` pairs, so you never do index arithmetic by hand. `zip` is its partner for walking two lists in lockstep; `range(len(...))` works but reads like C, not Python.",
        },
      ],
      explain: "Explain what `*args` and `**kwargs` collect in a definition, and what the same stars do at a call site.",
    },
    {
      id: "iterators",
      section: "Iterators, generators, built-ins, classes",
      questions: [
        {
          prompt: "Why does `sum(evens(1_000_000))` use almost no memory when `evens` uses `yield`?",
          options: [
            "The generator makes each value only when asked",
            "Python compresses the list before summing it up",
            "sum reads the values straight from the disk",
            "Each element is freed right after being added",
          ],
          correct: 0,
          why: "A generator runs lazily: each `yield` hands over one value and pauses, so nothing like a million-element list is ever built. The catch: it's single-use, so once consumed it's empty.",
        },
        {
          prompt: "You need O(1) appends and pops at both ends of a sequence. Which type?",
          options: [
            "A list, the built-in sequence",
            "A Counter, the tally dictionary",
            "A tuple, the immutable sequence",
            "A deque, the double-ended queue",
          ],
          correct: 3,
          why: "A `deque` is O(1) at both ends; a `list` is O(1) at the end but O(n) at the front, because every element shifts. `Counter` tallies, and a tuple can't change at all.",
        },
        {
          prompt: "What does `@dataclass` write for you?",
          options: [
            "A database table, one column per field",
            "__init__, __repr__ and __eq__ from the fields",
            "Getters and setters for every single field",
            "Type checks that run on every assignment",
          ],
          correct: 1,
          why: "From the annotated fields it generates the constructor, a readable repr and value equality. `frozen=True` makes instances immutable and hashable. Type hints still aren't enforced at runtime.",
        },
      ],
      explain: "Explain why `@property` is the Pythonic answer to Java's `getArea()`, using the `Circle` example.",
    },
    {
      id: "errors",
      section: "Errors, context managers, decorators, modules",
      questions: [
        {
          prompt: "What does EAFP mean in Python?",
          options: [
            "Try the operation, then catch failures",
            "Check every condition first, then act",
            "Exit quickly whenever any input fails",
            "Assert types at each function boundary",
          ],
          correct: 0,
          why: "\"Easier to ask forgiveness than permission\": attempt it and catch the specific exception, rather than checking first (LBYL). It avoids a double lookup and check-then-use races. Catch specific exceptions; a bare `except:` swallows bugs and even Ctrl-C.",
        },
        {
          prompt: "Why write `with open(\"data.txt\") as f:` rather than calling `open` and `close` yourself?",
          options: [
            "The file opens faster inside a with block",
            "The file is read entirely into memory first",
            "The file closes even when an exception occurs",
            "The file is locked against all other programs",
          ],
          correct: 2,
          why: "A context manager guarantees cleanup on every exit path: normal end, `return`, or exception. The same pattern manages locks and transactions; you build your own with `__enter__`/`__exit__` or `@contextmanager`.",
        },
        {
          prompt: "Why does a decorator's wrapper take `*args, **kwargs`?",
          options: [
            "So Python can check the arguments' types at runtime",
            "So it forwards any signature to the wrapped function",
            "So the wrapped function keeps its original name intact",
            "So the decorator runs only once for each call",
          ],
          correct: 1,
          why: "Forwarding everything lets one decorator wrap any function. Keeping the original name and docstring is a different job: that's `@functools.wraps(func)`.",
        },
      ],
      explain: "Explain `if __name__ == \"__main__\":` and why every project gets its own virtual environment.",
    },
    {
      id: "gil",
      section: "Concurrency and the gotchas",
      questions: [
        {
          prompt: "A CPU-heavy job doesn't get faster with 8 threads. What do you use instead?",
          options: [
            "asyncio, so the event loop spreads work across cores",
            "More threads, since the GIL releases after a while",
            "A bigger thread pool, with priorities on each task",
            "multiprocessing, so that each process has its own GIL",
          ],
          correct: 3,
          why: "The GIL lets one thread run Python bytecode at a time, so threads don't speed up CPU-bound work. Separate processes each have their own interpreter and GIL: real parallelism. Threads and asyncio suit I/O-bound work, where waiting releases the GIL.",
        },
        {
          prompt: "What do the functions in `[lambda: i for i in range(3)]` return when called?",
          options: [
            "They return 0, 1 and 2, one each",
            "All of them return 2, the last value",
            "All of them return 0, the first value",
            "They raise an error, since i is gone",
          ],
          correct: 1,
          why: "Closures capture the variable, not its value at creation; by the time you call them, `i` is 2. Bind the current value with a default argument: `lambda i=i: i`.",
        },
        {
          prompt: "`b = a.copy()` on a list of lists, then `b[0].append(9)`. What happens to `a`?",
          options: [
            "Nothing: copy() clones every level of the list",
            "a gets an entirely new inner list appended",
            "An error, since copied lists can't be mutated",
            "a[0] changes too: the inner lists are shared",
          ],
          correct: 3,
          why: "`.copy()` and `a[:]` are shallow: a new outer list holding the same inner lists. Only `copy.deepcopy(a)` clones all the way down.",
        },
      ],
      explain: "Explain `is` versus `==`, and why `a = 1000; b = int(\"1000\"); a is b` is `False` while `a == b` is `True`.",
    },
  ],
};
