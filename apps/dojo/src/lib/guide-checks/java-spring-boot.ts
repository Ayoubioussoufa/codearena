/**
 * Checks for content/supplements/java-spring-boot.md.
 * Checked 3 Nov 2026; Spring Boot 4 (Nov 2025) noted; JPA defaults (EAGER @ManyToOne, open-in-view) as stated in the Spring docs.
 * Generated from a spec; edit freely.
 */
import type { GuideCheckSet } from "./types";

export const javaSpringChecks: GuideCheckSet = {
  name: "Java & Spring Boot guide",
  source: {
    label: "Spring Boot reference documentation",
    href: "https://docs.spring.io/spring-boot/index.html",
    note: "The official reference: read \"Developing Your First Spring Boot Application\", then the web and data-access chapters. Pair it with [spring.io/guides](https://spring.io/guides) for runnable mini-projects.",
  },
  terms: [
    "Bean",
    "Nominal typing",
    "Checked exception",
    "Record",
    "Persistence context",
    "Dirty checking",
    "Transactional proxy",
    "N+1 query",
    "Security filter chain",
    "Testcontainers",
  ],
  checks: [
    {
      id: "java",
      section: "§1–4 · Spring's map, Java, collections, streams",
      questions: [
        {
          prompt: "`new String(\"hello\") == \"hello\"` is false. Why?",
          options: [
            "Literals are stored as raw character arrays",
            "== compares the references, not the characters",
            "Strings are equal only after calling intern()",
            "== checks the lengths, which differ here",
          ],
          correct: 1,
          why: "For objects, `==` asks \"is it the very same object?\". `new String` forces a fresh object while the literal comes from the string pool, so they differ. `.equals()` compares contents: always use it for objects.",
        },
        {
          prompt: "Why should a HashMap key class override both `equals` and `hashCode`?",
          options: [
            "The map sorts its keys with both of them",
            "Java refuses to compile a map with plain classes",
            "hashCode is faster, so equals is not ever called",
            "Equal keys must hash alike, or entries get lost",
          ],
          correct: 3,
          why: "The map finds a bucket by `hashCode`, then a key by `equals`. If two equal objects hash differently, a lookup searches the wrong bucket and your entry seems to vanish. Records implement both correctly for free.",
        },
      ],
      explain: "Map five NestJS concepts to their Spring equivalents (service, module, guard, exception filter, Prisma), and explain what a \"bean\" is.",
    },
    {
      id: "rest",
      section: "§5–6 · Project setup and REST",
      questions: [
        {
          prompt: "A request body breaks a `@NotBlank` rule on a `@Valid` DTO. What happens?",
          options: [
            "Spring rejects it with a 400 before your method runs",
            "Your method runs, and you must check the rule yourself",
            "The field is set to null, and the request accepted",
            "Spring logs a warning, then returns a 500 to callers",
          ],
          correct: 0,
          why: "`@Valid` triggers Bean Validation before the controller method is called; a violation becomes a 400. It's the equivalent of Nest's global `ValidationPipe` with class-validator.",
        },
        {
          prompt: "Which Spring annotations play the role of a NestJS exception filter?",
          options: [
            "@ControllerExceptionFilter, with @CatchException methods",
            "@GlobalErrorTranslator, with @HandleException methods",
            "@RestControllerAdvice, with @ExceptionHandler methods",
            "@ApplicationErrorFilter, with @OnException methods",
          ],
          correct: 2,
          why: "One `@RestControllerAdvice` class catches exceptions app-wide; each `@ExceptionHandler` method maps an exception type to a response, such as a 404 with a `ProblemDetail` body. The other three annotations don't exist.",
        },
      ],
      explain: "Explain why you'd package a Spring app by feature (`contest/` holding its controller, service, repository and entity) rather than by type.",
    },
    {
      id: "jpa",
      section: "§7 · Spring Data JPA",
      questions: [
        {
          prompt: "A `@Transactional` method sets `user.setName(name)` and never calls `save`. Is the change written?",
          options: [
            "No: JPA writes only when save is called explicitly",
            "Only if the entity was loaded through native SQL",
            "Yes: dirty checking writes what changed at commit time",
            "Only when the transaction is marked as readOnly true",
          ],
          correct: 2,
          why: "Inside a transaction the entity is managed by the persistence context; at commit JPA compares it to the snapshot taken at load and issues an `UPDATE`. That's also why a stray setter can silently write to the database.",
        },
        {
          prompt: "`importAll()` calls `this.saveOne(r)`, and `saveOne` is `@Transactional`. Why is nothing transactional?",
          options: [
            "Self-calls skip the proxy that opens transactions",
            "saveOne must be private for the annotation",
            "Transactions only apply to methods named save",
            "importAll must throw a checked exception first",
          ],
          correct: 0,
          why: "Spring wraps the bean in a proxy that begins and commits the transaction; only calls arriving through the proxy are advised. `this.saveOne()` never leaves the object. Move `saveOne` into another bean (or use `TransactionTemplate`).",
        },
        {
          prompt: "Why turn off `spring.jpa.open-in-view`, even though it makes `LazyInitializationException` disappear?",
          options: [
            "It disables every cache that JPA keeps",
            "It stops @Transactional from working at all",
            "It forces EAGER loading on all relations",
            "It hides N+1 queries inside the views",
          ],
          correct: 3,
          why: "Open-in-view keeps the persistence context open for the whole HTTP request, so lazy relations load anywhere, quietly one query at a time. Turn it off and fix the cause: `join fetch`/`@EntityGraph`, a DTO projection, or a wider transaction.",
        },
      ],
      explain: "Explain the N+1 problem in JPA with submissions and their authors, and give two fixes.",
    },
    {
      id: "security",
      section: "§8–12 · Security, testing, the interview",
      questions: [
        {
          prompt: "Why is CSRF protection disabled in the stateless JWT API's security chain?",
          options: [
            "Spring enables it again on every POST request",
            "No cookie rides along, so nothing gets forged",
            "JWTs are encrypted, so forgery is just impossible",
            "CSRF only ever matters for GET requests anyway",
          ],
          correct: 1,
          why: "CSRF abuses credentials the browser attaches automatically (cookies). A stateless API that reads a Bearer token from a header gets nothing for free from the browser. Keep it on if you use cookie sessions.",
        },
        {
          prompt: "Which test level runs the app against a real Postgres started in Docker?",
          options: [
            "An integration test, run with Testcontainers",
            "A web-slice test, driven through MockMvc",
            "Unit tests faking repositories via Mockito",
            "Tests run against H2's in-memory database",
          ],
          correct: 0,
          why: "Unit tests use Mockito fakes; a `@WebMvcTest` slice covers only the web layer; an integration test (`@SpringBootTest` plus Testcontainers) boots everything against a real Postgres container, unlike an in-memory H2 that behaves differently from production. That last sentence is one few intern candidates can say.",
        },
      ],
      explain: "Answer out loud: constructor injection versus field `@Autowired`, in the definition, example and trade-off shape.",
    },
  ],
};
