/**
 * Exercises for the Java & Spring Boot guide.
 *
 * Written for someone arriving from NestJS: every exercise names the concept
 * they already own and then shows Spring's word for it. The genuinely new
 * material is the persistence context, which is where the surprises live.
 */
import type { GuideExercise } from "./types";

export const javaSpringExercises: GuideExercise[] = [
  {
    id: "nest-to-spring",
    title: "Translate what you already know",
    prompt: "Write Spring's equivalent for each NestJS concept.",
    language: "text",
    given: `1. @Controller('problems')
2. @Injectable() service
3. constructor injection
4. @Module
5. a DTO with class-validator
6. AuthGuard / @Roles('ADMIN')`,
    starter: `1.
2.
3.
4.
5.
6.
`,
    solution: `1. @RestController + @RequestMapping("/problems")
2. @Service (a @Component stereotype)
3. constructor injection — identical, and preferred over @Autowired on fields
4. no direct equivalent — @SpringBootApplication component-scans the package tree
5. a record or class with jakarta.validation annotations + @Valid on the parameter
6. a Spring Security filter chain + @PreAuthorize("hasRole('ADMIN')")
`,
    hint: "Five of the six map almost one-to-one. The odd one out is the module system — Spring does not have one.",
    explanation:
      "**The concepts transfer; only the vocabulary changes.** That is why this is weeks 9–11 rather than a fresh start. The one real difference is item 4: Nest makes the dependency graph explicit in `@Module`, while Spring scans the package tree and wires by type — less ceremony, and a graph you cannot read off the page. And because Java interfaces survive to runtime, Spring matches on them directly, so none of this needs an injection token.",
    checks: [
      { re: "1\\.[^\\n]*RestController", flags: "mi", label: "1 — @RestController" },
      { re: "2\\.[^\\n]*@?Service", flags: "mi", label: "2 — @Service" },
      { re: "3\\.[^\\n]*constructor", flags: "mi", label: "3 — constructor injection" },
      { re: "4\\.[^\\n]*(scan|no |package)", flags: "mi", label: "4 — component scanning, not modules" },
      { re: "5\\.[^\\n]*(@?Valid|jakarta|validation)", flags: "mi", label: "5 — @Valid" },
      { re: "6\\.[^\\n]*(PreAuthorize|Security|filter)", flags: "mi", label: "6 — Spring Security" },
    ],
  },

  {
    id: "spring-controller",
    title: "Write the controller",
    prompt:
      "Write a REST controller for problems: list with a page parameter, get one by slug returning 404 when absent, and create returning 201.",
    language: "java",
    given: `record ProblemDto(Long id, String slug, String title) {}
record CreateProblemRequest(@NotBlank String slug, @NotBlank String title) {}
// ProblemService: List<ProblemDto> list(int page)
//                 Optional<ProblemDto> findBySlug(String slug)
//                 ProblemDto create(CreateProblemRequest request)`,
    starter: `@RestController
@RequestMapping("/problems")
public class ProblemController {
    private final ProblemService service;

    // TODO: constructor

    // TODO: the three endpoints
}
`,
    solution: `@RestController
@RequestMapping("/problems")
public class ProblemController {
    private final ProblemService service;

    public ProblemController(ProblemService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProblemDto> list(@RequestParam(defaultValue = "0") int page) {
        return service.list(page);
    }

    @GetMapping("/{slug}")
    public ProblemDto get(@PathVariable String slug) {
        return service.findBySlug(slug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProblemDto create(@Valid @RequestBody CreateProblemRequest request) {
        return service.create(request);
    }
}
`,
    hint: "`@Valid` is what actually triggers validation — the annotations on the record do nothing without it. That is the same trap as forgetting Nest's ValidationPipe.",
    explanation:
      "The shapes line up with what you already write: `@GetMapping` is `@Get`, `@PathVariable` is `@Param`, `@RequestBody` is `@Body`. Two Spring-specific things matter. **`@Valid` is the trigger** — the constraint annotations are inert without it, exactly like a DTO with no `ValidationPipe` registered. And `Optional.orElseThrow` is the idiomatic 404: Java's `Optional` makes 'might be absent' part of the signature rather than a nullable you have to remember.",
    checks: [
      { re: "public ProblemController\\(ProblemService", label: "constructor injection" },
      { re: "@GetMapping\\b", label: "a GET for the list" },
      { re: "@GetMapping\\(\"/\\{slug\\}\"\\)", label: "a GET by path variable" },
      { re: "@PathVariable", label: "binds the path variable" },
      { re: "@RequestParam", label: "binds the query parameter" },
      { re: "@PostMapping", label: "a POST to create" },
      { re: "@ResponseStatus\\(HttpStatus\\.CREATED\\)", label: "returns 201 on create" },
      { re: "@Valid", label: "@Valid, or the constraints never run" },
      { re: "orElseThrow|NOT_FOUND", label: "404 when absent" },
    ],
  },

  {
    id: "jpa-entity",
    title: "Map an entity",
    prompt:
      "Write the JPA entity for a problem with a generated id, a unique slug, a required title, and a lazy one-to-many of test cases.",
    language: "java",
    given: `// jakarta.persistence.*
// TestCase has: @ManyToOne Problem problem;`,
    starter: `@Entity
public class Problem {
    // TODO
}
`,
    solution: `@Entity
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @OneToMany(mappedBy = "problem", fetch = FetchType.LAZY)
    private List<TestCase> testCases = new ArrayList<>();

    protected Problem() {}  // JPA needs a no-arg constructor
}
`,
    hint: "`mappedBy` says the OTHER side owns the foreign key. Without it, JPA creates a join table you did not ask for.",
    explanation:
      "`mappedBy` is the one to get right: it marks this side as the *inverse* of the relationship, so the foreign key lives on `TestCase` where it belongs. Omit it and Hibernate assumes both sides are owners and generates a join table. `FetchType.LAZY` is the default for `@OneToMany` and should stay that way — eager fetching a collection is how a list endpoint quietly becomes an N+1. And the protected no-arg constructor exists because Hibernate instantiates entities reflectively before populating them.",
    checks: [
      { re: "@Entity", label: "is an entity" },
      { re: "@Id", label: "has an id" },
      { re: "@GeneratedValue", label: "the id is generated" },
      { re: "unique\\s*=\\s*true", label: "the slug is unique" },
      { re: "nullable\\s*=\\s*false", label: "required columns are non-null" },
      { re: "@OneToMany", label: "maps the collection" },
      { re: "mappedBy", label: "`mappedBy` — the other side owns the FK" },
      { re: "FetchType\\.LAZY", label: "lazy, so a list query is not an N+1" },
      { re: "protected Problem\\(\\)|public Problem\\(\\)", label: "a no-arg constructor for JPA" },
    ],
  },

  {
    id: "persistence-context",
    title: "Explain the dirty check",
    prompt:
      "This method has no `save()` call and the title still changes in the database. Explain why in two lines, and say what happens without `@Transactional`.",
    language: "text",
    given: `@Transactional
public void rename(Long id, String title) {
    Problem problem = repository.findById(id).orElseThrow();
    problem.setTitle(title);
    // no save()
}`,
    starter: `1. why it persists:
2. without @Transactional:
`,
    solution: `1. why it persists: findById returns a MANAGED entity attached to the persistence context. At commit, Hibernate compares it against the snapshot it took when loading, sees title changed, and issues an UPDATE automatically — this is dirty checking.
2. without @Transactional: the entity is detached as soon as the repository call returns, so the setter changes an ordinary object in memory and nothing is written. The method silently does nothing.
`,
    hint: "Hibernate keeps a snapshot of every entity it loads. Ask what it does with that snapshot when the transaction commits.",
    explanation:
      "**This is the biggest conceptual jump from Prisma**, where nothing happens without an explicit call. An entity loaded inside a transaction is *managed*: Hibernate holds a snapshot and writes any difference at commit. That makes the code terse and makes the failure mode strange — a missing `@Transactional` produces a method that runs, throws nothing, and changes nothing. It is also why entities must not escape the service layer: a detached entity silently stops saving, and a lazily-loaded field on one throws `LazyInitializationException`.",
    checks: [
      { re: "manage|persistence context|attached", flags: "i", label: "names the managed entity" },
      { re: "dirty|snapshot|compare", flags: "i", label: "explains dirty checking" },
      { re: "commit|flush", flags: "i", label: "says when the UPDATE happens" },
      { re: "detach|nothing|not (be )?(saved|written|persisted)", flags: "i", label: "explains the silent no-op without @Transactional" },
    ],
  },

  {
    id: "jpa-n-plus-one",
    title: "Fix the JPA N+1",
    prompt:
      "This runs 1 query for the problems and 1 more per problem when the DTO reads its test cases. Fix it in the repository.",
    language: "java",
    given: `// Problem has @OneToMany(mappedBy = "problem", fetch = FetchType.LAZY) List<TestCase> testCases;`,
    starter: `public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findAll();
}

// service
return repository.findAll().stream()
    .map(p -> new ProblemDto(p.getId(), p.getTitle(), p.getTestCases().size()))
    .toList();
`,
    solution: `public interface ProblemRepository extends JpaRepository<Problem, Long> {
    @Query("SELECT DISTINCT p FROM Problem p LEFT JOIN FETCH p.testCases")
    List<Problem> findAllWithTestCases();
}

// service
return repository.findAllWithTestCases().stream()
    .map(p -> new ProblemDto(p.getId(), p.getTitle(), p.getTestCases().size()))
    .toList();
`,
    hint: "`JOIN FETCH` loads the association in the same query. Plain `JOIN` does not — it only filters.",
    explanation:
      "Lazy loading is right by default and creates an N+1 the moment something touches the collection in a loop. **`JOIN FETCH` is the fix, and it is different from a plain `JOIN`**: plain joins filter, `JOIN FETCH` actually populates the association. `DISTINCT` is needed because the join multiplies parent rows by their children. The alternative is an `@EntityGraph` on the method, which is the same idea declaratively. The tell is identical to Prisma's: a query inside a loop, or a lazy field read inside one.",
    checks: [
      { re: "JOIN FETCH", label: "uses JOIN FETCH" },
      { re: "DISTINCT", label: "DISTINCT, because the join duplicates parents" },
      { re: "@Query|@EntityGraph", label: "declares it on the repository method" },
    ],
  },

  {
    id: "java-optional",
    title: "Use Optional properly",
    prompt:
      "Rewrite this so it never calls `.get()` and never returns null.",
    language: "java",
    given: `// repository.findBySlug(slug) returns Optional<Problem>`,
    starter: `public ProblemDto get(String slug) {
    Optional<Problem> found = repository.findBySlug(slug);
    if (found.isPresent()) {
        return toDto(found.get());
    }
    return null;
}
`,
    solution: `public ProblemDto get(String slug) {
    return repository.findBySlug(slug)
        .map(this::toDto)
        .orElseThrow(() -> new ProblemNotFound(slug));
}
`,
    hint: "`Optional` has `map` and `orElseThrow`. Used together there is no branch to write and no null to return.",
    explanation:
      "`isPresent()` + `get()` is `Optional` used as a nullable with extra steps — and `get()` on an empty one throws a `NoSuchElementException` that names nothing useful. `map` transforms only when a value is there, and `orElseThrow` turns absence into a named failure the caller can catch. **Returning `null` is the real bug**: it pushes the problem to the caller, who may not check, and reintroduces exactly what `Optional` exists to remove. Never return `Optional` from a field or a parameter — it belongs on return types.",
    checks: [
      { re: "\\.map\\(", label: "maps inside the Optional" },
      { re: "orElseThrow", label: "turns absence into a named error" },
      { re: "\\.get\\(\\)", expect: false, label: "no bare `.get()`" },
      { re: "return null", expect: false, label: "never returns null" },
      { re: "isPresent", expect: false, label: "no isPresent branch" },
    ],
  },

  {
    id: "spring-test",
    title: "Pick the test annotation",
    prompt: "Write the annotation for each, and one clause of why.",
    language: "text",
    given: `1. a service's logic, with a mocked repository
2. a controller's JSON and status codes, with a mocked service
3. a repository's query against a real database
4. the whole app over HTTP`,
    starter: `1.
2.
3.
4.
`,
    solution: `1. plain JUnit + Mockito — no Spring context at all; fastest
2. @WebMvcTest — loads only the web layer, with @MockBean for the service
3. @DataJpaTest — loads only JPA, ideally with Testcontainers for a real Postgres
4. @SpringBootTest(webEnvironment = RANDOM_PORT) — the full context
`,
    hint: "Only one of these needs no Spring context at all. Two load a slice. One loads everything.",
    explanation:
      "**Load the smallest slice that makes the behaviour real** — the same instinct as the testing pyramid, expressed as annotations. Item 1 needs no Spring: `new ProblemService(mockRepo)` is a constructor call, exactly as in Nest, and it is the fastest test you can write. The slice annotations exist because `@SpringBootTest` starts everything and is slow enough that a suite full of them becomes a coffee break. `@DataJpaTest` defaults to an in-memory database; Testcontainers is better, because H2 accepts SQL Postgres rejects.",
    checks: [
      { re: "1\\.[^\\n]*(JUnit|Mockito|no Spring|plain)", flags: "mi", label: "1 — no Spring context" },
      { re: "2\\.[^\\n]*@?WebMvcTest", flags: "mi", label: "2 — @WebMvcTest" },
      { re: "3\\.[^\\n]*@?DataJpaTest", flags: "mi", label: "3 — @DataJpaTest" },
      { re: "4\\.[^\\n]*@?SpringBootTest", flags: "mi", label: "4 — @SpringBootTest" },
    ],
  },

  {
    id: "streams",
    title: "Write it as a stream",
    prompt: "Rewrite this loop as a single stream pipeline.",
    language: "java",
    given: `record Problem(String title, String difficulty, int solvedCount) {}`,
    starter: `List<String> titles = new ArrayList<>();
for (Problem p : problems) {
    if (p.difficulty().equals("EASY")) {
        titles.add(p.title().toUpperCase());
    }
}
titles.sort(Comparator.naturalOrder());
`,
    solution: `List<String> titles = problems.stream()
    .filter(p -> p.difficulty().equals("EASY"))
    .map(p -> p.title().toUpperCase())
    .sorted()
    .toList();
`,
    hint: "Same three verbs as JavaScript — filter, map, sort — plus a terminal operation that collects the result.",
    explanation:
      "Streams are Java's array methods with one structural difference: they are **lazy**, and nothing runs until a terminal operation like `toList()`, `count()` or `forEach()` asks for a result. A pipeline with no terminal operation does nothing at all, silently, which is the first surprise coming from JavaScript. `toList()` (Java 16+) replaces the older `collect(Collectors.toList())` and returns an unmodifiable list, which is usually what you want.",
    checks: [
      { re: "\\.stream\\(\\)", label: "starts a stream" },
      { re: "\\.filter\\(", label: "filters" },
      { re: "\\.map\\(", label: "maps" },
      { re: "\\.sorted\\(", label: "sorts" },
      { re: "\\.toList\\(\\)|collect\\(", label: "has a terminal operation" },
      { re: "for\\s*\\(", expect: false, label: "no loop left" },
    ],
  },
];
