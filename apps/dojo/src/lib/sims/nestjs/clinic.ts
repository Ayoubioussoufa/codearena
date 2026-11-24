/** Eight patients. Each shows its symptom; you write the prescription. */
import type { Situation } from "../quiz";

export const CLINIC_PASS = 7;
export const CLINIC: readonly Situation[] = [
  {
    id: "question-mark", title: "The question mark",
    story: "The app won't boot. AuthModule already imports UsersModule.",
    exhibit: "Nest can't resolve dependencies of the AuthService (Symbol(PasswordHasher), ?).\nPlease make sure that the argument UsersService at index [1]\nis available in the AuthModule context.",
    moves: [
      { text: "Add UsersService to AuthModule's providers", outcome: "It trades this message for another: the copy needs its own repository." },
      { text: "Add UsersService to the exports of UsersModule", outcome: "The ? is argument 1. The module is imported, but its door was closed." },
      { text: "Mark AuthService with @Global()", outcome: "@Global() is for modules, and AuthService isn't the one missing." },
      { text: "Move the password hasher to index 1", outcome: "The hasher resolved fine. The ? marks the one that didn't." },
    ],
    best: 1, lesson: "The ? marks the exact argument. Then check both halves: exported there, imported here.",
  },
  {
    id: "interface", title: "The vanishing interface",
    story: "ProblemsRepository is a TypeScript interface.",
    exhibit: "constructor(private readonly repo: ProblemsRepository) {}\n\n// Nest can't resolve dependencies of the ProblemsService (?)",
    moves: [
      { text: "Add ProblemsRepository to providers", outcome: "It only refers to a type: there's no value with that name at runtime." },
      { text: "Reinstall reflect-metadata", outcome: "The metadata works. There's simply no class to record." },
      { text: "Make the constructor public", outcome: "It is already, and Nest isn't complaining about access." },
      { text: "Inject a Symbol token with @Inject(PROBLEMS_REPOSITORY)", outcome: "Symbols exist at runtime, so the container has something to match." },
    ],
    best: 3, lesson: "Interfaces are erased. Give Nest a runtime token.",
  },
  {
    id: "silent-validation", title: "The bouncer who lets everyone in",
    story: "ValidationPipe is global, and a body of { } still reaches the handler.",
    exhibit: "export interface RegisterDto {\n  email: string;\n  password: string;\n}",
    moves: [
      { text: "Turn the DTO into a class with decorators", outcome: "Now there's a class at runtime, with rules attached to it." },
      { text: "Add transform: true", outcome: "Transform into what? There's no class to build." },
      { text: "Move the pipe into a guard", outcome: "Same DTO, same silence, wrong stage." },
      { text: "Write @Body() twice", outcome: "It's bound already." },
    ],
    best: 0, lesson: "Validation reads decorators from a class. An interface leaves it nothing to read, and no error.",
  },
  {
    id: "hang", title: "The endless spinner",
    story: "The route is hit, the log line prints, and the browser spins forever.",
    exhibit: "@Post('login')\nasync login(@Body() dto: LoginDto, @Res() res: Response) {\n  const tokens = await this.auth.login(dto);\n  res.cookie('refresh', tokens.refresh, OPTIONS);\n  return { accessToken: tokens.access };\n}",
    moves: [
      { text: "Remove the await", outcome: "Then the cookie is set from a promise, and it still hangs." },
      { text: "Raise the server's timeout", outcome: "It will hang for longer." },
      { text: "Use @Res({ passthrough: true })", outcome: "You get res for the cookie, and Nest sends what you return." },
      { text: "Return JSON.stringify(…)", outcome: "Nest ignores the return value once you've taken @Res()." },
    ],
    best: 2, lesson: "@Res() means \"I'll answer myself\". passthrough gives that job back.",
  },
  {
    id: "shadow", title: "The featured ghost",
    story: "GET /problems/featured answers 404: Problem \"featured\" not found.",
    exhibit: "@Get(':slug')    findOne(@Param('slug') slug: string) { … }\n@Get('featured') featured() { … }",
    moves: [
      { text: "Rename the parameter", outcome: "A parameter by any other name still matches everything." },
      { text: "Declare featured before :slug", outcome: "The first match wins, and now it's the specific one." },
      { text: "Add @Header('featured')", outcome: "Headers don't choose routes." },
      { text: "Seed a problem called featured", outcome: "Then :slug finds it, and the featured list is still unreachable." },
    ],
    best: 1, lesson: "Routes are tried in the order you declare them.",
  },
  {
    id: "500", title: "The customer is always wrong",
    story: "Registering a taken email answers 500, and pages the on-call engineer.",
    exhibit: "if (await this.users.findByEmail(email)) {\n  throw new Error('Email taken');\n}",
    moves: [
      { text: "Return null instead", outcome: "Now it answers 201 with nothing in it." },
      { text: "Wrap it in try/catch and ignore it", outcome: "The user is told everything went well." },
      { text: "Answer 200 with { error: true }", outcome: "Every client, proxy and dashboard now believes it worked." },
      { text: "Throw ConflictException('Email taken')", outcome: "409: the client's to fix, and nobody is woken up." },
    ],
    best: 3, lesson: "A plain Error is a 500. Say what kind of problem it is.",
  },
  {
    id: "imports-service", title: "The wrong drawer",
    story: "You needed MailService in AuthModule, so you added it.",
    exhibit: "\"MailService\" is decorated with @Injectable() and cannot\nappear in the \"imports\" array of the AuthModule.",
    moves: [
      { text: "Import MailModule, which exports MailService", outcome: "Modules go in imports, and they decide what they lend." },
      { text: "Remove @Injectable() from MailService", outcome: "Then Nest can't inject anything into it." },
      { text: "Move it to controllers", outcome: "It doesn't answer HTTP." },
      { text: "Move it to exports", outcome: "You can't export what you don't have." },
    ],
    best: 0, lesson: "imports: modules. providers: classes. controllers: controllers. exports: what you lend.",
  },
  {
    id: "undefined-user", title: "Who's there?",
    story: "The handler reads request.user, and only this route fails.",
    exhibit: "@Public()\n@Post('logout')\nlogout(@Req() req: AuthedRequest) {\n  return this.auth.logout(req.user.id);\n}\n// TypeError: Cannot read properties of undefined (reading 'id')",
    moves: [
      { text: "Write req.user!.id", outcome: "That quiets TypeScript and changes nothing at runtime." },
      { text: "Write the guard below the handler", outcome: "Guards run before handlers, wherever you write them." },
      { text: "Identify the session by its refresh cookie, or drop @Public()", outcome: "A public route skips the guard that attaches the user, so use what this route does have." },
      { text: "Attach the user in an interceptor", outcome: "Interceptors run after the guards that need that user." },
    ],
    best: 2, lesson: "The guard attaches the user. No guard, no user.",
  },
];
