/**
 * Coding track: Java — from declaring your first variable up through generics,
 * OOP, equals/hashCode and the Streams API. Structure-checked against the shape
 * of idiomatic Java (the dojo can't run a JVM in the browser), so the checks
 * spell out the syntax and the traps.
 */
import { codeTask, multiFileTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingTrack } from "../coding";

const DOC = { slug: "java-spring-boot", label: "Dojo guide — Java & Spring Boot" };

/* ── Level 1 — syntax & variables ── */

const declareVars: Generator = {
  id: "java-declare-vars",
  title: "Declare typed variables",
  generate: () =>
    codeTask({
      genId: "java-declare-vars",
      prompt:
        "Inside `main`, declare three variables: a CONSTANT int `MAX_SCORE` equal to 100 that can never be reassigned, a `String title` set to \"Untitled\", and a `double average` set to 0.0.",
      language: "java",
      starter: `public class Demo {\n  public static void main(String[] args) {\n    // declare the three variables\n  }\n}`,
      solution: `public class Demo {\n  public static void main(String[] args) {\n    final int MAX_SCORE = 100;\n    String title = "Untitled";\n    double average = 0.0;\n  }\n}`,
      checks: [
        { re: "final\\s+int\\s+MAX_SCORE\\s*=\\s*100", label: "`final int MAX_SCORE = 100` (final = can't be reassigned)" },
        { re: "String\\s+title\\s*=\\s*\"Untitled\"", label: "`String title = \"Untitled\"`" },
        { re: "double\\s+average\\s*=\\s*0\\.0", label: "`double average = 0.0`" },
      ],
      explanation:
        "Java is statically typed: every variable names its type up front (`int`, `String`, `double`), unlike JavaScript's `let`. `final` is Java's `const` — it forbids reassignment, and SCREAMING_CASE is the convention for such constants. Note `String` is capitalised (it's a class, an object type) while `int` and `double` are lowercase primitives — a distinction that matters the moment you hit collections, which can't hold primitives directly.",
      docRef: DOC,
    }),
};

const methodSquare: Generator = {
  id: "java-method-square",
  title: "Write a static method",
  generate: () =>
    codeTask({
      genId: "java-method-square",
      prompt:
        "Write a `public static` method `square` that takes an `int n` and returns its square as an `int`.",
      language: "java",
      starter: `public class MathUtil {\n  // write square here\n}`,
      solution: `public class MathUtil {\n  public static int square(int n) {\n    return n * n;\n  }\n}`,
      checks: [
        { re: "public\\s+static\\s+int\\s+square\\s*\\(\\s*int\\s+n\\s*\\)", label: "signature `public static int square(int n)`" },
        { re: "return\\s+n\\s*\\*\\s*n", label: "returns `n * n`" },
      ],
      explanation:
        "A method signature is `[modifiers] returnType name(params)`. `public` means anyone can call it, `static` means it belongs to the class (call it as `MathUtil.square(5)` — no object needed), and the return type `int` is declared *before* the name. Getting the order right — modifiers, return type, name — is the muscle memory every Java method builds on.",
      docRef: DOC,
    }),
};

/* ── Level 2 — control flow ── */

const sumLoop: Generator = {
  id: "java-sum-loop",
  title: "Sum an array",
  generate: () =>
    codeTask({
      genId: "java-sum-loop",
      prompt:
        "Write `public static int sum(int[] nums)` that returns the total of all elements. Iterate with an enhanced (for-each) loop rather than an index.",
      language: "java",
      starter: `public static int sum(int[] nums) {\n  // your code\n}`,
      solution: `public static int sum(int[] nums) {\n  int total = 0;\n  for (int n : nums) {\n    total += n;\n  }\n  return total;\n}`,
      checks: [
        { re: "for\\s*\\(\\s*int\\s+\\w+\\s*:\\s*nums\\s*\\)", label: "uses the enhanced for-loop `for (int n : nums)`" },
        { re: "\\+=", label: "accumulates into a running total" },
        { re: "return\\s+\\w+", label: "returns the total" },
      ],
      explanation:
        "The enhanced for-loop (`for (int n : nums)`) reads each element in turn without an index — cleaner and safer than `for (int i = 0; i < nums.length; i++)` because there's no off-by-one or bounds mistake to make. Reach for the classic indexed loop only when you actually need the index `i` (e.g. to write back into the array).",
      docRef: DOC,
    }),
};

const stringBuilder: Generator = {
  id: "java-stringbuilder",
  title: "Reverse a String",
  generate: () =>
    codeTask({
      genId: "java-stringbuilder",
      prompt:
        "Write `public static String reverse(String s)` that returns the string reversed. Reach for Java's mutable string-builder class and its built-in reverse rather than looping by hand.",
      language: "java",
      starter: `public static String reverse(String s) {\n  // your code\n}`,
      solution: `public static String reverse(String s) {\n  return new StringBuilder(s).reverse().toString();\n}`,
      checks: [
        { re: "new\\s+StringBuilder\\s*\\(", label: "uses a `StringBuilder`" },
        { re: "\\.reverse\\(\\)", label: "calls `.reverse()`" },
        { re: "\\.toString\\(\\)", label: "converts back with `.toString()`" },
      ],
      explanation:
        "Java `String`s are IMMUTABLE — every `+` on a string allocates a whole new object, so building strings in a loop with `+` is quietly O(n²). `StringBuilder` is the mutable buffer you edit in place, then materialise once with `.toString()`. Reversing is its party trick, but the real lesson is: any time you assemble a string piece by piece, reach for `StringBuilder`.",
      docRef: DOC,
    }),
};

/* ── Level 3 — collections & OOP ── */

const arrayList: Generator = {
  id: "java-arraylist",
  title: "Build a List",
  generate: () =>
    codeTask({
      genId: "java-arraylist",
      prompt:
        "Write `public static List<String> nonEmpty(String[] input)` that returns a `List<String>` containing only the non-empty strings from `input`. Program to the `List` interface, back it with an `ArrayList`.",
      language: "java",
      starter: `public static List<String> nonEmpty(String[] input) {\n  // your code\n}`,
      solution: `public static List<String> nonEmpty(String[] input) {\n  List<String> result = new ArrayList<>();\n  for (String s : input) {\n    if (!s.isEmpty()) {\n      result.add(s);\n    }\n  }\n  return result;\n}`,
      checks: [
        { re: "List<String>\\s+\\w+\\s*=\\s*new\\s+ArrayList<>?\\s*\\(", label: "declares `List<String> = new ArrayList<>()`" },
        { re: "\\.add\\(", label: "adds matching items with `.add(...)`" },
        { re: "\\.isEmpty\\(\\)", label: "filters out empty strings" },
      ],
      explanation:
        "The idiom is `List<String> x = new ArrayList<>()` — declare the variable as the INTERFACE (`List`), instantiate the concrete class (`ArrayList`). That way callers depend only on `List`, and you could swap in a `LinkedList` later without touching them. The `<>` (diamond) infers the type argument from the left side. `List` is generic because, unlike an array, it can't hold primitives — you'd use `Integer`, not `int`.",
      docRef: DOC,
    }),
};

const hashMapFreq: Generator = {
  id: "java-hashmap-freq",
  title: "Count with a Map",
  generate: () =>
    codeTask({
      genId: "java-hashmap-freq",
      prompt:
        "Write `public static Map<String, Integer> counts(String[] words)` returning each word mapped to how many times it appears. Tally cleanly with the map lookup that returns a default when the key is absent, so you avoid a null check.",
      language: "java",
      starter: `public static Map<String, Integer> counts(String[] words) {\n  // your code\n}`,
      solution: `public static Map<String, Integer> counts(String[] words) {\n  Map<String, Integer> map = new HashMap<>();\n  for (String w : words) {\n    map.put(w, map.getOrDefault(w, 0) + 1);\n  }\n  return map;\n}`,
      checks: [
        { re: "Map<String,\\s*Integer>\\s+\\w+\\s*=\\s*new\\s+HashMap<>?\\s*\\(", label: "`Map<String, Integer> = new HashMap<>()`" },
        { re: "getOrDefault\\(", label: "uses `getOrDefault(key, 0)`" },
        { re: "\\.put\\(", label: "writes back with `.put(...)`" },
      ],
      explanation:
        "`getOrDefault(key, 0)` returns the stored count, or 0 if the key is absent — one call replaces the clumsy `if (map.containsKey(w)) … else …`. Note the value type is `Integer` (the object wrapper), not `int`: generic collections can only hold objects, and Java silently 'autoboxes' the `int` for you. This frequency-map pattern is the backbone of countless interview problems.",
      docRef: DOC,
    }),
};

const classUser: Generator = {
  id: "java-class-user",
  title: "An encapsulated class",
  generate: () =>
    codeTask({
      genId: "java-class-user",
      prompt:
        "Write a class `User` with a PRIVATE `String name` field, a constructor that sets it, and a public getter `getName()`. This is textbook encapsulation.",
      language: "java",
      starter: `public class User {\n  // field, constructor, getter\n}`,
      solution: `public class User {\n  private String name;\n\n  public User(String name) {\n    this.name = name;\n  }\n\n  public String getName() {\n    return name;\n  }\n}`,
      checks: [
        { re: "private\\s+String\\s+name", label: "the field is `private`" },
        { re: "public\\s+User\\s*\\(\\s*String\\s+name\\s*\\)", label: "constructor takes the name" },
        { re: "this\\.name\\s*=\\s*name", label: "assigns `this.name = name`" },
        { re: "public\\s+String\\s+getName\\s*\\(\\s*\\)", label: "public getter `getName()`" },
      ],
      explanation:
        "Encapsulation = keep fields `private`, expose behaviour through methods. Outsiders can read the name via `getName()` but can't reach in and corrupt it — and if you later add validation, there's one gatekeeper to change. `this.name = name` disambiguates: `this.name` is the field, plain `name` is the constructor parameter that's shadowing it. A constructor has no return type and shares the class's exact name.",
      docRef: DOC,
    }),
};

/* ── Level 4 — generics, equals/hashCode, streams ── */

const genericBox: Generator = {
  id: "java-generic-box",
  title: "A generic class",
  generate: () =>
    codeTask({
      genId: "java-generic-box",
      prompt:
        "Write a generic class `Box<T>` that holds one value of type `T`: a private field, a constructor that sets it, and a `T get()` method. It must work for any type with one implementation.",
      language: "java",
      starter: `public class Box {\n  // make it generic over T\n}`,
      solution: `public class Box<T> {\n  private T value;\n\n  public Box(T value) {\n    this.value = value;\n  }\n\n  public T get() {\n    return value;\n  }\n}`,
      checks: [
        { re: "class\\s+Box\\s*<\\s*T\\s*>", label: "declares the type parameter `Box<T>`" },
        { re: "private\\s+T\\s+\\w+", label: "the field is typed `T`" },
        { re: "public\\s+T\\s+get\\s*\\(\\s*\\)", label: "`get()` returns `T`" },
      ],
      explanation:
        "The `<T>` after the class name is a type placeholder the CALLER fills in: `new Box<String>(\"hi\")` makes `T` be `String`, so `get()` returns a `String` — no casting, checked at compile time. Before generics (Java 1.5) you'd store `Object` and cast on the way out, risking a `ClassCastException` at runtime. Generics move that whole class of error to compile time. This is exactly how `List<T>` and `Optional<T>` are built.",
      docRef: DOC,
    }),
};

const equalsHashCode: Generator = {
  id: "java-equals-hashcode",
  title: "Override equals & hashCode",
  generate: () =>
    codeTask({
      genId: "java-equals-hashcode",
      prompt:
        "For a `Point` with int fields `x` and `y`, override `equals(Object o)` (two points are equal when both coordinates match) AND `hashCode()` — overriding one without the other is the classic bug. Build the hash from both fields with the `Objects` utility rather than by hand.",
      language: "java",
      starter: `public class Point {\n  int x, y;\n\n  // override equals and hashCode\n}`,
      solution: `public class Point {\n  int x, y;\n\n  @Override\n  public boolean equals(Object o) {\n    if (this == o) return true;\n    if (!(o instanceof Point)) return false;\n    Point p = (Point) o;\n    return x == p.x && y == p.y;\n  }\n\n  @Override\n  public int hashCode() {\n    return Objects.hash(x, y);\n  }\n}`,
      checks: [
        { re: "public\\s+boolean\\s+equals\\s*\\(\\s*Object\\s+\\w+\\s*\\)", label: "`equals(Object o)` — exactly this signature" },
        { re: "instanceof\\s+Point", label: "type-checks with `instanceof Point`" },
        { re: "public\\s+int\\s+hashCode\\s*\\(\\s*\\)", label: "also overrides `hashCode()`" },
        { re: "Objects\\.hash\\(", label: "builds the hash with `Objects.hash(x, y)`" },
      ],
      explanation:
        "The iron rule: **if you override `equals`, you MUST override `hashCode`** — because `HashMap`/`HashSet` first bucket by `hashCode`, then confirm with `equals`. Two 'equal' points with different hashes land in different buckets and the set thinks they're distinct, so lookups silently fail. `equals` must take `Object` (it's overriding `Object.equals`); a `Point`-typed parameter would be an *overload* that hash collections never call. `Objects.hash` combines the fields consistent with your equality.",
      docRef: DOC,
    }),
};

const streamsFilter: Generator = {
  id: "java-streams-filter",
  title: "Filter & map with Streams",
  generate: () =>
    codeTask({
      genId: "java-streams-filter",
      prompt:
        "Write `public static List<String> loudWords(List<String> words)` that keeps words longer than 3 letters and upper-cases them. Do it with the Streams API — filter, transform, then collect back to a `List`.",
      language: "java",
      starter: `public static List<String> loudWords(List<String> words) {\n  // stream pipeline\n}`,
      solution: `public static List<String> loudWords(List<String> words) {\n  return words.stream()\n    .filter(w -> w.length() > 3)\n    .map(String::toUpperCase)\n    .collect(Collectors.toList());\n}`,
      checks: [
        { re: "\\.stream\\(\\)", label: "opens a stream with `.stream()`" },
        { re: "\\.filter\\(", label: "keeps long words with `.filter(...)`" },
        { re: "\\.map\\(", label: "transforms with `.map(...)`" },
        { re: "\\.collect\\(|\\.toList\\(\\)", label: "collects back to a `List`" },
      ],
      explanation:
        "A stream is a declarative pipeline: `filter` (keep some) and `map` (transform each) are lazy — nothing runs until a TERMINAL operation like `collect` pulls values through. It reads as *what* you want, not the loop mechanics of *how*. `String::toUpperCase` is a method reference, shorthand for the lambda `w -> w.toUpperCase()`. This is Java's answer to JavaScript's `.filter().map()` — the mental bridge from Node to the JVM.",
      docRef: DOC,
    }),
};

/* ── Level 5 — expert streams ── */

const streamsGrouping: Generator = {
  id: "java-streams-grouping",
  title: "Group with Collectors",
  generate: () =>
    codeTask({
      genId: "java-streams-grouping",
      prompt:
        "Write `public static Map<Integer, List<String>> byLength(List<String> words)` that groups the words by their length. A single stream collector for grouping does it in one line.",
      language: "java",
      starter: `public static Map<Integer, List<String>> byLength(List<String> words) {\n  // group by length\n}`,
      solution: `public static Map<Integer, List<String>> byLength(List<String> words) {\n  return words.stream()\n    .collect(Collectors.groupingBy(String::length));\n}`,
      checks: [
        { re: "\\.stream\\(\\)", label: "streams the words" },
        { re: "Collectors\\.groupingBy\\(", label: "groups with `Collectors.groupingBy(...)`" },
        { re: "String::length|w\\s*->\\s*w\\.length\\(\\)", label: "keys by each word's length" },
      ],
      explanation:
        "`groupingBy(classifier)` builds a `Map` from each key the classifier returns to the LIST of items that produced it — a whole grouping loop (create map, getOrDefault an empty list, add, put back) collapsed into one collector. It's the Streams equivalent of SQL `GROUP BY`. Collectors compose too: `groupingBy(String::length, counting())` would map length → count instead of length → list.",
      docRef: DOC,
    }),
};

const comparatorLambda: Generator = {
  id: "java-comparator-lambda",
  title: "Sort with a Comparator",
  generate: () =>
    codeTask({
      genId: "java-comparator-lambda",
      prompt:
        "Write `public static void sortByLength(List<String> words)` that sorts the list IN PLACE by string length, shortest first. Sort it with a comparator that keys on each string's length.",
      language: "java",
      starter: `public static void sortByLength(List<String> words) {\n  // sort in place\n}`,
      solution: `public static void sortByLength(List<String> words) {\n  words.sort(Comparator.comparingInt(String::length));\n}`,
      checks: [
        { re: "\\.sort\\(", label: "sorts in place with `list.sort(...)`" },
        { re: "Comparator\\.comparing", label: "builds the order with `Comparator.comparing…`" },
        { re: "String::length|w\\s*->\\s*w\\.length\\(\\)", label: "orders by length" },
      ],
      explanation:
        "`Comparator.comparingInt(String::length)` builds a comparator from a key extractor — no hand-written `compare` returning -1/0/1, and no boxing since `comparingInt` keeps it primitive. `List.sort` mutates the list in place (returns `void`), which is why the method returns nothing. Chain `.reversed()` for descending, or `.thenComparing(...)` for tie-breakers. A `Comparator` is a functional interface, so a lambda or method reference just *is* one.",
      docRef: DOC,
    }),
};

/* ── Level 1 — more syntax ── */

const absTernary: Generator = {
  id: "java-abs-ternary",
  title: "The ternary operator",
  generate: () =>
    codeTask({
      genId: "java-abs-ternary",
      prompt:
        "Write `public static int abs(int n)` returning the absolute value of `n`, using the ternary conditional operator instead of an if-statement.",
      language: "java",
      starter: `public static int abs(int n) {\n  // use the ternary operator\n}`,
      solution: `public static int abs(int n) {\n  return n < 0 ? -n : n;\n}`,
      checks: [
        { re: "n\\s*<\\s*0\\s*\\?", label: "tests `n < 0 ?` with the ternary" },
        { re: "-n\\s*:", label: "returns `-n` in the negative branch" },
        { re: "\\bif\\b", expect: false, label: "no `if` statement — just the expression" },
      ],
      explanation:
        "`cond ? a : b` is an EXPRESSION that evaluates to `a` or `b`, so it can be returned or assigned directly — unlike `if`, which is a statement. It keeps simple either/or logic on one line and is the idiom for defaulting (`x != null ? x : fallback`). Don't nest more than one or two, though — deeply nested ternaries become unreadable fast.",
      docRef: DOC,
    }),
};

const switchDay: Generator = {
  id: "java-switch",
  title: "The switch statement",
  generate: () =>
    codeTask({
      genId: "java-switch",
      prompt:
        "Write `public static String kind(int day)` (1 = Monday … 7 = Sunday): return `\"weekend\"` for 6 or 7 and `\"weekday\"` otherwise. Use a `switch` statement — let the two weekend values share a branch, with everything else falling to a default.",
      language: "java",
      starter: `public static String kind(int day) {\n  // switch on day\n}`,
      solution: `public static String kind(int day) {\n  switch (day) {\n    case 6:\n    case 7:\n      return "weekend";\n    default:\n      return "weekday";\n  }\n}`,
      checks: [
        { re: "switch\\s*\\(\\s*day\\s*\\)", label: "switches on `day`" },
        { re: "case\\s+6\\s*:", label: "has `case 6:`" },
        { re: "case\\s+7\\s*:", label: "has `case 7:`" },
        { re: "default\\s*:", label: "has a `default` branch" },
        { re: "return\\s+\"weekend\"", label: "returns `\"weekend\"`" },
      ],
      explanation:
        "Stacking `case 6:` directly above `case 7:` uses FALL-THROUGH: 6 has no `break`/`return`, so control drops into 7's body — a deliberate way to share code between cases. Because each branch here `return`s, no `break` is needed; in a switch that assigns instead, forgetting `break` and falling through by accident is the classic bug. `default` catches everything else.",
      docRef: DOC,
    }),
};

/* ── Level 2 — loops, arrays, strings ── */

const factorialLoop: Generator = {
  id: "java-factorial",
  title: "Iterative factorial",
  generate: () =>
    codeTask({
      genId: "java-factorial",
      prompt:
        "Write `public static long factorial(int n)` computing n! iteratively with a `for` loop. Return a `long` (not `int`) so it doesn't overflow as fast.",
      language: "java",
      starter: `public static long factorial(int n) {\n  // iterative factorial\n}`,
      solution: `public static long factorial(int n) {\n  long result = 1;\n  for (int i = 2; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}`,
      checks: [
        { re: "long\\s+\\w+\\s*=\\s*1", label: "seeds a `long` accumulator at 1" },
        { re: "for\\s*\\(", label: "uses a `for` loop" },
        { re: "\\*=", label: "multiplies into the accumulator (`*=`)" },
      ],
      explanation:
        "The accumulator starts at 1 (the multiplicative identity), so `factorial(0)` correctly returns 1. Typing it `long` buys headroom — `int` overflows at 13! silently (wrapping to a negative number, a nasty bug). The iterative version avoids the call-stack cost of recursion. Note `result *= i` is shorthand for `result = result * i`.",
      docRef: DOC,
    }),
};

const sumMatrix: Generator = {
  id: "java-sum-matrix",
  title: "Sum a 2D array",
  generate: () =>
    codeTask({
      genId: "java-sum-matrix",
      prompt:
        "Write `public static int sumMatrix(int[][] matrix)` returning the total of every element in a 2D array. Walk it with NESTED enhanced for-loops — the outer over rows, the inner over each row's ints.",
      language: "java",
      starter: `public static int sumMatrix(int[][] matrix) {\n  // nested loops over the grid\n}`,
      solution: `public static int sumMatrix(int[][] matrix) {\n  int total = 0;\n  for (int[] row : matrix) {\n    for (int v : row) {\n      total += v;\n    }\n  }\n  return total;\n}`,
      checks: [
        { re: "for\\s*\\(\\s*int\\[\\]\\s+\\w+\\s*:\\s*matrix\\s*\\)", label: "outer loop iterates rows (`int[] row : matrix`)" },
        { re: "for\\s*\\(\\s*int\\s+\\w+\\s*:\\s*\\w+\\s*\\)", label: "inner loop iterates each row's ints" },
        { re: "\\+=", label: "accumulates the total" },
      ],
      explanation:
        "A Java 2D array is really an array OF arrays, so `int[][]` iterates naturally as rows (`int[]`) then cells (`int`). The enhanced for-loop keeps it index-free and safe. (If you needed the coordinates you'd switch to indexed loops with `matrix.length` and `matrix[i].length` — remembering rows can have different lengths, since it's a jagged array of arrays.)",
      docRef: DOC,
    }),
};

const countChar: Generator = {
  id: "java-count-char",
  title: "Count a character",
  generate: () =>
    codeTask({
      genId: "java-count-char",
      prompt:
        "Write `public static int countChar(String s, char c)` returning how many times `c` appears in `s`. Walk the string with an indexed loop, reading each character by its position.",
      language: "java",
      starter: `public static int countChar(String s, char c) {\n  // count occurrences of c\n}`,
      solution: `public static int countChar(String s, char c) {\n  int count = 0;\n  for (int i = 0; i < s.length(); i++) {\n    if (s.charAt(i) == c) {\n      count++;\n    }\n  }\n  return count;\n}`,
      checks: [
        { re: "s\\.length\\(\\)", label: "loops to `s.length()`" },
        { re: "s\\.charAt\\(\\s*i\\s*\\)", label: "reads each char with `charAt(i)`" },
        { re: "==\\s*c", label: "compares with `== c`" },
        { re: "count\\+\\+|count\\s*\\+=\\s*1", label: "increments the counter" },
      ],
      explanation:
        "A `char` is a primitive, so `==` is the CORRECT comparison here (unlike `String`, where `==` compares references and you need `.equals`). `charAt(i)` returns the character at an index; `s.length()` is a METHOD on String (note the `()`), whereas an array uses the FIELD `arr.length` (no parentheses) — a small inconsistency that trips people up constantly.",
      docRef: DOC,
    }),
};

/* ── Level 3 — collections & OOP, deeper ── */

const hashSetDedup: Generator = {
  id: "java-hashset",
  title: "Deduplicate with a Set",
  generate: () =>
    codeTask({
      genId: "java-hashset",
      prompt:
        "Write `public static Set<Integer> unique(int[] nums)` returning the DISTINCT values. Program to the `Set` interface, back it with a `HashSet`, and add every element (duplicates are ignored automatically).",
      language: "java",
      starter: `public static Set<Integer> unique(int[] nums) {\n  // collect distinct values\n}`,
      solution: `public static Set<Integer> unique(int[] nums) {\n  Set<Integer> seen = new HashSet<>();\n  for (int n : nums) {\n    seen.add(n);\n  }\n  return seen;\n}`,
      checks: [
        { re: "Set<Integer>\\s+\\w+\\s*=\\s*new\\s+HashSet<>?\\s*\\(", label: "`Set<Integer> = new HashSet<>()`" },
        { re: "\\.add\\(", label: "adds each element" },
      ],
      explanation:
        "A `Set` stores each value at most once — `add` on a duplicate is a silent no-op — so it's the one-line way to dedupe. `HashSet` gives O(1) average add/contains but no order; `LinkedHashSet` preserves insertion order; `TreeSet` keeps them sorted. `Set` membership relies on `equals`/`hashCode`, which is why value classes must override both (see the equals/hashCode task).",
      docRef: DOC,
    }),
};

const iterateMap: Generator = {
  id: "java-iterate-map",
  title: "Iterate a Map",
  generate: () =>
    codeTask({
      genId: "java-iterate-map",
      prompt:
        "Write `public static int sumValues(Map<String, Integer> map)` returning the sum of all values. Iterate the map's entries with a for-each and add up each entry's value.",
      language: "java",
      starter: `public static int sumValues(Map<String, Integer> map) {\n  // sum every value\n}`,
      solution: `public static int sumValues(Map<String, Integer> map) {\n  int total = 0;\n  for (Map.Entry<String, Integer> entry : map.entrySet()) {\n    total += entry.getValue();\n  }\n  return total;\n}`,
      checks: [
        { re: "map\\.entrySet\\(\\)", label: "iterates `map.entrySet()`" },
        { re: "Map\\.Entry<", label: "loop variable is a `Map.Entry`" },
        { re: "\\.getValue\\(\\)", label: "reads `entry.getValue()`" },
      ],
      explanation:
        "`entrySet()` is the efficient way to walk a map when you need both key and value — each `Map.Entry` exposes `getKey()` and `getValue()` in ONE pass. Iterating `keySet()` and calling `map.get(key)` inside works but does a second lookup per entry. (Modern alternative: `map.forEach((k, v) -> …)`.) A `Map` isn't `Iterable` itself, which is why you iterate one of its *views*: `entrySet`, `keySet`, or `values`.",
      docRef: DOC,
    }),
};

const inheritance: Generator = {
  id: "java-inheritance",
  title: "Inheritance & super",
  generate: () =>
    codeTask({
      genId: "java-inheritance",
      prompt:
        "`Animal` is given. Write `class Dog extends Animal`: a constructor taking `name` that passes it up to the superclass, and an override of `speak()` returning `\"Woof\"` (mark it so the compiler checks the override).",
      language: "java",
      starter: `class Animal {\n  protected String name;\n  Animal(String name) { this.name = name; }\n  String speak() { return "..."; }\n}\n\n// write class Dog extends Animal`,
      solution: `class Animal {\n  protected String name;\n  Animal(String name) { this.name = name; }\n  String speak() { return "..."; }\n}\n\nclass Dog extends Animal {\n  Dog(String name) {\n    super(name);\n  }\n\n  @Override\n  String speak() {\n    return "Woof";\n  }\n}`,
      checks: [
        { re: "class\\s+Dog\\s+extends\\s+Animal", label: "`Dog extends Animal`" },
        { re: "super\\(\\s*name\\s*\\)", label: "calls `super(name)` in the constructor" },
        { re: "@Override", label: "annotates the override" },
        { re: "return\\s+\"Woof\"", label: "`speak()` returns `\"Woof\"`" },
      ],
      explanation:
        "`extends` inherits the parent's fields and methods; `super(name)` calls the PARENT constructor (required first line when the parent has no no-arg constructor). `@Override` isn't decorative — it makes the compiler verify you're actually overriding a real method, so a typo like `speek()` fails to compile instead of silently adding a new method. This is runtime polymorphism: an `Animal` reference to a `Dog` calls `Dog.speak()`.",
      docRef: DOC,
    }),
};

const interfaceImpl: Generator = {
  id: "java-interface-impl",
  title: "Implement an interface",
  generate: () =>
    codeTask({
      genId: "java-interface-impl",
      prompt:
        "`Shape` is given. Write `class Circle implements Shape` with a `private double radius`, a constructor, and an overridden `area()` returning the circle's area (π · r²).",
      language: "java",
      starter: `interface Shape {\n  double area();\n}\n\n// write class Circle implements Shape`,
      solution: `interface Shape {\n  double area();\n}\n\nclass Circle implements Shape {\n  private double radius;\n\n  Circle(double radius) {\n    this.radius = radius;\n  }\n\n  @Override\n  public double area() {\n    return Math.PI * radius * radius;\n  }\n}`,
      checks: [
        { re: "class\\s+Circle\\s+implements\\s+Shape", label: "`Circle implements Shape`" },
        { re: "@Override\\s+public\\s+double\\s+area\\s*\\(\\s*\\)", label: "overrides `public double area()`" },
        { re: "Math\\.PI", label: "computes the area with `Math.PI`" },
      ],
      explanation:
        "An interface is a pure CONTRACT — method signatures with no bodies — and `implements` promises to fulfil every one (the compiler enforces it). Interface methods are implicitly `public`, so your override must be `public` too. Unlike single `extends` inheritance, a class can implement MANY interfaces, which is how Java composes capabilities (`Comparable`, `Serializable`, `Runnable`) without multiple inheritance of state.",
      docRef: DOC,
    }),
};

/* ── Level 4 — enums, streams, Optional ── */

const enumType: Generator = {
  id: "java-enum",
  title: "Define an enum",
  generate: () =>
    codeTask({
      genId: "java-enum",
      prompt:
        "Define an `enum Direction` with the four constants `NORTH`, `SOUTH`, `EAST`, `WEST`.",
      language: "java",
      starter: `// define the Direction enum`,
      solution: `enum Direction {\n  NORTH,\n  SOUTH,\n  EAST,\n  WEST\n}`,
      checks: [
        { re: "enum\\s+Direction", label: "declares `enum Direction`" },
        { re: "NORTH", label: "has `NORTH`" },
        { re: "WEST", label: "has `WEST`" },
      ],
      explanation:
        "An `enum` is a type with a FIXED set of named instances — type-safe where an `int` or `String` constant isn't (you can't pass an invalid direction). Enums work in `switch`, have `.values()` and `.ordinal()`, and can even carry fields and methods (`enum Planet { EARTH(5.97e24); … }`). Prefer them over `public static final int` constants: the compiler guarantees exhaustiveness and rejects bad values.",
      docRef: DOC,
    }),
};

const streamsToMap: Generator = {
  id: "java-streams-tomap",
  title: "Collect a stream to a Map",
  generate: () =>
    codeTask({
      genId: "java-streams-tomap",
      prompt:
        "Write `public static Map<String, Integer> lengths(List<String> words)` mapping each word to its length. Use a stream that collects into a map, supplying how to derive each key and value.",
      language: "java",
      starter: `public static Map<String, Integer> lengths(List<String> words) {\n  // stream -> map of word -> length\n}`,
      solution: `public static Map<String, Integer> lengths(List<String> words) {\n  return words.stream()\n    .collect(Collectors.toMap(w -> w, String::length));\n}`,
      checks: [
        { re: "\\.stream\\(\\)", label: "opens a stream" },
        { re: "Collectors\\.toMap\\(", label: "collects with `Collectors.toMap`" },
        { re: "String::length|\\.length\\(\\)", label: "value is each word's length" },
      ],
      explanation:
        "`toMap(keyExtractor, valueExtractor)` builds a `Map` in one pass — here `w -> w` (the word itself, aka `Function.identity()`) as key and `String::length` as value. One trap: `toMap` THROWS on duplicate keys; when keys can collide you must pass a merge function as the third argument (e.g. `(a, b) -> a`). `groupingBy` is the tool when you instead want key → list of items.",
      docRef: DOC,
    }),
};

const optionalStream: Generator = {
  id: "java-optional-stream",
  title: "Optional with findFirst",
  generate: () =>
    codeTask({
      genId: "java-optional-stream",
      prompt:
        "Write `public static String firstLong(List<String> words)` returning the first word longer than 3 letters, or `\"none\"` if there isn't one. Use a stream to filter, take the first match (it comes back wrapped in an `Optional`), and supply the fallback for the empty case.",
      language: "java",
      starter: `public static String firstLong(List<String> words) {\n  // first word with length > 3, else "none"\n}`,
      solution: `public static String firstLong(List<String> words) {\n  return words.stream()\n    .filter(w -> w.length() > 3)\n    .findFirst()\n    .orElse("none");\n}`,
      checks: [
        { re: "\\.filter\\(", label: "filters to long words" },
        { re: "\\.findFirst\\(\\)", label: "takes the first match with `findFirst()`" },
        { re: "\\.orElse\\(\\s*\"none\"\\s*\\)", label: "supplies the fallback with `orElse(\"none\")`" },
      ],
      explanation:
        "`findFirst()` returns `Optional<String>` — the type that makes 'maybe absent' explicit instead of returning `null` and hoping callers check. `orElse(\"none\")` unwraps it with a default. `Optional` chains nicely (`.map(...).filter(...).orElseThrow()`), turning null-checks into a pipeline. `findFirst` is also SHORT-CIRCUITING: the stream stops at the first match, so it doesn't scan the whole list.",
      docRef: DOC,
    }),
};

/* ── Level 5 — resources & ordering ── */

const tryWithResources: Generator = {
  id: "java-try-resources",
  title: "try-with-resources",
  generate: () =>
    codeTask({
      genId: "java-try-resources",
      prompt:
        "Write `public static String readFirstLine(String path) throws IOException` that returns the file's first line. Open a buffered reader over the file inside a TRY-WITH-RESOURCES statement so the reader auto-closes even on error.",
      language: "java",
      starter: `public static String readFirstLine(String path) throws IOException {\n  // open a BufferedReader in try-with-resources\n}`,
      solution: `public static String readFirstLine(String path) throws IOException {\n  try (BufferedReader reader = new BufferedReader(new FileReader(path))) {\n    return reader.readLine();\n  }\n}`,
      checks: [
        { re: "try\\s*\\(\\s*BufferedReader", label: "declares the reader inside `try ( … )`" },
        { re: "new\\s+FileReader\\(\\s*path\\s*\\)", label: "wraps a `FileReader(path)`" },
        { re: "\\.readLine\\(\\)", label: "reads the first line" },
        { re: "throws\\s+IOException", label: "declares `throws IOException`" },
      ],
      explanation:
        "Try-with-resources — `try (Resource r = …)` — automatically calls `r.close()` when the block exits, whether it returns normally OR throws, so you can never leak a file handle (the pre-Java-7 `finally { reader.close(); }` dance was verbose and easy to get wrong). Any object implementing `AutoCloseable` qualifies. Because I/O can fail, the method declares `throws IOException`, propagating it to the caller rather than swallowing it.",
      docRef: DOC,
    }),
};

const comparable: Generator = {
  id: "java-comparable",
  title: "Implement Comparable",
  generate: () =>
    codeTask({
      genId: "java-comparable",
      prompt:
        "Make `User` sortable by age (ascending) by implementing `Comparable<User>` and overriding `compareTo`. Compare the two ages with the `Integer` helper that avoids the subtraction-overflow bug, not `this.age - other.age`.",
      language: "java",
      starter: `class User {\n  String name;\n  int age;\n\n  // make it Comparable by age\n}`,
      solution: `class User implements Comparable<User> {\n  String name;\n  int age;\n\n  @Override\n  public int compareTo(User other) {\n    return Integer.compare(this.age, other.age);\n  }\n}`,
      checks: [
        { re: "implements\\s+Comparable<User>", label: "`implements Comparable<User>`" },
        { re: "public\\s+int\\s+compareTo\\s*\\(\\s*User\\s+\\w+\\s*\\)", label: "overrides `compareTo(User other)`" },
        { re: "Integer\\.compare\\(", label: "compares with `Integer.compare(...)`" },
      ],
      explanation:
        "`Comparable<T>` defines a type's NATURAL ordering via `compareTo`, which returns negative/zero/positive for less/equal/greater — exactly what `Collections.sort(list)` and `TreeSet` use with no extra arguments. Always use `Integer.compare(a, b)` rather than `a - b`: subtraction can OVERFLOW for large values and flip the sign, a subtle sorting bug. When you need a DIFFERENT order than the natural one (or can't modify the class), pass a `Comparator` instead.",
      docRef: DOC,
    }),
};

/* ── Multi-file capstone — a polymorphic hierarchy across files ── */

const shapesFeature: Generator = {
  id: "java-shapes-feature",
  title: "Assemble a shapes hierarchy",
  generate: () =>
    multiFileTask({
      genId: "java-shapes-feature",
      prompt:
        "Build a small polymorphic feature the idiomatic Java way — one public type per file. `Shape.java` is the shared contract every shape fulfils (each has an `area()` and a `name()`); `Circle.java` and `Rectangle.java` are two shapes that fulfil it; `AreaReport.java` totals the areas of a MIXED collection of shapes without caring which concrete type each one is. Write each in its tab, **Debug this file**, then **submit all** — open a file's hints if you're unsure of the syntax.",
      files: [
        {
          name: "Shape.java",
          language: "java",
          role: "the shared contract every shape fulfils",
          hint: "A contract with no implementation is an `interface`. Declare `interface Shape` with two method signatures and no bodies — `double area();` and `String name();`. Any class that promises to be a `Shape` must then supply both. Interface methods are implicitly public.",
          starter: `// Shape.java — the interface every shape implements`,
          solution: `public interface Shape {\n  double area();\n  String name();\n}`,
          checks: [
            { re: "interface\\s+Shape", label: "declares `interface Shape`" },
            { re: "double\\s+area\\s*\\(\\s*\\)", label: "declares `double area()`" },
            { re: "String\\s+name\\s*\\(\\s*\\)", label: "declares `String name()`" },
          ],
        },
        {
          name: "Circle.java",
          language: "java",
          role: "one shape — the circle",
          hint: "Declare `class Circle implements Shape` — `implements` promises to fulfil every method in the contract. Hold the radius in a `private final` field set by the constructor, then `@Override public double area()` returning `Math.PI * radius * radius`, and `@Override public String name()` returning `\"circle\"`. Overrides must be `public`, since interface methods are.",
          starter: `// Circle.java — implements Shape; area = Math.PI * radius * radius`,
          solution: `public class Circle implements Shape {\n  private final double radius;\n\n  public Circle(double radius) {\n    this.radius = radius;\n  }\n\n  @Override\n  public double area() {\n    return Math.PI * radius * radius;\n  }\n\n  @Override\n  public String name() {\n    return "circle";\n  }\n}`,
          checks: [
            { re: "class\\s+Circle\\s+implements\\s+Shape", label: "`Circle implements Shape`" },
            { re: "@Override\\s+public\\s+double\\s+area\\s*\\(\\s*\\)", label: "overrides `public double area()`" },
            { re: "Math\\.PI", label: "computes the area with `Math.PI`" },
            { re: "return\\s+\"circle\"", label: "`name()` returns `\"circle\"`" },
          ],
        },
        {
          name: "Rectangle.java",
          language: "java",
          role: "another shape — the rectangle",
          hint: "Same pattern as the circle: `class Rectangle implements Shape`, private final `width`/`height` from the constructor, `@Override public double area()` returning `width * height`, and `@Override public String name()` returning `\"rectangle\"`. Two classes, one contract — that's what makes them interchangeable.",
          starter: `// Rectangle.java — implements Shape; area = width * height`,
          solution: `public class Rectangle implements Shape {\n  private final double width;\n  private final double height;\n\n  public Rectangle(double width, double height) {\n    this.width = width;\n    this.height = height;\n  }\n\n  @Override\n  public double area() {\n    return width * height;\n  }\n\n  @Override\n  public String name() {\n    return "rectangle";\n  }\n}`,
          checks: [
            { re: "class\\s+Rectangle\\s+implements\\s+Shape", label: "`Rectangle implements Shape`" },
            { re: "@Override\\s+public\\s+double\\s+area\\s*\\(\\s*\\)", label: "overrides `public double area()`" },
            { re: "width\\s*\\*\\s*height", label: "area is `width * height`" },
            { re: "return\\s+\"rectangle\"", label: "`name()` returns `\"rectangle\"`" },
          ],
        },
        {
          name: "AreaReport.java",
          language: "java",
          role: "the consumer — depends only on the contract",
          hint: "Take a `List<Shape>` — declaring the parameter as the INTERFACE is what lets one list hold circles and rectangles together. Loop with an enhanced for (`for (Shape shape : shapes)`) and add up `shape.area()`; at runtime each call dispatches to the right shape's implementation. No `instanceof`, no per-type branches — add a `Triangle` tomorrow and this method doesn't change.",
          starter: `// AreaReport.java — totalArea(List<Shape>) summing each shape's area()`,
          solution: `public class AreaReport {\n  public static double totalArea(List<Shape> shapes) {\n    double total = 0;\n    for (Shape shape : shapes) {\n      total += shape.area();\n    }\n    return total;\n  }\n}`,
          checks: [
            { re: "List<Shape>", label: "takes a `List<Shape>` — programs to the interface" },
            { re: "for\\s*\\(\\s*Shape\\s+\\w+\\s*:\\s*\\w+\\s*\\)", label: "iterates the shapes polymorphically" },
            { re: "\\.area\\(\\)", label: "calls `area()` through the interface" },
            { re: "\\+=", label: "accumulates the total" },
          ],
        },
      ],
      crossChecks: [
        {
          re: "(?=[\\s\\S]*interface\\s+Shape)(?=[\\s\\S]*class\\s+Circle\\s+implements\\s+Shape)(?=[\\s\\S]*class\\s+Rectangle\\s+implements\\s+Shape)(?=[\\s\\S]*\\.area\\(\\))",
          label: "`Circle` and `Rectangle` both implement `Shape`, and the report sums `area()` across them",
        },
        {
          re: "(?=[\\s\\S]*String\\s+name\\s*\\(\\s*\\))(?=[\\s\\S]*return\\s+\"circle\")(?=[\\s\\S]*return\\s+\"rectangle\")",
          label: "each shape names itself — `Circle` → \"circle\", `Rectangle` → \"rectangle\"",
        },
      ],
      explanation:
        "This is polymorphism, the core of OOP: `Shape` is a pure CONTRACT, `Circle` and `Rectangle` each provide their own `area()`, and `AreaReport` depends only on the `Shape` interface — `for (Shape shape : shapes) total += shape.area()` calls the RIGHT implementation for each object at runtime, with no `instanceof` or per-type branches. Add a `Triangle` tomorrow and the report needs zero changes; that's the open/closed principle. One public type per file is Java's convention (a public class MUST live in a file of its own name), and it's what keeps the contract, its implementations, and its consumers cleanly separable.",
      docRef: DOC,
    }),
};

export const javaTrack: CodingTrack = {
  id: "coding-java",
  title: "Java",
  icon: "☕",
  stack: "Java",
  blurb:
    "From declaring a variable to generics, equals/hashCode and the Streams API — the language of Moroccan enterprise interviews, built up one method at a time.",
  exercises: [
    { level: 1, gen: declareVars },
    { level: 1, gen: methodSquare },
    { level: 1, gen: absTernary },
    { level: 1, gen: switchDay },
    { level: 2, gen: sumLoop },
    { level: 2, gen: stringBuilder },
    { level: 2, gen: factorialLoop },
    { level: 2, gen: sumMatrix },
    { level: 2, gen: countChar },
    { level: 3, gen: arrayList },
    { level: 3, gen: hashMapFreq },
    { level: 3, gen: classUser },
    { level: 3, gen: hashSetDedup },
    { level: 3, gen: iterateMap },
    { level: 3, gen: inheritance },
    { level: 3, gen: interfaceImpl },
    { level: 3, gen: shapesFeature },
    { level: 4, gen: genericBox },
    { level: 4, gen: equalsHashCode },
    { level: 4, gen: streamsFilter },
    { level: 4, gen: enumType },
    { level: 4, gen: streamsToMap },
    { level: 4, gen: optionalStream },
    { level: 5, gen: streamsGrouping },
    { level: 5, gen: comparatorLambda },
    { level: 5, gen: tryWithResources },
    { level: 5, gen: comparable },
  ],
};
