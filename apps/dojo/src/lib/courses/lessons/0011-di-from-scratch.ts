import type { Lesson } from "../types";

const NEST = "https://docs.nestjs.com";

export const lesson0011: Lesson = {
  slug: "0011-di-from-scratch",
  number: 11,
  track: "backend",
  title: "Dependency injection from scratch",
  summary:
    "Build a tiny DI container, then read NestJS's providers, modules, tokens and scopes as what they really are.",
  minutes: 75,
  status: "ready",
  builds: "`container.mjs`, a DI container with tokens, lifetimes, and errors that say what to fix",
  lab: { dir: "0011-di-from-scratch", writes: ["container.mjs"], check: "bash check.sh" },
  reference: "nest",
  warmup: [
    { lesson: "0009-facts-to-verdicts", question: 3 },
    { lesson: "0004-runner-in-node", question: 3 },
  ],
  words: ["dependency injection", "provider", "injection token", "singleton vs transient", "module (exports)", "port and adapter"],
  answers: [
    { id: "codearena", label: "Section 5: the submissions module's providers and tokens" },
    { id: "challenge", label: "Challenge: decorators that list the dependencies (optional)" },
  ],
  quiz: [
    {
      prompt: "Why does the worker write `@Inject(CODE_RUNNER)` instead of just typing the parameter as the `CodeRunner` interface?",
      options: [
        "Nest only injects classes that are marked with @Inject first",
        "Symbols make the worker faster, since lookups skip the type",
        "The interface would create a new runner for every request",
        "Interfaces vanish at runtime, so a Symbol names the port",
      ],
      correct: 3,
      why: `TypeScript erases interfaces when it compiles, so at runtime there's nothing to look up. A class can be its own token; an interface can't. A Symbol (or a string) gives the port a name that exists at runtime ([Nest: custom providers](${NEST}/fundamentals/custom-providers)).`,
    },
    {
      prompt: "Resolving `JudgeService` needs `CODE_RUNNER`, which needs `CONFIG`. In what order does the container build them?",
      options: [
        "JudgeService first, then the runner, and CONFIG last",
        "CONFIG first, then the runner, and JudgeService last",
        "All three together, as the module itself loads",
        "In the order you registered them, ignoring dependencies",
      ],
      correct: 1,
      why: "A constructor needs its arguments, so the container resolves dependencies first: a depth-first walk down the graph, building on the way back up (post-order). The same walk is where cycles are detected, as in graph DFS.",
    },
    {
      prompt: "`A` needs `B`, and `B` needs `A`. What should a DI container do?",
      options: [
        "Build A without B first, then fill B in afterwards",
        "Loop until the stack overflows, which is what it's for",
        "Fail with the cycle's path, so you can redesign it",
        "Quietly make two copies of each one, one per direction",
      ],
      correct: 2,
      why: `Neither constructor can run first. A good container stops and shows the path (\`A -> B -> A\`). Nest offers \`forwardRef()\` as an escape hatch ([circular dependency](${NEST}/fundamentals/circular-dependency)), but a cycle usually means a responsibility in the wrong place: extract what both need into a third provider.`,
    },
    {
      prompt: "What does injecting the `CodeRunner` port buy CodeArena's worker?",
      options: [
        "Tests use a fake runner; production binds the Docker one",
        "Docker starts faster when it's created by the DI container",
        "TypeScript can skip all type checking for the injected classes",
        "The runner automatically gets a new instance for every submission",
      ],
      correct: 0,
      why: "`JudgeService` only knows the port. The module decides which adapter fills it: `FakeCodeRunner` in unit tests (fast, no Docker), the Docker runner in production. Changing the adapter changes one line of wiring, and none of the service's code.",
    },
    {
      prompt: "By default, how long does a NestJS provider instance live?",
      options: [
        "A fresh instance per HTTP request, dropped when it ends",
        "As long as the app: one shared instance, a singleton",
        "A new instance each time any class injects it again",
        "Only as long as the garbage collector sees it used",
      ],
      correct: 1,
      why: `The default scope is a singleton shared by the whole app ([injection scopes](${NEST}/fundamentals/injection-scopes)). That's why a provider must never keep request data in its fields: two requests would share it. Request and transient scopes exist, and cost you an instance per request or per injection.`,
    },
  ],
};
