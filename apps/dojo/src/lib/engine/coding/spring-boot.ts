/**
 * Coding track: Spring Boot — REST controllers, dependency injection, request
 * mapping, JPA entities & repositories, and the transaction/error-handling
 * layer. Structure-checked against idiomatic Spring annotations and wiring.
 */
import { codeTask, multiFileTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingTrack } from "../coding";

const DOC = { slug: "java-spring-boot", label: "Dojo guide — Java & Spring Boot" };

/* ── Level 1 — the first endpoint & a bean ── */

const restController: Generator = {
  id: "spring-rest-controller",
  title: "Your first REST endpoint",
  generate: () =>
    codeTask({
      genId: "spring-rest-controller",
      prompt:
        "Write a `HelloController` that exposes a REST endpoint: a GET at `/hello` returning the String `\"Hello, world\"`. Mark the class as a REST controller and map the method to the GET verb.",
      language: "java",
      starter: `public class HelloController {\n  // annotate the class + add the endpoint\n}`,
      solution: `@RestController\npublic class HelloController {\n\n  @GetMapping("/hello")\n  public String hello() {\n    return "Hello, world";\n  }\n}`,
      checks: [
        { re: "@RestController", label: "class is a `@RestController`" },
        { re: "@GetMapping\\(\\s*\"/hello\"\\s*\\)", label: "method mapped to GET `/hello`" },
        { re: "return\\s+\"Hello, world\"", label: "returns the greeting string" },
      ],
      explanation:
        "`@RestController` = `@Controller` + `@ResponseBody`: it tells Spring this class handles web requests AND that each method's return value IS the response body (serialised to JSON, or plain text for a String) — no view templates. `@GetMapping(\"/hello\")` binds the method to `GET /hello`. Spring's component scan finds the class at startup and registers the route; you never touch a router table.",
      docRef: DOC,
    }),
};

const serviceBean: Generator = {
  id: "spring-service-bean",
  title: "A service bean",
  generate: () =>
    codeTask({
      genId: "spring-service-bean",
      prompt:
        "Write a `GreetingService` as a Spring-managed service bean (so it can be injected elsewhere), with a method `greet(String name)` returning `\"Hi, \" + name`.",
      language: "java",
      starter: `public class GreetingService {\n  // make it a managed bean with a greet method\n}`,
      solution: `@Service\npublic class GreetingService {\n\n  public String greet(String name) {\n    return "Hi, " + name;\n  }\n}`,
      checks: [
        { re: "@Service", label: "annotated `@Service`" },
        { re: "public\\s+String\\s+greet\\s*\\(\\s*String\\s+name\\s*\\)", label: "has `greet(String name)`" },
      ],
      explanation:
        "`@Service` marks a class as a Spring-managed bean holding business logic. At startup Spring instantiates ONE shared instance and drops it in the application context, ready to be injected wherever it's needed. `@Service`, `@Repository` and `@Component` are technically the same to the container — the different names document intent (service layer vs. data layer vs. generic). Keeping logic in services keeps controllers thin.",
      docRef: DOC,
    }),
};

/* ── Level 2 — injection, path variables & config ── */

const constructorInjection: Generator = {
  id: "spring-constructor-injection",
  title: "Constructor injection",
  generate: () =>
    codeTask({
      genId: "spring-constructor-injection",
      prompt:
        "Write a `GreetController` that depends on `GreetingService`. Inject it via a `final` field set in the CONSTRUCTOR (not field injection). Add a GET `/greet` method that calls `service.greet(\"there\")` and returns it.",
      language: "java",
      starter: `@RestController\npublic class GreetController {\n  // inject GreetingService via the constructor\n}`,
      solution: `@RestController\npublic class GreetController {\n  private final GreetingService service;\n\n  public GreetController(GreetingService service) {\n    this.service = service;\n  }\n\n  @GetMapping("/greet")\n  public String greet() {\n    return service.greet("there");\n  }\n}`,
      checks: [
        { re: "private\\s+final\\s+GreetingService", label: "holds the dependency in a `private final` field" },
        { re: "public\\s+GreetController\\s*\\(\\s*GreetingService\\s+\\w+\\s*\\)", label: "constructor takes `GreetingService`" },
        { re: "this\\.\\w+\\s*=\\s*\\w+", label: "assigns it in the constructor" },
        { re: "@Autowired", expect: false, label: "no field `@Autowired` — constructor injection is preferred" },
      ],
      explanation:
        "Constructor injection is the Spring-recommended style: Spring sees the constructor needs a `GreetingService` and passes the managed bean in automatically (no `@Autowired` needed on a single constructor). The `final` field can never be null or reassigned, the class is trivially testable (just `new GreetController(mock)`), and dependencies are explicit. Field injection (`@Autowired` on the field) hides them and breaks `final` — avoid it.",
      docRef: DOC,
    }),
};

const pathVariable: Generator = {
  id: "spring-path-variable",
  title: "Read a path variable",
  generate: () =>
    codeTask({
      genId: "spring-path-variable",
      prompt:
        "Add a GET endpoint at `/users/{id}` that captures the `{id}` path segment (as a `Long`) and returns `\"User \" + id`.",
      language: "java",
      starter: `@RestController\npublic class UserController {\n  // GET /users/{id}\n}`,
      solution: `@RestController\npublic class UserController {\n\n  @GetMapping("/users/{id}")\n  public String getUser(@PathVariable Long id) {\n    return "User " + id;\n  }\n}`,
      checks: [
        { re: "@GetMapping\\(\\s*\"/users/\\{id\\}\"\\s*\\)", label: "path template `/users/{id}`" },
        { re: "@PathVariable\\s+Long\\s+id", label: "captures it with `@PathVariable Long id`" },
      ],
      explanation:
        "The `{id}` in the path is a placeholder; `@PathVariable` binds it to a method parameter, converting the text to `Long` for you. Names must line up — `{id}` ↔ `id` — or you specify `@PathVariable(\"id\")`. Use path variables for identifying a resource (`/users/42`); use `@RequestParam` for optional filters and query strings (`/users?active=true`).",
      docRef: DOC,
    }),
};

const properties: Generator = {
  id: "spring-properties",
  title: "Configure the datasource",
  generate: () =>
    codeTask({
      genId: "spring-properties",
      prompt:
        "In `application.properties`, configure a PostgreSQL datasource: set `spring.datasource.url` to `jdbc:postgresql://localhost:5432/codearena`, and set Hibernate to update the schema with `spring.jpa.hibernate.ddl-auto=update`.",
      language: "properties",
      starter: `# application.properties`,
      solution: `spring.datasource.url=jdbc:postgresql://localhost:5432/codearena\nspring.jpa.hibernate.ddl-auto=update`,
      checks: [
        { re: "spring\\.datasource\\.url\\s*=\\s*jdbc:postgresql://localhost:5432/codearena", label: "sets the JDBC url" },
        { re: "spring\\.jpa\\.hibernate\\.ddl-auto\\s*=\\s*update", label: "sets `ddl-auto=update`" },
      ],
      explanation:
        "`application.properties` is Spring Boot's central config — externalised so the same jar runs against dev, staging and prod by swapping this file (or env vars). `ddl-auto=update` lets Hibernate evolve the schema from your `@Entity` classes, handy in dev; in production you'd use `validate` (or none) and manage schema with a migration tool like Flyway so changes are reviewed, not inferred.",
      docRef: DOC,
    }),
};

/* ── Level 3 — POST bodies & entities ── */

const postBody: Generator = {
  id: "spring-post-body",
  title: "Accept a JSON body",
  generate: () =>
    codeTask({
      genId: "spring-post-body",
      prompt:
        "Add a POST `/users` endpoint that accepts a JSON request body bound to a `CreateUserRequest` DTO and returns `\"Created \" + request.getName()`.",
      language: "java",
      starter: `@RestController\npublic class UserController {\n  // POST /users with a JSON body\n}`,
      solution: `@RestController\npublic class UserController {\n\n  @PostMapping("/users")\n  public String create(@RequestBody CreateUserRequest request) {\n    return "Created " + request.getName();\n  }\n}`,
      checks: [
        { re: "@PostMapping\\(\\s*\"/users\"\\s*\\)", label: "mapped to POST `/users`" },
        { re: "@RequestBody\\s+CreateUserRequest", label: "binds the body with `@RequestBody`" },
      ],
      explanation:
        "`@RequestBody` tells Spring to deserialise the incoming JSON into your DTO using Jackson — field names in the JSON map to the object's properties automatically. Binding to a typed DTO (rather than a raw `Map`) gives you compile-time safety and a natural place to hang `@Valid` bean-validation later. `@GetMapping`/`@PostMapping` are the verb-specific shortcuts for `@RequestMapping(method = …)`.",
      docRef: DOC,
    }),
};

const entity: Generator = {
  id: "spring-entity",
  title: "Map a JPA entity",
  generate: () =>
    codeTask({
      genId: "spring-entity",
      prompt:
        "Turn `User` into a JPA entity: mark the class as an entity, and designate the `Long id` field as the primary key, auto-generated by the database's identity strategy.",
      language: "java",
      starter: `public class User {\n  private Long id;\n  private String email;\n}`,
      solution: `@Entity\npublic class User {\n  @Id\n  @GeneratedValue(strategy = GenerationType.IDENTITY)\n  private Long id;\n\n  private String email;\n}`,
      checks: [
        { re: "@Entity", label: "class is an `@Entity`" },
        { re: "@Id", label: "`id` is the `@Id` primary key" },
        { re: "@GeneratedValue\\(strategy\\s*=\\s*GenerationType\\.IDENTITY\\)", label: "auto-generates with `IDENTITY`" },
      ],
      explanation:
        "`@Entity` maps the class to a database table (one row per instance) — this is the ORM boundary, JPA's answer to a Prisma model. `@Id` names the primary key; `@GeneratedValue(strategy = IDENTITY)` delegates ID generation to the database's auto-increment column, so you never set `id` yourself — you `save()` a new `User` and read the assigned id back. Each non-transient field becomes a column unless you say otherwise.",
      docRef: DOC,
    }),
};

/* ── Level 4 — repositories & responses ── */

const repository: Generator = {
  id: "spring-repository",
  title: "A Spring Data repository",
  generate: () =>
    codeTask({
      genId: "spring-repository",
      prompt:
        "Write a `UserRepository` interface for the `User` entity (id type `Long`) by extending `JpaRepository`. Add a DERIVED query method `findByEmail(String email)` returning `Optional<User>` — no body, no SQL.",
      language: "java",
      starter: `public interface UserRepository {\n  // extend JpaRepository and declare the finder\n}`,
      solution: `public interface UserRepository extends JpaRepository<User, Long> {\n  Optional<User> findByEmail(String email);\n}`,
      checks: [
        { re: "interface\\s+UserRepository\\s+extends\\s+JpaRepository<\\s*User\\s*,\\s*Long\\s*>", label: "extends `JpaRepository<User, Long>`" },
        { re: "Optional<User>\\s+findByEmail\\s*\\(\\s*String\\s+email\\s*\\)", label: "declares `Optional<User> findByEmail(String email)`" },
      ],
      explanation:
        "You write an INTERFACE and Spring Data generates the implementation at runtime. Extending `JpaRepository<User, Long>` gives you `save`, `findById`, `findAll`, `delete`… for free. Even better: `findByEmail` is a DERIVED query — Spring parses the method NAME (`findBy` + `Email`) into `WHERE email = ?`, no SQL required. Returning `Optional<User>` makes 'no such user' an explicit, unmissable case instead of a surprise null.",
      docRef: DOC,
    }),
};

const responseEntity: Generator = {
  id: "spring-response-entity",
  title: "Control the status with ResponseEntity",
  generate: () =>
    codeTask({
      genId: "spring-response-entity",
      prompt:
        "Write a GET `/users/{id}` that looks a user up via `repository.findById(id)` and returns a `ResponseEntity`: 200 with the user if present, 404 if not. The lookup returns an `Optional` — map over it to build each case.",
      language: "java",
      starter: `@GetMapping("/users/{id}")\npublic ResponseEntity<User> getUser(@PathVariable Long id) {\n  // 200 or 404\n}`,
      solution: `@GetMapping("/users/{id}")\npublic ResponseEntity<User> getUser(@PathVariable Long id) {\n  return repository.findById(id)\n    .map(ResponseEntity::ok)\n    .orElseGet(() -> ResponseEntity.notFound().build());\n}`,
      checks: [
        { re: "ResponseEntity<User>", label: "returns a `ResponseEntity<User>`" },
        { re: "findById\\(\\s*id\\s*\\)", label: "looks up via `findById(id)`" },
        { re: "ResponseEntity::ok|ResponseEntity\\.ok", label: "200 OK when found" },
        { re: "notFound\\(\\)\\.build\\(\\)", label: "404 when missing" },
      ],
      explanation:
        "Returning the entity directly always sends 200 — fine until you need to say 'not found'. `ResponseEntity<T>` lets you set status, headers and body explicitly. Chaining it off the `Optional` is idiomatic: `.map(ResponseEntity::ok)` wraps a present user in a 200, and `.orElseGet(...)` supplies the 404 when the Optional is empty — the whole 'found vs. missing' decision in one expression, no `if (user == null)`.",
      docRef: DOC,
    }),
};

/* ── Level 5 — transactions & global error handling ── */

const transactional: Generator = {
  id: "spring-transactional",
  title: "An atomic transfer",
  generate: () =>
    codeTask({
      genId: "spring-transactional",
      prompt:
        "In an `AccountService`, write a `transfer(Long fromId, Long toId, int amount)` method that debits one account and credits another — made transactional so both writes commit together or neither does. That atomicity is the whole point.",
      language: "java",
      starter: `@Service\npublic class AccountService {\n  // transfer(...) — make it atomic\n}`,
      solution: `@Service\npublic class AccountService {\n  private final AccountRepository repository;\n\n  public AccountService(AccountRepository repository) {\n    this.repository = repository;\n  }\n\n  @Transactional\n  public void transfer(Long fromId, Long toId, int amount) {\n    repository.debit(fromId, amount);\n    repository.credit(toId, amount);\n  }\n}`,
      checks: [
        { re: "@Transactional", label: "method is `@Transactional`" },
        { re: "public\\s+void\\s+transfer\\s*\\(", label: "declares `transfer(...)`" },
        { re: "debit|credit", label: "performs the two writes" },
      ],
      explanation:
        "`@Transactional` wraps the method in a database transaction: if the second write throws, Spring ROLLS BACK the first, so you never leave money debited-but-not-credited. One trap: it works via a proxy, so it only applies when the method is called from OUTSIDE the bean — a `this.transfer()` call from another method in the same class bypasses the proxy and the transaction. By default it also only rolls back on unchecked (runtime) exceptions.",
      docRef: DOC,
    }),
};

const exceptionHandler: Generator = {
  id: "spring-exception-handler",
  title: "Global error handling",
  generate: () =>
    codeTask({
      genId: "spring-exception-handler",
      prompt:
        "Write a GLOBAL exception handler (a controller-advice class that applies across controllers) with a handler for `UserNotFoundException` that responds with HTTP 404 and the exception's message.",
      language: "java",
      starter: `public class GlobalExceptionHandler {\n  // handle UserNotFoundException -> 404\n}`,
      solution: `@RestControllerAdvice\npublic class GlobalExceptionHandler {\n\n  @ExceptionHandler(UserNotFoundException.class)\n  @ResponseStatus(HttpStatus.NOT_FOUND)\n  public String handleNotFound(UserNotFoundException ex) {\n    return ex.getMessage();\n  }\n}`,
      checks: [
        { re: "@RestControllerAdvice", label: "class is `@RestControllerAdvice`" },
        { re: "@ExceptionHandler\\(\\s*UserNotFoundException\\.class\\s*\\)", label: "handles `UserNotFoundException`" },
        { re: "NOT_FOUND", label: "responds with 404 (`HttpStatus.NOT_FOUND`)" },
      ],
      explanation:
        "`@RestControllerAdvice` is a cross-cutting handler that applies to EVERY controller — one place to translate exceptions into HTTP responses, instead of a try/catch in each endpoint. When any controller throws `UserNotFoundException`, Spring routes it to the matching `@ExceptionHandler` and this method's return becomes the body, with `@ResponseStatus` fixing the code at 404. Your controllers stay focused on the happy path and just `throw`.",
      docRef: DOC,
    }),
};

const requestParam: Generator = {
  id: "spring-request-param",
  title: "Read a query parameter",
  generate: () =>
    codeTask({
      genId: "spring-request-param",
      prompt:
        "Add a GET `/search` endpoint that reads a `q` QUERY parameter (as in `/search?q=spring`), defaulting to an empty string when it's absent, and returns `\"Searching: \" + q`.",
      language: "java",
      starter: `@RestController\npublic class SearchController {\n  // GET /search?q=...\n}`,
      solution: `@RestController\npublic class SearchController {\n\n  @GetMapping("/search")\n  public String search(@RequestParam(defaultValue = "") String q) {\n    return "Searching: " + q;\n  }\n}`,
      checks: [
        { re: "@GetMapping\\(\\s*\"/search\"\\s*\\)", label: "mapped to GET `/search`" },
        { re: "@RequestParam", label: "reads the query param with `@RequestParam`" },
        { re: "defaultValue\\s*=", label: "supplies a `defaultValue`" },
      ],
      explanation:
        "`@RequestParam` binds `?q=…` query-string values (vs `@PathVariable` for `/users/{id}` path segments). By default a param is REQUIRED — a missing `q` would 400 — so `defaultValue = \"\"` (or `required = false`) makes it optional. Use query params for filtering, sorting and pagination; path variables for identifying the resource itself.",
      docRef: DOC,
    }),
};

const putMapping: Generator = {
  id: "spring-put-mapping",
  title: "An update endpoint",
  generate: () =>
    codeTask({
      genId: "spring-put-mapping",
      prompt:
        "Add an `update` handler for PUT `/users/{id}` that takes the `{id}` from the path AND a JSON body bound to an `UpdateUserRequest`, and returns `\"Updated \" + id`.",
      language: "java",
      starter: `@RestController\npublic class UserController {\n  // PUT /users/{id} with a body\n}`,
      solution: `@RestController\npublic class UserController {\n\n  @PutMapping("/users/{id}")\n  public String update(@PathVariable Long id, @RequestBody UpdateUserRequest body) {\n    return "Updated " + id;\n  }\n}`,
      checks: [
        { re: "@PutMapping\\(\\s*\"/users/\\{id\\}\"\\s*\\)", label: "mapped to PUT `/users/{id}`" },
        { re: "@PathVariable\\s+Long\\s+id", label: "reads the path `id`" },
        { re: "@RequestBody\\s+UpdateUserRequest", label: "binds the JSON body" },
      ],
      explanation:
        "A handler can combine parameter sources — here `@PathVariable` (which record to change) and `@RequestBody` (the new data) in one signature. `@PutMapping` is the REST convention for a full replace/update; `@PatchMapping` for a partial one, `@DeleteMapping` for removal. Matching HTTP verbs to intent is what makes an API predictable.",
      docRef: DOC,
    }),
};

const validatedDto: Generator = {
  id: "spring-validated-dto",
  title: "Bean-validate a DTO",
  generate: () =>
    codeTask({
      genId: "spring-validated-dto",
      prompt:
        "Write a `CreateUserRequest` DTO with Jakarta Bean Validation constraints: `name` must not be blank, and `email` must be a valid email address. (A controller would then enforce them on the incoming body.)",
      language: "java",
      starter: `public class CreateUserRequest {\n  private String name;\n  private String email;\n}`,
      solution: `public class CreateUserRequest {\n  @NotBlank\n  private String name;\n\n  @Email\n  private String email;\n}`,
      checks: [
        { re: "@NotBlank", label: "`name` is `@NotBlank`" },
        { re: "@Email", label: "`email` is `@Email`" },
      ],
      explanation:
        "Validation constraints live on the DTO as annotations (`@NotBlank`, `@Email`, `@Size`, `@Min`…). When a controller method marks the parameter `@Valid` — `create(@Valid @RequestBody CreateUserRequest req)` — Spring checks them before your code runs and auto-returns a 400 with the violations if any fail. Declarative validation next to the field beats hand-written `if (name == null || name.isBlank())` checks scattered through the controller.",
      docRef: DOC,
    }),
};

const jpqlQuery: Generator = {
  id: "spring-jpql-query",
  title: "A custom @Query",
  generate: () =>
    codeTask({
      genId: "spring-jpql-query",
      prompt:
        "When a derived method name would be unwieldy, write JPQL directly. In `UserRepository`, add a `List<User> search(String term)` method backed by a JPQL query that selects users whose `name` contains the bound `term` parameter.",
      language: "java",
      starter: `public interface UserRepository extends JpaRepository<User, Long> {\n  // @Query with a :term parameter\n}`,
      solution: `public interface UserRepository extends JpaRepository<User, Long> {\n\n  @Query("SELECT u FROM User u WHERE u.name LIKE %:term%")\n  List<User> search(@Param("term") String term);\n}`,
      checks: [
        { re: "@Query\\(", label: "declares a `@Query`" },
        { re: "SELECT\\s+\\w+\\s+FROM\\s+User", label: "writes JPQL against the `User` entity" },
        { re: "@Param\\(\\s*\"term\"\\s*\\)", label: "binds the `:term` parameter with `@Param`" },
      ],
      explanation:
        "JPQL looks like SQL but operates on ENTITIES and their fields (`FROM User u`, not the table name) — Hibernate translates it to SQL for your dialect. `:term` is a named parameter bound by `@Param(\"term\")`, which is safe against injection (never string-concatenate values in). Reach for `@Query` when a derived method name (`findByNameContainingIgnoreCase`) gets too long or you need joins/aggregates; add `nativeQuery = true` to drop to raw SQL.",
      docRef: DOC,
    }),
};

/* ── Multi-file capstone — assemble a whole feature across files ── */

const usersFeature: Generator = {
  id: "spring-feature",
  title: "Assemble the Users feature",
  generate: () =>
    multiFileTask({
      genId: "spring-feature",
      prompt:
        "Build the **Users** feature as a clean three-layer stack — a file per class. The service owns an in-memory list; the controller exposes `GET /users` and `POST /users` and only delegates to the service (inject it, don't `new` it); the `CreateUserRequest` DTO carries the request payload. Write each in its tab, **Debug this file**, then **submit all** — open the hints if you're unsure of the annotations.",
      files: [
        {
          name: "UserController.java",
          language: "java",
          role: "maps HTTP onto service calls — no business logic",
          hint: "Annotate the class `@RestController` so each method's return IS the response body. Use CONSTRUCTOR injection: a `private final UserService` field set in the constructor — Spring passes the bean in, and you avoid field `@Autowired`, which breaks `final` and hides the dependency. Map handlers with `@GetMapping`/`@PostMapping`, bind the JSON body with `@RequestBody`, and just return `service.<method>(…)`.",
          starter: `@RestController\npublic class UserController {\n  // inject UserService, then add GET /users and POST /users\n}`,
          solution: `@RestController\npublic class UserController {\n  private final UserService service;\n\n  public UserController(UserService service) {\n    this.service = service;\n  }\n\n  @GetMapping("/users")\n  public List<CreateUserRequest> list() {\n    return service.findAll();\n  }\n\n  @PostMapping("/users")\n  public String create(@RequestBody CreateUserRequest request) {\n    return service.create(request);\n  }\n}`,
          checks: [
            { re: "@RestController", label: "class is a `@RestController`" },
            {
              re: "private\\s+final\\s+UserService",
              label: "holds `UserService` in a `private final` field",
            },
            {
              re: "public\\s+UserController\\s*\\(\\s*UserService\\s+\\w+\\s*\\)",
              label: "constructor takes `UserService`",
            },
            { re: "@Autowired", expect: false, label: "no field `@Autowired` — constructor injection is preferred" },
            { re: "@GetMapping\\(\\s*\"/users\"\\s*\\)", label: "GET `/users` mapping" },
            { re: "\\w+\\.findAll\\(\\)", label: "delegates listing to the service" },
            { re: "@PostMapping\\(\\s*\"/users\"\\s*\\)", label: "POST `/users` mapping" },
            {
              re: "@RequestBody\\s+CreateUserRequest",
              label: "binds the body with `@RequestBody CreateUserRequest`",
            },
            { re: "\\w+\\.create\\(", label: "delegates creation to the service" },
          ],
        },
        {
          name: "UserService.java",
          language: "java",
          role: "owns the list and the logic",
          hint: "Mark it `@Service` so Spring manages one shared instance and can inject it. Hold a private list; `create(request)` adds it and returns a confirmation string built from `request.getName()`, and `findAll()` returns the list. Business logic lives here, not in the controller.",
          starter: `public class UserService {\n  // a @Service with create(request) and findAll()\n}`,
          solution: `@Service\npublic class UserService {\n  private final List<CreateUserRequest> users = new ArrayList<>();\n\n  public String create(CreateUserRequest request) {\n    users.add(request);\n    return "Created " + request.getName();\n  }\n\n  public List<CreateUserRequest> findAll() {\n    return users;\n  }\n}`,
          checks: [
            { re: "@Service", label: "annotated `@Service`" },
            {
              re: "public\\s+String\\s+create\\s*\\(\\s*CreateUserRequest\\s+\\w+\\s*\\)",
              label: "has `create(CreateUserRequest request)`",
            },
            { re: "getName\\(\\)", label: "reads the name via `request.getName()`" },
            { re: "findAll\\s*\\(\\s*\\)", label: "has a `findAll()` method" },
          ],
        },
        {
          name: "CreateUserRequest.java",
          language: "java",
          role: "carries the request payload",
          hint: "A DTO is a plain class of private fields plus getters — Jackson reads the JSON through the getters, and the service calls `getName()`. Give it the fields the request carries and a public getter for at least the name. No Spring annotations needed on a plain request DTO.",
          starter: `public class CreateUserRequest {\n  // fields + a getter for name\n}`,
          solution: `public class CreateUserRequest {\n  private String name;\n  private String email;\n\n  public String getName() {\n    return name;\n  }\n\n  public String getEmail() {\n    return email;\n  }\n}`,
          checks: [
            { re: "class\\s+CreateUserRequest", label: "declares the `CreateUserRequest` class" },
            { re: "private\\s+String\\s+name", label: "has a `private String name` field" },
            {
              re: "public\\s+String\\s+getName\\s*\\(\\s*\\)",
              label: "exposes `getName()` for Jackson and the service",
            },
          ],
        },
      ],
      crossChecks: [
        {
          re: "(?=[\\s\\S]*\\w+\\.create\\()(?=[\\s\\S]*public\\s+String\\s+create\\s*\\(\\s*CreateUserRequest)(?=[\\s\\S]*\\w+\\.findAll\\(\\))(?=[\\s\\S]*findAll\\s*\\(\\s*\\)\\s*\\{)",
          label: "controller delegates to the service's `create`/`findAll`",
        },
        {
          re: "(?=[\\s\\S]*class\\s+CreateUserRequest)(?=[\\s\\S]*@RequestBody\\s+CreateUserRequest)",
          label: "the `CreateUserRequest` you defined is the body the controller binds",
        },
      ],
      explanation:
        "Every Spring feature layers the same way: a **DTO** carrying the request payload, a **`@Service`** bean holding the logic and state, and a thin **`@RestController`** that maps HTTP onto service calls. Constructor injection — a `final` field set in the constructor, no `@Autowired` — makes the dependency explicit, non-null and trivially mockable (`new UserController(mockService)`). Keeping the controller free of business logic is what lets you test the service without a web server and swap the web layer without touching the rules. It's the exact controller/provider split NestJS mirrors with `@Controller`/`@Injectable`.",
      docRef: DOC,
    }),
};

export const springBootTrack: CodingTrack = {
  id: "coding-spring",
  title: "Spring Boot",
  icon: "🍃",
  stack: "Java · Spring Boot",
  blurb:
    "REST controllers, dependency injection, JPA entities & repositories, transactions and global error handling — the enterprise backend, endpoint by endpoint.",
  exercises: [
    { level: 1, gen: restController },
    { level: 1, gen: serviceBean },
    { level: 2, gen: constructorInjection },
    { level: 2, gen: pathVariable },
    { level: 2, gen: properties },
    { level: 2, gen: requestParam },
    { level: 3, gen: postBody },
    { level: 3, gen: entity },
    { level: 3, gen: putMapping },
    { level: 3, gen: usersFeature },
    { level: 4, gen: repository },
    { level: 4, gen: responseEntity },
    { level: 4, gen: validatedDto },
    { level: 5, gen: transactional },
    { level: 5, gen: exceptionHandler },
    { level: 5, gen: jpqlQuery },
  ],
};
