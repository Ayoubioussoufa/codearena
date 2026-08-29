/**
 * Coding track: Python — from f-strings and comprehensions up through
 * generators, *args, dataclasses, @property, decorators, EAFP error handling,
 * and the walrus operator. Structure-checked against the shape of idiomatic
 * Python (the dojo can't run a Python interpreter in the browser), so the
 * checks pin down the syntax and the Pythonic idiom. Drills the Python guide.
 */
import { codeTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingTrack } from "../coding";

const DOC = { slug: "python", label: "Dojo guide — Python" };

/* ── Level 1 — syntax & the first idioms ── */

const fstring: Generator = {
  id: "py-fstring",
  title: "f-strings",
  generate: () =>
    codeTask({
      genId: "py-fstring",
      prompt:
        "Context: an f-string (`f\"...\"`) drops expressions inline with `{ }` — the readable way to build strings, no `+` gluing or `.format()`.\n\nTask: write `greet(name)` returning exactly `Hello, <name>!` using an f-string.",
      language: "python",
      starter: "def greet(name):\n    # return an f-string: Hello, <name>!\n    pass",
      solution: 'def greet(name):\n    return f"Hello, {name}!"',
      checks: [
        { re: "def\\s+greet\\s*\\(\\s*name\\s*\\)", label: "defines `greet(name)`" },
        { re: "f[\"']", label: "uses an f-string (`f\"...\"`)" },
        { re: "\\{\\s*name\\s*\\}", label: "interpolates `{name}`" },
        { re: "return", label: "returns the string" },
      ],
      hint: "Prefix the string with `f` and put the variable in braces: `f\"Hello, {name}!\"`. Anything inside `{ }` is evaluated — `{name.upper()}`, `{a + b}`, even a ternary.",
      explanation:
        "f-strings (Python 3.6+) evaluate any expression inside `{ }` and drop the result in — far clearer than `\"Hello, \" + name + \"!\"` or `.format()`. Handy extras: `{value:.2f}` formats to 2 decimals, and `{x=}` (3.8+) prints `x=<value>` for quick debugging. The `f` is what activates it — a plain `\"...{name}...\"` prints the braces literally.",
      docRef: DOC,
    }),
};

const listComp: Generator = {
  id: "py-list-comp",
  title: "List comprehension",
  generate: () =>
    codeTask({
      genId: "py-list-comp",
      prompt:
        "Context: a list comprehension `[expr for item in iterable]` builds a list in one readable line — the Pythonic replacement for a `map`/loop-and-append.\n\nTask: write `squares(n)` returning a list of `i * i` for each `i` in `range(n)`. Use a comprehension, not an accumulator loop.",
      language: "python",
      starter: "def squares(n):\n    # return a list of each number from 0 to n minus 1, squared\n    pass",
      solution: "def squares(n):\n    return [i * i for i in range(n)]",
      checks: [
        { re: "def\\s+squares\\s*\\(\\s*n\\s*\\)", label: "defines `squares(n)`" },
        { re: "\\[[\\s\\S]*for\\s+\\w+\\s+in\\s+range\\(\\s*n\\s*\\)", label: "uses a `[... for ... in range(n)]` comprehension" },
        { re: "\\w\\s*\\*\\s*\\w", label: "squares each value (`i * i`)" },
      ],
      hint: "The shape is `[<transform> for <var> in <iterable>]`. Here: `[i * i for i in range(n)]`. The transform comes BEFORE the `for`.",
      explanation:
        "A comprehension reads left-to-right as 'i*i, for each i in range(n)' and is both faster and clearer than `result = []; for i in range(n): result.append(i*i)`. You can add a filter (`[i*i for i in range(n) if i % 2 == 0]`) and the same syntax builds dicts (`{}`), sets (`{}`), and lazy generators (`()`).",
      docRef: DOC,
    }),
};

/* ── Level 2 — comprehensions, slicing, and the mutable-default trap ── */

const dictComp: Generator = {
  id: "py-dict-comp",
  title: "Dict comprehension",
  generate: () =>
    codeTask({
      genId: "py-dict-comp",
      prompt:
        "Context: the same comprehension syntax with `{key: value ...}` builds a dict in one line.\n\nTask: write `lengths(words)` returning a dict mapping each word to its length (`len`). Use a dict comprehension.",
      language: "python",
      starter: "def lengths(words):\n    # return a dict mapping each word to its length\n    pass",
      solution: "def lengths(words):\n    return {w: len(w) for w in words}",
      checks: [
        { re: "def\\s+lengths\\s*\\(\\s*words\\s*\\)", label: "defines `lengths(words)`" },
        { re: "\\{\\s*\\w+\\s*:", label: "opens a dict comprehension (`{key: ...}`)" },
        { re: "len\\s*\\(", label: "maps to `len(w)`" },
        { re: "for\\s+\\w+\\s+in\\s+words", label: "iterates `for w in words`" },
      ],
      hint: "`{w: len(w) for w in words}` — the `key: value` pair before the `for` is what makes it a dict rather than a set comprehension.",
      explanation:
        "`{w: len(w) for w in words}` builds the whole mapping in one pass. The `key: value` colon is the only thing distinguishing a dict comprehension from a set comprehension (`{w for w in words}`). Add `if` to filter keys. It's the idiomatic way to transform or index a collection into a lookup.",
      docRef: DOC,
    }),
};

const slicing: Generator = {
  id: "py-slicing",
  title: "Slicing with a step",
  generate: () =>
    codeTask({
      genId: "py-slicing",
      prompt:
        "Context: slice syntax is `seq[start:stop:step]`; omit parts for their defaults, and a negative step walks backwards.\n\nTask: write `every_other(a)` returning every SECOND element of list `a`, starting from the first (indices 0, 2, 4, …). Use a slice, no loop.",
      language: "python",
      starter: "def every_other(a):\n    # return a slice taking every second element\n    pass",
      solution: "def every_other(a):\n    return a[::2]",
      checks: [
        { re: "def\\s+every_other\\s*\\(\\s*a\\s*\\)", label: "defines `every_other(a)`" },
        { re: "a\\[\\s*::\\s*2\\s*\\]", label: "slices with step 2 (`a[::2]`)" },
      ],
      hint: "Leave start and stop empty and set the step to 2: `a[::2]`. (`a[::-1]` would reverse; `a[1::2]` would start at the second element.)",
      explanation:
        "`a[::2]` reads 'from start to end, step 2' → indices 0, 2, 4, …. Slicing returns a new COPY and works on strings and tuples too. The full grammar `a[start:stop:step]` powers a lot of idioms: `a[::-1]` reverses, `a[-3:]` takes the last three, `a[:n]` the first n — all without a loop.",
      docRef: DOC,
    }),
};

const safeDefault: Generator = {
  id: "py-safe-default",
  title: "Avoid the mutable default",
  generate: () =>
    codeTask({
      genId: "py-safe-default",
      prompt:
        "Context: a default like `bucket=[]` is created ONCE at definition and shared across every call that omits it, so it accumulates between calls — the classic Python bug.\n\nTask: write `append_to(item, bucket)` that appends `item` to `bucket` and returns it, giving `bucket` a default of a FRESH empty list on each call — WITHOUT putting a mutable default in the signature (that's the trap to avoid).",
      language: "python",
      starter: "def append_to(item, bucket=[]):  # <- buggy default; fix it\n    bucket.append(item)\n    return bucket",
      solution:
        "def append_to(item, bucket=None):\n    if bucket is None:\n        bucket = []\n    bucket.append(item)\n    return bucket",
      checks: [
        { re: "def\\s+append_to\\s*\\([^)]*bucket\\s*=\\s*None", label: "default is `bucket=None`" },
        { re: "def\\s+append_to\\s*\\([^)]*=\\s*\\[\\s*\\]", expect: false, label: "no mutable `[]` default in the signature" },
        { re: "bucket\\s+is\\s+None", label: "checks `if bucket is None`" },
        { re: "\\.append\\s*\\(\\s*item\\s*\\)", label: "appends the item" },
      ],
      hint: "Signature: `def append_to(item, bucket=None):`. Then `if bucket is None: bucket = []` before appending. That gives every call its own list.",
      explanation:
        "Because defaults evaluate once at definition, `bucket=[]` is a single list reused by every call that omits it, so it grows: `append_to(1)` → [1], `append_to(2)` → [1, 2]. Sentinel `None` + `if bucket is None: bucket = []` creates a new list per call. Use `is None` (identity), not `== None`. Same trap applies to `{}` and any mutable default.",
      docRef: DOC,
    }),
};

/* ── Level 3 — *args, generators, the collections toolbox ── */

const argsSum: Generator = {
  id: "py-args-sum",
  title: "*args — variadic functions",
  generate: () =>
    codeTask({
      genId: "py-args-sum",
      prompt:
        "Context: `*args` collects any number of positional arguments into a tuple, so one function handles `total(1, 2)` and `total(1, 2, 3, 4)`.\n\nTask: write `total(*args)` returning the sum of all the arguments passed. `total()` with no args should return 0.",
      language: "python",
      starter: "def total(*args):\n    # sum whatever positional arguments arrive\n    pass",
      solution: "def total(*args):\n    return sum(args)",
      checks: [
        { re: "def\\s+total\\s*\\(\\s*\\*args\\s*\\)", label: "signature is `total(*args)`" },
        { re: "sum\\s*\\(\\s*args\\s*\\)", label: "returns `sum(args)`" },
      ],
      hint: "`def total(*args): return sum(args)`. Inside the function `args` is a plain tuple, and `sum(())` of an empty tuple is 0 — so the no-argument case is free.",
      explanation:
        "`*args` gathers extra positional args into a tuple you can iterate or `sum`. Its partner `**kwargs` gathers extra keyword args into a dict. The same `*`/`**` operators UNPACK when calling: `total(*[1, 2, 3])` spreads the list into three arguments. This is the backbone of wrappers and decorators that forward arbitrary arguments with `func(*args, **kwargs)`.",
      docRef: DOC,
    }),
};

const generatorFn: Generator = {
  id: "py-generator",
  title: "A generator with yield",
  generate: () =>
    codeTask({
      genId: "py-generator",
      prompt:
        "Context: a function with `yield` is a generator — it produces values LAZILY, one per `next()`, using O(1) memory instead of building a whole list.\n\nTask: write `evens(n)` that YIELDS the even numbers in `range(n)` (0, 2, 4, …). Use `yield`, don't build and return a list.",
      language: "python",
      starter: "def evens(n):\n    # yield each even number below n\n    pass",
      solution: "def evens(n):\n    for i in range(n):\n        if i % 2 == 0:\n            yield i",
      checks: [
        { re: "def\\s+evens\\s*\\(\\s*n\\s*\\)", label: "defines `evens(n)`" },
        { re: "yield\\b", label: "uses `yield` (makes it a generator)" },
        { re: "range\\s*\\(\\s*n\\s*\\)", label: "iterates `range(n)`" },
        { re: "return\\s*\\[", expect: false, label: "does NOT build and return a list" },
      ],
      hint: "Loop `for i in range(n)`, and `yield i` when `i % 2 == 0`. No `return` of a list — the `yield` is what makes each value stream out lazily.",
      explanation:
        "Calling `evens(n)` returns a generator that computes nothing until you iterate it, pausing at each `yield` and resuming on the next request. That means constant memory no matter how large `n` is, and the ability to model infinite or piped streams. The trade-off: a generator is single-use (exhausted once consumed). The inline form is a generator expression: `(i for i in range(n) if i % 2 == 0)`.",
      docRef: DOC,
    }),
};

const counter: Generator = {
  id: "py-counter",
  title: "Counting with Counter",
  generate: () =>
    codeTask({
      genId: "py-counter",
      prompt:
        "Context: `collections.Counter` tallies occurrences in one call — the idiomatic replacement for a hand-rolled count loop.\n\nTask: write `word_counts(words)` returning a `Counter` mapping each word to how many times it appears in the list `words`.",
      language: "python",
      starter: "# import Counter, then count the words\n\ndef word_counts(words):\n    pass",
      solution:
        "from collections import Counter\n\n\ndef word_counts(words):\n    return Counter(words)",
      checks: [
        { re: "from\\s+collections\\s+import\\s+Counter", label: "imports `Counter` from `collections`" },
        { re: "def\\s+word_counts\\s*\\(\\s*words\\s*\\)", label: "defines `word_counts(words)`" },
        { re: "Counter\\s*\\(\\s*words\\s*\\)", label: "returns `Counter(words)`" },
      ],
      hint: "`from collections import Counter`, then `return Counter(words)`. Passing an iterable to `Counter` tallies it automatically.",
      explanation:
        "`Counter(words)` returns a dict subclass of word→count in one line, plus `.most_common(k)` for the top-k — far cleaner than `counts = {}; for w in words: counts[w] = counts.get(w, 0) + 1`. It lives in `collections` alongside the other must-knows: `defaultdict` (auto-creates missing values, e.g. `defaultdict(list)` for grouping) and `deque` (O(1) appends/pops at both ends).",
      docRef: DOC,
    }),
};

/* ── Level 4 — classes, resources, decorators ── */

const dataclass: Generator = {
  id: "py-dataclass",
  title: "A dataclass",
  generate: () =>
    codeTask({
      genId: "py-dataclass",
      prompt:
        "Context: `@dataclass` reads annotated fields and auto-generates `__init__`, `__repr__`, and `__eq__` — no boilerplate.\n\nTask: define a `Point` dataclass with two integer fields, `x` and `y`. Use the `@dataclass` decorator and type annotations.",
      language: "python",
      starter: "# import and use @dataclass to define Point with x: int, y: int\n",
      solution:
        "from dataclasses import dataclass\n\n\n@dataclass\nclass Point:\n    x: int\n    y: int",
      checks: [
        { re: "from\\s+dataclasses\\s+import\\s+dataclass", label: "imports `dataclass`" },
        { re: "@dataclass", label: "applies the `@dataclass` decorator" },
        { re: "class\\s+Point", label: "defines `class Point`" },
        { re: "x\\s*:\\s*int", label: "field `x: int`" },
        { re: "y\\s*:\\s*int", label: "field `y: int`" },
      ],
      hint: "`from dataclasses import dataclass`, then `@dataclass` above `class Point:`, with `x: int` and `y: int` as the fields (no `__init__` needed).",
      explanation:
        "`@dataclass` writes the tedious methods from your field annotations: `__init__(self, x, y)`, a readable `__repr__` (`Point(x=1, y=2)`), and value-based `__eq__` (`Point(1,2) == Point(1,2)`). Options extend it: `frozen=True` makes instances immutable and hashable; `order=True` adds `<`/`>`; `field(default_factory=list)` safely defaults a mutable field. It replaces ~15 lines of a plain class for anything that's mostly typed data.",
      docRef: DOC,
    }),
};

const property: Generator = {
  id: "py-property",
  title: "@property — a computed attribute",
  generate: () =>
    codeTask({
      genId: "py-property",
      prompt:
        "Context: `@property` exposes a method as a read-only attribute — callers write `c.area`, not `c.area()`, so a computed value looks like a plain field.\n\nTask: write a `Circle` class taking `radius` in `__init__`, with an `area` PROPERTY returning `3.14159 * radius ** 2`.",
      language: "python",
      starter:
        "class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    # add an `area` property\n",
      solution:
        "class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    @property\n    def area(self):\n        return 3.14159 * self.radius ** 2",
      checks: [
        { re: "class\\s+Circle", label: "defines `class Circle`" },
        { re: "@property", label: "decorates the method with `@property`" },
        { re: "def\\s+area\\s*\\(\\s*self\\s*\\)", label: "`area(self)` method" },
        { re: "self\\.radius\\s*\\*\\*\\s*2", label: "computes `self.radius ** 2`" },
      ],
      hint: "Put `@property` above `def area(self):` and `return 3.14159 * self.radius ** 2`. Then `Circle(2).area` (no parentheses) gives the value.",
      explanation:
        "`@property` turns a method into a managed attribute: `c.area` runs the method and returns its value, so a derived value has the same clean access as a stored one — and you can later add validation or a matching `@area.setter` without changing callers. `**` is Python's exponent operator (`radius ** 2`). This is the Pythonic alternative to Java-style `getArea()` getters.",
      docRef: DOC,
    }),
};

const contextManager: Generator = {
  id: "py-context-manager",
  title: "with — context managers",
  generate: () =>
    codeTask({
      genId: "py-context-manager",
      prompt:
        "Context: a `with` block guarantees cleanup — `with open(path) as f:` closes the file automatically, even if an exception is raised inside.\n\nTask: write `read_first_line(path)` that opens `path`, returns its first line via `readline()`, using a `with` statement so the file is always closed.",
      language: "python",
      starter: "def read_first_line(path):\n    # open path with a `with` block and return the first line\n    pass",
      solution:
        "def read_first_line(path):\n    with open(path) as f:\n        return f.readline()",
      checks: [
        { re: "def\\s+read_first_line\\s*\\(\\s*path\\s*\\)", label: "defines `read_first_line(path)`" },
        { re: "with\\s+open\\s*\\(", label: "uses `with open(...)`" },
        { re: "\\bas\\s+\\w+\\s*:", label: "binds the file with `as f:`" },
        { re: "\\.readline\\s*\\(", label: "returns `f.readline()`" },
      ],
      hint: "`with open(path) as f:` then `return f.readline()`. The `with` block closes the file for you when it exits — no explicit `f.close()`.",
      explanation:
        "A `with` statement uses a context manager: `open` returns one whose exit closes the file no matter how the block ends (return, exception, or normally). This is why `with open(...)` is always preferred over a bare `open` + manual `close`, which leaks the handle if anything throws in between. The same pattern manages locks, DB transactions, and temp resources; you can build your own with `__enter__`/`__exit__` or `@contextmanager`.",
      docRef: DOC,
    }),
};

const decorator: Generator = {
  id: "py-decorator",
  title: "Write a decorator",
  generate: () =>
    codeTask({
      genId: "py-decorator",
      prompt:
        "Context: a decorator is a function that takes a function and returns a REPLACEMENT — the mechanism behind `@lru_cache`, `@property`, and framework routes.\n\nTask: write a decorator `logged(func)` that returns a `wrapper` which forwards all arguments (`*args, **kwargs`) to `func`, returns its result, and works on any function.",
      language: "python",
      starter:
        "def logged(func):\n    # return a wrapper that forwards *args/**kwargs to func and returns its result\n    pass",
      solution:
        "import functools\n\n\ndef logged(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        result = func(*args, **kwargs)\n        return result\n    return wrapper",
      checks: [
        { re: "def\\s+logged\\s*\\(\\s*func\\s*\\)", label: "`logged(func)` takes the function" },
        { re: "def\\s+wrapper\\s*\\(\\s*\\*args\\s*,\\s*\\*\\*kwargs\\s*\\)", label: "inner `wrapper(*args, **kwargs)`" },
        { re: "func\\s*\\(\\s*\\*args\\s*,\\s*\\*\\*kwargs\\s*\\)", label: "calls `func(*args, **kwargs)`" },
        { re: "return\\s+wrapper", label: "returns the `wrapper` function" },
      ],
      hint: "Define `wrapper(*args, **kwargs)` inside `logged`, have it `return func(*args, **kwargs)`, and `return wrapper` (the function itself, not `wrapper()`). Wrap it with `@functools.wraps(func)` to keep func's name/docstring.",
      explanation:
        "`@logged` above a function is exactly `func = logged(func)`: `logged` receives the function and returns `wrapper`, which stands in for it. Forwarding `*args, **kwargs` lets one decorator wrap ANY signature. `functools.wraps(func)` copies over the original's `__name__`/`__doc__` so debugging and introspection aren't broken. Add behaviour (timing, caching, auth, logging) before/after the `func(...)` call — that's cross-cutting concerns without editing the function.",
      docRef: DOC,
    }),
};

/* ── Level 5 — the idioms that mark fluency ── */

const eafp: Generator = {
  id: "py-eafp",
  title: "EAFP error handling",
  generate: () =>
    codeTask({
      genId: "py-eafp",
      prompt:
        "Context: Python prefers EAFP — attempt the operation and catch the failure — over checking first. Catch a SPECIFIC exception, never a bare `except:`.\n\nTask: write `safe_int(s)` that returns `int(s)`, or `None` if `s` isn't a valid integer. Use `try` / `except ValueError`.",
      language: "python",
      starter: "def safe_int(s):\n    # try to convert; return None on ValueError\n    pass",
      solution:
        "def safe_int(s):\n    try:\n        return int(s)\n    except ValueError:\n        return None",
      checks: [
        { re: "def\\s+safe_int\\s*\\(\\s*s\\s*\\)", label: "defines `safe_int(s)`" },
        { re: "try\\s*:", label: "uses a `try:` block" },
        { re: "except\\s+ValueError", label: "catches the specific `ValueError`" },
        { re: "int\\s*\\(\\s*s\\s*\\)", label: "attempts `int(s)`" },
        { re: "return\\s+None", label: "returns `None` on failure" },
      ],
      hint: "`try: return int(s)` then `except ValueError: return None`. Catch `ValueError` specifically (what `int('abc')` raises) — not a bare `except:`, which would also swallow bugs and Ctrl-C.",
      explanation:
        "EAFP ('easier to ask forgiveness than permission') just does the thing and handles the exception, avoiding a redundant validity check and the race between checking and using. Catching the SPECIFIC exception (`ValueError`) is essential: a bare `except:` also hides `KeyboardInterrupt`, typos, and unrelated bugs. Keep the `try` body minimal — only the line that can raise.",
      docRef: DOC,
    }),
};

const walrus: Generator = {
  id: "py-walrus",
  title: "The walrus operator",
  generate: () =>
    codeTask({
      genId: "py-walrus",
      prompt:
        "Context: the walrus operator `:=` assigns AND returns a value inside an expression, so you can compute something in an `if`/`while` and reuse it without a separate line.\n\nTask: write `first_long(words, n)` returning the first word longer than `n`, or `None`. Use the walrus operator to compute each word's length just once, right inside the `if` condition that tests it.",
      language: "python",
      starter: "def first_long(words, n):\n    # use a walrus to compute len(w) once inside the if\n    pass",
      solution:
        "def first_long(words, n):\n    for w in words:\n        if (length := len(w)) > n:\n            return w\n    return None",
      checks: [
        { re: "def\\s+first_long\\s*\\(\\s*words\\s*,\\s*n\\s*\\)", label: "defines `first_long(words, n)`" },
        { re: ":=", label: "uses the walrus operator `:=`" },
        { re: "len\\s*\\(", label: "computes `len(w)`" },
        { re: "for\\s+\\w+\\s+in\\s+words", label: "iterates `for w in words`" },
      ],
      hint: "`if (length := len(w)) > n:` assigns `len(w)` to `length` and compares in one step. The parentheses around `length := len(w)` are required.",
      explanation:
        "The walrus `:=` (Python 3.8+) assigns inside an expression, so you avoid computing `len(w)` twice or adding a line before the `if`. It shines in `while (line := f.readline()):` loops and in comprehensions (`[y for x in data if (y := f(x)) > 0]`). Use it sparingly and always parenthesise it — clarity first; it's a convenience, not a default.",
      docRef: DOC,
    }),
};

const flatten: Generator = {
  id: "py-flatten",
  title: "Nested comprehension",
  generate: () =>
    codeTask({
      genId: "py-flatten",
      prompt:
        "Context: a comprehension can carry two `for` clauses to flatten nested data — and they read in the SAME order you'd write nested loops.\n\nTask: write `flatten(matrix)` turning a list of rows (list of lists) into a single flat list of all elements. Use one comprehension with two `for` clauses.",
      language: "python",
      starter: "def flatten(matrix):\n    # combine every row's items into a single flat list\n    pass",
      solution: "def flatten(matrix):\n    return [x for row in matrix for x in row]",
      checks: [
        { re: "def\\s+flatten\\s*\\(\\s*matrix\\s*\\)", label: "defines `flatten(matrix)`" },
        { re: "for\\s+\\w+\\s+in\\s+matrix\\s+for\\s+\\w+\\s+in\\s+\\w+", label: "two `for` clauses (`for row in matrix for x in row`)" },
      ],
      hint: "`[x for row in matrix for x in row]`. Read the two `for`s left-to-right like nested loops: outer over rows, inner over each row's items; `x` is what's collected.",
      explanation:
        "In a nested comprehension the `for` clauses appear in the SAME left-to-right order as equivalent nested loops (`for row in matrix: for x in row: ...`), and the collected expression (`x`) comes first. This trips people up because it feels backwards versus how the loops 'nest' — but the rule is simply outer-to-inner. It's the idiomatic one-line flatten; for deeper/irregular nesting reach for recursion or `itertools.chain`.",
      docRef: DOC,
    }),
};

export const pythonTrack: CodingTrack = {
  id: "coding-python",
  title: "Python",
  icon: "🐍",
  stack: "Python",
  blurb:
    "Write real Python: f-strings and comprehensions → generators, *args, the collections toolbox → dataclasses, @property, context managers, decorators → EAFP and the walrus operator. Checked for idiomatic shape.",
  exercises: [
    { level: 1, gen: fstring },
    { level: 1, gen: listComp },
    { level: 2, gen: dictComp },
    { level: 2, gen: slicing },
    { level: 2, gen: safeDefault },
    { level: 3, gen: argsSum },
    { level: 3, gen: generatorFn },
    { level: 3, gen: counter },
    { level: 4, gen: dataclass },
    { level: 4, gen: property },
    { level: 4, gen: contextManager },
    { level: 4, gen: decorator },
    { level: 5, gen: eafp },
    { level: 5, gen: walrus },
    { level: 5, gen: flatten },
  ],
};
