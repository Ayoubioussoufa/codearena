/**
 * Coding track: NestJS — controllers, providers & DI, modules, DTO validation,
 * guards, pipes and exception handling. The decorator-driven Node backend that
 * maps almost one-to-one onto Spring Boot. Structure-checked against idiomatic
 * Nest patterns.
 */
import { codeTask, multiFileTask } from "../helpers";
import type { Generator } from "../types";
import type { CodingTrack } from "../coding";

const DOC = { slug: "nestjs", label: "Dojo guide — NestJS" };

/* ── Level 1 — controllers & providers ── */

const controller: Generator = {
  id: "nest-controller",
  title: "Your first controller",
  generate: () =>
    codeTask({
      genId: "nest-controller",
      prompt:
        "Write a `CatsController` mounted at the `cats` route, with a GET handler `findAll()` that returns the string `\"All cats\"`.",
      language: "typescript",
      starter: `export class CatsController {\n  // decorate the class + add the GET handler\n}`,
      solution: `@Controller('cats')\nexport class CatsController {\n  @Get()\n  findAll() {\n    return 'All cats';\n  }\n}`,
      checks: [
        { re: "@Controller\\(\\s*'cats'\\s*\\)", label: "mounted with `@Controller('cats')`" },
        { re: "@Get\\(\\s*\\)", label: "handler decorated `@Get()`" },
        { re: "return\\s+'All cats'", label: "returns the string" },
      ],
      explanation:
        "`@Controller('cats')` prefixes every route in the class with `/cats`; `@Get()` (no path) maps `findAll` to `GET /cats`. Nest reads these decorators to build its router — the same idea as Spring's `@RestController` + `@GetMapping`, just in TypeScript. Whatever a handler returns becomes the JSON response body automatically.",
      docRef: DOC,
    }),
};

const injectable: Generator = {
  id: "nest-injectable",
  title: "An injectable provider",
  generate: () =>
    codeTask({
      genId: "nest-injectable",
      prompt:
        "Write a `CatsService` marked as an injectable provider (so Nest's IoC container can manage and inject it) with a `findAll()` method returning an empty array.",
      language: "typescript",
      starter: `export class CatsService {\n  // make it a provider\n}`,
      solution: `@Injectable()\nexport class CatsService {\n  findAll() {\n    return [];\n  }\n}`,
      checks: [
        { re: "@Injectable\\(\\)", label: "decorated `@Injectable()`" },
        { re: "findAll\\s*\\(\\s*\\)", label: "has a `findAll()` method" },
      ],
      explanation:
        "`@Injectable()` marks a class as a PROVIDER — something Nest's dependency-injection container can create and hand to whoever asks for it. It's the Nest equivalent of Spring's `@Service`/`@Component`. The decorator also lets Nest read the class's own constructor dependencies via TypeScript metadata, so providers can themselves depend on other providers.",
      docRef: DOC,
    }),
};

/* ── Level 2 — DI & params ── */

const di: Generator = {
  id: "nest-di",
  title: "Inject a service",
  generate: () =>
    codeTask({
      genId: "nest-di",
      prompt:
        "Wire `CatsService` into `CatsController` by declaring it as a `private readonly` constructor parameter, and have `findAll()` delegate to `this.catsService.findAll()`.",
      language: "typescript",
      starter: `@Controller('cats')\nexport class CatsController {\n  // inject CatsService, then delegate\n}`,
      solution: `@Controller('cats')\nexport class CatsController {\n  constructor(private readonly catsService: CatsService) {}\n\n  @Get()\n  findAll() {\n    return this.catsService.findAll();\n  }\n}`,
      checks: [
        { re: "constructor\\s*\\(\\s*private\\s+readonly\\s+\\w+\\s*:\\s*CatsService", label: "injects via `private readonly` constructor param" },
        { re: "this\\.\\w+\\.findAll\\(\\)", label: "delegates to the service" },
      ],
      explanation:
        "The `private readonly catsService: CatsService` parameter does two jobs at once: TypeScript's parameter-property shorthand declares AND assigns the field, and Nest reads the `CatsService` type to inject the managed instance. You never `new` the service — the container owns its lifecycle (singleton by default). Same constructor-injection story as Spring, and it keeps the controller trivial to unit-test with a mock.",
      docRef: DOC,
    }),
};

const param: Generator = {
  id: "nest-param",
  title: "Read a route param",
  generate: () =>
    codeTask({
      genId: "nest-param",
      prompt:
        "Add a GET handler `findOne` at `:id` that reads the `id` route parameter (typed `string`) and returns `\"Cat #\" + id`.",
      language: "typescript",
      starter: `@Controller('cats')\nexport class CatsController {\n  // GET /cats/:id\n}`,
      solution: `@Controller('cats')\nexport class CatsController {\n  @Get(':id')\n  findOne(@Param('id') id: string) {\n    return 'Cat #' + id;\n  }\n}`,
      checks: [
        { re: "@Get\\(\\s*':id'\\s*\\)", label: "route pattern `@Get(':id')`" },
        { re: "@Param\\(\\s*'id'\\s*\\)\\s+\\w+\\s*:\\s*string", label: "binds it with `@Param('id') id: string`" },
      ],
      explanation:
        "`:id` is a route token; `@Param('id')` pulls it off the request into a handler argument — the parameter-decorator style Nest uses for everything (`@Body`, `@Query`, `@Headers` all work the same way). Route params arrive as strings; convert or validate with a pipe (e.g. `ParseIntPipe`) when you need a number.",
      docRef: DOC,
    }),
};

/* ── Level 3 — bodies & modules ── */

const postBody: Generator = {
  id: "nest-post-body",
  title: "Accept a request body",
  generate: () =>
    codeTask({
      genId: "nest-post-body",
      prompt:
        "Add a POST handler `create` that reads the JSON request body into a `CreateCatDto` and returns `\"Created \" + dto.name`.",
      language: "typescript",
      starter: `@Controller('cats')\nexport class CatsController {\n  // POST /cats with a body\n}`,
      solution: `@Controller('cats')\nexport class CatsController {\n  @Post()\n  create(@Body() dto: CreateCatDto) {\n    return 'Created ' + dto.name;\n  }\n}`,
      checks: [
        { re: "@Post\\(\\s*\\)", label: "handler decorated `@Post()`" },
        { re: "@Body\\(\\s*\\)\\s+\\w+\\s*:\\s*CreateCatDto", label: "binds the body with `@Body() dto: CreateCatDto`" },
      ],
      explanation:
        "`@Body()` hands you the parsed request body, typed as your DTO. A DTO (Data Transfer Object) is a plain class describing the SHAPE of incoming data — worth having even before validation, because it documents the contract and gives the handler real types. Nest mirrors Spring's `@RequestBody` here almost exactly.",
      docRef: DOC,
    }),
};

const nestModule: Generator = {
  id: "nest-module",
  title: "Wire up a module",
  generate: () =>
    codeTask({
      genId: "nest-module",
      prompt:
        "Write the `CatsModule`: the module class that registers `CatsController` as its controller and `CatsService` as its provider.",
      language: "typescript",
      starter: `export class CatsModule {}`,
      solution: `@Module({\n  controllers: [CatsController],\n  providers: [CatsService],\n})\nexport class CatsModule {}`,
      checks: [
        { re: "@Module\\(\\s*\\{", label: "decorated with `@Module({ … })`" },
        { re: "controllers\\s*:\\s*\\[\\s*CatsController\\s*\\]", label: "registers the controller" },
        { re: "providers\\s*:\\s*\\[\\s*CatsService\\s*\\]", label: "registers the service as a provider" },
      ],
      explanation:
        "A module is Nest's unit of organisation — it declares which controllers handle routes and which providers are available for injection WITHIN it. Registering `CatsService` in `providers` is what makes it injectable into `CatsController`. To share a provider with other modules you add it to `exports`. The root `AppModule` then `imports` feature modules like this one; together they form the application graph Nest boots.",
      docRef: DOC,
    }),
};

/* ── Level 4 — validation & guards ── */

const dtoValidation: Generator = {
  id: "nest-dto-validation",
  title: "Validate a DTO",
  generate: () =>
    codeTask({
      genId: "nest-dto-validation",
      prompt:
        "Write the `CreateCatDto` class with class-validator constraints: `name` must be a non-empty string, and `age` must be a number.",
      language: "typescript",
      starter: `export class CreateCatDto {\n  name: string;\n  age: number;\n}`,
      solution: `export class CreateCatDto {\n  @IsString()\n  @IsNotEmpty()\n  name: string;\n\n  @IsNumber()\n  age: number;\n}`,
      checks: [
        { re: "@IsString\\(\\)", label: "`name` is `@IsString()`" },
        { re: "@IsNotEmpty\\(\\)", label: "`name` is `@IsNotEmpty()`" },
        { re: "@IsNumber\\(\\)", label: "`age` is `@IsNumber()`" },
      ],
      explanation:
        "class-validator decorators declare the RULES right on the DTO. With a global `ValidationPipe` enabled, Nest checks every incoming `@Body()` against them and auto-returns a 400 with the messages if anything fails — your handler only ever runs on valid data. It's the same 'validate at the edge, then trust it' discipline as Spring's `@Valid` + Bean Validation, and it keeps the checks next to the field they guard.",
      docRef: DOC,
    }),
};

const guard: Generator = {
  id: "nest-guard",
  title: "Write an auth guard",
  generate: () =>
    codeTask({
      genId: "nest-guard",
      prompt:
        "Write an `AuthGuard`: an injectable class implementing Nest's `CanActivate` interface, whose `canActivate(context: ExecutionContext)` returns `true` only when the request carries an `authorization` header.",
      language: "typescript",
      starter: `export class AuthGuard {\n  // implement CanActivate\n}`,
      solution: `@Injectable()\nexport class AuthGuard implements CanActivate {\n  canActivate(context: ExecutionContext): boolean {\n    const request = context.switchToHttp().getRequest();\n    return Boolean(request.headers.authorization);\n  }\n}`,
      checks: [
        { re: "@Injectable\\(\\)", label: "the guard is `@Injectable()`" },
        { re: "implements\\s+CanActivate", label: "`implements CanActivate`" },
        { re: "canActivate\\s*\\(", label: "has a `canActivate(context)` method" },
        { re: "switchToHttp\\(\\)\\.getRequest\\(\\)", label: "reads the request off the `ExecutionContext`" },
      ],
      explanation:
        "A guard answers one yes/no question — 'may this request proceed?' — BEFORE the handler runs. Implementing `CanActivate` means writing `canActivate`, which returns a boolean (or a promise/observable of one); `false` short-circuits with a 403. The `ExecutionContext` abstracts over transport, so `switchToHttp().getRequest()` gets the HTTP request. Guards are Nest's clean place for authentication/authorisation, kept out of your business logic.",
      docRef: DOC,
    }),
};

/* ── Level 5 — applying guards & throwing ── */

const useGuards: Generator = {
  id: "nest-use-guards",
  title: "Apply a guard to a route",
  generate: () =>
    codeTask({
      genId: "nest-use-guards",
      prompt:
        "Protect a POST `create` handler by attaching the `AuthGuard` to it, so unauthorised requests are rejected before the handler runs. The handler just returns `\"Created\"`.",
      language: "typescript",
      starter: `@Controller('cats')\nexport class CatsController {\n  // guard the create route\n}`,
      solution: `@Controller('cats')\nexport class CatsController {\n  @Post()\n  @UseGuards(AuthGuard)\n  create() {\n    return 'Created';\n  }\n}`,
      checks: [
        { re: "@UseGuards\\(\\s*AuthGuard\\s*\\)", label: "applies `@UseGuards(AuthGuard)`" },
        { re: "@Post\\(\\s*\\)", label: "on the `@Post()` handler" },
      ],
      explanation:
        "`@UseGuards(AuthGuard)` attaches the guard to this handler — Nest runs `canActivate` before `create`, and only lets the request through if it returns true. Put it on a single method (as here), on the `@Controller` to guard every route, or register it globally. Because the guard is a provider, Nest injects any dependencies it needs (a `JwtService`, say) — the whole reason guards are classes and not plain middleware.",
      docRef: DOC,
    }),
};

const httpException: Generator = {
  id: "nest-http-exception",
  title: "Throw a typed HTTP error",
  generate: () =>
    codeTask({
      genId: "nest-http-exception",
      prompt:
        "In a `findOne(id)` service method, look the cat up (`this.cats.find(...)`) and, if it's missing, throw the built-in Nest exception that maps to a 404, with the message `\"Cat not found\"`. Otherwise return the cat.",
      language: "typescript",
      starter: `findOne(id: number) {\n  // find or throw 404\n}`,
      solution: `findOne(id: number) {\n  const cat = this.cats.find((c) => c.id === id);\n  if (!cat) {\n    throw new NotFoundException('Cat not found');\n  }\n  return cat;\n}`,
      checks: [
        { re: "\\.find\\(", label: "looks the cat up" },
        { re: "throw\\s+new\\s+NotFoundException\\(", label: "throws a `NotFoundException` when missing" },
        { re: "return\\s+cat", label: "returns the cat when found" },
      ],
      explanation:
        "Nest ships built-in HTTP exceptions — `NotFoundException` (404), `BadRequestException` (400), `UnauthorizedException` (401)… Throw one from ANYWHERE (service, guard, pipe) and Nest's global exception filter converts it into the right status and JSON body. So your service speaks in domain terms ('not found') and never touches the response object — the framework handles the HTTP translation, exactly like Spring's `@ResponseStatus` exceptions.",
      docRef: DOC,
    }),
};

const queryParam: Generator = {
  id: "nest-query-param",
  title: "Read a query parameter",
  generate: () =>
    codeTask({
      genId: "nest-query-param",
      prompt:
        "Add a GET handler `findAll` that reads an optional `limit` query parameter (as in `/cats?limit=10`) and returns `\"Limit: \" + limit`.",
      language: "typescript",
      starter: `@Controller('cats')\nexport class CatsController {\n  // GET /cats?limit=...\n}`,
      solution: `@Controller('cats')\nexport class CatsController {\n  @Get()\n  findAll(@Query('limit') limit: string) {\n    return 'Limit: ' + limit;\n  }\n}`,
      checks: [
        { re: "@Get\\(\\s*\\)", label: "handler decorated `@Get()`" },
        { re: "@Query\\(\\s*'limit'\\s*\\)", label: "reads the query with `@Query('limit')`" },
      ],
      explanation:
        "`@Query('name')` binds a single query-string value; `@Query()` with no argument gives the whole object. It's the sibling of `@Param` (path segments) and `@Body` (request body) — Nest's parameter decorators cover every part of the request the same way. Query params arrive as strings, so pipe them (`ParseIntPipe`) or validate a query DTO when you need real types.",
      docRef: DOC,
    }),
};

const parseIntPipe: Generator = {
  id: "nest-parse-int-pipe",
  title: "Transform a param with a pipe",
  generate: () =>
    codeTask({
      genId: "nest-parse-int-pipe",
      prompt:
        "Route params arrive as strings. Add a GET handler `findOne` at `:id` that parses `id` to a NUMBER using Nest's built-in integer-parsing pipe on that param, and returns `id * 2`.",
      language: "typescript",
      starter: `@Controller('cats')\nexport class CatsController {\n  // GET /cats/:id with id parsed to a number\n}`,
      solution: `@Controller('cats')\nexport class CatsController {\n  @Get(':id')\n  findOne(@Param('id', ParseIntPipe) id: number) {\n    return id * 2;\n  }\n}`,
      checks: [
        { re: "@Param\\(\\s*'id'\\s*,\\s*ParseIntPipe\\s*\\)", label: "applies `ParseIntPipe` in `@Param`" },
        { re: "id\\s*:\\s*number", label: "types `id` as `number`" },
      ],
      explanation:
        "A PIPE transforms or validates a value before it reaches the handler. `ParseIntPipe` converts the string `id` to a number — and if it isn't numeric, it throws a 400 automatically, so your method can trust `id: number`. Pass a pipe as the second argument to a param decorator to scope it to that param, or apply it globally/per-route. Nest ships `ParseIntPipe`, `ParseUUIDPipe`, `ParseBoolPipe`, and the `ValidationPipe` that powers DTO validation.",
      docRef: DOC,
    }),
};

const customPipe: Generator = {
  id: "nest-custom-pipe",
  title: "Write a custom pipe",
  generate: () =>
    codeTask({
      genId: "nest-custom-pipe",
      prompt:
        "Write a `TrimPipe`: an injectable class implementing Nest's `PipeTransform`, whose `transform(value, metadata)` returns the trimmed string when `value` is a string, and the value unchanged otherwise.",
      language: "typescript",
      starter: `export class TrimPipe {\n  // implement PipeTransform\n}`,
      solution: `@Injectable()\nexport class TrimPipe implements PipeTransform {\n  transform(value: unknown, metadata: ArgumentMetadata) {\n    return typeof value === 'string' ? value.trim() : value;\n  }\n}`,
      checks: [
        { re: "@Injectable\\(\\)", label: "the pipe is `@Injectable()`" },
        { re: "implements\\s+PipeTransform", label: "`implements PipeTransform`" },
        { re: "transform\\s*\\(", label: "has a `transform(value, metadata)` method" },
        { re: "\\.trim\\(\\)", label: "trims string values" },
      ],
      explanation:
        "A custom pipe is a provider implementing the one-method `PipeTransform` interface: `transform(value, metadata)` returns the (possibly transformed) value, which becomes what the handler receives. Return a new value to transform, or throw to reject. Because it's `@Injectable()`, a pipe can depend on other providers (a config service, a repository). Guards decide yes/no; pipes reshape the input — different jobs in Nest's request lifecycle.",
      docRef: DOC,
    }),
};

const interceptor: Generator = {
  id: "nest-interceptor",
  title: "Write an interceptor",
  generate: () =>
    codeTask({
      genId: "nest-interceptor",
      prompt:
        "Write a `LoggingInterceptor`: an injectable class implementing Nest's `NestInterceptor`. Its `intercept(context, next)` must log `\"before\"`, then return `next.handle()` (the handler's Observable) so the request continues.",
      language: "typescript",
      starter: `export class LoggingInterceptor {\n  // implement NestInterceptor\n}`,
      solution: `@Injectable()\nexport class LoggingInterceptor implements NestInterceptor {\n  intercept(context: ExecutionContext, next: CallHandler) {\n    console.log('before');\n    return next.handle();\n  }\n}`,
      checks: [
        { re: "@Injectable\\(\\)", label: "the interceptor is `@Injectable()`" },
        { re: "implements\\s+NestInterceptor", label: "`implements NestInterceptor`" },
        { re: "intercept\\s*\\(", label: "has an `intercept(context, next)` method" },
        { re: "next\\.handle\\(\\)", label: "continues the chain with `next.handle()`" },
      ],
      explanation:
        "An interceptor wraps the handler — it runs code BEFORE (`console.log('before')`) and, by operating on the returned Observable, AFTER it. `next.handle()` invokes the route handler and returns an RxJS Observable of its result; you can `.pipe(map(...))` to reshape every response, `tap(...)` to log timing, or `catchError(...)` to transform errors globally. It's Nest's aspect-oriented layer, ideal for logging, caching, and response envelopes — cross-cutting concerns kept out of controllers.",
      docRef: DOC,
    }),
};

/* ── Multi-file capstone — assemble a whole feature across files ── */

const catsFeature: Generator = {
  id: "nest-feature",
  title: "Assemble the Cats feature",
  generate: () =>
    multiFileTask({
      genId: "nest-feature",
      prompt:
        "Build a complete **Cats** feature the idiomatic Nest way — one class per file. The service owns an in-memory list; the controller exposes `GET /cats` (list) and `POST /cats` (create) and only delegates to the service; the DTO describes the request body; the module wires them together. Use the tabs, **Debug this file** as you go, then **submit all** once they line up — open a file's hints if you're unsure which decorators to reach for.",
      files: [
        {
          name: "cats.controller.ts",
          language: "typescript",
          role: "translates HTTP to service calls — holds no data itself",
          hint: "Mount the class on the `cats` route with `@Controller('cats')`, and get the service by declaring it a `private readonly` constructor parameter — Nest's DI injects it, you never `new` it. Each handler is a method decorated with its HTTP verb (`@Get()`, `@Post()`); read the JSON body with a `@Body()` parameter typed as your DTO. Each handler body just returns `this.<service>.<method>(…)`.",
          starter: `@Controller('cats')\nexport class CatsController {\n  // inject CatsService, then add GET findAll and POST create\n}`,
          solution: `@Controller('cats')\nexport class CatsController {\n  constructor(private readonly catsService: CatsService) {}\n\n  @Get()\n  findAll() {\n    return this.catsService.findAll();\n  }\n\n  @Post()\n  create(@Body() dto: CreateCatDto) {\n    return this.catsService.create(dto);\n  }\n}`,
          checks: [
            { re: "@Controller\\(\\s*'cats'\\s*\\)", label: "mounted with `@Controller('cats')`" },
            {
              re: "constructor\\s*\\(\\s*private\\s+readonly\\s+\\w+\\s*:\\s*CatsService",
              label: "injects `CatsService` via the constructor",
            },
            { re: "@Get\\(\\s*\\)", label: "a `@Get()` `findAll` handler" },
            { re: "this\\.\\w+\\.findAll\\(\\)", label: "delegates listing to the service" },
            { re: "@Post\\(\\s*\\)", label: "a `@Post()` `create` handler" },
            {
              re: "@Body\\(\\s*\\)\\s+\\w+\\s*:\\s*CreateCatDto",
              label: "binds the body with `@Body() dto: CreateCatDto`",
            },
            { re: "this\\.\\w+\\.create\\(", label: "delegates creation to the service" },
          ],
        },
        {
          name: "cats.service.ts",
          language: "typescript",
          role: "owns the in-memory data and the logic",
          hint: "Mark the class `@Injectable()` so Nest's container can manage and inject it (the Node equivalent of Spring's `@Service`). Keep a private array as the store; `findAll()` returns it and `create(dto)` pushes the dto and returns it. No decorators on the methods — it's a plain provider.",
          starter: `export class CatsService {\n  // make it a provider with findAll() and create(dto)\n}`,
          solution: `@Injectable()\nexport class CatsService {\n  private readonly cats: CreateCatDto[] = [];\n\n  findAll() {\n    return this.cats;\n  }\n\n  create(dto: CreateCatDto) {\n    this.cats.push(dto);\n    return dto;\n  }\n}`,
          checks: [
            { re: "@Injectable\\(\\)", label: "decorated `@Injectable()`" },
            { re: "findAll\\s*\\(\\s*\\)", label: "has a `findAll()` method" },
            {
              re: "create\\s*\\(\\s*\\w+\\s*:\\s*CreateCatDto",
              label: "has `create(dto: CreateCatDto)`",
            },
          ],
        },
        {
          name: "create-cat.dto.ts",
          language: "typescript",
          role: "the shape of an incoming cat",
          hint: "A DTO is just a plain class whose fields describe the request body — no decorators needed here. Give it the one field the create route needs, typed. A named class (rather than an inline object) is what lets the controller and service share the type, and what you'd later hang validation on.",
          starter: `export class CreateCatDto {\n  // the shape of a new cat\n}`,
          solution: `export class CreateCatDto {\n  name: string;\n}`,
          checks: [
            { re: "class\\s+CreateCatDto", label: "declares the `CreateCatDto` class" },
            { re: "name\\s*:\\s*string", label: "has a `name: string` field" },
          ],
        },
        {
          name: "cats.module.ts",
          language: "typescript",
          role: "wires the controller and provider together",
          hint: "A module is a class decorated with `@Module({ … })`. List the classes that handle routes in `controllers: [...]` and the injectables in `providers: [...]`. Registering the service in `providers` is exactly what makes it injectable into the controller.",
          starter: `export class CatsModule {}`,
          solution: `@Module({\n  controllers: [CatsController],\n  providers: [CatsService],\n})\nexport class CatsModule {}`,
          checks: [
            { re: "@Module\\(\\s*\\{", label: "decorated with `@Module({ … })`" },
            {
              re: "controllers\\s*:\\s*\\[\\s*CatsController\\s*\\]",
              label: "registers `CatsController`",
            },
            {
              re: "providers\\s*:\\s*\\[\\s*CatsService\\s*\\]",
              label: "registers `CatsService` as a provider",
            },
          ],
        },
      ],
      crossChecks: [
        {
          re: "(?=[\\s\\S]*this\\.\\w+\\.findAll\\(\\))(?=[\\s\\S]*findAll\\s*\\(\\s*\\)\\s*\\{)(?=[\\s\\S]*this\\.\\w+\\.create\\()(?=[\\s\\S]*create\\s*\\(\\s*\\w+\\s*:\\s*CreateCatDto)",
          label: "controller delegates to `findAll`/`create`, which the service implements",
        },
        {
          re: "(?=[\\s\\S]*class\\s+CreateCatDto)(?=[\\s\\S]*@Body\\(\\)\\s+\\w+\\s*:\\s*CreateCatDto)",
          label: "the `CreateCatDto` you defined is the body type the controller accepts",
        },
      ],
      explanation:
        "This is the shape of every Nest feature: a **DTO** describing the payload, a **provider** (`@Injectable()` service) owning the data and logic, a **controller** that only translates HTTP into service calls, and a **module** that registers the two so the IoC container can inject the service into the controller. Splitting them across files isn't ceremony — it keeps each piece independently testable and lets the framework wire the dependency instead of you `new`-ing it. Notice the controller never touches storage; it delegates to `catsService`, exactly the separation Spring's `@RestController`/`@Service` split gives you.",
      docRef: DOC,
    }),
};

export const nestjsTrack: CodingTrack = {
  id: "coding-nest",
  title: "NestJS",
  icon: "🐱",
  stack: "TypeScript · NestJS",
  blurb:
    "Controllers, providers & DI, modules, DTO validation, guards and exception handling — the decorator-driven Node backend that maps one-to-one onto Spring.",
  exercises: [
    { level: 1, gen: controller },
    { level: 1, gen: injectable },
    { level: 2, gen: di },
    { level: 2, gen: param },
    { level: 2, gen: queryParam },
    { level: 3, gen: postBody },
    { level: 3, gen: nestModule },
    { level: 3, gen: parseIntPipe },
    { level: 3, gen: catsFeature },
    { level: 4, gen: dtoValidation },
    { level: 4, gen: guard },
    { level: 4, gen: customPipe },
    { level: 5, gen: useGuards },
    { level: 5, gen: httpException },
    { level: 5, gen: interceptor },
  ],
};
