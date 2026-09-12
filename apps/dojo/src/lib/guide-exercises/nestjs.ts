/**
 * Exercises for the NestJS guide.
 *
 * Weighted toward the things that actually go wrong: module wiring, tokens,
 * the pipeline, and the errors whose message names the wrong culprit. Several
 * are repairs of code that compiles and fails at boot, because that is the
 * failure mode NestJS specialises in.
 */
import type { GuideExercise } from "./types";

export const nestjsExercises: GuideExercise[] = [
  /* ── Part 4: modules ──────────────────────────────────────────────── */
  {
    id: "module-wiring",
    title: "Open both doors",
    prompt:
      "`AuthService` needs `UsersService`, which lives in `UsersModule`. Write both modules so it works — and so nothing outside `UsersModule` can reach the repository directly.",
    language: "typescript",
    given: `import { Module } from '@nestjs/common';
import { UsersService } from './application/users.service';
import { USERS_REPOSITORY } from './ports/users.repository';
import { PrismaUsersRepository } from './adapters/prisma-users.repository';
import { AuthService } from './auth/auth.service';
import { UsersModule } from './users/users.module';`,
    starter: `@Module({
  // TODO: UsersModule — provides UsersService and the repository
})
export class UsersModule {}

@Module({
  // TODO: AuthModule — needs UsersService
})
export class AuthModule {}
`,
    solution: `@Module({
  providers: [
    UsersService,
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}

@Module({
  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}
`,
    hint: "Two doors, both must be open: the owner has to `exports` it, and the consumer has to `imports` the owning MODULE. Exporting alone is an offer nobody took.",
    explanation:
      "A provider is private to its module by default. `exports` makes it public; `imports` takes a module — never a provider. Missing either gives the identical `Nest can't resolve dependencies of AuthService (?)`, where the `?` marks the position that could not be filled. Leaving `USERS_REPOSITORY` out of `exports` is the other half of the design: other modules may ask questions about users, but only through the service — the database is not reachable from outside.",
    checks: [
      { re: "exports\\s*:\\s*\\[[^\\]]*UsersService", label: "`UsersModule` exports `UsersService`" },
      { re: "imports\\s*:\\s*\\[[^\\]]*UsersModule", label: "`AuthModule` imports `UsersModule`" },
      { re: "provide\\s*:\\s*USERS_REPOSITORY", label: "binds the repository token" },
      { re: "useClass\\s*:\\s*Prisma", label: "points the token at the adapter" },
      {
        re: "exports\\s*:\\s*\\[[^\\]]*USERS_REPOSITORY",
        expect: false,
        label: "does NOT export the repository",
      },
      {
        re: "imports\\s*:\\s*\\[[^\\]]*UsersService",
        expect: false,
        label: "never puts a SERVICE in `imports`",
      },
    ],
  },

  {
    id: "invalid-module",
    title: "Fix `InvalidClassModuleException`",
    prompt:
      "This boots with `Nest cannot create the module instance. Often, this is because of a circular dependency`. The real cause is simpler. Fix it.",
    language: "typescript",
    given: `import { Module } from '@nestjs/common';
import { AuthController } from './http/auth.controller';
import { AuthService } from './application/auth.service';
import { UsersService } from '../users/application/users.service';
import { UsersModule } from '../users/users.module';`,
    starter: `@Module({
  controllers: [AuthModule],
  providers: [AuthService],
  imports: [UsersService],
})
export class AuthModule {}
`,
    solution: `@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UsersModule],
})
export class AuthModule {}
`,
    hint: "Read each array's name literally. `controllers` takes controllers. `imports` takes modules. Neither takes what is in there now.",
    explanation:
      "Two mistakes, and the error message points at neither. `controllers: [AuthModule]` lists the module inside itself, and `imports: [UsersService]` puts a provider where a module belongs. Nest's suggested fix for the second — move it to `providers` — is actively wrong: it would construct a SECOND `UsersService` with its own dependencies, which then fails to resolve. When an error mentions circular dependencies, check the array names first; it is the generic message for 'this metadata is not what I expected'.",
    checks: [
      { re: "controllers\\s*:\\s*\\[\\s*AuthController", label: "`controllers` holds the controller" },
      { re: "imports\\s*:\\s*\\[[^\\]]*UsersModule", label: "`imports` holds the module" },
      { re: "controllers\\s*:\\s*\\[[^\\]]*AuthModule", expect: false, label: "the module no longer lists itself" },
      { re: "imports\\s*:\\s*\\[[^\\]]*UsersService", expect: false, label: "no provider in `imports`" },
      { re: "providers\\s*:\\s*\\[[^\\]]*AuthService", label: "`AuthService` stays a provider" },
    ],
  },

  {
    id: "dynamic-module",
    title: "Configure a module from validated config",
    prompt:
      "Register `JwtModule` so its secret comes from `ConfigService` — not from `process.env` directly. The expiry is in seconds.",
    language: "typescript",
    given: `import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema';

// ConfigModule is registered globally with isGlobal: true,
// and validates JWT_SECRET (min 32 chars) and JWT_ACCESS_TTL at boot.`,
    starter: `imports: [
  // TODO: JwtModule, configured from ConfigService
],
`,
    solution: `imports: [
  JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService<Env, true>) => ({
      secret: config.get('JWT_SECRET', { infer: true }),
      signOptions: {
        expiresIn: config.get('JWT_ACCESS_TTL', { infer: true }),
      },
    }),
  }),
],
`,
    hint: "The sync `register` would need the value on the import line, and it isn't available there yet. The async form defers the config until DI can supply its inputs.",
    explanation:
      "`register({ secret: process.env.JWT_SECRET })` looks equivalent and is wrong twice: it reads `process.env` before `ConfigModule` has loaded `.env`, and it walks around the Zod validation that makes a short secret refuse to boot. `registerAsync` waits until `ConfigService` exists, so the guarantee is real. Note this only puts a configured `JwtService` in the container — it verifies nothing on its own. A module gives you a tool; only a guard, pipe, interceptor or filter makes something happen per request.",
    checks: [
      { re: "registerAsync|forRootAsync", label: "uses the async form" },
      { re: "inject\\s*:\\s*\\[\\s*ConfigService", label: "injects `ConfigService`" },
      { re: "useFactory", label: "builds the options in a factory" },
      { re: "secret\\s*:", label: "sets the secret" },
      { re: "config\\.get", label: "reads it through `ConfigService`" },
      { re: "process\\.env", expect: false, label: "never touches `process.env` directly" },
      { re: "expiresIn", label: "sets an expiry" },
    ],
  },

  /* ── Part 5: providers and tokens ─────────────────────────────────── */
  {
    id: "custom-provider",
    title: "Provide the same port three ways",
    prompt:
      "Write three provider entries for `PASSWORD_HASHER`: a class in production, a ready-made object in tests, and one whose construction depends on `ConfigService`.",
    language: "typescript",
    given: `import { PASSWORD_HASHER } from './ports/password-hasher.port';
import { Argon2Hasher } from './adapters/argon2-password.hasher';
import { ConfigService } from '@nestjs/config';

const fakeHasher = {
  hash: async (p: string) => \`fake:\${p}\`,
  verify: async (h: string, p: string) => h === \`fake:\${p}\`,
};`,
    starter: `// 1. production — build this class
const production = // TODO

// 2. tests — hand it this exact object
const testing = // TODO

// 3. built from config
const configured = // TODO
`,
    solution: `// 1. production — build this class
const production = { provide: PASSWORD_HASHER, useClass: Argon2Hasher };

// 2. tests — hand it this exact object
const testing = { provide: PASSWORD_HASHER, useValue: fakeHasher };

// 3. built from config
const configured = {
  provide: PASSWORD_HASHER,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => new Argon2Hasher(config.get('ARGON_MEMORY')),
};
`,
    hint: "Three of the four provider forms. The names say what each takes: a class to construct, a value to hand over as-is, a function to call.",
    explanation:
      "Same token, three sources — and nothing that injects `PASSWORD_HASHER` changes between them. That is the whole payoff of a token: the consumer names a need, and the module decides how it is met, per environment. `useValue` is what `Test.createTestingModule().overrideProvider()` does under the hood, and `useFactory` with `inject` is the escape hatch for anything that cannot be built by calling `new` with no arguments.",
    checks: [
      { re: "useClass\\s*:\\s*Argon2Hasher", label: "`useClass` for production" },
      { re: "useValue\\s*:\\s*fakeHasher", label: "`useValue` for the test double" },
      { re: "useFactory", label: "`useFactory` for the configured one" },
      { re: "inject\\s*:\\s*\\[\\s*ConfigService", label: "the factory declares what it needs" },
      { re: "provide\\s*:\\s*PASSWORD_HASHER[\\s\\S]*provide\\s*:\\s*PASSWORD_HASHER[\\s\\S]*provide\\s*:\\s*PASSWORD_HASHER", label: "all three bind the same token" },
    ],
  },

  /* ── Part 8: DTOs ─────────────────────────────────────────────────── */
  {
    id: "dto-coercion",
    title: "A DTO for a query string",
    prompt:
      "Write `ListProblemsDto` for `GET /problems?limit=20&cursor=100&difficulty=EASY`. `limit` is 1–100 and defaults to 20; `cursor` is optional; `difficulty` is optional and must be one of three values.",
    language: "typescript",
    given: `import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

// main.ts already has:
//   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));`,
    starter: `export class ListProblemsDto {
  // TODO
}
`,
    solution: `export class ListProblemsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cursor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsIn(['EASY', 'MEDIUM', 'HARD'])
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}
`,
    hint: "Everything in a query string arrives as a string, including `\"20\"`. Something has to turn it into a number before `@IsInt()` can possibly pass.",
    explanation:
      "`@Type(() => Number)` is the piece people miss: without it `@IsInt()` receives the string `\"20\"` and rejects every request, with a message that blames the value rather than the missing conversion. Note the two ways to be optional — `cursor?` genuinely may be absent, while `limit` has a default and is therefore always present after the pipe. The `@Max(100)` is a real defence: without a ceiling, `?limit=99999` is a denial-of-service you built yourself.",
    checks: [
      { re: "@Type\\(\\(\\)\\s*=>\\s*Number\\)", label: "coerces query strings to numbers" },
      { re: "@IsInt\\(\\)", label: "validates integers" },
      { re: "@Min\\(1\\)", label: "rejects zero and negatives" },
      { re: "@Max\\(100\\)", label: "caps `limit` — an uncapped page size is a DoS" },
      { re: "@IsOptional\\(\\)", label: "marks the optional fields" },
      { re: "@IsIn\\(", label: "constrains `difficulty` to known values" },
      { re: "limit\\s*:\\s*number\\s*=\\s*20", label: "`limit` defaults to 20" },
    ],
  },

  {
    id: "login-dto",
    title: "The DTO that must NOT restate the rules",
    prompt:
      "Write `LoginDto`. `RegisterDto` requires a 12-character minimum password — decide deliberately whether `LoginDto` should, and write what you decide.",
    language: "typescript",
    given: `import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// RegisterDto has: @IsString() @MinLength(12) @MaxLength(128) password!: string;`,
    starter: `export class LoginDto {
  // TODO
}
`,
    solution: `export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
`,
    hint: "Think about a user who registered before the rule changed. Then think about what a length rule on this endpoint tells an attacker.",
    explanation:
      "Login must not restate the password policy, for two independent reasons. A user whose password predates a rule change still has to be able to log in — a `@MinLength(12)` here locks them out of their own account with a 400. And echoing the policy tells an attacker the shape of what they are guessing, for free, without an account. Anything non-empty is accepted; the credential check decides. The `!` is the definite assignment assertion: the property is assigned by `class-transformer` from the request body, which the compiler cannot see, and `ValidationPipe` guarantees it at runtime.",
    checks: [
      { re: "@IsEmail\\(", label: "validates the email" },
      { re: "@IsNotEmpty\\(", label: "requires a non-empty password" },
      { re: "MinLength|MaxLength", expect: false, label: "does NOT restate the password policy" },
      { re: "password!?\\s*:\\s*string", label: "declares `password`" },
      { re: "!\\s*:", label: "uses `!` — the pipe assigns these, not the constructor" },
    ],
  },

  /* ── Part 11: guards ──────────────────────────────────────────────── */
  {
    id: "auth-guard",
    title: "Write the guard that verifies the token",
    prompt:
      "Write `AuthGuard.canActivate`. It must let `@Public()` routes through untouched, read a Bearer token, verify it, attach the payload to the request, and reject everything else with the same 401.",
    language: "typescript",
    given: `import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import type { JwtPayload } from '../auth/jwt-payload';

// export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
// this.jwt.verifyAsync<JwtPayload>(token) — resolves to the payload, or throws`,
    starter: `@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // TODO
  }
}
`,
    solution: `@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException();

    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      (request as Request & { user?: JwtPayload }).user = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
`,
    hint: "`getAllAndOverride` rather than `get`, so `@Public()` works on a whole controller as well as one method. And `throw`, not `return false` — returning false gives a 403.",
    explanation:
      "`getAllAndOverride` reads the handler first and the class second, so a route-level decorator beats a controller-level one — that ordering is the 'override'. Throwing rather than returning `false` matters: `false` produces **403 Forbidden** ('I know you, and no'), but a missing token means **401** ('I don't know who you are'). And one bare catch for all three failure modes — bad signature, expired, malformed — because distinguishing them in the response is an oracle. This is the only place in the whole application that verifies an access token.",
    checks: [
      { re: "getAllAndOverride", label: "reads the metadata with `getAllAndOverride`" },
      { re: "context\\.getHandler\\(\\)", label: "checks the handler" },
      { re: "context\\.getClass\\(\\)", label: "checks the class too, so `@Public()` works on a controller" },
      { re: "switchToHttp\\(\\)", label: "narrows the execution context to HTTP" },
      { re: "authorization", label: "reads the Authorization header" },
      { re: "Bearer", label: "checks the scheme is Bearer" },
      { re: "verifyAsync", label: "verifies the token" },
      { re: "\\.user\\s*=", label: "attaches the payload to the request" },
      { re: "throw new UnauthorizedException", label: "throws 401 rather than returning false" },
      { re: "return\\s+false", expect: false, label: "never returns false — that would be a 403" },
    ],
  },

  {
    id: "global-guard",
    title: "Make it run on every route",
    prompt:
      "Registering `AuthGuard` as a provider is not enough — nothing calls it. Write the `app.module.ts` providers array that makes it run before every request, with throttling ahead of it and role checking behind it.",
    language: "typescript",
    given: `import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { AppService } from './app.service';`,
    starter: `providers: [
  AppService,
  // TODO
],
`,
    solution: `providers: [
  AppService,
  { provide: APP_GUARD, useClass: ThrottlerGuard },
  { provide: APP_GUARD, useClass: AuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
],
`,
    hint: "One special token, listed three times. Array order is execution order — ask which one must not be allowed to run second.",
    explanation:
      "`APP_GUARD` is a multi-provider token Nest recognises: anything bound to it is installed into the pipeline rather than merely filed in the container. Order is execution order, and it is load-bearing here. Throttling must run first so the sixth login attempt is rejected **without** spending 45ms in Argon2 — a limiter that still pays the hashing cost is a DoS amplifier rather than a defence. `RolesGuard` must run last because it reads the `user` that `AuthGuard` attaches; reversed, an admin route would answer 401 where it should answer 403.",
    checks: [
      { re: "APP_GUARD[\\s\\S]*APP_GUARD[\\s\\S]*APP_GUARD", label: "binds all three to `APP_GUARD`" },
      {
        re: "ThrottlerGuard[\\s\\S]*AuthGuard[\\s\\S]*RolesGuard",
        label: "throttle, then authenticate, then authorize",
      },
      { re: "useClass\\s*:\\s*ThrottlerGuard", label: "installs the throttler" },
      { re: "useClass\\s*:\\s*AuthGuard", label: "installs the auth guard" },
      { re: "useClass\\s*:\\s*RolesGuard", label: "installs the roles guard" },
    ],
  },

  /* ── Part 15: custom decorators ───────────────────────────────────── */
  {
    id: "custom-decorators",
    title: "Both kinds of decorator",
    prompt:
      "Write `@Public()` — which attaches a label a guard can read — and `@CurrentUser()`, which pulls the verified payload into a handler argument. Export the metadata key too.",
    language: "typescript",
    given: `import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/jwt-payload';`,
    starter: `// 1. attaches metadata the guard reads back
export const IS_PUBLIC_KEY = // TODO
export const Public = // TODO

// 2. extracts something from the request
export const CurrentUser = // TODO
`,
    solution: `// 1. attaches metadata the guard reads back
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// 2. extracts something from the request
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload }>();
    return request.user;
  },
);
`,
    hint: "The key must be exported, because the guard has to read back the exact same string. A literal in two files compiles fine and silently never matches.",
    explanation:
      "Two kinds, one pattern: a decorator **writes a note** on the route, and something later **reads the note**. `SetMetadata` + `Reflector` is that two-step, and it is the same mechanism `@Controller` and `@Post` use. `createParamDecorator` is the other kind — it exists so no controller ever touches `request` directly, because a controller that does is welded to HTTP and cannot be unit-tested without faking Express. Typing the return as non-optional is safe precisely because the guard runs first.",
    checks: [
      { re: "export\\s+const\\s+IS_PUBLIC_KEY", label: "exports the key, so the guard reads the same string" },
      { re: "SetMetadata\\(", label: "`@Public()` attaches metadata" },
      { re: "createParamDecorator\\(", label: "`@CurrentUser()` is a param decorator" },
      { re: "switchToHttp\\(\\)", label: "narrows the context" },
      { re: "request\\.user|\\.user;", label: "returns the user the guard attached" },
      { re: "SetMetadata\\(\\s*'isPublic'", expect: false, label: "uses the constant, not a repeated literal" },
    ],
  },

  /* ── Part 13: filters ─────────────────────────────────────────────── */
  {
    id: "exception-filter",
    title: "One error shape for the whole API",
    prompt:
      "Write a global exception filter. Known HTTP exceptions keep their status and message; anything else becomes a 500 with a generic message — and is logged with its stack.",
    language: "typescript",
    given: `import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';`,
    starter: `@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // TODO
  }
}
`,
    solution: `@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttp ? exception.message : 'Internal server error';

    if (!isHttp) {
      this.logger.error(
        \`Unhandled \${request.method} \${request.url}\`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
`,
    hint: "`@Catch()` with no argument catches everything, which is why the first job inside is working out what you actually caught.",
    explanation:
      "The asymmetry is the point: **4xx tells the client what they did wrong, because they can fix it. 5xx tells them nothing, because the details are yours.** Leaking a stack trace or a database message to a client is a real disclosure vulnerability. Logging only the non-HTTP ones keeps the log signal high — a 401 is not an incident. And because every error leaves through here, the response shape is uniform without any controller having to think about it.",
    checks: [
      { re: "instanceof\\s+HttpException", label: "distinguishes known exceptions from bugs" },
      { re: "getStatus\\(\\)", label: "keeps a known exception's status" },
      { re: "INTERNAL_SERVER_ERROR|500", label: "anything else becomes a 500" },
      { re: "logger\\.error|this\\.logger", label: "logs the unexpected ones" },
      { re: "stack", label: "logs the stack, where it is useful" },
      { re: "response\\.status\\(", label: "writes the status" },
      { re: "statusCode", label: "returns a uniform body shape" },
      {
        re: "message\\s*:\\s*(exception\\.message|String\\(exception\\))\\s*[,}]",
        expect: false,
        label: "never sends a raw error message for a 500",
      },
    ],
  },

  /* ── Part 6: controllers ──────────────────────────────────────────── */
  {
    id: "status-codes",
    title: "Make the status codes tell the truth",
    prompt:
      "Fix the status codes. `register` creates a user. `login` creates nothing. `refresh` creates nothing. Change only what is wrong.",
    language: "typescript",
    given: `import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

// Nest defaults POST to 201 Created and everything else to 200 OK.`,
    starter: `@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Post('refresh')
  refresh() {
    return this.service.refresh();
  }
}
`,
    solution: `@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  // Login creates nothing — 201 would promise a new resource
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh() {
    return this.service.refresh();
  }
}
`,
    hint: "One of the three is already correct. Adding a decorator to it would be a change for its own sake.",
    explanation:
      "`getStatusByMethod` in Nest's source is a two-case switch: POST gives 201, everything else 200. It cannot know whether your POST created anything. `register` genuinely does, so 201 is right and needs no decorator. `login` and `refresh` hand back a token for a user that already exists — a client seeing 201 would reasonably expect a `Location` header and a new resource. Status codes are part of your contract, and this is the kind of thing a reviewer notices immediately.",
    checks: [
      { re: "@HttpCode\\(HttpStatus\\.OK\\)\\s*\\n\\s*@Post\\('login'\\)", label: "`login` is 200" },
      { re: "@HttpCode\\(HttpStatus\\.OK\\)\\s*\\n\\s*@Post\\('refresh'\\)", label: "`refresh` is 200" },
      {
        re: "@HttpCode\\([^)]*\\)\\s*\\n\\s*@Post\\('register'\\)",
        expect: false,
        label: "`register` keeps 201 — it really does create something",
      },
    ],
  },

  /* ── Part 18: testing ─────────────────────────────────────────────── */
  {
    id: "unit-test-no-nest",
    title: "Test a service with no Nest at all",
    prompt:
      "Write a test for `AuthService.login` that proves a wrong password throws — with no Nest container, no database and no argon2. The constructor is `(users, tokens, hasher)`.",
    language: "typescript",
    given: `import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

// interface PasswordHasher {
//   hash(plain: string): Promise<string>;
//   verify(hash: string, plain: string): Promise<boolean>;
// }
// users.getCredentialsByEmail(email) -> { id, passwordHash, role } | null`,
    starter: `describe('AuthService', () => {
  it('throws for a wrong password', async () => {
    // TODO: build fakes, construct the service, assert
  });
});
`,
    solution: `describe('AuthService', () => {
  it('throws for a wrong password', async () => {
    const users = {
      getCredentialsByEmail: jest
        .fn()
        .mockResolvedValue({ id: 'u1', passwordHash: 'stored', role: 'USER' }),
    } as unknown as UsersService;

    const hasher = {
      hash: jest.fn(),
      verify: jest.fn().mockResolvedValue(false),
    };

    const tokens = { issueForLogin: jest.fn() } as unknown as RefreshTokenService;

    const service = new AuthService(users, tokens, hasher);

    await expect(
      service.login({ email: 'a@b.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(tokens.issueForLogin).not.toHaveBeenCalled();
  });
});
`,
    hint: "`Test.createTestingModule` is for when you need the container. You don't — a plain `new` is enough, which is the point.",
    explanation:
      "No `Test.createTestingModule`, no `@nestjs/testing`, no database, no argon2 — just `new` and three plain objects. This is only possible because the service takes its dependencies rather than constructing them, and it is why the suite runs in a second instead of thirty. The last assertion is the one people skip: proving no token was issued on a failed login is a *security* assertion, and without it a bug that returns a token anyway would still pass.",
    checks: [
      { re: "new AuthService\\(", label: "constructs the service directly" },
      { re: "Test\\.createTestingModule", expect: false, label: "no Nest container" },
      { re: "verify\\s*:", label: "supplies a fake hasher" },
      { re: "rejects\\.toThrow|rejects\\.toThrowError", label: "asserts it rejects" },
      { re: "UnauthorizedException", label: "asserts the right exception type" },
      { re: "not\\.toHaveBeenCalled", label: "proves no token was issued on failure" },
      { re: "prisma|argon2", expect: false, label: "no database and no real hashing" },
    ],
  },

  /* ── Part 9: the pipeline ─────────────────────────────────────────── */
  {
    id: "pipeline-order",
    title: "Put the pipeline in order",
    prompt:
      "Write the six stages a request passes through, in order, one per line, as `1. name` … `6. name`.",
    language: "text",
    given: `// The six: controller handler, exception filter, guard,
// interceptor, middleware, pipe — in the wrong order here.`,
    starter: `1.
2.
3.
4.
5.
6.
`,
    solution: `1. middleware
2. guard
3. interceptor
4. pipe
5. handler
6. exception filter
`,
    hint: "Authorization has to be decided before you spend anything on the body. Validation happens as late as possible, right before the handler that needs the value.",
    explanation:
      "The order is not arbitrary — each stage runs where it costs least and knows most. **Guards before pipes** is the one worth remembering: rejecting an unauthorised request before parsing and validating its body saves the work entirely, which is exactly why the throttler sits ahead of the auth guard too. The filter is last and also *outside*: it catches anything thrown by any earlier stage, which is why a validation failure and a service exception come out in the same shape.",
    checks: [
      { re: "1\\.\\s*middleware", flags: "mi", label: "1 — middleware" },
      { re: "2\\.\\s*guard", flags: "mi", label: "2 — guard" },
      { re: "3\\.\\s*interceptor", flags: "mi", label: "3 — interceptor" },
      { re: "4\\.\\s*pipe", flags: "mi", label: "4 — pipe" },
      { re: "5\\.\\s*handler", flags: "mi", label: "5 — handler" },
      { re: "6\\.\\s*(exception\\s*)?filter", flags: "mi", label: "6 — exception filter" },
    ],
  },

  /* ── Part 20: errors ──────────────────────────────────────────────── */
  {
    id: "resolve-dependencies",
    title: "Read the error that names the wrong culprit",
    prompt:
      "Boot fails with: `Nest can't resolve dependencies of the AuthService (UsersService, ?). Please make sure that the argument at index [1] is available in the AuthModule context.` List the three things to check, in the order you'd check them.",
    language: "text",
    given: `constructor(
  private readonly users: UsersService,              // index 0
  @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,  // index 1
) {}`,
    starter: `1.
2.
3.
`,
    solution: `1. Is PASSWORD_HASHER in AuthModule's providers? A token with no binding resolves to nothing.
2. If it is provided by another module, does that module export it, and does AuthModule import that module?
3. Is the class decorated with @Injectable(), so TypeScript emitted the parameter metadata at all?
`,
    hint: "The `?` marks the position that could not be filled — index 1, the hasher. `UsersService` resolved fine, so it is not the problem no matter how much of the message it occupies.",
    explanation:
      "The `?` is the whole message. Everything before it resolved; only that position failed. The three causes cover almost every occurrence: the token is never bound, the binding lives in a module that does not export it (or is not imported), or the class has no decorator so `emitDecoratorMetadata` produced no parameter types for Nest to read. That last one is the sneaky one — it compiles, and fails only at boot, with a message that says nothing about decorators.",
    checks: [
      { re: "providers", flags: "i", label: "checks the token is actually provided" },
      { re: "export", flags: "i", label: "checks the owning module exports it" },
      { re: "import", flags: "i", label: "checks this module imports that one" },
      { re: "@?Injectable", flags: "i", label: "checks the class is decorated" },
    ],
  },
];
