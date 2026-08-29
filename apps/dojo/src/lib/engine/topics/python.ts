/**
 * Topic: Python — the language's concepts, idioms, and famous gotchas as
 * spaced-repetition cards. Data structures, comprehensions, *args/**kwargs,
 * generators, the GIL & concurrency model, EAFP, copies, decorators, and the
 * traps (mutable defaults, is-vs-==, late-binding closures). Mixes concept
 * cards with a little output/idiom recall. Drills the Python supplement guide.
 */
import { choice, text } from "../helpers";
import type { Generator, Topic } from "../types";

const DOC = { slug: "python", label: "Dojo guide — Python" };

const mutableDefault: Generator = {
  id: "py-mutable-default",
  title: "The mutable default argument",
  generate: (rng) =>
    choice(rng, {
      genId: "py-mutable-default",
      prompt:
        "What's wrong with `def add(item, bucket=[]): bucket.append(item); return bucket`?",
      code: "def add(item, bucket=[]):\n    bucket.append(item)\n    return bucket\n\nprint(add(1))  # [1]\nprint(add(2))  # ??",
      codeLang: "python",
      correct:
        "The default `[]` is created ONCE at definition time and shared across calls, so it accumulates: the second call prints [1, 2]. Use `bucket=None` and set it inside.",
      wrong: [
        "Nothing — each call gets a fresh empty list, so it prints [2]",
        "It raises a TypeError because lists can't be default arguments",
        "The list is copied on every call, so mutations never persist",
      ],
      explanation:
        "Default argument values are evaluated ONCE, when the function is defined — not on each call. A mutable default (list/dict/set) is therefore shared by every call that doesn't pass its own, so it grows across calls (prints [1, 2]). The fix is the universal idiom: `def add(item, bucket=None): bucket = [] if bucket is None else bucket`. This is the single most famous Python gotcha.",
      docRef: DOC,
    }),
};

const isVsEquals: Generator = {
  id: "py-is-vs-eq",
  title: "is vs ==",
  generate: (rng) =>
    choice(rng, {
      genId: "py-is-vs-eq",
      prompt: "When should you use `is` instead of `==` in Python?",
      correct:
        "`is` tests IDENTITY (same object in memory); use it for `None`/`True`/`False` (`if x is None`). `==` tests VALUE equality — use it for everything else.",
      wrong: [
        "`is` and `==` are interchangeable; `is` is just faster",
        "Use `is` for numbers and strings, `==` for objects",
        "`is` compares values; `==` compares types",
      ],
      explanation:
        "`==` calls `__eq__` and compares values; `is` asks 'are these the exact same object?'. The right rule: `is`/`is not` ONLY for singletons — `if x is None`. Using `==` there works but is slower and overridable; using `is` on values is a bug waiting to happen: `1000 is 1000` can be `False` because CPython only caches small ints (-5..256), so `is` on numbers/strings is unreliable.",
      docRef: DOC,
    }),
};

const collections: Generator = {
  id: "py-collections",
  title: "list / tuple / set / dict",
  generate: (rng) => {
    const cases = [
      {
        need: "an ordered, changeable sequence you'll append to and index",
        answer: "list — ordered, mutable, indexed by position (`[1, 2, 3]`)",
        why: "Lists are the default sequence: ordered, mutable, O(1) index and append. Reach for one whenever order matters and the contents change.",
      },
      {
        need: "a fixed record of a few values that shouldn't change (and can be a dict key)",
        answer: "tuple — ordered, IMMUTABLE, hashable (`(x, y)`)",
        why: "Tuples are immutable, so they're hashable and can be dict keys or set members, and they signal 'this is a fixed record'. Coordinates, return-multiple-values, and dict keys are classic tuple uses.",
      },
      {
        need: "membership tests and de-duplication with no order",
        answer: "set — unordered, unique elements, O(1) `in` (`{1, 2, 3}`)",
        why: "Sets store unique elements and give O(1) membership (`x in s`) and fast union/intersection. Deduping a list is `set(items)`; checking 'have I seen this?' is a set.",
      },
      {
        need: "key → value lookup",
        answer: "dict — key→value mapping, O(1) lookup (`{\"a\": 1}`)",
        why: "Dicts map keys to values with O(1) average lookup/insert, and since 3.7 they preserve insertion order. The workhorse for lookups, counting, grouping, and JSON-shaped data.",
      },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "py-collections",
      prompt: `Which built-in collection fits: ${c.need}?`,
      correct: c.answer,
      wrong: [
        c.answer.startsWith("list")
          ? "tuple — immutable, so it can't be appended to"
          : "list — ordered and mutable, indexed by position",
        c.answer.startsWith("set")
          ? "dict — but you don't need the values, only the keys"
          : "set — unordered and holds only unique elements",
        "frozenset — an immutable set with no indexing",
      ],
      explanation:
        c.why +
        " Quick map: list = ordered+mutable, tuple = ordered+immutable(+hashable), set = unique+unordered+fast membership, dict = key→value.",
      docRef: DOC,
    });
  },
};

const truthiness: Generator = {
  id: "py-truthiness",
  title: "Falsy values",
  generate: (rng) =>
    choice(rng, {
      genId: "py-truthiness",
      prompt:
        "In `if not items:`, which of these makes the branch run (i.e. is falsy)?",
      correct:
        "An empty list `[]`, empty string `\"\"`, empty dict `{}`, `0`, and `None` are all falsy",
      wrong: [
        "Only `None` and `False` are falsy; empty containers are truthy",
        "Only `False` is falsy; everything else is truthy",
        "An empty list is truthy because the object exists",
      ],
      explanation:
        "Python treats 'empty' and 'zero' as falsy: `None`, `False`, `0`, `0.0`, `\"\"`, `[]`, `{}`, `()`, `set()` — plus any object whose `__bool__`/`__len__` says so. This is why `if not items:` is the idiomatic empty-check, cleaner than `if len(items) == 0`. Watch the trap: `if x:` treats `0` and `None` the same, so when 0 is a valid value use `if x is None:` explicitly.",
      docRef: DOC,
    }),
};

const argsKwargs: Generator = {
  id: "py-args-kwargs",
  title: "*args and **kwargs",
  generate: (rng) =>
    choice(rng, {
      genId: "py-args-kwargs",
      prompt: "In `def f(*args, **kwargs):`, what are `args` and `kwargs`?",
      correct:
        "`args` is a TUPLE of the extra positional arguments; `kwargs` is a DICT of the extra keyword arguments",
      wrong: [
        "Both are lists of every argument passed",
        "`args` is a dict and `kwargs` is a tuple",
        "They're special keywords, not real variables you can iterate",
      ],
      explanation:
        "`*args` collects leftover positional args into a tuple; `**kwargs` collects leftover keyword args into a dict. The names are convention — the `*`/`**` is what matters. The same operators UNPACK in a call: `f(*my_list, **my_dict)` spreads a list into positional args and a dict into keyword args. Great for wrappers/decorators that forward arbitrary arguments.",
      docRef: DOC,
    }),
};

const generators: Generator = {
  id: "py-generators",
  title: "Generators and yield",
  generate: (rng) =>
    choice(rng, {
      genId: "py-generators",
      prompt:
        "What's the key difference between a function that `return`s a list and one that `yield`s values?",
      code: "def squares(n):\n    for i in range(n):\n        yield i * i",
      codeLang: "python",
      correct:
        "`yield` makes a generator: values are produced LAZILY one at a time, so it uses O(1) memory and can even be infinite — nothing is computed until you iterate",
      wrong: [
        "`yield` is just a slower way to return a list; the result is identical",
        "A generator computes all values immediately, then hands them out one by one",
        "`yield` can only appear once per function",
      ],
      explanation:
        "A `yield` turns the function into a generator: calling it returns an iterator that runs the body lazily, pausing at each `yield` and resuming on the next `next()`. That means constant memory regardless of length (you never materialise the whole sequence), the ability to model infinite streams, and pipelines that process one item at a time. The cost: you can iterate it only once. A generator EXPRESSION `(x*x for x in it)` is the inline form.",
      docRef: DOC,
    }),
};

const gil: Generator = {
  id: "py-gil",
  title: "The GIL & concurrency",
  generate: (rng) => {
    const cases = [
      {
        work: "CPU-bound work (crunching numbers) you want to run in parallel across cores",
        answer: "multiprocessing — separate processes sidestep the GIL and use multiple cores",
        why: "The GIL lets only one thread execute Python bytecode at a time, so threads give NO speedup for CPU-bound work. Separate processes each have their own interpreter and GIL, so they truly parallelise across cores (at the cost of heavier memory + IPC).",
      },
      {
        work: "I/O-bound work (thousands of network/DB calls) you want to overlap",
        answer: "asyncio (or threads) — while one call waits on I/O, others proceed",
        why: "The GIL is released during I/O waits, so overlapping I/O doesn't need multiple cores — it needs concurrency. `asyncio` (one thread, an event loop) or a thread pool both let many in-flight requests wait together, which is the actual bottleneck.",
      },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "py-gil",
      prompt: `Given the GIL, what do you reach for to speed up: ${c.work}?`,
      correct: c.answer,
      wrong: [
        c.answer.startsWith("multiprocessing")
          ? "threading — Python threads run bytecode in parallel across cores"
          : "multiprocessing — spawn a process per request for maximum throughput",
        "Nothing — Python can't do concurrency because of the GIL",
        "Rewrite it in a single thread; concurrency never helps in Python",
      ],
      explanation:
        c.why +
        " The mental model: the GIL kills THREADED CPU parallelism, so CPU-bound → multiprocessing (or native/NumPy code that releases the GIL), I/O-bound → asyncio/threads. (CPython 3.13 ships an experimental no-GIL build, but this is still the practical reality.)",
      docRef: DOC,
    });
  },
};

const eafp: Generator = {
  id: "py-eafp",
  title: "EAFP vs LBYL",
  generate: (rng) =>
    choice(rng, {
      genId: "py-eafp",
      prompt:
        "Python style prefers EAFP ('easier to ask forgiveness than permission'). What does that look like?",
      correct:
        "Attempt the operation and handle the exception if it fails — `try: value = d[key] except KeyError: …` — rather than checking `if key in d` first",
      wrong: [
        "Check every precondition with `if` before acting, to avoid all exceptions",
        "Never use try/except; validate all input up front instead",
        "Wrap the whole program in one big try/except",
      ],
      explanation:
        "EAFP means you just do the thing and catch the failure, which is often faster (no double lookup) and avoids race conditions between the check and the use. LBYL ('look before you leap') checks first (`if key in d`). Python leans EAFP — exceptions are cheap and idiomatic here — but keep the `try` block small and catch a SPECIFIC exception (`KeyError`), never a bare `except:`.",
      docRef: DOC,
    }),
};

const copies: Generator = {
  id: "py-copy",
  title: "Shallow vs deep copy",
  generate: (rng) =>
    choice(rng, {
      genId: "py-copy",
      prompt:
        "You do `b = a` where `a` is a list of lists, then mutate `b[0]`. What happens to `a`, and how do you avoid it?",
      correct:
        "`b = a` binds the SAME list, so `a` changes too. `b = a.copy()` (or `a[:]`) copies the outer list but shares the inner lists; only `copy.deepcopy(a)` copies all the way down",
      wrong: [
        "`b = a` always makes an independent copy, so `a` is unaffected",
        "`a.copy()` fully clones nested lists too, so it's always enough",
        "Lists can't be copied; you must rebuild them element by element",
      ],
      explanation:
        "Assignment binds a NAME to an object; `b = a` makes two names for one list, so mutations show through both. `a.copy()`/`a[:]`/`list(a)` are SHALLOW — a new outer list holding the same inner objects, so `b[0].append(...)` still hits `a`. `copy.deepcopy(a)` recursively clones everything. Know which you need: shallow is cheap and usually right for flat data; deep for nested structures you must fully isolate.",
      docRef: DOC,
    }),
};

const decorators: Generator = {
  id: "py-decorators",
  title: "Decorators",
  generate: (rng) =>
    choice(rng, {
      genId: "py-decorators",
      prompt: "What does a decorator like `@timer` above a function do?",
      code: "@timer\ndef work():\n    ...",
      codeLang: "python",
      correct:
        "It's syntactic sugar for `work = timer(work)`: `timer` takes the function, wraps it, and returns a new function — used to add cross-cutting behaviour (timing, caching, auth) without touching the body",
      wrong: [
        "It runs `timer()` once at import and discards the result",
        "It renames the function to `timer`",
        "It's a type annotation declaring the function's return type",
      ],
      explanation:
        "`@timer` is exactly `work = timer(work)`. A decorator is a function (or class) that takes a callable and returns a replacement, typically an inner wrapper that calls the original with `*args, **kwargs` and adds behaviour around it. It's how Python does cross-cutting concerns — `@lru_cache`, `@property`, framework routes (`@app.get(...)`). Use `functools.wraps` on the wrapper to preserve the original's name/docstring.",
      docRef: DOC,
    }),
};

const lateBinding: Generator = {
  id: "py-late-binding",
  title: "Late-binding closures",
  generate: (rng) =>
    choice(rng, {
      genId: "py-late-binding",
      prompt:
        "Why do all functions in `fns = [lambda: i for i in range(3)]` return 2 when called?",
      code: "fns = [lambda: i for i in range(3)]\nprint([f() for f in fns])  # [2, 2, 2]",
      codeLang: "python",
      correct:
        "Closures capture the VARIABLE `i`, not its value at creation time; by the time they run, the loop has finished and `i` is 2. Fix with a default arg: `lambda i=i: i`",
      wrong: [
        "Because lambdas can't be stored in a list",
        "Because `range(3)` is `[0, 1, 2]` and the last one wins for all",
        "Because each lambda copies `i`, but copying is buggy",
      ],
      explanation:
        "Python closures are late-binding: they look up the free variable's CURRENT value when called, not when defined. All three lambdas share the same `i`, which is 2 after the loop, so all print 2. Capture the value at definition time with a default argument (`lambda i=i: i`, evaluated once per iteration) — the same 'defaults evaluate now' behaviour that bites you with mutable defaults, here working for you.",
      docRef: DOC,
    }),
};

const dictHelpers: Generator = {
  id: "py-dict-helpers",
  title: "dict.get / defaultdict / Counter",
  generate: (rng) => {
    const cases = [
      {
        need: "read a key that might be missing, with a fallback, without a KeyError",
        answer: "`d.get(key, default)` — returns default if the key is absent",
        why: "`d.get(key)` returns `None` (or a given default) instead of raising, so it's the clean way to read possibly-missing keys. `d[key]` raises `KeyError`.",
      },
      {
        need: "group items into lists by a key, appending as you go",
        answer: "`collections.defaultdict(list)` — a missing key auto-creates an empty list",
        why: "`defaultdict(list)` calls the factory for any missing key, so `d[k].append(x)` just works without initialising `d[k] = []` first. Use `defaultdict(int)` for counting from zero.",
      },
      {
        need: "count how many times each element appears",
        answer: "`collections.Counter(items)` — a dict subclass that tallies occurrences",
        why: "`Counter(items)` returns element→count in one call, plus `.most_common(k)` for the top-k. It's the idiomatic tally, far cleaner than a hand-rolled loop.",
      },
    ] as const;
    const c = rng.pick(cases);
    return choice(rng, {
      genId: "py-dict-helpers",
      prompt: `Most idiomatic tool to ${c.need}?`,
      correct: c.answer,
      wrong: [
        "A plain `dict` with a manual `if key not in d:` guard every time",
        c.answer.includes("Counter")
          ? "`d.setdefault(k, 0)` incremented in a loop"
          : "`sorted(d.items())` and scan for the key",
        "`list(d.keys())` then a linear search",
      ],
      explanation:
        c.why +
        " These three from `collections`/dict methods remove the most common boilerplate around missing keys — reach for them before hand-rolling a guard.",
      docRef: DOC,
    });
  },
};

const sliceReverse: Generator = {
  id: "py-slice-reverse",
  title: "Reverse with slicing",
  generate: () =>
    text({
      genId: "py-slice-reverse",
      prompt:
        "Using slice syntax only (no function call), write the expression that reverses the list `a`.",
      answers: ["a[::-1]"],
      placeholder: "a[…]",
      explanation:
        "`a[::-1]` slices from end to start with step -1, returning a reversed COPY (leaving `a` untouched) — works on strings and tuples too. The full slice grammar is `a[start:stop:step]`; omit any part for its default. Contrast `a.reverse()` (mutates in place, returns None) and `reversed(a)` (a lazy iterator).",
      docRef: DOC,
    }),
};

const comprehensionOutput: Generator = {
  id: "py-comprehension",
  title: "Comprehension output",
  generate: () =>
    text({
      genId: "py-comprehension",
      prompt:
        "What list does `[x * 2 for x in range(4) if x % 2 == 0]` produce? Write it out, e.g. [0, 2].",
      answers: ["[0, 4]", "[0,4]"],
      placeholder: "[…]",
      explanation:
        "`range(4)` is 0,1,2,3; the `if x % 2 == 0` keeps the evens 0 and 2; `x * 2` maps them to 0 and 4 → `[0, 4]`. A comprehension is `[expr for item in iterable if condition]` — the filter comes after the loop, the transform before it. It's the Pythonic replacement for `map`/`filter` + an accumulator loop, and reads left-to-right as 'the doubled x, for each x in range, where x is even'.",
      docRef: DOC,
    }),
};

const dataclass: Generator = {
  id: "py-dataclass",
  title: "dataclass and @property",
  generate: (rng) =>
    choice(rng, {
      genId: "py-dataclass",
      prompt: "What does the `@dataclass` decorator give you?",
      code: "from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int",
      codeLang: "python",
      correct:
        "It auto-generates `__init__`, `__repr__`, and `__eq__` from the annotated fields, so you skip the boilerplate of a plain class",
      wrong: [
        "It makes the class immutable and its fields read-only by default",
        "It turns the class into a dictionary",
        "It only adds type checking; you still write `__init__` yourself",
      ],
      explanation:
        "`@dataclass` reads the field annotations and writes the tedious dunder methods for you — `__init__(self, x, y)`, a readable `__repr__` (`Point(x=1, y=2)`), and value-based `__eq__`. Options add more: `frozen=True` makes instances immutable and hashable, `order=True` adds comparison. For a class that's mostly a bundle of typed data, it replaces ~15 lines with a decorator. (`@property`, separately, exposes a method as a read-only attribute.)",
      docRef: DOC,
    }),
};

const typeHints: Generator = {
  id: "py-type-hints",
  title: "Type hints",
  generate: (rng) =>
    choice(rng, {
      genId: "py-type-hints",
      prompt:
        "In `def greet(name: str) -> str:`, what do the annotations actually do at runtime?",
      correct:
        "Nothing at runtime — Python does NOT enforce them; they're for readers, editors, and static checkers like mypy. Wrong types still run",
      wrong: [
        "Python raises a TypeError if you pass the wrong type",
        "They make the function run faster by skipping type checks",
        "They convert the argument to the annotated type automatically",
      ],
      explanation:
        "Type hints are optional metadata — Python is dynamically typed and ignores them when running (`greet(123)` won't raise). Their value is tooling: editor autocomplete, catching bugs via a separate `mypy`/`pyright` run in CI, and documentation that can't drift silently. Modern syntax: `list[int]`, `dict[str, int]`, `int | None` (or `Optional[int]`) for a value that may be missing.",
      docRef: DOC,
    }),
};

export const pythonTopic: Topic = {
  id: "python",
  title: "Python",
  icon: "🐍",
  blurb:
    "The language and its idioms: data structures, comprehensions, *args/**kwargs, generators, the GIL & concurrency, EAFP, copies, decorators — plus the famous traps (mutable defaults, is vs ==, late-binding closures).",
  docSlug: "python",
  docTitle: "Python — fundamentals",
  generators: [
    mutableDefault,
    isVsEquals,
    collections,
    truthiness,
    argsKwargs,
    generators,
    gil,
    eafp,
    copies,
    decorators,
    lateBinding,
    dictHelpers,
    sliceReverse,
    comprehensionOutput,
    dataclass,
    typeHints,
  ],
};
