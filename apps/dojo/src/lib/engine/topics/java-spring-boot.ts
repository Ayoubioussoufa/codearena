/**
 * Topic: Java & Spring Boot — the enterprise bridge for a TypeScript/NestJS
 * developer. Drills the supplement's mappings (Nest → Spring, Prisma → JPA,
 * array methods → streams) plus the traps ESN interviewers plant.
 */
import { choice, codeTask, text } from "../helpers";
import type { Generator, Topic } from "../types";

const DOC = { slug: "java-spring-boot", label: "Java & Spring Boot — the enterprise bridge" };

const ref = (section: string) => ({ slug: DOC.slug, label: `Java & Spring Boot ${section}` });

const equalsVsRefs: Generator = {
  id: "java-equals-refs",
  title: "== vs .equals()",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "java-equals-refs",
        prompt: "What does this print, and why?",
        code: `String a = new String("hello");\nString b = "hello";\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));`,
        codeLang: "java",
        correct: "false then true — `==` compares references, `.equals()` compares content",
        wrong: [
          "true then true — both point at the interned pool string",
          "false then false — `new String` creates a different value",
          "true then false — `==` compares content, `.equals()` compares references",
        ],
        explanation:
          "`==` on objects compares REFERENCES (is it the same object in memory?). `new String(\"hello\")` forces a fresh object, so it is not the pooled literal `b` — `a == b` is false. `.equals()` is overridden by String to compare character content — true. This is the #1 Java interview trap for people coming from TypeScript, where `===` on strings compares value. Rule: `==` only for primitives and null-checks; `.equals()` for every object comparison.",
        docRef: ref("§2 — Java for the TypeScript brain"),
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "java-equals-refs",
        prompt:
          'Two string LITERALS: `String a = "hi"; String b = "hi";` — what does `a == b` give, and can you rely on it?',
        correct:
          "Usually true because literals are interned in the string pool — but never rely on it; use `.equals()`",
        wrong: [
          "Always false — every string is a separate object",
          "Always true, and it's the recommended way to compare strings",
          "It throws a compile error — `==` is not defined for objects",
        ],
        explanation:
          "The JVM keeps identical string LITERALS in one shared pool (interning), so both variables usually reference the same object and `==` happens to be true. But any string built at runtime (`new String`, concatenation, user input) breaks that. Interviewers ask exactly this to see if you know WHY the wrong code sometimes works — the most dangerous kind of bug. The habit that survives: content comparison is always `.equals()` (or `Objects.equals(a, b)` if either side can be null).",
        docRef: ref("§2 — Java for the TypeScript brain"),
      });
    }
    return choice(rng, {
      genId: "java-equals-refs",
      prompt: "In TypeScript you'd write `type User = { name: string }`. The closest modern Java is:",
      correct: "`record User(String name) {}` — an immutable carrier with free equals/hashCode/toString",
      wrong: [
        "`class User { public String name; }` — records don't exist in Java",
        "`interface User { String name; }` — interfaces hold fields in Java",
        "`var User = { name: String }` — object literals, like TS",
      ],
      explanation:
        "Records (Java 16+) are the data-carrier idiom: one line declares the fields, and the compiler generates the constructor, accessors (`user.name()`), and a CONTENT-BASED `equals`/`hashCode`/`toString`. That last part matters: a plain class inherits reference-equality from `Object`, so two identical DTOs wouldn't be `.equals()` — records fix the classic trap for free. Java has no object literals and interface fields are implicitly static constants, so the other options don't compile into what you want.",
      docRef: ref("§2 — Java for the TypeScript brain"),
    });
  },
};

const typesBridge: Generator = {
  id: "java-types-bridge",
  title: "TS → Java type mapping",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "java-types-bridge",
        prompt:
          "Why does `List<int>` not compile, while `List<Integer>` is fine?",
        correct:
          "Generics only work with objects — primitives like `int` must be boxed into `Integer`",
        wrong: [
          "`int` is deprecated; `Integer` is the modern spelling",
          "Lists store numbers as strings internally, and only `Integer` can convert",
          "It does compile — the two are interchangeable everywhere",
        ],
        explanation:
          "Java splits numbers into cheap PRIMITIVES (`int`, `long`, `double` — bare values on the stack) and BOXED objects (`Integer`, `Long`, `Double`). Generic containers erase to `Object` under the hood, so they can only hold objects — hence `List<Integer>`. Auto-boxing converts back and forth silently, which hides a cost (allocation) and a trap: two `Integer`s compared with `==` are reference-compared (the small-value cache makes -128..127 'work', then it breaks). TypeScript has one `number`, so this split is new vocabulary — and a favorite screening question.",
        docRef: ref("§2 — Java for the TypeScript brain"),
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "java-types-bridge",
        prompt:
          "TypeScript interfaces are structural (any object with the right shape matches). Java interfaces are:",
        correct:
          "Nominal — a class matches only if it explicitly declares `implements Shape`",
        wrong: [
          "Structural, exactly like TypeScript",
          "Nominal for classes but structural for records",
          "Only checked at runtime via reflection",
        ],
        explanation:
          "In Java a type IS its declared name: having a `double area()` method means nothing until the class says `implements Shape`. TypeScript instead matches by shape — any object with the right members conforms. Consequence: in Java you design the interface FIRST and opt classes in; you can't retrofit a third-party class into your interface (the adapter pattern exists for exactly that gap). Knowing the word 'nominal vs structural' and one consequence is an easy senior-sounding interview answer.",
        docRef: ref("§2 — Java for the TypeScript brain"),
      });
    }
    return choice(rng, {
      genId: "java-types-bridge",
      prompt:
        "`IOException` vs `RuntimeException` — what's the practical difference when you call a method that throws each?",
      correct:
        "Checked (`IOException`) must be caught or declared with `throws`; unchecked (`RuntimeException`) compiles without either",
      wrong: [
        "Checked exceptions crash the JVM; unchecked ones are recoverable",
        "Unchecked exceptions must be declared in the method signature",
        "There is no difference — the split is purely a naming convention",
      ],
      explanation:
        "CHECKED exceptions are part of the method's signature: the compiler forces every caller to `catch` or re-declare `throws IOException` — TypeScript has nothing like it. UNCHECKED ones (anything extending `RuntimeException`, like `NullPointerException` or `IllegalArgumentException`) propagate silently. Modern style (and Spring's): wrap checked exceptions into domain-specific runtime exceptions at the boundary instead of letting `throws` clauses infect every signature. Bonus interview point: Spring's `@Transactional` rolls back on UNCHECKED exceptions by default — the split has real behavioral consequences.",
      docRef: ref("§2 — Java for the TypeScript brain"),
    });
  },
};

const collections: Generator = {
  id: "java-collections",
  title: "Collections & their costs",
  generate: (rng) => {
    const variant = rng.int(0, 3);
    if (variant === 0) {
      return choice(rng, {
        genId: "java-collections",
        prompt:
          "Interviewer: \"ArrayList or LinkedList for a list you mostly iterate and index?\" The strong answer:",
        correct:
          "ArrayList — O(1) index access and cache-friendly contiguous memory; LinkedList wins almost never in practice",
        wrong: [
          "LinkedList — insertion is O(1) so it's faster overall",
          "They're identical since both implement List",
          "Neither — arrays are always faster, so use `int[]` everywhere",
        ],
        explanation:
          "ArrayList is a dynamic array: O(1) `get(i)`, amortized O(1) append, and — the part that impresses — CACHE LOCALITY: elements sit contiguously, so iteration streams through CPU cache. LinkedList's theoretical O(1) insert needs the node reference in hand; getting there is an O(n) pointer-chase with a cache miss per hop. Saying 'LinkedList almost never wins in practice, and here's why' turns a memorized table into an understanding — which is what the question is really testing.",
        docRef: ref("§3 — Collections you must know cold"),
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "java-collections",
        prompt: "What happens inside a HashMap bucket when many keys collide (Java 8+)?",
        correct:
          "The bucket's linked list converts to a red-black tree after ~8 entries, turning worst-case O(n) into O(log n)",
        wrong: [
          "The map throws a CollisionException after 8 duplicates",
          "The whole map is rehashed into a TreeMap",
          "Nothing — colliding keys silently overwrite each other",
        ],
        explanation:
          "Colliding keys chain into a linked list per bucket; since Java 8, a bucket that grows past a threshold (8) TREEIFIES into a red-black tree, bounding lookups at O(log n) even under adversarial hash collisions (a real DoS vector before this fix). Distinct keys never overwrite — only an `.equals()` key replaces a value. This is the classic 'do you know your tools one level down' question; the phrase 'treeify at 8, red-black tree' is exactly the credential it's fishing for.",
        docRef: ref("§3 — Collections you must know cold"),
      });
    }
    if (variant === 2) {
      return choice(rng, {
        genId: "java-collections",
        prompt: "You need a stack in Java for a DSA problem. The idiomatic choice is:",
        correct: "`ArrayDeque` — `push`/`pop`/`peek` on a ring buffer; the legacy `Stack` class is discouraged",
        wrong: [
          "`java.util.Stack` — it's named Stack, so it's the intended tool",
          "`LinkedList` used only from the tail",
          "`PriorityQueue` with insertion order as priority",
        ],
        explanation:
          "`java.util.Stack` extends `Vector` — every operation synchronized (slow for no benefit) and it inherits list methods that break the stack abstraction. `ArrayDeque` is the modern answer: a resizable ring buffer with O(1) operations at both ends, serving as both stack (`push`/`pop`) and queue (`offer`/`poll`) — one class covers both DSA patterns. Using it in your travel-week Java re-solves (stacks, monotonic stacks, BFS queues) signals current-Java fluency; reaching for `Stack` signals a 2005 textbook.",
        docRef: ref("§3 — Collections you must know cold"),
      });
    }
    return choice(rng, {
      genId: "java-collections",
      prompt:
        "You need key→value lookups AND range queries over sorted keys (\"all scores between 800 and 1200\"). Which map?",
      correct: "`TreeMap` — a red-black tree with O(log n) ops and `subMap`/`ceilingKey` range queries",
      wrong: [
        "`HashMap` — O(1) beats O(log n) for every use case",
        "`HashSet` — sets are sorted by default",
        "`ArrayList` of pairs, re-sorted before every query",
      ],
      explanation:
        "HashMap's O(1) comes from scattering keys by hash — which destroys ordering, so 'everything between X and Y' means scanning all entries. TreeMap keeps keys in a red-black tree: O(log n) per operation, but the keys are ALWAYS sorted, unlocking `subMap(800, 1200)`, `ceilingKey`, `firstEntry` — range queries in O(log n + matches). The trade-off sentence interviewers want: 'HashMap when I only ever look up exact keys; TreeMap the moment order or ranges matter.'",
      docRef: ref("§3 — Collections you must know cold"),
    });
  },
};

const equalsHashcode: Generator = {
  id: "java-equals-hashcode",
  title: "equals/hashCode contract",
  generate: (rng) => {
    const variant = rng.int(0, 1);
    if (variant === 0) {
      return choice(rng, {
        genId: "java-equals-hashcode",
        prompt:
          "A class overrides `equals()` but NOT `hashCode()`, then gets used as a HashMap key. What breaks?",
        correct:
          "Two equal objects can land in different buckets — `map.get(equalCopy)` misses entries that are there",
        wrong: [
          "Nothing — hashCode has a safe default that follows equals",
          "The compiler rejects the class until both are overridden",
          "The map throws IllegalStateException on the first put",
        ],
        explanation:
          "HashMap finds the bucket by `hashCode()` FIRST, then checks `equals()` within it. Default `hashCode()` is identity-based, so an equal-by-content copy hashes to a different bucket and the lookup never reaches your `equals()` — the entry is 'lost' while plainly in the map. The contract: equal objects MUST produce equal hash codes. It compiles fine and fails silently, which is why it's a beloved interview question — and why records (free consistent pair) are the safe default for key types.",
        docRef: ref("§3 — Collections you must know cold"),
      });
    }
    return choice(rng, {
      genId: "java-equals-hashcode",
      prompt: "Why are records the low-risk choice for HashMap keys and DTOs?",
      correct:
        "The compiler generates content-based equals AND hashCode together, so the contract can't drift",
      wrong: [
        "Records hash faster because they're stored off-heap",
        "Records are mutable, so keys can be updated in place",
        "HashMap treats records specially and skips hashing them",
      ],
      explanation:
        "The equals/hashCode contract usually breaks through DRIFT: someone adds a field, updates `equals`, forgets `hashCode` — silent lookup failures follow. `record User(String name, int age)` generates both from the same field list on every compile, so they cannot disagree. Records are also shallowly IMMUTABLE — final fields — which is precisely what you want in a key (a key that mutates after insertion is unfindable at its old bucket). One interview sentence: 'I default to records for value types; the generated equals/hashCode keeps hash collections correct by construction.'",
      docRef: ref("§3 — Collections you must know cold"),
    });
  },
};

const streams: Generator = {
  id: "java-streams",
  title: "Streams vs array methods",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "java-streams",
        prompt: "The Java equivalent of `users.filter(u => u.age >= 18).map(u => u.name)` is:",
        correct:
          "`users.stream().filter(u -> u.age() >= 18).map(User::name).toList()`",
        wrong: [
          "`users.filter(u -> u.age() >= 18).map(User::name)` — List has filter/map directly",
          "`Stream.filter(users, u -> u.age() >= 18).map(User::name)`",
          "`users.stream().where(u -> u.age() >= 18).select(User::name).toList()`",
        ],
        explanation:
          "Java's List has no `filter`/`map` — you enter the Stream world with `.stream()`, chain the operations, and EXIT with a terminal op (`.toList()`, `.collect(...)`, `.count()`). `User::name` is a method reference, shorthand for `u -> u.name()`. `where`/`select` is C# LINQ — a planted distractor. The mental model transfers exactly from TS array chains; only the entry/exit ceremony is new.",
        docRef: ref("§4 — Streams: your array methods, Java-flavored"),
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "java-streams",
        prompt:
          "A stream pipeline has `.filter(...)` and `.map(...)` but no terminal operation. What executes?",
        correct: "Nothing — intermediate ops are lazy; work happens only when a terminal op runs",
        wrong: [
          "Everything — each chained call processes the whole list immediately",
          "Only the filter runs; map waits for a terminal op",
          "It throws IllegalStateException at the end of the statement",
        ],
        explanation:
          "Intermediate operations (`filter`, `map`, `sorted`) just BUILD a pipeline description; nothing touches the data until a TERMINAL operation (`toList`, `forEach`, `count`, `reduce`) pulls elements through. Without one, the pipeline is dead code that compiles and silently does nothing — a real bug class. Same idea as a Promise nobody awaits. Bonus: laziness lets `findFirst()` short-circuit — elements flow one at a time through the whole chain, not list-by-list.",
        docRef: ref("§4 — Streams: your array methods, Java-flavored"),
      });
    }
    return choice(rng, {
      genId: "java-streams",
      prompt: "Count users per city into a `Map<String, Long>` — the idiomatic stream:",
      correct:
        "`users.stream().collect(Collectors.groupingBy(User::city, Collectors.counting()))`",
      wrong: [
        "`users.stream().map(User::city).count()` — count() can group by key",
        "`users.stream().reduce(new HashMap<>(), (m, u) -> m)` — reduce is for maps",
        "`users.stream().groupBy(User::city).size()`",
      ],
      explanation:
        "`Collectors.groupingBy(keyFn, downstream)` is THE aggregation idiom: partition by key, then apply a downstream collector per group (`counting()`, `toList()`, `summingInt(...)`). It replaces the manual `computeIfAbsent` loop you'd write in TS with `reduce`. Plain `.count()` collapses the whole stream to one number, and `groupBy` doesn't exist on Stream. Fair warning from the supplement: don't over-stream in interviews — a loop you can explain beats a pipeline you can't.",
      docRef: ref("§4 — Streams: your array methods, Java-flavored"),
    });
  },
};

const mavenSetup: Generator = {
  id: "java-maven",
  title: "Maven & project setup",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return text({
        genId: "java-maven",
        prompt:
          "Your `pnpm dev` reflex in a Maven Spring Boot project — which command starts the app? (starts with ./)",
        answers: ["./mvnw spring-boot:run", "mvnw spring-boot:run"],
        placeholder: "./mvnw …",
        explanation:
          "`./mvnw` is the Maven WRAPPER — a checked-in script that downloads the exact Maven version the project pins, so 'works on my machine' dies at the root (same spirit as committing a lockfile). `spring-boot:run` compiles and starts the app with devtools hot-restart if present. The other two you'll type daily: `./mvnw test` (= pnpm test) and `./mvnw package` (build the executable jar). Interviewers like hearing 'wrapper, so the build is reproducible without a local Maven install.'",
        docRef: ref("§5 — Maven and Spring Initializr"),
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "java-maven",
        prompt: "The `package.json` of a Maven project is:",
        correct: "`pom.xml` — dependencies, plugins, and the build lifecycle in one XML file",
        wrong: [
          "`build.gradle` — every Maven project has one",
          "`maven.json` — Maven's JSON manifest",
          "`MANIFEST.MF` — where dependencies are declared",
        ],
        explanation:
          "`pom.xml` (Project Object Model) declares coordinates (groupId/artifactId/version), dependencies, and build plugins — your `package.json` + build scripts in XML. Gradle's `build.gradle` is the COMPETING build tool, not part of Maven (knowing 'Maven = XML/convention, Gradle = Groovy-or-Kotlin script/flexible' is a tidy interview one-liner). `MANIFEST.MF` is jar metadata written during packaging, not something you edit for dependencies. Spring Initializr (start.spring.io) generates the whole skeleton — the standard project birth ritual.",
        docRef: ref("§5 — Maven and Spring Initializr"),
      });
    }
    return choice(rng, {
      genId: "java-maven",
      prompt: "Idiomatic Spring Boot package layout groups code by:",
      correct:
        "Feature — `contest/` holds its controller, service, repository, entity together (bounded-context style)",
      wrong: [
        "Layer — all controllers in `controllers/`, all services in `services/`",
        "File size — large classes in `core/`, small ones in `util/`",
        "Alphabet — packages `a/` through `z/` for class names",
      ],
      explanation:
        "Package-by-feature keeps everything a feature needs in one place — the same bounded-context instinct as your NestJS modules, and it makes package-private visibility meaningful (a repository only its own feature can see). Package-by-layer scatters one feature across the tree and every change touches three directories. It also sets up Spring's component scanning cleanly: `@SpringBootApplication` scans its own package downward, so features nested under the root class are found automatically.",
      docRef: ref("§5 — Maven and Spring Initializr"),
    });
  },
};

const springDi: Generator = {
  id: "java-spring-di",
  title: "Spring DI vs Nest",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "java-spring-di",
        prompt: "NestJS `@Injectable()` maps to which Spring annotation, managed by what?",
        correct: "`@Service`/`@Component` — a bean managed by the ApplicationContext (the DI container)",
        wrong: [
          "`@Autowired` — it marks a class as injectable",
          "`@Bean` on the class itself — the only way to register anything",
          "`@Entity` — all Spring-managed classes are entities",
        ],
        explanation:
          "Spring's DI container is the APPLICATION CONTEXT; the objects it manages are BEANS. `@Component` (and its role-flavored aliases `@Service`, `@Repository`, `@RestController`) marks a class for component scanning — Nest's `@Injectable()`. `@Autowired` sits at the injection SITE (and is optional on a lone constructor), `@Bean` registers method RETURN VALUES inside `@Configuration` classes (for library types you can't annotate), and `@Entity` is JPA persistence, unrelated to DI. Wrong-option vocabulary is exactly what screeners probe.",
        docRef: ref("§1 — The mental model: you already know Spring"),
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "java-spring-di",
        prompt:
          "Interviewer: \"Constructor injection vs field `@Autowired` — which do you use and why?\" The strong answer:",
        correct:
          "Constructor — dependencies are final, explicit, and the class works in plain unit tests with `new`",
        wrong: [
          "Field — fewer lines of code means fewer bugs",
          "Neither — modern Spring uses service locators",
          "They're equivalent; the choice is pure style",
        ],
        explanation:
          "Constructor injection makes dependencies part of the type's contract: `final` fields (no mutation, no half-initialized state), impossible to construct without them, and unit-testable with `new Service(mockRepo)` — no Spring context needed. Field `@Autowired` hides dependencies, needs reflection to test, and allows circular dependencies to fester. Spring's own docs recommend constructors, and on a single constructor the annotation is implicit. This question is a near-certainty in Spring interviews; critiquing field injection IS the expected answer.",
        docRef: ref("§1 — The mental model: you already know Spring"),
      });
    }
    return choice(rng, {
      genId: "java-spring-di",
      prompt: "NestJS needs `@Module()` files to wire providers. Spring's equivalent wiring is:",
      correct:
        "Component scanning from the `@SpringBootApplication` package + `@Configuration` classes for manual beans",
      wrong: [
        "`@Module` classes listing providers and imports, same as Nest",
        "An XML file listing every bean, required in Spring Boot",
        "A `modules.json` manifest read at startup",
      ],
      explanation:
        "Spring Boot finds beans by SCANNING packages beneath the main class — no module files, no explicit provider lists; annotate and it's wired. For objects you can't annotate (third-party types, tunable construction) a `@Configuration` class exposes `@Bean` methods. XML wiring is Spring's 2005 legacy — mentioning it only as history scores points. Trade-off worth saying aloud: Nest's modules make the graph explicit; Spring's scanning is less ceremony but the graph is implicit — same architecture, different visibility defaults.",
      docRef: ref("§1 — The mental model: you already know Spring"),
    });
  },
};

const restAnnotations: Generator = {
  id: "java-rest",
  title: "REST controllers",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "java-rest",
        prompt:
          "In `@GetMapping(\"/{id}\") ContestDto find(@PathVariable long id)`, what does `@PathVariable` do?",
        correct:
          "Binds the `{id}` segment of the URL into the `id` parameter — Nest's `@Param('id')`",
        wrong: [
          "Reads `?id=` from the query string",
          "Parses the request body as JSON into `id`",
          "Declares a server-side session variable named id",
        ],
        explanation:
          "The mapping template's `{id}` placeholder pairs with `@PathVariable` by name, with automatic type conversion to `long` (a non-numeric segment → 400 before your code runs). Query params use `@RequestParam`, bodies use `@RequestBody` — the same trio as Nest's `@Param`/`@Query`/`@Body`. Mixing up path and query binding is a favorite quick-fire screen; the tell is the `{}` in the route template.",
        docRef: ref("§6 — REST with Spring Boot"),
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "java-rest",
        prompt:
          "What makes `@Valid @RequestBody CreateContestDto dto` reject bad input, and what arrives when `name` is blank?",
        correct:
          "`@Valid` triggers Bean Validation on the DTO's constraints (`@NotBlank`, `@Size`) — a blank name yields an automatic 400",
        wrong: [
          "`@RequestBody` validates automatically; `@Valid` is decorative",
          "Validation only happens if the controller calls `dto.validate()`",
          "Blank fields throw a 500 unless caught in a try/catch",
        ],
        explanation:
          "Constraints live ON the DTO (`record CreateContestDto(@NotBlank @Size(max = 120) String name, @Future Instant startsAt)`), but they fire only where `@Valid` cascades into the parameter — forget it and invalid data flows straight through, silently. Violations become `MethodArgumentNotValidException` → 400 with field errors before your method body runs. This is Nest's ValidationPipe + class-validator, relocated into the type. The planted trap is believing `@RequestBody` alone validates — it only deserializes.",
        docRef: ref("§6 — REST with Spring Boot"),
      });
    }
    return choice(rng, {
      genId: "java-rest",
      prompt: "Nest's exception filters — one class mapping domain exceptions to HTTP responses — become:",
      correct:
        "`@RestControllerAdvice` with `@ExceptionHandler` methods returning ProblemDetail/ResponseEntity",
      wrong: [
        "try/catch inside every controller method",
        "`@ErrorPage` annotations on the application class",
        "A servlet `web.xml` error-code mapping",
      ],
      explanation:
        "`@RestControllerAdvice` is a global interceptor for exceptions escaping any controller; each `@ExceptionHandler(ContestNotFound.class)` method translates one domain exception into an HTTP response — Spring Boot 3 favors `ProblemDetail` error bodies (RFC-7807, a standard JSON shape for API errors). Controllers stay clean: services throw domain exceptions, one advice class owns the HTTP vocabulary. Sprinkling try/catch per endpoint is the antipattern this exists to kill; `web.xml` is servlet-era history. Same separation of concerns as your Nest filters — different annotation.",
      docRef: ref("§6 — REST with Spring Boot"),
    });
  },
};

const jpa: Generator = {
  id: "java-jpa",
  title: "Spring Data JPA",
  generate: (rng) => {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      return choice(rng, {
        genId: "java-jpa",
        prompt:
          "`List<Submission> findByAuthorIdOrderByCreatedAtDesc(Long authorId)` has no implementation anywhere. Who writes the query?",
        correct:
          "Spring Data parses the METHOD NAME and derives the SQL at startup — no implementation needed",
        wrong: [
          "The compiler generates SQL from the return type",
          "It fails at runtime until you add an @Query annotation",
          "Hibernate requires a matching .sql file on the classpath",
        ],
        explanation:
          "Repository interfaces extend `JpaRepository`; Spring Data proxies them and PARSES method names — `findBy` + `AuthorId` + `OrderByCreatedAtDesc` — into queries at startup (a typo like `findByAutorId` fails fast at boot, not in production). Prisma generates a client from a schema; JPA derives queries from interface names — same 'no hand-written SQL' goal, opposite direction. When names get unwieldy or you need joins, you graduate to explicit `@Query` JPQL (Java's SQL-like query language that works on entities instead of tables).",
        docRef: ref("§7 — Data with Spring Data JPA"),
      });
    }
    if (variant === 1) {
      return choice(rng, {
        genId: "java-jpa",
        prompt:
          "You loop over submissions calling `s.getAuthor().getName()` and see hundreds of SQL queries. Diagnosis and fix?",
        correct:
          "The N+1 problem — lazy relations load one query per row; fix with `join fetch` (or @EntityGraph) to load in one query",
        wrong: [
          "The connection pool is too small — raise its size",
          "Hibernate caches are off — enable second-level cache",
          "Normal JPA behavior that cannot be changed",
        ],
        explanation:
          "One query fetched N submissions; each LAZY `author` access fires one more — N+1 total, invisible at dev row counts and lethal in production. The fix is fetching the relation WITH the original query: `@Query(\"select s from Submission s join fetch s.author where …\")` or an `@EntityGraph`. This is EXACTLY Phase 1's N+1 from Prisma's `include` world — same disease, JPA dialect. Pool size and caching treat symptoms; naming 'N+1, join fetch' in an interview is the pass signal.",
        docRef: ref("§7 — Data with Spring Data JPA"),
      });
    }
    return choice(rng, {
      genId: "java-jpa",
      prompt:
        "A `@Transactional` service method throws a checked `IOException` mid-way. What does Spring do by default?",
      correct:
        "COMMITS anyway — default rollback triggers only on unchecked exceptions; checked ones need `rollbackFor`",
      wrong: [
        "Rolls back — any exception aborts the transaction",
        "Retries the method three times, then rolls back",
        "Deadlocks until the transaction timeout expires",
      ],
      explanation:
        "Spring's default rollback rule covers `RuntimeException` and `Error` ONLY — a checked exception escaping a `@Transactional` method still commits the partial writes. The fix is explicit: `@Transactional(rollbackFor = Exception.class)`. The rule descends from the old idea that checked exceptions are 'recoverable business conditions'; in practice it's a partial-commit landmine and a CLASSIC interview subtlety — precisely because it's counterintuitive, it separates people who've read the manual from people who've been burned by it (or drilled it).",
      docRef: ref("§7 — Data with Spring Data JPA"),
    });
  },
};

const security: Generator = {
  id: "java-security",
  title: "Spring Security",
  generate: (rng) => {
    const variant = rng.int(0, 1);
    if (variant === 0) {
      return choice(rng, {
        genId: "java-security",
        prompt: "Architecturally, where does Spring Security do its work?",
        correct:
          "In a FILTER CHAIN that runs before any controller — your Nest guards, as servlet filters",
        wrong: [
          "Inside each controller method, via inherited base-class checks",
          "In the database, through row-level security policies",
          "In a proxy annotation processor at compile time",
        ],
        explanation:
          "Every request passes through an ordered chain of servlet filters — authentication resolves WHO you are, authorization rules (`authorizeHttpRequests`) decide WHETHER the request proceeds — all before Spring's front router (the DispatcherServlet) hands off to a controller. Rejections never touch your code. This is the same boundary-enforcement idea as Nest guards/middleware, moved to the servlet layer, and 'filter chain' is the phrase Spring Security interview answers are graded on. Filter ORDER matters (CORS before auth, etc.) — a classic follow-up.",
        docRef: ref("§8 — Security in one page"),
      });
    }
    return choice(rng, {
      genId: "java-security",
      prompt:
        "A stateless JWT API config calls `csrf(csrf -> csrf.disable())` and sets `SessionCreationPolicy.STATELESS`. Defensible?",
      correct:
        "Yes — CSRF rides on cookies sent automatically; bearer tokens in an Authorization header aren't, and no session means nothing to fixate",
      wrong: [
        "No — disabling CSRF is always a vulnerability",
        "No — JWTs require sessions to store the signing key",
        "Yes, but only because CSRF attacks target databases, not APIs",
      ],
      explanation:
        "CSRF exploits the browser ATTACHING credentials (session cookies) automatically to cross-site requests. A bearer token lives in a header your frontend attaches explicitly — a forged cross-site request can't add it — so CSRF protection defends nothing here and the stateless policy stops Spring creating sessions at all. The nuance interviewers fish for: this holds ONLY while the JWT stays out of automatically-sent cookies; store it in a cookie and CSRF is back on the table. Phase 1's XSS/CSRF knowledge applies verbatim; bcrypt via `BCryptPasswordEncoder` likewise.",
      docRef: ref("§8 — Security in one page"),
    });
  },
};

const testing: Generator = {
  id: "java-testing",
  title: "JUnit / Mockito / Testcontainers",
  generate: (rng) => {
    const variant = rng.int(0, 1);
    if (variant === 0) {
      return choice(rng, {
        genId: "java-testing",
        prompt:
          "Unit-testing a service without a database: which pairing, playing which roles?",
        correct:
          "JUnit 5 runs the test; Mockito stubs the repository — `when(repo.existsByName(\"x\")).thenReturn(false)`",
        wrong: [
          "@SpringBootTest boots the full context; H2 replaces Postgres",
          "Testcontainers starts Postgres; JUnit asserts against real rows",
          "MockMvc fakes HTTP requests against the running server",
        ],
        explanation:
          "The unit level tests ONE class with its collaborators stubbed: Mockito's `@Mock` creates a fake repository, `when(…).thenReturn(…)` scripts it, and the service is constructed with plain `new` — no Spring, no database, milliseconds per test (this is WHY constructor injection matters). The other options are real tools at HEAVIER levels: `@WebMvcTest`+MockMvc for the web slice, `@SpringBootTest`+Testcontainers for integration. Knowing which level each tool belongs to is the actual interview question hiding under 'how do you test'.",
        docRef: ref("§9 — Testing: the JUnit/Mockito trio"),
      });
    }
    return choice(rng, {
      genId: "java-testing",
      prompt: "Why do integration tests use Testcontainers instead of an in-memory H2 database?",
      correct:
        "Testcontainers runs the REAL Postgres in Docker — H2's SQL dialect differences let bugs pass that production will catch",
      wrong: [
        "H2 is paid software; Testcontainers is the free alternative",
        "Testcontainers tests run faster than H2 tests",
        "H2 cannot store more than 1000 rows",
      ],
      explanation:
        "H2 approximates Postgres: dialect gaps (JSON operators, window-function edges, constraint behavior, locking) mean a green H2 suite can hide a red production bug — testing against a lookalike verifies the lookalike. Testcontainers boots a genuine Postgres container per suite and tears it down; slower to start, but what passed IS what ships. The supplement's point stands: 'my integration tests run against a real Postgres container' is a sentence very few intern candidates can say — and it lands in the same breath as your Docker/Phase-0 story.",
      docRef: ref("§9 — Testing: the JUnit/Mockito trio"),
    });
  },
};

const controllerCode: Generator = {
  id: "java-rest-code",
  title: "✍️ Write a REST controller",
  generate: (rng) => {
    const entity = rng.pick(["Contest", "Badge", "Track"]);
    const lower = entity.toLowerCase();
    return codeTask({
      genId: "java-rest-code",
      prompt:
        `Write a minimal Spring REST controller for ${lower}s: class \`${entity}Controller\` annotated as a REST controller mapped to \`/api/${lower}s\`, with the service injected via CONSTRUCTOR (no field @Autowired), and one GET-by-id endpoint \`find\` taking the path variable \`id\`.`,
      language: "java",
      starter: `// ${entity}Service is already a @Service bean\nclass ${entity}Controller {\n\n}\n`,
      solution: `@RestController\n@RequestMapping("/api/${lower}s")\nclass ${entity}Controller {\n  private final ${entity}Service service;\n\n  ${entity}Controller(${entity}Service service) {\n    this.service = service;\n  }\n\n  @GetMapping("/{id}")\n  ${entity}Dto find(@PathVariable long id) {\n    return service.find(id);\n  }\n}\n`,
      explanation:
        "The four moving parts: `@RestController` marks the bean AND serializes return values to JSON; `@RequestMapping` sets the base path; the `private final` field + constructor is idiomatic injection (a single constructor needs no `@Autowired`); `@GetMapping(\"/{id}\")` + `@PathVariable` binds the URL segment. Field `@Autowired` is the style interviewers ask you to critique — final constructor injection keeps the class testable with plain `new`. This skeleton is muscle memory for the travel-week bridge service; typing it cold is the point.",
      docRef: ref("§6 — REST with Spring Boot"),
      checks: [
        { re: `@RestController`, label: "class is annotated @RestController" },
        { re: `@RequestMapping\\(\\s*"/api/${lower}s"\\s*\\)`, label: `base path mapped to /api/${lower}s` },
        { re: `private\\s+final\\s+${entity}Service`, label: "service stored in a private final field" },
        { re: `${entity}Controller\\s*\\(\\s*${entity}Service\\s+\\w+\\s*\\)`, label: "constructor receives the service" },
        { re: `@Autowired`, expect: false, label: "no field @Autowired (constructor injection instead)" },
        { re: `@GetMapping\\(\\s*"/\\{id\\}"\\s*\\)`, label: 'GET endpoint mapped to "/{id}"' },
        { re: `@PathVariable\\s+long\\s+id`, label: "id bound with @PathVariable long id" },
      ],
    });
  },
};

const jpaCode: Generator = {
  id: "java-jpa-code",
  title: "✍️ Write a JPA repository",
  generate: (rng) => {
    const status = rng.pick(["ACCEPTED", "REJECTED", "PENDING"]);
    return codeTask({
      genId: "java-jpa-code",
      prompt:
        `Write a Spring Data repository for \`Submission\` (id type \`Long\`): an interface \`SubmissionRepository\` extending JpaRepository, with (1) a DERIVED query returning all submissions of one author ordered by \`createdAt\` descending, and (2) an explicit \`@Query\` named \`withAuthorByStatus\` that uses \`join fetch\` on \`s.author\` to avoid the N+1 (status parameter, e.g. ${status}).`,
      language: "java",
      starter: `interface SubmissionRepository {\n  // 1) derived query: by author id, newest first\n\n  // 2) @Query with join fetch, filtered by status\n\n}\n`,
      solution: `interface SubmissionRepository extends JpaRepository<Submission, Long> {\n  List<Submission> findByAuthorIdOrderByCreatedAtDesc(Long authorId);\n\n  @Query("select s from Submission s join fetch s.author where s.status = :status")\n  List<Submission> withAuthorByStatus(Status status);\n}\n`,
      explanation:
        "Extending `JpaRepository<Submission, Long>` supplies the CRUD; the derived method name `findByAuthorIdOrderByCreatedAtDesc` is PARSED into SQL at startup (typos fail at boot — a feature). The second query is the N+1 kill switch: `join fetch s.author` loads the relation in the same query, so iterating results never triggers per-row lazy loads. Derived names for simple lookups, explicit JPQL the moment a join or fetch strategy matters — that split is the interview answer, and this file is the Prisma-schema equivalent you'll write in the bridge service.",
      docRef: ref("§7 — Data with Spring Data JPA"),
      checks: [
        { re: `extends\\s+JpaRepository<\\s*Submission\\s*,\\s*Long\\s*>`, label: "extends JpaRepository<Submission, Long>" },
        { re: `findByAuthorIdOrderByCreatedAtDesc`, label: "derived query: findByAuthorIdOrderByCreatedAtDesc" },
        { re: `@Query\\(`, label: "explicit @Query present" },
        { re: `join\\s+fetch\\s+s\\.author`, flags: "i", label: "join fetch s.author (N+1 fix)" },
        { re: `withAuthorByStatus`, label: "method named withAuthorByStatus" },
      ],
    });
  },
};

export const javaSpringBootTopic: Topic = {
  id: "java-spring-boot",
  title: "Java & Spring Boot",
  icon: "☕",
  blurb:
    "The enterprise bridge: Nest → Spring, Prisma → JPA, array methods → streams — plus the == /.equals() and @Transactional traps ESN interviewers plant.",
  docSlug: "java-spring-boot",
  docTitle: "Java & Spring Boot — the enterprise bridge",
  generators: [
    equalsVsRefs,
    typesBridge,
    collections,
    equalsHashcode,
    streams,
    mavenSetup,
    springDi,
    restAnnotations,
    jpa,
    security,
    testing,
    controllerCode,
    jpaCode,
  ],
};
