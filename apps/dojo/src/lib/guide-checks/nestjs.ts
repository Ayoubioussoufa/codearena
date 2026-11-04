/**
 * Checks for the NestJS guide (content/supplements/nestjs.md). Claims checked
 * against docs.nestjs.com on 3 Nov 2026: request lifecycle, controllers,
 * guards, exception filters, injection scopes, execution context, lifecycle
 * events.
 */
import type { GuideCheckSet } from "./types";

export const nestjsChecks: GuideCheckSet = {
  name: "NestJS guide",
  source: {
    label: "the NestJS documentation",
    href: "https://docs.nestjs.com/controllers",
    note: "Read the Overview chapters in order (Controllers, Providers, Modules, Middleware, Exception filters, Pipes, Guards, Interceptors), then [the request lifecycle](https://docs.nestjs.com/faq/request-lifecycle). This guide follows the same path.",
  },
  terms: [
    "Decorator",
    "Provider",
    "Injection token",
    "Module exports",
    "DTO",
    "Mass assignment",
    "Guard",
    "Interceptor",
    "Exception filter",
  ],
  checks: [
    {
      id: "decorators",
      section: "Part 2 · Decorators",
      questions: [
        {
          prompt: "What does `@Controller('problems')` do at the moment the class is defined?",
          options: [
            "It generates the routing code inside the class",
            "It registers the route with Express right away",
            "It attaches metadata that Nest reads at startup",
            "It wraps every method in a request handler",
          ],
          correct: 2,
          why: "A decorator is a function that runs when the class is defined and attaches metadata; it changes nothing about what your code does. At startup Nest walks every class, reads those labels and builds the app from them. Nothing is generated or registered before that.",
        },
        {
          prompt: "Why does Nest need `emitDecoratorMetadata` in `tsconfig.json`?",
          options: [
            "So constructor parameter types reach the JavaScript",
            "So the TypeScript parser accepts decorator syntax",
            "So interfaces survive as runtime injection tokens",
            "So the compiler validates every module's imports",
          ],
          correct: 0,
          why: "`experimentalDecorators` enables the syntax. `emitDecoratorMetadata` makes TypeScript write each decorated class's constructor parameter types into the compiled JavaScript, which is how Nest knows what to inject. Interfaces still vanish: there's no runtime type to emit, hence tokens.",
        },
        {
          prompt: "You forget `@Injectable()` on `ProblemsService`, whose constructor takes `PrismaService`. What happens?",
          options: [
            "The compiler rejects it for a missing decorator",
            "It boots, and Nest injects an empty instance",
            "It works: being listed in providers is enough",
            "It compiles, then Nest fails at boot time",
          ],
          correct: 3,
          why: "The type checker doesn't care, so it compiles. But TypeScript emits type metadata only \"for declarations that have decorators\" ([TypeScript handbook](https://www.typescriptlang.org/docs/handbook/decorators.html#metadata)), so Nest sees a parameter it can't identify and fails at boot: `Nest can't resolve dependencies of ProblemsService (?)`.",
        },
      ],
      explain:
        "Explain to an interviewer what a decorator is, what Nest does with decorators at startup, and why `emitDecoratorMetadata` is the flag that makes constructor injection possible.",
    },
    {
      id: "modules",
      section: "Parts 3–4 · Modules",
      questions: [
        {
          prompt: "`AuthService` needs `UsersService`, which lives in `UsersModule`. What must be true?",
          options: [
            "AuthModule adds UsersService to its own providers",
            "UsersModule exports it, AuthModule imports that module",
            "AuthModule exports itself, and UsersModule imports it",
            "UsersService gets a global scope in Injectable",
          ],
          correct: 1,
          why: "A provider is private to its module. Using it elsewhere takes both halves: `exports` in the module that owns it, and `imports` of that module in the consumer. Adding it to `AuthModule`'s providers builds a second instance instead.",
        },
        {
          prompt: "Nest's error suggests adding `UsersService` to the importing module's `providers`. Why is that a trap?",
          options: [
            "It makes the service global for every other module",
            "It deletes the original provider from the owning module",
            "It forces every consumer to become request scoped instead",
            "It creates a second instance with its own dependencies",
          ],
          correct: 3,
          why: "Listing a class in `providers` tells that module to construct its own copy. You get two instances, so state isn't shared, and the copy needs dependencies (like `USERS_REPOSITORY`) that only the owning module provides. Import the module; never copy the provider.",
        },
        {
          prompt: "`PrismaModule` has `@Global()`. What does it still need for others to inject `PrismaService`?",
          options: [
            "PrismaService listed in its exports array",
            "Imports of PrismaModule in every module",
            "forRoot calls in every consuming module",
            "Request scope declared on the PrismaService",
          ],
          correct: 0,
          why: "`@Global()` only removes the import half: register the module once and every module can inject from it. The export half still applies. Keep it for genuinely cross-cutting things (config, database), because globals hide the dependency graph.",
        },
      ],
      explain:
        "What does each of the four arrays of `@Module()` take? Then explain why `imports: [UsersService]` is an error, and what you should write instead.",
    },
    {
      id: "providers",
      section: "Part 5 · Providers",
      questions: [
        {
          prompt: "In a test, which provider form swaps `PROBLEMS_REPOSITORY` for a fake object you already built?",
          options: ["useClass with the fake", "useFactory with the fake", "useValue with the fake", "useExisting with the fake"],
          correct: 2,
          why: "`useValue` injects an object that already exists, as is: `{ provide: PROBLEMS_REPOSITORY, useValue: fakeRepo }`. `useClass` constructs a class, `useFactory` calls a function, and `useExisting` aliases another token to the same instance.",
        },
        {
          prompt: "Why does `constructor(private repo: ProblemsRepository)` fail when `ProblemsRepository` is an interface?",
          options: [
            "Interfaces are private to the module declaring them",
            "Interfaces need the Global decorator to be injected",
            "Interfaces can only be injected into other services",
            "Interfaces are erased, so nothing exists to match",
          ],
          correct: 3,
          why: "Nest matches dependencies by runtime type. Classes exist at runtime; interfaces are erased by the compiler, so there's nothing to match. Give the port a `Symbol` token and inject it with `@Inject(PROBLEMS_REPOSITORY)`. A Java interface survives to runtime, which is why Spring needs no token.",
        },
        {
          prompt: "A `REQUEST`-scoped provider is injected into a singleton service. What happens to the service?",
          options: [
            "It is re-created per request as well",
            "It turns the provider into a singleton",
            "Nest refuses to boot with an error",
            "It reuses one provider for all requests",
          ],
          correct: 0,
          why: "\"The `REQUEST` scope bubbles up the injection chain\": anything depending on a request-scoped provider is itself re-created per request, up to the controller ([Nest docs: injection scopes](https://docs.nestjs.com/fundamentals/injection-scopes)). That costs performance; pass the current user as an argument instead.",
        },
      ],
      explain:
        "Explain why a TypeScript port needs an injection token when a Java interface doesn't. Then describe, in words, the three lines that wire `PROBLEMS_REPOSITORY` to its Prisma adapter.",
    },
    {
      id: "routing",
      section: "Parts 6–7 · Controllers and requests",
      questions: [
        {
          prompt: "`@Get(':slug')` is declared above `@Get('featured')`. What does `GET /problems/featured` do?",
          options: [
            "Runs the featured handler, because static routes win",
            "Runs the slug handler, with featured as slug",
            "Fails at boot, because the two routes collide",
            "Returns 405, since the method is already taken",
          ],
          correct: 1,
          why: "\"Nest registers routes in declaration order\", and `:slug` matches any segment, including `featured` ([Nest docs: controllers](https://docs.nestjs.com/controllers)). The slug handler runs and probably answers \"problem not found\". Declare static routes before parameter routes.",
        },
        {
          prompt: "You inject `@Res() res` only to set a cookie, then return an object. What happens?",
          options: [
            "Nest sends the object and also sets the cookie",
            "The cookie is dropped, but the object is sent",
            "The request hangs: Nest no longer sends your return",
            "Nest throws at boot: @Res needs the passthrough option",
          ],
          correct: 2,
          why: "Injecting `@Res()` puts the handler in library-specific mode: you become responsible for the response, your return value is ignored, and until you call `res.json()` the request hangs. `@Res({ passthrough: true })` gives you `res.cookie()` and keeps Nest sending what you return.",
        },
        {
          prompt: "Login sends a password. Why is it a POST rather than a GET?",
          options: [
            "A POST body is encrypted, unlike the URL",
            "A GET cannot carry any data at all",
            "A POST is faster for servers to parse",
            "A GET puts the password in the URL",
          ],
          correct: 3,
          why: "GET carries its data in the URL, and URLs end up in browser history, server logs, the `Referer` header and proxy caches. A POST body avoids all four. Neither is encrypted by itself: HTTPS encrypts both, which is why the first option is a classic misconception.",
        },
      ],
      explain:
        "Trace `POST /auth/login` to its handler: which two decorators build the path, and why do folders mean nothing to Nest's router?",
    },
    {
      id: "dtos",
      section: "Part 8 · DTOs and validation",
      questions: [
        {
          prompt: "Why must a DTO be a `class`, not an `interface`?",
          options: [
            "Interfaces vanish, so no validation rules run",
            "Interfaces can't be imported into controller files",
            "Classes make JSON parsing noticeably faster overall",
            "Classes are required before Swagger can start",
          ],
          correct: 0,
          why: "Validation decorators attach metadata to something that exists at runtime. An interface is erased by the compiler, so there's nothing to attach to and `ValidationPipe` has no rules to run: every body passes. It fails open, which is what makes it dangerous.",
        },
        {
          prompt: "Without `whitelist: true`, a client sends `{ email, password, role: \"ADMIN\" }`. What's the risk?",
          options: [
            "SQL injection: role is executed by Postgres",
            "Nothing: unknown fields are rejected by default",
            "Mass assignment: role reaches a database write",
            "Denial of service: the extra field crashes",
          ],
          correct: 2,
          why: "Without `whitelist`, undeclared properties pass through. If any code spreads the body into a database write, the client just made themselves an admin: mass assignment. `whitelist: true` strips undeclared fields; `forbidNonWhitelisted: true` rejects the request instead.",
        },
        {
          prompt: "Why does `@Type(() => Boolean)` turn the query value `\"false\"` into `true`?",
          options: [
            "class-transformer reads every query value as true",
            "The pipe validates before it transforms values",
            "Express parses every query string as JSON",
            "Boolean() of any non-empty string is true",
          ],
          correct: 3,
          why: "`@Type(() => Boolean)` calls `Boolean(value)`, and every non-empty string is truthy, so `\"false\"` becomes `true`. Compare the string yourself: `@Transform(({ value }) => value === 'true')`. Query strings are always strings until you convert them.",
        },
      ],
      explain:
        "Explain mass assignment to an interviewer, with a CodeArena example, and name the two `ValidationPipe` options that defend against it.",
    },
    {
      id: "lifecycle",
      section: "Part 9 · The request lifecycle",
      questions: [
        {
          prompt: "In what order do these run for one request?",
          options: [
            "middleware, pipes, guards, interceptors, handler",
            "guards, middleware, pipes, interceptors, handler",
            "middleware, interceptors, guards, pipes, handler",
            "middleware, guards, interceptors, pipes, handler",
          ],
          correct: 3,
          why: "Middleware first, then guards (may this proceed?), the before-half of interceptors, pipes (validate and transform the arguments), the handler, then the interceptors' after-half; exception filters catch anything thrown ([Nest FAQ: request lifecycle](https://docs.nestjs.com/faq/request-lifecycle)).",
        },
        {
          prompt: "\"Only the author may edit this submission.\" Where does that check belong?",
          options: [
            "In a guard, before any handler code runs",
            "In the service, once the record is loaded",
            "In a pipe, while the body is validated",
            "In an interceptor, after the handler has run",
          ],
          correct: 1,
          why: "A guard decides from route facts (is there a user? does the role match?) before anything is loaded. Ownership needs the record, so it lives in the service that loads it. \"Must be an admin\" is a guard; \"must be the author\" is the service.",
        },
        {
          prompt: "Interceptor A is global, interceptor B is on the route. In which order do their after-halves run?",
          options: [
            "A's after-half first, then B's",
            "B's after-half first, then A's",
            "Both run at once, together",
            "Only A's: B's gets skipped",
          ],
          correct: 1,
          why: "Interceptors nest like layers: global wraps controller wraps route. Before-halves run outside-in (A then B), after-halves inside-out (B then A), the way a call stack unwinds. The Nest FAQ lists post-request interceptors as route, then controller, then global.",
        },
      ],
      explain:
        "Place five concerns in the pipeline and justify each: cookie parsing, \"are you logged in?\", body validation, request timing, and turning an error into JSON.",
    },
    {
      id: "guards",
      section: "Parts 10–11 · Pipes and guards",
      questions: [
        {
          prompt: "A guard returns `false` for a request with no token. What does the client get?",
          options: [
            "401, from an UnauthorizedException Nest throws",
            "400, from a BadRequestException Nest throws",
            "403, from a ForbiddenException Nest throws",
            "404, from a NotFoundException Nest throws",
          ],
          correct: 2,
          why: "When a guard returns `false`, Nest throws a `ForbiddenException`: 403, \"I know who you are, and you may not\" ([Nest docs: guards](https://docs.nestjs.com/guards)). A missing token means \"I don't know who you are\", a 401, so throw `new UnauthorizedException()` yourself.",
        },
        {
          prompt: "The auth guard reads `isPublic` with `getAllAndOverride`, listing the handler before the class. Why?",
          options: [
            "A route's label overrides the controller's label",
            "It concatenates both labels into one array",
            "It caches class labels for faster lookups",
            "It skips handlers whose controllers carry labels",
          ],
          correct: 0,
          why: "`getAllAndOverride` \"returns the first defined value, checking the targets in the order you pass them\": handler first, so a method-level `@Public()` wins over the controller's ([Nest docs: execution context](https://docs.nestjs.com/fundamentals/execution-context)). `getAllAndMerge` is the one that combines both.",
        },
        {
          prompt: "Why make auth global with a `@Public()` opt-out, rather than opt-in on each route?",
          options: [
            "Global guards run faster than route guards",
            "Forgetting it locks routes, never opens them",
            "Opt-in guards cannot read any route metadata",
            "Nest permits just one guard per route",
          ],
          correct: 1,
          why: "With opt-in, forgetting `@UseGuards` leaves an endpoint open, silently. With opt-out, forgetting `@Public()` locks a route that should be open, which fails loudly the first time someone calls it. Default to secure.",
        },
      ],
      explain:
        "Explain the difference between 401 and 403 with one CodeArena example of each, and say which one a guard returning `false` produces.",
    },
    {
      id: "wrappers",
      section: "Parts 12–14 · Interceptors, filters, middleware",
      questions: [
        {
          prompt: "A service runs `throw new Error('Email taken')`. What does the client get?",
          options: [
            "A 409, because Nest parses the message",
            "A 400, because errors indicate invalid input",
            "A hang, because nothing catches plain errors",
            "A 500, because Nest only maps HttpExceptions",
          ],
          correct: 3,
          why: "The built-in filter maps `HttpException` and its subclasses to their status codes; anything else becomes `{ statusCode: 500, message: \"Internal server error\" }` ([Nest docs: exception filters](https://docs.nestjs.com/exception-filters)). For a fixable client mistake, throw `ConflictException('Email taken')`: a 409.",
        },
        {
          prompt: "You wrote `AllExceptionsFilter`, but errors still come back in Nest's default shape. Most likely cause?",
          options: [
            "It lacks the Injectable class decorator",
            "It was never registered with useGlobalFilters",
            "Catch with no argument catches nothing",
            "Filters never see exceptions from services",
          ],
          correct: 1,
          why: "A filter does nothing until it's bound: `app.useGlobalFilters(new AllExceptionsFilter())` in `main.ts`, or `@UseFilters` on a controller or route. `@Catch()` with no argument catches every unhandled exception, which is what you want for the global fallback.",
        },
        {
          prompt: "Why can't middleware decide \"is this route public?\"",
          options: [
            "It cannot read headers from the request",
            "It runs before Nest knows which handler",
            "It runs after the guards have decided",
            "It only works as a plain function",
          ],
          correct: 1,
          why: "Middleware runs first, before Nest knows which handler will run, so it has no `ExecutionContext` and can't read `@Public()` metadata. Anything that depends on the controller or handler belongs in a guard or an interceptor.",
        },
      ],
      explain:
        "Describe the interceptor you'd write to log each request's duration: what runs before `next.handle()`, what runs after it, and why it's an interceptor rather than middleware.",
    },
    {
      id: "extras",
      section: "Parts 15–17 · Decorators, hooks, config",
      questions: [
        {
          prompt: "What does a handler receive from `@CurrentUser() user`?",
          options: [
            "The user Nest decoded from the JWT itself",
            "The user row loaded fresh from the database",
            "The user stored in the global config service",
            "The user the guard attached to the request",
          ],
          correct: 3,
          why: "`createParamDecorator` is a function over the `ExecutionContext`; this one returns `request.user`, which the auth guard attached after verifying the token. Nest decodes nothing by itself: the decorator only spares the handler from touching the raw request.",
        },
        {
          prompt: "`docker stop` sends `SIGTERM`, and `onModuleDestroy` never runs. What's missing?",
          options: [
            "A call to enableShutdownHooks at bootstrap",
            "An implements OnModuleDestroy on the class",
            "A Global decorator on PrismaModule itself",
            "A try/catch block wrapped around app.listen()",
          ],
          correct: 0,
          why: "The hooks run on an explicit `app.close()`. Signals are different: Nest listens for `SIGTERM` only after `app.enableShutdownHooks()`, because the listeners cost resources and are off by default ([Nest docs: lifecycle events](https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown)). `implements` only type-checks the method name.",
        },
        {
          prompt: "Why validate environment variables at boot, and throw when one is wrong?",
          options: [
            "The app starts faster when config is cached",
            "The app refuses to start, naming the variable",
            "The app hides secrets from the startup logs",
            "The app reloads config when the file changes",
          ],
          correct: 1,
          why: "Fail fast: a missing `DB_URL` stops the deploy at boot with a message naming the variable, instead of a server that looks healthy and dies on its first request with an error that mentions nothing useful.",
        },
      ],
      explain:
        "Explain what `extends PrismaClient implements OnModuleInit` gives the class from each half, and what happens in `onModuleInit`.",
    },
    {
      id: "testing",
      section: "Parts 18–20 · Testing and errors",
      questions: [
        {
          prompt: "Why can you unit-test `ProblemsService` with `new ProblemsService(fakeRepo)`?",
          options: [
            "Jest starts a hidden Nest container for tests",
            "Services are plain functions once they are compiled",
            "It receives its dependencies instead of building them",
            "The Injectable decorator is skipped during unit tests",
          ],
          correct: 2,
          why: "That's dependency injection's payoff: the service declares what it needs in its constructor and never constructs it, so a test passes a fake directly. No container, no database, milliseconds. You need `Test.createTestingModule` only to test the wiring itself.",
        },
        {
          prompt: "Your e2e test posts an invalid body and gets 201. What's the likely cause?",
          options: [
            "Supertest skips validation unless strict mode is on",
            "The DTO decorators run only in production builds",
            "Supertest cannot send JSON bodies in e2e tests",
            "The test app never got the global ValidationPipe",
          ],
          correct: 3,
          why: "`app.useGlobalPipes(...)` lives in `main.ts`, which the test never runs: it builds its own app from the module. Repeat the global setup in the test (or share one setup function), or validation silently doesn't run and the test passes for the wrong reason.",
        },
        {
          prompt: "`Nest can't resolve dependencies of AuthService (?, UsersService)`. What is the `?`",
          options: [
            "The first constructor parameter, the one that failed",
            "A parameter Nest skipped because it was optional",
            "A missing import statement in the AuthService file",
            "The module that should have exported the AuthService",
          ],
          correct: 0,
          why: "Nest prints each constructor parameter it resolved by name and a `?` for the one it couldn't: here, the first. Then check in order: is the class decorated, is the dependency in `providers`, is it exported by its module, is that module imported, and is it reachable from `AppModule`?",
        },
      ],
      explain:
        "You get `Nest can't resolve dependencies of X (?)`. Walk through your debugging order out loud, and say what each step rules out.",
    },
  ],
};
